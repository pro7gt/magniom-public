Review of Magniom commit 60f5b87

Verdict: this is a genuine improvement over cca6b59, particularly around clinical isolation and artifact provenance. However, it remains unsafe for production deployment because authentication still contains two critical vulnerabilities and candidate provenance is being misrepresented across clinical plugins.

Reviewed commit: 60f5b871455542d6b836cc381f8e4a37c16ebc6c

It is correctly based directly on cca6b59385b4ba8f3683cc4d25f5e20f8f6db4c8.

What this commit successfully fixed
Previous problem	Status
Client-side offline authentication fallback	Fixed
Non-HttpOnly session cookie	Fixed
Static session-secret fallback outside tests	Mostly fixed
Tokens without expiry, issuer, audience or secure ID	Fixed
Synthetic MDD FC candidate available in clinical mode	Fixed
MDD SC candidate available in clinical mode	Fixed
Missing candidate provenance allowed through G14	Fixed
Disconnected FC voxels merged into a fabricated cluster	Fixed
Missing surface coordinates replaced with a default coordinate	Fixed
File format automatically treated as patient-measured	Fixed
Superficial GIFTI marker validation	Improved
Fabricated preprocessing defaults	Fixed
Mutable provenance dataclasses	Partly fixed
Evidence-ID mismatches	Fixed
Manifest hashes not matching selected files	Fixed mechanically
Cash paper’s journal attribution	Fixed
FC threshold documentation	Improved

The MDD FC generator is now explicitly synthetic, validation-stage and blocked, and it returns no candidate in clinical mode. That is the correct temporary containment strategy.

Release-blocking findings
1. Public default production credentials still exist

apps/web/src/lib/server/auth-credentials.ts:94–103 falls back to:

dr_asmith
ClinicalPrecision2026!

Although the comments say these are development/test defaults, the code applies them regardless of environment. isDevOrTest is calculated only later and does not control those two fallbacks.

Therefore, if production credential variables are missing, the publicly documented credentials work.

Required correction: production must fail startup unless both credentials—or preferably an external identity provider—are configured. Development defaults must be guarded by an explicit test/development branch.

2. The HttpOnly token is still exposed to JavaScript

The cookie is now HttpOnly, but the login endpoint also returns the complete session, including sessionToken, in its JSON response:

apps/web/src/app/api/auth/login/route.ts:54–74

The client then stores that response in local storage:

apps/web/src/lib/auth-store.ts:167–171

This defeats the principal purpose of an HttpOnly cookie. An XSS payload can read the bearer token from local storage.

The client session type should not contain sessionToken, and /api/auth/login should return only a sanitized display session. The bearer token should exist exclusively in the HttpOnly cookie.

3. Live bearer tokens can enter audit logs

The logout route records the complete cookie token:

apps/web/src/app/api/auth/logout/route.ts:12–17

The client store can also place priorSessionToken in audit metadata:

apps/web/src/lib/auth-store.ts:234–242

Because logout does not revoke the token server-side, a token copied from logs remains valid until expiration—potentially 30 days.

Audit only a one-way hash of jti, never the bearer token or signature.

4. Clinical baselines are falsely labelled patient-measured

The fixed MDD targets (-44, 40, 28) and (0, 30, 36) declare:

dataOrigin: 'patient_measured'
reliedOnMeasurementIds: []

These are evidence-derived fixed coordinates, not patient measurements. The same pattern was added to OCD, PTSD, pain, stroke, TBI and other plugins.

This appears to make evidence baselines pass G14’s patient-origin allowlist, but it corrupts the provenance model.

Magniom needs separate concepts:

Field	Meaning
targetDefinitionOrigin	Guideline, trial, normative atlas, patient-derived or synthetic
inputDataOrigin	Patient-measured, derived patient data, normative or synthetic
clinicalApprovalStatus	Whether the method may be used clinically
patientPersonalizationStatus	Fixed, anatomically transformed or individually computed

