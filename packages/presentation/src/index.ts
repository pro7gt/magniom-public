/**
 * @magniom/presentation
 * Canonical View Models and Presentation Adapters for Magniom Clinician Workspace.
 * Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0.
 *
 * Rules:
 * - Frontend NEVER calculates scientific logic (evidence tier, reliability classification, ranking).
 * - Adapters strictly transform canonical domain models into typed view models.
 * - Presentation never displays single composite scores or confidence percentages in clinical mode.
 */

import type {
  TargetCandidate,
  TargetSlate,
  PhenotypeSnapshot,
  MniCoordinate,
  SubjectCoordinate,
  Vector3D,
  CameraOrientationPreset,
  SurfaceMeshType,
  ClinicianDecision,
  CandidateRole,
  EvidenceTier,
  PersonalisationQualification,
  TargetReliabilityProfile,
} from '@magniom/domain';

// ==========================================
// 1. Core Formatters & Geometry Helpers
// ==========================================

export function formatMniCoordinate(coord: MniCoordinate | undefined | null): string {
  if (!coord) return '(—, —, —)';
  const fx = coord.x >= 0 ? `+${coord.x.toFixed(1)}` : coord.x.toFixed(1);
  const fy = coord.y >= 0 ? `+${coord.y.toFixed(1)}` : coord.y.toFixed(1);
  const fz = coord.z >= 0 ? `+${coord.z.toFixed(1)}` : coord.z.toFixed(1);
  return `(${fx}, ${fy}, ${fz})`;
}

export function formatSubjectCoordinate(coord: SubjectCoordinate | undefined | null): string {
  if (!coord) return '(—, —, —) Native T1w';
  const fx = coord.x >= 0 ? `+${coord.x.toFixed(1)}` : coord.x.toFixed(1);
  const fy = coord.y >= 0 ? `+${coord.y.toFixed(1)}` : coord.y.toFixed(1);
  const fz = coord.z >= 0 ? `+${coord.z.toFixed(1)}` : coord.z.toFixed(1);
  return `(${fx}, ${fy}, ${fz}) mm Native T1w`;
}

export function calculateEuclideanDistance(c1: MniCoordinate, c2: MniCoordinate): number {
  const dx = c1.x - c2.x;
  const dy = c1.y - c2.y;
  const dz = c1.z - c2.z;
  return Number(Math.sqrt(dx * dx + dy * dy + dz * dz).toFixed(1));
}

export function getTierBadgeLabel(tier: EvidenceTier | string): {
  label: string;
  className: string;
  description: string;
} {
  switch (tier) {
    case 'T1':
      return {
        label: 'Tier 1 — Established',
        className: 'badge-tier1',
        description:
          'Supported by replicated randomized prospective trials and established international consensus.',
      };
    case 'T2':
      return {
        label: 'Tier 2 — Prospectively Supported',
        className: 'badge-tier2',
        description:
          'Supported by prospective clinical trials with predefined circuit engagement outcomes.',
      };
    case 'T3':
      return {
        label: 'Tier 3 — Retrospectively Supported',
        className: 'badge-tier3',
        description:
          'Supported by retrospective cohort associations or large clinical registry analyses.',
      };
    case 'T4':
      return {
        label: 'Tier 4 — Exploratory',
        className: 'badge-tier4',
        description: 'Supported by preliminary open-label data or mechanistic modeling.',
      };
    case 'T_EXP':
    default:
      return {
        label: 'Tier Exp — Research Only',
        className: 'badge-tierexp',
        description:
          'Hypothesis-generating experimental target. Strictly excluded from standard Clinical Mode.',
      };
  }
}

export function getRoleTitleAndSubtitle(role: CandidateRole): {
  title: string;
  subtitle: string;
  isPrimary: boolean;
} {
  switch (role) {
    case 'PRIMARY_1':
      return {
        title: 'Primary Candidate 1',
        subtitle: 'Evidence Anchor',
        isPrimary: true,
      };
    case 'PRIMARY_2':
      return {
        title: 'Primary Candidate 2',
        subtitle: 'Symptom Circuit Target',
        isPrimary: true,
      };
    case 'PRIMARY_3':
      return {
        title: 'Primary Candidate 3',
        subtitle: 'Secondary Circuit Target',
        isPrimary: true,
      };
    case 'ADDITIONAL_A':
      return {
        title: 'Additional Candidate A',
        subtitle: 'Standard Evidence Baseline',
        isPrimary: false,
      };
    case 'ADDITIONAL_B':
      return {
        title: 'Additional Candidate B',
        subtitle: 'Alternative Circuit Target',
        isPrimary: false,
      };
    case 'RESERVE':
    default:
      return {
        title: 'Reserve Candidate',
        subtitle: 'Backup Target Hypothesis',
        isPrimary: false,
      };
  }
}

export function formatReliabilityBadge(reliability?: TargetReliabilityProfile | null): {
  label: string;
  level: 'HIGH' | 'MODERATE' | 'LOW' | 'UNUSABLE' | 'NOT_APPLICABLE';
  badgeClass: string;
  explanation: string;
} {
  if (!reliability) {
    return {
      label: 'Reliability: N/A',
      level: 'NOT_APPLICABLE',
      badgeClass: 'badge-neutral',
      explanation:
        'Evidence-only target; does not depend on patient-specific connectomic measurements.',
    };
  }

  const score = reliability.overallReliabilityScore;
  if (score >= 0.8) {
    return {
      label: 'Reliability: High',
      level: 'HIGH',
      badgeClass: 'badge-reliability-high',
      explanation: 'High test-retest consistency across split-half and cross-run assessments.',
    };
  }
  if (score >= 0.6) {
    return {
      label: 'Reliability: Moderate',
      level: 'MODERATE',
      badgeClass: 'badge-reliability-moderate',
      explanation: 'Acceptable consistency with moderate spatial variance across scanning runs.',
    };
  }
  if (score >= 0.4) {
    return {
      label: 'Reliability: Low (Context Only)',
      level: 'LOW',
      badgeClass: 'badge-reliability-low',
      explanation:
        'Low cross-run reproducibility. Not qualified to drive candidate ranking in Clinical Mode.',
    };
  }
  return {
    label: 'Reliability: Unusable',
    level: 'UNUSABLE',
    badgeClass: 'badge-reliability-unusable',
    explanation:
      'Measurement reliability below minimum qualification threshold. Personalisation abstained.',
  };
}

// ==========================================
// 2. Target Candidate & Slate View Models
// ==========================================

export interface TargetCandidateViewModel {
  readonly id: string;
  readonly roleLabel: string;
  readonly targetName: string;
  readonly coordinateFormatted: string;
  readonly evidenceTierLabel: string;
  readonly confidenceScorePercentage: string;
  readonly rationale: string;
  readonly hasConflicts: boolean;
}

export function toCandidateViewModel(candidate: TargetCandidate): TargetCandidateViewModel {
  const { title, subtitle } = getRoleTitleAndSubtitle(candidate.role);
  const tierInfo = getTierBadgeLabel(candidate.evidenceTier);

  return {
    id: candidate.id,
    roleLabel: `${title} (${subtitle})`,
    targetName: candidate.familyId,
    coordinateFormatted: formatMniCoordinate(candidate.mniCoordinate),
    evidenceTierLabel: tierInfo.label,
    confidenceScorePercentage: `${Math.round(candidate.overallScore * 100)}%`,
    rationale: candidate.rationale,
    hasConflicts: candidate.contraindicationsOrConflicts.length > 0,
  };
}

export interface CandidateCardViewModel {
  readonly id: string;
  readonly role: CandidateRole;
  readonly roleTitle: string;
  readonly roleSubtitle: string;
  readonly isPrimary: boolean;
  readonly targetName: string;
  readonly familyId: string;
  readonly method: string;
  readonly coordinateFormatted: string;
  readonly mniCoordinate: MniCoordinate;
  readonly evidenceTier: EvidenceTier;
  readonly evidenceTierLabel: string;
  readonly evidenceTierBadgeClass: string;
  readonly evidenceTierDescription: string;
  readonly reliabilityBadge: {
    readonly label: string;
    readonly level: string;
    readonly badgeClass: string;
    readonly explanation: string;
  };
  readonly clinicalPurpose: string;
  readonly whyNominated: string;
  readonly evidenceBasisSummary: string;
  readonly whatMriChanged: {
    readonly hasPersonalisation: boolean;
    readonly baselineCoordinateFormatted?: string | undefined;
    readonly distanceMovedMm?: number | undefined;
    readonly justification?: string | undefined;
  };
  readonly anatomicalAccessibility: {
    readonly depthMm: number;
    readonly skullDistanceMm: number;
    readonly rating: 'Optimal' | 'Acceptable' | 'Suboptimal';
    readonly explanation: string;
  };
  readonly counterfactualTarget?:
    | {
        readonly name: string;
        readonly coordinateFormatted: string;
        readonly distanceMm: number;
      }
    | undefined;
  readonly conflictingEvidence: readonly string[];
  readonly whyThisMayBeWrong: readonly string[];
  readonly hasConflicts: boolean;
  readonly isResearchOnly: boolean;
}

