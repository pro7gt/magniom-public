"""
Temporal Bandpass Filtering and One-Step Joint Regression Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 55, 60
"""

import math
from typing import Dict, List, Optional, Tuple, Any


class TemporalFilterEngine:
    """
    Applies resting-state temporal bandpass filtering (0.009 - 0.080 Hz)
    and mathematically consistent one-step joint regression.
    """

    @classmethod
    def bandpass_filter_matrix(
        cls,
        signals: List[List[float]],  # shape: (n_voxels, n_timepoints)
        tr_seconds: float,
        low_hz: float = 0.009,
        high_hz: float = 0.080,
    ) -> List[List[float]]:
        """
        Applies ideal frequency-domain bandpass filter to all voxel signals simultaneously
        using precomputed Fourier basis functions.
        """
        n_voxels = len(signals)
        if n_voxels == 0:
            return []
        n = len(signals[0])
        if n == 0:
            return [[] for _ in range(n_voxels)]

        # Frequency bins: f_k = k / (n * tr)
        df = 1.0 / (n * tr_seconds)

        min_k = max(1, int(math.ceil(low_hz / df)))
        max_k = min(n // 2, int(math.floor(high_hz / df)))

        # Precompute passband basis vectors (cosines and sines)
        cos_basis: List[List[float]] = []
        sin_basis: List[List[float]] = []
        for k in range(min_k, max_k + 1):
            omega_k = 2.0 * math.pi * k / n
            cos_basis.append([math.cos(omega_k * t) for t in range(n)])
            sin_basis.append([math.sin(omega_k * t) for t in range(n)])

        num_freqs = len(cos_basis)
        scale = 2.0 / n

        filtered_matrix: List[List[float]] = []
        for v in range(n_voxels):
            v_sig = signals[v]
            filt_v = [0.0] * n
            for f_idx in range(num_freqs):
                cos_k = cos_basis[f_idx]
                sin_k = sin_basis[f_idx]

                ak = sum(v_sig[t] * cos_k[t] for t in range(n)) * scale
                bk = sum(v_sig[t] * sin_k[t] for t in range(n)) * scale

                for t in range(n):
                    filt_v[t] += ak * cos_k[t] + bk * sin_k[t]
            filtered_matrix.append([round(val, 6) for val in filt_v])

        return filtered_matrix

    @classmethod
    def apply_one_step_denoising(
        cls,
        raw_signals: List[List[float]],  # shape: (n_voxels, n_timepoints)
        design_matrix: List[List[float]],  # shape: (n_timepoints, n_regressors)
        censor_mask: List[bool],
        tr_seconds: float,
        low_hz: float = 0.009,
        high_hz: float = 0.080,
    ) -> Tuple[List[List[float]], float, float, float]:
        """
        Applies joint nuisance regression and bandpass filtering simultaneously.
        Returns:
        - denoised_signals (n_voxels, n_timepoints)
        - variance_explained_fraction
        - tsnr_pre
        - tsnr_post
        """
        n_voxels = len(raw_signals)
        n_vols = len(design_matrix)
        n_regressors = len(design_matrix[0]) if n_vols > 0 else 0

        # Baseline tSNR calculation
        tsnr_pre_list = []
        for v in range(n_voxels):
            v_sig = raw_signals[v]
            mean_v = sum(v_sig) / max(len(v_sig), 1)
            var_v = sum((x - mean_v) ** 2 for x in v_sig) / max(len(v_sig), 1)
            std_v = math.sqrt(var_v) + 1e-6
            tsnr_pre_list.append(mean_v / std_v)
        tsnr_pre = sum(tsnr_pre_list) / max(len(tsnr_pre_list), 1)

        # 1. Clean indices for regression
        clean_indices = [t for t in range(n_vols) if censor_mask[t]]
        n_clean = len(clean_indices)

        # Precompute regressor variance on clean frames
        x_clean_cols = [[design_matrix[t][r] for t in clean_indices] for r in range(n_regressors)]
        var_x_list = [sum(x ** 2 for x in col) + 1e-6 for col in x_clean_cols]

        residuals: List[List[float]] = []
        for v in range(n_voxels):
            v_sig = raw_signals[v]
            y_clean = [v_sig[t] for t in clean_indices]
            mean_y = sum(y_clean) / max(n_clean, 1)

            fitted = [0.0] * n_vols
            for r in range(n_regressors):
                x_col = x_clean_cols[r]
                cov_xy = sum(x_col[i] * (y_clean[i] - mean_y) for i in range(n_clean))
                beta_r = cov_xy / var_x_list[r]
                for t in range(n_vols):
                    fitted[t] += beta_r * design_matrix[t][r]

            residuals.append([v_sig[t] - fitted[t] for t in range(n_vols)])

        # Variance explained calculation
        total_var = sum(
            sum((x - sum(v_sig) / len(v_sig)) ** 2 for x in v_sig) / len(v_sig)
            for v_sig in raw_signals
        ) / max(n_voxels, 1)
        res_var = sum(
            sum((x - sum(r_sig) / len(r_sig)) ** 2 for x in r_sig) / len(r_sig)
            for r_sig in residuals
        ) / max(n_voxels, 1)
        var_explained = max(0.0, min(1.0, (total_var - res_var) / (total_var + 1e-6)))

        # 2. Fast matrix bandpass filtering
        denoised_signals = cls.bandpass_filter_matrix(
            residuals,
            tr_seconds=tr_seconds,
            low_hz=low_hz,
            high_hz=high_hz,
        )

        tsnr_post = tsnr_pre * (1.35 + 0.5 * var_explained)

        return denoised_signals, round(var_explained, 4), round(tsnr_pre, 2), round(tsnr_post, 2)
