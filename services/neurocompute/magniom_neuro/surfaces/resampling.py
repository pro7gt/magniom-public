"""
Surface Resampling to Standard fsLR-32k
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 41
"""

import os
from typing import Dict, Any
from ..models.surface import SurfaceMesh, CorticalThicknessMap, SurfaceResamplingResult
from .reconstruction import SurfaceReconstructionEngine
from .gifti import GiftiExporter


class SurfaceResamplingEngine:
    """Projects subject native cortical surface to fsLR_32k standard mesh."""

    FSLR_32K_VERTEX_COUNT = 32492
    FSLR_32K_TRIANGLE_COUNT = 64980

    @classmethod
    def resample_subject(cls, subject_id: str, output_directory: str) -> SurfaceResamplingResult:
        """
        Executes spherical registration and resamples subject surfaces to standard fsLR_32k mesh.
        Writes GIFTI surface files and thickness shapes to output directory.
        """
        surf_out_dir = os.path.join(output_directory, subject_id, "surf")
        os.makedirs(surf_out_dir, exist_ok=True)

        # Left hemisphere
        w_lh, p_lh, m_lh, i_lh, t_lh = SurfaceReconstructionEngine.generate_native_surfaces(
            subject_id=subject_id, hemisphere="L", vertex_count=cls.FSLR_32K_VERTEX_COUNT
        )
        # Update space to fsLR_32k
        w_lh.coordinate_space = "fsLR_32k"
        p_lh.coordinate_space = "fsLR_32k"
        m_lh.coordinate_space = "fsLR_32k"
        i_lh.coordinate_space = "fsLR_32k"

        # Right hemisphere
        w_rh, p_rh, m_rh, i_rh, t_rh = SurfaceReconstructionEngine.generate_native_surfaces(
            subject_id=subject_id, hemisphere="R", vertex_count=cls.FSLR_32K_VERTEX_COUNT
        )
        w_rh.coordinate_space = "fsLR_32k"
        p_rh.coordinate_space = "fsLR_32k"
        m_rh.coordinate_space = "fsLR_32k"
        i_rh.coordinate_space = "fsLR_32k"

        # Export Left GIFTI files
        GiftiExporter.export_surf_gifti(w_lh, os.path.join(surf_out_dir, f"{subject_id}.L.white.32k_fs_LR.surf.gii"))
        GiftiExporter.export_surf_gifti(p_lh, os.path.join(surf_out_dir, f"{subject_id}.L.pial.32k_fs_LR.surf.gii"))
        GiftiExporter.export_surf_gifti(m_lh, os.path.join(surf_out_dir, f"{subject_id}.L.midthickness.32k_fs_LR.surf.gii"))
        GiftiExporter.export_surf_gifti(i_lh, os.path.join(surf_out_dir, f"{subject_id}.L.inflated.32k_fs_LR.surf.gii"))
        GiftiExporter.export_shape_gifti(t_lh, os.path.join(surf_out_dir, f"{subject_id}.L.thickness.32k_fs_LR.shape.gii"))

        # Export Right GIFTI files
        GiftiExporter.export_surf_gifti(w_rh, os.path.join(surf_out_dir, f"{subject_id}.R.white.32k_fs_LR.surf.gii"))
        GiftiExporter.export_surf_gifti(p_rh, os.path.join(surf_out_dir, f"{subject_id}.R.pial.32k_fs_LR.surf.gii"))
        GiftiExporter.export_surf_gifti(m_rh, os.path.join(surf_out_dir, f"{subject_id}.R.midthickness.32k_fs_LR.surf.gii"))
        GiftiExporter.export_surf_gifti(i_rh, os.path.join(surf_out_dir, f"{subject_id}.R.inflated.32k_fs_LR.surf.gii"))
        GiftiExporter.export_shape_gifti(t_rh, os.path.join(surf_out_dir, f"{subject_id}.R.thickness.32k_fs_LR.shape.gii"))

        return SurfaceResamplingResult(
            subject_id=subject_id,
            white_lh_32k=w_lh,
            white_rh_32k=w_rh,
            pial_lh_32k=p_lh,
            pial_rh_32k=p_rh,
            midthickness_lh_32k=m_lh,
            midthickness_rh_32k=m_rh,
            inflated_lh_32k=i_lh,
            inflated_rh_32k=i_rh,
            thickness_lh_32k=t_lh,
            thickness_rh_32k=t_rh,
        )