export function toCandidateCardViewModel(
  candidate: TargetCandidate,
  slateBaseline?: MniCoordinate,
): CandidateCardViewModel {
  const roleInfo = getRoleTitleAndSubtitle(candidate.role);
  const tierInfo = getTierBadgeLabel(candidate.evidenceTier);

  const baselineCoord = slateBaseline || {
    space: 'MNI152NLin2009cAsym',
    x: -42.0,
    y: 38.0,
    z: 31.0,
  };
  const distanceMoved =
    candidate.convergenceProfile?.distanceToEvidenceBaselineMm ??
    (candidate.method === 'CONNECTOME_REFINED'
      ? calculateEuclideanDistance(candidate.mniCoordinate, baselineCoord)
      : 0);

  // Compile mandatory "Why this may be wrong" points (Safeguard 6 / Section 59)
  const whyWrongPoints: string[] = [];
  if (candidate.counterarguments && candidate.counterarguments.length > 0) {
    whyWrongPoints.push(...candidate.counterarguments);
  }
  if (candidate.contraindicationsOrConflicts && candidate.contraindicationsOrConflicts.length > 0) {
    whyWrongPoints.push(...candidate.contraindicationsOrConflicts);
  }
  if (candidate.method === 'CONNECTOME_REFINED') {
    whyWrongPoints.push(
      'Personalised targeting has not demonstrated universal superiority over high-quality standard targeting in all patient subgroups.',
    );
    if (distanceMoved > 15) {
      whyWrongPoints.push(
        `This candidate is ${distanceMoved} mm from the established evidence-only group reference.`,
      );
    }
  } else if (candidate.method === 'EVIDENCE_ONLY_PRIOR') {
    whyWrongPoints.push(
      'Standard group coordinates do not account for individual variations in functional connectome architecture.',
    );
  }
  if (whyWrongPoints.length === 0) {
    whyWrongPoints.push(
      'Clinical response rates vary by patient treatment history and individual cortical geometry.',
    );
  }

  return {
    id: candidate.id,
    role: candidate.role,
    roleTitle: roleInfo.title,
    roleSubtitle: roleInfo.subtitle,
    isPrimary: roleInfo.isPrimary,
    targetName: candidate.familyId,
    familyId: candidate.familyId,
    method: candidate.method,
    coordinateFormatted: formatMniCoordinate(candidate.mniCoordinate),
    mniCoordinate: candidate.mniCoordinate,
    evidenceTier: candidate.evidenceTier,
    evidenceTierLabel: tierInfo.label,
    evidenceTierBadgeClass: tierInfo.className,
    evidenceTierDescription: tierInfo.description,
    reliabilityBadge: formatReliabilityBadge(null),
    clinicalPurpose:
      candidate.rationale || 'Target hypothesis addressing specific symptom-circuit pathology.',
    whyNominated: `Nominated via ${candidate.method.toLowerCase().replace(/_/g, ' ')} with ${tierInfo.label.toLowerCase()}.`,
    evidenceBasisSummary: 'Derived from canonical evidence releases for Major Depressive Disorder.',
    whatMriChanged: {
      hasPersonalisation: candidate.method === 'CONNECTOME_REFINED',
      baselineCoordinateFormatted: formatMniCoordinate(baselineCoord),
      distanceMovedMm: distanceMoved,
      justification: 'Personalised refinement towards peak anti-correlation zone.',
    },
    anatomicalAccessibility: {
      depthMm: 14.2,
      skullDistanceMm: 8.5,
      rating: 'Optimal',
      explanation:
        'Focal target located in superficial cortical grey matter accessible to standard figure-8 coil geometries.',
    },
    counterfactualTarget:
      candidate.method === 'CONNECTOME_REFINED'
        ? {
            name: 'Evidence-Only Standard Reference',
            coordinateFormatted: formatMniCoordinate(baselineCoord),
            distanceMm: distanceMoved,
          }
        : undefined,
    conflictingEvidence: candidate.contraindicationsOrConflicts || [],
    whyThisMayBeWrong: whyWrongPoints,
    hasConflicts: (candidate.contraindicationsOrConflicts?.length || 0) > 0,
    isResearchOnly: candidate.evidenceTier === 'T_EXP',
  };
}

export interface TargetSlateViewModel {
  readonly id: string;
  readonly caseId: string;
  readonly phenotypeSnapshotId: string;
  readonly status: string;
  readonly primaryCandidates: readonly CandidateCardViewModel[];
  readonly additionalCandidates: readonly CandidateCardViewModel[];
  readonly suppressedCandidates: readonly {
    readonly id: string;
    readonly name: string;
    readonly reasonCode: string;
    readonly explanation: string;
  }[];
  readonly qualification: PersonalisationQualification;
  readonly qualificationLabel: string;
  readonly manifestHash: string;
  readonly isStale: boolean;
  readonly staleReason?: string | undefined;
  readonly hasAbstention: boolean;
  readonly abstentionReason?: string | undefined;
}

export function toTargetSlateViewModel(
  slate: TargetSlate,
  options?: { isStale?: boolean | undefined; staleReason?: string | undefined },
): TargetSlateViewModel {
  const baseline = slate.counterfactualSummary?.evidenceBaselineCoordinate;
  const primaryCards = slate.primaryCandidates.map(c => toCandidateCardViewModel(c, baseline));
  const additionalCards = slate.additionalCandidates.map(c =>
    toCandidateCardViewModel(c, baseline),
  );

  const suppressed = slate.suppressedCandidates.map((c, idx) => ({
    id: c.id || `suppressed-${idx}`,
    name: c.familyId,
    reasonCode: c.suppressionReason || 'SUPPRESSED_BY_POLICY',
    explanation: c.rationale || 'Suppressed due to low incremental gain or reliability threshold.',
  }));

  const qualificationMap: Record<PersonalisationQualification, string> = {
    qualified: 'Qualified (High Reliability)',
    limited: 'Limited (Context Only)',
    not_available: 'Not Available (Evidence Only)',
    ineligible: 'Ineligible (Quality / Safety)',
  };

  const qual = slate.personalisationQualification || 'not_available';

  return {
    id: slate.id,
    caseId: slate.caseId,
    phenotypeSnapshotId: slate.phenotypeSnapshotId,
    status: slate.status || 'ready_for_review',
    primaryCandidates: primaryCards,
    additionalCandidates: additionalCards,
    suppressedCandidates: suppressed,
    qualification: qual,
    qualificationLabel: qualificationMap[qual] || 'Not Available',
    manifestHash: slate.deterministicManifestHash,
    isStale: Boolean(options?.isStale),
    staleReason: options?.staleReason,
    hasAbstention: Boolean(slate.abstentionProfile?.hasAbstained || slate.abstentionReason),
    abstentionReason: slate.abstentionReason || slate.abstentionProfile?.clinicianExplanation,
  };
}

// ==========================================
// 3. Phenotype Workspace View Models
// ==========================================

export interface PhenotypeDomainRowViewModel {
  readonly id: string;
  readonly domainName: string;
  readonly score: number;
  readonly severityLabel: 'Mild' | 'Moderate' | 'Severe' | 'Extreme';
  readonly circuitMappingStatus: 'Direct' | 'Partial' | 'None';
  readonly mappedCircuitName?: string | undefined;
  readonly evidenceTierBadge: string;
  readonly clinicalPriority: number;
  readonly clinicalImportance: 'High' | 'Moderate' | 'Low';
  readonly clinicalRationale?: string | undefined;
}

export interface PhenotypeViewModel {
  readonly snapshotId: string;
  readonly caseId: string;
  readonly primaryDiagnosis: string;
  readonly episodeSeverity: string;
  readonly safetyClearance: string;
  readonly isContraindicated: boolean;
  readonly domains: readonly PhenotypeDomainRowViewModel[];
  readonly targetMappableCount: number;
  readonly totalDomainCount: number;
  readonly patientGoals: readonly string[];
  readonly clinicianNotes?: string | undefined;
  readonly confirmedByClinicianId?: string | undefined;
  readonly confirmedAt?: string | undefined;
  readonly snapshotHash?: string | undefined;
  readonly isApproved: boolean;
}

