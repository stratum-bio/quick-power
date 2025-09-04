/* eslint-disable  @typescript-eslint/no-explicit-any */

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface Point {
  time: number;
  survProb: number;
}

interface LinePlotProps {
  baseSurv: Point[];
  hazardRatio: number;
}


const formatLegend = (value: string) => {
  return <InlineMath math={value} />;
};

interface TooltipPayload {
  name: string;
  value: any;
  unit?: string;
  stroke?: string;
  dataKey?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}


function baselineToTreatmentSurvival(baseSurv: number, hazardRatio: number): number {
  const cumulativeBaseHazard = - Math.log(baseSurv);
  const cumulativeTreatmentHazard = cumulativeBaseHazard * hazardRatio;
  return Math.E ** (- cumulativeTreatmentHazard);
} 


const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const isVisible = active && payload && payload.length;
  if (!isVisible) {
    return <></>; 
  }

  

  return (
    <div className="border border-black p-4 bg-white rounded-lg opacity-70" >
      {payload.map((entry, index) => (
        <p key={`item-${index}`} className="opacity-100 font-bold" style={{ color: entry.stroke }}>
          <InlineMath math={entry.name} />: {entry.value.toFixed(3)}
        </p>
      ))}
    </div>
  );
};


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
          right: 30,
          left: 20,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          type="number"
          domain={[0, 'auto']}
          label={{ value: "Time", position: "insideBottom", offset: -10 }} 
        />
        <YAxis
          type="number"
          domain={[0, 1]}
          label={{ value: "Survival probability", angle: -90, position: "insideLeft", dy: 60 }}
        />
        <Tooltip content={(props) => <CustomTooltip {...props} />} />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <Line type="monotone" dataKey="survProb" stroke="black" activeDot={{ r: 8 }} name="S_B(t)" />
        <Line type="monotone" dataKey="treat" stroke="blue" activeDot={{ r: 8 }} name="S_A(t)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SurvivalPlot;
