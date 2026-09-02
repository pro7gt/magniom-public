"""
Unit Tests for Cortical Surfaces, GIFTI Export, fsLR-32k Resampling, and Topology
"""

import unittest
import tempfile
import shutil
import os
from magniom_neuro.surfaces.reconstruction import SurfaceReconstructionEngine
from magniom_neuro.surfaces.resampling import SurfaceResamplingEngine
from magniom_neuro.surfaces.topology import SurfaceTopologyChecker
from magniom_neuro.surfaces.gifti import GiftiExporter


class TestSurfaces(unittest.TestCase):
    """Tests for surface geometries, Euler defect computation, and fsLR-32k projection."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()
        self.subject_id = "sub-MGN7F3A92"

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def test_native_surface_reconstruction(self):
        w, p, m, i, t = SurfaceReconstructionEngine.generate_native_surfaces(
            subject_id=self.subject_id, hemisphere="L", vertex_count=5000
        )
        self.assertEqual(w.surface_type, "white")
        self.assertEqual(p.surface_type, "pial")
        self.assertEqual(m.surface_type, "midthickness")
        self.assertEqual(i.surface_type, "inflated")
        self.assertEqual(w.vertex_count, 5000)
        self.assertEqual(len(w.vertices), 5000 * 3)

        # Cortical thickness
        self.assertGreaterEqual(t.mean_thickness_mm, 2.0)
        self.assertLessEqual(t.mean_thickness_mm, 3.0)
        self.assertGreaterEqual(t.min_thickness_mm, 1.0)
        self.assertLessEqual(t.max_thickness_mm, 5.0)

    def test_euler_holes_and_topology(self):
        w, p, m, i, t = SurfaceReconstructionEngine.generate_native_surfaces(
            subject_id=self.subject_id, hemisphere="L", vertex_count=1000
        )
        chi, holes = SurfaceTopologyChecker.compute_euler_holes(w)
        self.assertIsInstance(chi, int)
        self.assertIsInstance(holes, int)
        self.assertGreaterEqual(holes, 0)
        self.assertLessEqual(holes, 40)

        intersections = SurfaceTopologyChecker.check_self_intersections(w)
        self.assertEqual(intersections, 0)

    def test_fslr32k_resampling_and_gifti_export(self):
        result = SurfaceResamplingEngine.resample_subject(
            subject_id=self.subject_id,
            output_directory=self.test_dir,
        )
        # Check standard 32k vertex count
        self.assertEqual(result.white_lh_32k.vertex_count, 32492)
        self.assertEqual(result.white_rh_32k.vertex_count, 32492)
        self.assertEqual(result.white_lh_32k.coordinate_space, "fsLR_32k")

        # Verify GIFTI files were written to disk
        surf_dir = os.path.join(self.test_dir, self.subject_id, "surf")
        lh_white_gii = os.path.join(surf_dir, f"{self.subject_id}.L.white.32k_fs_LR.surf.gii")
        lh_thick_gii = os.path.join(surf_dir, f"{self.subject_id}.L.thickness.32k_fs_LR.shape.gii")
        
        self.assertTrue(os.path.exists(lh_white_gii))
        self.assertTrue(os.path.exists(lh_thick_gii))
        self.assertIsNotNone(result.white_lh_32k.artifact_sha256)


if __name__ == "__main__":
    unittest.main()
