/**
 * Gate 3 — Imaging / Connectome Reliability Gate
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 15-17 & 45-51.
 * Determines whether individual connectomics data is usable for precision target refinement.
 */

import type {
  PersonalisationQualification,
  TargetReliabilityProfile,
  CanonicalTargetReliabilityProfile,
  ConnectomeTargetInput,
} from '@magniom/domain';
import type { ScientificPolicyRelease } from '@magniom/scientific-policy';

export interface ReliabilityGateResult {
  readonly qualification: PersonalisationQualification;
  readonly isReliableForPersonalisation: boolean;
  readonly warnings: readonly string[];
  readonly suppressionReason?: 'LOW_RELIABILITY' | 'LOW_INCREMENTAL_VALUE';
}

export function evaluateReliabilityGate(
  connectomeInput:
    | ConnectomeTargetInput
    | {
        quality?: string;
        reliabilityProfile?: TargetReliabilityProfile | CanonicalTargetReliabilityProfile;
        reliabilityProfiles?: readonly (
          TargetReliabilityProfile | CanonicalTargetReliabilityProfile
        )[];
        candidates?: readonly unknown[];
      }
    | null
    | undefined,
  policy: ScientificPolicyRelease,
): ReliabilityGateResult {
  // If no connectome data is provided, personalisation is cleanly marked not available
  if (!connectomeInput || connectomeInput === null) {
    return {
      qualification: 'not_available',
      isReliableForPersonalisation: false,
      warnings: [],
    };
  }

  const warnings: string[] = [];
  const qcStatus =
    'qcStatus' in connectomeInput ? connectomeInput.qcStatus : connectomeInput.quality;

  if (qcStatus === 'fail') {
    warnings.push('LIMITED_FC_RELIABILITY');
    return {
      qualification: 'ineligible',
      isReliableForPersonalisation: false,
      warnings,
      suppressionReason: 'LOW_RELIABILITY',
    };
  }

  // Check retained duration if present
  if ('retainedMinutes' in connectomeInput && typeof connectomeInput.retainedMinutes === 'number') {
    const minRest = (policy.parameters?.['minRestingMinutes'] as number | undefined) ?? 10.0;
    if (connectomeInput.retainedMinutes < minRest && qcStatus !== 'conditional') {
      warnings.push('INSUFFICIENT_RETAINED_DURATION');
      if (connectomeInput.retainedMinutes < 8.0) {
        return {
          qualification: 'ineligible',
          isReliableForPersonalisation: false,
          warnings: [...warnings, 'LIMITED_FC_RELIABILITY'],
          suppressionReason: 'LOW_RELIABILITY',
        };
      }
    }
  }

  // Get primary profile from reliabilityProfile or reliabilityProfiles[0]
  const profile: TargetReliabilityProfile | CanonicalTargetReliabilityProfile | undefined =
    connectomeInput.reliabilityProfile ??
    (connectomeInput.reliabilityProfiles && connectomeInput.reliabilityProfiles.length > 0
      ? connectomeInput.reliabilityProfiles[0]
      : undefined);

  if (profile) {
    if (profile.warnings) {
      warnings.push(...profile.warnings);
    }
    if ('limitingFactors' in profile && profile.limitingFactors) {
      for (const factor of profile.limitingFactors) {
        if (!warnings.includes(factor)) {
          warnings.push(factor);
        }
      }
    }

    const minReliability = policy.evidencePolicy.minReliabilityForPersonalisation ?? 0.7;
    const isReliable = profile.isReliableForPersonalisation;
    const score = profile.overallReliabilityScore;

    // Check composite distance if available in canonical profile
    if (
      'compositeSpatialDistanceMm' in profile &&
      typeof profile.compositeSpatialDistanceMm === 'number'
    ) {
      if (profile.compositeSpatialDistanceMm > 8.0) {
        if (!warnings.includes('EXCESSIVE_SPATIAL_DISPERSION')) {
          warnings.push('EXCESSIVE_SPATIAL_DISPERSION');
        }
      }
    }

    if (score < minReliability || !isReliable) {
      if (!warnings.includes('LIMITED_FC_RELIABILITY')) {
        warnings.push('LIMITED_FC_RELIABILITY');
      }
      return {
        qualification: 'ineligible',
        isReliableForPersonalisation: false,
        warnings,
        suppressionReason: 'LOW_RELIABILITY',
      };
    }

    return {
      qualification: 'qualified',
      isReliableForPersonalisation: true,
      warnings,
    };
  }

  // If connectome object exists with quality pass / conditional but no explicit profile
  if (qcStatus === 'pass' || qcStatus === 'conditional') {
    return {
      qualification: 'qualified',
      isReliableForPersonalisation: true,
      warnings,
    };
  }

  return {
    qualification: 'ineligible',
    isReliableForPersonalisation: false,
    warnings: ['LIMITED_FC_RELIABILITY'],
    suppressionReason: 'LOW_RELIABILITY',
  };
}
