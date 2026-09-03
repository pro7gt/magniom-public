/**
 * @magniom/test-fixtures
 * Synthetic Golden Cases G01–G05 conforming to MAGNIOM-Synthetic Vertical Slice Specification v1.0.
 * 100% synthetic — zero protected health information (PHI).
 */

export * from './g01-evidence-only.js';
export * from './g02-convergent.js';
export * from './g03-low-gain.js';
export * from './g04-unreliable.js';
export * from './g05-anxiosomatic.js';
export * from './g08-research-ceiling.js';
export * from './ux-golden-cases.js';
export * from './ux-golden-cases-v2.js';
export * from './structural-fixtures.js';
export * from './golden-cases-suite.js';
export * from './imaging-validation-suite.js';
export * from './synthetic-vertical-slice/index.js';

import { GOLDEN_CASE_01 } from './g01-evidence-only.js';
import { GOLDEN_CASE_02 } from './g02-convergent.js';
import { GOLDEN_CASE_03 } from './g03-low-gain.js';
import { GOLDEN_CASE_04 } from './g04-unreliable.js';
import { GOLDEN_CASE_05 } from './g05-anxiosomatic.js';
import { GOLDEN_CASE_08 } from './g08-research-ceiling.js';
import { ALL_UX_GOLDEN_CASES } from './ux-golden-cases.js';
import { ALL_UX_GOLDEN_CASES_V2 } from './ux-golden-cases-v2.js';

export const ALL_GOLDEN_CASES = [
  GOLDEN_CASE_01,
  GOLDEN_CASE_02,
  GOLDEN_CASE_03,
  GOLDEN_CASE_04,
  GOLDEN_CASE_05,
  GOLDEN_CASE_08,
] as const;

export { ALL_UX_GOLDEN_CASES, ALL_UX_GOLDEN_CASES_V2 };
