"""
Integration Tests for NeuroCompute Ingest & Structural Worker Workflow
"""

import unittest
import tempfile
import shutil
import os
from magniom_neuro.worker.job_handlers import IngestAndStructuralJobHandler
from magniom_neuro.worker.queue_consumer import QueueConsumer


class TestWorkerIntegration(unittest.TestCase):
    """End-to-end integration test of the complete Sprint 8 ingestion and structural compute pipeline."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.handler = IngestAndStructuralJobHandler(work_dir=self.test_dir)
        self.consumer = QueueConsumer(handler=self.handler)

        # Create synthetic input DICOM archive file
        self.synthetic_dicom_path = os.path.join(self.test_dir, "synthetic_dicom.zip")
        with open(self.synthetic_dicom_path, "wb") as f:
            f.write(b"SYNTHETIC_DICOM_ARCHIVE_DATA:3T:T1w:REST_BOLD")

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_end_to_end_job_execution(self):
        result = self.handler.execute_job(
            organisation_id="a0000000-0000-0000-0000-000000000001",
            case_id="e0000000-0000-0000-0000-000000000001",
            imaging_study_id="11111111-1111-1111-1111-111111111111",
            connectomics_run_id="run-test-e2e-01",
            raw_dicom_path=self.synthetic_dicom_path,
            mode="RESEARCH",
        )

        self.assertEqual(result["status"], "succeeded")
        self.assertEqual(result["qc_status"], "pass")
        self.assertEqual(result["mode"], "RESEARCH")
        self.assertTrue(result["subject_id"].startswith("sub-MGN"))
        self.assertEqual(len(result["pipeline_hash"]), 64)
        self.assertGreaterEqual(result["stages_count"], 6)  # BIDS, Structural, fMRIPrep, Tedana, Denoise, Surfaces

        # Check that stage manifests and pipeline manifest exist on disk
        manifests_dir = os.path.join(self.test_dir, "run-test-e2e-01", "manifests")
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "01-bids.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "02-structural.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "03-fmriprep.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "04-tedana.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "05-denoise.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "06-surface.json")))
        self.assertTrue(os.path.exists(os.path.join(manifests_dir, "pipeline-manifest.json")))

    def test_queue_consumer_envelope_dispatch(self):
        envelope = {
            "schemaVersion": "1.0",
            "jobId": "job-queue-001",
            "organisationId": "a0000000-0000-0000-0000-000000000001",
            "caseId": "e0000000-0000-0000-0000-000000000001",
            "correlationId": "corr-001",
            "requestedOperation": "INGEST_AND_STRUCTURAL",
            "createdAt": "2026-09-02T10:00:00Z",
            "payload": {
                "imagingStudyId": "11111111-1111-1111-1111-111111111111",
                "connectomicsRunId": "run-queue-001",
                "rawDicomObjectPath": self.synthetic_dicom_path,
                "mode": "RESEARCH",
            },
        }

        result = self.consumer.process_envelope(envelope)
        self.assertEqual(result["status"], "succeeded")
        self.assertEqual(result["mode"], "RESEARCH")


if __name__ == "__main__":
    unittest.main()
