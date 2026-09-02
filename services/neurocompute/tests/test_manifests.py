"""
Unit Tests for Manifest Generation, Checksums, and Pipeline Hashes
"""

import unittest
import tempfile
import shutil
import os
import json
from magniom_neuro.manifests.hasher import Hasher
from magniom_neuro.manifests.pipeline_hash import PipelineHashCalculator
from magniom_neuro.manifests.pipeline_manifest import PipelineManifestBuilder
from magniom_neuro.models.manifest import SoftwareManifest, ManifestFileEntry, TransformManifestEntry


class TestManifests(unittest.TestCase):
    """Tests for SHA-256 integrity hashing and manifest builder outputs."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_deterministic_json_hashing(self):
        # Order of keys should not affect hash
        obj1 = {"b": 2, "a": 1, "c": [3, 4]}
        obj2 = {"a": 1, "c": [3, 4], "b": 2}
        hash1 = Hasher.sha256_json(obj1)
        hash2 = Hasher.sha256_json(obj2)
        self.assertEqual(hash1, hash2)
        self.assertEqual(len(hash1), 64)

    def test_pipeline_hash_formula(self):
        input_manifest = {"files": [{"path": "raw.zip", "sha256": "abc123"}]}
        software_manifest = [{"name": "dcm2niix", "version": "1.0"}]
        scientific_config = {"mode": "RESEARCH"}

        h_pipeline = PipelineHashCalculator.calculate_pipeline_hash(
            input_manifest=input_manifest,
            software_manifest=software_manifest,
            scientific_config=scientific_config,
        )
        self.assertEqual(len(h_pipeline), 64)

        # Modifying config must change pipeline hash
        scientific_config2 = {"mode": "CLINICAL"}
        h_pipeline2 = PipelineHashCalculator.calculate_pipeline_hash(
            input_manifest=input_manifest,
            software_manifest=software_manifest,
            scientific_config=scientific_config2,
        )
        self.assertNotEqual(h_pipeline, h_pipeline2)

    def test_pipeline_manifest_builder(self):
        software = [SoftwareManifest(name="magniom_neuro", version="1.0.0")]
        input_files = [ManifestFileEntry(path="dicom.zip", sha256="a" * 64, size_bytes=1000)]
        output_files = [ManifestFileEntry(path="t1w.nii.gz", sha256="b" * 64, size_bytes=2000)]
        transforms = [
            TransformManifestEntry(
                source_space="NATIVE_T1W",
                target_space="MNI152NLin2009cAsym",
                transform_type="NONLINEAR_WARP",
                transform_file_sha256="c" * 64,
            )
        ]

        manifest = PipelineManifestBuilder.build_and_save(
            run_id="run-test-01",
            case_id="case-test-01",
            organisation_id="org-test-01",
            mode="RESEARCH",
            software_manifest=software,
            input_files=input_files,
            output_files=output_files,
            transform_graph=transforms,
            stages=[],
            overall_qc_status="pass",
            warnings=[],
            started_at="2026-09-02T00:00:00Z",
            completed_at="2026-09-02T00:05:00Z",
            output_directory=self.test_dir,
        )

        manifest_file = os.path.join(self.test_dir, "pipeline-manifest.json")
        self.assertTrue(os.path.exists(manifest_file))
        with open(manifest_file, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.assertEqual(data["schema_version"], "1.0")
        self.assertEqual(data["run_id"], "run-test-01")
        self.assertEqual(data["mode"], "RESEARCH")
        self.assertEqual(len(data["pipeline_hash"]), 64)
        self.assertEqual(len(data["transform_graph"]), 1)


if __name__ == "__main__":
    unittest.main()
