/**
 * Canonical Therapeutic Circuit & Target-System Seeds v2.0
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0
 * (§13, §16, §17, §31, §36, §42, §43, §49, §56, §58, §65, §80, §81)
 */

import type { TherapeuticCircuitV2 } from '@magniom/domain';

export const CANONICAL_CIRCUITS_V2: readonly TherapeuticCircuitV2[] = [
  // ----------------------------------------------------
  // MDD: Distributed Functional Network (§16)
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000001',
    code: 'TC-MDD-DLPFC-SACC-001',
    version: '2.0.0',
    name: 'DLPFC-Subgenual Anterior Cingulate Functional Connectivity Circuit',
    indicationScopeIds: ['ind-mdd-001'],
    clinicalObjectiveDefinitionIds: ['obj-mdd-core-001'],
    circuitKind: 'therapeutic_network',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      sourceNodes: ['L_DLPFC_BA46', 'L_DLPFC_BA9'],
      targetNode: 'SGC_BA25',
      interactionType: 'negative_correlation',
      normativeBasis: 'Yeo 2011 7-Network + Fox 2012 SGC Anticorrelation',
    },
    circuitArtifactIds: ['art-mdd-sgc-mask-001'],
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000002'],
    conflictingEvidenceClaimIds: [],
    limitations: [
      'Inter-individual functional variance necessitates individualized fMRI mapping for optimal precision.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },
  {
    id: 'c0000000-0000-0000-0001-000000000011',
    code: 'TC-MDD-CASH-FC-001',
    version: '2.0.0',
    name: 'Cash-Zalesky Cluster-Based DLPFC-sgACC Functional Anticorrelation Circuit',
    indicationScopeIds: ['ind-mdd-001'],
    clinicalObjectiveDefinitionIds: ['obj-mdd-core-001'],
    circuitKind: 'therapeutic_network',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      sourceNodes: ['L_DLPFC_Cluster_Centroid'],
      targetNode: 'SGC_Group_Seedmap_or_A32sg',
      interactionType: 'negative_correlation',
      normativeBasis: 'Cash et al. 2021 Hum Brain Mapp; 26-neighborhood clustering; top 10% (seed) / 0.5% (seedmap)',
    },
    circuitArtifactIds: ['art-mdd-cash-dlpfc-mask-001'],
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000001'],
    conflictingEvidenceClaimIds: [],
    limitations: [
      'Requires >=15-20 min usable resting-state fMRI for high intraindividual reproducibility (R=0.94, variation 2.2mm).',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-15T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },
  {
    id: 'c0000000-0000-0000-0001-000000000012',
    code: 'TC-MDD-LI-SC-001',
    version: '2.0.0',
    name: 'Li-Zalesky Subgenual A32sg-DLPFC Structural Connectivity Tractography Circuit',
    indicationScopeIds: ['ind-mdd-001'],
    clinicalObjectiveDefinitionIds: ['obj-mdd-core-001'],
    circuitKind: 'therapeutic_network',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      sourceNodes: ['L_DLPFC_A8dl_A9l_A46_A946d'],
      targetNode: 'L_sgACC_A32sg',
      interactionType: 'structural_probabilistic_tractography',
      normativeBasis: 'Li et al. 2026 Am J Psychiatry; MRtrix3 probabilistic tractography + SIFT2; top 5% cluster centroid',
    },
    circuitArtifactIds: ['art-mdd-bn-a32sg-mask-001'],
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000001'],
    conflictingEvidenceClaimIds: [],
    limitations: [
      'Pivotal RCT evidence demonstrates week 2 and week 6 superiority; staged initially under validation mode.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-15T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },
  {
    id: 'c0000000-0000-0000-0001-000000000013',
    code: 'TC-MDD-SEGUIN-PATHWAY-001',
    version: '2.0.0',
    name: 'Seguin-Zalesky Polysynaptic White Matter Pathway Communication Model',
    indicationScopeIds: ['ind-mdd-001'],
    clinicalObjectiveDefinitionIds: ['obj-mdd-core-001'],
    circuitKind: 'therapeutic_network',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      sourceNodes: ['L_DLPFC_TMS_Site'],
      targetNode: 'R_SGC_Sphere_MNI_6_16_-10',
      intermediateNodes: ['SFG', 'Thalamus', 'ACC'],
      interactionType: 'polysynaptic_shortest_path_routing',
      normativeBasis: 'Seguin & Zalesky 2026 Nat Neurosci; Edge cost L=-log(W); hop count H(a,b); 3-hop cortical and 4-hop fronto-thalamic routes',
    },
    circuitArtifactIds: ['art-mdd-seguin-pathway-routes-001'],
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000001'],
    conflictingEvidenceClaimIds: [],
    limitations: [
      'Normative connectome communication model; strictly research-only and prohibited from unverified clinical substitution.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-15T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // OCD: Cortico-Striato-Thalamo-Cortical System (§24, §17)
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000002',
    code: 'TC-OCD-CSTC-001',
    version: '2.0.0',
    name: 'Cortico-Striato-Thalamo-Cortical Treatment-System Hypothesis',
    indicationScopeIds: ['ind-ocd-001'],
    clinicalObjectiveDefinitionIds: ['obj-ocd-core-001', 'obj-ocd-function-001'],
    circuitKind: 'target_system',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      corticalNodes: ['mPFC', 'dACC', 'pre-SMA', 'DLPFC'],
      subcorticalNodes: ['caudate', 'thalamus'],
      mechanism: 'Modulation of hyperactive fronto-striatal error-monitoring loops',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000005', 'c0000000-0000-0000-0000-000000000006'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000008'],
    limitations: [
      'Regional stimulation effects demonstrate treatment response without establishing an invariant connectomic network.',
      'Surface coil non-navigated LF stimulation shows conflicting meta-analytic results.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // Neuropathic Pain: M1 Modulatory System (§17, §31, §78)
  // NOTE: circuitKind = 'target_system' per §17 safety rule!
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000003',
    code: 'TC-PAIN-M1-MODULATION-001',
    version: '2.0.0',
    name: 'M1-Engaged Pain-Modulatory Target System',
    indicationScopeIds: ['ind-pain-001'],
    clinicalObjectiveDefinitionIds: ['obj-pain-reduction-001'],
    circuitKind: 'target_system',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      primaryCorticalNode: 'Contralateral Primary Motor Cortex (M1)',
      modulatoryDownstream: ['thalamus', 'dorsal_horn', 'periaqueductal_gray'],
      mechanism: 'Top-down intracortical GABAergic disinhibition and spinothalamic gate modulation',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000009', 'c0000000-0000-0000-0000-000000000010'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000011'],
    limitations: [
      'Stimulation of motor cortex relieves pain, but distributed network mechanism remains uncertain (§17).',
      'Analgesia requires strict somatotopic congruence to the painful body area (§84).',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // Stroke Motor: Interhemispheric Balance Model (§36, §42)
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000004',
    code: 'TC-STR-INTERHEMISPHERIC-001',
    version: '2.0.0',
    name: 'Stroke Interhemispheric Inhibition and Motor Balance Model',
    indicationScopeIds: ['ind-stroke-001'],
    clinicalObjectiveDefinitionIds: ['obj-stroke-ue-motor-001', 'obj-stroke-function-001'],
    circuitKind: 'interhemispheric_model',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      contralesionalNode: 'Contralateral M1 (Contralesional)',
      ipsilesionalNode: 'Ipsilesional M1 (Perilesional)',
      transcallosalInteraction: 'Transcallosal inhibition imbalance',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000013', 'c0000000-0000-0000-0000-000000000014'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000016'],
    limitations: [
      'Interhemispheric competition model breaks down in severe corticospinal damage where contralesional cortex provides essential motor drive (§42).',
      'Applicability strictly constrained by post-stroke disease stage (§85).',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // Post-Stroke Aphasia: Perilesional & Contralateral Language Network (§43)
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000005',
    code: 'TC-PSA-LANGUAGE-NETWORK-001',
    version: '2.0.0',
    name: 'Post-Stroke Language Reorganisation and Right IFG Transcallosal Model',
    indicationScopeIds: ['ind-aphasia-001'],
    clinicalObjectiveDefinitionIds: ['obj-aphasia-naming-001', 'obj-aphasia-comm-001'],
    circuitKind: 'functional_network',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      dominantNode: 'Left IFG (Broca perilesional area)',
      nonDominantNode: 'Right IFG (pars triangularis / opercularis)',
      mechanism: 'Suppression of maladaptive right IFG hyperactivity during speech-language therapy',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000017', 'c0000000-0000-0000-0000-000000000018'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000020'],
    limitations: [
      'Requires co-administered speech-language therapy (SLT); stimulation alone lacks durable efficacy (§86).',
      'Conflicting literature on whether right hemisphere activation in severe damage is compensatory rather than maladaptive.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // TBI: Frontal Executive & Attention Modulatory System (§17, §49, §56)
  // NOTE: circuitKind = 'target_system' per §17 safety rule!
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000006',
    code: 'TC-TBI-DLPFC-SYSTEM-001',
    version: '2.0.0',
    name: 'TBI Frontal Executive and Attention Modulatory Target System',
    indicationScopeIds: ['ind-tbi-001'],
    clinicalObjectiveDefinitionIds: ['obj-tbi-cog-001', 'obj-tbi-dep-001'],
    circuitKind: 'target_system',
    scientificStatus: 'hypothesis',
    circuitDefinition: {
      primaryTarget: 'Dorsolateral Prefrontal Cortex (DLPFC)',
      mechanism: 'Excitatory rTMS targeting diffuse axonal injury-related hypofrontality',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000021'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000023', 'c0000000-0000-0000-0000-000000000024'],
    limitations: [
      'Missing target specificity across primary studies; pooled meta-analytic effects disguise protocol heterogeneity (§50, §87).',
      'Recent 2026 trial sequential analysis indicates cognitive benefits do not reach statistical significance after correcting for sample size.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // PTSD: Fronto-Limbic Emotional Regulation Target System (§58)
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000007',
    code: 'TC-PTSD-FRONTO-LIMBIC-001',
    version: '2.0.0',
    name: 'PTSD Right-DLPFC Fronto-Limbic Hyperarousal Regulation System',
    indicationScopeIds: ['ind-ptsd-001'],
    clinicalObjectiveDefinitionIds: ['obj-ptsd-core-001', 'obj-ptsd-hyperarousal-001'],
    circuitKind: 'target_system',
    scientificStatus: 'treatment_effect_linked',
    circuitDefinition: {
      corticalNode: 'Right DLPFC',
      limbicTargets: ['amygdala', 'insula', 'anterior cingulate'],
      mechanism: 'Down-regulation of limbic hyperactivity via high-frequency right DLPFC stimulation',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000026', 'c0000000-0000-0000-0000-000000000027'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000029'],
    limitations: [
      'Civilian evidence does not transfer automatically to combat-related trauma populations (§88).',
      'Rigorous sham-controlled veteran trials demonstrate neutral effect sizes over active sham.',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },

  // ----------------------------------------------------
  // Tinnitus: Auditory & Temporoparietal Target System (§17, §65)
  // NOTE: circuitKind = 'target_system' per §17 safety rule!
  // ----------------------------------------------------
  {
    id: 'c0000000-0000-0000-0001-000000000008',
    code: 'TC-TIN-AUDITORY-SYSTEM-001',
    version: '2.0.0',
    name: 'Chronic Tinnitus Auditory-Cortex Hyperactivity Suppression Target System',
    indicationScopeIds: ['ind-tinnitus-001'],
    clinicalObjectiveDefinitionIds: ['obj-tin-distress-001', 'obj-tin-loudness-001'],
    circuitKind: 'target_system',
    scientificStatus: 'hypothesis',
    circuitDefinition: {
      primaryCorticalNode: 'Left Temporoparietal Cortex (TPC) / Primary Auditory Cortex (A1)',
      mechanism: 'Low-frequency inhibitory rTMS aiming to quiet central auditory hyperactivity',
    },
    supportingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000032'],
    conflictingEvidenceClaimIds: ['c0000000-0000-0000-0000-000000000030', 'c0000000-0000-0000-0000-000000000031'],
    limitations: [
      'Materially conflicting and negative evidence: AAO-HNS guideline recommends AGAINST routine TMS (§66, §89).',
      'Short-term loudness improvements fail to demonstrate long-term functional durability.',
      'Research-only staging posture; clinical target generation strictly prohibited (§71).',
    ],
    provenance: {
      createdBy: 'magniom_scientific_curation',
      createdAt: '2026-09-02T00:00:00Z',
      softwareVersion: '2.0.0',
    },
  },
];

export interface SgaccSeedMetadata {
  readonly seedId: string;
  readonly code: string;
  readonly name: string;
  readonly coordinateSpace: string;
  readonly seedType: 'SPHERICAL_ROI' | 'GRAY_MATTER_WEIGHTED_SEEDMAP' | 'ATLAS_PARCEL_MASK';
  readonly coordinatesMni: readonly { readonly x: number; readonly y: number; readonly z: number }[];
  readonly radiusMm?: number;
  readonly citationCode: string;
  readonly clinicalRole: 'functional_connectivity' | 'structural_connectivity' | 'polysynaptic_pathway';
}

export const CANONICAL_SGACC_SEEDS: readonly SgaccSeedMetadata[] = [
  {
    seedId: 'SEED-SGACC-SPHERE-FOX2012',
    code: 'FOX_WEIGAND_SPHERE',
    name: 'Fox 2012 / Weigand 2018 sgACC Bilateral Spherical Seed',
    coordinateSpace: 'MNI152NLin2009cAsym',
    seedType: 'SPHERICAL_ROI',
    coordinatesMni: [{ x: -6, y: 16, z: -10 }, { x: 6, y: 16, z: -10 }],
    radiusMm: 10.0,
    citationCode: 'SRC-MDD-FOX-2012',
    clinicalRole: 'functional_connectivity',
  },
  {
    seedId: 'SEED-SGACC-SEEDMAP-CASH2021',
    code: 'CASH_GROUP_SEEDMAP',
    name: 'Cash 2021 Whole-Brain Gray Matter SGC Weighted Seedmap',
    coordinateSpace: 'MNI152NLin2009cAsym',
    seedType: 'GRAY_MATTER_WEIGHTED_SEEDMAP',
    coordinatesMni: [{ x: 6, y: 16, z: -10 }],
    citationCode: 'SRC-MDD-CASH-2021',
    clinicalRole: 'functional_connectivity',
  },
  {
    seedId: 'SEED-SGACC-BN-A32SG-LI2026',
    code: 'BRAINNETOME_A32SG',
    name: 'Li 2026 Brainnetome Atlas Left A32sg Seed (SC & FC)',
    coordinateSpace: 'MNI152NLin2009cAsym',
    seedType: 'ATLAS_PARCEL_MASK',
    coordinatesMni: [{ x: -4, y: 22, z: -8 }],
    citationCode: 'SRC-MDD-LI-2026',
    clinicalRole: 'structural_connectivity',
  },
  {
    seedId: 'SEED-SGC-SEGUIN2026',
    code: 'SEGUIN_RIGHT_SGC_SPHERE',
    name: 'Seguin 2026 Right SGC Polysynaptic Pathway Target Sphere',
    coordinateSpace: 'MNI152NLin2009cAsym',
    seedType: 'SPHERICAL_ROI',
    coordinatesMni: [{ x: 6, y: 16, z: -10 }],
    radiusMm: 10.0,
    citationCode: 'SRC-MDD-SEGUIN-2026',
    clinicalRole: 'polysynaptic_pathway',
  },
];

