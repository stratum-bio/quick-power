import {
  Biomarker,
  type DiseasePrognosticFactorTable,
} from "../types/prognostic-factors.d";

export const ColorectalFactors: DiseasePrognosticFactorTable = {
  [Biomarker.COLORECTAL_AJCC]: {
    biomarker: Biomarker.COLORECTAL_AJCC,
    reference_group: {
      type: "categorical",
      category: "Lower Stage (I)",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Higher Stage (II, III, IV)",
        },
        hazard_ratio: 50.0,
        ci_lower: undefined,
        ci_upper: undefined,
        patient_population:
          "All CRC (HR qualitatively described as >50 for advanced vs. early)",
      },
    ],
  },
  [Biomarker.COLORECTAL_PRIMARY_LOC]: {
    biomarker: Biomarker.COLORECTAL_PRIMARY_LOC,
    reference_group: {
      type: "categorical",
      category: "Left-sided",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Right-sided",
        },
        hazard_ratio: 1.14,
        ci_lower: 1.06,
        ci_upper: 1.22,
        patient_population: "All CRC",
      },
    ],
  },
  [Biomarker.COLORECTAL_HISTOLOGICAL_GRADE]: {
    biomarker: Biomarker.COLORECTAL_HISTOLOGICAL_GRADE,
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
  [Biomarker.COLORECTAL_LVI]: {
    biomarker: Biomarker.COLORECTAL_LVI,
    reference_group: {
      type: "categorical",
      category: "Negative",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Positive",
        },
        hazard_ratio: 2.15,
        ci_lower: 1.72,
        ci_upper: 2.68,
        patient_population: "All CRC",
      },
    ],
  },
  [Biomarker.COLORECTAL_PNI]: {
    biomarker: Biomarker.COLORECTAL_PNI,
    reference_group: {
      type: "categorical",
      category: "Negative",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Positive",
        },
        hazard_ratio: 2.07,
        ci_lower: 1.87,
        ci_upper: 2.29,
        patient_population: "All CRC",
      },
    ],
  },
};