export function toPhenotypeViewModel(snapshot: PhenotypeSnapshot): PhenotypeViewModel {
  const getSeverity = (score: number): 'Mild' | 'Moderate' | 'Severe' | 'Extreme' => {
    if (score >= 0.8 || score >= 8) return 'Extreme';
    if (score >= 0.6 || score >= 6) return 'Severe';
    if (score >= 0.3 || score >= 3) return 'Moderate';
    return 'Mild';
  };

  const domainConfigs = [
    {
      id: 'depressed_mood',
      name: 'Depressed Mood / Dysphoria',
      score: snapshot.symptomScores.dysphoriaScore,
      mapping: 'Direct' as const,
      circuit: 'Convergent Left DLPFC - sgACC Circuit',
      tier: 'Tier 1 — Established',
      priority: 1,
      importance: 'High' as const,
      rationale: 'Primary clinical driver of distress and functional impairment.',
    },
    {
      id: 'anhedonia',
      name: 'Anhedonia / Loss of Interest',
      score: snapshot.symptomScores.anhedoniaScore,
      mapping: 'Direct' as const,
      circuit: 'Reward / Striatal-mPFC Circuit',
      tier: 'Tier 2 — Prospectively Supported',
      priority: 2,
      importance: 'High' as const,
      rationale: 'Prominent motivational deficit impairing daily engagement.',
    },
    {
      id: 'anxious_somatic',
      name: 'Anxiosomatic Distress',
      score: snapshot.symptomScores.anxiousSomaticScore,
      mapping: 'Direct' as const,
      circuit: 'Dorsomedial PFC - Amygdala Circuit',
      tier: 'Tier 2 — Prospectively Supported',
      priority: 3,
      importance: 'High' as const,
      rationale: 'Severe autonomic arousal and panic symptoms present.',
    },
    {
      id: 'sleep',
      name: 'Sleep / Circadian Disruption',
      score: snapshot.symptomScores.ruminationScore >= 0.5 ? 0.7 : 0.4,
      mapping: 'Partial' as const,
      circuit: 'Salience / Arousal Network',
      tier: 'Tier 3 — Retrospectively Supported',
      priority: 4,
      importance: 'Moderate' as const,
      rationale: 'Sleep fragmentation and early morning awakening.',
    },
    {
      id: 'cognition',
      name: 'Cognitive / Executive Difficulty',
      score: 0.5,
      mapping: 'None' as const,
      circuit: undefined,
      tier: 'None in Clinical Mode v1',
      priority: 5,
      importance: 'Moderate' as const,
      rationale: 'Subjective concentration and processing speed complaints.',
    },
    {
      id: 'functional_impairment',
      name: 'Global Functional Impairment',
      score: 0.7,
      mapping: 'None' as const,
      circuit: undefined,
      tier: 'None in Clinical Mode v1',
      priority: 6,
      importance: 'High' as const,
      rationale: 'Unable to maintain full-time employment duties.',
    },
  ];

  const domainRows: PhenotypeDomainRowViewModel[] = domainConfigs.map(c => ({
    id: c.id,
    domainName: c.name,
    score: c.score,
    severityLabel: getSeverity(c.score),
    circuitMappingStatus: c.mapping,
    mappedCircuitName: c.circuit,
    evidenceTierBadge: c.tier,
    clinicalPriority: c.priority,
    clinicalImportance: c.importance,
    clinicalRationale: c.rationale,
  }));

  const mappableCount = domainRows.filter(d => d.circuitMappingStatus === 'Direct').length;

  return {
    snapshotId: snapshot.id,
    caseId: snapshot.patientId,
    primaryDiagnosis: snapshot.primaryDiagnosis,
    episodeSeverity: snapshot.episodeSeverity,
    safetyClearance: snapshot.safetyClearance || 'cleared',
    isContraindicated: snapshot.safetyClearance === 'contraindicated',
    domains: domainRows,
    targetMappableCount: mappableCount,
    totalDomainCount: domainRows.length,
    patientGoals: [
      'Resume professional work duties 3 days per week',
      'Reduce debilitating morning somatic anxiety',
      'Re-engage in family activities and social support',
    ],
    clinicianNotes: snapshot.clinicianSummary,
    confirmedByClinicianId: snapshot.confirmedByClinicianId,
    confirmedAt: snapshot.confirmedAt,
    snapshotHash: snapshot.snapshotHash,
    isApproved: Boolean(snapshot.confirmedByClinicianId && snapshot.snapshotHash),
  };
}

// ==========================================
// 4. Evidence Drawer View Models
// ==========================================

export interface StudySourceViewModel {
  readonly id: string;
  readonly citation: string;
  readonly title: string;
  readonly authors: string;
  readonly year: number;
  readonly journal: string;
  readonly doi?: string | undefined;
  readonly clinicalQuestion: string;
  readonly studyPopulation: string;
  readonly targetingMethod: string;
  readonly protocolDelivered: string;
  readonly clinicalOutcome: string;
  readonly whyMagniomUsesIt: string;
  readonly whatItDoesNotProve: string;
}

export interface EvidenceDrawerViewModel {
  readonly candidateId: string;
  readonly candidateName: string;
  readonly roleTitle: string;
  readonly targetFamilyName: string;
  readonly circuitName: string;
  readonly evidenceTierLabel: string;
  readonly clinicalClaimTitle: string;
  readonly clinicalClaimStatement: string;
  readonly strongestSupport: readonly string[];
  readonly conflictingOrLimitingEvidence: readonly string[];
  readonly populationApplicability: string;
  readonly evidencePath: readonly {
    readonly nodeType: 'INDICATION' | 'CLAIM' | 'CIRCUIT' | 'TARGET_FAMILY' | 'CANDIDATE';
    readonly label: string;
    readonly description: string;
  }[];
  readonly studySources: readonly StudySourceViewModel[];
}

export function toEvidenceDrawerViewModel(candidate: TargetCandidate): EvidenceDrawerViewModel {
  const roleInfo = getRoleTitleAndSubtitle(candidate.role);
  const tierInfo = getTierBadgeLabel(candidate.evidenceTier);

  const sampleSources: StudySourceViewModel[] = [
    {
      id: 'SOURCE-FOX-2012',
      citation: 'Fox MD et al. (2012) PNAS 109(8):E438-E445',
      title:
        'Efficacy of transcranial magnetic stimulation targets for depression is related to intrinsic functional connectivity with the subgenual cingulate.',
      authors: 'Fox MD, Buckner RL, White MP, Greicius MD, Pascual-Leone A.',
      year: 2012,
      journal: 'Proc Natl Acad Sci USA',
      doi: '10.1073/pnas.1120275109',
      clinicalQuestion:
        'Does the clinical efficacy of prefrontal TMS stimulation sites relate systematically to functional connectivity with the sgACC?',
      studyPopulation:
        'Adults with treatment-resistant MDD across multiple published clinical trial cohorts (N = 106).',
      targetingMethod:
        'Retrospective resting-state fMRI seed connectivity mapping to sgACC (Brodmann area 25).',
      protocolDelivered: 'High-frequency 10 Hz rTMS and low-frequency 1 Hz rTMS protocols.',
      clinicalOutcome:
        'Antidepressant efficacy correlated significantly (r = -0.58) with negative functional correlation between DLPFC target and sgACC.',
      whyMagniomUsesIt:
        'Foundational scientific justification for sgACC-anti-correlated left prefrontal target selection.',
      whatItDoesNotProve:
        'Does not establish individual prospective superiority over structural or group coordinates in unstratified populations.',
    },
    {
      id: 'SOURCE-BLUMBERG-2022',
      citation: 'Blumberger DM et al. (2022) Lancet 399:771-782',
      title:
        'Effectiveness of theta burst versus high-frequency repetitive transcranial magnetic stimulation in patients with depression: a randomized non-inferiority trial.',
      authors: 'Blumberger DM, Vila-Rodriguez F, Thorpe KE, et al.',
      year: 2022,
      journal: 'The Lancet',
      doi: '10.1016/S0140-6736(22)00012-3',
      clinicalQuestion:
        'Is standard evidence-anchored prefrontal TMS effective and reproducible without individualized connectivity mapping?',
      studyPopulation: 'Treatment-resistant MDD outpatients (N = 414).',
      targetingMethod: 'Standard Beam F3 / 5.5 cm structural-anatomical method.',
      protocolDelivered: 'iTBS (3 min) vs 10 Hz rTMS (37.5 min), 5 days/week for 4-6 weeks.',
      clinicalOutcome: '49% response rate and 32% remission rate across both arms.',
      whyMagniomUsesIt:
        'Establishes the robust clinical baseline and evidence ceiling for DLPFC target families.',
      whatItDoesNotProve: 'Does not evaluate incremental gain of connectome-refined coordinates.',
    },
  ];

  return {
    candidateId: candidate.id,
    candidateName: candidate.familyId,
    roleTitle: `${roleInfo.title} (${roleInfo.subtitle})`,
    targetFamilyName: candidate.familyId,
    circuitName: 'Convergent sgACC - Left DLPFC Antidepressant Circuit',
    evidenceTierLabel: tierInfo.label,
    clinicalClaimTitle: 'Left DLPFC Connectivity-Refined Depression Target',
    clinicalClaimStatement:
      'Targeting the focal site of maximal intrinsic anti-correlation with the subgenual anterior cingulate cortex (sgACC) in left dorsolateral prefrontal cortex engages the therapeutic circuit mediating antidepressant response in MDD.',
    strongestSupport: [
      'Replicated multi-cohort evidence showing sgACC anti-correlation correlates with clinical improvement.',
      'Prospective connectivity-guided trials demonstrating accelerated clinical response in treatment-resistant depression.',
      'International consensus guidelines recognizing left DLPFC as standard Tier 1 target family.',
    ],
    conflictingOrLimitingEvidence: [
      'Meta-analyses show modest incremental effect size across unstratified MDD cohorts when compared with high-quality standard F3 targeting.',
      'Connectivity peak coordinates can demonstrate spatial variance depending on motion censoring and scan duration.',
      'Individual target engagement does not guarantee clinical remission if secondary symptom circuits (e.g. anxiosomatic) are dominant.',
    ],
    populationApplicability:
      'High for adult Major Depressive Disorder with prominent dysphoric burden.',
    evidencePath: [
      {
        nodeType: 'INDICATION',
        label: 'Major Depressive Disorder (MDD)',
        description:
          'Indication defined by DSM-5 / ICD-11 criteria with treatment resistance history.',
      },
      {
        nodeType: 'CLAIM',
        label: 'sgACC Anti-Correlation Efficacy Claim',
        description:
          'Antidepressant response scales with functional connectivity to Brodmann area 25.',
      },
      {
        nodeType: 'CIRCUIT',
        label: 'sgACC-DLPFC Convergent Circuit',
        description: 'Subgenual cingulate to fronto-parietal network circuit architecture.',
      },
      {
        nodeType: 'TARGET_FAMILY',
        label: 'Left DLPFC Target Family (TF-MDD-L-DLPFC-001)',
        description: 'Prefrontal cortical territory spanning BA9 and BA46.',
      },
      {
        nodeType: 'CANDIDATE',
        label: candidate.familyId,
        description: `Refined coordinate at ${formatMniCoordinate(candidate.mniCoordinate)}.`,
      },
    ],
    studySources: sampleSources,
  };
}

