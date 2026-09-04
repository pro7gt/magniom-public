# MAGNIOM

> **Connectome-Informed Multi-Indication TMS Target Decision Support System**  
> **Class IIb / Class B Medical Device Software as a Medical Device (SaMD)**

MAGNIOM synthesises clinical phenotype, published circuit evidence, multimodal patient measurements (structural MRI, functional connectomics, lesion geography, diffusion tractography, neurophysiology), and anatomical constraints into an auditable, ranked set of candidate cortical transcranial magnetic stimulation (TMS) targets (**up to 3 Primary Candidates + up to 2 Additional Candidates**) for specialist clinician review and independent clinical decision-making.

---

## Technical Stack Overview

MAGNIOM combines a modern, high-performance edge web architecture with strict medical-device determinism and verified scientific computing runtimes:

| Architectural Layer               | Technologies                                                                                          | Role & Purpose                                                                                                                                          |
| :-------------------------------- | :---------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Clinician Web Application**     | **Next.js 15.1** (App Router, Server Components), **React 19.0**, **Three.js 0.185**                  | High-performance clinical workspace, interactive 3D cortical rendering, and strict presentation/calculation separation.                                 |
| **Language & Monorepo Tooling**   | **TypeScript 5.8**, **Turborepo 2.4**, **Prettier 3.5**                                               | End-to-end type safety, strict monorepo boundary enforcement, and cached task orchestration.                                                            |
| **Edge & Cloud Deployment**       | **Cloudflare Workers / OpenNext 1.20**, **Wrangler 4.128**                                            | Serverless, globally distributed low-latency clinical edge delivery with zero-trust isolation.                                                          |
| **Scientific Compute Plane**      | **Python 3.10+**, **NiBabel 5.2**, **Nilearn 0.10**, **SciPy 1.12**, **NumPy 1.26**, **Pydantic 2.6** | Containerized POSIX neuroimaging pipeline executing BIDS structural MRI, fMRI motion QC, non-linear coordinate warps, and connectome matrix generation. |
| **Testing & Formal Verification** | **Vitest 3.0**, **Fast-Check 4.9**                                                                    | Deterministic unit testing, metamorphic property-based invariant testing, and automated specification conformance auditing.                             |
| **Database & Identity Plane**     | **PostgreSQL 15+ / Supabase**, PL/pgSQL Triggers, `pgcrypto`                                          | Database-level Row-Level Security (RLS) across migrations 001–042, default-deny multi-tenancy, and SHA-256 tamper-evident clinical audit chaining.      |

---

## Medical Device Architecture & Engineering Principles

MAGNIOM is engineered under strict medical software standards (**IEC 62304 Class B/C**, **ISO 14971**, **ISO 13485**). Its architecture prioritizes mathematical safety and determinism over transient web trends:

1. **SOUP Management & Dependency Discipline (IEC 62304 §5.3.3)**:  
   Software of Unknown Provenance (SOUP) is strictly controlled. All dependencies are pinned, tracked in a formal Software Bill of Materials (`npm run sbom:generate`), and audited for CVE vulnerabilities (`npm run sbom:verify`).
2. **Storage-Level Row-Level Security (RLS) over Client-Side ORMs**:  
   Instead of client-side ORMs (e.g., Prisma), tenant isolation and clinical decision immutability are enforced directly at the database engine level via PostgreSQL RLS policies and PL/pgSQL triggers (`targeting.guard_signed_decision`). This prevents cross-tenant data leakage even in the event of application-tier compromise (satisfying **HIPAA §164.312** and **GDPR Art. 32**).
3. **Pure Mathematical Determinism (Zero Probabilistic AI in Targeting)**:  
   Target calculation is mathematically pure ($f(\text{Patient}, \text{Evidence}, \text{Policy}) \rightarrow \text{TargetSlate}$). Probabilistic generative AI and non-deterministic heuristics are strictly prohibited by specification (SRS §37, Target Engine §159) to prevent seizure induction or misdirected stimulation.
