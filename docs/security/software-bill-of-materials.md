# Magniom Software Bill of Materials (SBOM) & Dependency Policy v1.0

**Standard Reference:** FDA SaMD Cybersecurity Guidance / Executive Order 14028 / CycloneDX v1.5 / SPDX v2.3  
**Document Status:** Controlled Engineering Security Baseline

---

## 1. Purpose & Regulatory Scope

As a Class IIb / Class B Software as a Medical Device (SaMD), Magniom maintains a continuous, machine-readable **Software Bill of Materials (SBOM)** covering all software subsystems:

1. **Clinician Web Application & Shared TypeScript Packages** (`apps/web`, `packages/*`)
2. **Workflow & Background Compute Orchestrator** (`services/workflow-worker`)
3. **NeuroCompute & Functional Connectomics Engine** (`services/neurocompute`)
4. **Container Base Images & Native Scientific Toolchains** (FreeSurfer, FSL, Connectome Workbench).

---

## 2. Dependency Locking Policy (Section 133)

In accordance with Section 133 of `MAGNIOM-Technical Architecture v1.0`:

- **Production builds MUST use exact pinned versions.** Wildcards (`*`), unconstrained ranges (`>=`), and floating tags (`latest`) are strictly forbidden in production lockfiles.
- **Reproducible container images:** NeuroCompute Docker images MUST use immutable base image SHA-256 digests (`FROM python:3.11-slim@sha256:...`).
- **Offline validation determinism:** Software dependencies cannot dynamically fetch assets from the internet during algorithm execution.

---

## 3. Automated SBOM Generation Pipeline

The SBOM generation pipeline produces standardized manifests during CI/CD builds:

- **Specification:** CycloneDX v1.5 JSON
- **Generator Script:** `scripts/security/generate-sbom.ts`
- **Verification Script:** `scripts/security/verify-sbom-and-cve.ts`
- **Output Artifact:** `docs/security/sbom/magniom-cyclonedx-sbom.json`

### Tracked Component Summary

| Component Domain          | Key Packages / Toolchains                          | Pinned Baseline | License            |
| ------------------------- | -------------------------------------------------- | --------------- | ------------------ |
| **Web & Domain Core**     | `typescript`, `vitest`, `turbo`, `zod`, `react`    | Exact semver    | MIT / Apache-2.0   |
| **Neuroimaging Compute**  | `numpy`, `scipy`, `nibabel`, `nilearn`, `pydantic` | Exact semver    | BSD-3-Clause / MIT |
| **Infrastructure / Auth** | `supabase-js`, `postgrest`, `crypto`               | Exact semver    | MIT / PostgreSQL   |

---

## 4. Vulnerability Disclosure & Patch Management Policy (Section 130)

1. **Security Advisory Monitoring:** Automated scanning of npm, PyPI, and GitHub Advisory Database on every build.
2. **Remediation Timelines:**
   - **Critical Vulnerabilities (CVSS >= 9.0):** Patch tested and deployed to validation environment within 24 hours.
   - **High Vulnerabilities (CVSS 7.0–8.9):** Patch deployed within 48 hours.
   - **Medium / Low:** Scheduled in next maintenance release.
3. **Validation Environment Gate:** No security patch enters production without running Golden Cases (G01–G05) and coordinate round-trip regression tests in the Validation Environment (`env=validation`).
