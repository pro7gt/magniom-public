# Magniom Backup & Disaster Recovery Plan v1.0

**Standard Reference:** HIPAA Security Rule (§ 164.308(a)(7)(ii)(A) & (B)) / ISO 22301 / NIST SP 800-34  
**Document Status:** Controlled Engineering Disaster Recovery Baseline  

---

## 1. Objectives: RPO & RTO Baselines

| Parameter | Objective | Enforcement Mechanism |
|---|---|---|
| **Recovery Point Objective (RPO)** | **<= 15 minutes** | PostgreSQL continuous Point-in-Time Recovery (PITR) & Write-Ahead Logging (WAL) |
| **Recovery Time Objective (RTO)** | **<= 2 hours** | Automated infrastructure-as-code recovery scripts and cloud database failover |

---

## 2. Database Backup Priority Hierarchy (Section 148)

In the event of a catastrophic event or restoration scenario, data integrity verification follows this strict clinical-scientific priority order:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   DATABASE BACKUP INTEGRITY PRIORITY                   │
├───────┬───────────────────────────────────┬────────────────────────────┤
│ TIER  │ DATA RELATION                     │ INTEGRITY RECOVERY GATE    │
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P1    │ Signed Clinician Decisions &      │ Bit-for-bit SHA-256 hash   │
│       │ Final Targets (`MAG-SEC-024`)     │ parity required.           │
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P2    │ Audit Events (`audit.events`)     │ Cryptographic chain        │
│       │                                   │ validation intact.         │
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P3    │ Scientific Version Manifests &    │ Exact semver & signature   │
│       │ Policy Releases (`MAG-REL-001`)   │ match against baseline.    │
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P4    │ Published Target Slates &         │ Candidate order and slate  │
│       │ Candidates (`MAG-SEC-025`)        │ hash bit-for-bit match.    │
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P5    │ Clinical Phenotype Snapshots      │ `snapshot_hash` verified   │
│       │ (`MAG-SEC-026`)                   │ against DSM-5 criteria.    │
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P6    │ Clinical Outcomes & Assessments   │ Longitudinal tracking data.│
├───────┼───────────────────────────────────┼────────────────────────────┤
│ P7    │ Artifact Registry Metadata        │ SHA-256 storage digests.   │
└───────┴───────────────────────────────────┴────────────────────────────┘
```

---

## 3. Storage Bucket Backup & Binary Durability (Section 149)

PostgreSQL database backup alone does not restore binary neuroimaging files (DICOM, BOLD NIfTI, surface meshes).

1. **Storage Durability:** Object storage buckets (`clinical-ingest`, `clinical-derived`, `clinical-reports`) are backed up via cross-region object replication with 99.999999999% (11 9's) durability.
2. **Artifact Hash Verification:** Restored storage objects are validated against the `sha256_hash` recorded in `imaging.artifacts`.
3. **Source vs Derived Classification:** In disaster recovery scenarios where derived artifacts are corrupted, raw source imaging can deterministically regenerate connectome matrices via pinned container versions.

---

## 4. Automated Backup & Restore Drill Verification

Restoration drills are executed automatically via `scripts/security/backup-restore-drill.ts` to verify that:
1. Data dumps restore cleanly into sandboxed test environments.
2. Row counts across all 11 schemas match the pre-backup state.
3. Immutability triggers remain active and enforce record locks in restored databases.
4. Cryptographic audit hash chains pass `audit.verify_chain()`.
5. Golden Cases (G01–G05) pass against restored scientific policies.
