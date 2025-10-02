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

interface FactorRangePlotProps {
  factors: ParsedFactor[];
}

const FactorRangePlot: React.FC<FactorRangePlotProps> = ({ factors }) => {
  const sortedFactors = factors.sort(
    (a, b) => (a.value_range.lower ?? 0) - (b.value_range.lower ?? 0),
  );

  const groupNames: Set<string> = new Set();
  const chartData: { [key: string]: number | string }[] = [];
  for (const factor of sortedFactors) {
    const vrange = factor.value_range;
    let name = "";
    if (vrange.relation == "=") {
      name = `${vrange.lower}`;
    } else if (vrange.lower && vrange.upper) {
      name = `${vrange.lower} - ${vrange.upper}`;
    } else if (vrange.lower) {
      name = `${vrange.lower}${vrange.relation}`;
    } else if (vrange.upper) {
      name = `${vrange.relation}${vrange.upper}`;
    }

    const entry: { [key: string]: number | string } = {
      name: name,
    };
    for (const group of factor.groups) {
      if (group.count || group.percentage) {
        const group_name = group.group_name.toLowerCase();
        groupNames.add(group_name);
        entry[group_name] = group.count ?? group.percentage ?? 0;
      }
    }

    chartData.push(entry);
  }

  if (groupNames.size == 0) {
    return <div>No data</div>;
  }

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
