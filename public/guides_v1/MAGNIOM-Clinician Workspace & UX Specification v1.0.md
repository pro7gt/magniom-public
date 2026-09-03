# MAGNIOM
## Clinician Workspace & UX Specification v1.0

**Document status:** Canonical product and clinical-workflow specification  
**Date:** 1 September 2026  
**Primary application:** Magniom Clinical Workspace  
**Framework:** Next.js 16 Active LTS + TypeScript + Supabase  
**Primary user:** TMS specialist  
**Secondary users:** Clinical reviewer, imaging specialist, evidence reviewer  
**Clinical output:** Human-reviewed target decision derived from a Magniom Target Slate

**Depends on:**

- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Technical Architecture v1.0
- Magniom Supabase Database & Security Specification v1.0
- Magniom Target Engine & Ranking Algorithm Specification v1.0
- Magniom Neuroimaging & Functional Connectomics Pipeline Specification v1.0
- Magniom Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
- Magniom Clinical Phenotype & Symptom-to-Circuit Ontology v1.0

---

# 1. PURPOSE

This specification defines the exact clinician-facing workflow for Magniom.

The interface must help a specialist answer:

# What are we trying to treat?

# Which aspects of the phenotype have defensible circuit evidence?

# Is this patient's connectomic measurement reliable enough to matter?

# Which target hypotheses are scientifically eligible?

# What did personalisation actually change?

# Where do evidence, phenotype and imaging agree?

# Where do they disagree?

# What target would be reasonable without the functional MRI?

# What is the strongest argument against each candidate?

# What does the clinician ultimately choose?

The interface must not turn:

# algorithmic ranking

into:

# automatic clinical authority.

---

# 2. UX GOVERNING PRINCIPLE

Magniom should feel like:

# a structured scientific case conference

rather than:

# an AI recommendation dashboard.

The interface is therefore organised around:

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

not:

```text
Upload MRI
    ↓
AI recommends target
    ↓
Accept
```

---

# 3. HUMAN-AUTOMATION PRINCIPLE

Magniom must explicitly protect against:

# automation bias.

Automation bias occurs when users over-rely on automated suggestions, including accepting incorrect recommendations or failing to act because the system did not prompt them.

Current FDA CDS guidance specifically considers whether healthcare professionals are able to independently review the basis for software recommendations rather than rely primarily on them.

Magniom therefore adopts:

# inspectability before acceptance.

---

# 4. UX SAFETY MODEL

The UI implements six safety principles.

## 4.1 Clinical formulation precedes algorithm output

The clinician must approve the phenotype before seeing a new Target Slate.

## 4.2 Evidence remains visible

A candidate is never shown without its evidence basis.

## 4.3 Reliability is co-equal with target location

A personalised coordinate cannot appear without measurement reliability.

## 4.4 Counterfactuals remain visible

The clinician can always see what target would have been used without personalisation.

## 4.5 Alternatives are first-class

Primary 1 does not visually erase Primary 2, alternatives, or the evidence-only baseline.

## 4.6 Final selection requires active clinician reasoning

There is no:

# Accept Magniom recommendation

button.

---

# 5. PRIMARY USER

## TMS Specialist

Can:

- formulate phenotype;
- approve treatment priorities;
- inspect MRI/connectomics;
- inspect evidence;
- review target candidates;
- accept/reject/modify candidates;
- select final target(s);
- sign decision.

This is the principal workflow around which the interface is designed.

---

# 6. SECONDARY USERS

## Clinical Reviewer

Can:

- contribute assessment;
- review phenotype;
- review targets;
- leave clinical comments.

Cannot sign unless separately authorised.

## Imaging Specialist

Can:

- inspect imaging QC;
- mark technical concerns;
- review target localisation.

Does not determine clinical target priority.

## Evidence Curator

Uses a separate Evidence Governance workspace.

Does not interact with patient Target Slates by default.

---

# 7. APPLICATION INFORMATION ARCHITECTURE

Primary navigation:

```text
Cases
Evidence
Research
Administration
```

For most specialists:

# Cases

dominates daily use.

Avoid cluttering the global navigation with every scientific module.

---

# 8. CASE ROUTES

Canonical Next.js route architecture:

```text
/cases
/cases/[caseId]

/cases/[caseId]/assessment
/cases/[caseId]/phenotype
/cases/[caseId]/imaging
/cases/[caseId]/connectome
/cases/[caseId]/targets
/cases/[caseId]/compare
/cases/[caseId]/decision
/cases/[caseId]/treatment
/cases/[caseId]/outcomes
/cases/[caseId]/audit
```

Evidence:

```text
/evidence
/evidence/claims
/evidence/circuits
/evidence/target-families
/evidence/sources
```

Research:

```text
/research
/research/cases/[caseId]
```

---

# 9. CASE WORKFLOW

Every case progresses through a visible clinical workflow:

```text
1  Assessment
      ↓
2  Phenotype
      ↓
3  Imaging
      ↓
4  Connectome
      ↓
5  Target Slate
      ↓
6  Clinical Review
      ↓
7  Decision
      ↓
8  Treatment
      ↓
9  Outcomes
```

The workflow is:

# state-driven

not route-driven.

The user may inspect earlier stages after advancing.

---

# 10. WORKFLOW RAIL

Desktop:

persistent horizontal/vertical workflow rail.

Example:

```text
✓ Assessment
✓ Phenotype
✓ Imaging
✓ Connectome
● Targets
○ Decision
○ Treatment
○ Outcomes
```

Use:

- icon
- text
- status

rather than colour alone.

---

# 11. CASE HEADER

Persistent case header:

```text
MAGNIOM
────────────────────────────────────────────────────

MGN-24-0187

Major depressive disorder
Target planning

Phenotype     Approved
Connectome    Qualified
Target Slate  Ready for review

Evidence Library 1.0.0
Target Engine 1.0.0
```

Patient name can be shown where clinically appropriate but should not dominate every screen.

---

# 12. HEADER MUST SHOW STALENESS

If anything has changed:

```text
⚠ Target Slate generated before latest phenotype
```

or:

```text
⚠ New connectome run available
```

Do not silently present stale recommendations as current.

---

# 13. GLOBAL CASE ACTIONS

Allowed actions:

```text
View case summary
Open evidence
View audit history
Export clinical report
```

Do not place:

```text
Accept Target
```

in global header.

Clinical decisions belong only in the dedicated review workflow.

---

# 14. CASE OVERVIEW

Route:

```text
/cases/[caseId]
```

Purpose:

# orient the clinician within 10 seconds.

---

# 15. CASE OVERVIEW STRUCTURE

```text
┌────────────────────────────────────────────────────────────┐
│ Case status                                                 │
│ MDD · Target planning · Target Slate ready                 │
└────────────────────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────┐
│ CLINICAL QUESTION        │ WORKFLOW                         │
│                          │                                  │
│ What are we trying       │ ✓ Assessment                     │
│ to improve?              │ ✓ Phenotype                      │
│                          │ ✓ Imaging                        │
│ Anxious distress         │ ✓ Connectome                     │
│ Dysphoria                │ ● Targets                        │
│ Return to work           │ ○ Decision                       │
└──────────────────────────┴─────────────────────────────────┘

┌──────────────────────────┬─────────────────────────────────┐
│ CONNECTOME               │ CURRENT DECISION STATE          │
│ Qualified                │ Awaiting specialist review      │
│ Reliability: High        │                                 │
│ 27.4 usable minutes      │                                 │
└──────────────────────────┴─────────────────────────────────┘
```

---

# 16. NO TARGET PREVIEW ON CASE OVERVIEW

Before the clinician enters the target-review workspace:

do not display:

> Primary target: [-42,38,31]

on the case overview.

This avoids making the recommendation cognitively dominant before the clinician reviews its basis.

Display:

# Target Slate ready for review.

