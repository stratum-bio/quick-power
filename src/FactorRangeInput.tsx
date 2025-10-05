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
  resetTrigger: number;
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
  resetTrigger,
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

  useEffect(() => {
    setSliderValues(initialValues);
    onValuesChange(valuesToQuery(factorByName, initialValues));
  }, [resetTrigger]);

  if (groupNames.length == 0) {
    return <div>No data</div>;
  }

  const handleInput = (name: string) => {
    const idx = groupNames.indexOf(name);
    if (idx == -1) {
      console.log("Error, could not find ", name);
      return;
    }
    const newSliderValues = {
      [name]: 100,
    };
    for (let i = 1; i < 3; i++) {
      const left = idx - i;
      const right = idx + i;

      if (left >= 0) {
        newSliderValues[groupNames[left]] = 100 / 2.5 ** i;
      }
      if (right < groupNames.length) {
        newSliderValues[groupNames[right]] = 100 / 2.5 ** i;
      }
    }
    const totalSum = Object.values(newSliderValues).reduce(
      (acc, v) => acc + v,
      0,
    );
    const normSliderValues: Record<string, number> = {};
    Object.entries(newSliderValues).forEach(([key, val]) => {
      normSliderValues[key] = (val * 100) / totalSum;
    });

    console.log(newSliderValues, normSliderValues, totalSum);
    setSliderValues(normSliderValues);
    onValuesChange(valuesToQuery(factorByName, normSliderValues));
  };
  console.log("sliderValues ", sliderValues);
  return (
    <div className="">
      <div className="mt-4 mb-4">
        Select the group of interest to modify the target distribution for
        searching the trials
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
                handleInput(state.activeLabel);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<></>} cursor={{ fill: "#e6efff" }} />
            <Bar dataKey="value" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FactorRangeInput;
