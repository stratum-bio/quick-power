import React, { useState, useEffect } from "react";
import { type Range, type FactorQuery } from "./types/demo_types.d";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
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
    <div className="">
      <div className="mt-4 mb-4">
      Select and deselect the groups to modify
      the target distribution for searching the
      trials
      </div>
      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer>
            <BarChart
            data={Array.from(groupNames).map((name) => ({
              name,
              value: sliderValues[name],
            }))}
            margin={{
              top: 5,
              right: 0,
              left: 0,
              bottom: 5,
            }}
            onClick={(state) => {
              if (state.activeLabel) {
                handleCheckboxChange(state.activeLabel, !includedInNormalization[state.activeLabel]);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<></>} cursor={{fill: "#e6efff" }}/>
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FactorRangeInput;
