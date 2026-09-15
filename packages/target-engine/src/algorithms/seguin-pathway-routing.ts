/**
 * @magniom/target-engine - Seguin-Zalesky Polysynaptic Pathway Communication Modeling
 *
 * Implements connectome communication modeling for TMS therapy in depression:
 * Seguin C, Mansour L S, Betzel RF, Chumin EJ, Puxeddu MG, Lv J, Parkes L, Fitzgerald PB, Cash RFH, Zalesky A.
 * "White matter pathways mediating dorsolateral prefrontal TMS therapy for depression."
 * Nature Neuroscience. 2026;29:1048-1053. DOI: 10.1038/s41593-026-02248-6
 */

export interface StructuralGraph {
  readonly nodeCount: number;
  readonly nodeLabels?: readonly string[];
  readonly nodeCoordinatesMni?: readonly {
    readonly x: number;
    readonly y: number;
    readonly z: number;
  }[];
  // Adjacency matrix: weight W_ij >= 0
  readonly weights: readonly (readonly number[])[];
}

export interface ShortestPathResult {
  readonly source: number;
  readonly target: number;
  readonly path: readonly number[];
  readonly hops: number; // H(a, b) = |Pi(a, b)|
  readonly totalCost: number; // sum of -log(W)
}

export interface PathwayCommunicationScore {
  readonly stimulationCoordinate: { readonly x: number; readonly y: number; readonly z: number };
  readonly targetCoordinate: { readonly x: number; readonly y: number; readonly z: number };
  readonly averageHops: number; // h(k)
  readonly dominantPathway: readonly number[];
  readonly dominantRouteType:
    'cortical_3_hop' | 'fronto_thalamic_4_hop_ipsi' | 'fronto_thalamic_4_hop_early_cross' | 'other';
  readonly predictedEfficiencyRank: number; // lower hops = higher efficiency
  readonly dataOrigin: 'normative';
  readonly methodCode: 'NORMATIVE_PATHWAY_MODEL';
}

/**
 * Computes edge cost matrix L = -log(W) from structural connectivity matrix W.
 * Seguin & Zalesky 2026 (Nature Neuroscience).
 */
export function computeEdgeCostMatrix(weights: readonly (readonly number[])[]): number[][] {
  const n = weights.length;
  const costMatrix: number[][] = Array.from({ length: n }, () => Array(n).fill(Infinity));

  for (let i = 0; i < n; i++) {
    costMatrix[i]![i] = 0;
    const row = weights[i]!;
    for (let j = 0; j < n; j++) {
      if (i !== j) {
        const w = row[j]!;
        if (w > 0) {
          // L_ij = -log(w)
          costMatrix[i]![j] = -Math.log(w);
        }
      }
    }
  }

  return costMatrix;
}

/**
 * Dijkstra's algorithm to find the weighted shortest path between source and target
 * using the edge cost matrix L = -log(W).
 */
export function findShortestPath(
  costMatrix: readonly (readonly number[])[],
  source: number,
  target: number,
): ShortestPathResult {
  const n = costMatrix.length;
  const dist: number[] = Array(n).fill(Infinity);
  const prev: (number | null)[] = Array(n).fill(null);
  const visited: boolean[] = Array(n).fill(false);

  dist[source] = 0;

  for (let step = 0; step < n; step++) {
    let u = -1;
    let minDist = Infinity;
    for (let i = 0; i < n; i++) {
      if (!visited[i] && dist[i]! < minDist) {
        minDist = dist[i]!;
        u = i;
      }
    }

    if (u === -1 || u === target) break;
    visited[u] = true;

    const row = costMatrix[u]!;
    for (let v = 0; v < n; v++) {
      const edgeCost = row[v]!;
      if (!visited[v] && edgeCost < Infinity) {
        const alt = dist[u]! + edgeCost;
        if (alt < dist[v]!) {
          dist[v] = alt;
          prev[v] = u;
        }
      }
    }
  }

  // Reconstruct path
  const path: number[] = [];
  let curr: number | null = target;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr]!;
    if (curr === source) {
      path.unshift(source);
      break;
    }
  }

  const hops = path.length > 1 ? path.length - 1 : 0;
  return {
    source,
    target,
    path,
    hops,
    totalCost: dist[target]!,
  };
}

/**
 * Calculates distance-weighted average number of white matter hops from a TMS site
 * to the downstream subgenual target sphere T.
 *
 * h(k) = (1 / (W(k) * |T|)) * sum_{i in S(k)} sum_{j in T} w(i) * H(p(i), p(j))
 * where w(i) = exp(kappa * d(i)), kappa = -1
 */
