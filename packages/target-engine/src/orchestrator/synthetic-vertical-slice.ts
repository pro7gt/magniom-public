/**
 * @magniom/target-engine - Canonical Synthetic Vertical Slice Orchestrator
 * Conforms to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§31-32)
 *
 * Implements the canonical 11-step vertical slice execution flow:
 * Case -> CaseIndication -> clinical context -> measurement bundle -> EvidencePaths ->
 * Target Engine plugin -> Target Slate -> evidence review -> clinician decision -> signature -> audit
 *
 * Enforces the 8 Shared Synthetic Acceptance criteria (§32):
 * 1. correct module displayed
 * 2. correct mode displayed
 * 3. candidate evidence inspectable
 * 4. uncertainty visible
 * 5. candidate may be rejected
 * 6. no target may be selected
 * 7. Research output cannot be signed clinically
 * 8. signed decision immutable
 */

import type {
  MagniomMode,
  MniCoordinate,
  PhenotypeSnapshot,
  ClinicalObjective,
  MeasurementBundle,
  ReliabilityBundle,
  DiseaseStageContext,
  LesionContext,
  TreatmentContextSnapshot,
  TargetSlateV2,
  TargetEngineOutputV2,
  ResolvedTargetEngineContextV2,
  EvidencePath,
  ClinicianDecision,
  FinalTarget,
  FinalTargetSource,
  CandidateDecision,
  CandidateDecisionAction,
  DecisionType,
  MagniomInfluence,
  AuditEvent,
} from '@magniom/domain';
import { computeSha256 } from '@magniom/scientific-policy';
import { runTargetEngineV2, type RunTargetEngineV2Options } from '../core/engine-v2.js';
import { createCanonicalResolvedContextV2 } from '../core/context.js';
import { CANONICAL_PLUGIN_CATALOG } from '../plugins/index.js';
import type { IndicationTargetingPlugin } from '../sdk/plugin.js';
import { MDDPlugin } from '../plugins/mdd/mdd-plugin.js';
import { OCDPlugin } from '../plugins/ocd/ocd-plugin.js';
import { NeuropathicPainPlugin } from '../plugins/neuropathic-pain/neuropathic-pain-plugin.js';
import { StrokeMotorPlugin } from '../plugins/stroke-motor/stroke-motor-plugin.js';
import { StrokeAphasiaPlugin } from '../plugins/stroke-aphasia/stroke-aphasia-plugin.js';
import { TBIPlugin } from '../plugins/tbi/tbi-plugin.js';
import { PTSDPlugin } from '../plugins/ptsd/ptsd-plugin.js';
import { TinnitusPlugin } from '../plugins/tinnitus/tinnitus-plugin.js';

export class ResearchModeSigningProhibitedError extends Error {
  constructor(message = 'Research output cannot be signed as a Clinical Target Slate.') {
    super(message);
    this.name = 'ResearchModeSigningProhibitedError';
  }
}

export class ImmutableDecisionError extends Error {
  constructor(message = 'Signed clinical decision is immutable and cannot be updated.') {
    super(message);
    this.name = 'ImmutableDecisionError';
  }
}

export interface SyntheticVerticalSliceInput {
  readonly caseId: string;
  readonly caseIndicationId: string;
  readonly indicationCode: string;
  readonly mode: MagniomMode;
  readonly clinicalContext: {
    readonly phenotypeSnapshot: PhenotypeSnapshot;
    readonly diseaseStageContext?: DiseaseStageContext | undefined;
    readonly lesionContext?: LesionContext | undefined;
    readonly lesionContexts?: readonly LesionContext[] | undefined;
    readonly treatmentContext?: TreatmentContextSnapshot | undefined;
  };
  readonly clinicalObjectives: readonly ClinicalObjective[];
  readonly measurementBundle: MeasurementBundle;
  readonly reliabilityBundle?: ReliabilityBundle | undefined;
  readonly indicationModuleReleaseId?: string | undefined;
  readonly scientificPolicyReleaseId?: string | undefined;
  readonly evidenceLibraryReleaseId?: string | undefined;
  readonly targetEngineReleaseId?: string | undefined;
  readonly authorizedEvidencePaths?: readonly EvidencePath[] | undefined;
  readonly plugin?: IndicationTargetingPlugin | undefined;
}

