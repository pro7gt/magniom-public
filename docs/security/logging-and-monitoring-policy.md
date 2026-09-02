# Magniom Audit Logging & Security Monitoring Policy v1.0

**Standard Reference:** HIPAA Security Rule (§ 164.312(b)) / ISO 27001 / IEC 62304 / NIST SP 800-92  
**Document Status:** Controlled Engineering Security Policy

---

## 1. Purpose & HIPAA Compliance Scope

This policy governs the generation, transmission, sanitization, storage, and monitoring of audit trails and application logs across the Magniom platform.

In accordance with HIPAA § 164.312(b), Magniom implements hardware, software, and procedural mechanisms that record and examine activity in information systems containing or utilizing electronic Protected Health Information (ePHI).

---

## 2. Protected Health Information (PHI) Redaction Rules (`MAG-SEC-030`)

Application logs, worker queue messages, and debugging traces **MUST NOT contain unmasked patient identifiers**:

1. **Patient Names & MRNs:** Replaced with deterministic de-identified tokens or standard masks (`[REDACTED_MRN]`, `[REDACTED_NAME]`).
2. **Contact Info (Emails, Phones):** Masked via `SecurityLogger.redactPHI()`.
3. **Clinical Notes:** Free-text clinical intake notes are stripped from standard application log pipelines.
4. **Correlation Identifiers (`MAG-WFL-015`):** Long-running workflows carry pseudo-random correlation identifiers (`corr-...`, `tr-...`) rather than patient MRNs.

---

## 3. High-Risk Security Events & Immediate SOC Alerting (Section 151)

The following events represent high-risk operations that generate immediate alerts to system administrators and produce tamper-evident audit records:

| Event Type                      | Triggering Condition                                   | Risk Impact                  | Audit Table    |
| ------------------------------- | ------------------------------------------------------ | ---------------------------- | -------------- |
| `TMS_SIGNING_AUTHORITY_GRANTED` | Clinician granted TMS prescription signing rights      | Clinical Authority Change    | `audit.events` |
| `TMS_SIGNING_AUTHORITY_REVOKED` | Clinician signing rights revoked                       | Clinical Authority Change    | `audit.events` |
| `ROLE_GRANTED` / `ROLE_REVOKED` | User assigned elevated role (Admin, Curator)           | Authorization Boundary       | `audit.events` |
| `EVIDENCE_LIBRARY_ACTIVATED`    | New Evidence Library version deployed to Clinical mode | Scientific Baseline Mutation | `audit.events` |
| `TARGET_ENGINE_ACTIVATED`       | Target Engine algorithm version changed                | Target Calculation Logic     | `audit.events` |
| `NORMATIVE_MODEL_ACTIVATED`     | Connectome normative baseline updated                  | Metric Reference Shift       | `audit.events` |
| `SCIENTIFIC_POLICY_ACTIVATED`   | Scientific Policy release activated                    | Gatekeeper Configuration     | `audit.events` |
| `BREAK_GLASS_ACCESS_GRANTED`    | Emergency administrative case access override          | Clinical Privacy Exception   | `audit.events` |
| `CROSS_TENANT_ACCESS_DENIED`    | Detected attempt to access foreign tenant case         | Multi-Tenancy Violation      | `audit.events` |

---

## 4. Cryptographic Hash Chaining & Tamper Detection (`MAG-AUD-001`)

1. **Append-Only Immutability:** `audit.events` enforces an unconditional database trigger denying all `UPDATE` and `DELETE` operations.
2. **Cryptographic Chaining:** Each audit event includes a SHA-256 hash calculated over the prior event's hash, event ID, event type, timestamp, and payload:
   $$\text{Hash}_n = \text{SHA256}(\text{Hash}_{n-1} \parallel \text{ID}_n \parallel \text{Type}_n \parallel \text{Timestamp}_n \parallel \text{Payload}_n)$$
3. **Automated Verification:** The `audit.verify_chain()` procedure is executed during daily integrity checks and backup restoration drills. Any sequence gap or modified payload immediately flags an audit chain corruption alarm.
