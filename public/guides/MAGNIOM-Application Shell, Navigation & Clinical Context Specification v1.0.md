# MAGNIOM
## Application Shell, Navigation & Clinical Context Specification v1.0

**Document status:** Canonical application-shell and navigation specification  
**Date:** 2 September 2026  
**Primary application:** MAGNIOM Clinician Workspace  
**Primary user:** TMS specialist  
**Secondary users:** Clinical reviewer, imaging specialist, evidence reviewer, researcher, authorised administrator  
**Primary clinical object:** Case  
**Primary clinical output:** Human-reviewed Target Slate and ClinicianDecision  
**Initial deployment state:** Engineering / Research Prototype  
**Target deployment state:** Clinical Mode decision-support product

**Depends on:**

- MAGNIOM Clinical & Scientific Specification v1.0
- MAGNIOM Canonical Target Data Specification v1.0
- MAGNIOM Clinical Phenotype & Symptom-to-Circuit Ontology v1.0
- MAGNIOM Clinician Workspace & UX Specification v1.0
- MAGNIOM Evidence Knowledge Graph & Therapeutic Circuit Library v1.0
- MAGNIOM Neuroimaging & Functional Connectomics Pipeline Specification v1.0
- MAGNIOM Target Engine & Ranking Algorithm Specification v1.0
- MAGNIOM Technical Architecture v1.0
- MAGNIOM Supabase Database & Security Specification v1.0
- MAGNIOM Scientific Policy & Algorithm Configuration Specification v1.0
- MAGNIOM System Requirements Specification v1.0

---

# 1. PURPOSE

This document defines the canonical MAGNIOM application shell.

The shell exists to make four questions continuously answerable:

# Who and where am I?

answered by:

# the Top Bar.

# Where can I go?

answered by:

# the Sidebar.

# Which clinical case am I reasoning about?

answered by:

# the Case Header.

# What scientific or clinical task am I performing?

answered by:

# the Main Canvas.

The governing architecture is:

> **The top bar establishes authority and environment; the sidebar establishes location; the case header establishes clinical context; the main canvas supports reasoning.**

---

# 2. WHY THE SHELL IS SAFETY-RELEVANT

The MAGNIOM application shell is not merely navigation chrome.

It helps prevent:

- wrong-environment use;
- Research/Clinical confusion;
- wrong-case reasoning;
- stale Target Slate use;
- signing under the wrong clinical context;
- accidental navigation away from incomplete clinical work;
- inappropriate access to functions outside the user's role;
- automation bias created by over-prominent algorithmic output.

The shell therefore participates in:

# clinical context integrity.

---

# 3. SHELL DESIGN PHILOSOPHY

MAGNIOM SHALL use the architecture of a modern enterprise workspace without becoming a generic enterprise dashboard.

The shell SHALL prioritise:

- clinical orientation;
- task continuity;
- scientific inspectability;
- restrained information density;
- stable spatial organisation;
- role-aware navigation;
- low cognitive switching cost.

It SHALL NOT prioritise:

- vanity metrics;
- feature advertising;
- decorative data visualisation;
- gamification;
- AI-centric presentation;
- developer-centric system information.

---

# 4. FOUR-LAYER SHELL MODEL

Canonical desktop composition:

```text
┌────────────────────────────────────────────────────────────────────┐
│ TOP BAR                                                            │
│ Authority · environment · organisation · identity · global actions │
├────────────────────────────────────────────────────────────────────┤
│ OPTIONAL ENVIRONMENT / SAFETY STRIP                                │
├───────────────┬────────────────────────────────────────────────────┤
│ SIDEBAR       │ CASE HEADER — when a case is active               │
│               ├────────────────────────────────────────────────────┤
│ Navigation    │ MAIN CANVAS                                        │
│               │ Clinical/scientific reasoning workspace            │
│               │                                                    │
└───────────────┴────────────────────────────────────────────────────┘
```

---

# 5. SHELL HIERARCHY

Visual and semantic priority SHALL be:

```text
1. Safety / environment state when material
2. Active clinical case when present
3. Current clinical task
4. Global navigation
5. Secondary metadata
6. Engineering provenance
```

Engineering metadata SHALL NOT visually dominate clinical information.

---

# 6. GLOBAL VERSUS CASE CONTEXT

MAGNIOM has two primary shell states:

### Global workspace

No active case.

Examples:

- Home
- Cases
- Awaiting Review
- Decisions
- Evidence
- Research

### Case workspace

A specific Case is active.

Examples:

- Assessment
- Phenotype
- Imaging
- Connectome
- Target Slate
- Compare
- Decision
- Treatment
- Outcomes
- Audit

The transition between these states SHALL be explicit.

---

# 7. TOP BAR PURPOSE

The Top Bar establishes:

# authority

and:

# environment.

It answers:

- Which product am I using?
- Which deployment environment am I in?
- Is this Research or Clinical Mode?
- Which organisation/site am I working within?
- Who am I signed in as?
- What authority do I have?
- Can I search globally?
- Are there system-level alerts requiring attention?

It SHALL NOT become the primary clinical navigation system.

---

# 8. TOP BAR CANONICAL CONTENT

Desktop Top Bar SHOULD contain:

```text
MAGNIOM

optional short descriptor

global case search

mode / environment indicator

organisation or site

authenticated user

user/action menu
```

Conceptual:

```text
MAGNIOM   TMS Target Decision Support

                     [ Search cases... ]

[ RESEARCH MODE ]    Melbourne Site    Dr A Smith ▾
```

---

# 9. BRAND POSITION

MAGNIOM SHALL occupy a fixed predictable position at the left edge of the Top Bar.

The product identity SHOULD remain visually modest.

The header SHALL NOT resemble:

- a marketing website;
- a consumer application;
- an AI chatbot header.

---

# 10. PRODUCT DESCRIPTOR

During early use, MAGNIOM MAY display:

```text
TMS Target Decision Support
```

beside the brand.

Once user familiarity is established, it MAY be reduced or omitted at narrower breakpoints.

It SHALL NOT use language such as:

```text
AI Target Finder
AI Recommendation Engine
Precision Brain AI
```

---

# 11. ENVIRONMENT STATE IS FIRST-CLASS

The shell SHALL always make deployment state recoverable.

Possible states include:

```text
ENGINEERING PROTOTYPE
RESEARCH PROTOTYPE
VALIDATION BUILD
CLINICAL RELEASE CANDIDATE
CLINICAL MODE
```

These states SHALL correspond to controlled product maturity.

---

# 12. NO MATURITY-STATE CONTRADICTIONS

A single rendered application SHALL NOT simultaneously claim incompatible states such as:

```text
RESEARCH PROTOTYPE — M1
```

and:

```text
VERIFICATION BUILD — M3
```

unless explicitly showing two distinct artefacts.

The active shell SHALL derive its maturity/environment label from:

# one authoritative release manifest.

---

# 13. PROTOTYPE SAFETY STRIP

Before Clinical Mode, a persistent strip SHALL clearly state the allowed use.

