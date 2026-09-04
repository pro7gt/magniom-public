# MAGNIOM Canonical Specification Index

This directory contains the canonical specifications governing the **MAGNIOM v2.0 Multi-Indication Neuromodulation Decision Support Platform**.

---

## Active Canonical v2.0 Specifications

| Document Title | File Name | Scope & Authority |
| :--- | :--- | :--- |
| **System Requirements** | [`MAGNIOM-System Requirements Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-System%20Requirements%20Specification%20v2.0.md) | 375 active requirements across 21 namespaces, 19 prohibited system behaviours (§37), 20 ISO 14971 risk controls. |
| **Multi-Indication Architecture** | [`MAGNIOM-Multi-Indication Technical & Scientific Architecture Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Multi-Indication%20Technical%20&%20Scientific%20Architecture%20Specification%20v2.0.md) | Platform separation into Indication-Neutral Core and Indication-Specific Modules; anti-global clinical mode. |
| **Canonical Data Specification** | [`MAGNIOM-Canonical Multi-Indication Data Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Canonical%20Multi-Indication%20Data%20Specification%20v2.0.md) | Framework-independent domain object models; typed stereotactic geometries; reliability bundles. |
| **Target Engine & Ranking** | [`MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Target%20Engine%20&%20Ranking%20Algorithm%20Specification%20v2.0.md) | 16-stage pure deterministic pipeline, 10 hard gates (G0–G9), 8 indication plugins, weighted geometric ranking. |
| **Multimodal Measurement** | [`MAGNIOM-Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Neuroimaging,%20Neurophysiology%20&%20Multimodal%20Measurement%20Specification%20v2.0.md) | Multimodal measurement platform (sMRI, native lesion mapping, rs-fMRI, task fMRI, dMRI, TMS/MEP, audiology, E-field). |
| **Scientific Policy & Governance** | [`MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Scientific%20Policy%20&%20Algorithm%20Configuration%20Specification%20v2.0.md) | `IndicationModuleRelease` governance, positive whitelisting (fail-closed), 13 bounded parameters, Ed25519 signatures. |
| **Evidence Knowledge Graph** | [`MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Evidence%20Knowledge%20Graph%20&%20Therapeutic%20Circuit%20Library%20v2.0.md) | Claim-centric evidence architecture (Tiers 1–4), multi-indication circuits across 8 conditions, evidence ceilings. |
| **Application Shell & UX** | [`MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Application%20Shell,%20Navigation%20&%20Clinical%20Context%20Specification%20v2.0.md) | Indication-neutral shell, clinical context persistence, non-preselection of candidates (§185), mode watermarks. |
| **Enterprise Verification & CI/CD** | [`MAGNIOM-Enterprise Verification, Testing CICD Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Enterprise%20Verification,%20Testing%20CICD%20Specification%20v2.0.md) | 10-stage delivery pipeline, change classification, SBOM/CVE auditing, module kill-switch (§183-184). |
| **Implementation & Validation Roadmap** | [`MAGNIOM-Implementation & Multi-Indication Validation Roadmap v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) | Dual-axis maturity model (Platform M0–M6, Module Q0–Q4), verification baseline criteria, release gates. |

---

## Historical Regulatory Baselines

* [`MAGNIOM-Implementation & Validation Roadmap v1.0.md`](file:///home/owner/Downloads/Magniom/public/guides/historical-v1-baselines/MAGNIOM-Implementation%20&%20Validation%20Roadmap%20v1.0.md):
  Archived in [`historical-v1-baselines/`](file:///home/owner/Downloads/Magniom/public/guides/historical-v1-baselines/) and preserved in `public/guides/` for regulatory auditability and backward traceability under **IEC 62304 §5.8** (SHA-256: `a79ad64004d81c18c51b35e59704a93efbc625d0d237761ca9b87eb3f0607f2c`).
  Superseded by Roadmap v2.0 for all active development.
* Full original v1.0 suite: preserved in [`public/guides_v1/`](file:///home/owner/Downloads/Magniom/public/guides_v1).
