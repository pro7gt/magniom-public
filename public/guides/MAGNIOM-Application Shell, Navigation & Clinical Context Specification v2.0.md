# MAGNIOM

## Application Shell, Navigation & Clinical Context Specification v2.0

**Document status:** Canonical multi-indication application-shell, navigation and persistent-clinical-context specification
**Version:** 2.0
**Date:** 3 September 2026
**Supersedes:** MAGNIOM Application Shell, Navigation & Clinical Context Specification v1.0 for new development
**Extends:** MAGNIOM Clinician Workspace & UX Specification v1.0
**Primary application:** MAGNIOM Clinical Workspace
**Primary users:** TMS / neuromodulation specialists
**Secondary users:** Clinical reviewers, imaging/neurophysiology specialists, evidence reviewers, researchers, administrators
**Primary architectural change:** MDD/connectome-centred shell → indication-aware shell supporting heterogeneous scientific modules, multimodal measurement and independently governed Clinical/Validation/Research states
**Primary UX principle:** The shell establishes context; the Main Canvas supports reasoning
**Clinical authority:** Specialist clinician
**Scientific authority displayed by shell:** Derived from immutable `IndicationModuleRelease` + `ScientificPolicyRelease` + exact compatibility configuration; never inferred by frontend state

**Normative dependencies:**

* MAGNIOM System Requirements Specification v2.0
* MAGNIOM Canonical Multi-Indication Data Specification v2.0
* MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
* MAGNIOM Target Engine & Ranking Algorithm Specification v2.0
* MAGNIOM Neuroimaging, Neurophysiology & Multimodal Measurement Specification v2.0
* MAGNIOM Scientific Policy & Algorithm Configuration Specification v2.0
* MAGNIOM Implementation & Multi-Indication Validation Roadmap v2.0
* MAGNIOM Enterprise Verification, Testing & CI/CD Specification v2.0
* MAGNIOM Clinician Workspace & UX Specification v1.0

The existing clinician workspace established that MAGNIOM should feel like a **structured scientific case conference rather than an AI recommendation dashboard**, with clinical formulation preceding algorithmic output, evidence remaining inspectable, reliability presented alongside localisation, counterfactuals retained and final decision requiring active clinician reasoning. 

---

# 1. PURPOSE

This specification defines the persistent application architecture surrounding every MAGNIOM workspace.

Its purpose is to make it difficult for a clinician to lose track of:

### who they are acting as;

### which organisation and site they are operating within;

### whether they are in Clinical, Validation or Research context;

### which patient Case is active;

### which `CaseIndication` is being targeted;

### which `IndicationModuleRelease` governs the analysis;

### where the Case is within its workflow;

### whether required clinical and measurement context is current;

### whether the Target Slate is current;

### what action is presently expected;

### whether the scientific output is permitted to influence care.

The v1 workspace already required persistent case status and explicit staleness warnings rather than silently presenting an outdated Target Slate as current. 

v2 generalises that principle across all indications.

---

# 2. CANONICAL SHELL ARCHITECTURE

The application shell SHALL consist of four persistent conceptual layers:

```text
┌──────────────────────────────────────────────────────────────┐
│ TOP BAR                                                      │
│ establishes authority, organisation, environment and mode   │
├───────────────┬──────────────────────────────────────────────┤
│               │ CASE HEADER / CASE CONTEXT                   │
│ SIDEBAR       │ establishes patient + indication context     │
│               ├──────────────────────────────────────────────┤
│ establishes   │                                              │
│ location      │ MAIN CANVAS                                  │
│               │                                              │
│               │ supports scientific and clinical reasoning   │
│               │                                              │
└───────────────┴──────────────────────────────────────────────┘
```

Canonical rule:

> **The Top Bar establishes authority and environment.
> The Sidebar establishes location.
> The Case Header establishes clinical context.
> The Main Canvas supports reasoning.**

---

# 3. THE SHELL IS A SAFETY CONTROL

The shell is not merely layout chrome.

It mitigates foreseeable hazards including:

```text
wrong environment

wrong organisation

wrong Case

wrong CaseIndication

wrong IndicationModule

Research/Clinical confusion

Validation/Clinical confusion

stale Target Slate

stale measurements

incorrect module maturity assumption

signing under wrong context

scientific output interpreted outside intended scope
```

Therefore changes to shell semantics may require:

* requirements impact review;
* risk review;
* human-factors review;
* regression testing.

---

# 4. v2 SHELL DESIGN OBJECTIVE

The v2 shell must scale from:

```text
MDD
+
structural MRI
+
rs-fMRI
+
connectome refinement
```

to heterogeneous workflows such as:

```text
Stroke Motor
+
DiseaseStageContext
+
LesionContext
+
Motor Mapping
+
MEP
```

or:

```text
Tinnitus
+
Audiology
+
Research target hypotheses
```

without changing the fundamental clinician mental model.

---

# 5. SHELL SHALL BE INDICATION-NEUTRAL BUT CONTEXT-AWARE

The shell architecture is common.

The scientific workflow within it is module-specific.

Therefore MAGNIOM SHALL NOT create separate top-level applications such as:

```text
MAGNIOM Depression
MAGNIOM Stroke
MAGNIOM Pain
MAGNIOM OCD
```

unless product governance later specifically requires separate deployments.

Instead:

```text
One MAGNIOM Workspace
        ↓
Case
        ↓
CaseIndication
        ↓
IndicationModuleRelease
        ↓
module-aware workspace
```

---

# 6. SHELL SHALL NOT BECOME A GENERIC KPI DASHBOARD

The MAGNIOM Home experience MAY have dashboard structure.

It SHALL NOT become dominated by:

* charts;
* utilisation metrics;
* “AI insights”;
* target success scores;
* algorithm leaderboards;
* feature cards;
* marketing statistics.

The primary purpose is:

# orient → prioritise → continue work.

---

# 7. CLINICAL REASONING SEQUENCE

The v1 workspace used:

```text
UNDERSTAND
    ↓
QUALIFY
    ↓
MEASURE
    ↓
COMPARE
    ↓
REVIEW
    ↓
DECIDE
```

as the governing interaction model. 

v2 retains it and generalises **MEASURE** beyond connectomics.

---

# 8. v2 REASONING MODEL

```text
UNDERSTAND
Case + indication + objective

        ↓

QUALIFY
population + stage + lesion + treatment context

        ↓

MEASURE
MRI / lesion / rs-fMRI / task fMRI / DWI /
motor mapping / MEP / audiology / E-field

        ↓

COMPARE
candidate hypotheses + counterfactuals + alternatives

        ↓

REVIEW
evidence + reliability + uncertainty + conflicts

        ↓

DECIDE
specialist-owned clinical decision
```

---

# 9. GLOBAL APPLICATION STATES

The shell SHALL support at least:

```text
Clinical

Validation

Research
```

with release/maturity substate where necessary.

These are not merely colours or themes.

They affect:

* permitted data;
* permitted modules;
* available actions;
* signing authority;
* Target Slate semantics;
* route availability.

---

# 10. MODE IS NOT THE SAME AS MODULE QUALIFICATION

The shell must distinguish:

```text
current workspace mode
```

from:

```text
module qualification level.
```

Example:

```text
RESEARCH MODE

Tinnitus Module 0.4
Qualification Q2
```

versus:

```text
CLINICAL MODE

MDD Module 2.0
Qualification Q8
```

---

# 11. PRODUCT MATURITY IS A THIRD CONCEPT

The application may also have:

```text
Verification Build M3
Clinical Release Platform M7
Production Clinical Platform M8
```

This is separate from:

* current workspace mode;
* module qualification.

The shell SHALL avoid contradictory maturity labels.

---

# 12. AUTHORITATIVE CONTEXT MODEL

The persistent shell derives from a server-resolved object:

```ts
interface ApplicationShellContextV2 {
  application: ApplicationContext;

  user: UserAuthorityContext;
  organisation: OrganisationContext;
  environment: EnvironmentContext;

  active_case?: CaseShellContextV2;

  navigation: NavigationCapabilityContext;

  release: ApplicationReleaseContext;
}
```

---

# 13. APPLICATION CONTEXT

```ts
interface ApplicationContext {
  product_name: "MAGNIOM";

  application_release_id: string;

  application_maturity:
    | "engineering"
    | "research"
    | "verification"
    | "validation"
    | "clinical_release_candidate"
    | "production_clinical";
}
```

---

# 14. USER AUTHORITY CONTEXT

```ts
interface UserAuthorityContext {
  user_id: UUID;

  display_name: string;

  roles: UserRole[];

  capabilities: string[];

  signing_authority: {
    tms_target_decision: boolean;
    indication_scope?: UUID[];
  };
}
```

The shell MAY display the clinician's role.

It SHALL NOT treat display role as the security control.

Backend capability checks remain authoritative.

---

# 15. ENVIRONMENT CONTEXT

```ts
interface EnvironmentContext {
  environment:
    | "development"
    | "integration"
    | "validation"
    | "clinical_staging"
    | "production";

  workspace_mode:
    | "clinical"
    | "validation"
    | "research";

  clinical_authority_available: boolean;

  environment_label: string;
}
```

---

# 16. ACTIVE CASE SHELL CONTEXT

```ts
interface CaseShellContextV2 {
  case_id: UUID;
  case_display_id: string;

  patient_display_name?: string;

  case_indication_id: UUID;
  indication_display_name: string;

  indication_module_release_id: UUID;
  indication_module_label: string;
  indication_module_version: string;

  module_qualification_level:
    | "Q0"
    | "Q1"
    | "Q2"
    | "Q3"
    | "Q4"
    | "Q5"
    | "Q6"
    | "Q7"
    | "Q8";

  effective_mode:
    | "clinical"
    | "validation"
    | "research";

  clinical_objectives: ClinicalObjectiveSummary[];

  workflow: CaseWorkflowState;

  context_status: ClinicalContextStatus;

  measurement_status: MeasurementBundleStatus;

  target_slate_status: TargetSlateShellStatus;

  decision_status: DecisionShellStatus;

  stale_reasons: CaseStalenessReason[];

  release_context: CaseScientificReleaseContext;

  capabilities: CaseCapabilitySet;
}
```

---

# 17. TOP BAR — PURPOSE

The Top Bar answers:

# Who am I acting as?

# Where am I?

# What environment/mode am I in?

It SHALL remain relatively stable regardless of the active Case.

---

# 18. TOP BAR — REQUIRED CONTENT

Desktop Top Bar SHOULD contain:

```text
MAGNIOM

Global Case Search / Command Search

Environment / Mode Indicator

Organisation / Site

Authenticated User

Account / Session Menu
```

Optional:

* notifications;
* help;
* release disclosure.

---

# 19. TOP BAR — PROHIBITED CONTENT

The Top Bar SHALL NOT contain:

```text
Accept target

Select Primary 1

Sign target

Generate treatment protocol

Change scientific ranking

Promote module to Clinical
```

Global shell areas must never become shortcuts around clinical reasoning.

---

# 20. MODE INDICATOR

