/**
 * @magniom/target-engine - Plugin SDK: Plugin Conformance Validator
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§33-34, 137)
 * and Section 23 (Plugin Contract Tests)
 */

import type { IndicationTargetingPlugin } from './plugin.js';

export interface PluginConformanceResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SHA256_HEX_REGEX = /^[0-9a-f]{64}$/i;
const SEMVER_REGEX = /^\d+\.\d+\.\d+(-[0-9a-z.-]+)?(\+[0-9a-z.-]+)?$/i;

export function validatePluginConformance(
  plugin: IndicationTargetingPlugin,
): PluginConformanceResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const manifest = plugin.manifest;
  if (!manifest) {
    return { valid: false, errors: ['Plugin manifest is missing.'], warnings: [] };
  }

  // 1. Manifest ID
  if (!manifest.id || !UUID_REGEX.test(manifest.id)) {
    errors.push(`Plugin manifest id must be a valid UUID; received: ${manifest.id}`);
  }

  // 2. Manifest Code
  if (!manifest.code || manifest.code.trim().length === 0) {
    errors.push('Plugin manifest code must not be empty.');
  } else if (!manifest.code.startsWith('MAGNIOM-PLUGIN-')) {
    warnings.push(
      `Plugin manifest code '${manifest.code}' does not use canonical 'MAGNIOM-PLUGIN-*' prefix.`,
    );
  }

  // 3. Semantic Version
  if (!manifest.semanticVersion || !SEMVER_REGEX.test(manifest.semanticVersion)) {
    errors.push(`Invalid semantic version for plugin: ${manifest.semanticVersion}`);
  }

  // 4. Digests
  if (!manifest.packageDigestSha256 || !SHA256_HEX_REGEX.test(manifest.packageDigestSha256)) {
    errors.push('Plugin packageDigestSha256 must be a valid 64-character hex SHA-256 hash.');
  }

  if (
    !manifest.scientificConfigurationSha256 ||
    !SHA256_HEX_REGEX.test(manifest.scientificConfigurationSha256)
  ) {
    errors.push(
      'Plugin scientificConfigurationSha256 must be a valid 64-character hex SHA-256 hash.',
    );
  }

  // 5. Permitted Modes
  if (!manifest.permittedModes || manifest.permittedModes.length === 0) {
    errors.push('Plugin must declare at least one permitted mode.');
  }

  // 6. Generators
  if (typeof plugin.generators !== 'function') {
    errors.push(`Plugin ${manifest.code} must implement a generators() method.`);
  } else {
    const generators = plugin.generators();
    if (!generators || generators.length === 0) {
      warnings.push(`Plugin ${manifest.code} defines zero candidate generators.`);
    } else {
      for (const gen of generators) {
        const desc = gen.descriptor;
        if (!desc) {
          errors.push(`Generator in plugin ${manifest.code} lacks a descriptor.`);
          continue;
        }
        if (!desc.id || desc.id.trim().length === 0) {
          errors.push(`Generator descriptor in plugin ${manifest.code} has empty id.`);
        }
        if (!desc.code || desc.code.trim().length === 0) {
          errors.push(`Generator descriptor in plugin ${manifest.code} has empty code.`);
        }
        if (!desc.deterministic) {
          errors.push(`Generator ${desc.code} must declare deterministic: true.`);
        }
        if (!desc.semanticVersion || !SEMVER_REGEX.test(desc.semanticVersion)) {
          errors.push(
            `Generator ${desc.code} has invalid semanticVersion: ${desc.semanticVersion}`,
          );
        }
        if (!desc.configurationSha256 || !SHA256_HEX_REGEX.test(desc.configurationSha256)) {
          errors.push(
            `Generator ${desc.code} must have a valid 64-character configurationSha256 hash.`,
          );
        }
        if (!desc.permittedGeometryTypes || desc.permittedGeometryTypes.length === 0) {
          errors.push(`Generator ${desc.code} must declare permitted geometry types.`);
        }
        if (!desc.permittedModes || desc.permittedModes.length === 0) {
          errors.push(`Generator ${desc.code} must declare at least one permitted mode.`);
        }
        if (!desc.baselineRelationship) {
          errors.push(`Generator ${desc.code} must declare baselineRelationship.`);
        }
        if (!desc.generatorFailurePolicy) {
          errors.push(`Generator ${desc.code} must declare generatorFailurePolicy.`);
        }
      }
    }
  }

  // 7. Slate Profile
  if (typeof plugin.slateProfile !== 'function') {
    errors.push(`Plugin ${manifest.code} must implement a slateProfile() method.`);
  } else {
    const slateProfile = plugin.slateProfile();
    if (!slateProfile) {
      errors.push(`Plugin ${manifest.code} must provide a SlateAssemblyProfileDefinition.`);
    } else if (!slateProfile.id || slateProfile.id.trim().length === 0) {
      errors.push(`Plugin ${manifest.code} SlateAssemblyProfileDefinition has empty id.`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
