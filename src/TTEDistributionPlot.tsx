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
import { formatLegend } from "./utils/formatters.tsx";
import { InlineMathTooltip } from "./InlineMathTooltip";
import { ValidatedInputField } from "./ValidatedInputField";
import type { TTEDistributionWorkerResult } from "./types/tteDistribution";

import Worker from "./workers/tteDistribution.worker.ts?worker";

interface TTEDistributionProps {
  baselineHazard: number;
  hazardRatio: number;
  totalSampleSize: number;
  accrual: number;
  followup: number;
  alpha: number;
  beta: number;
  controlProportion: number;
  treatProportion: number;
  controlLabel: string;
  treatLabel: string;
  forceUpdate: boolean;
}

interface HazardDistPlotData {
  sample_size: number;
  true_baseline_tte: number;
  true_treat_tte: number;
  control_hazard: [number, number];
  treat_hazard: [number, number];
  pvalue_upper: number;
}

function propsAreEqual(
  a: TTEDistributionProps,
  b: TTEDistributionProps,
): boolean {
  const keys = Object.keys(a);

  // Check if all properties and their values are the same
  for (const key of keys) {
    const propKey = key as keyof TTEDistributionProps;
    if (a[propKey] !== b[propKey]) {
      return false;
    }
  }

  return true;
}

const MIN_SAMPLE_SIZE = 100;

