Magniom has a strong architectural foundation for evidence governance, reproducibility, policy gating, audit trails and clinician review. However, its present connectomics implementation is a synthetic demonstrator, not a functioning patient-specific targeting pipeline.

Most importantly, simulated outputs can currently be presented as clinically qualified connectome-refined targets. Magniom should therefore remain research-only until this boundary is made fail-closed.

Principal findings
Severity	Finding	Consequence
Critical	The MDD refinement generator is permitted in clinical mode but always returns [-42,44,30] with fixed scores and no limitations.	A non-personalized coordinate can appear as a patient-specific result.
Critical	Structural MRI, BOLD preprocessing, surface reconstruction and sgACC time series are simulated. Files carrying .nii.gz or .gii extensions frequently contain text or empty XML arrays.	Patient images are not actually processed into the reported measurements.
Critical	Direct execution in clinical mode produced ready_for_review with the fixed refinement as primary_1.	Existing gates do not identify the simulated origin.
High	The implemented sgACC method differs substantially from Cash–Zalesky targeting.	The output cannot be described as implementing their individualized method.
High	Reliability calculations operate on synthetic data and, in places, use a different sgACC proxy from the primary algorithm.	Reliability numbers do not validate the reported target.
High	No MDD structural-connectivity or polysynaptic pathway target generator exists.	The recent direction of Zalesky’s work is currently represented only in documentation.
High	The E-field and diffusion providers return configured or fixed measurements without running SimNIBS/MRtrix.	Coil accessibility and structural connectivity cannot support clinical decisions.
High	Evidence releases contain inconsistent sgACC definitions, incorrect methodological attribution and placeholder hashes.	Scientific provenance is not yet release-grade.
1. Clinical leakage

The key defect is in 
mdd-plugin.ts:

lines 117–196 define the connectome-refinement generator;
it is permitted in clinical, research and validation;
it does not read an imaging-derived candidate;
it returns the same coordinate and scores for every patient;
it has no SYNTHETIC or RESEARCH_ONLY limitation;
the slate profile prefers connectome refinement for primary_1.

The research-leakage gate in 
g14-research-leakage.ts only catches specific limitation strings. Because the MDD generator declares none, it passes.

The policy then explicitly calls this configuration clinical and approved in 
mdd-policy.ts.

2. The scientific compute pipeline is simulated

Representative examples:

preprocessor.py writes short strings into files named .nii.gz, then supplies fixed tissue fractions and registration metrics.
fmriprep_runner.py generates random motion traces and textual “BOLD” artifacts rather than invoking fMRIPrep.
projection.py ignores the denoised image data and generates sinusoidal surface signals plus random noise.
atlas.py constructs synthetic sequential vertex blocks and formula-based “realistic centroids”; it does not load HCP-MMP assets.
sgacc.py creates the sgACC signal from sine and cosine functions.

Nevertheless, 
connectome_job_handler.py labels candidates “patient-specific,” supplies fixed reliability values, forces high registration/segmentation quality and returns qc_status="pass".

The mode argument is accepted but never used to block this behavior.

Comparison with Zalesky’s functional-targeting method
Zalesky/Cash requirement	Current Magniom	Required implementation
Measured patient resting-state BOLD	Synthetic harmonics	Real, validated 4D NIfTI input and preprocessing
Stable sgACC signal	Artificial sinusoid	Versioned direct seed or Cash group-seedmap weighting of patient data
Explicit DLPFC search region	Synthetic HCP-like vertex blocks	Valid surface/volumetric mask with verified atlas assets
Strongest negative FC subset	Top 15% of an inverted synthetic correlation	Pre-registered threshold appropriate to the algorithm release
Spatial connected components	Not implemented	True surface or 26-neighbour clustering
Largest coherent cluster	All thresholded vertices treated as one cluster	Select the largest qualifying component
Cluster centre of gravity	Middle item in a vertex-index list	Coordinate-weighted centroid projected to accessible cortex
Exact repeatability test	Different proxy seed used in reliability code	Re-run the identical target algorithm on independent halves/runs
Patient-specific variation	Fixed TypeScript target	Candidate generated exclusively from measured patient output
Target region plus uncertainty	Point only	Surface ROI, centroid, peak, confidence region and representative point