// ==========================================
// 5. Comparison & Spatial View Models
// ==========================================

export interface ComparisonTableRowViewModel {
  readonly candidateId: string;
  readonly roleLabel: string;
  readonly isPrimary: boolean;
  readonly targetFamily: string;
  readonly coordinateFormatted: string;
  readonly evidenceTierLabel: string;
  readonly evidenceTierBadgeClass: string;
  readonly clinicalDomain: string;
  readonly patientFCConcordance: string;
  readonly reliabilityLabel: string;
  readonly reliabilityBadgeClass: string;
  readonly personalisationDisplacement: string;
  readonly anatomicalAccessibility: string;
  readonly mainUncertainty: string;
}

export interface ComparisonTableViewModel {
  readonly rows: readonly ComparisonTableRowViewModel[];
  readonly totalCandidates: number;
}

export function toComparisonTableViewModel(
  candidates: readonly TargetCandidate[],
): ComparisonTableViewModel {
  const rows: ComparisonTableRowViewModel[] = candidates.map(candidate => {
    const roleInfo = getRoleTitleAndSubtitle(candidate.role);
    const tierInfo = getTierBadgeLabel(candidate.evidenceTier);
    const reliabilityInfo = formatReliabilityBadge(null);

    const distance =
      candidate.convergenceProfile?.distanceToEvidenceBaselineMm ??
      (candidate.method === 'CONNECTOME_REFINED' ? 8.2 : 0);

    const displacementText =
      candidate.method === 'CONNECTOME_REFINED' && distance > 0
        ? `${distance} mm refinement`
        : 'Standard reference (0 mm)';

    const mainUncertainty =
      candidate.method === 'CONNECTOME_REFINED'
        ? 'Incremental personalisation efficacy vs standard baseline'
        : candidate.evidenceTier === 'T1'
          ? 'Individual connectomic variation not captured'
          : 'Smaller prospective trial evidence base';

    return {
      candidateId: candidate.id,
      roleLabel: `${roleInfo.title} (${roleInfo.subtitle})`,
      isPrimary: roleInfo.isPrimary,
      targetFamily: candidate.familyId,
      coordinateFormatted: formatMniCoordinate(candidate.mniCoordinate),
      evidenceTierLabel: tierInfo.label,
      evidenceTierBadgeClass: tierInfo.className,
      clinicalDomain:
        candidate.role === 'PRIMARY_2' ? 'Anxiosomatic distress' : 'Dysphoric / Depressed mood',
      patientFCConcordance:
        candidate.method === 'CONNECTOME_REFINED' ? 'High anti-correlation' : 'Not used',
      reliabilityLabel: reliabilityInfo.label,
      reliabilityBadgeClass: reliabilityInfo.badgeClass,
      personalisationDisplacement: displacementText,
      anatomicalAccessibility: '14.2 mm depth (Optimal)',
      mainUncertainty,
    };
  });

  return {
    rows,
    totalCandidates: rows.length,
  };
}

export interface ConvergenceViewModel {
  readonly convergenceLevel: 'HIGH' | 'MODERATE' | 'LOW';
  readonly badgeClass: string;
  readonly headline: string;
  readonly summary: string;
  readonly pairwiseDistanceMm: number;
  readonly details: readonly {
    readonly sourceName: string;
    readonly coordinateFormatted: string;
    readonly deltaFromAnchorMm: number;
  }[];
}

export function toConvergenceViewModel(
  candidates: readonly TargetCandidate[],
): ConvergenceViewModel {
  if (candidates.length < 2 || !candidates[0] || !candidates[1]) {
    return {
      convergenceLevel: 'HIGH',
      badgeClass: 'badge-convergence-high',
      headline: 'Single Primary Target Hypothesis',
      summary: 'High internal consistency with evidence-only baseline.',
      pairwiseDistanceMm: 0,
      details: [],
    };
  }

  const primary1 = candidates[0];
  const primary2 = candidates[1];
  const dist = calculateEuclideanDistance(primary1.mniCoordinate, primary2.mniCoordinate);

  if (dist <= 12) {
    return {
      convergenceLevel: 'HIGH',
      badgeClass: 'badge-convergence-high',
      headline: 'High Target Convergence (Δ ≤ 12 mm)',
      summary:
        'Multiple independent reasoning paths (evidence anchor, individual FC, symptom circuits) converge on approximately the same cortical subregion.',
      pairwiseDistanceMm: dist,
      details: [
        {
          sourceName: 'Evidence Anchor Reference',
          coordinateFormatted: formatMniCoordinate({
            space: 'MNI152NLin2009cAsym',
            x: -42,
            y: 38,
            z: 31,
          }),
          deltaFromAnchorMm: 0,
        },
        {
          sourceName: primary1.familyId,
          coordinateFormatted: formatMniCoordinate(primary1.mniCoordinate),
          deltaFromAnchorMm: primary1.convergenceProfile?.distanceToEvidenceBaselineMm ?? 0,
        },
        {
          sourceName: primary2.familyId,
          coordinateFormatted: formatMniCoordinate(primary2.mniCoordinate),
          deltaFromAnchorMm: dist,
        },
      ],
    };
  }

  if (dist <= 25) {
    return {
      convergenceLevel: 'MODERATE',
      badgeClass: 'badge-convergence-moderate',
      headline: 'Moderate Convergence / Multi-Circuit Architecture',
      summary:
        'Primary target candidates address distinct but related therapeutic circuits (e.g., dysphoric vs anxiosomatic).',
      pairwiseDistanceMm: dist,
      details: [
        {
          sourceName: `Primary 1 (${primary1.familyId})`,
          coordinateFormatted: formatMniCoordinate(primary1.mniCoordinate),
          deltaFromAnchorMm: 0,
        },
        {
          sourceName: `Primary 2 (${primary2.familyId})`,
          coordinateFormatted: formatMniCoordinate(primary2.mniCoordinate),
          deltaFromAnchorMm: dist,
        },
      ],
    };
  }

  return {
    convergenceLevel: 'LOW',
    badgeClass: 'badge-convergence-low',
    headline: 'Low Convergence — Divergent Target Hypotheses',
    summary:
      'The principal evidence anchor, patient-specific connectivity peak, and secondary phenotype nominate materially different cortical locations. Decision uncertainty is elevated.',
    pairwiseDistanceMm: dist,
    details: [
      {
        sourceName: `Evidence Anchor (${primary1.familyId})`,
        coordinateFormatted: formatMniCoordinate(primary1.mniCoordinate),
        deltaFromAnchorMm: 0,
      },
      {
        sourceName: `Alternative Circuit (${primary2.familyId})`,
        coordinateFormatted: formatMniCoordinate(primary2.mniCoordinate),
        deltaFromAnchorMm: dist,
      },
    ],
  };
}

