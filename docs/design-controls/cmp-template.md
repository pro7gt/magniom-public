# Cybersecurity Management Plan (CMP) Template

**Standard Reference:** IEC 81001-5-1:2021 / TGA Cybersecurity Guidelines  
**Document Status:** Controlled Design-Control Template

---

## 1. Cybersecurity Objectives & Security Architecture

- Protect patient privacy (Zero unauthorized exposure of MRI or clinical phenotype).
- Guarantee data integrity (Cryptographic hashing of snapshots, slates, and decisions).
- Prevent unauthorized system manipulation or algorithm tampering.

## 2. Threat Modeling & Vulnerability Management

- Threat model based on STRIDE framework.
- Automated dependency vulnerability scanning in CI (`npm audit`).
- Multi-tenant isolation enforced in the PostgreSQL engine via Row Level Security (RLS).
- Encryption in transit (TLS 1.3) and at rest (AES-256).
