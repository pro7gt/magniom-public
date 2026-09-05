/**
 * @magniom/presentation
 * Canonical v2 Shell Adapters & Authority Resolvers.
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§9–25, 58–87, 186–187, 217–220, 235–237).
 *
 * Rules:
 * - Adapters are deterministic, side-effect free functions.
 * - Presentation logic strictly transforms canonical domain objects into typed view models.
 * - Contradictory states fail closed.
 */

import type {
  EnvironmentMode,
  ModeViewModel,
  ModuleAuthorityViewModel,
  ClinicalActionCapabilities,
  CaseStalenessReason,
  CurrentnessViewModel,
  MeasurementSummaryViewModel,
  WorkflowViewModel,
  WorkflowStepViewModel,
  WorkflowSubStepViewModel,
  WorkflowSemanticState,
  CaseShellViewModel,
  IndicationContextViewModel,
  IndicationOptionViewModel,
  CaseIdentityViewModel,
  TargetSlateStatusViewModel,
  DecisionStatusViewModel,
  ShellSafetyState,
} from './v2-shell-view-models.js';
import { getModuleUiDescriptor } from './module-ui-descriptors.js';
import type { ModuleQualificationLevel, TargetGeometryType } from '@magniom/domain';

// ==========================================
// 1. Mode View Model Factory (§20–23, §25)
// ==========================================

export function createModeViewModel(
  mode: EnvironmentMode = 'CLINICAL',
  failClosed = false,
  failClosedReason?: string | undefined,
): ModeViewModel {
  if (failClosed) {
    return {
      mode,
      label: 'FAIL CLOSED — SAFETY STOP',
      badgeClass: 'badge-danger mode-badge-failclosed',
      isClinical: false,
      isValidation: false,
      isResearch: false,
      failClosed: true,
      failClosedReason:
        failClosedReason || 'Contradictory state detected; clinical targeting locked.',
      safetyNotice: 'Contradictory scientific configuration. Clinical targeting actions disabled.',
    };
  }

  switch (mode) {
    case 'RESEARCH':
      return {
        mode: 'RESEARCH',
        label: 'RESEARCH MODE',
        badgeClass: 'badge-tierexp mode-badge-research',
        isClinical: false,
        isValidation: false,
        isResearch: true,
        failClosed: false,
        safetyNotice: 'RESEARCH PROTOTYPE — NOT FOR CLINICAL TARGET DECISIONS',
      };
    case 'VALIDATION':
      return {
        mode: 'VALIDATION',
        label: 'VALIDATION MODE',
        badgeClass: 'badge-tier2 mode-badge-validation',
        isClinical: false,
        isValidation: true,
        isResearch: false,
        failClosed: false,
        safetyNotice: 'VALIDATION BUILD — CONTROLLED STUDY ENVIRONMENT',
      };
    case 'CLINICAL':
    default:
      return {
        mode: 'CLINICAL',
        label: 'CLINICAL MODE',
        badgeClass: 'badge-tier1 mode-badge-clinical',
        isClinical: true,
        isValidation: false,
        isResearch: false,
        failClosed: false,
        safetyNotice: undefined,
      };
  }
}

// ==========================================
// 2. Effective Module Authority Resolver (§217–220)
// ==========================================

export interface AuthorityResolverInput {
  readonly moduleReleaseId: string;
  readonly moduleCode: string;
  readonly moduleVersion: string;
  readonly humanReadableName: string;
  readonly qualificationLevel: ModuleQualificationLevel;
  readonly permittedModes: readonly string[];
  readonly activeEnvironmentMode: EnvironmentMode;
  readonly userHasSigningAuthority: boolean;
  readonly isBlindedValidation?: boolean | undefined;
}

