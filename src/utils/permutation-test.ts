import random from "random";
import { sum } from "./simulate"; // Import sum from simulate.ts

const MIN_LAMBDA = 1e-6;

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

export function permutationTestPValue(
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
