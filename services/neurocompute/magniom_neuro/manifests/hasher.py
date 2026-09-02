"""
SHA-256 Hashing Engine
Computes deterministic SHA-256 digests for files, byte buffers, and canonical JSON dictionaries.
"""

import hashlib
import json
from typing import Any, Dict, List, Union


class Hasher:
    """Deterministic hashing utilities for files, byte buffers, and JSON objects."""

    @staticmethod
    def sha256_bytes(data: bytes) -> str:
        """Computes lowercase hex SHA-256 of byte array."""
        return hashlib.sha256(data).hexdigest()

    @staticmethod
    def sha256_file(file_path: str) -> str:
        """Computes lowercase hex SHA-256 of a file."""
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @staticmethod
    def compute_file_sha256(file_path: str) -> str:
        """Alias for sha256_file."""
        return Hasher.sha256_file(file_path)

    @staticmethod
    def compute_string_sha256(text: str) -> str:
        """Computes lowercase hex SHA-256 of text string."""
        return hashlib.sha256(text.encode("utf-8")).hexdigest()

    @staticmethod
    def sha256_json(obj: Union[Dict[str, Any], List[Any]]) -> str:
        """
        Serializes JSON with deterministic sorted keys and ASCII encoding,
        then calculates the SHA-256 hash.
        """
        canonical_bytes = json.dumps(obj, sort_keys=True, separators=(",", ":"), ensure_ascii=True).encode("utf-8")
        return hashlib.sha256(canonical_bytes).hexdigest()

    @staticmethod
    def hex_to_bytea_escaped(hex_str: str) -> str:
        """Formats hex string for PostgreSQL bytea literal (\\x...)."""
        clean = hex_str.lower().replace("\\x", "")
        return f"\\x{clean}"
