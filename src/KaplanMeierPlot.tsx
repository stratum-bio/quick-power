import React, { useEffect, useState } from "react";
import {
  Legend,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
} from "recharts";
import type { KaplanMeierByArm } from "./types/trialdata";
import { InlineMathTooltip } from "./InlineMathTooltip";
import { PLOT_COLORS } from "./constants";
import { formatLegend } from "./utils/formatters.tsx";

interface KaplanMeierPlotProps {
  trialName: string;
}

interface TransformedPlotDataItem {
  time: number;
  [key: string]: number | [number, number] | number; // time, armName_probability, armName_interval
}

const KaplanMeierPlot: React.FC<KaplanMeierPlotProps> = ({ trialName }) => {
  const [plotData, setPlotData] = useState<TransformedPlotDataItem[]>([]); // Changed type to any[] for dynamic keys
  const [armNames, setArmNames] = useState<string[]>([]);
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
        const data: KaplanMeierByArm = await response.json(); // Changed type to KaplanMeierByArm

        // Transform KaplanMeierByArm into a format suitable for Recharts with multiple lines/areas
        const timePointMap = new Map<number, TransformedPlotDataItem>();

        data.curves.forEach((curve, armIndex) => {
          const armName = data.arm_names[armIndex];
          curve.time.forEach((time, i) => {
            let timePoint = timePointMap.get(time);
            if (!timePoint) {
              timePoint = { time };
              timePointMap.set(time, timePoint);
            }
            timePoint[`${armName}_probability`] = curve.probability[i];
            timePoint[`${armName}_interval`] = curve.interval[i];
          });
        });

        const sortedData: TransformedPlotDataItem[] = Array.from(
          timePointMap.values(),
        ).sort((a, b) => a.time - b.time);
        const transformedData: TransformedPlotDataItem[] = [];
        let cumulativeData = { ...sortedData[0] };
        for (let i = 0; i < sortedData.length; i++) {
          const entry = sortedData[i];
          cumulativeData = {
            ...cumulativeData,
            ...entry,
          };
          transformedData.push(cumulativeData);
        }
        setPlotData(transformedData);
        setArmNames(data.arm_names);
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
          bottom: 10,
          left: 10,
        }}
      >
        <CartesianGrid stroke="#f5f5f5" />
        <XAxis
          dataKey="time"
          label={{ value: "Time (Months)", position: "insideBottom", offset: -10 }}
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
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        {armNames.map((armName, index) => {
          const color = PLOT_COLORS[index % PLOT_COLORS.length];
          return (
            <React.Fragment key={armName}>
              <Area
                type="monotone"
                dataKey={`${armName}_interval`}
                stroke={color}
                strokeOpacity={0.3}
                fill={color}
                fillOpacity={0.3}
                yAxisId={0}
                name={`\\text{${armName.replace(/_/g, "\\_")} log-log CI}`}
                legendType="none"
              />
              <Line
                type="monotone"
                dataKey={`${armName}_probability`}
                stroke={color}
                dot={false}
                name={`\\text{${armName.replace(/_/g, "\\_")}}`}
              />
            </React.Fragment>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default KaplanMeierPlot;
