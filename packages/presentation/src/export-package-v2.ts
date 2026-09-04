/**
 * MAGNIOM Canonical Export Package v2.0
 * Conforms to MAGNIOM-Canonical Multi-Indication Data Specification v2.0 (§133)
 */

const K_CONSTANTS = new Uint32Array([
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
]);

function sha256Universal(msg: string): string {
  const utf8: number[] = [];
  for (let i = 0; i < msg.length; i++) {
    let charcode = msg.charCodeAt(i);
    if (charcode < 0x80) utf8.push(charcode);
    else if (charcode < 0x800) {
      utf8.push(0xc0 | (charcode >> 6), 0x80 | (charcode & 0x3f));
    } else if (charcode < 0xd800 || charcode >= 0xe000) {
      utf8.push(0xe0 | (charcode >> 12), 0x80 | ((charcode >> 6) & 0x3f), 0x80 | (charcode & 0x3f));
    } else {
      i++;
      charcode = 0x10000 + (((charcode & 0x3ff) << 10) | (msg.charCodeAt(i) & 0x3ff));
      utf8.push(
        0xf0 | (charcode >> 18),
        0x80 | ((charcode >> 12) & 0x3f),
        0x80 | ((charcode >> 6) & 0x3f),
        0x80 | (charcode & 0x3f),
      );
    }
  }

  const bitLength = utf8.length * 8;
  utf8.push(0x80);
  while (utf8.length % 64 !== 56) {
    utf8.push(0);
  }

  const highBitLen = Math.floor(bitLength / 0x100000000);
  const lowBitLen = bitLength >>> 0;
  for (let i = 3; i >= 0; i--) utf8.push((highBitLen >>> (i * 8)) & 0xff);
  for (let i = 3; i >= 0; i--) utf8.push((lowBitLen >>> (i * 8)) & 0xff);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;

  const w = new Uint32Array(64);

  for (let chunk = 0; chunk < utf8.length; chunk += 64) {
    for (let i = 0; i < 16; i++) {
      const idx = chunk + i * 4;
      const b0 = utf8[idx] ?? 0;
      const b1 = utf8[idx + 1] ?? 0;
      const b2 = utf8[idx + 2] ?? 0;
      const b3 = utf8[idx + 3] ?? 0;
      w[i] = (b0 << 24) | (b1 << 16) | (b2 << 8) | b3;
    }

    for (let i = 16; i < 64; i++) {
      const w15 = w[i - 15] ?? 0;
      const w2 = w[i - 2] ?? 0;
      const w16 = w[i - 16] ?? 0;
      const w7 = w[i - 7] ?? 0;

      const s0 = ((w15 >>> 7) | (w15 << 25)) ^ ((w15 >>> 18) | (w15 << 14)) ^ (w15 >>> 3);
      const s1 = ((w2 >>> 17) | (w2 << 15)) ^ ((w2 >>> 19) | (w2 << 13)) ^ (w2 >>> 10);
      w[i] = (w16 + s0 + w7 + s1) >>> 0;
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const kVal = K_CONSTANTS[i] ?? 0;
      const wVal = w[i] ?? 0;
      const temp1 = (h + S1 + ch + kVal + wVal) >>> 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) >>> 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) >>> 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) >>> 0;
    }

    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
    h5 = (h5 + f) >>> 0;
    h6 = (h6 + g) >>> 0;
    h7 = (h7 + h) >>> 0;
  }

  const toHex = (val: number) => val.toString(16).padStart(8, '0');
  return `${toHex(h0)}${toHex(h1)}${toHex(h2)}${toHex(h3)}${toHex(h4)}${toHex(h5)}${toHex(h6)}${toHex(h7)}`;
}
import type {
  CaseIndication,
  IndicationModuleRelease,
  ClinicalObjective,
  DiseaseStageContext,
  LesionContext,
  TreatmentContextSnapshot,
  MeasurementBundle,
  ReliabilityBundle,
  TargetFamily,
  TargetCandidateV2,
  TargetSlateV2,
  ClinicianDecision,
  FinalTarget,
} from '@magniom/domain';

export interface CaseMetadata {
  readonly caseId: string;
  readonly patientPseudonymId?: string;
  readonly createdAt: string;
  readonly facilityId?: string;
}

export interface ScientificManifestHashes {
  readonly indicationModulePayloadSha256: string;
  readonly scientificPolicySha256: string;
  readonly evidenceLibrarySha256: string;
  readonly measurementBundleSha256: string;
  readonly slatePayloadSha256: string;
  readonly exportPackageSha256: string;
}

export interface CanonicalExportPackageV2 {
  readonly schemaVersion: '2.0.0';
  readonly exportedAt: string;
  readonly caseMetadata: CaseMetadata;
  readonly caseIndication: CaseIndication;
  readonly indicationModuleRelease: IndicationModuleRelease;
  readonly clinicalObjectives: readonly ClinicalObjective[];
  readonly phenotypeSnapshot: unknown;
  readonly diseaseStageContext?: DiseaseStageContext | undefined;
  readonly lesionContexts?: readonly LesionContext[] | undefined;
  readonly treatmentContextSnapshot?: TreatmentContextSnapshot | undefined;
  readonly measurementBundle: MeasurementBundle;
  readonly measurementProvenance: unknown;
  readonly reliabilityBundle?: ReliabilityBundle | undefined;
  readonly evidenceLibraryReleaseId: string;
  readonly scientificPolicyReleaseId: string;
  readonly therapeuticCircuits?: readonly unknown[] | undefined;
  readonly targetFamilies: readonly TargetFamily[];
  readonly generatedCandidates: readonly TargetCandidateV2[];
  readonly suppressedCandidates: readonly TargetCandidateV2[];
  readonly targetSlate: TargetSlateV2;
  readonly clinicianDecision?: ClinicianDecision | undefined;
  readonly finalTarget?: FinalTarget | undefined;
  readonly auditHistory: readonly unknown[];
  readonly scientificManifestHashes: ScientificManifestHashes;
}

