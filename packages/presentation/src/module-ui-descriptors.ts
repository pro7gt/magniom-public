/**
 * @magniom/presentation
 * Declarative Module UI Descriptors for All 8 Canonical Indications.
 * Conforms to MAGNIOM-Application Shell, Navigation & Clinical Context Specification v2.0 (§50–57, 231–233).
 *
 * Rules:
 * - Descriptors are strictly declarative and presentational.
 * - Descriptors define module-specific context sections, required measurements, workflow labels, and target geometries.
 * - Descriptors NEVER contain executable frontend scientific code or ranking logic.
 */

import type { IndicationModuleUiDescriptor } from './v2-shell-view-models.js';

// ==========================================
// 1. MDD (Major Depressive Disorder) (§52)
// ==========================================
export const MDD_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-MDD-2.0.0',
  indication_code: 'MDD',
  indication_name: 'Major Depressive Disorder ± Anxious Distress',
  context_sections: [
    {
      id: 'phenotype',
      label: 'Phenotype Formulation',
      required: true,
      pathSuffix: 'phenotype',
    },
    {
      id: 'objective',
      label: 'Clinical Objective',
      required: true,
      pathSuffix: 'objective',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI (T1w)',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'resting_state_fmri',
      label: 'Resting-State fMRI (BOLD)',
      required: false,
      pathSuffix: 'measurements/rs-fmri',
      fallbackAllowed: true,
    },
  ],
  workflow_labels: [
    { stepId: 'phenotype', customLabel: 'Phenotype' },
    { stepId: 'measurements', customLabel: 'Imaging & Connectome' },
    { stepId: 'targets', customLabel: 'Target Slate' },
  ],
  help_topic_ids: ['mdd-dlpfc-sgc', 'mdd-connectivity-refinement', 'mdd-baseline-evidence'],
  target_geometry_renderers: ['point', 'surface_roi'],
};

// ==========================================
// 2. Neuropathic Pain (§53)
// ==========================================
export const PAIN_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-PAIN-2.0.0',
  indication_code: 'PAIN',
  indication_name: 'Intractable Neuropathic Pain',
  context_sections: [
    {
      id: 'pain_phenotype',
      label: 'Pain Phenotype & Somatotopy',
      required: true,
      pathSuffix: 'pain-context',
    },
    {
      id: 'body_region',
      label: 'Painful Body Region',
      required: true,
      pathSuffix: 'body-region',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI (T1w)',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'motor_mapping',
      label: 'TMS Motor Mapping',
      required: true,
      pathSuffix: 'measurements/motor-mapping',
      fallbackAllowed: false,
    },
    {
      modality: 'motor_evoked_potential',
      label: 'Motor Evoked Potentials (MEP)',
      required: true,
      pathSuffix: 'measurements/mep',
      fallbackAllowed: false,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'Pain Somatotopy' },
    { stepId: 'measurements', customLabel: 'Motor Mapping & MEP' },
    { stepId: 'targets', customLabel: 'M1/S1 Target Slate' },
  ],
  help_topic_ids: ['pain-m1-somatotopy', 'pain-motor-threshold', 'pain-refinement-failure'],
  target_geometry_renderers: ['somatotopic', 'surface_roi', 'point'],
};

// ==========================================
// 3. Stroke Motor Recovery (§54)
// ==========================================
export const STROKE_MOTOR_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-STR-M-2.0.0',
  indication_code: 'STROKE_MOTOR',
  indication_name: 'Post-Stroke Motor Recovery',
  context_sections: [
    {
      id: 'motor_impairment',
      label: 'Motor Impairment & Limb Severity',
      required: true,
      pathSuffix: 'impairment',
    },
    {
      id: 'disease_stage',
      label: 'Post-Stroke Disease Stage',
      required: true,
      pathSuffix: 'stage',
    },
    {
      id: 'lesion_context',
      label: 'Lesion Topology & Mask Review',
      required: true,
      pathSuffix: 'lesion',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI (T1w)',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'lesion_mapping',
      label: 'Lesion Segmentation & Topology',
      required: true,
      pathSuffix: 'measurements/lesion-mask',
      fallbackAllowed: false,
    },
    {
      modality: 'motor_mapping',
      label: 'Ipsilesional / Contralesional Mapping',
      required: true,
      pathSuffix: 'measurements/motor-mapping',
      fallbackAllowed: false,
    },
    {
      modality: 'motor_evoked_potential',
      label: 'Corticospinal MEP Status',
      required: true,
      pathSuffix: 'measurements/mep',
      fallbackAllowed: false,
    },
    {
      modality: 'diffusion_mri',
      label: 'Diffusion MRI / Tractography (Research)',
      required: false,
      pathSuffix: 'measurements/dwi',
      fallbackAllowed: true,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'Stage & Lesion Context' },
    { stepId: 'measurements', customLabel: 'Lesion & Motor QC' },
    { stepId: 'targets', customLabel: 'Ipsilesional Target Slate' },
  ],
  help_topic_ids: [
    'stroke-subacute-window',
    'stroke-lesion-overlap-trap',
    'stroke-contralesional-inhibition',
  ],
  target_geometry_renderers: ['somatotopic', 'surface_roi', 'point'],
};