---

# 17. ASSESSMENT WORKSPACE

Route:

```text
/cases/[caseId]/assessment
```

This is the structured clinical intake.

Sections:

### Diagnosis

### Current episode

### Comorbidity

### Previous treatments

### Prior TMS

### Safety

### Clinical narrative.

---

# 18. ASSESSMENT DESIGN

Avoid:

# giant 80-field form.

Use progressive disclosure.

Example:

```text
Diagnosis
Major depressive disorder                    Confirmed

Current episode                              Edit
Moderate/severe · recurrent · nonpsychotic

Treatment history                            7 entries
Prior TMS                                    1 course

Clinical safety                              Cleared
```

Each expands inline.

---

# 19. CLINICAL SOURCE BADGES

Data should identify origin:

```text
Clinician confirmed
Patient reported
Record verified
Imported
Incomplete
```

Do not make all data appear equally certain.

---

# 20. PHENOTYPE WORKSPACE

Route:

```text
/cases/[caseId]/phenotype
```

Purpose:

# transform assessment data into a clinician-approved treatment phenotype.

This is one of Magniom's most important screens.

---

# 21. PHENOTYPE LAYOUT

Desktop:

```text
┌──────────────────────────────┬──────────────────────────────┐
│ CLINICAL PHENOTYPE           │ TREATMENT PRIORITIES         │
│                              │                              │
│ Mood             Severe      │ 1 Anxiosomatic              │
│ Anhedonia        Severe      │ 2 Dysphoric                 │
│ Anxiety          Severe      │ 3 Cognitive difficulty      │
│ Sleep            Severe      │                              │
│ Cognition        Moderate    │ Target-mappable: 2 / 3      │
│ Function         Severe      │                              │
│                              │ [Review mappings]            │
└──────────────────────────────┴──────────────────────────────┘
```

---

# 22. PHENOTYPE VISUALISATION

Use horizontal domain rows rather than a colourful radar chart.

Why?

Radar charts:

- exaggerate geometric area;
- imply comparable dimensions;
- can look diagnostic.

Preferred:

```text
Depressed mood       Severe
Anhedonia            Severe
Anxiety/worry        Severe
Somatic anxiety      Moderate
Sleep                Severe
Cognition            Moderate
Function             Severe
```

---

# 23. TARGET-MAPPABILITY

Every domain shows:

```text
Clinical importance     High
Circuit mapping         Direct / Partial / None
Evidence                B / —
```

Example:

```text
Anxiosomatic burden
Clinical priority       1
Circuit mapping         Direct
Evidence                Prospectively supported
```

versus:

```text
Cognitive difficulty
Clinical priority       3
Circuit mapping         None in Clinical Mode v1
```

---

# 24. CLINICAL IMPORTANCE ≠ TARGETABILITY

This distinction should be visually explicit.

Recommended microcopy:

> **Clinically important does not necessarily mean independently targetable.**

This is a fundamental Magniom principle.

---

# 25. PRIORITY EDITOR

Clinician can:

- reorder priorities;
- assign importance;
- add rationale.

Interaction:

```text
1  Anxiosomatic burden
   Importance  High
   Why: persistent anxiety is major barrier to return to work.

2  Dysphoric burden
   Importance  High

3  Cognitive difficulty
   Importance  Moderate
```

Do not use drag-and-drop as the only mechanism.

Provide accessible move-up/down controls.

---

# 26. PATIENT GOALS

Patient goals are shown adjacent to clinical priorities.

Example:

```text
Patient goals

• Resume work three days per week
• Reduce morning anxiety
• Re-engage socially
```

The UI explicitly states:

> Goals influence clinical priority but do not map directly to cortical targets.

---

# 27. PHENOTYPE EVIDENCE EXPLAINER

For a circuit-mappable domain:

```text
Why is this target-mappable?
```

opens:

```text
Anxiosomatic burden

Evidence status
Prospectively supported

What this means
A symptom-related treatment circuit has been retrospectively
identified and subsequently tested prospectively in adults
with MDD and significant anxiety.

What this does not mean
This is not a universal target for all anxiety disorders.

[View evidence]
```

---

# 28. APPROVE PHENOTYPE

Primary action:

```text
Approve phenotype for target analysis
```

Before approval:

summary dialog:

```text
Clinical indication
Major depressive disorder

Highest treatment priorities
1 Anxiosomatic
2 Dysphoric

Direct circuit mappings
2

Safety state
Cleared
```

Button:

# Approve phenotype

---

# 29. APPROVAL WARNING

Microcopy:

> Magniom will use this snapshot when generating target candidates. Later changes to clinically material priorities will require a new Target Slate.

---

# 30. NO TARGET INFORMATION BEFORE APPROVAL

The phenotype page must not show current target coordinates while the clinician is editing priorities.

This reduces:

# reverse formulation

where the clinician unconsciously changes the phenotype to fit an attractive target.

---

# 31. IMAGING WORKSPACE

Route:

```text
/cases/[caseId]/imaging
```

Purpose:

# establish whether imaging can support target localisation.

The screen should be intelligible to a psychiatrist while allowing deeper technical inspection for imaging specialists.

---

# 32. IMAGING SUMMARY

Top panel:

```text
CONNECTOME INPUT

Structural MRI             Pass
Resting-state fMRI         Pass
Usable data                27.4 min
Motion                     Low
Registration               High quality

Clinical qualification
PASS
```

---

# 33. QC LEVELS

Expandable:

```text
Q0 Acquisition      Pass
Q1 Structural       Pass
Q2 Functional       Pass
Q3 Connectome       Pass
Q4 Target stability Pending
```

Every line explains:

- what was measured;
- result;
- why it matters.

---

# 34. TECHNICAL DETAIL

Imaging specialist view:

```text
Mean FD                0.14 mm
Censored volumes       7%
Cross-run FC similarity ...
Registration metric    ...
Parcel coverage        ...
```

Technical metrics are available but not forced on every clinician.

---

# 35. FAILURE DESIGN

Failed imaging should not look like application failure.

Example:

```text
Patient-specific connectivity not qualified

The resting-state acquisition does not meet Magniom's
reliability requirements for personalised target refinement.

Target planning can continue using evidence-supported
target families.

Reasons
• 9.1 usable minutes
• 38% motion censoring
• unstable cross-run localisation

[Continue with evidence-based targeting]
```

This normalises abstention.

---

# 36. CONNECTOME WORKSPACE

Route:

```text
/cases/[caseId]/connectome
```

Purpose:

# understand patient-specific measurements before seeing target rank.

This is deliberate.

---

# 37. CONNECTOME WORKSPACE STRUCTURE

```text
Patient connectome

1  Therapeutic circuit concordance
2  Reliability
3  Normative context
4  Target-family measurements
```

The user sees measurements before recommendations.

---

# 38. THREE SCIENTIFIC CATEGORIES

Never combine these into one “brain score”:

## Therapeutic circuit concordance

How strongly does the candidate region align with a treatment-related circuit?

## Normative deviation

How unusual is a connectivity feature relative to a reference population?

## Reliability

How reproducible is the measurement?

They need distinct visual treatments.

---

# 39. CONNECTOME SUMMARY

Example:

```text
Convergent depression circuit
Patient-specific localisation available

Cross-run stability        High
Split-half stability       High
Pipeline sensitivity       Moderate

sgACC relationship
Measured

Normative deviations
4 notable findings
Research relevance only
```

---

# 40. NORMATIVE DEVIATION LANGUAGE

Never:

```text
4 abnormal brain connections
```

Prefer:

```text
4 high-deviation connectivity findings
```

and:

> These findings are contextual and do not independently determine clinical targets.

---

# 41. 3D VIEWER — PURPOSE

The 3D viewer exists to answer:

# Where is this target?

# What anatomical structure does it occupy?

# What circuit does it relate to?

