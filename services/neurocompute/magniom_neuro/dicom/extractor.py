"""
Zero-PHI DICOM Metadata Extractor and Pseudonymizer
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 31
"""

import hashlib
import re
from typing import Dict, List, Optional, Any
from ..models.dicom import DicomStudyMetadata, DicomSeriesMetadata


class DicomExtractor:
    """Extracts non-PHI metadata and produces pseudonymous BIDS subject IDs."""

    @staticmethod
    def generate_pseudonymous_subject_id(case_id: str) -> str:
        """
        Generates a deterministic pseudonymous subject ID from case UUID:
        e.g. sub-MGN7F3A92 (Roadmap & Neuro Spec format)
        """
        hash_hex = hashlib.sha256(case_id.encode("utf-8")).hexdigest()
        short_id = hash_hex[:6].upper()
        return f"sub-MGN{short_id}"

    @staticmethod
    def classify_series_type(series_description: str, protocol_name: str = "") -> str:
        """Classifies series as T1w, rest_bold, fieldmap, dwi, or other based on protocol."""
        combined = f"{series_description} {protocol_name}".lower().replace("_", " ").replace("-", " ")

        # T1w structural
        if re.search(r"\b(t1|mprage|t1w|spgr|bravo|vibe)\b", combined):
            return "T1w"

        # Resting state BOLD
        if re.search(r"\b(rest|bold|rsfmri|func|fmri)\b", combined):
            return "rest_bold"

        # Fieldmap / phase diff / spin echo EPI
        if re.search(r"\b(fieldmap|fmap|phasediff|magnitude|gre field mapping|se epi|spin echo)\b", combined):
            return "fieldmap"

        # DWI
        if re.search(r"\b(dti|dwi|diff|diffusion)\b", combined):
            return "dwi"

        return "other"

    @classmethod
    def sanitize_metadata_dict(cls, raw_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Strips all potential PHI fields (PatientName, PatientID, PatientBirthDate,
        PatientSex, PatientAge, InstitutionName, ReferringPhysicianName, etc.)
        """
        phi_keys = {
            "patientname",
            "patientid",
            "patientbirthdate",
            "patientsex",
            "patientage",
            "patientweight",
            "institutionname",
            "institutionaddress",
            "institutionaldepartmentname",
            "referringphysicianname",
            "performingphysicianname",
            "operatorsname",
            "accessionnumber",
            "otherpatientids",
            "patientcomments",
        }

        clean: Dict[str, Any] = {}
        for k, v in raw_dict.items():
            if k.lower() not in phi_keys:
                clean[k] = v

        return clean
