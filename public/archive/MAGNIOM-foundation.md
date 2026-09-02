Yes. There is a scientifically defensible product here, but I would change one part of the premise:

> **The software should not “choose five TMS targets.” It should construct a ranked, evidence-traceable five-target candidate slate for specialist review: up to 3 primary candidates + up to 2 alternatives.**

It must also be permitted to return **one target, two targets, or “insufficient evidence to nominate a personalised target.”** Forcing five targets would create false precision.

I would provisionally call the platform **RenovaTarget**: a clinician-facing **Connectome-Informed TMS Target Decision Support System**.

## 1. Scientific baseline: where the field actually is in September 2026

The central scientific proposition is now credible: TMS effects are network-dependent, individual functional anatomy varies, and target location can influence symptom-level outcomes. What is **not** yet established is that individual rs-fMRI targeting is universally superior to conventional targeting, or that selecting the most abnormal functional-connectivity parcels and stimulating them necessarily improves outcomes.

That distinction should define the product.

### Current evidence landscape

| Approach / group                              | What has been shown                                                                                                                                                                                                                                                 | What it does **not** yet establish                                                                                            |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Stanford / Nolan Williams — SNT/SAINT**     | Individual left-DLPFC target selected for strong negative connectivity with sgACC, combined with intensive accelerated iTBS. Small double-blind RCT showed a large active-vs-sham antidepressant effect. ([PubMed][1])                                              | That individual sgACC targeting itself caused the entire advantage; schedule, pulse dose and targeting were changed together. |
| **Fox / Siddiqi / MGB-Brigham circuit work**  | Retrospective circuit mapping identified different prefrontal circuits associated with dysphoric vs anxiosomatic symptom improvement; a 2026 prospective head-to-head study of 40 patients supported differential symptom effects from those targets. ([PubMed][2]) | A complete validated transdiagnostic target atlas for arbitrary symptoms.                                                     |
| **MGB 2026 connectivity-vs-scalp aTMS trial** | In a small randomized trial of 40 participants, individualized connectivity targeting produced greater antidepressant improvement than Beam F3 targeting; authors explicitly call for a confirmatory efficacy trial. ([PubMed][3])                                  | Definitive superiority across standard TMS or broader populations.                                                            |
| **2026 three-arm FC/structural/5-cm RCT**     | 123 randomized participants: structural-connectivity targeting outperformed 5-cm at week 2; both structural and functional targeting were better at week 6; differences disappeared by week 12. ([PubMed][4])                                                       | Simple universal superiority of individual rs-fMRI targeting.                                                                 |
| **BRIGhTMIND, 2024, five centres**            | 255 participants: connectivity-guided insula→DLPFC iTBS and MRI-neuronavigated conventional F3 rTMS both produced durable improvement to 26 weeks, with **no significant difference** between groups. ([PubMed][5])                                                 | That connectivity guidance reliably improves outcome over a good standard target.                                             |
| **2025 personalised-rTMS meta-analysis**      | 10 randomized active-controlled trials, 647 patients: no significant overall superiority of personalised over fixed targeting. ([ScienceDirect][6])                                                                                                                 | A basis for marketing personalised targeting as clinically superior in general.                                               |
| **Elbau/Liston/Downar et al.**                | In 295 patients, better stimulation-site sgACC connectivity correlated weakly but robustly with antidepressant response when actual stimulation cortex was estimated using electric-field modelling. ([PubMed Central (PMC)][7])                                    | Connectivity alone as a strong individual response predictor.                                                                 |
| **2026 precision-network review**             | Multimodal connectivity targeting is biologically compelling, but overall clinical superiority remains mixed; circuit selection, dose and schedule may matter as much as the fact that targeting is “personalised.” ([PubMed][8])                                   | A clinically settled personalised-targeting standard.                                                                         |

That evidence tells us something important about the software architecture:

> **The connectome must modify an evidence-based clinical hypothesis; it must not create the clinical hypothesis by itself.**

---

# 2. What Cingulum Health contributes

Cingulum is particularly relevant because its published approach is closer to your proposed product than Stanford's single personalised DLPFC target.

The published **Cingulum Framework** uses individual T1 + resting-state fMRI, HCP Multimodal Parcellation 1.0, and a personalised 377-region model—180 cortical parcels per hemisphere plus 17 subcortical structures. It calculates 142,129 pairwise relationships and compares the individual's connectivity with a normative dataset of 200 healthy controls using tangent-space connectivity. Connectivity lying more than three standard deviations outside the normative range is treated as anomalous after the highest-variance third of parcel pairs is excluded. ([PubMed Central (PMC)][9])