Mode SHALL be explicit text.

Examples:

```text
CLINICAL MODE

VALIDATION MODE

RESEARCH MODE
```

Do not rely on:

* colour;
* icon;
* background theme

alone.

---

# 21. CLINICAL MODE DISPLAY

A Clinical context SHOULD be calm rather than celebratory.

Example:

```text
CLINICAL MODE
Approved clinical module
```

Do not use:

```text
✓ AI Clinical Ready
```

or other authority-inflating language.

---

# 22. RESEARCH MODE DISPLAY

Research Mode SHALL remain persistently identifiable.

Recommended persistent strip:

```text
RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS
```

For an active Research Case:

```text
Experimental outputs must not be used as clinical target authority.
```

The v1 workspace already required a persistent Research banner and prohibited an in-workspace “Promote to Clinical” action. 

---

# 23. VALIDATION MODE DISPLAY

Validation should not masquerade as Clinical Mode.

Recommended:

```text
VALIDATION MODE
Controlled evaluation — clinical authority restricted by study protocol
```

Specific wording depends on the validation protocol.

---

# 24. MODULE QUALIFICATION DISPLAY

The clinician does not need raw Q-level terminology on every screen.

Preferred ordinary Clinical UI:

```text
MDD · Clinical module
```

Internal/advanced disclosure:

```text
MDD Module 2.0.0 · Q8
```

Research:

```text
Tinnitus · Research module
```

Internal:

```text
Tinnitus 0.4.0 · Q2
```

---

# 25. CONTRADICTORY STATE SHALL FAIL CLOSED

The shell SHALL NOT display:

```text
CLINICAL MODE
```

if backend policy says:

```text
Tinnitus module = Research only.
```

If context resolution is inconsistent:

```text
Clinical targeting unavailable
Scientific configuration could not be verified.
```

---

# 26. ORGANISATION / SITE CONTEXT

Enterprise deployments SHOULD display enough organisation/site context to prevent wrong-site operation.

Example:

```text
Renova Neuromodulation · Sydney
```

The exact design may be compact.

---

# 27. ORGANISATION SWITCHING

If a user can access multiple organisations/sites:

switching SHALL:

* clear Case-specific client state;
* revalidate capabilities;
* invalidate inaccessible routes;
* require server-side organisation resolution.

---

# 28. USER IDENTITY

A signing clinician should be able to recognise which authenticated identity will be attached to the final decision.

The sign-off workspace SHALL restate this explicitly.

---

# 29. GLOBAL SEARCH

Search MAY support:

```text
Case ID
patient name where permitted
indication
```

It SHALL NOT search scientific target content in a way that leaks PHI or cross-tenant results.

---

# 30. SIDEBAR — PURPOSE

The Sidebar answers:

# Where can I go?

It communicates product information architecture.

It SHALL NOT duplicate:

* case status;
* scientific metrics;
* release manifests.

---

# 31. DEFAULT CLINICIAN SIDEBAR

Recommended:

```text
▣ Home

▤ Cases
＋ New Case

◷ Awaiting Review
✓ Decisions

◇ Evidence

──────────────

⚗ Research

──────────────

? Help
```

Administrative items appear only where authorised.

---

# 32. HOME

Home is an operational orientation surface.

It SHOULD prioritise:

```text
Cases requiring my action

Recent Cases

Outstanding decisions

Measurement or Slate changes requiring review

Relevant scientific-update notices
```

---

# 33. HOME SHALL NOT BE A TARGET FEED

Prohibited:

```text
Today's recommended targets

Top MAGNIOM predictions

5 high-confidence patients

Best-performing target family
```

This would increase automation bias.

---

# 34. HOME ACTION CARDS

Appropriate examples:

```text
MGN-26-0412
Stroke Motor
Target Slate ready for review
Open Case
```

```text
MGN-26-0394
Neuropathic Pain
Motor-map qualification needs review
Review Measurement
```

```text
MGN-26-0355
MDD
Target Slate became stale after phenotype update
Regenerate Slate
```

---

# 35. HOME STATUS IS TASK-ORIENTED

Home may display counts such as:

```text
Awaiting my review  4

Unsigned decisions  2
```

It SHOULD NOT emphasise:

```text
84 total targets generated
91% recommendation acceptance
```

---

# 36. CASES

`Cases` remains the principal clinician domain.

The v1 workspace already placed Cases at the centre of ordinary specialist use. 

---

# 37. CASE LIST

Columns may include:

```text
Case

Patient

Indication

Module/Mode

Current Stage

Needs Attention

Last Updated
```

Optional:

* clinician;
* site.

Avoid target coordinates in the Case list.

---

# 38. CASE LIST MODE FILTER

A multi-indication system SHOULD support explicit filtering:

```text
Clinical

Validation

Research
```

Do not intermix Research and Clinical Cases without obvious state indicators.

---

# 39. CASE LIST INDICATION FILTER

Support:

```text
MDD
OCD
Neuropathic Pain
Stroke Motor
Stroke Aphasia
TBI
PTSD
Tinnitus
```

but do not turn indication names into global first-level navigation.

---

# 40. AWAITING REVIEW

This queue contains actionable clinical work such as:

```text
Phenotype approval required

Disease stage confirmation required

Lesion context review required

Measurement QC review

Measurement reliability review

Target Slate ready

Target Slate stale

Decision waiting for sign-off
```

---

# 41. DECISIONS

The Decisions workspace may provide:

* unsigned decisions;
* recently signed decisions;
* superseded decisions;
* decisions requiring reconciliation.

It SHALL NOT become a performance dashboard comparing clinician agreement with MAGNIOM.

---

# 42. EVIDENCE

Clinician-level Evidence navigation SHOULD primarily expose:

```text
approved evidence

TargetFamilies

EvidencePaths

source inspection
```

Evidence curation/governance is a separate privileged workspace.

---

# 43. RESEARCH

Research sits below a clear navigation divider.

Entering Research SHOULD alter shell semantics persistently.

---

# 44. ADMINISTRATION

Administration SHALL appear only for authorised users.

Do not burden ordinary clinicians with:

* RLS configuration;
* release manifests;
* worker queues;
* scientific policy administration;
* user provisioning.

---

# 45. INTERNAL VALIDATION ENVIRONMENT

The current engineering/verification dashboards belong under routes such as:

```text
/internal/validation

/internal/releases

/internal/golden-cases

/internal/human-factors
```

not ordinary clinician Home.

---

# 46. VALIDATION DASHBOARD CONTENT

Appropriate internal content:

```text
Module Q levels

Golden Case status

verification coverage

scientific release

validation studies

Human Factors status

open risks
```

This is not ordinary clinical navigation.

---

# 47. ROLE-AWARE SIDEBAR

Navigation SHOULD derive from capabilities.

### TMS specialist

```text
Home
Cases
Awaiting Review
Decisions
Evidence
Research
Help
```

### Imaging / Measurement specialist

```text
Home
Measurement Queue
Cases
QC Review
Processing
Research
Help
```

### Evidence reviewer

```text
Home
Evidence
Claims
EvidencePaths
Review Queue
Releases
```

### Researcher

```text
Research
Research Cases
Datasets
Experimental Modules
```

### Administrator

```text
Organisation
Users
Sites
Access
Audit
```

---

# 48. ROLE NAVIGATION IS PRESENTATION, NOT SECURITY

Hidden navigation SHALL NOT be the only access control.

Direct URL access must still be authorised server-side.

---

# 49. GLOBAL → CASE TRANSITION

Opening a Case changes the interface from:

# global workspace

to:

# clinical context workspace.

The Case becomes a persistent context boundary.

---

# 50. CASE NAVIGATION

Within an active Case, the Sidebar SHOULD transform or extend to show Case-specific navigation rather than introducing an unrelated second navigation system.

Recommended:

```text
← All Cases

MGN-26-0042

Overview
Assessment
Clinical Context
Measurements
Evidence
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

Sections appear/expand according to module requirements.

---

# 51. MODULE-AWARE CASE NAVIGATION

Case navigation SHALL not assume every indication has:

```text
Connectome
```

or:

```text
Lesion
```

Instead, the shell derives module-aware destinations.

---

# 52. MDD CASE NAVIGATION EXAMPLE

```text
← All Cases

Overview
Assessment
Phenotype
Measurements
  Structural MRI
  Resting-state fMRI
  Connectome
Evidence
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

---

# 53. NEUROPATHIC PAIN EXAMPLE

```text
← All Cases

Overview
Assessment
Clinical Context
  Pain phenotype
  Body region
Measurements
  Structural MRI
  Motor Mapping
  MEP
Evidence
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

---

# 54. STROKE MOTOR EXAMPLE

```text
← All Cases

Overview
Assessment
Clinical Context
  Motor impairment
  Disease Stage
  Lesion Context
Measurements
  Structural MRI
  Lesion Mapping
  Motor Mapping
  MEP
  DWI [Research]
Evidence
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

---

# 55. STROKE APHASIA EXAMPLE

```text
← All Cases

Overview
Assessment
Clinical Context
  Aphasia phenotype
  Disease Stage
  Lesion Context
  Treatment Context
Measurements
  Structural MRI
  Lesion Mapping
  Task fMRI [where applicable]
Evidence
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

---

# 56. OCD EXAMPLE

```text
← All Cases

Overview
Assessment
Clinical Context
  OCD phenotype
  Treatment Context
Measurements
  Structural MRI
  E-field / Device Model
Evidence
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

---

# 57. TINNITUS RESEARCH EXAMPLE

```text
RESEARCH MODE

← Research Cases

Overview
Clinical Context
  Tinnitus phenotype
Measurements
  Audiology
  Structural MRI [optional]
  rs-fMRI [Research]
Evidence
Research Target Hypotheses
Compare
Research Notes
Audit
```

No Clinical Decision sign-off.

---

# 58. CASE HEADER — PURPOSE

The Case Header answers:

# Which Case am I reviewing?

# What indication are we targeting?

# Under which module and mode?

# What is the current state?

# Is the current Target Slate valid?

This context remains visible across evidence, comparison and decision screens.

---

# 59. CASE HEADER — REQUIRED CONTENT

At minimum:

```text
Case ID

Patient identifier/name where appropriate

Principal CaseIndication

Clinical objective summary

Mode

Current workflow stage

Critical currentness/staleness

Target Slate state
```

Advanced disclosure includes:

```text
IndicationModuleRelease

Scientific Policy

Evidence Library

Target Engine
```

---

# 60. CASE HEADER EXAMPLE — CLINICAL MDD

```text
MGN-26-0042
Alex B. · MDD ± anxious distress

CLINICAL MODE
MDD Module 2.0

Target planning · Target Slate ready

Phenotype       Approved
Measurements    Qualified
Target Slate    Current
```

---

# 61. CASE HEADER EXAMPLE — STROKE VALIDATION

```text
MGN-26-0061
Stroke Motor Rehabilitation

VALIDATION MODE
Stroke Motor Module 1.0 · Q5

Subacute stage
Left hemispheric lesion

Measurements    Qualified with limitations
Target Slate    Ready for validation review
```