Recommended Research Prototype wording:

```text
RESEARCH PROTOTYPE — NOT FOR CLINICAL USE

Experimental outputs must not be used to guide patient treatment.
```

This SHALL remain visible across all clinically resembling Research screens.

---

# 14. CLINICAL MODE INDICATOR

Clinical Mode SHALL use an explicit persistent state indicator.

Example:

```text
CLINICAL MODE
```

The mode indicator SHALL NOT rely on colour alone.

---

# 15. RESEARCH MODE INDICATOR

Research Mode SHALL use explicit wording such as:

```text
RESEARCH MODE
Experimental output
Not permitted for treatment decisions
```

Research Mode SHALL remain identifiable after:

- deep linking;
- browser refresh;
- direct URL entry;
- navigating into an individual Research case.

---

# 16. MODE IS NOT A THEME

Clinical and Research Mode SHALL NOT be differentiated only through:

- colour;
- icon;
- background shade.

Differences SHALL also include:

- explicit text;
- permitted actions;
- data source;
- route context;
- policy enforcement.

---

# 17. ORGANISATION AND SITE CONTEXT

Where MAGNIOM supports multiple organisations or sites, the Top Bar SHALL expose current organisational context.

Example:

```text
Melbourne TMS Centre
```

or:

```text
Melbourne · Site 1
```

This context SHALL be derived from authorised session state.

---

# 18. USER IDENTITY

The Top Bar SHALL expose sufficient authenticated user context to allow the operator to know whose session is active.

Example:

```text
Dr A Smith
TMS Specialist
```

Role detail MAY appear on dropdown rather than permanently.

---

# 19. SIGNING AUTHORITY

Where a user has target-decision signing authority, that authority MAY be displayed within the account or role menu.

The shell SHALL NOT imply signing authority solely because a user is identified as a clinician.

Actual signing permission SHALL remain server-enforced.

---

# 20. GLOBAL SEARCH

MAGNIOM SHOULD support global Case search.

Search SHOULD accept appropriately authorised identifiers such as:

- Case ID;
- patient identifier;
- patient name where permitted;
- treatment episode reference.

Sensitive search terms SHALL NOT be written into public URLs where avoidable.

---

# 21. TOP-BAR ALERTS

Only genuinely global alerts belong in the Top Bar.

Examples:

- organisation-wide service outage;
- active safety notice;
- scientific release withdrawal affecting active use;
- authentication/session issue.

Case-specific alerts belong in the:

# Case Header.

---

# 22. TOP-BAR PROHIBITIONS

The Top Bar SHALL NOT contain:

- Accept Target;
- Sign Decision;
- Generate Target;
- Primary Candidate 1;
- algorithm score;
- target coordinate;
- target confidence;
- patient-specific scientific detail.

Clinical actions belong inside their dedicated case workflow.

---

# 23. SIDEBAR PURPOSE

The Sidebar establishes:

# location.

It answers:

> Where am I in MAGNIOM, and what other areas am I authorised to enter?

The Sidebar is navigation.

It SHALL NOT become:

- a monitoring dashboard;
- a scientific status report;
- a list of every system module;
- a settings panel.

---

# 24. GLOBAL CLINICIAN NAVIGATION

Canonical clinician-facing global navigation:

```text
Home
Cases
Awaiting Review
Decisions
Evidence

──────────────

Research

──────────────

Help
```

Optional explicit:

```text
New Case
```

may appear as a primary or secondary action depending on role.

---

# 25. CASES DOMINATE DAILY USE

For the TMS specialist:

# Cases

SHALL remain the primary domain object and principal operational destination.

The navigation hierarchy SHALL not visually imply that:

```text
Evidence
Research
Administration
```

are equivalent in daily importance to active clinical Cases.

---

# 26. HOME

Home SHALL be:

# an actionable clinical worklist.

It SHALL NOT primarily explain MAGNIOM's product features.

The Home route SHOULD answer:

- What requires my attention?
- Which case should I continue?
- Which cases recently changed?
- Are there stale decisions?
- Is any scientific or processing issue blocking work?

---

# 27. HOME SHALL NOT BE A FEATURE TOUR

Clinician Home SHALL NOT primarily contain cards such as:

```text
Phenotype Workspace
Target Slate Workspace
Evidence Drawer
Decision Screen
```

Such material MAY exist in:

- onboarding;
- help;
- prototype validation;
- internal demo routes.

---

# 28. CASES NAVIGATION

`Cases` SHALL provide the canonical case registry.

Typical functions:

- list;
- filter;
- sort;
- search;
- open;
- create where authorised.

Primary route:

```text
/cases
```

---

# 29. AWAITING REVIEW

`Awaiting Review` SHOULD represent an actionable queue rather than a separate clinical data class.

Possible states:

```text
Phenotype approval required
Imaging review required
Target Slate ready
Decision sign-off required
Stale Target Slate
```

Counts MAY be displayed beside the navigation label.

---

# 30. DECISIONS

`Decisions` SHOULD provide access to:

- unsigned decisions;
- recently signed decisions;
- superseded decisions where authorised;
- decision history.

It SHALL NOT display algorithmic agreement as clinician performance.

---

# 31. EVIDENCE

`Evidence` MAY be first-level clinician navigation because evidence inspectability is fundamental to MAGNIOM.

Clinician Evidence workspace SHOULD expose:

- approved EvidenceClaims;
- TherapeuticCircuits;
- TargetFamilies;
- supporting evidence;
- conflicting evidence;
- limitations;
- population boundaries.

It SHALL NOT automatically expose evidence-curation controls.

---

# 32. RESEARCH NAVIGATION

Research SHALL be separated visually from clinical navigation.

Example:

```text
CLINICAL

Home
Cases
Awaiting Review
Decisions
Evidence

──────────────

RESEARCH

Research Workspace
```

This distinction is semantic, not decorative.

---

# 33. ADMINISTRATION

Administration SHALL appear only for users with relevant capabilities.

Administrative functions SHALL NOT clutter the default specialist sidebar.

Potential Administration scope:

- organisation;
- sites;
- users;
- roles;
- access;
- system-level settings.

Scientific governance is not ordinary Administration.

---

# 34. SCIENTIFIC ADMINISTRATION IS SEPARATE

The following SHALL NOT appear as ordinary clinician navigation:

```text
Scientific Policy
Evidence release activation
Pipeline versions
Target Engine configuration
Golden Cases
Human Factors verification
Release management
RLS testing
```

These belong to dedicated internal/governance workspaces.

---

# 35. ROLE-AWARE NAVIGATION

The Sidebar SHALL be capability-driven.

### TMS Specialist

may see:

```text
Home
Cases
Awaiting Review
Decisions
Evidence
Research if authorised
```

### Imaging Specialist

may additionally or preferentially see:

```text
Imaging Review
QC Queue
Processing
```

### Evidence Curator

uses:

```text
Evidence Governance
Claims Review
Release Staging
```

### Researcher

uses:

