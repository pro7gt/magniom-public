"""
Unit Tests for HCP-MMP1.0 Reference Atlas and Subcortical ROIs
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 74-76, 79
"""

import unittest
from magniom_neuro.connectome.atlas import HcpMmpAtlasManager


class TestHcpMmpAtlasManager(unittest.TestCase):

    def test_cortical_parcels_structure(self):
        parcels = HcpMmpAtlasManager.get_cortical_parcels()
        self.assertEqual(len(parcels), 360)

        # 180 Left and 180 Right
        lh_parcels = [p for p in parcels if p.hemisphere == "L"]
        rh_parcels = [p for p in parcels if p.hemisphere == "R"]
        self.assertEqual(len(lh_parcels), 180)
        self.assertEqual(len(rh_parcels), 180)

        # Check indexing
        for idx, p in enumerate(lh_parcels):
            self.assertEqual(p.parcel_index, idx + 1)
            self.assertTrue(p.parcel_name.endswith("_L"))
            self.assertGreater(p.vertex_count, 0)
            self.assertLess(p.centroid_mni[0], 0)  # Left hemisphere has negative x coordinate

        for idx, p in enumerate(rh_parcels):
            self.assertEqual(p.parcel_index, 180 + idx + 1)
            self.assertTrue(p.parcel_name.endswith("_R"))
            self.assertGreater(p.centroid_mni[0], 0)  # Right hemisphere has positive x coordinate

    def test_subcortical_rois(self):
        rois = HcpMmpAtlasManager.get_subcortical_rois()
        self.assertEqual(len(rois), 14)

        names = [r.roi_name for r in rois]
        self.assertIn("Thalamus_L", names)
        self.assertIn("Thalamus_R", names)
        self.assertIn("Caudate_L", names)
        self.assertIn("Caudate_R", names)
        self.assertIn("Amygdala_L", names)
        self.assertIn("Amygdala_R", names)

    def test_all_parcel_and_roi_names(self):
        all_names = HcpMmpAtlasManager.get_all_parcel_and_roi_names()
        self.assertEqual(len(all_names), 374)

    def test_left_prefrontal_search_vertices(self):
        search_v = HcpMmpAtlasManager.get_left_prefrontal_search_vertices()
        self.assertGreater(len(search_v), 500)
        # Verify vertices are outside medial wall (< 2796 excluded)
        self.assertTrue(all(v >= 2796 for v in search_v))
        self.assertTrue(all(v < 32492 for v in search_v))


if __name__ == "__main__":
    unittest.main()
