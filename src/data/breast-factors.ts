import {
  type DiseasePrognosticFactorTable,
  Biomarker,
  RelationalOperator,
} from "../types/prognostic-factors.d";

export const BreastFactors: DiseasePrognosticFactorTable = {
  [Biomarker.BREAST_M_STAGE]: [
    {
      biomarker: Biomarker.BREAST_M_STAGE,
      reference_group: { type: "categorical", category: "Early Stage" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "M1 (Stage IV)" },
          hazard_ratio: 12.12,
          ci_lower: 5.7,
          ci_upper: 25.76,
          patient_population: "Pooled meta-analysis",
        },
        {
          group: { type: "categorical", category: "Stage III" },
          hazard_ratio: 3.42,
          ci_lower: 2.51,
          ci_upper: 4.67,
          patient_population: "Pooled meta-analysis",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_M_STAGE,
      reference_group: { type: "categorical", category: "No Liver Mets" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Liver Metastasis" },
          hazard_ratio: 2.8,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "HR+/HER2- MBC",
        },
      ],
    },
  ],
  [Biomarker.BREAST_NODAL_STATUS]: [
    {
      biomarker: Biomarker.BREAST_NODAL_STATUS,
      reference_group: { type: "categorical", category: "N0 at diagnosis" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "N+ at diagnosis" },
          hazard_ratio: 2.17,
          ci_lower: 1.09,
          ci_upper: 4.31,
          patient_population: "Survival in metastatic setting",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_NODAL_STATUS,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN_OR_EQUAL,
        value: 0.68,
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN,
            value: 0.68,
          },
          hazard_ratio: 2.156,
          ci_lower: 1.146,
          ci_upper: 4.044,
          patient_population: "pN3a patients",
        },
      ],
    },
  ],
  [Biomarker.BREAST_AGE_AT_DIAGNOSIS]: [
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: {
        type: "range",
        lower_bound: 45,
        upper_bound: 55,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.LESS_THAN_OR_EQUAL,
            value: 35,
            unit: "years",
          },
          hazard_ratio: 1.22,
          ci_lower: 1.0,
          ci_upper: 1.48,
          patient_population: "Metastatic BC",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: {
        type: "range",
        lower_bound: 44,
        upper_bound: 50,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "range",
            lower_bound: 59,
            upper_bound: 90,
            unit: "years",
          },
          hazard_ratio: 3.38,
          ci_lower: 1.51,
          ci_upper: 7.54,
          patient_population: "U-shaped association",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: {
        type: "range",
        lower_bound: 15,
        upper_bound: 49,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
            value: 80,
            unit: "years",
          },
          hazard_ratio: 7.87,
          ci_lower: 3.68,
          ci_upper: 11.81,
          patient_population: "HER2-enriched subtype",
        },
      ],
    },
  ],
  [Biomarker.HISTOLOGICAL_GRADE]: [
    {
      biomarker: Biomarker.HISTOLOGICAL_GRADE,
      reference_group: { type: "categorical", category: "Grade 1" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Grade 3" },
          hazard_ratio: 2.43,
          ci_lower: 1.79,
          ci_upper: 3.3,
          patient_population: "Pooled meta-analysis",
        },
      ],
    },
  ],
  [Biomarker.BREAST_MOLECULAR_SUBTYPE]: [
    {
      biomarker: Biomarker.BREAST_MOLECULAR_SUBTYPE,
      reference_group: { type: "categorical", category: "Luminal A" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Triple-Negative" },
          hazard_ratio: 2.51,
          ci_lower: 1.61,
          ci_upper: 3.92,
          patient_population: "Meta-analysis",
        },
        {
          group: { type: "categorical", category: "HER2-Enriched" },
          hazard_ratio: 2.3,
          ci_lower: 1.34,
          ci_upper: 3.94,
          patient_population: "Meta-analysis",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_MOLECULAR_SUBTYPE,
      reference_group: { type: "categorical", category: "HR+/PR+/HER2-" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Triple-Negative" },
          hazard_ratio: 2.14,
          ci_lower: 1.13,
          ci_upper: 4.03,
          patient_population: "Cohort study",
        },
      ],
    },
  ],
  [Biomarker.BREAST_KI67_PROLIFERATION]: [
    {
      biomarker: Biomarker.BREAST_KI67_PROLIFERATION,
      reference_group: {
        type: "categorical",
        category: "Low (various cutoffs)",
      },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High (various cutoffs)" },
          hazard_ratio: 1.57,
          ci_lower: 1.33,
          ci_upper: 1.87,
          patient_population: "Meta-analysis",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_KI67_PROLIFERATION,
      reference_group: { type: "categorical", category: "Low (<25%)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High (≥25%)" },
          hazard_ratio: 2.05,
          ci_lower: 1.66,
          ci_upper: 2.53,
          patient_population: "Meta-analysis (high cutoff)",
        },
      ],
    },
  ],
  [Biomarker.BREAST_HORMONE_RECEPTORS]: [
    {
      biomarker: Biomarker.BREAST_HORMONE_RECEPTORS,
      reference_group: { type: "categorical", category: "ER-positive" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "ER-negative" },
          hazard_ratio: 1.28,
          ci_lower: 1.06,
          ci_upper: 1.54,
          patient_population: "Pooled meta-analysis",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_HORMONE_RECEPTORS,
      reference_group: { type: "categorical", category: "ER+/PR+" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "ER+/PR-" },
          hazard_ratio: 1.38,
          ci_lower: 1.28,
          ci_upper: 1.47,
          patient_population: "Meta-analysis",
        },
      ],
    },
  ],
  [Biomarker.BREAST_HER2_STATUS]: [
    {
      biomarker: Biomarker.BREAST_HER2_STATUS,
      reference_group: { type: "categorical", category: "HER2-zero" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "HER2-low" },
          hazard_ratio: 0.9,
          ci_lower: 0.85,
          ci_upper: 0.95,
          patient_population: "Meta-analysis",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_HER2_STATUS,
      reference_group: { type: "categorical", category: "HR- (within HER2+)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "HR+" },
          hazard_ratio: 0.61,
          ci_lower: 0.39,
          ci_upper: 0.96,
          patient_population: "Cohort study",
        },
      ],
    },
  ],
  [Biomarker.BREAST_COMORBIDITY]: [
    {
      biomarker: Biomarker.BREAST_COMORBIDITY,
      reference_group: { type: "categorical", category: "Low Index" },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
            value: 3,
          },
          hazard_ratio: 3.29,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "Pooled meta-analysis (BCSS)",
        },
      ],
    },
  ],
};
