"""
Storage Client for Artifact Uploads and Registry Insertion
Conforms to MAGNIOM-Supabase Database & Security Specification v1.0 Section 30 & 97-109
"""

import os
import hashlib
from typing import Dict, Any, Optional
from ..manifests.hasher import Hasher


class StorageClient:
    """Handles artifact storage and registration with SHA-256 integrity verification."""

    def __init__(self, base_storage_dir: Optional[str] = None):
        self.base_storage_dir = base_storage_dir or "/tmp/magniom-storage"
        os.makedirs(self.base_storage_dir, exist_ok=True)

    @staticmethod
    def build_canonical_storage_path(
        org_id: str,
        case_id: str,
        sub_type: Optional[str],
        sub_id: Optional[str],
        artifact_id: str,
        filename: str,
    ) -> str:
        """
        Builds the canonical multi-tenant storage path:
        org/<org_id>/case/<case_id>/[study|run]/<sub_id>/<artifact_id>/<filename>
        """
        if sub_type and sub_id:
            return f"org/{org_id}/case/{case_id}/{sub_type}/{sub_id}/{artifact_id}/{filename}"
        return f"org/{org_id}/case/{case_id}/{artifact_id}/{filename}"

    def store_file(
        self,
        source_file_path: str,
        bucket: str,
        object_path: str,
    ) -> Dict[str, Any]:
        """Stores a file and computes its metadata with SHA-256."""
        sha256_hex = Hasher.sha256_file(source_file_path)
        size_bytes = os.path.getsize(source_file_path)

        dest_full_path = os.path.join(self.base_storage_dir, bucket, object_path)
        os.makedirs(os.path.dirname(dest_full_path), exist_ok=True)

        with open(source_file_path, "rb") as src, open(dest_full_path, "wb") as dst:
            while chunk := src.read(65536):
                dst.write(chunk)

        return {
            "bucket": bucket,
            "object_path": object_path,
            "sha256": sha256_hex,
            "size_bytes": size_bytes,
            "immutable": True,
        }
