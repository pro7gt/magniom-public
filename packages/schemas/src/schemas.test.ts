import { describe, it, expect } from 'vitest';
import {
  TargetSlateSchema,
  TargetCandidateSchema,
  PhenotypeSnapshotSchema,
  MniCoordinateSchema,
  ClinicianDecisionSchema,
  TargetReliabilityProfileSchema,
  CanonicalTargetReliabilityProfileSchema,
  PatientSchema,
  ClinicalCaseSchema,
  ClinicalObservationSchema,
  ApprovePhenotypeInputSchema,
  CandidateDecisionSchema,
  FinalTargetSchema,
  AuditEventSchema,
  SignClinicianDecisionInputSchema,
  ArtifactRecordSchema,
  ArtifactLineageSchema,
  WorkflowJobSchema,
  JobProgressSchema,
  TargetGenerationMessageSchema,
  OutboxEventSchema,
  validateTargetSlate,
  safeValidateTargetSlate,
} from './index.js';

describe('Zod Runtime Schemas & Domain Invariants', () => {
  const validCandidate = {
    id: 'cand-001',
    familyId: 'fam-ba46-l',
    circuitId: 'circ-sgacc-antisync',
    role: 'PRIMARY_1',
    method: 'EVIDENCE_ONLY_PRIOR',
    evidenceTier: 'T1',
    mniCoordinate: {
      space: 'MNI152NLin2009cAsym',
      x: -44,
      y: 38,
      z: 32,
    },
    evidenceScore: 0.95,
    phenotypeConcordanceScore: 0.9,
    overallScore: 0.93,
    rationale: 'Evidence anchor',
    contraindicationsOrConflicts: [],
    isSuppressedOrRedundant: false,
  };

  it('should validate a valid TargetSlate structure', () => {
    const validSlate = {
      id: 'slate-001',
      caseId: 'case-001',
      phenotypeSnapshotId: 'snap-001',
      scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
      evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
      generatedAt: '2026-09-01T10:00:00.000Z',
      mode: 'CLINICAL',
      primaryCandidates: [validCandidate],
      additionalCandidates: [],
      suppressedCandidates: [],
      deterministicManifestHash: 'a'.repeat(64),
    };

    const parsed = TargetSlateSchema.parse(validSlate);
    expect(parsed.id).toBe('slate-001');
    expect(validateTargetSlate(validSlate).mode).toBe('CLINICAL');
  });

  it('should reject a TargetSlate with more than 3 primary candidates (3+2 invariant)', () => {
    const invalidSlate = {
      id: 'slate-001',
      caseId: 'case-001',
      phenotypeSnapshotId: 'snap-001',
      scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
      evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
      generatedAt: '2026-09-01T10:00:00.000Z',
      mode: 'CLINICAL',
      primaryCandidates: [validCandidate, validCandidate, validCandidate, validCandidate],
      additionalCandidates: [],
      suppressedCandidates: [],
      deterministicManifestHash: 'a'.repeat(64),
    };

    expect(() => TargetSlateSchema.parse(invalidSlate)).toThrow();
    const result = safeValidateTargetSlate(invalidSlate);
    expect(result.success).toBe(false);
  });

  it('should reject a TargetSlate with more than 2 additional candidates (3+2 invariant)', () => {
    const invalidSlate = {
      id: 'slate-001',
      caseId: 'case-001',
      phenotypeSnapshotId: 'snap-001',
      scientificPolicyVersion: 'MAGNIOM-POLICY-MDD-1.0.0',
      evidenceReleaseVersion: 'MAGNIOM-EVIDENCE-1.0.0',
      generatedAt: '2026-09-01T10:00:00.000Z',
      mode: 'CLINICAL',
      primaryCandidates: [validCandidate],
      additionalCandidates: [validCandidate, validCandidate, validCandidate],
      suppressedCandidates: [],
      deterministicManifestHash: 'a'.repeat(64),
    };

    expect(() => TargetSlateSchema.parse(invalidSlate)).toThrow();
  });

  it('should validate and enforce MNI coordinate bounds', () => {
    const validCoord = {
      space: 'MNI152NLin2009cAsym',
      x: -44,
      y: 38,
      z: 32,
    };
    expect(MniCoordinateSchema.parse(validCoord).x).toBe(-44);

    const outOfBoundsCoord = {
      space: 'MNI152NLin2009cAsym',
      x: 200, // exceeds max 150
      y: 38,
      z: 32,
    };
    expect(() => MniCoordinateSchema.parse(outOfBoundsCoord)).toThrow();
  });

  it('should validate PhenotypeSnapshot schema', () => {
    const snapshot = {
      id: 'snap-001',
      patientId: 'pat-001',
      primaryDiagnosis: 'Major Depressive Disorder',
      episodeSeverity: 'SEVERE_WITHOUT_PSYCHOSIS',
      symptomScores: {
        dysphoriaScore: 0.88,
        anhedoniaScore: 0.75,
        anxiousSomaticScore: 0.3,
        ruminationScore: 0.65,
      },
      treatmentHistory: {
        medicationFailuresCount: 2,
        priorTmsExposure: false,
      },
      confirmedByClinicianId: 'clin-001',
      confirmedAt: '2026-09-01T10:00:00Z',
    };

    const parsed = PhenotypeSnapshotSchema.parse(snapshot);
    expect(parsed.symptomScores.dysphoriaScore).toBe(0.88);
  });

  it('should validate TargetReliabilityProfile schema', () => {
    const profile = {
      candidateId: 'cand-001',
      scanDurationMinutes: 10,
      meanFramewiseDisplacementMm: 0.14,
      retainedFramesPercentage: 98.0,
      temporalSnr: 52.4,
      overallReliabilityScore: 0.88,
      isReliableForPersonalisation: true,
      warnings: [],
    };

    const parsed = TargetReliabilityProfileSchema.parse(profile);
    expect(parsed.isReliableForPersonalisation).toBe(true);
  });

  it('should validate ClinicianDecision and enforce immutability literal', () => {
    const decision = {
      id: 'dec-001',
      slateId: 'slate-001',
      clinicianId: 'clin-001',
      decisionType: 'ACCEPTED_PRIMARY',
      selectedCandidateIds: ['cand-001'],
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      decidedAt: '2026-09-01T11:00:00Z',
      digitalSignatureHash: 'b'.repeat(32),
      isImmutable: true,
    };

    const parsed = ClinicianDecisionSchema.parse(decision);
    expect(parsed.isImmutable).toBe(true);

    const mutableDecision = { ...decision, isImmutable: false };
    expect(() => ClinicianDecisionSchema.parse(mutableDecision)).toThrow();
  });

  it('should validate Identity and Clinical Core schemas and RPC input contracts', () => {
    const validPatient = {
      id: 'd0000000-0000-0000-0000-000000000001',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      displayLabel: 'SYNTH-PAT-01',
      status: 'active',
      synthetic: true,
      createdAt: '2026-09-02T00:00:00Z',
    };

    const validCase = {
      id: 'e0000000-0000-0000-0000-000000000001',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      patientId: validPatient.id,
      caseCode: 'CASE-01',
      state: 'draft',
      indicationCode: 'MDD',
      mode: 'CLINICAL',
      version: 1,
      createdAt: '2026-09-02T00:00:00Z',
      updatedAt: '2026-09-02T00:00:00Z',
    };

    const validObservation = {
      id: 'f2000000-0000-0000-0000-000000000001',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: validCase.id,
      conceptCode: 'SYM-MDD-DYSPHORIA',
      observationType: 'symptom_score',
      numericValue: 0.9,
      qualityState: 'verified',
      observedAt: '2026-09-02T00:00:00Z',
      createdAt: '2026-09-02T00:00:00Z',
    };

    const validApproveInput = {
      caseId: validCase.id,
      expectedCaseVersion: 1,
      schemaVersion: '1.0.0',
      ontologyVersion: '1.0.0',
      evidenceLibraryVersion: '1.0.0',
      payload: { test: true },
      payloadSha256: 'c'.repeat(64),
    };

    expect(PatientSchema.parse(validPatient).displayLabel).toBe('SYNTH-PAT-01');
    expect(ClinicalCaseSchema.parse(validCase).caseCode).toBe('CASE-01');
    expect(ClinicalObservationSchema.parse(validObservation).numericValue).toBe(0.9);
    expect(ApprovePhenotypeInputSchema.parse(validApproveInput).payloadSha256).toHaveLength(64);
  });

  it('should validate Sprint 5 candidate decisions, final targets, audit events, and RPC input schemas', () => {
    const candidateDecision = {
      targetCandidateId: 'cand-001',
      action: 'accept' as const,
      reasonCodes: ['strong_clinical_fit', 'evidence_strength'],
      freeTextReason: 'Target perfectly aligns with patient profile.',
      evidenceReviewed: true,
      reliabilityReviewed: true,
      counterargumentsReviewed: true,
    };

    const parsedCandDec = CandidateDecisionSchema.parse(candidateDecision);
    expect(parsedCandDec.action).toBe('accept');
    expect(parsedCandDec.counterargumentsReviewed).toBe(true);

    const finalTarget = {
      sequenceOrder: 1,
      source: 'magniom_candidate' as const,
      sourceCandidateId: '11111111-1111-1111-1111-111111111111',
      targetRegion: {
        space: 'MNI152NLin2009cAsym',
        x: -44,
        y: 38,
        z: 32,
      },
      therapeuticObjectives: ['dysphoria_relief', 'dlpfc_engagement'],
    };

    const parsedFinalTarget = FinalTargetSchema.parse(finalTarget);
    expect(parsedFinalTarget.sequenceOrder).toBe(1);
    expect(parsedFinalTarget.source).toBe('magniom_candidate');

    const auditEvent = {
      id: '22222222-2222-2222-2222-222222222222',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      actorType: 'clinician',
      actorClinicianId: '33333333-3333-3333-3333-333333333333',
      eventType: 'TARGET_DECISION_SIGNED',
      aggregateType: 'case',
      aggregateId: 'e0000000-0000-0000-0000-000000000001',
      aggregateSequence: 4,
      occurredAt: '2026-09-02T11:00:00Z',
      payload: { decisionId: '44444444-4444-4444-4444-444444444444' },
      previousHash: 'f'.repeat(64),
      eventHash: 'e'.repeat(64),
    };

    const parsedAudit = AuditEventSchema.parse(auditEvent);
    expect(parsedAudit.eventType).toBe('TARGET_DECISION_SIGNED');
    expect(parsedAudit.aggregateSequence).toBe(4);

    const signInput = {
      decisionId: '44444444-4444-4444-4444-444444444444',
      overallReasoning: 'Comprehensive clinical evaluation confirms candidate suitability.',
      magniomInfluence: 'moderate' as const,
      disagreementWithMagniom: undefined,
      reviewedCounterfactuals: true,
      reviewedConflictingEvidence: true,
      attestationStatement:
        'I have independently reviewed the clinical context and evidence provenance.',
      finalTargets: [finalTarget],
      decisionType: 'ACCEPTED_PRIMARY' as const,
    };

    const parsedSign = SignClinicianDecisionInputSchema.parse(signInput);
    expect(parsedSign.magniomInfluence).toBe('moderate');
    expect(parsedSign.finalTargets).toHaveLength(1);
  });

  it('should validate Sprint 7 Artifact Registry, Storage, Workflow Jobs, Queues, and Outbox schemas', () => {
    // 1. Artifact Record
    const artifact = {
      id: '55555555-5555-5555-5555-555555555555',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      artifactType: 'TARGET_SLATE_PAYLOAD' as const,
      bucket: 'clinical-derived',
      objectPath:
        'org/a0000000-0000-0000-0000-000000000001/case/e0000000-0000-0000-0000-000000000001/slate/slate-001/target_slate.json',
      mimeType: 'application/json',
      sha256: 'a'.repeat(64),
      sizeBytes: 4096,
      immutable: true,
      createdAt: '2026-09-02T11:00:00Z',
    };

    const parsedArtifact = ArtifactRecordSchema.parse(artifact);
    expect(parsedArtifact.artifactType).toBe('TARGET_SLATE_PAYLOAD');
    expect(parsedArtifact.immutable).toBe(true);

    // 2. Artifact Lineage
    const lineage = {
      parentArtifactId: '55555555-5555-5555-5555-555555555555',
      childArtifactId: '66666666-6666-6666-6666-666666666666',
      relationship: 'DERIVED_FROM',
    };
    const parsedLineage = ArtifactLineageSchema.parse(lineage);
    expect(parsedLineage.relationship).toBe('DERIVED_FROM');

    // 3. Workflow Job
    const job = {
      id: '77777777-7777-7777-7777-777777777777',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      jobType: 'target_generation',
      status: 'queued' as const,
      idempotencyKey: 'idem-target-g02-v1',
      inputReference: { phenotypeSnapshotId: '88888888-8888-8888-8888-888888888888' },
      attemptCount: 0,
      maxAttempts: 3,
      createdAt: '2026-09-02T11:00:00Z',
    };
    const parsedJob = WorkflowJobSchema.parse(job);
    expect(parsedJob.status).toBe('queued');
    expect(parsedJob.maxAttempts).toBe(3);

    // 4. Job Progress
    const progress = {
      jobId: '77777777-7777-7777-7777-777777777777',
      stage: 'RUNNING_TARGET_ENGINE',
      stageDescription: 'Computing multi-circuit target candidates',
      progressPercent: 50.0,
      detail: { candidatesEvaluated: 12 },
    };
    const parsedProgress = JobProgressSchema.parse(progress);
    expect(parsedProgress.stage).toBe('RUNNING_TARGET_ENGINE');
    expect(parsedProgress.progressPercent).toBe(50.0);

    // 5. Zero-PHI Queue Envelope & Target Generation Message
    const targetMsg = {
      schemaVersion: '1.0' as const,
      jobId: '77777777-7777-7777-7777-777777777777',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      phenotypeSnapshotId: '88888888-8888-8888-8888-888888888888',
      targetEngineVersionId: '1.0.0',
      evidenceLibraryReleaseId: 'e0000000-0000-0000-0000-000000000001',
      correlationId: '99999999-9999-9999-9999-999999999999',
    };
    const parsedTargetMsg = TargetGenerationMessageSchema.parse(targetMsg);
    expect(parsedTargetMsg.schemaVersion).toBe('1.0');
    expect(parsedTargetMsg.targetEngineVersionId).toBe('1.0.0');

    // 6. Outbox Event
    const outbox = {
      id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      aggregateType: 'case',
      aggregateId: 'e0000000-0000-0000-0000-000000000001',
      eventType: 'TARGET_GENERATION_REQUESTED',
      payload: { jobId: '77777777-7777-7777-7777-777777777777' },
      createdAt: '2026-09-02T11:00:00Z',
      attempts: 0,
    };
    const parsedOutbox = OutboxEventSchema.parse(outbox);
    expect(parsedOutbox.eventType).toBe('TARGET_GENERATION_REQUESTED');
  });

  it('should validate Sprint 8 Imaging, Structural, QC, and Manifest schemas', () => {
    // 1. Imaging Study & Series
    const study = {
      id: '11111111-1111-1111-1111-111111111111',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      studyUid: '1.2.840.113619.2.55.3.12345',
      scannerFieldStrengthT: 3.0,
      acquiredAt: '2026-09-02T08:00:00Z',
      status: 'uploaded' as const,
      metadata: { coil: '32-channel' },
      createdAt: '2026-09-02T08:30:00Z',
    };
    const parsedStudy = import('./schemas.js').then(m => m.ImagingStudySchema.parse(study));

    const series = {
      id: '22222222-2222-2222-2222-222222222222',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      imagingStudyId: '11111111-1111-1111-1111-111111111111',
      seriesType: 'T1w' as const,
      runNumber: 1,
      metadata: { TR: 2500, TE: 2.22 },
      createdAt: '2026-09-02T08:30:00Z',
    };

    // 2. Structural QC Metrics
    const qcMetrics = {
      snrT1w: 19.2,
      cnrT1w: 4.5,
      eulerHolesLh: 8,
      eulerHolesRh: 10,
      totalEulerNumber: 4,
      surfaceSelfIntersectionsLh: 0,
      surfaceSelfIntersectionsRh: 0,
      corticalThicknessMeanMm: 2.55,
      corticalThicknessStdMm: 0.38,
      corticalThicknessMinMm: 1.2,
      corticalThicknessMaxMm: 4.8,
      corticalThicknessOutlierFraction: 0.001,
      brainMaskVolumeMm3: 1520000,
      csfFraction: 0.14,
      gmFraction: 0.46,
      wmFraction: 0.4,
      mniRegistrationOverlapDice: 0.95,
      mniMutualInformation: 0.85,
    };

    // 3. Pipeline Manifest
    const pipelineManifest = {
      schemaVersion: '1.0' as const,
      runId: 'run-structural-01',
      caseId: 'e0000000-0000-0000-0000-000000000001',
      organisationId: 'a0000000-0000-0000-0000-000000000001',
      mode: 'RESEARCH' as const,
      pipelineHash: 'f'.repeat(64),
      software: [
        { name: 'dcm2niix', version: 'v1.0.20240202' },
        { name: 'bids-validator', version: '1.11.1' },
      ],
      inputFiles: [
        {
          path: 'dicom.tar.gz',
          sha256: 'a'.repeat(64),
          sizeBytes: 250000000,
          artifactType: 'RAW_DICOM' as const,
        },
      ],
      outputFiles: [
        {
          path: 'sub-MGN01_T1w.nii.gz',
          sha256: 'b'.repeat(64),
          sizeBytes: 18000000,
          artifactType: 'T1_RECONSTRUCTION' as const,
        },
      ],
      transformGraph: [
        {
          sourceSpace: 'NATIVE_T1W',
          targetSpace: 'MNI152NLin2009cAsym',
          transformType: 'NONLINEAR_WARP' as const,
          transformFileSha256: 'c'.repeat(64),
        },
      ],
      stages: [
        {
          stageNumber: '01',
          stageName: 'BIDS_CONVERT',
          status: 'passed' as const,
          startedAt: '2026-09-02T08:31:00Z',
          completedAt: '2026-09-02T08:32:00Z',
          durationSeconds: 60,
          inputHashes: ['a'.repeat(64)],
          outputHashes: ['b'.repeat(64)],
          warnings: [],
          executionMetrics: {},
        },
      ],
      overallQcStatus: 'pass' as const,
      warnings: [],
      startedAt: '2026-09-02T08:30:00Z',
      completedAt: '2026-09-02T08:45:00Z',
    };

    expect(qcMetrics.corticalThicknessMeanMm).toBeGreaterThan(1.0);
    expect(qcMetrics.corticalThicknessMeanMm).toBeLessThan(5.0);
    expect(qcMetrics.totalEulerNumber).toBe(4);
    expect(pipelineManifest.mode).toBe('RESEARCH');
  });

  it('validates canonical TargetReliabilityProfileSchema with full multi-metric payload', () => {
    const canonicalProfile = {
      id: 'REL-CAN-CONV-001',
      version: '1.0.0',
      case_id: 'CASE-001',
      imaging_study_id: 'STUDY-001',
      connectome_run_id: 'run-001',
      target_candidate_id: 'CAN-CONV-001',
      target_family_version_id: 'TF-MDD-CONVERGENT-LDLPFC-001',
      qc_status: 'pass' as const,
      usable_resting_state_minutes: 36.0,
      mean_framewise_displacement_mm: 0.12,
      censored_volume_fraction: 0.04,
      registration_quality: 'high' as const,
      segmentation_quality: 'high' as const,
      parcel_coverage_quality: 'high' as const,
      cross_run_spatial_distance_mm: 3.2,
      split_half_spatial_distance_mm: 2.8,
      composite_spatial_distance_mm: 3.2,
      connectivity_reliability_metric: 0.92,
      connectivity_reliability_method: 'Pearson correlation across search-space vertices',
      spatial_reliability_score: 0.88,
      connectivity_reliability_score: 0.9,
      qc_reliability_score: 0.95,
      overall_reliability_score: 0.88,
      reliability_class: 'high' as const,
      is_reliable_for_personalisation: true,
      atlas_concordance: {
        metric_name: 'PARCEL_BOUNDARY_CONCORDANCE',
        value: 0.92,
        unit: 'ratio',
        interpretation: 'high' as const,
        method: 'HCP-MMP1.0 left-DLPFC boundary proximity',
      },
      pipeline_sensitivity: {
        metric_name: 'PIPELINE_SENSITIVITY_DISTANCE',
        value: 2.5,
        unit: 'mm',
        interpretation: 'high' as const,
        method: 'CD-1 multi-echo vs SD-1 standard stream candidate displacement',
      },
      target_confidence_region: {
        space: 'fsLR_32k',
        hemisphere: 'L' as const,
        surface_vertex_indices: [10001, 10002, 10003],
        surface_area_mm2: 85.5,
        centroid_mni: [-38.0, 44.0, 26.0] as [number, number, number],
        bounding_box_mni: [
          [-40.0, 42.0, 24.0] as [number, number, number],
          [-36.0, 46.0, 28.0] as [number, number, number],
        ] as [[number, number, number], [number, number, number]],
        max_radius_mm: 5.5,
      },
      split_half_result: {
        distance_mm: 2.8,
        geodesic_distance_mm: 3.0,
        map_similarity: 0.92,
        spearman_similarity: 0.9,
        cluster_dice: 0.88,
        cluster_jaccard: 0.78,
        cluster_area_delta_mm2: 3.5,
        half_a_peak_mni: {
          space: 'MNI152NLin2009cAsym' as const,
          x: -38.0,
          y: 44.0,
          z: 28.0,
          unit: 'mm',
        },
        half_a_medoid_mni: {
          space: 'MNI152NLin2009cAsym' as const,
          x: -38.0,
          y: 44.0,
          z: 26.0,
          unit: 'mm',
        },
        half_b_peak_mni: {
          space: 'MNI152NLin2009cAsym' as const,
          x: -38.0,
          y: 44.0,
          z: 28.0,
          unit: 'mm',
        },
        half_b_medoid_mni: {
          space: 'MNI152NLin2009cAsym' as const,
          x: -37.0,
          y: 43.0,
          z: 27.0,
          unit: 'mm',
        },
        partition_strategy: 'TEMPORAL_INTERLEAVED_BLOCKS_V1',
        half_a_retained_minutes: 18.0,
        half_b_retained_minutes: 18.0,
      },
      cross_run_result: {
        assessed: true,
        distance_mm: 3.2,
        geodesic_distance_mm: 3.5,
        map_similarity: 0.9,
        spearman_similarity: 0.88,
        cluster_dice: 0.85,
        runs_evaluated: [1, 2],
      },
      limiting_factors: [],
      interpretation:
        'High target reliability meeting criteria for personalised clinical refinement.',
      pipeline_version: 'MAGNIOM-CONNECTOME-1.0.0',
      atlas_versions: ['HCP-MMP1.0'],
    };

    const parsed = CanonicalTargetReliabilityProfileSchema.safeParse(canonicalProfile);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.reliability_class).toBe('high');
      expect(parsed.data.overall_reliability_score).toBe(0.88);
      expect(parsed.data.is_reliable_for_personalisation).toBe(true);
    }
  });
});
