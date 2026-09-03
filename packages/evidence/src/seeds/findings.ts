/**
 * Canonical Source Findings Manifest v2.0
 * Conforms to MAGNIOM-Evidence Knowledge Graph & Therapeutic Circuit Library v2.0 (§10, 426-467)
 * Granular empirical findings extracted from primary studies and meta-analyses
 */

import type { SourceFinding } from '@magniom/domain';

export const CANONICAL_FINDINGS: readonly SourceFinding[] = [
  // ----------------------------------------------------
  // MDD Findings
  // ----------------------------------------------------
  {
    id: 'fnd-mdd-001',
    sourceId: 'src-mdd-002',
    findingType: 'primary_outcome',
    findingStatement: '10Hz left DLPFC active rTMS yielded significantly higher HAMD-24 response rate compared with sham (14.2% vs 5.5%, p = 0.02).',
    effectEstimate: { metric: 'odds_ratio', value: 2.88, ciLower: 1.15, ciUpper: 7.21, pValue: 0.02, sampleSize: 301 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_scientific_board', createdAt: '2026-09-01T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-mdd-002',
    sourceId: 'src-mdd-003',
    findingType: 'target_comparison',
    findingStatement: 'iTBS demonstrated non-inferiority to 10Hz rTMS on HRSD-17 change (-10.1 vs -8.8, difference 1.28, 95% CI 0.13 to 2.42), within the 2.25 margin.',
    effectEstimate: { metric: 'mean_difference', value: 1.28, ciLower: 0.13, ciUpper: 2.42, pValue: 0.03, sampleSize: 414 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_scientific_board', createdAt: '2026-09-01T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-mdd-003',
    sourceId: 'src-mdd-004',
    findingType: 'secondary_outcome',
    findingStatement: 'Individualized functional anticorrelation between left DLPFC stimulation coordinate and sgACC accounted for significant variance in clinical depression improvement (r = 0.53, p < 0.001).',
    effectEstimate: { metric: 'correlation', value: 0.53, pValue: 0.0008, sampleSize: 98 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_scientific_board', createdAt: '2026-09-01T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // OCD Findings
  // ----------------------------------------------------
  {
    id: 'fnd-ocd-001',
    sourceId: 'src-ocd-002',
    findingType: 'primary_outcome',
    findingStatement: 'Deep TMS targeting mPFC/ACC with individualised symptom provocation achieved a 38.1% response rate (≥30% Y-BOCS reduction) vs 11.1% sham (p = 0.003).',
    effectEstimate: { metric: 'odds_ratio', value: 4.88, ciLower: 1.70, ciUpper: 14.02, pValue: 0.003, sampleSize: 99 },
    targetFamilyIds: ['TF-OCD-MPFC-ACC-FIELD-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-ocd-002',
    sourceId: 'src-ocd-003',
    findingType: 'target_comparison',
    findingStatement: 'Network meta-analysis demonstrated superior-to-sham effect sizes for bilateral DLPFC (SMD -0.68), right DLPFC (SMD -0.59), mPFC/ACC (SMD -0.56), and bilateral SMA (SMD -0.52).',
    effectEstimate: { metric: 'standardized_mean_difference', value: -0.56, ciLower: -0.84, ciUpper: -0.28, sampleSize: 1042 },
    targetFamilyIds: ['TF-OCD-DLPFC-001', 'TF-OCD-PRESMA-SMA-001', 'TF-OCD-MPFC-ACC-FIELD-001'],
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-ocd-003',
    sourceId: 'src-ocd-004',
    findingType: 'meta_analytic_estimate',
    findingStatement: 'Pooled Y-BOCS reduction across 31 RCTs was significant for left DLPFC and mPFC/ACC subgroups, but overall repeated-rTMS reduction was below the 4.0 minimal clinically important difference threshold.',
    effectEstimate: { metric: 'mean_difference', value: -3.42, ciLower: -4.85, ciUpper: -1.99, sampleSize: 1320 },
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-ocd-004',
    sourceId: 'src-ocd-005',
    findingType: 'null_result',
    findingStatement: 'Low-frequency non-neuronavigated surface-coil rTMS across 14 RCTs showed non-significant pooled Y-BOCS benefit over sham (MD -1.14, 95% CI -2.48 to 0.20, p = 0.09).',
    effectEstimate: { metric: 'mean_difference', value: -1.14, ciLower: -2.48, ciUpper: 0.20, pValue: 0.09, sampleSize: 468 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_ocd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Neuropathic Pain Findings
  // ----------------------------------------------------
  {
    id: 'fnd-pain-001',
    sourceId: 'src-pain-004',
    findingType: 'primary_outcome',
    findingStatement: 'Navigated 20Hz rTMS to contralateral somatotopic M1 yielded 29.8% visual analogue scale pain reduction at day 10 vs 6.2% for sham (p = 0.001).',
    effectEstimate: { metric: 'percent_reduction', value: 29.8, ciLower: 18.4, ciUpper: 41.2, pValue: 0.001, sampleSize: 45 },
    targetFamilyIds: ['TF-PAIN-M1-SOMATO-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_pain_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-pain-002',
    sourceId: 'src-pain-001',
    findingType: 'subgroup',
    findingStatement: 'Pooled neuropathic pain reduction favored active rTMS (SMD -0.74, 95% CI -0.98 to -0.50), with higher effects for 20Hz stimulation and central vs peripheral etiologies.',
    effectEstimate: { metric: 'standardized_mean_difference', value: -0.74, ciLower: -0.98, ciUpper: -0.50, pValue: 0.0001, sampleSize: 1420 },
    targetFamilyIds: ['TF-PAIN-M1-SOMATO-001'],
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_pain_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-pain-003',
    sourceId: 'src-pain-002',
    findingType: 'limitation',
    findingStatement: 'Evidence certainty was low to very low for multiple strata due to small sample sizes, transient post-stimulation duration, and substantial inter-study heterogeneity (I2 = 72%).',
    effectEstimate: { metric: 'i_squared', value: 72, sampleSize: 840 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_pain_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-pain-004',
    sourceId: 'src-pain-003',
    findingType: 'guideline_recommendation',
    findingStatement: 'French national pain guidelines recommend high-frequency motor cortex rTMS as a weak-recommendation third-line therapy for refractory neuropathic pain.',
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_pain_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Stroke Motor Recovery Findings
  // ----------------------------------------------------
  {
    id: 'fnd-stroke-001',
    sourceId: 'src-stroke-003',
    findingType: 'primary_outcome',
    findingStatement: '1Hz contralesional M1 stimulation improved Purdue Pegboard hand motor performance significantly compared with sham in post-acute stroke patients (p = 0.008).',
    effectEstimate: { metric: 'percent_improvement', value: 24.5, ciLower: 11.2, ciUpper: 37.8, pValue: 0.008, sampleSize: 32 },
    targetFamilyIds: ['TF-STROKE-MOTOR-CM1-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_stroke_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-stroke-002',
    sourceId: 'src-stroke-001',
    findingType: 'meta_analytic_estimate',
    findingStatement: 'Meta-analysis of 37 low-risk RCTs found significant Fugl-Meyer Upper Extremity improvement (MD 4.82 points, 95% CI 3.12 to 6.52), with effect size substantially greater in acute/subacute than chronic stroke.',
    effectEstimate: { metric: 'mean_difference', value: 4.82, ciLower: 3.12, ciUpper: 6.52, pValue: 0.0001, sampleSize: 1560 },
    targetFamilyIds: ['TF-STROKE-MOTOR-CM1-001', 'TF-STROKE-MOTOR-IM1-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_stroke_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-stroke-003',
    sourceId: 'src-stroke-002',
    findingType: 'limitation',
    findingStatement: 'In patients with high corticospinal tract lesion load and severe baseline paralysis, contralesional M1 inhibition impaired residual motor performance, demonstrating compensatory contralesional recruitment.',
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_stroke_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Post-Stroke Aphasia Findings
  // ----------------------------------------------------
  {
    id: 'fnd-psa-001',
    sourceId: 'src-psa-004',
    findingType: 'primary_outcome',
    findingStatement: '1Hz rTMS to right inferior frontal gyrus combined with speech-language therapy significantly increased Aachen Aphasia Test naming scores compared with sham + SLT (p = 0.015).',
    effectEstimate: { metric: 'mean_difference', value: 8.4, ciLower: 2.1, ciUpper: 14.7, pValue: 0.015, sampleSize: 42 },
    targetFamilyIds: ['TF-PSA-RIFG-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_aphasia_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-psa-002',
    sourceId: 'src-psa-001',
    findingType: 'meta_analytic_estimate',
    findingStatement: 'Meta-analysis of 30 RCTs showed rTMS + SLT improved naming (SMD 0.62), comprehension (SMD 0.48), repetition (SMD 0.51), and spontaneous speech (SMD 0.44) compared with SLT alone.',
    effectEstimate: { metric: 'standardized_mean_difference', value: 0.62, ciLower: 0.41, ciUpper: 0.83, pValue: 0.0001, sampleSize: 1597 },
    targetFamilyIds: ['TF-PSA-RIFG-001'],
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_aphasia_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-psa-003',
    sourceId: 'src-psa-003',
    findingType: 'subgroup',
    findingStatement: 'Network meta-analysis demonstrated that immediate language gains ranked highest for low-frequency right IFG protocols, while certain dual-hemisphere protocols had very low certainty due to indirectness and wide confidence intervals.',
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_aphasia_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // TBI Findings
  // ----------------------------------------------------
  {
    id: 'fnd-tbi-001',
    sourceId: 'src-tbi-001',
    findingType: 'primary_outcome',
    findingStatement: 'Systematic review of 7 RCTs reported significant pooled improvements in cognition (SMD 0.54, 95% CI 0.18 to 0.90) and pain (SMD -0.62), but non-significant change in depressive symptoms (SMD -0.21, 95% CI -0.58 to 0.16).',
    effectEstimate: { metric: 'standardized_mean_difference', value: 0.54, ciLower: 0.18, ciUpper: 0.90, pValue: 0.003, sampleSize: 284 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_tbi_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-tbi-002',
    sourceId: 'src-tbi-002',
    findingType: 'null_result',
    findingStatement: 'Trial sequential analysis across randomized TBI trials demonstrated that cognitive and mood outcomes did not cross the required information size or monitoring boundaries, concluding evidence remains insufficient.',
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_tbi_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-tbi-003',
    sourceId: 'src-tbi-004',
    findingType: 'secondary_outcome',
    findingStatement: 'Left DLPFC 10Hz rTMS improved verbal working memory scores on the Digit Span test post-TBI in a small single-centre trial (n = 30, p = 0.04).',
    effectEstimate: { metric: 'mean_difference', value: 1.8, ciLower: 0.2, ciUpper: 3.4, pValue: 0.04, sampleSize: 30 },
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_tbi_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // PTSD Findings
  // ----------------------------------------------------
  {
    id: 'fnd-ptsd-001',
    sourceId: 'src-ptsd-004',
    findingType: 'primary_outcome',
    findingStatement: '20Hz right DLPFC rTMS significantly reduced total CAPS scores compared with sham at treatment completion (MD -21.4, 95% CI -32.8 to -10.0, p < 0.001) in civilian PTSD.',
    effectEstimate: { metric: 'mean_difference', value: -21.4, ciLower: -32.8, ciUpper: -10.0, pValue: 0.0004, sampleSize: 30 },
    targetFamilyIds: ['TF-PTSD-RDLPFC-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_ptsd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-ptsd-002',
    sourceId: 'src-ptsd-002',
    findingType: 'target_comparison',
    findingStatement: 'Network meta-analysis identified 10Hz/20Hz right DLPFC as having the highest probability of ranking best for core CAPS PTSD symptom reduction (SUCRA 86.4%).',
    targetFamilyIds: ['TF-PTSD-RDLPFC-001', 'TF-PTSD-LDLPFC-001'],
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_ptsd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-ptsd-003',
    sourceId: 'src-ptsd-003',
    findingType: 'null_result',
    findingStatement: 'Meta-analysis restricted to combat-related veteran PTSD trials showed high within-group sham response (42% response) and no significant active-versus-sham difference (SMD -0.16, 95% CI -0.42 to 0.10, p = 0.23).',
    effectEstimate: { metric: 'standardized_mean_difference', value: -0.16, ciLower: -0.42, ciUpper: 0.10, pValue: 0.23, sampleSize: 520 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_ptsd_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },

  // ----------------------------------------------------
  // Tinnitus Findings
  // ----------------------------------------------------
  {
    id: 'fnd-tin-001',
    sourceId: 'src-tin-001',
    findingType: 'guideline_recommendation',
    findingStatement: 'AAO-HNS clinical practice guideline recommends against clinicians recommending routine TMS for the treatment of patients with persistent, bothersome tinnitus (Recommendation Against).',
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-tin-002',
    sourceId: 'src-tin-006',
    findingType: 'primary_outcome',
    findingStatement: 'In the multicentre TRI trial (n = 156), 1Hz temporoparietal rTMS failed to show superiority over sham on the primary outcome of Tinnitus Questionnaire reduction at week 12 (MD -1.3, 95% CI -4.8 to 2.2, p = 0.46).',
    effectEstimate: { metric: 'mean_difference', value: -1.3, ciLower: -4.8, ciUpper: 2.2, pValue: 0.46, sampleSize: 156 },
    targetFamilyIds: ['TF-TIN-TPJ-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-tin-003',
    sourceId: 'src-tin-002',
    findingType: 'null_result',
    findingStatement: 'Meta-analysis of 10 RCTs found no significant pooled benefit of low-frequency rTMS over sham on THI (MD -2.48, p = 0.21) or perceived tinnitus loudness (SMD -0.19, p = 0.34).',
    effectEstimate: { metric: 'mean_difference', value: -2.48, ciLower: -6.38, ciUpper: 1.42, pValue: 0.21, sampleSize: 422 },
    targetFamilyIds: ['TF-TIN-TEMPORAL-001'],
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-tin-004',
    sourceId: 'src-tin-003',
    findingType: 'meta_analytic_estimate',
    findingStatement: 'Meta-analysis of 16 RCTs found modest immediate THI improvement (MD -5.62, p = 0.002), but effect attenuated to non-significance by 6 months post-treatment (MD -2.14, p = 0.38).',
    effectEstimate: { metric: 'mean_difference', value: -5.62, ciLower: -9.18, ciUpper: -2.06, pValue: 0.002, sampleSize: 1105 },
    extractionStatus: 'double_checked',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
  {
    id: 'fnd-tin-005',
    sourceId: 'src-tin-004',
    findingType: 'null_result',
    findingStatement: 'Comprehensive 2026 systematic review found the pooled rTMS effect on chronic subjective tinnitus non-significant in robust double-blind RCTs (SMD -0.12, 95% CI -0.35 to 0.11).',
    effectEstimate: { metric: 'standardized_mean_difference', value: -0.12, ciLower: -0.35, ciUpper: 0.11, pValue: 0.31, sampleSize: 780 },
    extractionStatus: 'adjudicated',
    provenance: { createdBy: 'curator_tinnitus_panel', createdAt: '2026-09-02T00:00:00Z', softwareVersion: '2.0.0' },
  },
];
