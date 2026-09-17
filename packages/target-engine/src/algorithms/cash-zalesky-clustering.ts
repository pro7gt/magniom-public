/**
 * @magniom/target-engine - Cash-Zalesky Functional Connectivity Cluster Targeting
 *
 * Implements the Cash-Zalesky seedmap and cluster targeting methodology:
 * Cash RFH, Cocchi L, Lv J, Fitzgerald PB, Zalesky A.
 * "Personalized connectivity-guided DLPFC-TMS for depression: Advancing computational
 * feasibility, precision and reproducibility." Human Brain Mapping. 2021;42(13):4155-4172.
 * DOI: 10.1002/hbm.25330
 */

export interface VoxelNode {
  readonly id: number | string;
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly connectivity: number; // Signed FC value (negative = anticorrelated)
  readonly neighbors?: readonly (number | string)[];
}

export interface CashZaleskyClusterOptions {
  readonly thresholdPercentile?: number; // e.g. 0.10 (top 10% for seed), 0.005 (0.5% for seedmap), 0.05 (5% for Li 2026)
  readonly minClusterSize?: number; // minimum node count
  readonly seedType?: 'conventional_seed' | 'group_seedmap' | 'brainnetome_a32sg';
}

export interface ClusterComponent {
  readonly clusterId: number;
  readonly nodes: readonly VoxelNode[];
  readonly size: number;
  readonly meanConnectivity: number;
  readonly peakNode: VoxelNode;
  readonly centroid: { readonly x: number; readonly y: number; readonly z: number };
  readonly unweightedCentroid?: { readonly x: number; readonly y: number; readonly z: number };
}

export interface CashZaleskyTargetResult {
  readonly optimalTarget: { readonly x: number; readonly y: number; readonly z: number } | null;
  readonly rawPeak: { readonly x: number; readonly y: number; readonly z: number } | null;
  readonly largestCluster: ClusterComponent | null;
  readonly allClusters: readonly ClusterComponent[];
  readonly thresholdValue: number;
  readonly totalSearchNodes: number;
  readonly retainedNodesCount: number;
  readonly methodCode: 'FC_CLUSTER_PERSONALISED';
  readonly status: 'success' | 'no_qualifying_cluster';
}

export interface TestRetestReliabilityMetrics {
  readonly intraindividualDistanceMm: number;
  readonly peakDistanceMm: number;
  readonly clusterSpatialOverlapDice: number;
  readonly patternCorrelationR: number;
  readonly intrascanFcQualified: boolean;
}

/**
 * Executes the Cash-Zalesky personalized DLPFC cluster-based targeting algorithm.
 */
