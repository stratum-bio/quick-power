import random from 'random';
import { jStat } from 'jstat';

const MIN_LAMBDA = 1e-6;

export interface PValueDist {
  controlHazardDist: Float64Array;
  treatHazardDist: Float64Array;
  pValueDist: Float64Array;
}

function sum(arr: Float64Array): number {
  return arr.reduce((a, b) => a + b, 0);
}

export function samplesToLambda(
  times: Float64Array,
  events: Float64Array,
): number {
  if (times.some((t) => t < 0)) {
    throw new Error('No event times can be less than 0');
  }
  const totalTime = sum(times);
  if (totalTime === 0) {
    throw new Error('Total time is 0');
  }

  return sum(events) / totalTime;
}

function logLikelihood(numEvents: number, sumTime: number, lam: number): number {
  if (lam === 0) {
    lam = MIN_LAMBDA;
  }

  return numEvents * Math.log(lam) - lam * sumTime;
}

export function likelihoodRatio(
  aSamples: Float64Array,
  aEvents: Float64Array,
  bSamples: Float64Array,
  bEvents: Float64Array,
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

function randomPermutation(
  aSamples: Float64Array,
  aEvents: Float64Array,
  bSamples: Float64Array,
  bEvents: Float64Array,
  rng: typeof random,
): [Float64Array, Float64Array, Float64Array, Float64Array] {
  const combinedSamples = new Float64Array([...aSamples, ...bSamples]);
  const combinedEvents = new Float64Array([...aEvents, ...bEvents]);

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
): [Float64Array, Float64Array] {
  const events = samples.map((s) => (s < maxTime ? 1 : 0));
  const censoredSamples = samples.map((s) => Math.min(s, maxTime));
  return [new Float64Array(censoredSamples), new Float64Array(events)];
}

function sampleDataset(
  hazard: number,
  simCount: number,
  sampleSize: number,
  accrual: number,
  followup: number,
  rng: typeof random,
): [Float64Array[], Float64Array[]] {
  const timeSamples: Float64Array[] = [];
  const events: Float64Array[] = [];

  const exponential = rng.exponential(hazard);
  const uniformEnroll = rng.uniform(0, accrual);

  for (let i = 0; i < simCount; i++) {
    const samples = new Float64Array(Array.from({ length: sampleSize }, () => exponential()));
    const enrollmentTimes = new Float64Array(Array.from({ length: sampleSize }, () => uniformEnroll()));

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

function permutationTestPValue(
  controlTime: Float64Array,
  controlEvent: Float64Array,
  treatTime: Float64Array,
  treatEvent: Float64Array,
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

export function getPercentiles(data: Float64Array, percentiles: number[]): number[] {
    return percentiles.map(p => jStat.percentile(Array.from(data), p / 100));
}
