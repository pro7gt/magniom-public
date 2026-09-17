/**
 * @magniom/target-engine - Gate G14: Research Leakage Prevention
 * Conforms to MAGNIOM Target Engine & Ranking Algorithm Specification v2.1 (§40)
 *
 * Enforces hermetic isolation: exploratory features, dynamic functional connectivity,
 * and unvalidated research algorithms strictly fail closed in Clinical Mode.
 */

import type {
  GateEvaluation,
  CandidateDraft,
  ResolvedTargetEngineContextV2,
} from '@magniom/domain';

export function evaluateGateG14(
  candidate: CandidateDraft,
  context: ResolvedTargetEngineContextV2,
): GateEvaluation {
  const reasons: string[] = [];
  const isClinical = context.request.mode.toLowerCase() === 'clinical';

  if (isClinical) {
    // 1. Check if candidate proposed role is research hypothesis
    if (candidate.proposedRole === 'research_hypothesis') {
      reasons.push('TN-012:RESEARCH_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 2. Disambiguated Provenance Evaluation (MAGNIOM Revision 03 §4 & §8)
    const isGuidelineApprovedFixed =
      (candidate.targetDefinitionOrigin === 'guideline' ||
        candidate.targetDefinitionOrigin === 'trial') &&
      candidate.patientPersonalizationStatus === 'fixed' &&
      (candidate.clinicalApprovalStatus === 'approved' ||
        candidate.clinicalPromotionStatus === 'approved');

    if (isGuidelineApprovedFixed) {
      // Clinically permitted guideline/trial fixed baseline without falsely requiring patient measurements
      if (
        candidate.inputDataOrigin === 'synthetic' ||
        candidate.generatorLimitations?.includes('SYNTHETIC_DEMONSTRATOR') ||
        candidate.generatorLimitations?.includes('SYNTHETIC_GENERATOR_FAIL_CLOSED')
      ) {
        reasons.push('TN-014:SYNTHETIC_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
      }
    } else {
      // Personalized / derived / other candidates:
      if (
        candidate.targetDefinitionOrigin === 'synthetic' ||
        candidate.inputDataOrigin === 'synthetic'
      ) {
        reasons.push('TN-014:SYNTHETIC_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
      }

      // Check data origin: Fail-closed allowlist in Clinical Mode
      // Missing, undefined, synthetic, normative, or unknown origins are strictly prohibited.
      if (!candidate.dataOrigin || candidate.dataOrigin === 'unknown') {
        reasons.push('TN-014:UNKNOWN_DATA_ORIGIN_PROHIBITED_IN_CLINICAL_MODE');
      } else if (
        candidate.dataOrigin === 'synthetic' ||
        candidate.generatorLimitations?.includes('SYNTHETIC_DEMONSTRATOR') ||
        candidate.generatorLimitations?.includes('SYNTHETIC_GENERATOR_FAIL_CLOSED')
      ) {
        reasons.push('TN-014:SYNTHETIC_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
      } else if (candidate.dataOrigin === 'normative') {
        reasons.push('TN-012:NORMATIVE_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
      } else if (
        candidate.dataOrigin !== 'patient_measured' &&
        candidate.dataOrigin !== 'derived_from_patient_measured'
      ) {
        reasons.push('TN-014:UNKNOWN_DATA_ORIGIN_PROHIBITED_IN_CLINICAL_MODE');
      }
    }

    // 3. Check scientific maturity: Fail-closed allowlist in Clinical Mode
    // Missing, undefined, prototype, research, or validation maturity cannot produce clinical candidate.
    const effectiveMaturity = candidate.scientificMaturity;
    if (!effectiveMaturity) {
      reasons.push('TN-012:UNPROMOTED_MATURITY_PROHIBITED_IN_CLINICAL_MODE');
    } else if (
      effectiveMaturity === 'prototype' ||
      effectiveMaturity === 'research' ||
      effectiveMaturity === 'validation'
    ) {
      reasons.push('TN-012:UNPROMOTED_MATURITY_PROHIBITED_IN_CLINICAL_MODE');
    } else if (
      effectiveMaturity !== 'clinical_candidate' &&
      effectiveMaturity !== 'clinical_approved'
    ) {
      reasons.push('TN-012:UNPROMOTED_MATURITY_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 4. Check clinical promotion status: Fail-closed allowlist in Clinical Mode
    // Missing, undefined, blocked, under review, or provisional status cannot produce clinical candidate.
    const effectivePromotion =
      candidate.clinicalApprovalStatus ?? candidate.clinicalPromotionStatus;
    if (!effectivePromotion) {
      reasons.push('TN-012:CLINICAL_PROMOTION_BLOCKED');
    } else if (
      effectivePromotion === 'blocked' ||
      effectivePromotion === 'candidate_under_review' ||
      effectivePromotion === 'provisional_validation'
    ) {
      reasons.push('TN-012:CLINICAL_PROMOTION_BLOCKED');
    } else if (effectivePromotion !== 'approved') {
      reasons.push('TN-012:CLINICAL_PROMOTION_BLOCKED');
    }

    // 5. Check Measurement Bundle & Relied-On Measurement Provenance (Finding 8)
    const bundleOrigin = context.measurementBundle?.dataOrigin;
    if (bundleOrigin === 'synthetic') {
      reasons.push('TN-014:SYNTHETIC_MEASUREMENT_LEAKAGE_IN_CLINICAL_MODE');
    } else if (!bundleOrigin || bundleOrigin === 'unknown') {
      if (!isGuidelineApprovedFixed && candidate.dataOrigin === 'patient_measured') {
        reasons.push('TN-014:UNKNOWN_MEASUREMENT_ORIGIN_IN_CLINICAL_MODE');
      }
    } else if (bundleOrigin === 'normative') {
      if (!isGuidelineApprovedFixed && candidate.dataOrigin === 'patient_measured') {
        reasons.push('TN-012:NORMATIVE_MEASUREMENT_PROHIBITED_IN_CLINICAL_MODE');
      }
    } else if (bundleOrigin === 'mixed') {
      reasons.push('TN-014:MIXED_MEASUREMENT_ORIGIN_PROHIBITED_IN_CLINICAL_MODE');
    }

    const reliedMeasurementIds = candidate.reliedOnMeasurementIds ?? [];
    if (reliedMeasurementIds.length > 0) {
      const bundleMeasurements = context.measurementBundle?.measurements ?? [];
      const measurementMap = new Map(bundleMeasurements.map(m => [m.measurementId, m]));
      const lesionMap = new Map(context.lesionContexts?.map(l => [l.id, l]) ?? []);

      for (const mId of reliedMeasurementIds) {
        const m = measurementMap.get(mId);
        if (!m) {
          if (lesionMap.has(mId)) {
            continue;
          }
          reasons.push(`TN-014:UNRESOLVED_MEASUREMENT_ID:${mId}`);
          continue;
        }

        if (!m.dataOrigin || m.dataOrigin === 'unknown') {
          reasons.push('TN-014:UNKNOWN_MEASUREMENT_ORIGIN_IN_CLINICAL_MODE');
        } else if (m.dataOrigin === 'synthetic') {
          reasons.push('TN-014:SYNTHETIC_MEASUREMENT_LEAKAGE_IN_CLINICAL_MODE');
        } else if (m.dataOrigin === 'normative') {
          reasons.push('TN-012:NORMATIVE_MEASUREMENT_PROHIBITED_IN_CLINICAL_MODE');
        } else if (m.dataOrigin === 'mixed') {
          reasons.push('TN-014:MIXED_MEASUREMENT_ORIGIN_PROHIBITED_IN_CLINICAL_MODE');
        } else if (
          m.dataOrigin !== 'patient_measured' &&
          m.dataOrigin !== 'derived_from_patient_measured'
        ) {
          reasons.push('TN-014:UNKNOWN_MEASUREMENT_ORIGIN_IN_CLINICAL_MODE');
        }

        // Check verified lineage for derived_from_patient_measured
        if (m.dataOrigin === 'derived_from_patient_measured') {
          const mAny = m as unknown as Record<string, unknown>;
          const hasLineage = Boolean(
            mAny.rawAcquisitionId ||
            mAny.sourceAcquisitionId ||
            mAny.acquisitionId ||
            (Array.isArray((mAny.lineage as any)?.sourceMeasurementIds) &&
              (mAny.lineage as any).sourceMeasurementIds.length > 0) ||
            candidate.lineage?.lineageType,
          );
          if (!hasLineage) {
            reasons.push('TN-014:DERIVED_MEASUREMENT_WITHOUT_VERIFIED_LINEAGE');
          }
        }
      }
    } else {
      // If individually computed without relied-on measurements, fail closed
      if (
        !isGuidelineApprovedFixed &&
        candidate.patientPersonalizationStatus === 'individually_computed'
      ) {
        reasons.push('TN-014:INDIVIDUALLY_COMPUTED_TARGET_LACKS_MEASUREMENTS');
      }
    }

    // 6. Check research-only feature flags (dynamic FC, normative pathway models, unvalidated ML)
    if (candidate.generatorLimitations?.includes('DYNAMIC_FC_RESEARCH_ONLY')) {
      reasons.push('TN-012:DYNAMIC_FC_PROHIBITED_IN_CLINICAL_MODE');
    }

    if (
      candidate.generatorLimitations?.includes('NORMATIVE_PATHWAY_RESEARCH_ONLY') ||
      candidate.generatorTrace?.algorithmCode === 'MDD_NORMATIVE_PATHWAY_GENERATOR'
    ) {
      reasons.push('TN-012:NORMATIVE_PATHWAY_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 7. Check experimental unvalidated ML predictions
    if (candidate.generatorLimitations?.includes('UNVALIDATED_ML_MODEL')) {
      reasons.push('TN-012:UNVALIDATED_ML_PREDICTION_PROHIBITED_IN_CLINICAL_MODE');
    }
  }

  const pass = reasons.length === 0;

  return {
    gateCode: 'G14_RESEARCH_LEAKAGE_PREVENTION',
    applicability: 'applicable',
    result: pass ? 'pass' : 'fail',
    reasonCodes: reasons,
    policyRuleIds: ['RULE_G14_HERMETIC_RESEARCH_ISOLATION'],
    interpretation: pass
      ? 'Candidate passes hermetic research isolation; zero clinical leakage detected.'
      : `Research leakage prevention failure: ${reasons.join(', ')}`,
  };
}
