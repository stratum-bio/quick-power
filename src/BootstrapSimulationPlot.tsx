import React, { useState, useMemo, useEffect } from "react";
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
import { InlineMath } from "react-katex";

import { linspace } from "./utils/survival";
import { formatLegend } from "./utils/formatters.tsx";
import { InlineMathTooltip } from "./InlineMathTooltip";
import type { Trial, TrialArmData } from "./types/trialdata.d";
import { weibullToMedian } from "./utils/survival";

import type { SimulationWorkerResult } from "./types/simulationWorker.d";

import { ValidatedInputField } from "./ValidatedInputField";

import Worker from "./workers/bootstrappedSimulation.worker.ts?worker";

const MIN_SAMPLE_SIZE = 100;
const ALPHA = 0.05;

interface TrackedBootstrapSimulationProps {
  controlArmName: string;
  treatArmName: string;
  totalSampleSize: number;
  accrual: number;
  followup: number;
  controlLabel: string;
  treatLabel: string;
  forceUpdate: boolean;
}

interface BootstrapSimulationProps extends TrackedBootstrapSimulationProps {
  trial: Trial;
}

interface HazardDistPlotData {
  sample_size: number;
  true_baseline_tte: number | null;
  true_treat_tte: number | null;
  control_hazard: number[];
  treat_hazard: number[];
  pvalue_80: number;
  pvalue_90: number;
}

function propsAreEqual(
  a: TrackedBootstrapSimulationProps,
  b: TrackedBootstrapSimulationProps,
): boolean {
  const keys = Object.keys(a);

  // Check if all properties and their values are the same
  for (const key of keys) {
    const propKey = key as keyof TrackedBootstrapSimulationProps;
    if (a[propKey] !== b[propKey]) {
      return false;
    }
  }

  return true;
}

function findArm(trial: Trial, name: string): TrialArmData {
  for (const arm of trial.arms) {
    if (arm.arm_name === name) {
      return arm;
    }
  }

  throw new Error("Invalid arm: " + name);
}

function correctBounds(results: HazardDistPlotData[]) {
  for (let i = results.length - 2; i >= 0; i--) {
    const r = results[i];
    if (!isFinite(r.control_hazard[0])) {
      r.control_hazard[0] = results[i + 1].control_hazard[0];
    }
    if (!isFinite(r.control_hazard[1])) {
      r.control_hazard[1] = results[i + 1].control_hazard[1];
    }
    if (!isFinite(r.treat_hazard[0])) {
      r.treat_hazard[0] = results[i + 1].treat_hazard[0];
    }
    if (!isFinite(r.treat_hazard[1])) {
      r.treat_hazard[1] = results[i + 1].treat_hazard[1];
    }
  }
}

