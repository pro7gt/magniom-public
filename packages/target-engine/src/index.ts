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

// Phase 2: Target Engine Core v2 exports
export * from './core/engine-v2.js';
export * from './core/context.js';
export * from './core/manifest.js';
export * from './core/geometry-helper.js';
export * from './sdk/plugin.js';
export * from './sdk/generator.js';
export * from './sdk/conformance.js';
export * from './registry/generator-registry.js';
export * from './gates/v2/evaluator.js';
export * from './comparison/domain-manager.js';
export * from './comparison/ranking-orchestrator.js';
export * from './comparison/ties.js';
export * from './refinement/evaluator.js';
export * from './refinement/counterfactual.js';
export * from './redundancy/v2/comparator.js';
export * from './redundancy/v2/suppression.js';
export * from './slate/v2/assembler.js';
export * from './slate/v2/explanation.js';
export * from './abstention/v2/manager.js';
export * from './plugins/index.js';
export * from './orchestrator/synthetic-vertical-slice.js';
export * from './algorithms/cash-zalesky-clustering.js';
export * from './algorithms/seguin-pathway-routing.js';
export * from './registry/method-manifest-registry.js';
