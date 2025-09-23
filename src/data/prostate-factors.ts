import {
  type DiseasePrognosticFactorTable,
  Biomarker,
  RelationalOperator,
} from "../types/prognostic-factors.d";

export const ProstateFactors: DiseasePrognosticFactorTable = {
  [Biomarker.ECOG_PS]: [
    {
      biomarker: Biomarker.ECOG_PS,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN,
        value: 2,
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
            value: 2,
          },
          hazard_ratio: 2.1,
          ci_lower: 1.87,
          ci_upper: 2.37,
          patient_population: "mCRPC",
        },
      ],
    },
    {
      biomarker: Biomarker.ECOG_PS,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN,
        value: 1,
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
            value: 1,
          },
          hazard_ratio: 1.68,
          ci_lower: 1.44,
          ci_upper: 1.94,
          patient_population: "mCRPC",
        },
      ],
    },
  ],
  [Biomarker.BREAST_AGE_AT_DIAGNOSIS]: [
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN,
        value: 60,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN,
            value: 70,
            unit: "years",
          },
          hazard_ratio: 2.8,
          ci_lower: 1.22,
          ci_upper: 6.5,
          patient_population: "High-Risk Localized",
        },
      ],
    },
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN_OR_EQUAL,
        value: 70,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN,
            value: 70,
            unit: "years",
          },
          hazard_ratio: 1.56,
          ci_lower: 1.43,
          ci_upper: 1.7,
          patient_population: "Locally Advanced",
        },
      ],
    },
  ],
  [Biomarker.HISTOLOGICAL_GRADE]: [
    {
      biomarker: Biomarker.HISTOLOGICAL_GRADE,
      reference_group: { type: "categorical", category: "lower" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "ISUP Grade 5 (GS 9-10)" },
          hazard_ratio: 2.04,
          ci_lower: 1.12,
          ci_upper: 3.72,
          patient_population: "De Novo Oligometastatic",
        },
      ],
    },
  ],
  [Biomarker.PROSTATE_TNM_STAGE]: [
    {
      biomarker: Biomarker.PROSTATE_TNM_STAGE,
      reference_group: { type: "categorical", category: "T1/T2" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "T3/T4" },
          hazard_ratio: 1.49,
          ci_lower: 1.135,
          ci_upper: 1.958,
          patient_population: "PCa w/ Lung Mets",
        },
        {
          group: { type: "categorical", category: "T3/T4" },
          hazard_ratio: 1.785,
          ci_lower: 1.007,
          ci_upper: 3.163,
          patient_population: "PCa w/ Brain Mets",
        },
      ],
    },
    {
      biomarker: Biomarker.PROSTATE_TNM_STAGE,
      reference_group: { type: "categorical", category: "No distant mets" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Non-regional LN" },
          hazard_ratio: 2.15,
          ci_lower: 1.11,
          ci_upper: 4.16,
          patient_population: "De Novo Oligometastatic",
        },
      ],
    },
  ],
  [Biomarker.METASTATIC_VOLUME]: [
    {
      biomarker: Biomarker.METASTATIC_VOLUME,
      reference_group: { type: "categorical", category: "Low Volume" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High Volume" },
          hazard_ratio: 1.92,
          ci_lower: 1.17,
          ci_upper: 3.13,
          patient_population: "Metastatic PCa",
        },
      ],
    },
  ],
  [Biomarker.METASTATIC_SITE]: [
    {
      biomarker: Biomarker.METASTATIC_SITE,
      reference_group: { type: "categorical", category: "Bone +/- LN Mets" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Lung Mets" },
          hazard_ratio: 1.14,
          ci_lower: 1.04,
          ci_upper: 1.25,
          patient_population: "mCRPC",
        },
      ],
    },
    {
      biomarker: Biomarker.METASTATIC_SITE,
      reference_group: { type: "categorical", category: "Lung Mets" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Liver Mets" },
          hazard_ratio: 1.52,
          ci_lower: 1.35,
          ci_upper: 1.73,
          patient_population: "mCRPC",
        },
      ],
    },
  ],
  [Biomarker.PROSTATE_PSA_LEVEL]: [
    {
      biomarker: Biomarker.PROSTATE_PSA_LEVEL,
      reference_group: { type: "categorical", category: "4.1-10 ng/mL" },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN,
            value: 80.1,
            unit: "ng/mL",
          },
          hazard_ratio: 1.544,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "Metastatic PCa",
        },
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.LESS_THAN,
            value: 4.0,
            unit: "ng/mL",
          },
          hazard_ratio: 1.331,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "Metastatic PCa",
        },
      ],
    },
    {
      biomarker: Biomarker.PROSTATE_PSA_LEVEL,
      reference_group: {
        type: "categorical",
        category: "Higher PSA at RT start",
      },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Lower PSA" },
          hazard_ratio: 0.51,
          ci_lower: 0.33,
          ci_upper: 0.78,
          patient_population: "Metastatic PCa",
        },
      ],
    },
  ],
  [Biomarker.PROSTATE_ALP]: [
    {
      biomarker: Biomarker.PROSTATE_ALP,
      reference_group: { type: "categorical", category: "Low ALP" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High" },
          hazard_ratio: 1.74,
          ci_lower: 1.47,
          ci_upper: 2.06,
          patient_population: "Prostate Cancer",
        },
      ],
    },
    {
      biomarker: Biomarker.PROSTATE_ALP,
      reference_group: { type: "categorical", category: "Normal ALP" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High" },
          hazard_ratio: 2.136,
          ci_lower: 1.38,
          ci_upper: 3.31,
          patient_population: "Metastatic PCa",
        },
      ],
    },
  ],
  [Biomarker.PROSTATE_LDH]: [
    {
      biomarker: Biomarker.PROSTATE_LDH,
      reference_group: { type: "categorical", category: "Low LDH" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High" },
          hazard_ratio: 2.25,
          ci_lower: 1.78,
          ci_upper: 2.84,
          patient_population: "mHSPC",
        },
      ],
    },
    {
      biomarker: Biomarker.PROSTATE_LDH,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN,
        value: 230,
        unit: "IU/L",
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
            value: 230,
            unit: "IU/L",
          },
          hazard_ratio: 8.53,
          ci_lower: 1.83,
          ci_upper: 39.7,
          patient_population: "cN1 Prostate Cancer",
        },
      ],
    },
  ],
  [Biomarker.PROSTATE_HEMOGLOBIN]: [
    {
      biomarker: Biomarker.PROSTATE_HEMOGLOBIN,
      reference_group: { type: "categorical", category: "Normal Hb" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Low" },
          hazard_ratio: 1.21,
          ci_lower: 1.15,
          ci_upper: 1.29,
          patient_population: "mHSPC",
        },
      ],
    },
    {
      biomarker: Biomarker.PROSTATE_HEMOGLOBIN,
      reference_group: { type: "categorical", category: "Low Hb (Q5 vs. Q1)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High" },
          hazard_ratio: 0.42,
          ci_lower: 0.33,
          ci_upper: 0.52,
          patient_population: "De Novo mCSPC",
        },
      ],
    },
  ],
  [Biomarker.PROSTATE_ALBUMIN]: [
    {
      biomarker: Biomarker.PROSTATE_ALBUMIN,
      reference_group: {
        type: "categorical",
        category: "Low Albumin (Q5 vs. Q1)",
      },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High" },
          hazard_ratio: 0.48,
          ci_lower: 0.36,
          ci_upper: 0.63,
          patient_population: "De Novo mCSPC",
        },
      ],
    },
    {
      biomarker: Biomarker.PROSTATE_ALBUMIN,
      reference_group: { type: "categorical", category: "High AGR (CSS)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Low" },
          hazard_ratio: 2.43,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "Metastatic PCa",
        },
      ],
    },
  ],
};
