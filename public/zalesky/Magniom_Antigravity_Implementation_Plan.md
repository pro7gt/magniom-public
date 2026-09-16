# Magniom Antigravity Implementation Plan

## Zalesky Informed Individualised TMS Targeting

**Repository baseline:** 569ba54caa7f281c85d460828a13a66f26898e3a  
**Previous audit baseline:** efaca6a8dfa5b1c6dab02e4ebf46a9f16b045701  
**Audience:** Antigravity engineering agent, Magniom scientific lead, clinical safety reviewer, and maintainers  
**Status:** Engineering implementation specification  
**Date:** September 2026

---

## 1. Executive decision

Commit 569ba54 is a meaningful research-layer advance. It adds Cash-Zalesky clustering, Seguin-style pathway routing, expanded circuit and source evidence, MDD policy changes, domain updates, and broader verification surfaces.

The next phase must turn those additions into a traceable, testable, and fail-closed implementation. The immediate objective is not to declare Magniom clinically ready. The immediate objective is a scientifically honest vertical slice from validated measurements to an auditable candidate target while keeping normative, synthetic, and unvalidated methods out of clinical mode.

Recommended sequence:

1. Contain clinical risk and correct scientific labelling.
2. Freeze algorithm and evidence contracts.
3. Replace synthetic imaging inputs with validated artifact adapters.
4. Implement the patient-specific functional Cash-Zalesky pathway.
5. Implement reproducibility and confidence scoring.
6. Connect outputs to the target engine and audit trail.
7. Validate structural and pathway methods in research or validation mode.
8. Add solver-backed E-field and delivery modelling.
9. Run retrospective and prospective validation before clinical promotion.

The first clinically relevant candidate should be FC_CLUSTER_PERSONALISED for MDD. Seguin-style pathway routing remains research-only until patient-specific structural inputs and independent outcome validation exist.

---

## 2. Scope

### In scope

- Cash-Zalesky individualised functional-connectivity targeting for MDD.
- Structural-connectivity targeting as a separate validation lane.
- Seguin-style normative pathway routing as a research lane.
- Evidence, citation, coordinate, atlas, and provenance governance.
- Data-origin and scientific-maturity enforcement.
- Reproducibility, stability, and confidence reporting.
- Target-engine integration, policy gates, and audit events.
- Target geometry preserving clusters, surfaces, navigation points, and uncertainty.
- E-field and neuronavigation interfaces.
- Test, benchmark, CI, release, and clinical-safety gates.

### Non-goals for the first release

- A claim that Magniom improves clinical outcomes.
- Automatic treatment prescription without clinician authority.
- Replacing measured functional MRI with structural-to-functional prediction.
- Treating a normative connectome as a patient-specific connectome.
- Clinical use of synthetic MRI, simulated tractography, or configuration-only E-field values.
- Clinical dynamic functional-connectivity targeting.
- Using NBS as a single-patient target generator.
- Expanding all indications simultaneously.

---

## 3. Current state and commit interpretation

The changed-file manifest indicates:

| Area | Main changed surfaces | Interpretation |
|---|---|---|
| Functional targeting | packages/.../algorithms/cash-zalesky-clustering.ts | Dedicated robust-clustering implementation added. |
| Pathway modelling | packages/.../algorithms/seguin-pathway-routing.ts | Structural or network-routing logic added. |
| Evidence | packages/evidence/src/seeds/circuits.ts and sources.ts | Scientific source and circuit registries expanded. |
| Policy | packages/scientific-policy/src/indications/mdd-policy.ts | MDD method eligibility or configuration changed. |
| Domain | packages/domain/src/enums.ts, measurement-bundle.ts, target-v2.ts | Domain representation extended. |
| Verification | CI, pyramid reports, conformance reports, release manifests | Reporting and release bookkeeping expanded. |
| Documentation | README.md | Project explanation updated. |

The earlier audit identified unresolved risks that must be explicitly checked against this commit:

