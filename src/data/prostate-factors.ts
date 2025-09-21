import type { DiseasePrognosticFactorTable } from "../types/prognostic-factors.d";
import { Biomarker, RelationalOperator } from "../types/prognostic-factors.d";

export const ProstateFactors: DiseasePrognosticFactorTable = {
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
      /*
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
      */
    ],
  },
  // the rest have not been validated / verified
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
};
