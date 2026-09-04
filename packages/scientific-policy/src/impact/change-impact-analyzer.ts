/**
 * MAGNIOM Scientific Policy Change Impact Analyzer
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§136-143, §196)
 */

import type {
  ScientificPolicyReleaseV2,
  ScientificImpactReport,
  ScientificChangeClassification,
} from '@magniom/domain';

export function analyzePolicyChangeImpact(
  fromPolicy: ScientificPolicyReleaseV2,
  toPolicy: ScientificPolicyReleaseV2,
): ScientificImpactReport {
  const affectedIndicationModuleIds = new Set<string>();
  const affectedEvidencePathIds = new Set<string>();
  const capabilityQualificationChanges: {
    moduleCode: string;
    capabilityCode: string;
    previousState: string;
    newState: string;
  }[] = [];
  const parameterDeltas: {
    parameterCode: string;
    oldValue: unknown;
    newValue: unknown;
    unit?: string;
  }[] = [];

  let classification: ScientificChangeClassification = 'PARAMETER';

  // 1. Check Indication Module additions / removals / status changes
  const fromBindings = new Map(
    fromPolicy.indicationPolicyBindings.map(b => [b.indicationModuleReleaseId, b]),
  );
  const toBindings = new Map(
    toPolicy.indicationPolicyBindings.map(b => [b.indicationModuleReleaseId, b]),
  );

  for (const [id, toB] of toBindings) {
    const fromB = fromBindings.get(id);
    if (!fromB) {
      affectedIndicationModuleIds.add(id);
      classification = 'INDICATION_MODULE';
    } else if (fromB.modulePermission !== toB.modulePermission) {
      affectedIndicationModuleIds.add(id);
      classification = 'INDICATION_MODULE';
    }
  }

  for (const [id] of fromBindings) {
    if (!toBindings.has(id)) {
      affectedIndicationModuleIds.add(id);
      classification = 'INDICATION_MODULE';
    }
  }

  // 2. Check Evidence Path Permission changes
  for (const [id, toB] of toBindings) {
    const fromB = fromBindings.get(id);
    if (!fromB) continue;

    const fromPaths = new Map(fromB.evidencePathPermissions.map(p => [p.evidencePathId, p]));
    const toPaths = new Map(toB.evidencePathPermissions.map(p => [p.evidencePathId, p]));

    for (const [pathId, toP] of toPaths) {
      const fromP = fromPaths.get(pathId);
      if (!fromP) {
        affectedEvidencePathIds.add(pathId);
        affectedIndicationModuleIds.add(id);
        if (classification !== 'INDICATION_MODULE') classification = 'EVIDENCE_PATH';
      } else if (
        fromP.standalonePrimary !== toP.standalonePrimary ||
        fromP.permittedModes.join(',') !== toP.permittedModes.join(',')
      ) {
        affectedEvidencePathIds.add(pathId);
        affectedIndicationModuleIds.add(id);
        if (classification !== 'INDICATION_MODULE') classification = 'EVIDENCE_PATH';
      }
    }
  }

  // 3. Check Measurement Capability changes
  for (const [id, toB] of toBindings) {
    const fromB = fromBindings.get(id);
    if (!fromB) continue;

    const fromCaps = new Map(fromB.measurementPolicy.requirements.map(c => [c.capabilityCode, c]));
    const toCaps = new Map(toB.measurementPolicy.requirements.map(c => [c.capabilityCode, c]));

    for (const [capCode, toC] of toCaps) {
      const fromC = fromCaps.get(capCode);
      if (!fromC) {
        capabilityQualificationChanges.push({
          moduleCode: id,
          capabilityCode: capCode,
          previousState: 'absent',
          newState: toC.requirement,
        });
        affectedIndicationModuleIds.add(id);
        if (classification !== 'INDICATION_MODULE' && classification !== 'EVIDENCE_PATH') {
          classification = 'MEASUREMENT_CAPABILITY';
        }
      } else if (fromC.requirement !== toC.requirement) {
        capabilityQualificationChanges.push({
          moduleCode: id,
          capabilityCode: capCode,
          previousState: fromC.requirement,
          newState: toC.requirement,
        });
        affectedIndicationModuleIds.add(id);
        if (classification !== 'INDICATION_MODULE' && classification !== 'EVIDENCE_PATH') {
          classification = 'MEASUREMENT_CAPABILITY';
        }
      }
    }
  }

  // 4. Check Parameter Deltas
  const allParamKeys = Array.from(
    new Set([...Object.keys(fromPolicy.parameterValues), ...Object.keys(toPolicy.parameterValues)]),
  );

  for (const key of allParamKeys) {
    const oldVal = fromPolicy.parameterValues[key];
    const newVal = toPolicy.parameterValues[key];

    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      const def = toPolicy.parameterDefinitions.find(d => d.code === key);
      const delta: {
        parameterCode: string;
        oldValue: unknown;
        newValue: unknown;
        unit?: string;
      } = {
        parameterCode: key,
        oldValue: oldVal,
        newValue: newVal,
      };
      if (def?.bounds?.unit) {
        delta.unit = def.bounds.unit;
      }
      parameterDeltas.push(delta);
    }
  }

  const clinicalReviewRequired =
    classification === 'INDICATION_MODULE' ||
    classification === 'EVIDENCE_PATH' ||
    capabilityQualificationChanges.some(
      c => c.previousState === 'research_only' && c.newState === 'required',
    );

  return {
    fromReleaseId: fromPolicy.id,
    toReleaseId: toPolicy.id,
    classification,
    affectedIndicationModuleIds: Array.from(affectedIndicationModuleIds),
    affectedEvidencePathIds: Array.from(affectedEvidencePathIds),
    capabilityQualificationChanges,
    parameterDeltas,
    clinicalReviewRequired,
    generatedAt: new Date().toISOString(),
  };
}
