import React, { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import type { KaplanMeier } from "./types/trialdata";
import  { InlineMathTooltip } from "./InlineMathTooltip";

interface KaplanMeierPlotProps {
  trialName: string;
}

interface PlotData {
  time: number;
  probability: number;
  interval: [number, number];
}

const KaplanMeierPlot: React.FC<KaplanMeierPlotProps> = ({ trialName }) => {
  const [plotData, setPlotData] = useState<PlotData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/ct1.v1/${trialName}-kmcurve.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: KaplanMeier = await response.json();

        const transformedData: PlotData[] = data.time.map((t, index) => ({
          time: t,
          probability: data.probability[index],
          interval: data.interval[index],
        }));
        setPlotData(transformedData);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trialName]);

  if (loading) {
    return <div>Loading plot data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ComposedChart
        data={plotData}
        margin={{
          top: 15,
          right: 10,
          bottom: 0,
          left: 10,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis
          dataKey="time"
          label={{ value: "Time", position: "insideBottom", offset: -10 }}
          domain={[0, "dataMax"]}
          type="number"
        />
        <YAxis
          label={{ value: "Probability", angle: -90, position: "insideLeft" }}
        />
        <Tooltip
          content={(props) => (
            <InlineMathTooltip {...props} round={true} xName="\text{Time}" />
          )}
        />
        <Area
          type="monotone"
          dataKey="interval"
          stroke="none"
          fill="blue"
          fillOpacity={0.3}
          yAxisId={0}
          name="log-log\ \text{CI}"
        />
        <Line type="monotone" dataKey="probability" stroke="blue" dot={false} name="S(t)"/>
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default KaplanMeierPlot;
