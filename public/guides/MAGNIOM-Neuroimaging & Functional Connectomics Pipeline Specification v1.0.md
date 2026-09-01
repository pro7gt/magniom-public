# MAGNIOM
## Neuroimaging & Functional Connectomics Pipeline Specification v1.0

**Document status:** Canonical scientific-compute specification  
**Date:** 1 September 2026  
**Initial indication:** Major depressive disorder ± clinically significant anxious distress  
**Primary modality:** Structural MRI + resting-state functional MRI  
**Preferred Clinical Validation acquisition:** Multi-echo rs-fMRI  
**Primary cortical representation:** Subject cortical surface / fsLR-compatible grayordinates  
**Primary reference parcellation:** HCP-MMP1.0  
**Primary output:** Versioned, QC-qualified patient connectomic measurements and candidate-target maps for the Magniom Target Engine

**Depends on:**

- Magniom Clinical & Scientific Specification v1.0
- Magniom Canonical Target Data Specification v1.0
- Magniom Technical Architecture v1.0
- Magniom Supabase Database & Security Specification v1.0
- Magniom Target Engine & Ranking Algorithm Specification v1.0

---

# 1. PURPOSE

This document defines how Magniom converts patient MRI data into scientifically interpretable and reproducible functional-connectomics measurements suitable for TMS target decision support.

The pipeline covers:

**MRI acquisition**

↓

**DICOM ingestion**

↓

**BIDS conversion**

↓

**structural processing**

↓

**BOLD preprocessing**

↓

**multi-echo combination / denoising**

↓

**nuisance regression and censoring**

↓

**surface representation**

↓

**parcellation**

↓

**functional connectivity**

↓

**therapeutic-circuit mapping**

↓

**normative comparison**

↓

**candidate-target surfaces**

↓

**target reliability**

↓

**QC qualification**

↓

**Target Engine data contract**

The pipeline does **not** decide which target should be treated.

It produces trustworthy measurements from which the Target Engine constructs target hypotheses.

---

# 2. GOVERNING SCIENTIFIC PRINCIPLE

Magniom must distinguish:

# neuroimaging precision

from:

# neuroimaging reliability.

A coordinate may be represented to a fraction of a millimetre while the underlying functional-connectivity estimate may be uncertain by centimetres.

Therefore:

> **No patient-specific functional-connectivity target may influence Clinical Mode merely because a processing pipeline can calculate it.**

The pipeline must first establish whether that localisation is sufficiently reproducible.

---

# 3. PIPELINE RESPONSIBILITY

The Neuroimaging Pipeline answers:

### What anatomy does this patient have?

### What functional-connectivity pattern was measured?

### How does the pattern relate to approved therapeutic circuits?

### How unusual is it compared with a suitable reference population?

### Where are candidate cortical regions within evidence-permitted search spaces?

### How reproducible are those candidate regions?

It does not answer:

### Should this patient receive TMS?

### Which clinical target should be ranked first?

### Which stimulation protocol should be used?

### Is a measured connectivity abnormality causal?

Those belong elsewhere in Magniom.

---

# 4. SCIENTIFIC BASELINE

Individualised connectivity-guided targeting is scientifically credible but methodologically sensitive.

Current studies demonstrate three important facts:

### Individual target locations genuinely vary between people.

### Sufficiently long, carefully processed acquisitions can produce clinically useful within-person reproducibility.

### Different preprocessing strategies can materially move the calculated target.

The 2026 connectivity-guided depression RCT used a 41-minute, four-echo, eyes-open resting-state acquisition and reported a mean split-half target distance of approximately 4.47 mm.

A separate 2024 computational study found approximately 28 minutes of resting-state data plus cluster-based localisation produced target stability below approximately 1 cm in its model.

A 2026 pipeline-comparison study found different rs-fMRI preprocessing approaches shifted SNT-style DLPFC targets by average distances of approximately 1.45–3.82 cm, with individual differences reaching approximately 6.14 cm.

This makes preprocessing:

# part of the clinical measurement definition.

---

# 5. PIPELINE V1 STRATEGY

Magniom v1 therefore uses:

# one frozen Primary Clinical Pipeline

plus:

# predefined sensitivity analyses.

The purpose of sensitivity processing is not to let the system select whichever preprocessing method produces the preferred clinical target.

It is to ask:

> **How dependent is this target on methodological assumptions?**

---

# 6. PIPELINE MODES

## Clinical Pipeline

Used for Clinical Mode target refinement after formal validation.

## Sensitivity Pipeline

Uses predefined alternative processing assumptions solely to estimate robustness.

## Research Pipeline

Allows experimental:

- denoising
- parcellations
- connectivity metrics
- normative models
- targeting methods.

Research outputs cannot silently enter Clinical Mode.

---

# 7. SOFTWARE BASELINE

The initial validation build should freeze exact containers.

Candidate baseline as of September 2026:

### BIDS

BIDS 1.11.1-compatible dataset structure.

### fMRIPrep

fMRIPrep 25.2.5 or the exact subsequently validated release.

### tedana

Pinned validated 26.x release for multi-echo denoising.

### FreeSurfer

Pinned version supplied/validated within the processing container.

### ANTs

Pinned.

### Connectome Workbench

Pinned.

### Python scientific stack

Pinned versions of:

- nibabel
- nilearn
- numpy
- scipy
- pandas.

The exact versions used in Clinical Mode are determined by:

# PipelineVersion

not by whatever package version happens to be current.

---

# 8. NO AUTOMATIC SOFTWARE UPGRADES

A new fMRIPrep, FreeSurfer, tedana or Workbench release does not automatically enter production.

Upgrade procedure:

current validated pipeline

↓

new container

↓

golden imaging dataset

↓

structural comparison

↓

FC comparison

↓

target displacement analysis

↓

reliability comparison

↓

scientific review

↓

new PipelineVersion.

Historical runs remain unchanged.

---

# 9. PIPELINE VERSION MANIFEST

Every run records:

```json
{
  "magniom_neuro_pipeline": "1.0.0",
  "bids_version": "1.11.1",
  "fmriprep_version": "25.2.5",
  "tedana_version": "26.x-pinned",
  "freesurfer_version": "pinned",
  "ants_version": "pinned",
  "workbench_version": "pinned",
  "python_image_digest": "sha256:...",
  "pipeline_container_digest": "sha256:..."
}
```

Container digest is mandatory.

---

# 10. CLINICAL ACQUISITION PROFILE

Magniom should begin with a deliberately standardised:

# Clinical Validation Acquisition Profile A

This profile is a **validation specification**, not a claim that these are universally optimal MRI parameters.

---

# 11. SCANNER

Preferred:

# 3 Tesla

Clinical validation should initially be performed within one scanner class / validated scanner family where possible.

Record:

- manufacturer
- model
- software version
- gradient system
- head coil
- site
- scanner serial/pseudonymous identifier.

Scanner upgrades create a potential acquisition-domain shift and require review.

---

# 12. HEAD COIL

Preferred:

# 32-channel or higher receive array

provided the exact acquisition is validated on the installed system.

Do not assume that channel count alone determines image quality.

---

# 13. STRUCTURAL MRI — T1W

Required.

Provisional acquisition:

### Sequence

3D T1-weighted MPRAGE or validated equivalent.

### Resolution

≤ 1.0 mm isotropic.

### Coverage

Whole brain and scalp sufficient for:

- cortical surface reconstruction
- neuronavigation
- future E-field modelling.

### Motion

Repeat structural acquisition if clinically obvious motion causes cortical reconstruction uncertainty and repeat scanning is appropriate.

---

# 14. OPTIONAL T2W

Strongly recommended for future:

- improved tissue segmentation
- anatomical QC
- E-field head modelling.

Suggested:

≤ 1.0 mm isotropic.

T2 is not required for Clinical Connectome Mode v1 unless validation demonstrates that its absence materially degrades the selected structural pipeline.

---

# 15. RESTING-STATE ACQUISITION

Preferred initial Clinical Mode:

# multi-echo gradient-echo EPI.

Rationale:

multi-echo data allow TE-dependent separation of BOLD and non-BOLD components and have shown improved functional-connectivity reliability in precision-fMRI work.

Clinical Mode should initially standardise one sequence rather than support arbitrary hospital rs-fMRI acquisitions.

---

# 16. MAGNIOM RS-FMRI PROFILE A

Provisional starting specification:

### Field strength

3T.

### State