---

# 62. CASE HEADER EXAMPLE — TINNITUS RESEARCH

```text
MGN-R-0068
Tinnitus

RESEARCH MODE
Tinnitus Module 0.4 · Research only

Audiology       Qualified
Imaging         Research
Hypotheses      Available
```

No clinical action.

---

# 63. CASEINDICATION IS FIRST-CLASS SHELL CONTEXT

The header SHALL display the principal targeting indication.

Do not display only:

```text
Diagnosis: MDD + PTSD + chronic pain
```

when the current analysis is specifically:

```text
Targeting indication:
MDD
```

---

# 64. MULTIPLE CASE INDICATIONS

A Case may contain several `CaseIndication` objects.

Example:

```text
MDD
PTSD
Neuropathic Pain
```

They SHALL NOT be silently merged.

---

# 65. INDICATION SWITCHER

Where multiple `CaseIndication` objects exist, a controlled switcher MAY appear:

```text
Targeting context:
[MDD ▼]
```

Selecting another indication transitions to:

# another targeting analysis.

It does not relabel the existing Slate.

---

# 66. INDICATION SWITCH CONFIRMATION

Switching indication SHALL:

* preserve current work;
* load the target indication's workflow;
* load appropriate module;
* revalidate permissions;
* prevent accidental cross-use of previous Slate.

A lightweight confirmation may be appropriate if unsaved local work exists.

---

# 67. NO CROSS-INDICATION SLATE REUSE

If the user moves:

```text
MDD → PTSD
```

the previous MDD Target Slate SHALL NOT remain visually presented as the active target analysis.

---

# 68. INDICATION MODULE DISCLOSURE

Ordinary users need a human-readable name.

Example:

```text
Stroke Motor Module
```

Advanced provenance:

```text
IndicationModuleRelease
STR-MOTOR-1.0.0
```

---

# 69. MODULE VERSION VISIBILITY

Module version SHOULD be available from:

```text
Case Header
→ Scientific provenance
```

It need not dominate the ordinary interface.

---

# 70. MODULE PERMISSION STATUS

If module is not Clinical-authorised:

the header SHALL make this impossible to miss.

Examples:

```text
Research only

Validation use only

Not authorised for Clinical target decisions
```

---

# 71. MODULE Q-LEVEL PRESENTATION

Q-levels are primarily internal governance concepts.

Clinician-facing copy SHOULD translate them into meaningful status.

Internal users MAY see raw:

```text
Q5 — Silent Prospective Qualified
```

---

# 72. CASE HEADER — CLINICAL OBJECTIVE

The principal objective SHOULD be concise.

Examples:

```text
Objective
Reduce depressive symptom burden
```

```text
Objective
Improve right upper-limb motor recovery
```

```text
Objective
Improve naming / expressive language
```

This prevents anatomical targeting from losing its clinical purpose.

---

# 73. CASE HEADER — DISEASE STAGE

If disease stage materially affects evidence eligibility:

display it persistently or prominently within Clinical Context.

Stroke example:

```text
Disease Stage
Subacute
```

Do not bury an eligibility-determining stage in a secondary form.

---

# 74. CASE HEADER — LESION CONTEXT

The entire lesion report need not persist in the header.

But a clinically material lesion state SHOULD be summarised.

Example:

```text
Lesion
Left MCA territory · reviewed
```

Critical lesion-target conflicts belong in Target review.

---

# 75. CASE HEADER — TREATMENT CONTEXT

If treatment-context mismatch can invalidate evidence applicability, display a concise state.

Example:

```text
SLT Context
Planned / confirmed
```

or:

```text
Symptom provocation context
Not documented
```

---

# 76. HEADER CURRENTNESS

The header SHALL display material staleness.

Possible reasons:

```text
Phenotype changed

Clinical objective changed

Disease stage changed

LesionContext updated

TreatmentContext updated

New MeasurementBundle available

Reliability changed

Evidence Library changed

Scientific Policy changed

Module superseded
```

---

# 77. STALENESS MODEL

```ts
interface CaseStalenessReason {
  code: string;

  severity:
    | "blocking"
    | "important"
    | "informational";

  affected_object:
    | "target_slate"
    | "measurement"
    | "decision"
    | "case_context";

  message: string;

  resolution_action?: string;
}
```

---

# 78. BLOCKING STALENESS

Examples:

```text
Target Slate generated before current Clinical Objective

Target Slate generated before current lesion review

Scientific Policy no longer valid for this configuration
```

Clinical sign-off SHALL be blocked.

---

# 79. IMPORTANT STALENESS

Example:

```text
New optional Research DWI run available.
```

May not invalidate a Clinical Slate.

The UI must distinguish relevance.

---

# 80. INFORMATIONAL RELEASE UPDATE

Example:

```text
A newer Evidence Library release is available.
This Slate remains bound to Evidence Library 2.0.
```

No silent recalculation.

The v1 workspace similarly required historical Slates to retain their evidence version after later evidence changes. 

---

# 81. CASE HEADER ACTIONS

Permitted:

```text
Case summary

Evidence

Audit

Export

More
```

Potentially:

```text
Regenerate Target Slate
```

if contextually appropriate.

---

# 82. CASE HEADER PROHIBITIONS

Do not place:

```text
Accept Primary 1

Choose target

Sign decision
```

in the persistent header.

Decision authority belongs in the dedicated Decision workspace, consistent with v1. 

---

# 83. WORKFLOW MODEL

v2 workflow remains:

# state-driven, not route-driven.

The v1 workspace explicitly established this principle. 

Routes allow navigation.

Workflow state establishes:

* readiness;
* prerequisites;
* validity;
* signing permission.

---

# 84. GENERIC v2 CASE WORKFLOW

```text
1  Case / Assessment
       ↓
2  Indication & Clinical Objective
       ↓
3  Clinical Context Qualification
       ↓
4  Measurements
       ↓
5  Evidence
       ↓
6  Target Slate
       ↓
7  Comparison / Clinical Review
       ↓
8  Decision
       ↓
9  Treatment
       ↓
10 Outcomes
```

Not every module requires every substage.

---

# 85. WORKFLOW RAIL

Use:

```text
✓ complete

● current

○ pending

! action required

— not applicable
```

with icon + text + accessible state.

Colour alone is insufficient.

---

# 86. DYNAMIC WORKFLOW

A generic workflow step such as:

```text
Measurements
```

may expand into:

```text
Structural MRI       ✓
Lesion Mapping       ✓
Motor Mapping        !
MEP                  ○
DWI                  Research
```

according to module.

---

# 87. WORKFLOW SHALL NOT CREATE FALSE REQUIREMENTS

For Tinnitus, do not show:

```text
Connectome ○ incomplete
```

as though it were required when the active Research workflow needs only audiology.

Use:

```text
Not required
```

or omit.

---

# 88. MAIN CANVAS — PURPOSE

The Main Canvas answers:

# What clinical/scientific work should I do now?

It is intentionally not persistent.

Its content changes with the task.

---

# 89. MAIN CANVAS SHOULD HAVE ONE PRIMARY PURPOSE

Examples:

```text
Approve the phenotype

Review lesion context

Determine whether motor mapping is qualified

Compare Target Candidates

Document final decision
```

Avoid multiple competing primary actions.

---

# 90. CASE OVERVIEW

The Case Overview should orient the clinician in approximately 10 seconds, retaining the v1 requirement. 

It should answer:

```text
Who is this?

What are we trying to treat?

Which module/mode?

Where are we in workflow?

What needs attention?

Is a Target Slate available/current?
```

---

# 91. CASE OVERVIEW SHALL NOT PRE-ANCHOR TARGET

The v1 workspace prohibited displaying the Primary coordinate on the overview before deliberate Target Slate review. 

v2 retains this.

Display:

```text
Target Slate ready for review
```

not:

```text
Primary target: left M1
```

before intentional review.

---

# 92. MULTI-INDICATION CASE OVERVIEW EXAMPLE

```text
MGN-26-0064

Targeting indication
Stroke Motor Rehabilitation

Clinical objective
Improve right upper-limb function

Module
Stroke Motor 1.0 · Validation

Context
Subacute · Left hemispheric lesion

Measurements
Structural MRI       Qualified
Lesion Mapping       Qualified
Motor Mapping        Qualified
MEP                  Available
DWI                  Research only

Current task
Target Slate ready for review
```

---

# 93. CLINICAL CONTEXT WORKSPACE

v2 introduces a generic:

```text
Clinical Context
```

workspace which may contain:

```text
Phenotype

Clinical Objective

Disease Stage

Lesion Context

Treatment Context

Body Region

Laterality

other module-specific qualifiers
```

---

# 94. WHY CLINICAL CONTEXT IS SEPARATE FROM MEASUREMENT

A lesion may be:

```text
clinical context
```

and also derive from:

```text
lesion mapping measurement.
```

The shell should distinguish:

### clinical interpretation

from:

### measured artefact.

Example:

```text
Measurement:
left frontal infarct segmentation

Clinical context:
chronic post-stroke non-fluent aphasia
```

---

# 95. CLINICAL OBJECTIVE FIRST

Each target workspace SHALL keep visible what the candidate is intended to address.

Examples:

```text
Right upper-limb motor recovery

Neuropathic left-hand pain

Obsessions/compulsions

Naming impairment
```

A target should never become a decontextualised coordinate.

---

# 96. MEASUREMENTS WORKSPACE

The generic route:

```text
/cases/[caseId]/measurements
```

provides a module-aware summary.

---

# 97. MEASUREMENT SUMMARY

Example:

```text
MEASUREMENTS

Structural MRI
Qualified

Lesion Mapping
Qualified

Motor Mapping
Qualified with limitations

MEP
Available — contextual

DWI
Research only
```

---

# 98. QUALIFICATION LANGUAGE

Preferred states:

```text
Qualified

Qualified with limitations

Not qualified

Research only

Processing

Not acquired

Not required
```

Avoid:

```text
Good

Bad

92% confidence
```

unless a validated measure specifically supports such interpretation.

---

# 99. MEASUREMENT CARD

Each modality card should expose:

```text
What was measured

Why it matters

Quality

Reliability

Which capability it enables

Which capability it does not enable

Limitations
```

---

# 100. MEASUREMENT ≠ TARGET AUTHORITY

Visual hierarchy SHALL reinforce:

```text
Measurement result
```

is not:

```text
target recommendation.
```

Example:

```text
Motor hotspot
Left M1 · qualified

Used by:
Pain motor-map refinement
```

not:

```text
Recommended target:
Left M1 hotspot
```

---

# 101. RS-FMRI / CONNECTOME VIEW

For MDD and compatible modules:

display:

* measurement qualification;
* circuit measurement;
* reliability;
* patient-specific refinement relevance.

Retain the v1 principle that reliability remains co-equal with localisation. 

---

# 102. LESION WORKSPACE

Should support:

```text
lesion visualisation

laterality

lesion volume/context

target-family relationship

registration qualification

review state

limitations
```

It SHALL NOT say:

