"""
Queue Consumer for NeuroCompute Service
Polls imaging-ingest and neurocompute queues and executes job workflows.
Conforms to MAGNIOM-Technical Architecture v1.0 Section 32-35
"""

import time
import logging
from typing import Dict, Any, Optional
from .job_handlers import IngestAndStructuralJobHandler

logger = logging.getLogger("magniom_neuro.queue_consumer")


class QueueConsumer:
    """Consumes zero-PHI queue messages from Postgres durable queue."""

    def __init__(self, handler: Optional[IngestAndStructuralJobHandler] = None):
        self.handler = handler or IngestAndStructuralJobHandler()
        self.is_running = False

    def process_envelope(self, envelope: Dict[str, Any]) -> Dict[str, Any]:
        """Processes a single zero-PHI job envelope."""
        schema_ver = envelope.get("schemaVersion")
        if schema_ver != "1.0":
            raise ValueError(f"Unsupported envelope schemaVersion: {schema_ver}")

        job_id = envelope["jobId"]
        org_id = envelope["organisationId"]
        case_id = envelope["caseId"]
        payload = envelope.get("payload", {})

        logger.info(f"Processing job {job_id} for case {case_id}")

        study_id = payload.get("imagingStudyId", "study-001")
        run_id = payload.get("connectomicsRunId", job_id)
        raw_dicom_path = payload.get("rawDicomObjectPath", "/tmp/dicom.zip")
        mode = payload.get("mode", "RESEARCH")

        result = self.handler.execute_job(
            organisation_id=org_id,
            case_id=case_id,
            imaging_study_id=study_id,
            connectomics_run_id=run_id,
            raw_dicom_path=raw_dicom_path,
            mode=mode,
        )

        return result