The current implementation is therefore not merely an approximation. It computes a different quantity.

Recommended integration architecture

Magniom should expose four scientifically distinct methods:

FC_CLUSTER_PERSONALISED

Implement the Cash–Zalesky seedmap-and-cluster method using measured resting-state fMRI. Preserve the full target cluster and its centroid. The exact seed, smoothing, global-signal-regression choice, threshold and search mask must belong to a frozen algorithm release.

SC_CLUSTER_PERSONALISED

Add a separate diffusion pipeline using actual MRtrix3 preprocessing, probabilistic tractography and SIFT2. Following the attached randomized study, use a versioned sgACC/A32sg definition, DLPFC search mask, strongest-connectivity threshold, connected components and cluster centroid. Initially keep this in validation mode.

NORMATIVE_PATHWAY_MODEL

Implement Zalesky’s polysynaptic communication model as research-only:

$$ \text{edge cost}=-\log(W),\qquad \text{route metrics}=\{\text{weighted distance, hop count, route stability}\} $$

Its outputs must say “normative” unless the graph was genuinely reconstructed from that patient.

HYBRID_CONNECTOMIC_RESEARCH

Compare FC, SC and pathway efficiency without collapsing them into one undocumented scalar. Hybrid promotion should require prospective validation.

Zalesky’s other concepts should be routed carefully:

Network-Based Statistic belongs in cohort-level validation and outcome research, not single-patient target generation.
Dynamic FC and brooding-state analyses belong in research context.
Generative connectomes may support software testing or missing-data research, never clinical substitution.
Structural-to-functional prediction should not replace measured FC given its currently modest individual predictive advantage.
Target representation

Magniom already has suitable surface_roi, network and coil_field types in 
target-geometry.ts. The MDD policy currently restricts the result to a point.

A Zalesky-aligned candidate should retain:

full cortical cluster or ROI;
cluster centroid and raw connectivity peak;
native-T1 and standard-space coordinates;
surface vertex and cortical normal;
split-half and cross-run displacement;
map correlation and cluster overlap;
confidence region;
coil pose and E-field coverage;
seed, atlas, preprocessing and normative-map versions.

The point should be explicitly described as a representative navigation coordinate, not the biological target itself.

Immediate implementation sequence

P0 — Fail closed

Disable clinical use of every simulated neurocompute and modality output. Add an immutable dataOrigin: patient_measured | normative | synthetic field and make synthetic fatal in clinical mode.

P0 — Correct product claims

Reconcile 
README.md with the actual implementation. The repository is presently a design-controlled prototype, not demonstrated Class IIb/Class B SaMD functionality.

P1 — Repair evidence governance

Create separate, versioned sgACC definitions rather than a generic “sgACC” object. Add the attached Cash/Zalesky methodological, clinical, structural and pathway papers with correct study design and claims. Replace empty-string and patterned placeholder hashes with hashes of real assets.

P1 — Replace simulated neuroimaging

Invoke real tools or validated libraries and reject files that are not valid NIfTI/GIFTI/CIFTI/tractogram objects.

P2 — Implement and independently test FC targeting

Prefer two resting-state runs totalling approximately 15–20 usable minutes. Validate the algorithm against HCP test–retest data and compare it with single-voxel and searchlight baselines.

P3 — Add SC and pathway engines

Keep distinct provenance and maturity states. Do not call normative pathways personalized.

P4 — Complete physical targeting

Replace the configured-output 
E-field provider with actual SimNIBS calculations and optimize coil pose over the target region.

P5 — Clinical validation

Progress through numerical fixtures, real imaging phantoms, test–retest datasets, retrospective target–outcome validation and finally prospective comparison. A reproducible coordinate alone is not evidence of therapeutic superiority.

Verification performed
All 15 TypeScript packages built successfully.
The JavaScript/TypeScript suite passed approximately 978 assertions.
The Python scientific suite failed during collection in 13 modules because 
gifti.py uses Any without importing it.
The normal npm test command does not include those Python tests.
No repository files were modified.

In short: Magniom’s governance architecture is considerably more mature than its neuroscience implementation. The best route is to preserve that architecture, make synthetic provenance impossible to promote clinically, and implement MDD as the first rigorously validated Zalesky-style vertical slice before expanding the eight-indication portfolio.