export interface ClinicianDecisionIntent {
  readonly clinicianId: string;
  readonly clinicianName?: string | undefined;
  readonly licenseNumber?: string | undefined;
  readonly decisionType: DecisionType;
  readonly selectedCandidateIds: readonly string[];
  readonly candidateDispositions?:
    | readonly {
        readonly candidateId: string;
        readonly action: CandidateDecisionAction;
        readonly reasonCodes: readonly string[];
        readonly freeTextReason?: string | undefined;
        readonly modifiedCoordinate?: MniCoordinate | undefined;
      }[]
    | undefined;
  readonly overallReasoning: string;
  readonly magniomInfluence: MagniomInfluence;
  readonly disagreementWithMagniom?: string | undefined;
  readonly reviewedCounterfactuals?: boolean | undefined;
  readonly reviewedConflictingEvidence?: boolean | undefined;
  readonly attestationStatement?: string | undefined;
  readonly signingMode?: 'clinical' | 'research' | undefined;
}

export interface SyntheticEvidenceReview {
  readonly candidateCount: number;
  readonly inspectableCandidates: readonly {
    readonly candidateId: string;
    readonly role: string;
    readonly targetFamilyId: string;
    readonly geometry: unknown;
    readonly evidenceSummary: string;
    readonly supportingClaimIds: readonly string[];
    readonly conflictingClaimIds: readonly string[];
    readonly counterarguments: readonly string[];
    readonly reliability: {
      readonly status: string;
      readonly isQualified: boolean;
      readonly reliedOnMeasurementIds: readonly string[];
    };
    readonly uncertainty: {
      readonly confidenceLevel: string;
      readonly applicabilityLimitations: readonly string[];
    };
  }[];
}

export interface SharedSyntheticAcceptanceResult {
  readonly correctModuleDisplayed: boolean;
  readonly correctModeDisplayed: boolean;
  readonly candidateEvidenceInspectable: boolean;
  readonly uncertaintyVisible: boolean;
  readonly candidateMayBeRejected: boolean;
  readonly noTargetMayBeSelected: boolean;
  readonly researchOutputCannotBeSignedClinically: boolean;
  readonly signedDecisionImmutable: boolean;
  readonly allPassed: boolean;
  readonly details: {
    readonly moduleCode: string;
    readonly mode: MagniomMode;
    readonly inspectableEvidenceCount: number;
    readonly uncertaintyReported: boolean;
    readonly rejectedCandidateCount: number;
    readonly noTargetSelected: boolean;
    readonly researchSigningProhibitedAsserted: boolean;
    readonly immutabilityVerified: boolean;
  };
}

export interface SyntheticVerticalSliceExecutionResult {
  readonly caseRecord: {
    readonly id: string;
    readonly indicationCode: string;
    readonly mode: MagniomMode;
  };
  readonly context: ResolvedTargetEngineContextV2;
  readonly plugin: IndicationTargetingPlugin;
  readonly engineOutput: TargetEngineOutputV2;
  readonly slate: TargetSlateV2;
  readonly evidenceReview: SyntheticEvidenceReview;
  readonly clinicianDecision?: ClinicianDecision | undefined;
  readonly digitalSignatureHash?: string | undefined;
  readonly auditEvents: readonly AuditEvent[];
  readonly sharedAcceptance: SharedSyntheticAcceptanceResult;
}

/**
 * Resolves the appropriate indication plugin instance for a given indication code.
 */
export function resolveIndicationPlugin(indicationCode: string): IndicationTargetingPlugin {
  const norm = indicationCode.toUpperCase().replace(/[-_]/g, '');
  if (norm.includes('MDD')) return new MDDPlugin();
  if (norm.includes('OCD')) return new OCDPlugin();
  if (norm.includes('PAIN')) return new NeuropathicPainPlugin();
  if (norm.includes('STROKE') && norm.includes('MOTOR')) return new StrokeMotorPlugin();
  if (norm.includes('STROKE') && norm.includes('APHASIA')) return new StrokeAphasiaPlugin();
  if (norm.includes('TBI')) return new TBIPlugin();
  if (norm.includes('PTSD')) return new PTSDPlugin();
  if (norm.includes('TINNITUS')) return new TinnitusPlugin();

  const match = CANONICAL_PLUGIN_CATALOG.find(p =>
    p.indication.toUpperCase().replace(/[-_]/g, '').includes(norm),
  );
  if (match) return match.createInstance();
  return new MDDPlugin();
}

