# Software Development Plan (SDP) Template

**Standard Reference:** IEC 62304:2006 + AMD1:2015 Clause 5.1  
**Software Safety Classification:** Class B / Class C SaMD  
**Document Status:** Controlled Design-Control Template  

---

## 1. Scope & Software Identification
- **Product Name:** Magniom Connectome-Informed TMS Target Decision Support System
- **Intended Purpose:** Provide specialist clinicians with evidence-gated, connectome-refined candidate TMS targets for major depressive disorder.
- **Safety Classification:** Class B/C due to potential clinical impact of target selection guidance.

## 2. Software Lifecycle Model
- **Development Model:** Controlled two-week sprints with progressive maturity gates (M0 to M8).
- **Engineering Tooling:** Turborepo monorepo, strict TypeScript, Vitest, Playwright, Supabase PostgreSQL, Docker.

## 3. Activities & Deliverables per Milestone
- **M0 (Design):** System Requirements Specification, Architecture Document, Risk Management Plan.
- **M1 (Engineering Prototype):** Synthetic Golden Cases G01–G05 passing in pure TypeScript Target Engine.
- **M2 (Research Prototype):** De-identified MRI processing with neurocompute containers.
- **M3 (Verification Build):** Formal code freeze, automated test suite 100% pass, traceability matrix locked.
- **M4–M6 (Clinical Validation):** Retrospective, silent prospective, and clinician-assisted validation studies.
- **M7–M8 (Clinical Release):** Final regulatory submission file and commercial deployment.

## 4. Quality & Configuration Management
- Git commit controls, automated CI lint/test gates, branch protection rules on `main`.
