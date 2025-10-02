
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ParsedFactor, Relationship } from './types/demo_types';

interface FactorRangePlotProps {
  factors: ParsedFactor[];
}

const FactorRangePlot: React.FC<FactorRangePlotProps> = ({ factors }) => {
  // Prepare data for Recharts
  const chartData = factors.map((factor, index) => {
    const name = factor.groups.length > 0 ? factor.groups[0].group_name : `Factor ${index + 1}`;
    return {
      name,
      lower: factor.age_range.lower,
      upper: factor.age_range.upper,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
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
        <YAxis label={{ value: 'Age', angle: -90, position: 'insideLeft' }} />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="lower" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="upper" stroke="#82ca9d" activeDot={{ r: 8 }} />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default FactorRangePlot;
