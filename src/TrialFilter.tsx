import React, { useState, useRef } from "react";
import { DISEASE_VAL_TO_NAME } from "./constants";
import FactorRangeInput from "./FactorRangeInput";
import { AgeFactors } from "./data/filter-factor-age";
import { ECOGFactors } from "./data/filter-factor-ecog";
import { type FactorQuery, FactorType } from "./types/demo_types.d";

interface TrialFilterProps {
  onApplyFilter: (
    disease: string,
    factor: FactorType,
    query: FactorQuery | null,
  ) => void;
}

const TrialFilter: React.FC<TrialFilterProps> = ({ onApplyFilter }) => {
  const queryRef = useRef<FactorQuery | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string>(
    Object.keys(DISEASE_VAL_TO_NAME)[0],
  );
  const [selectedFactor, setSelectedFactor] = useState<FactorType>(
    FactorType.ECOG,
  );

  const handleDiseaseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDisease(event.target.value);
  };

  const handleFactorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFactor(event.target.value as FactorType);
  };

  const handleFactorRangeChange = (query: FactorQuery) => {
    queryRef.current = query;
  };

  return (
    <div className="p-4">
      <p className="italic">This functionality is still under development.</p>
      <div className="mb-4 mt-4">
        <label htmlFor="disease-select" className="option-label">
          Disease
        </label>
        <select
          id="disease-select"
          value={selectedDisease}
          onChange={handleDiseaseChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 option-selector"
        >
          {Object.entries(DISEASE_VAL_TO_NAME).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="factor-select" className="option-label">
          Factor:
        </label>
        <select
          id="factor-select"
          value={selectedFactor}
          onChange={handleFactorChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 option-selector"
        >
          <option value={FactorType.AGE}>Age</option>
          <option value={FactorType.ECOG}>ECOG</option>
        </select>
      </div>
      <h2 className="option-label">Select target distribution</h2>

      <div>
        {selectedFactor === FactorType.AGE && (
          <FactorRangeInput
            factors={AgeFactors}
            onValuesChange={handleFactorRangeChange}
          />
        )}

        {selectedFactor === FactorType.ECOG && (
          <FactorRangeInput
            factors={ECOGFactors}
            onValuesChange={handleFactorRangeChange}
          />
        )}
      </div>
      <div className="text-right">
        <button
          className="main-button mt-4"
          onClick={() => {
            onApplyFilter(selectedDisease, selectedFactor, queryRef.current);
          }}
        >
          Apply
        </button>
        <button
          className="secondary-button mt-4 ml-4"
          onClick={() => {
            onApplyFilter(selectedDisease, selectedFactor, null);
          }}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default TrialFilter;
