import React, { useState, useEffect } from 'react';
import { Biomarker, type PrognosticFactorTable, type GroupType, type PrognosticFactor, type AllocationChange, type Allocation } from './types/prognostic-factors.d';
import { loadPrognosticFactors } from './utils/prognosticFactorsStorage';

const formatGroup = (group: GroupType): string => {
  if (group.type === "numerical") {
    const operator = group.operator;
    return `${operator} ${group.value} ${group.unit || ''}`.trim();
  } else if (group.type === "range") {
    return `${group.lower_bound}-${group.upper_bound} ${group.unit || ''}`.trim();
  } else { // categorical
    return group.category || '';
  }
};


interface PrognosticFactorAllocationProps {
  onUpdate: (allocationChange: AllocationChange) => void;
}

const PrognosticFactorAllocation: React.FC<PrognosticFactorAllocationProps> = ({ onUpdate }) => {
  const [prognosticFactors, setPrognosticFactors] = useState<PrognosticFactorTable | null>(null);
  const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | ''>('');
  const [allocations, setAllocations] = useState<Record<string, { original: number; target: number }>>({});
  const [validationMessage, setValidationMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    setPrognosticFactors(loadPrognosticFactors());
  }, []);

  useEffect(() => {
    if (selectedBiomarker && prognosticFactors) {
      const factor = prognosticFactors[selectedBiomarker];
      if (factor) {
        const initialAllocations: Record<string, { original: number; target: number }> = {};
        // Initialize reference group allocation
        initialAllocations[`${selectedBiomarker}-reference`] = { original: 0, target: 0 };
        // Initialize comparison group allocations
        factor.comparison_group_list.forEach((_comp, index) => {
          initialAllocations[`${selectedBiomarker}-comparison-${index}`] = { original: 0, target: 0 };
        });
        setAllocations(initialAllocations);
      }
    }
  }, [selectedBiomarker, prognosticFactors]);

  const handleBiomarkerChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedBiomarker(event.target.value as Biomarker);
  };

  const handleAllocationChange = (key: string, type: 'original' | 'target', value: string) => {
    setAllocations(prev => ({
      ...prev,
      [key]: { ...prev[key], [type]: parseFloat(value) || 0 },
    }));
  };

  const handleUpdate = () => {
    let originalSum = 0;
    let targetSum = 0;

    Object.values(allocations).forEach(group => {
      originalSum += group.original;
      targetSum += group.target;
    });

    if (originalSum === 100 && targetSum === 100) {
      if (!currentFactor) {
        throw new Error("currentFactor is " + currentFactor);
      }

      setValidationMessage({ text: 'Allocations updated successfully!', type: 'success' });

      const originalAllocation: Allocation = {
        reference: allocations[`${selectedBiomarker}-reference`]?.original ?? 0,
        comparisons: currentFactor.comparison_group_list.map((_, index) => allocations[`${selectedBiomarker}-comparison-${index}`]?.original ?? 0)
      };

      const targetAllocation: Allocation = {
        reference: allocations[`${selectedBiomarker}-reference`]?.target ?? 0,
        comparisons: currentFactor.comparison_group_list.map((_, index) => allocations[`${selectedBiomarker}-comparison-${index}`]?.target ?? 0)
      };

      onUpdate({
        biomarker: selectedBiomarker as Biomarker,
        original: originalAllocation,
        target: targetAllocation,
      });

    } else {
      setValidationMessage({ text: `Error: Original sum is ${originalSum}%, Target sum is ${targetSum}%. Both must be 100%.`, type: 'error' });
    }
  };

  const currentFactor: PrognosticFactor | undefined = selectedBiomarker && prognosticFactors ? prognosticFactors[selectedBiomarker] : undefined;

  return (
    <div className="mt-4">
      <p>
      Verify the original subgroup allocation according to Table 1 of the trial publication,
      then specify a target subgroup allocation distribution for simulation.
      </p>
      <div className="mb-4">
        <label htmlFor="biomarker-select" className="block mt-4 font-semibold text-gray-700">Biomarker</label>
        <select
          id="biomarker-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 focus:outline-none focus:border-gemini-blue focus:ring-gemini-blue rounded-md"
          value={selectedBiomarker}
          onChange={handleBiomarkerChange}
        >
          <option value="">-- Select --</option>
          {Object.values(Biomarker).map(bm => (
            <option key={bm} value={bm}>{bm}</option>
          ))}
        </select>
      </div>

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
            <div>Reference</div> {/* Reference group doesn't have a hazard ratio */}
            <div>
              <input
                type="number"
                className="w-24 p-1 border border-gray-300 focus:outline-none focus:border-gemini-blue focus:ring-gemini-blue rounded-md"
                value={allocations[`${selectedBiomarker}-reference`]?.original ?? 0}
                onChange={(e) => handleAllocationChange(`${selectedBiomarker}-reference`, 'original', e.target.value)}
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                className="w-24 p-1 border border-gray-300 focus:outline-none focus:border-gemini-blue focus:ring-gemini-blue rounded-md"
                value={allocations[`${selectedBiomarker}-reference`]?.target ?? 0}
                onChange={(e) => handleAllocationChange(`${selectedBiomarker}-reference`, 'target', e.target.value)}
                min="0"
              />
            </div>
          </div>

          {/* Comparison Groups */}
          {currentFactor.comparison_group_list.map((comparison, index) => (
            <div key={index} className="grid grid-cols-4 gap-2 items-center mb-2">
              <div>{formatGroup(comparison.group)}</div>
              <div>{comparison.hazard_ratio}</div>
              <div>
                <input
                  type="number"
                  className="w-24 p-1 border border-gray-300 focus:outline-none focus:border-gemini-blue focus:ring-gemini-blue rounded-md"
                  value={allocations[`${selectedBiomarker}-comparison-${index}`]?.original ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-comparison-${index}`, 'original', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-24 p-1 border border-gray-300 focus:outline-none focus:border-gemini-blue focus:ring-gemini-blue rounded-md"
                  value={allocations[`${selectedBiomarker}-comparison-${index}`]?.target ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-comparison-${index}`, 'target', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          className="px-4 py-2 bg-gemini-blue text-white rounded hover:bg-gemini-blue-hover"
          onClick={handleUpdate}
        >
          Update
        </button>
      </div>

      {validationMessage && (
        <div className={`mt-2 p-2 rounded ${validationMessage.type === 'success' ? 'bg-success-2 text-success' : 'bg-error-2 text-error'}`}>
          {validationMessage.text}
        </div>
      )}
    </div>
  );
};

export default PrognosticFactorAllocation;