Eyes open.

### Visual condition

Simple fixed central cross or equivalent stable fixation.

### Instruction

> Keep your eyes open, remain still, look at the fixation point, allow thoughts to come and go, and do not deliberately perform a task.

Instruction is standardised verbatim.

---

# 17. RESTING-STATE DURATION

Recommended validation acquisition:

# 2 × approximately 15-minute runs

for approximately:

# 30 minutes total acquired rs-fMRI.

Why two runs?

They provide an independent measurement for:

- cross-run target stability
- connectivity reliability
- motion resilience.

The 30-minute target is a conservative compromise informed by current evidence showing meaningful gains from longer acquisitions.

---

# 18. MINIMUM DATA IS NOT THE SAME AS RECOMMENDED DATA

Magniom distinguishes:

### Acquired duration

Total scan collected.

### Retained duration

Data remaining after censoring.

### Minimum usable duration

Threshold below which Clinical Mode personalisation is not allowed.

The latter must be validated prospectively.

A provisional validation hypothesis is:

# ≥12 minutes of high-quality retained data as the absolute minimum for any FC personalisation consideration.

The preferred Clinical Mode dataset remains materially longer.

---

# 19. RUN REQUIREMENT

Preferred:

# at least two independently analysable runs.

A case with only one usable run may be:

**Conditional**

rather than automatically failed, provided:

- total retained time is sufficient;
- split-half analysis remains valid;
- future validation supports that pathway.

Cross-run reliability is stronger than split-half reliability alone.

---

# 20. MULTI-ECHO PARAMETERS

The exact echo times are scanner-specific and must be validated.

Reference architecture:

### Echo count

≥3.

Prefer:

# 4 echoes

where sequence performance permits.

A current successful depression targeting trial used approximately:

12 / 28 / 44 / 60 ms

at 3T.

Magniom may use a comparable range but must not copy echo times blindly onto a different scanner/sequence.

---

# 21. TR

Provisional target:

# approximately 1.2–1.5 seconds

where technically feasible with the required:

- echo train
- whole-brain coverage
- spatial resolution.

The 2026 connectivity-guided RCT used TR 1.3 s.

---

# 22. SPATIAL RESOLUTION

Provisional:

# 2.0–2.5 mm isotropic.

Maximum accepted Clinical Profile A target:

# 2.5 mm isotropic.

This aligns with current clinically oriented connectivity targeting while retaining reasonable SNR and whole-brain coverage.

---

# 23. COVERAGE

Required:

- full cerebral cortex
- sgACC region
- striatum
- thalamus
- medial prefrontal structures
- temporal cortex.

Coverage failure affecting an approved therapeutic circuit may invalidate that circuit analysis even if the overall scan otherwise passes.

---

# 24. DISTORTION CORRECTION

Clinical acquisition must include a validated susceptibility-distortion correction strategy.

Preferred:

# spin-echo EPI with reversed phase encoding

or:

validated B0 fieldmap approach.

Record:

- PhaseEncodingDirection
- TotalReadoutTime
- EffectiveEchoSpacing
- IntendedFor / BIDS associations.

Distortion correction is especially important in:

- orbitofrontal
- inferior frontal
- medial temporal

regions.

---

# 25. REAL-TIME MOTION MANAGEMENT

Strongly recommended:

- appropriate head padding
- comfortable positioning
- patient instruction
- real-time motion monitoring where available.

The 2026 connectivity-guided depression trial incorporated real-time motion monitoring/correction.

Magniom does not assume prospective motion correction is universally available.

---

# 26. PHYSIOLOGY

Strongly recommended during validation:

- respiratory belt
- pulse oximetry / PPG.

Physiological recording should be BIDS-compatible.

Clinical Pipeline v1 must remain usable without physiology unless the validated denoising pipeline makes it mandatory.

Where physiology is present, it may support a separately validated nuisance-regression enhancement.

---

# 27. MULTI-SITE ACQUISITION

Magniom should not initially declare:

> Any 3T resting-state scan is equivalent.

New scanner/site combination requires:

# Acquisition Compatibility Validation.

Assess:

- tSNR
- motion characteristics
- distortion
- parcel coverage
- FC distribution
- normative compatibility
- target reliability.

---

# 28. DICOM INGEST

Original DICOM is preserved immutably.

Pipeline:

DICOM

↓

archive integrity

↓

study/series validation

↓

metadata extraction

↓

BIDS conversion.

No scientific pipeline begins from manually renamed NIfTI without provenance unless it is an approved legacy/import workflow.

---

# 29. DICOM VALIDATION

Check:

- StudyInstanceUID consistency
- SeriesInstanceUID
- image count
- acquisition time
- echo count
- phase encoding
- image dimensions
- voxel dimensions
- scanner metadata.

Unexpected variations create:

# Acquisition Warning

or:

# Acquisition Failure.

---

# 30. BIDS CONVERSION

Use pinned:

# dcm2niix

inside the NeuroCompute image.

Output:

```text
sub-MGNxxxxx/
  anat/
  func/
  fmap/
```

Patient name is not required in compute identifiers.

---

# 31. BIDS SUBJECT IDENTIFIER

Use pseudonymous:

```text
sub-MGN7F3A92
```

not:

```text
sub-John-Smith
```

Mapping back to the clinical patient exists only in Supabase.

---

# 32. BIDS VALIDATION

Every dataset passes the pinned BIDS Validator before preprocessing.

Clinical run terminates if required errors indicate scientifically ambiguous inputs.

Warnings are:

- recorded
- reviewed
- versioned.

---

# 33. BIDS PROVENANCE

Dataset contains:

```json
{
  "Name": "Magniom clinical connectomics input",
  "BIDSVersion": "1.11.1"
}
```

Generated derivatives identify:

- source dataset
- pipeline
- version.

Magniom maintains additional provenance in its own immutable manifests irrespective of ongoing BIDS provenance evolution.

---

# 34. RAW MRI QC

Before fMRIPrep:

### T1

Inspect for:

- motion
- major artefact
- incomplete coverage
- gross structural abnormality affecting processing.

### BOLD

Inspect for:

- ghosting
- severe dropout
- reconstruction failure
- unexpected geometry
- missing echoes.

### Fieldmap / reverse PE

Inspect for:

- complete acquisition
- correct orientation
- compatibility.

---

# 35. INCIDENTAL CLINICAL FINDINGS

Magniom is not a radiology reporting system.

If clinical structural MRI review is required, it must be performed through the organisation's clinical radiology pathway.

Algorithmic preprocessing QC does not constitute:

# diagnostic MRI interpretation.

---

# 36. STRUCTURAL PREPROCESSING

Primary pipeline:

# fMRIPrep anatomical workflow + validated FreeSurfer surface reconstruction.

Core outputs:

- bias-corrected T1
- brain mask
- tissue segmentation
- subject cortical surfaces
- subject↔standard transforms
- anatomical QC.

---

# 37. STRUCTURAL SURFACES

Required:

- white matter surface
- pial surface
- midthickness surface
- inflated surface.

These become the primary geometry for cortical targeting.

TMS targets should ultimately reference:

# subject anatomy

rather than only standard-space voxels.

---

# 38. SURFACE RECONSTRUCTION QC

Automated checks:

- surface self-intersection where detectable
- cortical topology
- extreme thickness
- segmentation overlap
- missing regions.

Visual QC:

- frontal pole
- DLPFC
- medial prefrontal cortex
- motor cortex
- target-family search areas.

Manual edits are not allowed casually.

---

# 39. MANUAL STRUCTURAL CORRECTION

If manual surface correction is clinically necessary:

it creates a new:

# StructuralProcessingRun

with:

- editor identity
- reason
- modified files
- hashes
- date.

Never alter a prior validated reconstruction in place.

---

# 40. STANDARD SPACE

Primary standard volumetric representation:

# MNI152NLin2009cAsym

at explicitly declared resolution.

No object may simply say:

# MNI.

Every transform identifies exact template.

---

# 41. SURFACE STANDARD

Preferred standard cortical representation:

# fsLR 32k

for:

- atlas projection
- group circuit representation
- visualisation
- cross-subject comparison.

Patient target remains linked back to native cortical surface.

---

# 42. TRANSFORM GRAPH

Store explicit transform graph:

```text
BOLD native
↔
T1 native
↔
subject surface
↔
fsLR
↔
MNI152NLin2009cAsym
```

Every transform file is hashed.

