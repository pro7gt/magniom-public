/**
 * Gate 4 — Anatomical Accessibility Gate
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 18 & Section 52-53.
 * Evaluates whether target candidate is anatomically reachable by standard TMS coils.
 */

import type { MniCoordinate, TargetAccessibilityProfile } from '@magniom/domain';

export interface AccessibilityGateResult {
  readonly accessible: boolean;
  readonly warning?: string;
  readonly lateralityViolation?: boolean;
}

export function evaluateAccessibilityGate(
  mniCoordinate: MniCoordinate,
  profile?: TargetAccessibilityProfile,
  targetFamilyId?: string,
  accessibilityRating?: 'good' | 'acceptable' | 'difficult' | 'inaccessible' | string
): AccessibilityGateResult {
  if (profile && !profile.accessibleByStandardCoil) {
    return {
      accessible: false,
      warning: profile.warning ?? 'Target exceeds maximum effective depth of standard TMS coil.',
    };
  }

  if (accessibilityRating === 'inaccessible') {
    return {
      accessible: false,
      warning: 'Target candidate fails stimulability and is anatomically inaccessible.',
    };
  }

  // Sanity checks on MNI coordinate ranges for accessible cerebral cortex
  const { x, y, z } = mniCoordinate;
  const isWithinCorticalEnvelope = Math.abs(x) <= 75 && y >= -105 && y <= 75 && z >= -45 && z <= 85;

  if (!isWithinCorticalEnvelope) {
    return {
      accessible: false,
      warning: `MNI coordinate [${x}, ${y}, ${z}] is outside valid cortical stimulation envelope.`,
    };
  }

  // Laterality check (MAG-IMG-023 / Section 175): Left DLPFC families require x < 0
  if (targetFamilyId && (
    targetFamilyId.includes('LDLPFC') ||
    targetFamilyId.includes('LEFT') ||
    targetFamilyId === 'TF-MDD-CONVERGENT-LDLPFC-001' ||
    targetFamilyId === 'TF-MDD-SGACC-LDLPFC-001' ||
    targetFamilyId === 'TF-MDD-LDLPFC-EST-001' ||
    targetFamilyId === 'TF-MDD-DYSPHORIC-001'
  )) {
    if (x >= 0) {
      return {
        accessible: false,
        warning: `Laterality invariant violation: Left hemisphere target family ${targetFamilyId} received right-hemisphere coordinate x=${x}.`,
        lateralityViolation: true,
      };
    }
  }

  return { accessible: true };
}
