# Review of Magniom commit `cca6b59`

**Verdict:** this is a substantial architectural improvement, but it should **not be deployed or treated as clinically safe yet**. The commit adds valuable scientific-governance foundations, but introduces a critical authentication bypass and still allows synthetic targeting logic to be presented as patient-derived.

Reviewed commit: [`cca6b59385b4ba8f3683cc4d25f5e20f8f6db4c8`](https://github.com/pro7gt/magniom-public/commit/cca6b59385b4ba8f3683cc4d25f5e20f8f6db4c8)

## Verification performed

I checked the exact commit independently of the previous revision.

| Check                         |                                                                        Result |
| ----------------------------- | ----------------------------------------------------------------------------: |
| Production build              |                                                                        Passed |
| TypeScript type checking      |                                                                        Passed |
| Package test tasks            |                                                                  28/28 passed |
| Actual JS/TS assertions       |                                                                  1,002 passed |
| Targeted auth/security tests  |                                                                  35/35 passed |
| New Cash–Zalesky Python tests |                                                                    3/3 passed |
| Neurocompute wrapper          | Environment prevented execution because `tsx` could not create its IPC socket |
| `pytest` suite                |                                  `pytest` is not installed in the environment |

The passing tests demonstrate internal consistency, but several tests currently encode unsafe behaviour as expected behaviour.

# Critical findings

## 1. Authentication can be bypassed completely

This is the release-blocking issue.

### Public universal credentials

`apps/web/src/lib/auth-store.ts` embeds:

```ts
username: "magniom"
password: "amygdala"
```

Because this file participates in the client application, these values cannot be considered secrets.

### Client-side authentication fallback

If `/api/auth/login` fails, `auth-store.ts` falls back to local authentication and creates a session on the client.

Consequently, an unavailable or deliberately blocked server authentication endpoint does not deny access—it enables the client fallback. Anyone able to run or modify the frontend can authenticate without server approval.

### Hard-coded signing-secret fallback

`apps/web/src/lib/security/session-crypto.ts` contains a default HMAC secret:

```ts
magniom-clinical-session-hmac-sha256-secret-key-2026
```

If the environment variable is absent, an attacker who knows the repository can mint valid-looking session tokens.

### Session design problems

The current token lacks:

* expiration;
* issuer and audience;
* role and organization claims;
* cryptographic session identifier;
* server-side revocation;
* key rotation;
* per-user authorization state.

The random token suffix uses `Math.random()`, which is not suitable for security tokens.

The login route also creates a cookie with `httpOnly: false`, returns the token in JSON, and the client stores session material in browser-accessible storage. An XSS vulnerability could therefore extract the session.

### Required resolution

Before any network-accessible deployment:

1. Delete universal credentials from client code.
2. Delete the offline/local login fallback.
3. Require a server-only signing key and fail startup if it is absent.
4. Use cryptographically random session IDs.
5. Use `HttpOnly`, `Secure`, appropriately scoped cookies.
6. Add short expiration and server-side revocation.
7. Add per-user identity, roles and organization boundaries.
8. Add rate limiting, lockout and CSRF protection.
9. Make tests assert that login fails when the authentication server is unavailable.
10. Remove HIPAA and 21 CFR Part 11 conformance claims until formally supported.

## 2. The clinical FC generator still uses hard-coded targets

`MDDConnectomeRefinementGenerator` checks whether an rs-fMRI measurement exists, but it does not calculate connectivity from that measurement. It creates four fixed nodes with hard-coded coordinates and connectivity values.

It then assigns `patient_measured` provenance if an apparently non-synthetic measurement was supplied.

This means the actual logic is effectively:

```text
Patient measurement exists
        ↓
Ignore its imaging data
        ↓
Run selection over fixed synthetic nodes
        ↓
Label result patient-measured
```

This is more dangerous than an explicitly synthetic demonstration because the resulting candidate can appear scientifically mature.

The generator also marks a clinical invocation as:

* `clinical_candidate`;
* `candidate_under_review`;
* potentially `patient_measured`.

Those values are currently sufficient to evade G14’s new rejections. A hard-coded target can therefore pass the clinical gate when accompanied by appropriate metadata.

### Required resolution

Until the real artifact-driven pipeline is integrated, the generator must:

* remain research-only;
* always declare synthetic or normative origin;
* always have promotion status `blocked`;
* never produce a clinically eligible candidate;
* never infer patient origin merely from the presence of a measurement record.

# High-priority scientific findings

## 3. G14 still fails open when metadata is absent

The new clinical gate is an important improvement, but it mainly rejects explicitly unsafe values.

If fields such as these are `undefined`, the candidate is not necessarily rejected:

* `dataOrigin`;
* `scientificMaturity`;
* `clinicalPromotionStatus`;
* measurement origin.

For clinical evaluation, missing provenance must be treated as `unknown`, not as implicitly acceptable.

`mixed` and `derived_from_patient_measured` also require lineage resolution. A mixed result should only be eligible when every relied-on input and transformation is identified and permitted.

A safer rule is an explicit allowlist:

```text
Clinical eligibility =
  verified patient input
  AND approved method version
  AND traceable transformations
  AND qualified implementation
  AND approved promotion state
  AND no missing provenance
```

## 4. File validity is being confused with scientific provenance

`artifact_validator.py` can classify a structurally valid NIfTI or GIFTI as `patient_measured`.

File structure cannot establish data origin. A synthetic file can contain a valid NIfTI header, and a text file can contain a `<GIFTI` marker.

Problems include:

* superficial GIFTI marker checking rather than XML/DataArray validation;
* incomplete NIfTI header and payload validation;
* automatically assigning an MNI coordinate space;
* accepting short BOLD acquisitions with only a warning;
* no verification of affine, orientation, units, datatype or expected payload size.

Artifact validation and provenance should be separate:

```text
File validator → “valid NIfTI”
Ingestion authority → “patient-measured”
Pipeline manifest → “processed from artifact X by method Y”
```

Only the trusted ingestion layer should establish patient origin.

## 5. Provenance manifests contain invented defaults

`manifests.py` supplies values such as:

* software versions;
* mean framewise displacement;
* volume count;
* smoothing;
* global-signal-regression setting.

These cannot be defaulted when unknown. A sealed manifest with fabricated values is worse than an incomplete manifest because it appears authoritative.

Unknown quantities should be absent or explicitly recorded as unknown, and clinical promotion should fail until they are measured.

The “immutable” manifest is also only a regular dataclass plus a hash. It is not frozen, signed or anchored in an append-only record.

## 6. The Cash–Zalesky implementation is not method-faithful yet

There are substantial inconsistencies across runtime code, Python, tests, manifests and documentation.

| Parameter            | Current values found                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------- |
| FC threshold         | 0.005, 0.10, 0.15, 0.60 and 0.75                                                         |
| Minimum cluster size | 1, 2 and 10                                                                              |
| Smoothing            | 4 mm and 6 mm                                                                            |
| Seed estimation      | Direct sgACC mean rather than implemented group-seedmap approach                         |
| Centroid             | Absolute-connectivity-weighted centroid rather than documented cluster centre of gravity |

The `0.75` threshold supplied by the MDD runtime is especially inconsistent with the cited method.

The optimized Cash–Zalesky approach was not simply “use the top 10%.” The conventional small seed and the stabilized group-seedmap method had different optimized thresholds. Magniom needs an explicit, versioned protocol rather than a generic “Cash 2021” label.

## 7. Unsafe clustering fallbacks

The TypeScript implementation merges the complete suprathreshold set when no cluster meets minimum size, even if its voxels are spatially disconnected.

The Python implementation instead falls back to the strongest individual vertex.

Both behaviours undermine the method’s central rationale: rejecting isolated extrema in favour of spatially coherent targets.

The correct clinical behaviour is:

```text
No qualifying coherent cluster → no candidate → explain failure
```

Research mode may expose a peak or undersized cluster diagnostically, but it must not silently convert it into a valid target.

## 8. Surface geometry is not represented correctly

The Python method groups surface vertices by rounded Cartesian MNI coordinates rather than actual cortical-mesh adjacency.

It also defaults missing coordinates to `(-42, 44, 30)`. Missing vertex coordinates must cause failure; they cannot be substituted with a plausible-looking target coordinate.

Required inputs should include:

* registered cortical surface;
* vertex-to-vertex adjacency;
* native-to-standard transforms;
* coordinate-space declarations;
* hemisphere and cortical-mask validation.

## 9. Population reproducibility is treated as individual uncertainty

The implementation uses approximately 2.2 mm as an uncertainty radius.

That figure is a population-level repeat-scan result under a particular acquisition and processing protocol. It is not automatically the uncertainty of every individual target.

Individual uncertainty should come from subject-specific analysis, such as:

* split-half displacement;
* bootstrap resampling;
* repeated denoising/processing variants;
* cluster stability;
* usable acquisition duration;
* motion and censoring sensitivity.

# Evidence and manifest integrity

## 10. Evidence identifiers do not resolve consistently

The method manifests use evidence IDs such as:

* `src-mdd-cash-2021`;
* `src-mdd-li-2026`;
* `src-mdd-seguin-2026`.

The evidence registry uses different identifiers such as `src-mdd-005`, `src-mdd-006` and `src-mdd-007`.

A release system must reject a method manifest whose evidence references cannot be resolved exactly.

## 11. Implementation hashes are not hashes of the implementation

The manifest values do not match the corresponding source files. At least one appears to be a patterned placeholder.

Examples from this commit:

| Implementation                   | Actual SHA-256                                                     |
| -------------------------------- | ------------------------------------------------------------------ |
| TypeScript Cash clustering       | `d9d5c8dd3f3796f4b0314b9faaa5149d786812f3dd7ac08799930a1d0d2d23ca` |
| Python FC implementation         | Begins `fea74b35…`                                                 |
| Seguin TypeScript implementation | Begins `da291928…`                                                 |

The hashes should be generated automatically during build/release, never copied manually into source configuration.

A method release should bind together:

* source commit;
* exact implementation hash;
* container/environment digest;
* parameter schema;
* scientific evidence IDs;
* validation dataset;
* validation result;
* approval record.

## 12. Some scientific documentation is internally inconsistent

Examples include:

* the Cash targeting paper being attributed to the wrong journal;
* SC documentation describing a local endpoint-density maximum rather than the trial’s strongest-cluster procedure;
* the FC documentation omitting the optimized group-seedmap signal construction;
* clinical-promotion documentation describing Cash 2021 as clinically approved while the method manifest remains blocked/validation-stage;
* mismatched connectome/parcellation descriptions for the polysynaptic pathway work.

These are not merely editorial discrepancies. In a regulated scientific system, documentation must identify the exact implemented method.

# Structural and pathway modules

## Structural targeting

The commit introduces useful interfaces and documentation, but the runtime structural generator is not a patient-specific diffusion-MRI pipeline. It still produces a fixed synthetic target.

It should remain blocked until it actually consumes:

* patient diffusion data;
* preprocessing QC;
* tractography configuration;
* SIFT2 or equivalent weights;
* sgACC-intersecting streamlines;
* voxelwise structural-connectivity mapping;
* DLPFC thresholding and clustering;
* native-space target projection.

## Polysynaptic routing

The Seguin-style implementation is appropriately labelled research-only, which is a good decision.

However:

* a coordinate with no parcel within 15 mm is silently assigned to the nearest parcel;
* average hops can fall back to an invented value;
* predicted efficiency is an arbitrary `10 − hops`;
* route anatomy is inferred largely from path length;
* the manifest’s hop limit is not clearly enforced;
* the connectome is still normative rather than patient-specific.

These outputs should be described as mechanistic hypotheses, not treatment-effect predictions.

# What the commit gets right

This commit nevertheless contains meaningful progress.

## Scientific governance

The additions of `DataOrigin`, `ScientificMaturity` and `ClinicalPromotionStatus` create the beginnings of a proper scientific type system.

The new distinctions between:

* patient-measured;
* normative;
* synthetic;
* derived;
* research;
* validation;
* clinical candidate;
* approved;

are exactly the kinds of distinctions Magniom needs.

## Gate G14

G14 now rejects several important categories in clinical mode, including:

* explicitly synthetic or unknown candidates;
* normative pathway results;
* dynamic-FC and unvalidated-ML results;
* prototype, research or validation-stage candidates;
* blocked promotion status;
* reliance on known synthetic measurements.

The next step is to make it fail closed on missing or unresolved values.

## Method manifests

Versioned manifests are the correct architectural direction. They create a place to define:

* permitted modes;
* algorithm parameters;
* evidence dependencies;
* maturity;
* validation status;
* implementation identity.

They need integrity enforcement and a single source of truth.

## CI behaviour

The neurocompute wrapper now fails when Python is unavailable instead of reporting a false success. The Layer 8 test runner also includes neurocompute verification.

That is a worthwhile improvement even though the Python environment remains insufficiently reproducible.

## Research-only normative routing

The pathway generator correctly carries normative origin, research maturity and blocked promotion status. That is much safer than promoting the result prematurely.

# Roadmap assessment

| Workstream                  | Status after `cca6b59` | Assessment                                                                         |
| --------------------------- | ---------------------- | ---------------------------------------------------------------------------------- |
| Scientific provenance types | Substantial progress   | Good schema foundation                                                             |
| Clinical safety gates       | Partial                | Improved, but missing metadata still passes                                        |
| Evidence/method registry    | Partial                | Architecture exists; identifiers and hashes are unreliable                         |
| Imaging artifact validation | Early prototype        | Structural checks only; provenance inference unsafe                                |
| Personalized FC algorithm   | Prototype              | Not integrated with real patient artifacts and not fully method-faithful           |
| Reliability analysis        | Prototype              | Exact-algorithm reuse is good; thresholds and uncertainty interpretation need work |
| Clinical MDD integration    | Unsafe placeholder     | Fixed nodes can be relabelled patient-derived                                      |
| Structural targeting        | Documentation/scaffold | No real patient-specific SC runtime                                                |
| Pathway modelling           | Research scaffold      | Correctly restricted, but heavily heuristic                                        |
| E-field integration         | Interface-level        | Still not a solver-backed individual E-field pipeline                              |
| Authentication              | Release blocker        | Must be redesigned before deployment                                               |
| Automated verification      | Stronger               | Broad passing suite, but insufficient real-data and adversarial tests              |

# Recommended next commit

The next commit should be a safety correction, not another feature expansion.

## P0 — Release blockers

1. Remove embedded credentials and client-side authentication.
2. Require server-side secret configuration with fail-fast startup.
3. Replace browser-readable session storage with secure server sessions.
4. Prevent `MDDConnectomeRefinementGenerator` from producing clinical candidates.
5. Make G14 reject missing or unresolved provenance.
6. Remove unsupported compliance claims.

## P1 — Scientific integrity

7. Establish one canonical FC method manifest and parameter set.
8. Implement the actual seedmap procedure or rename the current method accurately.
9. Fail when no qualifying cluster is present.
10. Use cortical-surface adjacency rather than rounded coordinate adjacency.
11. Separate artifact structure validation from origin attestation.
12. Eliminate fabricated manifest defaults.
13. Automatically generate and verify implementation hashes.
14. Make all evidence references resolve through one registry.

## P2 — Validation

15. Add an end-to-end test from measurement artifact to target candidate.
16. Test malformed but structurally plausible NIfTI/GIFTI artifacts.
17. Test that a valid synthetic NIfTI cannot become `patient_measured`.
18. Test that absent provenance fails clinical evaluation.
19. Test split-half reliability with realistic surface data.
20. Test against a frozen reference output from the intended scientific implementation.
21. Replace the UI test placeholder with an actual test suite.
22. Provide a locked Python environment and run the full Python suite in CI.

## Merge recommendation

* **Clinical or production deployment:** No.
* **Internet-accessible research deployment:** No, until authentication is fixed.
* **Research-only development branch:** Acceptable after clearly blocking every synthetic targeting path from clinical promotion.
* **Scientific validation milestone:** Not yet; the commit provides scaffolding rather than a validated individualized targeting pipeline.

The most consequential issue is that the new metadata system gives Magniom the vocabulary to distinguish synthetic, normative and patient-derived science, but the current runtime can still attach the wrong vocabulary to the result. Fixing that provenance boundary is the necessary next step.