Transform direction is explicit.

---

# 43. NO FRONTEND TRANSFORMS

Coordinate transformations occur only inside the validated scientific pipeline.

Next.js may:

- display coordinates
- load precomputed meshes.

It must not perform clinical subject↔MNI transformation.

---

# 44. BOLD PREPROCESSING

Use pinned:

# fMRIPrep

for minimal preprocessing.

This covers validated implementations of:

- motion estimation
- susceptibility distortion correction
- BOLD reference
- coregistration
- anatomical registration
- standard-space outputs
- confound estimation.

fMRIPrep's output is not yet the final Magniom FC signal.

---

# 45. IMPORTANT DISTINCTION

fMRIPrep performs:

# preprocessing.

Magniom subsequently performs:

# FC-specific denoising.

These should not be conflated.

---

# 46. NON-STEADY-STATE VOLUMES

Volumes identified as non-steady state are removed from FC analyses.

Detection comes from:

- acquisition metadata where available
- validated fMRIPrep non-steady-state outputs.

The count is recorded.

---

# 47. SLICE TIMING

Performed when required by the acquisition and validated pipeline.

For multi-echo processing:

slice-time correction occurs before TE-dependent denoising where appropriate.

---

# 48. MOTION ESTIMATION

For multi-echo sequences:

motion must be estimated consistently across echoes.

Preferred method follows multi-echo best practice:

# estimate motion from a single appropriate echo and apply the same spatial transforms to all echoes.

Do not independently realign each echo and thereby distort echo relationships.

---

# 49. MULTI-ECHO COMBINATION

After geometric preprocessing:

use:

# TE-dependent processing / optimal combination

through the pinned multi-echo pipeline.

Initial implementation should use:

# tedana-based processing

unless validation demonstrates another pipeline is superior.

---

# 50. TEDANA ROLE

tedana separates signal components using their echo-time dependence.

Conceptually:

### TE-dependent

more consistent with BOLD.

### TE-independent

more consistent with non-BOLD artefact.

Outputs include:

- optimally combined BOLD
- component classifications
- denoised time series
- T2* estimates
- diagnostic reports.

---

# 51. TEDANA QC

Every run records:

- number of ICA components
- accepted components
- rejected components
- variance explained
- T2* coverage
- adaptive mask
- classification report.

Severe failure of TE model / denoising may fail the run.

---

# 52. NO UNREVIEWED MANUAL ICA CLASSIFICATION

Clinical Mode should prefer:

# deterministic automated classification.

Manual component reclassification is a Research/exception workflow requiring:

- documented reviewer
- reason
- new processing-run version.

A clinician cannot casually delete an inconvenient component.

---

# 53. SINGLE-ECHO DATA

Magniom architecture supports single-echo acquisitions.

However:

# Clinical Pipeline v1 should initially validate multi-echo and single-echo separately.

Single-echo data must not be assumed equivalent.

Until separately validated, imported single-echo cases should be:

- Evidence Mode
- Research Mode
- or Conditional Validation Mode.

---

# 54. FUNCTIONAL DENOISING — CENTRAL PRINCIPLE

Denoising is part of the target definition.

A target generated after one nuisance-regression strategy is not assumed equivalent to a target generated after another.

Therefore Magniom defines:

# Clinical Denoising Configuration CD-1

and:

# Sensitivity Denoising Configuration SD-1.

---

# 55. CLINICAL DENOISING CONFIGURATION CD-1

Initial validation candidate:

### Starting signal

ME-ICA-denoised optimally combined BOLD.

### Detrending

Remove:

- constant
- linear
- quadratic trend.

### Motion nuisance

Six rigid-body parameters plus:

- temporal derivatives
- squared terms

according to frozen 24-parameter expansion.

### Tissue nuisance

Mean:

- white matter
- ventricular / CSF

signals plus approved derivatives.

### Global signal

Included in CD-1.

### Censoring

High-motion frames excluded from final correlations.

### Temporal band

Approximately:

# 0.009–0.08 Hz.

This broadly follows an ABCD/HCP-style functional-connectivity strategy.

---

# 56. WHY CD-1 USES GLOBAL SIGNAL REGRESSION

This is a:

# compatibility decision

not a declaration that GSR is universally biologically correct.

The current successful prospective connectivity-targeting literature uses processing influenced by ABCD/HCP approaches, where global signal regression forms part of the FC processing strategy.

GSR is also effective at suppressing motion/physiological artefact.

However, it can materially change:

- correlation magnitudes
- negative correlations.

Therefore Magniom explicitly measures target dependence on it.

---

# 57. SENSITIVITY DENOISING CONFIGURATION SD-1

Identical to CD-1 except:

# no global signal regression.

SD-1 does not produce the Clinical Mode target.

Its purpose is to calculate:

# preprocessing sensitivity.

For each target family:

```text
Primary target under CD-1
vs
Target under SD-1
```

Distance and circuit differences are recorded.

---

# 58. PIPELINE SENSITIVITY METRIC

For candidate family `t`:

\[
D_{GSR}(t)
=
distance
(
Target_{CD1},
Target_{SD1}
)
\]

Store:

- Euclidean distance
- surface geodesic distance where available.

This contributes to:

# pipeline sensitivity uncertainty.

---

# 59. FUTURE SENSITIVITY PIPELINES

Research/validation may also evaluate:

### SD-2

Alternate validated spatial smoothing.

### SD-3

Alternate temporal band.

### SD-4

Alternate nuisance-regression model.

These must not create:

# choose-your-favourite-target preprocessing.

The Clinical target always comes from one predeclared primary pipeline.

---

# 60. ONE-STEP DENOISING

Where technically validated, nuisance regression and filtering should be implemented in an order that avoids reintroducing nuisance frequencies.

MagniomDenoise should favour:

# mathematically consistent joint regression/filtering

rather than a chain of ad hoc sequential operations.

Exact implementation is part of PipelineVersion.

---

# 61. MOTION CENSORING

Motion censoring is required for Clinical Mode.

Initial validation threshold candidate:

# FD > 0.20 mm

for exclusion from FC calculations.

This threshold is provisional and must be validated within the specific acquisition.

---

# 62. RESPIRATORY MOTION

For multiband acquisitions where respiratory pseudomotion contaminates FD:

a validated respiratory-motion filtering approach may be used before motion censoring.

If used, it becomes part of PipelineVersion.

Do not apply a frequency band derived for one TR/scanner blindly to all acquisitions.

---

# 63. DVARS

Standardised DVARS is calculated.

It contributes to:

- QC
- spike detection
- sensitivity analyses.

Magniom v1 should not fail a frame solely because of a universal DVARS number until its validation dataset establishes the relevant threshold.

---

# 64. CENSORING NEIGHBOURS

Research validation should compare:

### frame-only censoring

versus:

### temporal expansion around high-motion frames.

The selected Clinical Mode strategy becomes frozen.

Do not change after seeing target output.

---

# 65. SHORT CLEAN SEGMENTS

Very short isolated retained segments may be excluded.

Minimum contiguous segment length is:

# Scientific Policy parameter.

This avoids calculating FC from fragmented transient windows.

---

# 66. RETAINED TIME

For every BOLD run report:

```text
acquired minutes
non-steady-state removed
motion-censored minutes
final retained minutes
percentage retained
```

The clinician-facing UI should show:

# usable resting-state minutes

rather than only:

# scan duration.

---

# 67. PROVISIONAL MOTION QC

Initial validation bands may use:

### PASS

- mean FD ≤ approximately 0.20 mm
- censoring ≤ approximately 20%
- retained time comfortably above minimum.

### CONDITIONAL

- modestly greater motion
- 20–30% censoring
- sufficient retained time.

### FAIL

- severe motion
- > approximately 30% censoring
- retained time below validated minimum
- major artefact.

These are validation starting points, not immutable medical thresholds.

---

# 68. AUTOMATIC FAILURE OVERRIDE

An Imaging Specialist may not simply click:

# Pass anyway

on a hard-failed dataset.

A scientific override requires:

- explicit reason
- authorised role
- Research/exception workflow
- audit event.

Clinical Target Engine should still obey the validated gate.

---

# 69. SPATIAL SMOOTHING

Avoid broad volume smoothing before patient-specific target localisation.

Why?

Patient-specific target search is precisely concerned with:

# local spatial variation.

Primary time series should therefore remain minimally smoothed.

---

# 70. TARGET-SEARCH SMOOTHING