```text
Research Cases
Research Analyses
Experimental Configurations
```

### Administrator

uses:

```text
Organisation
Users
Sites
Access
```

---

# 36. NAVIGATION SHALL FOLLOW AUTHORISATION

Hidden navigation improves usability.

It is not a security boundary.

Every destination SHALL also enforce:

- authentication;
- role/capability permission;
- organisation membership;
- case scope;
- mode scope.

---

# 37. SIDEBAR COLLAPSE

Desktop Sidebar MAY collapse.

Default expanded form SHOULD show:

```text
icon + text
```

Collapsed form MAY show icons only for experienced users.

Tooltips SHALL be provided.

Critical navigation SHALL remain usable without relying on memorised icons.

---

# 38. SIDEBAR ACTIVE STATE

The current location SHALL be visually apparent through:

- position;
- text;
- icon;
- active indicator.

Colour alone SHALL NOT carry active-state meaning.

---

# 39. SIDEBAR COUNTS

Counts MAY be displayed for actionable queues.

Examples:

```text
Awaiting Review      3
Decision Sign-off    2
```

Avoid counts for vanity statistics such as:

```text
Total targets
Total connectomes
Total evidence claims
```

in ordinary specialist navigation.

---

# 40. CASE WORKSPACE TRANSITION

When a user opens a Case, MAGNIOM SHALL transition from:

# global navigation context

to:

# clinical case context.

The active case SHALL become visually dominant over the generic dashboard.

---

# 41. CASE HEADER PURPOSE

The Case Header establishes:

# clinical context.

It answers:

- Which case is open?
- Which indication?
- What clinical task is underway?
- What is the workflow state?
- Is phenotype current?
- Is imaging qualified?
- Is the Target Slate current?
- Is this Research or Clinical Mode?
- Is anything stale or superseded?

---

# 42. CASE HEADER IS PERSISTENT

The Case Header SHALL remain persistent across clinically material case routes.

Examples:

```text
/cases/[caseId]
/phenotype
/imaging
/connectome
/targets
/compare
/decision
```

The clinician SHALL not lose case identity while navigating between these areas.

---

# 43. CANONICAL CASE HEADER CONTENT

Example:

```text
MGN-26-0042

Major depressive disorder ± anxious distress
Target planning

Phenotype       Approved
Connectome      Qualified
Target Slate    Ready for review

CLINICAL MODE

⚠ New evidence release available
```

Secondary provenance MAY be available through disclosure.

---

# 44. PATIENT IDENTITY

Patient name MAY be shown where clinically appropriate.

It SHALL not need to dominate every screen.

The shell SHOULD make the case identifiable without unnecessarily repeating sensitive information.

---

# 45. CASE ID

Case ID SHALL be easily visible.

Example:

```text
MGN-26-0042
```

Case identity SHALL remain stable across the entire workflow.

---

# 46. CASE MODE

Case mode SHALL be shown in the Case Header when ambiguity is possible.

Examples:

```text
CLINICAL MODE
```

or:

```text
RESEARCH MODE
```

Research cases SHALL remain visibly Research throughout the case workspace.

---

# 47. CASE WORKFLOW STATUS

The Case Header MAY summarise key state:

```text
Phenotype     Approved
Imaging       Qualified
Target Slate  Ready
Decision      Pending
```

It SHALL not replace the complete workflow rail.

---

# 48. CASE STALENESS

The Case Header SHALL surface clinically material staleness immediately.

Examples:

```text
⚠ Target Slate predates the latest PhenotypeSnapshot
```

```text
⚠ New qualified ConnectomeRun available
```

```text
⚠ New Evidence Library release may affect this case
```

---

# 49. STALE STATE SHALL BLOCK UNSAFE ACTION

Where the active Target Slate is no longer valid for signing:

```text
Sign
```

SHALL be disabled server-side and in the UI.

The header SHALL explain the blocking state.

---

# 50. CASE HEADER ACTIONS

Permitted global case actions may include:

```text
Case summary
Evidence
Audit history
Export
More
```

Clinical candidate acceptance SHALL NOT occur from the Case Header.

---

# 51. CASE-LEVEL WORKFLOW NAVIGATION

When a Case is active, the Sidebar SHOULD transition to or incorporate case-level navigation.

Example:

```text
← All Cases

MGN-26-0042

Overview
Assessment
Phenotype
Imaging
Connectome
Target Slate
Compare
Decision
Treatment
Outcomes
Audit
```

---

# 52. GLOBAL AND CASE NAVIGATION SHALL NOT COMPETE

MAGNIOM SHOULD avoid displaying two equally dominant navigation hierarchies simultaneously.

Preferred patterns:

### Pattern A — Sidebar transformation

Global Sidebar becomes Case Sidebar after opening a case.

### Pattern B — Global rail + secondary compact case rail

Only if usability testing supports it.

Pattern A is preferred for v1.

---

# 53. BACK TO CASES

A visible:

```text
← All Cases
```

or equivalent SHALL remain available inside active case navigation.

The user SHALL not depend on browser Back to return to the Case Registry.

---

# 54. WORKFLOW IS STATE-DRIVEN

Case-navigation route location SHALL NOT be interpreted as clinical workflow completion.

For example:

```text
user opened /targets
```

does not mean:

```text
target review complete
```

Workflow completion SHALL derive from canonical server state.

---

# 55. WORKFLOW RAIL

A state-oriented workflow representation SHOULD display:

```text
✓ Assessment
✓ Phenotype
✓ Imaging
✓ Connectome
● Target Slate
○ Decision
○ Treatment
○ Outcomes
```

Each stage SHALL use:

- text;
- state;
- optional icon.

Colour alone is insufficient.

---

# 56. WORKFLOW INSPECTION

Completed earlier stages SHALL remain inspectable.

MAGNIOM SHALL support:

```text
advance
without
losing prior clinical context.
```

---

# 57. MAIN CANVAS PURPOSE

The Main Canvas supports:

# reasoning.

The Main Canvas is where the specialist:

- formulates;
- qualifies;
- measures;
- compares;
- reviews;
- decides.

The Main Canvas SHALL change according to the active clinical task.

---

# 58. MAIN CANVAS SHALL NOT BECOME GENERIC DASHBOARD

Inside a Case, the Main Canvas SHALL NOT primarily show generic KPIs.

Examples of inappropriate case-level emphasis:

```text
87% confidence
AI score 92
Average target quality
Top recommendation
```

The canvas SHALL focus on inspectable scientific reasoning.

---

# 59. CASE OVERVIEW

The Case Overview SHALL orient the specialist rapidly.

It SHOULD answer:

```text
What is the clinical question?
What is the current workflow state?
What has been qualified?
What requires review?
```

It SHALL NOT expose the Primary target coordinate before intentional Target Slate review.

---

# 60. CASE OVERVIEW TARGET RESTRAINT

Before explicit target review:

show:

```text
Target Slate ready for review
```

not:

```text
Primary Target [-42,38,31]
```

This reduces premature anchoring.

---

