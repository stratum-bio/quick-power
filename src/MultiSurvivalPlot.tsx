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
  linspace,
  evaluateExponential,
  evaluateWeibull,
} from "./utils/survival";
import { InlineMathTooltip } from "./InlineMathTooltip";
import { PLOT_COLORS } from "./constants";
import type { Weibull } from "./types/trialdata.d";

interface MultiSurvivalProps {
  names: string[];
  lambdas: number[];
  maxTime: number;
  weibulls: { [key: string]: Weibull };
}

const MultiSurvivalPlot: React.FC<MultiSurvivalProps> = ({
  names,
  lambdas,
  maxTime,
  weibulls,
}) => {
  // this is for adding evaluation points to observe
  // more of the parametric curve
  const numPoints = 21;
  const timepoints = linspace(1e-3, maxTime, numPoints);

  const allCurvesData = lambdas.map((lambda_entry, idx) => ({
    name: names[idx],
    exponential: evaluateExponential(timepoints, lambda_entry),
    weibull: evaluateWeibull(
      timepoints,
      weibulls[names[idx]].scale,
      weibulls[names[idx]].shape,
    ),
  }));

  const chartData = [];
  for (let i = 0; i < numPoints; i++) {
    const point: { time: number; [key: string]: number } = {
      time: timepoints[i],
    };
    allCurvesData.forEach((curveEntry) => {
      point[`${curveEntry.name}_exponential`] = curveEntry.exponential[i];
      point[`${curveEntry.name}_weibull`] = curveEntry.weibull[i];
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
          domain={[0, maxTime]}
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
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        {allCurvesData.map((curveEntry, idx) => (
          <React.Fragment>
            <Line
              key={idx}
              type="monotone"
              dataKey={`${curveEntry.name}_exponential`}
              stroke={PLOT_COLORS[idx % PLOT_COLORS.length]}
              strokeDasharray="5 5"
              name={`\\text{${curveEntry.name.replace(/_/g, "\\_")} (Exponential)}`}
              dot={false}
            />
            <Line
              key={idx}
              type="monotone"
              dataKey={`${curveEntry.name}_weibull`}
              stroke={PLOT_COLORS[idx % PLOT_COLORS.length]}
              name={`\\text{${curveEntry.name.replace(/_/g, "\\_")} (Weibull)}`}
              dot={false}
              legendType="plainline"
            />
          </React.Fragment>
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

export default MultiSurvivalPlot;
