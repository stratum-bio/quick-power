import { type PValueDist, samplePValueDistribution } from "../utils/simulate";

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

  const result: PValueDist = samplePValueDistribution(
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

  self.postMessage({
    sampleSize: sampleSize,
    ...result,
  });
};