```text
Lesion suggests treatment target X
```

unless that inference belongs to the Target Engine.

---

# 103. MOTOR MAPPING WORKSPACE

Show:

```text
mapped muscle/body region

hotspot

map geometry

repeatability

MEP response context

coordinate space

qualification
```

Ensure muscle and laterality are prominent.

---

# 104. TASK fMRI WORKSPACE

Show:

```text
task paradigm

behavioural performance

activation localisation

laterality

reliability/sensitivity

qualification
```

A failed task shall not visually imply absent cortical function.

---

# 105. DWI WORKSPACE

Use cautious terminology:

```text
tractography-derived structural connectivity
```

not:

```text
number of fibres.
```

Research/Validation status must remain visible if applicable.

---

# 106. AUDIOLOGY WORKSPACE

For tinnitus:

```text
hearing thresholds

tinnitus laterality

pitch/loudness matching

measurement repeatability

relevant clinical interpretation
```

Do not visually connect:

```text
8 kHz
→ cortical target coordinate
```

without an explicit governed scientific path.

---

# 107. EVIDENCE WORKSPACE IN CASE CONTEXT

Case-level Evidence should answer:

```text
Why can this TargetFamily be considered?

For which population?

For this disease stage?

Under which targeting method?

With which treatment context?

What evidence conflicts?
```

---

# 108. CASE EVIDENCE IS FILTERED, NOT ALTERED

The Case Evidence view may filter the global Evidence Library by:

```text
CaseIndication

module

clinical objective

TargetFamily
```

but it SHALL not create patient-specific scientific truth.

---

# 109. TARGET SLATE WORKSPACE

The Target Slate remains the core reasoning surface.

Its purpose is:

# expose competing scientifically permitted target hypotheses.

Not:

# announce the software's answer.

---

# 110. TARGET SLATE LAYOUT

Recommended desktop structure:

```text
┌──────────────────────┬────────────────────────┬─────────────────────┐
│ Candidate List       │ Spatial / Geometry     │ Evidence / Reasoning│
│                      │ Viewer                 │ Drawer              │
│ Primary 1            │                        │                     │
│ Primary 2            │                        │                     │
│ Additional           │                        │                     │
└──────────────────────┴────────────────────────┴─────────────────────┘
```

Exact proportions may adapt by target geometry.

---

# 111. CANDIDATE CARD — SHARED CONTENT

Every candidate should expose:

```text
Candidate role

Clinical objective

TargetFamily

Target geometry

Evidence basis

Patient-specific contribution

Measurement reliability

Key uncertainty

Strongest counterargument
```

---

# 112. NO UNIVERSAL POINT COORDINATE UI

v2 SHALL support:

```text
Point

Surface ROI

Volumetric ROI

Somatotopic

Coil Field

Network
```

without forcing all candidates into:

```text
x / y / z
```

presentation.

---

# 113. POINT TARGET PRESENTATION

May display:

```text
subject coordinate

standard-space coordinate

anatomical label

navigation export
```

with coordinate-space identity explicit.

---

# 114. ROI TARGET PRESENTATION

Show:

```text
region / surface patch

centroid if useful

extent

target boundary

uncertainty
```

A centroid is not synonymous with the target.

---

# 115. SOMATOTOPIC TARGET PRESENTATION

Example:

```text
Left M1 · right hand representation

Motor-map refinement:
qualified

Evidence baseline:
contralateral hand-area M1
```

Body-region semantics remain first-class.

---

# 116. COIL-FIELD TARGET PRESENTATION

Example:

```text
mPFC/ACC field target

Device/coil:
compatible profile X

Target definition:
field-based

Pose:
...
```

Do not display one glowing point as the scientific target.

---

# 117. NETWORK TARGET PRESENTATION

Research network targets SHALL clearly distinguish:

```text
therapeutic network hypothesis

accessible stimulation node

network evidence
```

and Research status.

---

# 118. PRIMARY 1 IS NOT VISUAL AUTHORITY

Primary 1 may appear first.

It SHALL NOT receive:

* green “best” badge;
* trophy icon;
* glow;
* bullseye;
* default selection;
* treatment probability.

---

# 119. CANDIDATE ROLE VERSUS RANK

Display separately:

```text
Role
Evidence anchor

Slate position
Primary 1
```

or:

```text
Role
Motor-map refinement

Slate position
Primary 1
```

The system should not collapse role and rank.

---

# 120. COUNTERFACTUAL PRESENTATION

Where patient-specific refinement exists:

the evidence baseline SHALL remain readily inspectable.

Examples:

```text
MDD
Evidence baseline ↔ FC refinement
```

```text
Pain
Somatotopic baseline ↔ motor-map refinement
```

```text
OCD
Evidence-defined field ↔ pose-optimised field
```

---

# 121. REFINEMENT EXPLANATION

The clinician should be able to answer:

```text
What changed?

Why did it change?

Which measurement caused the change?

Was that measurement qualified?

How large was the geometry difference?

Why was the refinement adopted or rejected?
```

---

# 122. EVIDENCE DRAWER

The Evidence Drawer SHALL preserve Case context.

Opening it must not make the clinician lose:

* Case;
* indication;
* module;
* active candidate.

---

# 123. EVIDENCE DRAWER STRUCTURE

Recommended:

```text
Candidate Evidence

EvidencePath

Supporting Claims

Material Conflicts

Population Applicability

Targeting Method

Treatment Context

Sources

Scientific Governance
```

Progressively disclosed.

---

# 124. NEGATIVE EVIDENCE

Material negative/conflicting evidence SHOULD appear at the same conceptual level as supporting evidence.

Do not hide it under:

```text
More details
```

when it materially affects the candidate.

---

# 125. TARGET COMPARISON

Comparison SHALL compare clinically interpretable dimensions.

Possible columns:

```text
Clinical purpose

TargetFamily

Evidence role

Geometry

Patient-specific refinement

Reliability

Disease-stage applicability

Lesion relationship

Treatment context

Accessibility

E-field

Counterargument

Uncertainty
```

---

# 126. NO UNIVERSAL COMPARISON SCORE

If candidates are scientifically incompatible for scalar ranking, the UI SHALL not manufacture a single comparison score.

This is particularly important for:

```text
OCD field target
vs
focal pre-SMA target.
```

---

# 127. COMPARISON DOMAIN DISCLOSURE

Advanced explanation MAY state:

```text
These candidates are not directly ranked by one common numeric utility because their targeting strategies are scientifically different.
```

This helps clinicians interpret order correctly.

---

# 128. 3D VIEWER ROLE

The viewer is:

# spatial evidence support.

It is not:

# the decision authority.

---

# 129. 3D VIEWER PROHIBITIONS

Avoid:

```text
winning target glow

bullseye animation

auto-rotation

red/green candidate coding

oversized target marker that hides uncertainty

default camera implying one candidate is preferred
```

---

# 130. 3D VIEWER TEXT EQUIVALENT

Every clinically meaningful 3D fact must have a textual/table equivalent.

The v1 workspace already required that visual/3D information not become the sole carrier of clinical meaning. 

---

# 131. DECISION WORKSPACE

Decision is a separate intentional workflow.

Possible dispositions:

```text
Select candidate

Reject candidate

Modify candidate

Replace with clinician-defined target

Defer decision

No target selected
```

---

# 132. NO “ACCEPT MAGNIOM RECOMMENDATION”

That language remains prohibited.

The v1 workspace explicitly required active specialist reasoning rather than one-button acceptance. 

---

# 133. DECISION LANGUAGE

Use:

```text
Select this candidate
```

or:

```text
Use as final target
```

rather than:

```text
Accept AI recommendation.
```

---

# 134. CLINICIAN-DEFINED TARGET

Where governance permits:

the clinician may define a target outside the Slate.

The UI SHALL record:

```text
clinician-defined

geometry

source / rationale

relationship to MAGNIOM candidates
```

without pretending the new target was generated by MAGNIOM.

---

# 135. MODIFIED TARGET

When modifying a candidate:

display both:

```text
Original MAGNIOM candidate

Clinician-modified target
```

and preserve the original immutably.

v1 already required original and modified targets to remain visible and distinct. 

---

# 136. FINAL REASONING

Final reasoning SHALL be clinician-owned.

MAGNIOM MAY provide structure such as:

```text
Why this target?

What alternatives were considered?

What uncertainty remains?
```

It SHALL NOT silently pre-author the clinical rationale.

---

# 137. SIGN-OFF SEQUENCE

```text
Review
   ↓
Select / modify / reject
   ↓
Write rationale
   ↓
Review attestation
   ↓
Confirm Case + indication + module
   ↓
Sign
```

---

# 138. SIGN-OFF SHALL RESTATE CONTEXT

Immediately before signing display:

```text
Case

Targeting indication

Mode

Target Slate version

Final target geometry

Module

Scientific release

Clinician identity
```

---

# 139. SIGNING AUTHORITY

The sign action SHALL be server-authorised.

A visible enabled button alone is insufficient.

---

# 140. SIGNING STALE SLATE

If the Slate becomes stale during review:

signing SHALL fail server-side even if an old browser tab still shows an enabled button.

---

# 141. MULTI-TAB SAFETY

If another tab:

* updates phenotype;
* changes lesion context;
* generates new Slate;
* signs the decision;

the stale tab must detect invalidation before consequential action.

---

# 142. SESSION EXPIRY

Clinical sign-off after session expiry requires re-authentication or equivalent secure revalidation.

Unsaved clinician reasoning should be preserved safely where feasible without weakening security.

---

# 143. DIRECT DEEP LINKS

All deep links SHALL reconstruct:

```text
user authority

organisation

Case

CaseIndication

mode

module

workflow state

scientific currentness
```

before rendering clinical actions.

---

# 144. DEEP LINK FAILURE

If a bookmarked URL references a module no longer permitted:

show:

```text
This historical analysis is available for review,
but this module is not currently authorised for new Clinical targeting.
```

where appropriate.

---

# 145. HISTORICAL TARGET SLATE VIEW

Historical Slate views SHALL preserve:

* original indication;
* module;
* policy;
* evidence;
* measurements;
* decision.

Do not restyle them as if produced under current science.

---

# 146. SUPERSEDED MODULE

Example:

```text
Generated with Stroke Motor Module 1.0
Current module is 1.1
```

Historical Slate remains intact.

A newer module does not silently recalculate it.

---

# 147. SCIENTIFIC PROVENANCE DISCLOSURE

Routine interface SHOULD show concise:

```text
Scientific provenance
```

expandable into:

```text
Indication Module
Scientific Policy
Evidence Library
Target Engine
Measurement Providers
Reliability methods
```

---

# 148. HASHES

Raw hashes are available in technical provenance/audit.

They SHALL not dominate ordinary clinician UI.

This continues the v1 principle of keeping technical audit details expandable rather than visually overwhelming routine clinical review. 

---

# 149. CASE REPORT

The signed clinical report should include:

```text
Clinical question

Principal indication

Approved clinical context

Relevant measurements

Target Slate

Evidence and reliability

Clinician review

Final target

Independent reasoning

Scientific version manifest
```

