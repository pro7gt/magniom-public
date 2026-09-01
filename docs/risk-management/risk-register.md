# ISO 14971 Initial Hazard Analysis & Risk Register v1.0

**Standard Reference:** ISO 14971:2019 Clause 5 & 6  
**Document Status:** Controlled Risk Register Baseline  

---

## Initial Hazard Analysis & Risk Mitigation Table

| Risk ID | Hazard & Sequence of Events | Hazardous Situation | Harm | Initial Risk (S×P) | Risk Control Measure | Requirement ID | Verification Method | Residual Risk (S×P) |
|---|---|---|---|---|---|---|---|---|
| **HAZ-001** | Clinician experiences automation bias and blindly approves candidate target without clinical review. | Off-target stimulation delivered based on unreviewed algorithmic output. | Lack of treatment efficacy or localized pain. | Serious × Probable (Medium) | 1. No pre-selected default candidate in UI.<br>2. Explicit manual confirmation required.<br>3. Prominent display of counterfactual and conflicting evidence. | `MAG-UX-031`<br>`MAG-CLI-002` | Human Factors Usability Validation (`HF-07`) | Serious × Remote (Acceptable) |
| **HAZ-002** | Coordinate space mismatch (e.g. MNI152 coordinate interpreted as native DICOM voxel index). | TMS coil positioned at unintended cortical parcel. | Ineffective treatment; potential stimulation of non-target functional cortex. | Serious × Occasional (Medium) | 1. Canonical coordinate object explicitly includes coordinate space enum.<br>2. Target Engine enforces spatial boundary checks.<br>3. Export manifests include cryptographic verification hash. | `MAG-DAT-004`<br>`MAG-TGT-001` | Unit & Golden Case Testing (`GC-01`) | Serious × Improbable (Acceptable) |
| **HAZ-003** | Excessive patient motion during fMRI acquisition corrupts connectome estimation. | Distorted functional connectivity leads to spurious target displacement. | Suboptimal target selection resulting in lack of therapeutic response. | Minor × Probable (Medium) | 1. Automated motion censoring (mean FD < 0.25 mm).<br>2. Automatic fallback to Evidence-Only Prior upon QC failure.<br>3. Split-half reliability verification. | `MAG-IMG-001`<br>`MAG-POL-001`<br>`MAG-EVD-001` | Integration & QC Unit Testing (`QC-04`) | Minor × Remote (Acceptable) |
| **HAZ-004** | Target slate generated from outdated or unconfirmed clinical phenotype. | Target tailored to wrong symptom dimension (e.g. anxiety vs anhedonia). | Suboptimal symptom relief. | Minor × Probable (Medium) | 1. Target generation blocked without confirmed PhenotypeSnapshot.<br>2. Snapshot expiration after 72 hours.<br>3. Immutable snapshot timestamping. | `MAG-CLI-001`<br>`MAG-PHE-001`<br>`MAG-WFL-001` | Integration Workflow Testing (`WFL-02`) | Minor × Remote (Acceptable) |
| **HAZ-005** | Unauthorized user or tenant accesses patient MRI / phenotype data across clinic boundaries. | Breach of patient medical confidentiality. | Legal/regulatory breach; psychological distress to patient. | Serious × Occasional (Medium) | 1. Database-enforced multi-tenant Row Level Security (RLS).<br>2. Role-based permission helper functions.<br>3. Immutable audit logging of all data access. | `MAG-SEC-012`<br>`MAG-AUD-001` | pgTAP Security & Penetration Testing (`SEC-01`) | Serious × Improbable (Acceptable) |
