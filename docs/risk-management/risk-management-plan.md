# Risk Management Plan (ISO 14971:2019)

**Standard Reference:** ISO 14971:2019 / ISO/TR 24971:2020  
**Document Status:** Controlled Risk Management Document

---

## 1. Risk Evaluation & Acceptability Criteria

Risk is evaluated as the product of **Severity of Harm** and **Probability of Occurrence of Harm**.

### Severity Scale

1. **Negligible:** Inconvenience, slight delay in non-urgent clinical assessment.
2. **Minor:** Suboptimal target recommendation resulting in temporary lack of efficacy without injury.
3. **Serious:** Delivery of stimulation to wrong anatomical structure causing transient neurological side effect (headache, muscle contraction).
4. **Critical:** Severe adverse event (e.g. seizure induction due to inappropriate target location or excessive intensity).
5. **Catastrophic:** Permanent impairment or fatality.

### Probability Scale

- **P5 (Frequent):** >= 1 in 100 cases
- **P4 (Probable):** 1 in 100 to 1 in 1,000 cases
- **P3 (Occasional):** 1 in 1,000 to 1 in 10,000 cases
- **P2 (Remote):** 1 in 10,000 to 1 in 100,000 cases
- **P1 (Improbable):** < 1 in 100,000 cases

---

## 2. Risk Control Hierarchy

1. **Inherent Safety by Design:** Pure deterministic calculation core, strict evidence ceilings, mathematical bounds checking.
2. **Protective Measures in Software:** Automated QC filtering (motion censoring), coordinate validation checksums, multi-tenant RLS isolation.
3. **Information for Safety & User Interface Safeguards:** Prominent evidence tier badges, automation bias prevention (no preselected targets), mandatory counterfactual review.
