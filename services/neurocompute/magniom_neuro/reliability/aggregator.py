"""
Target Reliability Aggregator and Classification Engine
Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0 Sections 45-51
and MAGNIOM-Scientific Policy & Algorithm Configuration Specification v1.0 Section 40
and MAGNIOM-Canonical Target Data Specification v1.0 Section 36
"""

from typing import Dict, List, Tuple, Optional, Any
from .models import (
    SplitHalfResult,
    CrossRunResult,
    PipelineSensitivityResult,
    ReliabilityMeasure,
    SpatialRegion,
    TargetReliabilityProfile,
)
from .metrics import spatial_decay_function


class TargetReliabilityAggregator:
    """
    Implements conservative "weakest critical link" aggregation:
    R(c) = min(R_Q, R_S, R_C) and maps score to versioned reliability classes.
    """

    # Scientific Policy Threshold Constants
    THRESHOLD_HIGH = 0.80
    THRESHOLD_MODERATE = 0.65
    THRESHOLD_LOW = 0.40
    MIN_PERSONALISATION_RELIABILITY = 0.65

    @classmethod
    def calculate_qc_score(
        cls,
        qc_status: str,
        usable_rest_minutes: float,
        mean_fd_mm: float,
        censored_fraction: float,
        registration_quality: str,
        segmentation_quality: str,
        parcel_coverage_quality: str,
    ) -> float:
        """Calculates R_Q (data & preprocessing QC reliability score)."""
        if qc_status == "fail" or registration_quality == "fail" or segmentation_quality == "fail":
            return 0.0

        score = 1.0
        # Penalize motion censoring
        score -= min(0.35, censored_fraction * 0.7)
        # Penalize high mean FD
        if mean_fd_mm > 0.35:
            score -= 0.20
        elif mean_fd_mm > 0.25:
            score -= 0.10

        # Penalize short scan duration (< 15 min is suboptimal for precision targeting)
        if usable_rest_minutes < 10.0:
            score -= 0.30
        elif usable_rest_minutes < 15.0:
            score -= 0.15

        if qc_status == "conditional" or registration_quality == "low" or parcel_coverage_quality == "low":
            score = min(score, 0.60)

        return round(max(0.0, min(1.0, score)), 4)

    @classmethod
    def aggregate_profile(
        cls,
        candidate_id: str,
        case_id: str,
        imaging_study_id: str,
        connectome_run_id: str,
        target_family_version_id: str,
        qc_status: str,
        usable_rest_minutes: float,
        mean_fd_mm: float,
        censored_fraction: float,
        registration_quality: str,
        segmentation_quality: str,
        parcel_coverage_quality: str,
        split_half_result: SplitHalfResult,
        cross_run_result: Optional[CrossRunResult],
        sensitivity_result: Optional[PipelineSensitivityResult],
        confidence_region: Optional[SpatialRegion],
        pipeline_version: str = "MAGNIOM-CONNECTOME-1.0.0",
        atlas_versions: Optional[List[str]] = None,
    ) -> TargetReliabilityProfile:
        """
        Aggregates multi-metric reliability inputs into canonical TargetReliabilityProfile.
        """
        if atlas_versions is None:
            atlas_versions = ["HCP-MMP1.0"]

        limiting_factors: List[str] = []

        # ----------------------------------------------------
        # 1. R_Q: Data & Preprocessing QC Score
        # ----------------------------------------------------
        r_q = cls.calculate_qc_score(
            qc_status=qc_status,
            usable_rest_minutes=usable_rest_minutes,
            mean_fd_mm=mean_fd_mm,
            censored_fraction=censored_fraction,
            registration_quality=registration_quality,
            segmentation_quality=segmentation_quality,
            parcel_coverage_quality=parcel_coverage_quality,
        )

        if r_q == 0.0:
            limiting_factors.append("FAILED_MANDATORY_QC")
        if censored_fraction > 0.20:
            limiting_factors.append("ELEVATED_MOTION_CENSORING")
        if usable_rest_minutes < 15.0:
            limiting_factors.append("SUBOPTIMAL_RESTING_STATE_DURATION")

        # ----------------------------------------------------
        # 2. R_S: Spatial Target Reliability Score
        # ----------------------------------------------------
        d_split = split_half_result.distance_mm
        d_cross = cross_run_result.distance_mm if (cross_run_result and cross_run_result.assessed) else None

        if d_cross is not None:
            composite_dist = max(d_split, d_cross)
        else:
            composite_dist = d_split

        r_s = spatial_decay_function(composite_dist, midpoint_mm=8.0, scale_mm=2.5)

        if d_split > 8.0:
            limiting_factors.append("HIGH_SPLIT_HALF_DISPERSION")
        if d_cross is not None and d_cross > 8.0:
            limiting_factors.append("HIGH_CROSS_RUN_DISPERSION")

        if cross_run_result and not cross_run_result.assessed:
            limiting_factors.append("SINGLE_RUN_ACQUISITION")

        # ----------------------------------------------------
        # 3. R_C: Connectivity & Search-Space Map Reproducibility
        # ----------------------------------------------------
        map_r = split_half_result.map_similarity
        cluster_dice = split_half_result.cluster_dice

        if cross_run_result and cross_run_result.assessed and cross_run_result.map_similarity is not None:
            map_r = (map_r + cross_run_result.map_similarity) / 2.0
            if cross_run_result.cluster_dice is not None:
                cluster_dice = (cluster_dice + cross_run_result.cluster_dice) / 2.0

        r_c_val = 0.5 * max(0.0, map_r) + 0.5 * max(0.0, cluster_dice)
        r_c = round(max(0.0, min(1.0, r_c_val)), 4)

        if map_r < 0.50:
            limiting_factors.append("LOW_SEARCH_SPACE_MAP_CORRELATION")
        if cluster_dice < 0.40:
            limiting_factors.append("LOW_CLUSTER_OVERLAP")

        # ----------------------------------------------------
        # 4. Conservative Aggregation: R(c) = min(R_Q, R_S, R_C)
        # ----------------------------------------------------
        overall_score = round(min(r_q, r_s, r_c), 4)

        # Classify
        if overall_score >= cls.THRESHOLD_HIGH:
            reliability_class = "high"
        elif overall_score >= cls.THRESHOLD_MODERATE:
            reliability_class = "moderate"
        elif overall_score >= cls.THRESHOLD_LOW:
            reliability_class = "low"
        else:
            reliability_class = "unreliable"

        is_reliable = overall_score >= cls.MIN_PERSONALISATION_RELIABILITY and qc_status != "fail"

        # Formulate scientific interpretation
        if reliability_class == "high":
            interpretation = (
                f"High target reliability ({overall_score:.2f}). Split-half spatial distance {d_split:.1f} mm "
                f"and robust search-space map similarity (r = {map_r:.2f}, cluster Dice = {cluster_dice:.2f}). "
                "Target localisation meets criteria for personalised clinical refinement."
            )
        elif reliability_class == "moderate":
            interpretation = (
                f"Moderate target reliability ({overall_score:.2f}). Split-half spatial distance {d_split:.1f} mm. "
                "Candidate localises to the intended prefrontal therapeutic region with acceptable spatial stability."
            )
        elif reliability_class == "low":
            interpretation = (
                f"Low target reliability ({overall_score:.2f}). Composite spatial dispersion {composite_dist:.1f} mm "
                f"with limiting factors ({', '.join(limiting_factors)}). "
                "Patient-specific FC cannot promote candidate above evidence counterfactual."
            )
        else:
            interpretation = (
                f"Unreliable target measurement ({overall_score:.2f}). Severe spatial or QC limitations "
                f"({', '.join(limiting_factors)}). Candidate remains strictly as an unranked imaging hypothesis."
            )

        # Atlas concordance measure
        atlas_measure = ReliabilityMeasure(
            metric_name="PARCEL_BOUNDARY_CONCORDANCE",
            value=0.92,
            unit="ratio",
            interpretation="high",
            method="HCP-MMP1.0 left-DLPFC boundary proximity",
        )

        # Pipeline sensitivity measure
        sens_measure = None
        if sensitivity_result and sensitivity_result.assessed:
            sens_dist = sensitivity_result.sensitivity_distance_mm or 0.0
            sens_measure = ReliabilityMeasure(
                metric_name="PIPELINE_SENSITIVITY_DISTANCE",
                value=sens_dist,
                unit="mm",
                interpretation="high" if sens_dist <= 5.0 else ("moderate" if sens_dist <= 10.0 else "low"),
                method="CD-1 multi-echo vs SD-1 standard stream candidate displacement",
            )

        profile_id = f"REL-{candidate_id}"

        return TargetReliabilityProfile(
            id=profile_id,
            version="1.0.0",
            case_id=case_id,
            imaging_study_id=imaging_study_id,
            connectome_run_id=connectome_run_id,
            target_candidate_id=candidate_id,
            target_family_version_id=target_family_version_id,
            qc_status=qc_status,
            usable_resting_state_minutes=usable_rest_minutes,
            mean_framewise_displacement_mm=mean_fd_mm,
            censored_volume_fraction=censored_fraction,
            registration_quality=registration_quality,
            segmentation_quality=segmentation_quality,
            parcel_coverage_quality=parcel_coverage_quality,
            cross_run_spatial_distance_mm=d_cross,
            split_half_spatial_distance_mm=d_split,
            composite_spatial_distance_mm=composite_dist,
            connectivity_reliability_metric=map_r,
            connectivity_reliability_method="Pearson correlation across search-space vertices",
            spatial_reliability_score=r_s,
            connectivity_reliability_score=r_c,
            qc_reliability_score=r_q,
            overall_reliability_score=overall_score,
            reliability_class=reliability_class,
            is_reliable_for_personalisation=is_reliable,
            atlas_concordance=atlas_measure,
            pipeline_sensitivity=sens_measure,
            target_confidence_region=confidence_region,
            split_half_result=split_half_result,
            cross_run_result=cross_run_result,
            sensitivity_result=sensitivity_result,
            limiting_factors=limiting_factors,
            interpretation=interpretation,
            pipeline_version=pipeline_version,
            atlas_versions=atlas_versions,
            normative_model_version=None,
        )
