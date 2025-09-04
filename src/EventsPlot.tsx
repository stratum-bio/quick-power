import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import 'katex/dist/katex.min.css';

import { formatLegend } from './utils/formatters.tsx';
import { baselineToTreatmentSurvival, type SurvivalPoint } from './utils/survival'; 
import { InlineMathTooltip } from './InlineMathTooltip';

interface LinePlotProps {
  baseSurv: SurvivalPoint[];
  hazardRatio: number;
  aProportion: number;
  bProportion: number;
  sampleSize: number;
}


const EventsPlot: React.FC<LinePlotProps> = ({ baseSurv, hazardRatio, aProportion, bProportion, sampleSize }) => {
  const formattedData = baseSurv.map((point, index) => ({
    name: `Point ${index + 1}`, // A generic name for each point
    time: point.time,
    survProb: point.survProb,
    treatProb: baselineToTreatmentSurvival(point.survProb, hazardRatio),
  }));

  const bEnrolled = sampleSize * bProportion;
  const aEnrolled = sampleSize * aProportion;

  const eventSumData = formattedData.map((entry) => ({
    time: entry.time,
    bEventSum: Math.round(bEnrolled * (1 - entry.survProb)),
    aEventSum: Math.round(aEnrolled * (1 - entry.treatProb)),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={eventSumData}
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
          label={{ value: "Estimated Event Count", angle: -90, position: "insideLeft", dy: 60 }}
        />
        <Tooltip content={(props) => <InlineMathTooltip {...props} round={false} />} />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <Line type="monotone" dataKey="bEventSum" stroke="black" activeDot={{ r: 8 }} name="Group\ B\ (Control)" />
        <Line type="monotone" dataKey="aEventSum" stroke="blue" activeDot={{ r: 8 }} name="Group\ A\ (Treatment)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default EventsPlot;
