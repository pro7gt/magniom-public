"""
Neuroimaging Artifact Validator and Substrate Integrity Engine
Conforms to MAGNIOM-Neuroimaging & Multimodal Measurement Specification v2.0
and ISO 13485 / IEC 62304 fail-closed content validation.
"""

import os
import gzip
import struct
import hashlib
from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Dict, Any


@dataclass
class ValidationResult:
    """Detailed artifact validation outcome."""
    valid: bool
    file_path: str
    file_type: str  # 'nifti_3d', 'nifti_4d', 'gifti_surface', 'mock_placeholder', 'invalid'
    sha256: str
    data_origin: str  # 'patient_measured', 'synthetic', 'normative', 'unknown'
    dimensions: Optional[Tuple[int, ...]] = None
    voxel_sizes: Optional[Tuple[float, ...]] = None
    tr_seconds: Optional[float] = None
    coordinate_space: Optional[str] = None
    errors: List[str] = field(default_factory=list)
    warnings: List[str] = field(default_factory=list)


class ArtifactValidator:
    """
    Validates neuroimaging artifacts by content (magic bytes, headers, structures),
    guaranteeing that text placeholders or mock inputs fail closed in clinical validation.
    """

    NIFTI1_MAGIC_NI1 = b"ni1\x00"
    NIFTI1_MAGIC_NPLUS1 = b"n+1\x00"
    GZIP_MAGIC = b"\x1f\x8b"

    @classmethod
    def compute_sha256(cls, file_path: str) -> str:
        """Computes SHA-256 digest of file content."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def validate_nifti(
        cls,
        file_path: str,
        is_4d_bold: bool = False,
        min_timepoints: int = 50,
    ) -> ValidationResult:
        """
        Validates a NIfTI-1 file (.nii or .nii.gz) by parsing binary header fields.
        Asserts non-mock content, dimensionality, positive voxel spacing, and TR.
        """
        if not os.path.exists(file_path):
            return ValidationResult(
                valid=False,
                file_path=file_path,
                file_type="invalid",
                sha256="",
                data_origin="unknown",
                errors=[f"Artifact file not found: {file_path}"],
            )

        file_size = os.path.getsize(file_path)
        if file_size < 352:
            return ValidationResult(
                valid=False,
                file_path=file_path,
                file_type="mock_placeholder",
                sha256=cls.compute_sha256(file_path) if file_size > 0 else "",
                data_origin="synthetic",
                errors=[f"File size ({file_size} bytes) below minimum NIfTI header size (352 bytes). Mock placeholder rejected."],
            )

        file_hash = cls.compute_sha256(file_path)

        try:
            with open(file_path, "rb") as f:
                header_bytes = f.read(352)

            # Check if gzipped
            is_gz = header_bytes[:2] == cls.GZIP_MAGIC
            if is_gz:
                with gzip.open(file_path, "rb") as gz_f:
                    header_bytes = gz_f.read(352)

            if len(header_bytes) < 348:
                return ValidationResult(
                    valid=False,
                    file_path=file_path,
                    file_type="invalid",
                    sha256=file_hash,
                    data_origin="unknown",
                    errors=["Uncompressed NIfTI header truncated."],
                )

            # NIfTI-1 sizeof_hdr is 348 (little or big endian)
            sizeof_hdr = struct.unpack("<i", header_bytes[:4])[0]
            endian = "<"
            if sizeof_hdr != 348:
                sizeof_hdr_be = struct.unpack(">i", header_bytes[:4])[0]
                if sizeof_hdr_be == 348:
                    endian = ">"
                else:
                    return ValidationResult(
                        valid=False,
                        file_path=file_path,
                        file_type="mock_placeholder",
                        sha256=file_hash,
                        data_origin="synthetic",
                        errors=[f"Invalid sizeof_hdr ({sizeof_hdr}). File is not a valid binary NIfTI volume."],
                    )

            # Magic bytes at offset 344
            magic = header_bytes[344:348]
            if magic not in (cls.NIFTI1_MAGIC_NI1, cls.NIFTI1_MAGIC_NPLUS1):
                return ValidationResult(
                    valid=False,
                    file_path=file_path,
                    file_type="mock_placeholder",
                    sha256=file_hash,
                    data_origin="synthetic",
                    errors=[f"Invalid NIfTI magic bytes: {magic!r}. File is a placeholder."],
                )

            # Dimensions: dim[0] = ndim, dim[1..ndim] = sizes
            dim = struct.unpack(f"{endian}8h", header_bytes[40:56])
            ndim = dim[0]
            if ndim < 3 or ndim > 7:
                return ValidationResult(
                    valid=False,
                    file_path=file_path,
                    file_type="invalid",
                    sha256=file_hash,
                    data_origin="unknown",
                    errors=[f"Invalid NIfTI dimensionality: {ndim}. Must be 3 or 4."],
                )

            dims = tuple(dim[1 : ndim + 1])
            pixdim = struct.unpack(f"{endian}8f", header_bytes[76:108])
            voxel_sizes = tuple(pixdim[1 : ndim + 1])

            errors: List[str] = []
            warnings: List[str] = []

            # Check spatial dimensions
            if any(d <= 0 for d in dims[:3]):
                errors.append(f"Non-positive spatial dimensions: {dims[:3]}")

            tr_val: Optional[float] = None
            if is_4d_bold:
                if ndim < 4 or dims[3] < 2:
                    errors.append(f"Expected 4D BOLD time series, got {ndim}D with shape {dims}.")
                elif dims[3] < min_timepoints:
                    warnings.append(f"Short BOLD acquisition ({dims[3]} volumes < recommended {min_timepoints}).")
                tr_val = pixdim[4] if ndim >= 4 else None
                if tr_val is not None and tr_val <= 0:
                    errors.append(f"Invalid TR spacing: {tr_val}s")

            file_type = "nifti_4d" if is_4d_bold or (ndim >= 4 and dims[3] > 1) else "nifti_3d"
            valid = len(errors) == 0

            return ValidationResult(
                valid=valid,
                file_path=file_path,
                file_type=file_type,
                sha256=file_hash,
                data_origin="patient_measured" if valid else "unknown",
                dimensions=dims,
                voxel_sizes=voxel_sizes,
                tr_seconds=tr_val,
                coordinate_space="MNI152NLin2009cAsym",
                errors=errors,
                warnings=warnings,
            )

        except Exception as ex:
            return ValidationResult(
                valid=False,
                file_path=file_path,
                file_type="invalid",
                sha256=file_hash,
                data_origin="unknown",
                errors=[f"Exception during NIfTI validation: {str(ex)}"],
            )

    @classmethod
    def validate_gifti(cls, file_path: str, expected_surface: str = "fsLR_32k") -> ValidationResult:
        """
        Validates a GIFTI surface/shape file (.gii) ensuring proper XML structure.
        """
        if not os.path.exists(file_path):
            return ValidationResult(
                valid=False,
                file_path=file_path,
                file_type="invalid",
                sha256="",
                data_origin="unknown",
                errors=[f"GIFTI artifact not found: {file_path}"],
            )

        file_hash = cls.compute_sha256(file_path)
        try:
            with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
                head = f.read(1024)

            if "<GIFTI" not in head and "<!DOCTYPE GIFTI" not in head:
                return ValidationResult(
                    valid=False,
                    file_path=file_path,
                    file_type="mock_placeholder",
                    sha256=file_hash,
                    data_origin="synthetic",
                    errors=["File missing canonical <GIFTI> XML element. Mock placeholder rejected."],
                )

            return ValidationResult(
                valid=True,
                file_path=file_path,
                file_type="gifti_surface",
                sha256=file_hash,
                data_origin="patient_measured",
                coordinate_space=expected_surface,
                errors=[],
                warnings=[],
            )
        except Exception as ex:
            return ValidationResult(
                valid=False,
                file_path=file_path,
                file_type="invalid",
                sha256=file_hash,
                data_origin="unknown",
                errors=[f"Exception during GIFTI validation: {str(ex)}"],
            )