export interface BuildCanonicalExportPackageInput {
  readonly caseMetadata: CaseMetadata;
  readonly caseIndication: CaseIndication;
  readonly indicationModuleRelease: IndicationModuleRelease;
  readonly clinicalObjectives: readonly ClinicalObjective[];
  readonly phenotypeSnapshot: unknown;
  readonly diseaseStageContext?: DiseaseStageContext | undefined;
  readonly lesionContexts?: readonly LesionContext[] | undefined;
  readonly treatmentContextSnapshot?: TreatmentContextSnapshot | undefined;
  readonly measurementBundle: MeasurementBundle;
  readonly measurementProvenance?: unknown | undefined;
  readonly reliabilityBundle?: ReliabilityBundle | undefined;
  readonly evidenceLibraryReleaseId: string;
  readonly scientificPolicyReleaseId: string;
  readonly therapeuticCircuits?: readonly unknown[] | undefined;
  readonly targetFamilies: readonly TargetFamily[];
  readonly generatedCandidates: readonly TargetCandidateV2[];
  readonly suppressedCandidates: readonly TargetCandidateV2[];
  readonly targetSlate: TargetSlateV2;
  readonly clinicianDecision?: ClinicianDecision | undefined;
  readonly finalTarget?: FinalTarget | undefined;
  readonly auditHistory?: readonly unknown[] | undefined;
}

export function buildCanonicalExportPackageV2(
  input: BuildCanonicalExportPackageInput,
): CanonicalExportPackageV2 {
  const exportedAt = new Date().toISOString();

  // Compute canonical deterministic hash of core targeting artifacts
  const payloadToHash = {
    caseId: input.caseMetadata.caseId,
    indicationModuleReleaseId: input.indicationModuleRelease.id,
    slateId: input.targetSlate.id,
    slatePayloadSha256: input.targetSlate.payloadSha256,
    candidates: input.generatedCandidates.map(c => c.id),
  };

  const exportPackageSha256 = sha256Universal(JSON.stringify(payloadToHash));

  const scientificManifestHashes: ScientificManifestHashes = {
    indicationModulePayloadSha256: input.indicationModuleRelease.payloadSha256,
    scientificPolicySha256: input.scientificPolicyReleaseId,
    evidenceLibrarySha256: input.evidenceLibraryReleaseId,
    measurementBundleSha256: input.measurementBundle.payloadSha256,
    slatePayloadSha256: input.targetSlate.payloadSha256,
    exportPackageSha256,
  };

  return {
    schemaVersion: '2.0.0',
    exportedAt,
    caseMetadata: input.caseMetadata,
    caseIndication: input.caseIndication,
    indicationModuleRelease: input.indicationModuleRelease,
    clinicalObjectives: input.clinicalObjectives,
    phenotypeSnapshot: input.phenotypeSnapshot,
    diseaseStageContext: input.diseaseStageContext,
    lesionContexts: input.lesionContexts,
    treatmentContextSnapshot: input.treatmentContextSnapshot,
    measurementBundle: input.measurementBundle,
    measurementProvenance: input.measurementProvenance ?? input.measurementBundle.provenance,
    reliabilityBundle: input.reliabilityBundle,
    evidenceLibraryReleaseId: input.evidenceLibraryReleaseId,
    scientificPolicyReleaseId: input.scientificPolicyReleaseId,
    therapeuticCircuits: input.therapeuticCircuits ?? [],
    targetFamilies: input.targetFamilies,
    generatedCandidates: input.generatedCandidates,
    suppressedCandidates: input.suppressedCandidates,
    targetSlate: input.targetSlate,
    clinicianDecision: input.clinicianDecision,
    finalTarget: input.finalTarget,
    auditHistory: input.auditHistory ?? [],
    scientificManifestHashes,
  };
}

export function validateCanonicalExportPackageV2(pkg: CanonicalExportPackageV2): boolean {
  if (pkg.schemaVersion !== '2.0.0') {
    throw new Error(`Invalid export package schemaVersion: ${pkg.schemaVersion}`);
  }
  if (!pkg.caseMetadata || !pkg.caseMetadata.caseId) {
    throw new Error('Export package must include caseMetadata.caseId');
  }
  if (!pkg.caseIndication || !pkg.caseIndication.id) {
    throw new Error('Export package must include CaseIndication');
  }
  if (!pkg.indicationModuleRelease || !pkg.indicationModuleRelease.id) {
    throw new Error('Export package must include IndicationModuleRelease');
  }
  if (!pkg.targetSlate || !pkg.targetSlate.id) {
    throw new Error('Export package must include TargetSlate');
  }
  if (!pkg.measurementBundle || !pkg.measurementBundle.id) {
    throw new Error('Export package must include MeasurementBundle');
  }
  if (!pkg.scientificManifestHashes || !pkg.scientificManifestHashes.exportPackageSha256) {
    throw new Error('Export package must include complete scientificManifestHashes');
  }
  return true;
}
