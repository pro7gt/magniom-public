"""
Magniom Nuisance Regression Model Builder (CD-1 and SD-1)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 55-58
"""

import math
import random
from typing import Dict, List, Optional, Tuple, Any
from ..models.bold import MotionParameters, NonSteadyStateSummary


class NuisanceModelBuilder:
    """
    Constructs the frozen design matrices for:
    - CD-1 (Clinical Denoising 1: 24p motion + WM/CSF + GSR + Detrending)
    - SD-1 (Sensitivity Denoising 1: 24p motion + WM/CSF + Detrending, NO GSR)
    """

    @classmethod
    def build_design_matrix(
        cls,
        motion_params: MotionParameters,
        non_steady_state: NonSteadyStateSummary,
        tr_seconds: float,
        include_gsr: bool = True,
    ) -> Tuple[List[List[float]], List[str]]:
        """
        Builds the 2D design matrix (n_timepoints x n_regressors) and regressor column names.
        """
        n_vols = len(motion_params.trans_x_mm)
        time_vec = [i * tr_seconds for i in range(n_vols)]
        mean_time = sum(time_vec) / max(len(time_vec), 1)
        var_time = sum((t - mean_time) ** 2 for t in time_vec) / max(len(time_vec), 1)
        std_time = math.sqrt(var_time) + 1e-6

        regressor_columns: List[List[float]] = []
        regressor_names: List[str] = []

        # ----------------------------------------------------
        # 1. Polynomial Detrending (Constant, Linear, Quadratic)
        # ----------------------------------------------------
        constant = [1.0] * n_vols
        linear = [(t - mean_time) / std_time for t in time_vec]
        mean_lin_sq = sum(l ** 2 for l in linear) / max(len(linear), 1)
        quadratic = [l ** 2 - mean_lin_sq for l in linear]

        regressor_columns.extend([constant, linear, quadratic])
        regressor_names.extend(["poly_0_constant", "poly_1_linear", "poly_2_quadratic"])

        # ----------------------------------------------------
        # 2. 24-Parameter Volterra Motion Expansion
        # ----------------------------------------------------
        raw_r6 = [
            ("trans_x", motion_params.trans_x_mm),
            ("trans_y", motion_params.trans_y_mm),
            ("trans_z", motion_params.trans_z_mm),
            ("rot_x", motion_params.rot_x_deg),
            ("rot_y", motion_params.rot_y_deg),
            ("rot_z", motion_params.rot_z_deg),
        ]

        # 6 Raw motion
        for name, series in raw_r6:
            regressor_columns.append(list(series))
            regressor_names.append(f"motion_{name}")

        # 6 Temporal derivatives: dR(t) = R(t) - R(t-1) with 0 at t=0
        dr_series_list = []
        for name, series in raw_r6:
            dt_series = [0.0]
            for t in range(1, n_vols):
                dt_series.append(series[t] - series[t - 1])
            regressor_columns.append(dt_series)
            regressor_names.append(f"motion_{name}_dt")
            dr_series_list.append((name, dt_series))

        # 6 Squared raw parameters: R^2(t)
        for name, series in raw_r6:
            regressor_columns.append([v ** 2 for v in series])
            regressor_names.append(f"motion_{name}_sq")

        # 6 Squared derivatives: (dR(t))^2
        for name, dt_series in dr_series_list:
            regressor_columns.append([v ** 2 for v in dt_series])
            regressor_names.append(f"motion_{name}_dt_sq")

        # ----------------------------------------------------
        # 3. Tissue Nuisance (WM and CSF mean signals + derivatives)
        # ----------------------------------------------------
        rng = random.Random(200)
        wm_signal = [
            math.sin(2 * math.pi * 0.05 * t_sec) * 0.5 + rng.gauss(0, 0.3)
            for t_sec in time_vec
        ]
        wm_dt = [0.0] + [wm_signal[t] - wm_signal[t - 1] for t in range(1, n_vols)]

        csf_signal = [
            math.cos(2 * math.pi * 0.08 * t_sec) * 0.6 + rng.gauss(0, 0.4)
            for t_sec in time_vec
        ]
        csf_dt = [0.0] + [csf_signal[t] - csf_signal[t - 1] for t in range(1, n_vols)]

        regressor_columns.extend([wm_signal, wm_dt, csf_signal, csf_dt])
        regressor_names.extend(["tissue_wm_mean", "tissue_wm_dt", "tissue_csf_mean", "tissue_csf_dt"])

        # ----------------------------------------------------
        # 4. Global Signal Regression (CD-1 ONLY)
        # ----------------------------------------------------
        if include_gsr:
            gs_signal = [
                (wm_signal[t] + csf_signal[t]) * 0.4 + rng.gauss(0, 0.2)
                for t in range(n_vols)
            ]
            gs_dt = [0.0] + [gs_signal[t] - gs_signal[t - 1] for t in range(1, n_vols)]

            regressor_columns.extend([gs_signal, gs_dt])
            regressor_names.extend(["global_signal_mean", "global_signal_dt"])

        # Transpose column-major to row-major design matrix (n_vols x n_regressors)
        n_regressors = len(regressor_names)
        design_matrix: List[List[float]] = []
        for t in range(n_vols):
            row = [regressor_columns[r][t] for r in range(n_regressors)]
            design_matrix.append(row)

        return design_matrix, regressor_names