A guideline-approved fixed target may be clinically permitted without pretending that it was patient-measured.

High-priority defects
5. Client authentication state remains locally forgeable

auth-store.ts loads any apparently authenticated object from local storage. If /api/auth/session is unreachable, the exception handler retains that cached session.

Middleware still protects server requests, so this is not the previous full server bypass. However, the client can display a false authenticated state and potentially expose client-cached clinical UI state.

The client should initialize as unknown/loading and become authenticated only after /api/auth/session confirms the HttpOnly cookie.

6. No server-side session revocation

Sessions remain stateless HMAC tokens. Logout deletes the current browser cookie but does not invalidate a stolen token.

This is particularly problematic for rememberMe, which creates a 30-day token.

Introduce a server-side session record keyed by jti, including:

user and organization;
issued and expiry times;
revocation state;
authentication assurance level;
last activity;
key version.
7. Open redirect after login

apps/web/src/app/login/page.tsx:74–75 accepts any redirect that does not begin with /login, then calls:

window.location.replace(redirectTarget)

A value such as //malicious.example passes the check and causes cross-origin navigation.

Permit only same-origin absolute paths beginning with exactly one /.

8. G14 still has measurement-provenance holes

Candidate-level missing fields now fail closed, which is good. But G14 does not reject all unsafe measurement conditions:

missing measurement-bundle origin;
normative or mixed bundle origin;
missing individual measurement origin;
normative or mixed relied-on measurements;
relied-on measurement IDs that do not resolve;
derived_from_patient_measured without verified lineage.

The gate should verify that every relied-on ID resolves and that each complete derivation chain terminates in trusted patient acquisition records.

It should also obtain method maturity and approval from an immutable method registry, rather than trusting fields supplied by the candidate generator itself.

9. Reliability engine crashes on a valid fail-closed result

The FC algorithm now correctly returns status="no_qualifying_cluster" with null targets. However, ExactTargetReliabilityEngine immediately calculates a distance between the resulting null centroids.

I reproduced:

TypeError: 'NoneType' object is not subscriptable

The reliability engine should return:

confidence_status = not_estimable
recommendation = no qualifying cluster in one or both partitions

A unit test needs to cover this exact case.

10. Disconnected pathways are reported as maximally efficient

findShortestPath represents an unreachable target as:

path: []
hops: 0
totalCost: Infinity

computePathwayCommunicationScore includes those zero hops in the average.

I reproduced a completely disconnected two-node graph producing:

{
  "averageHops": 0,
  "dominantPathway": [],
  "predictedEfficiencyRank": 10
}

This is the opposite of the correct interpretation: no communication path becomes maximum predicted efficiency.

Unreachable paths must either:

fail the score as not_estimable; or
be excluded, with coverage and unreachable-pair counts reported.

The code also still assigns the nearest parcel when none is within 15 mm, despite the updated documentation explicitly saying that this situation fails closed.

11. Structural-method hash verification creates false assurance

The new hash verifier is a good governance addition, and the configured hashes now match their mapped files.

However:

SC_CLUSTER_PERSONALISED:
  packages/target-engine/src/algorithms/cash-zalesky-clustering.ts

The SC manifest therefore “verifies” against the FC clustering implementation. There is still no real patient diffusion/tractography SC implementation.

Each method manifest must map to its actual executable entry point. If no implementation exists, the manifest should declare implementationStatus: not_implemented and must not possess an implementation hash.

Remaining scientific limitations
FC method fidelity

The implementation remains a cluster-selection scaffold, not the complete Cash–Zalesky pipeline:

the group seedmap signal is documented but not constructed;
selecting seedType: group_seedmap mainly changes the threshold;
Python receives a precomputed seed time series without provenance;
Fisher transformation is documented but not applied;
the canonical output remains an absolute-connectivity-weighted centroid;
Cash’s unweighted cluster centre of gravity is computed only as an auxiliary value;
preprocessing and acquisition-duration requirements are not enforced by the algorithm;
TypeScript and Python remain separate implementations;
no real measurement artifact feeds the runtime MDD generator.

