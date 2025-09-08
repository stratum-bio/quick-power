import React, { useState, useEffect } from "react";
import {
  Area,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

import { linspace } from "./utils/survival";
import { getPercentiles } from "./utils/simulate";
import { formatLegend } from "./utils/formatters.tsx";
import { InlineMathTooltip } from "./InlineMathTooltip";
import type { TTEDistributionWorkerResult } from "./types/tteDistribution";

import Worker from "./workers/tteDistribution.worker.ts?worker";

interface TTEDistributionProps {
  baselineHazard: number;
  hazardRatio: number;
  totalSampleSize: number;
  accrual: number;
  followup: number;
  beta: number;
  controlProportion: number;
  treatProportion: number;
}

interface HazardDistPlotData {
  sample_size: number;
  true_baseline_tte: number;
  true_treat_tte: number;
  control_hazard: [number, number];
  treat_hazard: [number, number];
  pvalue_median: number;
  pvalue_bounds: [number, number];
}

const TTEDistributionPlot: React.FC<TTEDistributionProps> = ({
  totalSampleSize,
  baselineHazard,
  hazardRatio,
  accrual,
  followup,
  beta,
  controlProportion,
  treatProportion,
}) => {
  const [data, setData] = useState<HazardDistPlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const worker = new Worker();
    const permutationCount = 100;
    const datasetSimCount = 100;
    const percentiles = [2.5, 97.5];
    const sampleEvalPoints = linspace(0, totalSampleSize * 1.5, 11);
    if (!sampleEvalPoints.includes(totalSampleSize)) {
      sampleEvalPoints.push(totalSampleSize);
      sampleEvalPoints.sort();
    }
    const jobs = sampleEvalPoints.slice(1);
    setTotal(jobs.length);
    setCompleted(0);

    const results: TTEDistributionWorkerResult[] = [];
    worker.onmessage = (e) => {
      results.push(e.data);
      setCompleted(results.length);
      if (results.length === jobs.length) {
        const processedData = results
          .map((result) => ({
            ...result,
            baseInterval: getPercentiles(result.controlHazardDist, percentiles),
            treatInterval: getPercentiles(result.treatHazardDist, percentiles),
            pvalueInterval: getPercentiles(result.pValueDist, [0.5, 0, beta]),
          }))
          .map((result) => ({
            sample_size: result.sampleSize,
            true_baseline_tte: 1 / baselineHazard,
            true_treat_tte: 1 / (baselineHazard * hazardRatio),
            control_hazard: [
              1 / result.baseInterval[1],
              1 / result.baseInterval[0],
            ],
            treat_hazard: [
              1 / result.treatInterval[1],
              1 / result.treatInterval[0],
            ],
            pvalue_median: result.pvalueInterval[0],
            pvalue_bounds: [
              result.pvalueInterval[1],
              result.pvalueInterval[2],
            ],
          }));
        processedData.sort((a, b) => a.sample_size - b.sample_size);
        // @ts-expect-error I have no idea how else to handle this
        setData(processedData);
        setLoading(false);
        worker.terminate();
      }
    };

    jobs.forEach((sampleSize) => {
      worker.postMessage({
        sampleSize,
        controlProportion,
        treatProportion,
        baselineHazard,
        hazardRatio,
        accrual,
        followup,
        permutationCount,
        datasetSimCount,
      });
    });

    return () => {
      worker.terminate();
    };
  }, [
    totalSampleSize,
    baselineHazard,
    hazardRatio,
    accrual,
    followup,
    beta,
    controlProportion,
    treatProportion,
  ]);

  if (loading) {
    const percentage = total > 0 ? (completed / total) * 100 : 0;
    return (
      <div className="flex h-[500px] flex-col items-center justify-center">
        <p className="mb-2 text-gray-600">
          {completed}/{total}{" "}
        </p>
        <div className="h-2.5 w-1/2 rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            className="h-2.5 rounded-full bg-blue-600"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  }

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
        <XAxis
          dataKey="sample_size"
          type="number"
          label={{
            value: "Sample Size",
            position: "insideBottom",
            offset: -10,
          }}
          domain={[0, "auto"]}
        />
        <YAxis
          label={{
            value: "Estimated Mean TTE",
            angle: -90,
            position: "insideLeft",
            dy: 60,
          }}
        />
        <Tooltip
          content={(props) => (
            <InlineMathTooltip {...props} round={true} xName="Sample\ size" />
          )}
        />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <ReferenceLine
          x={totalSampleSize}
          stroke="darkred"
          strokeOpacity={0.5}
          name="n_{samples}"
        />
        <Area
          dataKey="control_hazard"
          stroke="black"
          fill="black"
          fillOpacity={0.2}
          strokeOpacity={0.3}
          strokeWidth={2}
          name="95\%\ CI"
          legendType="none"
        />
        <Line
          dataKey="true_baseline_tte"
          stroke="black"
          dot={false}
          name="1 / \lambda_B"
          strokeWidth={2}
        />

        <Area
          dataKey="treat_hazard"
          stroke="blue"
          fill="blue"
          fillOpacity={0.2}
          strokeOpacity={0.3}
          strokeWidth={2}
          name="95\%\ CI"
          legendType="none"
        />
        <Line
          dataKey="true_treat_tte"
          stroke="blue"
          dot={false}
          name="1 / \lambda_A"
          strokeWidth={2}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export default TTEDistributionPlot;