The published target-selection concept is essentially:

**clinical symptom/network hypothesis → individual abnormal connectivity → accessible abnormal cortical parcel → neuronavigation target.**

Their 2025 safety paper describes the anomaly matrix being filtered according to large-scale networks relevant to symptoms, followed by examination of whether candidate parcels are physically accessible to the TMS coil before transfer to neuronavigation. ([Cambridge University Press][10])

In the published MDD cohort, they typically used multiple targets, with **three being both the common and maximum number**, excluded targets more than 30 mm from the scalp, and sequentially stimulated selected sites in accelerated TBS sessions. ([Wiley Online Library][11])

That is highly relevant to your proposed “3 + 2” model.

But the evidence needs careful calibration.

Cingulum's 2023 depression study involved 26 patients and reported impressive outcomes—62% met its remission criterion immediately after treatment—but it was retrospective, uncontrolled and had only 19 follow-up participants. The authors appropriately described it as safety/proof-of-concept work. ([PubMed Central (PMC)][9])

Their anxiety work involved 28 patients with medically refractory anxiety and high rates of psychiatric comorbidity. Abnormal DMN/CEN connectivity was used to identify targets, particularly HCP parcels 8Av and PGs, and symptoms improved—but it was again proof-of-concept rather than randomized efficacy evidence, with substantial follow-up attrition. ([PubMed][12])

Their 2024 affective-disorder series similarly associated multi-target parcel-guided treatment with improvements in sleep, depression, anxiety and quality of life in 27 patients, but again used a retrospective design. ([PubMed][13])

The 2025 safety study is more substantial: **165 patients / 202 target sets**, with no serious adverse events reported; fatigue, muscle twitching, headache and discomfort were the main transient effects. That supports the feasibility and tolerability of stimulating a broader range of connectome-selected cortical parcels. It does **not**, however, prove efficacy or superiority of multi-target targeting. ([PubMed][14])

### The part of Cingulum I would _not_ reproduce as a hard rule

Their anxiety methodology used hyperconnectivity to select cTBS and hypoconnectivity to select iTBS. ([PubMed][12])

That is an interesting hypothesis, but I would **not encode “hyperconnected → inhibit / hypoconnected → excite” as an automatic treatment rule**.

The familiar idea that iTBS is excitatory and cTBS inhibitory comes largely from motor-cortex physiology; interindividual effects are highly variable and non-motor cortical physiology is less predictable. Reviews explicitly note that iTBS is not always facilitatory and cTBS is not always inhibitory. ([PubMed][15])

That should remain a research annotation, not a deterministic production rule.

---

# 3. The biggest technical problem: rs-fMRI targeting is surprisingly fragile

This is arguably the most important engineering issue.

A 2026 analysis of SNT-style targeting found that changing preprocessing pipelines could shift the calculated individual target by **1.45–3.82 cm on average**, with individual deviations up to **6.14 cm**. The same study suggested target stability plateaued at around 12 minutes of rs-fMRI in its datasets. ([PubMed][16])

Another modelling study concluded that approximately **28 minutes** of rs-fMRI plus spatial clustering was required for stable individual FC targets below roughly the spatial resolution of TMS. ([PubMed][17])

By comparison, Cingulum's published MDD acquisition used an **8-minute resting-state run**. ([Wiley Online Library][11])

This does not invalidate their approach. It means your software needs something the existing clinical literature often lacks:

# a target reliability score.

A coordinate should never appear merely because an algorithm can calculate one.

---

# 4. Proposed product

## RenovaTarget

**A clinician-facing platform that synthesises clinical phenotype, symptom-specific circuit evidence and individual functional connectomics into a ranked slate of TMS target hypotheses.**

It should output:

**Primary candidate 1**
**Primary candidate 2**
**Primary candidate 3**

plus:

**Alternative candidate A**
**Alternative candidate B**

But every candidate gets an explicit **confidence/evidence grade**, and the software can suppress candidates where confidence is inadequate.

The app does **not** prescribe treatment.

The specialist makes the final target and protocol decision.

---

# 5. Three independent layers must drive the target recommendation

This is the conceptual heart of the system.

### Layer A — Clinical Evidence

What targets have actually demonstrated clinical efficacy for this indication, symptom or functional deficit?

For example, in depression this might include the conventional depression circuit / left-DLPFC family and sgACC-connected targets.

For OCD it would contain different evidence.

For motor rehabilitation, pain, aphasia or tinnitus it changes again.

This is the strongest layer.