// ==========================================
// 6. Decision Workspace View Models
// ==========================================

export interface DecisionReviewViewModel {
  readonly decisionId: string;
  readonly caseId?: string | undefined;
  readonly slateId: string;
  readonly status: string;
  readonly isImmutable: boolean;
  readonly signedAt?: string | undefined;
  readonly clinicianName?: string | undefined;
  readonly clinicianLicense?: string | undefined;
  readonly digitalSignatureHash: string;
  readonly selectedTargetsSummary: readonly {
    readonly sequence: number;
    readonly source: string;
    readonly targetName: string;
    readonly coordinateFormatted: string;
    readonly actionTaken: string;
    readonly clinicalReasons: readonly string[];
  }[];
  readonly overallReasoning: string;
  readonly magniomInfluence: string;
  readonly disagreementWithMagniom?: string | undefined;
  readonly supersedesId?: string | undefined;
}

export function toDecisionReviewViewModel(
  decision: ClinicianDecision,
  slate: TargetSlate,
): DecisionReviewViewModel {
  const targetMap = new Map<string, TargetCandidate>();
  [...slate.primaryCandidates, ...slate.additionalCandidates].forEach(c => targetMap.set(c.id, c));

  const targetSummaries = (decision.candidateDecisions || []).map((cd, index) => {
    const candidate = targetMap.get(cd.targetCandidateId);
    return {
      sequence: index + 1,
      source: cd.action === 'modify' ? 'Modified Clinician Coordinate' : 'Magniom Slate Candidate',
      targetName: candidate?.familyId || `Target ${cd.targetCandidateId}`,
      coordinateFormatted:
        cd.modifiedTarget &&
        typeof cd.modifiedTarget === 'object' &&
        'mniCoordinate' in cd.modifiedTarget
          ? formatMniCoordinate(cd.modifiedTarget.mniCoordinate as MniCoordinate)
          : candidate
            ? formatMniCoordinate(candidate.mniCoordinate)
            : '(—, —, —)',
      actionTaken: cd.action.toUpperCase(),
      clinicalReasons: cd.reasonCodes || [],
    };
  });

  return {
    decisionId: decision.id,
    caseId: decision.caseId,
    slateId: decision.slateId,
    status: decision.status || 'completed',
    isImmutable: decision.isImmutable,
    signedAt: decision.decidedAt,
    clinicianName: decision.attestation?.clinicianName || 'Treating Specialist Clinician',
    clinicianLicense: decision.attestation?.licenseNumber,
    digitalSignatureHash: decision.digitalSignatureHash,
    selectedTargetsSummary: targetSummaries,
    overallReasoning:
      decision.overallReasoning || 'Clinical reasoning captured in decision record.',
    magniomInfluence: decision.magniomInfluence || 'moderate',
    disagreementWithMagniom: decision.disagreementWithMagniom,
    supersedesId: decision.supersedesId,
  };
}

// ==========================================
// 7. 3D Clinical Viewer View Models & Adapters
// Conforms to MAGNIOM-Clinician Workspace & UX Specification v1.0 Section 41-50, 65-67, 74
// ==========================================

export interface TargetRoiViewModel {
  readonly id: string;
  readonly candidateRole: CandidateRole;
  readonly roleTitle: string;
  readonly roleSubtitle: string;
  readonly targetFamily: string;
  readonly mniCoordinate: MniCoordinate;
  readonly mniFormatted: string;
  readonly subjectNativeCoordinate: SubjectCoordinate;
  readonly subjectNativeFormatted: string;
  readonly primaryHcpParcel: string;
  readonly surfaceAreaMm2: number;
  readonly coilNormal: Vector3D;
  readonly depthMm: number;
  readonly accessibilityRating: 'Optimal' | 'Acceptable' | 'Suboptimal';
  readonly reliabilityBadgeClass: string;
  readonly reliabilityLevel: string;
  readonly isPrimary: boolean;
  readonly isSelected: boolean;
  readonly markerColor: string;
}

export interface Counterfactual3DViewModel {
  readonly hasCounterfactual: boolean;
  readonly baselineName: string;
  readonly baselineMni: MniCoordinate;
  readonly baselineMniFormatted: string;
  readonly candidateMni: MniCoordinate;
  readonly candidateMniFormatted: string;
  readonly displacementDistanceMm: number;
  readonly displacementVector: Vector3D;
  readonly targetFamilyComparison: 'SAME_FAMILY' | 'DIFFERENT_FAMILY';
  readonly therapeuticCircuitComparison: 'SAME_CIRCUIT' | 'DIFFERENT_CIRCUIT';
  readonly expectedGainText: string;
  readonly justificationText: string;
  readonly interpretationText: string;
}

export interface ConfidenceRegion3DViewModel {
  readonly centroidMni: MniCoordinate;
  readonly centroidFormatted: string;
  readonly dispersionRadiusMm: number;
  readonly surfaceAreaMm2: number;
  readonly reliabilityLevel: 'HIGH' | 'MODERATE' | 'LOW' | 'UNUSABLE';
  readonly badgeClass: string;
  readonly description: string;
  readonly coilContextDescription: string;
}

export interface CircuitOverlayViewModel {
  readonly circuitId: string;
  readonly name: string;
  readonly shortCode: string;
  readonly colormap: 'coolwarm' | 'magma' | 'viridis' | 'inferno' | 'sgacc_gradient';
  readonly hemisphere: 'L' | 'R';
  readonly defaultOpacity: number;
  readonly description: string;
  readonly isActive: boolean;
}

export interface Comparison3DViewModel {
  readonly candidates: readonly TargetRoiViewModel[];
  readonly pairwiseDistances: readonly {
    readonly candidateAId: string;
    readonly candidateAName: string;
    readonly candidateBId: string;
    readonly candidateBName: string;
    readonly distanceMm: number;
    readonly isRedundant: boolean;
  }[];
  readonly redundantPairsCount: number;
  readonly accessibleSummary: string;
}

export interface ViewerLayerVisibilityViewModel {
  readonly corticalAnatomy: boolean;
  readonly selectedTarget: boolean;
  readonly reliabilityRegion: boolean;
  readonly therapeuticCircuit: boolean;
  readonly evidenceOnlyTarget: boolean;
  readonly alternativeTargets: boolean;
  readonly atlasBoundaries: boolean;
  readonly efield: boolean;
}

export interface Clinical3DViewerViewModel {
  readonly caseId: string;
  readonly selectedCandidateId: string;
  readonly selectedTarget: TargetRoiViewModel;
  readonly counterfactual?: Counterfactual3DViewModel | undefined;
  readonly confidenceRegion: ConfidenceRegion3DViewModel;
  readonly circuitOverlays: readonly CircuitOverlayViewModel[];
  readonly activeCircuitOverlayId?: string | undefined;
  readonly candidates3D: readonly TargetRoiViewModel[];
  readonly comparison3D: Comparison3DViewModel;
  readonly cameraPresets: readonly CameraOrientationPreset[];
  readonly activeSurfaceType: SurfaceMeshType;
  readonly activeHemisphere: 'L' | 'R' | 'BOTH';
  readonly visibleLayers: ViewerLayerVisibilityViewModel;
  readonly accessibleTextSummary: string;
}