# How far is it from the alternative?

# How uncertain is the localisation?

It is not primarily decorative.

---

# 42. 3D VIEWER TECHNOLOGY

Recommended architecture:

### cortical surface viewer

vtk.js or React Three Fiber depending validated rendering workflow.

### volumetric NIfTI inspection

Niivue or equivalent specialised viewer.

Do not force every modality into one rendering library.

---

# 43. 3D VIEWER CLIENT BOUNDARY

The viewer is a:

# Client Component island.

Everything else remains server-rendered where practical.

Current Next.js 16 remains Active LTS, and the framework's server/client component model supports keeping data-heavy secure rendering server-side while isolating truly interactive components to the browser.

---

# 44. VIEWER DEFAULT

Initial state:

```text
Subject cortical surface
+
selected target ROI
+
target centre
```

Do not default to:

- spinning brain;
- glowing network;
- animated pulses.

---

# 45. VIEWER CONTROLS

Essential controls:

```text
Left / Right / Superior / Medial
Reset view
Zoom
Target overlay
Circuit overlay
Confidence region
Atlas labels
E-field overlay
Compare targets
```

---

# 46. VIEWER LAYERS

Toggle list:

```text
☑ Cortical anatomy
☑ Selected target
☑ Reliability region
☐ Therapeutic circuit
☐ Evidence-only target
☐ Alternative targets
☐ Atlas boundaries
☐ E-field
```

Avoid showing all overlays simultaneously by default.

---

# 47. VIEWER TARGET SYMBOL

Target centre:

small neutral marker.

Reliability:

semi-transparent spatial region.

The confidence region should be visually more prominent than false coordinate precision.

---

# 48. NO “BULLSEYE” METAPHOR

Avoid a glowing bullseye implying:

# this is the exact correct spot.

Prefer:

# cortical region + centre + uncertainty envelope.

---

# 49. TARGET COORDINATE PANEL

Adjacent to viewer:

```text
Subject-space centre
x  -41.2
y   38.6
z   32.1 mm

MNI reference
-43 / 40 / 34

Atlas
HCP-MMP1.0
46 / 9-46d boundary

Spatial reliability
± approx. 6 mm region
```

---

# 50. COORDINATE SPACE ALWAYS VISIBLE

Never show:

```text
[-41,39,32]
```

without:

- subject/MNI label;
- template;
- unit.

---

# 51. TARGET SLATE WORKSPACE

Route:

```text
/cases/[caseId]/targets
```

This is the core Magniom experience.

---

# 52. TARGET REVIEW ENTRANCE

Before revealing candidate details:

```text
Target Slate ready

Magniom identified 2 primary target hypotheses
and 2 additional alternatives.

The slate combines:
• approved phenotype
• Evidence Library 1.0.0
• patient-specific functional connectivity
• target reliability
• anatomical accessibility

A Target Slate is not a treatment prescription.

[Review Target Slate]
```

---

# 53. TARGET WORKSPACE DESKTOP

```text
┌────────────────────┬─────────────────────────────┬──────────────────────┐
│ CLINICAL CONTEXT   │ BRAIN / CIRCUIT            │ TARGET SLATE         │
│                    │                             │                      │
│ MDD                │     3D VIEWER               │ Primary 1            │
│                    │                             │ Evidence anchor      │
│ Priorities         │                             │                      │
│ 1 Anxiosomatic     │                             │ Primary 2            │
│ 2 Dysphoric        │                             │ Symptom circuit      │
│                    │                             │                      │
│ Functional goal    │                             │ Additional A         │
│ Return to work     │                             │ Additional B         │
└────────────────────┴─────────────────────────────┴──────────────────────┘
```

---

# 54. THREE-COLUMN BEHAVIOUR

### Left

Stable clinical context.

### Centre

Spatial/scientific representation.

### Right

Decision hypotheses.

The clinician should never have to leave the page to remember:

> What were we trying to treat?

---

# 55. TARGET CARD DESIGN

Collapsed card:

```text
PRIMARY 1
Evidence anchor

Connectome-refined left-prefrontal target

Evidence              Established family
Personalisation       Qualified
Reliability            High
Clinical coverage      Dysphoric

[Review]
```

Do not show:

```text
Score 92
Confidence 94%
```

---

# 56. TARGET CARD VISUAL PRIORITY

Primary 1 should not be twice the size, glowing, green, or visually “winning.”

Use:

- same basic card size;
- role label;
- subtle ordering.

The user must understand hierarchy without creating overwhelming recommendation salience.

---

# 57. EVIDENCE TIER VISUALS

Suggested visual language:

```text
Established
Prospectively supported
Supporting evidence
Research
```

Use text labels.

Colour can reinforce but never substitute.

---

# 58. TARGET CARD EXPANSION

Expanded sections:

```text
Clinical purpose

Why Magniom nominated this target

Evidence basis

What patient-specific MRI changed

Reliability

Anatomical accessibility

Counterfactual target

Conflicting evidence

Why this target may be wrong
```

The final section is mandatory.

---

# 59. “WHY THIS MAY BE WRONG”

This section should not be collapsed behind an obscure menu.

Example:

```text
Why this may be wrong

• Personalised targeting has not shown universal superiority
  over high-quality standard targeting.

• This target is 19 mm from the evidence-only reference.

• The patient differs from the main prospective study population
  in treatment history.

• A nearby target provides similar circuit engagement.
```

---

# 60. EVIDENCE DRAWER

The evidence system opens as a contextual right-side drawer or large overlay.

It should not navigate the clinician completely away from the case.

---

# 61. EVIDENCE DRAWER DEFAULT

```text
CONVERGENT DEPRESSION CIRCUIT

Evidence status
Prospectively supported

Clinical claim
Patient-specific connectivity to this circuit may refine
left-prefrontal depression targeting.

Strongest support
• Multimodal convergence study
• Randomized connectivity-vs-scalp trial

Conflicting / limiting evidence
• Personalised targeting not universally superior in meta-analysis

Population applicability
Moderate / high

[View full evidence path]
```

---

# 62. EVIDENCE PATH

Expanded view:

```text
Major depressive disorder
        ↓
Established left-prefrontal TMS efficacy
        ↓
Convergent depression circuit
        ↓
Connectivity-guided TargetFamily
        ↓
Patient-specific candidate
```

Each node is clickable.

---

# 63. SOURCE VIEW

For individual study:

```text
Question
What was tested?

Population
Who was studied?

Target
Where and how?

Protocol
What was delivered?

Outcome
What changed?

Why Magniom uses it

What it does not prove
```

This is more useful clinically than reproducing an academic abstract.

---

# 64. EVIDENCE DRAWER MUST SHOW CONFLICT

Never present:

# supporting papers only.

Every candidate evidence drawer contains:

```text
Support
Limitations / conflicts
```

even when no major direct conflict exists.

---

# 65. COUNTERFACTUAL VIEW

Every personalised candidate exposes:

# Without the functional MRI

versus:

# With the functional MRI.

Example:

```text
Evidence-only target
[-38, 44, 30]

Connectome-informed target
[-44, 38, 35]

Distance moved
9.4 mm

Target family
Same

Therapeutic circuit
Same

Interpretation
Modest within-family refinement
```

---

# 66. COUNTERFACTUAL VISUAL

Centre viewer can show:

```text
○ Evidence-only target
● Connectome-informed target
```

with connecting line.

Do not use:

- red vs green;
- bad vs good.

Use neutral labels.

---

# 67. PERSONALISATION EXPLANATION

Provide:

```text
Why Magniom preferred the personalised variant

✓ Same evidence-supported target family
✓ High target reliability
✓ Greater patient-specific circuit concordance
✓ No material accessibility disadvantage

Remaining uncertainty
Clinical superiority of this displacement is not established
for this individual.
```

This mirrors the Target Engine adoption test.

---