### Layer B — Symptom Circuit

What circuits have evidence of producing improvement in the patient's dominant symptoms?

This creates a **transdiagnostic phenotype layer**.

Examples might eventually include:

**dysphoria / anhedonia**

**anxiosomatic symptoms**

**rumination**

**cognitive control**

**motor impairment**

**language production**

**neuropathic pain**

**compulsivity**

But the software must differentiate:

**prospectively validated**

from

**retrospectively associated**

from

**hypothesis-level** mappings.

The Siddiqi/Fox work is particularly important here because their symptom-specific depression circuits were originally discovered retrospectively and have now received small prospective causal support. ([PubMed][2])

### Layer C — Individual Connectome

Does this patient's connectome provide individual evidence that one accessible node within the relevant circuit is abnormal or particularly well connected to the therapeutic network?

This is where rs-fMRI personalisation enters.

The key is:

> **The MRI chooses where within a clinically defensible circuit—not what disorder the patient has or what treatment the evidence supports.**

That is a much safer scientific proposition.

---

# 6. The five-target slate

I would not simply take the five highest numeric scores.

The targets should have different roles.

| Position                                            | Function                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **Primary 1 — Evidence Anchor**                     | Strongest indication/protocol-backed target that also fits the patient's anatomy/network                  |
| **Primary 2 — Symptom Circuit**                     | Strongest target for the patient's highest-weight unresolved symptom cluster                              |
| **Primary 3 — Connectome Refinement**               | Most compelling patient-specific accessible cortical node within an evidence-supported network            |
| **Alternative A — Network Alternative**             | Second anatomically or connectomically suitable node serving approximately the same therapeutic objective |
| **Alternative B — Comorbidity / Functional Target** | Candidate addressing an important secondary clinical objective where evidence justifies consideration     |

This solves a major problem with purely anomaly-driven selection:

five abnormal parcels may all represent essentially the same network abnormality.

The software should prefer **clinical coverage and orthogonality**, not merely large z-scores.

---

# 7. Target ranking model

For the first version I would use **transparent multi-criteria decision analysis**, not black-box machine learning.

An illustrative development score could contain:

| Dimension                      | Relative importance |
| ------------------------------ | ------------------: |
| Clinical evidence strength     |           Very high |
| Symptom/circuit concordance    |                High |
| Patient connectome concordance |                High |
| Target reliability             |                High |
| E-field/accessibility          |       Moderate-high |
| Functional-goal relevance      |            Moderate |
| Cross-target redundancy        |             Penalty |
| Conflicting evidence           |             Penalty |

I would avoid hard-coding the exact final weights as scientific truth.

The early system could start with configurable weights, version them, and prospectively validate them.

Conceptually:

**Target Utility = Evidence × Clinical Fit × Patient-Specific Network Fit × Reliability × Stimulatability**

with hard safety gates applied before ranking.

This is preferable to additive scoring because a target with excellent connectivity but very poor evidence should not rise to the top simply by accumulating points elsewhere.

---

# 8. Hard evidence ceilings

Every candidate needs a ceiling.

For example:

**Tier A — Established / protocol-backed**
Can become Primary 1.

**Tier B — Replicated controlled symptom/network evidence**
Can become Primary 1–3.

**Tier C — Retrospective / observational / proof-of-concept**
Can become Primary only with prominent uncertainty or usually Alternative.

**Tier D — mechanistic hypothesis only**
Research view only.

That prevents a beautiful individual fMRI anomaly from outranking a clinically validated target.

---

# 9. Imaging pipeline

The imaging component should be deterministic and version-locked.

The pipeline should be approximately:

**DICOM → BIDS → structural reconstruction → rs-fMRI preprocessing → individual parcellation → functional connectivity → normative modelling → circuit analysis → reliability estimation → accessible cortical candidates → electric-field modelling → target coordinates.**

I would support two input modes.

### V1 — Connectome Ingest Mode

The platform ingests an already processed functional-connectomics dataset from an external validated platform such as:

- parcel time-series
- connectivity matrix
- HCP parcel labels
- anomaly metrics
- T1
- target ROIs

This is the fastest MVP.

### V2 — Native Connectome Mode

RenovaTarget processes raw T1 + rs-fMRI itself.

This becomes considerably more powerful—but also considerably more regulated.

---

# 10. Imaging QC must be a first-class feature

Before target generation, the application should show a large:

# Connectome Quality Gate

with:

**motion**

**usable minutes**

**framewise displacement**

**registration quality**

**surface segmentation**

**signal dropout**