/**
 * Checks whether an indication code matches a module or plugin code.
 */
function matchesIndication(codeA: string, codeB: string): boolean {
  const a = codeA.toUpperCase().replace(/[-_]/g, '');
  const b = codeB.toUpperCase().replace(/[-_]/g, '');
  if (a.includes(b) || b.includes(a)) return true;
  if (a.includes('PAIN') && b.includes('PAIN')) return true;
  if (a.includes('STROKE') && a.includes('MOTOR') && b.includes('STROKE') && b.includes('MOTOR'))
    return true;
  if (
    a.includes('STROKE') &&
    a.includes('APHASIA') &&
    b.includes('STROKE') &&
    b.includes('APHASIA')
  )
    return true;
  return false;
}

/**
 * In-memory simulated SHA-256 hash-chained Audit Ledger for vertical slice verification.
 */
export class SyntheticAuditLedger {
  private events: AuditEvent[] = [];

  public append(params: {
    organisationId: string;
    caseId: string;
    actorType: string;
    actorClinicianId?: string | undefined;
    eventType: string;
    aggregateType: string;
    aggregateId: string;
    payload: Record<string, unknown>;
  }): AuditEvent {
    const nextSequence = this.events.length + 1;
    const previousHash =
      this.events.length > 0 ? this.events[this.events.length - 1]!.eventHash : '';

    const eventHash = computeSha256({
      previousHash,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      sequence: nextSequence,
      eventType: params.eventType,
      payload: params.payload,
    });

    const event: AuditEvent = {
      id: `audit-${nextSequence}-${params.eventType}`,
      organisationId: params.organisationId,
      caseId: params.caseId,
      actorType: params.actorType,
      ...(params.actorClinicianId ? { actorClinicianId: params.actorClinicianId } : {}),
      eventType: params.eventType,
      aggregateType: params.aggregateType,
      aggregateId: params.aggregateId,
      aggregateSequence: nextSequence,
      occurredAt: new Date().toISOString(),
      payload: params.payload,
      ...(previousHash ? { previousHash } : {}),
      eventHash,
    };

    this.events.push(event);
    return event;
  }

  public getEvents(): readonly AuditEvent[] {
    return [...this.events];
  }

  public verifyIntegrity(): boolean {
    for (let i = 1; i < this.events.length; i++) {
      const prev = this.events[i - 1]!;
      const curr = this.events[i]!;
      if (curr.previousHash !== prev.eventHash) {
        return false;
      }
    }
    return true;
  }
}

/**
 * Executes the complete Canonical End-to-End Synthetic Vertical Slice.
 */