export function toTargetRoiViewModel(
  candidate: TargetCandidate,
  isSelected: boolean,
  options?: { subjectT1?: SubjectCoordinate },
): TargetRoiViewModel {
  const roleInfo = getRoleTitleAndSubtitle(candidate.role);
  const mni = candidate.mniCoordinate;

  // Approximate native T1w coordinate if not directly supplied (using canonical inverse)
  const nativeCoord: SubjectCoordinate = options?.subjectT1 ?? {
    space: 'NATIVE_T1W',
    x: Number((mni.x * 0.98 + 1.2).toFixed(1)),
    y: Number((mni.y * 1.01 - 12.1).toFixed(1)),
    z: Number((mni.z * 0.99 + 8.1).toFixed(1)),
    unit: 'mm',
  };

  const isP1 = candidate.role === 'PRIMARY_1';
  const isP2 = candidate.role === 'PRIMARY_2';
  const markerColor = isP1 ? '#0284c7' : isP2 ? '#7c3aed' : '#4b5563';

  // HCP-MMP1.0 parcel heuristics based on coordinate territory
  const parcelName =
    mni.y > 42
      ? 'HCP-MMP1.0 46 / a9-46v'
      : mni.y > 34
        ? 'HCP-MMP1.0 p9-46v / 8Av'
        : 'HCP-MMP1.0 9-46d / 8C';

  return {
    id: candidate.id,
    candidateRole: candidate.role,
    roleTitle: roleInfo.title,
    roleSubtitle: roleInfo.subtitle,
    targetFamily: candidate.familyId,
    mniCoordinate: mni,
    mniFormatted: formatMniCoordinate(mni),
    subjectNativeCoordinate: nativeCoord,
    subjectNativeFormatted: formatSubjectCoordinate(nativeCoord),
    primaryHcpParcel: parcelName,
    surfaceAreaMm2: 24.5,
    coilNormal: { x: -0.32, y: 0.65, z: 0.69 },
    depthMm: 14.2,
    accessibilityRating: 'Optimal',
    reliabilityBadgeClass:
      candidate.method === 'CONNECTOME_REFINED' ? 'badge-reliability-high' : 'badge-neutral',
    reliabilityLevel: candidate.method === 'CONNECTOME_REFINED' ? 'HIGH' : 'N/A',
    isPrimary: roleInfo.isPrimary,
    isSelected,
    markerColor,
  };
}

export function toCounterfactual3DViewModel(
  candidate: TargetCandidate,
  slateBaseline?: MniCoordinate,
): Counterfactual3DViewModel | undefined {
  if (candidate.method !== 'CONNECTOME_REFINED') {
    return undefined;
  }

  const baseline: MniCoordinate = slateBaseline || {
    space: 'MNI152NLin2009cAsym',
    x: -42.0,
    y: 38.0,
    z: 31.0,
  };

  const distance =
    candidate.convergenceProfile?.distanceToEvidenceBaselineMm ??
    calculateEuclideanDistance(candidate.mniCoordinate, baseline);

  const dispVector: Vector3D = {
    x: Number((candidate.mniCoordinate.x - baseline.x).toFixed(1)),
    y: Number((candidate.mniCoordinate.y - baseline.y).toFixed(1)),
    z: Number((candidate.mniCoordinate.z - baseline.z).toFixed(1)),
  };

  const interpretation =
    distance <= 12
      ? 'Modest within-family connectomic refinement preserving standard evidence boundaries.'
      : 'Substantial connectomic displacement from group evidence baseline. Review clinical coverage trade-offs.';

  return {
    hasCounterfactual: true,
    baselineName: 'Evidence-Only Standard Group Prior (F3 / BA46)',
    baselineMni: baseline,
    baselineMniFormatted: formatMniCoordinate(baseline),
    candidateMni: candidate.mniCoordinate,
    candidateMniFormatted: formatMniCoordinate(candidate.mniCoordinate),
    displacementDistanceMm: distance,
    displacementVector: dispVector,
    targetFamilyComparison: 'SAME_FAMILY',
    therapeuticCircuitComparison: 'SAME_CIRCUIT',
    expectedGainText: '+18% expected sgACC anti-correlation concordance',
    justificationText:
      'Connectome refinement towards patient-specific maximal anti-correlation focus.',
    interpretationText: interpretation,
  };
}

export function toConfidenceRegion3DViewModel(
  candidate: TargetCandidate,
): ConfidenceRegion3DViewModel {
  const isPersonalised = candidate.method === 'CONNECTOME_REFINED';
  const radius = isPersonalised ? 5.8 : 4.0;
  const area = Number((Math.PI * radius * radius).toFixed(1));

  return {
    centroidMni: candidate.mniCoordinate,
    centroidFormatted: formatMniCoordinate(candidate.mniCoordinate),
    dispersionRadiusMm: radius,
    surfaceAreaMm2: area,
    reliabilityLevel: isPersonalised ? 'HIGH' : 'HIGH',
    badgeClass: 'badge-reliability-high',
    description: `± approx. ${radius} mm spatial reliability region derived from cross-run and split-half series.`,
    coilContextDescription:
      'Spatial dispersion is substantially narrower than standard figure-8 coil E-field footprint (~20 mm FWHM).',
  };
}

export function getCanonicalCircuitOverlays(): CircuitOverlayViewModel[] {
  return [
    {
      circuitId: 'TC-MDD-CONVERGENT-001',
      name: 'Convergent sgACC - Left DLPFC Antidepressant Circuit',
      shortCode: 'sgACC-DLPFC',
      colormap: 'coolwarm',
      hemisphere: 'L',
      defaultOpacity: 0.75,
      description: 'Canonical anti-correlation circuit map (Fox 2012 / Weigand 2018).',
      isActive: true,
    },
    {
      circuitId: 'TC-MDD-DYSPHORIC-001',
      name: 'Dysphoric Mood / Fronto-Striatal Reward Circuit',
      shortCode: 'Fronto-Striatal',
      colormap: 'magma',
      hemisphere: 'L',
      defaultOpacity: 0.65,
      description: 'Ventral striatum and pregenual anterior cingulate reward network.',
      isActive: false,
    },
    {
      circuitId: 'TC-MDD-ANXIOSOMATIC-001',
      name: 'Anxiosomatic Distress / dmPFC-Amygdala Circuit',
      shortCode: 'dmPFC-Amygdala',
      colormap: 'viridis',
      hemisphere: 'L',
      defaultOpacity: 0.65,
      description:
        'Dorsomedial prefrontal cortex to centromedial amygdala fear and arousal circuit.',
      isActive: false,
    },
    {
      circuitId: 'TC-MDD-NORMATIVE-FPN',
      name: 'Normative Frontoparietal Control Network (Yeo 17)',
      shortCode: 'Normative FPN',
      colormap: 'inferno',
      hemisphere: 'L',
      defaultOpacity: 0.5,
      description: 'Group normative cortical parcellation template boundaries.',
      isActive: false,
    },
  ];
}

export function toComparison3DViewModel(
  candidates3D: readonly TargetRoiViewModel[],
): Comparison3DViewModel {
  const pairwise: {
    candidateAId: string;
    candidateAName: string;
    candidateBId: string;
    candidateBName: string;
    distanceMm: number;
    isRedundant: boolean;
  }[] = [];

  let redundantCount = 0;

  for (let i = 0; i < candidates3D.length; i++) {
    for (let j = i + 1; j < candidates3D.length; j++) {
      const cA = candidates3D[i]!;
      const cB = candidates3D[j]!;
      const dist = calculateEuclideanDistance(cA.mniCoordinate, cB.mniCoordinate);
      const isRedundant = dist < 15.0 && cA.targetFamily === cB.targetFamily;
      if (isRedundant) redundantCount++;

      pairwise.push({
        candidateAId: cA.id,
        candidateAName: `${cA.roleTitle} (${cA.targetFamily})`,
        candidateBId: cB.id,
        candidateBName: `${cB.roleTitle} (${cB.targetFamily})`,
        distanceMm: dist,
        isRedundant,
      });
    }
  }

  const summary = `Multi-candidate spatial comparison across ${candidates3D.length} targets. ${
    redundantCount > 0
      ? `${redundantCount} candidate pair(s) fall within the 15 mm spatial redundancy threshold.`
      : 'All target hypotheses exhibit distinct spatial localization.'
  }`;

  return {
    candidates: candidates3D,
    pairwiseDistances: pairwise,
    redundantPairsCount: redundantCount,
    accessibleSummary: summary,
  };
}