export function resolveEffectiveModuleAuthority(input: AuthorityResolverInput): {
  readonly authority: ModuleAuthorityViewModel;
  readonly isContradictory: boolean;
  readonly contradictionReason?: string | undefined;
} {
  const isPermittedInMode = input.permittedModes.includes(input.activeEnvironmentMode);
  const isQClinical = input.qualificationLevel === 'Q7' || input.qualificationLevel === 'Q8';
  const isResearchOnlyModule = !input.permittedModes.includes('CLINICAL');

  // Check for contradiction (§25): workspace is CLINICAL but module is Research-only or below Q7
  const isContradictory =
    input.activeEnvironmentMode === 'CLINICAL' && (!isPermittedInMode || !isQClinical);

  const contradictionReason = isContradictory
    ? `Module ${input.moduleCode} (${input.qualificationLevel}) is not authorized for Clinical mode.`
    : undefined;

  const isClinicalAuthorised =
    input.activeEnvironmentMode === 'CLINICAL' &&
    isPermittedInMode &&
    isQClinical &&
    !isContradictory;

  const isValidationOnly =
    input.activeEnvironmentMode === 'VALIDATION' ||
    (input.permittedModes.includes('VALIDATION') && !input.permittedModes.includes('CLINICAL'));

  const isResearchOnly = input.activeEnvironmentMode === 'RESEARCH' || isResearchOnlyModule;

  const isBlinded = Boolean(input.isBlindedValidation);

  // Derive granular clinical action capabilities (§219, §220)
  const capabilities: ClinicalActionCapabilities = {
    may_generate_target_slate: !isContradictory,
    may_review_target_slate: !isBlinded && !isContradictory,
    may_create_clinician_decision: isClinicalAuthorised && !isContradictory,
    may_sign_target_decision:
      isClinicalAuthorised && input.userHasSigningAuthority && !isContradictory,
    may_export_navigation_target:
      isClinicalAuthorised && input.userHasSigningAuthority && !isContradictory,
  };

  let permissionLabel = 'Clinical Module';
  if (isContradictory) {
    permissionLabel = 'Authority Conflict';
  } else if (isResearchOnly) {
    permissionLabel = 'Research Only';
  } else if (isValidationOnly) {
    permissionLabel = 'Validation Study';
  }

  const authority: ModuleAuthorityViewModel = {
    moduleReleaseId: input.moduleReleaseId,
    moduleCode: input.moduleCode,
    moduleVersion: input.moduleVersion,
    humanReadableName: input.humanReadableName,
    qualificationLevel: input.qualificationLevel,
    permissionLabel,
    isClinicalAuthorised,
    isValidationOnly,
    isResearchOnly,
    capabilities,
    silentProspectiveBlinded: isBlinded,
  };

  return { authority, isContradictory, contradictionReason };
}

// ==========================================
// 3. 3-Tier Staleness Evaluator (§76–80)
// ==========================================

export interface StalenessInput {
  readonly isCaseContextUpdatedAfterSlate?: boolean | undefined;
  readonly isLesionReviewUpdatedAfterSlate?: boolean | undefined;
  readonly isClinicalObjectiveChangedAfterSlate?: boolean | undefined;
  readonly isDiseaseStageChangedAfterSlate?: boolean | undefined;
  readonly isMeasurementReplaced?: boolean | undefined;
  readonly isScientificPolicyInvalidated?: boolean | undefined;
  readonly isModuleSuperseded?: boolean | undefined;
  readonly isNewOptionalResearchMeasurementAvailable?: boolean | undefined;
  readonly isNewerEvidenceLibraryAvailable?: boolean | undefined;
  readonly customReasons?: readonly CaseStalenessReason[] | undefined;
}