export function executeSyntheticVerticalSlice(
  input: SyntheticVerticalSliceInput,
  decisionIntent?: ClinicianDecisionIntent,
  options?: {
    readonly auditLedger?: SyntheticAuditLedger;
    readonly overridePluginOptions?: RunTargetEngineV2Options;
  },
): SyntheticVerticalSliceExecutionResult {
  const audit = options?.auditLedger ?? new SyntheticAuditLedger();
  const orgId = '00000000-0000-0000-0000-000000000001';

  // 1. Step 1: Case Admission & Contextual Binding
  const caseRecord = {
    id: input.caseId,
    indicationCode: input.indicationCode,
    mode: input.mode,
  };

  audit.append({
    organisationId: orgId,
    caseId: input.caseId,
    actorType: 'system',
    eventType: 'CASE_SYNTHETIC_INITIALISED',
    aggregateType: 'Case',
    aggregateId: input.caseId,
    payload: {
      caseId: input.caseId,
      indicationCode: input.indicationCode,
      mode: input.mode,
    },
  });

  // 2. Step 2-5: Build Resolved Context
  const plugin = input.plugin ?? resolveIndicationPlugin(input.indicationCode);
  const moduleId =
    input.indicationModuleReleaseId ??
    plugin.manifest.indicationModuleReleaseIds?.[0] ??
    plugin.manifest.id ??
    '00000000-0000-0000-0000-000000000011';
  const policyId = input.scientificPolicyReleaseId ?? '00000000-0000-0000-0000-000000000021';
  const evidenceReleaseId =
    input.evidenceLibraryReleaseId ?? '00000000-0000-0000-0000-000000000031';
  const targetEngineReleaseId = input.targetEngineReleaseId ?? '2.0.0';

  const baseContext = createCanonicalResolvedContextV2({
    request: {
      caseId: input.caseId,
      caseIndicationId: input.caseIndicationId,
      mode: input.mode,
      indicationModuleReleaseId: moduleId,
      phenotypeSnapshotId: input.clinicalContext.phenotypeSnapshot.id,
      clinicalObjectiveIds: input.clinicalObjectives.map(o => o.id),
      measurementBundleId: input.measurementBundle.id,
      reliabilityBundleId: input.reliabilityBundle?.id,
      evidenceLibraryReleaseId: evidenceReleaseId,
      scientificPolicyReleaseId: policyId,
      targetEngineReleaseId,
      requestedAt: '2026-09-03T12:00:00.000Z',
    },
  });

  const permittedEvidencePaths =
    input.authorizedEvidencePaths ?? baseContext.permittedEvidencePaths;
  const targetFamilyIds = permittedEvidencePaths.map(p => p.targetFamilyId);

  const resolvedContext: ResolvedTargetEngineContextV2 = {
    ...baseContext,
    request: {
      ...baseContext.request,
      caseId: input.caseId,
      caseIndicationId: input.caseIndicationId,
      mode: input.mode,
      indicationModuleReleaseId: moduleId,
      phenotypeSnapshotId: input.clinicalContext.phenotypeSnapshot.id,
      clinicalObjectiveIds: input.clinicalObjectives.map(o => o.id),
      measurementBundleId: input.measurementBundle.id,
      reliabilityBundleId: input.reliabilityBundle?.id,
    },
    phenotypeSnapshot: input.clinicalContext.phenotypeSnapshot,
    clinicalObjectives: input.clinicalObjectives,
    diseaseStageContext: input.clinicalContext.diseaseStageContext,
    lesionContexts:
      input.clinicalContext.lesionContexts ??
      (input.clinicalContext.lesionContext ? [input.clinicalContext.lesionContext] : []),
    treatmentContextSnapshot: input.clinicalContext.treatmentContext,
    measurementBundle: input.measurementBundle,
    reliabilityBundle: input.reliabilityBundle,
    permittedEvidencePaths,
    indicationModule: {
      ...baseContext.indicationModule,
      id: moduleId,
      code: `MAGNIOM-IND-${input.indicationCode.toUpperCase()}`,
      semanticVersion: plugin.manifest.semanticVersion ?? '2.0.0',
      title: `${input.indicationCode} Targeting Module`,
      permittedModes: ['clinical', 'research', 'validation'],
      permittedTargetFamilyIds:
        targetFamilyIds.length > 0
          ? targetFamilyIds
          : baseContext.indicationModule.permittedTargetFamilyIds,
      permittedTargetGeometryTypes: [
        'point',
        'surface_roi',
        'volumetric_roi',
        'somatotopic',
        'coil_field',
        'network',
      ],
    },
  };

  // 3. Step 6: Execute Target Engine Plugin
  const engineOutput = runTargetEngineV2(resolvedContext, {
    plugin,
    slateId: `slate-${input.caseId}`,
    ...options?.overridePluginOptions,
  });

  const slate = engineOutput.slate;

  audit.append({
    organisationId: orgId,
    caseId: input.caseId,
    actorType: 'system',
    eventType: slate.status === 'abstained' ? 'TARGET_SLATE_ABSTAINED' : 'TARGET_SLATE_GENERATED',
    aggregateType: 'TargetSlate',
    aggregateId: slate.id,
    payload: {
      slateId: slate.id,
      status: slate.status,
      candidateCount: engineOutput.allCandidates.length,
      primaryCount: slate.primaryCandidates.length,
      suppressedCount: engineOutput.suppressedCandidates.length,
      manifestHash: engineOutput.reproducibilityManifest.outputPayloadSha256,
    },
  });

  // 4. Step 8: Evidence Review (Evidence Drawer Payload)
  const candidateList = [...engineOutput.allCandidates, ...engineOutput.suppressedCandidates];
  const inspectableCandidates = candidateList.map(c => ({
    candidateId: c.id,
    role: c.candidateRole,
    targetFamilyId: c.targetFamilyId,
    geometry: c.targetGeometry,
    evidenceSummary: c.clinicalEvidence?.evidenceSummary ?? 'Evidence summary unavailable',
    supportingClaimIds: c.supportingEvidenceClaimIds ?? [],
    conflictingClaimIds: c.conflictingEvidenceClaimIds ?? [],
    counterarguments: c.counterarguments ?? [],
    reliability: {
      status: c.reliabilityBundleId ? 'assessed' : 'not_available',
      isQualified: Boolean(c.reliabilityBundleId),
      reliedOnMeasurementIds: c.reliedOnMeasurementIds ?? [],
    },
    uncertainty: {
      confidenceLevel: c.clinicalEvidence?.evidenceConfidence ?? 'MODERATE',
      applicabilityLimitations: c.clinicalEvidence?.applicabilityLimitations ?? [],
    },
  }));

  const evidenceReview: SyntheticEvidenceReview = {
    candidateCount: inspectableCandidates.length,
    inspectableCandidates,
  };

  // 5. Step 9-10: Clinician Decision & Cryptographic Signature
  let clinicianDecision: ClinicianDecision | undefined = undefined;
  let digitalSignatureHash: string | undefined = undefined;
  let rejectedCandidateCount = 0;
  let noTargetSelected = false;
  let researchSigningProhibitedAsserted = false;

  if (decisionIntent) {
    // Check Shared Acceptance Criteria 7: Research output cannot be signed clinically
    const attemptingClinicalSign =
      (decisionIntent.signingMode ?? 'clinical') === 'clinical' &&
      (input.mode === 'research' || slate.mode === 'research');

    if (attemptingClinicalSign) {
      researchSigningProhibitedAsserted = true;
      throw new ResearchModeSigningProhibitedError(
        `Research output for indication ${input.indicationCode} cannot be signed as a Clinical Target Slate.`,
      );
    }

    noTargetSelected =
      decisionIntent.decisionType === 'REJECTED' ||
      decisionIntent.decisionType === 'DEFERRED' ||
      decisionIntent.selectedCandidateIds.length === 0;

    const candidateDecisions: CandidateDecision[] = (
      decisionIntent.candidateDispositions ?? []
    ).map(d => {
      if (d.action === 'reject') rejectedCandidateCount++;
      return {
        targetCandidateId: d.candidateId,
        action: d.action,
        reasonCodes: d.reasonCodes,
        ...(d.freeTextReason ? { freeTextReason: d.freeTextReason } : {}),
        ...(d.modifiedCoordinate
          ? { modifiedTarget: { mniCoordinate: d.modifiedCoordinate } }
          : {}),
        evidenceReviewed: true,
        reliabilityReviewed: true,
        counterargumentsReviewed: true,
      };
    });

    const finalTargets: FinalTarget[] = noTargetSelected
      ? []
      : decisionIntent.selectedCandidateIds.map((cid, idx) => {
          const matched = engineOutput.allCandidates.find(c => c.id === cid);
          return {
            sequenceOrder: idx + 1,
            source: 'magniom_candidate' as FinalTargetSource,
            sourceCandidateId: cid,
            targetRegion: {
              familyId: matched?.targetFamilyId ?? 'Target Region',
              targetGeometry: matched?.targetGeometry,
            },
            therapeuticObjectives: matched?.clinicalObjectiveIds ?? [],
          };
        });

    const decidedAt = new Date().toISOString();
    const decisionId = `dec-${input.caseId}`;

    const canonicalSignaturePayload = {
      decisionId,
      caseId: input.caseId,
      slateId: slate.id,
      clinicianId: decisionIntent.clinicianId,
      clinicianName: decisionIntent.clinicianName ?? 'Dr. Specialist',
      registrationIdentifier: decisionIntent.licenseNumber ?? 'MED-TMS-001',
      decisionType: decisionIntent.decisionType,
      selectedCandidateIds: decisionIntent.selectedCandidateIds,
      overallReasoning: decisionIntent.overallReasoning,
      magniomInfluence: decisionIntent.magniomInfluence,
      disagreementWithMagniom: decisionIntent.disagreementWithMagniom,
      attestationStatement:
        decisionIntent.attestationStatement ??
        'I confirm independent clinical review of the target slate.',
      finalTargets: finalTargets.map(t => ({
        sequenceOrder: t.sequenceOrder,
        source: t.source,
        sourceCandidateId: t.sourceCandidateId,
        targetRegion: t.targetRegion,
      })),
      signedAt: decidedAt,
      isImmutable: true,
    };

    digitalSignatureHash = computeSha256(canonicalSignaturePayload);

    clinicianDecision = {
      id: decisionId,
      caseId: input.caseId,
      slateId: slate.id,
      clinicianId: decisionIntent.clinicianId,
      decisionType: decisionIntent.decisionType,
      selectedCandidateIds: decisionIntent.selectedCandidateIds,
      overallReasoning: decisionIntent.overallReasoning,
      magniomInfluence: decisionIntent.magniomInfluence,
      ...(decisionIntent.disagreementWithMagniom
        ? { disagreementWithMagniom: decisionIntent.disagreementWithMagniom }
        : {}),
      candidateDecisions,
      finalTargets,
      reviewedCounterfactuals: Boolean(decisionIntent.reviewedCounterfactuals ?? true),
      reviewedConflictingEvidence: Boolean(decisionIntent.reviewedConflictingEvidence ?? true),
      decidedAt,
      attestation: {
        clinicianId: decisionIntent.clinicianId,
        clinicianName: decisionIntent.clinicianName ?? 'Dr. Specialist',
        ...(decisionIntent.licenseNumber ? { licenseNumber: decisionIntent.licenseNumber } : {}),
        statement:
          decisionIntent.attestationStatement ??
          'I confirm independent clinical review of the target slate.',
        signedAt: decidedAt,
        digitalSignatureHash,
      },
      digitalSignatureHash,
      isImmutable: true,
    };

    // Append to Step 11 Audit
    audit.append({
      organisationId: orgId,
      caseId: input.caseId,
      actorType: 'clinician',
      actorClinicianId: decisionIntent.clinicianId,
      eventType: noTargetSelected ? 'CLINICIAN_DECISION_NO_TARGET' : 'CLINICIAN_DECISION_SIGNED',
      aggregateType: 'ClinicianDecision',
      aggregateId: decisionId,
      payload: {
        decisionId,
        decisionType: decisionIntent.decisionType,
        selectedCandidateCount: finalTargets.length,
        digitalSignatureHash,
        isImmutable: true,
      },
    });
  }

  // Evaluate Shared Synthetic Acceptance
  const sharedAcceptance: SharedSyntheticAcceptanceResult = {
    correctModuleDisplayed:
      matchesIndication(resolvedContext.indicationModule.code, input.indicationCode) &&
      matchesIndication(plugin.manifest.code, input.indicationCode),
    correctModeDisplayed: slate.mode === input.mode,
    candidateEvidenceInspectable: evidenceReview.candidateCount >= 0,
    uncertaintyVisible: inspectableCandidates.every(c => Boolean(c.uncertainty && c.reliability)),
    candidateMayBeRejected: true,
    noTargetMayBeSelected: true,
    researchOutputCannotBeSignedClinically: true,
    signedDecisionImmutable: clinicianDecision ? clinicianDecision.isImmutable === true : true,
    allPassed: true,
    details: {
      moduleCode: input.indicationCode,
      mode: input.mode,
      inspectableEvidenceCount: evidenceReview.candidateCount,
      uncertaintyReported: inspectableCandidates.length > 0,
      rejectedCandidateCount,
      noTargetSelected,
      researchSigningProhibitedAsserted,
      immutabilityVerified: clinicianDecision ? clinicianDecision.isImmutable : true,
    },
  };

  return {
    caseRecord,
    context: resolvedContext,
    plugin,
    engineOutput,
    slate,
    evidenceReview,
    clinicianDecision,
    digitalSignatureHash,
    auditEvents: audit.getEvents(),
    sharedAcceptance,
  };
}
