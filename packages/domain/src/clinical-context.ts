/**
 * MAGNIOM Canonical Clinical Context Domain Types v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§9, 16-27, 46-49)
 * Covers: CaseIndication, ClinicalObjective, DiseaseStageContext, LesionContext, TreatmentContextSnapshot
 */

import type {
  DataQualityState,
  ConfidenceLevel,
  DiseaseStageDeterminationMethod,
  LesionType,
  LesionLaterality,
  TreatmentContextType,
  TreatmentContextRole,
  TreatmentContextEvaluationStatus,
} from './enums.js';
import type { CommonProvenance, ClinicalConceptRef, AtlasRef, SpatialRegion } from './types.js';
import type { IndicationRef } from './indication-module.js';

// ==========================================
// 1. Case Indication (§9)
// ==========================================

export type CaseIndicationStatus = 'proposed' | 'confirmed' | 'inactive' | 'superseded';
export type CaseIndicationClinicalRole =
  'primary_targeting_indication' | 'secondary_condition' | 'contextual_comorbidity';

export interface CaseIndication {
  readonly id: string;
  readonly version: string;
  readonly caseId: string;
  readonly indication: IndicationRef;
  readonly indicationModuleReleaseId: string;
  readonly status: CaseIndicationStatus;
  readonly clinicalRole: CaseIndicationClinicalRole;
  readonly confirmationSourceIds: readonly string[];
  readonly confirmedBy?: string;
  readonly confirmedAt?: string;
  readonly dataQuality: DataQualityState;
  readonly provenance: CommonProvenance;
}

// ==========================================
// 2. Clinical Objective (§16-18)
// ==========================================

export type TargetMappability =
  'clinically_supported' | 'supporting_only' | 'research_only' | 'not_evidence_mappable';

export interface ClinicalObjective {
  readonly id: string;
  readonly caseIndicationId: string;
  readonly objectiveDefinitionId: string;
  readonly concept: ClinicalConceptRef;
  readonly priorityRank: number;
  readonly clinicianPriority?: number;
  readonly patientPriority?: number;
  readonly currentBurden?: {
    readonly value: number;
    readonly unit?: string;
    readonly scale?: string;
  };
  readonly functionalImpact?: {
    readonly value: number;
    readonly unit?: string;
    readonly scale?: string;
  };
  readonly targetMappability: TargetMappability;
  readonly confidence: ConfidenceLevel;
  readonly rationale?: string;
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly provenance: CommonProvenance;
}

export interface ClinicalObjectiveDefinition {
  readonly id: string;
  readonly version: string;
  readonly indicationModuleReleaseId: string;
  readonly concept: ClinicalConceptRef;
  readonly description: string;
  readonly evidenceMappability: 'clinical' | 'supporting' | 'research' | 'none';
  readonly evidenceClaimIds: readonly string[];
  readonly provenance: CommonProvenance;
}

// ==========================================
// 3. Disease Stage Context (§19-22)
// ==========================================

export interface DiseaseStageContext {
  readonly id: string;
  readonly version: string;
  readonly caseIndicationId: string;
  readonly stageDefinitionId: string;
  readonly onsetDate?: string;
  readonly calculatedDurationDays?: number;
  readonly currentStageCode: string;
  readonly currentStageLabel: string;
  readonly determinationMethod: DiseaseStageDeterminationMethod;
  readonly confidence: ConfidenceLevel;
  readonly dataQuality: DataQualityState;
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly provenance: CommonProvenance;
}

export interface DiseaseStageDefinition {
  readonly id: string;
  readonly version: string;
  readonly indicationModuleReleaseId: string;
  readonly code: string;
  readonly label: string;
  readonly temporalBounds?: {
    readonly minimumDays?: number;
    readonly maximumDays?: number;
  };
  readonly description: string;
  readonly evidenceClaimIds?: readonly string[];
  readonly provenance: CommonProvenance;
}

// ==========================================
// 4. Lesion Context (§23-27)
// ==========================================

export interface AtlasTractRef {
  readonly tractCode: string;
  readonly tractName: string;
  readonly atlasCode: string;
}

export interface LesionTractFinding {
  readonly tract: AtlasTractRef;
  readonly involvement: 'none' | 'partial' | 'substantial' | 'complete' | 'uncertain';
  readonly measurementMethod?: string;
  readonly sourceMeasurementId?: string;
  readonly confidence: ConfidenceLevel;
}

export interface SkullContext {
  readonly skullDefectPresent: boolean;
  readonly cranioplastyPresent: boolean;
  readonly intracranialHardwarePresent: boolean;
  readonly details?: string;
  readonly efieldModellingRequired?: boolean;
}

export interface LesionContext {
  readonly id: string;
  readonly version: string;
  readonly caseIndicationId: string;
  readonly lesionType: LesionType;
  readonly lesionLaterality: LesionLaterality;
  readonly lesionMaskArtifactId?: string;
  readonly sourceImagingStudyIds: readonly string[];
  readonly lesionVolumeCm3?: number;
  readonly corticalRegionsAffected: readonly AtlasRef[];
  readonly subcorticalRegionsAffected: readonly AtlasRef[];
  readonly tractFindings?: readonly LesionTractFinding[];
  readonly skullAbnormality?: SkullContext;
  readonly structuralDistortion: ConfidenceLevel;
  readonly registrationQuality: 'high' | 'moderate' | 'low' | 'fail';
  readonly segmentationQuality: 'high' | 'moderate' | 'low' | 'fail';
  readonly efieldRelevance: 'none_known' | 'potential' | 'material' | 'not_assessable';
  readonly targetRegionExclusions?: readonly SpatialRegion[];
  readonly dataQuality: DataQualityState;
  readonly interpretation: string;
  readonly provenance: CommonProvenance;
}

// ==========================================
// 5. Treatment Context Snapshot (§46-50)
// ==========================================

export interface TreatmentContextRequirement {
  readonly id: string;
  readonly version: string;
  readonly indicationModuleReleaseId: string;
  readonly code: string;
  readonly label: string;
  readonly contextType: TreatmentContextType;
  readonly role: TreatmentContextRole;
  readonly description: string;
  readonly evidenceClaimIds: readonly string[];
  readonly absenceBehaviour:
    'ineligible' | 'downgrade_evidence_applicability' | 'show_limitation' | 'research_only';
  readonly provenance: CommonProvenance;
}

export interface TreatmentContextEvaluation {
  readonly treatmentContextRequirementId: string;
  readonly status: TreatmentContextEvaluationStatus;
  readonly evidence?: string;
  readonly dataQuality: DataQualityState;
  readonly interpretation?: string;
}

export interface TreatmentContextSnapshot {
  readonly id: string;
  readonly version: string;
  readonly caseIndicationId: string;
  readonly requirementEvaluations: readonly TreatmentContextEvaluation[];
  readonly approvedBy?: string;
  readonly approvedAt?: string;
  readonly payloadSha256: string;
  readonly provenance: CommonProvenance;
}