export function computeCashZaleskyTarget(
  nodes: readonly VoxelNode[],
  options: CashZaleskyClusterOptions = {},
): CashZaleskyTargetResult {
  if (nodes.length === 0) {
    throw new Error('CashZaleskyTargeting: nodes array cannot be empty');
  }

  if (
    options.thresholdPercentile !== undefined &&
    (options.thresholdPercentile <= 0 ||
      options.thresholdPercentile > 1 ||
      !Number.isFinite(options.thresholdPercentile))
  ) {
    throw new Error(
      `CashZaleskyTargeting: thresholdPercentile must be in (0, 1], received ${options.thresholdPercentile}`,
    );
  }

  if (
    options.minClusterSize !== undefined &&
    (options.minClusterSize < 1 || !Number.isInteger(options.minClusterSize))
  ) {
    throw new Error(
      `CashZaleskyTargeting: minClusterSize must be an integer >= 1, received ${options.minClusterSize}`,
    );
  }

  const seenIds = new Set<number | string>();
  for (const n of nodes) {
    if (seenIds.has(n.id)) {
      throw new Error(`CashZaleskyTargeting: duplicate node id detected: ${n.id}`);
    }
    seenIds.add(n.id);
    if (
      !Number.isFinite(n.x) ||
      !Number.isFinite(n.y) ||
      !Number.isFinite(n.z) ||
      !Number.isFinite(n.connectivity)
    ) {
      throw new Error(
        `CashZaleskyTargeting: node ${n.id} contains non-finite coordinates or connectivity`,
      );
    }
  }

  // 1. Determine optimal threshold
  // Cash 2021 §2.4.4: 10% for conventional seed, 0.5% for group seedmap, 5% for Brainnetome A32sg
  const seedType = options.seedType ?? 'conventional_seed';
  let thresholdFraction = options.thresholdPercentile;
  if (thresholdFraction === undefined) {
    if (seedType === 'group_seedmap') {
      thresholdFraction = 0.005; // 0.5%
    } else if (seedType === 'brainnetome_a32sg') {
      thresholdFraction = 0.05; // 5%
    } else {
      thresholdFraction = 0.1; // 10%
    }
  }

  // 2. Sort nodes by negative FC (most negative / anticorrelated first)
  // Negative connectivity means connectivity < 0. We want strongest anticorrelation, i.e. lowest algebraic values.
  const sorted = [...nodes].sort((a, b) => a.connectivity - b.connectivity);
  const retainCount = Math.max(1, Math.round(sorted.length * thresholdFraction));
  const thresholdValue = sorted[retainCount - 1]!.connectivity;

  const suprathreshold = sorted.slice(0, retainCount);
  const suprathresholdIds = new Set(suprathreshold.map(n => n.id));
  const nodeMap = new Map<number | string, VoxelNode>(suprathreshold.map(n => [n.id, n]));

  // Build or utilize adjacency graph for connected component extraction
  // Standard 26-neighborhood in 3D grid, or explicit neighbor list
  const clusters: ClusterComponent[] = [];
  const visited = new Set<number | string>();
  let clusterIndex = 1;

  for (const startNode of suprathreshold) {
    if (visited.has(startNode.id)) continue;

    // Breadth-First Search to delineate contiguous cluster
    const clusterNodes: VoxelNode[] = [];
    const queue: VoxelNode[] = [startNode];
    visited.add(startNode.id);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      clusterNodes.push(curr);

      // Identify eligible neighbors
      const neighborCandidates: VoxelNode[] = [];
      if (curr.neighbors && curr.neighbors.length > 0) {
        for (const nId of curr.neighbors) {
          if (suprathresholdIds.has(nId) && !visited.has(nId)) {
            const nNode = nodeMap.get(nId);
            if (nNode) neighborCandidates.push(nNode);
          }
        }
      } else {
        // Fallback: 26-neighborhood Euclidean distance <= sqrt(3) * voxel_spacing (assume ~2-3mm grid)
        for (const other of suprathreshold) {
          if (!visited.has(other.id)) {
            const dx = Math.abs(curr.x - other.x);
            const dy = Math.abs(curr.y - other.y);
            const dz = Math.abs(curr.z - other.z);
            // In a 2mm voxel space, 26-neighborhood max distance is sqrt(4+4+4) = 3.46 mm
            // For general coordinates, within 3.5mm represents adjacent voxels
            if (dx <= 3.1 && dy <= 3.1 && dz <= 3.1) {
              neighborCandidates.push(other);
            }
          }
        }
      }

      for (const neighbor of neighborCandidates) {
        if (!visited.has(neighbor.id)) {
          visited.add(neighbor.id);
          queue.push(neighbor);
        }
      }
    }

    // Filter by min cluster size (conforms to manifest default minClusterSize: 2)
    const minSize = options.minClusterSize ?? 2;
    if (clusterNodes.length >= minSize) {
      // Find peak node (most anticorrelated in cluster)
      let peakNode = clusterNodes[0]!;
      let sumConn = 0;
      let sumWeight = 0;
      let weightedX = 0;
      let weightedY = 0;
      let weightedZ = 0;
      let sumX = 0;
      let sumY = 0;
      let sumZ = 0;

      for (const cn of clusterNodes) {
        sumConn += cn.connectivity;
        if (cn.connectivity < peakNode.connectivity) {
          peakNode = cn;
        }

        // Coordinate weight proportional to anticorrelation magnitude: w = |connectivity|
        const w = Math.max(1e-6, Math.abs(cn.connectivity));
        sumWeight += w;
        weightedX += cn.x * w;
        weightedY += cn.y * w;
        weightedZ += cn.z * w;
        sumX += cn.x;
        sumY += cn.y;
        sumZ += cn.z;
      }

      const cog = {
        x: Number((weightedX / sumWeight).toFixed(2)),
        y: Number((weightedY / sumWeight).toFixed(2)),
        z: Number((weightedZ / sumWeight).toFixed(2)),
      };

      const unweightedCog = {
        x: Number((sumX / clusterNodes.length).toFixed(2)),
        y: Number((sumY / clusterNodes.length).toFixed(2)),
        z: Number((sumZ / clusterNodes.length).toFixed(2)),
      };

      clusters.push({
        clusterId: clusterIndex++,
        nodes: clusterNodes,
        size: clusterNodes.length,
        meanConnectivity: Number((sumConn / clusterNodes.length).toFixed(4)),
        peakNode,
        centroid: cog,
        unweightedCentroid: unweightedCog,
      });
    }
  }

  // Fail-closed (§40, Revision 02 Finding 9): If no clusters met minClusterSize, fail closed!
  // Do NOT merge disconnected suprathreshold nodes into a fabricated single component.
  if (clusters.length === 0) {
    return {
      optimalTarget: null,
      rawPeak: null,
      largestCluster: null,
      allClusters: [],
      thresholdValue,
      totalSearchNodes: nodes.length,
      retainedNodesCount: retainCount,
      methodCode: 'FC_CLUSTER_PERSONALISED',
      status: 'no_qualifying_cluster',
    };
  }

  // 4. Select largest coherent cluster (Cash 2021 requirement)
  const largestCluster = [...clusters].sort((a, b) => b.size - a.size)[0]!;

  return {
    optimalTarget: largestCluster.centroid,
    rawPeak: {
      x: largestCluster.peakNode.x,
      y: largestCluster.peakNode.y,
      z: largestCluster.peakNode.z,
    },
    largestCluster,
    allClusters: clusters,
    thresholdValue,
    totalSearchNodes: nodes.length,
    retainedNodesCount: retainCount,
    methodCode: 'FC_CLUSTER_PERSONALISED',
    status: 'success',
  };
}

