import {
  samplePValueDistributionFromData,
  getPercentiles,
} from "../utils/simulate";
import { type SimulationWorkerResult } from "../types/simulationWorker.d";

self.onmessage = (e) => {
  const {
    sampleSize,
    accrual,
    followup,
    permutationCount,
    datasetSimCount,
    beta,
    controlTimes,
    controlEvents,
    treatTimes,
    treatEvents,
  } = e.data;

  const pValueDist = samplePValueDistributionFromData(
    sampleSize,
    controlTimes,
    controlEvents,
    treatTimes,
    treatEvents,
    accrual,
    followup,
    permutationCount,
    datasetSimCount,
  );

  const percentiles = [2.5, 97.5];
  const baseInterval = getPercentiles(
    pValueDist.controlHazardDist,
    percentiles,
  );
  const treatInterval = getPercentiles(pValueDist.treatHazardDist, percentiles);
  const pvalueInterval = getPercentiles(pValueDist.pValueDist, [beta * 100]);

  const result: SimulationWorkerResult = {
    ...pValueDist,
    sampleSize,
    baseInterval,
    treatInterval,
    pvalueInterval,
  };

  self.postMessage(result);
};
