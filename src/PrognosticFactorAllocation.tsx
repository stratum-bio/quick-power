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
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="biomarker-select" className="block">Biomarker</label>
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
          <div className="mb-2">
            <p className="font-medium">Reference Group:</p>
            <div className="flex items-center space-x-2">
              <span>{formatGroup(currentFactor.reference_group)}</span>
              <div className="flex flex-col">
                <label className="text-xs">Original</label>
                <input
                  type="number"
                  className="w-24 p-1 border rounded"
                  value={allocations[`${selectedBiomarker}-reference`]?.original ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-reference`, 'original', e.target.value)}
                  min="0"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs">Target</label>
                <input
                  type="number"
                  className="w-24 p-1 border rounded"
                  value={allocations[`${selectedBiomarker}-reference`]?.target ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-reference`, 'target', e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          <p className="font-medium mt-4">Comparison Groups:</p>
          {currentFactor.comparison_group_list.map((comparison, index) => (
            <div key={index} className="flex items-center space-x-2 mb-2">
              <span>{formatGroup(comparison.group)} (HR: {comparison.hazard_ratio})</span>
              <div className="flex flex-col">
                <label className="text-xs">Original</label>
                <input
                  type="number"
                  className="w-24 p-1 border rounded"
                  value={allocations[`${selectedBiomarker}-comparison-${index}`]?.original ?? 0}
                  onChange={(e) => handleAllocationChange(`${selectedBiomarker}-comparison-${index}`, 'original', e.target.value)}
                  min="0"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-xs">Target</label>
                <input
                  type="number"
                  className="w-24 p-1 border rounded"
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