1. Synthetic components wrote placeholder content with imaging extensions.
2. A fixed target could reach clinical mode.
3. Research-leakage gates did not recognise synthetic origin.
4. Diffusion and E-field providers were configuration-driven.
5. Evidence and code used inconsistent sgACC definitions.
6. Reliability code did not always execute the production targeting algorithm.
7. Python scientific test collection failed on a missing Any import.
8. The Python test wrapper could be fail-open when pytest was unavailable.
9. Verification reports could appear stronger than executable evidence.

This commit is therefore the foundation for the next implementation phase, not evidence of completed clinical validation.

---

## 4. Scientific architecture

Magniom should model intervention as a network-access problem:

~~~text
patient measurement bundle
  -> validated preprocessing and QC
  -> therapeutic circuit definition
  -> patient-specific FC or SC map
  -> spatial clustering and target selection
  -> reliability and confidence
  -> cortical target and navigation geometry
  -> E-field and delivery verification
  -> clinician review and auditable decision
~~~

Keep four graphs distinct:

1. Evidence graph: papers, claims, citations, coordinates, and limitations.
2. Patient measurement graph: raw and derived measurements with QC and provenance.
3. Communication graph: structural edges, functional edges, pathway costs, and routes.
4. Decision graph: algorithm versions, gates, candidates, approvals, and audit events.

A normative shortest path may inform a research hypothesis but must never be presented as a patient-specific route.

---

## 5. Maturity and data-origin model

Every algorithm and output must carry both fields.

### Data origin

~~~text
patient_measured
normative
synthetic
derived_from_patient_measured
mixed
unknown
~~~

Unknown must fail clinical qualification.

### Scientific maturity

~~~text
prototype
research
validation
clinical_candidate
clinical_approved
retired
~~~

### Initial method classification

| Method | Required data | Initial maturity | Initial clinical status |
|---|---|---|---|
| FC_CLUSTER_PERSONALISED | Patient rs-fMRI and T1 with validated preprocessing | Validation | Blocked pending gates |
| SC_CLUSTER_PERSONALISED | Patient diffusion MRI and structural QC | Validation | Research or validation only |
| NORMATIVE_PATHWAY_MODEL | Normative structural connectome | Research | Never clinical by itself |
| HYBRID_CONNECTOMIC_RESEARCH | Patient and normative modalities | Research | Never clinical initially |
| DYNAMIC_FC_RESEARCH | Time-resolved rs-fMRI | Research | Never clinical initially |
| NBS_COHORT_ANALYSIS | Cohort connectome | Research | Not a target generator |

---

## 6. Canonical contracts

### 6.1 Scientific method manifest

Create a versioned manifest at:

~~~text
scientific-config/methods/<method-id>/<version>.json
~~~

Required fields:

~~~json
{
  "methodId": "FC_CLUSTER_PERSONALISED",
  "version": "0.1.0",
  "indication": "MDD",
  "scientificMaturity": "validation",
  "permittedModes": ["research", "validation"],
  "dataOrigins": ["patient_measured", "derived_from_patient_measured"],
  "requiredModalities": ["T1", "RESTING_STATE_FMRI"],
  "atlas": "versioned atlas identifier",
  "coordinateSpace": "MNI152NLin6Asym",
  "seedDefinitionId": "MDD_SGC_CASH_2021_V1",
  "parameters": {},
  "evidenceIds": [],
  "implementationHash": "release hash",
  "limitations": [],
  "clinicalPromotionStatus": "blocked"
}
~~~

No scientific constant that changes target selection should be scattered across source files, policies, and UI configuration.

### 6.2 Measurement provenance

Every derived map must record:

- measurement and subject or dataset identifier;
- data origin;
- source file hashes;
- MIME and header validation;
- preprocessing and software versions;
- atlas and coordinate space;
- motion and QC metrics;
- parent artifact identifiers;
- operator or pipeline identity;
- creation time.

Extensions are not validation. NIfTI and GIFTI headers must be checked.

### 6.3 Target output

Replace point-only output with:

- target ID and method version;
- therapeutic circuit ID;
- candidate mask or cluster;
- representative point and medoid;
- native and standard-space coordinates;
- surface vertex and normal;
- search region;
- threshold and connectivity rule;
- confidence region;
- within-subject reliability;
- between-subject distinctiveness;
- navigation pose;
- E-field summary;
- limitations;
- evidence and provenance IDs.