**parcel coverage**

**network reliability**

**split-half connectivity reliability**

and

**target stability.**

If the MRI fails QC:

> **Personalised FC targeting unavailable — use validated anatomical/network target or repeat imaging.**

Not:

> “Best target = x, y, z.”

---

# 11. Preprocessing must be frozen

The 2026 preprocessing findings make this essential. ([PubMed][16])

For every target recommendation store:

**pipeline version**

**software version**

**denoising strategy**

**global signal handling**

**temporal filter**

**smoothing kernel**

**motion censoring threshold**

**atlas version**

**normative database version**

**scan duration**

**target algorithm version**

If version 2.1 changes a patient's target relative to version 2.0, the system should be able to explain why.

This is medical-device-grade provenance.

---

# 12. Parcellation

HCP-MMP1.0 is a logical initial framework because:

1. it has strong neuroanatomical relevance;
2. Cingulum already provides published precedent;
3. many clinically interesting prefrontal subdivisions such as 8Av, 46, PGs etc. are represented.

Cingulum uses 377 regions: 360 HCP cortical parcels plus 17 subcortical structures. ([PubMed Central (PMC)][9])

I would nevertheless add a **cross-atlas verification layer**, perhaps HCP-MMP plus a Schaefer network parcellation.

If a target exists only because of one atlas boundary, confidence should fall.

---

# 13. Normative connectome

Do not simply use “normal versus abnormal”.

The reference system should preserve:

**mean**

**variance**

**scanner/site**

**age**

**sex where scientifically justified**

**acquisition parameters**

**motion**

**preprocessing version**

and ideally reliability estimates.

Rather than only using a 3σ binary abnormal/not-abnormal cutoff, store a continuous normative deviation.

Cingulum's 3σ anomaly system is elegant and interpretable. ([PubMed Central (PMC)][18])

But the Renova system should retain:

> **z = −3.8**

rather than collapsing it immediately into:

> **abnormal = yes.**

---

# 14. Connectivity should not mean “abnormality alone”

For every candidate parcel the engine should calculate several conceptually separate metrics.

A parcel could be:

**strongly abnormal**

but poorly connected to the therapeutic circuit.

Another may be:

**not extremely abnormal**

but ideally located within a replicated symptom circuit.

Another may be:

**excellent biologically**

but physically difficult to stimulate.

Those are different facts.

The UI should preserve them rather than generate one mysterious 92/100 score.

---

# 15. Electric-field modelling should replace a simple depth rule

Cingulum's published framework excludes targets over approximately 30 mm deep for its coil. ([Wiley Online Library][11])

That is pragmatic.

RenovaTarget should go further.

For each candidate:

**coil-to-cortex distance**

**gyral geometry**

**coil orientation**

**predicted E-field**

**percentage of parcel receiving useful field**

**off-target field**

**nearby network engagement**

should be calculated.

A SimNIBS-like modelling layer would be appropriate.

The target becomes:

> **the optimal stimulation solution for a relevant cortical region**

rather than merely the parcel centroid.

---

# 16. Target reliability

For each candidate show something like:

**Connectome anomaly:** Strong
**Therapeutic circuit match:** Strong
**Scan split-half reproducibility:** Moderate
**Target spatial stability:** 6.2 mm
**E-field engagement:** 81%
**Evidence tier:** B
**Overall interpretation:** Credible personalised candidate

If target stability is:

**24 mm**

the software should say:

> **Individual localisation is unstable. Do not interpret this coordinate as a precision target.**

This feature could be a genuine advance over many existing targeting systems.

---

# 17. Clinical phenotype model

The front end should not rely only on diagnosis.

Each assessment has four levels:

**Diagnosis → symptom dimensions → functional consequences → treatment priority.**

For depression, for example:

Diagnosis:

**MDD**

Symptoms:

**anhedonia 9/10**
**sadness 7/10**
**somatic anxiety 8/10**
**rumination 6/10**
**sleep 8/10**

Function:

**work impairment severe**
**social withdrawal moderate**

Priority:

**1. anhedonia/motivation**
**2. anxiety**
**3. cognitive endurance**

Those priority weights then feed the target coverage model.

---

# 18. Evidence knowledge graph

The evidence layer should be a structured database rather than prose.

Each evidence unit needs:

**condition**

**symptom**

**circuit**

**target**

**MNI coordinate / ROI**

**atlas**

**hemisphere**

**TMS protocol**

**coil**

**study design**

**sample size**

**comparator**

**clinical outcome**

**direction/effect**

**follow-up**

**replication**

**evidence grade**

