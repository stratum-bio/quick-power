import {
  // samplePValueDistributionFromData,
  logrankPValueDistributionFromData,
  getPercentiles,
} from "../utils/simulate";
import { type SimulationWorkerResult } from "../types/simulationWorker.d";

self.onmessage = (e) => {
  const {
    sampleSize,
    accrual,
    followup,
    datasetSimCount,
    controlTimes,
    controlEvents,
    treatTimes,
    treatEvents,
  } = e.data;

  /*
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
  */
  const pValueDist = logrankPValueDistributionFromData(
    sampleSize,
    controlTimes,
    controlEvents,
    treatTimes,
    treatEvents,
    accrual,
    followup,
    datasetSimCount,
  );

  const percentiles = [2.5, 97.5];
  const baseInterval = getPercentiles(
    pValueDist.controlHazardDist,
    percentiles,
  );
  const treatInterval = getPercentiles(pValueDist.treatHazardDist, percentiles);
  const pvalueInterval = getPercentiles(pValueDist.pValueDist, [80, 90]);

  let rmstPValueInterval = undefined;
  if (pValueDist.rmstPValueDist) {
    rmstPValueInterval = getPercentiles(pValueDist.rmstPValueDist, [80, 90]);
  }

  const result: SimulationWorkerResult = {
    ...pValueDist,
    sampleSize,
    baseInterval,
    treatInterval,
    pvalueInterval,
    rmstPValueInterval,
  };

  self.postMessage(result);
};
