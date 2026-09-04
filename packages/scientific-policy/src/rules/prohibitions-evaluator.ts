/**
 * MAGNIOM Prohibited Scientific Configurations & Invariant Evaluator
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§103-109, §153, §158)
 */

import type { MagniomMode } from '@magniom/domain';
import { formatClinicianErrorMessage } from '../errors/failure-codes.js';

export interface ScientificProhibitionCheckContext {
  readonly mode: MagniomMode;
  readonly indicationModuleCode: string;
  readonly indicationModuleMaturity?: string;
  readonly evidencePathId?: string;
  readonly evidenceClassification?: string;
  readonly candidateTargetFamily?: string;
  readonly targetGeometryType?: string;
  readonly measurementCapabilitiesUsed?: readonly string[];
  readonly researchComponentsReferenced?: readonly string[];
  readonly isMultimodalFusionAttempted?: boolean;
  readonly isMultimodalModelApproved?: boolean;
  readonly isCrossIndicationBorrowAttempted?: boolean;
  readonly borrowingSourceIndication?: string;
  readonly isAutoLearningActive?: boolean;
  readonly isAdminOverrideAttempted?: boolean;
}

export interface ProhibitionEvaluationResult {
  readonly passed: boolean;
  readonly reasonCode?:
    | 'RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION'
    | 'MULTIMODAL_FUSION_NOT_PERMITTED'
    | 'EVIDENCE_CLASSIFICATION_UNASSIGNED'
    | 'INDICATION_MODULE_NOT_CLINICALLY_PERMITTED'
    | 'POLICY_PROHIBITED_CONFIGURATION';
  readonly message?: string;
  readonly violations: readonly string[];
}

export function evaluateScientificProhibitions(
  context: ScientificProhibitionCheckContext,
): ProhibitionEvaluationResult {
  const violations: string[] = [];
  let primaryReasonCode: ProhibitionEvaluationResult['reasonCode'];

  // 1. Research component in Clinical configuration (§103, §153)
  if (
    context.mode === 'clinical' &&
    context.researchComponentsReferenced &&
    context.researchComponentsReferenced.length > 0
  ) {
    const comp = context.researchComponentsReferenced[0];
    primaryReasonCode = 'RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION';
    violations.push(
      formatClinicianErrorMessage('RESEARCH_COMPONENT_IN_CLINICAL_CONFIGURATION', {
        componentName: comp,
      }),
    );
  }

  // 2. Multimodal fusion without approved model (§106, §158)
  if (context.isMultimodalFusionAttempted && !context.isMultimodalModelApproved) {
    if (!primaryReasonCode) primaryReasonCode = 'MULTIMODAL_FUSION_NOT_PERMITTED';
    violations.push(formatClinicianErrorMessage('MULTIMODAL_FUSION_NOT_PERMITTED'));
  }

  // 3. Unassigned evidence in Clinical mode (§32, §103, §154)
  if (context.mode === 'clinical' && context.evidenceClassification === 'unassigned') {
    if (!primaryReasonCode) primaryReasonCode = 'EVIDENCE_CLASSIFICATION_UNASSIGNED';
    violations.push(
      formatClinicianErrorMessage('EVIDENCE_CLASSIFICATION_UNASSIGNED', {
        claimId: context.evidencePathId ?? 'unknown',
      }),
    );
  }

  // 4. Research-only module in Clinical mode (§103, §152)
  if (
    context.mode === 'clinical' &&
    (context.indicationModuleMaturity === 'research_only' ||
      context.indicationModuleMaturity === 'research')
  ) {
    if (!primaryReasonCode) primaryReasonCode = 'INDICATION_MODULE_NOT_CLINICALLY_PERMITTED';
    violations.push(
      formatClinicianErrorMessage('INDICATION_MODULE_NOT_CLINICALLY_PERMITTED', {
        moduleCode: context.indicationModuleCode,
        maturity: context.indicationModuleMaturity,
      }),
    );
  }

  // 5. Cross-indication borrowing without explicit compatibility (§104, §150)
  if (context.isCrossIndicationBorrowAttempted) {
    if (!primaryReasonCode) primaryReasonCode = 'POLICY_PROHIBITED_CONFIGURATION';
    violations.push(
      `Cross-indication borrowing violation (§104, §150): Target generator attempted to use evidence/rules from ${context.borrowingSourceIndication ?? 'another indication'} for ${context.indicationModuleCode}.`,
    );
  }

  // 6. Prohibited auto-learning in Clinical mode (§108)
  if (context.mode === 'clinical' && context.isAutoLearningActive) {
    if (!primaryReasonCode) primaryReasonCode = 'POLICY_PROHIBITED_CONFIGURATION';
    violations.push(
      'Online/auto-learning weight adjustment is strictly prohibited in Clinical Mode (§108). All weights must be frozen in policy release.',
    );
  }

  // 7. Prohibited administrator overrides of scientific thresholds (§109)
  if (context.isAdminOverrideAttempted) {
    if (!primaryReasonCode) primaryReasonCode = 'POLICY_PROHIBITED_CONFIGURATION';
    violations.push(
      'Administrative override of scientific thresholds or capability permissions is strictly prohibited (§109). Changes require a formal ScientificPolicyRelease.',
    );
  }

  if (violations.length > 0) {
    return {
      passed: false,
      reasonCode: primaryReasonCode ?? 'POLICY_PROHIBITED_CONFIGURATION',
      message: violations.join('; '),
      violations,
    };
  }

  return {
    passed: true,
    violations: [],
  };
}
