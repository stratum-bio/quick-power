import React, { useState } from "react";
import { DISEASE_VAL_TO_NAME } from "./constants";
import FactorRangeInput from "./FactorRangeInput";
import { AgeFactors } from "./data/filter-factor-age";
import { ECOGFactors } from "./data/filter-factor-ecog";

const TrialFilter: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<string>(
    Object.keys(DISEASE_VAL_TO_NAME)[0],
  );
  const [selectedFactor, setSelectedFactor] = useState<"Age" | "ECOG">("Age");

  const handleDiseaseChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDisease(event.target.value);
  };

  const handleFactorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedFactor(event.target.value as "Age" | "ECOG");
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <label htmlFor="disease-select" className="option-label">
          Select Disease:
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
          <option value="Age">Age</option>
          <option value="ECOG">ECOG</option>
        </select>
      </div>
      <h2 className="option-label">Select target distribution</h2>

      <div className="max-w-lg">
      {selectedFactor === "Age" && (
        <FactorRangeInput factors={AgeFactors} />
      )}

      {selectedFactor === "ECOG" && (
        <FactorRangeInput factors={ECOGFactors} />
      )}
      </div>
    </div>
  );
};

export default TrialFilter;
