import {
  Biomarker,
  type DiseasePrognosticFactorTable,
} from "../types/prognostic-factors.d";

export const BreastFactors: DiseasePrognosticFactorTable = {
  [Biomarker.BREAST_M_STAGE]: {
    biomarker: Biomarker.BREAST_M_STAGE,
    reference_group: {
      type: "categorical",
      category: "Early Stage",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "M1 (Stage IV)",
        },
        hazard_ratio: 12.12,
        ci_lower: 5.7,
        ci_upper: 25.76,
        patient_population: "Pooled meta-analysis",
      },
      {
        group: {
          type: "categorical",
          category: "Stage III",
        },
        hazard_ratio: 3.42,
        ci_lower: 2.51,
        ci_upper: 4.67,
        patient_population: "Pooled meta-analysis",
      },
    ],
  },
  [Biomarker.BREAST_MOLECULAR_SUBTYPE]: {
    biomarker: Biomarker.BREAST_MOLECULAR_SUBTYPE,
    reference_group: {
      type: "categorical",
      category: "Luminal A",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Triple-Negative",
        },
        hazard_ratio: 2.51,
        ci_lower: 1.61,
        ci_upper: 3.92,
        patient_population: "Meta-analysis",
      },
      {
        group: {
          type: "categorical",
          category: "HER2-Enriched",
        },
        hazard_ratio: 2.3,
        ci_lower: 1.34,
        ci_upper: 3.94,
        patient_population: "Meta-analysis",
      },
    ],
  },
};
