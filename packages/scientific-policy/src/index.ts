/**
 * @magniom/scientific-policy
 * Scientific policy configuration and parameter governance.
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v1.0.
 */

export interface ScientificPolicyConfig {
  readonly version: string;
  readonly indication: string;
  readonly minScanDurationMinutes: number;
  readonly maxMeanFramewiseDisplacementMm: number;
  readonly minRetainedFramesPercentage: number;
  readonly maxSplitHalfLocalisationDistanceMm: number;
  readonly weights: {
    readonly evidenceWeight: number;
    readonly phenotypeWeight: number;
    readonly connectomeWeight: number;
  };
}

export const SYNTHETIC_POLICY_V1: ScientificPolicyConfig = {
  version: 'MAGNIOM-POLICY-0.1.0-SYNTHETIC',
  indication: 'MDD_WITH_ANXIOUS_DISTRESS',
  minScanDurationMinutes: 10.0,
  maxMeanFramewiseDisplacementMm: 0.25,
  minRetainedFramesPercentage: 70.0,
  maxSplitHalfLocalisationDistanceMm: 4.0,
  weights: {
    evidenceWeight: 0.4,
    phenotypeWeight: 0.35,
    connectomeWeight: 0.25,
  },
};
