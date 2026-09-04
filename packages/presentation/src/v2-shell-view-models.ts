/**
 * @magniom/presentation
 * Canonical v2 Application Shell, Navigation & Clinical Context View Models.
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§9–25, 58–87, 187, 218–219, 232).
 *
 * Rules:
 * - Shell view models are pure presentation representations of server-resolved domain state.
 * - Frontend NEVER calculates scientific logic, eligibility, or ranking.
 * - Contradictory states fail closed.
 */

import type {
  TargetGeometryType,
  MeasurementModality,
  ModuleQualificationLevel,
} from '@magniom/domain';

// ==========================================
// 1. Environment & Mode View Models (§9, §20–23)
// ==========================================

export type EnvironmentMode = 'CLINICAL' | 'VALIDATION' | 'RESEARCH';

export type ShellSafetyState = 'NORMAL' | 'FAIL_CLOSED' | 'BLINDED_VALIDATION';

export interface ModeViewModel {
  readonly mode: EnvironmentMode;
  readonly label: string;
  readonly badgeClass: string;
  readonly isClinical: boolean;
  readonly isValidation: boolean;
  readonly isResearch: boolean;
  readonly safetyNotice?: string | undefined;
  readonly failClosed: boolean;
  readonly failClosedReason?: string | undefined;
}

// ==========================================
// 2. User & Organisation Identity View Models (§14, §26–28)
// ==========================================

export interface UserIdentityViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly roleTitle: string;
  readonly hasSigningAuthority: boolean;
  readonly signingAuthorityLevel?: string | undefined;
  readonly organizationId: string;
  readonly organizationName: string;
  readonly siteName: string;
  readonly initials: string;
}

export interface OrganisationContextViewModel {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly siteId: string;
  readonly siteName: string;
  readonly displayLabel: string;
}

// ==========================================
// 3. Top Bar View Model (§17–29)
// ==========================================

export interface TopBarViewModelV2 {
  readonly brandName: string;
  readonly brandDescriptor: string;
  readonly mode: ModeViewModel;
  readonly organisation: OrganisationContextViewModel;
  readonly user: UserIdentityViewModel;
  readonly releaseDigestShort: string;
  readonly failClosedAlert?: string | undefined;
}

// ==========================================
// 4. Clinical Context & Indication View Models (§58–75)
// ==========================================

export interface IndicationOptionViewModel {
  readonly caseIndicationId: string;
  readonly indicationCode: string;
  readonly label: string;
  readonly isPrimary: boolean;
  readonly status: string;
}

export interface ClinicalObjectiveSummaryViewModel {
  readonly id: string;
  readonly title: string;
  readonly priorityRank: number;
  readonly burdenScoreText?: string | undefined;
  readonly isEvidenceMappable: boolean;
}

export interface DiseaseStageSummaryViewModel {
  readonly stageCode: string;
  readonly stageLabel: string;
  readonly determinationMethod: string;
  readonly isSubacuteOrAcute: boolean;
}

export interface LesionContextSummaryViewModel {
  readonly hasLesion: boolean;
  readonly lesionType?: string | undefined;
  readonly laterality?: string | undefined;
  readonly interpretation?: string | undefined;
  readonly affectedRegionsCount: number;
  readonly hasTargetOverlapWarning: boolean;
  readonly skullAbnormalityPresent: boolean;
}

export interface TreatmentContextSummaryViewModel {
  readonly contextType: string;
  readonly statusLabel: string;
  readonly isConfirmed: boolean;
  readonly summaryText: string;
}

export interface IndicationContextViewModel {
  readonly activeCaseIndicationId: string;
  readonly indicationCode: string;
  readonly indicationFormatted: string;
  readonly isPrimary: boolean;
  readonly allAvailableIndications: readonly IndicationOptionViewModel[];
  readonly clinicalObjective?: ClinicalObjectiveSummaryViewModel | undefined;
  readonly diseaseStage?: DiseaseStageSummaryViewModel | undefined;
  readonly lesionContext?: LesionContextSummaryViewModel | undefined;
  readonly treatmentContext?: TreatmentContextSummaryViewModel | undefined;
}

// ==========================================
// 5. Module Authority & Capabilities (§68–71, §217–220)
// ==========================================

export interface ClinicalActionCapabilities {
  readonly may_generate_target_slate: boolean;
  readonly may_review_target_slate: boolean;
  readonly may_create_clinician_decision: boolean;
  readonly may_sign_target_decision: boolean;
  readonly may_export_navigation_target: boolean;
}