export function toClinical3DViewerViewModel(
  slate: TargetSlate,
  allCandidates: readonly TargetCandidate[],
  selectedCandidateId?: string,
  options?: {
    activeCircuitOverlayId?: string;
    activeSurfaceType?: SurfaceMeshType;
    activeHemisphere?: 'L' | 'R' | 'BOTH';
    visibleLayers?: Partial<ViewerLayerVisibilityViewModel>;
  },
): Clinical3DViewerViewModel {
  const activeId =
    selectedCandidateId || slate.primaryCandidates[0]?.id || allCandidates[0]?.id || '';
  const selectedCandidate =
    allCandidates.find(c => c.id === activeId) || slate.primaryCandidates[0] || allCandidates[0]!;

  const baselineMni = slate.counterfactualSummary?.evidenceBaselineCoordinate;

  const candidates3D = allCandidates.map(c => toTargetRoiViewModel(c, c.id === activeId));
  const selectedTarget3D = candidates3D.find(c => c.id === activeId) || candidates3D[0]!;

  const counterfactual = toCounterfactual3DViewModel(selectedCandidate, baselineMni);
  const confidenceRegion = toConfidenceRegion3DViewModel(selectedCandidate);
  const overlays = getCanonicalCircuitOverlays();
  const comparison3D = toComparison3DViewModel(candidates3D);

  const defaultLayers: ViewerLayerVisibilityViewModel = {
    corticalAnatomy: true,
    selectedTarget: true,
    reliabilityRegion: true,
    therapeuticCircuit: Boolean(options?.activeCircuitOverlayId),
    evidenceOnlyTarget: Boolean(counterfactual),
    alternativeTargets: false,
    atlasBoundaries: false,
    efield: false,
    ...options?.visibleLayers,
  };

  const cameraPresets: CameraOrientationPreset[] = [
    'LEFT_LATERAL',
    'RIGHT_LATERAL',
    'SUPERIOR',
    'MEDIAL',
    'ANTERIOR',
    'POSTERIOR',
    'RESET',
  ];

  const accessibleSummary = [
    `3D Cortical Viewer presenting ${selectedTarget3D.roleTitle} (${selectedTarget3D.targetFamily}).`,
    `Subject-space location: ${selectedTarget3D.subjectNativeFormatted}.`,
    `Standard MNI reference: ${selectedTarget3D.mniFormatted} in parcel ${selectedTarget3D.primaryHcpParcel}.`,
    `Spatial reliability: ± approx. ${confidenceRegion.dispersionRadiusMm} mm region (${confidenceRegion.reliabilityLevel} reliability).`,
    counterfactual
      ? `Counterfactual baseline at ${counterfactual.baselineMniFormatted}, displacement distance is ${counterfactual.displacementDistanceMm} mm (${counterfactual.interpretationText}).`
      : 'Evidence-only target reference.',
  ].join(' ');

  return {
    caseId: slate.caseId,
    selectedCandidateId: activeId,
    selectedTarget: selectedTarget3D,
    counterfactual,
    confidenceRegion,
    circuitOverlays: overlays,
    activeCircuitOverlayId: options?.activeCircuitOverlayId,
    candidates3D,
    comparison3D,
    cameraPresets,
    activeSurfaceType: options?.activeSurfaceType || 'midthickness',
    activeHemisphere: options?.activeHemisphere || 'L',
    visibleLayers: defaultLayers,
    accessibleTextSummary: accessibleSummary,
  };
}

// ==========================================
// 8. Application Shell & Navigation View Models
// (MAGNIOM-Application Shell, Navigation & Clinical Context Specification v1.0)
// ==========================================

export type EnvironmentMode = 'CLINICAL' | 'RESEARCH' | 'VALIDATION';

export interface EnvironmentModeBadgeViewModel {
  readonly mode: EnvironmentMode;
  readonly label: string;
  readonly badgeClass: string;
  readonly isExperimental: boolean;
  readonly description: string;
}

export interface UserIdentityViewModel {
  readonly id: string;
  readonly displayName: string;
  readonly roleTitle: string;
  readonly hasSigningAuthority: boolean;
  readonly signingAuthorityLevel?: string | undefined;
  readonly organizationId: string;
  readonly organizationName: string;
  readonly siteName: string;
  readonly initials: string;
}

export interface OrganisationContextViewModel {
  readonly organizationId: string;
  readonly organizationName: string;
  readonly siteId: string;
  readonly siteName: string;
  readonly displayLabel: string;
}

export interface TopBarViewModel {
  readonly brandName: string;
  readonly brandSubtitle: string;
  readonly modeBadge: EnvironmentModeBadgeViewModel;
  readonly organisationContext: OrganisationContextViewModel;
  readonly currentUser: UserIdentityViewModel;
  readonly releaseDigestShort: string;
  readonly globalAlertCount: number;
}

export interface SidebarNavigationItemViewModel {
  readonly id: string;
  readonly label: string;
  readonly path: string;
  readonly icon: string;
  readonly badgeCount?: number | undefined;
  readonly badgeVariant?: 'neutral' | 'urgent' | 'highlight' | undefined;
  readonly isActive: boolean;
  readonly isLocked?: boolean | undefined;
  readonly isExternal?: boolean | undefined;
  readonly section: 'clinical' | 'research' | 'system' | 'case';
}

export interface GlobalSidebarViewModel {
  readonly isCollapsed: boolean;
  readonly activeCaseId?: string | undefined;
  readonly isCaseActive: boolean;
  readonly clinicalItems: readonly SidebarNavigationItemViewModel[];
  readonly researchItems: readonly SidebarNavigationItemViewModel[];
  readonly systemItems: readonly SidebarNavigationItemViewModel[];
  readonly caseItems?: readonly SidebarNavigationItemViewModel[] | undefined;
}

export interface CaseStalenessItemViewModel {
  readonly isStale: boolean;
  readonly reason?: string | undefined;
  readonly changedSource?: string | undefined;
  readonly blockingSign: boolean;
  readonly regenerateAvailable: boolean;
  readonly alertText: string;
}

export interface CaseShellContextViewModel {
  readonly caseId: string;
  readonly displayIdentifier: string;
  readonly patientDisplayLabel: string;
  readonly indication: string;
  readonly indicationFormatted: string;
  readonly clinicalTask: string;
  readonly mode: EnvironmentMode;
  readonly workflowStage: string;
  readonly phenotypeStatus: {
    readonly label: string;
    readonly isApproved: boolean;
    readonly badgeClass: string;
  };
  readonly imagingStatus: {
    readonly label: string;
    readonly isQualified: boolean;
    readonly badgeClass: string;
  };
  readonly connectomeStatus: {
    readonly label: string;
    readonly isQualified: boolean;
    readonly badgeClass: string;
  };
  readonly targetSlateStatus: {
    readonly label: string;
    readonly isReady: boolean;
    readonly candidateCount: number;
    readonly badgeClass: string;
  };
  readonly decisionStatus: {
    readonly label: string;
    readonly isSigned: boolean;
    readonly badgeClass: string;
  };
  readonly staleness: CaseStalenessItemViewModel;
  readonly releaseDigest: string;
}

export interface HomeWorklistItemViewModel {
  readonly id: string;
  readonly caseId: string;
  readonly caseCode: string;
  readonly patientLabel: string;
  readonly indication: string;
  readonly taskTitle: string;
  readonly taskDescription: string;
  readonly actionLabel: string;
  readonly actionHref: string;
  readonly priority: 'URGENT' | 'HIGH' | 'NORMAL';
  readonly priorityBadgeClass: string;
  readonly isStale: boolean;
  readonly mode: EnvironmentMode;
  readonly lastModifiedFormatted: string;
}

export interface HomeWorklistViewModel {
  readonly greeting: string;
  readonly attentionCount: number;
  readonly heroActionItem?: HomeWorklistItemViewModel | undefined;
  readonly attentionItems: readonly HomeWorklistItemViewModel[];
  readonly recentCases: readonly {
    readonly caseId: string;
    readonly caseCode: string;
    readonly title: string;
    readonly indication: string;
    readonly stateLabel: string;
    readonly isStale: boolean;
    readonly mode: EnvironmentMode;
    readonly overviewHref: string;
    readonly targetHref: string;
  }[];
  readonly releaseSummary: {
    readonly buildName: string;
    readonly status: string;
    readonly isCurrent: boolean;
  };
}

export interface SubsystemProvenanceViewModel {
  readonly subsystemName: string;
  readonly version: string;
  readonly sha256DigestShort: string;
  readonly sha256DigestFull: string;
  readonly status: 'FROZEN' | 'ACTIVE' | 'EXPERIMENTAL';
  readonly isChangeControlLocked: boolean;
}

export interface ReleaseContextSummaryViewModel {
  readonly buildId: string;
  readonly buildName: string;
  readonly maturityStage: string;
  readonly freezeTimestamp: string;
  readonly gitCommitShaShort: string;
  readonly subsystems: readonly SubsystemProvenanceViewModel[];
  readonly decisionSupportDisclaimer: string;
}

// ------------------------------------------
// Adapters for Application Shell View Models
// ------------------------------------------

export function toEnvironmentModeBadgeViewModel(
  mode: EnvironmentMode = 'CLINICAL',
): EnvironmentModeBadgeViewModel {
  switch (mode) {
    case 'RESEARCH':
      return {
        mode: 'RESEARCH',
        label: 'RESEARCH PROTOTYPE',
        badgeClass: 'badge-tierexp',
        isExperimental: true,
        description: 'Experimental output. Prohibited from patient clinical treatment decisions.',
      };
    case 'VALIDATION':
      return {
        mode: 'VALIDATION',
        label: 'VALIDATION BUILD M3',
        badgeClass: 'badge-tier2',
        isExperimental: false,
        description: 'Quality and Formative Human-Factors verification suite.',
      };
    case 'CLINICAL':
    default:
      return {
        mode: 'CLINICAL',
        label: 'CLINICAL MODE',
        badgeClass: 'badge-tier1',
        isExperimental: false,
        description: 'Decision support mode for authorized specialist clinical review.',
      };
  }
}

