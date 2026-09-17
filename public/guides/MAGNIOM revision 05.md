## Verdict

[Commit `176d76f`](https://github.com/pro7gt/magniom-public/commit/176d76fab061e404027387d2feac53709c441b43) materially improves `cf3cea7`, especially around provenance persistence, G14 adversarial controls, pathway validation, identity handling and CI coverage.

However, it introduces a **critical verification-reporting defect** and does not actually solve distributed session authority. It remains a **no-go for clinical production or medical-device release qualification**.

The commit changes 63 files with 1,775 additions and 221 deletions.

## Resolution of the previous audit

| Previous blocker                                      |              Status | Assessment                                                                 |
| ----------------------------------------------------- | ------------------: | -------------------------------------------------------------------------- |
| Unknown signed tokens accepted                        |               Fixed | Unregistered JTIs now fail closed.                                         |
| Session revocation not durable                        |           Not fixed | Replaced by a local JSON file, not a shared authority.                     |
| G14 synthetic-guideline bypass                        |               Fixed | Synthetic origin is now prohibited before exceptions.                      |
| Missing provenance axes passed G14                    |               Fixed | Clinical candidates must provide all provenance axes.                      |
| Candidate-level lineage satisfied measurement lineage |               Fixed | Derived measurements require measurement-level acquisition/source lineage. |
| Provenance discarded from canonical target            |               Fixed | Fields are copied into `TargetCandidateV2` and added to its schema.        |
| Username changed after session refresh                |               Fixed | Username is now stored in signed claims.                                   |
| Both accounts shared one identity                     | Fixed for prototype | The specialist account receives a distinct profile.                        |
| Invalid structural weights accepted                   |        Mostly fixed | Matrix validation and JSON-safe not-estimable results were added.          |
| FC minimum-cluster default mismatch                   |               Fixed | TypeScript now defaults to two nodes.                                      |
| Unbounded public auth route prefix                    |               Fixed | Middleware now uses an explicit three-route allowlist.                     |
| Internal auth errors disclosed                        |               Fixed | Production receives a generic error.                                       |
| Insecure nonce fallback                               |               Fixed | Session creation now throws without a secure random source.                |

## Critical findings

### 1. Verification reports can declare a failed or empty run “qualified”

The new pyramid report generator has an unconditional conclusion:

> `QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE`

That line is emitted regardless of `allPassed`, including when an earlier layer fails. The overall heading can say `FAILED` while the conclusion still says the product is qualified. See [`run-pyramid-testing.ts`](https://github.com/pro7gt/magniom-public/blob/176d76fab061e404027387d2feac53709c441b43/scripts/ci/run-pyramid-testing.ts#L200-L243).

Partial runs are also reported as “100% PYRAMID LAYERS VERIFIED.” The runner does not distinguish:

* Full 12-layer qualification
* One selected layer
* A `--from-layer` subset
* Zero executed layers

I reproduced the most serious case:

```text
--from-layer nope
Layer NaN through 12 (0 layers)
ALL 0 REQUESTED TESTING PYRAMID LAYERS VERIFIED (100% PASS RATE)
```

The generated JSON contained:

```json
{
  "overallPassed": true,
  "totalLayersEvaluated": 0,
  "passedLayersCount": 0
}
```

The Markdown report concluded:

```text
QUALIFIED & CONFORMANT FOR MEDICAL DEVICE RELEASE
```

This invalidates the generator as a regulatory evidence source.

Required correction:

* Validate `--layer` and `--from-layer` as integers from 1–12.
* Reject an empty execution set.
* Separate `runPassed` from `fullPyramidQualified`.
* Qualification must require exactly 12 unique layers, all passed.
* Failed reports must explicitly conclude `NOT QUALIFIED`.
* Partial runs should be labelled diagnostic evidence, not qualification evidence.
* Add adversarial tests for invalid CLI values, zero layers, partial success and mid-run failure.
* Mark existing generated qualification reports as superseded and regenerate them after fixing the reporter.

### 2. The “durable” session authority is incompatible with Edge middleware

The session registry now persists records to a local `.temp/session-registry-authority.json` file using Node `fs`, `path` and `process.cwd()`.

But authentication is enforced in Next middleware, which imports this registry through `session-crypto.ts`. The production build reported:

```text
A Node.js API is used ... which is not supported in the Edge Runtime.
Module not found: Can't resolve 'fs'
Module not found: Can't resolve 'path'
Module not found: Can't resolve 'crypto'
```

The build nevertheless exits successfully.

The relevant dependency path is:

```text
middleware.ts
  → session-crypto.ts
    → session-registry.ts
      → node:fs / node:path / process.cwd()
```

See [`middleware.ts`](https://github.com/pro7gt/magniom-public/blob/176d76fab061e404027387d2feac53709c441b43/apps/web/src/middleware.ts#L1-L34) and [`session-registry.ts`](https://github.com/pro7gt/magniom-public/blob/176d76fab061e404027387d2feac53709c441b43/apps/web/src/lib/server/session-registry.ts#L40-L93).

In an Edge or serverless deployment:

* Middleware cannot reliably access the Node filesystem.
* Login and middleware do not share a process-local `globalThis`.
* Local files are not shared between instances.
* Filesystem persistence can disappear on restart or deployment.
* Some platforms provide a read-only or ephemeral filesystem.
* The silent catch blocks reduce this to an isolated in-memory map.

Because unknown sessions now correctly fail closed, this failure mode can deny every authenticated request after login rather than weakening authentication.

Required correction:

* Remove all Node filesystem dependencies from middleware imports.
* Use an Edge-compatible shared authority—Redis, database-backed introspection, or a dedicated session API.
* Alternatively, move protected-route enforcement into a Node-compatible gateway.
* Configure the build to fail on Edge-runtime compatibility warnings.
* Add a deployed-topology integration test with login, protected middleware request and logout occurring in separate processes.

### 3. Cross-process revocation can remain stale

Even where the local file is available, `syncFromDurableStore()` only imports records that are not already present:

```ts
if (item && item.jti && !sessions.has(item.jti)) {
  sessions.set(item.jti, item);
}
```

It never replaces an existing active in-memory record with a newer revoked record.

I reproduced this directly:

```json
{
  "before": "active",
  "durableRecordRevoked": true,
  "after": "active"
}
```

One process can therefore retain an active session after another process has written its revocation to the file. See [`session-registry.ts`](https://github.com/pro7gt/magniom-public/blob/176d76fab061e404027387d2feac53709c441b43/apps/web/src/lib/server/session-registry.ts#L57-L86).

The store also has no file locking, atomic replacement, revision numbers or conflict handling. Two simultaneous requests can overwrite one another’s registrations or revocations.

This cannot be repaired reliably with more JSON-file merging. A transactional shared session store is required.

## High-priority findings

### 4. G14 still trusts personalized-method approval asserted by the generator

G14 is much stronger for guideline targets:

* Synthetic origin is absolutely rejected.
* All axes are required.
* Contradictory combinations are rejected.
* Guideline/trial targets require a registered `clinical_permitted` evidence path.

However, a personalized target can still assert:

```text
scientificMaturity = clinical_approved
clinicalPromotionStatus = approved
```

and pass without its algorithm being found in an approved method registry.

I constructed a patient-measured candidate with:

* A valid measurement
* Complete provenance axes
* An `UNREGISTERED_METHOD` algorithm code
* Self-declared clinical approval

G14 returned `pass`.

The newly added `approvalReference` is optional, unused by plugins and not evaluated by G14. `targetingMethodId` is added only after gate evaluation, when the draft is converted into a canonical target.

Required correction:

* Put `targetingMethodId` on `CandidateDraft`.
* Require it for derived or personalized clinical candidates.
* Resolve maturity, permitted modes and promotion status from the versioned method manifest.
* Ignore generator-supplied approval flags when determining clinical eligibility.
* Require a resolvable approval decision/reference.
* Add an adversarial “unregistered but self-approved method” test.

### 5. Verification evidence is not sufficiently attributable

The new pyramid JSON report does not record:

* Commit SHA
* Repository dirty state
* Node/Python versions
* Dependency lockfile hash
* Operating system/runner image
* Whether tests were cached
* Workflow run ID and URL
* Container or toolchain identity
* Signature or immutable artifact digest

The committed report shows some layers completing implausibly quickly because Turborepo caches were used. Cached execution can be valid, but the report must disclose cache provenance.

The report also asserts “zero open defects” and zero coordinate drift without deriving those statements from defect-management or coordinate-drift results.

Additionally, the workflow archives evidence only after the test step succeeds. A failed test step prevents the upload step from running. Use `if: always()` to preserve failure evidence.

## Zalesky/pathway implementation

The pathway implementation is significantly safer:

* Structural matrices can be checked for shape, finiteness, symmetry and normalized weights.
* Weights above one are rejected before negative Dijkstra costs arise.
* Hop limits are now represented.
* Disconnected results use `status: not_estimable` with JSON-safe `null` metrics.
* Some route classification now considers anatomical node labels.
* FC minimum-cluster size now agrees with the manifest.

One important algorithmic defect remains.

### Hop-limited shortest path is implemented as post-hoc rejection

The code first finds the unconstrained minimum-cost path using ordinary Dijkstra, then discards it if it exceeds `hopLimit`.

That is not equivalent to finding the lowest-cost path within the hop constraint.

I tested a graph containing:

* A cheap three-hop path
* A more expensive valid two-hop path
* `hopLimit = 2`

The implementation selected the three-hop path and then returned no path, overlooking the valid two-hop route.

A correct solution should search a state space of `(node, hopsUsed)` or use another bounded shortest-path algorithm.

Other residual limitations:

* The separate `costMatrix` is not validated against `graph.weights`.
* Source and target indices lack explicit bounds validation.
* Four-hop paths are automatically classified as one fronto-thalamic subtype.
* `fronto_thalamic_4_hop_early_cross` is declared but never assigned.
* `predictedEfficiencyRank = 10 − averageHops` remains an uncalibrated display score.
* Route modelling remains normative and appropriately research-only.

## What is now genuinely strong

The provenance work is the best part of this commit:

* Canonical candidates now preserve all reviewed provenance fields in [`draftToCandidateEntity()`](https://github.com/pro7gt/magniom-public/blob/176d76fab061e404027387d2feac53709c441b43/packages/target-engine/src/core/engine-v2.ts#L401-L465).
* Runtime schemas include the new fields.
* Synthetic guideline spoofing is rejected.
* Incomplete clinical provenance fails closed.
* Derived measurement lineage can no longer be satisfied by unrelated candidate lineage.
* Lesion contexts receive at least explicit quality checks.
* The added G14 adversarial suite materially improves regression protection.

The authentication layer also now has:

* Correct username continuity
* Distinct prototype identities
* Generic production errors
* Timing-safe password comparison in Node
* Secure nonce generation
* Explicit public-route allowlisting
* Awaitable logout and `keepalive` support

These are worthwhile improvements even though the session backend must still be replaced.

## Verification results

| Check                                  |                                                  Result |
| -------------------------------------- | ------------------------------------------------------: |
| Package build                          |                                     Passed, 15/15 tasks |
| Production web build                   |               Passed with serious Edge-runtime warnings |
| Type-check                             |                                     Passed, 27/27 tasks |
| Workspace tests                        |                                     Passed, 28/28 tasks |
| Reported TypeScript tests              |                                            1,034 passed |
| Target-engine tests                    |                                              569 passed |
| Web tests                              |                                              129 passed |
| NeuroCompute fast suite                |                                               88 passed |
| Method manifest/hash verification      |                                      3 manifests passed |
| Unknown-session fail-closed test       |                                                  Passed |
| Cross-process revocation probe         |                    Failed—stale process remained active |
| Unregistered personalized-method probe |                                   Failed—G14 allowed it |
| Bounded-path adversarial probe         |                    Failed—valid constrained path missed |
| Invalid pyramid CLI probe              | Failed safely? **No—zero tests produced qualification** |

The complete pyramid runner could not execute normally in this environment because its nested `tsx` commands encountered a Node 24 IPC permission error. The individual build, type-check, unit, method and NeuroCompute suites were run independently. The project workflow specifies Node 22, so I have not classified that IPC problem as a repository defect.

## Recommended disposition

* **Development branch:** Mergeable only with immediate corrective follow-up.
* **Research use:** Acceptable, provided pathway results remain explicitly research-only.
* **Validation evidence:** Do not rely on the new qualification reports until the generator is corrected.
* **Clinical deployment:** No-go.
* **Medical-device release qualification:** No-go.

The next commit should prioritize:

1. Correct the pyramid reporter and invalidate the current qualification reports.
2. Replace filesystem session persistence with a shared Edge-compatible authority.
3. Add real cross-process login/revocation tests.
4. Bind personalized candidates to approved method manifests.
5. Implement a genuinely hop-constrained shortest-path algorithm.
6. Fail CI on Edge-runtime compatibility warnings.
7. Add immutable execution identity and provenance to verification artifacts.
