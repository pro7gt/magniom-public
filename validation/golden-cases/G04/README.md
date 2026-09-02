# Golden Case 04: Dramatic but Unreliable Connectome

## Purpose
Demonstrate that extreme connectivity concordance (0.95) must NOT overpower reliability gates. When fMRI reliability is low (reliability score 0.42 < 0.70 threshold due to excessive motion FD=0.38mm), the personalised target is suppressed with `LOW_RELIABILITY` and the system safely defaults to standard evidence-only targeting.

## Expected Behaviour
- Primary 1: Standard evidence prior `CAND-EVIDENCE-LDLPFC` (`[-38, 44, 30]`)
- Suppressed: Personalised candidate `CAND-UNRELIABLE-G04` (suppression reason: `LOW_RELIABILITY`)
- Warning: `LIMITED_FC_RELIABILITY`
- Personalisation: `ineligible`
