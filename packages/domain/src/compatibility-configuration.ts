/**
 * MAGNIOM Canonical Scientific Compatibility Configuration Domain Types v2.0
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§19-20)
 * Represents the immutable tuple binding Policy × Module × Evidence × Engine × Components
 */

import type { MagniomMode, CompatibilityStatus } from './enums.js';

export interface ComponentReleaseRef {
  readonly componentType: string;
  readonly componentId: string;
  readonly componentVersion: string;
  readonly manifestSha256?: string;
}

export interface ComponentRequirementRef {
  readonly componentType: string;
  readonly componentId?: string;
  readonly componentVersion?: string;
  readonly requirement: 'required' | 'optional' | 'disabled' | 'not_applicable';
  readonly purpose?: string;
}

export interface ScientificCompatibilityConfiguration {
  readonly id: string;
  readonly code: string;
  readonly version: string;
  readonly scientificPolicyReleaseId: string;
  readonly indicationModuleReleaseId: string;
  readonly mode: MagniomMode;
  readonly evidenceLibraryReleaseId: string;
  readonly targetEngineReleaseId: string;
  readonly targetingPlugin: ComponentReleaseRef;
  readonly candidateGenerators: readonly ComponentReleaseRef[];
  readonly measurementProviders: readonly ComponentRequirementRef[];
  readonly reliabilityMethods: readonly ComponentRequirementRef[];
  readonly phenotypeOntologyReleaseId: string;
  readonly atlasReleases: readonly ComponentRequirementRef[];
  readonly normativeModels: readonly ComponentRequirementRef[];
  readonly efieldEngine?: ComponentRequirementRef;
  readonly deviceCapabilityProfiles: readonly ComponentRequirementRef[];
  readonly acquisitionProfiles: readonly ComponentRequirementRef[];
  readonly compatibilityStatus: CompatibilityStatus;
  readonly validationEvidenceIds: readonly string[];
  readonly configurationSha256: string;
}
