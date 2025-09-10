import { samplePValueDistribution, getPercentiles } from "../utils/simulate";
import { type TTEDistributionWorkerResult } from "../types/tteDistribution.d";

self.onmessage = (e) => {
  const {
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
  } = e.data;

  const pValueDist = samplePValueDistribution(
    sampleSize,
    controlProportion,
    treatProportion,
    baselineHazard,
    hazardRatio,
    accrual,
    followup,
    permutationCount,
    datasetSimCount,
  );

  const percentiles = [2.5, 97.5];
  const baseInterval = getPercentiles(pValueDist.controlHazardDist, percentiles);
  const treatInterval = getPercentiles(pValueDist.treatHazardDist, percentiles);
  const pvalueInterval = getPercentiles(pValueDist.pValueDist, [beta * 100]);

  const result: TTEDistributionWorkerResult = {
    ...pValueDist,
    sampleSize,
    baseInterval,
    treatInterval,
    pvalueInterval,
  };

  self.postMessage(result);
};
