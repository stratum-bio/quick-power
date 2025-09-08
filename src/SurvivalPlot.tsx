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
  baselineToTreatmentSurvival,
  type SurvivalPoint,
} from "./utils/survival";
import { InlineMathTooltip } from "./InlineMathTooltip";

interface LinePlotProps {
  baseSurv: SurvivalPoint[];
  hazardRatio: number;
}

const SurvivalPlot: React.FC<LinePlotProps> = ({ baseSurv, hazardRatio }) => {
  const formattedData = baseSurv.map((point, index) => ({
    name: `Point ${index + 1}`, // A generic name for each point
    time: point.time,
    survProb: point.survProb,
    treat: baselineToTreatmentSurvival(point.survProb, hazardRatio),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
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
          content={(props) => <InlineMathTooltip {...props} round={true} />}
        />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <Line
          type="monotone"
          dataKey="survProb"
          stroke="black"
          activeDot={{ r: 8 }}
          name="S_B(t)"
        />
        <Line
          type="monotone"
          dataKey="treat"
          stroke="blue"
          activeDot={{ r: 8 }}
          name="S_A(t)"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SurvivalPlot;