The representative point is a navigation convenience, not the complete scientific target.

---

## 7. Workstream A Safety containment

**Priority:** P0  
**Duration:** Week 1  
**Dependencies:** None

### A1 Add data-origin gates

Files:

~~~text
packages/domain/src/enums.ts
packages/domain/src/measurement-bundle.ts
packages/domain/src/target-v2.ts
packages/target-engine/src/gates/v2/g14-research-leakage.ts
~~~

Tasks:

- Add dataOrigin and scientificMaturity to all relevant objects.
- Reject synthetic, unknown, or normative-only inputs in clinical mode.
- Reject a clinical slate when any parent artifact is synthetic or unverified.
- Return structured rejection reasons in the audit trail.
- Prevent a fixed fallback coordinate from becoming clinical-ready.

Acceptance:

- Synthetic input cannot produce ready_for_review in clinical mode.
- Normative-only pathway output cannot enter clinical MDD mode.
- Missing provenance causes deterministic rejection.
- Rejections are visible in the decision trace.

### A2 Reclassify methods

- FC_CLUSTER_PERSONALISED: validation or research initially.
- SC_CLUSTER_PERSONALISED: validation only.
- NORMATIVE_PATHWAY_MODEL: research only.
- A policy list cannot override a method-level clinical block.

### A3 Correct status language

Review:

~~~text
README.md
docs/verification/v2/reports/scientific-impact-report.md
docs/verification/v2/scientific-impact-report.json
~~~

Use research implementation, validation candidate, and clinician-reviewed planning output. Do not use clinically validated or treatment-ready without the corresponding evidence gate.

---

## 8. Workstream B Evidence and scientific configuration

**Priority:** P0  
**Duration:** Weeks 1-2  
**Dependencies:** Workstream A

### B1 Canonical MDD circuit registry

Files:

~~~text
packages/evidence/src/seeds/circuits.ts
packages/evidence/src/seeds/sources.ts
~~~

Record for every circuit:

- exact paper title, DOI or PMID, author, and year;
- seed centre, radius, hemisphere, atlas, and coordinate space;
- direct seed, seedmap, or atlas-region type;
- evidence class: normative, retrospective, prospective, randomized, or preprint;
- permitted maturity and modes;
- known limitations.

### B2 Resolve coordinate differences

Reconcile Fox-style, Cash-Zalesky, and bilateral or right-sided definitions. Different definitions must have different seed IDs. No source may be silently substituted.

### B3 Evidence limitations

Record that:

- functional connectivity is an indirect association;
- diffusion tractography does not prove directionality;
- normative pathways are not individual pathways;
- coordinate reproducibility does not mean millimetre-scale physiological stimulation;
- structural-to-functional prediction is not a replacement for measured rs-fMRI.

Acceptance:

- Every algorithm constant traces to a source and evidence status.
- Coordinate-space mismatch fails validation.
- Release manifests include evidence version.

---

## 9. Workstream C Imaging artifact and preprocessing substrate

**Priority:** P0  
**Duration:** Weeks 2-5  
**Dependencies:** A and B

### C1 Artifact validation

Suggested files:

~~~text
services/neurocompute/magniom_neuro/io/artifact_validator.py
services/neurocompute/magniom_neuro/io/manifests.py
~~~

Implement:

- NIfTI header, dimensionality, affine, orientation, voxel-size, and TR checks;
- GIFTI structure and coordinate checks;
- atlas-label validation;
- checksum and parent-artifact recording;
- explicit mock-artifact mode that cannot pass clinical gates.

### C2 Isolate simulation

Keep deterministic simulation for unit tests behind explicit adapters:

~~~text
mock_pipeline
research_pipeline
validation_pipeline
clinical_candidate_pipeline
~~~

The mock pipeline must emit dataOrigin=synthetic and never clinical-ready output.

### C3 Preprocessing provenance

Record:

- fMRIPrep or equivalent version;
- denoising method;
- motion correction and censoring;
- global signal regression;
- band-pass filter;
- smoothing;
- surface reconstruction;
- atlas and registration.

