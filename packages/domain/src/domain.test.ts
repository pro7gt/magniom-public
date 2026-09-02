import { describe, it, expect } from 'vitest';
import type {
  TargetSlate,
  TargetCandidate,
  MniCoordinate,
  SurfaceVertex,
  PhenotypeSnapshot,
  TherapeuticCircuit,
  TargetFamily,
  ClinicianDecision,
  TargetReliabilityProfile,
} from './types.js';

describe('Canonical Domain Types & Invariants', () => {
  it('should instantiate a valid TargetSlate data structure according to 3+2 rule', () => {
    const mockCoord: MniCoordinate = {
      space: 'MNI152NLin2009cAsym',
      x: -44,
      y: 38,
      z: 32,
    };

    const mockPrimary: TargetCandidate = {
      id: 'cand-001',
      familyId: 'fam-ba46-l',
      circuitId: 'circ-sgacc-antisync',
      role: 'PRIMARY_1',
      method: 'EVIDENCE_ONLY_PRIOR',
      evidenceTier: 'T1',
      mniCoordinate: mockCoord,
      evidenceScore: 0.95,
      phenotypeConcordanceScore: 0.9,
      overallScore: 0.93,
      rationale: 'Primary evidence-anchored left DLPFC target for major depression',
      contraindicationsOrConflicts: [],
      isSuppressedOrRedundant: false,
    };

    const slate: TargetSlate = {
      id: 'slate-001',
      caseId: 'case-synthetic-01',
      phenotypeSnapshotId: 'snap-001',
      scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
      evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
      generatedAt: new Date().toISOString(),
      mode: 'CLINICAL',
      primaryCandidates: [mockPrimary],
      additionalCandidates: [],
      suppressedCandidates: [],
      deterministicManifestHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    };

    expect(slate.primaryCandidates.length).toBeLessThanOrEqual(3);
    expect(slate.additionalCandidates.length).toBeLessThanOrEqual(2);
    expect(slate.primaryCandidates[0]?.role).toBe('PRIMARY_1');
  });

  it('should instantiate and typecheck complex domain objects cleanly', () => {
    const vertex: SurfaceVertex = {
      space: 'fsLR_32k',
      hemisphere: 'L',
      vertexIndex: 18452,
      parcelName: 'p9-46v_L',
    };

    const circuit: TherapeuticCircuit = {
      id: 'circ-conv-mdd-001',
      code: 'CONVERGENT_DEPRESSION_CIRCUIT',
      name: 'Convergent Left Prefrontal Depression Circuit',
      primaryIndication: 'Major Depressive Disorder',
      symptomDomains: ['DOMAIN-MDD-DYSPHORIC-001', 'DOMAIN-MDD-ANXIOSOMATIC-001'],
      canonicalSourceParcel: 'p9-46v_L',
      canonicalTargetParcel: 'BA25_L',
      validationStatus: 'PROSPECTIVELY_VALIDATED',
      version: '1.0.0',
    };

    const family: TargetFamily = {
      id: 'fam-conv-ldlpfc-001',
      code: 'TF-MDD-CONVERGENT-LDLPFC-001',
      name: 'Convergent Left DLPFC Target Family',
      hemisphere: 'L',
      primaryHcpParcel: 'p9-46v_L',
      fallbackMniCoordinate: {
        space: 'MNI152NLin2009cAsym',
        x: -38,
        y: 44,
        z: 30,
      },
      maxAllowableDisplacementMm: 15,
      evidenceCeilingTier: 'T1',
    };

    const reliability: TargetReliabilityProfile = {
      candidateId: 'cand-001',
      scanDurationMinutes: 10,
      meanFramewiseDisplacementMm: 0.12,
      retainedFramesPercentage: 96.5,
      temporalSnr: 45.2,
      overallReliabilityScore: 0.88,
      isReliableForPersonalisation: true,
      warnings: [],
    };

    const phenotype: PhenotypeSnapshot = {
      id: 'snap-001',
      patientId: 'pat-001',
      primaryDiagnosis: 'Major Depressive Disorder',
      episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
      symptomScores: {
        dysphoriaScore: 0.9,
        anhedoniaScore: 0.8,
        anxiousSomaticScore: 0.3,
        ruminationScore: 0.6,
      },
      treatmentHistory: {
        medicationFailuresCount: 2,
        priorTmsExposure: false,
      },
      confirmedByClinicianId: 'clin-001',
      confirmedAt: '2026-09-01T10:00:00Z',
    };

    const decision: ClinicianDecision = {
      id: 'dec-001',
      slateId: 'slate-001',
      clinicianId: 'clin-001',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-001'],
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      decidedAt: '2026-09-01T11:00:00Z',
      digitalSignatureHash: 'a'.repeat(64),
      isImmutable: true,
    };

    expect(vertex.space).toBe('fsLR_32k');
    expect(circuit.validationStatus).toBe('PROSPECTIVELY_VALIDATED');
    expect(family.hemisphere).toBe('L');
    expect(reliability.isReliableForPersonalisation).toBe(true);
    expect(phenotype.episodeSeverity).toBe('SEVERE_WITHOUT_PSYCHOSIS');
    expect(decision.isImmutable).toBe(true);
  });

  it('should instantiate and validate Identity and Clinical Core domain entities', () => {
    const org = {
      id: 'a0000000-0000-0000-0000-000000000001',
      name: 'Magniom Clinic',
      slug: 'magniom-clinic',
      status: 'active' as const,
      createdAt: '2026-09-02T00:00:00Z',
      updatedAt: '2026-09-02T00:00:00Z',
    };

    const clinician = {
      id: 'c0000000-0000-0000-0000-000000000001',
      organisationId: org.id,
      fullName: 'Dr. Eleanor Vance',
      professionalType: 'Psychiatrist',
      tmsSigningAuthority: true,
      isVerifiedSpecialist: true,
      active: true,
      createdAt: '2026-09-02T00:00:00Z',
      updatedAt: '2026-09-02T00:00:00Z',
    };

    const patient = {
      id: 'd0000000-0000-0000-0000-000000000001',
      organisationId: org.id,
      displayLabel: 'SYNTH-PAT-01',
      status: 'active' as const,
      synthetic: true,
      createdAt: '2026-09-02T00:00:00Z',
    };

    const clinicalCase = {
      id: 'e0000000-0000-0000-0000-000000000001',
      organisationId: org.id,
      patientId: patient.id,
      caseCode: 'CASE-01',
      state: 'draft' as const,
      indicationCode: 'MDD',
      mode: 'CLINICAL' as const,
      version: 1,
      createdAt: '2026-09-02T00:00:00Z',
      updatedAt: '2026-09-02T00:00:00Z',
    };

    expect(clinician.tmsSigningAuthority).toBe(true);
    expect(patient.synthetic).toBe(true);
    expect(clinicalCase.version).toBe(1);
    expect(clinicalCase.state).toBe('draft');
  });

  it('should instantiate and validate Sprint 8 NeuroCompute and structural domain entities', () => {
    const study: import('./types.js').ImagingStudy = {
      id: 'img-study-001',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      studyUid: '1.2.840.113619.2.55.3.12345',
      scannerFieldStrengthT: 3.0,
      status: 'qc_pass',
      metadata: { manufacturer: 'Siemens', model: 'Prisma' },
      createdAt: '2026-09-02T00:00:00Z',
    };

    const qcMetrics: import('./types.js').StructuralQCMetrics = {
      snrT1w: 18.5,
      cnrT1w: 4.2,
      eulerHolesLh: 12,
      eulerHolesRh: 14,
      totalEulerNumber: -4,
      surfaceSelfIntersectionsLh: 0,
      surfaceSelfIntersectionsRh: 0,
      corticalThicknessMeanMm: 2.54,
      corticalThicknessStdMm: 0.42,
      corticalThicknessMinMm: 1.15,
      corticalThicknessMaxMm: 4.85,
      corticalThicknessOutlierFraction: 0.002,
      brainMaskVolumeMm3: 1450000,
      csfFraction: 0.15,
      gmFraction: 0.45,
      wmFraction: 0.4,
      mniRegistrationOverlapDice: 0.94,
      mniMutualInformation: 0.82,
    };

    const qcRun: import('./types.js').ImagingQCRun = {
      id: 'qc-run-001',
      organisationId: study.organisationId,
      imagingStudyId: study.id,
      pipelineVersionId: 'a0000000-0000-0000-0000-000000000001',
      status: 'pass',
      registrationQuality: 'HIGH',
      segmentationQuality: 'HIGH',
      metrics: qcMetrics,
      warnings: [],
      createdAt: '2026-09-02T00:00:00Z',
    };

    const pipelineManifest: import('./types.js').PipelineManifest = {
      schemaVersion: '1.0',
      runId: 'run-001',
      caseId: study.caseId,
      organisationId: study.organisationId,
      mode: 'RESEARCH',
      pipelineHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      software: [
        { name: 'dcm2niix', version: 'v1.0.20240202' },
        { name: 'magniom_neuro', version: '1.0.0' },
      ],
      inputFiles: [
        { path: 'dicom.zip', sha256: 'abc123...', sizeBytes: 150000000, artifactType: 'RAW_DICOM' },
      ],
      outputFiles: [
        {
          path: 'sub-MGN01_T1w.nii.gz',
          sha256: 'def456...',
          sizeBytes: 15000000,
          artifactType: 'T1_RECONSTRUCTION',
        },
      ],
      transformGraph: [
        {
          sourceSpace: 'NATIVE_T1W',
          targetSpace: 'MNI152NLin2009cAsym',
          transformType: 'NONLINEAR_WARP',
          transformFileSha256: 'warp123...',
        },
      ],
      stages: [
        {
          stageNumber: '01',
          stageName: 'BIDS_CONVERT',
          status: 'passed',
          startedAt: '2026-09-02T00:00:00Z',
          completedAt: '2026-09-02T00:01:00Z',
          durationSeconds: 60,
          inputHashes: ['abc123...'],
          outputHashes: ['def456...'],
          warnings: [],
          executionMetrics: {},
        },
      ],
      overallQcStatus: 'pass',
      warnings: [],
      startedAt: '2026-09-02T00:00:00Z',
      completedAt: '2026-09-02T00:05:00Z',
    };

    expect(study.scannerFieldStrengthT).toBe(3.0);
    expect(qcMetrics.corticalThicknessMeanMm).toBeGreaterThan(1.0);
    expect(qcMetrics.corticalThicknessMeanMm).toBeLessThan(5.0);
    expect(qcRun.status).toBe('pass');
    expect(pipelineManifest.mode).toBe('RESEARCH');
    expect(pipelineManifest.stages.length).toBe(1);
  });
});
