# Golden Case 01: Evidence Only MDD Target Selection

## Purpose
Prove connectomics is optional. In the absence of an MRI / connectome run, Magniom must cleanly generate a valid Clinical Mode Target Slate using standard evidence priors (Primary 1 = `CAND-EVIDENCE-LDLPFC`).

## Clinical Context
- **Condition**: Severe MDD without psychotic features
- **Dominant Symptom**: Severe dysphoric burden (priority weight 0.90)
- **Imaging**: Null (no resting-state fMRI)

## Expected Behaviour
- Primary 1: Established Left Prefrontal Evidence Anchor (`[-38, 44, 30]`, Tier T1)
- Primary 2/3: None
- Additional A/B: None
- Personalisation: `not_available`