export function evaluateCaseStaleness(input: StalenessInput): CurrentnessViewModel {
  const reasons: CaseStalenessReason[] = [];

  if (input.customReasons) {
    reasons.push(...input.customReasons);
  }

  // Blocking staleness (§78)
  if (input.isLesionReviewUpdatedAfterSlate) {
    reasons.push({
      code: 'STALE_LESION_REVIEW',
      severity: 'blocking',
      affected_object: 'case_context',
      message: 'Lesion review was modified after Target Slate generation. Slate invalidated.',
      resolution_action: 'Regenerate Target Slate with updated lesion boundary mask.',
    });
  }

  if (input.isClinicalObjectiveChangedAfterSlate) {
    reasons.push({
      code: 'STALE_CLINICAL_OBJECTIVE',
      severity: 'blocking',
      affected_object: 'case_context',
      message: 'Clinical objective changed after Target Slate generation.',
      resolution_action: 'Regenerate Target Slate aligned with active clinical objective.',
    });
  }

  if (input.isDiseaseStageChangedAfterSlate) {
    reasons.push({
      code: 'STALE_DISEASE_STAGE',
      severity: 'blocking',
      affected_object: 'case_context',
      message: 'Post-stroke disease stage updated. Target Slate validity must be recalculated.',
      resolution_action: 'Regenerate Target Slate.',
    });
  }

  if (input.isScientificPolicyInvalidated) {
    reasons.push({
      code: 'POLICY_INVALIDATED',
      severity: 'blocking',
      affected_object: 'target_slate',
      message:
        'Scientific policy version governing this slate is no longer active for this configuration.',
      resolution_action: 'Re-execute candidate ranking under active scientific policy.',
    });
  }

  if (input.isCaseContextUpdatedAfterSlate) {
    reasons.push({
      code: 'STALE_CASE_CONTEXT',
      severity: 'blocking',
      affected_object: 'case_context',
      message: 'Clinical context modified after Target Slate generation.',
      resolution_action: 'Regenerate Target Slate.',
    });
  }

  // Important staleness (§79)
  if (input.isMeasurementReplaced) {
    reasons.push({
      code: 'MEASUREMENT_REPLACED',
      severity: 'important',
      affected_object: 'measurement',
      message: 'A newer acquisition run of an existing modality is available.',
      resolution_action: 'Review new measurement or maintain current baseline.',
    });
  }

  if (input.isNewOptionalResearchMeasurementAvailable) {
    reasons.push({
      code: 'OPTIONAL_RESEARCH_MEASUREMENT',
      severity: 'important',
      affected_object: 'measurement',
      message: 'New optional research measurement available (e.g. DWI run).',
      resolution_action: 'Inspect in Research mode; does not invalidate Clinical slate.',
    });
  }

  // Informational updates (§80)
  if (input.isNewerEvidenceLibraryAvailable) {
    reasons.push({
      code: 'EVIDENCE_RELEASE_UPDATE',
      severity: 'informational',
      affected_object: 'target_slate',
      message:
        'A newer Evidence Library release is available. This slate remains bound to its generation release.',
      resolution_action: 'Informational only — historical reproducibility preserved.',
    });
  }

  if (input.isModuleSuperseded) {
    reasons.push({
      code: 'MODULE_SUPERSEDED',
      severity: 'informational',
      affected_object: 'target_slate',
      message: 'A newer indication module release is published.',
      resolution_action: 'Existing signed slate remains immutable.',
    });
  }

  const isStale = reasons.length > 0;
  const hasBlocking = reasons.some(r => r.severity === 'blocking');
  const hasImportant = reasons.some(r => r.severity === 'important');

  const highestSeverity = hasBlocking
    ? 'blocking'
    : hasImportant
      ? 'important'
      : isStale
        ? 'informational'
        : undefined;

  const alertBadgeClass = hasBlocking
    ? 'badge-tier3 badge-stale-blocking'
    : hasImportant
      ? 'badge-tierexp badge-stale-important'
      : 'badge-neutral';

  return {
    isStale,
    highestSeverity,
    blockingSignOff: hasBlocking,
    reasons,
    alertBadgeClass,
  };
}

// ==========================================
// 4. Dynamic Workflow Derivation (§50–57, §83–87)
// ==========================================

