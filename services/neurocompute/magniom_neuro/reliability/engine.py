"""
Target Reliability Stage 11 Orchestration Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 106-117, 148, 150
and MAGNIOM-Implementation & Validation Roadmap v1.0 Section 115
"""

import os
from typing import Dict, List, Tuple, Optional, Any
from ..models.circuits import ImagingCandidateRegion, SpatialCoordinate
from ..models.surface import SurfaceProjectionResult
from .models import TargetReliabilityProfile
from .split_half import SplitHalfPartitionEngine
from .cross_run import CrossRunReliabilityEngine
from .sensitivity import PipelineSensitivityEngine
from .confidence_region import ConfidenceRegionEngine
from .aggregator import TargetReliabilityAggregator


class TargetReliabilityEngine:
    """
    Main orchestrator for Stage 11 (Target Reliability).
    Generates comprehensive, verified TargetReliabilityProfile for every connectome candidate.
    """

    @classmethod
    def compute_reliability_stage(
        cls,
        subject_id: str,
        case_id: str,
        imaging_study_id: str,
        connectome_run_id: str,
        surface_projections: List[SurfaceProjectionResult],
        surface_projections_sd1: Optional[List[SurfaceProjectionResult]],
        qc_status: str,
        usable_rest_minutes: float,
        mean_fd_mm: float,
        censored_fraction: float,
        registration_quality: str,
        segmentation_quality: str,
        parcel_coverage_quality: str,
        candidates: List[ImagingCandidateRegion],
        pipeline_version: str = "MAGNIOM-CONNECTOME-1.0.0",
    ) -> List[TargetReliabilityProfile]:
        """
        Executes Stage 11 Target Reliability across all candidates.
        """
        primary_proj = surface_projections[0] if surface_projections else None
        if primary_proj is None:
            return []

        primary_sd1 = surface_projections_sd1[0] if (surface_projections_sd1 and len(surface_projections_sd1) > 0) else None

        profiles: List[TargetReliabilityProfile] = []

        for cand in candidates:
            # 1. Convergent Depression Circuit Candidate
            if "CONVERGENT" in cand.target_family_version_id or "CONV" in cand.candidate_code:
                split_res = SplitHalfPartitionEngine.evaluate_split_half_convergent(
                    subject_id=subject_id,
                    surface_projection=primary_proj,
                )
                cross_res = CrossRunReliabilityEngine.evaluate_cross_run_convergent(
                    subject_id=subject_id,
                    surface_projections=surface_projections,
                )
                sens_res = PipelineSensitivityEngine.evaluate_sensitivity_convergent(
                    subject_id=subject_id,
                    proj_cd1=primary_proj,
                    proj_sd1=primary_sd1,
                )
                conf_region = ConfidenceRegionEngine.build_confidence_region(
                    primary_medoid_mni=cand.mni_coordinate,
                    primary_vertex_index=cand.surface_vertex_index,
                    split_half_result=split_res,
                    cross_run_result=cross_res,
                    sensitivity_result=sens_res,
                    hemisphere=cand.hemisphere,
                )

            # 2. sgACC Anticorrelation Circuit Candidate
            elif "SGACC" in cand.target_family_version_id or "SGACC" in cand.candidate_code:
                split_res = SplitHalfPartitionEngine.evaluate_split_half_sgacc(
                    subject_id=subject_id,
                    surface_projection=primary_proj,
                )
                cross_res = CrossRunReliabilityEngine.evaluate_cross_run_sgacc(
                    subject_id=subject_id,
                    surface_projections=surface_projections,
                )
                sens_res = PipelineSensitivityEngine.evaluate_sensitivity_sgacc(
                    subject_id=subject_id,
                    proj_cd1=primary_proj,
                    proj_sd1=primary_sd1,
                )
                conf_region = ConfidenceRegionEngine.build_confidence_region(
                    primary_medoid_mni=cand.mni_coordinate,
                    primary_vertex_index=cand.surface_vertex_index,
                    split_half_result=split_res,
                    cross_run_result=cross_res,
                    sensitivity_result=sens_res,
                    hemisphere=cand.hemisphere,
                )

            # 3. Symptom Circuit Candidate (Dysphoric / Anxiosomatic)
            else:
                # Use convergent split-half as baseline proxy
                split_res = SplitHalfPartitionEngine.evaluate_split_half_convergent(
                    subject_id=subject_id,
                    surface_projection=primary_proj,
                )
                cross_res = CrossRunReliabilityEngine.evaluate_cross_run_convergent(
                    subject_id=subject_id,
                    surface_projections=surface_projections,
                )
                sens_res = PipelineSensitivityEngine.evaluate_sensitivity_convergent(
                    subject_id=subject_id,
                    proj_cd1=primary_proj,
                    proj_sd1=primary_sd1,
                )
                conf_region = ConfidenceRegionEngine.build_confidence_region(
                    primary_medoid_mni=cand.mni_coordinate,
                    primary_vertex_index=cand.surface_vertex_index,
                    split_half_result=split_res,
                    cross_run_result=cross_res,
                    sensitivity_result=sens_res,
                    hemisphere=cand.hemisphere,
                )

            # Build aggregated profile
            profile = TargetReliabilityAggregator.aggregate_profile(
                candidate_id=cand.candidate_code,
                case_id=case_id,
                imaging_study_id=imaging_study_id,
                connectome_run_id=connectome_run_id,
                target_family_version_id=cand.target_family_version_id,
                qc_status=qc_status,
                usable_rest_minutes=usable_rest_minutes,
                mean_fd_mm=mean_fd_mm,
                censored_fraction=censored_fraction,
                registration_quality=registration_quality,
                segmentation_quality=segmentation_quality,
                parcel_coverage_quality=parcel_coverage_quality,
                split_half_result=split_res,
                cross_run_result=cross_res,
                sensitivity_result=sens_res,
                confidence_region=conf_region,
                pipeline_version=pipeline_version,
            )

            # Update candidate reliability score with real calculated value
            cand.reliability_score = profile.overall_reliability_score
            profiles.append(profile)

        return profiles
