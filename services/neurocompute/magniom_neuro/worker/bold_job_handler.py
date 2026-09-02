"""
BOLD and Denoising Pipeline Job Handler
Executes Stage 03 (fMRIPrep), Stage 04 (Tedana ME-ICA), Stage 05 (CD-1 Denoising & Q2 QC).
Conforms to MAGNIOM-Implementation & Validation Roadmap v1.0 Section 113
"""

import os
import time
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional, Tuple
from ..models.bids import BidsDataset
from ..models.structural import StructuralOutputs
from ..models.bold import MultiEchoRunMetadata, BOLDPreprocessingOutputs
from ..models.tedana import TedanaOutputs
from ..models.denoise import DenoisedTimeSeriesOutput
from ..models.functional_qc import FunctionalQCEvaluationResult
from ..models.qc import QCWarning
from ..models.manifest import StageManifest, ManifestFileEntry
from ..bold.multi_echo import MultiEchoManager
from ..bold.fmriprep_runner import FMRIPrepRunner
from ..denoise.tedana_runner import TedanaRunner
from ..denoise.cd1_engine import CD1DenoisingEngine
from ..qc.functional_metrics import FunctionalQCMetricsCalculator
from ..qc.functional_evaluator import FunctionalQCGateEvaluator
from ..manifests.stage_manifests import StageManifestBuilder


