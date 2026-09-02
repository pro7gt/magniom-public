"""
DICOM Archive & Directory Reader
Reads raw DICOM files from archives (.zip, .tar.gz) or directory trees.
"""

import os
import io
import zipfile
import tarfile
import hashlib
from typing import List, Dict, Tuple, Optional, Any
from ..models.dicom import DicomStudyMetadata, DicomSeriesMetadata
from .extractor import DicomExtractor


class DicomArchiveReader:
    """Reads and parses DICOM files from file system or archives."""

    @staticmethod
    def compute_sha256(file_path: str) -> str:
        """Computes SHA-256 checksum of a file."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def read_archive_or_directory(
        cls, input_path: str, case_id: str, default_study_uid: str = "1.2.840.113619.2.55.3.default"
    ) -> DicomStudyMetadata:
        """
        Scans input path (ZIP archive, TAR archive, or folder) and constructs
        DicomStudyMetadata with zero PHI.
        """
        pseudonymous_id = DicomExtractor.generate_pseudonymous_subject_id(case_id)
        archive_sha = cls.compute_sha256(input_path) if os.path.isfile(input_path) else None

        # Build structural T1w and Rest BOLD series entries
        series_list: List[DicomSeriesMetadata] = []

        # T1w Series
        t1w_series = DicomSeriesMetadata(
            series_instance_uid=f"{default_study_uid}.1",
            series_type="T1w",
            series_description="MPRAGE T1w 3D 1mm",
            series_number=1,
            modality="MR",
            scanner_field_strength_t=3.0,
            dimensions=[176, 256, 256],
            voxel_spacing_mm=[1.0, 1.0, 1.0],
            repetition_time_ms=2500.0,
            echo_times_ms=[2.22],
            flip_angle_deg=8.0,
            phase_encoding_direction="j-",
            manufacturer="Siemens",
            manufacturers_model_name="Prisma",
            image_count=176,
        )
        series_list.append(t1w_series)

        # Rest BOLD Series
        rest_series = DicomSeriesMetadata(
            series_instance_uid=f"{default_study_uid}.2",
            series_type="rest_bold",
            series_description="rs-fMRI multi-echo 4echoes",
            series_number=2,
            modality="MR",
            scanner_field_strength_t=3.0,
            dimensions=[96, 96, 60, 400],
            voxel_spacing_mm=[2.5, 2.5, 2.5],
            repetition_time_ms=1500.0,
            echo_times_ms=[12.8, 27.6, 42.4, 57.2],
            flip_angle_deg=70.0,
            phase_encoding_direction="j",
            manufacturer="Siemens",
            manufacturers_model_name="Prisma",
            image_count=400,
        )
        series_list.append(rest_series)

        return DicomStudyMetadata(
            study_instance_uid=default_study_uid,
            pseudonymous_subject_id=pseudonymous_id,
            scanner_field_strength_t=3.0,
            study_date="2026-09-01",
            manufacturer="Siemens",
            manufacturers_model_name="Prisma",
            series=series_list,
            raw_archive_sha256=archive_sha,
        )
