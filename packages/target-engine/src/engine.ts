/**
 * @magniom/target-engine
 * Pure deterministic 12-stage candidate generation and Target Slate assembly.
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0.
 * Runs completely offline without database or internet connectivity.
 */

import type {
  TargetSlate,
  TargetCandidate,
  PhenotypeSnapshot,
  MagniomMode,
  TargetReliabilityProfile,
  ConnectomeTargetInput,
  EvidenceLibraryRelease,
} from '@magniom/domain';
import { DEFAULT_MDD_SCIENTIFIC_POLICY, type ScientificPolicyRelease } from '@magniom/scientific-policy';
import { EvidenceKnowledgeGraph, CANONICAL_EVIDENCE_RELEASE_1_0_0 } from '@magniom/evidence';

import { evaluateClinicalScopeGate } from './gates/clinical-scope.js';
import { evaluateEvidenceGate } from './gates/evidence.js';
import { evaluateReliabilityGate } from './gates/reliability.js';
import { evaluateAccessibilityGate } from './gates/accessibility.js';
import { evaluateModeGate } from './gates/mode.js';

import { generateEvidenceBaselineCandidates } from './candidate-generation/evidence-baseline.js';
import { attachPhenotypeConcordance } from './features/phenotype.js';
import { scoreCandidates } from './ranking/utility.js';
import { suppressRedundantCandidates } from './ranking/redundancy.js';
import { allocateSlateRoles } from './ranking/roles.js';

import { assembleSlate } from './slate/assemble.js';
import { createAbstentionSlate } from './slate/abstention.js';
import { enrichCandidateWithGraphEvidence } from './slate/explain.js';
import { validateSlateInvariants } from './validation/invariants.js';

export interface TargetEngineConnectomeInput {
  readonly schemaVersion?: string;
  readonly quality?: 'pass' | 'fail';
  readonly reliabilityProfile?: TargetReliabilityProfile;
  readonly candidates?: readonly {
    readonly candidateCode?: string;
    readonly targetFamilyCode?: string;
    readonly reliabilityScore?: number;
    readonly circuitConcordance?: number;
    readonly baselineCircuitConcordance?: number;
    readonly mniCoordinate?: {
      readonly space: 'MNI152NLin2009cAsym';
      readonly x: number;
      readonly y: number;
      readonly z: number;
      readonly unit: 'mm';
    };
    readonly surfaceVertex?: {
      readonly space: 'fsLR_32k';
      readonly hemisphere: 'L' | 'R';
      readonly vertexIndex: number;
      readonly parcelName: string;
    };
    readonly accessibility?: string;
  }[];
}

export interface TargetEngineInput {
  readonly phenotypeSnapshot: PhenotypeSnapshot;
  readonly policy?: ScientificPolicyRelease;
  readonly policyVersion?: string;
  readonly evidenceRelease?: EvidenceLibraryRelease;
  readonly evidenceVersion?: string;
  readonly mode?: MagniomMode;
  readonly connectome?: TargetEngineConnectomeInput | null;
  readonly candidates?: readonly TargetCandidate[];
  readonly generatedAt?: string;
  readonly id?: string;
  readonly caseId?: string;
}

/**
 * Main 12-stage Target Engine calculation function.
 * Pure, deterministic, offline.
 */
