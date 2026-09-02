"""
Main Service Entrypoint for Magniom NeuroCompute Worker Container
"""

import sys
import logging
from .worker.queue_consumer import QueueConsumer

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("magniom_neuro")


def main():
    logger.info("Starting Magniom NeuroCompute Service (Sprint 8: Ingest + Structural)...")
    consumer = QueueConsumer()
    logger.info("Worker ready and listening on queues.")


if __name__ == "__main__":
    main()
