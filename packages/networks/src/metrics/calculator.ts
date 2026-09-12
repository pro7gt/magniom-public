/**
 * @magniom/networks - Pure Deterministic Network Metrics Calculator
 * Conforms to MAGNIOM-Triple-Network Systems Layer v1.0 (§13-16, 26, 50)
 */

import type {
  NetworkMeasurement,
  NetworkInteractionMeasurement,
  NetworkSystemCode,
  NetworkRelationshipCode,
} from '@magniom/domain';
import { CANONICAL_CEN_PARCEL_IDS, CANONICAL_CEN_SYSTEM_ID } from '../definitions/cen.js';
import { CANONICAL_DMN_PARCEL_IDS, CANONICAL_DMN_SYSTEM_ID } from '../definitions/dmn.js';
import { CANONICAL_SN_PARCEL_IDS, CANONICAL_SN_SYSTEM_ID } from '../definitions/sn.js';
import {
  CANONICAL_RELATIONSHIP_CEN_DMN_ID,
  CANONICAL_RELATIONSHIP_SN_CEN_ID,
  CANONICAL_RELATIONSHIP_SN_DMN_ID,
  NORMATIVE_REFERENCE_DISTRIBUTIONS,
} from '../relationships/pairwise.js';

export interface ParcelFcInput {
  readonly parcelNames: readonly string[];
  readonly matrix: readonly (readonly number[])[];
}

export function fisherZ(r: number): number {
  const clamped = Math.max(-0.999999, Math.min(0.999999, r));
  return 0.5 * Math.log((1 + clamped) / (1 - clamped));
}

export function invFisherZ(z: number): number {
  return Math.tanh(z);
}

export function round6(val: number): number {
  return Number(val.toFixed(6));
}

export function calculateWithinNetworkMetrics(
  fc: ParcelFcInput,
  networkCode: NetworkSystemCode,
): NetworkMeasurement {
  let parcelIds: readonly string[];
  let systemId: string;
  let normMean: number;
  let normStd: number;

  switch (networkCode) {
    case 'CEN':
      parcelIds = CANONICAL_CEN_PARCEL_IDS;
      systemId = CANONICAL_CEN_SYSTEM_ID;
      normMean = NORMATIVE_REFERENCE_DISTRIBUTIONS.WITHIN_CEN.mean_z;
      normStd = NORMATIVE_REFERENCE_DISTRIBUTIONS.WITHIN_CEN.std_z;
      break;
    case 'DMN':
      parcelIds = CANONICAL_DMN_PARCEL_IDS;
      systemId = CANONICAL_DMN_SYSTEM_ID;
      normMean = NORMATIVE_REFERENCE_DISTRIBUTIONS.WITHIN_DMN.mean_z;
      normStd = NORMATIVE_REFERENCE_DISTRIBUTIONS.WITHIN_DMN.std_z;
      break;
    case 'SN':
      parcelIds = CANONICAL_SN_PARCEL_IDS;
      systemId = CANONICAL_SN_SYSTEM_ID;
      normMean = NORMATIVE_REFERENCE_DISTRIBUTIONS.WITHIN_SN.mean_z;
      normStd = NORMATIVE_REFERENCE_DISTRIBUTIONS.WITHIN_SN.std_z;
      break;
  }

  // Find matching indices in the FC matrix
  const indices: number[] = [];
  for (let i = 0; i < fc.parcelNames.length; i++) {
    const pName = fc.parcelNames[i];
    if (pName && parcelIds.includes(pName)) {
      indices.push(i);
    }
  }

  if (indices.length < 2) {
    return {
      network_system_id: systemId,
      network_code: networkCode,
      metric_code: 'within_network_mean_fisher_z',
      raw_value: 0.0,
      reliability_score: 0.0,
      interpretation_status: 'not_interpretable',
    };
  }

  let sumZ = 0;
  let pairCount = 0;

  for (let i = 0; i < indices.length; i++) {
    const idxI = indices[i]!;
    for (let j = i + 1; j < indices.length; j++) {
      const idxJ = indices[j]!;
      const r = fc.matrix[idxI]?.[idxJ] ?? 0;
      sumZ += fisherZ(r);
      pairCount++;
    }
  }

  const meanZ = pairCount > 0 ? sumZ / pairCount : 0;
  const rawValue = round6(meanZ);
  const zScore = round6((meanZ - normMean) / normStd);

  let interpretation: NetworkMeasurement['interpretation_status'] = 'supportive';
  if (zScore < -2.0) {
    interpretation = 'contradictory'; // substantial hypoconnectivity
  } else if (zScore < -1.0) {
    interpretation = 'neutral';
  }

  return {
    network_system_id: systemId,
    network_code: networkCode,
    metric_code: 'within_network_mean_fisher_z',
    raw_value: rawValue,
    normalized_value: zScore,
    reliability_score: 0.85,
    interpretation_status: interpretation,
  };
}

