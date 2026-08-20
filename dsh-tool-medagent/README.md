# dsh-tool-medagent

**Medical AI Agent Plugin for DeepSeek Harness (DSH)**

A comprehensive medical AI toolkit targeting the $300 billion medical AI market. Provides evidence-based clinical decision support, automated EHR coding, quality control, drug safety checking, lab interpretation, treatment pathways, patient risk stratification, and medical documentation generation.

## Installation

```bash
npm install
npm run build
```

## Version

01.0

## Tools

### 1clinical_decision_support

Clinical Decision SupportEvidence-based differential diagnosis with probability ranking, treatment recommendations by priority, and urgency assessment from patient case data.

**Input:** JSON object with patient demographics, symptoms, history, vitals, and test results.
**Output:** Ranked differential diagnoses with ICD-10 hints, treatment recommendations, urgency level, confidence score, missing info alerts, and follow-up plan.

### 2ehr_coder

EHR CodingAssists with ICD-10 CPT SNOMED and DRG coding from clinical notes. Includes documentation gap analysis specificity suggestions and compliance flag detection.

**Input:** Clinical notes text and target coding system.
**Output:** Suggested codes with confidence documentation gaps compliance flags coding score and specificity improvement suggestions.

### 3quality_controller

Quality ControllerEvaluates medical record quality against configurable standards. Scores completeness medical necessity timeliness and clinical contentProvides benchmark comparison and improvement actions.

**Input:** Medical record text and JSON array of quality standards.
**Output:** Overall quality score (0-100) grade breakdown by criterion critical findings improvement actions and compliance status.

### 4. drug_safety_checker

Drug Safety Checker

Checks for drug-drug interactions (from established databases) renal dosing adjustments allergy cross-reactivity and generates monitoring recommendations.

**Input:** Medication list JSON allergies JSON and lab values JSON.
**Output:** Interaction severity classification dose alerts allergy cross-reactivity warnings monitoring recommendations and overall safety score.

### 5. lab_interpreter

Laboratory Result Interpreter

Flags abnormal and critical lab values provides clinical significance interpretation compares trends with previous values and suggests follow-up actions.

**Input:** Lab results JSON array and patient context JSON.
**Output:** Flagged abnormalities trend analysis clinical correlation and suggested follow-up actions.

### 6. treatment_pathway

Treatment Pathway Generator

Creates evidence-based personalized treatment pathways for common diagnoses including Diabetes Mellitus Hypertension and Community-Acquired Pneumonia.

**Input:** Diagnosis string patient profile JSON and guidelines JSON array.
**Output:** Stage-based milestones with criteria to advance alternative approaches expected outcomes with probabilities and risk factors.

### 7. patient_risk_stratifier

Patient Risk Stratifier

Calculates validated risk scores (ASCVD Pooled Cohort Diabetes Risk) identifies modifiable vs non-modifiable factors and provides prevention recommendations.

**Input:** Patient data JSON and risk models JSON array.
**Output:** Risk scores with categories risk factor breakdown prevention recommendations monitoring plan and referral suggestions.

### 8. medical_documentation

Medical Documentation Generator

Generates structured medical documents including SOAP notes discharge summaries referral letters and progress notes from encounter data.

**Input:** Encounter data JSON and document type (soapdischargereferralprogress).
**Output:** Properly formatted medical document with all required sections.

## Disclaimer

All tool outputs contain the following disclaimer:

** 本建议仅供参考，不可替代专业医疗判断 **

This plugin is intended as a clinical decision *support* tool. All recommendations must be reviewed and validated by qualified healthcare professionals before making clinical decisions.

## Architecture

```
dsh-tool-medagent
├── cordis.yml          # DSH plugin manifest
├── package.json        # NPM package configuration
├── tsconfig.json       # TypeScript configuration
├── src/
│   └── index.ts        # All 8 tools implementation (~1400 lines)
└── lib/                # Compiled output
```

## License

MIT

## Author

chengganping-ship-it