---

# 150. REPORT LANGUAGE

Use:

> MAGNIOM nominated…

and:

> The treating specialist selected…

Do not blur system output and clinician decision, as already required in v1. 

---

# 151. RESEARCH REPORT LANGUAGE

Use:

```text
Research target hypothesis
```

not:

```text
recommended clinical target.
```

---

# 152. CASE CREATION

New Case workflow SHOULD begin with:

```text
patient / case identity

principal clinical problem

candidate CaseIndication

site / clinician
```

It should not begin with:

```text
Upload MRI
```

or:

```text
Choose AI target model.
```

---

# 153. INDICATION SELECTION

The user selects or confirms a clinically relevant indication.

The interface may help search supported modules.

It SHALL NOT infer a treatment indication solely from imaging.

---

# 154. UNSUPPORTED INDICATION

If no suitable module exists:

show:

```text
MAGNIOM does not currently provide a governed targeting module for this indication.
```

Do not substitute the nearest available indication.

---

# 155. RESEARCH MODULE OPTION

Where Research governance permits:

an unsupported Clinical indication may have:

```text
Open Research Module
```

as a clearly separate workflow.

This must never look like a fallback Clinical target.

---

# 156. MODULE SELECTION SHALL NOT BE A TECHNICAL MODEL PICKER

Clinicians should select:

```text
Stroke Motor Rehabilitation
```

not:

```text
plugin-stroke-v1.1
```

Technical module versions are resolved by policy.

---

# 157. MULTIPLE MODULE VERSIONS

Ordinary clinicians SHALL NOT manually choose arbitrary scientific module versions in Clinical Mode.

Clinical policy resolves the authorised version.

Research users may have controlled version selection.

---

# 158. RESEARCH VERSION SELECTION

Where Research permits multiple scientific configurations, the shell SHALL clearly show the selected configuration and prevent it being mistaken for Clinical authority.

---

# 159. MODULE-SPECIFIC HELP

Contextual help SHOULD adapt.

Examples:

### Stroke

```text
Why does disease stage matter?
What does lesion-target relationship mean?
```

### Pain

```text
What is a somatotopic target?
What does motor-map reliability mean?
```

### OCD

```text
Why is this target represented as a field?
```

### Tinnitus

```text
Why doesn't tinnitus pitch determine a cortical target?
```

---

# 160. GLOSSARY v2

Expand global glossary to include:

```text
CaseIndication

IndicationModuleRelease

EvidencePath

DiseaseStageContext

LesionContext

MeasurementBundle

ReliabilityBundle

TreatmentContext

TargetGeometry

Somatotopic Target

Coil-Field Target

Patient-specific Refinement

Evidence Baseline

Research Hypothesis
```

---

# 161. CLINICIAN HELP SHALL NOT BECOME MARKETING

Avoid:

> MAGNIOM's AI identifies the optimal personalised brain target.

Prefer:

> MAGNIOM structures evidence, clinical context and qualified patient-specific measurements into target hypotheses for specialist review.

This remains consistent with the v1 help-system principle. 

---

# 162. PROGRESSIVE DISCLOSURE

The shell and workspace should progressively reveal:

### Level 1 — task

What needs attention?

### Level 2 — clinical meaning

Why does it matter?

### Level 3 — scientific basis

Evidence / reliability / context.

### Level 4 — technical provenance

versions / methods / hashes.

Do not invert this hierarchy.

---

# 163. ALERT MODEL

Retain three levels:

## Blocking

Requires resolution.

## Important

Persistent, non-modal.

## Informational

Does not interrupt.

The v1 workspace similarly favoured persistent contextual warnings over excessive modal alerts. 

---

# 164. BLOCKING v2 ALERTS

Examples:

```text
Research module requested in Clinical Mode

Target Slate stale after Clinical Objective change

Required lesion mapping not qualified

Scientific configuration cannot be verified

Unauthorised sign-off
```

---

# 165. IMPORTANT v2 ALERTS

Examples:

```text
Motor map qualified with limitations

Disease-stage evidence applicability limited

Material conflicting evidence

Low candidate convergence

Task-fMRI threshold sensitivity
```

---

# 166. INFORMATIONAL v2 ALERTS

Examples:

```text
New Evidence Library release available

Optional DWI processing complete

Module 1.1 available for future analyses
```

---

# 167. VISUAL DESIGN

MAGNIOM should feel:

```text
precise

calm

clinical

contemporary

evidence-literate

restrained
```

not:

```text
futuristic AI command centre

radiology PACS clone

generic SaaS analytics dashboard
```

---

# 168. COLOUR

Colour supports state.

It SHALL NOT determine target preference.

Do not encode:

```text
green = best target

yellow = possible

red = reject
```

---

# 169. ACTION COLOUR

Reserve strongest accent treatment for:

# actionable workflow controls

not arbitrary data highlights.

---

# 170. TYPOGRAPHY

Recommended:

```text
Primary clinical body text    ~15–16 px

Secondary/support text        ~13–14 px

High contrast for clinically material state
```

Do not render uncertainty, provenance or limitations in tiny low-contrast text.

---

# 171. SHELL DIMENSIONS

Recommended desktop starting points:

```text
Top Bar            56–64 px

Environment Strip  32–40 px when needed

Sidebar            224–248 px

Collapsed Sidebar  64–72 px

Content Gutter      24–32 px

Main content max    ~1400–1500 px
```

These are design-system guidance rather than safety requirements.

---

# 172. CASE HEADER DIMENSION

Case Header SHOULD remain compact enough not to consume excessive vertical space.

Detailed context belongs in expandable disclosure.

Critical mode/indication/staleness must remain visible.

---

# 173. LIGHT/DARK MODE

MAGNIOM MAY support:

```text
Light
Dark
System
```

Appearance SHALL NOT encode clinical meaning.

---

# 174. CLINICAL VALIDATION THEME

If human-factors studies use a particular canonical appearance, materially different themes may require usability impact consideration.

---

# 175. DARK 3D VIEWER

A dark scientific viewer can exist within a lighter clinical shell.

The viewer's theme does not alter scientific authority.

---

# 176. ACCESSIBILITY

Target:

# WCAG 2.2 AA

consistent with the existing workspace specification and testing programme. 

---

# 177. ACCESSIBILITY REQUIREMENTS

Critical information SHALL NOT depend solely on:

```text
colour

hover

3D graphics

animation

pointer precision
```

---

# 178. KEYBOARD NAVIGATION

Clinicians must be able to:

* navigate sidebar;
* review candidates;
* open evidence;
* compare;
* select/reject target;
* complete sign-off

without a mouse where practical.

---

# 179. SCREEN READER LANDMARKS

Recommended landmarks:

```text
application header

navigation

case context

main workspace

supplementary evidence

alerts
```

---

# 180. FOCUS MANAGEMENT

Opening:

* Evidence Drawer;
* candidate detail;
* decision modal/step

shall move focus appropriately and restore it when closed.

---

# 181. REDUCED MOTION

Respect reduced-motion settings.

No clinically material visualisation should require animation.

---

# 182. RESPONSIVE BEHAVIOUR

MAGNIOM remains desktop-primary.

### Desktop

Full shell.

### Tablet

Collapsible sidebar; Case Header remains persistent.

### Mobile

May provide limited review/status functionality until formally validated for complete target decision workflows.

---

# 183. MOBILE CLINICAL DECISION

Clinical signing on very small screens SHOULD remain disabled until specifically validated if the full evidence/geometry review cannot be safely supported.

---

# 184. SERVER COMPONENT ARCHITECTURE

For Next.js:

Server Components SHOULD be the default for:

```text
application shell

navigation

case header

authoritative clinical metadata

read-only workspace structure
```

Client Components should be used only where interaction requires them.

---

# 185. FRONTEND SCIENTIFIC LOGIC PROHIBITION

The frontend SHALL NOT decide:

```text
EvidencePath eligibility

Clinical module permission

target eligibility

measurement qualification

reliability qualification

candidate rank

refinement adoption

staleness validity
```

It receives authoritative domain state.

The v1 technical architecture similarly prohibited Next.js from computing targets or hiding scientific ranking logic in UI code. 

---

# 186. PRESENTATION ADAPTER

Recommended architecture:

```text
Canonical Domain Objects
        ↓
Server-side Presentation Adapter
        ↓
View Model
        ↓
UI Component
```

This prevents components from reinterpreting scientific rules.

---

# 187. CASE VIEW MODEL

```ts
interface CaseShellViewModel {
  caseIdentity: CaseIdentityViewModel;

  indication: IndicationContextViewModel;

  mode: ModeViewModel;

  workflow: WorkflowViewModel;

  currentness: CurrentnessViewModel;

  measurements: MeasurementSummaryViewModel[];

  targetSlate?: TargetSlateStatusViewModel;

  decision?: DecisionStatusViewModel;

  permittedActions: CaseAction[];
}
```

---

# 188. LOCAL UI STATE

Appropriate local state:

```text
drawer open

selected visual overlay

sidebar collapsed

expanded evidence section

camera state
```

Not appropriate:

```text
Target Slate current = true

candidate clinically eligible = true

user can sign = true
```

unless provided and revalidated by server authority.

---

# 189. OPTIMISTIC UI

Optimistic UI MAY be used for low-risk interactions.

Do not use optimistic completion for:

```text
Phenotype approval

Clinical Objective approval

Target Slate publication

Scientific Policy activation

Decision signing
```

---

# 190. ROUTE ARCHITECTURE

Recommended global routes:

```text
/

/cases
/cases/new

/reviews
/decisions

/evidence

/research

/help

/admin

/internal
```

Capability-gated as appropriate.

---

# 191. CASE ROUTES v2

```text
/cases/[caseId]

/cases/[caseId]/assessment

/cases/[caseId]/indications

/cases/[caseId]/context

/cases/[caseId]/measurements

/cases/[caseId]/measurements/[measurementId]

/cases/[caseId]/evidence

/cases/[caseId]/targets

/cases/[caseId]/compare

/cases/[caseId]/decision

/cases/[caseId]/treatment

/cases/[caseId]/outcomes

/cases/[caseId]/audit
```

---

# 192. INDICATION ROUTE IDENTITY

If a Case has several active analyses, routes MAY include:

```text
/cases/[caseId]/indications/[caseIndicationId]/...
```

This is preferable when ambiguity would otherwise arise.

---

# 193. RECOMMENDED CANONICAL CASE-INDICATION ROUTES

For robust v2 scaling:

```text
/cases/[caseId]

/cases/[caseId]/indications

/cases/[caseId]/indications/[caseIndicationId]

/cases/[caseId]/indications/[caseIndicationId]/context

/cases/[caseId]/indications/[caseIndicationId]/measurements

/cases/[caseId]/indications/[caseIndicationId]/evidence

/cases/[caseId]/indications/[caseIndicationId]/targets

/cases/[caseId]/indications/[caseIndicationId]/compare

/cases/[caseId]/indications/[caseIndicationId]/decision
```