export interface ModuleAuthorityViewModel {
  readonly moduleReleaseId: string;
  readonly moduleCode: string;
  readonly moduleVersion: string;
  readonly humanReadableName: string;
  readonly qualificationLevel: ModuleQualificationLevel;
  readonly permissionLabel: string;
  readonly isClinicalAuthorised: boolean;
  readonly isValidationOnly: boolean;
  readonly isResearchOnly: boolean;
  readonly capabilities: ClinicalActionCapabilities;
  readonly silentProspectiveBlinded: boolean;
}

// ==========================================
// 6. Staleness & Currentness View Models (§76–80)
// ==========================================

export type StalenessSeverity = 'blocking' | 'important' | 'informational';

export type StalenessAffectedObject = 'target_slate' | 'measurement' | 'decision' | 'case_context';

export interface CaseStalenessReason {
  readonly code: string;
  readonly severity: StalenessSeverity;
  readonly affected_object: StalenessAffectedObject;
  readonly message: string;
  readonly resolution_action?: string | undefined;
}

export interface CurrentnessViewModel {
  readonly isStale: boolean;
  readonly highestSeverity?: StalenessSeverity | undefined;
  readonly blockingSignOff: boolean;
  readonly reasons: readonly CaseStalenessReason[];
  readonly alertBadgeClass: string;
}

// ==========================================
// 7. Dynamic Measurement Summary View Model (§96–106, §225–228)
// ==========================================

export type ModalityQualificationStatus =
  | 'qualified'
  | 'qualified_with_limits'
  | 'low_reliability'
  | 'failed'
  | 'not_required'
  | 'research_only';

/**
 * Canonical 7 UI measurement statuses (§182).
 */
export type CanonicalMeasurementUiStatus =
  | 'Available'
  | 'Processing'
  | 'Qualified'
  | 'Qualified with limitations'
  | 'Not qualified'
  | 'Research only'
  | 'Not required';

export interface MeasurementSummaryViewModel {
  readonly modality: MeasurementModality;
  readonly modalityLabel: string;
  readonly isRequiredByModule: boolean;
  readonly isAvailable: boolean;
  readonly qualification: ModalityQualificationStatus;
  readonly uiStatus?: CanonicalMeasurementUiStatus | undefined;
  readonly badgeClass: string;
  readonly reliabilitySummary?: string | undefined;
  readonly isUsedForClinicalRanking: boolean;
  readonly nonUseExplanation?: string | undefined;
}

/**
 * Measurement Detail Drawer View Model (§144).
 * Allows deep inspection of acquisition, pipeline, QC, reliability, limitations, capability effect, and provenance.
 */
export interface MeasurementDetailDrawerViewModel {
  readonly measurementId: string;
  readonly modality: MeasurementModality;
  readonly modalityLabel: string;
  readonly status: CanonicalMeasurementUiStatus;
  readonly acquisition: {
    readonly profileId?: string | undefined;
    readonly scannerMakeModel?: string | undefined;
    readonly fieldStrengthTesla?: number | undefined;
    readonly sequenceType?: string | undefined;
    readonly voxelResolutionMm?: readonly [number, number, number] | undefined;
    readonly channels?: number | undefined;
    readonly samplingRateHz?: number | undefined;
  };
  readonly pipeline: {
    readonly pipelineVersion: string;
    readonly stage: string;
    readonly executionHash: string;
    readonly softwareDependencies?: readonly string[] | undefined;
  };
  readonly qualityControl: {
    readonly overallScore: number;
    readonly passedGates: readonly string[];
    readonly failedGates: readonly string[];
    readonly warnings: readonly string[];
  };
  readonly reliability: {
    readonly overallScore?: number | undefined;
    readonly confidenceInterval?: readonly [number, number] | undefined;
    readonly sampleSize?: number | undefined;
    readonly testRetestIcc?: number | undefined;
    readonly classification: string;
  };
  readonly limitations: readonly string[];
  readonly capabilityEffect: {
    readonly providedCapabilities: readonly string[];
    readonly missingCapabilities: readonly string[];
    readonly fallbackUsed: boolean;
    readonly evidenceImpact: string;
  };
  readonly technicalProvenance: {
    readonly provenanceHash: string;
    readonly registrationErrorMm?: number | undefined;
    readonly orientationConventionValidated: boolean;
    readonly createdAtFormatted: string;
  };
}

/**
 * Prohibited phrases in clinician-facing language (§182).
 */
export const PROHIBITED_CLINICIAN_LANGUAGE = [
  'good brain',
  'bad scan',
  'weak patient',
  'high-confidence treatment',
] as const;

export interface ClinicianLanguageValidationResult {
  readonly valid: boolean;
  readonly violations: readonly string[];
}