**citation**

**conflict-of-interest metadata**

**date reviewed**

This becomes one of the platform's most defensible intellectual assets.

---

# 19. Do not let an LLM rank the targets

An LLM can be useful for converting a specialist note into structured candidate symptoms:

> “persistent anhedonia, rumination, anxious distress, poor initiation”

→

structured phenotype suggestions.

But the clinician must approve that extraction.

The target-ranking engine itself should be:

# deterministic + versioned + auditable.

An LLM may explain:

> “Why did target 2 rank above target 3?”

It should not secretly determine the answer.

---

# 20. What the specialist sees

The main screen should feel more like a multidisciplinary conference than a dashboard.

At the centre:

# 3D cortical surface / connectome

To the left:

**Clinical phenotype**

To the right:

**Target Slate**

Selecting a target reveals:

**Target 1 — left 8Av**

**Role:** Primary symptom-circuit candidate

**Supports:** anxious distress, executive dysfunction

**Patient finding:** abnormal CEN–DMN connectivity

**Evidence:** observational + symptom-circuit evidence

**Reliability:** good

**Coordinates:** subject + MNI

**Depth:** 18 mm

**E-field:** predicted good engagement

**Competing candidate:** left area 46

**Why it may be wrong:** patient-specific abnormality comes from a moderately reliable FC connection; evidence for this exact parcel/protocol remains limited.

That last field—**Why it may be wrong**—is essential.

---

# 21. The target comparison screen

The specialist should be able to compare:

|                           | Primary 1 | Primary 2 | Primary 3 | Alt A | Alt B |
| ------------------------- | --------- | --------- | --------- | ----- | ----- |
| Evidence                  |           |           |           |       |       |
| Clinical priority covered |           |           |           |       |       |
| Network                   |           |           |           |       |       |
| Individual FC             |           |           |           |       |       |
| Reliability               |           |           |           |       |       |
| E-field                   |           |           |           |       |       |
| Depth                     |           |           |           |       |       |
| Protocol precedent        |           |           |           |       |       |
| Uncertainty               |           |           |           |       |       |

Then:

**Accept**

**Modify**

**Reject**

**Replace**

The specialist must provide a reason when overriding the top recommendation.

This creates invaluable future validation data.

---

# 22. Crucially: “3 + 2” does not mean stimulate all five

The software's output is a **decision slate**.

The specialist can ultimately prescribe:

**one target**

**two targets**

**three targets**

or

**no target.**

At present, evidence for routine multi-target personalised TMS is far weaker than evidence for standard single-network protocols.

Cingulum offers useful feasibility data for multiple-target accelerated stimulation, but the controlled evidence needed to show that multi-target treatment is superior is not yet there. ([PubMed Central (PMC)][9])

The software should make that distinction explicit.

---

# 23. Supabase architecture

Supabase should be the **clinical system of record**, not the neuroimaging compute engine.

| Layer                    | Technology                                                             |
| ------------------------ | ---------------------------------------------------------------------- |
| Clinical database        | Supabase Postgres                                                      |
| Authentication           | Supabase Auth + MFA                                                    |
| Permissions              | Postgres RLS                                                           |
| Imaging metadata         | Postgres                                                               |
| Secure files             | Supabase Storage/private buckets or dedicated compliant object storage |
| Evidence knowledge graph | Postgres relational schema                                             |
| Semantic evidence search | pgvector                                                               |
| Audit trail              | append-only Postgres events                                            |
| Job state                | Postgres + Realtime                                                    |
| Server orchestration     | Supabase Edge Functions                                                |
| Heavy imaging processing | containerised Python NeuroCompute service                              |
| UI                       | Next.js App Router + TypeScript                                        |
| 3D brain                 | React Three Fiber / vtk.js / Niivue depending representation           |
| Charts                   | SVG/D3 or equivalent clinical visualisation layer                      |
| Neuroimaging             | Python, nibabel, nilearn, fMRIPrep, FreeSurfer/FastSurfer, ANTs        |
| E-field                  | SimNIBS-class pipeline                                                 |
| Neuronavigation export   | Localite / Brainsight-compatible ROI/coordinate exports                |

The compute workers can remain stateless.

Supabase retains:

**job → inputs → pipeline → result → clinician decision → final export**

as immutable provenance.

---

# 24. Core Supabase data model

I would build the system around these major entities:

**Patient**

→ **Assessment**

→ **Clinical Phenotype**

→ **Imaging Study**

→ **Connectome Run**

→ **Network Findings**

→ **Target Candidates**

→ **Target Slate**

