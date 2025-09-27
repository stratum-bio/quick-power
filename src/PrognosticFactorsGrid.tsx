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
  type DiseasePrognosticFactorTable,
} from "./types/prognostic-factors.d";

function formatGroup(group: GroupType): string {
  if (group.type === "numerical") {
    const operator = group.operator;
    return `${operator} ${group.value} ${group.unit || ""}`.trim();
  } else if (group.type === "range") {
    return `${group.lower_bound}-${group.upper_bound} ${group.unit || ""}`.trim();
  } else {
    // categorical
    return group.category || "";
  }
}

interface MobileExpandedViewProps {
  biomarkerKeyStr: Biomarker;
  factor: PrognosticFactor;
  cancerType: DiseaseType;
  expandedRows: Record<string, boolean>;
  handleInputChange: (
    cancerType: DiseaseType,
    biomarkerKey: Biomarker,
    factorIndex: number,
    comparisonIndex: number,
    field: "hazard_ratio" | "ci_lower" | "ci_upper",
    value: string,
  ) => void;
  factorIndex: number;
}

// TODO: move the component state handling internally instead of to the
// parent container
const MobileExpandedView: React.FC<MobileExpandedViewProps> = ({
  expandedRows,
  biomarkerKeyStr,
  factor,
  cancerType,
  handleInputChange,
  factorIndex,
}) => {
  return (
    <div className="col-span-4 sm:hidden text-center mb-2">
      {expandedRows[biomarkerKeyStr] && (
        <div className="grid grid-cols-4 border-t border-dashed border-gemini-blue/30 gap-x-4 gap-y-2">
          {factor.comparison_group_list.map((comparison, compareIndex) => (
            <React.Fragment
              key={`${biomarkerKeyStr}-${factorIndex}-${compareIndex}-mobile`}
            >
              <div className="p-2 col-span-2 text-right">
                {formatGroup(comparison.group)} Group CI
              </div>
              <div
                className="p-2 text-left sm:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="number"
                  value={comparison.ci_lower ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      cancerType,
                      biomarkerKeyStr,
                      factorIndex,
                      compareIndex,
                      "ci_lower",
                      e.target.value,
                    )
                  }
                  className="w-20 p-1 border rounded"
                />
              </div>
              <div
                className="p-2 text-left sm:hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="number"
                  value={comparison.ci_upper ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      cancerType,
                      biomarkerKeyStr,
                      factorIndex,
                      compareIndex,
                      "ci_upper",
                      e.target.value,
                    )
                  }
                  className="w-20 p-1 border rounded"
                />
              </div>
            </React.Fragment>
          ))}
        </div>
      )}
      <div
        className={
          expandedRows[biomarkerKeyStr]
            ? "border-b border-dashed border-gemini-blue/30"
            : ""
        }
      >
        {!expandedRows[biomarkerKeyStr] ? "▼" : "▲"}
      </div>
    </div>
  );
};

interface FactorRowProps {
  cancerType: string;
  biomarkerKeyStr: string;
  biomarkerIndex: number;
  toggleRow: (biomarkerKey: string) => void;
  allFactors: DiseasePrognosticFactorTable;
  factorList: PrognosticFactor[];
  handleInputChange: (
    cancerType: DiseaseType,
    biomarkerKey: Biomarker,
    factorIndex: number,
    comparisonIndex: number,
    field: "hazard_ratio" | "ci_lower" | "ci_upper",
    value: string,
  ) => void;
  expandedRows: Record<string, boolean>;
}

