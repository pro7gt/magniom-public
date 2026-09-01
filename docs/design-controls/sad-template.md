# Software Architecture Document (SAD) Template

**Standard Reference:** IEC 62304:2006 + AMD1:2015 Clause 5.3  
**Document Status:** Controlled Design-Control Template  

---

## 1. System Decomposition & Four-Plane Architecture
- **Plane 1 — Clinical Workspace Plane (`apps/web`):** Next.js 16 Active LTS App Router, human-factors verified UX.
- **Plane 2 — Data & Identity Plane (`supabase/`):** PostgreSQL multi-tenant RLS, immutable clinical snapshot storage, durable job queues.
- **Plane 3 — Compute Plane (`services/neurocompute`):** Isolated containerized Python environment for BIDS MRI processing and connectomics.
- **Plane 4 — Scientific Governance & Domain Core (`packages/domain`, `packages/target-engine`):** Pure functional calculation engine running offline with zero DB dependencies.

## 2. Software Unit Boundaries & Segregation
- Software items with different safety implications are strictly isolated at compile-time and runtime.
- Pure domain algorithms do not depend on storage, networking, or presentation layers.
