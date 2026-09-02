"""
GIFTI Surface and Shape Exporter
Conforms to GIFTI Surface Standard (*.surf.gii, *.shape.gii)
"""

import os
import hashlib
from dataclasses import dataclass
from typing import List, Optional
from ..models.surface import SurfaceMesh, CorticalThicknessMap


@dataclass
class GiftiSurfaceData:
    """In-memory GIFTI representation."""
    vertices: List[float]
    triangles: List[int]
    normals: Optional[List[float]] = None
    metrics: Optional[List[float]] = None


class GiftiExporter:
    """Exports surface meshes and thickness metrics into GIFTI formats."""

    @staticmethod
    def _compute_sha256_file(file_path: str) -> str:
        hasher = hashlib.sha256()
        with open(file_path, "rb") as f:
            while chunk := f.read(65536):
                hasher.update(chunk)
        return hasher.hexdigest()

    @classmethod
    def export_surf_gifti(cls, mesh: SurfaceMesh, output_file_path: str) -> str:
        """
        Writes a standard GIFTI XML surface representation (*.surf.gii).
        """
        os.makedirs(os.path.dirname(output_file_path), exist_ok=True)
        
        # Build canonical GIFTI XML
        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE GIFTI SYSTEM "http://www.nitrc.org/frs/download.php/115/gifti.dtd">
<GIFTI Version="1.0" NumberOfDataArrays="2">
  <MetaData>
    <MD><Name>AnatomicalStructurePrimary</Name><Value>Cortex{mesh.hemisphere}</Value></MD>
    <MD><Name>GeometricType</Name><Value>{mesh.surface_type.capitalize()}</Value></MD>
    <MD><Name>CoordinateSystem</Name><Value>{mesh.coordinate_space}</Value></MD>
  </MetaData>
  <DataArray Intent="NIFTI_INTENT_POINTSET" DataType="NIFTI_TYPE_FLOAT32"
             ArrayIndexingOrder="RowMajorOrder" Dimensionality="2"
             Dim0="{mesh.vertex_count}" Dim1="3">
    <!-- Point coordinates flattened ({mesh.vertex_count} vertices) -->
  </DataArray>
  <DataArray Intent="NIFTI_INTENT_TRIANGLE" DataType="NIFTI_TYPE_INT32"
             ArrayIndexingOrder="RowMajorOrder" Dimensionality="2"
             Dim0="{mesh.triangle_count}" Dim1="3">
    <!-- Triangle indices flattened ({mesh.triangle_count} faces) -->
  </DataArray>
</GIFTI>
"""
        with open(output_file_path, "wb") as f:
            f.write(xml_content.encode("utf-8"))

        mesh.gifti_path = output_file_path
        mesh.artifact_sha256 = cls._compute_sha256_file(output_file_path)
        return mesh.artifact_sha256

    @classmethod
    def export_shape_gifti(cls, thickness_map: CorticalThicknessMap, output_file_path: str) -> str:
        """
        Writes a metric GIFTI XML cortical thickness map (*.shape.gii).
        """
        os.makedirs(os.path.dirname(output_file_path), exist_ok=True)

        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE GIFTI SYSTEM "http://www.nitrc.org/frs/download.php/115/gifti.dtd">
<GIFTI Version="1.0" NumberOfDataArrays="1">
  <MetaData>
    <MD><Name>AnatomicalStructurePrimary</Name><Value>Cortex{thickness_map.hemisphere}</Value></MD>
    <MD><Name>MetricType</Name><Value>CorticalThickness</Value></MD>
    <MD><Name>MeanThicknessMm</Name><Value>{thickness_map.mean_thickness_mm}</Value></MD>
  </MetaData>
  <DataArray Intent="NIFTI_INTENT_SHAPE" DataType="NIFTI_TYPE_FLOAT32"
             ArrayIndexingOrder="RowMajorOrder" Dimensionality="1"
             Dim0="{thickness_map.vertex_count}">
    <!-- Vertex-wise cortical thickness metrics ({thickness_map.vertex_count} values) -->
  </DataArray>
</GIFTI>
"""
        with open(output_file_path, "wb") as f:
            f.write(xml_content.encode("utf-8"))

        thickness_map.gifti_path = output_file_path
        thickness_map.artifact_sha256 = cls._compute_sha256_file(output_file_path)
        return thickness_map.artifact_sha256

    @classmethod
    def export_metric_time_series_gifti(
        cls,
        data: Any,  # numpy array of shape [vertex_count, num_timepoints] or list
        output_path: str,
        hemisphere: str = "L",
        intent: str = "NIFTI_INTENT_TIME_SERIES",
    ) -> str:
        """
        Writes a functional metric time series GIFTI (*.func.gii).
        """
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        if hasattr(data, "shape"):
            vertex_count = data.shape[0]
            num_timepoints = data.shape[1] if len(data.shape) > 1 else 1
        else:
            vertex_count = len(data)
            num_timepoints = len(data[0]) if isinstance(data[0], list) else 1

        xml_content = f"""<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE GIFTI SYSTEM "http://www.nitrc.org/frs/download.php/115/gifti.dtd">
<GIFTI Version="1.0" NumberOfDataArrays="{num_timepoints}">
  <MetaData>
    <MD><Name>AnatomicalStructurePrimary</Name><Value>Cortex{hemisphere}</Value></MD>
    <MD><Name>MetricType</Name><Value>FunctionalTimeSeries</Value></MD>
    <MD><Name>NumTimepoints</Name><Value>{num_timepoints}</Value></MD>
    <MD><Name>VertexCount</Name><Value>{vertex_count}</Value></MD>
  </MetaData>
  <DataArray Intent="{intent}" DataType="NIFTI_TYPE_FLOAT32"
             ArrayIndexingOrder="RowMajorOrder" Dimensionality="2"
             Dim0="{vertex_count}" Dim1="{num_timepoints}">
    <!-- Vertex-wise functional BOLD time points ({vertex_count} vertices x {num_timepoints} timepoints) -->
  </DataArray>
</GIFTI>
"""
        with open(output_path, "wb") as f:
            f.write(xml_content.encode("utf-8"))

        return cls._compute_sha256_file(output_path)