# 68. WHEN PERSONALISATION IS REJECTED BY ENGINE

Example:

```text
Patient-specific refinement not adopted

The functional-connectivity target was measurable but did
not provide enough additional circuit concordance to displace
the evidence-only reference target.

Evidence-only target retained as Primary 1.

[View personalised alternative]
```

This is a powerful trust feature.

---

# 69. LOW-RELIABILITY CONNECTOME

If FC exists but cannot influence ranking:

```text
Patient-specific target shown for context only

Reliability: Low

This location did not influence Magniom's Clinical Target Slate.
```

It should be visually marked:

# Not used for ranking

rather than merely greyed out.

---

# 70. TARGET COMPARISON

Route:

```text
/cases/[caseId]/compare
```

or overlay from target workspace.

Purpose:

# compare competing hypotheses without forcing one score.

---

# 71. COMPARISON TABLE

Example:

| | Primary 1 | Primary 2 | Additional A |
|---|---|---|---|
| Role | Evidence anchor | Symptom circuit | Standard alternative |
| Target family | Left DLPFC | DMPFC | Left DLPFC |
| Evidence | Established + B refinement | Prospectively supported | Established |
| Clinical domain | Dysphoric | Anxiosomatic | Dysphoric |
| Patient FC | Strong | Moderate/strong | Not used |
| Reliability | High | High | N/A |
| Personalisation | 9.4 mm refinement | Group/circuit | None |
| Accessibility | Good | Good | Good |
| Main uncertainty | Personalisation value | Smaller evidence base | Less individualised |

No “Winner” column.

---

# 72. COMPARISON SORTING

User may sort by:

- role;
- evidence;
- clinical domain;
- reliability.

Default remains:

# Target Slate role order.

Do not allow sorting by hidden composite algorithm score in standard clinical view.

---

# 73. SPATIAL COMPARE

Select two candidates:

viewer overlays both.

Panel shows:

```text
Centre distance           23.4 mm
Surface geodesic          29.1 mm
Same TargetFamily         No
Same therapeutic circuit  No
E-field overlap           Low
```

This helps the clinician determine whether targets are meaningfully distinct.

---

# 74. CONVERGENCE VIEW

Separate panel:

```text
TARGET CONVERGENCE

Evidence anchor            ●
Dysphoric circuit          ●  6 mm
Individual FC              ●  8 mm

Overall convergence
HIGH

Interpretation
Multiple independent reasoning paths identify approximately
the same left-prefrontal region.
```

---

# 75. LOW CONVERGENCE VIEW

```text
TARGET CONVERGENCE
LOW

Evidence anchor
left DLPFC

Connectome optimum
31 mm away

Anxiosomatic circuit
dorsomedial PFC

Interpretation
The principal evidence, patient-specific connectivity and
secondary phenotype nominate materially different locations.

This increases decision uncertainty.
```

No recommendation should be made more visually emphatic simply to resolve the discomfort of disagreement.

---

# 76. UNCERTAINTY PANEL

Every target has a persistent:

# Uncertainty

section.

Dimensions:

```text
Evidence uncertainty
Phenotype uncertainty
Connectome uncertainty
Spatial uncertainty
Normative-model uncertainty
Accessibility uncertainty
External-validity uncertainty
```

---

# 77. UNCERTAINTY PRESENTATION

Avoid:

```text
Overall confidence: 71%
```

Prefer:

```text
Evidence                High
Phenotype fit           High
Connectome reliability  High
Spatial stability       Moderate
External validity       Moderate
```

with explanation.

---

# 78. UNCERTAINTY MUST NOT BE HIDDEN IN TOOLTIP

Critical uncertainty belongs on the target card.

Tooltips may explain terminology.

They must not be the only place where significant limitations appear.

---

# 79. UNCERTAINTY LANGUAGE

Good:

> The location is stable across both resting-state runs but shifts moderately when global signal regression is removed.

Bad:

> AI confidence reduced to 78%.

---

# 80. CLINICIAN REVIEW MODE

Once the specialist has inspected the Target Slate:

button:

# Begin clinical decision

opens:

```text
/cases/[caseId]/decision
```

This is a distinct cognitive phase.

---

# 81. WHY DECISION IS A SEPARATE SCREEN

Review and decision should not happen simultaneously.

This reduces:

# click-through acceptance.

Review:

> understand the hypotheses.

Decision:

> deliberately state clinical judgement.

---

# 82. DECISION WORKSPACE

Layout:

```text
┌────────────────────────────────────────┐
│ FINAL CLINICAL TARGET REVIEW           │
└────────────────────────────────────────┘

Clinical priorities
1 Anxiosomatic
2 Dysphoric

Magniom Target Slate
Primary 1 ...
Primary 2 ...

Your decision
[ ] Candidate 1
[ ] Candidate 2
[ ] Standard target
[ ] Clinician-defined target
[ ] No target selected
```

---

# 83. CANDIDATE DECISIONS

For each:

```text
Accept
Reject
Modify
Replace
Defer
```

The clinician must actively choose.

There is no preselected:

```text
Accept
```

state.

---

# 84. ACCEPT

Selecting:

# Accept

requires structured rationale.

Possible reasons:

```text
Strong clinical fit
Strong evidence
Connectome support
Prior response
Good accessibility
Other
```

At least one.

---

# 85. REJECT

Requires reason:

```text
Weak clinical fit
Evidence concern
Connectome conflict
Low reliability
Anatomical concern
E-field concern
Prior nonresponse
Patient preference
Clinician judgement
Other
```

---

# 86. MODIFY

If clinician modifies target:

show simultaneously:

```text
Magniom candidate
●

Clinician modification
○

Distance
6.3 mm
```

Require rationale.

The original candidate remains immutable.

---

# 87. REPLACE

Clinician may:

- select another Magniom candidate;
- choose standard evidence target;
- define another clinically defensible target.

The application does not force the final target to originate from the Target Slate.

---

# 88. NO TARGET

Explicit option:

# No target selected / TMS plan deferred

Reasons may include:

- clinical reassessment needed;
- imaging insufficient;
- treatment indication changed;
- patient preference;
- another treatment pathway preferred.

This must be a normal valid decision.

---

# 89. FINAL TARGET SELECTION

Once candidate-level review is complete:

```text
FINAL TARGETS

1  Left-prefrontal connectome-refined target

2  Dorsomedial anxiosomatic target
```

But UI explicitly states:

> Selection of more than one target does not define treatment sequence or protocol.

---

# 90. TARGET ≠ PROTOCOL

No protocol selector appears inside target decision v1.

A future Protocol Module may follow.

This avoids implying:

```text
Target 2
→ automatically iTBS
```

---

# 91. REQUIRED FINAL REASONING

Before signing:

```text
Clinical reasoning
```

multiline field.

Prompt:

> Summarise why the selected target(s) best address the current treatment objectives and how Magniom influenced, or did not influence, your decision.

This must not be pre-filled with algorithm-generated prose.

---

# 92. WHY FINAL REASONING IS NOT AUTO-GENERATED

If Magniom wrote the clinician's rationale before the clinician had formed it:

it would reinforce automation bias.

The clinician should author the substantive decision rationale.

Magniom may later generate a separate report summary after signature.

---

# 93. MAGNIOM INFLUENCE FIELD

Clinician selects:

```text
None
Minor
Moderate
Major
```

Prompt:

> How much did Magniom change your target decision compared with your independent clinical reasoning?

This becomes valuable validation data.

---

# 94. DISAGREEMENT FIELD

If clinician rejects Primary 1:

optional/required structured prompt:

> Where did your reasoning differ from Magniom?

This is not an error report.

It creates scientific feedback.

---

# 95. PRE-SIGN REVIEW

Summary:

