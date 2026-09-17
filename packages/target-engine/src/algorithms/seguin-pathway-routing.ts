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
  if (source === target) {
    return { source, target, path: [source], hops: 0, totalCost: 0 };
  }
  if (dist[target] === Infinity) {
    return { source, target, path: [], hops: 0, totalCost: Infinity };
  }
  let curr: number | null | undefined = target;
  while (curr !== null && curr !== undefined && path.length <= n + 1) {
    path.unshift(curr);
    if (curr === source) {
      break;
    }
    curr = prev[curr];
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
  if (!graph.nodeCoordinatesMni || graph.nodeCoordinatesMni.length !== graph.nodeCount) {
    throw new Error(
      'StructuralGraph requires nodeCoordinatesMni matching nodeCount to map coordinates to parcels',
    );
  }

  // 1. Identify parcels within 15mm of TMS site S(k)
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

  // Fail-closed: do not silently map to distant parcels
  if (stimParcels.length === 0) {
    throw new Error(
      `PathwayRouting: No cortical parcels found within 15mm of stimulation coordinate (${stimulationMni.x}, ${stimulationMni.y}, ${stimulationMni.z})`,
    );
  }

  // 2. Identify target parcel(s) within 15mm of SGC
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

  // Fail-closed: do not silently map to distant parcels
  if (targetParcels.length === 0) {
    throw new Error(
      `PathwayRouting: No target parcels found within 15mm of target coordinate (${targetMni.x}, ${targetMni.y}, ${targetMni.z})`,
    );
  }

  // 3. Compute distance-weighted hops on reachable pairs only
  let totalWeightedHops = 0;
  let totalReachableWeight = 0;
  let dominantPath: readonly number[] = [];
  let minCost = Infinity;

  for (const s of stimParcels) {
    for (const t of targetParcels) {
      const sp = findShortestPath(costMatrix, s.parcelIndex, t);
      if (sp.path.length > 0 && sp.totalCost < Infinity) {
        totalWeightedHops += s.weight * sp.hops;
        totalReachableWeight += s.weight;
        if (sp.totalCost < minCost) {
          minCost = sp.totalCost;
          dominantPath = sp.path;
        }
      }
    }
  }

  const averageHops =
    totalReachableWeight > 0
      ? Number((totalWeightedHops / totalReachableWeight).toFixed(2))
      : Infinity;

  const predictedEfficiencyRank = Number.isFinite(averageHops)
    ? Math.max(0.0, Number((10.0 - averageHops).toFixed(2)))
    : 0.0;

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
    predictedEfficiencyRank,
    dataOrigin: 'normative',
    methodCode: 'NORMATIVE_PATHWAY_MODEL',
  };
}
