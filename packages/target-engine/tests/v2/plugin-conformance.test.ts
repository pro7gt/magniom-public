/**
 * @magniom/target-engine - Plugin Conformance Test Suite
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0 (§137)
 * and Section 22 (Phase 2A Module Plugin Skeletons)
 */

import { describe, it, expect } from 'vitest';
import {
  CANONICAL_PLUGIN_CATALOG,
  validatePluginConformance,
  type IndicationTargetingPlugin,
} from '../../src/index.js';

describe('Plugin Conformance Suite — Phase 2A Skeletons', () => {
  it('should include all 8 canonical plugins in the catalog', () => {
    expect(CANONICAL_PLUGIN_CATALOG).toHaveLength(8);
    const expectedCodes = [
      'MAGNIOM-PLUGIN-MDD',
      'MAGNIOM-PLUGIN-OCD',
      'MAGNIOM-PLUGIN-PAIN-NP',
      'MAGNIOM-PLUGIN-STROKE-MOTOR',
      'MAGNIOM-PLUGIN-STROKE-APHASIA',
      'MAGNIOM-PLUGIN-TBI',
      'MAGNIOM-PLUGIN-PTSD',
      'MAGNIOM-PLUGIN-TINNITUS',
    ];
    const actualCodes = CANONICAL_PLUGIN_CATALOG.map(c => c.code);
    expect(actualCodes).toEqual(expectedCodes);
  });

  describe.each(CANONICAL_PLUGIN_CATALOG)('$name ($code)', ({ name, createInstance }) => {
    it(`should pass strict conformance validation for ${name}`, () => {
      const plugin = createInstance();
      const result = validatePluginConformance(plugin);

      expect(result.errors).toEqual([]);
      expect(result.valid).toBe(true);
    });

    it(`should declare deterministic generators with valid SHA-256 configs in ${name}`, () => {
      const plugin = createInstance();
      const generators = plugin.generators();
      expect(generators.length).toBeGreaterThan(0);

      for (const gen of generators) {
        expect(gen.descriptor.deterministic).toBe(true);
        expect(gen.descriptor.configurationSha256).toMatch(/^[0-9a-f]{64}$/i);
        expect(gen.descriptor.permittedGeometryTypes.length).toBeGreaterThan(0);
        expect(gen.descriptor.semanticVersion).toMatch(/^\d+\.\d+\.\d+/);
      }
    });

    it(`should provide a valid SlateAssemblyProfileDefinition in ${name}`, () => {
      const plugin = createInstance();
      const slate = plugin.slateProfile();
      expect(slate).toBeDefined();
      expect(slate.id).toBeTruthy();
      expect(slate.maxPrimary).toBeGreaterThan(0);
      expect(slate.rolePriorities.length).toBeGreaterThan(0);
    });
  });

  it('should reject a plugin with invalid manifest ID or digest', () => {
    const validPlugin = CANONICAL_PLUGIN_CATALOG[0].createInstance();
    const corruptedPlugin: IndicationTargetingPlugin = {
      manifest: {
        ...validPlugin.manifest,
        id: 'not-a-valid-uuid',
        packageDigestSha256: 'short-hash',
        semanticVersion: 'invalid-semver',
      },
      generators: () => validPlugin.generators(),
      featureProviders: () => validPlugin.featureProviders(),
      slateProfile: () => validPlugin.slateProfile(),
      validateModuleContext: ctx => validPlugin.validateModuleContext(ctx),
    };

    const result = validatePluginConformance(corruptedPlugin);
    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.includes('valid UUID'))).toBe(true);
    expect(result.errors.some(e => e.includes('64-character hex'))).toBe(true);
    expect(result.errors.some(e => e.includes('Invalid semantic version'))).toBe(true);
  });
});