Instead of indiscriminate whole-brain smoothing:

use:

# target-method-specific surface smoothing / cluster regularisation

inside the candidate-generation procedure.

Example:

- geodesic kernel
- local cluster aggregation.

The exact kernel is versioned by TargetFamily candidate-generation rule.

---

# 71. WHY CLUSTERING MATTERS

Individual FC maxima can be noisy.

Current computational work has shown improved TMS target stability when:

- scan duration increases
- target selection uses spatial clusters rather than single extreme voxels.

Therefore Clinical Mode candidate surfaces should generally produce:

# stable cortical regions

not:

# isolated hottest vertex.

---

# 72. SURFACE PROJECTION

After denoising, BOLD is sampled to subject cortical surface.

Preferred representation:

# fsLR-compatible grayordinates

while retaining native subject surface correspondence.

No target is selected solely in low-resolution MNI volume if a validated surface representation is available.

---

# 73. MEDIAL WALL

Medial-wall vertices are explicitly excluded.

Cortical parcels with insufficient valid signal/coverage are marked:

# incomplete

rather than assigned misleading average FC.

---

# 74. PRIMARY CORTICAL ATLAS

Use:

# HCP-MMP1.0

as the initial reference cortical parcellation.

It contains:

# 180 cortical areas per hemisphere.

The atlas is valuable because it provides anatomically and functionally meaningful cortical subdivisions rather than coarse lobe-level regions.

---

# 75. IMPORTANT HCP-MMP LIMITATION

Magniom must not say:

> “This patient's cortex has been individually HCP-MMP parcellated”

unless the individual areal-classifier methodology and required multimodal inputs have actually been implemented and validated.

Clinical v1 uses:

# HCP-MMP1.0 reference labels mapped to the subject cortical surface.

That is different from true multimodal individual areal classification.

---

# 76. HCP-MMP VERSIONING

Store:

```text
atlas:
HCP-MMP1.0

source:
canonical surface atlas

projection method:
MagniomAtlasProjection v1
```

Never refer simply to:

# “Glasser atlas”

without version/projection provenance.

---

# 77. PARCEL TIME SERIES

For every cortical parcel:

extract a robust mean/weighted mean time series across valid vertices.

Exact procedure:

- exclude medial wall
- exclude vertices failing signal-quality criteria
- apply predetermined surface weighting if used
- average across retained timepoints.

Store:

- number of contributing vertices
- coverage fraction
- temporal variance
- tSNR.

---

# 78. PARCEL COVERAGE QC

A parcel is:

### Valid

coverage above validated threshold.

### Conditional

partial coverage.

### Invalid

insufficient signal.

Candidate TargetFamily depending on an invalid parcel cannot use that parcel's FC as if measured normally.

---

# 79. SUBCORTICAL ROIS

Subcortical regions are represented separately from HCP-MMP.

Possible v1 structures include:

- thalamus
- caudate
- putamen
- pallidum
- nucleus accumbens
- hippocampus
- amygdala

bilaterally,

plus approved medial structures where circuit definitions require them.

The exact ROI package is:

# SubcorticalAtlasVersion.

---

# 80. SGACC ROI

sgACC requires explicit versioning.

Do not allow different projects to refer generically to:

# “the sgACC”.

Store:

- ROI definition
- coordinate space
- original citation
- mask artefact hash.

Multiple sgACC definitions may coexist.

Each TherapeuticCircuit identifies which one it uses.

---

# 81. FUNCTIONAL CONNECTIVITY MATRIX

Primary pairwise FC:

\[
r_{ij}
=
PearsonCorrelation(T_i,T_j)
\]

using retained uncensored timepoints.

Convert for downstream statistical operations:

\[
z_{ij}
=
atanh(r_{ij})
\]

Store full matrix as immutable artifact.

---

# 82. RUN-LEVEL CONNECTIVITY

Calculate FC separately for each run.

Do not concatenate blindly first.

This enables:

# cross-run reliability.

Generate:

```text
FC_run1
FC_run2
FC_combined
```

---

# 83. COMBINED CONNECTIVITY

Preferred:

calculate run-level Fisher-z matrices

then combine using:

- retained-time weighting
- predetermined validated strategy.

This preserves run information and avoids a long high-quality run being treated identically to a short retained run.

---

# 84. CONNECTIVITY MATRIX ARTIFACT

Example:

```text
sub-MGNxxx_
desc-CD1_
atlas-HCPMMP1_
connectivity.tsv.gz
```

Accompany with JSON:

```json
{
  "Metric": "Pearson correlation",
  "Transform": "Fisher z",
  "DenoisingConfiguration": "CD-1",
  "CensoringThreshold": "FD 0.20 mm",
  "TemporalBandHz": [0.009, 0.08],
  "Atlas": "HCP-MMP1.0"
}
```

---

# 85. GLOBAL NETWORK METRICS

Magniom may calculate descriptive connectivity among large-scale networks such as:

- default mode
- frontoparietal / central executive
- salience
- dorsal attention
- somatomotor.

However network definitions must be versioned.

Large-scale network metrics are:

# contextual clinical/research features.

They do not become targets automatically.

---

# 86. THERAPEUTIC CIRCUIT MAPS

Each `TherapeuticCircuit` contains a frozen scientific representation.

Possible representations:

### Weighted whole-brain circuit map

### Seed ROI

### Set of weighted ROIs

### Lesion-network map

### Stimulation-response map

### Multimodal convergent circuit.

---

# 87. CIRCUIT MAP PROVENANCE

Every map stores:

- original source
- publication
- version
- coordinate space
- voxel/vertex resolution
- derivation method
- thresholding
- whether positive and negative weights have distinct interpretation
- SHA-256 hash.

A screenshot of a published brain map is not acceptable input.

---

# 88. CONVERGENT DEPRESSION CIRCUIT

Magniom v1 should include a versioned implementation of the publicly available:

# convergent depression circuit

used in current circuit-guided targeting research.

The 2026 randomized trial individualised this circuit by calculating its weighted patient time course and identifying the left-DLPFC location whose time course correlated most strongly with it.

This becomes an important v1 candidate-generation method.

---

# 89. CIRCUIT TIME SERIES

For a weighted therapeutic circuit map `W(v)`:

\[
T_{circuit}(t)
=
\frac{
\sum_v W(v)X(v,t)
}{
\sum_v |W(v)|
}
\]

or another method defined by the circuit's canonical specification.

The equation is:

# circuit-specific.

No universal formula should be applied silently to every circuit.

---

# 90. CANDIDATE SURFACE MAP

Within an evidence-permitted cortical search space:

for each potential cortical location `x` calculate:

\[
C(x)
=
corr(T_x,T_{circuit})
\]

or the circuit-defined concordance measure.

This produces:

# patient-specific Target Concordance Surface.

---

# 91. TARGET LOCATION IS NOT IMMEDIATELY THE MAXIMUM

Raw:

\[
argmax C(x)
\]

is stored for diagnostics.

Clinical candidate generation then applies:

- cluster regularisation
- anatomical restrictions
- reliability
- accessibility.

This reduces noise-driven targeting.

---

# 92. DECAYING-SPHERE MODEL

Some published targeting approaches model hypothetical stimulation sites as spatially decaying spheres rather than point voxels.

Magniom architecture should support:

```text
candidate influence kernel
```

with:

- radius
- weighting function
- surface/volume definition.

The current convergent-circuit trial used a maximum radius of approximately 12 mm for hypothetical stimulation sites.

Magniom must treat this as:

# method-specific.

---

# 93. SUBJECT ANATOMY REFINEMENT

Candidate must be projected/refined to:

- cortical surface
- appropriate gyrus
- viable coil-accessible cortex.

Do not export a target floating:

- in CSF
- in white matter
- below cortical surface

because a transformed MNI voxel landed there.

---

# 94. STANDARD COORDINATE

For each candidate report:

### Subject surface target

canonical clinical location.

### Subject T1 coordinate

for neuronavigation.

### MNI coordinate

for evidence comparison.

All are linked through recorded transforms.

---

# 95. NORMATIVE CONNECTOMICS

Normative comparison is:

# secondary/contextual in Clinical Mode v1.

It should not independently generate clinical targets.

---

# 96. NORMATIVE MODEL REQUIREMENTS

A Clinical Normative Model must specify:

- reference sample
- N
- age distribution
- sex distribution where relevant
- scanner/sites
- acquisition
- preprocessing
- retained-data thresholds
- atlas
- connectivity metric
- statistical model
- covariates
- model version.

---

# 97. PIPELINE COMPATIBILITY

Patient FC may only be compared with a Clinical Normative Model when:

# preprocessing compatibility requirements pass.

If normative model was built using:

- different GSR status
- different temporal band
- materially different atlas
- incompatible spatial processing

comparison is prohibited unless a validated transformation/harmonisation exists.

---

# 98. NORMATIVE SAMPLE SIZE

Cingulum has published useful proof-of-concept normative anomaly modelling using approximately 200 healthy reference participants.

Magniom should treat:

# ≥200

as a plausible minimum development scale,

not:

# proof that 200 is sufficient for every normative model.

Preferred mature normative release:

# substantially larger and demographically broader.

---

# 99. NORMATIVE MODEL V1

A candidate implementation may use:

# tangent-space functional connectivity

because this provides a principled representation of covariance structure and has precedent in personalised connectomics.

However this is:

# a validation choice.

Pearson/Fisher-z normative models should also be benchmarked.

---

# 100. TANGENT CONNECTIVITY

Conceptually:

subject covariance matrices

↓

reference geometric mean

↓

tangent-space projection

↓

feature vector.

This feature space is then used for:

- normative mean
- variance
- regression
- deviation scores.

---

# 101. NORMATIVE COVARIATES

Potential model covariates:

- age
- scanner/site
- sex where scientifically justified
- motion summary.

Covariates must be predefined.

Do not add covariates after examining a patient's abnormality map.

---

# 102. NORMATIVE DEVIATION

For feature `f`:

\[
Z_f
=
\frac{
Observed_f -
Expected_f
}{
SD_f
}
\]

where `Expected` may derive from the normative regression model.

Store:

- observed value
- expected value
- residual
- z score
- percentile where appropriate.

---

# 103. DO NOT BIN TOO EARLY

Do not convert:

```text
z = -3.72
```

to only:

```text
abnormal = yes
```

Continuous deviation remains canonical.

Thresholded anomaly maps may be derived later.

---

# 104. THREE-SIGMA VIEW

Magniom may display:

\[
|Z| \ge 3
\]

as a:

# high-deviation exploratory marker

because this has clear precedent in Cingulum-style work.

But Clinical Mode v1 must not interpret:

> 3σ = therapeutic target.

---

# 105. VARIABLE CONNECTIVITY EDGES

A normative connection with very high normal variance provides weak evidence of patient-specific abnormality.

The model therefore records:

- feature variance
- reliability.

Cingulum excluded a high-variance subset of connections in its published proof-of-concept framework.

Magniom should benchmark whether variance filtering improves reproducibility before adopting an equivalent Clinical rule.

---

# 106. TARGET RELIABILITY — CENTRAL OUTPUT

For every personalised target method Magniom calculates a:

# TargetReliabilityProfile.

Reliability must be computed from actual patient data whenever possible.

---

# 107. CROSS-RUN TARGET RELIABILITY

Generate target independently:

```text
Run 1 → T1
Run 2 → T2
```

Then:

\[
D_{cross}
=
distance(T1,T2)
\]

Calculate:

- Euclidean distance
- surface geodesic distance where available.

---

# 108. SPLIT-HALF RELIABILITY

For combined retained data:

divide into predetermined independent halves.

Generate:

```text
Half A → TA
Half B → TB
```

Then:

\[
D_{split}
=
distance(T_A,T_B)
\]

The split rule must be frozen.

---

# 109. SPLIT STRATEGY

Prefer:

- balanced temporal data
- representation from both runs where possible.

Avoid:

> first 15 minutes vs final 15 minutes

if that confounds run/state effects unintentionally.

The exact split is PipelineVersion metadata.

---

# 110. CONNECTIVITY RELIABILITY

Beyond coordinates, measure reliability of relevant FC features.

Potential metrics:

- intraclass correlation
- Pearson correlation between run-level candidate maps
- Spearman rank correlation of search-space concordance
- matrix-level similarity.

Store raw values.

---

# 111. SEARCH-SPACE MAP RELIABILITY

Particularly valuable:

\[
R_{map}
=
corr
(
C_{run1}(x),
C_{run2}(x)
)
\]

across the eligible TargetFamily search space.

A target coordinate can appear similar by chance while the underlying surface maps differ.

Therefore coordinate reliability and map reliability are complementary.

---

# 112. CLUSTER RELIABILITY

For candidate clusters calculate:

- Dice overlap
- Jaccard overlap
- centroid distance
- cluster area difference.

A stable cortical target should ideally be supported by a stable region, not merely two close maxima.

---

# 113. PIPELINE RELIABILITY

Required sensitivity output:

```text
CD-1 target
vs
SD-1 target
```

This produces:

# PipelineSensitivityDistance.

Future validated sensitivity variants may create a wider:

# Pipeline Target Dispersion.

---

# 114. ATLAS RELIABILITY

Where TargetFamily interpretation depends on parcel identity:

calculate overlap with neighbouring parcels.

Example:

```text
63% area 46
31% 9-46d
6% other
```

A target exactly on a parcel boundary receives:

# higher atlas uncertainty

than one well within a parcel.

---

# 115. RELIABILITY CONFIDENCE REGION

Instead of displaying one point only:

create a spatial region incorporating:

- cross-run targets
- split-half targets
- sensitivity targets where clinically appropriate.

Possible output:

# robust cortical confidence region.

This is conceptual uncertainty, not a formal 95% statistical confidence interval unless specifically validated as such.

---

# 116. PROVISIONAL RELIABILITY CLASSES

Scientific Policy maps measured stability to:

### High

target robust across runs/partitions.

### Moderate

meaningful variability but likely same stimulation region.

### Low

substantial spatial uncertainty.

### Unreliable

individual FC cannot influence Clinical Mode.

Exact distance thresholds are validated and versioned.

---

# 117. RELIABILITY MUST CONSIDER COIL SCALE

A 7 mm target displacement and a 7 mm E-field change are not necessarily equivalent.

Future reliability should incorporate:

# stimulation-field overlap

rather than coordinate distance alone.

Until E-field validation is complete:

coordinate/surface metrics remain primary.

---

# 118. QC HIERARCHY

Magniom QC has five levels:

## Q0 — Acquisition QC

Was valid data collected?

## Q1 — Structural QC

Is anatomical localisation trustworthy?

## Q2 — Functional QC

Is retained BOLD suitable for FC?

## Q3 — Connectome QC

Are FC representations stable and complete?

## Q4 — Target Reliability QC

Is the candidate localisation reproducible enough for personalisation?

A patient can pass Q0–Q3 and still fail Q4.

---

# 119. Q0 ACQUISITION FAILURE EXAMPLES

- missing essential BOLD echoes
- truncated brain coverage
- missing distortion correction data where required
- invalid metadata
- corrupt acquisition.

---

# 120. Q1 STRUCTURAL FAILURE

- failed cortical reconstruction
- gross registration error
- severe T1 motion
- incorrect orientation
- unreliable target-region surface.

Result:

# Clinical target localisation unavailable.

---

# 121. Q2 FUNCTIONAL FAILURE

- insufficient retained data
- severe head motion
- major artefact
- severe target-circuit signal dropout
- unsuccessful multi-echo processing.

Result:

# personalised FC unavailable.

---

# 122. Q3 CONNECTOME FAILURE

Examples:

- implausible FC distribution
- poor run-to-run matrix similarity
- widespread edge artefacts
- circuit masks not adequately sampled.

---

# 123. Q4 TARGET FAILURE

Examples:

- large cross-run target displacement
- unstable cluster
- large preprocessing sensitivity
- target moves outside evidence-permitted search region.

Result:

# individual FC cannot modify clinical ranking.

---

# 124. QC AGGREGATE STATUS

Final Connectome Quality:

```text
PASS
CONDITIONAL
FAIL
```

But the database also retains individual Q0–Q4 states.

Do not reduce the entire scientific record to one traffic-light colour.

---

# 125. CIRCUIT-SPECIFIC QC

A dataset may be:

# valid for one circuit

and:

# invalid for another.

Example:

good DLPFC and sgACC signal

but severe inferior temporal dropout.

Therefore:

```text
circuit_quality_status
```

is supported.

---

# 126. TARGET FAMILY SEARCH MASK

Each TargetFamily provides:

