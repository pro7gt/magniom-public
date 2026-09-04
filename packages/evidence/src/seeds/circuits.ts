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