```text
Clinical indication
MDD

Phenotype
Anxiosomatic > Dysphoric

Magniom Slate
2 primary + 2 alternatives

Final clinician selection
Target X
Target Y

Magniom influence
Moderate

Outstanding warnings
Low convergence
```

---

# 96. ATTESTATION

Required:

> I have independently reviewed the clinical context, evidence provenance, target reliability, alternatives and limitations. The final target selection represents my clinical decision and not an autonomous Magniom prescription.

Checkbox:

```text
☐ I confirm
```

Then:

# Sign target decision

---

# 97. SIGN BUTTON SAFETY

Button label:

# Sign target decision

Not:

# Approve Magniom recommendation.

That distinction is deliberate.

---

# 98. SIGNING CONFIRMATION

After signature:

```text
Target decision signed

Dr ...
1 September 2026 · 16:42

This record is now immutable.

[View signed decision]
[Generate report]
```

---

# 99. SUPERSESSION

If changes are needed:

button:

# Create revised target decision

not:

# Edit.

Show:

```text
Decision 1
Signed 1 Sep 2026
Superseded

Decision 2
Current
```

---

# 100. AUTOMATION-BIAS SAFEGUARD 1 — PHENOTYPE FIRST

The clinician cannot generate the Target Slate without approving:

- diagnosis;
- priorities;
- safety.

This prevents target recommendations from shaping the initial formulation.

---

# 101. SAFEGUARD 2 — NO TARGET ON DASHBOARD

Target coordinates do not appear as teaser information before the review workflow.

---

# 102. SAFEGUARD 3 — NO SINGLE “AI ANSWER”

Magniom shows:

# candidate slate

not:

# Recommended Target.

---

# 103. SAFEGUARD 4 — ROLE LABELS OVER NUMERIC RANKING

Show:

```text
Evidence anchor
Symptom circuit
Connectome refinement
Alternative
```

alongside Primary position.

Avoid presenting one continuous confidence score.

---

# 104. SAFEGUARD 5 — EVIDENCE-ONLY COUNTERFACTUAL

The conventional evidence-based option remains visible whenever personalisation changes the target.

This makes personalisation contestable.

---

# 105. SAFEGUARD 6 — MANDATORY COUNTERARGUMENT

Every candidate displays:

# Why this may be wrong.

A recommendation without a counterargument is a UX defect.

---

# 106. SAFEGUARD 7 — RELIABILITY BESIDE TARGET

Do not make users open a technical tab to discover that the target is unstable.

Reliability belongs on the candidate card.

---

# 107. SAFEGUARD 8 — CONFLICTING EVIDENCE

Evidence drawer must show:

# limitations/conflicting evidence

with approximately equal navigational prominence to supporting evidence.

---

# 108. SAFEGUARD 9 — NO DEFAULT ACCEPTANCE

No candidate is preselected on decision page.

---

# 109. SAFEGUARD 10 — ACTIVE REASONING

Accept/reject/modify requires structured reason.

---

# 110. SAFEGUARD 11 — NO “GREEN MEANS GOOD”

Do not encode:

```text
green target = choose
yellow = maybe
red = reject
```

Use text and icons.

Colour only reinforces state.

---

# 111. SAFEGUARD 12 — ABSTENTION AS NORMAL

An evidence-only result or no personalised refinement must not look like system failure.

---

# 112. SAFEGUARD 13 — LOW CONVERGENCE IS VISIBLE

The interface does not collapse disagreement into an average score.

---

# 113. SAFEGUARD 14 — CLINICIAN CAN CHOOSE OUTSIDE SLATE

Within clinical governance, the specialist may define a different target.

---

# 114. SAFEGUARD 15 — FINAL RATIONALE IS HUMAN-WRITTEN

The system does not pre-author the decision reasoning.

---

# 115. SAFEGUARD 16 — NO TIME-CRITICAL TARGETING

Magniom should not be designed as:

# urgent decision support.

The clinician has time to inspect evidence and basis.

This aligns with current FDA CDS thinking that independent review is harder when software outputs become highly automated or time-critical.

---

# 116. SAFEGUARD 17 — RESEARCH MODE VISUALLY DISTINCT

Persistent banner:

# RESEARCH MODE — NOT A CLINICAL TARGET RECOMMENDATION

Research candidates cannot be mistaken for clinical candidates.

---

# 117. SAFEGUARD 18 — ALGORITHM VERSION VISIBLE

Clinical review footer:

```text
Target Engine 1.0.0
Evidence Library 1.0.0
Phenotype Ontology 1.0.0
Connectome Pipeline 1.0.0
```

This helps the clinician understand that the result is a specific versioned computation, not timeless truth.

---

# 118. OPTIONAL ADVANCED SAFEGUARD — PRE-MAGNIOM CLINICAL IMPRESSION

For validation studies, before Target Slate is revealed, ask clinician:

```text
Without reviewing Magniom's Target Slate,
which target family would you currently consider?
```

Options:

- standard left DLPFC;
- dorsomedial;
- other;
- uncertain.

This records:

# independent pre-software judgement.

Recommended initially for:

# validation/research mode.

Not necessarily mandatory in routine production because of workflow burden.

---

# 119. OPTIONAL DEBIASING STEP

After reviewing Primary 1 but before final decision:

prompt:

> What is the strongest reason you would *not* select this target?

This can be tested in human-factors validation.

Do not impose unvalidated cognitive forcing functions blindly in production.

---

# 120. ALERT PHILOSOPHY

Avoid excessive modal alerts.

AHRQ materials on CDS note that alert overload can lead users to ignore or override alerts, and human-automation design should support clinician mental models rather than create automation surprises.

Therefore Magniom uses:

# persistent contextual warnings

more often than:

# pop-up interruptions.

---

# 121. ALERT LEVELS

## Blocking

Examples:

- stale Target Slate;
- unsigned/unauthorised clinician;
- Research target entering Clinical Mode.

Requires action.

## Important

Examples:

- low convergence;
- moderate reliability;
- external validity concern.

Visible persistently, non-modal.

## Informational

Examples:

- new evidence release available.

Does not interrupt review.

---

# 122. VISUAL DESIGN PRINCIPLE

Magniom should feel:

# precise
# calm
# clinically serious
# contemporary
# evidence-literate.

Avoid:

- neon neurotechnology;
- glowing brain aesthetics;
- AI gradients;
- leaderboard styling;
- stock medical imagery;
- gamification.

---

# 123. COLOUR SYSTEM

Recommended semantic use:

### Neutral graphite

normal clinical content.

### Eucalyptus / muted green

completed workflow state, not “good target.”

### Mineral blue

selected information / prospectively supported evidence.

### Ochre

uncertainty / conditional.

### Plum

Research Mode.

### Red

reserved for genuine safety/error states.

Do not use red for:

> scientifically weaker alternative.

---

# 124. TYPOGRAPHY

Use:

- highly legible sans-serif for UI;
- tabular numerals for coordinates/metrics;
- strong hierarchy;
- restrained size variation.

Do not use tiny grey evidence text.

Scientific limitations are primary content.

---

# 125. DENSITY

Clinicians tolerate more information density than consumer applications.

Magniom should therefore avoid:

# giant decorative whitespace

while maintaining strong grouping.

Aim:

# dense but calm.

---

# 126. PROGRESSIVE DISCLOSURE

Each complex scientific object follows:

```text
Summary
  ↓
Clinical interpretation
  ↓
Technical detail
  ↓
Full provenance
```

Example reliability:

```text
High
↓
Cross-run 5.2 mm
↓
split-half 6.4 mm / pipeline sensitivity 4.8 mm
↓
full processing manifest
```

---

# 127. RESPONSIVE DESIGN

Primary design target:

# clinical desktop / large laptop.

Tablet:

supported.

Mobile:

case review and status supported.

Full target planning and 3D comparison should display:

> For optimal clinical review, use a larger screen.

Do not attempt to squeeze three-column decision workflow into a phone.

