import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "katex/dist/katex.min.css";

import { formatLegend } from "./utils/formatters.tsx";
import {
  baselineToTreatmentSurvival,
  evaluateExponential,
  fitExponential,
  evalExponentialCurve,
  type SurvivalPoint,
} from "./utils/survival";
import { InlineMathTooltip } from "./InlineMathTooltip";

interface LinePlotProps {
  baseSurv: SurvivalPoint[];
  hazardRatio: number;
}

const ExponentialSurvivalPlot: React.FC<LinePlotProps> = ({
  baseSurv,
  hazardRatio,
}) => {
  const formattedData = baseSurv.map((point) => ({
    time: point.time,
    baseSurvProb: point.survProb,
    treatSurvProb: baselineToTreatmentSurvival(point.survProb, hazardRatio),
  }));

  // this is for evaluating the parametric model on the
  // data points given
  const baseLambda = fitExponential(baseSurv);
  const treatLambda = fitExponential(
    formattedData.map((d) => ({
      time: d.time,
      survProb: d.treatSurvProb,
    })),
  );

  const origTime = baseSurv.map((e) => e.time);
  const baseEval = evaluateExponential(origTime, baseLambda);
  const treatEval = evaluateExponential(origTime, treatLambda);
  const evaluatedData = formattedData.map((entry, idx) => ({
    ...entry,
    expBaseSurv: baseEval[idx],
    expTreatSurv: treatEval[idx],
  }));

  // this is for adding evaluation points to observe
  // more of the parametric curve
  const numPoints = 21;
  const exponentialBase = evalExponentialCurve(origTime, numPoints, baseLambda);
  const exponentialTreat = evalExponentialCurve(
    origTime,
    numPoints,
    treatLambda,
  );
  const mergedExponential = exponentialBase.map((e, idx) => ({
    time: e.time,
    baseSurvProb: null,
    treatSurvProb: null,
    expBaseSurv: e.survProb,
    expTreatSurv: exponentialTreat[idx].survProb,
  }));

  const allPoints = [...evaluatedData, ...mergedExponential].sort(
    (a, b) => a.time - b.time,
  );

  const baseCurveLabel = `e^{-t / ${(1.0 / baseLambda).toFixed(3)}}`;
  const treatCurveLabel = `e^{-t / ${(1.0 / treatLambda).toFixed(3)}}`;

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={allPoints}
        margin={{
          top: 5,
          right: 10,
          left: 0,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="time"
          type="number"
          domain={[0, "auto"]}
          label={{ value: "Time", position: "insideBottom", offset: -10 }}
        />
        <YAxis
          type="number"
          domain={[0, 1]}
          label={{
            value: "Survival probability",
            angle: -90,
            position: "insideLeft",
            dy: 60,
          }}
        />
        <Tooltip
          content={(props) => (
            <InlineMathTooltip {...props} round={true} xName="\text{Time}" />
          )}
        />
        <Legend verticalAlign="top" align="right" formatter={formatLegend} />
        <Line
          type="monotone"
          dataKey="expBaseSurv"
          stroke="black"
          name={baseCurveLabel}
          dot={false}
          legendType="plainline"
        />
        <Line
          type="monotone"
          dataKey="baseSurvProb"
          stroke="black"
          name="S_B(t)"
          dot={{ fill: "black" }}
          legendType="circle"
        />

        <Line
          type="monotone"
          dataKey="expTreatSurv"
          stroke="blue"
          name={treatCurveLabel}
          dot={false}
          legendType="plainline"
        />
        <Line
          type="monotone"
          dataKey="treatSurvProb"
          stroke="blue"
          name="S_A(t)"
          dot={{ fill: "blue" }}
          legendType="circle"
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ExponentialSurvivalPlot;
