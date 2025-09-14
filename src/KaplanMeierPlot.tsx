import React, { useEffect, useState } from "react";
import Loading from "./Loading";
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
import type { KaplanMeierByArm, Trial } from "./types/trialdata";
import { InlineMathTooltip } from "./InlineMathTooltip";
import { PLOT_COLORS } from "./constants";
import { formatLegend } from "./utils/formatters.tsx";
import { calculateKaplanMeier } from "./utils/kaplan-meier";
import AppError from "./AppError"; // Import the AppError component

interface KaplanMeierPlotProps {
  trialName: string;
  trialData?: Trial;
}

interface TransformedPlotDataItem {
  time: number;
  [key: string]: number | [number, number] | number; // time, armName_probability, armName_interval
}

const KaplanMeierPlot: React.FC<KaplanMeierPlotProps> = ({ trialName, trialData }) => {
  const [plotData, setPlotData] = useState<TransformedPlotDataItem[]>([]); // Changed type to any[] for dynamic keys
  const [armNames, setArmNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/ct1.v1/${trialName}-kmcurve.json`);
        if (!response.ok) {
          throw new Error(`Data not found.  Return status: ${response.status}`);
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

        if (trialData) {
          trialData.arms.map((arm) => {
            const arm_events = arm.events.map((e) => e ? 1 : 0 );
            const ts_km = calculateKaplanMeier(arm.time, arm_events);
            ts_km.time.map((time, idx) => {
              let timePoint = timePointMap.get(time);
              if (!timePoint) {
                timePoint = { time: time }
                timePointMap.set(time, timePoint);
              }
              timePoint[`ts_${arm.arm_name}_probability`] = ts_km.probability[idx];
            });
          });
        }

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
        setTimeScale(data.time_scale);
      } catch {
        setError("Trial data not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trialName]);

  if (loading) {
    return <Loading message="Loading plot data..." />;
  }

  if (error) {
    return <AppError errorMessage={error} />;
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
          label={{
            value: `Time (${timeScale})`,
            position: "insideBottom",
            offset: -10,
          }}
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
                legendType="plainline"
              />
              { trialData && (
                <Line
                  type="monotone"
                  dataKey={`ts_${armName}_probability`}
                  dot={{stroke: color, strokeWidth: 2}}
                  stroke={color}
                  strokeOpacity={0.2}
                  name={`\\text{TS ${armName.replace(/_/g, "\\_")}}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default KaplanMeierPlot;
