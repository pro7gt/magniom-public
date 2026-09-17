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
import { defaultMethodManifestRegistry } from '../../registry/method-manifest-registry.js';

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

    // 2. Absolute Synthetic Prohibition in Clinical Mode (MAGNIOM Revision 04 Finding 2)
    // Under NO circumstance may a synthetic candidate enter Clinical Mode, regardless of guideline flags.
    if (
      candidate.dataOrigin === 'synthetic' ||
      candidate.targetDefinitionOrigin === 'synthetic' ||
      candidate.inputDataOrigin === 'synthetic' ||
      candidate.generatorLimitations?.includes('SYNTHETIC_DEMONSTRATOR') ||
      candidate.generatorLimitations?.includes('SYNTHETIC_GENERATOR_FAIL_CLOSED')
    ) {
      reasons.push('TN-014:SYNTHETIC_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 3. Mandatory Provenance Axes in Clinical Mode (MAGNIOM Revision 04 Finding 2)
    // Clinical candidates must strictly supply all 4 provenance axes.
    if (!candidate.dataOrigin || candidate.dataOrigin === 'unknown') {
      reasons.push('TN-014:UNKNOWN_DATA_ORIGIN_PROHIBITED_IN_CLINICAL_MODE');
    }
    if (
      !candidate.targetDefinitionOrigin ||
      !candidate.inputDataOrigin ||
      !candidate.patientPersonalizationStatus
    ) {
      reasons.push('TN-014:INCOMPLETE_PROVENANCE_AXES_IN_CLINICAL_MODE');
    }

    // 4. Reject Contradictory Provenance Combinations
    if (candidate.dataOrigin === 'patient_measured' && candidate.inputDataOrigin === 'none') {
      reasons.push('TN-014:CONTRADICTORY_PROVENANCE_AXES');
    }
    if (
      candidate.patientPersonalizationStatus === 'individually_computed' &&
      candidate.inputDataOrigin === 'none'
    ) {
      reasons.push('TN-014:CONTRADICTORY_PROVENANCE_AXES');
    }
    if (
      candidate.patientPersonalizationStatus === 'fixed' &&
      candidate.inputDataOrigin === 'patient_measured'
    ) {
      reasons.push('TN-014:CONTRADICTORY_PROVENANCE_AXES');
    }

    // 5. Guideline and Clinical Approval Verification (Immutable Registry vs Self-Assertion)
    const isGuidelineClaimed =
      (candidate.targetDefinitionOrigin === 'guideline' ||
        candidate.targetDefinitionOrigin === 'trial') &&
      candidate.patientPersonalizationStatus === 'fixed' &&
      candidate.inputDataOrigin === 'none';

    // Verify against immutable permittedEvidencePaths registry in context
    const hasPermittedClinicalPath =
      Array.isArray(candidate.evidencePathIds) &&
      candidate.evidencePathIds.length > 0 &&
      candidate.evidencePathIds.every(pathId => {
        const p = context.permittedEvidencePaths.find(path => path.id === pathId);
        return p && p.pathStatus === 'clinical_permitted';
      });

    const isGuidelineApprovedFixed = isGuidelineClaimed && hasPermittedClinicalPath;

    if (isGuidelineClaimed && !hasPermittedClinicalPath) {
      reasons.push('TN-012:UNREGISTERED_GUIDELINE_APPROVAL_IN_CLINICAL_MODE');
    }

    // Check data origin: normative is ONLY permitted for verified guideline fixed baselines
    if (candidate.dataOrigin === 'normative') {
      if (!isGuidelineApprovedFixed) {
        reasons.push('TN-012:NORMATIVE_CANDIDATE_PROHIBITED_IN_CLINICAL_MODE');
      }
    } else if (
      candidate.dataOrigin &&
      candidate.dataOrigin !== 'patient_measured' &&
      candidate.dataOrigin !== 'derived_from_patient_measured' &&
      candidate.dataOrigin !== 'synthetic' // already reported if synthetic
    ) {
      reasons.push('TN-014:UNKNOWN_DATA_ORIGIN_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 6. Check scientific maturity and clinical promotion: Fail-closed allowlist in Clinical Mode
    // For personalized or derived clinical candidates, resolve maturity, promotion status, and mode eligibility
    // strictly from the versioned method manifest registry, ignoring candidate-supplied approval flags (MAGNIOM Rev 05 Finding 4)
    let effectiveMaturity = candidate.scientificMaturity;
    let effectivePromotion = candidate.clinicalApprovalStatus ?? candidate.clinicalPromotionStatus;

    const isPersonalizedOrDerived =
      !isGuidelineApprovedFixed &&
      (candidate.patientPersonalizationStatus === 'individually_computed' ||
        candidate.dataOrigin === 'patient_measured' ||
        candidate.dataOrigin === 'derived_from_patient_measured');

    if (isPersonalizedOrDerived) {
      const methodId = candidate.targetingMethodId ?? candidate.generatorTrace?.algorithmCode;
      if (!methodId) {
        reasons.push('TN-012:MISSING_TARGETING_METHOD_ID_IN_CLINICAL_MODE');
        effectiveMaturity = undefined;
        effectivePromotion = undefined;
      } else {
        const manifest = defaultMethodManifestRegistry.getManifest(methodId);
        if (!manifest) {
          reasons.push('TN-012:UNREGISTERED_TARGETING_METHOD_IN_CLINICAL_MODE');
          effectiveMaturity = undefined;
          effectivePromotion = undefined;
        } else {
          // Authority is derived strictly from immutable manifest
          effectiveMaturity = manifest.scientificMaturity;
          effectivePromotion = manifest.clinicalPromotionStatus;

          if (!manifest.permittedModes.includes('clinical')) {
            reasons.push('TN-012:METHOD_MODE_NOT_PERMITTED_IN_CLINICAL');
          }
        }
      }

      // Require a non-empty approvalReference for personalized clinical candidates
      if (!candidate.approvalReference || candidate.approvalReference.trim().length === 0) {
        reasons.push('TN-012:MISSING_APPROVAL_REFERENCE_IN_CLINICAL_MODE');
      }
    }

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

    // 7. Check clinical promotion status: Fail-closed allowlist in Clinical Mode
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

    // 8. Check Measurement Bundle & Relied-On Measurement Provenance
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
          const lesion = lesionMap.get(mId);
          if (lesion) {
            // Validate lesion context quality
            if (lesion.registrationQuality === 'fail' || lesion.segmentationQuality === 'fail') {
              reasons.push(`TN-014:LESION_CONTEXT_QUALITY_FAILED:${mId}`);
            }
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
          const lineageSourceIds = (mAny.lineage as { sourceMeasurementIds?: string[] } | undefined)
            ?.sourceMeasurementIds;
          const hasLineage = Boolean(
            mAny.rawAcquisitionId ||
            mAny.sourceAcquisitionId ||
            mAny.acquisitionId ||
            (Array.isArray(lineageSourceIds) && lineageSourceIds.length > 0),
          );
          if (!hasLineage) {
            reasons.push('TN-014:DERIVED_MEASUREMENT_WITHOUT_VERIFIED_LINEAGE');
          }
        }
      }
    } else {
      // If personalized or patient_measured without relied-on measurements, fail closed
      if (!isGuidelineApprovedFixed) {
        reasons.push('TN-014:INDIVIDUALLY_COMPUTED_TARGET_LACKS_MEASUREMENTS');
      }
    }

    // 9. Check research-only feature flags (dynamic FC, normative pathway models, unvalidated ML)
    if (candidate.generatorLimitations?.includes('DYNAMIC_FC_RESEARCH_ONLY')) {
      reasons.push('TN-012:DYNAMIC_FC_PROHIBITED_IN_CLINICAL_MODE');
    }

    if (
      candidate.generatorLimitations?.includes('NORMATIVE_PATHWAY_RESEARCH_ONLY') ||
      candidate.generatorTrace?.algorithmCode === 'MDD_NORMATIVE_PATHWAY_GENERATOR'
    ) {
      reasons.push('TN-012:NORMATIVE_PATHWAY_PROHIBITED_IN_CLINICAL_MODE');
    }

    // 10. Check experimental unvalidated ML predictions
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
