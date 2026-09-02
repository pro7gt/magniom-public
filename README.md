# MAGNIOM

> **Connectome-Informed TMS Target Decision Support System**

Magniom synthesises clinical phenotype, published circuit evidence, and patient-specific functional connectomics into an auditable, ranked set of candidate cortical TMS targets (**up to 3 Primary Candidates + up to 2 Additional Candidates**) for specialist clinician review and independent clinical decision-making.

---

## Controlled Monorepo Structure

```text
magniom/
├── apps/
│   └── web/                         # Next.js 16 Active LTS Clinician Workspace
├── packages/
│   ├── domain/                      # Pure TypeScript canonical types & enums (zero external deps)
│   ├── schemas/                     # Zod runtime schemas & validation contracts
│   ├── phenotype/                   # Phenotype domain calculations & symptom mapping
│   ├── evidence/                    # Evidence library loading & graph traversal
│   ├── target-engine/               # Deterministic calculation engine (offline core)
│   ├── scientific-policy/           # Versioned scientific policy configuration
│   ├── presentation/                # UI view models & formatting transformers
│   ├── ui/                          # Shared clinical design system tokens & components
│   └── test-fixtures/               # Synthetic Golden Cases G01–G05 (zero PHI)
├── services/
│   ├── neurocompute/                # Containerized Python BIDS MRI processing plane
│   ├── efield/                      # Electric-field modeling service
│   ├── report-worker/               # Clinical consultation PDF generator
│   └── workflow-worker/             # Background job worker
├── supabase/
│   ├── migrations/                  # Controlled PostgreSQL schema migrations (001–033)
│   ├── seed/                        # Synthetic clinic seed data
│   └── tests/                       # pgTAP security & RLS verification tests
├── docs/
│   ├── architecture/                # System architecture, coding standards, environment strategy
│   ├── software-requirements/       # Traceable Requirement Catalog & SRS baseline
│   ├── design-controls/             # IEC 62304 / ISO 13485 / IEC 62366 / IEC 81001-5-1 templates
│   ├── risk-management/             # ISO 14971 Risk Management Plan & Risk Register
│   └── verification/                # Requirements Traceability Matrix
├── scripts/                         # Boundary linters and requirement verification tools
└── public/
    └── guides/                      # Canonical foundation specifications (v1.0)
```

---

## Quickstart

### Prerequisites

- Node.js >= 20.0.0
- Docker (for local Supabase and NeuroCompute containers)

### Setup

```bash
# Automated environment setup
./scripts/setup-local-env.sh

# Or manual installation
npm install
npm run verify
npm run build
npm test
```

### Development

```bash
# Launch Clinician Workspace on http://localhost:3000
npm run dev
```

---

## Controlled Design Standards

- **Software Lifecycle:** IEC 62304:2006 + AMD1:2015 (Class B/C SaMD)
- **Risk Management:** ISO 14971:2019
- **Usability Engineering:** IEC 62366-1:2015
- **Cybersecurity:** IEC 81001-5-1:2021
- **Quality Management:** ISO 13485:2016