- canonical standard-space mask
- surface representation
- patient-space transformed search region.

No clinical candidate may originate outside its approved search mask.

---

# 127. SEARCH MASK TRANSFORM QC

Inspect:

- cortical overlap
- laterality
- target-region location
- distortion from standard-to-subject transform.

If mapped search mask overlaps implausible anatomy:

candidate generation fails.

---

# 128. CANDIDATE CLUSTER GENERATION

Generic sequence:

```text
therapeutic circuit
      ↓
patient circuit time series
      ↓
search-space concordance surface
      ↓
threshold
      ↓
surface clusters
      ↓
minimum cluster area
      ↓
cluster stability
      ↓
representative cortical location
```

Exact parameters live in:

# CandidateGenerationRule.

---

# 129. CANDIDATE MAP ARTIFACT

For each TargetFamily produce:

```text
candidate_concordance.func.gii
candidate_clusters.label.gii
candidate_summary.json
```

or equivalent CIFTI/surface formats.

The Target Engine should receive metrics, not recalculate maps.

---

# 130. RAW PEAK

Store:

```text
raw_peak_coordinate
raw_peak_value
```

even when final cluster representative differs.

This permits later method validation.

---

# 131. CLUSTER REPRESENTATIVE

Potential v1 choice:

# weighted surface medoid / centroid of highest stable cluster.

Why not simply maximum?

Because local maxima can be noisy.

Exact method is versioned.

---

# 132. CLUSTER SIZE

Minimum cluster surface area is a TargetFamily/scientific-policy parameter.

The appropriate area depends on:

- spatial resolution
- smoothing
- cortical geometry
- expected TMS field.

Do not hard-code a universal voxel count.

---

# 133. CLUSTER RANKING

Within one TargetFamily, candidate clusters may be ordered by:

- therapeutic-circuit concordance
- stability
- accessibility.

Clinical evidence is identical because all belong to the same parent TargetFamily.

---

# 134. CANDIDATE ACCESSIBILITY HANDOFF

Neuroimaging Pipeline calculates anatomical preliminaries:

- scalp-to-cortex geometry
- surface normal
- curvature
- target depth
- scalp entry projection.

The full coil/E-field optimisation belongs to:

# E-field service / Target Engine architecture.

---

# 135. SCALP SURFACE

Generate subject scalp surface from structural MRI.

Store:

- mesh
- coordinate system
- relation to cortical target.

This supports:

- neuronavigation
- initial depth/accessibility
- E-field processing.

---

# 136. SCALP-TO-CORTEX DISTANCE

Calculate using a defined geometric method.

Do not use simple:

# z-coordinate difference.

Potential method:

shortest validated line from scalp to target along target/coil-constrained trajectory.

Algorithm version is stored.

---

# 137. CINGULUM COMPATIBILITY

For research comparison Magniom should be capable of reproducing a Cingulum-like representation:

- HCP-MMP cortical parcels
- subcortical ROIs
- parcel connectivity matrix
- tangent-space representation
- normative deviation
- high-deviation edges
- clinically relevant network filtering.

This is:

# Research Compatibility Mode.

It should not define the primary Clinical Pipeline.

---

# 138. CINGULUM DIFFERENCE

Magniom deliberately adds components not central to the original published framework:

### cross-run reliability

### split-half target reliability

### preprocessing sensitivity

### evidence-permitted search spaces

### counterfactual standard target

### explicit evidence ceiling.

These are core Magniom differentiators.

---

# 139. INDIVIDUAL FUNCTIONAL PARCELLATION

Future Research Mode may implement:

- MS-HBM
- precision functional networks
- UNITE/DeepPrep-style methods
- other individual-specific parcellation systems.

These should not be confused with:

# reference HCP-MMP projection.

---

# 140. WHY INDIVIDUAL FUNCTIONAL PARCELLATION IS FUTURE WORK

True individual functional-network boundaries may improve:

- circuit specificity
- target localisation.

However they add:

- scan-duration requirements
- algorithm complexity
- new reliability failure modes
- new normative compatibility requirements.

Therefore v1 should first validate a simpler, highly reproducible architecture.

---

# 141. STRUCTURAL CONNECTOMICS

Diffusion MRI is not required for v1.

Architecture should support future:

# DWI / structural connectivity.

This is particularly relevant because recent randomized work has suggested potential benefit from structural-connectivity-informed targeting.

A future DWI pipeline should be separately validated.

---

# 142. DO NOT MIX FUNCTIONAL AND STRUCTURAL SCORES YET

Clinical Mode v1 must not create:

```text
50% rs-fMRI
+
50% tractography
```

without evidence.

Structural connectivity should become a distinct feature once its scientific model is specified.

---

# 143. OUTPUT CONTRACT — CONNECTOME RUN

Every successful pipeline run produces:

```json
{
  "connectome_run_id": "...",
  "pipeline_version": "...",
  "acquisition_profile": "MAGNIOM-ME-A",
  "denoising_configuration": "CD-1",
  "qc_status": "pass",
  "retained_minutes": 27.4,
  "atlas": "HCP-MMP1.0",
  "normative_model": "NM-1.0.0"
}
```

---

# 144. REQUIRED ARTIFACT OUTPUTS

### Structural

- T1 processed
- brain mask
- segmentation
- subject cortical surfaces
- scalp surface.

### Functional

- preprocessed echo data where retained
- optimally combined BOLD
- denoised BOLD
- confounds
- censor mask.

### Surface

- functional surface time series
- fsLR representation.

### Connectome

- parcel time series
- run-level matrices
- combined matrix.

### Circuits

- patient circuit time series
- circuit concordance maps.

### Targets

- candidate surfaces
- clusters
- representative coordinates.

### Reliability

- run targets
- split targets
- sensitivity targets
- reliability metrics.

---

# 145. TARGET ENGINE PAYLOAD

The Target Engine does not need every binary artifact in memory.

It receives structured references:

```ts
interface ConnectomeTargetInput {
  connectome_run_id: string;

  qc_status: "pass" | "conditional" | "fail";

  retained_minutes: number;

  circuit_metrics: CircuitMetric[];

  candidate_maps: CandidateMapRef[];

  candidate_regions: ImagingCandidateRegion[];

  reliability_profiles: TargetReliabilityProfile[];

  normative_findings: NormativeFinding[];

  transform_manifest_id: string;

  artifact_manifest_id: string;
}
```

---

# 146. IMAGING CANDIDATE REGION

```ts
interface ImagingCandidateRegion {
  target_family_version_id: string;

  generation_method: string;

  subject_surface_region: SpatialRegion;

  subject_t1_coordinate: SpatialCoordinate;

  mni_coordinate: SpatialCoordinate;

  raw_peak_coordinate?: SpatialCoordinate;

  cluster_area_mm2?: number;

  circuit_concordance_raw: number;

  circuit_concordance_percentile: number;

  atlas_annotations: AtlasAnnotation[];

  reliability_profile_id: string;
}
```

This is a measurement.

The Target Engine decides whether it becomes a Clinical TargetCandidate.

---

# 147. NORMATIVE FINDING OUTPUT

```ts
interface NormativeFinding {
  feature_code: string;

  observed_value: number;

  expected_value?: number;

  z_score?: number;

  percentile?: number;

  direction?: "higher" | "lower";

  model_version: string;

  reliability?: QualitativeConfidence;
}
```

---

# 148. TARGET RELIABILITY OUTPUT

```ts
interface ImagingTargetReliability {
  target_family_version_id: string;

  cross_run_distance_mm?: number;

  cross_run_geodesic_mm?: number;

  split_half_distance_mm?: number;

  map_similarity?: number;

  cluster_dice?: number;

  pipeline_sensitivity_distance_mm?: number;

  reliability_class:
    | "high"
    | "moderate"
    | "low"
    | "unreliable";

  limiting_factors: string[];
}
```

---

# 149. PIPELINE MANIFEST

Every run produces immutable:

```text
pipeline-manifest.json
```

containing:

- inputs
- SHA-256 hashes
- software
- configurations
- command line
- environment
- start/end
- CPU/GPU
- stages
- warnings
- outputs
- output hashes.

---

# 150. STAGE MANIFESTS

Each major stage additionally outputs its own manifest.

Example:

```text
01-bids.json
02-structural.json
03-fmriprep.json
04-tedana.json
05-denoise.json
06-surface.json
07-connectome.json
08-circuits.json
09-normative.json
10-targets.json
11-reliability.json
```