The method should currently be described as a Cash-inspired validation implementation, not an exact validated reproduction.

Parameter validation

Neither implementation robustly validates:

0 < thresholdPercentile <= 1;
positive minimum cluster size;
unique voxel/vertex identifiers;
complete adjacency coverage;
time-series length consistency;
finite connectivity values;
valid coordinate values.

For example, a threshold greater than one can produce an out-of-range access.

Artifact validation

The validator is materially better, but still has limitations:

undeclared coordinate space still defaults to MNI;
compressed NIfTI payload length is not validated;
small valid compressed NIfTI files may fail the pre-decompression size check;
datatype/bitpix compatibility and vox_offset are not adequately checked;
two-file ni1 NIfTI handling is not correct;
GIFTI accepts an empty DataArray without validating payload, dimensions or intent;
declared_origin is a plain caller-supplied string, not a trusted ingestion attestation.

Frozen dataclasses are also not deeply immutable because source_artifacts remains a mutable list.

Evidence overstatement

The source registry describes the 2026 Li trial as a “pivotal” RCT demonstrating superiority of both SC- and FC-guided targeting.

That is too categorical. The attached paper supports a more qualified statement:

SC superiority at the primary two-week assessment;
both SC and FC differences at six weeks;
no statistically significant group difference at 12 weeks;
one single-centre trial requiring replication.

The registry should represent timepoint-specific results rather than compressing them into a universal superiority claim.

Verification results
Verification	Result
Production build	15/15 packages passed
Type checking	27/27 tasks passed
Full JS/TS package tests	28/28 tasks passed
Actual JS/TS assertions	1,010 passed
Targeted auth/science tests	56/56 passed
New targeted Python tests	11/11 passed
Manual manifest evidence-ID check	Passed
Manual mapped implementation-hash check	Passed
Manifest verifier command	Could not execute because tsx IPC is blocked in this environment
Full Python discovery	Not completed; an integration test remained long-running
Additional adversarial checks	Found two untested runtime failures described above

The test suite is healthy in breadth, but the two adversarial failures demonstrate that passing tests still do not cover critical fail-closed transitions.

Recommended next commit
P0: authentication
Remove production credential defaults.
Remove sessionToken from all JSON responses and client types.
Stop persisting authenticated session objects in local storage.
Add server-side jti revocation.
Remove bearer tokens from audit events.
sanitize login redirects.
require a sufficiently strong secret during actual application startup.
Replace canonical single-user identity with a proper identity provider or credential store.
P0: provenance
Split target-definition origin from patient-input origin.
Reclassify every fixed evidence baseline accurately.
Require G14 to resolve complete measurement and transformation lineage.
Obtain maturity and approval from the method registry, not generator assertions.
P1: algorithm correctness
Handle no_qualifying_cluster in the reliability engine.
Fail pathway scoring on disconnected graphs.
Remove nearest-parcel fallback or expose it explicitly as an invalid mapping.
Enforce graph dimensions, normalized positive weights and hop limits.
Add parameter validation to both FC implementations.
Create an actual SC implementation before hashing or advertising it.
Decide whether weighted centroid, unweighted centre of gravity or cortical medoid is canonical.
Build one reference implementation and parity-test every secondary implementation against frozen outputs.
Merge recommendation
Production/clinical deployment: No.
Network-accessible research deployment: No, until authentication defects are fixed.
Internal research branch: Reasonable, provided no real patient data is present.
Scientific progress: Strong improvement in containment and governance, but still a validation scaffold rather than an integrated patient-specific targeting pipeline.

The commit’s strongest achievement is that synthetic FC/SC targeting can no longer leak directly into clinical execution. Its most important remaining architectural problem is that G14’s strict provenance rules have encouraged fixed evidence targets to be falsely labelled patient-measured. That data-model problem should be corrected before adding more targeting methods.