# 61. PHENOTYPE CANVAS

The Phenotype workspace SHALL emphasise:

- clinician-confirmed phenotype;
- dimensional domains;
- impairment;
- patient priorities;
- clinician priorities;
- target-mappability;
- uncertainty;
- approval state.

Algorithmic target output SHALL not dominate phenotype formulation.

---

# 62. IMAGING CANVAS

The Imaging workspace SHALL emphasise:

- acquisition validity;
- structural QC;
- functional QC;
- motion;
- usable duration;
- registration;
- segmentation;
- processing state.

It SHALL distinguish:

# technical measurement quality

from:

# clinical target preference.

---

# 63. CONNECTOME CANVAS

The Connectome workspace SHALL support understanding of:

- patient-specific measurements;
- therapeutic circuit concordance;
- reliability;
- sensitivity;
- normative context where permitted.

It SHALL not automatically present:

# abnormality = target.

---

# 64. TARGET SLATE CANVAS

The Target Slate workspace SHALL organise candidate review around:

```text
clinical context
spatial representation
evidence
reliability
counterfactual
uncertainty
alternatives
counterarguments
```

The Primary Candidate SHALL not visually erase alternatives.

---

# 65. TARGET REVIEW LAYOUT

Desktop Target Slate MAY use a structured multi-column layout such as:

```text
┌──────────────────┬──────────────────────────┬──────────────────────┐
│ CLINICAL CONTEXT │ SPATIAL / CONNECTOME     │ TARGET SLATE         │
│                  │                          │                      │
│ phenotype        │ cortical viewer          │ Primary 1            │
│ priorities       │ counterfactual           │ Primary 2            │
│ evidence tier    │ reliability region       │ alternatives         │
│                  │ circuit overlays         │ uncertainty          │
└──────────────────┴──────────────────────────┴──────────────────────┘
```

Exact proportions may adapt to viewport.

---

# 66. SPATIAL VIEWER SHALL NOT DOMINATE AUTHORITY

The brain viewer is a measurement and comparison interface.

It SHALL NOT create:

- bullseye aesthetics;
- pulsing targets;
- winner glow;
- green “good” targets;
- red “bad” targets;
- visual certainty not supported by evidence.

---

# 67. COMPARE CANVAS

Target Comparison SHALL provide structured comparison across scientifically meaningful dimensions.

Possible rows:

```text
Clinical purpose
TargetFamily
Evidence role
Patient-specific contribution
Reliability
Counterfactual displacement
Accessibility
E-field role
Uncertainty
Strongest counterargument
```

It SHALL not collapse these into one universal score.

---

# 68. EVIDENCE DRAWER

Evidence SHOULD be available without forcing the clinician to abandon the case context.

A slide-over or adjacent drawer MAY be used.

Evidence view SHALL maintain:

- candidate association;
- claim;
- source;
- supporting/conflicting classification;
- limitations.

---

# 69. EVIDENCE DEEP LINKING

Authorised deep linking MAY use non-sensitive identifiers such as:

```text
/cases/[caseId]/targets
?target=<candidateId>
&evidence=<claimId>
```

Patient names and clinical interpretation SHALL NOT be placed into URL query strings.

---

# 70. DECISION CANVAS

Decision SHALL be a dedicated phase.

The clinician SHALL be able to:

```text
Accept
Reject
Modify
Replace
Defer
Select no target
```

according to the canonical workflow.

There SHALL be no generic:

```text
Accept MAGNIOM recommendation
```

action.

---

# 71. ACTIVE REASONING

The Decision workspace SHALL require clinician-authored reasoning appropriate to the decision.

The interface SHALL make clinician disagreement straightforward.

It SHALL NOT use emotionally loaded language such as:

```text
Ignore AI recommendation?
Proceed against recommendation?
```

---

# 72. SIGN-OFF

Signing SHALL be visually and semantically separate from candidate inspection.

The workflow SHOULD make clear:

```text
review
→ decide
→ reason
→ attest
→ sign
```

Signing SHALL require server-confirmed current state.

---

# 73. NO OPTIMISTIC SIGNING

The UI SHALL NOT optimistically display:

```text
Signed
```

before authoritative server confirmation.

The same applies to:

- phenotype approval;
- Target Slate publication;
- Scientific Policy activation.

---

# 74. HOME DASHBOARD MODEL

The clinician Home page SHOULD be work-oriented.

Recommended structure:

```text
Good evening, Dr Smith

3 cases require your attention

[ Continue Case ]

Needs your attention

Recent cases

Optional scientific/release notice
```

---

# 75. ACTION-ORIENTED CARDS

Home cards SHOULD describe actionable work.

Examples:

```text
Target Slate ready for specialist review
```

```text
Phenotype awaiting approval
```

```text
Imaging QC requires review
```

```text
New evidence may affect previous Target Slate
```

They SHOULD NOT primarily describe product modules.

---

# 76. NO VANITY KPI DASHBOARD

Avoid making Home primarily:

```text
124 Cases
37 Target Slates
92% Completion
87% Agreement
```

Such metrics may exist in internal analytics but are not the specialist's main clinical workspace.

---

# 77. SCIENTIFIC RELEASE STATUS ON HOME

A subtle section MAY expose:

```text
Evidence Library      Current
Scientific Policy     Current
Imaging Pipeline      Current
```

Exact version detail SHOULD sit behind:

```text
View release provenance
```

unless the user is performing governance/audit work.

---

# 78. VERSION MANIFEST

Every scientific decision screen SHALL make its scientific provenance recoverable.

A subtle footer or disclosure MAY contain:

```text
Evidence Library
Scientific Policy
Target Engine
Pipeline
Normative Model
E-field Engine
Phenotype Ontology
```

This SHALL not compete visually with clinical reasoning.

---

# 79. PROGRESSIVE DISCLOSURE

First-level clinician language SHOULD use clinical concepts.

Prefer:

```text
Phenotype approved
```

over:

```text
SHA-256 snapshot gate passed
```

Prefer:

```text
Decision signed and locked
```

over:

```text
SHA-256 digital signature complete
```

Prefer:

```text
Compare uncertainty
```

over:

```text
7-dimensional uncertainty matrix
```

Technical details remain accessible for audit.

---

# 80. CLINICAL LANGUAGE

Use language that reflects the domain:

```text
Review
Inspect
Compare
Qualify
Approve
Sign
Continue
Open
```

Avoid prototype-centric verbs such as:

```text
Launch
Execute
Run AI
Start inference
```

except in appropriate technical/internal workspaces.

---

# 81. PRIMARY ACTION

Each Main Canvas SHOULD have one clearly identifiable principal next action.

Examples:

```text
Review phenotype
Continue target review
Begin clinical decision
Sign decision
```

Competing primary CTAs SHOULD be avoided.

---

# 82. SECONDARY ACTIONS

Secondary actions MAY include:

```text
Open evidence
Compare candidates
View audit
Export
Technical details
```

These SHALL not visually overpower the current clinical task.

---

# 83. COLOUR SEMANTICS

