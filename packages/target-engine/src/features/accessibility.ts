/**
 * Anatomical Accessibility Feature Calculator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 52-53.
 */

import type { MniCoordinate, TargetAccessibilityProfile } from '@magniom/domain';

export function calculateAccessibilityScore(
  mniCoordinate: MniCoordinate,
  profile?: TargetAccessibilityProfile
): number {
  if (profile) {
    if (!profile.accessibleByStandardCoil) {
      return 0.2;
    }
    if (profile.scalpToCortexDistanceMm) {
      // Scalp-to-cortex distance penalty model
      if (profile.scalpToCortexDistanceMm <= 15) return 1.0;
      if (profile.scalpToCortexDistanceMm <= 25) return 0.9;
      if (profile.scalpToCortexDistanceMm <= 35) return 0.7;
      return 0.4;
    }
  }

  // Fallback based on standard cortical depth for MNI coordinates
  const depthEstimate = Math.sqrt(
    Math.pow(Math.abs(mniCoordinate.x) - 45, 2) +
    Math.pow(mniCoordinate.y - 35, 2) +
    Math.pow(mniCoordinate.z - 30, 2)
  );

  if (depthEstimate <= 20) return 0.95;
  return 0.85;
}