→ **Clinician Review**

→ **Prescription Decision**

→ **Neuronavigation Export**

→ **Treatment Course**

→ **Outcome**

Separately:

**Evidence Source → Circuit → Symptom → Target → Protocol → Evidence Grade**

Every recommendation records the exact evidence-library version used to generate it.

---

# 25. Next.js application structure

The main clinical workflow should be:

**Case → Phenotype → Imaging → Connectome → Candidate Space → Target Slate → Specialist Review → Export → Outcomes.**

I would make the interface highly visual.

The user should be able to click:

**“Why this target?”**

and see the reasoning progressively:

Clinical priority
↓
Known therapeutic circuit
↓
Patient-specific connectivity
↓
MRI reliability
↓
Target accessibility
↓
Published evidence
↓
Uncertainty

That is much more valuable than an AI-generated paragraph.

---

# 26. MRI processing should be its own subsystem

Do not attempt fMRIPrep or connectome generation inside Next.js or Supabase Edge Functions.

Use an isolated container pipeline:

**NeuroCompute Worker**

with queued jobs.

The output back to Supabase should consist of versioned derivatives:

**QC.json**

**parcellation.nii.gz / surfaces**

**connectivity matrix**

**normative deviations**

**circuit scores**

**candidate ROI masks**

**E-field models**

**target coordinates**

**reliability report**

No processing result should be silently overwritten.

---

# 27. A particularly useful innovation: Counterfactual Target View

For every candidate ask:

# “What would the recommendation be without this patient's fMRI?”

Show:

**Standard evidence-only target:** X

versus:

**Connectome-refined target:** Y

Distance:

**18.4 mm**

Then explain why it moved.

This would give clinicians an immediate sense of whether connectomics materially changed the treatment decision.

It also creates data for validating whether that movement actually improves outcomes.

---

# 28. Another valuable innovation: Target Agreement Index

Compare four target generators:

**standard anatomical**

**normative connectivity**

**individual connectivity**

**symptom-specific circuit**

If they converge:

# High convergence

If they disagree substantially:

# Evidence conflict

This is much more clinically honest than picking one and hiding the disagreement.

---

# 29. Target diversity optimisation

If the app must produce three primary candidates, I would use a coverage algorithm.

Suppose:

Target A covers:

**anhedonia + dysphoria**

Target B covers:

**anhedonia + dysphoria**

Target C covers:

**anxiety + somatic symptoms**

Even if A and B score slightly above C individually, the optimal slate may be:

# A + C

because B is redundant.

The third primary target can then address the next high-priority functional circuit.

This is a **maximum clinical coverage problem**, not merely a ranking problem.

---

# 30. Outcomes should feed back into research—not directly retrain the model

Initially:

do **not** let the system continuously learn from every patient.

That creates uncontrolled model drift.

Instead:

clinical outcomes enter a research dataset.

At predetermined intervals:

**lock dataset → analyse → validate → propose algorithm update → clinical governance approval → version release.**

For example:

**Target Engine 1.3**

could become:

**Target Engine 1.4**

only after formal review.

---

# 31. Regulatory reality

This concept almost certainly needs to be designed as medical-device software from day one.

Australian TGA guidance is quite explicit: CDSS that directly processes MRI or other medical-device data does not meet the basic CDSS exemption criterion, and advanced software that specifies or customises patient treatment is also unlikely to qualify for the simple exemption. ([Therapeutic Goods Administration (TGA)][19])

Your proposed software does both:

**analyses functional MRI**

and

**recommends patient-specific treatment targets.**

So I would assume a **Software as a Medical Device / regulated CDSS pathway** unless specialist regulatory advice concludes otherwise. TGA's current 2026 guidance says software meeting the medical-device definition must generally be included in the ARTG unless a specific exclusion or exemption applies. ([Therapeutic Goods Administration (TGA)][20])

That affects the architecture positively: immutable provenance, version-controlled algorithms, auditability and human sign-off should be foundational rather than added later.

---

# 32. Validation programme

I would not begin by trying to prove clinical superiority.

The validation ladder should progress from technical validity to clinical utility.

| Stage                              | Question                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------------------ |
| **V0 — Technical**                 | Does the same MRI repeatedly produce essentially the same target?                                |
| **V1 — Expert concordance**        | Does the software generate targets credible TMS/connectomics experts would consider?             |
| **V2 — Retrospective outcome**     | Are higher-ranked targets more strongly associated with historical clinical response?            |
| **V3 — Silent prospective**        | In new patients, what would the software have recommended compared with specialist choice?       |
| **V4 — Tool-assisted prospective** | Does the system improve decision consistency, confidence or workflow?                            |
| **V5 — Randomized clinical trial** | Does software-assisted targeting improve clinical outcomes over high-quality standard targeting? |

