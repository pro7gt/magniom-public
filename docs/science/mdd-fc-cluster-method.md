# Personalized Functional Connectivity Clustering (Cash-Zalesky Method)

## Method Code: `FC_CLUSTER_PERSONALISED`
**Version:** `0.1.0`  
**Classification:** Analytical Method Specification  
**Canonical Manifest:** `scientific-config/methods/FC_CLUSTER_PERSONALISED/0.1.0.json`  

---

## 1. Scientific Background & Intended Use

Standard stereotactic Left DLPFC TMS targeting for Major Depressive Disorder (MDD) often targets nominal anatomical coordinates (such as MNI $x=-42, y=38, z=40$ or $x=-38, y=44, z=26$). However, clinical response heterogeneity is strongly correlated with individual variability in functional connectivity between the stimulated cortical site and the subgenual anterior cingulate cortex (sgACC, BA25).

The Cash-Zalesky personalized functional connectivity (FC) clustering method (Cash et al., *Human Brain Mapping* 2021; Fox et al., 2012) identifies a patient-specific cortical stimulation target within the Left DLPFC by finding the spatially contiguous cluster of voxels exhibiting maximal functional anticorrelation with the sgACC seed.

---

## 2. Mathematical Formulation

### 2.1 Seed Definition & Signal Construction
- **Conventional sgACC Seed:** Subgenual anterior cingulate cortex (sgACC). Canonical MNI coordinate: $(x=6, y=16, z=-10)$ or bilateral/left equivalent with a spherical ROI or HCP-MMP1.0 parcels (`25_L`, `s32_L`, `s24_L`). Average BOLD timeseries $s(t)$ is extracted:
  $$s(t) = \frac{1}{|V_{\text{sgACC}}|} \sum_{v \in V_{\text{sgACC}}} BOLD(v, t)$$
- **Group-Seedmap Optimized Signal:** Cash et al. 2021 (§2.4.2) also described an optimized seed-signal construction where voxels are weighted by an a priori group anticorrelation map, improving signal-to-noise ratio in short acquisitions.

### 2.2 Search Domain
- Left DLPFC search mask restricted to BA46 / BA9 or HCP-MMP1.0 parcels (`8Av_L`, `p9-46v_L`, `a9-46v_L`, `46_L`, `9-46d_L`).

### 2.3 Connectivity Calculation
- For every voxel $i$ in the search domain, Pearson correlation with sgACC is computed:
  $$r(i) = \frac{\sum_{t} (BOLD(i, t) - \bar{BOLD}(i))(s(t) - \bar{s})}{\sqrt{\sum_t (BOLD(i, t) - \bar{BOLD}(i))^2} \sqrt{\sum_t (s(t) - \bar{s})^2}}$$
- Fisher's $z$-transformation is applied:
  $$z(i) = \frac{1}{2} \ln\left(\frac{1 + r(i)}{1 - r(i)}\right)$$

### 2.4 Thresholding & Contiguous Clustering
- Voxels are selected where anticorrelation is strongest (most negative $z$-scores):
  - **Conventional Individual Seed:** Top 10% strongest anticorrelation ($T_{\text{threshold}} = 0.10$, Cash 2021 §2.4.4).
  - **Group-Seedmap Approach:** Top 0.5% threshold ($T_{\text{threshold}} = 0.005$, Cash 2021 §2.4.2).
- Connected component analysis is performed using a 3D **26-neighborhood** adjacency graph (or surface mesh topological adjacency).
- The largest connected component $C^* = \arg\max_C |C|$ is selected as the primary target cluster.
- **Minimum Cluster Size:** Clusters with fewer than $K_{\min} = 2$ voxels are rejected. If no cluster meets $K_{\min}$, the algorithm fails closed (`status = 'no_qualifying_cluster'`, target coordinates set to `null`).

### 2.5 Target Selection
- **Absolute-Connectivity-Weighted Centroid:**
  $$\mathbf{r}_{\text{weighted}} = \frac{\sum_{i \in C^*} |z(i)| \cdot \mathbf{r}_i}{\sum_{i \in C^*} |z(i)|}$$
- **Unweighted Center of Gravity (Centroid):**
  $$\mathbf{r}_{\text{cog}} = \frac{1}{|C^*|} \sum_{i \in C^*} \mathbf{r}_i$$
- **Medoid Option:** The voxel $i^* \in C^*$ minimizing the Euclidean distance to the centroid is selected to guarantee cortical surface conformality.

---

## 3. Reliability & Quality Gates

1. **Minimum Acquisition Length:** Continuous patient rs-fMRI acquisition $\ge 10\text{ minutes}$ (or minimum 300 volumes at $\text{TR}=2.0\text{s}$) with mean framewise displacement (FD) $< 0.35\text{ mm}$.
2. **Split-Half Reliability:** Split-half timeseries cross-correlation and spatial cluster Dice overlap $\ge 0.60$, with centroid displacement $\le 4.0\text{ mm}$.
3. **Clinical Promotion:**
   - Synthetic / simulated inputs: strictly restricted to `synthetic` / `prototype`, blocked from clinical nomination.
   - Clinical execution: requires valid patient rs-fMRI with validated NIfTI binary integrity and SHA-256 sealed input manifests.
