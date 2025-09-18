import {
  loadPrognosticFactors,
  savePrognosticFactors,
  resetPrognosticFactors,
} from "./utils/prognosticFactorsStorage";
import React, { useState } from "react";
import {
  RelationalOperator,
  type GroupType,
  type PrognosticFactorTable,
  type PrognosticFactor,
  Biomarker,
  type Comparison,
} from "./types/prognostic-factors.d";

const formatGroup = (group: GroupType): string => {
  if (group.type === "numerical") {
    const operator =
      group.operator === RelationalOperator.EQUAL
        ? "="
        : group.operator === RelationalOperator.GREATER_THAN
          ? ">"
          : group.operator === RelationalOperator.GREATER_THAN_OR_EQUAL
            ? ">="
            : group.operator === RelationalOperator.LESS_THAN
              ? "<"
              : group.operator === RelationalOperator.LESS_THAN_OR_EQUAL
                ? "<="
                : "";
    return `${operator} ${group.value} ${group.unit || ""}`.trim();
  } else if (group.type === "range") {
    return `${group.lower_bound}-${group.upper_bound} ${group.unit || ""}`.trim();
  } else {
    // categorical
    return group.category || "";
  }
};

const PrognosticFactorsGrid: React.FC = () => {
  const [editableFactors, setEditableFactors] = useState<PrognosticFactorTable>(
    () => loadPrognosticFactors(),
  );

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "neutral";
  } | null>(null);

  const showMessage = (text: string, type: "success" | "error" | "neutral") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000); // Message disappears after 3 seconds
  };

  const handleInputChange = (
    biomarkerKey: Biomarker,
    comparisonIndex: number,
    field: "hazard_ratio" | "ci_lower" | "ci_upper",
    value: string,
  ) => {
    setEditableFactors((prevFactors) => {
      const newFactors = { ...prevFactors };
      const factor: PrognosticFactor = newFactors[biomarkerKey];
      if (factor) {
        const comparison = { ...factor.comparison_group_list[comparisonIndex] };
        (comparison as Comparison)[field] =
          value === "" ? undefined : parseFloat(value);
        factor.comparison_group_list[comparisonIndex] = comparison;
      }
      return newFactors;
    });
  };

  const handleSave = () => {
    savePrognosticFactors(editableFactors);
    showMessage("Prognostic factor updates saved.", "success");
  };

  const handleReset = () => {
    resetPrognosticFactors();
    setEditableFactors(loadPrognosticFactors());
    showMessage("Data reset to defaults.", "neutral");
  };

  return (
    <div className="prognostic-factors-grid">
      <h1>Prognostic Factors for Prostate Cancer</h1>
      <table className="table table-striped">
        <thead>
          <tr>
            <th>Biomarker</th>
            <th>Reference Group</th>
            <th>Comparison Group</th>
            <th>Hazard Ratio (HR)</th>
            <th>CI Lower</th>
            <th>CI Upper</th>
            <th>Patient Population</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(editableFactors).map(([biomarkerKeyStr, factor]) =>
            factor.comparison_group_list.map((comparison, index) => (
              <tr key={`${biomarkerKeyStr}-${index}`}>
                {index === 0 && (
                  <>
                    <td rowSpan={factor.comparison_group_list.length}>
                      {biomarkerKeyStr.replace(/_/g, " ")}
                    </td>
                    <td rowSpan={factor.comparison_group_list.length}>
                      {formatGroup(factor.reference_group)}
                    </td>
                  </>
                )}
                <td>{formatGroup(comparison.group)}</td>
                <td>
                  <input
                    type="number"
                    value={comparison.hazard_ratio ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        biomarkerKeyStr as Biomarker,
                        index,
                        "hazard_ratio",
                        e.target.value,
                      )
                    }
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={comparison.ci_lower ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        biomarkerKeyStr as Biomarker,
                        index,
                        "ci_lower",
                        e.target.value,
                      )
                    }
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    value={comparison.ci_upper ?? ""}
                    onChange={(e) =>
                      handleInputChange(
                        biomarkerKeyStr as Biomarker,
                        index,
                        "ci_upper",
                        e.target.value,
                      )
                    }
                    className="w-24 p-1 border rounded"
                  />
                </td>
                <td>{comparison.patient_population}</td>
              </tr>
            )),
          )}
        </tbody>
      </table>
      {message && (
        <div
          className={`p-3 mb-4 rounded ${message.type === "success" ? "text-success bg-success-2" : "text-error bg-error-2"}`}
        >
          {message.text}
        </div>
      )}
      <div className="flex space-x-2 mt-4">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          onClick={handleReset}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default PrognosticFactorsGrid;
