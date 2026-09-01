/**
 * @magniom/phenotype
 * Phenotype formulation, symptom-to-circuit mapping, and PhenotypeSnapshot validation.
 * Conforms to MAGNIOM-Clinical Phenotype & Symptom-to-Circuit Ontology v1.0.
 */

import type { PhenotypeSnapshot } from '@magniom/domain';

export interface PhenotypeScoreWeights {
  readonly dysphoriaWeight: number;
  readonly anhedoniaWeight: number;
  readonly anxiousSomaticWeight: number;
  readonly ruminationWeight: number;
}

export function calculateDominantSymptomDomain(snapshot: PhenotypeSnapshot): string {
  const scores = [
    { domain: 'DYSPHORIA', score: snapshot.symptomScores.dysphoriaScore },
    { domain: 'ANHEDONIA', score: snapshot.symptomScores.anhedoniaScore },
    { domain: 'ANXIOUS_SOMATIC', score: snapshot.symptomScores.anxiousSomaticScore },
    { domain: 'RUMINATION', score: snapshot.symptomScores.ruminationScore },
  ];

  scores.sort((a, b) => b.score - a.score);
  return scores[0]?.domain ?? 'DYSPHORIA';
}
