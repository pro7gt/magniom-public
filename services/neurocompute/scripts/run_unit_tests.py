"""
MAGNIOM NeuroCompute Fast Unit Test Suite Runner
Runs all unit test modules in tests/ excluding long-running integration simulations.
"""
import os
import sys
import unittest
from glob import glob

def main():
    repo_service_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    if repo_service_dir not in sys.path:
        sys.path.insert(0, repo_service_dir)

    test_pattern = os.path.join(repo_service_dir, "tests", "test_*.py")
    files = sorted(glob(test_pattern))
    unit_files = [f for f in files if "integration" not in f]
    print(f"Executing {len(unit_files)} NeuroCompute Unit Test Modules...")

    suite = unittest.TestSuite()
    loader = unittest.defaultTestLoader
    for f in unit_files:
        basename = os.path.splitext(os.path.basename(f))[0]
        modname = f"tests.{basename}"
        suite.addTests(loader.loadTestsFromName(modname))

    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    sys.exit(0 if result.wasSuccessful() else 1)

if __name__ == "__main__":
    main()