// ==========================================
// 4. Stroke Post-Stroke Aphasia (§55)
// ==========================================
export const STROKE_APHASIA_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-STR-A-2.0.0',
  indication_code: 'STROKE_APHASIA',
  indication_name: 'Post-Stroke Expressive / Fluent Aphasia',
  context_sections: [
    {
      id: 'aphasia_phenotype',
      label: 'Aphasia Battery & Language Baseline',
      required: true,
      pathSuffix: 'aphasia-context',
    },
    {
      id: 'disease_stage',
      label: 'Post-Stroke Temporal Stage',
      required: true,
      pathSuffix: 'stage',
    },
    {
      id: 'lesion_context',
      label: 'Perilesional Left Hemisphere Context',
      required: true,
      pathSuffix: 'lesion',
    },
    {
      id: 'treatment_context',
      label: 'Concomitant Speech-Language Therapy (SLT)',
      required: true,
      pathSuffix: 'slt-context',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI (T1w)',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'lesion_mapping',
      label: 'Left Frontotemporal Lesion Mapping',
      required: true,
      pathSuffix: 'measurements/lesion-mask',
      fallbackAllowed: false,
    },
    {
      modality: 'task_fmri',
      label: 'Language Task fMRI (Where Applicable)',
      required: false,
      pathSuffix: 'measurements/task-fmri',
      fallbackAllowed: true,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'Aphasia & SLT Context' },
    { stepId: 'measurements', customLabel: 'Perilesional Anatomy' },
    { stepId: 'targets', customLabel: 'Language Network Targets' },
  ],
  help_topic_ids: ['aphasia-broca-wernicke', 'aphasia-slt-pairing', 'aphasia-perilesional-intact'],
  target_geometry_renderers: ['network', 'surface_roi', 'point'],
};

// ==========================================
// 5. OCD (Obsessive-Compulsive Disorder) (§56)
// ==========================================
export const OCD_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-OCD-2.0.0',
  indication_code: 'OCD',
  indication_name: 'Obsessive-Compulsive Disorder (Deep TMS / Focal)',
  context_sections: [
    {
      id: 'ocd_phenotype',
      label: 'YBOCS Subtypes & Symptom Dimensions',
      required: true,
      pathSuffix: 'ocd-context',
    },
    {
      id: 'treatment_context',
      label: 'Symptom Provocation Context',
      required: true,
      pathSuffix: 'provocation-context',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI (T1w)',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'efield',
      label: 'Coil-Field Induced E-Field Distribution',
      required: true,
      pathSuffix: 'measurements/efield',
      fallbackAllowed: false,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'YBOCS & Provocation' },
    { stepId: 'measurements', customLabel: 'Coil-Field Geometry' },
    { stepId: 'targets', customLabel: 'Bilateral dACC/dmPFC Slate' },
  ],
  help_topic_ids: ['ocd-h7-coil-field', 'ocd-dacc-vs-dorsal', 'ocd-provocation-requirement'],
  target_geometry_renderers: ['coil_field', 'surface_roi'],
};

// ==========================================
// 6. Tinnitus Research (§57)
// ==========================================
export const TINNITUS_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-TIN-0.4.0',
  indication_code: 'TINNITUS',
  indication_name: 'Subjective Refractory Tinnitus (Research Prototype)',
  context_sections: [
    {
      id: 'tinnitus_phenotype',
      label: 'Tinnitus Characterisation (THI / Pitch / Acuity)',
      required: true,
      pathSuffix: 'tinnitus-context',
    },
  ],
  measurement_sections: [
    {
      modality: 'audiology',
      label: 'Pure-Tone Audiometry & Hearing Thresholds',
      required: true,
      pathSuffix: 'measurements/audiology',
      fallbackAllowed: false,
    },
    {
      modality: 'structural_mri',
      label: 'Structural MRI (Optional)',
      required: false,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: true,
    },
    {
      modality: 'resting_state_fmri',
      label: 'Auditory-Limbic rs-fMRI (Research)',
      required: false,
      pathSuffix: 'measurements/rs-fmri',
      fallbackAllowed: true,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'Tinnitus Phenotype' },
    { stepId: 'measurements', customLabel: 'Audiology QC' },
    { stepId: 'targets', customLabel: 'Research Target Hypotheses' },
  ],
  help_topic_ids: [
    'tinnitus-auditory-cortex',
    'tinnitus-sham-control',
    'tinnitus-research-limitations',
  ],
  target_geometry_renderers: ['surface_roi', 'point'],
};

