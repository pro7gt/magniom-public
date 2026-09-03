/**
 * @magniom/target-engine - Canonical Indication Plugins Barrel Export
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v2.0
 * and Phase 2A (Module Plugin Skeletons)
 */

export * from './mdd/mdd-plugin.js';
export * from './ocd/ocd-plugin.js';
export * from './neuropathic-pain/neuropathic-pain-plugin.js';
export * from './stroke-motor/stroke-motor-plugin.js';
export * from './stroke-aphasia/stroke-aphasia-plugin.js';
export * from './tbi/tbi-plugin.js';
export * from './ptsd/ptsd-plugin.js';
export * from './tinnitus/tinnitus-plugin.js';

import { MDDPlugin } from './mdd/mdd-plugin.js';
import { OCDPlugin } from './ocd/ocd-plugin.js';
import { NeuropathicPainPlugin } from './neuropathic-pain/neuropathic-pain-plugin.js';
import { StrokeMotorPlugin } from './stroke-motor/stroke-motor-plugin.js';
import { StrokeAphasiaPlugin } from './stroke-aphasia/stroke-aphasia-plugin.js';
import { TBIPlugin } from './tbi/tbi-plugin.js';
import { PTSDPlugin } from './ptsd/ptsd-plugin.js';
import { TinnitusPlugin } from './tinnitus/tinnitus-plugin.js';
import type { IndicationTargetingPlugin } from '../sdk/plugin.js';

export interface CanonicalPluginEntry {
  readonly code: string;
  readonly name: string;
  readonly indication: string;
  readonly createInstance: () => IndicationTargetingPlugin;
}

export const CANONICAL_PLUGIN_CATALOG: readonly CanonicalPluginEntry[] = [
  {
    code: 'MAGNIOM-PLUGIN-MDD',
    name: 'MDDPlugin',
    indication: 'MDD',
    createInstance: () => new MDDPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-OCD',
    name: 'OCDPlugin',
    indication: 'OCD',
    createInstance: () => new OCDPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-PAIN-NP',
    name: 'NeuropathicPainPlugin',
    indication: 'NEUROPATHIC_PAIN',
    createInstance: () => new NeuropathicPainPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-STROKE-MOTOR',
    name: 'StrokeMotorPlugin',
    indication: 'STROKE_MOTOR',
    createInstance: () => new StrokeMotorPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-STROKE-APHASIA',
    name: 'StrokeAphasiaPlugin',
    indication: 'STROKE_APHASIA',
    createInstance: () => new StrokeAphasiaPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-TBI',
    name: 'TBIPlugin',
    indication: 'TBI',
    createInstance: () => new TBIPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-PTSD',
    name: 'PTSDPlugin',
    indication: 'PTSD',
    createInstance: () => new PTSDPlugin(),
  },
  {
    code: 'MAGNIOM-PLUGIN-TINNITUS',
    name: 'TinnitusPlugin',
    indication: 'TINNITUS',
    createInstance: () => new TinnitusPlugin(),
  },
];