The eventual randomized comparison is essential if the product is going to claim improved efficacy.

---

# 33. The key primary validation metric before efficacy

I would make:

# spatial target reproducibility

a primary engineering endpoint.

For example:

same patient

- repeat scan or split-half data
- same pipeline
  → candidate target should stay within a predefined spatial/e-field tolerance.

The field currently has enough evidence that personalised FC coordinates can be unstable that this cannot be ignored. ([PubMed][17])

---

# 34. Product modes

I would build three progressively more ambitious modes.

### Evidence Mode

No MRI required.

Clinical phenotype → evidence-supported target families.

Useful immediately.

### Connectome Mode

Adds individual fMRI to refine/rerank those candidates.

This is the core product.

### Research Mode

Allows:

- novel targets
- lower-confidence symptom circuits
- experimental anomaly-based targeting
- cross-atlas analyses
- new ranking algorithms

These must be visibly separated from routine clinical recommendations.

---

# 35. My recommended MVP

The MVP should **not** attempt every psychiatric and neurological indication.

Start with:

# Major depression ± anxious distress

because this is where the scientific scaffolding is strongest.

The engine would include:

**standard left-DLPFC target family**

**sgACC connectivity**

**convergent depression circuit**

**dysphoric circuit**

**anxiosomatic circuit**

**CEN/DMN/SN connectome features**

**individual target reliability**

**electric-field accessibility**

Then validate the target slate retrospectively and prospectively.

Only after that should you add:

OCD → PTSD → chronic pain → stroke rehabilitation → brain injury → tinnitus.

---

# 36. Why depression/anxiety is unusually attractive

The scientific pieces now almost form a complete bridge:

**established clinical efficacy of prefrontal TMS**

-

**sgACC connectivity literature**

-

**Stanford individualized targeting**

-

**MGB causal/symptom circuit work**

-

**prospective symptom-specific targeting**

-

**Cingulum's multi-target connectomic observations**

-

**recent randomized positive and negative personalised-targeting trials**

This is precisely the situation where software is useful:

# the evidence is rich enough to constrain the decision, but complex enough that a human cannot reliably hold every relationship in working memory.

---

# 37. The defensible product claim

I would **not** initially say:

> “RenovaTarget identifies the optimal TMS targets.”

I would say:

> **RenovaTarget synthesises clinical phenotype, published circuit evidence and individual functional connectomics into a ranked, source-verifiable set of candidate TMS targets for specialist review.**

And:

> **Every recommendation shows why it was nominated, how reliable the underlying imaging is, what evidence supports it, and what uncertainty remains.**

That is both scientifically credible and commercially strong.

---

# 38. The deeper strategic opportunity

Cingulum's most interesting contribution is not a specific parcel such as 8Av or PGs.

It is the proposition that **TMS target selection can become a patient-specific network reasoning problem rather than a diagnosis-to-coordinate lookup**. Their published work demonstrates feasibility and safety of that concept. ([PubMed Central (PMC)][18])

Stanford demonstrates the value of a **well-defined individual circuit target**. ([PubMed][1])

Siddiqi/Fox demonstrate that different symptoms can belong to **different causal therapeutic circuits**. ([PubMed][2])

BRIGhTMIND and the 2025 personalised-rTMS meta-analysis provide the necessary restraint: **personalisation by itself does not guarantee superior outcomes**. ([PubMed][5])

RenovaTarget can combine those lessons into something more rigorous:

> **Evidence determines which circuits are clinically defensible.
> Symptoms determine which circuits matter most.
> Connectomics determines how those circuits are expressed in this patient.
> Electric-field modelling determines what can actually be stimulated.
> The specialist makes the treatment decision.**

That, in my view, is the right foundation for the software.

