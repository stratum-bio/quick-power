import type { KaplanMeier } from "../types/trialdata.d";

/**
 * Represents a single point on the Kaplan-Meier curve.
 */
interface KaplanMeierPoint {
  time: number;
  probability: number;
}

/**
 * Implements the Kaplan-Meier estimator for survival analysis.
 *
 * @param {number[]} times - An array of observed times (either event or censoring).
 * @param {number[]} events - An array of event indicators (1 if the event occurred, 0 if censored).
 * @returns {KaplanMeierResult} An object containing the points of the survival curve.
 */
export function calculateKaplanMeier(
  times: number[],
  events: number[],
): KaplanMeier {
  if (times.length !== events.length) {
    throw new Error(
      "The 'times' and 'events' arrays must be of the same length.",
    );
  }
  
  // 1. Combine times and events into a single array of objects and sort by time.
  const observations = times
    .map((time, index) => ({
      time: time,
      isEvent: events[index] === 1,
    }))
    .sort((a, b) => a.time - b.time);

  // 2. Identify the unique event times to define the steps in the curve.
  const uniqueEventTimes = new Set(observations.filter(obs => obs.isEvent).map(obs => obs.time));

  // 3. Calculate the survival probability at each unique event time.
  const points: KaplanMeierPoint[] = [{ time: 0, probability: 1.0 }];
  let cumulativeProbability = 1.0;

  for (const timePoint of uniqueEventTimes) {
    // Number of events (d_i) at the current time point.
    const eventsAtTime = observations.filter(
      obs => obs.time === timePoint && obs.isEvent,
    ).length;

    // Number of individuals at risk (n_i) just before the current time point.
    // This is the count of all individuals whose observation time is >= the current event time.
    const atRiskCount = observations.filter(obs => obs.time >= timePoint).length;

    if (atRiskCount > 0) {
      // The core Kaplan-Meier formula: S(t_i) = S(t_{i-1}) * (1 - d_i / n_i)
      cumulativeProbability *= (1 - eventsAtTime / atRiskCount);
    }
    
    points.push({ time: timePoint, probability: cumulativeProbability });
  }

  return {
    time: points.map((p) => p.time),
    probability: points.map((p) => p.probability),
    interval: points.map((p) => [p.probability, p.probability]),
  }
};