export function computePathwayCommunicationScore(
  graph: StructuralGraph,
  costMatrix: readonly (readonly number[])[],
  stimulationMni: { readonly x: number; readonly y: number; readonly z: number },
  targetMni: { readonly x: number; readonly y: number; readonly z: number } = {
    x: 6,
    y: 16,
    z: -10,
  },
  kappa: number = -1.0,
): PathwayCommunicationScore {
  if (!graph.nodeCoordinatesMni || graph.nodeCoordinatesMni.length === 0) {
    throw new Error(
      'StructuralGraph requires nodeCoordinatesMni to map TMS coordinates to parcels',
    );
  }

  // 1. Identify parcels within 10mm of TMS site S(k)
  const stimParcels: { parcelIndex: number; distance: number; weight: number }[] = [];
  for (let i = 0; i < graph.nodeCount; i++) {
    const c = graph.nodeCoordinatesMni[i]!;
    const dx = c.x - stimulationMni.x;
    const dy = c.y - stimulationMni.y;
    const dz = c.z - stimulationMni.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist <= 15.0) {
      const weight = Math.exp(kappa * (dist / 10.0));
      stimParcels.push({ parcelIndex: i, distance: dist, weight });
    }
  }

  // If no parcels within 15mm, use nearest parcel
  if (stimParcels.length === 0) {
    let nearestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < graph.nodeCount; i++) {
      const c = graph.nodeCoordinatesMni[i]!;
      const dist = Math.sqrt(
        (c.x - stimulationMni.x) ** 2 +
          (c.y - stimulationMni.y) ** 2 +
          (c.z - stimulationMni.z) ** 2,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestIdx = i;
      }
    }
    stimParcels.push({ parcelIndex: nearestIdx, distance: minDist, weight: 1.0 });
  }

  // 2. Identify target parcel(s) within 10mm of SGC (MNI 6, 16, -10)
  const targetParcels: number[] = [];
  for (let j = 0; j < graph.nodeCount; j++) {
    const c = graph.nodeCoordinatesMni[j]!;
    const dist = Math.sqrt(
      (c.x - targetMni.x) ** 2 + (c.y - targetMni.y) ** 2 + (c.z - targetMni.z) ** 2,
    );
    if (dist <= 15.0) {
      targetParcels.push(j);
    }
  }

  if (targetParcels.length === 0) {
    let nearestTarget = 0;
    let minDist = Infinity;
    for (let j = 0; j < graph.nodeCount; j++) {
      const c = graph.nodeCoordinatesMni[j]!;
      const dist = Math.sqrt(
        (c.x - targetMni.x) ** 2 + (c.y - targetMni.y) ** 2 + (c.z - targetMni.z) ** 2,
      );
      if (dist < minDist) {
        minDist = dist;
        nearestTarget = j;
      }
    }
    targetParcels.push(nearestTarget);
  }

  // 3. Compute distance-weighted hops
  let totalWeightedHops = 0;
  let totalWeight = 0;
  let dominantPath: readonly number[] = [];
  let minCost = Infinity;

  for (const s of stimParcels) {
    for (const t of targetParcels) {
      const sp = findShortestPath(costMatrix, s.parcelIndex, t);
      totalWeightedHops += s.weight * sp.hops;
      totalWeight += s.weight;
      if (sp.totalCost < minCost && sp.path.length > 0) {
        minCost = sp.totalCost;
        dominantPath = sp.path;
      }
    }
  }

  const averageHops = totalWeight > 0 ? Number((totalWeightedHops / totalWeight).toFixed(2)) : 3.0;

  // Classify dominant pathway according to Seguin 2026 Fig 2h
  let dominantRouteType:
    | 'cortical_3_hop'
    | 'fronto_thalamic_4_hop_ipsi'
    | 'fronto_thalamic_4_hop_early_cross'
    | 'other' = 'other';
  if (dominantPath.length === 4) {
    dominantRouteType = 'cortical_3_hop'; // 3 hops = 4 nodes: DLPFC -> SFG -> ACC -> SGC
  } else if (dominantPath.length === 5) {
    dominantRouteType = 'fronto_thalamic_4_hop_ipsi'; // 4 hops = 5 nodes: DLPFC -> Thal -> mSFG -> rSFG -> SGC
  }

  return {
    stimulationCoordinate: stimulationMni,
    targetCoordinate: targetMni,
    averageHops,
    dominantPathway: dominantPath,
    dominantRouteType,
    predictedEfficiencyRank: Number((10.0 - averageHops).toFixed(2)),
    dataOrigin: 'normative',
    methodCode: 'NORMATIVE_PATHWAY_MODEL',
  };
}
