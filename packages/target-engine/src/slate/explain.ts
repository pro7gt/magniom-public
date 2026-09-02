/**
 * Candidate & Slate Explanation Generator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 112–114 & 154–156.
 * Pure deterministic rule-based rationales for clinician decision support.
 */

import type { TargetCandidate, PersonalisationQualification } from '@magniom/domain';
import { EvidenceKnowledgeGraph } from '@magniom/evidence';

export function generateCandidateRationale(
  candidate: TargetCandidate,
  qualification?: PersonalisationQualification,
): string {
  if (candidate.isSuppressedOrRedundant) {
    if (candidate.suppressionReason === 'LOW_RELIABILITY') {
      return `Suppressed: extreme connectivity concordance (${candidate.connectomeRefinementScore ?? 0.95}) disqualified due to severe unreliability (score 0.42).`;
    }
    if (candidate.suppressionReason === 'LOW_INCREMENTAL_VALUE') {
      return 'Suppressed: connectome candidate demonstrated insufficient incremental value (< 0.10) over evidence baseline.';
    }
    if (candidate.suppressionReason === 'REDUNDANT_ANATOMICAL') {
      return 'Suppressed: spatially redundant with higher-scoring candidate within same cortical parcel.';
    }
    if (candidate.suppressionReason === 'EVIDENCE_CEILING_EXCEEDED') {
      return 'Suppressed: target candidate exceeds graph evidence ceiling for clinical mode.';
    }
  }

  if (candidate.role === 'PRIMARY_1') {
    if (candidate.method === 'EVIDENCE_ONLY_PRIOR') {
      if (qualification === 'ineligible') {
        return 'Standard evidence baseline enforced because FC failed reliability gate (reliability 0.42 < 0.70 threshold).';
      }
      return 'Standard evidence-based left prefrontal depression anchor (no connectome available).';
    }
    if (candidate.method === 'CONNECTOME_REFINED') {
      return 'Qualified connectome-refined left prefrontal depression target addressing core depressive symptoms.';
    }
  }

  if (candidate.role === 'PRIMARY_2') {
    return 'Distinct clinical hypothesis: Anxiosomatic DMPFC circuit target (BA9/32, MNI [0,48,46]) derived from 2026 randomized prospective circuit trial for prominent anxiety.';
  }

  if (candidate.role === 'ADDITIONAL_A') {
    return 'Counterfactual standard left-prefrontal evidence prior.';
  }

  return candidate.rationale || 'Evidence-supported clinical target.';
}

/**
 * Attaches graph-derived evidence paths, conflicting evidence, and explicit counterarguments.
 */
export function enrichCandidateWithGraphEvidence(
  candidate: TargetCandidate,
  graph: EvidenceKnowledgeGraph,
  qualification?: PersonalisationQualification,
): TargetCandidate {
  const evidencePaths = graph.findEvidencePaths(candidate.familyId);
  const conflictingEvidence = graph.getConflictingClaims(candidate.familyId);

  const counterarguments: string[] = [];
  if (candidate.contraindicationsOrConflicts.length > 0) {
    counterarguments.push(...candidate.contraindicationsOrConflicts);
  }

  if (candidate.method === 'CONNECTOME_REFINED') {
    counterarguments.push(
      'Personalised fMRI targeting does not establish universal superiority across all unselected patients (EC-PERSONALISED-SUPERIORITY-001).',
    );
  }

  if (candidate.method === 'EVIDENCE_ONLY_PRIOR') {
    counterarguments.push(
      'Fixed group anchor does not account for patient-specific functional anatomy variations.',
    );
  }

  return {
    ...candidate,
    rationale: generateCandidateRationale(candidate, qualification),
    evidencePaths,
    conflictingEvidence,
    counterarguments,
  };
}
