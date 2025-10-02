import React, { useState } from "react";
import { type Range } from "./types/demo_types.d";
import { rangeToString} from "./utils/factorRangePlotUtils";

interface FactorRangeInputProps {
  factors: Range[];
}

const FactorRangeInput: React.FC<FactorRangeInputProps> = ({ factors }) => {
  const groupNames = factors.map( (f) => rangeToString(f) ) ;
  const initialValues = Array.from(groupNames).reduce((acc, name) => ({
    ...acc,
    [name]: 0,
  }), {});
  const [sliderValues, setSliderValues] = useState<Record<string, number>>(initialValues);
  const [includedInNormalization, setIncludedInNormalization] = useState<Record<string, boolean>>(
    groupNames.reduce((acc, name) => ({ ...acc, [name]: true }), {})
  );

  if (groupNames.length == 0) {
    return <div>No data</div>;
  }

  const handleSliderChange = (name: string, value: string) => {
    setSliderValues((prev) => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setIncludedInNormalization((prev) => ({ ...prev, [name]: checked }));
    if (!checked) {
      setSliderValues((prev) => ({ ...prev, [name]: 0 }));
    }
  };

  const handleNormalize = () => {
    const activeGroupNames = Array.from(groupNames).filter(
      (name) => includedInNormalization[name]
    );
    const numActiveGroups = activeGroupNames.length;

    if (numActiveGroups === 0) return;

    const normalizedValue = 100 / numActiveGroups;
    const newValues = Array.from(groupNames).reduce((acc, name) => {
      if (includedInNormalization[name]) {
        return { ...acc, [name]: normalizedValue };
      } else {
        return { ...acc, [name]: 0 };
      }
    }, {});
    setSliderValues(newValues);
  };

  return (
    <div>
      {Array.from(groupNames).map((name) => (
        <div key={name}>
          <input
            type="checkbox"
            id={`checkbox-${name}`}
            checked={includedInNormalization[name]}
            onChange={(e) => handleCheckboxChange(name, e.target.checked)}
          />
          <label htmlFor={`checkbox-${name}`}>{name}: {sliderValues[name].toFixed(2)}</label>
          <input
            type="range"
            id={name}
            name={name}
            min="0"
            max="100"
            value={sliderValues[name]}
            onChange={(e) => handleSliderChange(name, e.target.value)}
            disabled={!includedInNormalization[name]} // Disable slider if not included
          />
        </div>
      ))}
      <button onClick={handleNormalize}>Normalize</button>
    </div>
  );
};

export default FactorRangeInput;