---

# 128. TABLET LAYOUT

Tablet:

```text
Clinical context
↓
Viewer
↓
Target Slate
```

with persistent candidate selector.

---

# 129. ACCESSIBILITY

Target:

# WCAG 2.2 AA.

Critical scientific meaning must not depend on:

- colour;
- pointer hover;
- 3D manipulation;
- animation.

Every 3D view has a text/table equivalent.

---

# 130. KEYBOARD ACCESS

All clinical decisions:

- accept;
- reject;
- open evidence;
- compare;

must be keyboard accessible.

Viewer manipulation may have specialised controls but must not be required to complete a clinical decision.

---

# 131. SCREEN-READER TARGET REPRESENTATION

Example:

> Primary 1. Evidence anchor. Left prefrontal connectome-refined target. Established target family with prospectively supported circuit refinement. Reliability high. Nine-point-four millimetre displacement from evidence-only target.

---

# 132. MOTION

Minimise motion.

No:

- auto-rotating brain;
- pulsing target;
- animated confidence meter.

Respect:

```text
prefers-reduced-motion
```

---

# 133. NEXT.JS APPLICATION ARCHITECTURE

Use current:

# Next.js 16 Active LTS

with current security patch.

As of 1 September 2026, Next.js 16.3.3 is the current security-patched Active LTS release.

---

# 134. SERVER COMPONENT DEFAULT

Use Server Components for:

```text
Case shell
Case overview
Phenotype data
Imaging summaries
Evidence
Target metadata
Decision history
Audit
```

Benefits:

- patient data fetching remains server-side;
- less browser JavaScript;
- smaller exposure surface.

---

# 135. CLIENT COMPONENTS

Use Client Components only for:

```text
3D viewer
interactive target comparison
complex form state
priority reordering
decision interactions
realtime job status
```

Maintain the network boundary explicitly.

---

# 136. ROUTE COMPONENT MODEL

Example:

```text
app/
└── cases/
    └── [caseId]/
        ├── layout.tsx
        ├── page.tsx
        ├── phenotype/
        │   └── page.tsx
        ├── imaging/
        │   └── page.tsx
        ├── connectome/
        │   └── page.tsx
        ├── targets/
        │   └── page.tsx
        ├── compare/
        │   └── page.tsx
        └── decision/
            └── page.tsx
```

---

# 137. FEATURE STRUCTURE

```text
features/
├── cases/
├── phenotype/
├── imaging/
├── connectome/
├── targets/
├── evidence/
├── decisions/
└── audit/
```

Each feature owns:

- queries;
- domain adapters;
- components;
- client islands.

---

# 138. SERVER-SIDE COMMANDS

Clinical mutations pass through explicit commands:

```text
approvePhenotype()
requestTargetSlate()
startTargetReview()
saveCandidateDecision()
signTargetDecision()
supersedeDecision()
```

Do not perform generic:

```text
supabase.from('...').update(...)
```

inside random Client Components.

---

# 139. DATA FETCHING

Case route loads:

- authorised case context;
- role permissions;
- workflow state.

Feature routes fetch only required data.

Avoid loading:

# entire MRI/target/evidence database

into one page request.

---

# 140. CLIENT STATE

Do not duplicate authoritative clinical state into long-lived browser stores.

Browser state is appropriate for:

- selected viewer target;
- active comparison;
- open tabs.

Supabase/Postgres remains authoritative for:

- candidate reviews;
- clinical decisions;
- Target Slate state.

---

# 141. OPTIMISTIC UI

Use optimistic UI cautiously.

Appropriate:

- opening/closing panel;
- locally selecting comparison candidate.

Avoid optimistic display for:

- phenotype approval;
- decision signing;
- Target Slate publication.

These should wait for server confirmation.

---

# 142. REALTIME

Realtime updates may show:

```text
Connectome processing 72%
Target analysis complete
```

When authoritative state changes:

reload/refresh server state.

Realtime message itself is not clinical truth.

---

# 143. LOADING STATES

Long compute:

```text
Functional connectome processing

Structural preprocessing       Complete
BOLD preprocessing             Complete
Connectome                     Running
Reliability                    Pending
Target generation              Pending
```

Do not display fake percent precision if worker stages cannot support it.

---

# 144. TARGET GENERATION LOADING

Prefer:

```text
Evaluating evidence-supported target families
```

then:

```text
Qualifying patient-specific connectivity
```

not:

> AI is thinking.

---

# 145. EMPTY STATE

If no Primary 3:

```text
No third primary candidate

Remaining candidates were redundant with the selected
therapeutic circuits or did not add sufficient clinical
information.
```

This makes restraint look intentional.

---

# 146. ERROR STATE

Technical failure:

```text
Target analysis could not be completed

No clinical Target Slate was published.

Technical code:
MAGN-TGT-...

[Retry analysis]
[View technical details]
```

Do not show partially generated candidates.

---

# 147. SCIENTIFIC ABSTENTION STATE

Different from error:

```text
Magniom did not personalise this target

The functional-connectivity measurement did not meet the
reliability threshold required for clinical refinement.

Evidence-supported target planning remains available.
```

---

# 148. STALE STATE

If phenotype changes:

```text
Target Slate is no longer current

This slate was generated from Phenotype Snapshot 3.
Snapshot 4 has since been approved.

[Generate updated Target Slate]

Previous slate remains available for audit.
```

Signing blocked.

---

# 149. SESSION SAFETY

Warn before session expiry while editing substantial clinical content.

Autosave:

# draft forms only.

Never autosign or autoapprove anything.

---

# 150. UNSAVED CHANGES

If clinician leaves modified phenotype:

```text
You have unsaved changes.
```

Options:

```text
Save draft
Discard
Stay
```

---

# 151. EVIDENCE VERSION CHANGE

If new Evidence Library exists during active review:

```text
New evidence release available

This Target Slate was generated using Evidence Library 1.0.0.
Version 1.1.0 is now active.

The current Target Slate remains historically valid.

[Review evidence changes]
[Generate new Target Slate]
```

Do not silently update.

---

# 152. AUDIT VIEW

Route:

```text
/cases/[caseId]/audit
```

Clinician-readable timeline:

```text
10:14 Phenotype approved
      Dr X

10:18 Connectome qualified
      Pipeline 1.0.0

10:19 Target Slate generated
      Engine 1.0.0

11:03 Primary 1 reviewed
      Dr X

11:22 Target decision signed
      Dr X
```

---

# 153. AUDIT TECHNICAL VIEW

Expandable:

- event ID;
- version;
- hashes;
- request/correlation ID.

Do not overwhelm routine clinical users with hashes unless requested.

---

# 154. CLINICAL REPORT

Generated after sign-off.

Sections:

```text
Clinical question
Approved phenotype
Imaging qualification
Target Slate
Evidence and reliability
Clinician review
Final target selection
Clinical reasoning
Version manifest
```

The signed report reflects:

# clinician decision

not merely the Target Engine output.

---

# 155. REPORT TARGET LANGUAGE

Use:

> Magniom nominated...

Then:

> The treating specialist selected...

Never blur these two.

---

# 156. RESEARCH MODE

Research Mode uses distinct layout:

```text
════════════════════════════════════════
RESEARCH MODE
Not a Clinical Target Recommendation
════════════════════════════════════════
```

Persistent at top.

---

# 157. RESEARCH TARGET CARD

Example:

```text
RESEARCH HYPOTHESIS

L8Av normative-connectivity anomaly

Evidence
Proof-of-concept / observational

Clinical eligibility
Not eligible in Clinical Mode v1
```

No Accept button.

---

# 158. RESEARCH-TO-CLINICAL BOUNDARY

A clinician cannot:

```text
Promote to Clinical
```

inside patient workspace.

Evidence promotion occurs only in Evidence Governance through a new release.

---

