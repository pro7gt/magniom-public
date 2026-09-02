/**
 * Synthetic Structural Neuroimaging Fixtures for Sprint 8
 * 100% Synthetic — Zero Protected Health Information (PHI)
 */

import type {
  ImagingStudy,
  ImagingSeries,
  StructuralQCMetrics,
  ImagingQCRun,
  PipelineManifest,
  SurfaceMeshGeometry,
  BidsDatasetManifest,
  StructuralProcessingManifest,
} from '@magniom/domain';

export const SYNTHETIC_IMAGING_STUDY: ImagingStudy = {
  id: 'img-study-syn-001',
  organisationId: 'a0000000-0000-0000-0000-000000000001',
  caseId: 'e0000000-0000-0000-0000-000000000001',
  studyUid: '1.2.840.113619.2.55.3.syn001',
  scannerFieldStrengthT: 3.0,
  acquiredAt: '2026-09-02T08:00:00Z',
  status: 'qc_pass',
  metadata: {
    scanner: 'Siemens Prisma 3T',
    headCoil: '32-channel',
  },
  createdAt: '2026-09-02T08:15:00Z',
};

export const SYNTHETIC_T1W_SERIES: ImagingSeries = {
  id: 'img-series-t1w-001',
  organisationId: 'a0000000-0000-0000-0000-000000000001',
  imagingStudyId: 'img-study-syn-001',
  seriesType: 'T1w',
  seriesUid: '1.2.840.113619.2.55.3.syn001.1',
  runNumber: 1,
  metadata: {
    sequence: 'MPRAGE',
    TR_ms: 2500,
    TE_ms: 2.22,
    flipAngle_deg: 8,
    voxelSize_mm: [1.0, 1.0, 1.0],
  },
  createdAt: '2026-09-02T08:15:00Z',
};

export const SYNTHETIC_STRUCTURAL_QC_METRICS_PASS: StructuralQCMetrics = {
  snrT1w: 19.2,
  cnrT1w: 4.5,
  eulerHolesLh: 8,
  eulerHolesRh: 10,
  totalEulerNumber: 4,
  surfaceSelfIntersectionsLh: 0,
  surfaceSelfIntersectionsRh: 0,
  corticalThicknessMeanMm: 2.54,
  corticalThicknessStdMm: 0.38,
  corticalThicknessMinMm: 1.2,
  corticalThicknessMaxMm: 4.8,
  corticalThicknessOutlierFraction: 0.001,
  brainMaskVolumeMm3: 1480000.0,
  csfFraction: 0.14,
  gmFraction: 0.46,
  wmFraction: 0.4,
  mniRegistrationOverlapDice: 0.94,
  mniMutualInformation: 0.82,
};

export const SYNTHETIC_STRUCTURAL_QC_METRICS_FAIL: StructuralQCMetrics = {
  snrT1w: 8.5,
  cnrT1w: 2.1,
  eulerHolesLh: 52,
  eulerHolesRh: 48,
  totalEulerNumber: -96,
  surfaceSelfIntersectionsLh: 12,
  surfaceSelfIntersectionsRh: 15,
  corticalThicknessMeanMm: 1.65,
  corticalThicknessStdMm: 0.85,
  corticalThicknessMinMm: 0.45,
  corticalThicknessMaxMm: 6.2,
  corticalThicknessOutlierFraction: 0.08,
  brainMaskVolumeMm3: 1120000.0,
  csfFraction: 0.25,
  gmFraction: 0.4,
  wmFraction: 0.35,
  mniRegistrationOverlapDice: 0.72,
  mniMutualInformation: 0.54,
};

export const SYNTHETIC_SURFACE_MESH_FSLR32K: SurfaceMeshGeometry = {
  surfaceType: 'white',
  hemisphere: 'L',
  coordinateSpace: 'fsLR_32k',
  format: 'gifti_surf',
  vertexCount: 32492,
  triangleCount: 64980,
  vertices: [-38.5, 44.2, 30.1, -39.1, 45.0, 29.8],
  triangles: [0, 1, 2],
};

