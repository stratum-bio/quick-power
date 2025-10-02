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
    [name]: 100 / factors.length,
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
    setSliderValues(() => newValues);
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setIncludedInNormalization((prev) => ({ ...prev, [name]: checked }));
    if (!checked) {
      handleSliderChange(name, "0");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 border rounded-lg shadow-md max-w-3xl">
      {Array.from(groupNames).map((name) => (
        <div key={name} className="grid grid-cols-[auto_1fr] gap-2 items-right">
          <div className="w-24">
          <input
            type="checkbox"
            id={`checkbox-${name}`}
            checked={includedInNormalization[name]}
            onChange={(e) => {
              handleCheckboxChange(name, e.target.checked);
              handleNormalize();
            }}
            className="justify-self-end"
          />
          <label htmlFor={`checkbox-${name}`} className="text-left ml-4">
            {name}
          </label>
          </div>
          <input
            type="range"
            id={name}
            name={name}
            min="0"
            max="100"
            value={sliderValues[name]}
            onChange={(e) => handleSliderChange(name, e.target.value)}
            disabled={!includedInNormalization[name]}
            className="w-full"
          />
        </div>
      ))}
    </div>
  );
};

export default FactorRangeInput;
