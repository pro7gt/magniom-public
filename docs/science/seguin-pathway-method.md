# Normative Polysynaptic Pathway Modeling (Seguin et al. 2026 Method)

## Method Code: `NORMATIVE_PATHWAY_MODEL`
**Version:** `0.1.0`  
**Classification:** Research Only Specification  
**Canonical Manifest:** `scientific-config/methods/NORMATIVE_PATHWAY_MODEL/0.1.0.json`  

---

## 1. Background

Direct structural connections between Left DLPFC and subgenual ACC (sgACC) are sparse in the human brain. Therapeutic neuromodulation effects are primarily mediated through polysynaptic routing across intermediate hub structures, such as the anterior cingulate cortex (ACC) and the thalamus.

Seguin et al. (*Nature Neuroscience*, 2026) modeled polysynaptic communication across a high-resolution normative structural connectome (HCP 1,065 consensus structural connectome in Brainnetome / HCP-MMP1.0 parcellation), discovering that:
1. 3-hop cortical pathways (DLPFC $\to$ Superior Frontal Gyrus $\to$ Rostral ACC $\to$ sgACC) and
2. 4-hop fronto-thalamic pathways (DLPFC $\to$ Thalamus $\to$ Medial SFG $\to$ Rostral ACC $\to$ sgACC)
account for the vast majority of communication capacity between DLPFC stimulation sites and the subgenual target.

---

## 2. Mathematical Formulation & Routing

### 2.1 Edge Cost Mapping
For a normative structural connectivity matrix $W$ with weights $w_{uv} \in (0, 1]$:
$$L_{uv} = -\log(w_{uv})$$
where $L_{uv}$ represents the logarithmic path transmission cost between node $u$ and node $v$.

### 2.2 Shortest Path Calculation
Dijkstra's algorithm with binary heap priority queue finds the shortest path:
$$p^*(u, v) = \arg\min_{p \in \mathcal{P}_{uv}} \sum_{e \in p} L_e$$
The number of white matter hops is given by:
$$H(u, v) = |p^*(u, v)| - 1$$

### 2.3 Distance-Weighted Target Proximity
For a given TMS coil location $k$, cortical parcels within distance radius $R \le 15\text{ mm}$ of the coil coordinate are weighted by exponential attenuation:
$$w_i = \exp(\kappa \cdot d_i / 10.0), \quad \kappa = -1.0$$
The weighted average hops $h(k)$ to the downstream sgACC target sphere $T$ is computed as:
$$h(k) = \frac{1}{\sum_i w_i |T|} \sum_{i \in S(k)} \sum_{j \in T} w_i \cdot H(i, j)$$

---

## 3. Governance Boundaries & Prohibited Behaviors

1. **Normative Data Origin**: Derived strictly from normative HCP consensus connectomes (`dataOrigin = 'normative'`).
2. **Prohibited Clinical Use**: Per SRS-PROH-002 and Gate G14, normative pathway communication models **SHALL NOT** be used to select clinical targets or rank clinical candidates.
3. **Allowed Roles**: Permitted solely as `research_hypothesis` in `research` mode.
