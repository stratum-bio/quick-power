import {
  loadAllPrognosticFactors,
  saveAllPrognosticFactors,
  resetAllPrognosticFactors,
} from "./utils/prognosticFactorsStorage";
import React, { useState } from "react";
import {
  DiseaseType,
  type GroupType,
  type PrognosticFactorTable,
  type PrognosticFactor,
  Biomarker,
  type Comparison,
} from "./types/prognostic-factors.d";

const formatGroup = (group: GroupType): string => {
  if (group.type === "numerical") {
    const operator = group.operator;
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
    () => loadAllPrognosticFactors(),
  );

  const [message, setMessage] = useState<{
    text: string;
    type: "success" | "error" | "neutral";
  } | null>(null);

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (biomarkerKey: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [biomarkerKey]: !prev[biomarkerKey],
    }));
  };

  const showMessage = (text: string, type: "success" | "error" | "neutral") => {
    setMessage({ text, type });
    setTimeout(() => {
      setMessage(null);
    }, 3000); // Message disappears after 3 seconds
  };

  const handleInputChange = (
    cancerType: DiseaseType,
    biomarkerKey: Biomarker,
    comparisonIndex: number,
    field: "hazard_ratio" | "ci_lower" | "ci_upper",
    value: string,
  ) => {
    setEditableFactors((prevFactors) => {
      const newFactors = { ...prevFactors };
      if (
        newFactors[cancerType] &&
        biomarkerKey in newFactors[cancerType]
      ) {
        console.log("input change ", cancerType, biomarkerKey, comparisonIndex, field, value);
        const factor: PrognosticFactor | undefined =
          newFactors[cancerType][biomarkerKey];
        if (factor) {
          const comparison = {
            ...factor.comparison_group_list[comparisonIndex],
          };
          (comparison as Comparison)[field] =
            value === "" ? undefined : parseFloat(value);
          factor.comparison_group_list[comparisonIndex] = comparison;
        }
      }
      return newFactors;
    });
  };

  const handleSave = () => {
    saveAllPrognosticFactors(editableFactors);
    showMessage("Prognostic factor updates saved.", "success");
  };

  const handleReset = () => {
    resetAllPrognosticFactors();
    setEditableFactors(loadAllPrognosticFactors());
    showMessage("Data reset to defaults.", "neutral");
  };

  return (
    <div className="md:w-5xl">
      {Object.entries(editableFactors).map(([cancerType, factors]) => {
        if (Object.keys(factors).length === 0) {
          return null; // Don't render if no factors for this cancer type
        }
        return (
          <div key={cancerType} className="mb-8 border-b border-gray-400">
            <h3 className="text-2xl capitalize mb-4 px-2">
              {cancerType.replace(/_/g, " ")}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-4 gap-y-2 font-bold border-t border-b pb-2 uppercase text-xs">
              <div className="p-2">Biomarker</div>
              <div className="p-2">Reference Group</div>
              <div className="p-2">Comparison Group</div>
              <div className="p-2">Hazard Ratio (HR)</div>
              <div className="p-2 hidden sm:block">CI Lower</div>
              <div className="p-2 hidden sm:block">CI Upper</div>
              <div className="p-2 hidden sm:block col-span-2">Patient Population</div>
            </div>

            {Object.entries(factors).map(([biomarkerKeyStr, factor], index) => (
              <div
                key={cancerType + "-" + biomarkerKeyStr}
                className={`grid grid-cols-4 sm:grid-cols-8 gap-x-4 gap-y-2 py-2 ${index % 2 !== 0 ? "bg-gray-100" : ""} hover:bg-medium-azure-alpha`}
                onClick={() => toggleRow(biomarkerKeyStr)}
              >
                {/* Biomarker and Reference Group cells with rowSpan */}
                <div
                  className={`row-span-${factor.comparison_group_list.length} p-2`}
                >
                  {biomarkerKeyStr.replace(/_/g, " ")}
                </div>
                <div
                  className={`row-span-${factor.comparison_group_list.length} p-2`}
                >
                  {formatGroup(factor.reference_group)}
                </div>

                {/* Comparison groups */}
                {factor.comparison_group_list.map((comparison, index) => (
                  <React.Fragment key={`${cancerType}-${biomarkerKeyStr}-${index}`}>
                    {/* These divs will occupy columns 3 to 7 */}
                    <div className="col-start-3 p-2">
                      {formatGroup(comparison.group)}
                    </div>
                    <div className="p-2">
                      <input
                        type="number"
                        value={comparison.hazard_ratio ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            cancerType as DiseaseType,
                            biomarkerKeyStr as Biomarker,
                            index,
                            "hazard_ratio",
                            e.target.value,
                          )
                        }
                        className="w-20 p-1 border rounded"
                      />
                    </div>
                    {/* Desktop view */}
                    <div className="p-2 hidden sm:block">
                      <input
                        type="number"
                        value={comparison.ci_lower ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            cancerType as DiseaseType,
                            biomarkerKeyStr as Biomarker,
                            index,
                            "ci_lower",
                            e.target.value,
                          )
                        }
                        className="w-12 md:w-20 p-1 border rounded"
                      />
                    </div>
                    <div className="p-2 hidden sm:block">
                      <input
                        type="number"
                        value={comparison.ci_upper ?? ""}
                        onChange={(e) =>
                          handleInputChange(
                            cancerType as DiseaseType,
                            biomarkerKeyStr as Biomarker,
                            index,
                            "ci_upper",
                            e.target.value,
                          )
                        }
                        className="w-12 md:w-20 p-1 border rounded"
                      />
                    </div>
                    <div className="p-2 hidden sm:block col-span-2">
                      {comparison.patient_population}
                    </div>
                  </React.Fragment>
                ))}
                {/* Mobile expanded view */}
                <div className="col-span-4 sm:hidden text-center mb-2">
                  {expandedRows[biomarkerKeyStr] && (
                    <div
                      className="grid grid-cols-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {factor.comparison_group_list.map((comparison, index) => (
                        <>
                          <div className="p-2 col-span-2 text-right">
                            {formatGroup(comparison.group)} CI
                          </div>
                          <div className="p-2 sm:hidden">
                            <input
                              type="number"
                              value={comparison.ci_lower ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  cancerType as DiseaseType,
                                  biomarkerKeyStr as Biomarker,
                                  index,
                                  "ci_lower",
                                  e.target.value,
                                )
                              }
                              className="w-20 p-1 border rounded"
                            />
                          </div>
                          <div className="p-2 sm:hidden">
                            <input
                              type="number"
                              value={comparison.ci_upper ?? ""}
                              onChange={(e) =>
                                handleInputChange(
                                  cancerType as DiseaseType,
                                  biomarkerKeyStr as Biomarker,
                                  index,
                                  "ci_upper",
                                  e.target.value,
                                )
                              }
                              className="w-20 p-1 border rounded"
                            />
                          </div>
                        </>
                      ))}
                    </div>
                  )}
                  {!expandedRows[biomarkerKeyStr] ? "\u25BC" : "\u25B2"}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {message && (
        <div
          className={`p-3 mb-4 rounded ${message.type === "success" ? "text-success bg-success-2" : "text-error bg-error-2"}`}
        >
          {message.text}
        </div>
      )}
      <div className="flex space-x-2 mt-4 md:mt-0">
        <button className="px-4 py-2 mb-4 ml-4 md:ml-0" onClick={handleSave}>
          Save
        </button>
        <button className="px-4 py-2 mb-4 ml-2 md:ml-0" onClick={handleReset}>
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default PrognosticFactorsGrid;
