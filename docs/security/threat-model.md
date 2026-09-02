# MAGNIOM Formal SaMD Threat Model v1.0

**Standard Reference:** ISO 14971:2019 / IEC 62304:2006+AMD1:2015 / NIST SP 800-30 / HIPAA Security Rule  
**System Classification:** Software as a Medical Device (SaMD) Class IIb / Class B Software System  
**Document Status:** Controlled Engineering Security Baseline

---

## 1. Scope, Purpose & System Architecture

This threat model identifies, analyzes, and mitigates security and scientific software risks in **Magniom — Connectome-Informed TMS Target Decision Support System**.

Clinical safety in Magniom encompasses both **cybersecurity risks** (unauthorized PHI access, tampering) and **scientific-software risks** (coordinate errors, corrupted evidence, automation bias).

```
                            MAGNIOM HIGH-LEVEL DATA FLOW (DFD LEVEL 1)

   ┌─────────────────┐             HTTPS / TLS 1.3
   │  Clinical User  │ ──────────────────────────────────────┐
   │ (Authenticated) │                                       │
   └─────────────────┘                                       ▼
                                                ┌──────────────────────────┐
   ┌─────────────────┐      M2M Token / TLS     │   Next.js Edge Server    │
   │ Compute Workers │ ────────────────────────▶│  & Supabase API Gateway │
   └─────────────────┘                          └────────────┬─────────────┘
                                                             │
                              ┌──────────────────────────────┼──────────────────────────────┐
                              │                              │                              │
                              ▼                              ▼                              ▼
                     ┌──────────────────┐           ┌──────────────────┐           ┌──────────────────┐
                     │ PostgreSQL (RLS) │           │ Private Storage  │           │ Scientific Engine│
                     │  All 11 Schemas  │           │ MRI / PDF Buckets│           │ Deterministic CLI│
                     └──────────────────┘           └──────────────────┘           └──────────────────┘
```

---

## 2. Trust Boundaries & Protected Assets

| Asset ID    | Asset Description                                  | Sensitivity Classification      | Required Protections                                                                 |
| ----------- | -------------------------------------------------- | ------------------------------- | ------------------------------------------------------------------------------------ |
| **AST-001** | Patient Identity & Demographics (MRN, Name)        | Restricted Clinical (PHI)       | Multi-tenant RLS, no worker/log exposure (`MAG-SEC-029`, `MAG-SEC-030`)              |
| **AST-002** | Raw & Derived Neuroimaging (DICOM, BOLD, Surfaces) | Restricted Clinical             | Private Storage, temporary signed URLs only (`MAG-SEC-014`, `MAG-SEC-016`)           |
| **AST-003** | Approved Phenotype Snapshots                       | Restricted Clinical (Immutable) | SHA-256 hash locked, no UPDATE/DELETE (`MAG-SEC-026`)                                |
| **AST-004** | Target Candidates & Target Slates                  | Restricted Clinical (Immutable) | Deterministic generation, signed manifest, immutability trigger (`MAG-SEC-025`)      |
| **AST-005** | Signed Clinician Decisions                         | Restricted Clinical (Immutable) | Explicit clinician authority, cryptographic signature (`MAG-SEC-022`, `MAG-SEC-024`) |
| **AST-006** | Evidence Library Releases                          | Scientific Internal (Immutable) | Strict version pinning, curator/approver separation (`MAG-SEC-020`, `MAG-SEC-021`)   |
| **AST-007** | Scientific Policy Releases                         | Scientific Internal (Immutable) | Signature verification, high-risk audit logging (`MAG-SEC-032`)                      |
| **AST-008** | Audit Trail (`audit.events`)                       | System Regulatory (Immutable)   | Append-only, SHA-256 hash chained, untamperable (`MAG-AUD-001`)                      |
| **AST-009** | Cryptographic Secrets & M2M Tokens                 | Confidential Infrastructure     | 4-tier secret isolation, zero browser leakage (`MAG-SEC-009`, `MAG-SEC-028`)         |

---

## 3. Threat Profiles & Analysis (Section 131 Vectors)

### Threat 1: External Attacker (PHI Breach & Exfiltration)

