# Individual Structural Connectivity Targeting (Li et al. 2026 Method)

## Method Code: `SC_CLUSTER_PERSONALISED`
**Version:** `0.1.0`  
**Classification:** Research / Analytical Method Specification  
**Canonical Manifest:** `scientific-config/methods/SC_CLUSTER_PERSONALISED/0.1.0.json`  

---

## 1. Scientific Background & Rationale

While functional connectivity (fc-fMRI) reflects dynamic synchronization between DLPFC and sgACC, structural connectivity derived from diffusion-weighted imaging (DWI) reveals direct and indirect axonal pathways (such as the uncinate fasciculus and fronto-thalamic projections).

Li et al. (*Am J Psychiatry*, 2026; doi:10.1176/appi.ajp.20251084) demonstrated in a pivotal randomized double-blind parallel-design trial that individual probabilistic tractography seeded from the subgenual cingulate (specifically the Brainnetome A32sg parcel) directly to Left DLPFC parcels achieves clinical superiority over conventional targeting.

---

## 2. Algorithmic Workflow & Parameters

### 2.1 Preprocessing & Multi-Shell Constrained Spherical Deconvolution (CSD)
- Multi-tissue CSD implemented via MRtrix3 (`5TT` segmentation: cortical gray matter, subcortical gray matter, white matter, CSF, pathological tissue/lesions).
- Response function estimation: Dhollander algorithm for unsupervised estimation of WM, GM, and CSF response functions.
- Multi-shell multi-tissue CSD yielding fiber orientation distributions (FODs) in white matter.

### 2.2 Anatomically Constrained Tractography (ACT) & SIFT2
- Streamline generation using iFOD2 probabilistic tracking with ACT.
- Total generated streamlines: $N = 10^7$.
- SIFT2 (Spherical-deconvolution Informed Filtering of Tractograms 2) weighting to estimate biologically meaningful streamline cross-sectional areas.

### 2.3 Individual sgACC Seeding
- **Seed ROI:** Bilateral or ipsilateral A32sg (Brainnetome atlas) registered to subject T1w native anatomical space.
- **Target Inclusion Mask:** Left DLPFC cortical ribbon (Brainnetome A9/46d, A9/46v, A46).
- **Streamline Filtering:** Streamlines terminating at the gray-white matter interface (GWMI) of the target mask are isolated.

### 2.4 Strongest-Cluster Target Delineation
- Streamline terminations are mapped to the cortical mid-thickness mesh or 3D voxel space.
- Log-transformed streamline endpoint density $D(v) = \log_{10}(1 + \sum_{s \in \text{terminations}(v)} w_s)$ is smoothed along the surface using a Gaussian kernel ($\text{FWHM} = 5\text{ mm}$).
- Rather than selecting an isolated point local maximum, the trial procedure delineates the **strongest contiguous spatial cluster** exceeding the 5% threshold ($T_{\text{threshold}} = 0.05$), and computes the center of gravity / weighted centroid as the target coordinate.

---

## 3. Governance & Regulatory Classification

> [!WARNING]
> **Validation / Research Mode Only**: SC tractography targeting is classified as `validation` maturity. Under MAGNIOM G14 Clinical Research Leakage gate and §40 (Revision 01), this method is **strictly blocked from clinical CDS promotion** (`clinicalPromotionStatus = 'blocked'`). It can only be executed in `validation` or `research` mode.