Acceptance:

- A valid run produces an immutable processing manifest.
- Text placeholders are rejected.
- Preprocessing changes alter the method hash or invalidate the target manifest.

---

## 10. Workstream D Cash-Zalesky functional targeting

**Priority:** P0  
**Duration:** Weeks 4-8  
**Dependencies:** B and C

### D1 Production pipeline

Suggested file:

~~~text
services/neurocompute/magniom_neuro/circuits/mdd/fc_cluster_personalised.py
~~~

Steps:

1. Load validated patient T1 and rs-fMRI.
2. Confirm coordinate space and atlas.
3. Load the versioned sgACC seed or seedmap.
4. Estimate the patient-specific sgACC-related signal.
5. Compute DLPFC connectivity.
6. Restrict to the versioned DLPFC search region.
7. Rank most negative values.
8. Apply the frozen threshold.
9. Cluster using the documented 26-neighbour or surface rule.
10. Select the largest valid cluster.
11. Compute centre of gravity and medoid.
12. Project to surface and navigation space.
13. Emit target and provenance manifests.

### D2 Avoid unstable extrema

Preserve candidate set, cluster membership, threshold, cluster size, centre, medoid, alternate clusters, and uncertainty. A single maximally negative voxel must not be the primary target.

### D3 Freeze method parameters

Freeze seed, DLPFC mask, threshold, smoothing, filtering, connectivity rule, minimum cluster, tie-breaking, transforms, and projection. Parameter changes require a new method version.

### D4 Required tests

- Known map selects expected cluster.
- Disconnected candidates do not merge.
- Ties are deterministic.
- Empty candidate set fails safely.
- Transforms preserve expected location.
- Threshold changes require method-version change.
- Synthetic input is labelled and clinically blocked.

---

## 11. Workstream E Reliability and confidence

**Priority:** P0  
**Duration:** Weeks 6-9  
**Dependencies:** D

### E1 Exact-algorithm reliability

Reliability code must call the production function with identical seed, mask, preprocessing, threshold, clustering, and tie-breaking. Do not use a proxy vertex range or a different seed signal.

Suggested file:

~~~text
services/neurocompute/magniom_neuro/reliability/target_reliability.py
~~~

### E2 Metrics

Report:

- test-retest displacement;
- split-half displacement;
- cluster overlap;
- surface distance;
- target connectivity sign consistency;
- between-subject separation;
- between/within variance ratio;
- acquisition-duration sensitivity;
- preprocessing and motion sensitivity;
- atlas and registration sensitivity.

### E3 Confidence status

Use:

~~~text
reliable
conditionally_reliable
unstable
not_estimable
~~~

An unstable target must be blocked or escalated, not presented as a precise coordinate.

---

## 12. Workstream F Target-engine and product integration

**Priority:** P0  
**Duration:** Weeks 8-11  
**Dependencies:** A, D, and E

### F1 Trace the runtime path

Document and test:

~~~text
measurement bundle
  -> neurocompute job
  -> circuit result
  -> target-v2 object
  -> slate and ranking
  -> qualification gates
  -> clinician review
~~~

The algorithm must be reachable from the actual runtime path, not only imported as an unused module.

### F2 Preserve comparators

MDD slates should show:

- conventional anatomical baseline;
- FC individualised cluster candidate;
- SC individualised cluster candidate;
- normative pathway research candidate.

Each candidate must retain independent provenance and status.

### F3 Clinician authority

Record selected and rejected candidates, reasons, tolerability considerations, contraindications, geometry reviewed, operator, software version, evidence version, and approval time.

---

## 13. Workstream G Structural-connectivity targeting

**Priority:** P1  
**Duration:** Weeks 10-14  
**Dependencies:** B, C, and F

Implement:

- diffusion preprocessing;
- susceptibility and eddy-current correction;
- versioned MRtrix tractography;
- SIFT2 or equivalent weighting;
- seed and target definitions;
- DLPFC search mask;
- structural connectivity map;
- clustering and centroid;
- tractography QC and failures.

