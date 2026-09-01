/**
 * Magniom Canonical Target Domain Types & Enums
 * Derived directly from MAGNIOM-Canonical Target Data Specification v1.0
 */

// ==========================================
// 1. Core Enumerations
// ==========================================

export type MagniomMode = 'RESEARCH' | 'CLINICAL' | 'VALIDATION';

export type CandidateRole =
  | 'PRIMARY_1'
  | 'PRIMARY_2'
  | 'PRIMARY_3'
  | 'ADDITIONAL_A'
  | 'ADDITIONAL_B'
  | 'RESERVE';

export type EvidenceTier = 'T1' | 'T2' | 'T3' | 'T4' | 'T_EXP';

export type TargetMethod =
  | 'EVIDENCE_ONLY_PRIOR'
  | 'STRUCTURAL_ANATOMICAL'
  | 'CONNECTOME_REFINED'
  | 'ELECTRIC_FIELD_OPTIMIZED';

export type CoordinateSpace = 'MNI152NLin2009cAsym' | 'fsLR_32k' | 'NATIVE_T1W';

export type Hemisphere = 'L' | 'R' | 'BILATERAL';

export type DecisionType =
  | 'ACCEPTED_PRIMARY'
  | 'ACCEPTED_ADDITIONAL'
  | 'SUBSTITUTED_ALTERNATIVE'
  | 'MANUAL_OVERRIDE'
  | 'DEFERRED'
  | 'REJECTED';

// ==========================================
// 2. Coordinate Primitives
// ==========================================

export interface MniCoordinate {
  readonly space: 'MNI152NLin2009cAsym';
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface SurfaceVertex {
  readonly space: 'fsLR_32k';
  readonly hemisphere: 'L' | 'R';
  readonly vertexIndex: number;
  readonly parcelName: string; // e.g. "8Av_L", "p9-46v_L"
}

// ==========================================
// 3. Therapeutic Circuit & Target Family
// ==========================================

export interface TherapeuticCircuit {
  readonly id: string;
  readonly code: string; // e.g. "DLPFC_SGACC_ANTISYNC"
  readonly name: string;
  readonly primaryIndication: string;
  readonly symptomDomains: readonly string[];
  readonly canonicalSourceParcel: string;
  readonly canonicalTargetParcel: string;
  readonly version: string;
}

export interface TargetFamily {
  readonly id: string;
  readonly code: string; // e.g. "LEFT_DLPFC_BA46"
  readonly name: string;
  readonly hemisphere: Hemisphere;
  readonly primaryHcpParcel: string;
  readonly fallbackMniCoordinate: MniCoordinate;
  readonly maxAllowableDisplacementMm: number;
  readonly evidenceCeilingTier: EvidenceTier;
}

// ==========================================
// 4. Target Reliability & QC
// ==========================================

export interface TargetReliabilityProfile {
  readonly candidateId: string;
  readonly scanDurationMinutes: number;
  readonly meanFramewiseDisplacementMm: number;
  readonly retainedFramesPercentage: number;
  readonly temporalSnr: number;
  readonly splitHalfLocalisationDistanceMm?: number;
  readonly overallReliabilityScore: number; // [0.0, 1.0]
  readonly isReliableForPersonalisation: boolean;
  readonly warnings: readonly string[];
}

// ==========================================
// 5. Target Candidate
// ==========================================

export interface TargetCandidate {
  readonly id: string;
  readonly familyId: string;
  readonly circuitId: string;
  readonly role: CandidateRole;
  readonly method: TargetMethod;
  readonly evidenceTier: EvidenceTier;
  readonly mniCoordinate: MniCoordinate;
  readonly surfaceVertex?: SurfaceVertex;
  readonly evidenceScore: number; // [0.0, 1.0]
  readonly phenotypeConcordanceScore: number; // [0.0, 1.0]
  readonly connectomeRefinementScore?: number; // [0.0, 1.0]
  readonly overallScore: number; // [0.0, 1.0]
  readonly rationale: string;
  readonly contraindicationsOrConflicts: readonly string[];
  readonly isSuppressedOrRedundant: boolean;
}

// ==========================================
// 6. Target Slate
// ==========================================

export interface TargetSlate {
  readonly id: string;
  readonly caseId: string;
  readonly phenotypeSnapshotId: string;
  readonly scientificPolicyVersion: string;
  readonly evidenceReleaseVersion: string;
  readonly generatedAt: string; // ISO 8601
  readonly mode: MagniomMode;
  readonly primaryCandidates: readonly TargetCandidate[]; // max 3
  readonly additionalCandidates: readonly TargetCandidate[]; // max 2
  readonly suppressedCandidates: readonly TargetCandidate[];
  readonly abstentionReason?: string;
  readonly deterministicManifestHash: string;
}

// ==========================================
// 7. Clinician Decision & Sign-off
// ==========================================

export interface ClinicianDecision {
  readonly id: string;
  readonly slateId: string;
  readonly clinicianId: string;
  readonly decisionType: DecisionType;
  readonly selectedCandidateIds: readonly string[];
  readonly manualOverrideDetails?: {
    readonly customCoordinate?: MniCoordinate;
    readonly clinicalRationale: string;
  };
  readonly reviewedCounterfactuals: boolean;
  readonly reviewedConflictingEvidence: boolean;
  readonly decidedAt: string; // ISO 8601
  readonly digitalSignatureHash: string;
  readonly isImmutable: boolean;
}

// ==========================================
// 8. Phenotype Snapshot
// ==========================================

export interface PhenotypeSnapshot {
  readonly id: string;
  readonly patientId: string;
  readonly primaryDiagnosis: string;
  readonly episodeSeverity: 'MILD' | 'MODERATE' | 'SEVERE_WITHOUT_PSYCHOSIS' | 'SEVERE_WITH_PSYCHOSIS';
  readonly symptomScores: {
    readonly dysphoriaScore: number;
    readonly anhedoniaScore: number;
    readonly anxiousSomaticScore: number;
    readonly ruminationScore: number;
  };
  readonly treatmentHistory: {
    readonly medicationFailuresCount: number;
    readonly priorTmsExposure: boolean;
  };
  readonly confirmedByClinicianId: string;
  readonly confirmedAt: string;
}