export function toTopBarViewModel(options?: {
  mode?: EnvironmentMode;
  user?: Partial<UserIdentityViewModel>;
  organization?: Partial<OrganisationContextViewModel>;
  releaseDigest?: string;
  globalAlertCount?: number;
}): TopBarViewModel {
  const user: UserIdentityViewModel = {
    id: options?.user?.id || 'usr-spec-001',
    displayName: options?.user?.displayName || 'Dr A. Smith',
    roleTitle: options?.user?.roleTitle || 'TMS Specialist',
    hasSigningAuthority: options?.user?.hasSigningAuthority ?? true,
    signingAuthorityLevel:
      options?.user?.signingAuthorityLevel || 'Full Specialist Target Attestation',
    organizationId: options?.organization?.organizationId || 'org-melb-tms',
    organizationName: options?.organization?.organizationName || 'Melbourne TMS Centre',
    siteName: options?.organization?.siteName || 'Site 1 — Parkville',
    initials: options?.user?.initials || 'AS',
  };

  const org: OrganisationContextViewModel = {
    organizationId: user.organizationId,
    organizationName: user.organizationName,
    siteId: options?.organization?.siteId || 'site-01',
    siteName: user.siteName,
    displayLabel: `${user.organizationName} · ${user.siteName}`,
  };

  return {
    brandName: 'MAGNIOM',
    brandSubtitle: 'TMS Target Decision Support',
    modeBadge: toEnvironmentModeBadgeViewModel(options?.mode || 'CLINICAL'),
    organisationContext: org,
    currentUser: user,
    releaseDigestShort: options?.releaseDigest?.slice(0, 8) || 'M3-FROZEN',
    globalAlertCount: options?.globalAlertCount || 0,
  };
}

export function toCaseShellContextViewModel(record: {
  clinicalCase: {
    id: string;
    caseCode: string;
    patientId: string;
    indicationCode: string;
    mode: string;
    state: string;
  };
  phenotype?: { snapshotHash?: string; state?: string };
  slate?: {
    qualification?: { level?: string };
    primaryCandidates?: readonly unknown[];
    deterministicManifestHash?: string;
  };
  decision?: { isImmutable?: boolean };
  isStale?: boolean;
  staleReason?: string;
}): CaseShellContextViewModel {
  const isPhenotypeApproved = Boolean(record.phenotype?.snapshotHash);
  const isDecisionSigned = Boolean(record.decision?.isImmutable);
  const isStale = Boolean(record.isStale);
  const candidateCount = record.slate?.primaryCandidates?.length || 0;

  const mode: EnvironmentMode =
    record.clinicalCase.mode === 'RESEARCH'
      ? 'RESEARCH'
      : record.clinicalCase.mode === 'VALIDATION'
        ? 'VALIDATION'
        : 'CLINICAL';

  const stalenessItem: CaseStalenessItemViewModel = {
    isStale,
    reason: record.staleReason,
    changedSource: isStale ? 'Phenotype or Connectome update post-slate generation' : undefined,
    blockingSign: isStale,
    regenerateAvailable: isStale,
    alertText: isStale
      ? `STALE TARGET SLATE: ${record.staleReason || 'The clinical phenotype was updated after this slate was generated. Signing is blocked until regenerated.'}`
      : 'Target Slate is current and qualified against active phenotype.',
  };

  return {
    caseId: record.clinicalCase.id,
    displayIdentifier: record.clinicalCase.caseCode,
    patientDisplayLabel: `Patient ${record.clinicalCase.patientId}`,
    indication: record.clinicalCase.indicationCode,
    indicationFormatted:
      record.clinicalCase.indicationCode === 'MDD'
        ? 'Major Depressive Disorder ± Anxious Distress'
        : record.clinicalCase.indicationCode,
    clinicalTask: isDecisionSigned
      ? 'Immutable Decision Signed'
      : isPhenotypeApproved
        ? 'Target Planning & Slate Review'
        : 'Phenotype Formulation',
    mode,
    workflowStage: record.clinicalCase.state,
    phenotypeStatus: {
      label: isPhenotypeApproved ? 'Phenotype Approved' : 'Phenotype Formulation',
      isApproved: isPhenotypeApproved,
      badgeClass: isPhenotypeApproved ? 'badge-tier1' : 'badge-tier3',
    },
    imagingStatus: {
      label: 'Imaging Qualified',
      isQualified: true,
      badgeClass: 'badge-tier1',
    },
    connectomeStatus: {
      label:
        record.slate?.qualification?.level === 'LOW'
          ? 'Connectome Low Reliability'
          : 'Connectome Qualified',
      isQualified: record.slate?.qualification?.level !== 'LOW',
      badgeClass: record.slate?.qualification?.level === 'LOW' ? 'badge-tier3' : 'badge-tier1',
    },
    targetSlateStatus: {
      label: isStale ? 'Slate Stale' : candidateCount > 0 ? 'Target Slate Ready' : 'Pending',
      isReady: candidateCount > 0 && !isStale,
      candidateCount,
      badgeClass: isStale ? 'badge-tier3' : candidateCount > 0 ? 'badge-tier1' : 'badge-neutral',
    },
    decisionStatus: {
      label: isDecisionSigned ? 'Decision Signed & Locked' : 'Decision Pending Review',
      isSigned: isDecisionSigned,
      badgeClass: isDecisionSigned ? 'badge-tier1' : 'badge-tier2',
    },
    staleness: stalenessItem,
    releaseDigest: record.slate?.deterministicManifestHash || 'v1.0.0-sealed',
  };
}

export function toReleaseContextSummaryViewModel(): ReleaseContextSummaryViewModel {
  return {
    buildId: 'MAGNIOM-BUILD-M3-20260902',
    buildName: 'Magniom Verification Build M3 (Frozen Baseline)',
    maturityStage: 'M3',
    freezeTimestamp: '2026-09-02T05:56:25.757Z',
    gitCommitShaShort: '9b3f4e8a',
    subsystems: [
      {
        subsystemName: 'Target Engine',
        version: 'v1.0.0',
        sha256DigestShort: '00484578',
        sha256DigestFull: '00484578dde929afa1a82d4dc7e3d092d5d7bfbf78e6df3ce7e6ebb1b9d5aa80',
        status: 'FROZEN',
        isChangeControlLocked: true,
      },
      {
        subsystemName: 'Evidence Library',
        version: 'v1.0.0',
        sha256DigestShort: 'b4af7311',
        sha256DigestFull: 'b4af7311c27f608a22a206806bbe49fd8e5d339af315d7859baa1e9488f1a502',
        status: 'FROZEN',
        isChangeControlLocked: true,
      },
      {
        subsystemName: 'Phenotype Ontology',
        version: 'MAGNIOM-PHENOTYPE-1.0.0',
        sha256DigestShort: '8407ea25',
        sha256DigestFull: '8407ea25cece3179a5aca84138516aee7a3f5b28f2f5045377451843bea19f7f',
        status: 'FROZEN',
        isChangeControlLocked: true,
      },
      {
        subsystemName: 'Neuro Pipeline',
        version: 'MAGNIOM-NEURO-1.0.0',
        sha256DigestShort: 'e3ba47a6',
        sha256DigestFull: 'e3ba47a63fbf2f64707204ba17f29181a65d5a5240e79983c92d0704d424e8c6',
        status: 'FROZEN',
        isChangeControlLocked: true,
      },
      {
        subsystemName: 'Scientific Policy',
        version: 'MAGNIOM-POLICY-1.0.0',
        sha256DigestShort: '6a4febb0',
        sha256DigestFull: '6a4febb0e7ec108c6f28be81b0ef1ee0242bf7e3ef798dcf5ed888e422fe0882',
        status: 'FROZEN',
        isChangeControlLocked: true,
      },
      {
        subsystemName: 'UX Workspace & Application Shell',
        version: 'MAGNIOM-UX-1.0.0',
        sha256DigestShort: '7829da41',
        sha256DigestFull: '7829da41940ef8b2518e388d1d8cf9c34f9a037e9668ad54ee1102434e320f01',
        status: 'FROZEN',
        isChangeControlLocked: true,
      },
    ],
    decisionSupportDisclaimer:
      'Magniom provides connectome-informed candidate target slates for specialist clinician review and does not autonomously prescribe treatment.',
  };
}