This improves fault isolation.

---

# 151. NO SILENT WARNINGS

Every processing warning receives:

```text
severity:
info | warning | critical
```

and:

```text
clinical_impact:
none | possible | target_family_specific | personalisation_invalid
```

The user interface can therefore distinguish a harmless BIDS warning from a clinically relevant registration concern.

---

# 152. PROCESSING STATUS

Pipeline stages:

```text
pending
running
passed
conditional
failed
superseded
```

A run is:

# Clinical Eligible

only if every mandatory stage has acceptable status.

---

# 153. FAILURE DOES NOT DELETE OUTPUTS

When a pipeline fails after stage 8:

retain prior stage artefacts and logs.

Mark:

# incomplete / nonclinical.

This helps debugging.

Incomplete outputs do not become Target Engine inputs.

---

# 154. PIPELINE RESTART

Restart creates:

- same ProcessingRun if safely resumable from immutable validated stages

or:

- new superseding ProcessingRun

according to failure type.

Never overwrite a completed Clinical run.

---

# 155. PIPELINE HASH

Compute:

\[
H_{pipeline}
=
SHA256(
InputManifest
+
SoftwareManifest
+
ScientificConfiguration
)
\]

Identical run request may reuse existing successful immutable result.

---

# 156. PIPELINE VALIDATION DATASETS

At minimum maintain:

### Dataset A

very low-motion healthy reference.

### Dataset B

typical MDD patient.

### Dataset C

moderate motion.

### Dataset D

high motion / expected fail.

### Dataset E

known surface-reconstruction challenge.

### Dataset F

target near atlas boundary.

### Dataset G

high GSR/no-GSR target sensitivity.

### Dataset H

highly stable connectomic target.

---

# 157. GOLDEN PIPELINE OUTPUTS

For each validation dataset freeze:

- QC metrics
- surface checksums
- FC summary statistics
- selected circuit maps
- candidate regions
- reliability outputs.

Software upgrades compare against these.

---

# 158. PIPELINE CHANGE ACCEPTANCE

A new pipeline version must quantify:

### target displacement

### matrix correlation

### circuit map correlation

### QC classification changes

### candidate-cluster changes.

A target displacement may be scientifically acceptable.

It must never be:

# unnoticed.

---

# 159. SOFTWARE UPDATE RULE

If a dependency update changes candidate targets materially:

the release is not a:

# routine technical patch.

It becomes a:

# scientific algorithm impact change.

Requires scientific review.

---

# 160. MULTI-SCANNER VALIDATION

Before adding another scanner:

collect an acquisition-validation set.

Ideally include:

- repeat scans
- traveling subjects / phantom where feasible.

Compare:

- FC distributions
- target stability
- candidate displacement
- normative deviations.

---

# 161. NORMATIVE MODEL SITE EFFECTS

If multi-site normative data are used:

quantify site/scanner effects before harmonisation.

Possible approaches:

- regression covariates
- hierarchical models
- ComBat-like harmonisation.

No method enters Clinical Mode without checking whether it alters:

# individual target ordering.

---

# 162. DO NOT HARMONISE AWAY PATIENT SIGNAL

Harmonisation can remove:

- scanner artefact

but potentially also:

- biological variation.

Therefore normative harmonisation requires separate validation.

The Target Engine's primary therapeutic-circuit candidate should not depend on aggressive population harmonisation unnecessarily.

---

# 163. TARGET RELIABILITY VALIDATION ENDPOINT

The major early neuroimaging endpoint is:

# within-person target reproducibility.

Not merely:

# average FC matrix quality.

For each targeting method assess:

- mean/median target distance
- 90th percentile
- outlier rate
- proportion within predefined tolerance.

---

# 164. BETWEEN-PERSON VARIABILITY

A useful personalised target should ideally show:

# within-person distance < between-person distance.

If everyone receives nearly the same coordinate:

personalisation may add little.

If within-person variability is as large as between-person variability:

personalisation is unreliable.

---

# 165. RELIABILITY RATIO

Research metric:

\[
RR =
\frac{
MedianWithinPersonDistance
}{
MedianBetweenPersonDistance
}
\]

Lower is better.

This is a validation metric, not clinician-facing probability.

---

# 166. TEST-RETEST MRI

A subset of validation participants should receive:

# separate-session repeat MRI.

Split-half reliability is valuable.

Separate-day/session test-retest provides stronger evidence that individualisation is not just stable within one scan.

---

# 167. SCAN-DURATION EXPERIMENT

During development, use long acquisitions and retrospectively truncate:

```text
6 min
9 min
12 min
15 min
20 min
25 min
30 min
```

Generate targets at each duration.

Plot:

# target convergence vs retained minutes.

This creates a Magniom-specific empirical basis for minimum scan duration.

---

# 168. MOTION EXPERIMENT

Similarly quantify target behaviour as progressively more high-motion frames are excluded.

This allows the team to determine:

# when censoring improves reliability

versus:

# when insufficient data begins to degrade it.

---

# 169. PREPROCESSING SENSITIVITY EXPERIMENT

For validation participants generate targets under:

### CD-1

primary.

### SD-1

no GSR.

### SD-2

alternate smoothing if studied.

Measure:

- displacement
- ranking
- cluster overlap.

This directly addresses the preprocessing-instability problem documented in current literature.

---

# 170. TARGET FAMILY-SPECIFIC RELIABILITY

Reliability is not necessarily universal.

For example:

# broad convergent depression circuit

may yield more stable targets than:

# single sgACC seed.

This has precedent in current literature showing distributed circuit targets can be more reproducible than single-region connectivity targets.

Therefore reliability thresholds may eventually be:

# TargetFamily-specific.

---

# 171. CIRCUIT COMPARISON OUTPUT

For each patient generate descriptive comparison among:

- evidence-only target
- sgACC FC target
- convergent depression circuit target
- dysphoric target
- anxiosomatic target.

The Target Engine decides which belong in Clinical Slate.

The pipeline merely measures them.

---

# 172. NO TARGET RANKING IN NEUROCOMPUTE

NeuroCompute must not output:

```text
best_target = ...
```

It may output:

```text
highest_concordance_candidate_for_target_family = ...
```

The difference is important.

The Target Engine applies:

- evidence
- phenotype
- clinical role
- redundancy.

---

# 173. NEURONAVIGATION OUTPUT

After clinician selection—not before—the relevant target can be exported.

Neuroimaging Pipeline must already retain:

- subject T1
- target native coordinate
- surface point
- transform.

Vendor adapter later produces:

- Brainsight
- Localite
- other supported format.

---

# 174. TARGET COORDINATE ROUND TRIP

Validation requirement:

subject target

↓

export

↓

import into neuronavigation test environment

↓

re-read location

↓

compare with Magniom source coordinate.

Any convention mismatch must be detected.

---

# 175. LEFT/RIGHT SAFETY TEST

Automated spatial validation must explicitly verify:

- hemisphere
- orientation
- RAS/LPS conventions.

Target pipeline should have a hard:

# laterality invariant.

For a left-DLPFC TargetFamily, a right-hemisphere coordinate is a fatal pipeline error unless the TargetFamily explicitly allows bilateral/variable laterality.

---

# 176. QC REPORT

Every run produces:

# Magniom Connectome Quality Report.

Sections:

### Acquisition

### Structural

### Functional

### Motion

### Multi-echo denoising

### Surface

### Parcel coverage

### Connectivity

### Therapeutic circuits

### Normative model

### Target reliability

### Pipeline sensitivity

### Final Clinical Eligibility.

---

# 177. CLINICIAN-FACING QC SUMMARY

Do not show only technical metrics.

Example:

# Connectome qualified for personalised targeting

**Usable resting-state data:** 27.4 minutes  
**Motion:** Low  
**Structural registration:** High quality  
**Target cross-run stability:** 5.2 mm  
**Split-half stability:** 6.4 mm  
**GSR sensitivity:** 4.8 mm  
**Overall:** High reliability

Then:

> Patient-specific connectivity may influence Magniom target ranking.

---

# 178. FAILED QC SUMMARY

Example:

# Patient-specific connectomics not qualified

**Usable data:** 9.1 minutes  
**Motion censoring:** 39%  
**Cross-run target distance:** 23 mm  
**Overall:** Unreliable

> Magniom will use evidence-supported target families without patient-specific FC refinement. Repeat MRI may be considered if clinically appropriate.

---

