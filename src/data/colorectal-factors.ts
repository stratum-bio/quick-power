import {
  type DiseasePrognosticFactorTable,
  Biomarker,
  RelationalOperator,
} from "../types/prognostic-factors.d";

export const ColorectalFactors: DiseasePrognosticFactorTable = {
  [Biomarker.BREAST_AGE_AT_DIAGNOSIS]: [
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN,
        value: 70,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
            value: 70,
            unit: "years",
          },
          hazard_ratio: 1.32,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "Metastatic CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_AGE_COMORBIDITY]: [
    {
      biomarker: Biomarker.COLORECTAL_AGE_COMORBIDITY,
      reference_group: {
        type: "categorical",
        category: "<70 years with 0 comorbidities",
      },
      comparison_group_list: [
        {
          group: {
            type: "categorical",
            category: "≥70 years with ≥1 comorbidity",
          },
          hazard_ratio: 1.51,
          ci_lower: 1.22,
          ci_upper: 1.86,
          patient_population: "Metastatic CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_EARLY_ONSET_AGE]: [
    {
      biomarker: Biomarker.COLORECTAL_EARLY_ONSET_AGE,
      reference_group: {
        type: "numerical",
        operator: RelationalOperator.LESS_THAN,
        value: 50,
        unit: "years",
      },
      comparison_group_list: [
        {
          group: {
            type: "range",
            lower_bound: 51,
            upper_bound: 55,
            unit: "years",
          },
          hazard_ratio: 0.95,
          ci_lower: 0.93,
          ci_upper: 0.96,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_SEX]: [
    {
      biomarker: Biomarker.COLORECTAL_SEX,
      reference_group: { type: "categorical", category: "Female" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Male" },
          hazard_ratio: 0.87,
          ci_lower: 0.85,
          ci_upper: 0.89,
          patient_population: "All CRC",
        },
      ],
    },
  ],
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
          patient_population: "Advanced Cancer",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_AJCC]: [
    {
      biomarker: Biomarker.COLORECTAL_AJCC,
      reference_group: { type: "categorical", category: "Lower Stage (I)" },
      comparison_group_list: [
        {
          group: {
            type: "categorical",
            category: "Higher Stage (II, III, IV)",
          },
          hazard_ratio: 50,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_PRIMARY_LOC]: [
    {
      biomarker: Biomarker.COLORECTAL_PRIMARY_LOC,
      reference_group: { type: "categorical", category: "Left-sided" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Right-sided" },
          hazard_ratio: 1.14,
          ci_lower: 1.06,
          ci_upper: 1.22,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.HISTOLOGICAL_GRADE]: [
    {
      biomarker: Biomarker.HISTOLOGICAL_GRADE,
      reference_group: {
        type: "categorical",
        category: "Well-differentiated (G1)",
      },
      comparison_group_list: [
        {
          group: {
            type: "categorical",
            category: "Poorly-differentiated (G3)",
          },
          hazard_ratio: 3.17,
          ci_lower: 1.01,
          ci_upper: 9.96,
          patient_population: "Adenosquamous CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_LVI]: [
    {
      biomarker: Biomarker.COLORECTAL_LVI,
      reference_group: { type: "categorical", category: "Negative" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Positive" },
          hazard_ratio: 2.15,
          ci_lower: 1.72,
          ci_upper: 2.68,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_PNI]: [
    {
      biomarker: Biomarker.COLORECTAL_PNI,
      reference_group: { type: "categorical", category: "Negative" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Positive" },
          hazard_ratio: 2.07,
          ci_lower: 1.87,
          ci_upper: 2.29,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_NUM_METASTATIC_SITES]: [
    {
      biomarker: Biomarker.COLORECTAL_NUM_METASTATIC_SITES,
      reference_group: { type: "categorical", category: "1−2 sites" },
      comparison_group_list: [
        {
          group: {
            type: "numerical",
            operator: RelationalOperator.GREATER_THAN,
            value: 2,
            unit: "sites",
          },
          hazard_ratio: 3.46,
          ci_lower: 1.71,
          ci_upper: 6.99,
          patient_population: "Metastatic CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_METASTATIC_SITE]: [
    {
      biomarker: Biomarker.COLORECTAL_METASTATIC_SITE,
      reference_group: { type: "categorical", category: "Liver only" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Liver and Lung" },
          hazard_ratio: 1.62,
          ci_lower: 1.51,
          ci_upper: 1.74,
          patient_population: "Metastatic CRC",
        },
      ],
    },
    {
      biomarker: Biomarker.COLORECTAL_METASTATIC_SITE,
      reference_group: { type: "categorical", category: "Lung only" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Liver only" },
          hazard_ratio: 0.82,
          ci_lower: 0.71,
          ci_upper: 0.94,
          patient_population: "Metastatic CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_PRIMARY_TUMOR_RESECTION]: [
    {
      biomarker: Biomarker.COLORECTAL_PRIMARY_TUMOR_RESECTION,
      reference_group: { type: "categorical", category: "Chemo alone" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "PTR + Chemo" },
          hazard_ratio: 1.1,
          ci_lower: 0.76,
          ci_upper: 1.59,
          patient_population: "Synchronous mCRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_SERUM_CEA]: [
    {
      biomarker: Biomarker.COLORECTAL_SERUM_CEA,
      reference_group: { type: "categorical", category: "Normal" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Elevated" },
          hazard_ratio: 1.7,
          ci_lower: 1.65,
          ci_upper: 1.75,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.KRAS_MUTATION]: [
    {
      biomarker: Biomarker.KRAS_MUTATION,
      reference_group: { type: "categorical", category: "Wild-Type" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Mutant" },
          hazard_ratio: 2.24,
          ci_lower: 1.76,
          ci_upper: 2.85,
          patient_population: "Resected Liver Mets",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_BRAF_MUTATION]: [
    {
      biomarker: Biomarker.COLORECTAL_BRAF_MUTATION,
      reference_group: { type: "categorical", category: "Wild-Type" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Mutant" },
          hazard_ratio: 2.25,
          ci_lower: 1.82,
          ci_upper: 2.83,
          patient_population: "All CRC",
        },
      ],
    },
  ],
  [Biomarker.COLORECTAL_MSI]: [
    {
      biomarker: Biomarker.COLORECTAL_MSI,
      reference_group: { type: "categorical", category: "MSI-High" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "MSS" },
          hazard_ratio: 0.65,
          ci_lower: 0.59,
          ci_upper: 0.71,
          patient_population: "Stage II/III CRC",
        },
      ],
    },
  ],
};