/**
 * Validates text against prohibited clinician-facing language (§182).
 */
export function validateClinicianFacingLanguage(text: string): ClinicianLanguageValidationResult {
  const lower = text.toLowerCase();
  const violations: string[] = [];
  for (const phrase of PROHIBITED_CLINICIAN_LANGUAGE) {
    if (lower.includes(phrase)) {
      violations.push(phrase);
    }
  }
  return {
    valid: violations.length === 0,
    violations,
  };
}

/**
 * Heatmap no-authority disclaimer (§184).
 * Colorful visualisations carry zero clinical authority over underlying canonical measurements.
 */
export const HEATMAP_NO_AUTHORITY_DISCLAIMER =
  'Heatmaps and surface projections are visual aids for spatial orientation only. They do not constitute diagnostic or targeting authority. All targeting decisions must be based on qualified canonical measurements and approved candidate target coordinates.';

// ==========================================
// 8. Dynamic Workflow Rail View Model (§83–87)
// ==========================================

export type WorkflowSemanticState =
  'complete' | 'current' | 'pending' | 'action_required' | 'not_applicable';

export interface WorkflowSubStepViewModel {
  readonly id: string;
  readonly label: string;
  readonly state: WorkflowSemanticState;
  readonly stateSymbol: string;
  readonly path: string;
  readonly isRequired: boolean;
}

export interface WorkflowStepViewModel {
  readonly id: string;
  readonly stepNumber: number;
  readonly label: string;
  readonly path: string;
  readonly state: WorkflowSemanticState;
  readonly stateSymbol: string;
  readonly subSteps?: readonly WorkflowSubStepViewModel[] | undefined;
  readonly isAccessible: boolean;
}

export interface WorkflowViewModel {
  readonly steps: readonly WorkflowStepViewModel[];
  readonly activeStepId: string;
  readonly currentWorkflowIndex: number;
  readonly canAdvance: boolean;
}

// ==========================================
// 9. Case Identity & Root Case Shell View Model (§187)
// ==========================================

export interface CaseIdentityViewModel {
  readonly caseId: string;
  readonly caseCode: string;
  readonly patientDisplayLabel: string;
  readonly subjectDeIdentifiedToken: string;
  readonly createdAtFormatted: string;
  readonly updatedAtFormatted: string;
}

export interface TargetSlateStatusViewModel {
  readonly slateId: string;
  readonly isReady: boolean;
  readonly candidateCount: number;
  readonly primaryCandidateRole?: string | undefined;
  readonly convergenceLevel?: string | undefined;
  readonly geometryType: TargetGeometryType;
  readonly isStale: boolean;
}

export interface DecisionStatusViewModel {
  readonly isSigned: boolean;
  readonly signedAtFormatted?: string | undefined;
  readonly signedBy?: string | undefined;
  readonly immutableHash?: string | undefined;
  readonly selectedCandidateId?: string | undefined;
  readonly decisionType?: string | undefined;
}

export interface CaseShellViewModel {
  readonly caseIdentity: CaseIdentityViewModel;
  readonly indication: IndicationContextViewModel;
  readonly mode: ModeViewModel;
  readonly moduleAuthority: ModuleAuthorityViewModel;
  readonly workflow: WorkflowViewModel;
  readonly currentness: CurrentnessViewModel;
  readonly measurements: readonly MeasurementSummaryViewModel[];
  readonly targetSlate?: TargetSlateStatusViewModel | undefined;
  readonly decision?: DecisionStatusViewModel | undefined;
  readonly permittedActions: ClinicalActionCapabilities;
  readonly safetyState: ShellSafetyState;
}

// ==========================================
// 10. Module UI Descriptor Interface (§231–233)
// ==========================================

export interface ModuleContextSection {
  readonly id: string;
  readonly label: string;
  readonly required: boolean;
  readonly pathSuffix: string;
}

export interface ModuleMeasurementSection {
  readonly modality: MeasurementModality;
  readonly label: string;
  readonly required: boolean;
  readonly pathSuffix: string;
  readonly fallbackAllowed: boolean;
}

export interface WorkflowLabelOverride {
  readonly stepId: string;
  readonly customLabel: string;
}

export interface IndicationModuleUiDescriptor {
  readonly indication_module_release_id: string;
  readonly indication_code: string;
  readonly indication_name: string;
  readonly context_sections: readonly ModuleContextSection[];
  readonly measurement_sections: readonly ModuleMeasurementSection[];
  readonly workflow_labels: readonly WorkflowLabelOverride[];
  readonly help_topic_ids: readonly string[];
  readonly target_geometry_renderers: readonly TargetGeometryType[];
}
