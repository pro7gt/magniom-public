/**
 * @magniom/test-fixtures - Phase 5 Synthetic Vertical Slice Golden Suites Barrel
 * Aggregates all 72 canonical Golden Cases across all 8 clinical indications
 * conforming to MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0 (§31-40).
 */

export * from './mdd-fixtures.js';
export * from './ocd-fixtures.js';
export * from './pain-fixtures.js';
export * from './stroke-motor-fixtures.js';
export * from './stroke-aphasia-fixtures.js';
export * from './tbi-fixtures.js';
export * from './ptsd-fixtures.js';
export * from './tinnitus-fixtures.js';

import { MDD_GOLDEN_SUITE, type SyntheticGoldenCaseDefinition } from './mdd-fixtures.js';
import { OCD_GOLDEN_SUITE } from './ocd-fixtures.js';
import { PAIN_GOLDEN_SUITE } from './pain-fixtures.js';
import { STROKE_MOTOR_GOLDEN_SUITE } from './stroke-motor-fixtures.js';
import { STROKE_APHASIA_GOLDEN_SUITE } from './stroke-aphasia-fixtures.js';
import { TBI_GOLDEN_SUITE } from './tbi-fixtures.js';
import { PTSD_GOLDEN_SUITE } from './ptsd-fixtures.js';
import { TINNITUS_GOLDEN_SUITE } from './tinnitus-fixtures.js';

export const ALL_SYNTHETIC_GOLDEN_CASES: readonly SyntheticGoldenCaseDefinition[] = [
  ...MDD_GOLDEN_SUITE,
  ...OCD_GOLDEN_SUITE,
  ...PAIN_GOLDEN_SUITE,
  ...STROKE_MOTOR_GOLDEN_SUITE,
  ...STROKE_APHASIA_GOLDEN_SUITE,
  ...TBI_GOLDEN_SUITE,
  ...PTSD_GOLDEN_SUITE,
  ...TINNITUS_GOLDEN_SUITE,
];

export const GOLDEN_SUITE_BY_INDICATION: Readonly<
  Record<string, readonly SyntheticGoldenCaseDefinition[]>
> = {
  MDD: MDD_GOLDEN_SUITE,
  OCD: OCD_GOLDEN_SUITE,
  NEUROPATHIC_PAIN: PAIN_GOLDEN_SUITE,
  STROKE_MOTOR: STROKE_MOTOR_GOLDEN_SUITE,
  STROKE_APHASIA: STROKE_APHASIA_GOLDEN_SUITE,
  TBI: TBI_GOLDEN_SUITE,
  PTSD: PTSD_GOLDEN_SUITE,
  TINNITUS: TINNITUS_GOLDEN_SUITE,
};