Colour SHALL support, but not independently encode, meaning.

Appropriate semantic roles:

```text
neutral          ordinary content
warning          stale / attention
critical         safety / prohibited state
research         research-only mode
success          completed workflow state
action accent    user action
```

Candidate preference SHALL NOT be encoded using red/green winner semantics.

---

# 84. ACTION COLOUR

The primary accent SHOULD be reserved mainly for:

- active navigation;
- interactive focus;
- principal action.

Excessive use of the action accent in headings or decorative labels SHOULD be avoided.

---

# 85. ALERT FATIGUE

MAGNIOM SHALL favour contextual warnings over repeated modal dialogs.

A persistent clear stale-state message is preferable to recurrent dismissible alerts.

Critical blocking events MAY use dialogs where user acknowledgment is necessary.

---

# 86. TYPOGRAPHY

Clinically meaningful text SHALL remain comfortably readable on typical workstation and laptop displays.

Recommended baseline:

```text
body            ~15–16 px
secondary       ~13–14 px minimum
headings         clear stepped hierarchy
line height      generous
```

Critical explanatory copy SHALL NOT be rendered as tiny low-contrast metadata.

---

# 87. DENSITY

MAGNIOM SHOULD support:

# information-rich

but:

# cognitively calm

screens.

Avoid:

- walls of bordered cards;
- excessive status pills;
- dense developer metadata;
- unnecessary separators;
- simultaneous competing panels.

---

# 88. CARD USAGE

Cards SHOULD represent meaningful grouped objects.

Examples:

- active Case;
- TargetCandidate;
- Imaging Qualification;
- Reliability summary.

Do not place every sentence or setting in an independent card.

---

# 89. BORDERS

Borders SHOULD be used selectively to:

- establish hierarchy;
- distinguish interactive regions;
- support complex comparisons.

A dashboard made entirely of equal outlined rectangles SHOULD be avoided.

---

# 90. SPACING

The shell SHOULD use generous structural spacing.

Indicative desktop dimensions:

```text
Top Bar        56–64 px
Safety Strip   32–44 px
Sidebar        224–248 px
Collapsed      64–72 px
Canvas gutter  24–32 px
```

Exact dimensions are design tokens, not scientific requirements.

---

# 91. MAXIMUM CONTENT WIDTH

Ordinary text-heavy clinical screens SHOULD avoid unrestricted ultra-wide lines.

Comparison and spatial workspaces MAY use wider layouts where clinically useful.

---

# 92. LIGHT AND DARK APPEARANCE

MAGNIOM MAY support:

```text
Light
Dark
System
```

Appearance SHALL NOT alter clinical semantics.

Human-factors validation SHOULD determine the canonical clinical validation appearance.

---

# 93. VIEWER APPEARANCE

A dark spatial viewer MAY be embedded inside a lighter application shell.

The 3D viewer does not require the entire application to use a dark theme.

---

# 94. ACCESSIBILITY

The shell SHALL target:

# WCAG 2.2 AA.

Critical meaning SHALL NOT rely solely on:

- colour;
- hover;
- pointer precision;
- 3D interaction;
- animation.

---

# 95. KEYBOARD NAVIGATION

All ordinary shell navigation SHALL be keyboard accessible.

Clinical actions including:

- open case;
- open evidence;
- compare;
- reject;
- modify;
- sign

shall have accessible keyboard paths.

---

# 96. FOCUS MANAGEMENT

Navigation and panel transitions SHALL provide predictable focus management.

Opening:

```text
Evidence Drawer
```

SHALL place focus appropriately.

Closing it SHALL return focus logically to the originating control.

---

# 97. SCREEN-READER LANDMARKS

The shell SHOULD expose semantic landmarks:

```text
banner
navigation
main
complementary
contentinfo
```

Case Header SHOULD have a clear accessible label.

---

# 98. RESPONSIVE DESKTOP

Desktop is the primary MAGNIOM environment.

Desktop SHALL support:

- persistent Top Bar;
- persistent Sidebar;
- persistent Case Header;
- multi-column reasoning canvases where required.

---

# 99. TABLET

Tablet MAY collapse global navigation behind a drawer.

Case context SHALL remain persistently visible.

Target review SHOULD degrade into:

```text
Clinical context
↓
Viewer
↓
Target Slate
```

with persistent candidate selector where useful.

---

# 100. MOBILE

Mobile MAY support:

- case lookup;
- case summary;
- evidence reading;
- limited review;
- notifications.

Complex spatial target comparison and clinical sign-off SHOULD undergo explicit validation before being considered mobile-supported critical tasks.

---

# 101. SIDEBAR ON SMALL VIEWPORTS

On narrow screens:

```text
Sidebar
→ drawer
```

The current case/mode SHALL remain visible independently of drawer state.

---

# 102. LOADING STATES

The shell SHALL use domain language.

Prefer:

```text
Loading case context
```

```text
Functional connectome processing
```

```text
Evaluating evidence-supported target families
```

Avoid:

```text
AI is thinking
```

---

# 103. COMPUTE STATUS

Long-running processing MAY expose stepwise status:

```text
Structural preprocessing   Complete
BOLD preprocessing         Complete
Connectome                 Running
Reliability                Pending
Target generation          Pending
```

Do not display fake percentage precision when unavailable.

---

# 104. EMPTY STATES

Empty states SHALL explain scientific restraint.

Example:

```text
No third Primary Candidate

Remaining eligible candidates were redundant or did not add
a sufficiently distinct clinical hypothesis.
```

Do not make absence appear as system incompleteness.

---

# 105. ERROR STATES

Scientific/technical failure SHALL clearly state whether a clinical output exists.

Example:

```text
Target analysis could not be completed.

No Clinical Target Slate was published.

[ Retry ]
[ View technical details ]
```

---

# 106. RESEARCH CASE ERROR SAFETY

Research failures SHALL NOT be presented as Clinical Mode failures.

Mode context remains visible in error states.

---

# 107. STALE STATE

A stale Target Slate SHALL show:

- why it became stale;
- which source changed;
- whether new generation is available;
- whether signing is blocked.

Example:

```text
Target Slate is no longer current.

The approved phenotype changed after this slate was generated.

[ Generate updated Target Slate ]
```

---

# 108. DEEP LINK SAFETY

Direct access to a Case route SHALL load and verify:

- authorised user;
- organisation;
- role permissions;
- Case identity;
- mode;
- workflow state.

The shell SHALL not trust previously cached client context.

---

# 109. SERVER-SIDE SHELL CONTEXT

The Case shell SHOULD load authoritative server-side:

```text
case
organisation
user capability
mode
workflow state
staleness
active scientific release context
```

before rendering clinically material actions.

---

# 110. SERVER COMPONENT DEFAULT

Shell components SHOULD default to server-rendered architecture where practical for:

```text
Top Bar identity
Sidebar permissions
Case Header
Case workflow
scientific provenance
```

Interactive client components are used only where necessary.

---

# 111. NO FRONTEND SCIENTIFIC LOGIC