export interface WorkflowDerivationInput {
  readonly indicationCode: string;
  readonly caseId: string;
  readonly activePath: string;
  readonly isPhenotypeApproved?: boolean | undefined;
  readonly isMeasurementsComplete?: boolean | undefined;
  readonly isSlateReady?: boolean | undefined;
  readonly isDecisionSigned?: boolean | undefined;
  readonly isResearchOnly?: boolean | undefined;
}

export function deriveModuleWorkflow(input: WorkflowDerivationInput): WorkflowViewModel {
  const descriptor = getModuleUiDescriptor(input.indicationCode);
  const basePath = `/cases/${input.caseId}`;

  // 1. Overview Step
  const overviewStep: WorkflowStepViewModel = {
    id: 'overview',
    stepNumber: 1,
    label: 'Overview',
    path: basePath,
    state: input.activePath === basePath ? 'current' : 'complete',
    stateSymbol: input.activePath === basePath ? '●' : '✓',
    isAccessible: true,
  };

  // 2. Assessment / Clinical Context Step
  const contextSubSteps: WorkflowSubStepViewModel[] = descriptor.context_sections.map(cs => ({
    id: cs.id,
    label: cs.label,
    state: input.isPhenotypeApproved ? 'complete' : 'action_required',
    stateSymbol: input.isPhenotypeApproved ? '✓' : '!',
    path: `${basePath}/${cs.pathSuffix}`,
    isRequired: cs.required,
  }));

  const contextPathSegments = [
    'phenotype',
    'context',
    'objective',
    'body-region',
    'impairment',
    'stage',
    'lesion',
    'slt-context',
    'provocation-context',
    'cue-context',
    'trauma-context',
    'assessment',
    'treatment',
  ];
  const isContextCurrent =
    input.activePath.includes('/context') ||
    input.activePath.includes('/phenotype') ||
    descriptor.context_sections.some(cs => input.activePath.includes(`/${cs.pathSuffix}`)) ||
    contextPathSegments.some(seg => input.activePath.includes(`/${seg}`));
  const contextStep: WorkflowStepViewModel = {
    id: 'context',
    stepNumber: 2,
    label:
      descriptor.workflow_labels.find(w => w.stepId === 'context')?.customLabel ||
      'Clinical Context',
    path: `${basePath}/${descriptor.context_sections[0]?.pathSuffix || 'context'}`,
    state: isContextCurrent
      ? 'current'
      : input.isPhenotypeApproved
        ? 'complete'
        : 'action_required',
    stateSymbol: isContextCurrent ? '●' : input.isPhenotypeApproved ? '✓' : '!',
    subSteps: contextSubSteps,
    isAccessible: true,
  };

  // 3. Measurements Step (Modality Aware, Zero False Requirements (§87))
  const measurementSubSteps: WorkflowSubStepViewModel[] = descriptor.measurement_sections.map(
    ms => {
      const isCurrentSub = input.activePath.includes(ms.pathSuffix);
      const subState: WorkflowSemanticState = ms.required
        ? input.isMeasurementsComplete
          ? 'complete'
          : 'pending'
        : 'not_applicable';

      return {
        id: ms.modality,
        label: ms.label,
        state: isCurrentSub ? 'current' : subState,
        stateSymbol: isCurrentSub
          ? '●'
          : subState === 'complete'
            ? '✓'
            : subState === 'pending'
              ? '○'
              : '—',
        path: `${basePath}/${ms.pathSuffix}`,
        isRequired: ms.required,
      };
    },
  );

  const measurementPathSegments = ['measurements', 'imaging', 'connectome'];
  const isMeasurementsCurrent =
    measurementPathSegments.some(seg => input.activePath.includes(`/${seg}`)) ||
    descriptor.measurement_sections.some(ms => input.activePath.includes(`/${ms.pathSuffix}`));
  const measurementsStep: WorkflowStepViewModel = {
    id: 'measurements',
    stepNumber: 3,
    label:
      descriptor.workflow_labels.find(w => w.stepId === 'measurements')?.customLabel ||
      'Measurements',
    path: `${basePath}/${descriptor.measurement_sections[0]?.pathSuffix || 'measurements'}`,
    state: isMeasurementsCurrent
      ? 'current'
      : input.isMeasurementsComplete
        ? 'complete'
        : 'pending',
    stateSymbol: isMeasurementsCurrent ? '●' : input.isMeasurementsComplete ? '✓' : '○',
    subSteps: measurementSubSteps,
    isAccessible: Boolean(input.isPhenotypeApproved),
  };

  // 4. Target Slate Step
  const isTargetsCurrent = input.activePath.includes('/targets');
  const targetStep: WorkflowStepViewModel = {
    id: 'targets',
    stepNumber: 4,
    label:
      descriptor.workflow_labels.find(w => w.stepId === 'targets')?.customLabel || 'Target Slate',
    path: `${basePath}/targets`,
    state: isTargetsCurrent ? 'current' : input.isSlateReady ? 'complete' : 'pending',
    stateSymbol: isTargetsCurrent ? '●' : input.isSlateReady ? '✓' : '○',
    isAccessible: Boolean(input.isSlateReady),
  };

  // 5. Compare Step
  const isCompareCurrent = input.activePath.includes('/compare');
  const compareStep: WorkflowStepViewModel = {
    id: 'compare',
    stepNumber: 5,
    label: 'Compare',
    path: `${basePath}/compare`,
    state: isCompareCurrent ? 'current' : 'pending',
    stateSymbol: isCompareCurrent ? '●' : '○',
    isAccessible: Boolean(input.isSlateReady),
  };

  // 6. Decision Step (Omitted or strictly disabled in Research Mode (§57))
  const steps: WorkflowStepViewModel[] = [
    overviewStep,
    contextStep,
    measurementsStep,
    targetStep,
    compareStep,
  ];

  if (!input.isResearchOnly) {
    const isDecisionCurrent = input.activePath.includes('/decision');
    const decisionStep: WorkflowStepViewModel = {
      id: 'decision',
      stepNumber: 6,
      label: 'Decision & Sign-Off',
      path: `${basePath}/decision`,
      state: isDecisionCurrent ? 'current' : input.isDecisionSigned ? 'complete' : 'pending',
      stateSymbol: isDecisionCurrent ? '●' : input.isDecisionSigned ? '✓' : '○',
      isAccessible: Boolean(input.isSlateReady),
    };
    steps.push(decisionStep);
  }

  // Find active step index: prioritize step explicitly marked as 'current', then exact path match, then overview
  const activeStep =
    steps.find(s => s.state === 'current') ||
    steps.find(s => s.path === input.activePath) ||
    steps[0]!;
  const currentWorkflowIndex = steps.indexOf(activeStep);

  return {
    steps,
    activeStepId: activeStep.id,
    currentWorkflowIndex: currentWorkflowIndex >= 0 ? currentWorkflowIndex : 0,
    canAdvance: Boolean(input.isSlateReady),
  };
}

