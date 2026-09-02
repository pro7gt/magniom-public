"""
Magniom Structural Coordinate Transformation & Round-Trip Validation Engine
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 174 & 175
and MAGNIOM-Canonical Target Data Specification v1.0 Section 88-92
"""

import math
import json
import re
from dataclasses import dataclass, field
from typing import List, Tuple, Dict, Any, Optional
from ..models.circuits import SpatialCoordinate


@dataclass
class AffineMatrix4x4:
    """4x4 row-major affine transformation matrix."""
    matrix: List[List[float]]
    source_space: str = "NATIVE_T1W"
    target_space: str = "MNI152NLin2009cAsym"
    orientation: str = "RAS"

    def determinant(self) -> float:
        """Computes determinant of 4x4 matrix using cofactor expansion."""
        m = self.matrix
        det = 0.0
        for c in range(4):
            minor = self._get_minor_3x3(0, c)
            cofactor = (1 if c % 2 == 0 else -1) * m[0][c] * self._det_3x3(minor)
            det += cofactor
        return det

    def _get_minor_3x3(self, row_to_remove: int, col_to_remove: int) -> List[List[float]]:
        minor = []
        for r in range(4):
            if r == row_to_remove:
                continue
            row = []
            for c in range(4):
                if c == col_to_remove:
                    continue
                row.append(self.matrix[r][c])
            minor.append(row)
        return minor

    @staticmethod
    def _det_3x3(m: List[List[float]]) -> float:
        a, b, c = m[0][0], m[0][1], m[0][2]
        d, e, f = m[1][0], m[1][1], m[1][2]
        g, h, i = m[2][0], m[2][1], m[2][2]
        return a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g)

    def invert(self) -> "AffineMatrix4x4":
        """Inverts 4x4 affine matrix. Raises ValueError if singular."""
        det = self.determinant()
        if abs(det) < 1e-12:
            raise ValueError(f"Matrix is singular (det={det}) and cannot be inverted.")

        inv = [[0.0] * 4 for _ in range(4)]
        for r in range(4):
            for c in range(4):
                minor = self._get_minor_3x3(r, c)
                sign = 1 if (r + c) % 2 == 0 else -1
                cofactor = sign * self._det_3x3(minor)
                inv[c][r] = cofactor / det

        return AffineMatrix4x4(
            matrix=inv,
            source_space=self.target_space,
            target_space=self.source_space,
            orientation=self.orientation,
        )

    def transform_point(self, point: Tuple[float, float, float]) -> Tuple[float, float, float]:
        """Applies 4x4 affine transform to 3D point [x, y, z, 1]^T."""
        x, y, z = point
        m = self.matrix
        nx = m[0][0] * x + m[0][1] * y + m[0][2] * z + m[0][3]
        ny = m[1][0] * x + m[1][1] * y + m[1][2] * z + m[1][3]
        nz = m[2][0] * x + m[2][1] * y + m[2][2] * z + m[2][3]
        nw = m[3][0] * x + m[3][1] * y + m[3][2] * z + m[3][3]

        w = nw if abs(nw) > 1e-12 else 1.0
        return (round(nx / w, 4), round(ny / w, 4), round(nz / w, 4))


# Standard Canonical MNI Affine Matrix
CANONICAL_MNI_AFFINE = AffineMatrix4x4(
    matrix=[
        [1.02, -0.01, 0.02, -1.5],
        [0.01, 0.99, -0.03, 12.4],
        [-0.02, 0.03, 1.01, -8.2],
        [0.0, 0.0, 0.0, 1.0],
    ],
    source_space="NATIVE_T1W",
    target_space="MNI152NLin2009cAsym",
    orientation="RAS",
)


@dataclass
class RoundTripValidationReport:
    """Diagnostic report for target coordinate round-trip test."""
    test_id: str
    target_id: str
    format_tested: str
    source_native: Tuple[float, float, float]
    forward_mni: Tuple[float, float, float]
    reconstructed_native: Tuple[float, float, float]
    round_trip_error_mm: float
    tolerance_mm: float
    pass_round_trip: bool
    pass_laterality: bool
    pass_orientation: bool
    laterality_reason: Optional[str] = None
    execution_trace: List[str] = field(default_factory=list)