- **Threat Agent:** Anonymous unauthenticated internet threat actor.
- **Attack Vector:** Brute force on Auth, SQL injection against REST API, unauthenticated storage scraping, DDoS.
- **Impact:** Compromise of patient privacy, HIPAA regulatory breach, system unavailability.
- **STRIDE:** Information Disclosure, Denial of Service.
- **Pre-Mitigation Risk:** High | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - `MAG-SEC-001`: Mandatory authentication for all clinical routes.
  - `MAG-SEC-007`: Base database schemas completely revoked from `anon`.
  - `MAG-SEC-014` & `MAG-SEC-015`: Storage buckets are strictly private; no permanent public URLs.
  - Rate limiting, parameterized queries, and hardened HTTP headers.
- **Verification:** `SEC-RLS-001`, `SEC-PEN-001`.

---

### Threat 2: Malicious Authenticated User (Multi-Tenant Hopping / IDOR)

- **Threat Agent:** Authenticated user from Hospital A attempting to view Hospital B records.
- **Attack Vector:** Tampering with case IDs in API requests (`/cases/case-from-org-B`), modifying JWT claims.
- **Impact:** Breach of healthcare multi-tenancy, cross-patient confidentiality failure.
- **STRIDE:** Elevation of Privilege, Information Disclosure.
- **Pre-Mitigation Risk:** Critical | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - `MAG-SEC-012`: Multi-tenant isolation enforced at database level via PostgreSQL RLS on all tables.
  - `MAG-SEC-004` & `MAG-SEC-005`: All queries evaluated through `security.has_permission(org_id, ...)`.
  - `MAG-SEC-031`: Cross-organisation access attempts detected and logged to SOC monitor.
- **Verification:** `SEC-RLS-001`, `IT-CLI-001`.

---

### Threat 3: Overprivileged Administrator (Privacy Bypass)

- **Threat Agent:** Internal organization IT administrator without clinical clinical duties.
- **Attack Vector:** Using admin privileges to view raw MRI scans, patient symptom scores, or alter clinical decisions.
- **Impact:** Unauthorized internal snooping, violation of minimum necessary PHI principle.
- **STRIDE:** Information Disclosure, Elevation of Privilege.
- **Pre-Mitigation Risk:** High | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - `MAG-SEC-006`: Capability-based permissions; admin role does NOT grant clinical case access.
  - Section 132/134: Clinical views require explicit clinical role; break-glass access triggers immediate high-risk audit alert (`BREAK_GLASS_ACCESS_GRANTED`).
- **Verification:** `SEC-RLS-001`, `IT-AUD-001`.

---

### Threat 4: Compromised Compute Worker (Lateral Movement & Output Tampering)

- **Threat Agent:** Compute container (NeuroCompute / E-field) compromised via remote code execution.
- **Attack Vector:** Worker attempts to query patient demographics, write fake target slates, or access other cases.
- **Impact:** Poisoned connectome results, lateral movement across tenant compute jobs.
- **STRIDE:** Tampering, Elevation of Privilege.
- **Pre-Mitigation Risk:** High | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - `MAG-SEC-010`: M2M scoped authentication with short-lived tokens (<= 15 min).
  - Section 107: Storage access bounded strictly to `org/{org_id}/case/{case_id}/` prefix.
  - Direct access to `clinical.patients` and `identity.user_profiles` REVOKED from worker role.
  - `MAG-SEC-029`: Queue payloads contain only case IDs and artifact hashes, zero patient names/MRNs.
- **Verification:** `SEC-WRK-001`, `worker-permissions.test.ts`.

---

### Threat 5: Supply-Chain Compromise (Third-Party Package Backdoor)

- **Threat Agent:** Malicious upstream dependency published on npm, PyPI, or Docker Hub.
- **Attack Vector:** Dependency typosquatting, compromised build package injecting telemetry or malware.
- **Impact:** System-wide remote code execution, credential exfiltration.
- **STRIDE:** Tampering, Information Disclosure.
- **Pre-Mitigation Risk:** High | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - Section 132: Mandatory CycloneDX / SPDX Software Bill of Materials (SBOM) for web & Python containers.
  - Section 133: Strict dependency version locking (exact pins, lockfiles, container image digests).
  - Automated CVE audit and vulnerability policy gating in CI (`verify-sbom-and-cve.ts`).
