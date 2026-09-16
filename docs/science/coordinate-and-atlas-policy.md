# Coordinate Systems and Atlas Mapping Policy

**Document ID:** `MAG-POL-COORD-001`  
**Version:** `2.0.0`  
**Scope:** Monorepo Neuroimaging Coordinate Spaces, Mesh Representations, and Parcellation Standards  

---

## 1. Approved Canonical Coordinate Spaces

All neuroimaging measurements and candidate target coordinates within the MAGNIOM ecosystem must declare an explicit coordinate space reference (`CoordinateSpaceRef`):

| Space Identifier | Space Type | Standard / Version | Description |
| :--- | :--- | :--- | :--- |
| `MNI152NLin2009cAsym` | Volumetric | ICBM 152 Nonlinear 2009c Asymmetric | Canonical stereotaxic space for all population-level targets and normative graphs. |
| `fsLR_32k` | Surface Mesh | Human Connectome Project standard 32k mesh | Standard surface representation for cortical functional connectivity and tractography endpoints. |
| `native_t1w` | Volumetric | Subject Native T1w Space | Subject native space prior to spatial normalization. |
| `fsaverage` | Surface Mesh | FreeSurfer Standard | Permitted for legacy cortical parcellations; transformation to `fsLR_32k` required for multi-modal alignment. |

> [!CAUTION]
> Unspecified or ambiguous coordinate spaces (e.g., generic "MNI" without template version or Talairach coordinates) are rejected at input validation.

---

## 2. Parcellation Standards

1. **Cortical Functional & Structural Parcellation**:
   - Primary: **HCP-MMP1.0** (Glasser et al., 2016) on `fsLR_32k` (180 parcels per hemisphere).
   - Secondary / Structural: **Brainnetome Atlas** (Fan et al., 2016) (246 parcels: 210 cortical, 36 subcortical).
2. **Subcortical Parcellation**:
   - Harvard-Oxford Subcortical Structural Atlas or FreeSurfer `aseg`.
3. **Subgenual Seed Mapping**:
   - HCP-MMP1.0: `25_L`, `s32_L`, `s24_L`.
   - Brainnetome: `A32sg_L` and `A32sg_R`.
   - Stereotaxic Sphere: MNI $(6, 16, -10)$, radius $10\text{ mm}$.

---

## 3. Transformation Graph Integrity

- All cross-space coordinate conversions must traverse a verified, DAG-acyclic `TransformGraph`.
- Linear and nonlinear deformation fields (e.g., `from-native_to-MNI152NLin2009cAsym_mode-image_xfm.h5`) must carry a cryptographic SHA-256 digest.
- Inversion accuracy: Round-trip transformation error $\le 0.5\text{ mm}$.