/**
 * Calculates test-retest reliability metrics between two independent scan sessions.
 * Conforms to Cash 2021 Table 1 assessment criteria.
 */
export function evaluateCashZaleskyReliability(
  session1: CashZaleskyTargetResult,
  session2: CashZaleskyTargetResult,
  fullPattern1?: readonly number[],
  fullPattern2?: readonly number[],
): TestRetestReliabilityMetrics {
  if (
    !session1.optimalTarget ||
    !session2.optimalTarget ||
    !session1.rawPeak ||
    !session2.rawPeak ||
    !session1.largestCluster ||
    !session2.largestCluster
  ) {
    return {
      intraindividualDistanceMm: 999.0,
      peakDistanceMm: 999.0,
      clusterSpatialOverlapDice: 0.0,
      patternCorrelationR: 0.0,
      intrascanFcQualified: false,
    };
  }

  // 1. Intraindividual Euclidean distance (between cluster centroids)
  const dx = session1.optimalTarget.x - session2.optimalTarget.x;
  const dy = session1.optimalTarget.y - session2.optimalTarget.y;
  const dz = session1.optimalTarget.z - session2.optimalTarget.z;
  const intraindividualDistanceMm = Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(2));

  // 2. Peak displacement
  const px = session1.rawPeak.x - session2.rawPeak.x;
  const py = session1.rawPeak.y - session2.rawPeak.y;
  const pz = session1.rawPeak.z - session2.rawPeak.z;
  const peakDistanceMm = Number(Math.sqrt(px * px + py * py + pz * pz).toFixed(2));

  // 3. Cluster spatial overlap (Dice coefficient)
  const set1 = new Set(session1.largestCluster.nodes.map(n => n.id));
  const set2 = new Set(session2.largestCluster.nodes.map(n => n.id));
  let intersection = 0;
  for (const id of set1) {
    if (set2.has(id)) intersection++;
  }
  const clusterSpatialOverlapDice = Number(
    ((2 * intersection) / (set1.size + set2.size)).toFixed(3),
  );

  // 4. Voxel-wise pattern correlation (Pearson R) across DLPFC
  let patternCorrelationR = 0;
  if (
    fullPattern1 &&
    fullPattern2 &&
    fullPattern1.length === fullPattern2.length &&
    fullPattern1.length > 0
  ) {
    const n = fullPattern1.length;
    const m1 = fullPattern1.reduce((a, b) => a + b, 0) / n;
    const m2 = fullPattern2.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let d1 = 0;
    let d2 = 0;
    for (let i = 0; i < n; i++) {
      const v1 = fullPattern1[i]! - m1;
      const v2 = fullPattern2[i]! - m2;
      num += v1 * v2;
      d1 += v1 * v1;
      d2 += v2 * v2;
    }
    patternCorrelationR =
      d1 > 0 && d2 > 0 ? Number((num / (Math.sqrt(d1) * Math.sqrt(d2))).toFixed(3)) : 0;
  }

  // 5. Functional fidelity: Target should remain anticorrelated in both scans
  const intrascanFcQualified =
    session1.largestCluster.meanConnectivity < 0 && session2.largestCluster.meanConnectivity < 0;

  return {
    intraindividualDistanceMm,
    peakDistanceMm,
    clusterSpatialOverlapDice,
    patternCorrelationR,
    intrascanFcQualified,
  };
}
