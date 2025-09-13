import type { Weibull } from "../types/trialdata.d";

export interface SurvivalPoint {
  time: number;
  survProb: number;
}

export interface ConfidenceEstimate {
  sampleSize: number;
  pvalue: number;
  baseBounds: [number, number];
  treatmentBounds: [number, number];
}

export function linspace(
  startTime: number,
  endTime: number,
  numPoints: number,
): number[] {
  if (numPoints < 2) {
    return [startTime];
  }

  const timeStep = (endTime - startTime) / (numPoints - 1);
  return Array.from({ length: numPoints }, (_, i) => startTime + i * timeStep);
}

export function exponentialLambdaToMedianTTE(lambda: number): number {
  return Math.log(2) / lambda;
}

export function medianTTEToExponentialLambda(medianTTE: number): number {
  return 1.0 / (medianTTE * Math.log(2));
}

export function baselineToTreatmentSurvival(
  baseSurv: number,
  hazardRatio: number,
): number {
  const cumulativeBaseHazard = -Math.log(baseSurv);
  const cumulativeTreatmentHazard = cumulativeBaseHazard * hazardRatio;
  return Math.E ** -cumulativeTreatmentHazard;
}

export function fitExponential(points: SurvivalPoint[]): number {
  // this function returns the lambda parameter of the exponential
  // function e^{- lambda * t }
  let numerator = 0.0;
  let denominator = 0.0;
  points.map((p) => {
    numerator += p.time * Math.log(p.survProb);
    denominator += p.time ** 2;
  });
  return -numerator / denominator;
}

export function evaluateExponential(time: number[], lambda: number): number[] {
  const result = time.map((t) => {
    return Math.E ** (-lambda * t);
  });
  return result;
}

export function evaluateWeibull(
  time: number[],
  scale: number,
  shape: number,
): number[] {
  return time.map((t) => {
    return Math.E ** (-1 * (t / scale) ** shape);
  });
}

export function evalExponentialCurve(
  maxTime: number,
  numEvalPoints: number,
  lambda: number,
): SurvivalPoint[] {
  const evalPoints = linspace(0, maxTime, numEvalPoints);
  const evalValues = evaluateExponential(evalPoints, lambda);
  return evalPoints.map((p, idx) => ({
    time: p,
    survProb: evalValues[idx],
  }));
}

export function fitExponentialPerGroup(
  baseSurv: SurvivalPoint[],
  hazardRatio: number,
): [number, number] {
  const baseLambda = fitExponential(baseSurv);

  const treatSurv = baseSurv.map((s) => ({
    time: s.time,
    survProb: baselineToTreatmentSurvival(s.survProb, hazardRatio),
  }));
  const treatLambda = fitExponential(treatSurv);
  return [baseLambda, treatLambda];
}

export function weibullToMedian(w: Weibull): number {
  return w.scale * Math.log(2) ** (1.0 / w.shape);
}
