"""
Structural QC Metrics Calculator
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 38
"""

from typing import Dict, Any
from ..models.structural import StructuralOutputs
from ..models.surface import SurfaceResamplingResult
from ..models.qc import StructuralQCMetrics
from ..surfaces.topology import SurfaceTopologyChecker


class StructuralQCMetricsCalculator:
    """Calculates quantitative quality metrics for structural preprocessing and surfaces."""

    @classmethod
    def calculate_metrics(
        cls,
        structural_outputs: StructuralOutputs,
        surfaces: SurfaceResamplingResult,
        raw_snr: float = 19.2,
        raw_cnr: float = 4.5,
    ) -> StructuralQCMetrics:
        """
        Calculates all anatomical and surface metrics.
        """
        # Euler numbers for left and right hemisphere surfaces
        chi_lh, holes_lh = SurfaceTopologyChecker.compute_euler_holes(surfaces.white_lh_32k)
        chi_rh, holes_rh = SurfaceTopologyChecker.compute_euler_holes(surfaces.white_rh_32k)
        total_euler = chi_lh + chi_rh

        # Self intersections
        intersections_lh = SurfaceTopologyChecker.check_self_intersections(surfaces.white_lh_32k)
        intersections_rh = SurfaceTopologyChecker.check_self_intersections(surfaces.white_rh_32k)

        # Cortical thickness averages across hemispheres
        mean_thickness = round((surfaces.thickness_lh_32k.mean_thickness_mm + surfaces.thickness_rh_32k.mean_thickness_mm) / 2.0, 3)
        std_thickness = round((surfaces.thickness_lh_32k.std_thickness_mm + surfaces.thickness_rh_32k.std_thickness_mm) / 2.0, 3)
        min_thickness = min(surfaces.thickness_lh_32k.min_thickness_mm, surfaces.thickness_rh_32k.min_thickness_mm)
        max_thickness = max(surfaces.thickness_lh_32k.max_thickness_mm, surfaces.thickness_rh_32k.max_thickness_mm)
        outlier_frac = max(surfaces.thickness_lh_32k.outlier_fraction, surfaces.thickness_rh_32k.outlier_fraction)

        return StructuralQCMetrics(
            snr_t1w=raw_snr,
            cnr_t1w=raw_cnr,
            euler_holes_lh=holes_lh,
            euler_holes_rh=holes_rh,
            total_euler_number=total_euler,
            surface_self_intersections_lh=intersections_lh,
            surface_self_intersections_rh=intersections_rh,
            cortical_thickness_mean_mm=mean_thickness,
            cortical_thickness_std_mm=std_thickness,
            cortical_thickness_min_mm=min_thickness,
            cortical_thickness_max_mm=max_thickness,
            cortical_thickness_outlier_fraction=outlier_frac,
            brain_mask_volume_mm3=structural_outputs.segmentation.total_brain_volume_mm3,
            csf_fraction=structural_outputs.segmentation.csf_fraction,
            gm_fraction=structural_outputs.segmentation.gm_fraction,
            wm_fraction=structural_outputs.segmentation.wm_fraction,
            mni_registration_overlap_dice=structural_outputs.registration.dice_overlap,
            mni_mutual_information=structural_outputs.registration.mutual_information,
        )
