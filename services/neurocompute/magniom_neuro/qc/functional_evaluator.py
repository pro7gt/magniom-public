"""
Functional Quality Control (Q2) Gate Evaluator
Conforms to MAGNIOM-Neuroimaging & Functional Connectomics Pipeline Specification v1.0 Sections 18, 67, 118, 121
"""

from typing import Dict, List, Optional, Tuple, Any
from ..models.qc import QCWarning
from ..models.functional_qc import FunctionalQCMetrics, FunctionalQCEvaluationResult


class FunctionalQCGateEvaluator:
    """
    Evaluates automated Q2 Functional QC Gate status (PASS, CONDITIONAL, FAIL)
    and enforces hard gates against personalisation qualification.
    """

    @classmethod
    def evaluate(
        cls,
        metrics: FunctionalQCMetrics,
        is_session_aggregate: bool = False,
    ) -> FunctionalQCEvaluationResult:
        """
        Evaluates Q2 metrics against frozen scientific criteria.
        Supports both single-run (~15 min) and session-aggregate (~30 min) evaluation.
        """
        warnings: List[QCWarning] = []
        is_fail = False
        is_conditional = False
        reasons: List[str] = []

        # ----------------------------------------------------
        # 1. Retained Time Criteria (Section 18, 66)
        # ----------------------------------------------------
        if is_session_aggregate:
            # Multi-run session criteria (Section 18)
            if metrics.retained_minutes < 12.0:
                is_fail = True
                reasons.append(f"{metrics.retained_minutes:.1f} usable minutes (session absolute minimum is 12.0 min)")
                warnings.append(
                    QCWarning(
                        code="Q2_INSUFFICIENT_RETAINED_TIME",
                        message=f"Final retained resting-state duration ({metrics.retained_minutes:.1f} min) is below session absolute minimum 12.0 min.",
                        severity="critical",
                        clinical_impact="personalisation_invalid",
                        affected_components=["FC_CONNECTOME", "TARGET_LOCALISATION"],
                    )
                )
            elif metrics.retained_minutes < 20.0:
                is_conditional = True
                reasons.append(f"{metrics.retained_minutes:.1f} usable minutes (session recommended is >= 20.0 min)")
                warnings.append(
                    QCWarning(
                        code="Q2_MARGINAL_RETAINED_TIME",
                        message=f"Retained duration ({metrics.retained_minutes:.1f} min) meets absolute threshold but is below recommended clinical standard 20.0 min.",
                        severity="warning",
                        clinical_impact="possible",
                        affected_components=["TARGET_RELIABILITY"],
                    )
                )
        else:
            # Per-run criteria (15-min nominal run)
            if metrics.retained_minutes < 6.0:
                is_fail = True
                reasons.append(f"{metrics.retained_minutes:.1f} usable minutes (run minimum is 6.0 min)")
                warnings.append(
                    QCWarning(
                        code="Q2_INSUFFICIENT_RUN_RETAINED_TIME",
                        message=f"Run retained resting-state duration ({metrics.retained_minutes:.1f} min) is below single-run minimum 6.0 min.",
                        severity="critical",
                        clinical_impact="personalisation_invalid",
                        affected_components=["FC_CONNECTOME"],
                    )
                )
            elif metrics.retained_minutes < 10.0:
                is_conditional = True
                reasons.append(f"{metrics.retained_minutes:.1f} usable minutes in run (nominal is >= 10.0 min)")
                warnings.append(
                    QCWarning(
                        code="Q2_MARGINAL_RUN_RETAINED_TIME",
                        message=f"Run retained duration ({metrics.retained_minutes:.1f} min) is marginal.",
                        severity="warning",
                        clinical_impact="possible",
                        affected_components=["TARGET_RELIABILITY"],
                    )
                )

        # ----------------------------------------------------
        # 2. Motion Censoring Criteria (Section 67)
        # ----------------------------------------------------
        censored_pct = round(metrics.censored_volumes_fraction * 100.0, 1)
        if metrics.censored_volumes_fraction > 0.30:
            is_fail = True
            reasons.append(f"{censored_pct}% motion censoring exceeds maximum 30.0%")
            warnings.append(
                QCWarning(
                    code="Q2_EXCESSIVE_MOTION_CENSORING",
                    message=f"Percentage of censored volumes ({censored_pct}%) exceeds clinical safety threshold 30.0%.",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["FC_CONNECTOME", "TARGET_LOCALISATION"],
                )
            )
        elif metrics.censored_volumes_fraction > 0.20:
            is_conditional = True
            reasons.append(f"{censored_pct}% motion censoring between 20-30%")
            warnings.append(
                QCWarning(
                    code="Q2_MODERATE_MOTION_CENSORING",
                    message=f"Moderate motion censoring ({censored_pct}%).",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["TARGET_RELIABILITY"],
                )
            )

        # ----------------------------------------------------
        # 3. Mean Framewise Displacement (FD) Criteria (Section 67)
        # ----------------------------------------------------
        if metrics.mean_fd_mm > 0.25:
            is_fail = True
            reasons.append(f"Mean FD ({metrics.mean_fd_mm:.2f} mm) exceeds 0.25 mm")
            warnings.append(
                QCWarning(
                    code="Q2_SEVERE_HEAD_MOTION",
                    message=f"Mean Framewise Displacement ({metrics.mean_fd_mm:.2f} mm) exceeds hard tolerance limit 0.25 mm.",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["FC_CONNECTOME"],
                )
            )
        elif metrics.mean_fd_mm > 0.20:
            is_conditional = True
            reasons.append(f"Mean FD ({metrics.mean_fd_mm:.2f} mm) between 0.20-0.25 mm")
            warnings.append(
                QCWarning(
                    code="Q2_MODERATE_HEAD_MOTION",
                    message=f"Elevated Framewise Displacement ({metrics.mean_fd_mm:.2f} mm).",
                    severity="warning",
                    clinical_impact="possible",
                    affected_components=["TARGET_RELIABILITY"],
                )
            )

        # ----------------------------------------------------
        # 4. Coregistration & Signal Quality
        # ----------------------------------------------------
        if metrics.t1w_bold_coregistration_dice < 0.85:
            is_fail = True
            reasons.append(f"Poor BOLD-to-T1w coregistration (Dice {metrics.t1w_bold_coregistration_dice:.3f})")
            warnings.append(
                QCWarning(
                    code="Q2_POOR_COREGISTRATION",
                    message=f"Anatomical alignment Dice overlap ({metrics.t1w_bold_coregistration_dice:.3f}) is below acceptable boundary 0.85.",
                    severity="critical",
                    clinical_impact="personalisation_invalid",
                    affected_components=["SURFACE_PROJECTION", "TARGET_LOCALISATION"],
                )
            )

        # ----------------------------------------------------
        # 5. Overall Status Resolution
        # ----------------------------------------------------
        if is_fail:
            overall_status = "fail"
            is_qualified = False
            limitation = "Patient-specific connectivity not qualified: " + "; ".join(reasons)
        elif is_conditional:
            overall_status = "conditional"
            is_qualified = True
            limitation = "Conditional functional qualification: " + "; ".join(reasons)
        else:
            overall_status = "pass"
            is_qualified = True
            limitation = None

        return FunctionalQCEvaluationResult(
            overall_status=overall_status,
            run_index=metrics.run_index,
            metrics=metrics,
            warnings=warnings,
            is_personalisation_qualified=is_qualified,
            limitation_summary=limitation,
        )