4. **Scientific Compute Isolation**:  
   Heavy neuroimaging matrix mathematics are isolated in dedicated, reproducible Python containers ([`services/neurocompute`](file:///home/owner/Downloads/Magniom/services/neurocompute)), communicating with the monorepo via content-addressed SHA-256 schemas.
5. **Non-Preselection & Specialist Authority**:  
   The application shell strictly forbids pre-selecting any candidate target. Clinicians maintain final clinical signing authority and must deliberately review evidence, anatomical margins, and alternative hypotheses before signing.

---

## Supported Clinical Indications (v2.0 Portfolio)

MAGNIOM v2.0 establishes an indication-neutral core architecture governing eight dedicated clinical indication modules, each with its own therapeutic circuits, target geometries, and qualification status:

- **Major Depressive Disorder (MDD)**: Left DLPFC connectome targeting, sgACC functional connectivity anti-correlation.
- **Obsessive-Compulsive Disorder (OCD)**: Right/Bilateral dACC and SMA-CSTC circuit modulation.
- **Chronic Neuropathic Pain**: Primary motor cortex ($M_1$) somatotopic hand/face representation and precentral gyrus targeting.
- **Stroke Motor Rehabilitation**: Lesion-aware ipsilesional/contralesional primary motor cortex and premotor circuits.
- **Post-Stroke Aphasia**: Lesion-spared Broca/Wernicke and right-hemisphere compensatory language networks.
- **Traumatic Brain Injury (TBI)**: Structural pathology-constrained executive and default mode network targets.
- **Post-Traumatic Stress Disorder (PTSD)**: Right DLPFC and ventromedial prefrontal affective regulation circuits.
- **Tinnitus**: Left temporoparietal cortex ($Heschl's\ gyrus$) audiology-informed acoustic targets.

---

## Controlled Monorepo Layout

```text
magniom/
├── apps/
│   └── web/                         # Next.js 15.1 App Router Clinician Workspace
├── packages/
│   ├── domain/                      # Pure TypeScript canonical domain entities & enums (zero deps)
│   ├── schemas/                     # Zod runtime schemas & multi-indication validation contracts
│   ├── target-engine/               # 16-stage deterministic calculation engine & 8 indication plugins
│   ├── scientific-policy/           # Immutable ScientificPolicy releases & fail-closed whitelist guards
│   ├── evidence/                    # Claim-centric evidence knowledge graph & therapeutic circuit library
│   ├── phenotype/                   # DSM-5 phenotype ontologies, disease stages & symptom mapping
│   ├── measurement-core/            # Multimodal measurement contracts, native spaces & provenance
│   ├── modalities/                  # Modality providers (sMRI, lesion, rs-fMRI, dMRI, TMS/MEP, audiology, E-field)
│   ├── measurement-testkit/         # Multimodal verification test harness, golden cases MM-01..12
│   ├── presentation/                # Clinical view models, formatters, and non-preselection logic
│   ├── ui/                          # Shared clinical design tokens, WCAG 2.1 AA accessible UI components
│   └── test-fixtures/               # 72 canonical synthetic Golden Cases across 8 indications (zero PHI)
├── services/
│   ├── neurocompute/                # Containerized Python BIDS neuroimaging compute service
│   ├── efield/                      # Finite-element electric-field modeling & cortical attenuation
│   ├── workflow-worker/             # Durable queue worker orchestrating multimodal processing pipelines
│   └── report-worker/               # Deterministic clinical consultation PDF generator & audit exporter
├── supabase/
│   ├── migrations/                  # Controlled PostgreSQL schema migrations (001–042)
│   ├── seed/                        # Synthetic clinic fixtures & multi-indication demo cases
│   └── tests/                       # 11-domain SQL security & RLS verification test suites
├── docs/
│   ├── software-requirements/       # Traceable Requirement Catalog (375 requirements across 21 namespaces)
│   ├── risk-management/             # ISO 14971 Risk Management Plan & Critical Hazard Register
│   ├── design-controls/             # IEC 62304 / ISO 13485 / IEC 62366 design control baseline manifests
│   └── verification/                # Formal verification reports, traceability matrices, and exit criteria
├── scripts/                         # Package boundary linters, release tools, and spec auditors
└── public/
    ├── guides/                      # Active Canonical Foundation Specifications (v2.0)
    │   ├── historical-v1-baselines/ # Archived v1.0 specifications preserved under IEC 62304 §5.8
    │   └── SPECIFICATIONS_INDEX.md  # Detailed specification navigational index
    └── guides_v1/                   # Complete historical v1.0 specification repository
```

---

## Canonical Specification Suite (`public/guides/`)

The architecture and algorithms are governed by 11 canonical specifications encompassing 44,858 lines across 1,912 numbered normative sections:

1. [`Application Shell & Clinical Context Spec v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Application%20Shell,%20Navigation%20&%20Clinical%20Context%20Specification%20v2.0.md) (302 sections)
2. [`Canonical Multi-Indication Data Spec v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Canonical%20Multi-Indication%20Data%20Specification%20v2.0.md) (143 sections)
3. [`Enterprise Verification, Testing & CI/CD Spec v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Enterprise%20Verification,%20Testing%20CICD%20Specification%20v2.0.md) (203 sections)
4. [`Evidence Knowledge Graph & Circuit Library v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Evidence%20Knowledge%20Graph%20&%20Therapeutic%20Circuit%20Library%20v2.0.md) (148 sections)
5. [`Implementation & Multi-Indication Roadmap v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Implementation%20&%20Multi-Indication%20Validation%20Roadmap%20v2.0.md) (193 sections)
6. [`Historical Implementation & Validation Roadmap v1.0`](file:///home/owner/Downloads/Magniom/public/guides/historical-v1-baselines/MAGNIOM-Implementation%20&%20Validation%20Roadmap%20v1.0.md) (201 sections, preserved under IEC 62304 §5.8)
7. [`Multi-Indication Technical & Scientific Architecture Spec v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Multi-Indication%20Technical%20&%20Scientific%20Architecture%20Specification%20v2.0.md) (107 sections)
8. [`Multimodal Measurement Specification v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Neuroimaging,%20Neurophysiology%20&%20Multimodal%20Measurement%20Specification%20v2.0.md) (202 sections)
9. [`Scientific Policy & Configuration Spec v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Scientific%20Policy%20&%20Algorithm%20Configuration%20Specification%20v2.0.md) (205 sections)
10. [`System Requirements Specification (SRS) v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-System%20Requirements%20Specification%20v2.0.md) (46 sections, 375 requirements)
11. [`Target Engine & Ranking Algorithm Spec v2.0`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Target%20Engine%20&%20Ranking%20Algorithm%20Specification%20v2.0.md) (163 sections)

---

## Quickstart & Commands

### Prerequisites

- Node.js `>= 20.0.0`
- Python `>= 3.10`
- Docker (for local Supabase and NeuroCompute services)

### Setup & Local Development

```bash
# Install dependencies
npm install

# Start development server on http://localhost:3000
npm run dev
```

### Verification & Testing Pipeline

```bash
# Primary 5-stage verification gate
npm run verify

# Individual specification conformance auditors
npm run verify:srs-spec           # SRS v2.0 (16/16 clusters)
npm run verify:target-engine-spec # Target Engine v2.0 (14/14 clusters)
npm run verify:cicd-spec          # Enterprise CI/CD v2.0 (13/13 clusters)
npm run verify:arch-spec          # Multi-Indication Architecture v2.0 (10/10 clusters)
npm run verify:measurement-spec   # Multimodal Measurement v2.0 (16/16 clusters)
npm run verify:policy-spec        # Scientific Policy v2.0 (13/13 clusters)

# Baseline freezes & exit criteria
npm run verify:v2-baseline        # Phase 6 verification baseline (72 Golden Cases across 8 modules)
npm run verify:exit-criteria      # 9 formal verification exit criteria (Section 122)

# Full local continuous integration suite
npm run ci:full

# Run all unit and invariant test suites
npm test
```

---

## Controlled Design Standards

- **Software Lifecycle:** IEC 62304:2006 + AMD1:2015 (Class B/C SaMD)
- **Risk Management:** ISO 14971:2019
- **Usability Engineering:** IEC 62366-1:2015
- **Health Software Security:** IEC 81001-5-1:2021
- **Quality Management:** ISO 13485:2016
- **Data Privacy & Electronic Records:** HIPAA §164.312, GDPR Art. 32, FDA 21 CFR Part 11
