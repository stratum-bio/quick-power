import {
  Biomarker,
  RelationalOperator,
  type DiseasePrognosticFactorTable,
} from "../types/prognostic-factors.d";

export const LungFactors: DiseasePrognosticFactorTable = {
  [Biomarker.ECOG_PS]: {
    biomarker: Biomarker.ECOG_PS,
    reference_group: {
      type: "categorical",
      category: "PS 0-1",
    },
    comparison_group_list: [
      {
        group: {
          type: "numerical",
          operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
          value: 2,
        },
        hazard_ratio: 2.72,
        ci_lower: 2.03,
        ci_upper: 3.63,
        patient_population:
          "High - Consistent across meta-analysis of real-world data.",
      },
    ],
  },
  [Biomarker.SMOKING_STATUS]: {
    biomarker: Biomarker.SMOKING_STATUS,
    reference_group: {
      type: "categorical",
      category: "Never Smoker",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Current Smoker",
        },
        hazard_ratio: 1.68,
        ci_lower: 1.5,
        ci_upper: 1.89,
        patient_population:
          "High - Based on large, multivariate-adjusted cohort study.",
      },
      {
        group: {
          type: "categorical",
          category: "Former Smoker",
        },
        hazard_ratio: 1.26,
        ci_lower: 1.13,
        ci_upper: 1.4,
        patient_population:
          "High - Based on large, multivariate-adjusted cohort study.",
      },
    ],
  },
  [Biomarker.WEIGHT_LOSS]: {
    biomarker: Biomarker.WEIGHT_LOSS,
    reference_group: {
      type: "categorical",
      category: "Stable Weight",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Significant Weight Loss",
        },
        hazard_ratio: 1.65,
        ci_lower: 1.43,
        ci_upper: 1.91,
        patient_population:
          "High - Consistent across systematic review and meta-analysis.",
      },
    ],
  },
};
