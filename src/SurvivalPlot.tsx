import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

import 'katex/dist/katex.min.css';
import { InlineMath } from 'react-katex';

interface Point {
  x: number;
  y: number;
}

interface LinePlotProps {
  data: Point[];
}


const formatLegend = (value: string) => {
  // const { color } = entry;

  // return <span style={{ color }}>{value}</span>;
  return <InlineMath math={value} />;
};


const SurvivalPlot: React.FC<LinePlotProps> = ({ data }) => {
  // Ensure data has a 'name' property for Recharts to display on XAxis if needed,
  // or use a custom XAxis tick formatter. For now, assuming x is numeric.
  const formattedData = data.map((point, index) => ({
    name: `Point ${index + 1}`, // A generic name for each point
    x: point.x,
    y: point.y,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="x" type="number" domain={[0, 'auto']} />
        <YAxis type="number" domain={[0, 1]} />
        <Tooltip />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <Line type="monotone" dataKey="y" stroke="black" activeDot={{ r: 8 }} name="S_B(t)" />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SurvivalPlot;
