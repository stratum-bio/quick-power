import {
  Biomarker,
  RelationalOperator,
  type DiseasePrognosticFactorTable,
} from "../types/prognostic-factors.d";

export const LungFactors: DiseasePrognosticFactorTable = {
  [Biomarker.ECOG_PS]: [
    {
      biomarker: Biomarker.ECOG_PS,
      reference_group: { type: "categorical", category: "PS 0-1" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "PS ≥2" },
          hazard_ratio: 2.72,
          ci_lower: 2.03,
          ci_upper: 3.63,
          patient_population: "High - Consistent across meta-analysis of real-world data. 4",
        },
      ],
    },
  ],
  [Biomarker.LUNG_TNM_STAGE]: [
    {
      biomarker: Biomarker.LUNG_TNM_STAGE,
      reference_group: { type: "categorical", category: "Stage IIIA" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Stage IIIB" },
          hazard_ratio: 1.79,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "High - Based on foundational IASLC database analysis. 19",
        },
      ],
    },
    {
      biomarker: Biomarker.LUNG_TNM_STAGE,
      reference_group: { type: "categorical", category: "Stage IA" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Stage IB" },
          hazard_ratio: 1.55,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "High - Based on foundational IASLC database analysis. 19",
        },
      ],
    },
  ],
  [Biomarker.LUNG_KRAS_MUTATION]: [
    {
      biomarker: Biomarker.LUNG_KRAS_MUTATION,
      reference_group: { type: "categorical", category: "KRAS Wild-Type" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "KRAS Mutant" },
          hazard_ratio: 1.71,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "Moderate to High - Supported by multiple meta-analyses. 30",
        },
      ],
    },
  ],
  [Biomarker.SMOKING_STATUS]: [
    {
      biomarker: Biomarker.SMOKING_STATUS,
      reference_group: { type: "categorical", category: "Never Smoker" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Current Smoker" },
          hazard_ratio: 1.68,
          ci_lower: 1.50,
          ci_upper: 1.89,
          patient_population: "High - Based on large, multivariate-adjusted cohort study. 17",
        },
        {
          group: { type: "categorical", category: "Former Smoker" },
          hazard_ratio: 1.26,
          ci_lower: 1.13,
          ci_upper: 1.40,
          patient_population: "High - Based on large, multivariate-adjusted cohort study. 17",
        },
      ],
    },
  ],
  [Biomarker.WEIGHT_LOSS]: [
    {
      biomarker: Biomarker.WEIGHT_LOSS,
      reference_group: { type: "categorical", category: "Stable Weight" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Significant Weight Loss" },
          hazard_ratio: 1.65,
          ci_lower: 1.43,
          ci_upper: 1.91,
          patient_population: "High - Consistent across systematic review and meta-analysis. 37",
        },
      ],
    },
  ],
  [Biomarker.LUNG_PDL1_EXPRESSION]: [
    {
      biomarker: Biomarker.LUNG_PDL1_EXPRESSION,
      reference_group: { type: "categorical", category: "Low (Untreated, Early Stage)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "High" },
          hazard_ratio: 1.53,
          ci_lower: 1.26,
          ci_upper: 1.83,
          patient_population: "High - Consistent across multiple meta-analyses. 27",
        },
      ],
    },
  ],
  [Biomarker.METASTATIC_SITE]: [
    {
      biomarker: Biomarker.METASTATIC_SITE,
      reference_group: { type: "categorical", category: "Absence of Liver Metastases" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "Presence" },
          hazard_ratio: 1.45,
          ci_lower: 1.40,
          ci_upper: 1.50,
          patient_population: "High - Based on large-scale SEER database analysis. 6",
        },
      ],
    },
  ],
  [Biomarker.BREAST_AGE_AT_DIAGNOSIS]: [
    {
      biomarker: Biomarker.BREAST_AGE_AT_DIAGNOSIS,
      reference_group: { type: "numerical", operator: RelationalOperator.LESS_THAN, value: 65, unit: "years" },
      comparison_group_list: [
        {
          group: { type: "numerical", operator: RelationalOperator.GREATER_THAN_OR_EQUAL, value: 65, unit: "years" },
          hazard_ratio: 1.37,
          ci_lower: 1.33,
          ci_upper: 1.40,
          patient_population: "High - Based on large-scale SEER database analysis. 6",
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
          hazard_ratio: 1.28,
          ci_lower: undefined,
          ci_upper: undefined,
          patient_population: "High - Consistent across multiple meta-analyses. 9",
        },
      ],
    },
  ],
  [Biomarker.LUNG_EGFR_MUTATION]: [
    {
      biomarker: Biomarker.LUNG_EGFR_MUTATION,
      reference_group: { type: "categorical", category: "Wild-Type (Untreated)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "EGFR Mutant" },
          hazard_ratio: 0.86,
          ci_lower: 0.72,
          ci_upper: 1.04,
          patient_population: "High - Prognostically neutral based on meta-analysis. 31",
        },
      ],
    },
  ],
  [Biomarker.LUNG_ALK_REARRANGEMENT]: [
    {
      biomarker: Biomarker.LUNG_ALK_REARRANGEMENT,
      reference_group: { type: "categorical", category: "ALK- (Untreated, Matched)" },
      comparison_group_list: [
        {
          group: { type: "categorical", category: "ALK+" },
          hazard_ratio: 0.61,
          ci_lower: 0.22,
          ci_upper: 1.67,
          patient_population: "Moderate - Prognostically neutral in matched analysis. 33",
        },
      ],
    },
  ],
};