Initial status is validation or research. Clinical promotion requires repeated-scan reliability, tractography sensitivity analysis, independent implementation or dataset, and outcome association in independent cohorts.

---

## 14. Workstream H Seguin-style pathway routing

**Priority:** P1  
**Duration:** Weeks 12-15  
**Dependencies:** B, C, and G

### H1 Formal graph model

Define node set, atlas, edge meaning, zero-edge handling, cost transform, directed versus undirected assumptions, shortest-path algorithm, hop count, weighted cost, alternate paths, and uncertainty.

### H2 Separate graph origins

Normative pathway output must carry:

~~~text
dataOrigin=normative
scientificMaturity=research
clinicalPromotionStatus=blocked
~~~

Patient-specific pathways must not inherit normative confidence.

### H3 Research outputs

Report shortest path, hops, weighted cost, intermediate nodes, edge confidence, alternatives, atlas, connectome source, threshold sensitivity, and tractography limitations. The output explains a research hypothesis; it does not prove causal propagation.

---

## 15. Workstream I E-field and neuronavigation

**Priority:** P1  
**Duration:** Weeks 13-17  
**Dependencies:** F and target geometry

### I1 E-field interface

Accept individual surfaces, coil model, coil pose, target cluster, intensity, scalp-to-cortex depth, avoidance regions, and solver configuration.

Return peak field, target coverage, off-target exposure, depth, mesh quality, solver version, convergence, and artifact hashes.

### I2 No configuration-only clinical E-field

Configuration-derived values may support fixtures but must be labelled estimated or synthetic and blocked from clinical qualification.

### I3 Navigation verification

Record registration method, coil pose, position and angular deviation, head-motion correction, target transform, and operator confirmation.

---

## 16. Workstream J CI and release verification

**Priority:** P0  
**Duration:** Weeks 1-17 and ongoing

### Test layers

| Layer | Purpose | Status |
|---|---|---|
| Unit | Mathematical and domain invariants | Blocking |
| Contract | Schema and provenance compatibility | Blocking |
| Scientific fixture | Known maps, clusters, transforms, and routes | Blocking |
| Pipeline | Measurement through target output | Blocking for validation |
| Policy | Mode, origin, and maturity gates | Blocking |
| Reliability | Repeatability and sensitivity | Blocking for promotion |
| Integration | Target engine and audit path | Blocking |
| External replication | Independent data or implementation | Required for clinical candidate |

### Fail-closed requirements

CI fails when:

- pytest or required dependencies are unavailable;
- scientific tests cannot be collected;
- an artifact is invalid;
- provenance is missing;
- a report claims an unexecuted result;
- a clinical policy test is skipped;
- generated reports are stale;
- method hash differs from implementation.

Fix the known missing Any import in:

~~~text
services/neurocompute/magniom_neuro/surfaces/gifti.py
~~~

Make the scientific test command return non-zero when pytest is unavailable.

Every report should include source commit, command, environment lock, test and skip counts, fixture or dataset IDs, timestamp, and report hash.

---

## 17. Workstream K Data and benchmark plan

**Priority:** P0  
**Duration:** Weeks 2-18

| Tier | Data | Use |
|---|---|---|
| 0 | Deterministic mathematical fixtures | Unit and contract tests |
| 1 | De-identified normative imaging | Pipeline and reliability development |
| 2 | Independent reference data | External replication |
| 3 | Clinical retrospective cohorts | Outcome association |
| 4 | Prospective clinical study | Effectiveness and safety |

Record data license, de-identification, preprocessing permission, atlas, coordinate space, subject and scan counts, criteria, leakage controls, and preregistration where applicable.

Benchmarks must report target coordinates, clusters, reliability, failure rates, processing time, missing-data behavior, disagreement with references, and clinical-mode eligibility.

---

## 18. Workstream L Documentation

Create:

~~~text
docs/science/method-manifest-template.md
docs/science/mdd-fc-cluster-method.md
docs/science/mdd-sc-cluster-method.md
docs/science/seguin-pathway-method.md
docs/science/coordinate-and-atlas-policy.md
docs/science/reliability-protocol.md
docs/clinical/clinical-promotion-gates.md
docs/engineering/target-provenance-contract.md
docs/engineering/antigravity-execution-guide.md
~~~

