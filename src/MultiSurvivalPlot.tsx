import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "katex/dist/katex.min.css";

import { formatLegend } from "./utils/formatters.tsx";
import {
  evalExponentialCurve,
} from "./utils/survival";
import { InlineMathTooltip } from "./InlineMathTooltip";

interface MultiSurvivalProps {
  names: string[];
  lambdas: number[];
  maxTime: number;
}

const MultiSurvivalPlot: React.FC<MultiSurvivalProps> = ({
  names,
  lambdas,
  maxTime,
}) => {
  // this is for adding evaluation points to observe
  // more of the parametric curve
  const numPoints = 21;

  const allCurvesData = lambdas.map((lambda_entry, idx) => ({
    name: names[idx],
    data: evalExponentialCurve(maxTime, numPoints, lambda_entry),
  }));

  const chartData = [];
  for (let i = 0; i < numPoints; i++) {
    const point: { time: number; [key: string]: number } = {
      time: allCurvesData[0].data[i].time,
    };
    allCurvesData.forEach((curveEntry) => {
      point[`${curveEntry.name}_surv`] = curveEntry.data[i].survProb;
    });
    chartData.push(point);
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={chartData}
        margin={{
          top: 15,
          right: 10,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          type="number"
          domain={[0, "auto"]}
          label={{ value: "Time", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          type="number"
          domain={[0, 1]}
          label={{
            value: "Survival probability",
            angle: -90,
            position: "insideLeft",
            dy: 60,
          }}
        />
        <Tooltip
          content={(props) => (
            <InlineMathTooltip {...props} round={true} xName="\text{Time}" />
          )}
        />
        <Legend verticalAlign="top" align="center" formatter={formatLegend} />
        {allCurvesData.map((curveEntry, idx) => (
          <Line
            key={idx}
            type="monotone"
            dataKey={`${curveEntry.name}_surv`}
            stroke={`hsl(${(idx * 240) % 360}, 70%, 50%)`}
            name={`\\text{${curveEntry.name.replace(/_/g, '\\_')}}`}
            dot={false}
            legendType="plainline"
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MultiSurvivalPlot;
