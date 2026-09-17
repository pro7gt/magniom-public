## Verdict

[cf3cea7](https://github.com/pro7gt/magniom-public/commit/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf) is a strong corrective commit and resolves most concrete defects identified in `60f5b87`. However, it should **not be promoted to a clinical or production release yet**.

Three release-blocking problems remain:

1. Session revocation is process-local and fails open.
2. G14 can still admit synthetic or incompletely described candidates into Clinical Mode.
3. Provenance approved by G14 is discarded from the canonical candidate output.

The commit contains 74 changed files, with 1,487 additions and 301 deletions.

## Improvements over `60f5b87`

| Previous finding                                  |          Status | Assessment                                                                                          |
| ------------------------------------------------- | --------------: | --------------------------------------------------------------------------------------------------- |
| Development credentials available in production   |           Fixed | Production now requires configured credentials.                                                     |
| Bearer token returned to browser JavaScript       |           Fixed | Token exists only in an HttpOnly cookie.                                                            |
| Session token stored in `localStorage`            |           Fixed | Client state is now refreshed from `/api/auth/session`.                                             |
| Live token written to audit events                |           Fixed | Audit events use a truncated JTI hash.                                                              |
| Open redirect after login                         |           Fixed | Same-origin path sanitizer rejects absolute, protocol-relative and login-loop destinations.         |
| No server-side logout/revocation                  | Partially fixed | Registry exists, but is neither durable nor authoritative.                                          |
| Fixed baseline mislabelled `patient_measured`     |           Fixed | Guideline/trial, input origin and personalization are now separated.                                |
| G14 ignored measurement-level origin              |    Mostly fixed | It now resolves relied-on measurements and rejects normative, mixed, synthetic and unknown origins. |
| Reliability calculation crashes on absent target  |           Fixed | Returns a non-qualified/not-estimable result.                                                       |
| Disconnected structural paths scored as zero hops |           Fixed | Unreachable pairs are excluded and completely disconnected targets score zero efficiency.           |
| SC manifest falsely pointed to FC implementation  |           Fixed | SC is now explicitly `not_implemented` and has no implementation hash.                              |
| Li trial description overstated results           |           Fixed | Evidence description now distinguishes the reported timepoints.                                     |
| Manifest source list was mutable                  |           Fixed | Source artifacts are stored as an immutable tuple.                                                  |

The redirect implementation is appropriately small and defensible in [`redirect-sanitizer.ts`](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/apps/web/src/lib/security/redirect-sanitizer.ts).

## Release-blocking findings

### 1. Critical: the session registry fails open

[`isSessionRevoked()` returns `false` when the JTI is absent](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/apps/web/src/lib/server/session-registry.ts#L70-L79). Token verification rejects a session only when that function returns `true`.

I verified this directly:

* Reset the registry.
* Create a correctly signed but never-registered token.
* Call `verifySessionTokenWithClaims()`.
* Result: `valid: true`.

This contradicts the registry’s claim to be an authoritative session store.

The registry is also an in-memory `Map`. In production it is not even attached to `globalThis`. Consequently:

* Login, middleware and logout may see different maps.
* Revocation does not propagate between instances.
* A restart loses all active records and tombstones.
* A token logged out on one instance can remain valid on another.
* Edge middleware and Node API routes cannot be assumed to share memory.

The fire-and-forget logout request adds another weakness: [`logoutClinician()` does not await the server request](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/apps/web/src/lib/auth-store.ts#L192-L220), while browser JavaScript cannot itself delete the HttpOnly cookie.

Required correction:

* Use a durable shared session authority such as Redis or PostgreSQL.
* Represent lookup as `active | revoked | unknown`, with `unknown` rejected.
* During login, verify the newly generated token with revocation checking disabled, register it, and only then issue the cookie.
* Make logout await revocation or use a `keepalive` request.
* Add cross-instance and restart tests—not only same-process unit tests.

### 2. Critical: G14 approval can be self-asserted

The guideline exception is derived entirely from fields supplied by the candidate:

```ts
targetDefinitionOrigin = guideline/trial
patientPersonalizationStatus = fixed
clinicalApprovalStatus or clinicalPromotionStatus = approved
```

Once these are present, the branch does not reject legacy `dataOrigin: 'synthetic'`.

I constructed a candidate with:

* `dataOrigin: synthetic`
* `targetDefinitionOrigin: guideline`
* `inputDataOrigin: none`
* `patientPersonalizationStatus: fixed`
* approval and maturity set to approved

G14 returned `pass` with “zero clinical leakage detected.”

A second probe showed that a purported personalized patient-measured candidate can omit all three new provenance axes, supply no relied-on measurements, and still pass. The “must have measurements” rule runs only when `patientPersonalizationStatus` is explicitly `individually_computed`.

The relevant logic is in [`g14-research-leakage.ts`](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/packages/target-engine/src/gates/v2/g14-research-leakage.ts#L28-L72).

Required correction:

* Make the new axes mandatory through a discriminated candidate union.
* Reject contradictory old/new provenance combinations.
* Resolve guideline and clinical approval from an immutable method/evidence registry, not candidate-provided flags.
* Require personalized candidates to identify relied-on patient measurements.
* Add adversarial tests for omitted axes and inconsistent provenance.

### 3. High: approved provenance disappears from canonical output

The new provenance fields exist only on `CandidateDraft`. [`TargetCandidateV2`](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/packages/domain/src/target-v2.ts#L55-L74) contains only the legacy fields.

More importantly, [`draftToCandidateEntity()`](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/packages/target-engine/src/core/engine-v2.ts#L401-L456) copies neither the new provenance axes nor the legacy `dataOrigin`, maturity and promotion fields.

Therefore the engine:

1. Evaluates provenance in G14.
2. Allows or suppresses the candidate.
3. Emits a canonical candidate that no longer contains the provenance basis for that decision.

This breaks downstream auditability and prevents reconstructing why a target was clinically eligible.

All provenance axes, approval reference, method identity and relied-input lineage should be persisted in `TargetCandidateV2`, its schemas, storage representation and release manifests.

## Other significant findings

### Identity and authentication remain prototype-grade

The session endpoint returns [`verification.claims.sub` as the username](https://github.com/pro7gt/magniom-public/blob/cf3cea785b5ecb302195f9ad6c486b6c4a58e4bf/apps/web/src/app/api/auth/session/route.ts#L41-L49). But `sub` is the canonical user ID, such as `usr-spec-001`. A refresh can therefore change the displayed username from `dr_asmith` to the user ID.

Both configured usernames also receive the same canonical identity, role and organization. This is not real multi-user authentication or reliable audit attribution.

Additional residual risks include:

* Per-process, username-only rate limiting.
* Easy account denial-of-service through five failed attempts.
* Plain equality password comparisons.
* Internal configuration errors returned directly to the client.
* All `/api/auth*` routes are middleware-public rather than explicitly allowlisted.
* Non-cryptographic `Math.random()` fallback remains for session nonces.

For production, replace this credential layer with an IdP or properly hashed user store, explicit user records, MFA/AAL enforcement and a shared rate limiter.

### Derived-measurement lineage is insufficiently verified

For a derived measurement, G14 accepts `candidate.lineage.lineageType` as evidence that the measurement itself has verified lineage. A generic candidate lineage marker can therefore satisfy the check even when the derived measurement has no source measurement or acquisition reference.

Lineage needs to be verified on the measurement and traced recursively to patient-measured acquisition artifacts.

Lesion-context IDs also bypass measurement provenance checks entirely when referenced as relied-on inputs.

## Zalesky-targeting implementation

The scientific safety posture is clearly improved:

* No-cluster cases now fail closed.
* Invalid FC parameters and duplicate/non-finite nodes are rejected.
* Structural disconnection is no longer interpreted as an ideal zero-hop pathway.
* Missing stimulation or target parcels fail closed.
* Structural-connectivity targeting is honestly labelled unimplemented.
* Normative pathway modelling remains research-only.

Important residual limitations remain:

1. Structural weights greater than 1 produce negative `−log(w)` edge costs, invalidating Dijkstra’s assumptions. Matrix dimensions, symmetry, node bounds and permissible weight range need validation.

2. The manifest’s hop limit is not enforced.

3. Route type is inferred only from path length. A four-node path is labelled “cortical 3-hop” without verifying that its nodes are DLPFC, superior frontal cortex, ACC and SGC.

4. `averageHops: Infinity` is not safely JSON-serializable; it becomes `null`. Return an explicit `not_estimable` status and nullable metric instead.

5. `predictedEfficiencyRank = 10 − hops` is an uncalibrated display score, not an outcome prediction.

6. The FC manifest hashes only the TypeScript clustering file, while the more complete Python implementation is separate. The manifest therefore does not bind the executable end-to-end patient pipeline.

7. TypeScript defaults `minClusterSize` to 1, whereas the manifest and Python implementation specify 2.

8. The manifest specifies 6-mm smoothing, while the Cash–Zalesky reliability work motivating this implementation used a lower-smoothing strategy to preserve individual spatial information.

9. `seedType: group_seedmap` currently changes the percentile but does not construct the HCP-derived group seedmap signal. The implementation is cluster selection over already calculated connectivity values, not yet the complete Cash–Zalesky targeting pipeline.

These limitations are acceptable while the method remains validation/research-only, but should prevent clinical promotion.

## Verification performed

| Check                                   |                                                         Result |
| --------------------------------------- | -------------------------------------------------------------: |
| Package build                           |                                            Passed, 15/15 tasks |
| TypeScript type-check                   |                                            Passed, 27/27 tasks |
| Workspace tests                         |                      Passed, 28/28 tasks; 1,019 reported tests |
| Target-engine tests                     |                                                    Passed, 557 |
| Web tests                               |                                                    Passed, 126 |
| NeuroCompute fast suite                 |                                                     Passed, 88 |
| Method manifests/evidence IDs/hashes    |                                            Passed, 3 manifests |
| Adversarial session probe               |          Failed safely? **No—unregistered token was accepted** |
| Adversarial G14 synthetic probe         |               Failed safely? **No—synthetic candidate passed** |
| Adversarial incomplete-provenance probe | Failed safely? **No—incomplete personalized candidate passed** |

The normal `tsx` executable encountered a local IPC permission error in this environment. Running the same verification scripts through Node’s `tsx` loader succeeded, so this appears to be a runner/environment issue rather than a source failure.

## Recommended disposition

* **Development/research merge:** Acceptable if the blockers are immediately tracked.
* **Validation release:** Conditional; provenance persistence and G14 contradictions should be fixed first.
* **Clinical or production deployment:** No-go.
* **Scientific promotion of FC or pathway targeting:** No-go; retain validation/research-only status.

The next commit should prioritize:

1. Durable, fail-closed session authority.
2. Required and immutable provenance contracts.
3. Persistence of provenance into canonical candidates.
4. Registry-backed clinical approvals.
5. Adversarial G14 and cross-instance revocation tests.
6. Structural graph validation and explicit not-estimable pathway results.
7. A single versioned FC reference implementation covering seed extraction, preprocessing, clustering and target export.
