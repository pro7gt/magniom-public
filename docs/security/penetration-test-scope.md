# Magniom Formal Penetration Testing Scope & Verification Playbook v1.0

**Standard Reference:** HIPAA Security Rule (§ 164.308 / § 164.312), OWASP Top 10 (2021), OWASP API Security Top 10  
**Target Environment:** Dedicated Validation Environment (`env=validation`) with Synthetic Clinical Datasets  
**Document Status:** Controlled Engineering Security Baseline

---

## 1. Executive Summary & Objective

The objective of penetration testing is to rigorously evaluate the technical security controls of Magniom prior to clinical validation freeze (Sprint 15). Testing simulates external attackers, malicious authenticated users, compromised workers, and overprivileged administrators to verify that:

1. **Multi-tenant isolation** cannot be broken (`MAG-SEC-012`).
2. **Protected Health Information (PHI)** cannot be exfiltrated or leaked via API, logs, or storage (`MAG-SEC-014`, `MAG-SEC-030`).
3. **Clinical and scientific immutability** cannot be bypassed (`MAG-SEC-024` through `MAG-SEC-027`).
4. **Privilege escalation** across organizational or clinical roles is structurally denied (`MAG-SEC-006`, `MAG-SEC-008`).

---

## 2. Attack Surface Catalog

| Surface ID  | Component / Endpoint        | Protocol / Interface           | Access Tier                | Primary Risk Vectors                                                      |
| ----------- | --------------------------- | ------------------------------ | -------------------------- | ------------------------------------------------------------------------- |
| **SRF-001** | Next.js Clinician Web App   | HTTPS / Next.js Server Actions | Authenticated Browser      | XSS, CSRF, Session Hijacking, Client Secret Leakage                       |
| **SRF-002** | Supabase PostgREST Data API | HTTPS / JWT REST               | Authenticated / Anon       | Broken Object Level Auth (IDOR), SQL Injection, Privilege Escalation      |
| **SRF-003** | Supabase Private Storage    | HTTPS / S3-compatible          | Authenticated / Signed URL | Path Traversal (`../`), Cross-Tenant Bucket Exfiltration, Unsigned Ingest |
| **SRF-004** | Realtime WebSockets         | WSS / Subscriptions            | Authenticated              | Cross-Case Notification Snooping, Event Injection                         |
| **SRF-005** | RPC Domain Functions        | PostgreSQL `SECURITY DEFINER`  | Authenticated Clinician    | Search-Path Hijacking, Parameter Tampering, State-Machine Bypass          |
| **SRF-006** | Compute Worker Interface    | M2M JWT / Queue Polling        | Machine-to-Machine         | Token Forgery, Queue Poisoning, Lateral Tenant Movement                   |
| **SRF-007** | Admin & Curator Tools       | HTTPS / Elevated Role          | Admin / Curator            | Unaudited Policy Tampering, Bypassing Clinical Sign-off                   |

---

## 3. Rules of Engagement & Test Constraints

1. **Test Environment:** Penetration tests MUST only target the dedicated Validation Environment or isolated local test harnesses. Testing against live hospital production databases is strictly prohibited.
2. **Synthetic Data Only:** All test patients, MRIs, and phenotypic profiles MUST use synthetic fixtures (Golden Cases G01–G05).
3. **Audit Monitoring Active:** All penetration test attempts MUST trigger real-time audit logging in `audit.events` to verify SOC / monitoring detection capabilities (`MAG-SEC-031`).
4. **Denial of Service (DoS):** Volumetric network flood tests require explicit coordinator clearance. Focus remains on application-layer logic and resource exhaustion tests.

---

## 4. Test Matrix & Threat Categories

### Category A: Multi-Tenant Isolation & IDOR (OWASP API1:2023)

- **TEST-PEN-01:** Authenticated user from Organisation A queries case ID belonging to Organisation B via REST.  
  _Expected Result:_ HTTP 200 with empty array `[]` or HTTP 404 (zero data leakage).
- **TEST-PEN-02:** User directly invokes `clinical_storage_read` policy with path `org/org-B/case/case-B/...`.  
  _Expected Result:_ HTTP 403 Forbidden / Storage Access Denied.
- **TEST-PEN-03:** User attempts to mutate case state for a foreign organisation via RPC.  
  _Expected Result:_ PostgreSQL exception `42501 (Insufficient Privilege)`.

### Category B: Privilege Escalation & Role Boundaries (OWASP API5:2023)

- **TEST-PEN-04:** Clinical Operator role attempts to invoke `sign_clinician_decision`.  
  _Expected Result:_ Execution rejected with `MAG-SEC-023: Unauthorized signing clinician`.
- **TEST-PEN-05:** Organization Admin attempts to inspect raw patient MRI files without clinician assignment.  
  _Expected Result:_ Storage access denied (`MAG-SEC-004`, `MAG-SEC-005`).
- **TEST-PEN-06:** Evidence Curator attempts to activate Evidence Library release without Approver role.  
  _Expected Result:_ Activation rejected (`MAG-SEC-021`).

### Category C: Immutability & Scientific Tampering

- **TEST-PEN-07:** User attempts SQL `UPDATE` or `DELETE` on a signed `targeting.clinician_decisions` record.  
  _Expected Result:_ Trigger exception `55000: Table targeting.clinician_decisions is immutable`.
- **TEST-PEN-08:** User attempts to update `snapshot_hash` on approved `clinical.phenotype_snapshots`.  
  _Expected Result:_ Trigger exception `55000: Record is immutable`.
- **TEST-PEN-09:** Worker attempts to overwrite an immutable published Target Slate.  
  _Expected Result:_ Database trigger blocks operation.

### Category D: SQL Injection & Input Validation (OWASP Top 10 A03)

- **TEST-PEN-10:** Patient search filter injected with `' OR '1'='1' --` or `UNION SELECT`.  
  _Expected Result:_ Parameterized query safely escapes input, zero unauthorized rows returned.
- **TEST-PEN-11:** RPC parameters injected with null byte or escape sequences.  
  _Expected Result:_ Schema validation fails before execution.

### Category E: Header Hardening & Client Hygiene

- **TEST-PEN-12:** Automated scan of HTTP response headers.  
  _Expected Result:_ `Strict-Transport-Security`, `Content-Security-Policy`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` present.
- **TEST-PEN-13:** Client JavaScript bundle audit for `SUPABASE_SERVICE_ROLE_KEY` or database passwords.  
  _Expected Result:_ Zero privileged secrets in browser bundles (`MAG-SEC-009`).

---

## 5. Vulnerability Severity & Remediation SLAs

| Severity     | Description                                                                                      | Fix SLA                         |
| ------------ | ------------------------------------------------------------------------------------------------ | ------------------------------- |
| **Critical** | Cross-tenant data leak, unauthorized decision signing, RLS bypass, private key exposure          | Immediate / Build Blocked (24h) |
| **High**     | Privilege escalation within tenant, missing audit event on high-risk action, storage URL leakage | 48 hours                        |
| **Medium**   | Missing security header, rate-limiting deficit on non-critical endpoint, verbose error stack     | 5 business days                 |
| **Low**      | Minor informational disclosure (e.g. software version banner)                                    | Next Sprint                     |
