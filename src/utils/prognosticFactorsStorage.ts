import { AllFactors } from "../data/all-factors";
import {
  Biomarker,
  type DiseasePrognosticFactorTable,
  type PrognosticFactorTable,
  type Comparison,
  DiseaseType,
} from "../types/prognostic-factors.d";

interface SavedDifference {
  biomarkerKey: Biomarker;
  comparisonIndex: number;
  field: "hazard_ratio" | "ci_lower" | "ci_upper";
  value: number | undefined;
}

const getStorageKey = (cancerType: DiseaseType) =>
  `prognosticFactorsDifferences_${cancerType}`;

export function loadPrognosticFactors(
  cancerType: DiseaseType,
): DiseasePrognosticFactorTable {
  const defaultFactors = AllFactors[cancerType];
  if (!defaultFactors) {
    return {}; // Return empty if no default factors for this cancer type
  }
  const initialFactors = JSON.parse(JSON.stringify(defaultFactors)); // Deep copy of defaults
  const savedDifferences = localStorage.getItem(getStorageKey(cancerType));

  if (savedDifferences) {
    const differences: SavedDifference[] = JSON.parse(savedDifferences);
    differences.forEach((diff) => {
      const factor = initialFactors[diff.biomarkerKey];
      if (factor && factor.comparison_group_list[diff.comparisonIndex]) {
        (factor.comparison_group_list[diff.comparisonIndex] as Comparison)[
          diff.field
        ] = diff.value;
      }
    });
  }
  return initialFactors;
}

export function loadAllPrognosticFactors(): PrognosticFactorTable {
  const diseases = Object.values(DiseaseType);

  const result: PrognosticFactorTable = {};
  for (const disease of diseases) {
    result[disease] = loadPrognosticFactors(disease);
  }

  return result;
}

export function savePrognosticFactors(
  cancerType: DiseaseType,
  editableFactors: DiseasePrognosticFactorTable,
) {
  const differencesToSave: SavedDifference[] = [];
  const defaultFactors = AllFactors[cancerType];
  if (!defaultFactors) {
    return; // No default factors to compare against
  }

  Object.entries(editableFactors).forEach(([biomarkerKey, factor_list]) => {
    factor_list.forEach((factor, factorIndex) => {
      factor.comparison_group_list.forEach((comparison, index) => {
        const defaultFactor =
          defaultFactors[biomarkerKey as Biomarker]?.[factorIndex];
        const defaultComparison = defaultFactor?.comparison_group_list[index];

        if (defaultComparison) {
          // Check hazard_ratio
          if (comparison.hazard_ratio !== defaultComparison.hazard_ratio) {
            differencesToSave.push({
              biomarkerKey: biomarkerKey as Biomarker,
              comparisonIndex: index,
              field: "hazard_ratio",
              value: comparison.hazard_ratio,
            });
          }
          // Check ci_lower
          if (comparison.ci_lower !== defaultComparison.ci_lower) {
            differencesToSave.push({
              biomarkerKey: biomarkerKey as Biomarker,
              comparisonIndex: index,
              field: "ci_lower",
              value: comparison.ci_lower,
            });
          }
          // Check ci_upper
          if (comparison.ci_upper !== defaultComparison.ci_upper) {
            differencesToSave.push({
              biomarkerKey: biomarkerKey as Biomarker,
              comparisonIndex: index,
              field: "ci_upper",
              value: comparison.ci_upper,
            });
          }
        }
      });
    });
  });

  localStorage.setItem(
    getStorageKey(cancerType),
    JSON.stringify(differencesToSave),
  );
}

export function saveAllPrognosticFactors(factors: PrognosticFactorTable) {
  Object.entries(factors).forEach(([disease, diseaseFactors]) => {
    savePrognosticFactors(disease as DiseaseType, diseaseFactors);
  });
}

export const resetPrognosticFactors = (cancerType: DiseaseType) => {
  localStorage.removeItem(getStorageKey(cancerType));
};

export function resetAllPrognosticFactors() {
  for (const disease of Object.values(DiseaseType)) {
    resetPrognosticFactors(disease);
  }
}
