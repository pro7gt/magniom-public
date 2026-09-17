/**
 * @magniom/target-engine - Unit Tests for Zalesky / Cash Connectomic Targeting Algorithms
 * Conforms to:
 * - Cash, Cocchi, Lv, Fitzgerald, Zalesky (Hum Brain Mapp 2021)
 * - Seguin, ..., Cash, Zalesky (Nat Neurosci 2026)
 * - Li, ..., Zalesky, Cash (Am J Psychiatry 2026)
 */

import { describe, it, expect } from 'vitest';
import {
  computeCashZaleskyTarget,
  evaluateCashZaleskyReliability,
  type VoxelNode,
  computeEdgeCostMatrix,
  findShortestPath,
  computePathwayCommunicationScore,
  validateStructuralConnectivityMatrix,
  type StructuralGraph,
} from '../../src/index.js';

describe('Cash-Zalesky FC Clustering Algorithm (Hum Brain Mapp 2021)', () => {
  it('identifies 26-neighborhood clusters and calculates weighted centroid', () => {
    // Create voxels around DLPFC BA46 (e.g. -40, 44, 30)
    const nodes: VoxelNode[] = [
      { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.65 },
      { id: 'v2', x: -42, y: 44, z: 30, connectivity: -0.55 },
      { id: 'v3', x: -40, y: 46, z: 30, connectivity: -0.45 },
      // Noise / non-anticorrelated voxel
      { id: 'v4', x: -20, y: 10, z: 50, connectivity: 0.2 },
      { id: 'v5', x: -25, y: 15, z: 45, connectivity: 0.35 },
    ];

    const result = computeCashZaleskyTarget(nodes, {
      thresholdPercentile: 0.6, // retain top 3 most anticorrelated (v1, v2, v3)
      minClusterSize: 2,
    });

    expect(result.methodCode).toBe('FC_CLUSTER_PERSONALISED');
    expect(result.largestCluster.size).toBe(3);

    // Peak anticorrelation is at v1 (-40, 44, 30)
    expect(result.rawPeak.x).toBe(-40);
    expect(result.rawPeak.y).toBe(44);
    expect(result.rawPeak.z).toBe(30);

    // Centroid should be weighted by |connectivity|
    // v1: weight = 0.65, v2: weight = 0.55, v3: weight = 0.45
    // Total weight = 1.65
    // X = (-40*0.65 + -42*0.55 + -40*0.45) / 1.65 = -67.1 / 1.65 = -40.67
    expect(result.optimalTarget.x).toBeCloseTo(-40.67, 1);
    expect(result.optimalTarget.y).toBeCloseTo(44.55, 1);
    expect(result.optimalTarget.z).toBe(30);
  });

  it('evaluates test-retest reliability metrics between two scan sessions (Cash 2021 Table 1)', () => {
    const session1Nodes: VoxelNode[] = [
      { id: 's1_1', x: -40, y: 44, z: 30, connectivity: -0.6 },
      { id: 's1_2', x: -42, y: 44, z: 30, connectivity: -0.5 },
    ];
    const session2Nodes: VoxelNode[] = [
      { id: 's2_1', x: -41, y: 45, z: 30, connectivity: -0.58 },
      { id: 's2_2', x: -43, y: 45, z: 30, connectivity: -0.48 },
    ];

    const s1 = computeCashZaleskyTarget(session1Nodes, { thresholdPercentile: 1.0 });
    const s2 = computeCashZaleskyTarget(session2Nodes, { thresholdPercentile: 1.0 });

    const metrics = evaluateCashZaleskyReliability(s1, s2);

    // Centroid 1: (-40.91, 44, 30), Centroid 2: (-41.91, 45, 30)
    // Distance ~ sqrt(1^2 + 1^2) = 1.41 mm
    expect(metrics.intraindividualDistanceMm).toBeCloseTo(1.41, 1);
    expect(metrics.intrascanFcQualified).toBe(true);
  });

  it('fails closed when no qualifying cluster meets minimum cluster size (§40, Revision 02)', () => {
    // 3 isolated voxels far apart (>10mm), minClusterSize = 2 -> each cluster size is 1 < 2
    const isolatedNodes: VoxelNode[] = [
      { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.65 },
      { id: 'v2', x: -20, y: 10, z: 50, connectivity: -0.55 },
      { id: 'v3', x: 10, y: -20, z: 20, connectivity: -0.45 },
    ];

    const result = computeCashZaleskyTarget(isolatedNodes, {
      thresholdPercentile: 1.0,
      minClusterSize: 2,
    });

    expect(result.status).toBe('no_qualifying_cluster');
    expect(result.optimalTarget).toBeNull();
    expect(result.rawPeak).toBeNull();
    expect(result.largestCluster).toBeNull();
    expect(result.allClusters).toHaveLength(0);
  });

  it('calculates unweighted cluster center of gravity alongside weighted centroid', () => {
    const nodes: VoxelNode[] = [
      { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.65 },
      { id: 'v2', x: -42, y: 44, z: 30, connectivity: -0.55 },
      { id: 'v3', x: -40, y: 46, z: 30, connectivity: -0.45 },
    ];

    const result = computeCashZaleskyTarget(nodes, {
      thresholdPercentile: 1.0,
      minClusterSize: 2,
    });

    expect(result.status).toBe('success');
    expect(result.largestCluster).not.toBeNull();
    // Unweighted centroid: mean of x (-40, -42, -40) = -40.67; y (44, 44, 46) = 44.67; z (30, 30, 30) = 30
    expect(result.largestCluster!.unweightedCentroid).toBeDefined();
    expect(result.largestCluster!.unweightedCentroid!.x).toBeCloseTo(-40.67, 2);
    expect(result.largestCluster!.unweightedCentroid!.y).toBeCloseTo(44.67, 2);
    expect(result.largestCluster!.unweightedCentroid!.z).toBe(30);
  });

  it('throws when nodes array is empty', () => {
    expect(() => {
      computeCashZaleskyTarget([]);
    }).toThrow('nodes array cannot be empty');
  });
});

