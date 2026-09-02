# Golden Case 03: Reliable but Low Incremental Value

## Purpose
Prove that available personalisation != adopted personalisation. When resting-state fMRI is reliable but provides insufficient mechanistic gain (+0.06 vs minimum required threshold 0.10), Magniom keeps the evidence anchor as Primary 1 and suppresses the personalised candidate with `LOW_INCREMENTAL_VALUE`.

## Expected Behaviour
- Primary 1: Evidence baseline `CAND-EVIDENCE-LDLPFC` (`[-38, 44, 30]`)
- Suppressed: Personalised candidate `CAND-CONVERGENT-G03` (suppression reason: `LOW_INCREMENTAL_VALUE`)
- Personalisation: `limited`