export function calculatePairwiseNetworkMetrics(
  fc: ParcelFcInput,
  relationshipCode: NetworkRelationshipCode,
  runId: string,
  reliabilityProfileId: string,
): NetworkInteractionMeasurement {
  let parcelIdsA: readonly string[];
  let parcelIdsB: readonly string[];
  let relationshipId: string;
  let normMean: number;
  let normStd: number;

  switch (relationshipCode) {
    case 'CEN_DMN':
      parcelIdsA = CANONICAL_CEN_PARCEL_IDS;
      parcelIdsB = CANONICAL_DMN_PARCEL_IDS;
      relationshipId = CANONICAL_RELATIONSHIP_CEN_DMN_ID;
      normMean = NORMATIVE_REFERENCE_DISTRIBUTIONS.CEN_DMN.mean_z;
      normStd = NORMATIVE_REFERENCE_DISTRIBUTIONS.CEN_DMN.std_z;
      break;
    case 'SN_CEN':
      parcelIdsA = CANONICAL_SN_PARCEL_IDS;
      parcelIdsB = CANONICAL_CEN_PARCEL_IDS;
      relationshipId = CANONICAL_RELATIONSHIP_SN_CEN_ID;
      normMean = NORMATIVE_REFERENCE_DISTRIBUTIONS.SN_CEN.mean_z;
      normStd = NORMATIVE_REFERENCE_DISTRIBUTIONS.SN_CEN.std_z;
      break;
    case 'SN_DMN':
      parcelIdsA = CANONICAL_SN_PARCEL_IDS;
      parcelIdsB = CANONICAL_DMN_PARCEL_IDS;
      relationshipId = CANONICAL_RELATIONSHIP_SN_DMN_ID;
      normMean = NORMATIVE_REFERENCE_DISTRIBUTIONS.SN_DMN.mean_z;
      normStd = NORMATIVE_REFERENCE_DISTRIBUTIONS.SN_DMN.std_z;
      break;
  }

  const indicesA: number[] = [];
  const indicesB: number[] = [];

  for (let i = 0; i < fc.parcelNames.length; i++) {
    const pName = fc.parcelNames[i];
    if (pName) {
      if (parcelIdsA.includes(pName)) indicesA.push(i);
      if (parcelIdsB.includes(pName)) indicesB.push(i);
    }
  }

  if (indicesA.length === 0 || indicesB.length === 0) {
    return {
      relationship_id: relationshipId,
      relationship_code: relationshipCode,
      metric_code: 'between_network_mean_fisher_z',
      raw_value: 0.0,
      measurement_run_id: runId,
      reliability_profile_id: reliabilityProfileId,
      interpretation_status: 'not_interpretable',
    };
  }

  let sumZ = 0;
  let count = 0;

  for (const idxA of indicesA) {
    for (const idxB of indicesB) {
      const r = fc.matrix[idxA]?.[idxB] ?? 0;
      sumZ += fisherZ(r);
      count++;
    }
  }

  const meanBetweenZ = count > 0 ? sumZ / count : 0;
  const rawValue = round6(meanBetweenZ);
  const deviation = round6((meanBetweenZ - normMean) / normStd);

  let status: NetworkInteractionMeasurement['interpretation_status'] = 'neutral';
  if (relationshipCode === 'CEN_DMN') {
    // Healthy CEN-DMN is strongly anti-correlated (negative Z).
    // If meanBetweenZ is positive or less negative, segregation is reduced.
    if (meanBetweenZ > -0.05) {
      status = 'contradictory'; // Loss of normal segregation
    } else if (meanBetweenZ < -0.15) {
      status = 'supportive'; // Intact segregation
    }
  } else {
    status = Math.abs(deviation) < 1.96 ? 'supportive' : 'neutral';
  }

  return {
    relationship_id: relationshipId,
    relationship_code: relationshipCode,
    metric_code: 'between_network_mean_fisher_z',
    raw_value: rawValue,
    normalized_value: round6(invFisherZ(meanBetweenZ)),
    normative_deviation: deviation,
    unit: 'Fisher z',
    measurement_run_id: runId,
    reliability_profile_id: reliabilityProfileId,
    interpretation_status: status,
  };
}

export function calculateNetworkSegregation(meanWithinZ: number, meanBetweenZ: number): number {
  if (meanWithinZ === 0) return 0.0;
  const seg = (meanWithinZ - meanBetweenZ) / meanWithinZ;
  return round6(Math.max(-1.0, Math.min(1.0, seg)));
}

export function calculateNormativeDeviation(
  observed: number,
  expectedMean: number,
  varianceOrStd: number,
): number {
  const std = varianceOrStd <= 0.05 ? Math.sqrt(varianceOrStd) : varianceOrStd;
  return round6((observed - expectedMean) / std);
}
