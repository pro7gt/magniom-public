/**
 * Gate 5 — Mode Compatibility Gate
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0, Section 19.
 * Validates mode compatibility against scientific policy releases.
 */

import type { MagniomMode } from '@magniom/domain';
import type { ScientificPolicyRelease } from '@magniom/scientific-policy';

export interface ModeGateResult {
  readonly compatible: boolean;
  readonly reason?: string;
}

export function evaluateModeGate(
  mode: MagniomMode,
  policy: ScientificPolicyRelease
): ModeGateResult {
  if (!policy.modeScope.includes(mode)) {
    return {
      compatible: false,
      reason: `Execution mode '${mode}' is not authorized under Scientific Policy release '${policy.code}'.`,
    };
  }

  return { compatible: true };
}