Each method document must state its question, inputs, steps, parameters, evidence, limitations, maturity, permitted modes, reproducibility requirements, failure behaviour, and non-claims.

---

## 19. Delivery roadmap

| Period | Milestone | Outcome |
|---|---|---|
| Week 1 | Safety containment | Synthetic and normative-only clinical inputs blocked |
| Weeks 1-2 | Evidence freeze | Canonical circuits, coordinates, atlases, citations |
| Weeks 2-5 | Artifact substrate | Validated inputs and immutable provenance |
| Weeks 4-8 | FC vertical slice | Patient-measured FC cluster target |
| Weeks 6-9 | Reliability | Exact-algorithm repeatability and confidence |
| Weeks 8-11 | Engine integration | Candidates, ranking, gates, audit |
| Weeks 10-14 | SC validation | Patient diffusion target candidate |
| Weeks 12-15 | Pathway research | Normative and patient route separation |
| Weeks 13-17 | E-field interface | Solver and pose verification contract |
| Week 18 | Validation release review | Evidence ledger and unresolved risks |

This is an engineering validation release, not clinical clearance.

---

## 20. Antigravity execution protocol

### Before coding

1. Read relevant source, tests, policy, and manifests.
2. Classify the task as scientific, provenance, policy, or plumbing.
3. Find method and evidence IDs.
4. Add acceptance tests first.
5. State permitted modes and data origin.

### While coding

- Keep computation separate from policy and presentation.
- Do not add scientific constants without a manifest and citation.
- Do not use fallback coordinates in clinical mode.
- Preserve raw and derived lineage.
- Make tie-breaking deterministic.
- Return structured failures.
- Keep normative and patient-specific graphs distinct.
- Avoid unrelated refactors.

### Completion report

Antigravity must report files changed, tests, commands, results, method and evidence versions, data-origin behaviour, clinical-mode behaviour, limitations, and follow-up work.

### Stop conditions

Stop for scientific review when:

- a source or coordinate is ambiguous;
- papers conflict;
- a normative method is being promoted;
- a clinical claim lacks evidence;
- real imaging is unavailable for a clinical output;
- tests would need weakening;
- reports and executable results disagree.

---

## 21. Acceptance gates

### Gate 1 Scientific identity

- Unique method ID and version.
- Every constant traces to a source.
- Atlas and coordinate space are explicit.

### Gate 2 Data truthfulness

- File content, not extension, is validated.
- Synthetic and normative data are propagated.
- Clinical mode fails on synthetic or unknown origin.

### Gate 3 Algorithm correctness

- Fixtures produce expected clusters and routes.
- Empty and low-quality inputs fail safely.
- Fixed inputs and versions are deterministic.

### Gate 4 Reliability

- Production target function is used for reliability.
- Reliability is available per target.
- Unstable targets are blocked or escalated.

### Gate 5 Integration

- Method is reachable through the target engine.
- Candidates retain provenance.
- Clinician approval remains required.

### Gate 6 Independent validation

- Independent data or implementation reproduces the method.
- Performance and failure rates are reported.
- Internal fixtures are insufficient for promotion.

### Gate 7 Clinical-candidate review

- Scientific, clinical, and safety reviewers sign off.
- Release manifest lists unresolved risks.
- Clinical status is not inferred from test pass rate alone.

---

## 22. Risk register

| Risk | Mitigation | Owner |
|---|---|---|
| Synthetic artifact reaches clinical mode | Mandatory origin gate and header validation | Platform and safety |
| Normative route presented as patient-specific | Separate graph, maturity, and output types | Scientific lead |
| Coordinate inconsistency | Canonical seed and atlas manifests | Evidence lead |
| Single-voxel noise | Cluster target and reliability gate | Algorithm lead |
| Reliability uses another algorithm | Shared production function | Neurocompute lead |
| Configuration-only E-field | Solver-backed artifacts and status labels | Physics lead |
| Stale verification reports | Source-commit and report-hash checks | Release lead |
| Missing pytest or dependencies | Non-zero collection checks | CI lead |
| Point output hides uncertainty | Full target geometry contract | Product and clinical |
| Overclaiming evidence | Citation and limitation registry | Scientific lead |