// ==========================================
// 7. TBI Research (Traumatic Brain Injury)
// ==========================================
export const TBI_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-TBI-0.3.0',
  indication_code: 'TBI',
  indication_name: 'Chronic Traumatic Brain Injury (Research Prototype)',
  context_sections: [
    {
      id: 'tbi_injury',
      label: 'Injury Mechanism & Diffuse Axonal Injury Status',
      required: true,
      pathSuffix: 'tbi-context',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI with FLAIR/SWI',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'diffusion_mri',
      label: 'Tractography & White Matter Disruption (Research)',
      required: false,
      pathSuffix: 'measurements/dwi',
      fallbackAllowed: true,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'TBI Injury Profile' },
    { stepId: 'measurements', customLabel: 'Structural & DWI QC' },
    { stepId: 'targets', customLabel: 'Exploratory Circuit Targets' },
  ],
  help_topic_ids: ['tbi-dai-heterogeneity', 'tbi-no-mdd-borrowing'],
  target_geometry_renderers: ['network', 'surface_roi'],
};

// ==========================================
// 8. Substance Use Disorders (SUD)
// ==========================================
export const SUD_UI_DESCRIPTOR: IndicationModuleUiDescriptor = {
  indication_module_release_id: 'IMR-SUD-1.0.0',
  indication_code: 'SUD',
  indication_name: 'Substance Use Disorders (Craving & Cue Reactivity)',
  context_sections: [
    {
      id: 'substance_profile',
      label: 'Substance Type, Severity & Abstinence Window',
      required: true,
      pathSuffix: 'substance-context',
    },
    {
      id: 'treatment_context',
      label: 'Cue-Exposure & Psychosocial Context',
      required: true,
      pathSuffix: 'cue-context',
    },
  ],
  measurement_sections: [
    {
      modality: 'structural_mri',
      label: 'Structural MRI (T1w)',
      required: true,
      pathSuffix: 'measurements/structural-mri',
      fallbackAllowed: false,
    },
    {
      modality: 'resting_state_fmri',
      label: 'Reward Circuit rs-fMRI (Optional)',
      required: false,
      pathSuffix: 'measurements/rs-fmri',
      fallbackAllowed: true,
    },
  ],
  workflow_labels: [
    { stepId: 'context', customLabel: 'Substance & Cue Context' },
    { stepId: 'measurements', customLabel: 'Neuroimaging QC' },
    { stepId: 'targets', customLabel: 'DLPFC / Frontostriatal Slate' },
  ],
  help_topic_ids: ['sud-bilateral-dlpfc', 'sud-cue-reactivity'],
  target_geometry_renderers: ['point', 'surface_roi'],
};

// ==========================================
// Registry Map & Discovery
// ==========================================
const DESCRIPTOR_MAP: Record<string, IndicationModuleUiDescriptor> = {
  MDD: MDD_UI_DESCRIPTOR,
  PAIN: PAIN_UI_DESCRIPTOR,
  STROKE_MOTOR: STROKE_MOTOR_UI_DESCRIPTOR,
  STROKE_APHASIA: STROKE_APHASIA_UI_DESCRIPTOR,
  OCD: OCD_UI_DESCRIPTOR,
  TINNITUS: TINNITUS_UI_DESCRIPTOR,
  TBI: TBI_UI_DESCRIPTOR,
  SUD: SUD_UI_DESCRIPTOR,
};

export function getModuleUiDescriptor(indicationCode: string): IndicationModuleUiDescriptor {
  const norm = indicationCode.toUpperCase();
  const descriptor = DESCRIPTOR_MAP[norm];
  if (descriptor) return descriptor;

  // Fallback for aliases or generic display
  if (norm.includes('PAIN')) return PAIN_UI_DESCRIPTOR;
  if (norm.includes('APHASIA')) return STROKE_APHASIA_UI_DESCRIPTOR;
  if (norm.includes('STROKE')) return STROKE_MOTOR_UI_DESCRIPTOR;
  if (norm.includes('OCD')) return OCD_UI_DESCRIPTOR;
  if (norm.includes('TIN')) return TINNITUS_UI_DESCRIPTOR;
  if (norm.includes('TBI')) return TBI_UI_DESCRIPTOR;
  if (norm.includes('SUD')) return SUD_UI_DESCRIPTOR;

  // Default to MDD canonical descriptor
  return MDD_UI_DESCRIPTOR;
}

export const ALL_MODULE_UI_DESCRIPTORS: readonly IndicationModuleUiDescriptor[] =
  Object.values(DESCRIPTOR_MAP);