// ==========================================
// 5. Aggregate Case Shell View Model Adapter (§187)
// ==========================================

export interface CreateCaseShellParams {
  readonly caseId: string;
  readonly caseCode: string;
  readonly patientDisplayLabel: string;
  readonly subjectDeIdentifiedToken: string;
  readonly activeCaseIndicationId: string;
  readonly indicationCode: string;
  readonly indicationFormatted: string;
  readonly isPrimaryIndication?: boolean | undefined;
  readonly availableIndications?: readonly IndicationOptionViewModel[] | undefined;
  readonly clinicalObjective?:
    | {
        readonly id: string;
        readonly title: string;
        readonly priorityRank: number;
        readonly burdenScoreText?: string | undefined;
        readonly isEvidenceMappable: boolean;
      }
    | undefined;
  readonly diseaseStage?:
    | {
        readonly stageCode: string;
        readonly stageLabel: string;
        readonly determinationMethod: string;
        readonly isSubacuteOrAcute: boolean;
      }
    | undefined;
  readonly lesionContext?:
    | {
        readonly hasLesion: boolean;
        readonly lesionType?: string | undefined;
        readonly laterality?: string | undefined;
        readonly interpretation?: string | undefined;
        readonly affectedRegionsCount: number;
        readonly hasTargetOverlapWarning: boolean;
        readonly skullAbnormalityPresent: boolean;
      }
    | undefined;
  readonly treatmentContext?:
    | {
        readonly contextType: string;
        readonly statusLabel: string;
        readonly isConfirmed: boolean;
        readonly summaryText: string;
      }
    | undefined;
  readonly mode?: EnvironmentMode | undefined;
  readonly moduleReleaseId?: string | undefined;
  readonly moduleCode?: string | undefined;
  readonly moduleVersion?: string | undefined;
  readonly humanReadableModuleName?: string | undefined;
  readonly qualificationLevel?: ModuleQualificationLevel | undefined;
  readonly permittedModes?: readonly string[] | undefined;
  readonly userHasSigningAuthority?: boolean | undefined;
  readonly isBlindedValidation?: boolean | undefined;
  readonly stalenessInput?: StalenessInput | undefined;
  readonly activePath?: string | undefined;
  readonly isPhenotypeApproved?: boolean | undefined;
  readonly isMeasurementsComplete?: boolean | undefined;
  readonly isSlateReady?: boolean | undefined;
  readonly isDecisionSigned?: boolean | undefined;
  readonly targetSlateStatus?:
    | {
        readonly slateId: string;
        readonly candidateCount: number;
        readonly primaryCandidateRole?: string | undefined;
        readonly convergenceLevel?: string | undefined;
        readonly geometryType: TargetGeometryType;
      }
    | undefined;
  readonly decisionStatus?:
    | {
        readonly isSigned: boolean;
        readonly signedAtFormatted?: string | undefined;
        readonly signedBy?: string | undefined;
        readonly immutableHash?: string | undefined;
        readonly selectedCandidateId?: string | undefined;
        readonly decisionType?: string | undefined;
      }
    | undefined;
  readonly createdAt?: string | undefined;
  readonly updatedAt?: string | undefined;
}

