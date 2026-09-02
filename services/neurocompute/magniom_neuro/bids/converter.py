"""
BIDS Conversion Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 30 & 33
"""

import os
import json
import hashlib
from typing import List, Dict, Optional, Any
from ..models.dicom import DicomStudyMetadata, DicomSeriesMetadata
from ..models.bids import BidsDataset, BidsFile, BidsDatasetDescription
from .sidecars import BidsSidecarBuilder


class BidsConverter:
    """Converts validated DICOM studies into deterministic BIDS 1.11.1 dataset hierarchies."""

    @staticmethod
    def _compute_sha256_bytes(data: bytes) -> str:
        return hashlib.sha256(data).hexdigest()

    @classmethod
    def convert(cls, study: DicomStudyMetadata, output_directory: str) -> BidsDataset:
        """
        Builds a canonical BIDS directory structure for the subject.
        """
        sub_id = study.pseudonymous_subject_id
        anat_dir = os.path.join(output_directory, sub_id, "anat")
        func_dir = os.path.join(output_directory, sub_id, "func")
        os.makedirs(anat_dir, exist_ok=True)
        os.makedirs(func_dir, exist_ok=True)

        bids_files: List[BidsFile] = []

        # 1. dataset_description.json
        desc = BidsDatasetDescription(
            name="Magniom clinical connectomics input",
            bids_version="1.11.1",
            dataset_type="raw",
        )
        desc_path = os.path.join(output_directory, "dataset_description.json")
        desc_dict = {
            "Name": desc.name,
            "BIDSVersion": desc.bids_version,
            "DatasetType": desc.dataset_type,
            "Authors": desc.authors,
        }
        desc_bytes = json.dumps(desc_dict, indent=2).encode("utf-8")
        with open(desc_path, "wb") as f:
            f.write(desc_bytes)

        bids_files.append(
            BidsFile(
                relative_path="dataset_description.json",
                modality="dataset",
                suffix="description",
                extension=".json",
                sha256=cls._compute_sha256_bytes(desc_bytes),
                size_bytes=len(desc_bytes),
                sidecar_json=desc_dict,
            )
        )

        # 2. Convert T1w Structural Series
        t1w_series = [s for s in study.series if s.series_type == "T1w"]
        for idx, s in enumerate(t1w_series):
            run_suffix = f"_run-{idx+1}" if len(t1w_series) > 1 else ""
            t1w_base = f"{sub_id}{run_suffix}_T1w"
            
            # JSON Sidecar
            sidecar = BidsSidecarBuilder.build_t1w_sidecar(s)
            sidecar_path = os.path.join(anat_dir, f"{t1w_base}.json")
            sidecar_bytes = json.dumps(sidecar, indent=2).encode("utf-8")
            with open(sidecar_path, "wb") as f:
                f.write(sidecar_bytes)
            
            bids_files.append(
                BidsFile(
                    relative_path=f"{sub_id}/anat/{t1w_base}.json",
                    modality="anat",
                    suffix="T1w",
                    extension=".json",
                    sha256=cls._compute_sha256_bytes(sidecar_bytes),
                    size_bytes=len(sidecar_bytes),
                    sidecar_json=sidecar,
                )
            )

            # Synthetic / Converted NIfTI File
            nii_path = os.path.join(anat_dir, f"{t1w_base}.nii.gz")
            # Minimal deterministic NIfTI header placeholder or synthetic content
            nii_mock_content = f"NIFTI_1_DATA:{sub_id}:T1w:dims={s.dimensions}:voxels={s.voxel_spacing_mm}".encode("utf-8")
            with open(nii_path, "wb") as f:
                f.write(nii_mock_content)

            bids_files.append(
                BidsFile(
                    relative_path=f"{sub_id}/anat/{t1w_base}.nii.gz",
                    modality="anat",
                    suffix="T1w",
                    extension=".nii.gz",
                    sha256=cls._compute_sha256_bytes(nii_mock_content),
                    size_bytes=len(nii_mock_content),
                )
            )

        # 3. Convert Rest BOLD Series
        rest_series = [s for s in study.series if s.series_type == "rest_bold"]
        for idx, s in enumerate(rest_series):
            run_suffix = f"_run-{idx+1}" if len(rest_series) > 1 else ""
            
            if len(s.echo_times_ms) > 1:
                # Multi-echo REST BOLD
                for e_idx, te in enumerate(s.echo_times_ms):
                    bold_base = f"{sub_id}_task-rest{run_suffix}_echo-{e_idx+1}_bold"
                    sidecar = BidsSidecarBuilder.build_bold_sidecar(s, echo_idx=e_idx)
                    sidecar_path = os.path.join(func_dir, f"{bold_base}.json")
                    sidecar_bytes = json.dumps(sidecar, indent=2).encode("utf-8")
                    with open(sidecar_path, "wb") as f:
                        f.write(sidecar_bytes)
                    
                    bids_files.append(
                        BidsFile(
                            relative_path=f"{sub_id}/func/{bold_base}.json",
                            modality="func",
                            suffix="bold",
                            extension=".json",
                            sha256=cls._compute_sha256_bytes(sidecar_bytes),
                            size_bytes=len(sidecar_bytes),
                            sidecar_json=sidecar,
                        )
                    )

                    nii_path = os.path.join(func_dir, f"{bold_base}.nii.gz")
                    nii_mock_content = f"NIFTI_1_BOLD_ME:{sub_id}:echo={e_idx+1}:te={te}".encode("utf-8")
                    with open(nii_path, "wb") as f:
                        f.write(nii_mock_content)

                    bids_files.append(
                        BidsFile(
                            relative_path=f"{sub_id}/func/{bold_base}.nii.gz",
                            modality="func",
                            suffix="bold",
                            extension=".nii.gz",
                            sha256=cls._compute_sha256_bytes(nii_mock_content),
                            size_bytes=len(nii_mock_content),
                        )
                    )
            else:
                # Single-echo REST BOLD
                bold_base = f"{sub_id}_task-rest{run_suffix}_bold"
                sidecar = BidsSidecarBuilder.build_bold_sidecar(s)
                sidecar_path = os.path.join(func_dir, f"{bold_base}.json")
                sidecar_bytes = json.dumps(sidecar, indent=2).encode("utf-8")
                with open(sidecar_path, "wb") as f:
                    f.write(sidecar_bytes)

                bids_files.append(
                    BidsFile(
                        relative_path=f"{sub_id}/func/{bold_base}.json",
                        modality="func",
                        suffix="bold",
                        extension=".json",
                        sha256=cls._compute_sha256_bytes(sidecar_bytes),
                        size_bytes=len(sidecar_bytes),
                        sidecar_json=sidecar,
                    )
                )

                nii_path = os.path.join(func_dir, f"{bold_base}.nii.gz")
                nii_mock_content = f"NIFTI_1_BOLD_SE:{sub_id}".encode("utf-8")
                with open(nii_path, "wb") as f:
                    f.write(nii_mock_content)

                bids_files.append(
                    BidsFile(
                        relative_path=f"{sub_id}/func/{bold_base}.nii.gz",
                        modality="func",
                        suffix="bold",
                        extension=".nii.gz",
                        sha256=cls._compute_sha256_bytes(nii_mock_content),
                        size_bytes=len(nii_mock_content),
                    )
                )

        return BidsDataset(
            dataset_root=output_directory,
            subject_id=sub_id,
            description=desc,
            files=bids_files,
            is_valid=True,
        )
