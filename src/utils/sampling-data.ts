import random from "random";

// censor function, moved from simulate.ts
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
