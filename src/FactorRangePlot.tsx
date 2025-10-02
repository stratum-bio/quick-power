import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { type ParsedFactor } from "./types/demo_types.d";
import { PLOT_COLORS } from "./constants";
import { processFactorRangeData } from "./utils/factorRangePlotUtils";

interface FactorRangePlotProps {
  factors: ParsedFactor[];
}

const FactorRangePlot: React.FC<FactorRangePlotProps> = ({ factors }) => {
  const { chartData, groupNames } = processFactorRangeData(factors);

  if (groupNames.size == 0) {
    return <div>No data</div>;
  }

  console.log(factors.map((f) => f.value_range)); 

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={chartData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis label={{ value: "", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Legend />
        {Array.from(groupNames).map((name, index) => {
          const color = PLOT_COLORS[index % PLOT_COLORS.length];
          return <Bar dataKey={name} fill={color} />;
        })}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default FactorRangePlot;
