# Magniom Environment Strategy v1.0

**Standard Reference:** IEC 62304 / ISO 13485 / IEC 81001-5-1  
**Document Status:** Controlled Engineering Document

---

## 1. Purpose

This document establishes the controlled multi-tier environment strategy for Magniom, governing data segregation, mode gating (`RESEARCH` vs `CLINICAL`), secrets management, and build promotion gates from local development to clinical production.

---

## 2. Environment Matrix

| Tier      | Environment Name | Primary Purpose                                             | Deployment Target                                | Database / Auth                                                 | Data Classification                            | Mode Flag                 |
| --------- | ---------------- | ----------------------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------------- | ---------------------------------------------- | ------------------------- |
| **ENV-1** | `local`          | Developer workstation iteration & unit testing              | Local Docker / Supabase CLI                      | Local Postgres / Synthetic Seed                                 | Public / Synthetic only (Zero PHI)             | `MAGNIOM_MODE=RESEARCH`   |
| **ENV-2** | `ci`             | Automated regression, linting, typecheck, build             | GitHub Actions Runner                            | Ephemeral Postgres / Test Fixtures                              | Synthetic Golden Cases                         | `MAGNIOM_MODE=VALIDATION` |
| **ENV-3** | `development`    | Shared staging for engineering prototypes (M1)              | Cloud staging container / Supabase Branch        | Dedicated Dev Supabase                                          | De-identified / Synthetic                      | `MAGNIOM_MODE=RESEARCH`   |
| **ENV-4** | `validation`     | Formal verification & retrospective clinical trials (M3–M6) | Air-gapped / HIPAA-compliant cluster             | Locked verification DB with immutable snapshots                 | De-identified Clinical Datasets                | `MAGNIOM_MODE=VALIDATION` |
| **ENV-5** | `production`     | Clinical decision support for authorized specialists (M8)   | Multi-zone ISO 27001/TGA-compliant medical cloud | High-availability PostgreSQL with hardened RLS & audit triggers | Protected Health Information (PHI) / Encrypted | `MAGNIOM_MODE=CLINICAL`   |

---

## 3. Operational Mode Gating

The platform explicitly distinguishes between **Research Mode** and **Clinical Mode**:

1. **`RESEARCH` Mode (`MAGNIOM_MODE=RESEARCH`)**:
   - Allows exploration of experimental target candidates (Tier T4, T_EXP).
   - Allows unverified connectome maps to be inspected.
   - Distinct UI warning banner: `"RESEARCH PROTOTYPE — NOT FOR CLINICAL GUIDANCE"`.
   - Treatment export is disabled or strictly watermarked.

2. **`CLINICAL` Mode (`MAGNIOM_MODE=CLINICAL`)**:
   - Strictly gates candidate generation to approved Evidence Tiers (T1, T2, T3).
   - Requires verified clinician identity and active institutional membership.
   - Enforces motion QC thresholds (Mean FD < 0.25 mm, retained duration > 10 min).
   - Requires immutable clinician digital signing before treatment coordinate export.

---

## 4. Secrets & Configuration Governance

- Production secrets (database master keys, signing private keys) are never stored in git repositories or local `.env` files.
- Local environments use deterministic non-secret mock keys documented in `.env.example`.
- CI secrets are managed via GitHub Actions Encrypted Secrets.
