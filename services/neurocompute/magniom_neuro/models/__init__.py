"""
Magniom NeuroCompute Domain Models
"""

from .dicom import DicomSeriesMetadata, DicomStudyMetadata
from .bids import BidsDataset, BidsFile, BidsDatasetDescription
from .structural import StructuralOutputs, TissueSegmentationResult, SpatialRegistrationResult
from .surface import (
    SurfaceMesh,
    CorticalThicknessMap,
    SurfaceResamplingResult,
    SurfaceFunctionalTimeSeries,
    SurfaceProjectionResult,
)
from .qc import StructuralQCMetrics, QCWarning, QCEvaluationResult
from .manifest import (
    ManifestFileEntry,
    SoftwareManifest,
    TransformManifestEntry,
    StageManifest,
    PipelineManifest,
)

from .bold import (
    EchoMetadata,
    MultiEchoRunMetadata,
    MotionParameters,
    NonSteadyStateSummary,
    BOLDPreprocessingOutputs,
)
from .tedana import (
    ICAComponentMetrics,
    T2StarMapMetrics,
    TedanaOutputs,
)
from .denoise import (
    RetainedTimeSummary,
    MotionCensoringResult,
    DenoisedTimeSeriesOutput,
)
from .functional_qc import (
    FunctionalQCMetrics,
    FunctionalQCEvaluationResult,
)
from .connectome import (
    HcpMmpParcel,
    SubcorticalROI,
    ParcelCoverageQC,
    ParcelTimeSeriesResult,
    RunFunctionalConnectivity,
    CombinedFunctionalConnectivity,
)
from .circuits import (
    SgaccSeedDefinition,
    SpatialCoordinate,
    SurfaceVertexRef,
    CorticalCandidateCluster,
    SgaccConnectivityResult,
    ConvergentCircuitResult,
    SymptomCircuitResult,
    ImagingCandidateRegion,
    CircuitMetric,
    ConnectomePipelineOutput,
)



from .networks import (
    NetworkMeasurementModel,
    NetworkInteractionMeasurementModel,
    NetworkReliabilityComponentModel,
    NetworkReliabilityProfileModel,
    TripleNetworkProfileResult,
)

__all__ = [
    "DicomSeriesMetadata",
    "DicomStudyMetadata",
    "BidsDataset",
    "BidsFile",
    "BidsDatasetDescription",
    "StructuralOutputs",
    "TissueSegmentationResult",
    "SpatialRegistrationResult",
    "SurfaceMesh",
    "CorticalThicknessMap",
    "SurfaceResamplingResult",
    "SurfaceFunctionalTimeSeries",
    "SurfaceProjectionResult",
    "StructuralQCMetrics",
    "QCWarning",
    "QCEvaluationResult",
    "ManifestFileEntry",
    "SoftwareManifest",
    "TransformManifestEntry",
    "StageManifest",
    "PipelineManifest",
    "EchoMetadata",
    "MultiEchoRunMetadata",
    "MotionParameters",
    "NonSteadyStateSummary",
    "BOLDPreprocessingOutputs",
    "ICAComponentMetrics",
    "T2StarMapMetrics",
    "TedanaOutputs",
    "RetainedTimeSummary",
    "MotionCensoringResult",
    "DenoisedTimeSeriesOutput",
    "FunctionalQCMetrics",
    "FunctionalQCEvaluationResult",
    "HcpMmpParcel",
    "SubcorticalROI",
    "ParcelCoverageQC",
    "ParcelTimeSeriesResult",
    "RunFunctionalConnectivity",
    "CombinedFunctionalConnectivity",
    "SgaccSeedDefinition",
    "SpatialCoordinate",
    "SurfaceVertexRef",
    "CorticalCandidateCluster",
    "SgaccConnectivityResult",
    "ConvergentCircuitResult",
    "SymptomCircuitResult",
    "ImagingCandidateRegion",
    "CircuitMetric",
    "ConnectomePipelineOutput",
    "ReliabilityMeasure",
    "SpatialRegion",
    "SplitHalfResult",
    "CrossRunResult",
    "PipelineSensitivityResult",
    "TargetReliabilityProfile",
    "NetworkMeasurementModel",
    "NetworkInteractionMeasurementModel",
    "NetworkReliabilityComponentModel",
    "NetworkReliabilityProfileModel",
    "TripleNetworkProfileResult",
]



