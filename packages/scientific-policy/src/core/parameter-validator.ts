/**
 * MAGNIOM Policy Parameter Bounds Validator
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0 (§90-95, §157)
 * Strictly verifies parameter bounds without silent clamping.
 */

import type { ScientificPolicyParameter } from '@magniom/domain';
import { formatClinicianErrorMessage } from '../errors/failure-codes.js';

export interface ParameterValidationResult {
  readonly valid: boolean;
  readonly reasonCode?: 'POLICY_PARAMETER_OUT_OF_BOUNDS' | 'POLICY_PARAMETER_MISSING';
  readonly message?: string;
  readonly violations: readonly {
    readonly parameterCode: string;
    readonly namespace: string;
    readonly value: unknown;
    readonly message: string;
  }[];
}

export function evaluatePolicyParameterBounds(
  parameters: Readonly<Record<string, unknown>>,
  definitions: readonly ScientificPolicyParameter[],
): ParameterValidationResult {
  const violations: {
    parameterCode: string;
    namespace: string;
    value: unknown;
    message: string;
  }[] = [];

  for (const def of definitions) {
    const val = parameters[def.code];

    if (val === undefined) {
      if (def.defaultValue === undefined) {
        violations.push({
          parameterCode: def.code,
          namespace: def.namespace,
          value: undefined,
          message: formatClinicianErrorMessage('POLICY_PARAMETER_MISSING', {
            paramCode: def.code,
          }),
        });
      }
      continue;
    }

    if (def.valueType === 'number') {
      if (typeof val !== 'number' || Number.isNaN(val)) {
        violations.push({
          parameterCode: def.code,
          namespace: def.namespace,
          value: val,
          message: `Parameter '${def.code}' must be a number, got ${typeof val}`,
        });
        continue;
      }

      if (def.bounds?.minValue !== undefined && val < def.bounds.minValue) {
        violations.push({
          parameterCode: def.code,
          namespace: def.namespace,
          value: val,
          message: formatClinicianErrorMessage('POLICY_PARAMETER_OUT_OF_BOUNDS', {
            paramCode: def.code,
            value: val,
            min: def.bounds.minValue,
            max: def.bounds.maxValue ?? 'unbounded',
          }),
        });
      }

      if (def.bounds?.maxValue !== undefined && val > def.bounds.maxValue) {
        violations.push({
          parameterCode: def.code,
          namespace: def.namespace,
          value: val,
          message: formatClinicianErrorMessage('POLICY_PARAMETER_OUT_OF_BOUNDS', {
            paramCode: def.code,
            value: val,
            min: def.bounds.minValue ?? 'unbounded',
            max: def.bounds.maxValue,
          }),
        });
      }
    } else if (def.valueType === 'string') {
      if (typeof val !== 'string') {
        violations.push({
          parameterCode: def.code,
          namespace: def.namespace,
          value: val,
          message: `Parameter '${def.code}' must be a string, got ${typeof val}`,
        });
        continue;
      }

      if (def.bounds?.allowedValues && !def.bounds.allowedValues.includes(val)) {
        violations.push({
          parameterCode: def.code,
          namespace: def.namespace,
          value: val,
          message: `Parameter '${def.code}' value '${val}' is not in allowed set: [${def.bounds.allowedValues.join(', ')}]`,
        });
      }
    }
  }

  if (violations.length > 0) {
    const isMissing = violations.some(v => v.message.includes('missing'));
    const reasonCode = isMissing ? 'POLICY_PARAMETER_MISSING' : 'POLICY_PARAMETER_OUT_OF_BOUNDS';
    return {
      valid: false,
      reasonCode,
      message: violations.map(v => v.message).join('; '),
      violations,
    };
  }

  return {
    valid: true,
    violations: [],
  };
}
