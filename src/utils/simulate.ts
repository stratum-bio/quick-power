import random from "random";
import { jStat } from "jstat";

import type { PValueDist } from "../types/simulation";

const MIN_LAMBDA = 1e-6;

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

function logLikelihood(
  numEvents: number,
  sumTime: number,
  lam: number,
): number {
  if (lam === 0) {
    lam = MIN_LAMBDA;
  }

  return numEvents * Math.log(lam) - lam * sumTime;
}

export function likelihoodRatio(
  aSamples: Float64Array,
  aEvents: Uint8Array,
  bSamples: Float64Array,
  bEvents: Uint8Array,
): number {
  // *Samples are the timestamps
  // *Events are the 0/1 event indicators
  const aEventsSum = sum(aEvents);
  const aTotal = sum(aSamples);
  const bEventsSum = sum(bEvents);
  const bTotal = sum(bSamples);

  const combinedEvents = aEventsSum + bEventsSum;
  const combinedTotal = aTotal + bTotal;

  const aLambda = aEventsSum / aTotal;
  const bLambda = bEventsSum / bTotal;
  const combinedLambda = (aEventsSum + bEventsSum) / (aTotal + bTotal);

  return (
    2 *
    (logLikelihood(aEventsSum, aTotal, aLambda) +
      logLikelihood(bEventsSum, bTotal, bLambda) -
      logLikelihood(combinedEvents, combinedTotal, combinedLambda))
  );
}

export function randomPermutation(
  aSamples: Float64Array,
  aEvents: Uint8Array,
  bSamples: Float64Array,
  bEvents: Uint8Array,
  rng: typeof random,
): [Float64Array, Uint8Array, Float64Array, Uint8Array] {
  const combinedSamples = new Float64Array([...aSamples, ...bSamples]);
  const combinedEvents = new Uint8Array([...aEvents, ...bEvents]);

  // Fisher-Yates shuffle
  for (let i = combinedSamples.length - 1; i > 0; i--) {
    const j = Math.floor(rng.float() * (i + 1));
    [combinedSamples[i], combinedSamples[j]] = [
      combinedSamples[j],
      combinedSamples[i],
    ];
    [combinedEvents[i], combinedEvents[j]] = [
      combinedEvents[j],
      combinedEvents[i],
    ];
  }

  return [
    combinedSamples.slice(0, aSamples.length),
    combinedEvents.slice(0, aEvents.length),
    combinedSamples.slice(aSamples.length),
    combinedEvents.slice(aEvents.length),
  ];
}

function censor(
  samples: Float64Array,
  maxTime: number,
): [Float64Array, Uint8Array] {
  const events = samples.map((s) => (s < maxTime ? 1 : 0));
  const censoredSamples = samples.map((s) => Math.min(s, maxTime));
  return [new Float64Array(censoredSamples), new Uint8Array(events)];
}

export function sampleDataset(
  hazard: number,
  simCount: number,
  sampleSize: number,
  accrual: number,
  followup: number,
  rng: typeof random,
): [Float64Array[], Uint8Array[]] {
  const timeSamples: Float64Array[] = [];
  const events: Uint8Array[] = [];

  const exponential = rng.exponential(hazard);
  const uniformEnroll = rng.uniform(0, accrual);

  for (let i = 0; i < simCount; i++) {
    const samples = new Float64Array(
      Array.from({ length: sampleSize }, () => exponential()),
    );
    const enrollmentTimes = new Float64Array(
      Array.from({ length: sampleSize }, () => uniformEnroll()),
    );

    const samplesWithEnrollment = samples.map((s, j) => s + enrollmentTimes[j]);

    const [censoredSamples, eventArr] = censor(
      new Float64Array(samplesWithEnrollment),
      accrual + followup,
    );

    const finalSamples = censoredSamples.map((s, j) => s - enrollmentTimes[j]);
    timeSamples.push(new Float64Array(finalSamples));
    events.push(eventArr);
  }

  return [timeSamples, events];
}

export function resample(
  times: Float64Array,
  events: Uint8Array,
  size: number,
  rng: typeof random,
): [Float64Array, Uint8Array] {
  const resampledTimes = new Float64Array(size);
  const resampledEvents = new Uint8Array(size);

  for (let i = 0; i < size; i++) {
    const selectedIndex = rng.int(0, times.length - 1);
    resampledTimes[i] = times[selectedIndex];
    resampledEvents[i] = events[selectedIndex];
  }

  return [resampledTimes, resampledEvents];
}

export function resampleDataset(
  times: Float64Array,
  events: Uint8Array,
  simCount: number,
  sampleSize: number,
  accrual: number,
  followup: number,
  rng: typeof random,
): [Float64Array[], Uint8Array[]] {
  const resampledTimesDataset: Float64Array[] = [];
  const resampledEventsDataset: Uint8Array[] = [];

  const uniformEnroll = rng.uniform(0, accrual);

  for (let i = 0; i < simCount; i++) {
    const [resampledTimes, resampledEvents] = resample(
      times,
      events,
      sampleSize,
      rng,
    );
    const enrollmentTimes = new Float64Array(
      Array.from({ length: sampleSize }, () => uniformEnroll()),
    );

    const samplesWithEnrollment = resampledTimes.map(
      (s, j) => s + enrollmentTimes[j],
    );

    const [censoredSamples, censoredEvents] = censor(
      new Float64Array(samplesWithEnrollment),
      accrual + followup,
    );
    const censoredTimes = censoredSamples.map((s, j) => s - enrollmentTimes[j]);
    // if a sample was censored (e == 0), that means we mark it as such
    // otherwise (sample was not censored artificially), we propagate the
    // original event label
    const combinedEvents = censoredEvents.map((e, idx) =>
      e == 0 ? 0 : resampledEvents[idx],
    );

    resampledTimesDataset.push(censoredTimes);
    resampledEventsDataset.push(combinedEvents);
  }

  return [resampledTimesDataset, resampledEventsDataset];
}

function permutationTestPValue(
  controlTime: Float64Array,
  controlEvent: Uint8Array,
  treatTime: Float64Array,
  treatEvent: Uint8Array,
  pValueSimCount: number,
  rng: typeof random,
): number {
  const testStatObs = likelihoodRatio(
    controlTime,
    controlEvent,
    treatTime,
    treatEvent,
  );

  let sumNullWins = 0;
  for (let i = 0; i < pValueSimCount; i++) {
    const [permControlTime, permControlEvent, permTreatTime, permTreatEvent] =
      randomPermutation(controlTime, controlEvent, treatTime, treatEvent, rng);
    const testStatNull = likelihoodRatio(
      permControlTime,
      permControlEvent,
      permTreatTime,
      permTreatEvent,
    );
    if (testStatNull >= testStatObs) {
      sumNullWins++;
    }
  }

  return sumNullWins / pValueSimCount;
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
