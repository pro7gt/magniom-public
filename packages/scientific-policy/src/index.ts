/**
 * @magniom/scientific-policy
 * Canonical Scientific Policy & Algorithm Configuration Module v2.0
 * Conforms to MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0
 */

export * from './policy.js';
export * from './policy-hasher.js';
export * from './default-policy.js';

// Errors & Messaging (§159-160)
export * from './errors/failure-codes.js';

// Core Evaluators (§10-26, §90-95, §123-128)
export * from './core/compatibility-evaluator.js';
export * from './core/parameter-validator.js';
export * from './core/manifest-signer.js';

// Prohibitions & Invariants (§103-109)
export * from './rules/prohibitions-evaluator.js';

// Impact Analysis (§136-143, §196)
export * from './impact/change-impact-analyzer.js';

// Initial Indication Policies (§184-192)
export * from './indications/mdd-policy.js';
export * from './indications/pain-policy.js';
export * from './indications/stroke-motor-policy.js';
export * from './indications/stroke-aphasia-policy.js';
export * from './indications/ocd-policy.js';
export * from './indications/tbi-policy.js';
export * from './indications/ptsd-policy.js';
export * from './indications/tinnitus-policy.js';
export * from './indications/canonical-v2-policy-release.js';
