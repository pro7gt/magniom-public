# MAGNIOM v2 Controlled Design Baseline (Phase 0)

**Document Reference:** MAG-DC-v2-BASE-001  
**Standard Reference:** IEC 62304:2006+AMD1:2015 §5.2 / ISO 13485:2016 §7.3.3 / ISO 14971:2019 / TGA SaMD Guidelines  
**Status:** Controlled Canonical Design Baseline (Frozen)  
**Sealing Date:** 2026-09-03  
**Supersedes:** Historical v1 Engineering Baseline for all v2 multi-indication development  

---

## 1. Executive Summary & Purpose

Per **Phase 0 — v2 CONTROLLED BASELINE** of [MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md), before expanding software implementation into v2 domain objects, database migrations, multimodal measurement pipelines, or indication plugins, MAGNIOM formally freezes its canonical design baseline.

All 7 canonical design specifications become **Controlled Design Inputs** subject to formal Level 1 Change Control governance.

---

## 2. Controlled Design Inputs (Frozen Canonical Baseline)

The canonical v2 baseline comprises exactly seven primary design input specifications sealed with cryptographic SHA-256 digests:

| ID | Canonical Design Input | Source Specification File | Version | SHA-256 Cryptographic Digest | Size (Bytes) | Lines |
|---|---|---|---|---|---|---|
| **CDI-v2-001** | **Multi-Indication Data v2** | [MAGNIOM-Canonical Multi-Indication Data Specification v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Canonical%20Multi-Indication%20Data%20Specification%20v2.0.md) | 2.0 | `781df4fa703154ebd625c4b61b752b71687632df261ea15dd9947821ecf65c2c` | 68,547 | 4,133 |
| **CDI-v2-002** | **Evidence Graph v2** | [MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Evidence%20Knowledge%20Graph%20&%20Therapeutic%20Circuit%20Library%20v2.0.md) | 2.0 | `1e6cc2fca945e3ba88e426467a44e17baf4d9c0bc106f562ed8924a455d02253` | 71,264 | 3,981 |
| **CDI-v2-003** | **Target Engine v2** | [MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Target%20Engine%20&%20Ranking%20Algorithm%20Specification%20v2.0.md) | 2.0 | `02d7f689fe53ec2dba46cc480a4eed2e511062d8e3a037dd7299017d2fdbeefc` | 72,384 | 4,229 |
| **CDI-v2-004** | **Multimodal Measurement v2** | [MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Neuroimaging,%20Neurophysiology%20&%20Multimodal%20Measurement%20Specification%20v2.0.md) | 2.0 | `e2c3cd0d8a6d13e24f066b9b19c0393e741802ca881201e0e38519faa8eb7152` | 77,338 | 4,565 |
| **CDI-v2-005** | **Scientific Policy v2** | [MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Scientific%20Policy%20&%20Algorithm%20Configuration%20Specification%20v2.0.md) | 2.0 | `9936191e180edc4be007beb2c6930547277e57df3e6f4cceec43a7ecfdc23b5b` | 82,500 | 4,798 |
| **CDI-v2-006** | **SRS v2** | [MAGNIOM-System Requirements Specification v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-System%20Requirements%20Specification%20v2.0.md) | 2.0 | `b67986bcc97e21d89a1abd2489245c8cfe0eb9328439f5322032ace043e6a189` | 62,040 | 2,156 |
| **CDI-v2-007** | **Roadmap v2** | [MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) | 2.0 | `469f60d480d1dc33de9179a5ec9b5397148b23ec3f672422a115b3de980cb58e` | 76,908 | 4,075 |

---

## 3. Systematic Audit of `public/guides/`

All 11 documents in `public/guides/` have been systematically audited:

1. **`MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0.md`** (SHA-256: `0a5a5b...`, 91,977 bytes): Defines persistent clinician context, shell rail, indication switching, fail-closed safety.
2. **`MAGNIOM-Canonical Multi-Indication Data Specification v2.0.md`** (SHA-256: `781df4...`, 68,547 bytes): Governed design input CDI-v2-001.
3. **`MAGNIOM-Enterprise Verification, Testing CICD Specification v2.0.md`** (SHA-256: `72c88b...`, 63,035 bytes): Defines verification stages 0–10 and non-autonomous clinical release gating.
4. **`MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0.md`** (SHA-256: `1e6cc2...`, 71,264 bytes): Governed design input CDI-v2-002.
5. **`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`** (SHA-256: `469f60...`, 76,908 bytes): Governed design input CDI-v2-007.
6. **`MAGNIOM-Implementation & Validation Roadmap v1.0.md`** (SHA-256: `a79ad6...`, 68,051 bytes): Historical v1 roadmap; superseded by v2.0 for new development. Governed historical reference preserved for backward-compatibility audits.
7. **`MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0.md`** (SHA-256: `5c4b07...`, 51,718 bytes): Foundational architectural expansion into core + indication plugins.
8. **`MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0.md`** (SHA-256: `e2c3cd...`, 77,338 bytes): Governed design input CDI-v2-004.
9. **`MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0.md`** (SHA-256: `993619...`, 82,500 bytes): Governed design input CDI-v2-005.
10. **`MAGNIOM-System Requirements Specification v2.0.md`** (SHA-256: `b67986...`, 62,040 bytes): Governed design input CDI-v2-006.
11. **`MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0.md`** (SHA-256: `02d7f6...`, 72,384 bytes): Governed design input CDI-v2-003.

---

## 4. Change Control & Invariant Rules

Under the [Change Control Procedure](file:///home/owner/Downloads/Magniom/docs/design-controls/change-control-procedure.md):
- Any proposed change to any of the 7 Controlled Design Inputs constitutes a **Level 1 (Critical)** engineering change.
- Any modification requires formal multidisciplinary change assessment, traceability recalculation, risk evaluation against `docs/risk-management/risk-register.json`, and re-sealing of `docs/design-controls/v2-design-baseline-manifest.json`.