class BOLDProcessingJobHandler:
    """Coordinates multi-echo rs-fMRI minimal preprocessing, tedana ME-ICA, CD-1 denoising, and Q2 QC."""

    def __init__(self, work_dir: Optional[str] = None):
        self.work_dir = work_dir or "/tmp/magniom-work"

    def execute_bold_pipeline(
        self,
        bids_dataset: BidsDataset,
        structural_outputs: StructuralOutputs,
        output_directory: str,
        motion_profile: str = "nominal",
        run_sensitivity_sd1: bool = True,
    ) -> Dict[str, Any]:
        """
        Executes full Sprint 9 BOLD & Denoising pipeline across all discovered runs.
        """
        manifests_dir = os.path.join(output_directory, "manifests")
        os.makedirs(manifests_dir, exist_ok=True)

        stages_list: List[StageManifest] = []
        all_warnings: List[QCWarning] = []
        output_file_entries: List[ManifestFileEntry] = []
        run_results: List[Dict[str, Any]] = []

        # ----------------------------------------------------
        # 1. Discover Multi-Echo Runs
        # ----------------------------------------------------
        me_runs = MultiEchoManager.discover_multi_echo_runs(bids_dataset)
        if not me_runs:
            # Create synthetic default multi-echo run for testing if none discovered in files
            default_echoes = [
                MultiEchoManager.discover_multi_echo_runs(bids_dataset)
            ]

        # For each discovered or simulated run
        for run_meta in me_runs:
            # ------------------------------------------------
            # Stage 03: fMRIPrep Minimal Preprocessing
            # ------------------------------------------------
            s3_start = datetime.now(timezone.utc).isoformat()
            t3 = time.time()
            fmriprep_out = FMRIPrepRunner.preprocess_run(
                bids_dataset=bids_dataset,
                run_meta=run_meta,
                structural_outputs=structural_outputs,
                output_dir=os.path.join(output_directory, "fmriprep"),
                motion_profile=motion_profile,
            )
            s3_end = datetime.now(timezone.utc).isoformat()

            s3_manifest = StageManifestBuilder.build_fmriprep_manifest(
                fmriprep_outputs=fmriprep_out,
                started_at=s3_start,
                completed_at=s3_end,
                duration_seconds=round(time.time() - t3, 2),
                warnings=[],
                output_dir=manifests_dir,
            )
            stages_list.append(s3_manifest)

            output_file_entries.append(
                ManifestFileEntry(
                    path=fmriprep_out.bold_reference_path,
                    sha256=fmriprep_out.bold_reference_sha256,
                    artifact_type="BOLD_REFERENCE",
                )
            )
            output_file_entries.append(
                ManifestFileEntry(
                    path=fmriprep_out.confounds_tsv_path,
                    sha256=fmriprep_out.confounds_tsv_sha256,
                    artifact_type="CONFOUNDS_TSV",
                )
            )

            # ------------------------------------------------
            # Stage 04: Tedana ME-ICA Optimal Combination
            # ------------------------------------------------
            s4_start = datetime.now(timezone.utc).isoformat()
            t4 = time.time()
            tedana_out = TedanaRunner.run_tedana(
                run_meta=run_meta,
                fmriprep_outputs=fmriprep_out,
                output_dir=os.path.join(output_directory, "tedana"),
            )
            s4_end = datetime.now(timezone.utc).isoformat()

            s4_manifest = StageManifestBuilder.build_tedana_manifest(
                tedana_outputs=tedana_out,
                started_at=s4_start,
                completed_at=s4_end,
                duration_seconds=round(time.time() - t4, 2),
                warnings=[],
                output_dir=manifests_dir,
            )
            stages_list.append(s4_manifest)

            output_file_entries.append(
                ManifestFileEntry(
                    path=tedana_out.optimally_combined_bold_path,
                    sha256=tedana_out.optimally_combined_bold_sha256,
                    artifact_type="OPTIMALLY_COMBINED_BOLD",
                )
            )
            output_file_entries.append(
                ManifestFileEntry(
                    path=tedana_out.meica_denoised_bold_path,
                    sha256=tedana_out.meica_denoised_bold_sha256,
                    artifact_type="MEICA_DENOISED_BOLD",
                )
            )

            # ------------------------------------------------
            # Stage 05: CD-1 Clinical Denoising & Q2 Functional QC
            # ------------------------------------------------
            s5_start = datetime.now(timezone.utc).isoformat()
            t5 = time.time()

            cd1_out = CD1DenoisingEngine.denoise_run(
                run_meta=run_meta,
                fmriprep_outputs=fmriprep_out,
                tedana_outputs=tedana_out,
                output_dir=os.path.join(output_directory, "denoise"),
                configuration="CD-1",
            )

            # Optionally run SD-1 Sensitivity Denoising (without GSR)
            sd1_out = None
            if run_sensitivity_sd1:
                sd1_out = CD1DenoisingEngine.denoise_run(
                    run_meta=run_meta,
                    fmriprep_outputs=fmriprep_out,
                    tedana_outputs=tedana_out,
                    output_dir=os.path.join(output_directory, "denoise"),
                    configuration="SD-1",
                )

            # Calculate Q2 Functional QC Metrics & Evaluate Gate
            qc_metrics = FunctionalQCMetricsCalculator.calculate_metrics(
                run_meta=run_meta,
                fmriprep_outputs=fmriprep_out,
                tedana_outputs=tedana_out,
                denoised_output=cd1_out,
            )
            qc_eval = FunctionalQCGateEvaluator.evaluate(qc_metrics)
            all_warnings.extend(qc_eval.warnings)

            s5_end = datetime.now(timezone.utc).isoformat()
            s5_manifest = StageManifestBuilder.build_denoise_manifest(
                denoised_output=cd1_out,
                qc_eval=qc_eval,
                started_at=s5_start,
                completed_at=s5_end,
                duration_seconds=round(time.time() - t5, 2),
                warnings=qc_eval.warnings,
                output_dir=manifests_dir,
            )
            stages_list.append(s5_manifest)

            output_file_entries.append(
                ManifestFileEntry(
                    path=cd1_out.denoised_bold_path,
                    sha256=cd1_out.denoised_bold_sha256,
                    artifact_type="CD1_DENOISED_BOLD",
                )
            )
            output_file_entries.append(
                ManifestFileEntry(
                    path=cd1_out.nuisance_matrix_path,
                    sha256=cd1_out.nuisance_matrix_sha256,
                    artifact_type="CD1_NUISANCE_MATRIX",
                )
            )

            if sd1_out:
                output_file_entries.append(
                    ManifestFileEntry(
                        path=sd1_out.denoised_bold_path,
                        sha256=sd1_out.denoised_bold_sha256,
                        artifact_type="SD1_DENOISED_BOLD",
                    )
                )

            run_results.append({
                "run_index": run_meta.run_index,
                "fmriprep": fmriprep_out,
                "tedana": tedana_out,
                "cd1": cd1_out,
                "sd1": sd1_out,
                "qc_evaluation": qc_eval,
            })

        # Overall Functional QC status across all runs
        statuses = [r["qc_evaluation"].overall_status for r in run_results]
        if "fail" in statuses or len(statuses) == 0:
            overall_functional_status = "fail"
        elif "conditional" in statuses:
            overall_functional_status = "conditional"
        else:
            overall_functional_status = "pass"

        return {
            "overall_status": overall_functional_status,
            "runs": run_results,
            "stages": stages_list,
            "warnings": all_warnings,
            "output_files": output_file_entries,
        }
