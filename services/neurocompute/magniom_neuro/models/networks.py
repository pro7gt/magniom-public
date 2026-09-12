"""
Triple-Network Systems Layer Models
Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 and Neuroimaging Pipeline Specification v1.1
"""

from dataclasses import dataclass, field
from typing import Dict, List, Optional, Any


@dataclass
class NetworkMeasurementModel:
    network_system_id: str
    network_code: str  # CEN, DMN, SN
    metric_code: str
    raw_value: float
    normalized_value: Optional[float] = None
    reliability_score: Optional[float] = None
    interpretation_status: str = "supportive"


@dataclass
class NetworkInteractionMeasurementModel:
    relationship_id: str
    relationship_code: str  # CEN_DMN, SN_CEN, SN_DMN
    metric_code: str
    raw_value: float
    measurement_run_id: str
    reliability_profile_id: str
    normalized_value: Optional[float] = None
    normative_deviation: Optional[float] = None
    unit: str = "Fisher z"
    interpretation_status: str = "neutral"


@dataclass
class NetworkReliabilityComponentModel:
    reliability_class: str  # high, moderate, low, unreliable, not_assessable
    metric_value: Optional[float] = None
    limiting_factors: List[str] = field(default_factory=list)


@dataclass
class NetworkReliabilityProfileModel:
    id: str
    acquisition_quality: NetworkReliabilityComponentModel
    preprocessing_reliability: NetworkReliabilityComponentModel
    within_network_reliability: NetworkReliabilityComponentModel
    pairwise_reliability: Dict[str, NetworkReliabilityComponentModel]
    overall_status: str  # high, moderate, limited, insufficient
    clinical_qualification: str  # qualified, qualified_with_caution, context_only, research_only


@dataclass
class TripleNetworkProfileResult:
    id: str
    case_id: str
    network_configuration_id: str
    within_measurements: List[NetworkMeasurementModel]
    pairwise_measurements: List[NetworkInteractionMeasurementModel]
    global_segregation: float
    global_integration: float
    reliability: NetworkReliabilityProfileModel
    profile_hash: str
    version: str = "1.0.0"
    artifact_tsv_path: Optional[str] = None
    artifact_tsv_sha256: Optional[str] = None
    sidecar_json_path: Optional[str] = None
