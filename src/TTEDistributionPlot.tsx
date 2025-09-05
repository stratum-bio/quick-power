import React from "react";
import {
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import { linspace } from "./utils/survival";
import { getPercentiles, simulate } from "./utils/simulate";
import { formatLegend } from "./utils/formatters.tsx";
import { InlineMathTooltip } from "./InlineMathTooltip";

interface TTEDistributionProps {
  baselineHazard: number;
  treatmentHazard: number;
  totalSampleSize: number;
}

const TTEDistributionPlot: React.FC<TTEDistributionProps> = ({
  baselineHazard,
  treatmentHazard,
  totalSampleSize,
}) => {
  const simulationCount = 100;
  const percentiles = [2.5, 97.5];
  const sampleEvalPoints = linspace(0, totalSampleSize * 1.5, 21);

  const data = sampleEvalPoints
    .slice(1)
    .map((sampleSize) => ({
      ...simulate(baselineHazard, treatmentHazard, simulationCount, sampleSize),
      sampleSize: sampleSize,
    }))
    .map((result) => ({
      ...result,
      baseInterval: getPercentiles(result.baseLambdaDist, percentiles),
      treatInterval: getPercentiles(result.treatLambdaDist, percentiles),
    }))
    .map((result) => ({
      sample_size: result.sampleSize,
      true_baseline_tte: Math.log(2) / baselineHazard,
      true_treat_tte: Math.log(2) / treatmentHazard,
      control_hazard: [
        Math.log(2) / result.baseInterval[0],
        Math.log(2) / result.baseInterval[1],
      ],
      treat_hazard: [
        Math.log(2) / result.treatInterval[0],
        Math.log(2) / result.treatInterval[1],
      ],
    }));

  return (
    <ResponsiveContainer width="100%" height={500}>
      <ComposedChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 30,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="sample_size"
          type="number"
          label={{
            value: "Sample Size",
            position: "insideBottom",
            offset: -10,
          }}
          domain={[0, "auto"]}
        />
        <YAxis
          label={{
            value: "Estimated Median TTE",
            angle: -90,
            position: "insideLeft",
            dy: 60,
          }}
        />
        <Tooltip
          content={(props) => <InlineMathTooltip {...props} round={true} />}
        />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <Area
          dataKey="control_hazard"
          stroke="black"
          fill="black"
          fillOpacity={0.2}
          strokeOpacity={0.3}
          strokeWidth={2}
          name="95\%\ CI"
          legendType="none"
        />
        <Line
          dataKey="true_baseline_tte"
          stroke="black"
          dot={false}
          name="log(2) / \lambda_B"
          strokeWidth={2}
        />

        <Area
          dataKey="treat_hazard"
          stroke="blue"
          fill="blue"
          fillOpacity={0.2}
          strokeOpacity={0.3}
          strokeWidth={2}
          name="95\%\ CI"
          legendType="none"
        />
        <Line
          dataKey="true_treat_tte"
          stroke="blue"
          dot={false}
          name="log(2) / \lambda_A"
          strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default TTEDistributionPlot;
