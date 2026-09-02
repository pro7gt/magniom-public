"""
Functional Connectivity Engine (Run-Level and Combined FC)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 81-84
"""

import os
import gzip
import json
import math
from typing import Dict, List, Tuple, Optional, Any
from ..models.connectome import (
    ParcelTimeSeriesResult,
    RunFunctionalConnectivity,
    CombinedFunctionalConnectivity,
)
from ..models.denoise import DenoisedTimeSeriesOutput
from ..manifests.hasher import Hasher


class FunctionalConnectivityEngine:
    """Computes pairwise Pearson correlation and Fisher-z transformed FC matrices."""

    EPSILON_R = 0.999999

    @staticmethod
    def _pearson_r(x: List[float], y: List[float]) -> float:
        n = len(x)
        if n < 2:
            return 0.0
        mean_x = sum(x) / n
        mean_y = sum(y) / n
        num = sum((x[i] - mean_x) * (y[i] - mean_y) for i in range(n))
        den_x = sum((x[i] - mean_x) ** 2 for i in range(n))
        den_y = sum((y[i] - mean_y) ** 2 for i in range(n))
        den = math.sqrt(den_x * den_y)
        if den == 0:
            return 0.0
        r = num / den
        return max(-0.999999, min(0.999999, r))

    @staticmethod
    def _fisher_z(r: float) -> float:
        r_clamped = max(-0.999999, min(0.999999, r))
        return 0.5 * math.log((1.0 + r_clamped) / (1.0 - r_clamped))

    @staticmethod
    def _inv_fisher_z(z: float) -> float:
        return math.tanh(z)

    @classmethod
    def compute_run_fc(
        cls,
        parcel_series: ParcelTimeSeriesResult,
        denoised_output: DenoisedTimeSeriesOutput,
        output_directory: str,
    ) -> RunFunctionalConnectivity:
        """
        Computes pairwise Pearson correlation and Fisher-z transformed matrix for a single run
        using uncensored retained timepoints.
        """
        subject_id = parcel_series.subject_id
        run_index = parcel_series.run_index
        config_name = denoised_output.denoising_configuration
        parcel_names = parcel_series.parcel_names
        num_parcels = len(parcel_names)

        # Retained uncensored indices
        censor_mask = denoised_output.censor_mask
        retained_indices = [i for i, c in enumerate(censor_mask) if not c]
        retained_timepoints = len(retained_indices)
        retained_minutes = denoised_output.retained_time.final_retained_minutes

        full_matrix = parcel_series.time_series_matrix
        if retained_timepoints > 5:
            retained_data = [[row[t] for t in retained_indices] for row in full_matrix]
        else:
            retained_data = full_matrix

        # Compute Pairwise Pearson Correlation & Fisher-z
        corr_mat: List[List[float]] = [[0.0] * num_parcels for _ in range(num_parcels)]
        fisher_z_mat: List[List[float]] = [[0.0] * num_parcels for _ in range(num_parcels)]

        for i in range(num_parcels):
            corr_mat[i][i] = 1.0
            fisher_z_mat[i][i] = 0.0
            for j in range(i + 1, num_parcels):
                r_val = cls._pearson_r(retained_data[i], retained_data[j])
                z_val = cls._fisher_z(r_val)
                corr_mat[i][j] = round(r_val, 6)
                corr_mat[j][i] = round(r_val, 6)
                fisher_z_mat[i][j] = round(z_val, 6)
                fisher_z_mat[j][i] = round(z_val, 6)

        # ----------------------------------------------------
        # Export Gzipped TSV Matrix Artifact
        # ----------------------------------------------------
        fc_dir = os.path.join(output_directory, subject_id, "connectome")
        os.makedirs(fc_dir, exist_ok=True)

        tsv_filename = f"{subject_id}_run-{run_index:02d}_desc-{config_name}_atlas-HCPMMP1_connectivity.tsv.gz"
        tsv_path = os.path.join(fc_dir, tsv_filename)

        with gzip.open(tsv_path, "wt", encoding="utf-8") as f:
            f.write("\t".join(parcel_names) + "\n")
            for p_idx in range(num_parcels):
                row_vals = [f"{val:.6f}" for val in corr_mat[p_idx]]
                f.write("\t".join(row_vals) + "\n")

        tsv_sha256 = Hasher.sha256_file(tsv_path)

        # JSON Sidecar
        sidecar_dict = {
            "Metric": "Pearson correlation",
            "Transform": "Fisher z",
            "DenoisingConfiguration": config_name,
            "CensoringThreshold": "FD 0.20 mm",
            "TemporalBandHz": [0.009, 0.08],
            "Atlas": parcel_series.atlas_name,
            "SubjectId": subject_id,
            "RunIndex": run_index,
            "NumParcels": num_parcels,
            "RetainedTimepoints": retained_timepoints,
            "RetainedMinutes": retained_minutes,
        }
        sidecar_path = os.path.join(fc_dir, f"{subject_id}_run-{run_index:02d}_desc-{config_name}_atlas-HCPMMP1_connectivity.json")
        with open(sidecar_path, "w", encoding="utf-8") as f:
            json.dump(sidecar_dict, f, indent=2)

        return RunFunctionalConnectivity(
            subject_id=subject_id,
            run_index=run_index,
            denoising_configuration=config_name,
            atlas_name=parcel_series.atlas_name,
            metric="Pearson correlation",
            transform="Fisher z",
            retained_timepoints=retained_timepoints,
            retained_minutes=retained_minutes,
            num_parcels=num_parcels,
            parcel_names=parcel_names,
            correlation_matrix=corr_mat,
            fisher_z_matrix=fisher_z_mat,
            artifact_tsv_path=tsv_path,
            artifact_tsv_sha256=tsv_sha256,
            sidecar_json_path=sidecar_path,
        )

    @classmethod
    def combine_runs_fc(
        cls,
        run_fc_list: List[RunFunctionalConnectivity],
        output_directory: str,
    ) -> CombinedFunctionalConnectivity:
        """
        Combines run-level Fisher-z matrices using retained-time weighting.
        Preserves individual run information and evaluates cross-run similarity.
        """
        if not run_fc_list:
            raise ValueError("At least one RunFunctionalConnectivity is required to combine.")

        subject_id = run_fc_list[0].subject_id
        config_name = run_fc_list[0].denoising_configuration
        atlas_name = run_fc_list[0].atlas_name
        num_parcels = run_fc_list[0].num_parcels
        parcel_names = run_fc_list[0].parcel_names

        total_retained_timepoints = sum(r.retained_timepoints for r in run_fc_list)
        total_retained_minutes = sum(r.retained_minutes for r in run_fc_list)
        run_indices = [r.run_index for r in run_fc_list]

        if total_retained_timepoints > 0:
            weights = [r.retained_timepoints / total_retained_timepoints for r in run_fc_list]
        else:
            weights = [1.0 / len(run_fc_list)] * len(run_fc_list)

        combined_z: List[List[float]] = [[0.0] * num_parcels for _ in range(num_parcels)]
        combined_r: List[List[float]] = [[0.0] * num_parcels for _ in range(num_parcels)]

        for i in range(num_parcels):
            combined_r[i][i] = 1.0
            combined_z[i][i] = 0.0
            for j in range(i + 1, num_parcels):
                z_comb = sum(weights[k] * run_fc_list[k].fisher_z_matrix[i][j] for k in range(len(run_fc_list)))
                r_comb = cls._inv_fisher_z(z_comb)
                combined_z[i][j] = round(z_comb, 6)
                combined_z[j][i] = round(z_comb, 6)
                combined_r[i][j] = round(r_comb, 6)
                combined_r[j][i] = round(r_comb, 6)

        # Cross-run similarity
        cross_run_sim_matrix: List[List[float]] = []
        num_runs = len(run_fc_list)

        # Extract upper triangle values
        run_tri_values: List[List[float]] = []
        for r_obj in run_fc_list:
            vals: List[float] = []
            for i in range(num_parcels):
                for j in range(i + 1, num_parcels):
                    vals.append(r_obj.fisher_z_matrix[i][j])
            run_tri_values.append(vals)

        for i in range(num_runs):
            row_sim: List[float] = []
            for j in range(num_runs):
                if i == j:
                    row_sim.append(1.0)
                else:
                    corr_ij = cls._pearson_r(run_tri_values[i], run_tri_values[j])
                    row_sim.append(round(corr_ij, 4))
            cross_run_sim_matrix.append(row_sim)

        # Export Combined TSV
        fc_dir = os.path.join(output_directory, subject_id, "connectome")
        os.makedirs(fc_dir, exist_ok=True)

        combined_tsv_name = f"{subject_id}_desc-{config_name}_atlas-HCPMMP1_connectivity.tsv.gz"
        combined_tsv_path = os.path.join(fc_dir, combined_tsv_name)

        with gzip.open(combined_tsv_path, "wt", encoding="utf-8") as f:
            f.write("\t".join(parcel_names) + "\n")
            for p_idx in range(num_parcels):
                row_vals = [f"{val:.6f}" for val in combined_r[p_idx]]
                f.write("\t".join(row_vals) + "\n")

        combined_sha256 = Hasher.sha256_file(combined_tsv_path)

        combined_sidecar = {
            "Metric": "Pearson correlation",
            "Transform": "Fisher z",
            "DenoisingConfiguration": config_name,
            "Atlas": atlas_name,
            "SubjectId": subject_id,
            "RunIndices": run_indices,
            "RunWeights": weights,
            "TotalRetainedTimepoints": total_retained_timepoints,
            "TotalRetainedMinutes": total_retained_minutes,
            "CrossRunSimilarityMatrix": cross_run_sim_matrix,
        }
        sidecar_path = os.path.join(fc_dir, f"{subject_id}_desc-{config_name}_atlas-HCPMMP1_connectivity.json")
        with open(sidecar_path, "w", encoding="utf-8") as f:
            json.dump(combined_sidecar, f, indent=2)

        return CombinedFunctionalConnectivity(
            subject_id=subject_id,
            denoising_configuration=config_name,
            atlas_name=atlas_name,
            total_retained_timepoints=total_retained_timepoints,
            total_retained_minutes=total_retained_minutes,
            run_indices=run_indices,
            run_weights=weights,
            num_parcels=num_parcels,
            parcel_names=parcel_names,
            combined_fisher_z_matrix=combined_z,
            combined_correlation_matrix=combined_r,
            cross_run_similarity_matrix=cross_run_sim_matrix,
            artifact_tsv_path=combined_tsv_path,
            artifact_tsv_sha256=combined_sha256,
        )
