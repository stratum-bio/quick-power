import random from "random";
import { jStat } from "jstat";

import {
  sampleDataset,
  resampleDataset,
  sampleKaplanMeierDataset,
} from "./dataset-gen";
import type { PValueDist } from "../types/simulation";
import { logRankTest } from "./logrank";
import { calculateKaplanMeier } from "./kaplan-meier";
import { compareRMST } from "./rmst";
import { permutationTestPValue } from "./permutation-test";
import type { KaplanMeier } from "../types/trialdata.d";

export function sum(arr: Float64Array | Uint8Array): number {
  // @ts-expect-error This isn't a valid error
  return arr.reduce((a, b) => a + b, 0);
}

export function getPercentiles(
  data: Float64Array,
  percentiles: number[],
): number[] {
  return percentiles.map((p) => jStat.percentile(data, p / 100));
}

export function samplesToLambda(
  times: Float64Array,
  events: Uint8Array,
): number {
  if (times.some((t) => t < 0)) {
    throw new Error("No event times can be less than 0");
  }
  const totalTime = sum(times);
  if (totalTime === 0) {
    throw new Error("Total time is 0");
  }

  return sum(events) / totalTime;
}
export function samplePValueDistribution(
  totalSampleSize: number,
  proportionBase: number,
  proportionTreat: number,
  baselineHazard: number,
  hazardRatio: number,
  accrual: number,
  followup: number,
  pValueSimCount: number,
  datasetSimCount: number,
  seed: string | number = 123,
): PValueDist {
  const rng = random.clone(seed);

  const [controlTime, controlEvent] = sampleDataset(
    baselineHazard,
    datasetSimCount,
    Math.round(totalSampleSize * proportionBase),
    accrual,
    followup,
    rng,
  );
  const [treatTime, treatEvent] = sampleDataset(
    baselineHazard * hazardRatio,
    datasetSimCount,
    Math.round(totalSampleSize * proportionTreat),
    accrual,
    followup,
    rng,
  );

  const controlHazardDist = new Float64Array(datasetSimCount);
  const treatHazardDist = new Float64Array(datasetSimCount);
  const pValues = new Float64Array(datasetSimCount);

  for (let i = 0; i < datasetSimCount; i++) {
    const cTime = controlTime[i];
    const cEvent = controlEvent[i];
    const tTime = treatTime[i];
    const tEvent = treatEvent[i];

    const controlHazard = samplesToLambda(cTime, cEvent);
    const treatHazard = samplesToLambda(tTime, tEvent);

    const pValue = permutationTestPValue(
      cTime,
      cEvent,
      tTime,
      tEvent,
      pValueSimCount,
      rng,
    );

    controlHazardDist[i] = controlHazard;
    treatHazardDist[i] = treatHazard;
    pValues[i] = pValue;
  }

  return {
    controlHazardDist,
    treatHazardDist,
    pValueDist: pValues,
  };
}

export function samplePValueDistributionFromData(
  totalSampleSize: number,
  controlTimes: Float64Array,
  controlEvents: Uint8Array,
  treatTimes: Float64Array,
  treatEvents: Uint8Array,
  accrual: number,
  followup: number,
  pValueSimCount: number,
  datasetSimCount: number,
  seed: string | number = 123,
): PValueDist {
  // TODO: call this from the worker to actually enable
  // the use of smapling from the data
  const rng = random.clone(seed);

  const [controlTime, controlEvent] = resampleDataset(
    controlTimes,
    controlEvents,
    datasetSimCount,
    Math.round(totalSampleSize * 0.5),
    accrual,
    followup,
    rng,
  );
  const [treatTime, treatEvent] = resampleDataset(
    treatTimes,
    treatEvents,
    datasetSimCount,
    Math.round(totalSampleSize * 0.5),
    accrual,
    followup,
    rng,
  );

  const controlHazardDist = new Float64Array(datasetSimCount);
  const treatHazardDist = new Float64Array(datasetSimCount);
  const pValues = new Float64Array(datasetSimCount);

  for (let i = 0; i < datasetSimCount; i++) {
    const cTime = controlTime[i];
    const cEvent = controlEvent[i];
    const tTime = treatTime[i];
    const tEvent = treatEvent[i];

    const controlHazard = samplesToLambda(cTime, cEvent);
    const treatHazard = samplesToLambda(tTime, tEvent);

    const pValue = permutationTestPValue(
      cTime,
      cEvent,
      tTime,
      tEvent,
      pValueSimCount,
      rng,
    );

    controlHazardDist[i] = controlHazard;
    treatHazardDist[i] = treatHazard;
    pValues[i] = pValue;
  }

  return {
    controlHazardDist,
    treatHazardDist,
    pValueDist: pValues,
  };
}

