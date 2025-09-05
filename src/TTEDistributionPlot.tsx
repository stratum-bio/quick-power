
import React from 'react';
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
} from 'recharts';


import  { linspace } from './utils/survival';
import { getPercentiles, simulate } from './utils/simulate';


interface TTEDistributionProps {
  baselineHazard: number;
  treatmentHazard: number;
  totalSampleSize: number;
}

const TTEDistributionPlot: React.FC<TTEDistributionProps> = ({ baselineHazard, treatmentHazard, totalSampleSize }) => {
  const simulationCount = 100;
  const percentiles = [2.5, 97.5];
  const sampleEvalPoints = linspace(0, totalSampleSize * 1.5, 6);

  const data = sampleEvalPoints.map((sampleSize) => ({
    ...simulate(baselineHazard, treatmentHazard, simulationCount, sampleSize),
    sampleSize: sampleSize,
  })).map((result) => ({
    ...result,
    baseInterval: getPercentiles(result.baseLambdaDist, percentiles),
    treatInterval: getPercentiles(result.treatLambdaDist, percentiles),
  })).map((result) => ({
    sample_size: result.sampleSize,
    true_baseline_tte: Math.log(2) / baselineHazard,
    true_treat_tte: Math.log(2) / treatmentHazard,
    control_hazard: [
      result.baseInterval[0],
      result.baseInterval[1],
    ],
    treat_hazard: [
      result.treatInterval[0],
      result.treatInterval[1],
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
        <XAxis dataKey="sample_size" label={{ value: "Sample Size", position: "insideBottom", offset: -10 }} />
        <YAxis label={{ value: "Estimated Median TTE", angle: -90, position: "insideLeft", dy: 60}} />
        <Tooltip />
        <Legend verticalAlign="top" align="right"/>
        <Area
          dataKey="control_hazard"
          stroke="blue"
          fill="blue"
          fillOpacity={0.2}
          strokeOpacity={0.3}
          strokeWidth={2}
          name="Control 95% CI"
          legendType="none"
        />
        <Line
          dataKey="true_baseline_tte" 
          stroke="blue"
          dot={false}
          name="Control True TTE"
          strokeWidth={2}
        /> 

        <Area
          dataKey="treat_hazard" 
          stroke="darkred"
          fill="darkred"
          fillOpacity={0.2}
          strokeOpacity={0.3}
          strokeWidth={2}
          name="Treatment 95% CI"
          legendType="none"
        />
        <Line
          dataKey="true_treat_tte" 
          stroke="darkred"
          dot={false}
          name="Treatment True TTE"
          strokeWidth={2}
        /> 

      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default TTEDistributionPlot;