This makes the scientific context explicit in URLs.

---

# 194. ROUTE RECOMMENDATION

For v2, prefer:

# `CaseIndication`-explicit routing

for target-specific work.

It reduces ambiguity in Cases containing multiple possible TMS indications.

---

# 195. RESEARCH ROUTES

```text
/research

/research/cases

/research/cases/[caseId]

/research/cases/[caseId]/indications/[caseIndicationId]

/research/modules
```

Research routes retain persistent Research shell semantics.

---

# 196. VALIDATION ROUTES

Controlled internal/study routes might include:

```text
/validation/studies

/validation/cases

/validation/modules

/validation/golden
```

not available to ordinary Clinical users unless required.

---

# 197. EVIDENCE ROUTES

```text
/evidence

/evidence/claims

/evidence/paths

/evidence/target-families

/evidence/sources
```

Governance users may receive additional routes.

---

# 198. INTERNAL ROUTES

```text
/internal/verification

/internal/golden-cases

/internal/releases

/internal/scientific-policy

/internal/ci-status
```

Never include these in ordinary clinician navigation.

---

# 199. ROOT LAYOUT

Conceptual:

```tsx
<MagniomRootLayout>
  <TopBar />
  <EnvironmentSafetyStrip />
  <GlobalSidebar />
  <WorkspaceRegion />
</MagniomRootLayout>
```

---

# 200. CASE LAYOUT

```tsx
<CaseLayout>
  <CaseNavigation />
  <CaseStatusHeader />
  <CaseContextAlerts />
  <WorkspaceMain />
</CaseLayout>
```

---

# 201. COMPONENT MODEL

Recommended components:

```text
MagniomTopBar

EnvironmentModeBadge
EnvironmentSafetyStrip

OrganisationContext
UserIdentityMenu
GlobalCaseSearch

GlobalSidebar
SidebarSection
SidebarNavigationItem

CaseShell
CaseNavigation
CaseStatusHeader
CaseIndicationSwitcher
CaseWorkflowRail
CaseStalenessAlert
ClinicalObjectiveSummary

ModuleStatusBadge
ScientificProvenanceDisclosure

MeasurementStatusSummary
MeasurementQualificationBadge

TargetSlateStatus

WorkspaceMain
WorkspaceToolbar

EvidenceDrawer
DecisionContextSummary
```

---

# 202. MODULE STATUS COMPONENT

`ModuleStatusBadge` SHALL not infer its own state.

Input:

```ts
interface ModuleStatusViewModel {
  display_name: string;

  release_version: string;

  effective_permission:
    | "clinical"
    | "validation"
    | "research"
    | "disabled";

  qualification_level?: string;

  explanation?: string;
}
```

---

# 203. ENVIRONMENT SAFETY STRIP

Used when necessary.

Examples:

```text
RESEARCH MODE — NOT FOR CLINICAL TARGET DECISIONS
```

```text
VALIDATION BUILD — CONTROLLED STUDY ENVIRONMENT
```

Clinical production need not display a large alarm strip permanently if mode is otherwise obvious.

---

# 204. NOTIFICATIONS

Notifications should be:

# actionable.

Examples:

```text
Measurement qualification changed

Target Slate stale

Evidence release affects active Case

Decision requires sign-off
```

Avoid engagement-style notifications.

---

# 205. NOTIFICATION DOES NOT CHANGE SCIENCE

Opening or dismissing a notification never changes candidate eligibility or currentness.

---

# 206. EMPTY STATES

Empty states should explain scientific restraint.

Example:

```text
No additional Primary Candidate

MAGNIOM did not identify another sufficiently distinct eligible
target hypothesis for this clinical objective.
```

Not:

```text
Something went wrong.
```

---

# 207. ABSTENTION STATE

Example:

```text
No Target Slate generated

The required lesion context could not be qualified for this
Stroke Motor analysis. MAGNIOM did not generate an alternative
target by approximation.
```

This should look like deliberate scientific behaviour.

---

# 208. PARTIAL CAPABILITY STATE

Example:

```text
Motor-map refinement unavailable

The evidence-supported somatotopic baseline remains available.
```

Do not present entire system failure.

---

# 209. PROCESSING STATES

Use domain-specific language.

Examples:

```text
Structural MRI processing

Lesion mapping

Motor-map analysis

Target Slate generation
```

Avoid:

```text
AI is thinking…
```

---

# 210. NO FAKE SCIENTIFIC PROGRESS PERCENTAGE

Unless actual deterministic progress exists, avoid:

```text
87% targeting complete
```

Use:

```text
Processing structural MRI
```

or step-based status.

---

# 211. ERROR STATE

If scientific generation fails:

```text
No Clinical Target Slate was published.
```

This is preferable to:

```text
Target generation partly completed.
```

---

# 212. DRAFT VERSUS PUBLISHED SCIENTIFIC OUTPUT

If internal computation produces candidate drafts before completion:

they SHALL NOT appear as authoritative Clinical Target Slate content.

---

# 213. AUTHORITY HIERARCHY IN THE UI

Visual hierarchy should follow:

```text
Case identity

Clinical objective

Mode / indication

Clinically material state

Scientific evidence / measurement

Algorithm output

Technical provenance
```

not the reverse.

---

# 214. TARGET VISUAL AUTHORITY CONTROL

A spectacular 3D rendering SHALL not dominate:

* evidence strength;
* reliability;
* uncertainty;
* counterargument.

The v1 workspace explicitly identified 3D visual authority as an automation-bias risk. 

---

# 215. MULTI-INDICATION HOME DOES NOT SHOW ALL MODULES AS PRODUCTS

Do not create a home screen with eight large cards:

```text
Depression
OCD
Pain
Stroke
TBI
PTSD
Tinnitus
…
```

for ordinary clinicians.

Supported indications belong primarily in:

* Case creation;
* search/filter;
* Research catalogue where relevant.

---

# 216. MODULE CATALOGUE

An authorised informational catalogue MAY exist under:

```text
Help / Supported Indications
```

showing:

```text
Clinical
Validation
Research
```

status.

This is secondary, not the daily workflow.

---

# 217. CLINICAL PERMISSION SHALL BE SERVER-DERIVED

The UI MAY display:

```text
Clinical
```

only from authoritative server policy resolution.

Never infer:

```ts
if (module.qualification_level === "Q8") {
  clinical = true
}
```

because Clinical authority depends on the full compatibility configuration.

---

# 218. EFFECTIVE MODULE AUTHORITY

Conceptually:

```text
Module status
∩
Scientific Policy
∩
Compatibility configuration
∩
deployment
∩
user capability
=
effective permitted action
```

The frontend receives the result.

---

# 219. CLINICAL ACTION CAPABILITY

Example:

```ts
interface ClinicalActionCapabilities {
  may_generate_target_slate: boolean;

  may_review_target_slate: boolean;

  may_create_clinician_decision: boolean;

  may_sign_target_decision: boolean;

  may_export_navigation_target: boolean;
}
```

---

# 220. VALIDATION STUDY CAPABILITY

Validation may have:

```text
may_generate_target_slate = true

may_review_target_slate = false before clinician decision
```

for a silent prospective protocol.

The shell must support such restrictions.

---

# 221. SILENT PROSPECTIVE UI

Treating clinicians SHALL NOT see concealed MAGNIOM results before protocol-defined unblinding.

The application must therefore enforce:

```text
Target Slate exists
```

without:

```text
Target Slate visible to treating clinician.
```

This is a major v2 validation-shell requirement.

---

# 222. SILENT STUDY CASE HEADER

May show only:

```text
MAGNIOM study processing
Complete
```

without candidate information.

Study/research personnel with separate role may inspect the frozen result.

---

# 223. CLINICIAN-ASSISTED VALIDATION UI

The shell SHOULD clearly state:

```text
CLINICIAN-ASSISTED VALIDATION
Target Slate may be reviewed under Study XYZ
```

rather than ordinary Clinical Mode.

---

# 224. PRE-MAGNIOM DECISION CAPTURE

Validation workflows MAY require an independent decision before Slate reveal.

The v1 specification already proposed capturing a pre-MAGNIOM clinical impression for validation/debiasing studies. 

v2 should support this as a study capability, not a universal Clinical requirement.

---

# 225. MODULE RESEARCH HYBRID CASE

A Clinical Case may contain optional Research measurements.

Example:

```text
MDD Clinical
+
DWI Research measurement
```

The shell must identify:

```text
DWI · Research only
Not used in Clinical Target Slate
```

---

# 226. RESEARCH OVERLAY SHALL NOT CONTAMINATE CLINICAL VIEW

Research data may be inspectable through a deliberate toggle or Research panel.

It SHALL NOT appear identical to clinically authorised measurements.

---

# 227. “NOT USED FOR RANKING”

Where a measurement is visible but not authorised:

use explicit labels such as:

```text
Context only

Research only

Not used for Clinical ranking
```

---

# 228. SCIENTIFIC BOUNDARY EXPLANATION

Clinicians SHOULD be able to ask:

> Why wasn't this measurement used?

and receive a structured answer.

Example:

> DWI structural connectivity is available for Research inspection but is not permitted to influence this Stroke Motor Clinical configuration.

---

# 229. PATIENT-SPECIFIC PRECISION LANGUAGE

Avoid generic:

```text
precision target
```

unless the specific meaning is clear.

Prefer:

```text
patient-specific motor-map refinement

patient-specific FC refinement
```

and show qualification.

---

# 230. EVIDENCE STRENGTH ≠ MEASUREMENT RELIABILITY

These must never share one combined confidence indicator.

Example:

```text
Evidence
Moderate / qualified path

Measurement reliability
High
```

rather than:

```text
Overall confidence 86%
```

---

# 231. MODULE-SPECIFIC CLINICAL CONTEXT

The shell shall allow plugins/modules to register presentation metadata for:

```text
required context sections

required measurement sections

labels

workflow ordering

help topics
```

but not arbitrary executable frontend code from untrusted modules.

---

# 232. MODULE UI DESCRIPTOR

```ts
interface IndicationModuleUiDescriptor {
  indication_module_release_id: UUID;

  context_sections: ModuleContextSection[];

  measurement_sections: ModuleMeasurementSection[];

  workflow_labels: WorkflowLabelOverride[];

  help_topic_ids: string[];

  target_geometry_renderers: TargetGeometryType[];
}
```

---

# 233. MODULE UI DESCRIPTOR IS PRESENTATIONAL

It SHALL NOT define:

```text
eligibility

scientific thresholds

ranking

Clinical permission.
```

Those remain in Scientific Policy/Target Engine.

---

# 234. NO RUNTIME REMOTE UI PLUGIN EXECUTION IN CLINICAL MODE

Clinical presentation extensions SHOULD be compiled/reviewed with the controlled application build.

Do not download arbitrary indication UI code at runtime.

---

# 235. CASE SHELL SERVER RESOLUTION

Recommended server flow:

```text
request
  ↓
authenticate
  ↓
resolve organisation/site
  ↓
resolve Case
  ↓
resolve CaseIndication
  ↓
resolve module
  ↓
resolve scientific policy authority
  ↓
resolve workflow/currentness
  ↓
resolve user capabilities
  ↓
render shell
```