describe('Seguin & Zalesky Polysynaptic Pathway Routing (Nat Neurosci 2026)', () => {
  it('computes edge cost matrix with L = -log(W) and finds shortest path with hops', () => {
    // 3-node graph:
    // 0: Seed (sgACC)
    // 1: Intermediate relay (e.g. thalamus / medPFC)
    // 2: DLPFC target
    const weights = [
      [1.0, 0.8, 0.01],
      [0.8, 1.0, 0.7],
      [0.01, 0.7, 1.0],
    ];

    const costMatrix = computeEdgeCostMatrix(weights);

    // Direct cost 0 -> 2 is -log(0.01) = 4.605
    expect(costMatrix[0]![2]).toBeCloseTo(4.605, 2);
    // Cost 0 -> 1 is -log(0.8) = 0.223
    expect(costMatrix[0]![1]).toBeCloseTo(0.223, 2);
    // Cost 1 -> 2 is -log(0.7) = 0.357
    expect(costMatrix[1]![2]).toBeCloseTo(0.357, 2);

    // Dijkstra should choose the 2-hop route 0 -> 1 -> 2 (total cost 0.58)
    const result = findShortestPath(costMatrix, 0, 2);
    expect(result.hops).toBe(2);
    expect(result.totalCost).toBeCloseTo(0.58, 2);
    expect(result.path).toEqual([0, 1, 2]);
  });

  it('computes pathway communication score for TMS stimulation site', () => {
    const graph: StructuralGraph = {
      nodeCount: 3,
      nodeCoordinatesMni: [
        { x: -40, y: 44, z: 30 }, // Node 0: DLPFC stimulation site
        { x: -20, y: 30, z: 10 }, // Node 1: Intermediate relay
        { x: 6, y: 16, z: -10 }, // Node 2: sgACC target
      ],
      weights: [
        [1.0, 0.7, 0.05],
        [0.7, 1.0, 0.8],
        [0.05, 0.8, 1.0],
      ],
    };

    const costMatrix = computeEdgeCostMatrix(graph.weights);
    const score = computePathwayCommunicationScore(
      graph,
      costMatrix,
      { x: -40, y: 44, z: 30 }, // TMS at node 0
      { x: 6, y: 16, z: -10 }, // Target at node 2
    );

    expect(score.methodCode).toBe('NORMATIVE_PATHWAY_MODEL');
    expect(score.dataOrigin).toBe('normative');
    expect(score.averageHops).toBe(2);
    expect(score.dominantPathway).toEqual([0, 1, 2]);
  });

  describe('Numerical Boundary & Invariant Properties', () => {
    it('evaluates numerical boundaries around thresholdPercentile (T - ε, T, T + ε)', () => {
      const nodes: VoxelNode[] = [
        { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.9 },
        { id: 'v2', x: -41, y: 44, z: 30, connectivity: -0.7 },
        { id: 'v3', x: -42, y: 44, z: 30, connectivity: -0.5 },
        { id: 'v4', x: -43, y: 44, z: 30, connectivity: -0.3 },
        { id: 'v5', x: -44, y: 44, z: 30, connectivity: -0.1 },
      ];

      const T = 0.4;
      const epsilon = 0.01;

      const below = computeCashZaleskyTarget(nodes, {
        thresholdPercentile: T - epsilon,
        minClusterSize: 1,
      });
      const exact = computeCashZaleskyTarget(nodes, { thresholdPercentile: T, minClusterSize: 1 });
      const above = computeCashZaleskyTarget(nodes, {
        thresholdPercentile: T + epsilon,
        minClusterSize: 1,
      });

      // Retained node count must be monotonically non-decreasing with higher percentile threshold
      expect(below.retainedNodesCount).toBeLessThanOrEqual(exact.retainedNodesCount);
      expect(exact.retainedNodesCount).toBeLessThanOrEqual(above.retainedNodesCount);
    });

    it('handles boundary thresholdPercentile at 1.0 (retaining all nodes)', () => {
      const nodes: VoxelNode[] = [
        { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.8 },
        { id: 'v2', x: -41, y: 44, z: 30, connectivity: -0.6 },
      ];
      const res = computeCashZaleskyTarget(nodes, { thresholdPercentile: 1.0, minClusterSize: 1 });
      expect(res.retainedNodesCount).toBe(2);
    });

    it('asserts edge cost matrix invariance: symmetric weights yield symmetric costs and zero self-cost', () => {
      const symmetricWeights = [
        [1.0, 0.45, 0.12],
        [0.45, 1.0, 0.67],
        [0.12, 0.67, 1.0],
      ];

      const costs = computeEdgeCostMatrix(symmetricWeights);

      for (let i = 0; i < 3; i++) {
        expect(costs[i]![i]).toBe(0); // Self-cost is identically zero
        for (let j = 0; j < 3; j++) {
          expect(costs[i]![j]).toBeCloseTo(costs[j]![i]!, 6); // Symmetry
        }
      }
    });

    it('handles zero or negative weights cleanly with Infinity cost', () => {
      const weightsWithZeros = [
        [1.0, 0.0, -0.5],
        [0.0, 1.0, 0.8],
        [-0.5, 0.8, 1.0],
      ];

      const costs = computeEdgeCostMatrix(weightsWithZeros);
      expect(costs[0]![1]).toBe(Infinity);
      expect(costs[0]![2]).toBe(Infinity);
      expect(costs[1]![0]).toBe(Infinity);
      expect(costs[2]![0]).toBe(Infinity);
      expect(costs[1]![2]).toBeCloseTo(-Math.log(0.8), 4);
    });

    it('returns zero hops and zero cost when source equals target', () => {
      const weights = [
        [1.0, 0.5],
        [0.5, 1.0],
      ];
      const costs = computeEdgeCostMatrix(weights);
      const res = findShortestPath(costs, 1, 1);
      expect(res.hops).toBe(0);
      expect(res.totalCost).toBe(0);
      expect(res.path).toEqual([1]);
    });

    it('validates Cash-Zalesky parameter boundaries and non-finite inputs', () => {
      const validNodes: VoxelNode[] = [
        { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.6 },
        { id: 'v2', x: -41, y: 44, z: 30, connectivity: -0.5 },
      ];

      expect(() => computeCashZaleskyTarget(validNodes, { thresholdPercentile: 0 })).toThrow(
        'thresholdPercentile must be in (0, 1]',
      );
      expect(() => computeCashZaleskyTarget(validNodes, { thresholdPercentile: 1.1 })).toThrow(
        'thresholdPercentile must be in (0, 1]',
      );
      expect(() => computeCashZaleskyTarget(validNodes, { minClusterSize: 0 })).toThrow(
        'minClusterSize must be an integer >= 1',
      );
      expect(() =>
        computeCashZaleskyTarget([{ id: 'v1', x: NaN, y: 44, z: 30, connectivity: -0.6 }]),
      ).toThrow('contains non-finite coordinates or connectivity');
      expect(() =>
        computeCashZaleskyTarget([
          { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.6 },
          { id: 'v1', x: -41, y: 44, z: 30, connectivity: -0.5 },
        ]),
      ).toThrow('duplicate node id detected');
    });

    it('fails closed when stimulation or target coordinate is >15mm from parcels', () => {
      const graph: StructuralGraph = {
        nodeCount: 2,
        nodeCoordinatesMni: [
          { x: -40, y: 44, z: 30 },
          { x: 6, y: 16, z: -10 },
        ],
        weights: [
          [1.0, 0.5],
          [0.5, 1.0],
        ],
      };
      const costs = computeEdgeCostMatrix(graph.weights);

      // Distant stim coordinate (50mm away)
      expect(() =>
        computePathwayCommunicationScore(
          graph,
          costs,
          { x: 50, y: 44, z: 30 },
          { x: 6, y: 16, z: -10 },
        ),
      ).toThrow('No cortical parcels found within 15mm of stimulation coordinate');

      // Distant target coordinate (60mm away)
      expect(() =>
        computePathwayCommunicationScore(
          graph,
          costs,
          { x: -40, y: 44, z: 30 },
          { x: 100, y: 16, z: -10 },
        ),
      ).toThrow('No target parcels found within 15mm of target coordinate');
    });

    it('correctly handles disconnected graphs without treating unreachable nodes as 0 hops (MAGNIOM Rev 04 Finding 6: JSON-safe null averageHops)', () => {
      const graph: StructuralGraph = {
        nodeCount: 2,
        nodeCoordinatesMni: [
          { x: -40, y: 44, z: 30 },
          { x: 6, y: 16, z: -10 },
        ],
        weights: [
          [1.0, 0.0],
          [0.0, 1.0],
        ], // 0 weight -> completely disconnected
      };
      const costs = computeEdgeCostMatrix(graph.weights);

      const score = computePathwayCommunicationScore(
        graph,
        costs,
        { x: -40, y: 44, z: 30 },
        { x: 6, y: 16, z: -10 },
      );

      // JSON-safe null (never Infinity) and status 'not_estimable'
      expect(score.status).toBe('not_estimable');
      expect(score.averageHops).toBeNull();
      expect(score.predictedEfficiencyRank).toBeNull();
      expect(score.dominantPathway).toEqual([]);
      expect(score.dominantRouteType).toBe('unclassified');
    });

    it('rejects weights > 1.0 that would yield invalid negative Dijkstra costs (MAGNIOM Rev 04 Finding 6)', () => {
      const invalidWeights = [
        [1.0, 1.5],
        [1.5, 1.0],
      ];
      expect(() => computeEdgeCostMatrix(invalidWeights)).toThrow(
        'Edge weight at [0, 1] is 1.5 > 1.0, which produces invalid negative Dijkstra cost',
      );
      expect(() => validateStructuralConnectivityMatrix(invalidWeights)).toThrow(
        'Matrix weight at [0, 1] is 1.5, but must be normalized in [0, 1.0]',
      );
    });

    it('rejects asymmetric structural connectivity matrices (MAGNIOM Rev 04 Finding 6)', () => {
      const asymmetricWeights = [
        [1.0, 0.7],
        [0.4, 1.0],
      ];
      expect(() => validateStructuralConnectivityMatrix(asymmetricWeights)).toThrow(
        'Structural connectivity matrix must be symmetric',
      );
    });

    it('rejects non-square structural connectivity matrices (MAGNIOM Rev 04 Finding 6)', () => {
      const nonSquareWeights = [
        [1.0, 0.7, 0.3],
        [0.7, 1.0],
      ];
      expect(() => validateStructuralConnectivityMatrix(nonSquareWeights)).toThrow(
        'Structural connectivity matrix must be square',
      );
    });

    it('enforces hopLimit in Dijkstra shortest path search (MAGNIOM Rev 04 Finding 6)', () => {
      // 4-node chain: 0 -> 1 -> 2 -> 3 (3 hops)
      const chainWeights = [
        [1.0, 0.8, 0.0, 0.0],
        [0.8, 1.0, 0.8, 0.0],
        [0.0, 0.8, 1.0, 0.8],
        [0.0, 0.0, 0.8, 1.0],
      ];
      const costs = computeEdgeCostMatrix(chainWeights);

      // Normal search with hopLimit = 6 finds path of 3 hops
      const normalRes = findShortestPath(costs, 0, 3, 6);
      expect(normalRes.hops).toBe(3);
      expect(normalRes.path).toEqual([0, 1, 2, 3]);

      // Constrained search with hopLimit = 2 fails closed (path exceeding hop limit is unreachable)
      const constrainedRes = findShortestPath(costs, 0, 3, 2);
      expect(constrainedRes.hops).toBe(0);
      expect(constrainedRes.path).toEqual([]);
      expect(constrainedRes.totalCost).toBe(Infinity);
    });

    it('differentiates cortical 3-hop from subcortical relay via anatomical parcel labels (MAGNIOM Rev 04 Finding 6)', () => {
      // 4 nodes: DLPFC -> Thalamus -> ACC -> SGC
      const subcorticalGraph: StructuralGraph = {
        nodeCount: 4,
        nodeLabels: ['L_DLPFC_BA46', 'L_Thalamus', 'L_ACC_BA24', 'R_SGC_BA25'],
        nodeCoordinatesMni: [
          { x: -40, y: 44, z: 30 }, // Node 0: DLPFC
          { x: -10, y: -15, z: 8 }, // Node 1: Thalamus
          { x: 0, y: 28, z: 20 }, // Node 2: ACC
          { x: 6, y: 16, z: -10 }, // Node 3: SGC
        ],
        weights: [
          [1.0, 0.8, 0.0, 0.0],
          [0.8, 1.0, 0.8, 0.0],
          [0.0, 0.8, 1.0, 0.8],
          [0.0, 0.0, 0.8, 1.0],
        ],
      };

      const costs = computeEdgeCostMatrix(subcorticalGraph.weights);
      const score = computePathwayCommunicationScore(
        subcorticalGraph,
        costs,
        { x: -40, y: 44, z: 30 },
        { x: 6, y: 16, z: -10 },
      );

      // Intermediate contains Thalamus -> subcortical relay, NOT cortical 3-hop
      expect(score.dominantPathway).toEqual([0, 1, 2, 3]);
      expect(score.dominantRouteType).toBe('subcortical_relay');
    });

    it('Cash-Zalesky minClusterSize default is 2 matching method manifest (MAGNIOM Rev 04 Finding 6)', () => {
      // 2 isolated single voxels (>10mm apart) without minClusterSize specified in options
      const singleNodes: VoxelNode[] = [
        { id: 'v1', x: -40, y: 44, z: 30, connectivity: -0.65 },
        { id: 'v2', x: 20, y: 10, z: 0, connectivity: -0.55 },
      ];

      // Calling without options.minClusterSize should default to 2
      const result = computeCashZaleskyTarget(singleNodes, { thresholdPercentile: 1.0 });
      expect(result.status).toBe('no_qualifying_cluster');
      expect(result.optimalTarget).toBeNull();
    });
  });
});