const BootstrapSimulationPlot: React.FC<BootstrapSimulationProps> = ({
  trial,
  controlArmName,
  treatArmName,
  totalSampleSize,
  accrual,
  followup,
  controlLabel,
  treatLabel,
  forceUpdate = false,
}) => {
  const allProperties = {
    controlArmName,
    treatArmName,
    totalSampleSize,
    accrual,
    followup,
    controlLabel,
    treatLabel,
    forceUpdate,
  };

  const [properties, setProperties] =
    useState<TrackedBootstrapSimulationProps>(allProperties);
  const [data, setData] = useState<HazardDistPlotData[]>([]);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);

  const [datasetSimCount, setDatasetSimCount] = useState(500);
  const [evaluationCount, setEvaluationCount] = useState(11);
  const [triggerUpdate, setTriggerUpdate] = useState(0);

  const [minSampleSize, setMinSampleSize] = useState(MIN_SAMPLE_SIZE);
  const [maxSampleSize, setMaxSampleSize] = useState(totalSampleSize);

  const controlArm = findArm(trial, controlArmName);
  const treatArm = findArm(trial, treatArmName);

  const controlTimes = new Float64Array(controlArm.time);
  const controlEvents = new Uint8Array(
    controlArm.events.map((e) => (e ? 1 : 0)),
  );
  const treatTimes = new Float64Array(treatArm.time);
  const treatEvents = new Uint8Array(treatArm.events.map((e) => (e ? 1 : 0)));

  let baseMedianTTE = null;
  let treatMedianTTE = null;
  const weibullByArm = trial.meta.weibull_by_arm;
  if (controlArmName in weibullByArm) {
    baseMedianTTE = weibullToMedian(weibullByArm[controlArmName]);
  }
  if (treatArmName in weibullByArm) {
    treatMedianTTE = weibullToMedian(weibullByArm[treatArmName]);
  }

  useEffect(() => {
    setLoading(true);

    const worker = new Worker();
    const sampleEvalPoints = linspace(
      minSampleSize,
      maxSampleSize,
      evaluationCount,
    ).map((s) => Math.round(s));
    const jobs = sampleEvalPoints;
    setTotal(jobs.length);
    setCompleted(0);

    const results: SimulationWorkerResult[] = [];
    worker.onmessage = (e) => {
      results.push(e.data);
      setCompleted(results.length);
      if (results.length === jobs.length) {
        const processedData: HazardDistPlotData[] = results
          .map((result) => ({
            sample_size: result.sampleSize,
            true_baseline_tte: baseMedianTTE,
            true_treat_tte: treatMedianTTE,
            control_hazard: [
              1 / result.baseInterval[1],
              1 / result.baseInterval[0],
            ],
            treat_hazard: [
              1 / result.treatInterval[1],
              1 / result.treatInterval[0],
            ],
            pvalue_80: result.pvalueInterval[0],
            pvalue_90: result.pvalueInterval[1] - result.pvalueInterval[0],
            rmst_pvalue_80: result.rmstPValueInterval
              ? result.rmstPValueInterval[0]
              : null,
            rmst_pvalue_90: result.rmstPValueInterval
              ? result.rmstPValueInterval[1] - result.rmstPValueInterval[0]
              : null,
          }))
          .map((result) => ({
            // convert the means to medians
            // this assumes the exponential distribution
            ...result,
            control_hazard: result.control_hazard.map((v) => v * Math.log(2)),
            treat_hazard: result.treat_hazard.map((v) => v * Math.log(2)),
          }));
        processedData.sort((a, b) => a.sample_size - b.sample_size);

        correctBounds(processedData);
        setData(processedData);
        setLoading(false);

        setProperties({
          controlArmName,
          treatArmName,
          totalSampleSize,
          accrual,
          followup,
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
        accrual,
        followup,
        datasetSimCount,
        controlTimes,
        controlEvents,
        treatTimes,
        treatEvents,
      });
    });

    return () => {
      worker.terminate();
    };
  }, [triggerUpdate, forceUpdate]);

  const memoMedianDistPlot = useMemo(() => {
    return (
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
            domain={[minSampleSize, "auto"]}
          />
          <YAxis
            label={{
              value: "Estimated Median TTE",
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
    );
  }, [data]);

  const memoPValuePlot = useMemo(() => {
    return (
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
            domain={[minSampleSize, "auto"]}
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
            y={ALPHA}
            stroke="darkred"
            strokeOpacity={0.5}
            name="\text{alpha}"
            label={{
              position: "insideBottomRight",
              value: `alpha=${ALPHA}`,
              fill: "darkred",
            }}
          />
          <Area
            type="linear"
            dataKey="pvalue_80"
            stroke="#8dd1e1"
            fill="#8dd1e1"
            fillOpacity={0.5}
            strokeOpacity={0.7}
            strokeWidth={2}
            name="\text{80\% Upper CI, Log Rank}"
            legendType="plainline"
            stackId="1"
          />
          <Area
            type="linear"
            dataKey="pvalue_90"
            stroke="#a4de6c"
            fill="#a4de6c"
            fillOpacity={0.5}
            strokeOpacity={0.7}
            strokeWidth={2}
            name="\text{90\% Upper CI, Log Rank}"
            legendType="plainline"
            stackId="1"
          />

          <Area
            type="linear"
            dataKey="rmst_pvalue_80"
            stroke="#8dd1e1"
            strokeOpacity={0.7}
            strokeWidth={3}
            strokeDasharray="5 5"
            fill="none"
            name="\text{80\% Upper CI, RMST}"
            legendType="plainline"
            stackId="0"
          />
          <Area
            type="linear"
            dataKey="rmst_pvalue_90"
            stroke="#a4de6c"
            strokeOpacity={0.7}
            strokeWidth={3}
            strokeDasharray="5 5"
            fill="none"
            name="\text{90\% Upper CI, RMST}"
            legendType="plainline"
            stackId="0"
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }, [data]);

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
      "Input values don't match simulation results, press the a simulation button to re-run the simulation";
  }

  return (
    <div className={containerClass}>
      <div className="pt-4 pb-4 text-center">
        <p className="font-bold text-red-950 italic"> {mismatchMessage} </p>
      </div>
      <h3 className="font-bold text-l">
        P-Value distribution as a function of sample size
      </h3>
      <p>
        Here we have the sampling distribution of p-values comparing log rank
        test to the the RMST difference test. In order to reach our target
        <InlineMath math="\beta" /> threshold set above, we want the estimated
        p-value to be at most <InlineMath math="\alpha=0.05" /> at the 80th
        (blue) or 90th (green) percentile of the p-value sampling distribution.
        The RMST is dashed while the log rank test is solid.
      </p>
      {memoPValuePlot}
      <h3 className="font-bold text-l">
        Distribution of estimated median time-to-event as a function of sample
        size
      </h3>
      <p>
        Each iteration of the simulation fits an exponential distribution and
        computes the median TTE proportional to the inverse exponential hazard
        rate. This is a slightly mixed analysis because the solid line is the
        median derived from the Weibull model while the sampling distribution is
        using the exponential model. This is a work in progress and will be
        updated to estimate the Weibull parameters shortly.
      </p>
      {memoMedianDistPlot}
      <div className="flex flex-col items-center lg:items-end justify-center mt-4 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ValidatedInputField
            label="Min Sample Size"
            value={minSampleSize}
            onValueChange={setMinSampleSize}
            min={1}
            max={5000}
            step={100}
            keyValue="minSampleSize"
            description="Minimum sample size for evaluation."
          />
          <ValidatedInputField
            label="Max Sample Size"
            value={maxSampleSize}
            onValueChange={setMaxSampleSize}
            min={1}
            max={10000}
            step={100}
            keyValue="maxSampleSize"
            description="Maximum sample size for evaluation."
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <button
            className="bg-gemini-blue text-white rounded hover:bg-gemini-blue-hover" 
            onClick={() => {
              setDatasetSimCount(500);
              setEvaluationCount(11);
              setTriggerUpdate(triggerUpdate + 1);
            }}
          >
            Quick, Noisy
          </button>
          <button
            className="bg-gemini-blue text-white rounded hover:bg-gemini-blue-hover" 
            onClick={() => {
              setDatasetSimCount(1000);
              setEvaluationCount(21);
              setTriggerUpdate(triggerUpdate + 1);
            }}
          >
            Slow, Less Noisy
          </button>
          <button
            className="bg-gemini-blue text-white rounded hover:bg-gemini-blue-hover" 
            onClick={() => {
              setDatasetSimCount(10000);
              setEvaluationCount(21);
              setTriggerUpdate(triggerUpdate + 1);
            }}
          >
            Very Slow, Accurate
          </button>
        </div>
      </div>
      <div className="mt-8">
        <p>
          Update the sample size evaluation range and press a button to re-run
          the simulation.
        </p>
        <br />
        <ul>
          <li>
            <span className="font-bold">Quick, Noisy</span>
          </li>
          <li>
            Quick simulation taking less than a minute while being the most
            unstable estimates
          </li>
          <li>
            {" "}
            <br />{" "}
          </li>
          <li>
            <span className="font-bold">Slow, Less Noisy</span>
          </li>
          <li>More accurate simulation taking a few minutes</li>
          <li>
            {" "}
            <br />{" "}
          </li>
          <li>
            <span className="font-bold">Very Slow, Accurate</span>
          </li>
          <li>
            {" "}
            Most accurate simulation taking around 10 minutes (just leave tab
            open while you work on something else)
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BootstrapSimulationPlot;
