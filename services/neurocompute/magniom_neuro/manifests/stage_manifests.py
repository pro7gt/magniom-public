"""
Stage Manifest Builders
Generates independent stage manifests (01-bids.json, 02-structural.json, 06-surface.json).
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 150.
"""

import json
import os
from typing import Dict, List, Any
from ..models.bids import BidsDataset
from ..models.structural import StructuralOutputs
from ..models.surface import SurfaceResamplingResult
from ..models.bold import BOLDPreprocessingOutputs, MultiEchoRunMetadata
from ..models.tedana import TedanaOutputs
from ..models.denoise import DenoisedTimeSeriesOutput
from ..models.functional_qc import FunctionalQCEvaluationResult
from ..models.qc import StructuralQCMetrics, QCWarning
from ..models.manifest import StageManifest, ManifestFileEntry
from .hasher import Hasher


class StageManifestBuilder:
    """Builds and writes per-stage JSON manifests."""

    @classmethod
    def build_bids_manifest(
        cls,
        bids_dataset: BidsDataset,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 01-bids.json."""
        manifest_dict = {
            "stage_number": "01",
            "stage_name": "BIDS_CONVERT",
            "status": "passed" if bids_dataset.is_valid else "failed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "subject_id": bids_dataset.subject_id,
            "bids_version": bids_dataset.description.bids_version,
            "files": [
                {
                    "path": f.relative_path,
                    "sha256": f.sha256,
                    "size_bytes": f.size_bytes,
                    "modality": f.modality,
                }
                for f in bids_dataset.files
            ],
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "01-bids.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        return StageManifest(
            stage_number="01",
            stage_name="BIDS_CONVERT",
            status="passed" if bids_dataset.is_valid else "failed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=[f.sha256 for f in bids_dataset.files],
            warnings=warnings,
            execution_metrics={"file_count": len(bids_dataset.files)},
        )

    @classmethod
    def build_structural_manifest(
        cls,
        structural_outputs: StructuralOutputs,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 02-structural.json."""
        manifest_dict = {
            "stage_number": "02",
            "stage_name": "STRUCTURAL_PREPROCESS",
            "status": "passed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "bias_corrected_t1w_sha256": structural_outputs.bias_corrected_t1w_sha256,
            "brain_mask_sha256": structural_outputs.brain_mask_sha256,
            "segmentation": structural_outputs.segmentation.__dict__,
            "registration": structural_outputs.registration.__dict__,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "02-structural.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [
            structural_outputs.bias_corrected_t1w_sha256,
            structural_outputs.brain_mask_sha256,
            structural_outputs.segmentation.segmentation_artifact_sha256,
            structural_outputs.registration.forward_warp_sha256,
        ]

        return StageManifest(
            stage_number="02",
            stage_name="STRUCTURAL_PREPROCESS",
            status="passed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "brain_volume_mm3": structural_outputs.segmentation.total_brain_volume_mm3,
                "dice_overlap": structural_outputs.registration.dice_overlap,
            },
        )

    @classmethod
    def build_fmriprep_manifest(
        cls,
        fmriprep_outputs: BOLDPreprocessingOutputs,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 03-fmriprep.json."""
        manifest_dict = {
            "stage_number": "03",
            "stage_name": "FMRIPREP_PREPROCESS",
            "status": "passed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "run_index": fmriprep_outputs.run_index,
            "subject_id": fmriprep_outputs.subject_id,
            "bold_reference_sha256": fmriprep_outputs.bold_reference_sha256,
            "realigned_echo_hashes": fmriprep_outputs.realigned_echo_hashes,
            "confounds_tsv_sha256": fmriprep_outputs.confounds_tsv_sha256,
            "motion_summary": {
                "mean_fd_mm": fmriprep_outputs.motion_parameters.mean_fd_mm,
                "max_fd_mm": fmriprep_outputs.motion_parameters.max_fd_mm,
            },
            "non_steady_state": fmriprep_outputs.non_steady_state.__dict__,
            "t1w_coregistration_dice": fmriprep_outputs.t1w_coregistration_dice,
            "t1w_coregistration_mutual_info": fmriprep_outputs.t1w_coregistration_mutual_info,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "03-fmriprep.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [
            fmriprep_outputs.bold_reference_sha256,
            fmriprep_outputs.confounds_tsv_sha256,
        ] + fmriprep_outputs.realigned_echo_hashes

        return StageManifest(
            stage_number="03",
            stage_name="FMRIPREP_PREPROCESS",
            status="passed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "mean_fd_mm": fmriprep_outputs.motion_parameters.mean_fd_mm,
                "non_steady_state_volumes": fmriprep_outputs.non_steady_state.num_non_steady_state_volumes,
                "coregistration_dice": fmriprep_outputs.t1w_coregistration_dice,
            },
        )

    @classmethod
    def build_tedana_manifest(
        cls,
        tedana_outputs: TedanaOutputs,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 04-tedana.json."""
        manifest_dict = {
            "stage_number": "04",
            "stage_name": "TEDANA_MULTI_ECHO",
            "status": "passed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "run_index": tedana_outputs.run_index,
            "subject_id": tedana_outputs.subject_id,
            "optimally_combined_bold_sha256": tedana_outputs.optimally_combined_bold_sha256,
            "meica_denoised_bold_sha256": tedana_outputs.meica_denoised_bold_sha256,
            "t2star_map_sha256": tedana_outputs.t2star_map_sha256,
            "adaptive_mask_sha256": tedana_outputs.adaptive_mask_sha256,
            "component_summary": {
                "total_components": tedana_outputs.total_components,
                "accepted_components": tedana_outputs.accepted_components,
                "rejected_components": tedana_outputs.rejected_components,
                "accepted_variance_fraction": tedana_outputs.accepted_variance_fraction,
                "is_automated_classification": tedana_outputs.is_automated_classification,
            },
            "t2star_metrics": tedana_outputs.t2star_metrics.__dict__,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "04-tedana.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [
            tedana_outputs.optimally_combined_bold_sha256,
            tedana_outputs.meica_denoised_bold_sha256,
            tedana_outputs.t2star_map_sha256,
            tedana_outputs.adaptive_mask_sha256,
        ]

        return StageManifest(
            stage_number="04",
            stage_name="TEDANA_MULTI_ECHO",
            status="passed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "total_components": tedana_outputs.total_components,
                "accepted_components": tedana_outputs.accepted_components,
                "rejected_components": tedana_outputs.rejected_components,
                "accepted_variance_fraction": tedana_outputs.accepted_variance_fraction,
            },
        )

    @classmethod
    def build_denoise_manifest(
        cls,
        denoised_output: DenoisedTimeSeriesOutput,
        qc_eval: FunctionalQCEvaluationResult,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 05-denoise.json."""
        manifest_dict = {
            "stage_number": "05",
            "stage_name": "MAGNIOM_DENOISE_CD1",
            "status": "passed" if qc_eval.overall_status in ["pass", "conditional"] else "failed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "run_index": denoised_output.run_index,
            "subject_id": denoised_output.subject_id,
            "denoising_configuration": denoised_output.denoising_configuration,
            "denoised_bold_sha256": denoised_output.denoised_bold_sha256,
            "nuisance_matrix_sha256": denoised_output.nuisance_matrix_sha256,
            "nuisance_parameters": {
                "num_regressors": denoised_output.num_regressors,
                "includes_gsr": denoised_output.includes_gsr,
                "motion_expansion": denoised_output.motion_regressor_expansion,
                "tissue_regressors": denoised_output.tissue_regressors,
                "bandpass_hz": [denoised_output.bandpass_low_hz, denoised_output.bandpass_high_hz],
            },
            "retained_time": denoised_output.retained_time.__dict__,
            "functional_qc": {
                "overall_status": qc_eval.overall_status,
                "is_personalisation_qualified": qc_eval.is_personalisation_qualified,
                "limitation_summary": qc_eval.limitation_summary,
                "metrics": qc_eval.metrics.__dict__,
            },
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "05-denoise.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [
            denoised_output.denoised_bold_sha256,
            denoised_output.nuisance_matrix_sha256,
        ]

        return StageManifest(
            stage_number="05",
            stage_name="MAGNIOM_DENOISE_CD1",
            status="passed" if qc_eval.overall_status in ["pass", "conditional"] else "failed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "retained_minutes": denoised_output.retained_time.final_retained_minutes,
                "percentage_retained": denoised_output.retained_time.percentage_retained,
                "mean_fd_mm": qc_eval.metrics.mean_fd_mm,
                "qc_status": qc_eval.overall_status,
            },
        )

    @classmethod
    def build_surface_manifest(
        cls,
        surfaces: SurfaceResamplingResult,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 06-surface.json."""
        manifest_dict = {
            "stage_number": "06",
            "stage_name": "SURFACE_RECONSTRUCT",
            "status": "passed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "subject_id": surfaces.subject_id,
            "standard_mesh": "fsLR_32k",
            "surfaces": {
                "white_lh_sha256": surfaces.white_lh_32k.artifact_sha256,
                "white_rh_sha256": surfaces.white_rh_32k.artifact_sha256,
                "pial_lh_sha256": surfaces.pial_lh_32k.artifact_sha256,
                "pial_rh_sha256": surfaces.pial_rh_32k.artifact_sha256,
                "midthickness_lh_sha256": surfaces.midthickness_lh_32k.artifact_sha256,
                "midthickness_rh_sha256": surfaces.midthickness_rh_32k.artifact_sha256,
                "inflated_lh_sha256": surfaces.inflated_lh_32k.artifact_sha256,
                "inflated_rh_sha256": surfaces.inflated_rh_32k.artifact_sha256,
                "thickness_lh_sha256": surfaces.thickness_lh_32k.artifact_sha256,
                "thickness_rh_sha256": surfaces.thickness_rh_32k.artifact_sha256,
            },
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "06-surface.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [
            surfaces.white_lh_32k.artifact_sha256 or "",
            surfaces.white_rh_32k.artifact_sha256 or "",
            surfaces.pial_lh_32k.artifact_sha256 or "",
            surfaces.pial_rh_32k.artifact_sha256 or "",
            surfaces.thickness_lh_32k.artifact_sha256 or "",
            surfaces.thickness_rh_32k.artifact_sha256 or "",
        ]

        return StageManifest(
            stage_number="06",
            stage_name="SURFACE_RECONSTRUCT",
            status="passed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "vertex_count_per_hemi": surfaces.white_lh_32k.vertex_count,
                "mean_thickness_mm": surfaces.thickness_lh_32k.mean_thickness_mm,
            },
        )

    @classmethod
    def build_surface_projection_manifest(
        cls,
        subject_id: str,
        run_index: int,
        denoising_config: str,
        gifti_lh_sha256: str,
        gifti_rh_sha256: str,
        medial_wall_count: int,
        valid_cortical_count: int,
        mean_tsnr_surface: float,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 06-surface-projection.json."""
        manifest_dict = {
            "stage_number": "06",
            "stage_name": "SURFACE_PROJECTION",
            "status": "passed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "subject_id": subject_id,
            "run_index": run_index,
            "denoising_configuration": denoising_config,
            "standard_mesh": "fsLR_32k",
            "gifti_lh_sha256": gifti_lh_sha256,
            "gifti_rh_sha256": gifti_rh_sha256,
            "medial_wall_count": medial_wall_count,
            "valid_cortical_count": valid_cortical_count,
            "mean_tsnr_surface": mean_tsnr_surface,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "06-surface.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [gifti_lh_sha256, gifti_rh_sha256]

        return StageManifest(
            stage_number="06",
            stage_name="SURFACE_PROJECTION",
            status="passed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "valid_cortical_vertices": valid_cortical_count,
                "mean_tsnr_surface": mean_tsnr_surface,
            },
        )

    @classmethod
    def build_connectome_manifest(
        cls,
        subject_id: str,
        atlas_name: str,
        num_parcels: int,
        valid_parcels_count: int,
        conditional_parcels_count: int,
        invalid_parcels_count: int,
        fc_matrix_sha256: str,
        timeseries_tsv_sha256: str,
        total_retained_minutes: float,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 07-connectome.json."""
        manifest_dict = {
            "stage_number": "07",
            "stage_name": "CONNECTOME_MATRIX",
            "status": "passed" if invalid_parcels_count < 20 else "conditional",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "subject_id": subject_id,
            "atlas": atlas_name,
            "num_parcels": num_parcels,
            "parcel_coverage_summary": {
                "valid_parcels": valid_parcels_count,
                "conditional_parcels": conditional_parcels_count,
                "invalid_parcels": invalid_parcels_count,
            },
            "fc_matrix_sha256": fc_matrix_sha256,
            "timeseries_tsv_sha256": timeseries_tsv_sha256,
            "total_retained_minutes": total_retained_minutes,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "07-connectome.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        output_hashes = [fc_matrix_sha256, timeseries_tsv_sha256]

        return StageManifest(
            stage_number="07",
            stage_name="CONNECTOME_MATRIX",
            status="passed" if invalid_parcels_count < 20 else "conditional",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=output_hashes,
            warnings=warnings,
            execution_metrics={
                "valid_parcels": valid_parcels_count,
                "retained_minutes": total_retained_minutes,
            },
        )

    @classmethod
    def build_circuits_manifest(
        cls,
        subject_id: str,
        candidates_count: int,
        candidate_codes: List[str],
        circuit_metrics_count: int,
        sgacc_concordance: float,
        convergent_concordance: float,
        symptom_circuits_count: int,
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 08-circuits.json."""
        manifest_dict = {
            "stage_number": "08",
            "stage_name": "THERAPEUTIC_CIRCUITS",
            "status": "passed",
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "subject_id": subject_id,
            "candidates_count": candidates_count,
            "candidate_codes": candidate_codes,
            "circuit_metrics_count": circuit_metrics_count,
            "sgacc_concordance": sgacc_concordance,
            "convergent_concordance": convergent_concordance,
            "symptom_circuits_count": symptom_circuits_count,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "08-circuits.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        return StageManifest(
            stage_number="08",
            stage_name="THERAPEUTIC_CIRCUITS",
            status="passed",
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=[],
            warnings=warnings,
            execution_metrics={
                "candidates_generated": candidates_count,
                "convergent_concordance": convergent_concordance,
                "sgacc_concordance": sgacc_concordance,
            },
        )

    @classmethod
    def build_reliability_manifest(
        cls,
        subject_id: str,
        reliability_profiles: List[Any],
        started_at: str,
        completed_at: str,
        duration_seconds: float,
        warnings: List[QCWarning],
        output_dir: str,
    ) -> StageManifest:
        """Constructs and writes 11-reliability.json."""
        high_count = sum(1 for p in reliability_profiles if getattr(p, "reliability_class", "") == "high")
        mod_count = sum(1 for p in reliability_profiles if getattr(p, "reliability_class", "") == "moderate")
        low_count = sum(1 for p in reliability_profiles if getattr(p, "reliability_class", "") == "low")
        unrel_count = sum(1 for p in reliability_profiles if getattr(p, "reliability_class", "") == "unreliable")

        split_dists = [getattr(p, "split_half_spatial_distance_mm", None) for p in reliability_profiles if getattr(p, "split_half_spatial_distance_mm", None) is not None]
        mean_split_dist = round(sum(split_dists) / float(len(split_dists)), 2) if split_dists else None

        cross_dists = [getattr(p, "cross_run_spatial_distance_mm", None) for p in reliability_profiles if getattr(p, "cross_run_spatial_distance_mm", None) is not None]
        mean_cross_dist = round(sum(cross_dists) / float(len(cross_dists)), 2) if cross_dists else None

        overall_status = "passed"
        if unrel_count > 0 or low_count == len(reliability_profiles):
            overall_status = "conditional"
        if any(getattr(p, "qc_status", "") == "fail" for p in reliability_profiles):
            overall_status = "failed"

        serialized_profiles = []
        for p in reliability_profiles:
            p_dict = {
                "id": getattr(p, "id", ""),
                "target_candidate_id": getattr(p, "target_candidate_id", ""),
                "target_family_version_id": getattr(p, "target_family_version_id", ""),
                "qc_status": getattr(p, "qc_status", ""),
                "usable_resting_state_minutes": getattr(p, "usable_resting_state_minutes", 0.0),
                "mean_framewise_displacement_mm": getattr(p, "mean_framewise_displacement_mm", 0.0),
                "censored_volume_fraction": getattr(p, "censored_volume_fraction", 0.0),
                "cross_run_spatial_distance_mm": getattr(p, "cross_run_spatial_distance_mm", None),
                "split_half_spatial_distance_mm": getattr(p, "split_half_spatial_distance_mm", None),
                "composite_spatial_distance_mm": getattr(p, "composite_spatial_distance_mm", 0.0),
                "connectivity_reliability_metric": getattr(p, "connectivity_reliability_metric", 0.0),
                "spatial_reliability_score": getattr(p, "spatial_reliability_score", 0.0),
                "connectivity_reliability_score": getattr(p, "connectivity_reliability_score", 0.0),
                "qc_reliability_score": getattr(p, "qc_reliability_score", 0.0),
                "overall_reliability_score": getattr(p, "overall_reliability_score", 0.0),
                "reliability_class": getattr(p, "reliability_class", "unreliable"),
                "is_reliable_for_personalisation": getattr(p, "is_reliable_for_personalisation", False),
                "limiting_factors": getattr(p, "limiting_factors", []),
                "interpretation": getattr(p, "interpretation", ""),
            }
            if getattr(p, "target_confidence_region", None):
                cr = p.target_confidence_region
                p_dict["confidence_region"] = {
                    "space": cr.space,
                    "hemisphere": cr.hemisphere,
                    "surface_area_mm2": cr.surface_area_mm2,
                    "centroid_mni": cr.centroid_mni,
                    "bounding_box_mni": cr.bounding_box_mni,
                    "max_radius_mm": cr.max_radius_mm,
                }
            serialized_profiles.append(p_dict)

        manifest_dict = {
            "stage_number": "11",
            "stage_name": "TARGET_RELIABILITY",
            "status": overall_status,
            "started_at": started_at,
            "completed_at": completed_at,
            "duration_seconds": duration_seconds,
            "subject_id": subject_id,
            "profiles_count": len(reliability_profiles),
            "reliability_class_distribution": {
                "high": high_count,
                "moderate": mod_count,
                "low": low_count,
                "unreliable": unrel_count,
            },
            "mean_split_half_distance_mm": mean_split_dist,
            "mean_cross_run_distance_mm": mean_cross_dist,
            "profiles": serialized_profiles,
            "warnings": [w.__dict__ for w in warnings],
        }

        manifest_path = os.path.join(output_dir, "11-reliability.json")
        os.makedirs(os.path.dirname(manifest_path), exist_ok=True)
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest_dict, f, indent=2)

        return StageManifest(
            stage_number="11",
            stage_name="TARGET_RELIABILITY",
            status=overall_status,
            started_at=started_at,
            completed_at=completed_at,
            duration_seconds=duration_seconds,
            input_hashes=[],
            output_hashes=[Hasher.sha256_file(manifest_path)],
            warnings=warnings,
            execution_metrics={
                "profiles_evaluated": len(reliability_profiles),
                "high_reliability_count": high_count,
                "mean_split_half_distance": mean_split_dist or 0.0,
            },
        )



