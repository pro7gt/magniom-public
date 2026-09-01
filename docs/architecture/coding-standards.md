# Magniom Coding Standards & Software Safety Rules

**Standard Reference:** IEC 62304 Section 5.5 / ISO 13485  
**Document Status:** Controlled Engineering Baseline  

---

## 1. Architectural Boundary Rules

1. **Pure Domain Isolation (`packages/domain`)**:
   - MUST NOT import `@supabase/*`, `next`, `react`, `fs`, `node:net`, or browser DOM globals.
   - MUST contain pure TypeScript interfaces, type definitions, and mathematical primitives.
2. **Deterministic Calculation Core (`packages/target-engine`)**:
   - MUST execute synchronously and deterministically.
   - MUST NOT make network calls, read environment variables directly, or access databases.
   - Output MUST be 100% reproducible for identical inputs.
3. **Immutability Principle**:
   - Clinical snapshots (`PhenotypeSnapshot`), slates (`TargetSlate`), and decisions (`ClinicianDecision`) are read-only once created.
   - Mutating frozen clinical objects at runtime is prohibited.

---

## 2. TypeScript & Linting Standards

- **Strict Typechecking**: `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`, `noUncheckedIndexedAccess: true`.
- **Zero Type Assertions**: Avoid `as any` or forced casting. Use runtime Zod validation schemas at I/O boundaries.
- **Explicit Return Types**: All exported domain functions and service methods must specify explicit return types.
- **Fail Fast & Explicit Errors**: Prohibit silent catch-and-ignore blocks. All clinical exceptions must be logged to the audit plane.

---

## 3. Human Authority Invariants

- Software SHALL NEVER automatically submit a final TMS prescription.
- Clinician acceptance of a candidate MUST require explicit interaction (no pre-checked radio buttons or auto-selected recommendations).