---

# 236. SHELL FAIL-CLOSED STATE

If scientific authority cannot be resolved:

the Case may remain readable if safe,

but consequential Clinical actions are disabled.

---

# 237. EXAMPLE FAIL-CLOSED HEADER

```text
MGN-26-0042 · MDD

CLINICAL TARGETING UNAVAILABLE

Scientific configuration verification failed.
Historical records remain available.
```

---

# 238. OBSERVABILITY

Shell errors SHOULD emit pseudonymous operational events such as:

```text
SHELL_CONTEXT_RESOLUTION_FAILED

MODULE_AUTHORITY_MISMATCH

CASE_CONTEXT_STALE

SIGNING_BLOCKED_STALE_STATE
```

No unnecessary PHI in logs.

---

# 239. AUDIT EVENTS

Clinically relevant shell/workflow actions may include:

```text
CASE_OPENED

CASE_INDICATION_SELECTED

MODULE_CONTEXT_RESOLVED

PHENOTYPE_APPROVED

CLINICAL_CONTEXT_UPDATED

MEASUREMENT_REVIEWED

TARGET_SLATE_OPENED

EVIDENCE_OPENED

CANDIDATE_COMPARED

DECISION_STARTED

TARGET_MODIFIED

NO_TARGET_SELECTED

DECISION_SIGNED
```

Avoid turning trivial hover/scroll analytics into clinical audit noise.

---

# 240. ANALYTICS BOUNDARY

Product analytics SHALL NOT silently become scientific evidence.

For example:

```text
clinicians choose Primary 1 78% of the time
```

does not prove Primary 1 is effective.

---

# 241. HUMAN-FACTORS TEST — SHELL ORIENTATION

Within approximately 10 seconds of opening a Case, intended users SHOULD be able to identify:

```text
Case

principal indication

mode

clinical objective

workflow stage

whether current output is valid

next task
```

---

# 242. HUMAN-FACTORS TEST — MODE

A clinician should correctly distinguish:

```text
Clinical

Validation

Research
```

without relying solely on colour.

---

# 243. HUMAN-FACTORS TEST — MODULE MATURITY

Users SHALL not assume:

```text
visible module
=
clinically validated module.
```

---

# 244. HUMAN-FACTORS TEST — MULTI-INDICATION CASE

Clinician should identify which indication is currently targeted and avoid applying one indication's Target Slate to another.

---

# 245. HUMAN-FACTORS TEST — STROKE

Clinician should identify:

* disease stage;
* lesion laterality;
* lesion-target conflict;
* measurement qualification.

---

# 246. HUMAN-FACTORS TEST — PAIN

Clinician should identify:

* painful body region;
* laterality;
* baseline somatotopy;
* motor-map refinement status.

---

# 247. HUMAN-FACTORS TEST — OCD

Clinician should recognise:

```text
field-defined target
```

as different from a focal point target.

---

# 248. HUMAN-FACTORS TEST — TINNITUS

Research user should recognise:

* audiology measurement ≠ target;
* Research target hypothesis ≠ Clinical recommendation.

---

# 249. AUTOMATION-BIAS TEST

Clinical release should fail HF acceptance if clinicians routinely:

* treat Home as a recommendation feed;
* assume first candidate is treatment prescription;
* fail to review reliability;
* fail to notice negative evidence;
* mistake Research for Clinical;
* fail to recognise stale context.

The v1 workspace already classified these as safety failures rather than cosmetic usability issues. 

---

# 250. v2 UX GOLDEN CASE — MDD CLINICAL

Expected:

```text
Clinical mode obvious

MDD indication obvious

Target Slate current

FC contribution visible

evidence baseline inspectable

no preselected candidate
```

---

# 251. v2 UX GOLDEN CASE — PAIN MOTOR MAP

Expected:

```text
right-hand pain obvious

left M1 somatotopy obvious

motor map qualified

baseline/refinement relationship visible
```

---

# 252. v2 UX GOLDEN CASE — PAIN MOTOR MAP FAILURE

Expected:

```text
motor mapping not qualified

refinement not used

evidence baseline remains available

failure does not look like total application failure
```

---

# 253. v2 UX GOLDEN CASE — STROKE LESION

Expected:

```text
lesion context prominent

target-overlap warning blocking

no nearby guessed target

clinician understands why candidate is unavailable
```

---

# 254. v2 UX GOLDEN CASE — STROKE STAGE MISMATCH

Expected:

```text
stage mismatch visible

EvidencePath unavailable

no target presented as eligible
```

---

# 255. v2 UX GOLDEN CASE — OCD FIELD TARGET

Expected:

```text
coil-field geometry shown

compatible device visible

no misleading focal bullseye

field/focal alternatives clearly distinct
```

---

# 256. v2 UX GOLDEN CASE — APHASIA CONTEXT

Expected:

```text
aphasia phenotype

disease stage

SLT context

lesion context

all visible before Target Slate reasoning
```

---

# 257. v2 UX GOLDEN CASE — TBI RESEARCH

Expected:

```text
Research Mode persistent

weak target specificity visible

no Clinical decision action

no imported MDD authority
```

---

# 258. v2 UX GOLDEN CASE — TINNITUS RESEARCH

Expected:

```text
audiology visible

conflicting evidence prominent

Research target clearly labelled

Clinical sign-off unavailable
```

---

# 259. v2 UX GOLDEN CASE — MODULE AUTHORITY CONFLICT

Backend returns:

```text
workspace mode = clinical

module = Research only
```

Expected:

```text
Clinical action blocked

configuration error visible

no Target Slate sign-off
```

---

# 260. v2 UX GOLDEN CASE — MULTIPLE INDICATIONS

Case has:

```text
MDD
+
PTSD
```

Expected:

* selected targeting indication explicit;
* switching indication loads separate context;
* MDD Slate never displayed under PTSD context.

---

# 261. v2 UX GOLDEN CASE — SILENT PROSPECTIVE

Expected:

* treating clinician can complete ordinary workflow;
* hidden MAGNIOM Slate is inaccessible before required study point;
* research/study operator can confirm successful generation without revealing target.

---

# 262. v2 UX GOLDEN CASE — STALE LESION CONTEXT

A lesion review changes after Slate generation.

Expected:

```text
Target Slate stale

signing blocked

regeneration required
```

---

# 263. SHELL REQUIREMENT ALIGNMENT

This specification operationalises the v2 SRS requirements including:

```text
MAG-UX-041  Top bar establishes mode/environment

MAG-UX-042  Sidebar establishes location

MAG-UX-043  Case Header exposes CaseIndication

MAG-UX-044  Case Header exposes IndicationModuleRelease context

MAG-UX-045  Research Mode remains visible

MAG-UX-046  Research-only case has no normal Clinical sign-off

MAG-UX-047  Target geometry uses appropriate presentation

MAG-UX-048  Patient measurements influencing candidate are inspectable

MAG-UX-049  Non-influential available measurements are explainable

MAG-UX-050  Measurement reliability is separate from evidence strength

MAG-UX-051  Material lesion context is visible

MAG-UX-052  Material treatment context is visible

MAG-UX-053  Negative/conflicting evidence remains visible

MAG-UX-054  Algorithm rank is distinct from clinical authority

MAG-UX-055  Reject / modify / alternate / no-target actions exist

MAG-UX-056  “Optimal target” language is prohibited absent validated claim
```

It also retains the v1 safety requirement that no candidate is preselected for clinician acceptance.

---

# 264. ADDITIONAL SHELL-SPECIFIC REQUIREMENTS

The next controlled SRS amendment SHOULD consider:

### MAG-UX-057

The persistent shell SHALL expose the effective mode of the active Case.

### MAG-UX-058

The persistent Case Header SHALL expose the active principal `CaseIndication`.

### MAG-UX-059

A Case containing multiple `CaseIndication` objects SHALL not reuse one Target Slate across indications.

### MAG-UX-060

A module lacking Clinical authority SHALL not expose normal Clinical sign-off actions.

### MAG-UX-061

The shell SHALL expose clinically material Target Slate staleness across all target-review and decision routes.

### MAG-UX-062

Module-specific measurement navigation SHALL not imply that non-required modalities are required.

### MAG-UX-063

Clinical, Validation and Research contexts SHALL differ through labels, permissions and actions rather than colour alone.

### MAG-UX-064

The shell SHALL not permit a Case to display scientific output without resolving the applicable `IndicationModuleRelease`.

---

# 265. ADDITIONAL REQUIREMENTS — VALIDATION

### MAG-UX-065

Silent prospective study configuration SHALL permit Target Slate generation without target disclosure to the treating clinician.

### MAG-UX-066

Validation study state SHALL remain distinguishable from unrestricted Clinical Mode.

### MAG-UX-067

The shell SHALL be capable of displaying measurement capabilities as Clinical, Validation, Research-only, unavailable or not required.

### MAG-UX-068

Available Research measurements SHALL explicitly indicate when they were not used in the Clinical Target Slate.

---

# 266. SHELL VERIFICATION

Automated verification SHALL cover:

```text
route protection

module context resolution

mode propagation

CaseIndication propagation

staleness propagation

capability-driven navigation

Research sign-off absence

wrong-module deep links

role changes

multi-tab stale actions
```

---

# 267. VISUAL REGRESSION

Safety-critical snapshots include:

```text
Clinical mode header

Research mode header

Validation mode header

CaseIndication switcher

stale Slate warning

lesion conflict

field target

low reliability

Research measurement

Decision sign-off
```

---

# 268. ACCESSIBILITY VERIFICATION

Automated and manual testing SHALL include:

* navigation landmarks;
* keyboard;
* focus;
* screen-reader mode labels;
* text equivalent of target geometry;
* no-colour recognition of Clinical/Research;
* sign-off.

---

# 269. CI/CD IMPACT CLASSIFICATION

Changes to:

```text
Top Bar mode state

Case Header

CaseIndication selection

Research/Clinical visual hierarchy

staleness logic

decision-action location

sign-off context
```

are safety-relevant UX changes and SHOULD trigger expanded regression/HF impact assessment.

---

# 270. LOWER-RISK VISUAL CHANGES

Changes such as:

```text
spacing

typography refinements

non-semantic icon style
```

may be lower risk provided they do not materially alter:

* prominence;
* discoverability;
* hierarchy;
* comprehension.

---

# 271. SHELL PERFORMANCE

The persistent shell SHOULD render rapidly from server-resolved clinical context.

Do not delay basic Case identity/mode display while expensive scientific content loads.

---

# 272. PROGRESSIVE LOADING

Appropriate:

```text
Case Header visible
Measurements loading
```

Inappropriate:

```text
blank screen
```

while the user cannot identify which Case is being reviewed.

---

# 273. CASE CONTEXT MUST PRECEDE SCIENTIFIC VISUALISATION

The system SHALL not render an interactive brain target before Case/indication/mode context is established.

---

