import { samplePValueDistribution } from "../utils/simulate";
import { type TTEDistributionWorkerResult } from "../types/tteDistribution";

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

  const result: TTEDistributionWorkerResult = {
    ...pValueDist,
    sampleSize,
  };

  self.postMessage(result);
};