The shell SHALL NOT calculate:

- evidence tier;
- reliability class;
- candidate eligibility;
- candidate rank;
- convergence;
- scientific-policy compatibility.

It displays canonical server outputs.

---

# 112. SHELL CLIENT STATE

Appropriate local UI state includes:

```text
sidebar collapsed
drawer open
selected presentation tab
viewer camera
```

Authoritative clinical state SHALL remain server-side.

---

# 113. ROUTE MODEL

Recommended application route structure:

```text
/
  → role-aware Home

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

/evidence

/research
/research/cases/[caseId]

/help
```

Role-specific governance routes remain separate.

---

# 114. NEXT.JS LAYOUT MODEL

Conceptually:

```text
app/
├── layout.tsx
├── page.tsx
│
├── cases/
│   ├── page.tsx
│   └── [caseId]/
│       ├── layout.tsx
│       ├── page.tsx
│       ├── phenotype/
│       ├── imaging/
│       ├── connectome/
│       ├── targets/
│       ├── compare/
│       └── decision/
│
├── evidence/
├── research/
└── help/
```

---

# 115. ROOT APPLICATION LAYOUT

Root layout owns:

```text
TopBar
EnvironmentStrip
GlobalSidebar
MainRegion
```

Case layout owns:

```text
CaseNavigation
CaseHeader
CaseMainCanvas
```

---

# 116. COMPONENT MODEL

Core shell components:

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
ActionQueueBadge

CaseShell
CaseNavigation
CaseStatusHeader
CaseStalenessAlert
CaseWorkflowRail

WorkspaceMain
WorkspaceToolbar
VersionManifestDisclosure
```

---

# 117. PRESENTATION CONTRACTS

Shell components SHALL accept canonical presentation models.

Example:

```text
CaseStatusHeader(CaseContextPresentation)
```

not arbitrary developer-created status strings.

---

# 118. CASE CONTEXT PRESENTATION MODEL

Conceptual:

```ts
interface CaseShellContext {
  caseId: string;

  displayIdentifier: string;

  patientDisplay?: {
    name?: string;
    identifier?: string;
  };

  indication: string;

  mode: "clinical" | "research";

  workflowStage: string;

  phenotypeStatus: string;
  imagingStatus: string;
  connectomeStatus: string;
  targetSlateStatus: string;
  decisionStatus: string;

  staleness: CaseStalenessItem[];

  capabilities: string[];

