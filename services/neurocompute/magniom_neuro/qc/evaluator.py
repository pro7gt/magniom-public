"""
Structural QC Gate Evaluator
Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v1.0 Section 53-56
and MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Section 151 & 152.
"""

from typing import List, Tuple
from ..models.qc import StructuralQCMetrics, QCWarning, QCEvaluationResult
from ..config import DEFAULT_CONFIG, PipelineConfig


class StructuralQCGateEvaluator:
    """Evaluates quantitative structural metrics against frozen scientific policy thresholds."""

    def __init__(self, config: PipelineConfig = DEFAULT_CONFIG):
        self.config = config

    def evaluate(self, metrics: StructuralQCMetrics) -> QCEvaluationResult:
        """Evaluates metrics and assigns tiered pass/conditional/fail status."""
        warnings: List[QCWarning] = []
        has_critical = False

        # 1. SNR Checks
        if metrics.snr_t1w < self.config.snr_t1w_min_conditional:
            has_critical = True
            warnings.append(
                QCWarning(
                    code="CRITICAL_SNR_FAILURE",
                    message=f"T1w SNR ({metrics.snr_t1w}) is below minimum threshold ({self.config.snr_t1w_min_conditional}).",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["StructuralReconstruction", "TissueSegmentation"],
                )
            )
        elif metrics.snr_t1w < self.config.snr_t1w_min_pass:
            warnings.append(
                QCWarning(
                    code="MARGINAL_SNR_WARNING",
                    message=f"T1w SNR ({metrics.snr_t1w}) is marginal; optimal is >= {self.config.snr_t1w_min_pass}.",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["SurfaceReconstruction"],
                )
            )

        # 2. CNR Checks
        if metrics.cnr_t1w < self.config.cnr_t1w_min_conditional:
            has_critical = True
            warnings.append(
                QCWarning(
                    code="CRITICAL_CNR_FAILURE",
                    message=f"T1w CNR ({metrics.cnr_t1w}) is below minimum threshold ({self.config.cnr_t1w_min_conditional}).",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["GrayWhiteContrast", "PialSurface"],
                )
            )
        elif metrics.cnr_t1w < self.config.cnr_t1w_min_pass:
            warnings.append(
                QCWarning(
                    code="MARGINAL_CNR_WARNING",
                    message=f"T1w CNR ({metrics.cnr_t1w}) is marginal; optimal is >= {self.config.cnr_t1w_min_pass}.",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["SurfaceReconstruction"],
                )
            )

        # 3. Euler Defect Checks
        max_holes = max(metrics.euler_holes_lh, metrics.euler_holes_rh)
        if max_holes > self.config.euler_holes_max_conditional:
            has_critical = True
            warnings.append(
                QCWarning(
                    code="SEVERE_TOPOLOGICAL_DEFECTS",
                    message=f"Euler topological holes ({max_holes}) exceed threshold ({self.config.euler_holes_max_conditional}).",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["CorticalTopology", "TargetSearchSpace"],
                )
            )
        elif max_holes > self.config.euler_holes_max_pass:
            warnings.append(
                QCWarning(
                    code="EULER_DEFECT_WARNING",
                    message=f"Euler topological holes ({max_holes}) exceed standard recommendation ({self.config.euler_holes_max_pass}).",
                    severity="warning",
                    clinical_impact="target_family_specific",
                    affected_components=["CorticalTopology"],
                )
            )

        # 4. Cortical Thickness Checks
        if (
            metrics.cortical_thickness_mean_mm < self.config.cortical_thickness_mean_lower_mm
            or metrics.cortical_thickness_mean_mm > self.config.cortical_thickness_mean_upper_mm
            or metrics.cortical_thickness_outlier_fraction > 0.05
        ):
            has_critical = True
            warnings.append(
                QCWarning(
                    code="ANOMALOUS_CORTICAL_THICKNESS",
                    message=f"Mean cortical thickness {metrics.cortical_thickness_mean_mm}mm or outlier fraction {metrics.cortical_thickness_outlier_fraction} is biologically non-viable.",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["CorticalThickness", "PialSurface"],
                )
            )

        # 5. MNI Registration Checks
        if metrics.mni_registration_overlap_dice < self.config.mni_dice_min_conditional:
            has_critical = True
            warnings.append(
                QCWarning(
                    code="POOR_MNI_REGISTRATION",
                    message=f"MNI registration Dice overlap ({metrics.mni_registration_overlap_dice}) is below minimum threshold ({self.config.mni_dice_min_conditional}).",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["MNINormalization", "TargetCoordinateMapping"],
                )
            )
        elif metrics.mni_registration_overlap_dice < self.config.mni_dice_min_pass:
            warnings.append(
                QCWarning(
                    code="SUBOPTIMAL_MNI_REGISTRATION",
                    message=f"MNI registration Dice overlap ({metrics.mni_registration_overlap_dice}) is below target ({self.config.mni_dice_min_pass}).",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["MNINormalization"],
                )
            )

        # Determine overall status
        if has_critical:
            overall_status = "fail"
            is_qualified = False
            limitation = "Patient-specific structural connectomics not qualified due to critical QC failure."
        elif len(warnings) > 0:
            overall_status = "conditional"
            is_qualified = True
            limitation = "Structural QC passed conditionally with warnings; target family search spaces remain valid."
        else:
            overall_status = "pass"
            is_qualified = True
            limitation = None

        return QCEvaluationResult(
            overall_status=overall_status,
            metrics=metrics,
            warnings=warnings,
            is_personalisation_qualified=is_qualified,
            limitation_summary=limitation,
        )
