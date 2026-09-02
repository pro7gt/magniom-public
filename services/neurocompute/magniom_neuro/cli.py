"""
Command Line Interface for Magniom NeuroCompute
"""

import sys
import json
import argparse
from .worker.job_handlers import IngestAndStructuralJobHandler


def main():
    parser = argparse.ArgumentParser(description="Magniom NeuroCompute Pipeline CLI")
    parser.add_argument("--case-id", required=True, help="Clinical case UUID")
    parser.add_argument("--org-id", default="a0000000-0000-0000-0000-000000000001", help="Organisation UUID")
    parser.add_argument("--study-id", default="11111111-1111-1111-1111-111111111111", help="Imaging study UUID")
    parser.add_argument("--run-id", default="run-001", help="Connectomics processing run UUID")
    parser.add_argument("--input-dicom", default="/tmp/dicom.zip", help="Path to raw DICOM archive or directory")
    parser.add_argument("--mode", default="RESEARCH", choices=["RESEARCH", "CLINICAL", "VALIDATION"])
    parser.add_argument("--work-dir", default="/tmp/magniom-work", help="Working directory for intermediate files")

    args = parser.parse_args()

    handler = IngestAndStructuralJobHandler(work_dir=args.work_dir)
    result = handler.execute_job(
        organisation_id=args.org_id,
        case_id=args.case_id,
        imaging_study_id=args.study_id,
        connectomics_run_id=args.run_id,
        raw_dicom_path=args.input_dicom,
        mode=args.mode,
    )

    print(json.dumps(result, indent=2))
    sys.exit(0 if result["status"] == "succeeded" else 1)


if __name__ == "__main__":
    main()
