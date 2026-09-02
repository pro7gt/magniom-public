"""
BIDS Validator (Pure Python & Schema Verification)
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 32
"""

import os
import json
from typing import List, Dict, Tuple, Optional
from ..models.bids import BidsDataset, BidsFile
from ..models.qc import QCWarning


class BidsValidator:
    """Validates BIDS dataset compliance before preprocessing."""

    @classmethod
    def validate_dataset(cls, dataset: BidsDataset) -> Tuple[bool, List[str], List[QCWarning]]:
        """
        Validates BIDS structure, required files, sidecar JSON completeness,
        and modality naming.
        """
        errors: List[str] = []
        warnings: List[QCWarning] = []

        # 1. Check dataset_description.json
        desc_file = next((f for f in dataset.files if f.relative_path == "dataset_description.json"), None)
        if not desc_file:
            errors.append("MISSING_DATASET_DESCRIPTION: dataset_description.json is missing.")
        else:
            if desc_file.sidecar_json:
                bids_ver = desc_file.sidecar_json.get("BIDSVersion")
                if bids_ver != "1.11.1":
                    warnings.append(
                        QCWarning(
                            code="NON_STANDARD_BIDS_VERSION",
                            message=f"BIDSVersion is {bids_ver}; expected 1.11.1.",
                            severity="info",
                            clinical_impact="none",
                        )
                    )

        # 2. Check Anatomical T1w
        t1w_files = [f for f in dataset.files if f.modality == "anat" and f.suffix == "T1w" and f.extension == ".nii.gz"]
        if not t1w_files:
            errors.append(f"MISSING_T1W_NIFTI: No T1w NIfTI found under {dataset.subject_id}/anat/")
        else:
            for t1 in t1w_files:
                json_sidecar = next(
                    (f for f in dataset.files if f.relative_path == t1.relative_path.replace(".nii.gz", ".json")), None
                )
                if not json_sidecar:
                    warnings.append(
                        QCWarning(
                            code="MISSING_T1W_SIDECAR",
                            message=f"Missing JSON sidecar for {t1.relative_path}",
                            severity="warning",
                            clinical_impact="possible",
                        )
                    )

        # 3. Check Functional BOLD
        bold_files = [f for f in dataset.files if f.modality == "func" and f.suffix == "bold" and f.extension == ".nii.gz"]
        for b in bold_files:
            json_sidecar = next(
                (f for f in dataset.files if f.relative_path == b.relative_path.replace(".nii.gz", ".json")), None
            )
            if json_sidecar and json_sidecar.sidecar_json:
                if "TaskName" not in json_sidecar.sidecar_json:
                    errors.append(f"MISSING_TASK_NAME: TaskName missing in sidecar for {b.relative_path}")

        is_valid = len(errors) == 0
        dataset.is_valid = is_valid
        dataset.validation_errors = errors

        return is_valid, errors, warnings