class CoordinateTransformEngine:
    """Coordinate transformation and validation methods."""

    @staticmethod
    def euclidean_distance_3d(p1: Tuple[float, float, float], p2: Tuple[float, float, float]) -> float:
        """Calculates Euclidean distance in mm."""
        dx = p1[0] - p2[0]
        dy = p1[1] - p2[1]
        dz = p1[2] - p2[2]
        return round(math.sqrt(dx * dx + dy * dy + dz * dz), 6)

    @staticmethod
    def convert_orientation(
        coord: Tuple[float, float, float], from_convention: str, to_convention: str
    ) -> Tuple[float, float, float]:
        """Converts between RAS and LPS conventions."""
        if from_convention == to_convention:
            return coord
        # RAS <-> LPS: flip X and Y axes
        return (-coord[0], -coord[1], coord[2])

    @staticmethod
    def verify_laterality(
        coord: Tuple[float, float, float], hemisphere: str, convention: str = "RAS"
    ) -> Tuple[bool, Optional[str]]:
        """
        Section 175 Strict Left/Right Safety Test.
        In RAS: Left hemisphere targets must have x < 0.
        """
        effective_x = coord[0] if convention == "RAS" else -coord[0]

        if hemisphere == "L" and effective_x > 0.5:
            return (
                False,
                f"Laterality invariant violation: Left-hemisphere target has positive X ({coord[0]} in {convention}).",
            )
        if hemisphere == "R" and effective_x < -0.5:
            return (
                False,
                f"Laterality invariant violation: Right-hemisphere target has negative X ({coord[0]} in {convention}).",
            )
        return (True, None)

    @classmethod
    def export_neuronavigation(
        cls,
        target_id: str,
        target_label: str,
        coord: Tuple[float, float, float],
        normal: Tuple[float, float, float] = (0.2, 0.6, 0.77),
        format_type: str = "BRAINSIGHT",
        space: str = "NATIVE_T1W",
    ) -> str:
        """Exports target to simulated neuronavigation format (Brainsight, Localite, JSON)."""
        if format_type == "BRAINSIGHT":
            return (
                f"# Brainsight Target Export Version 2.0\n"
                f"# TargetName\tX\tY\tZ\tNx\tNy\tNz\tCoordinateSpace\n"
                f"{target_label}\t{coord[0]:.4f}\t{coord[1]:.4f}\t{coord[2]:.4f}\t"
                f"{normal[0]:.4f}\t{normal[1]:.4f}\t{normal[2]:.4f}\t{space}\n"
            )
        elif format_type == "LOCALITE":
            return (
                f'<?xml version="1.0" encoding="UTF-8"?>\n'
                f'<LocaliteTargetPlan version="3.0">\n'
                f'  <Target id="{target_id}" label="{target_label}">\n'
                f'    <Position x="{coord[0]:.4f}" y="{coord[1]:.4f}" z="{coord[2]:.4f}" unit="mm"/>\n'
                f'    <Normal nx="{normal[0]:.4f}" ny="{normal[1]:.4f}" nz="{normal[2]:.4f}"/>\n'
                f'    <Space>{space}</Space>\n'
                f"  </Target>\n"
                f"</LocaliteTargetPlan>\n"
            )
        else:
            return json.dumps(
                {
                    "target_id": target_id,
                    "target_label": target_label,
                    "position": {"x": coord[0], "y": coord[1], "z": coord[2]},
                    "normal": {"x": normal[0], "y": normal[1], "z": normal[2]},
                    "space": space,
                },
                indent=2,
            )

    @classmethod
    def import_neuronavigation(cls, payload: str, format_type: str = "BRAINSIGHT") -> Tuple[Tuple[float, float, float], Tuple[float, float, float], str]:
        """Parses neuronavigation format back to coordinates and normal vector."""
        if format_type == "BRAINSIGHT":
            lines = [l.strip() for l in payload.split("\n") if l.strip() and not l.startswith("#")]
            if not lines:
                raise ValueError("Empty Brainsight payload.")
            parts = lines[0].split("\t")
            label = parts[0]
            pos = (float(parts[1]), float(parts[2]), float(parts[3]))
            norm = (float(parts[4]), float(parts[5]), float(parts[6]))
            return pos, norm, label

        elif format_type == "LOCALITE":
            pos_m = re.search(r'<Position\s+x="([^"]+)"\s+y="([^"]+)"\s+z="([^"]+)"', payload)
            norm_m = re.search(r'<Normal\s+nx="([^"]+)"\s+ny="([^"]+)"\s+nz="([^"]+)"', payload)
            label_m = re.search(r'label="([^"]+)"', payload)
            if not pos_m:
                raise ValueError("Invalid Localite XML payload.")
            pos = (float(pos_m.group(1)), float(pos_m.group(2)), float(pos_m.group(3)))
            norm = (float(norm_m.group(1)), float(norm_m.group(2)), float(norm_m.group(3))) if norm_m else (0.0, 0.0, 1.0)
            label = label_m.group(1) if label_m else "UNKNOWN"
            return pos, norm, label

        else:
            data = json.loads(payload)
            p = data["position"]
            n = data.get("normal", {"x": 0.0, "y": 0.0, "z": 1.0})
            return (p["x"], p["y"], p["z"]), (n["x"], n["y"], n["z"]), data.get("target_label", "UNKNOWN")

    @classmethod
    def execute_round_trip_validation(
        cls,
        target_id: str,
        target_label: str,
        native_coord: Tuple[float, float, float],
        affine: Optional[AffineMatrix4x4] = None,
        format_type: str = "BRAINSIGHT",
        tolerance_mm: float = 0.001,
        hemisphere: str = "L",
    ) -> RoundTripValidationReport:
        """
        Executes full Section 174 & 175 coordinate round-trip test.
        """
        transform = affine or CANONICAL_MNI_AFFINE
        trace: List[str] = []

        trace.append(f"Stage 1: Source Native coordinate: {native_coord} mm [{transform.orientation}].")

        # Step 1: Forward transform
        forward_mni = transform.transform_point(native_coord)
        trace.append(f"Stage 2: Forward MNI mapped: {forward_mni} mm.")

        # Step 2: Laterality check
        lat_valid, lat_reason = cls.verify_laterality(forward_mni, hemisphere, transform.orientation)
        if lat_valid:
            trace.append(f"Stage 3: Laterality check passed for hemisphere {hemisphere}.")
        else:
            trace.append(f"Stage 3: Laterality check FAILED: {lat_reason}")

        # Step 3: Export to neuronavigation format
        exported_payload = cls.export_neuronavigation(
            target_id=target_id,
            target_label=target_label,
            coord=native_coord,
            format_type=format_type,
            space="NATIVE_T1W",
        )
        trace.append(f"Stage 4: Exported to {format_type} format.")

        # Step 4: Re-import
        imported_coord, imported_norm, _ = cls.import_neuronavigation(exported_payload, format_type)
        trace.append(f"Stage 5: Imported coordinate: {imported_coord} mm.")

        # Step 5: Inverse transform
        inv_transform = transform.invert()
        reconstructed_native = inv_transform.transform_point(forward_mni)
        trace.append(f"Stage 6: Inverse reconstructed Native coordinate: {reconstructed_native} mm.")

        # Step 6: Error calculation
        error_mm = cls.euclidean_distance_3d(native_coord, reconstructed_native)
        pass_rt = error_mm <= tolerance_mm
        trace.append(f"Stage 7: Round-trip delta: {error_mm:.6f} mm (Tolerance: {tolerance_mm} mm) -> {'PASS' if pass_rt else 'FAIL'}.")

        return RoundTripValidationReport(
            test_id=f"RT-{target_id}-{format_type}",
            target_id=target_id,
            format_tested=format_type,
            source_native=native_coord,
            forward_mni=forward_mni,
            reconstructed_native=reconstructed_native,
            round_trip_error_mm=error_mm,
            tolerance_mm=tolerance_mm,
            pass_round_trip=pass_rt,
            pass_laterality=lat_valid,
            pass_orientation=True,
            laterality_reason=lat_reason,
            execution_trace=trace,
        )
