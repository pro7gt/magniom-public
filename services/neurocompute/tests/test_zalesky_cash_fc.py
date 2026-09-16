"""
Unit Tests for Cash-Zalesky FC Clustering, Artifact Validation, and Exact Reliability
Conforms to:
- Cash et al. 2021 (Hum Brain Mapp)
- MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v2.0
"""

import os
import tempfile
import unittest
from magniom_neuro.io.artifact_validator import ArtifactValidator
from magniom_neuro.circuits.mdd.fc_cluster_personalised import (
    CashZaleskyFcPipeline,
    VoxelCoordinate,
)
from magniom_neuro.reliability.target_reliability import ExactTargetReliabilityEngine


class TestZaleskyCashFc(unittest.TestCase):

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

    def tearDown(self):
        import shutil
        if os.path.exists(self.test_dir):
            shutil.rmtree(self.test_dir)

    def test_mock_placeholder_rejection_fail_closed(self):
        """Validates that plain text mock files with .nii extension fail closed."""
        fake_nii = os.path.join(self.test_dir, "test_mock.nii")
        with open(fake_nii, "w") as f:
            f.write("mock nifti placeholder data")

        result = ArtifactValidator.validate_nifti(fake_nii)
        self.assertFalse(result.valid)
        self.assertEqual(result.file_type, "mock_placeholder")
        self.assertEqual(result.data_origin, "synthetic")
        self.assertTrue(any("rejected" in err.lower() or "header" in err.lower() for err in result.errors))

    def test_cash_zalesky_clustering_largest_component(self):
        """Validates 26-neighborhood clustering and weighted centroid extraction."""
        # Create voxels: 3 clustered together around (-40, 44, 30), 2 distant noise voxels
        voxels = [
            VoxelCoordinate(x=-40.0, y=44.0, z=30.0, connectivity=-0.65, voxel_id=1),
            VoxelCoordinate(x=-42.0, y=44.0, z=30.0, connectivity=-0.55, voxel_id=2),
            VoxelCoordinate(x=-40.0, y=46.0, z=30.0, connectivity=-0.45, voxel_id=3),
            # Distant noise voxels with weaker or positive correlation
            VoxelCoordinate(x=-20.0, y=10.0, z=50.0, connectivity=0.10, voxel_id=4),
            VoxelCoordinate(x=-15.0, y=12.0, z=48.0, connectivity=0.30, voxel_id=5),
        ]

        result = CashZaleskyFcPipeline.compute_fc_clustering(
            search_voxels=voxels,
            threshold_percentile=0.60,  # Retain top 3 (-0.65, -0.55, -0.45)
            min_cluster_size=2,
            grid_step_mm=2.0,
        )

        self.assertEqual(result.method_code, "FC_CLUSTER_PERSONALISED")
        self.assertEqual(result.largest_cluster_size, 3)
        self.assertEqual(result.raw_peak_mni, (-40.0, 44.0, 30.0))

        # Check centroid: weighted by |-0.65|, |-0.55|, |-0.45| -> total w = 1.65
        # cx = (-40*0.65 + -42*0.55 + -40*0.45)/1.65 = -40.67
        self.assertAlmostEqual(result.target_centroid_mni[0], -40.67, delta=0.2)
        self.assertAlmostEqual(result.target_centroid_mni[1], 44.55, delta=0.2)
        self.assertEqual(result.target_centroid_mni[2], 30.0)

        # Medoid should be one of the actual candidate voxels in the cluster
        self.assertIn(result.target_medoid_mni, [(-40.0, 44.0, 30.0), (-42.0, 44.0, 30.0), (-40.0, 46.0, 30.0)])
        self.assertEqual(result.clinical_promotion_status, "blocked")
        self.assertEqual(result.scientific_maturity, "validation")

    def test_exact_target_reliability_engine_stability_categories(self):
        """Validates exact-algorithm split-half reliability and confidence classification."""
        half_a = [
            VoxelCoordinate(x=-40.0, y=44.0, z=30.0, connectivity=-0.60, voxel_id=1),
            VoxelCoordinate(x=-42.0, y=44.0, z=30.0, connectivity=-0.50, voxel_id=2),
        ]
        # Close targets (shift ~1.4mm) -> reliable
        half_b_close = [
            VoxelCoordinate(x=-41.0, y=45.0, z=30.0, connectivity=-0.58, voxel_id=1),
            VoxelCoordinate(x=-43.0, y=45.0, z=30.0, connectivity=-0.48, voxel_id=2),
        ]

        metrics_close = ExactTargetReliabilityEngine.evaluate_split_half_fc(
            search_voxels_half_a=half_a,
            search_voxels_half_b=half_b_close,
            threshold_percentile=1.0,
            min_cluster_size=1,
        )

        self.assertLessEqual(metrics_close.spatial_displacement_mm, 3.0)
        self.assertEqual(metrics_close.confidence_status, "reliable")
        self.assertTrue(metrics_close.connectivity_sign_consistent)

        # Distant targets (shift > 10mm) -> unstable
        half_b_distant = [
            VoxelCoordinate(x=-55.0, y=55.0, z=30.0, connectivity=-0.58, voxel_id=10),
            VoxelCoordinate(x=-57.0, y=55.0, z=30.0, connectivity=-0.48, voxel_id=11),
        ]

        metrics_distant = ExactTargetReliabilityEngine.evaluate_split_half_fc(
            search_voxels_half_a=half_a,
            search_voxels_half_b=half_b_distant,
            threshold_percentile=1.0,
            min_cluster_size=1,
        )

        self.assertGreater(metrics_distant.spatial_displacement_mm, 6.0)
        self.assertEqual(metrics_distant.confidence_status, "unstable")

    def test_cash_zalesky_clustering_undersized_fails_closed(self):
        """Validates that when no cluster meets min_cluster_size, pipeline fails closed."""
        # Provide isolated voxels with distances > 26-neighborhood (> 2.0 mm)
        voxels = [
            VoxelCoordinate(x=-40.0, y=44.0, z=30.0, connectivity=-0.65, voxel_id=1),
            VoxelCoordinate(x=-10.0, y=10.0, z=10.0, connectivity=-0.55, voxel_id=2),
            VoxelCoordinate(x=20.0, y=-20.0, z=40.0, connectivity=-0.45, voxel_id=3),
        ]

        result = CashZaleskyFcPipeline.compute_fc_clustering(
            search_voxels=voxels,
            threshold_percentile=1.0,
            min_cluster_size=2,  # Each cluster has size 1, so none qualify
            grid_step_mm=2.0,
        )

        self.assertEqual(result.status, "no_qualifying_cluster")
        self.assertIsNone(result.largest_cluster)
        self.assertIsNone(result.target_centroid_mni)
        self.assertIsNone(result.target_medoid_mni)
        self.assertIsNone(result.raw_peak_mni)
        self.assertEqual(result.largest_cluster_size, 0)
        self.assertEqual(result.alternate_clusters, [])

    def test_execute_from_surface_timeseries_missing_coordinates_raises_keyerror(self):
        """Validates fail-closed KeyError when vertex MNI coordinate is missing."""
        ts_lh = [
            [0.1 * t for t in range(20)],  # vertex 0
            [-0.1 * t for t in range(20)], # vertex 1
            [0.05 * t for t in range(20)], # vertex 2
        ]
        medial_wall = [False, False, False]
        search_vertices = [1, 2]
        # Only provide vertex 1 in coordinate mapping, missing vertex 2
        coords = {1: (-40.0, 44.0, 30.0)}
        seed_ts = [-0.1 * t for t in range(20)]

        with self.assertRaises(KeyError) as ctx:
            CashZaleskyFcPipeline.execute_from_surface_timeseries(
                ts_lh=ts_lh,
                medial_wall_mask=medial_wall,
                search_vertex_indices=search_vertices,
                vertex_coordinates_mni=coords,
                seed_timeseries=seed_ts,
                threshold_percentile=1.0,
                min_cluster_size=1,
            )
        self.assertIn("Missing MNI coordinates for vertex index 2", str(ctx.exception))

    def test_surface_mesh_adjacency_clustering(self):
        """Validates clustering using explicit cortical surface mesh adjacency graph."""
        voxels = [
            VoxelCoordinate(x=-40.0, y=44.0, z=30.0, connectivity=-0.70, voxel_id=101),
            VoxelCoordinate(x=-41.0, y=45.0, z=31.0, connectivity=-0.60, voxel_id=102),
            VoxelCoordinate(x=-42.0, y=46.0, z=32.0, connectivity=-0.50, voxel_id=103),
            VoxelCoordinate(x=-30.0, y=20.0, z=15.0, connectivity=-0.40, voxel_id=201),
        ]
        # Mesh adjacency where 101-102-103 form a graph component, 201 is isolated
        adjacency = {
            101: [102],
            102: [101, 103],
            103: [102],
            201: [],
        }

        result = CashZaleskyFcPipeline.compute_fc_clustering(
            search_voxels=voxels,
            threshold_percentile=1.0,
            min_cluster_size=2,
            adjacency_list=adjacency,
        )

        self.assertEqual(result.status, "success")
        self.assertIsNotNone(result.largest_cluster)
        self.assertEqual(result.largest_cluster_size, 3)
        self.assertEqual(result.raw_peak_mni, (-40.0, 44.0, 30.0))
        cluster_voxel_ids = {v.voxel_id for v in result.largest_cluster.voxels}
        self.assertEqual(cluster_voxel_ids, {101, 102, 103})


if __name__ == "__main__":
    unittest.main()
