import React, { useState, useEffect } from "react";
import { type Range, type FactorQuery } from "./types/demo_types.d";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";


import { rangeToString } from "./utils/factorRangePlotUtils";

interface FactorRangeInputProps {
  factors: Range[];
  onValuesChange: (query: FactorQuery) => void;
}

function valuesToQuery(
  rangeByName: Record<string, Range>,
  valuesByName: Record<string, number>,
): FactorQuery {
  const intervals: Range[] = [];
  const values: number[] = [];
  for (const [name, interval] of Object.entries(rangeByName)) {
    intervals.push(interval);
    values.push(valuesByName[name]);
  }

  return {
    intervals: intervals,
    values: values,
  };
}

const FactorRangeInput: React.FC<FactorRangeInputProps> = ({
  factors,
  onValuesChange,
}) => {
  const factorByName = factors.reduce(
    (acc, f) => {
      acc[rangeToString(f)] = f;
      return acc;
    },
    {} as { [key: string]: Range },
  );
  const groupNames = Object.keys(factorByName);
  const initialValues = Array.from(groupNames).reduce(
    (acc, name) => ({
      ...acc,
      [name]: 100 / factors.length,
    }),
    {},
  );

  useEffect(() => {
    onValuesChange(valuesToQuery(factorByName, initialValues));
  }, []);

  const [sliderValues, setSliderValues] =
    useState<Record<string, number>>(initialValues);
  const [includedInNormalization, setIncludedInNormalization] = useState<
    Record<string, boolean>
  >(groupNames.reduce((acc, name) => ({ ...acc, [name]: true }), {}));

  if (groupNames.length == 0) {
    return <div>No data</div>;
  }

  const handleSliderChange = (name: string, value: string) => {
    const newSliderValues = {
      ...sliderValues,
      [name]: Number(value),
    };
    setSliderValues(newSliderValues);
    onValuesChange(valuesToQuery(factorByName, newSliderValues));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setIncludedInNormalization((prev) => {
      const newState = { ...prev, [name]: checked };
      const activeGroupNames = Array.from(groupNames).filter(
        (groupName) => newState[groupName],
      );
      const numActiveGroups = activeGroupNames.length;

      if (numActiveGroups === 0) {
        const newSliderValues = Array.from(groupNames).reduce(
          (acc, groupName) => ({ ...acc, [groupName]: 0 }),
          {},
        );
        setSliderValues(newSliderValues);
        onValuesChange(valuesToQuery(factorByName, newSliderValues));
      } else {
        const normalizedValue = 100 / numActiveGroups;
        const newSliderValues = Array.from(groupNames).reduce(
          (acc, groupName) => {
            if (newState[groupName]) {
              return { ...acc, [groupName]: normalizedValue };
            } else {
              return { ...acc, [groupName]: 0 };
            }
          },
          {},
        );
        setSliderValues(newSliderValues);
        onValuesChange(valuesToQuery(factorByName, newSliderValues));
      }
      return newState;
    });
    if (!checked) {
      handleSliderChange(name, "0");
    }
  };
  return (
    <div className="p-4">
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={Array.from(groupNames).map((name) => ({
              name,
              value: sliderValues[name],
            }))}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className={`grid grid-cols-${groupNames.length} gap-2 items-right`}>
      {Array.from(groupNames).map((name) => (
          <div key={name} >
            <input
              type="checkbox"
              id={`checkbox-${name}`}
              checked={includedInNormalization[name]}
              onChange={(e) => {
                handleCheckboxChange(name, e.target.checked);
              }}
              className="justify-self-end"
            />
            <label htmlFor={`checkbox-${name}`} className="text-left ml-4">
              {name}
            </label>
          </div>
      ))}
      </div>
    </div>
  );
};

export default FactorRangeInput;
