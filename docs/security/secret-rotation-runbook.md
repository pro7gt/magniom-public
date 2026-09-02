# Magniom Secret Management & Zero-Downtime Rotation Runbook v1.0

**Standard Reference:** HIPAA Security Rule (§ 164.312(a)(2)(iv)) / NIST SP 800-57 / CIS Benchmarks  
**Document Status:** Controlled Engineering Operational Runbook

---

## 1. Secret Classification Architecture (Section 90)

Magniom enforces a strict 4-tier separation of credentials across environments:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      MAGNIOM SECRET ARCHITECTURE                       │
├───────────────────┬───────────────────┬────────────────────────────────┤
│ TIER              │ CREDENTIALS       │ EXPOSURE BOUNDARY / PROTOCOL   │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Tier 1: Client    │ Supabase Anon Key │ Publicly safe. Bundled in      │
│ Publishable       │ Client App ID     │ browser client. RLS strictly   │
│                   │                   │ enforced on all requests.      │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Tier 2: Server    │ Service Role Key  │ STRICTLY FORBIDDEN IN CLIENT   │
│ Application       │ Database URL      │ BUNDLES. Only in secure server │
│                   │ NextAuth Secret   │ environment variables.         │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Tier 3: Compute   │ M2M Worker Tokens │ Short-lived (15 min TTL).      │
│ Worker Plane      │ Storage Token     │ Bounded to case storage path.  │
├───────────────────┼───────────────────┼────────────────────────────────┤
│ Tier 4: Scientific│ Evidence Signer   │ Used offline/CI to sign        │
│ & Policy Keys     │ Policy ECDSA Key  │ scientific release manifests.  │
└───────────────────┴───────────────────┴────────────────────────────────┘
```

---

## 2. Zero-Downtime Secret Rotation Procedure

To prevent service disruption to clinical operations during scheduled key rotations, Magniom utilizes a **Dual-Key Overlap Protocol**:

```
                       ZERO-DOWNTIME ROTATION TIMELINE

   T0: Active Primary (Key A)
   ─────────────────────────────────────────────────────────────▶

   T1: Deploy Secondary (Key B) in Dual-Accept Mode
   ─────────────────────────────────────────────────────────────▶
   [Both Key A and Key B are accepted by API Gateway & Workers]

   T2: Switch Issuer / Active Signing to Key B
   ─────────────────────────────────────────────────────────────▶
   [New tokens issued with Key B; existing Key A tokens valid]

   T3: Deprecate Key A (Grace period expired: 24 hours)
   ─────────────────────────────────────────────────────────────▶
   [Key A revoked; Key B becomes sole Primary]
```

### Rotation Runbook Steps

1. **Step 1: Generate New Candidate Key**  
   Generate cryptographic 256-bit entropy token using `scripts/security/rotate-secrets.ts`.
2. **Step 2: Update Dual-Key Configuration in Cloud Vault**  
   Configure `SUPABASE_SECONDARY_KEY` in environment secrets.
3. **Step 3: Verification Probe**  
   Execute automated readiness probe to verify dual validation:
   ```bash
   npm run security:probe
   ```
4. **Step 4: Promote Secondary to Primary**  
   Promote `SUPABASE_SECONDARY_KEY` to `SUPABASE_PRIMARY_KEY` in production cluster.
5. **Step 5: Revoke Deprecated Key**  
   Purge old key from Supabase Dashboard / Cloud KMS and log `SECRET_ROTATION_COMPLETED` audit event.

---

## 3. Emergency Break-Glass Compromise Revocation

If any privileged credential is suspected of compromise:

1. **Immediate Revocation:** Invalidate the compromised token in Supabase / Cloud Provider immediately (`< 15 minutes`).
2. **Session Termination:** Force global logout for all active sessions (`auth.sessions` invalidated).
3. **Audit Event Dispatch:** System automatically logs `BREAK_GLASS_ACCESS_GRANTED` or `CREDENTIAL_EMERGENCY_REVOCATION`.
4. **Forensic Audit Chain Verification:** Run `audit.verify_chain()` to confirm no retrospective records or signed clinical decisions were tampered with during the exposure window.