// TODO: move the component state handling internally instead of to the
// parent container
const FactorRow: React.FC<FactorRowProps> = ({
  cancerType,
  biomarkerKeyStr,
  biomarkerIndex,
  toggleRow,
  allFactors,
  factorList,
  handleInputChange,
  expandedRows,
}) => {
  return (
    <div
      key={cancerType + "-" + biomarkerKeyStr}
      className={`grid grid-cols-4 sm:grid-cols-8 gap-x-4 gap-y-2 py-2 ${biomarkerIndex % 2 !== 0 ? "bg-gray-100" : ""} hover:bg-table-hl ${biomarkerIndex == Object.entries(allFactors).length - 1 ? "rounded-b-md" : ""} `}
      onClick={() => toggleRow(biomarkerKeyStr)}
    >
      {/* Biomarker and Reference Group cells with rowSpan */}
      <div
        className={`row-span-${factorList.reduce((a, b) => a + b.comparison_group_list.length, 0)} p-2`}
      >
        {biomarkerKeyStr.replace(/_/g, " ")}
      </div>
      {factorList.map((factor, factorIndex) => (
        <>
          <div
            className={`row-span-${factor.comparison_group_list.length} col-start-2 p-2`}
          >
            {formatGroup(factor.reference_group)}
          </div>

          {/* Comparison groups */}
          {factor.comparison_group_list.map((comparison, compareIndex) => (
            <React.Fragment
              key={`${cancerType}-${biomarkerKeyStr}-${factorIndex}-${compareIndex}`}
            >
              {/* These divs will occupy columns 3 to 7 */}
              <div className="col-start-3 p-2">
                {formatGroup(comparison.group)}
              </div>
              <div className="p-2" onClick={(e) => e.stopPropagation()}>
                <input
                  type="number"
                  value={comparison.hazard_ratio ?? ""}
                  onChange={(e) =>
                    handleInputChange(
                      cancerType as DiseaseType,
                      biomarkerKeyStr as Biomarker,
                      factorIndex,
                      compareIndex,
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
                      factorIndex,
                      compareIndex,
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
                      factorIndex,
                      compareIndex,
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
          <MobileExpandedView
            expandedRows={expandedRows}
            biomarkerKeyStr={biomarkerKeyStr as Biomarker}
            factor={factor}
            cancerType={cancerType as DiseaseType}
            handleInputChange={handleInputChange}
            factorIndex={factorIndex}
          />
        </>
      ))}
    </div>
  );
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
  const [expandedCancerTypes, setExpandedCancerTypes] = useState<
    Record<string, boolean>
  >(
    Object.values(DiseaseType).reduce(
      (acc, type) => ({ ...acc, [type]: false }),
      {},
    ),
  );

  const toggleRow = (biomarkerKey: string) => {
    setExpandedRows((prev) => ({
      ...prev,
      [biomarkerKey]: !prev[biomarkerKey],
    }));
  };

  const toggleCancerType = (cancerType: DiseaseType) => {
    setExpandedCancerTypes((prev) => ({
      ...prev,
      [cancerType]: !prev[cancerType],
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
    factorIndex: number,
    comparisonIndex: number,
    field: "hazard_ratio" | "ci_lower" | "ci_upper",
    value: string,
  ) => {
    setEditableFactors((prevFactors) => {
      const newFactors = { ...prevFactors };
      const cancerFactors = newFactors[cancerType];

      if (cancerFactors && biomarkerKey in cancerFactors) {
        const biomarkerFactors = cancerFactors[biomarkerKey];

        const factor: PrognosticFactor | undefined = biomarkerFactors
          ? biomarkerFactors[factorIndex]
          : undefined;
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
      <h2 className="text-3xl m-4 mb-8 text-black text-left">
        Modify prognostic factor parameters
      </h2>
      <div className="text-left m-4 mb-8 text-black md:w-5xl">
        <p>
          These are currently placeholder prognostic factors and not meant for
          legitimate insights. Update the hazard ratios here in order to use
          them when estimating the effects of changing the prognostic factor
          distribution for a trial simulation.
        </p>
      </div>
      {Object.entries(editableFactors).map(([cancerType, factors]) => {
        if (Object.keys(factors).length === 0) {
          return null; // Don't render if no factors for this cancer type
        }
        return (
          <div
            key={cancerType}
            className="border border-gemini-blue rounded-md shadow-lg mt-4 mb-4 ml-2 mr-2 md:ml-0 md:mr-0"
          >
            <h3
              className={`pt-4 pb-4 text-2xl capitalize px-2 cursor-pointer flex justify-between items-center ${expandedCancerTypes[cancerType] ? "bg-gemini-blue text-white" : ""}`}
              onClick={() => toggleCancerType(cancerType as DiseaseType)}
            >
              {cancerType.replace(/_/g, " ")}
              <span>
                {expandedCancerTypes[cancerType] ? "\u25B2" : "\u25BC"}
              </span>
            </h3>
            {expandedCancerTypes[cancerType] && (
              <>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-x-4 gap-y-2 font-bold border-t border-b pb-2 uppercase text-xs">
                  <div className="p-2">Biomarker</div>
                  <div className="p-2">Reference Group</div>
                  <div className="p-2">Comparison Group</div>
                  <div className="p-2">Hazard Ratio (HR)</div>
                  <div className="p-2 hidden sm:block">CI Lower</div>
                  <div className="p-2 hidden sm:block">CI Upper</div>
                  <div className="p-2 hidden sm:block col-span-2">
                    Patient Population
                  </div>
                </div>

                {Object.entries(factors)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([biomarkerKeyStr, factorList], biomarkerIndex) => (
                    <FactorRow
                      cancerType={cancerType}
                      biomarkerKeyStr={biomarkerKeyStr}
                      factorList={factorList}
                      biomarkerIndex={biomarkerIndex}
                      allFactors={factors}
                      toggleRow={toggleRow}
                      handleInputChange={handleInputChange}
                      expandedRows={expandedRows}
                    />
                  ))}
              </>
            )}
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
      <div className="flex space-x-2 mt-4">
        <button
          className="px-4 py-2 mb-4 ml-4 md:ml-0 main-button"
          onClick={handleSave}
        >
          Save
        </button>
        <button
          className="px-4 py-2 mb-4 ml-2 md:ml-0 secondary-button"
          onClick={handleReset}
        >
          Reset to Defaults
        </button>
      </div>
    </div>
  );
};

export default PrognosticFactorsGrid;