export function createCaseShellViewModel(params: CreateCaseShellParams): CaseShellViewModel {
  const mode = params.mode || 'CLINICAL';

  // 1. Resolve Authority & Contradiction (§218, §25)
  const authorityResolution = resolveEffectiveModuleAuthority({
    moduleReleaseId: params.moduleReleaseId || `IMR-${params.indicationCode}-2.0.0`,
    moduleCode: params.moduleCode || params.indicationCode,
    moduleVersion: params.moduleVersion || '2.0.0',
    humanReadableName:
      params.humanReadableModuleName || `${params.indicationCode} Targeting Module`,
    qualificationLevel: params.qualificationLevel || 'Q8',
    permittedModes: params.permittedModes || ['CLINICAL', 'VALIDATION', 'RESEARCH'],
    activeEnvironmentMode: mode,
    userHasSigningAuthority: Boolean(params.userHasSigningAuthority),
    isBlindedValidation: params.isBlindedValidation,
  });

  const failClosed = authorityResolution.isContradictory;
  const safetyState: ShellSafetyState = failClosed
    ? 'FAIL_CLOSED'
    : params.isBlindedValidation
      ? 'BLINDED_VALIDATION'
      : 'NORMAL';

  // 2. Mode View Model
  const modeVm = createModeViewModel(mode, failClosed, authorityResolution.contradictionReason);

  // 3. Case Identity
  const caseIdentity: CaseIdentityViewModel = {
    caseId: params.caseId,
    caseCode: params.caseCode,
    patientDisplayLabel: params.patientDisplayLabel,
    subjectDeIdentifiedToken: params.subjectDeIdentifiedToken,
    createdAtFormatted: params.createdAt || '2026-09-01',
    updatedAtFormatted: params.updatedAt || '2026-09-03',
  };

  // 4. Indication Context
  const indication: IndicationContextViewModel = {
    activeCaseIndicationId: params.activeCaseIndicationId,
    indicationCode: params.indicationCode,
    indicationFormatted: params.indicationFormatted,
    isPrimary: params.isPrimaryIndication !== false,
    allAvailableIndications: params.availableIndications || [
      {
        caseIndicationId: params.activeCaseIndicationId,
        indicationCode: params.indicationCode,
        label: params.indicationFormatted,
        isPrimary: true,
        status: 'confirmed',
      },
    ],
    clinicalObjective: params.clinicalObjective,
    diseaseStage: params.diseaseStage,
    lesionContext: params.lesionContext,
    treatmentContext: params.treatmentContext,
  };

  // 5. Staleness Model
  const currentness = evaluateCaseStaleness(params.stalenessInput || {});

  // 6. Workflow Rail
  const workflow = deriveModuleWorkflow({
    indicationCode: params.indicationCode,
    caseId: params.caseId,
    activePath: params.activePath || `/cases/${params.caseId}`,
    isPhenotypeApproved: params.isPhenotypeApproved,
    isMeasurementsComplete: params.isMeasurementsComplete,
    isSlateReady: params.isSlateReady,
    isDecisionSigned: params.isDecisionSigned,
    isResearchOnly: authorityResolution.authority.isResearchOnly,
  });

  // 7. Modality Summaries adapted to active module (§96–106)
  const descriptor = getModuleUiDescriptor(params.indicationCode);
  const measurements: MeasurementSummaryViewModel[] = descriptor.measurement_sections.map(ms => {
    return {
      modality: ms.modality,
      modalityLabel: ms.label,
      isRequiredByModule: ms.required,
      isAvailable: true,
      qualification: 'qualified',
      badgeClass: 'badge-tier1',
      reliabilitySummary: ms.required ? 'High Reliability (QC Verified)' : 'Research Context',
      isUsedForClinicalRanking: ms.required && authorityResolution.authority.isClinicalAuthorised,
      nonUseExplanation: ms.required
        ? undefined
        : 'Optional research measurement; not permitted to influence clinical rank.',
    };
  });

  // 8. Target Slate Status
  const targetSlate: TargetSlateStatusViewModel | undefined = params.targetSlateStatus
    ? {
        slateId: params.targetSlateStatus.slateId,
        isReady: true,
        candidateCount: params.targetSlateStatus.candidateCount,
        primaryCandidateRole:
          params.targetSlateStatus.primaryCandidateRole || 'Primary 1 — Evidence Baseline',
        convergenceLevel:
          params.targetSlateStatus.convergenceLevel || 'High Convergence (Δ ≤ 12mm)',
        geometryType: params.targetSlateStatus.geometryType,
        isStale: currentness.isStale,
      }
    : undefined;

  // 9. Decision Status
  const decision: DecisionStatusViewModel | undefined = params.decisionStatus
    ? {
        isSigned: params.decisionStatus.isSigned,
        signedAtFormatted: params.decisionStatus.signedAtFormatted,
        signedBy: params.decisionStatus.signedBy,
        immutableHash: params.decisionStatus.immutableHash,
        selectedCandidateId: params.decisionStatus.selectedCandidateId,
        decisionType: params.decisionStatus.decisionType,
      }
    : undefined;

  // 10. Permitted Actions
  // If blocking staleness is active, may_sign_target_decision is blocked (§78, §140)
  const permittedActions: ClinicalActionCapabilities = {
    ...authorityResolution.authority.capabilities,
    may_sign_target_decision:
      authorityResolution.authority.capabilities.may_sign_target_decision &&
      !currentness.blockingSignOff,
  };

  return {
    caseIdentity,
    indication,
    mode: modeVm,
    moduleAuthority: authorityResolution.authority,
    workflow,
    currentness,
    measurements,
    targetSlate,
    decision,
    permittedActions,
    safetyState,
  };
}
