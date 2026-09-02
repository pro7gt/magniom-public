"""
DICOM Acquisition Validator
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 29
"""

from dataclasses import dataclass, field
from typing import List, Optional
from ..models.dicom import DicomStudyMetadata, DicomSeriesMetadata
from ..models.qc import QCWarning


@dataclass
class DicomValidationResult:
    """Result of DICOM study acquisition validation."""
    is_valid: bool
    has_t1w: bool
    has_rest_bold: bool
    t1w_series_count: int
    rest_series_count: int
    fieldmap_series_count: int
    warnings: List[QCWarning] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class DicomValidator:
    """Validates DICOM acquisition parameters against Magniom scientific standards."""

    def __init__(self, min_field_strength_t: float = 2.8, max_voxel_size_t1w_mm: float = 1.2):
        self.min_field_strength_t = min_field_strength_t
        self.max_voxel_size_t1w_mm = max_voxel_size_t1w_mm

    def validate_study(self, study: DicomStudyMetadata) -> DicomValidationResult:
        """Validates all series in a DICOM study."""
        warnings: List[QCWarning] = []
        errors: List[str] = []

        if not study.study_instance_uid:
            errors.append("MISSING_STUDY_INSTANCE_UID: StudyInstanceUID is empty.")

        # Check Scanner Field Strength
        if study.scanner_field_strength_t < self.min_field_strength_t:
            warnings.append(
                QCWarning(
                    code="LOW_MAGNETIC_FIELD_STRENGTH",
                    message=f"Scanner field strength is {study.scanner_field_strength_t}T; recommended is >= 3.0T.",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["SNR", "SurfaceReconstruction"],
                )
            )

        t1w_series = [s for s in study.series if s.series_type == "T1w"]
        rest_series = [s for s in study.series if s.series_type == "rest_bold"]
        fmap_series = [s for s in study.series if s.series_type == "fieldmap"]

        if not t1w_series:
            errors.append("MISSING_T1W_SERIES: No T1-weighted structural series found in DICOM study.")
        else:
            for s in t1w_series:
                self._validate_t1w_series(s, warnings, errors)

        for s in rest_series:
            self._validate_rest_series(s, warnings)

        has_t1w = len(t1w_series) > 0 and len(errors) == 0
        has_rest = len(rest_series) > 0
        is_valid = len(errors) == 0

        return DicomValidationResult(
            is_valid=is_valid,
            has_t1w=has_t1w,
            has_rest_bold=has_rest,
            t1w_series_count=len(t1w_series),
            rest_series_count=len(rest_series),
            fieldmap_series_count=len(fmap_series),
            warnings=warnings,
            errors=errors,
        )

    def _validate_t1w_series(
        self, series: DicomSeriesMetadata, warnings: List[QCWarning], errors: List[str]
    ) -> None:
        """Validates anatomical T1w series."""
        if any(v > self.max_voxel_size_t1w_mm for v in series.voxel_spacing_mm):
            warnings.append(
                QCWarning(
                    code="SUBOPTIMAL_T1W_RESOLUTION",
                    message=f"T1w voxel size {series.voxel_spacing_mm} exceeds recommended {self.max_voxel_size_t1w_mm}mm isotropic.",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["CorticalThickness", "PialSurface"],
                )
            )

        if len(series.dimensions) >= 3 and (
            series.dimensions[0] < 128 or series.dimensions[1] < 128 or series.dimensions[2] < 128
        ):
            errors.append(
                f"INSUFFICIENT_T1W_FOV: T1w matrix dimensions {series.dimensions} are too small for whole-brain reconstruction."
            )

    def _validate_rest_series(self, series: DicomSeriesMetadata, warnings: List[QCWarning]) -> None:
        """Validates functional resting-state BOLD series."""
        if len(series.echo_times_ms) > 1 and len(series.echo_times_ms) < 3:
            warnings.append(
                QCWarning(
                    code="PARTIAL_MULTI_ECHO",
                    message=f"Rest BOLD series has {len(series.echo_times_ms)} echoes; 4 echoes recommended for multi-echo tedana.",
                    severity="info",
                    clinical_impact="none",
                    affected_components=["TedanaDenoising"],
                )
            )