const TTEDistributionPlot: React.FC<TTEDistributionProps> = ({
  totalSampleSize,
  baselineHazard,
  hazardRatio,
  accrual,
  followup,
  alpha,
  beta,
  controlProportion,
  treatProportion,
  controlLabel,
  treatLabel,
  forceUpdate = false,
}) => {
  const allProperties = {
    totalSampleSize,
    baselineHazard,
    hazardRatio,
    accrual,
    followup,
    alpha,
    beta,
    controlProportion,
    treatProportion,
    controlLabel,
    treatLabel,
    forceUpdate,
  };

  const [properties, setProperties] =
    useState<TTEDistributionProps>(allProperties);
  const [data, setData] = useState<HazardDistPlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  const [permutationCount, setPermutationCount] = useState(100);
  const [datasetSimCount, setDatasetSimCount] = useState(100);
  const [evaluationCount, setEvaluationCount] = useState(11);
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    setLoading(true);

    const worker = new Worker();
    const sampleEvalPoints = linspace(
      MIN_SAMPLE_SIZE,
      totalSampleSize,
      evaluationCount,
    ).map((s) => Math.round(s));
    if (!sampleEvalPoints.includes(totalSampleSize)) {
      sampleEvalPoints.push(totalSampleSize);
      sampleEvalPoints.sort();
    }
    const jobs = sampleEvalPoints;
    setTotal(jobs.length);
    setCompleted(0);

    const results: TTEDistributionWorkerResult[] = [];
    worker.onmessage = (e) => {
      results.push(e.data);
      setCompleted(results.length);
      if (results.length === jobs.length) {
        const processedData = results
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
            pvalue_upper: result.pvalueInterval[0],
          }));
        processedData.sort((a, b) => a.sample_size - b.sample_size);
        // @ts-expect-error I have no idea how else to handle this
        setData(processedData);
        setLoading(false);

        setProperties({
          totalSampleSize,
          baselineHazard,
          hazardRatio,
          accrual,
          followup,
          alpha,
          beta,
          controlProportion,
          treatProportion,
          controlLabel,
          treatLabel,
          forceUpdate,
        });

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
        beta,
      });
    });

    return () => {
      worker.terminate();
    };
  }, [triggerUpdate, forceUpdate]);
  /* eslint-enable react-hooks/exhaustive-deps */

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

  let containerClass = "";
  let mismatchMessage = "";
  if (!propsAreEqual(allProperties, properties)) {
    containerClass = "bg-red-100 rounded-lg";
    mismatchMessage =
      "Input values don't match simulation results, press the Update button to re-run the simulation";
  }

  return (
    <div className={containerClass}>
      <div className="pt-4 pl-4 justify-center">
        <p className="font-bold text-red-950 italic"> {mismatchMessage} </p>
      </div>
      <h3 className="font-bold text-l">Distribution of estimated mean time-to-event as a function of sample size</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            tickCount={10}
            dataKey="sample_size"
            type="number"
            label={{
              value: "Sample Size",
              position: "insideBottom",
              offset: -10,
            }}
            domain={[MIN_SAMPLE_SIZE, "auto"]}
          />
          <YAxis
            label={{
              value: "Estimated Mean TTE",
              angle: -90,
              position: "insideLeft",
              dy: 60,
            }}
            scale="linear"
          />
          <Tooltip
            content={(props) => (
              <InlineMathTooltip
                {...props}
                round={true}
                xName="\text{Sample\ size}"
              />
            )}
          />
          <Legend verticalAlign="top" align="right" formatter={formatLegend} />
          <Area
            dataKey="control_hazard"
            stroke="black"
            fill="black"
            fillOpacity={0.2}
            strokeOpacity={0.3}
            strokeWidth={2}
            name="\text{95\%\ CI}"
            legendType="none"
          />
          <Line
            dataKey="true_baseline_tte"
            stroke="black"
            dot={false}
            name={controlLabel}
            strokeWidth={2}
          />

          <Area
            dataKey="treat_hazard"
            stroke="blue"
            fill="blue"
            fillOpacity={0.2}
            strokeOpacity={0.3}
            strokeWidth={2}
            name="\text{95\%\ CI}"
            legendType="none"
          />
          <Line
            dataKey="true_treat_tte"
            stroke="blue"
            dot={false}
            name={treatLabel}
            strokeWidth={2}
          />
        </ComposedChart>
      </ResponsiveContainer>
      <h3 className="font-bold text-l">P-Value distribution as a function of sample size</h3>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart
          data={data}
          margin={{
            top: 5,
            right: 10,
            left: 0,
            bottom: 30,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            tickCount={10}
            dataKey="sample_size"
            type="number"
            label={{
              value: "Sample Size",
              position: "insideBottom",
              offset: -10,
            }}
            domain={[MIN_SAMPLE_SIZE, "auto"]}
          />
          <YAxis
            label={{
              value: "P-value",
              angle: -90,
              position: "insideLeft",
              dy: 60,
            }}
            domain={[0, 1]}
            tickCount={10}
            ticks={[0.025, 0.05, 0.075, 0.1, 0.2, 0.4, 0.8, 1.0]}
            scale="sqrt"
          />
          <Tooltip
            content={(props) => (
              <InlineMathTooltip
                {...props}
                round={true}
                xName="\text{Sample\ size}"
              />
            )}
          />
          <Legend verticalAlign="top" align="right" formatter={formatLegend} />
          <ReferenceLine
            y={alpha}
            stroke="darkred"
            strokeOpacity={0.5}
            name="\text{alpha}"
            label={{
              position: "insideBottomRight",
              value: `alpha=${alpha}`,
              fill: "darkred",
            }}
          />
          <Area
            type="monotone"
            dataKey="pvalue_upper"
            stroke="green"
            fill="green"
            fillOpacity={0.2}
            strokeOpacity={0.3}
            strokeWidth={2}
            name={`${beta * 100}\\%\\ \\text{One-sided Upper CI}`}
            legendType="plainline"
          />
        </ComposedChart>
      </ResponsiveContainer>
      <div className="flex flex-col items-end justify-center mt-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr_min-content] mr-16 gap-4 lg:mr-0">
          <ValidatedInputField
            label="Permutations"
            value={permutationCount}
            onValueChange={setPermutationCount}
            max={2000}
            min={1}
            keyValue="permutationCount"
            description="Number of random permutations used to sample the null distribution to compute the p-value for each instance of a simulated trial."
          />
          <ValidatedInputField
            label="Simulations"
            value={datasetSimCount}
            onValueChange={setDatasetSimCount}
            max={2000}
            min={1}
            keyValue="datasetSimCount"
            description="Number of simulated trials to perform for each sample size candidate."
          />
          <ValidatedInputField
            label="Evaluations"
            value={evaluationCount}
            onValueChange={setEvaluationCount}
            max={100}
            min={2}
            keyValue="sampleSizeEvals"
            description={`Number of different sample sizes to evaluate between 0 and ${totalSampleSize}`}
          />
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 mb-4"
            onClick={() => setTriggerUpdate(triggerUpdate + 1)}
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default TTEDistributionPlot;
