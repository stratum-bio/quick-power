import React, { useState, useEffect } from 'react';
import { Biomarker, type PrognosticFactorTable, type GroupType, type PrognosticFactor } from './types/prognostic-factors.d';
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


const PrognosticFactorAllocation: React.FC = () => {
  const [prognosticFactors, setPrognosticFactors] = useState<PrognosticFactorTable | null>(null);
  const [selectedBiomarker, setSelectedBiomarker] = useState<Biomarker | ''>('');
  const [allocations, setAllocations] = useState<Record<string, { original: number; target: number }>>({});

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

  const currentFactor: PrognosticFactor | undefined = selectedBiomarker && prognosticFactors ? prognosticFactors[selectedBiomarker] : undefined;

  return (
    <div className="">
      <p>
      Verify the original subgroup allocation according to Table 1 of the trial publication,
      then specify a target subgroup allocation distribution for simulation.
      </p>
      <div className="mb-4">
        <label htmlFor="biomarker-select" className="block font-bold mt-4">Biomarker</label>
        <select
          id="biomarker-select"
          className="mt-1 block w-full pl-3 pr-10 py-2 border border-gray-300 focus:border-gemini-blue rounded-md"
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
          <div className="grid grid-cols-4 gap-2 items-center font-bold mb-2">
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
                className="w-24 p-1 border border-gray-300 rounded"
                value={allocations[`${selectedBiomarker}-reference`]?.original ?? 0}
                onChange={(e) => handleAllocationChange(`${selectedBiomarker}-reference`, 'original', e.target.value)}
                min="0"
              />
            </div>
            <div>
              <input
                type="number"
                className="w-24 p-1 border border-gray-300 rounded"
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
                  className="w-24 p-1 border border-gray-300 rounded"
                  value={allocations[`${selectedBiomarker}-comparison-${index}`]?.original ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-comparison-${index}`, 'original', e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <input
                  type="number"
                  className="w-24 p-1 border border-gray-300 rounded"
                  value={allocations[`${selectedBiomarker}-comparison-${index}`]?.target ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-comparison-${index}`, 'target', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrognosticFactorAllocation;
