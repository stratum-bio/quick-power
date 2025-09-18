import type { PrognosticFactorTable } from "../types/prognostic-factors.d";
import { Biomarker, RelationalOperator } from "../types/prognostic-factors.d";

export const ProstateFactors: PrognosticFactorTable = {
  // ECOG from https://pubmed.ncbi.nlm.nih.gov/38162494/
  [Biomarker.ECOG_PS]: {
    biomarker: Biomarker.ECOG_PS,
    reference_group: {
      type: "numerical",
      operator: RelationalOperator.EQUAL,
      value: 0,
      unit: undefined,
    },
    comparison_group_list: [
      {
        group: {
          type: "numerical",
          operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
          value: 1,
          unit: undefined,
        },
        hazard_ratio: 1.68,
        ci_lower: 1.44,
        ci_upper: 1.94,
        patient_population: "mCRPC",
      },
      {
        group: {
          type: "numerical",
          operator: RelationalOperator.GREATER_THAN_OR_EQUAL,
          value: 2,
          unit: undefined,
        },
        hazard_ratio: 2.1,
        ci_lower: 1.87,
        ci_upper: 2.37,
        patient_population: "mCRPC",
      },
    ],
  },
  // the rest have not been validated / verified
  [Biomarker.AGE]: {
    biomarker: Biomarker.AGE,
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
      {
        group: {
          type: "categorical",
          category: "Per unit increase",
        },
        hazard_ratio: 1.11,
        ci_lower: 1.01,
        ci_upper: 1.21,
        patient_population: "mHSPC (ARPIs)",
      },
    ],
  },
  [Biomarker.ISUP_GRADE]: {
    biomarker: Biomarker.ISUP_GRADE,
    reference_group: {
      type: "categorical",
      category: "Lower Grades",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Grade 5 (GS 9-10)",
        },
        hazard_ratio: 2.04,
        ci_lower: 1.12,
        ci_upper: 3.72,
        patient_population: "De Novo Oligometastatic",
      },
    ],
  },
  [Biomarker.T_STAGE]: {
    biomarker: Biomarker.T_STAGE,
    reference_group: {
      type: "categorical",
      category: "T1/T2",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "T3/T4",
        },
        hazard_ratio: 1.49,
        ci_lower: 1.135,
        ci_upper: 1.958,
        patient_population: "PCa w/ Lung Mets",
      },
      {
        group: {
          type: "categorical",
          category: "T3/T4",
        },
        hazard_ratio: 1.785,
        ci_lower: 1.007,
        ci_upper: 3.163,
        patient_population: "PCa w/ Brain Mets",
      },
    ],
  },
  [Biomarker.METASTATIC_STATUS]: {
    biomarker: Biomarker.METASTATIC_STATUS,
    reference_group: {
      type: "categorical",
      category: "No Distant Metastasis",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Non-regional Lymph Node",
        },
        hazard_ratio: 2.15,
        ci_lower: 1.11,
        ci_upper: 4.16,
        patient_population: "De Novo Oligometastatic",
      },
    ],
  },
  [Biomarker.METASTATIC_VOLUME]: {
    biomarker: Biomarker.METASTATIC_VOLUME,
    reference_group: {
      type: "categorical",
      category: "Low",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 1.92,
        ci_lower: 1.17,
        ci_upper: 3.13,
        patient_population: "Metastatic PCa",
      },
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 2.1,
        ci_lower: undefined,
        ci_upper: undefined,
        patient_population: "Metastatic PCa",
      },
    ],
  },
  [Biomarker.METASTATIC_SITE]: {
    biomarker: Biomarker.METASTATIC_SITE,
    reference_group: {
      type: "categorical",
      category: "Bone +/- Lymph Node",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Lung",
        },
        hazard_ratio: 1.14,
        ci_lower: 1.04,
        ci_upper: 1.25,
        patient_population: "mCRPC",
      },
      {
        group: {
          type: "categorical",
          category: "Liver",
        },
        hazard_ratio: 1.52,
        ci_lower: 1.35,
        ci_upper: 1.73,
        patient_population: "mCRPC",
      },
    ],
  },
  [Biomarker.PSA]: {
    biomarker: Biomarker.PSA,
    reference_group: {
      type: "range",
      lower_bound: 4.1,
      upper_bound: 10,
      unit: "ng/mL",
    },
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
          value: 4,
          unit: "ng/mL",
        },
        hazard_ratio: 1.331,
        ci_lower: undefined,
        ci_upper: undefined,
        patient_population: "Metastatic PCa",
      },
    ],
  },
  [Biomarker.PSA_AT_RT]: {
    biomarker: Biomarker.PSA_AT_RT,
    reference_group: {
      type: "categorical",
      category: "Higher",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Lower",
        },
        hazard_ratio: 0.51,
        ci_lower: 0.33,
        ci_upper: 0.78,
        patient_population: "Metastatic PCa",
      },
    ],
  },
  [Biomarker.ALP]: {
    biomarker: Biomarker.ALP,
    reference_group: {
      type: "categorical",
      category: "Low",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 1.74,
        ci_lower: 1.47,
        ci_upper: 2.06,
        patient_population: "Prostate Cancer",
      },
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 1.72,
        ci_lower: 1.37,
        ci_upper: 2.14,
        patient_population: "mHSPC",
      },
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 2.136,
        ci_lower: 1.38,
        ci_upper: 3.31,
        patient_population: "Metastatic PCa",
      },
    ],
  },
  [Biomarker.LDH]: {
    biomarker: Biomarker.LDH,
    reference_group: {
      type: "categorical",
      category: "Low",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 2.07,
        ci_lower: 1.75,
        ci_upper: 2.44,
        patient_population: "Metastatic PCa",
      },
      {
        group: {
          type: "categorical",
          category: "High",
        },
        hazard_ratio: 2.25,
        ci_lower: 1.78,
        ci_upper: 2.84,
        patient_population: "mHSPC",
      },
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
  [Biomarker.HB]: {
    biomarker: Biomarker.HB,
    reference_group: {
      type: "categorical",
      category: "Normal",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Low",
        },
        hazard_ratio: 1.21,
        ci_lower: 1.15,
        ci_upper: 1.29,
        patient_population: "mHSPC",
      },
      {
        group: {
          type: "categorical",
          category: "High (Quintile 5)",
        },
        hazard_ratio: 0.42,
        ci_lower: 0.33,
        ci_upper: 0.52,
        patient_population: "De Novo mCSPC",
      },
    ],
  },
  [Biomarker.ALBUMIN]: {
    biomarker: Biomarker.ALBUMIN,
    reference_group: {
      type: "categorical",
      category: "Low (Quintile 1)",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "High (Quintile 5)",
        },
        hazard_ratio: 0.48,
        ci_lower: 0.36,
        ci_upper: 0.63,
        patient_population: "De Novo mCSPC",
      },
    ],
  },
  [Biomarker.AGR]: {
    biomarker: Biomarker.AGR,
    reference_group: {
      type: "categorical",
      category: "High",
    },
    comparison_group_list: [
      {
        group: {
          type: "categorical",
          category: "Low",
        },
        hazard_ratio: 2.43,
        ci_lower: undefined,
        ci_upper: undefined,
        patient_population: "Metastatic PCa",
      },
    ],
  },
};