# 179. NO “BAD BRAIN SCAN”

Language must describe:

# measurement quality

not:

# patient pathology.

Use:

> functional-connectivity localisation is unreliable.

Not:

> abnormal brain mapping failed.

---

# 180. CLINICAL REPORT TERMINOLOGY

Preferred:

### Functional-connectivity measurement

### Therapeutic-circuit concordance

### Normative deviation

### Target localisation stability

### Atlas annotation

Avoid:

### broken network

### dysfunctional brain map

### exact optimal target

### definitive abnormality.

---

# 181. DATA RETENTION

Raw data should generally be retained according to clinical/research policy.

At minimum preserve for reproducibility:

- source DICOM or validated original representation
- T1
- raw BOLD
- key derivatives
- manifests.

If raw imaging is deleted under retention policy, the historical Target Slate remains valid as historical clinical record but exact recomputation may no longer be possible.

This must be documented.

---

# 182. COMPUTE SECURITY

NeuroCompute sees:

- pseudonymous case ID
- artifact IDs
- MRI.

It does not require:

- patient name
- address
- clinical notes.

TargetFamily/circuit identifiers are sufficient.

---

# 183. OFFLINE OPERATION

The production compute image should support:

# network-isolated execution.

All required:

- software
- atlases
- templates
- circuit maps
- normative models

are preloaded and hash-verified.

No pipeline stage downloads:

# latest template

during a clinical run.

---

# 184. TEMPLATEFLOW / EXTERNAL RESOURCE POLICY

If TemplateFlow assets are used:

exact template resources are cached inside the validated environment.

Their checksums become part of the pipeline release.

No runtime internet dependency.

---

# 185. CIRCUIT MAP UPDATE

If the scientific team updates the convergent depression circuit map:

that is not a pipeline patch.

It creates a new:

# TherapeuticCircuit version

and potentially:

# Evidence Library release.

Historical image processing may be reused to recalculate new circuit maps if explicitly requested, but historical Target Slates remain immutable.

---

# 186. ATLAS UPDATE

Likewise:

HCP-MMP1.0

→ future atlas

requires:

- new AtlasVersion
- cross-atlas validation
- target displacement analysis.

Do not silently remap old cases.

---

# 187. NORMATIVE MODEL UPDATE

Normative Model 1.0

→ 1.1

does not change old deviations.

New Target Slate generation explicitly references the new model.

---

# 188. PIPELINE OUTPUT IMMUTABILITY

A completed ProcessingRun is immutable.

Changes require:

# superseding run.

No:

```text
overwrite connectivity.tsv
```

inside existing run directory.

---

# 189. DIRECTORY PRINCIPLE

Conceptual:

```text
case/
  run-uuid-001/
    raw-manifest/
    structural/
    bold/
    surface/
    connectome/
    circuits/
    normative/
    targeting/
    reliability/
    qc/
    manifests/
```

New pipeline:

```text
run-uuid-002/
```

Old run remains.

---

# 190. RESEARCH MODE

Research Mode may expose:

- alternative denoising
- Cingulum-style anomaly matrices
- MS-HBM
- structural FC
- effective connectivity
- alternative circuit maps
- predictive biomarkers.

All output objects carry:

```text
mode = research
```

and may not be used by Clinical Target Engine unless explicitly promoted.

---

# 191. FIRST DEVELOPMENT MILESTONE

Implement pipeline against:

# preprocessed synthetic/known BOLD outputs.

Goal:

validate:

- data contracts
- FC calculation
- circuit mapping
- TargetReliabilityProfile
- Target Engine integration.

---

# 192. SECOND MILESTONE

Implement:

# structural + fMRIPrep pipeline.

Use healthy/de-identified validation data.

---

# 193. THIRD MILESTONE

Implement:

# multi-echo / tedana + CD-1.

Generate:

- clean timeseries
- FC matrices
- circuit maps.

---

# 194. FOURTH MILESTONE

Implement:

# reliability.

Required before calling the pipeline clinically useful.

---

# 195. FIFTH MILESTONE

Implement:

# normative model.

Because normative anomaly is secondary in Clinical v1, this can follow core circuit targeting.

---

# 196. SIXTH MILESTONE

Implement:

# sensitivity pipeline.

Compare CD-1 vs SD-1.

This should be complete before clinical validation begins.

---

# 197. SEVENTH MILESTONE

Implement:

# prospective silent imaging validation.

Generate targets but hide them from treating specialists.

Assess:

- reliability
- displacement
- workflow.

---

# 198. PIPELINE RELEASE CRITERIA

Clinical Pipeline v1.0 should not release until:

### Acquisition protocol is frozen.

### Containers are frozen.

### BIDS conversion is deterministic.

### Structural QC passes validation.

### Denoising configuration is fixed.

### FC matrix is reproducible.

### Therapeutic circuit maps are versioned.

### Subject/MNI transforms are validated.

### Candidate surfaces are reproducible.

### Reliability metrics are functioning.

### Preprocessing sensitivity is quantified.

### Failed imaging appropriately triggers abstention.

### Target Engine receives exact canonical output.

---

# 199. SCIENTIFIC VALIDATION QUESTION

The key pipeline question is not:

> Does the MRI look good?

It is:

# If we acquired and processed this patient's brain again, would Magniom reach approximately the same patient-specific target hypothesis?

That is the appropriate standard for precision TMS targeting.

---

# 200. CANONICAL PIPELINE ALGORITHM

```text
DICOM
  ↓
Validate acquisition
  ↓
Convert to BIDS
  ↓
Structural preprocess
  ↓
Reconstruct subject cortex
  ↓
Preprocess multi-echo BOLD
  ↓
TE-dependent denoise
  ↓
Apply CD-1 nuisance model
  ↓
Censor motion
  ↓
Band-limit BOLD
  ↓
Project to subject surface
  ↓
Map HCP-MMP1.0 reference atlas
  ↓
Extract parcel / circuit time series
  ↓
Calculate run-level FC
  ↓
Calculate combined FC
  ↓
Calculate therapeutic-circuit maps
  ↓
Apply approved target-family search spaces
  ↓
Generate stable candidate clusters
  ↓
Calculate normative context
  ↓
Repeat by run / half / sensitivity pipeline
  ↓
Generate TargetReliabilityProfile
  ↓
QC Gate
  ↓
Clinical-qualified measurements
  ↓
Magniom Target Engine
```

---

# 201. THE PIPELINE MUST NOT

The pipeline must never:

### search the entire brain for the most abnormal connection and call it a clinical target;

### alter preprocessing after seeing which target looks clinically preferable;

### treat an HCP parcel boundary as exact individual neurobiology;

### compare patient data with an incompatible normative model;

### create negative correlations and then describe them as pathology without qualification;

### hide high motion by reporting only acquired scan duration;

### call an unstable coordinate “precision targeting”;

### export a coordinate without coordinate space;

### allow an arbitrary software update to move targets silently;

### use Research Mode measurements inside Clinical Mode without governance.

---

# 202. MAGNIOM PIPELINE DIFFERENTIATOR

A conventional personalised targeting pipeline may produce:

# a coordinate.

Magniom must produce:

# a coordinate

plus:

# its anatomical region

# its therapeutic-circuit relationship

# its source evidence search space

# its cross-run stability

# its split-half stability

# its preprocessing sensitivity

# its atlas uncertainty

# its normative context

# its complete provenance.

That is a substantially stronger clinical data object.

---

# 203. SCIENTIFIC MANIFESTO

# Acquire enough data to test the target, not merely calculate it.

# Preserve patient anatomy.

# Freeze preprocessing.

# Treat denoising as part of the scientific measurement.

# Measure motion rather than hoping it disappears.

# Prefer stable regions over noisy peaks.

# Keep atlas labels subordinate to individual anatomy.

# Separate therapeutic circuits from normative abnormalities.

# Use normative deviation as context, not diagnosis.

# Measure preprocessing dependence.

# Measure target reproducibility.

# Abstain when the individual signal is not reliable.

# Never let a precise coordinate conceal an imprecise measurement.

---

# 204. FINAL PIPELINE PRINCIPLE

Magniom functional connectomics should not ask:

> **“What coordinate can this MRI generate?”**

It should ask:

> **“What patient-specific cortical target information can this MRI support reproducibly enough to influence a specialist's decision?”**

That distinction is the foundation of Magniom's Neuroimaging & Functional Connectomics Pipeline v1.0.