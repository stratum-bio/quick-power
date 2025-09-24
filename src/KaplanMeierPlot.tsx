import React, { useEffect, useState, useRef } from "react";
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
import { applyHazardRatio } from "./utils/decomposition";
import {
  type TransformedPlotDataItem,
  addCurveToMap,
} from "./utils/rechartsHelp";
import AppError from "./AppError"; // Import the AppError component
import { type AllocationChange } from "./types/prognostic-factors.d";
import AddFactorAllocationWorker from "./workers/addFactorAllocation.worker?worker";

interface KaplanMeierPlotProps {
  trialName: string;
  trialData?: Trial;
  allocationChange?: AllocationChange;
  controlArm?: string;
  treatArm?: string;
  controlHazardRatio?: number;
  treatHazardRatio?: number;
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
    addCurveToMap(timePointMap, curve, armName);
  });

  return timePointMap;
}

function addDebugTrialData(
  trialData: Trial,
  timePointMap: Map<number, TransformedPlotDataItem>,
) {
  trialData.arms.map((arm) => {
    const arm_events = arm.events.map((e) => (e ? 1 : 0));
    const ts_km = calculateKaplanMeier(arm.time, arm_events);
    addCurveToMap(timePointMap, ts_km, `ts_${arm.arm_name}`);
  });
}

function addHazardAdjustedCurves(
  timePointMap: Map<number, TransformedPlotDataItem>,
  data: KaplanMeierByArm,
  armName: string,
  hazardRatio: number,
  prefix: string,
) {
  const armIdx = data.arm_names.indexOf(armName);
  const km = data.curves[armIdx];
  const adjustedKM = applyHazardRatio(km, hazardRatio);
  addCurveToMap(timePointMap, adjustedKM, prefix);
}

const KaplanMeierPlot: React.FC<KaplanMeierPlotProps> = ({
  trialName,
  trialData,
  allocationChange,
  controlArm,
  treatArm,
  controlHazardRatio,
  treatHazardRatio,
}) => {
  const [data, setData] = useState<KaplanMeierByArm | null>(null);
  const [plotData, setPlotData] = useState<TransformedPlotDataItem[]>([]); // Changed type to any[] for dynamic keys
  const [armNames, setArmNames] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [timeScale, setTimeScale] = useState<string | null>(null);
  const plotContainerRef = useRef<HTMLDivElement>(null);

  const hasAdjustedHazard =
    controlArm &&
    treatArm &&
    controlHazardRatio &&
    treatHazardRatio &&
    (controlHazardRatio != 1.0 || treatHazardRatio != 1.0);

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
      const worker = new AddFactorAllocationWorker();
      worker.postMessage({
        data: data,
        timePointMapArray: Array.from(timePointMap.entries()),
        allocationChange: allocationChange,
        hazardRatios: [
          {
            armName: controlArm,
            armType: "control",
            hazardRatio: controlHazardRatio,
          },
          {
            armName: treatArm,
            armType: "treatment",
            hazardRatio: treatHazardRatio,
          },
        ],
      });

      worker.onmessage = (event) => {
        const updatedTimePointMap = new Map<number, TransformedPlotDataItem>(
          event.data.timePointMapArray,
        );
        if (trialData) {
          addDebugTrialData(trialData, updatedTimePointMap);
        }

        const transformedData = sortAndAccumulate(
          Array.from(updatedTimePointMap.values()),
        );
        setPlotData(transformedData);
        if (plotContainerRef.current) {
          plotContainerRef.current.focus();
        }
        worker.terminate();
      };

      worker.onerror = (error) => {
        console.error("Worker error:", error);
        setError("Error processing allocation change in worker.");
        worker.terminate();
      };
    } else {
      if (trialData) {
        addDebugTrialData(trialData, timePointMap);
      }

      const availableArms = new Set(data.arm_names);
      if (
        hasAdjustedHazard &&
        availableArms.has(controlArm) &&
        availableArms.has(treatArm)
      ) {
        addHazardAdjustedCurves(
          timePointMap,
          data,
          controlArm,
          controlHazardRatio,
          "control",
        );
        addHazardAdjustedCurves(
          timePointMap,
          data,
          treatArm,
          treatHazardRatio,
          "treatment",
        );
      }

      const transformedData = sortAndAccumulate(
        Array.from(timePointMap.values()),
      );
      setPlotData(transformedData);
    }
  }, [
    data,
    trialData,
    allocationChange,
    controlArm,
    treatArm,
    controlHazardRatio,
    treatHazardRatio,
  ]);

  if (loading) {
    return <Loading message="Loading plot data..." />;
  }

  if (error) {
    return <AppError errorMessage={error} />;
  }

  return (
    <div ref={plotContainerRef} tabIndex={-1} style={{ outline: "none" }}>
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
                  strokeOpacity={allocationChange ? 0.1 : 0.3}
                  fill={color}
                  fillOpacity={allocationChange ? 0.1 : 0.3}
                  yAxisId={0}
                  name={`\\text{${armName.replace(/_/g, "\\_")} log-log CI}`}
                  legendType="none"
                />
                <Line
                  type="monotone"
                  dataKey={`${armName}_probability`}
                  stroke={color}
                  dot={false}
                  strokeOpacity={allocationChange ? 0.3 : 1.0}
                  name={`\\text{${armName.replace(/_/g, "\\_")}}`}
                  legendType={
                    allocationChange || hasAdjustedHazard ? "none" : "plainline"
                  }
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
                    strokeOpacity={hasAdjustedHazard ? 0.7 : 1.0}
                    name={`\\text{adjusted ${armName.replace(/_/g, "\\_")}}`}
                    strokeWidth={hasAdjustedHazard ? 1.5 : 2.5}
                  />
                )}
              </React.Fragment>
            );
          })}
          {hasAdjustedHazard && (
            <React.Fragment>
              <Line
                type="monotone"
                dataKey="control_probability"
                dot={false}
                stroke="#008080"
                legendType="plainline"
                strokeOpacity={1.0}
                name="\text{overall control}"
                strokeWidth={2.5}
              />
              <Line
                type="monotone"
                dataKey="treatment_probability"
                dot={false}
                stroke="#FF7F50"
                legendType="plainline"
                strokeOpacity={1.0}
                name="\text{overall treatment}"
                strokeWidth={2.5}
              />
            </React.Fragment>
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default KaplanMeierPlot;
