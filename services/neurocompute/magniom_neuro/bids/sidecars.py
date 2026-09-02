"""
BIDS JSON Sidecar Builder
Conforms to BIDS 1.11.1 Metadata Specification
"""

import json
from typing import Dict, Any, Optional
from ..models.dicom import DicomSeriesMetadata


class BidsSidecarBuilder:
    """Constructs standardized BIDS JSON sidecar dictionaries."""

    @staticmethod
    def build_t1w_sidecar(series: DicomSeriesMetadata) -> Dict[str, Any]:
        """Constructs sidecar JSON for anatomical T1w."""
        sidecar = {
            "Modality": "MR",
            "MagneticFieldStrength": series.scanner_field_strength_t,
            "Manufacturer": series.manufacturer or "Siemens",
            "ManufacturersModelName": series.manufacturers_model_name or "Prisma",
            "SeriesDescription": series.series_description,
            "EchoTime": (series.echo_times_ms[0] / 1000.0) if series.echo_times_ms else 0.00222,
            "RepetitionTime": (series.repetition_time_ms / 1000.0) if series.repetition_time_ms else 2.5,
            "FlipAngle": series.flip_angle_deg or 8.0,
            "PhaseEncodingDirection": series.phase_encoding_direction or "j-",
            "ConversionSoftware": "dcm2niix",
            "ConversionSoftwareVersion": "v1.0.20240202",
        }
        return sidecar

    @staticmethod
    def build_bold_sidecar(series: DicomSeriesMetadata, echo_idx: Optional[int] = None) -> Dict[str, Any]:
        """Constructs sidecar JSON for resting-state BOLD."""
        te = 0.030
        if series.echo_times_ms:
            if echo_idx is not None and echo_idx < len(series.echo_times_ms):
                te = series.echo_times_ms[echo_idx] / 1000.0
            else:
                te = series.echo_times_ms[0] / 1000.0

        sidecar = {
            "Modality": "MR",
            "MagneticFieldStrength": series.scanner_field_strength_t,
            "Manufacturer": series.manufacturer or "Siemens",
            "ManufacturersModelName": series.manufacturers_model_name or "Prisma",
            "TaskName": "rest",
            "Instructions": "Keep eyes open and fixate on crosshair",
            "SeriesDescription": series.series_description,
            "EchoTime": te,
            "RepetitionTime": (series.repetition_time_ms / 1000.0) if series.repetition_time_ms else 1.5,
            "FlipAngle": series.flip_angle_deg or 70.0,
            "PhaseEncodingDirection": series.phase_encoding_direction or "j",
            "ConversionSoftware": "dcm2niix",
            "ConversionSoftwareVersion": "v1.0.20240202",
        }
        return sidecar