# 159. HUMAN-FACTORS VALIDATION

The UX itself requires validation.

The FDA's August 2026 human-factors guidance emphasises identifying and reducing use-related risks and designing around intended users, uses and use environments.

Magniom should therefore maintain:

# Human Factors Validation Protocol.

---

# 160. CRITICAL USER TASKS

At minimum test whether clinicians can correctly:

### Task 1

Determine what clinical phenotype the Target Slate was based on.

### Task 2

Identify whether patient-specific FC influenced Primary 1.

### Task 3

Find the evidence-only target.

### Task 4

Identify target reliability.

### Task 5

Identify conflicting evidence.

### Task 6

Recognise a Research-only candidate.

### Task 7

Recognise low target convergence.

### Task 8

Reject Primary 1.

### Task 9

Modify a candidate location.

### Task 10

Select no target.

### Task 11

Identify a stale Target Slate.

### Task 12

Sign a target decision.

---

# 161. CRITICAL USE ERRORS

Potential harmful UX failures:

```text
Clinician mistakes candidate for prescription.
Clinician assumes highest rank means proven superiority.
Clinician misses low reliability.
Clinician misses Research status.
Clinician misses evidence conflict.
Clinician signs stale slate.
Clinician thinks three primaries means treat all three.
Clinician confuses MNI coordinate with subject-space target.
Clinician mistakes normative anomaly for pathology.
Clinician cannot find evidence-only alternative.
```

Each must receive explicit design mitigation and validation testing.

---

# 162. USABILITY TEST POPULATION

Include:

- experienced TMS psychiatrists;
- TMS clinicians with modest connectomics knowledge;
- neuroimaging specialists;
- research users.

Do not test only with Magniom's designers.

---

# 163. FORMATIVE TESTING

Run repeated formative studies during prototype development.

Observe:

- navigation errors;
- interpretation errors;
- missed warnings;
- reliance on Primary 1;
- confusion between evidence and FC;
- 3D-viewer misunderstanding.

---

# 164. AUTOMATION-BIAS TEST

Human-factors study should deliberately include cases where:

### Case A

Magniom Primary 1 is clinically reasonable.

### Case B

Primary 1 has low/conditional evidence issue.

### Case C

clinician should reject Primary 1 because of provided clinical information.

### Case D

personalisation fails reliability.

Measure:

# inappropriate recommendation acceptance.

---

# 165. ORDER-EFFECT TEST

Test whether showing:

```text
Primary 1
```

first materially increases acceptance independent of content.

Potential mitigations to experimentally compare:

### Design A

rank-first.

### Design B

role-first.

### Design C

side-by-side equal presentation.

Production choice should be evidence-informed.

---

# 166. COLOUR-BIAS TEST

Test whether target colour alters perceived quality.

Production target colours should therefore primarily distinguish:

- selected overlay;
- candidate identity.

Not evidence strength.

---

# 167. 3D SALIENCE TEST

A visually attractive cortical target may appear more credible.

Test:

- 3D target plus evidence;
- text-only equivalent.

Clinician interpretation should remain consistent.

This is an underappreciated automation-bias risk.

---

# 168. TIME-TO-DECISION

Measure:

- phenotype completion;
- evidence review;
- target comparison;
- final decision.

Goal:

reduce unnecessary work

without:

# making acceptance frictionless.

---

# 169. UX ANALYTICS

Useful product metrics:

```text
cases completed
time per workflow stage
evidence drawer opened
counterfactual viewed
uncertainty viewed
candidate comparison used
override rate
modification rate
no-target rate
stale-slate frequency
```

---

# 170. ANALYTICS MUST NOT SCORE CLINICIANS

Do not create:

> Dr X rejects Magniom more than colleagues.

for performance management.

Override behaviour is scientific validation data, not an employee score.

---

# 171. AUTOMATION RELIANCE METRIC

Research-only metric:

```text
Magniom agreement rate
```

stratified by:

- evidence tier;
- reliability;
- convergence.

It may help identify over-reliance.

---

# 172. CLINICIAN DISAGREEMENT IS NOT FAILURE

A healthy decision-support system should produce:

# meaningful overrides.

Zero override rate could indicate:

- extraordinary accuracy

or:

- severe automation bias.

Therefore override rate must be interpreted scientifically.

---

# 173. UX COMPONENT LIBRARY

Core components:

```text
CaseWorkflowRail
CaseStatusHeader
ClinicalPriorityList
PhenotypeDomainRow
CircuitMappabilityBadge
ImagingQualificationCard
ReliabilityPanel
BrainSurfaceViewer
TargetMarker
ReliabilityRegionOverlay
CircuitOverlay
TargetSlateCard
TargetEvidenceDrawer
EvidencePath
TargetCounterfactualPanel
TargetComparisonTable
ConvergencePanel
UncertaintyMatrix
CandidateDecisionForm
ClinicianAttestation
VersionManifest
AuditTimeline
ResearchModeBanner
```

---

# 174. COMPONENT SCIENTIFIC CONTRACTS

Each component accepts canonical domain objects.

Example:

```text
TargetSlateCard(TargetCandidate)
```

not:

```text
TargetSlateCard({
  title,
  score,
  colour
})
```

The component should not recreate scientific semantics.

---

# 175. PRESENTATION ADAPTER

Create a typed presentation layer:

```text
domain object
      ↓
presentation adapter
      ↓
UI component
```

Example:

```text
TargetReliabilityProfile
↓
formatTargetReliability()
↓
ReliabilityPanel
```

This avoids different pages interpreting the same scientific object differently.

---

# 176. NO FRONTEND SCIENTIFIC LOGIC

The frontend must not calculate:

- evidence tier;
- TargetFamily eligibility;
- reliability class;
- convergence class;
- target rank.

It displays canonical server outputs.

---

# 177. FRONTEND MAY CALCULATE

Pure display transformations:

- millimetres → formatted text;
- dates;
- chart scales;
- camera positions.

No clinical semantics.

---

# 178. TARGET REVIEW STATE

Frontend can store local:

```text
currently selected candidate
currently visible overlays
open evidence section
```

but saved clinical review state lives server-side.

---

# 179. URL STATE

Useful non-sensitive interface state may appear in search parameters:

```text
?target=candidate-id
&overlay=circuit
```

Do not encode:

- patient name;
- clinical notes;
- sensitive interpretation

in URLs.

---

# 180. EVIDENCE DRAWER URL

Support deep link:

```text
/cases/[caseId]/targets?target=...&evidence=claim-id
```

This allows clinical collaboration without copying text manually.

Authorisation still applies.

---

# 181. PRINT / EXPORT

A printed target comparison must retain:

- target role;
- evidence;
- reliability;
- coordinate space;
- uncertainty;
- disclaimer that slate is not prescription.

Never print a target screenshot without context.

---

# 182. VERSION FOOTER

Every scientific decision screen contains a subtle footer:

```text
Magniom Target Engine 1.0.0
Evidence Library 1.0.0
Phenotype Ontology 1.0.0
Neuro Pipeline 1.0.0

Generated 1 Sep 2026 · 10:19
```

---

# 183. HELP SYSTEM

Contextual help:

```text
What is therapeutic-circuit concordance?
What does target reliability mean?
What is the evidence-only target?
Why is a target Research only?
```

Definitions should be concise.

Do not rely on a giant external user manual for routine interpretation.

---

# 184. GLOSSARY

Global clinical glossary includes:

```text
Therapeutic Circuit
Target Family
Target Candidate
Evidence Anchor
Connectome Refinement
Target Reliability
Counterfactual Target
Convergence
Normative Deviation
Evidence Tier
```

---

# 185. ONBOARDING

First use:

short guided walkthrough using:

# synthetic case.

Not actual patient data.

The clinician should practice:

- phenotype approval;
- target comparison;
- rejecting a candidate;
- signing.