  releaseContext: ReleaseContextSummary;
}
```

---

# 119. ROLE-AWARE HOME

Home content SHOULD differ by user capability.

### TMS specialist

```text
Cases needing review
Recent cases
Decision sign-off
Stale Target Slates
```

### Imaging specialist

```text
Imaging QC queue
Failed processing
Acquisition issues
Localisation review
```

### Evidence reviewer

```text
Claims awaiting review
Evidence conflicts
Release staging
```

The shell remains structurally consistent while content changes.

---

# 120. PROTOTYPE / VALIDATION SHELL

The existing development-facing homepage SHOULD be retained as a separate internal workspace.

Suggested route:

```text
/internal/validation
```

or:

```text
/validation
```

according to access policy.

It MAY contain:

- UX Golden Cases;
- human-factors task implementation;
- build status;
- verification status;
- component coverage;
- scientific manifest.

---

# 121. PROTOTYPE STATUS LANGUAGE

Internal development screens SHALL distinguish:

```text
Implemented
Automated test passed
Verified
Human-factors tested
Validated
```

These SHALL NOT be used interchangeably.

For example:

```text
12 / 12 critical task flows implemented
```

is not equivalent to:

```text
12 / 12 human-factors tasks validated
```

---

# 122. HUMAN-FACTORS STATUS

A human-factors badge SHALL only use:

```text
validated
```

when supported by the defined validation programme.

Otherwise use:

```text
implemented
prototype-tested
automation-tested
formative testing pending
```

as appropriate.

---

# 123. REGULATORY COPY

Clinical/prototype banners SHALL describe actual usage restrictions.

Standards references such as:

```text
IEC 62304
ISO 14971
```

SHOULD NOT be used as primary clinician-facing warning language merely to imply rigour.

Quality-system provenance may be available elsewhere.

---

# 124. RELEASE PROVENANCE

A subtle release footer MAY show:

```text
MAGNIOM Research Release 0.1.0-alpha
View provenance
```

Expanded provenance may include:

```text
Target Engine
Evidence Library
Scientific Policy
Phenotype Ontology
Neuro Pipeline
Normative Model
E-field Engine
UX release
Database migration
```

---

# 125. CLINICAL MODE RELEASE

Clinical Mode shell SHALL derive its active:

- mode;
- component versions;
- authorised functions;

from an approved Clinical Release Package.

The UI SHALL NOT infer Clinical Mode merely from environment naming.

---

# 126. WITHDRAWN SCIENTIFIC CONFIGURATION

If an active scientific release is withdrawn or invalidated:

the shell SHALL surface an appropriate blocking state.

Where clinically required, affected Case workflows SHALL prevent unsafe new decisions.

---

# 127. SESSION EXPIRY

Clinical sessions SHALL provide clear expiry/re-authentication behaviour.

A session timeout SHALL NOT result in ambiguous partial signing state.

---

# 128. UNSAVED CLINICAL WORK

Where clinically material draft work exists, navigation away MAY require confirmation.

The system SHOULD distinguish:

- unsaved local UI state;
- server-saved draft clinical state.

Avoid unnecessary warning dialogs for navigation that causes no data loss.

---

# 129. MULTI-TAB BEHAVIOUR

MAGNIOM SHALL account for cases opened in multiple browser tabs.

Signing/publishing SHALL revalidate current authoritative state.

A stale tab SHALL NOT bypass version checks.

---

# 130. CASE CHANGE WHILE OPEN

If authoritative case state changes while another user is reviewing:

MAGNIOM SHALL communicate the relevant change and refresh requirements.

Examples:

```text
Phenotype was superseded.
Target Slate is now stale.
Decision was signed by another authorised clinician.
```

---

# 131. REALTIME IS NOT AUTHORITY

Realtime events MAY notify the shell that state changed.

Before clinically material actions, MAGNIOM SHALL re-read authoritative state.

---

# 132. AUDIT ACCESS

The active Case SHOULD provide access to:

```text
Audit history
```

without making audit logs part of ordinary clinical reasoning screens.

---

# 133. REPORT EXPORT

Export SHALL preserve:

- Case identity;
- Target role;
- evidence;
- reliability;
- coordinate space;
- uncertainty;
- decision status;
- version provenance;
- decision-support disclaimer.

The shell SHALL NOT provide context-free target-image export as the default report.

---

# 134. HELP AND GUIDANCE

Help SHOULD provide:

- workflow guidance;
- terminology;
- interpretation of evidence tiers;
- reliability explanation;
- mode explanation;
- provenance explanation.

Help SHALL NOT override or substitute clinician training requirements.

---

# 135. NO CHATBOT PRIMARY NAVIGATION

MAGNIOM SHALL NOT be organised around a chat input as its primary shell.

Conversational assistance MAY exist later as a secondary explanatory tool.

The canonical navigation remains:

# case and workflow based.

---

# 136. NO “AI CENTRE”

The Sidebar SHALL NOT include:

```text
AI
Ask AI
AI Insights
AI Recommendations
```

as the defining primary application domain.

The value of MAGNIOM lies in structured scientific reasoning, not chatbot interaction.

---

# 137. NO UNIVERSAL RECOMMENDATION PANEL

Home SHALL NOT display:

```text
Today's AI recommendations
```

Clinical reasoning remains Case-specific and deliberate.

---

# 138. AUTOMATION-BIAS SHELL CONTROL

The shell SHALL reduce premature target exposure.

Examples:

- no Primary target on Case Overview before intentional review;
- no Accept action in header;
- no recommendation count in navigation;
- no high-confidence badge in global worklists.

---

# 139. RESEARCH/CLINICAL SHELL CONTROL

Research Mode SHALL differ in:

- banner;
- mode label;
- navigation;
- available actions;
- signing capability.

Clinical sign-off SHALL NOT appear enabled for Research-only targets.

---

# 140. CASE MISIDENTIFICATION CONTROL

The Case Header SHALL remain visible during:

- candidate review;
- evidence inspection;
- target comparison;
- final decision.

Critical modal/drawer experiences SHALL retain sufficient Case context.

---

# 141. STALE TARGET CONTROL

Staleness SHALL be displayed in:

- Case Header;
- Target Slate workspace;
- Decision workspace where relevant.

A stale warning SHALL not exist only on an earlier page.

---

# 142. SIGN-OFF CONTEXT

Before final signing, the decision screen SHALL restate at minimum:

```text
Case
mode
Target Slate version
final target selection
decision reasoning
attestation
```

This supports a deliberate final context check.

---

# 143. ACCESSIBILITY OF STATUS

The shell SHALL never rely only on badges such as:

```text
green
yellow
pink
```

Each status SHALL have textual meaning:

```text
Qualified
Stale
Research
Blocked
Signed
```

---

# 144. MOTION

Shell motion SHALL be restrained.

No:

- auto-animated sidebar;
- pulsing mode banner;
- flashing target alert;
- unnecessary parallax.

Respect:

```text
prefers-reduced-motion
```

---

# 145. MICROINTERACTIONS

Appropriate microinteractions include:

- subtle drawer transitions;
- focus-visible states;
- confirmation of saved draft;
- accessible navigation expansion.

They SHALL not introduce scientific meaning.

---

# 146. SHELL PERFORMANCE

The shell SHOULD render quickly independently of large scientific datasets.

Opening a Case SHALL not require loading:

- full MRI assets;
- all evidence documents;
- full connectivity matrices.

Feature data load on demand.

---

# 147. NAVIGATION PERFORMANCE

Moving between ordinary Case sections SHOULD preserve shell stability.

Top Bar, Case Header and Sidebar SHOULD not visibly remount unnecessarily.

This reduces orientation loss.

---

# 148. WORKSPACE PERSISTENCE

Non-clinical view state MAY persist during navigation:

```text
sidebar collapse
selected display tab
viewer orientation
```

but SHALL NOT overwrite canonical clinical state.

---

# 149. AUDITABLE NAVIGATION IS NOT REQUIRED BY DEFAULT

Ordinary page navigation need not produce excessive audit noise.

Clinically significant actions SHALL be audited.

Examples:

```text
phenotype approval
Target Slate publication
candidate decision
final signing
```

---

# 150. NOTIFICATION PHILOSOPHY

MAGNIOM notifications SHOULD be:

# actionable

and:

# clinically meaningful.

Examples:

```text
Target Slate ready for review
New evidence may affect this case
Imaging QC failed
Decision requires sign-off
```

Avoid:

```text
You haven't visited MAGNIOM today
3 new insights available
```

---

# 151. FRONT-PAGE GOLDEN CASES MOVE

UX Golden Cases SHALL NOT occupy ordinary Clinical Home.

They SHOULD reside in a protected:

# Validation Workspace.

This preserves their substantial engineering value without confusing clinicians.

---

# 152. HUMAN-FACTORS DASHBOARD MOVE

Human-factors task matrices SHALL reside in:

# Validation / Quality workspace.

Clinicians participating in formal studies may access them through controlled study interfaces.

---

# 153. INTERNAL BUILD MANIFEST MOVE

Detailed build versions SHOULD reside behind:

```text
View build provenance
```

or an internal validation screen.

Clinical users retain inspectability without constant developer-facing clutter.

---

# 154. CANONICAL CLINICIAN HOME EXAMPLE

```text
┌──────────────────────────────────────────────────────────────────────┐
│ MAGNIOM      [ Search cases... ]     CLINICAL MODE     Dr Smith ▾   │
├───────────────┬──────────────────────────────────────────────────────┤
│               │                                                      │
│ Home          │ Good evening, Dr Smith                              │
│ Cases         │                                                      │
│ New Case      │ 3 cases require your attention                     │
│               │                                                      │
│ Review     3  │ ┌─────────────────────────────────────────────────┐ │
│ Decisions     │ │ MGN-26-0042                                    │ │
│               │ │ Target Slate ready for specialist review       │ │
│ Evidence      │ │ MDD ± anxious distress                         │ │
│               │ │                                                 │ │
│ ───────────   │ │ [ Continue target review → ]                   │ │
│ Research      │ └─────────────────────────────────────────────────┘ │
│               │                                                      │
│ Help          │ Needs your attention                               │
│               │ Recent cases                                       │
│               │                                                      │
│               │ Release current · View provenance                  │
└───────────────┴──────────────────────────────────────────────────────┘
```

---

# 155. CANONICAL RESEARCH HOME EXAMPLE

```text
┌──────────────────────────────────────────────────────────────────────┐
│ MAGNIOM       [ Search cases... ]    RESEARCH MODE      Dr Smith ▾  │
├──────────────────────────────────────────────────────────────────────┤
│ RESEARCH PROTOTYPE — NOT FOR CLINICAL USE                           │
├───────────────┬──────────────────────────────────────────────────────┤
│ Home          │ Research cases                                      │
│ Cases         │                                                      │
│ Evidence      │ Experimental outputs must not guide treatment.       │
│               │                                                      │
│ ───────────   │ MGN-R26-0005                                       │
│ Research      │ Connectome anomaly hypothesis                       │
│               │                                                      │
│ Help          │ [ Open Research Target Slate → ]                    │
└───────────────┴──────────────────────────────────────────────────────┘
```

---

# 156. CANONICAL ACTIVE CASE EXAMPLE

```text
┌──────────────────────────────────────────────────────────────────────┐
│ MAGNIOM                               CLINICAL MODE      Dr Smith ▾  │
├───────────────┬──────────────────────────────────────────────────────┤
│ ← All Cases   │ MGN-26-0042                                        │
│               │ Major depressive disorder ± anxious distress        │
│ Overview      │ Phenotype Approved · Connectome Qualified           │
│ Assessment    │ Target Slate Ready for review                       │
│ Phenotype     ├──────────────────────────────────────────────────────┤
│ Imaging       │                                                      │
│ Connectome    │ TARGET SLATE                                         │
│               │                                                      │
│ Target Slate  │ Clinical Context │ Spatial │ Candidates             │
│ Compare       │                                                      │
│ Decision      │ Evidence · reliability · counterfactual             │
│               │ alternatives · uncertainty                           │
│ Treatment     │                                                      │
│ Outcomes      │                                                      │
│ Audit         │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