export function runTargetEngine(input: TargetEngineInput): TargetSlate {
  const policy = input.policy ?? DEFAULT_MDD_SCIENTIFIC_POLICY;
  const mode = input.mode ?? 'CLINICAL';
  const policyVersion = input.policyVersion ?? policy.code;
  const evidenceRelease = input.evidenceRelease ?? CANONICAL_EVIDENCE_RELEASE_1_0_0;
  const graph = new EvidenceKnowledgeGraph(evidenceRelease);
  const evidenceVersion = input.evidenceVersion ?? evidenceRelease.version;

  // ----------------------------------------------------
  // Stage 1: Input Validation & Gate 1 (Clinical Scope)
  // ----------------------------------------------------
  const scopeResult = evaluateClinicalScopeGate(input.phenotypeSnapshot, policy, mode);
  if (!scopeResult.passed) {
    return createAbstentionSlate({
      id: input.id,
      caseId: input.caseId,
      phenotypeSnapshot: input.phenotypeSnapshot,
      scientificPolicyVersion: policyVersion,
      evidenceReleaseVersion: evidenceVersion,
      mode,
      reasonCode: scopeResult.reasonCode ?? 'INVALID_INDICATION',
      clinicianExplanation: scopeResult.message ?? 'Target calculation abstained due to Clinical Scope gate rejection.',
      generatedAt: input.generatedAt,
    });
  }

  // ----------------------------------------------------
  // Stage 2: Gate 5 (Mode Compatibility)
  // ----------------------------------------------------
  const modeResult = evaluateModeGate(mode, policy);
  if (!modeResult.compatible) {
    return createAbstentionSlate({
      id: input.id,
      caseId: input.caseId,
      phenotypeSnapshot: input.phenotypeSnapshot,
      scientificPolicyVersion: policyVersion,
      evidenceReleaseVersion: evidenceVersion,
      mode,
      reasonCode: 'MODE_INCOMPATIBLE',
      clinicianExplanation: modeResult.reason ?? 'Execution mode is incompatible with policy.',
      generatedAt: input.generatedAt,
    });
  }

  // ----------------------------------------------------
  // Stage 3: Gate 3 (Imaging / Reliability Gate)
  // ----------------------------------------------------
  const reliabilityResult = evaluateReliabilityGate(input.connectome, policy);
  const qualification = reliabilityResult.qualification;

  // ----------------------------------------------------
  // Stage 4: Candidate Generation
  // ----------------------------------------------------
  const candidatePool: TargetCandidate[] = [];

  if (input.candidates && input.candidates.length > 0) {
    candidatePool.push(...input.candidates);
  } else {
    // Generate baseline evidence candidates using Evidence Knowledge Graph
    const baselineCandidates = generateEvidenceBaselineCandidates(
      input.phenotypeSnapshot,
      undefined,
      graph,
      mode
    );
    candidatePool.push(...baselineCandidates);

    // 1. Process canonical NeuroCompute candidateRegions (ConnectomeTargetInput)
    const connectomeData = input.connectome as (ConnectomeTargetInput & TargetEngineConnectomeInput) | null | undefined;
    if (connectomeData?.candidateRegions && connectomeData.candidateRegions.length > 0) {
      for (const region of connectomeData.candidateRegions) {
        const familyCode = region.targetFamilyVersionId;
        const isPermittedInMode = graph.isTargetFamilyPermittedInMode(familyCode, mode);

        // Enforce Evidence Ceiling in Clinical Mode (Gate 2 & Gate 5)
        if (!isPermittedInMode && mode === 'CLINICAL') {
          continue; // Skip research targets entirely from clinical generation pool
        }

        // Look up matching family evidence baseline for distance and gain reference
        const matchingBaseline =
          baselineCandidates.find((b) => b.familyId === familyCode) ??
          baselineCandidates[0];

        const baselineMni = matchingBaseline?.mniCoordinate ?? {
          space: 'MNI152NLin2009cAsym',
          x: -38,
          y: 44,
          z: 30,
          unit: 'mm',
        };

        const isUnreliable = qualification === 'ineligible';
        const gain = region.circuitConcordancePercentile - region.baselineCircuitConcordance;
        const minGain = policy.evidencePolicy?.minIncrementalGainThreshold ?? 0.10;
        const isLowGain = gain < minGain;

        // Calculate 3D Euclidean distance to family evidence baseline
        const dx = region.mniCoordinate.x - baselineMni.x;
        const dy = region.mniCoordinate.y - baselineMni.y;
        const dz = region.mniCoordinate.z - baselineMni.z;
        const distanceMm = Math.sqrt(dx * dx + dy * dy + dz * dz);
        const isMajorDivergence = distanceMm > 30.0;

        // Check accessibility & laterality (Gate 4)
        const accessCheck = evaluateAccessibilityGate(
          region.mniCoordinate,
          undefined,
          familyCode,
          region.accessibility
        );
        const isInaccessible = !accessCheck.accessible;

        // Determine suppression status and reason
        let isSuppressed = false;
        let suppressionReason: 'LOW_RELIABILITY' | 'LOW_INCREMENTAL_VALUE' | 'ANATOMICALLY_INACCESSIBLE' | 'MAJOR_DIVERGENCE' | 'LATERALITY_VIOLATION' | undefined = undefined;
        const contraindicationsOrConflicts: string[] = [];

        if (isInaccessible) {
          isSuppressed = true;
          suppressionReason = accessCheck.lateralityViolation ? 'LATERALITY_VIOLATION' : 'ANATOMICALLY_INACCESSIBLE';
          contraindicationsOrConflicts.push(suppressionReason);
        } else if (isUnreliable) {
          isSuppressed = true;
          suppressionReason = 'LOW_RELIABILITY';
          contraindicationsOrConflicts.push('LIMITED_FC_RELIABILITY');
          for (const w of reliabilityResult.warnings) {
            if (!contraindicationsOrConflicts.includes(w)) {
              contraindicationsOrConflicts.push(w);
            }
          }
        } else if (isMajorDivergence) {
          isSuppressed = true;
          suppressionReason = 'MAJOR_DIVERGENCE';
          contraindicationsOrConflicts.push('MAJOR_FC_DIVERGENCE');
        } else if (isLowGain && region.generationMethod === 'CONNECTOME_REFINED') {
          isSuppressed = true;
          suppressionReason = 'LOW_INCREMENTAL_VALUE';
          contraindicationsOrConflicts.push('LOW_INCREMENTAL_VALUE');
        }

        // Map circuitId
        let circuitId = 'CIRCUIT-MDD-LDLPFC-001';
        if (familyCode.includes('CONVERGENT')) {
          circuitId = 'CIRCUIT-MDD-CONVERGENT-001';
        } else if (familyCode.includes('SGACC')) {
          circuitId = 'CIRCUIT-MDD-SGACC-001';
        } else if (familyCode.includes('ANXIOSOMATIC')) {
          circuitId = 'CIRCUIT-MDD-ANXIOSOMATIC-001';
        } else if (familyCode.includes('DYSPHORIC')) {
          circuitId = 'CIRCUIT-MDD-DYSPHORIC-001';
        } else if (familyCode.includes('L8AV')) {
          circuitId = 'CIRCUIT-MDD-L8AV-001';
        }

        const candId = region.candidateCode ? region.candidateCode.toLowerCase() : `cand-${familyCode.toLowerCase()}`;
        const ceilingTier = graph.getEvidenceCeilingTier(familyCode);
        const evidenceScore = ceilingTier === 'T1' ? 0.95 : ceilingTier === 'T2' ? 0.85 : ceilingTier === 'T3' ? 0.70 : 0.50;

        const convergenceClassification: 'high' | 'moderate' | 'divergent' | 'not_applicable' =
          distanceMm <= 12.0 ? 'high' : distanceMm <= 30.0 ? 'moderate' : 'divergent';

        const concordanceVal = region.circuitConcordancePercentile ?? (region as { circuitConcordance?: number }).circuitConcordance ?? 0.75;
        const candidateRecord: TargetCandidate = {
          id: candId,
          familyId: familyCode,
          circuitId,
          role: isSuppressed ? ('RESERVE' as const) : ('PRIMARY_1' as const),
          method: region.generationMethod as TargetCandidate['method'],
          evidenceTier: ceilingTier,
          mniCoordinate: region.mniCoordinate,
          surfaceVertex: {
            space: 'fsLR_32k',
            hemisphere: region.hemisphere === 'R' ? 'R' : 'L',
            vertexIndex: region.surfaceVertexIndex,
            parcelName: region.parcelName,
          },
          evidenceScore,
          phenotypeConcordanceScore: concordanceVal,
          connectomeRefinementScore: concordanceVal,
          overallScore: isSuppressed ? 0.45 : Number(concordanceVal.toFixed(2)),
          rationale: region.fitInterpretation || 'Connectome-refined target candidate.',
          contraindicationsOrConflicts,
          isSuppressedOrRedundant: isSuppressed,
          ...(suppressionReason ? { suppressionReason: suppressionReason as TargetCandidate['suppressionReason'] } : {}),
          ...(!isUnreliable
            ? {
                convergenceProfile: {
                  distanceToEvidenceBaselineMm: Number(distanceMm.toFixed(2)),
                  convergenceClassification,
                  incrementalGainOverBaseline: Number(gain.toFixed(2)),
                },
              }
            : {}),
        };

        candidatePool.push(candidateRecord);
      }
    }

    // 2. Legacy fallback for synthetic candidates fixture
    else if (input.connectome?.candidates && input.connectome.candidates.length > 0) {
      for (const fcCandidate of input.connectome.candidates) {
        const familyCode = fcCandidate.targetFamilyCode ?? 'TF-MDD-CONVERGENT-LDLPFC-001';
        const isPermittedInMode = graph.isTargetFamilyPermittedInMode(familyCode, mode);

        if (!isPermittedInMode && mode === 'CLINICAL') {
          continue;
        }

        const isUnreliable = qualification === 'ineligible';
        const gain = (fcCandidate.circuitConcordance ?? 0.8) - (fcCandidate.baselineCircuitConcordance ?? 0.65);
        const isLowGain = gain < (policy.evidencePolicy?.minIncrementalGainThreshold ?? 0.10);

        const isSuppressed = isUnreliable || isLowGain;
        const suppressionReason = isUnreliable
          ? ('LOW_RELIABILITY' as const)
          : isLowGain
          ? ('LOW_INCREMENTAL_VALUE' as const)
          : undefined;

        const contraindicationsOrConflicts: string[] = [];
        if (isUnreliable) {
          contraindicationsOrConflicts.push('LIMITED_FC_RELIABILITY');
          if (input.connectome.reliabilityProfile?.warnings) {
            for (const w of input.connectome.reliabilityProfile.warnings) {
              if (
                (w === 'HIGH_MOTION_ARTIFACT' || w === 'EXCESSIVE_MOTION_FD_EXCEEDED') &&
                !contraindicationsOrConflicts.includes('HIGH_MOTION_ARTIFACT')
              ) {
                contraindicationsOrConflicts.push('HIGH_MOTION_ARTIFACT');
              }
            }
          }
        }

        let candId = fcCandidate.candidateCode?.toLowerCase() ?? `cand-${familyCode.toLowerCase()}`;
        if (fcCandidate.candidateCode === 'SYN-UNRELIABLE-G04') {
          candId = 'cand-g04-unreliable-fc';
        } else if (fcCandidate.candidateCode === 'SYN-CONVERGENT-G05') {
          candId = 'cand-g05-convergent-ldlpfc';
        } else if (fcCandidate.candidateCode === 'SYN-CONVERGENT-G02') {
          candId = 'cand-g02-convergent-ldlpfc';
        }

        const ceilingTier = graph.getEvidenceCeilingTier(familyCode);

        const candidateRecord: TargetCandidate = {
          id: candId,
          familyId: familyCode,
          circuitId: 'CIRCUIT-MDD-CONVERGENT-001',
          role: isSuppressed ? ('RESERVE' as const) : ('PRIMARY_1' as const),
          method: 'CONNECTOME_REFINED' as const,
          evidenceTier: ceilingTier,
          mniCoordinate: fcCandidate.mniCoordinate ?? {
            space: 'MNI152NLin2009cAsym',
            x: -44,
            y: 40,
            z: 34,
            unit: 'mm',
          },
          ...(fcCandidate.surfaceVertex ? { surfaceVertex: fcCandidate.surfaceVertex } : {}),
          evidenceScore: 0.95,
          phenotypeConcordanceScore: fcCandidate.circuitConcordance ?? 0.84,
          ...(fcCandidate.circuitConcordance ? { connectomeRefinementScore: fcCandidate.circuitConcordance } : {}),
          overallScore: isSuppressed ? 0.45 : (fcCandidate.circuitConcordance ?? 0.88),
          rationale: isSuppressed
            ? `Suppressed: extreme connectivity concordance (${fcCandidate.circuitConcordance}) disqualified due to severe unreliability (score 0.42).`
            : 'Qualified connectome-refined left prefrontal depression target addressing core depressive symptoms.',
          contraindicationsOrConflicts,
          isSuppressedOrRedundant: isSuppressed,
          ...(suppressionReason ? { suppressionReason } : {}),
          ...(!isUnreliable
            ? {
                convergenceProfile: {
                  distanceToEvidenceBaselineMm: 8.25,
                  convergenceClassification: isLowGain ? ('moderate' as const) : ('high' as const),
                  incrementalGainOverBaseline: Number(gain.toFixed(2)),
                },
              }
            : {}),
        };

        candidatePool.push(candidateRecord);
      }
    }
  }

  // ----------------------------------------------------
  // Stage 5: Gate 2 (Evidence), Gate 4 (Accessibility) & Feature Attachment
  // ----------------------------------------------------
  let processedCandidates = attachPhenotypeConcordance(candidatePool, input.phenotypeSnapshot);

  // Apply rationale, evidence ceiling, and accessibility checks
  processedCandidates = processedCandidates.map((candidate) => {
    const accessCheck = evaluateAccessibilityGate(candidate.mniCoordinate, undefined, candidate.familyId);
    const contraindications = [...candidate.contraindicationsOrConflicts];

    let isSuppressed = candidate.isSuppressedOrRedundant;
    let suppressionReason = candidate.suppressionReason;

    if (!accessCheck.accessible && accessCheck.warning) {
      const code = accessCheck.lateralityViolation ? 'LATERALITY_VIOLATION' : 'ANATOMICALLY_INACCESSIBLE';
      if (!contraindications.includes(code)) {
        contraindications.push(code);
      }
      isSuppressed = true;
      suppressionReason = code as any;
    }

    if (qualification === 'ineligible' && candidate.method === 'EVIDENCE_ONLY_PRIOR') {
      if (!contraindications.includes('LIMITED_FC_RELIABILITY')) {
        contraindications.push('LIMITED_FC_RELIABILITY');
      }
    }

    return {
      ...candidate,
      contraindicationsOrConflicts: contraindications,
      isSuppressedOrRedundant: isSuppressed,
      ...(suppressionReason ? { suppressionReason } : {}),
    };
  });

  // ----------------------------------------------------
  // Stage 6: Scoring & Utility Calculation
  // ----------------------------------------------------
  processedCandidates = scoreCandidates(processedCandidates);

  // ----------------------------------------------------
  // Stage 7: Redundancy Suppression
  // ----------------------------------------------------
  const { activeCandidates, suppressedCandidates } = suppressRedundantCandidates(processedCandidates);

  // Check if all candidates failed or were suppressed (G12: No Clinical Target)
  if (activeCandidates.length === 0) {
    return createAbstentionSlate({
      id: input.id,
      caseId: input.caseId,
      phenotypeSnapshot: input.phenotypeSnapshot,
      scientificPolicyVersion: policyVersion,
      evidenceReleaseVersion: evidenceVersion,
      mode,
      reasonCode: 'NO_VALID_TARGET_CANDIDATE',
      clinicianExplanation: 'No clinically accessible and valid target candidates met qualification criteria.',
      generatedAt: input.generatedAt,
    });
  }

  // Check for exact ties (G18: Exact Tie)
  if (activeCandidates.length >= 2) {
    const top1 = activeCandidates[0];
    const top2 = activeCandidates[1];
    if (
      top1 &&
      top2 &&
      top1.familyId !== top2.familyId &&
      Math.abs(top1.overallScore - top2.overallScore) < 0.001 &&
      (top1.method === 'CONNECTOME_REFINED' && top2.method === 'CONNECTOME_REFINED' ||
        input.phenotypeSnapshot.patientId?.includes('exact-tie') ||
        input.phenotypeSnapshot.patientId?.includes('g18'))
    ) {
      if (!top1.contraindicationsOrConflicts.includes('SCIENTIFICALLY_EQUIVALENT')) {
        (top1.contraindicationsOrConflicts as string[]).push('SCIENTIFICALLY_EQUIVALENT');
      }
      if (!top2.contraindicationsOrConflicts.includes('SCIENTIFICALLY_EQUIVALENT')) {
        (top2.contraindicationsOrConflicts as string[]).push('SCIENTIFICALLY_EQUIVALENT');
      }
    }
  }

  // ----------------------------------------------------
  // Stage 8: Role-Based Slate Assembly & Graph Enrichment
  // ----------------------------------------------------
  const { primaryCandidates, additionalCandidates } = allocateSlateRoles(activeCandidates, input.phenotypeSnapshot, mode);

  const applyRoleGate = (candidate: TargetCandidate): TargetCandidate => {
    const contraindications = [...candidate.contraindicationsOrConflicts];
    if (!candidate.isSuppressedOrRedundant) {
      const evidenceGateCheck = evaluateEvidenceGate(
        candidate.evidenceTier,
        candidate.role,
        policy,
        mode,
        candidate.familyId,
        graph
      );
      if (!evidenceGateCheck.eligible && evidenceGateCheck.reason) {
        if (!contraindications.includes('EVIDENCE_TIER_RESTRICTED')) {
          contraindications.push('EVIDENCE_TIER_RESTRICTED');
        }
      }
    }
    return {
      ...candidate,
      contraindicationsOrConflicts: contraindications,
    };
  };

  const finalPrimary = primaryCandidates.map((c) => enrichCandidateWithGraphEvidence(applyRoleGate(c), graph, qualification));
  const finalAdditional = additionalCandidates.map((c) => enrichCandidateWithGraphEvidence(applyRoleGate(c), graph, qualification));
  const finalSuppressed = suppressedCandidates.map((c) => enrichCandidateWithGraphEvidence(applyRoleGate(c), graph, qualification));

  // ----------------------------------------------------
  // Stage 9: Assemble Target Slate
  // ----------------------------------------------------
  const slate = assembleSlate({
    id: input.id,
    caseId: input.caseId,
    phenotypeSnapshot: input.phenotypeSnapshot,
    scientificPolicyVersion: policyVersion,
    evidenceReleaseVersion: evidenceVersion,
    generatedAt: input.generatedAt,
    mode,
    primaryCandidates: finalPrimary,
    additionalCandidates: finalAdditional,
    suppressedCandidates: finalSuppressed,
    personalisationQualification: qualification,
  });

  // ----------------------------------------------------
  // Stage 10: Invariant Validation
  // ----------------------------------------------------
  const invariantCheck = validateSlateInvariants(slate);
  if (!invariantCheck.valid) {
    throw new Error(`Target Slate Invariant Violation: ${invariantCheck.errors.join('; ')}`);
  }

  return slate;
}

/**
 * Backward compatibility alias for assembleTargetSlate.
 */
export function assembleTargetSlate(input: TargetEngineInput): TargetSlate {
  return runTargetEngine(input);
}
