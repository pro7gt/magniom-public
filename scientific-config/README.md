# Magniom Scientific Configuration

Pinned Scientific Policy releases (`ScientificPolicyReleaseV2`) and algorithm configuration manifests governing multi-indication neuromodulation targeting.

## Canonical Releases

- **v2.0.0 (Canonical)**: `scientific-config/releases/scientific-policy-v2.0.0.json`
  - Conforms to: [`MAGNIOM-Scientific Policy & Algorithm Configuration Specification v2.0.md`](file:///home/owner/Downloads/Magniom/public/guides/MAGNIOM-Scientific%20Policy%20&%20Algorithm%20Configuration%20Specification%20v2.0.md)
  - Release Code: `MAGNIOM-POLICY-V2.0.0`
  - Lifecycle: `active`
  - Coverage: 8 Indication Module Bindings (MDD, Neuropathic Pain, Stroke Motor, Stroke Aphasia, OCD, TBI, PTSD, Tinnitus)
  - Features: Positive fail-closed whitelisting, 13 bounded parameters, 24 global prohibitions, 4-role cryptographic approvals, Ed25519 signatures, and dual SHA-256 manifests.

## Historical Baselines

- **v1.0.0 (Preserved under IEC 62304 §5.8)**: `scientific-config/releases/scientific-policy-v1.0.0.json`
  - Conforms to: `MAGNIOM-Scientific Policy & Algorithm Configuration Specification v1.0`
  - Preserved for regulatory traceability and MDD v1 backwards regression parity.