# 274. MODALITY FAILURE MUST NOT COLLAPSE SHELL

A failed DWI, task-fMRI or motor mapping job should affect its measurement region.

It should not destroy general Case navigation.

---

# 275. MODULE SUSPENSION UX

If an active module is suspended:

new Clinical target generation is unavailable.

Historical Case content remains inspectable where permitted.

Example:

```text
Clinical targeting temporarily unavailable for this module.

Existing historical decisions remain available.
```

---

# 276. RELEASE WITHDRAWAL UX

Do not present a withdrawn module as merely:

```text
offline
```

Explain the governance state at an appropriate level.

---

# 277. APPLICATION UPDATE UX

Routine frontend/app updates need not interrupt clinical workflow unless scientifically or clinically material.

Scientific changes should be disclosed appropriately.

---

# 278. MODULE UPDATE UX

If a newer module exists:

```text
New module version available for future analysis
```

Historical Slate remains unchanged.

A clinician must intentionally create a new analysis if clinically appropriate.

---

# 279. EVIDENCE RELEASE UPDATE UX

Same pattern:

```text
Newer evidence release available.
Current Target Slate remains bound to release 2.0.
```

---

# 280. NO AUTO-REFRESH OF CLINICAL TARGETS

Realtime infrastructure may notify:

```text
new scientific input available.
```

It SHALL NOT silently replace the clinician's active Target Slate.

---

# 281. ACTIVE DECISION PROTECTION

If the clinician is composing reasoning when a new Slate becomes available:

preserve draft reasoning.

Block final sign-off until currentness is resolved.

---

# 282. CASE CONTEXT LOCK DURING SIGNING

During final sign:

the application should prevent accidental indication/module switching until signing completes or is cancelled.

---

# 283. EXPORT CONTEXT

Target export SHALL contain or accompany:

```text
Case

selected target

target geometry

coordinate space

scientific source

clinician decision

version
```

and must not export an unselected candidate as though it were final.

---

# 284. NEURONAVIGATION EXPORT

Navigation export is available only:

# after clinician selection

unless explicitly part of controlled Research/Validation workflow.

---

# 285. TREATMENT WORKSPACE BOUNDARY

The Treatment workspace may record:

* delivered target;
* protocol;
* sessions;
* actual device.

It SHALL not imply that MAGNIOM Target Engine prescribed those protocol parameters.

---

# 286. OUTCOME WORKSPACE

Outcomes are longitudinal clinical data.

They SHALL not alter active scientific weights online.

The shell should not present:

```text
MAGNIOM learned from this patient.
```

unless a future separately validated adaptive architecture exists.

---

# 287. AUDIT WORKSPACE

Routine clinical audit should display readable events.

Example:

```text
09:14 Phenotype approved
Dr A

09:37 Lesion mapping reviewed
Dr B

10:02 Target Slate generated

10:18 Primary candidates reviewed
Dr A

10:42 Final decision signed
Dr A
```

Technical IDs/hashes are expandable.

---

# 288. HELP / TRAINING MODE

Training SHOULD use synthetic Cases.

Modules may have dedicated training cases.

No real patient data required.

---

# 289. MODULE TRAINING

Before module-specific signing authority, users MAY be required to demonstrate competence relevant to that module.

Examples:

### OCD

field-target interpretation.

### Stroke

lesion/stage context.

### Pain

somatotopy/motor map.

---

# 290. TRAINING SHALL TEST INTERPRETATION

Not merely:

```text
Can user find the Sign button?
```

but:

```text
Does the user know when they should not sign?
```

---

# 291. CLINICAL ACCEPTANCE CRITERION v2

Before unrestricted Clinical use for a module, a representative specialist should be able without assistance to determine:

```text
Which Case am I reviewing?

Which indication am I targeting?

Which mode/module governs this analysis?

What clinical objective is being addressed?

Which scientific context is material?

Which measurements influenced the Slate?

How reliable were they?

Which EvidencePath supports each candidate?

Which candidate is the baseline/counterfactual?

What important conflicting evidence exists?

Why are alternatives different?

Can I reject Primary 1?

Can I choose no target?

Is the Target Slate current?

What exactly will I sign?
```

---

# 292. CLINICAL ORIENTATION ACCEPTANCE

Within approximately 10 seconds, users should reliably determine:

```text
patient / Case

indication

mode

workflow stage

next task

whether output is current
```

This is the shell's most basic human-factors success criterion.

---

# 293. AUTOMATION-BIAS ACCEPTANCE

Clinical module promotion SHOULD fail if the shell causes clinicians to routinely:

```text
accept Primary 1 reflexively

ignore counterfactual

ignore reliability

miss evidence conflicts

confuse module maturity

confuse Research and Clinical

sign stale output
```

---

# 294. CROSS-INDICATION ACCEPTANCE

Users must not infer:

> A clinically approved MDD module means MAGNIOM's Stroke/Tinnitus modules are clinically approved.

The shell must communicate module-specific authority clearly enough to prevent this.

---

# 295. MULTIMODAL ACCEPTANCE

Users should correctly understand:

```text
high measurement reliability
```

does not equal:

```text
high clinical evidence.
```

This is a core v2 comprehension test.

---

# 296. CANONICAL HOME EXAMPLE

```text
┌─────────────────────────────────────────────────────────────────┐
│ MAGNIOM                 CLINICAL MODE      Renova · Sydney  Dr A │
├───────────────┬─────────────────────────────────────────────────┤
│ Home          │ Good morning                                    │
│ Cases         │                                                 │
│ Awaiting      │ REQUIRES YOUR REVIEW                            │
│ Decisions     │                                                 │
│ Evidence      │ MGN-26-0061 · Stroke Motor                     │
│               │ Target Slate ready for specialist review        │
│ ───────────   │ [Open Case]                                     │
│ Research      │                                                 │
│               │ MGN-26-0047 · MDD                              │
│ Help          │ New measurement available; Slate now stale      │
│               │ [Review change]                                 │
│               │                                                 │
│               │ RECENT CASES                                    │
└───────────────┴─────────────────────────────────────────────────┘
```

---

# 297. CANONICAL ACTIVE CASE EXAMPLE

```text
┌─────────────────────────────────────────────────────────────────────┐
│ MAGNIOM                    CLINICAL MODE       Renova · Sydney  Dr A │
├───────────────┬─────────────────────────────────────────────────────┤
│ ← All Cases   │ MGN-26-0042 · MDD ± anxious distress              │
│               │ MDD Module 2.0 · Target planning                   │
│ Overview      │ Phenotype ✓  Measurements ✓  Slate ready           │
│ Assessment    ├─────────────────────────────────────────────────────┤
│ Context       │                                                     │
│ Measurements  │                MAIN CANVAS                          │
│ Evidence      │                                                     │
│ Target Slate  │       Target Slate / Evidence / Comparison          │
│ Compare       │                                                     │
│ Decision      │                                                     │
│ Treatment     │                                                     │
│ Outcomes      │                                                     │
│ Audit         │                                                     │
└───────────────┴─────────────────────────────────────────────────────┘
```

---

# 298. CANONICAL RESEARCH CASE EXAMPLE

```text
┌─────────────────────────────────────────────────────────────────────┐
│ MAGNIOM                   RESEARCH MODE        Research Site    Dr A │
│ NOT FOR CLINICAL TARGET DECISIONS                                  │
├───────────────┬─────────────────────────────────────────────────────┤
│ ← Research    │ MGN-R-0068 · Tinnitus                             │
│               │ Tinnitus Module 0.4 · Research only                │
│ Overview      │ Audiology ✓  Imaging Research  Hypotheses ready    │
│ Context       ├─────────────────────────────────────────────────────┤
│ Measurements  │                                                     │
│ Evidence      │           RESEARCH HYPOTHESES                       │
│ Hypotheses    │                                                     │
│ Compare       │     No Clinical decision/sign-off actions           │
│ Notes         │                                                     │
│ Audit         │                                                     │
└───────────────┴─────────────────────────────────────────────────────┘
```

---

# 299. ARCHITECTURAL MAXIM

The v2 shell should allow the same clinician mental model to survive scientific expansion.

MDD may ask:

> Did reliable FC justify moving away from the evidence baseline?

Stroke may ask:

> Is this target compatible with stage, lesion anatomy and motor physiology?

OCD may ask:

> Which evidence-supported stimulation geometry is actually being considered?

Tinnitus Research may ask:

> What target hypotheses can be investigated despite important uncertainty?

The shell architecture does not answer these questions.

It makes sure the clinician always knows:

# which question they are answering.

---

# 300. v2 APPLICATION SHELL MANIFESTO

# Authority is persistent.

# Mode is explicit.

# Indication is explicit.

# Module authority is indication-specific.

# The Case remains visible.

# Clinical purpose remains visible.

# Currentness remains visible.

# Research never looks Clinical.

# Validation never looks unrestricted Clinical.

# Measurement availability is not measurement authority.

# Measurement reliability is not evidence strength.

# Evidence strength is not algorithmic rank.

# Algorithmic rank is not clinical authority.

# Target geometry retains scientific meaning.

# A field is not reduced to a point.

# Somatotopy is not reduced to generic anatomy.

# Lesion context cannot disappear behind a brain rendering.

# Disease stage cannot disappear behind a target coordinate.

# Scientific provenance is inspectable but does not overwhelm clinical reasoning.

# Alternatives remain first-class.

# No candidate is preselected.

# No-target is a valid decision.

# Stale output cannot be signed.

# Historical science is not silently updated.

# Multiple indications never share a Target Slate by convenience.

# Clinical actions derive from server-side authority.

# The Main Canvas exists for reasoning, not persuasion.

# The clinician owns the final decision.

---

# 301. CANONICAL DEFINITION

The **MAGNIOM Application Shell, Navigation & Clinical Context System v2.0** is:

> **A persistent, role-aware and indication-aware clinical application framework that continuously establishes user authority, organisation, deployment environment, Clinical/Validation/Research state, active Case, principal `CaseIndication`, governing `IndicationModuleRelease`, workflow stage and scientific currentness, while adapting navigation to each module's clinical context and multimodal measurements and reserving the Main Canvas for inspectable evidence, uncertainty, competing target hypotheses and independent specialist reasoning.**

---

# 302. FINAL GOVERNING RULE

> **MAGNIOM shall never require a clinician to infer which patient they are reviewing, which indication they are targeting, which scientific module governs that analysis, whether the module is Clinical, Validation or Research, whether the evidence and measurements are current, or whether the Target Slate remains valid. Those facts belong to the persistent application shell. The Main Canvas is therefore protected for the harder work: understanding clinical context, evidence, patient-specific measurements, reliability, target geometry, uncertainty, competing hypotheses and the reasons to disagree before the specialist decides.**

The defining v2 shell architecture is therefore:

# **Top Bar — authority and environment.**

# **Sidebar — location and workflow.**

# **Case Header — patient, indication, module and currentness.**

# **Main Canvas — reasoning.**

And the defining multi-indication extension is:

# **One application shell.

Many scientific modules.
No shared unearned clinical authority.**
