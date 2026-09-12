"""
Unit Tests for TripleNetworkEngine in services/neurocompute.
Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§26-27, 49-52)
and Neuroimaging Pipeline Specification v1.1 (§49-52).
"""

import unittest
import tempfile
import shutil
import os
import math

from magniom_neuro.models.connectome import CombinedFunctionalConnectivity
from magniom_neuro.networks.triple_network_engine import TripleNetworkEngine
from magniom_neuro.networks.definitions import CANONICAL_NETWORK_PARCEL_MAP


class TestTripleNetworkEngine(unittest.TestCase):
    """Verifies Python TripleNetworkEngine calculation, segregation, normative deviation, and reliability."""

    def setUp(self):
        self.test_dir = tempfile.mkdtemp()

        # Build synthetic parcel names and correlation matrix
        cen_parcels = CANONICAL_NETWORK_PARCEL_MAP["CEN"]
        dmn_parcels = CANONICAL_NETWORK_PARCEL_MAP["DMN"]
        sn_parcels = CANONICAL_NETWORK_PARCEL_MAP["SN"]
        self.all_parcels = list(cen_parcels) + list(dmn_parcels) + list(sn_parcels)
        self.n = len(self.all_parcels)

        # Base identity matrix
        self.base_matrix = [[1.0 if i == j else 0.0 for j in range(self.n)] for i in range(self.n)]

        cen_indices = list(range(len(cen_parcels)))
        dmn_indices = list(range(len(cen_parcels), len(cen_parcels) + len(dmn_parcels)))
        sn_indices = list(range(len(cen_parcels) + len(dmn_parcels), self.n))

        for i in cen_indices:
            for j in cen_indices:
                if i != j:
                    self.base_matrix[i][j] = 0.55

        for i in dmn_indices:
            for j in dmn_indices:
                if i != j:
                    self.base_matrix[i][j] = 0.60

        for i in sn_indices:
            for j in sn_indices:
                if i != j:
                    self.base_matrix[i][j] = 0.50

        # Normal anticorrelation CEN <-> DMN (r ~ -0.25)
        for i in cen_indices:
            for j in dmn_indices:
                self.base_matrix[i][j] = -0.25
                self.base_matrix[j][i] = -0.25

        # Normal coactivation SN <-> CEN (r ~ +0.20)
        for i in sn_indices:
            for j in cen_indices:
                self.base_matrix[i][j] = 0.20
                self.base_matrix[j][i] = 0.20

        # Normal attenuation SN <-> DMN (r ~ -0.10)
        for i in sn_indices:
            for j in dmn_indices:
                self.base_matrix[i][j] = -0.10
                self.base_matrix[j][i] = -0.10

    def tearDown(self):
        shutil.rmtree(self.test_dir, ignore_errors=True)

    def _create_fc(self, matrix) -> CombinedFunctionalConnectivity:
        fisher_z_mat = []
        for row in matrix:
            z_row = []
            for r in row:
                clamped = max(-0.999, min(0.999, r))
                z = 0.5 * math.log((1.0 + clamped) / (1.0 - clamped))
                z_row.append(z)
            fisher_z_mat.append(z_row)

        return CombinedFunctionalConnectivity(
            subject_id="sub-001",
            denoising_configuration="CD-1",
            atlas_name="HCP-MMP1.0",
            total_retained_timepoints=600,
            total_retained_minutes=10.0,
            run_indices=[1, 2],
            run_weights=[0.5, 0.5],
            num_parcels=self.n,
            parcel_names=self.all_parcels,
            combined_fisher_z_matrix=fisher_z_mat,
            combined_correlation_matrix=matrix,
        )

    def test_canonical_analysis_success(self):
        fc = self._create_fc(self.base_matrix)

        result = TripleNetworkEngine.analyze_triple_network(
            subject_id="sub-001",
            case_id="case-001",
            connectome_fc=fc,
            output_directory=self.test_dir,
            mean_fd_mm=0.12,
            retained_minutes=10.0,
        )

        # Assertions
        self.assertEqual(result.case_id, "case-001")
        self.assertEqual(len(result.within_measurements), 3)
        self.assertEqual(len(result.pairwise_measurements), 3)

        # Within network values should be positive
        cen_m = next(m for m in result.within_measurements if m.network_code == "CEN")
        dmn_m = next(m for m in result.within_measurements if m.network_code == "DMN")
        sn_m = next(m for m in result.within_measurements if m.network_code == "SN")
        self.assertGreater(cen_m.raw_value, 0.3)
        self.assertGreater(dmn_m.raw_value, 0.3)
        self.assertGreater(sn_m.raw_value, 0.3)

        # Pairwise relationships
        cen_dmn = next(p for p in result.pairwise_measurements if p.relationship_code == "CEN_DMN")
        self.assertLess(cen_dmn.raw_value, 0.0)  # Should be anti-correlated
        self.assertEqual(cen_dmn.interpretation_status, "supportive")

        # Global segregation should be positive
        self.assertGreater(result.global_segregation, 0.0)

        # Reliability
        self.assertEqual(result.reliability.overall_status, "high")
        self.assertEqual(result.reliability.clinical_qualification, "qualified")

        # Hash and artifacts
        self.assertEqual(len(result.profile_hash), 64)
        self.assertTrue(os.path.exists(result.artifact_tsv_path))
        self.assertTrue(os.path.exists(result.sidecar_json_path))

    def test_motion_degradation_handling(self):
        fc = self._create_fc(self.base_matrix)

        # Short scrubbed duration (< 5 min) and high motion (mean FD 0.38mm)
        result = TripleNetworkEngine.analyze_triple_network(
            subject_id="sub-motion-001",
            case_id="case-motion-001",
            connectome_fc=fc,
            output_directory=self.test_dir,
            mean_fd_mm=0.38,
            retained_minutes=4.5,
        )

        self.assertEqual(result.reliability.overall_status, "limited")
        self.assertEqual(result.reliability.clinical_qualification, "context_only")
        self.assertIn("excessive_head_motion", result.reliability.acquisition_quality.limiting_factors)

    def test_mdd_hyposegregated_cen_dmn(self):
        # Impair anti-correlation: set CEN <-> DMN to positive (+0.15)
        hypo_matrix = [row[:] for row in self.base_matrix]
        cen_parcels = CANONICAL_NETWORK_PARCEL_MAP["CEN"]
        dmn_parcels = CANONICAL_NETWORK_PARCEL_MAP["DMN"]
        cen_indices = list(range(len(cen_parcels)))
        dmn_indices = list(range(len(cen_parcels), len(cen_parcels) + len(dmn_parcels)))

        for i in cen_indices:
            for j in dmn_indices:
                hypo_matrix[i][j] = 0.15
                hypo_matrix[j][i] = 0.15

        fc = self._create_fc(hypo_matrix)

        result = TripleNetworkEngine.analyze_triple_network(
            subject_id="sub-mdd-001",
            case_id="case-mdd-001",
            connectome_fc=fc,
            output_directory=self.test_dir,
            mean_fd_mm=0.14,
            retained_minutes=9.5,
        )

        cen_dmn = next(p for p in result.pairwise_measurements if p.relationship_code == "CEN_DMN")
        self.assertGreater(cen_dmn.raw_value, 0.0)
        self.assertEqual(cen_dmn.interpretation_status, "contradictory")


if __name__ == "__main__":
    unittest.main()
