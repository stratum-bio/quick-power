import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Biomarker,
  type DiseasePrognosticFactorTable,
  type GroupType,
  type PrognosticFactor,
  type AllocationChange,
  type Allocation,
} from "./types/prognostic-factors.d";
import { loadPrognosticFactors } from "./utils/prognosticFactorsStorage";
import { DiseaseType } from "./types/prognostic-factors.d";

type AllocationState = Record<string, { original: number; target: number }>;

function initializeAllocations(
  selectedBiomarker: Biomarker,
  diseaseFactors: DiseasePrognosticFactorTable,
): AllocationState {
  const initialAllocations: AllocationState = {};
  const factorList = diseaseFactors[selectedBiomarker] ?? [];

  for (let factorRefIdx = 0; factorRefIdx < factorList.length; factorRefIdx++) {
    const factor = factorList[factorRefIdx];
    // Initialize reference group allocation
    initialAllocations[`${selectedBiomarker}-${factorRefIdx}-reference`] = {
      original: 0,
      target: 0,
    };
    // Initialize comparison group allocations
    factor.comparison_group_list.forEach((_comp, index) => {
      initialAllocations[
        `${selectedBiomarker}-${factorRefIdx}-comparison-${index}`
      ] = {
        original: 0,
        target: 0,
      };
    });
  }
  return initialAllocations;
}

function formatNumberInput(value: number | undefined | null): string {
  if (value || value == 0) {
    return value.toString();
  }
  return "";
}

function parseNumberInput(value: string): number | null {
  const parsed = parseFloat(value);
  if (parsed || parsed === 0) {
    return parsed;
  }
  return null;
}

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

interface PrognosticFactorAllocationProps {
  onUpdate: (allocationChange: AllocationChange | undefined) => void;
  disease: DiseaseType;
}

