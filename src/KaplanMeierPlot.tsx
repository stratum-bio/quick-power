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
import { type AllocationChange } from "./types/prognostic-factors.d";
import { recompose_survival } from "./utils/decomposition";

interface KaplanMeierPlotProps {
  trialName: string;
  trialData?: Trial;
  allocationChange?: AllocationChange;
}

interface TransformedPlotDataItem {
  time: number;
  [key: string]: number | [number, number] | number; // time, armName_probability, armName_interval
}

function accumulatePoints(
  data: TransformedPlotDataItem[],
): TransformedPlotDataItem[] {
  const transformedData: TransformedPlotDataItem[] = [];
  let cumulativeData = { ...data[0] };
  for (let i = 0; i < data.length; i++) {
    const entry = data[i];
    cumulativeData = {
      ...cumulativeData,
      ...entry,
    };
    transformedData.push(cumulativeData);
  }
  return transformedData;
}

function sortAndAccumulate(
  data: TransformedPlotDataItem[],
): TransformedPlotDataItem[] {
  const sortedData = data.sort((a, b) => a.time - b.time);
  return accumulatePoints(sortedData);
}

function kaplanMeierToTimePoints(
  data: KaplanMeierByArm,
): Map<number, TransformedPlotDataItem> {
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
      if (curve.interval) {
        timePoint[`${armName}_interval`] = curve.interval[i];
      }
    });
  });

  return timePointMap;
}

// TODO: update this to separate curve recomposition
// and the time point augmentation
function addFactorAllocation(
  data: KaplanMeierByArm,
  timePointMap: Map<number, TransformedPlotDataItem>,
  allocationChange: AllocationChange,
) {
  data.curves.forEach((curve, armIndex) => {
    const armName = data.arm_names[armIndex];
    const originalAllocations = [
      allocationChange.original.reference,
      ...allocationChange.original.comparisons,
    ];
    const targetAllocations = [
      allocationChange.target.reference,
      ...allocationChange.target.comparisons,
    ];
    const recomposedCurve = recompose_survival(
      curve,
      originalAllocations.map((val) => val / 100),
      targetAllocations.map((val) => val / 100),
      allocationChange.hazardRatios,
    );

    recomposedCurve.time.forEach((time, i) => {
      let timePoint = timePointMap.get(time);
      if (!timePoint) {
        timePoint = { time: time };
        timePointMap.set(time, timePoint);
      }
      timePoint[`recomposed_${armName}_probability`] =
        recomposedCurve.probability[i];
    });
  });
}

function addDebugTrialData(
  trialData: Trial,
  timePointMap: Map<number, TransformedPlotDataItem>,
) {
  trialData.arms.map((arm) => {
    const arm_events = arm.events.map((e) => (e ? 1 : 0));
    const ts_km = calculateKaplanMeier(arm.time, arm_events);
    ts_km.time.map((time, idx) => {
      let timePoint = timePointMap.get(time);
      if (!timePoint) {
        timePoint = { time: time };
        timePointMap.set(time, timePoint);
      }
      timePoint[`ts_${arm.arm_name}_probability`] = ts_km.probability[idx];
    });
  });
}

const KaplanMeierPlot: React.FC<KaplanMeierPlotProps> = ({
  trialName,
  trialData,
  allocationChange,
}) => {
  const [data, setData] = useState<KaplanMeierByArm | null>(null);
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
        const data: KaplanMeierByArm = await response.json();
        setData(data);
        setArmNames(data.arm_names);
        setTimeScale(data.time_scale);
      } catch (error) {
        console.log(error);
        setError("Trial data not found");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [trialName]);

  useEffect(() => {
    if (!data) {
      return;
    }

    const timePointMap = kaplanMeierToTimePoints(data);
    if (allocationChange) {
      addFactorAllocation(data, timePointMap, allocationChange);
    }

    if (trialData) {
      addDebugTrialData(trialData, timePointMap);
    }

    const transformedData = sortAndAccumulate(
      Array.from(timePointMap.values()),
    );
    setPlotData(transformedData);
  }, [data, trialData, allocationChange]);

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
                strokeOpacity={allocationChange ? 0.5 : 1.0}
                name={`\\text{${armName.replace(/_/g, "\\_")}}`}
                legendType="plainline"
              />
              {trialData && (
                <Line
                  type="monotone"
                  dataKey={`ts_${armName}_probability`}
                  dot={{ stroke: color, strokeWidth: 2 }}
                  stroke={color}
                  strokeOpacity={0.2}
                  name={`\\text{TS ${armName.replace(/_/g, "\\_")}}`}
                />
              )}
              {allocationChange && (
                <Line
                  type="monotone"
                  dataKey={`recomposed_${armName}_probability`}
                  // dot={{ stroke: color, strokeWidth: 2 }}
                  dot={false}
                  stroke={color}
                  legendType="plainline"
                  name={`\\text{target ${armName.replace(/_/g, "\\_")}}`}
                  strokeWidth={2.5}
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
