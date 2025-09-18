import { ProstateFactors } from "../mock/prostate-prognostic";
import {
  Biomarker,
  type PrognosticFactorTable,
  type Comparison,
} from "../types/prognostic-factors.d";

interface SavedDifference {
  biomarkerKey: Biomarker;
  comparisonIndex: number;
  field: "hazard_ratio" | "ci_lower" | "ci_upper";
  value: number | undefined;
}

const STORAGE_KEY = "prostateFactorsDifferences";

export const loadPrognosticFactors = (): PrognosticFactorTable => {
  const initialFactors = JSON.parse(JSON.stringify(ProstateFactors)); // Deep copy of defaults
  const savedDifferences = localStorage.getItem(STORAGE_KEY);

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
};

export const savePrognosticFactors = (
  editableFactors: PrognosticFactorTable,
) => {
  const differencesToSave: SavedDifference[] = [];
  Object.entries(editableFactors).forEach(([biomarkerKey, factor]) => {
    factor.comparison_group_list.forEach((comparison, index) => {
      const defaultFactor = ProstateFactors[biomarkerKey as Biomarker];
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

  localStorage.setItem(STORAGE_KEY, JSON.stringify(differencesToSave));
  console.log("Differences saved to local storage:", differencesToSave);
};

export const resetPrognosticFactors = () => {
  localStorage.removeItem(STORAGE_KEY);
};
