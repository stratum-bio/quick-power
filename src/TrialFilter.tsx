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
        <label htmlFor="disease-select" className="block text-lg font-medium text-gray-700">
          Select Disease:
        </label>
        <select
          id="disease-select"
          value={selectedDisease}
          onChange={handleDiseaseChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          {Object.entries(DISEASE_VAL_TO_NAME).map(([key, value]) => (
            <option key={key} value={key}>
              {value}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label htmlFor="factor-select" className="block text-lg font-medium text-gray-700">
          Factor:
        </label>
        <select
          id="factor-select"
          value={selectedFactor}
          onChange={handleFactorChange}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="Age">Age</option>
          <option value="ECOG">ECOG</option>
        </select>
      </div>

      {selectedFactor === "Age" && (
        <>
          <h2 className="text-xl font-semibold mb-2">Age Factors</h2>
          <FactorRangeInput factors={AgeFactors} />
        </>
      )}

      {selectedFactor === "ECOG" && (
        <>
          <h2 className="text-xl font-semibold mb-2 mt-4">ECOG Factors</h2>
          <FactorRangeInput factors={ECOGFactors} />
        </>
      )}
    </div>
  );
};

export default TrialFilter;