[1]: https://pubmed.ncbi.nlm.nih.gov/34711062/?utm_source=chatgpt.com 'Stanford Neuromodulation Therapy (SNT): A Double-Blind Randomized Controlled Trial - PubMed'
[2]: https://pubmed.ncbi.nlm.nih.gov/32160765/?utm_source=chatgpt.com 'Distinct Symptom-Specific Treatment Targets for Circuit-Based Neuromodulation - PubMed'
[3]: https://pubmed.ncbi.nlm.nih.gov/42340706/?utm_source=chatgpt.com 'Connectivity- vs Scalp-Based Targeting of Accelerated Transcranial Magnetic Stimulation for Depression: A Randomized Clinical Trial - PubMed'
[4]: https://pubmed.ncbi.nlm.nih.gov/42581396/?utm_source=chatgpt.com 'Individualized Connectivity-Guided Versus Conventional Targeting of Accelerated Theta-Burst Stimulation in Depression: A Randomized, Double-Blind, Parallel-Design Trial - PubMed'
[5]: https://pubmed.ncbi.nlm.nih.gov/38228914/?utm_source=chatgpt.com 'Connectivity-guided intermittent theta burst versus repetitive transcranial magnetic stimulation for treatment-resistant depression: a randomized controlled trial.'
[6]: https://www.sciencedirect.com/science/article/pii/S0165032725005890?utm_source=chatgpt.com 'Effectiveness of personalized repetitive transcranial magnetic stimulation for major depressive disorder: A systematic review and meta-analysis of randomized active-controlled trials - ScienceDirect'
[7]: https://pmc.ncbi.nlm.nih.gov/articles/PMC11446248/?utm_source=chatgpt.com 'Functional Connectivity Mapping for rTMS Target Selection in Depression - PMC'
[8]: https://pubmed.ncbi.nlm.nih.gov/42035652/?utm_source=chatgpt.com 'Precision functional network imaging-guided transcranial magnetic stimulation: A review of clinical applications through resting-state fMRI - PubMed'
[9]: https://pmc.ncbi.nlm.nih.gov/articles/PMC10636393/?utm_source=chatgpt.com 'Personalized, parcel‐guided rTMS for the treatment of major depressive disorder: Safety and proof of concept - PMC'
[10]: https://www.cambridge.org/core/product/77E07C98AB9ECA6359E7BA7860DB43F4/core-reader?utm_source=chatgpt.com 'Evaluating the safety profile of connectome-based repetitive transcranial magnetic stimulation | Acta Neuropsychiatrica | Cambridge Core'
[11]: https://onlinelibrary.wiley.com/doi/10.1002/brb3.3268?utm_source=chatgpt.com 'Personalized, parcel‐guided rTMS for the treatment of major depressive disorder: Safety and proof of concept - Tang - 2023 - Brain and Behavior - Wiley Online Library'
[12]: https://pubmed.ncbi.nlm.nih.gov/36949668/?utm_source=chatgpt.com 'An agile, data-driven approach for target selection in rTMS therapy for anxiety symptoms: Proof of concept and preliminary data for two novel targets - PubMed'
[13]: https://pubmed.ncbi.nlm.nih.gov/39415644/?utm_source=chatgpt.com 'Improvements in Sleep Quality in Patients With Major Depressive and Generalized Anxiety Disorders Treated With Individualized, Parcel-Guided Transcranial Magnetic Stimulation.'
[14]: https://pubmed.ncbi.nlm.nih.gov/40116602/?utm_source=chatgpt.com 'Evaluating the safety profile of connectome-based repetitive transcranial magnetic stimulation - PubMed'
[15]: https://pubmed.ncbi.nlm.nih.gov/30600571/?utm_source=chatgpt.com 'Critical role of glutamatergic and GABAergic neurotransmission in the central mechanisms of theta-burst stimulation - PubMed'
[16]: https://pubmed.ncbi.nlm.nih.gov/42529453/?utm_source=chatgpt.com 'Effect of database, pre-processing pipeline, and scan duration on rs-fMRI functional connectivity based treatment targets for TMS obtained using the Stanford Neuromodulation Therapy (SNT) protocol.'
[17]: https://pubmed.ncbi.nlm.nih.gov/38419897/?utm_source=chatgpt.com 'Personalized connectivity-based network targeting model of transcranial magnetic stimulation for treatment of psychiatric disorders: computational feasibility and reproducibility - PubMed'
[18]: https://pmc.ncbi.nlm.nih.gov/articles/PMC13130353/?utm_source=chatgpt.com 'Evaluating the safety profile of connectome-based repetitive transcranial magnetic stimulation - PMC'
[19]: https://www.tga.gov.au/resources/guidance/understanding-clinical-decision-support-system-software-regulation?utm_source=chatgpt.com 'Understanding clinical decision support system software regulation | Therapeutic Goods Administration (TGA)'
[20]: https://www.tga.gov.au/products/medical-devices/software-and-artificial-intelligence-ai/overview/software-based-medical-device-exclusions?utm_source=chatgpt.com 'Software-based medical device exclusions | Therapeutic Goods Administration (TGA)'