export const SYNTHETIC_PIPELINE_MANIFEST: PipelineManifest = {
  schemaVersion: '1.0',
  runId: 'run-structural-g02-01',
  caseId: 'e0000000-0000-0000-0000-000000000001',
  organisationId: 'a0000000-0000-0000-0000-000000000001',
  mode: 'RESEARCH',
  pipelineHash: '4a5e3789b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8',
  software: [
    { name: 'dcm2niix', version: 'v1.0.20240202' },
    { name: 'bids-validator', version: '1.11.1' },
    { name: 'magniom_neuro', version: '1.0.0' },
  ],
  inputFiles: [
    {
      path: 'org/a0000000-0000-0000-0000-000000000001/case/e0000000-0000-0000-0000-000000000001/study/img-study-syn-001/raw_dicom.zip',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      sizeBytes: 154280000,
      artifactType: 'RAW_DICOM',
    },
  ],
  outputFiles: [
    {
      path: 'sub-MGN7F3A92/anat/sub-MGN7F3A92_desc-preproc_T1w.nii.gz',
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      sizeBytes: 18450000,
      artifactType: 'T1_RECONSTRUCTION',
    },
    {
      path: 'sub-MGN7F3A92/surf/sub-MGN7F3A92.L.white.32k_fs_LR.surf.gii',
      sha256: 'b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
      sizeBytes: 4200000,
      artifactType: 'CORTICAL_SURFACE',
    },
  ],
  transformGraph: [
    {
      sourceSpace: 'NATIVE_T1W',
      targetSpace: 'MNI152NLin2009cAsym',
      transformType: 'NONLINEAR_WARP',
      transformFileSha256: 'c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
    },
    {
      sourceSpace: 'NATIVE_T1W',
      targetSpace: 'fsLR_32k',
      transformType: 'SPHERICAL_REGISTRATION',
      transformFileSha256: 'd4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
    },
  ],
  stages: [
    {
      stageNumber: '01',
      stageName: 'BIDS_CONVERT',
      status: 'passed',
      startedAt: '2026-09-02T08:16:00Z',
      completedAt: '2026-09-02T08:17:00Z',
      durationSeconds: 60,
      inputHashes: ['e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'],
      outputHashes: ['a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'],
      warnings: [],
      executionMetrics: { fileCount: 4 },
    },
    {
      stageNumber: '02',
      stageName: 'STRUCTURAL_PREPROCESS',
      status: 'passed',
      startedAt: '2026-09-02T08:17:00Z',
      completedAt: '2026-09-02T08:22:00Z',
      durationSeconds: 300,
      inputHashes: ['a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e'],
      outputHashes: ['c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a'],
      warnings: [],
      executionMetrics: { brainVolumeMm3: 1480000.0, diceOverlap: 0.94 },
    },
  ],
  overallQcStatus: 'pass',
  warnings: [],
  startedAt: '2026-09-02T08:16:00Z',
  completedAt: '2026-09-02T08:25:00Z',
};

export const SYNTHETIC_IMAGING_QC_RUN: ImagingQCRun = {
  id: 'qc-run-syn-001',
  organisationId: 'a0000000-0000-0000-0000-000000000001',
  imagingStudyId: 'img-study-syn-001',
  pipelineVersionId: 'a0000000-0000-0000-0000-000000000001',
  status: 'pass',
  registrationQuality: 'HIGH',
  segmentationQuality: 'HIGH',
  metrics: SYNTHETIC_STRUCTURAL_QC_METRICS_PASS,
  warnings: [],
  createdAt: '2026-09-02T08:25:00Z',
};

export const SYNTHETIC_BIDS_MANIFEST: BidsDatasetManifest = {
  bidsVersion: '1.11.1',
  datasetName: 'Magniom clinical connectomics input',
  subjectId: 'sub-MGN7F3A92',
  sessionCount: 1,
  seriesModalities: ['T1w', 'rest_bold'],
  files: [
    {
      path: 'dataset_description.json',
      sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      sizeBytes: 154,
    },
    {
      path: 'sub-MGN7F3A92/anat/sub-MGN7F3A92_T1w.nii.gz',
      sha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
      sizeBytes: 15000000,
      artifactType: 'BIDS_NIFTI',
    },
  ],
  generatedAt: '2026-09-02T08:17:00Z',
};

export const SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST: StructuralProcessingManifest = {
  t1wBiasCorrectedSha256: 'a1b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e',
  brainMaskSha256: 'b2c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f',
  tissueSegmentationSha256: 'c3d4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a',
  nativeToMniWarpSha256: 'd4e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b',
  mniToNativeWarpSha256: 'e5f60718293a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c',
  qcMetrics: SYNTHETIC_STRUCTURAL_QC_METRICS_PASS,
  files: [],
  generatedAt: '2026-09-02T08:22:00Z',
};