- **Verification:** `SEC-SBM-001`.

---

### Threat 6: Data Poisoning (Tampered Evidence / Normative Model)

- **Threat Agent:** Unauthorized user or rogue curator modifying therapeutic circuits or normative atlases.
- **Attack Vector:** Changing DLPFC coordinate maps or evidence weights directly in database.
- **Impact:** Clinicians receive scientifically invalid target recommendations.
- **STRIDE:** Tampering.
- **Pre-Mitigation Risk:** Critical | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - `MAG-SEC-020` & `MAG-SEC-021`: Evidence mutation requires dual curator/approver role separation.
  - `MAG-SEC-027`: Published evidence releases and scientific policies are strictly immutable.
  - Section 159: No automatic retraining triggers; algorithms change only via signed releases.
  - `MAG-SEC-032` / `MAG-SEC-033`: Policy/Evidence activation triggers high-risk audit events.
- **Verification:** `UT-EVD-001`, `UT-POL-001`.

---

### Threat 7: Scientific Integrity Error (Coordinate Laterality Flip)

- **Threat Agent:** Defective transformation algorithm, software bug in RAS/LPS orientation parser.
- **Attack Vector:** Target coordinate calculated in Right DLPFC instead of Left DLPFC.
- **Impact:** Patient receives TMS stimulation on incorrect brain hemisphere (Severe Clinical Harm).
- **STRIDE:** Tampering (System Integrity Failure).
- **Pre-Mitigation Risk:** Critical | **Post-Mitigation Risk:** Negligible
- **Enforced Mitigations:**
  - `MAG-DAT-004`: Coordinate representations require explicit coordinate space metadata and validation checksums.
  - Mandatory anatomical laterality sanity check (Left DLPFC: `x < 0`, Right DLPFC: `x > 0`).
  - Automated coordinate round-trip tests and Golden Cases (G01–G05) regression gates.
- **Verification:** `coordinate-round-trip.test.ts`, `GC-REG-001`.

---

### Threat 8: Automation Bias (Clinician Over-Trust)

- **Threat Agent:** Cognitive bias in human clinical operator relying blindly on software recommendation.
- **Attack Vector:** Clinician signs default target without reading counterarguments or checking scan QC.
- **Impact:** Sub-optimal or inappropriate treatment administered without clinical critical appraisal.
- **STRIDE:** Repudiation / Non-repudiation deficit.
- **Pre-Mitigation Risk:** High | **Post-Mitigation Risk:** Low
- **Enforced Mitigations:**
  - `MAG-UX-031`: Zero default selection in UI (clinician MUST actively select a candidate).
  - `MAG-CLI-002`: System never automatically prescribes treatment; explicit rationale entry required.
  - Section 51: Every candidate MUST display counterarguments and alternative hypotheses.
- **Verification:** `HF-UX-001`, `HF-UX-002`.

---

## 4. Residual Risk Assessment Summary

| Threat ID  | Threat Category                     | Pre-Risk | Post-Risk      | Verification Gate            |
| ---------- | ----------------------------------- | -------- | -------------- | ---------------------------- |
| **THR-01** | External Attacker / PHI Breach      | High     | **Low**        | `SEC-RLS-001`, `SEC-PEN-001` |
| **THR-02** | Malicious User / Cross-Tenant IDOR  | Critical | **Low**        | `SEC-RLS-001`                |
| **THR-03** | Overprivileged Admin Privacy Bypass | High     | **Low**        | `SEC-RLS-001`, `IT-AUD-001`  |
| **THR-04** | Compromised Compute Worker          | High     | **Low**        | `SEC-WRK-001`                |
| **THR-05** | Supply-Chain Vulnerability          | High     | **Low**        | `SEC-SBM-001`                |
| **THR-06** | Evidence Data Poisoning             | Critical | **Low**        | `UT-EVD-001`, `UT-POL-001`   |
| **THR-07** | Coordinate Laterality Flip          | Critical | **Negligible** | `UT-DAT-001`, `GC-REG-001`   |
| **THR-08** | Automation Bias                     | High     | **Low**        | `HF-UX-001`, `HF-UX-002`     |

**Conclusion:** All identified threats have been reduced to acceptable residual risk levels through verifiable architectural controls, automated tests, and procedural barriers.