const PrognosticFactorAllocation: React.FC<PrognosticFactorAllocationProps> = ({
  onUpdate,
  disease,
}) => {
  const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | "">(
    "",
  );
  const [selectedFactorRefIdx, setSelectedFactorRefIdx] = useState<number>(0);
  const [allocations, setAllocations] = useState<AllocationState>({});
  const [validationMessage, setValidationMessage] = useState<{
    text: string;
    type: "success" | "error";
  } | null>(null);

  const prognosticFactors: DiseasePrognosticFactorTable =
    loadPrognosticFactors(disease);

  useEffect(() => {
    if (selectedBiomarker && prognosticFactors) {
      setAllocations(
        initializeAllocations(
          selectedBiomarker as Biomarker,
          prognosticFactors,
        ),
      );
    }
  }, [selectedBiomarker]);

  const handleBiomarkerChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedBiomarker(event.target.value as Biomarker);
    setSelectedFactorRefIdx(0);
    setValidationMessage(null);
  };

  const handleFactorRefChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    console.log(event);
    setSelectedFactorRefIdx(parseInt(event.target.value));
  };

  const handleAllocationChange = (
    key: string,
    type: "original" | "target",
    value: string,
  ) => {
    setAllocations((prev) => ({
      ...prev,
      [key]: { ...prev[key], [type]: parseNumberInput(value) },
    }));
    setValidationMessage(null);
  };

  const handleUpdate = () => {
    if (!selectedBiomarker) {
      setValidationMessage({
        text: "Select a biomarker to start",
        type: "error",
      });
      return;
    }

    let originalSum = 0;
    let targetSum = 0;

    Object.values(allocations).forEach((group) => {
      if (group.original) {
        originalSum += group.original;
      }
      if (group.target) {
        targetSum += group.target;
      }
    });

    if (originalSum === 100 && targetSum === 100) {
      if (!currentFactor) {
        throw new Error("currentFactor is " + currentFactor);
      }

      setValidationMessage({
        text: "Allocations updated successfully!",
        type: "success",
      });

      const originalAllocation: Allocation = {
        reference: allocations[`${selectedBiomarker}-reference`]?.original ?? 0,
        comparisons: currentFactor.comparison_group_list.map(
          (_, index) =>
            allocations[`${selectedBiomarker}-comparison-${index}`]?.original ??
            0,
        ),
      };

      const targetAllocation: Allocation = {
        reference: allocations[`${selectedBiomarker}-reference`]?.target ?? 0,
        comparisons: currentFactor.comparison_group_list.map(
          (_, index) =>
            allocations[`${selectedBiomarker}-comparison-${index}`]?.target ??
            0,
        ),
      };
      const hazardRatios = currentFactor.comparison_group_list.map(
        (compare) => compare.hazard_ratio ?? 1.0,
      );

      onUpdate({
        biomarker: selectedBiomarker as Biomarker,
        original: originalAllocation,
        target: targetAllocation,
        hazardRatios: [1, ...hazardRatios],
      });
    } else {
      setValidationMessage({
        text: `Error: Original sum is ${originalSum}%, Target sum is ${targetSum}%. Both must be 100%.`,
        type: "error",
      });
    }
  };

  const handleReset = () => {
    setValidationMessage(null);
    onUpdate(undefined);
    if ((selectedBiomarker as Biomarker) && prognosticFactors) {
      setAllocations(
        initializeAllocations(
          selectedBiomarker as Biomarker,
          prognosticFactors,
        ),
      );
      setSelectedFactorRefIdx(0);
    }
  };

  const currentRefList: PrognosticFactor[] | undefined = selectedBiomarker
    ? prognosticFactors?.[selectedBiomarker]
    : undefined;
  const currentFactor: PrognosticFactor | undefined =
    currentRefList?.[selectedFactorRefIdx];

  return (
    <div className="mt-4">
      <p>
        Verify the original subgroup allocation according to Table 1 of the
        trial publication, then specify a target subgroup allocation
        distribution for simulation.
      </p>
      <br />
      <p className="italic">
        Disclaimer: the default hazard ratios have not been thoroughly reviewed,
        please verify these are correct for your investigation and update them
        as needed.{" "}
        <Link to="/prognostic-factors" className="text-gemini-blue font-bold">
          Update the prognostic factor hazard ratios here.
        </Link>
      </p>
      <div className="mb-4">
        <label htmlFor="biomarker-select" className="option-label">
          Biomarker
        </label>
        <select
          id="biomarker-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 option-selector"
          value={selectedBiomarker}
          onChange={handleBiomarkerChange}
        >
          <option value="">-- Select --</option>
          {Object.keys(prognosticFactors)
            .sort()
            .map((bm) => (
              <option key={bm} value={bm}>
                {bm}
              </option>
            ))}
        </select>
      </div>
      {selectedBiomarker && currentRefList && currentRefList.length > 1 && (
        <div className="mb-4">
          <label htmlFor="biomarker-ref-select" className="option-label">
            Available reference group
          </label>
          <select
            id="biomarker-ref-select"
            className="mt-1 block w-full pl-3 pr-10 py-2 option-selector"
            value={selectedFactorRefIdx}
            onChange={handleFactorRefChange}
          >
            {currentRefList.map((ref, refIdx) => (
              <option key={`ref-${refIdx}`} value={refIdx}>
                {formatGroup(ref.reference_group)}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedBiomarker && currentFactor && (
        <div className="p-4 bg-">
          <div className="grid grid-cols-4 gap-2 items-center font-semibold text-gray-700 mb-2">
            <div>Group</div>
            <div>Hazard Ratio</div>
            <div>Original (%)</div>
            <div>Target (%)</div>
          </div>

          {/* Reference Group */}
          <div className="grid grid-cols-4 gap-2 items-center mb-2">
            <div>{formatGroup(currentFactor.reference_group)}</div>
            <div>Reference</div>{" "}
            {/* Reference group doesn't have a hazard ratio */}
            <div>
              <input
                className="w-16 md:w-20 md:w-24 p-1"
                value={formatNumberInput(
                  allocations[`${selectedBiomarker}-reference`]?.original,
                )}
                onChange={(e) =>
                  handleAllocationChange(
                    `${selectedBiomarker}-reference`,
                    "original",
                    e.target.value,
                  )
                }
                min="0"
                step="10"
              />
            </div>
            <div>
              <input
                className="w-16 md:w-20 md:w-24 p-1"
                value={formatNumberInput(
                  allocations[`${selectedBiomarker}-reference`]?.target,
                )}
                onChange={(e) =>
                  handleAllocationChange(
                    `${selectedBiomarker}-reference`,
                    "target",
                    e.target.value,
                  )
                }
                min="0"
                step="10"
              />
            </div>
          </div>

          {/* Comparison Groups */}
          {currentFactor.comparison_group_list.map((comparison, index) => (
            <div
              key={index}
              className="grid grid-cols-4 gap-2 items-center mb-2"
            >
              <div>{formatGroup(comparison.group)}</div>
              <div>{comparison.hazard_ratio}</div>
              <div>
                <input
                  className="w-16 md:w-20 md:w-24 p-1"
                  value={formatNumberInput(
                    allocations[`${selectedBiomarker}-comparison-${index}`]
                      ?.original,
                  )}
                  onChange={(e) =>
                    handleAllocationChange(
                      `${selectedBiomarker}-comparison-${index}`,
                      "original",
                      e.target.value,
                    )
                  }
                  min="0"
                  step="10"
                />
              </div>
              <div>
                <input
                  className="w-16 md:w-20 md:w-24 p-1"
                  value={formatNumberInput(
                    allocations[`${selectedBiomarker}-comparison-${index}`]
                      ?.target,
                  )}
                  onChange={(e) =>
                    handleAllocationChange(
                      `${selectedBiomarker}-comparison-${index}`,
                      "target",
                      e.target.value,
                    )
                  }
                  min="0"
                  step="10"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end space-x-2">
        <button className="px-4 py-2 main-button" onClick={handleUpdate}>
          Update Inputs
        </button>
        <button className="px-4 py-2 secondary-button" onClick={handleReset}>
          Reset
        </button>
      </div>

      {validationMessage && (
        <div
          className={`mt-2 p-2 rounded ${validationMessage.type === "success" ? "bg-success-2 text-success" : "bg-error-2 text-error"}`}
        >
          {validationMessage.text}
        </div>
      )}
    </div>
  );
};

export default PrognosticFactorAllocation;
