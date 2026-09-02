/**
 * @magniom/target-engine
 * Deterministic 12-stage candidate generation and Target Slate assembly.
 * Conforms to MAGNIOM-Target Engine & Ranking Algorithm Specification v1.0.
 * Runs completely offline without database or internet connectivity.
 */

export * from './gates/index.js';
export * from './candidate-generation/index.js';
export * from './features/index.js';
export * from './ranking/index.js';
export * from './slate/index.js';
export * from './validation/index.js';
export * from './spatial/index.js';
export * from './persistence.js';
export * from './staleness.js';
export * from './engine.js';

