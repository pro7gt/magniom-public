/**
 * @magniom/target-engine - Authoritative Scientific Method Manifest Registry
 * Conforms to MAGNIOM Revision 05 Finding 4 (§4)
 *
 * Provides immutable, versioned method manifests defining scientific maturity,
 * permitted operating modes, and clinical promotion eligibility.
 * Gates and engines query this registry to prevent self-asserted approval leakage.
 */

export interface MethodManifest {
  readonly methodId: string;
  readonly version: string;
  readonly indication: string;
  readonly scientificMaturity:
    'prototype' | 'research' | 'validation' | 'clinical_candidate' | 'clinical_approved';
  readonly permittedModes: readonly ('clinical' | 'research' | 'validation')[];
  readonly dataOrigins: readonly string[];
  readonly requiredModalities?: readonly string[];
  readonly clinicalPromotionStatus:
    'blocked' | 'provisional_validation' | 'candidate_under_review' | 'approved';
  readonly implementationStatus?: 'implemented' | 'not_implemented';
  readonly implementationHash?: string;
  readonly evidenceIds?: readonly string[];
  readonly limitations?: readonly string[];
}

/**
 * Canonical baseline registry mirroring scientific-config/methods/
 */
export const CANONICAL_METHOD_MANIFESTS: readonly MethodManifest[] = [
  {
    methodId: 'FC_CLUSTER_PERSONALISED',
    version: '0.1.0',
    indication: 'MDD',
    scientificMaturity: 'validation',
    permittedModes: ['research', 'validation'],
    dataOrigins: ['patient_measured', 'derived_from_patient_measured'],
    requiredModalities: ['structural_mri', 'resting_state_fmri'],
    clinicalPromotionStatus: 'blocked',
    implementationStatus: 'implemented',
  },
  {
    methodId: 'SC_CLUSTER_PERSONALISED',
    version: '0.1.0',
    indication: 'MDD',
    scientificMaturity: 'validation',
    permittedModes: ['research', 'validation'],
    dataOrigins: ['patient_measured', 'derived_from_patient_measured'],
    requiredModalities: ['structural_mri', 'diffusion_mri'],
    clinicalPromotionStatus: 'blocked',
    implementationStatus: 'not_implemented',
  },
  {
    methodId: 'NORMATIVE_PATHWAY_MODEL',
    version: '0.1.0',
    indication: 'MDD',
    scientificMaturity: 'research',
    permittedModes: ['research'],
    dataOrigins: ['normative'],
    requiredModalities: ['normative_structural_connectome'],
    clinicalPromotionStatus: 'blocked',
    implementationStatus: 'implemented',
  },
  {
    methodId: 'EVD_PRIOR',
    version: '2.1.0',
    indication: 'MDD',
    scientificMaturity: 'clinical_approved',
    permittedModes: ['clinical', 'research', 'validation'],
    dataOrigins: ['patient_measured', 'derived_from_patient_measured'],
    clinicalPromotionStatus: 'approved',
    implementationStatus: 'implemented',
  },
  {
    methodId: 'CANONICAL_ANCHOR',
    version: '2.0.0',
    indication: 'MDD',
    scientificMaturity: 'clinical_approved',
    permittedModes: ['clinical', 'research', 'validation'],
    dataOrigins: ['patient_measured', 'derived_from_patient_measured'],
    clinicalPromotionStatus: 'approved',
    implementationStatus: 'implemented',
  },
];

export class MethodManifestRegistry {
  private readonly manifests: Map<string, MethodManifest>;

  constructor(customManifests?: readonly MethodManifest[]) {
    this.manifests = new Map();
    const list = customManifests ?? CANONICAL_METHOD_MANIFESTS;
    for (const m of list) {
      this.manifests.set(m.methodId, m);
      this.manifests.set(`${m.methodId}@${m.version}`, m);
    }
  }

  public getManifest(methodId: string, version?: string): MethodManifest | undefined {
    if (version) {
      return this.manifests.get(`${methodId}@${version}`) ?? this.manifests.get(methodId);
    }
    return this.manifests.get(methodId);
  }

  public isRegistered(methodId: string): boolean {
    return this.manifests.has(methodId);
  }

  public isClinicallyPermitted(methodId: string, version?: string): boolean {
    const m = this.getManifest(methodId, version);
    if (!m) return false;
    return (
      m.clinicalPromotionStatus === 'approved' &&
      m.permittedModes.includes('clinical') &&
      (m.scientificMaturity === 'clinical_candidate' ||
        m.scientificMaturity === 'clinical_approved')
    );
  }
}

export const defaultMethodManifestRegistry = new MethodManifestRegistry();
