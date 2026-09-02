/**
 * @magniom/workflow-worker
 * SPRINT 8 Verification Suite: NeuroCompute Ingest & Structural Processing
 * Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 112 (Sprint 8)
 * and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0
 */

import { describe, it, expect } from 'vitest';
import {
  validateDicomIngestJobPayload,
  validateStructuralProcessingJobPayload,
  validateStructuralQCMetrics,
  validatePipelineManifest,
  validateSurfaceMeshGeometry,
  validateStageManifest,
} from '@magniom/schemas';
import {
  SYNTHETIC_IMAGING_STUDY,
  SYNTHETIC_T1W_SERIES,
  SYNTHETIC_STRUCTURAL_QC_METRICS_PASS,
  SYNTHETIC_STRUCTURAL_QC_METRICS_FAIL,
  SYNTHETIC_SURFACE_MESH_FSLR32K,
  SYNTHETIC_PIPELINE_MANIFEST,
  SYNTHETIC_BIDS_MANIFEST,
  SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST,
  SYNTHETIC_IMAGING_QC_RUN,
} from '@magniom/test-fixtures';
import { computeSha256 } from '@magniom/scientific-policy';

describe('SPRINT 8: NeuroCompute Ingest + Structural Verification Suite', () => {
  describe('1. DICOM/BIDS Ingestion & Zero-PHI Compliance', () => {
    it('validates synthetic imaging study and series conforming to 3T standards', () => {
      expect(SYNTHETIC_IMAGING_STUDY.scannerFieldStrengthT).toBeGreaterThanOrEqual(3.0);
      expect(SYNTHETIC_IMAGING_STUDY.status).toBe('qc_pass');
      expect(SYNTHETIC_T1W_SERIES.seriesType).toBe('T1w');
      expect(SYNTHETIC_T1W_SERIES.metadata['voxelSize_mm']).toEqual([1.0, 1.0, 1.0]);
    });

    it('validates zero-PHI BIDS dataset manifest conforming to BIDS 1.11.1', () => {
      expect(SYNTHETIC_BIDS_MANIFEST.bidsVersion).toBe('1.11.1');
      expect(SYNTHETIC_BIDS_MANIFEST.subjectId).toMatch(/^sub-MGN[0-9A-F]{6}$/);
      expect(SYNTHETIC_BIDS_MANIFEST.files.length).toBeGreaterThan(0);
      for (const file of SYNTHETIC_BIDS_MANIFEST.files) {
        expect(file.sha256).toHaveLength(64);
      }
    });

    it('validates DICOM ingest queue payload schema', () => {
      const validPayload = validateDicomIngestJobPayload({
        organisationId: 'a0000000-0000-0000-0000-000000000001',
        caseId: 'e0000000-0000-0000-0000-000000000001',
        imagingStudyId: 'img-study-syn-001',
        rawDicomBucket: 'clinical-ingest',
        rawDicomObjectPath: 'org/a0000000-0000-0000-0000-000000000001/case/e0000000-0000-0000-0000-000000000001/dicom.zip',
        pseudonymousSubjectId: 'sub-MGN7F3A92',
      });
      expect(validPayload.pseudonymousSubjectId).toBe('sub-MGN7F3A92');
      expect(validPayload.rawDicomBucket).toBe('clinical-ingest');
    });
  });

  describe('2. Structural Processing & Spatial Normalization', () => {
    it('validates structural processing manifest with 64-character SHA-256 hashes', () => {
      expect(SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST.t1wBiasCorrectedSha256).toHaveLength(64);
      expect(SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST.brainMaskSha256).toHaveLength(64);
      expect(SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST.tissueSegmentationSha256).toHaveLength(64);
      expect(SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST.nativeToMniWarpSha256).toHaveLength(64);
      expect(SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST.mniToNativeWarpSha256).toHaveLength(64);
    });

    it('enforces tissue segmentation volume proportions sum to 1.0', () => {
      const qc = SYNTHETIC_STRUCTURAL_PROCESSING_MANIFEST.qcMetrics;
      const totalFraction = qc.csfFraction + qc.gmFraction + qc.wmFraction;
      expect(totalFraction).toBeCloseTo(1.0, 4);
      expect(qc.brainMaskVolumeMm3).toBeGreaterThan(1000000.0);
    });

    it('validates structural processing queue payload schema', () => {
      const payload = validateStructuralProcessingJobPayload({
        organisationId: 'a0000000-0000-0000-0000-000000000001',
        caseId: 'e0000000-0000-0000-0000-000000000001',
        imagingStudyId: 'img-study-syn-001',
        connectomicsRunId: 'run-001',
        bidsDatasetBucket: 'clinical-ingest',
        bidsDatasetPath: 'org/a/case/e/bids',
        pipelineVersionId: 'a0000000-0000-0000-0000-000000000001',
        atlasId: 'b0000000-0000-0000-0000-000000000001',
        mode: 'RESEARCH',
      });
      expect(payload.connectomicsRunId).toBe('run-001');
    });
  });

  describe('3. Cortical Surface Meshes & fsLR-32k Standard Alignment', () => {
    it('validates fsLR-32k surface mesh geometry schema', () => {
      const surface = validateSurfaceMeshGeometry(SYNTHETIC_SURFACE_MESH_FSLR32K);
      expect(surface.coordinateSpace).toBe('fsLR_32k');
      expect(surface.vertexCount).toBe(32492);
      expect(surface.triangleCount).toBe(64980);
      expect(surface.format).toBe('gifti_surf');
      expect(surface.hemisphere).toBe('L');
    });
  });

  describe('4. Structural Quality Control (QC) Engine & Gate Evaluation', () => {
    it('validates passing structural QC metrics within canonical bounds', () => {
      const metrics = validateStructuralQCMetrics(SYNTHETIC_STRUCTURAL_QC_METRICS_PASS);
      expect(metrics.snrT1w).toBeGreaterThanOrEqual(15.0);
      expect(metrics.cnrT1w).toBeGreaterThanOrEqual(3.5);
      expect(metrics.eulerHolesLh).toBeLessThanOrEqual(20);
      expect(metrics.eulerHolesRh).toBeLessThanOrEqual(20);
      expect(metrics.corticalThicknessMeanMm).toBeGreaterThanOrEqual(2.0);
      expect(metrics.corticalThicknessMeanMm).toBeLessThanOrEqual(3.0);
      expect(metrics.mniRegistrationOverlapDice).toBeGreaterThanOrEqual(0.88);
    });

    it('detects failing QC metrics violating biological and registration bounds', () => {
      const failMetrics = SYNTHETIC_STRUCTURAL_QC_METRICS_FAIL;
      expect(failMetrics.snrT1w).toBeLessThan(10.0);
      expect(failMetrics.cnrT1w).toBeLessThan(2.5);
      expect(failMetrics.eulerHolesLh).toBeGreaterThan(40);
      expect(failMetrics.mniRegistrationOverlapDice).toBeLessThan(0.80);
    });

    it('validates imaging QC run entity with High quality registration and segmentation', () => {
      expect(SYNTHETIC_IMAGING_QC_RUN.status).toBe('pass');
      expect(SYNTHETIC_IMAGING_QC_RUN.registrationQuality).toBe('HIGH');
      expect(SYNTHETIC_IMAGING_QC_RUN.segmentationQuality).toBe('HIGH');
    });
  });

  describe('5. Manifests, Artifact Hashes & Lineage Verification', () => {
    it('validates canonical pipeline-manifest.json schema', () => {
      const manifest = validatePipelineManifest(SYNTHETIC_PIPELINE_MANIFEST);
      expect(manifest.schemaVersion).toBe('1.0');
      expect(manifest.mode).toBe('RESEARCH');
      expect(manifest.pipelineHash).toHaveLength(64);
      expect(manifest.software.length).toBeGreaterThanOrEqual(3);
      expect(manifest.inputFiles.length).toBeGreaterThan(0);
      expect(manifest.outputFiles.length).toBeGreaterThan(0);
      expect(manifest.transformGraph.length).toBeGreaterThanOrEqual(2);
      expect(manifest.stages.length).toBeGreaterThanOrEqual(2);
    });

    it('verifies stage manifest schema for BIDS and Structural stages', () => {
      for (const stage of SYNTHETIC_PIPELINE_MANIFEST.stages) {
        const validatedStage = validateStageManifest(stage);
        expect(validatedStage.status).toBe('passed');
        expect(validatedStage.durationSeconds).toBeGreaterThan(0);
      }
    });

    it('verifies deterministic computation of SHA-256 digests', () => {
      const testContent = { test: 'magniom_sprint_8_deterministic_manifest' };
      const hash1 = computeSha256(testContent);
      const hash2 = computeSha256(testContent);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });
  });

  describe('6. Research Mode Boundary Enforcement', () => {
    it('strictly isolates Sprint 8 compute execution under mode = RESEARCH', () => {
      expect(SYNTHETIC_PIPELINE_MANIFEST.mode).toBe('RESEARCH');
      expect(SYNTHETIC_PIPELINE_MANIFEST.mode).not.toBe('CLINICAL');
    });
  });
});