---

# 186. COMPETENCY

For validation/regulated deployment, consider requiring:

# training completion

before `tms_signing_authority`.

Training should test interpretation, not merely button location.

---

# 187. SYNTHETIC TRAINING CASE

The training case should intentionally include:

- good evidence anchor;
- unreliable personalised target;
- attractive Research anomaly.

Correct workflow:

reject Research candidate and understand why FC was not used.

---

# 188. HELP MUST NOT BECOME MARKETING

Avoid help copy such as:

> Magniom's advanced AI precisely identifies optimal targets.

Use:

> Magniom combines evidence, clinician-approved phenotype and patient-specific connectomic measurements to generate candidate targets for specialist review.

---

# 189. FIRST UX IMPLEMENTATION MILESTONE

Build without real MRI.

Use synthetic:

- phenotype;
- candidate targets;
- reliability;
- evidence.

Implement:

```text
Case Overview
Phenotype
Target Slate
Evidence Drawer
Comparison
Decision
Sign-off
```

This allows clinical workflow testing before 3D complexity.

---

# 190. SECOND MILESTONE

Add static cortical surface viewer.

Targets:

- evidence-only;
- connectome candidate;
- symptom target.

Validate coordinate presentation.

---

# 191. THIRD MILESTONE

Add:

- real subject surface;
- reliability region;
- therapeutic circuit overlay.

---

# 192. FOURTH MILESTONE

Add:

- Connectome QC workspace;
- live NeuroCompute workflow;
- processing status.

---

# 193. FIFTH MILESTONE

Add:

- E-field overlay;
- navigation export.

Only after the clinical review workflow is stable.

---

# 194. SIXTH MILESTONE

Human-factors validation with practising TMS specialists.

Do not wait until product completion.

---

# 195. UX GOLDEN CASE 1 — HIGH CONVERGENCE

Expected:

- one strong Primary;
- evidence-only target visible as alternative;
- no artificial Primary 2/3 duplication;
- high convergence shown;
- clinician understands why only one Primary exists.

---

# 196. UX GOLDEN CASE 2 — ANXIOUS DEPRESSION

Expected:

- evidence anchor and anxiosomatic hypothesis both visible;
- distinct clinical purposes;
- neither displayed as universal winner.

---

# 197. UX GOLDEN CASE 3 — LOW RELIABILITY

Expected:

- personalised location visually available only as context;
- obvious “not used for ranking” label;
- evidence anchor dominant by scientific reason, not colour.

---

# 198. UX GOLDEN CASE 4 — LOW CONVERGENCE

Expected:

- disagreement clearly visible;
- no averaged “compromise target” invented;
- clinician prompted to inspect competing bases.

---

# 199. UX GOLDEN CASE 5 — RESEARCH ANOMALY

Expected:

- Research banner;
- no Accept clinical action;
- clinician can inspect hypothesis without confusing it with the Target Slate.

---

# 200. UX GOLDEN CASE 6 — STALE SLATE

Expected:

- stale warning immediately visible;
- sign button disabled;
- new slate generation available.

---

# 201. UX GOLDEN CASE 7 — CLINICIAN OVERRIDE

Expected:

- override straightforward;
- structured rationale required;
- no threatening “Are you sure you want to ignore AI?” language.

---

# 202. UX GOLDEN CASE 8 — NO TARGET

Expected:

- clinician can complete decision with no target;
- no error;
- rationale captured.

---

# 203. UX GOLDEN CASE 9 — MODIFIED TARGET

Expected:

- original and modified target both visible;
- distance calculated;
- original remains immutable.

---

# 204. UX GOLDEN CASE 10 — EVIDENCE CHANGE

Expected:

- old slate retains version;
- new Evidence Library notice visible;
- no silent recomputation.

---

# 205. CLINICAL ACCEPTANCE CRITERIA

Before Clinical Mode release, a representative specialist should be able to determine without assistance:

### what the patient phenotype is;

### which domains are target-mappable;

### which TargetFamily supports Primary 1;

### whether FC changed Primary 1;

### how reliable the change is;

### where the evidence-only target lies;

### what evidence conflicts with personalisation;

### whether Primary 2 represents a genuinely different clinical hypothesis;

### how to reject Primary 1;

### how to select a clinician-defined target;

### how to sign;

### whether the record is current.

---

# 206. AUTOMATION-BIAS ACCEPTANCE CRITERION

Clinical release should not occur if usability testing demonstrates that clinicians routinely:

- accept Primary 1 without reviewing evidence/reliability;
- mistake ranking for efficacy probability;
- overlook the standard alternative;
- mistake Research Mode hypotheses for clinical recommendations.

These are:

# safety failures,

not cosmetic UX issues.

---

# 207. UX RISK REGISTER

## Risk — Rank anchoring

**Mitigation:** Role-based presentation, alternatives, equal card styling.

## Risk — 3D visual authority

**Mitigation:** uncertainty region, text equivalence, no bullseye aesthetics.

## Risk — Colour authority

**Mitigation:** no red/green target quality scale.

## Risk — Algorithmic confidence illusion

**Mitigation:** decomposed qualitative uncertainty.

## Risk — Confirmation bias

**Mitigation:** mandatory counterarguments and conflicting evidence.

## Risk — Reverse clinical formulation

**Mitigation:** phenotype approved before Target Slate.

## Risk — Status-quo bias

**Mitigation:** evidence-only target shown as comparator, not automatically preferred.

## Risk — Novelty bias

**Mitigation:** personalised target must earn adoption.

## Risk — Alert fatigue

**Mitigation:** contextual warnings rather than repeated modals.

## Risk — Research/clinical leakage

**Mitigation:** separate mode, data and actions.

---

# 208. USER EXPERIENCE PHILOSOPHY

Magniom should make the user feel:

> **I understand why these targets are being considered.**

Not:

> **The software knows the answer.**

That distinction is the central design objective.

---

# 209. CANONICAL CLINICAL WORKFLOW

```text
Open case
   ↓
Review assessment
   ↓
Formulate phenotype
   ↓
Define clinical priorities
   ↓
Approve Phenotype Snapshot
   ↓
Review imaging qualification
   ↓
Review patient connectome measurements
   ↓
Open Target Slate
   ↓
Understand Primary 1 basis
   ↓
Inspect counterfactual
   ↓
Inspect reliability
   ↓
Inspect conflicting evidence
   ↓
Review distinct Primary 2 / 3 if present
   ↓
Compare alternatives
   ↓
Begin clinical decision
   ↓
Accept / Reject / Modify / Replace / Defer
   ↓
Select final target(s)
   ↓
Write independent clinical reasoning
   ↓
Attest
   ↓
Sign
```

---

# 210. FINAL UX PRINCIPLE

Magniom must not make the target-selection decision easier by making the decision itself invisible.

It should make:

# the evidence easier to inspect,

# the phenotype easier to structure,

# the connectome easier to understand,

# uncertainty easier to see,

# alternatives easier to compare,

and:

# the clinician's own decision easier to document.

The interface must never use usability to remove the intellectual work that belongs to the specialist.

---

# 211. MAGNIOM CLINICIAN WORKSPACE MANIFESTO

# Formulate before calculating.

# Show clinical purpose beside every target.

# Show reliability beside every coordinate.

# Show alternatives beside every primary candidate.

# Show the evidence-only target whenever personalisation changes it.

# Show evidence against the recommendation.

# Never turn an internal score into a clinical probability.

# Never use colour to tell the specialist what to choose.

# Never preselect acceptance.

# Never hide abstention.

# Never let Research Mode look clinical.

# Never let a stale Target Slate be signed.

# Never let a 3D brain image become more persuasive than its evidence.

# Preserve the clinician's right to disagree.

# Require the final reasoning to belong to the clinician.

That is the **Magniom Clinician Workspace & UX Specification v1.0**.