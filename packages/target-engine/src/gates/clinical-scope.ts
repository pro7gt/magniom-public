/**
 * Gate 1 — Clinical Scope Gate
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 11 & Section 109.
 * Validates clinical indication, active episode profile, and clinician safety clearance.
 */

import type { PhenotypeSnapshot, MagniomMode } from '@magniom/domain';
import type { ScientificPolicyRelease } from '@magniom/scientific-policy';

export interface ClinicalScopeGateResult {
  readonly passed: boolean;
  readonly reasonCode?:
    'DIAGNOSIS_OUT_OF_SCOPE' | 'INACTIVE_EPISODE' | 'SAFETY_NOT_CLEARED' | 'INVALID_INDICATION';
  readonly message?: string;
}

export function evaluateClinicalScopeGate(
  snapshot: PhenotypeSnapshot | undefined | null,
  policy: ScientificPolicyRelease,
  mode: MagniomMode,
): ClinicalScopeGateResult {
  if (!snapshot) {
    return {
      passed: false,
      reasonCode: 'INVALID_INDICATION',
      message: 'Target calculation rejected: Phenotype snapshot is missing.',
    };
  }

  // 1. In Clinical Mode, safety clearance is a mandatory prerequisite
  if (mode === 'CLINICAL' && snapshot.safetyClearance !== 'cleared') {
    return {
      passed: false,
      reasonCode: 'SAFETY_NOT_CLEARED',
      message: `Target calculation rejected: Patient clinical safety clearance status is '${snapshot.safetyClearance ?? 'unspecified'}'. Must be explicitly 'cleared'.`,
    };
  }

  // 2. Active episode verification
  if (snapshot.episodeProfile && !snapshot.episodeProfile.active) {
    return {
      passed: false,
      reasonCode: 'INACTIVE_EPISODE',
      message: 'Target calculation rejected: Clinical episode is marked inactive.',
    };
  }

  // 3. Indication scope matching against scientific policy
  const diagCode = snapshot.diagnosisAssertion?.code?.toUpperCase() ?? '';
  const primaryDiag = snapshot.primaryDiagnosis?.toUpperCase() ?? '';

  const matchesPolicy = policy.indicationScope.some((indication: { code: string }) => {
    const indCode = indication.code.toUpperCase();
    return (
      (diagCode &&
        (diagCode === indCode ||
          (diagCode === 'MDD' && (indCode === '296.23' || indCode === '6A70')))) ||
      primaryDiag.includes('MAJOR DEPRESSIVE') ||
      primaryDiag.includes('MDD')
    );
  });

  if (!matchesPolicy && mode === 'CLINICAL') {
    return {
      passed: false,
      reasonCode: 'DIAGNOSIS_OUT_OF_SCOPE',
      message: `Target calculation rejected: Primary diagnosis '${snapshot.primaryDiagnosis}' is outside active Scientific Policy indication scope.`,
    };
  }

  return { passed: true };
}
