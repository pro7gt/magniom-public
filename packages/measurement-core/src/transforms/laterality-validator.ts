/**
 * @magniom/measurement-core - Laterality Invariant Validator
 * Conforms to MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0 (§95-97, §171)
 * Exit Criterion 7: Strict laterality invariant enforcement. No silent corrections.
 */

import type { Coordinate3D } from '@magniom/domain';
import type { LateralityValidationResult } from '../types.js';

export class LateralityValidator {
  /**
   * Validates RAS coordinate hemisphere assignment.
   * In RAS space: X > 0 is Right hemisphere, X < 0 is Left hemisphere, X = 0 is Midline.
   */
  public static validateRasHemisphere(
    coordinate: Coordinate3D,
    declaredHemisphere: 'left' | 'right' | 'bilateral' | 'midline',
  ): LateralityValidationResult {
    if (declaredHemisphere === 'bilateral') {
      return {
        valid: true,
        declaredLaterality: declaredHemisphere,
        conflictDetected: false,
        message: 'Bilateral declared laterality allows coordinates on either hemisphere.',
      };
    }

    if (declaredHemisphere === 'midline') {
      const isMidline = Math.abs(coordinate.x) <= 3.0;
      return {
        valid: isMidline,
        declaredLaterality: declaredHemisphere,
        conflictDetected: !isMidline,
        message: isMidline
          ? 'Coordinate is within midline boundary (|X| <= 3.0mm).'
          : `Midline declared but coordinate X=${coordinate.x} deviates beyond midline boundary.`,
      };
    }

    const actualHemisphere = coordinate.x > 0 ? 'right' : coordinate.x < 0 ? 'left' : 'midline';
    const matches = actualHemisphere === declaredHemisphere;

    return {
      valid: matches,
      declaredLaterality: declaredHemisphere,
      expectedLaterality: actualHemisphere,
      conflictDetected: !matches,
      message: matches
        ? `Coordinate X=${coordinate.x} correctly corresponds to declared ${declaredHemisphere} hemisphere.`
        : `CRITICAL LATERALITY INVARIANT FAILURE: Declared ${declaredHemisphere} hemisphere but coordinate X=${coordinate.x} is in ${actualHemisphere} hemisphere. Silent correction prohibited.`,
    };
  }

  /**
   * Validates contralateral targeting invariant for neuropathic pain somatotopic M1 target.
   * If right-hand pain is reported, the target must be in the LEFT motor cortex.
   * If left-hand pain is reported, the target must be in the RIGHT motor cortex.
   */
  public static validatePainContralateralM1(
    affectedSide: 'left' | 'right',
    targetCoordinate: Coordinate3D,
  ): LateralityValidationResult {
    const expectedTargetHemisphere = affectedSide === 'right' ? 'left' : 'right';
    const targetHemisphere = targetCoordinate.x > 0 ? 'right' : 'left';

    const matches = targetHemisphere === expectedTargetHemisphere;

    return {
      valid: matches,
      declaredLaterality: targetHemisphere,
      expectedLaterality: expectedTargetHemisphere,
      conflictDetected: !matches,
      message: matches
        ? `Somatotopic M1 target hemisphere (${targetHemisphere}) is appropriately contralateral to reported ${affectedSide} limb pain.`
        : `CRITICAL LATERALITY CONFLICT: Reported pain is ${affectedSide}, requiring contralateral (${expectedTargetHemisphere}) M1 target, but coordinate X=${targetCoordinate.x} is ipsilateral (${targetHemisphere}). Hard rejection enforced.`,
    };
  }

  /**
   * Validates stroke lesion laterality against target hypothesis.
   */
  public static validateStrokeLaterality(
    lesionLaterality: 'left' | 'right',
    hypothesisStrategy: 'contralesional_m1' | 'ipsilesional_m1',
    targetCoordinate: Coordinate3D,
  ): LateralityValidationResult {
    const targetHemisphere = targetCoordinate.x > 0 ? 'right' : 'left';
    const expectedHemisphere =
      hypothesisStrategy === 'contralesional_m1'
        ? lesionLaterality === 'left'
          ? 'right'
          : 'left'
        : lesionLaterality;

    const matches = targetHemisphere === expectedHemisphere;

    return {
      valid: matches,
      declaredLaterality: targetHemisphere,
      expectedLaterality: expectedHemisphere,
      conflictDetected: !matches,
      message: matches
        ? `Target hemisphere (${targetHemisphere}) matches ${hypothesisStrategy} strategy for ${lesionLaterality} stroke lesion.`
        : `LATERALITY CONFLICT: Lesion is ${lesionLaterality}, expected ${expectedHemisphere} target for ${hypothesisStrategy}, but found X=${targetCoordinate.x} (${targetHemisphere}).`,
    };
  }

  /**
   * Validates tinnitus perceived laterality against stimulation target.
   */
  public static validateTinnitusLaterality(
    perceivedLaterality:
      | 'left'
      | 'right'
      | 'bilateral'
      | 'central'
      | 'variable'
      | 'unilateral_left'
      | 'unilateral_right',
    targetHemisphere: 'left' | 'right',
  ): LateralityValidationResult {
    if (
      perceivedLaterality === 'bilateral' ||
      perceivedLaterality === 'central' ||
      perceivedLaterality === 'variable'
    ) {
      return {
        valid: true,
        declaredLaterality: targetHemisphere,
        conflictDetected: false,
        message: `Bilateral/central tinnitus allows either hemisphere targeting (${targetHemisphere} chosen).`,
      };
    }

    const normalizedSide =
      perceivedLaterality === 'unilateral_left'
        ? 'left'
        : perceivedLaterality === 'unilateral_right'
          ? 'right'
          : perceivedLaterality;

    const matches = normalizedSide === targetHemisphere;
    return {
      valid: matches,
      declaredLaterality: targetHemisphere,
      expectedLaterality: normalizedSide,
      conflictDetected: !matches,
      message: matches
        ? `Target hemisphere (${targetHemisphere}) corresponds to perceived ${perceivedLaterality} tinnitus.`
        : `LATERALITY CONFLICT: Tinnitus perceived on ${perceivedLaterality} side, but target is ${targetHemisphere} hemisphere.`,
    };
  }

  /**
   * Validates aphasia language dominance hemisphere consistency.
   */
  public static validateAphasiaHemisphere(
    dominantHemisphere: 'left' | 'right' | 'left_dominant' | 'right_dominant',
    targetHemisphere: 'left' | 'right',
    strategy: 'perilesional_dominant' | 'contralesional_compensatory' = 'perilesional_dominant',
  ): LateralityValidationResult {
    const normalizedDominance =
      dominantHemisphere === 'left_dominant'
        ? 'left'
        : dominantHemisphere === 'right_dominant'
          ? 'right'
          : dominantHemisphere;

    const expectedHemisphere =
      strategy === 'perilesional_dominant'
        ? normalizedDominance
        : normalizedDominance === 'left'
          ? 'right'
          : 'left';

    const matches = targetHemisphere === expectedHemisphere;
    return {
      valid: matches,
      declaredLaterality: targetHemisphere,
      expectedLaterality: expectedHemisphere,
      conflictDetected: !matches,
      message: matches
        ? `Target hemisphere (${targetHemisphere}) matches ${strategy} strategy.`
        : `LATERALITY CONFLICT: Dominant hemisphere is ${dominantHemisphere}, expected ${expectedHemisphere} for ${strategy}, but found ${targetHemisphere}.`,
    };
  }
}