export function logrankPValueDistributionFromData(
  totalSampleSize: number,
  controlTimes: Float64Array,
  controlEvents: Uint8Array,
  treatTimes: Float64Array,
  treatEvents: Uint8Array,
  accrual: number,
  followup: number,
  simCount: number,
  seed: string | number = 123,
): PValueDist {
  // TODO: call this from the worker to actually enable
  // the use of smapling from the data
  const rng = random.clone(seed);

  const [controlTime, controlEvent] = resampleDataset(
    controlTimes,
    controlEvents,
    simCount,
    Math.round(totalSampleSize * 0.5),
    accrual,
    followup,
    rng,
  );
  const [treatTime, treatEvent] = resampleDataset(
    treatTimes,
    treatEvents,
    simCount,
    Math.round(totalSampleSize * 0.5),
    accrual,
    followup,
    rng,
  );

  const controlHazardDist = new Float64Array(simCount);
  const treatHazardDist = new Float64Array(simCount);
  const pValues = new Float64Array(simCount);
  const rmstPValueDist = new Float64Array(simCount);

  for (let i = 0; i < simCount; i++) {
    const cTime = controlTime[i];
    const cEvent = controlEvent[i];
    const tTime = treatTime[i];
    const tEvent = treatEvent[i];

    const controlHazard = samplesToLambda(cTime, cEvent);
    const treatHazard = samplesToLambda(tTime, tEvent);

    const [, pValue] = logRankTest(cTime, cEvent, tTime, tEvent);

    controlHazardDist[i] = controlHazard;
    treatHazardDist[i] = treatHazard;
    pValues[i] = pValue;
    rmstPValueDist[i] = compareRMST(
      calculateKaplanMeier(Array.from(cTime), Array.from(cEvent)),
      calculateKaplanMeier(Array.from(tTime), Array.from(tEvent)),
      Math.min(Math.max(...cTime), Math.max(...tTime)),
    ).pValue;
  }

  return {
    controlHazardDist,
    treatHazardDist,
    pValueDist: pValues,
    rmstPValueDist: rmstPValueDist,
  };
}

export function kaplanMeierPValueDistributionFromData(
  totalSampleSize: number,
  controlKM: KaplanMeier,
  treatKM: KaplanMeier,
  accrual: number,
  followup: number,
  simCount: number,
  seed: string | number = 123,
): PValueDist {
  // TODO: call this from the worker to actually enable
  // the use of smapling from the data
  const rng = random.clone(seed);

  const [controlTime, controlEvent] = sampleKaplanMeierDataset(
    controlKM,
    simCount,
    Math.round(totalSampleSize * 0.5),
    accrual,
    followup,
    rng,
  );
  const [treatTime, treatEvent] = sampleKaplanMeierDataset(
    treatKM,
    simCount,
    Math.round(totalSampleSize * 0.5),
    accrual,
    followup,
    rng,
  );

  const controlHazardDist = new Float64Array(simCount);
  const treatHazardDist = new Float64Array(simCount);
  const pValues = new Float64Array(simCount);
  const rmstPValueDist = new Float64Array(simCount);

  for (let i = 0; i < simCount; i++) {
    const cTime = controlTime[i];
    const cEvent = controlEvent[i];
    const tTime = treatTime[i];
    const tEvent = treatEvent[i];

    const controlHazard = samplesToLambda(cTime, cEvent);
    const treatHazard = samplesToLambda(tTime, tEvent);

    const [, pValue] = logRankTest(cTime, cEvent, tTime, tEvent);

    controlHazardDist[i] = controlHazard;
    treatHazardDist[i] = treatHazard;
    pValues[i] = pValue;
    rmstPValueDist[i] = compareRMST(
      calculateKaplanMeier(Array.from(cTime), Array.from(cEvent)),
      calculateKaplanMeier(Array.from(tTime), Array.from(tEvent)),
      Math.min(Math.max(...cTime), Math.max(...tTime)),
    ).pValue;
  }

  return {
    controlHazardDist,
    treatHazardDist,
    pValueDist: pValues,
    rmstPValueDist: rmstPValueDist,
  };
}