---

## 23. Suggested backlog

| ID | Task | Priority | Depends on |
|---|---|---:|---|
| MAG-SAFE-001 | Add dataOrigin and scientificMaturity | P0 | None |
| MAG-SAFE-002 | Block synthetic and unknown clinical inputs | P0 | SAFE-001 |
| MAG-SAFE-003 | Reclassify new algorithms | P0 | SAFE-001 |
| MAG-EVID-001 | Canonical MDD seed registry | P0 | None |
| MAG-EVID-002 | Coordinate and atlas reconciliation | P0 | EVID-001 |
| MAG-EVID-003 | DOI and PMID verification | P0 | EVID-001 |
| MAG-IO-001 | NIfTI and GIFTI content validation | P0 | SAFE-001 |
| MAG-IO-002 | Immutable measurement provenance | P0 | IO-001 |
| MAG-FC-001 | Production FC target function | P0 | EVID-001, IO-002 |
| MAG-FC-002 | Cluster and centroid contract | P0 | FC-001 |
| MAG-REL-001 | Exact-algorithm split-half reliability | P0 | FC-001 |
| MAG-REL-002 | Test-retest and between-subject reports | P0 | REL-001 |
| MAG-ENG-001 | Wire FC method into target engine | P0 | FC-002, REL-002 |
| MAG-ENG-002 | Clinician audit integration | P0 | ENG-001 |
| MAG-SC-001 | Patient diffusion adapter | P1 | IO-002 |
| MAG-SC-002 | SC clustering and tractography QC | P1 | SC-001 |
| MAG-PATH-001 | Formal pathway graph contract | P1 | EVID-001 |
| MAG-PATH-002 | Normative pathway research output | P1 | PATH-001 |
| MAG-EFIELD-001 | E-field solver interface | P1 | ENG-001 |
| MAG-EFIELD-002 | Navigation pose verification | P1 | EFIELD-001 |
| MAG-CI-001 | Make Python collection fail closed | P0 | None |
| MAG-CI-002 | Add report source hash | P1 | CI-001 |
| MAG-VAL-001 | Independent dataset benchmark | P1 | FC, REL, CI |
| MAG-VAL-002 | Clinical-candidate review package | P2 | VAL-001, EFIELD-002 |

---

## 24. Definition of done for the first validation release

The release is complete only when:

- FC_CLUSTER_PERSONALISED runs on validated patient-measured or approved research data.
- The target is cluster-derived, not an unexplained fixed coordinate.
- Primary targeting and reliability use the exact same function.
- Every artifact has source hashes, processing provenance, coordinate space, and method version.
- Synthetic, normative-only, missing, and invalid inputs cannot produce clinical-ready output.
- MDD policy and method manifests agree on maturity and permitted modes.
- The target engine ranks the method beside a conventional comparator.
- A clinician can inspect cluster, point, alternatives, reliability, and limitations.
- SC and pathway methods are visibly separated from the FC candidate lane.
- E-field and navigation outputs identify solver and verification status.
- TypeScript and Python scientific tests run and fail closed in CI.
- Reports are generated from the exact reviewed commit and environment.
- Independent validation work has explicit acceptance criteria and an owner.

---

## 25. Final recommendation

Proceed with the direction introduced by commit 569ba54, but keep the release conservative:

1. Make Cash-Zalesky FC clustering the first complete vertical slice.
2. Keep Seguin-style pathway routing research-only until patient-specific validation exists.
3. Make provenance and maturity executable safety controls.
4. Preserve a conventional comparator.
5. Do not use verification reports as a substitute for executable evidence.
6. Do not promote any method to clinical mode until all gates pass and independent reviewers approve.

The intended end state is an evidence-traceable, reliability-qualified network target that supports clinician judgment. It is not merely a more precise coordinate, and it is not a claim that connectomics alone determines the correct treatment.