---

# 157. SHELL SYSTEM REQUIREMENTS MAPPING

This specification directly supports:

```text
MAG-SYS-001
MAG-SYS-002
MAG-SYS-004
MAG-SYS-008
MAG-CLI-006
MAG-CLI-018
MAG-CLI-019
MAG-UX-002
MAG-UX-005
MAG-UX-006
MAG-UX-007
MAG-UX-008
MAG-UX-009
MAG-UX-010
MAG-UX-028
MAG-UX-029
MAG-UX-031
MAG-UX-032
MAG-SEC-003
MAG-SEC-004
MAG-SEC-012
MAG-REL-021
```

Additional shell-specific requirements may be introduced in a later SRS revision.

---

# 158. SHELL-SPECIFIC REQUIREMENTS

### MAG-UX-039

The Top Bar SHALL persistently expose current application environment or mode where clinically material.

### MAG-UX-040

The Sidebar SHALL expose only destinations permitted by the authenticated user's capability set.

### MAG-UX-041

When a Case is active, the Case Header SHALL persistently identify the Case and clinical mode.

### MAG-UX-042

The Case Header SHALL expose clinically material staleness.

### MAG-UX-043

The Main Canvas SHALL remain task-oriented and SHALL NOT function as a generic AI recommendation dashboard.

### MAG-UX-044

Research Mode SHALL remain identifiable across every research Case route.

### MAG-UX-045

The ordinary clinician Home SHALL prioritise actionable Case work over product-feature explanation.

### MAG-UX-046

Clinical signing actions SHALL NOT be placed in the global Top Bar or Case Header.

### MAG-UX-047

Clinical and Research shell states SHALL differ by semantics and permissions, not colour alone.

### MAG-UX-048

Internal verification, Golden Case and human-factors dashboards SHALL remain separate from the ordinary clinician Home.

---

# 159. VALIDATION SCENARIOS FOR THE SHELL

Human-factors testing SHALL include at minimum:

### Scenario S1

Clinician identifies whether application is Clinical or Research Mode within five seconds.

### Scenario S2

Clinician identifies active Case without assistance.

### Scenario S3

Clinician returns from Target Slate to all Cases without browser Back.

### Scenario S4

Clinician recognises a stale Target Slate from the persistent Case Header.

### Scenario S5

Clinician distinguishes global navigation from case workflow navigation.

### Scenario S6

Clinician finds a case requiring target review from Home.

### Scenario S7

Clinician identifies that a Research Target Slate cannot be signed clinically.

### Scenario S8

Clinician opens supporting evidence without losing Case context.

### Scenario S9

Clinician identifies current workflow stage.

### Scenario S10

Clinician identifies account/site context before signing.

---

# 160. AUTOMATION-BIAS SHELL ACCEPTANCE

Clinical release SHOULD fail human-factors acceptance if users routinely:

- treat Home as a recommendation feed;
- interpret Primary Candidate presence in navigation as preferred treatment;
- overlook alternatives because the shell visually privileges Primary 1;
- mistake Research Mode for Clinical Mode;
- fail to identify stale Target Slate state;
- sign without correctly identifying Case context.

---

# 161. CLINICAL ORIENTATION ACCEPTANCE

A representative specialist SHOULD be able to determine within approximately ten seconds of opening a Case:

```text
Which case am I in?
What are we treating?
Which mode is this?
Where am I in the workflow?
What needs my attention now?
Is the current scientific output current?
```

---

# 162. SHELL CHANGE CONTROL

Changes to:

- Case Header content;
- mode presentation;
- workflow navigation;
- signing-location architecture;
- Research/Clinical separation;
- staleness presentation

SHALL undergo human-factors and risk impact review.

These are not ordinary cosmetic changes.

---

# 163. VISUAL REDESIGN CONTROL

Pure styling changes MAY be lower-risk when they cannot alter:

- information visibility;
- ordering;
- prominence;
- action hierarchy;
- mode recognition;
- target authority;
- accessibility.

If any of these change, the change is human-factors relevant.

---

# 164. GOVERNING UX MODEL

The shell operationalises the existing MAGNIOM sequence:

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

The shell SHALL make this workflow feel natural without hiding the intellectual work from the specialist.

---

# 165. FINAL SHELL PRINCIPLES

# The Top Bar establishes authority and environment.

# The Sidebar establishes location.

# The Case Header establishes clinical context.

# The Main Canvas supports reasoning.

# Cases dominate clinical use.

# Research remains unmistakably Research.

# Clinical Mode is visible and release-governed.

# The Case remains visible during scientific reasoning.

# Staleness is persistent, not buried.

# Navigation reflects capability but does not replace security.

# The Home page is a worklist, not a feature catalogue.

# The Sidebar is short.

# Internal scientific modules do not clutter clinical navigation.

# Engineering provenance remains inspectable but secondary.

# The brain viewer never becomes the authority.

# The Target Slate never becomes a prescription.

# The shell never exposes Primary 1 earlier than clinically appropriate.

# The interface never hides alternatives.

# The interface never hides uncertainty.

# Signing occurs only after deliberate clinical review.

# Clinical actions stay inside the Case.

# Research output cannot masquerade as clinical output.

# MAGNIOM should feel calm, rigorous and clinically deliberate.

---

# 166. CANONICAL SHELL DEFINITION

The canonical MAGNIOM shell is:

> **A persistent, role-aware clinical application framework that continuously establishes user authority, deployment environment, navigation location and active case context while preserving the main workspace for inspectable scientific reasoning and independent clinician decision-making.**

Its four architectural responsibilities are:

```text
TOP BAR
Authority + environment

SIDEBAR
Location + authorised navigation

CASE HEADER
Clinical context + workflow state + staleness

MAIN CANVAS
Scientific reasoning + clinical review
```

These responsibilities SHALL remain distinct.

---

# 167. FINAL GOVERNING RULE

> **MAGNIOM shall never force the clinician to infer who they are acting as, which environment they are using, which case they are reviewing, whether the scientific output is current, or where they are within the clinical workflow. Those facts belong to the persistent shell so that the Main Canvas can remain dedicated to the harder task: understanding evidence, phenotype, connectomics, uncertainty and competing target hypotheses before the clinician decides.**

That is the **MAGNIOM Application Shell, Navigation & Clinical Context Specification v1.0**.