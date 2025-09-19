// src/utils/sampling.test.ts
import { describe, it, expect } from "vitest";
import { sample_kaplan_meier } from "./sampling";
import type { KaplanMeier } from "../types/trialdata.d";

describe("sample_kaplan_meier", () => {
  // Define a sample Kaplan-Meier curve for testing
  const kmCurve: KaplanMeier = {
    time: [0, 10, 20, 30, 40, 50],
    probability: [1.0, 0.8, 0.6, 0.4, 0.2, 0.0], // Survival probabilities
  };

  it("should return arrays of the correct length", () => {
    const count = 100;
    const [events, times] = sample_kaplan_meier(kmCurve, count);
    expect(events.length).toBe(count);
    expect(times.length).toBe(count);
    expect(events).toBeInstanceOf(Uint8Array);
    expect(times).toBeInstanceOf(Float64Array);
  });

  it("should produce reproducible results with the same seed", () => {
    const count = 50;
    const seed = 42;

    const [events1, times1] = sample_kaplan_meier(kmCurve, count, seed);
    const [events2, times2] = sample_kaplan_meier(kmCurve, count, seed);

    expect(events1).toEqual(events2);
    expect(times1).toEqual(times2);
  });

  it("should produce different results with different seeds", () => {
    const count = 50;
    const seed1 = 42;
    const seed2 = 43;

    const [events1, times1] = sample_kaplan_meier(kmCurve, count, seed1);
    const [events2, times2] = sample_kaplan_meier(kmCurve, count, seed2);

    expect(events1).not.toEqual(events2);
    expect(times1).not.toEqual(times2);
  });

  it("should have events and times within reasonable bounds", () => {
    const count = 1000;
    const [events, times] = sample_kaplan_meier(kmCurve, count);

    // Events should be 0 or 1
    events.forEach((e) => {
      expect(e).toBeGreaterThanOrEqual(0);
      expect(e).toBeLessThanOrEqual(1);
    });

    // Times should be within the range of kmCurve.time
    times.forEach((t) => {
      expect(t).toBeGreaterThanOrEqual(kmCurve.time[0]);
      expect(t).toBeLessThanOrEqual(kmCurve.time[kmCurve.time.length - 1]);
    });
  });

  it("should handle a KM curve where all probabilities are 1 (no events)", () => {
    const noEventKm: KaplanMeier = {
      time: [0, 10, 20],
      probability: [1.0, 1.0, 1.0],
    };
    const count = 10;
    const [events, times] = sample_kaplan_meier(noEventKm, count);

    // All should be censored (event = 0) and time should be max time
    events.forEach((e) => expect(e).toBe(0));
    times.forEach((t) =>
      expect(t).toBe(noEventKm.time[noEventKm.time.length - 1]),
    );
  });

  it("should handle a KM curve where all probabilities are 0 (all immediate events)", () => {
    const immediateEventKm: KaplanMeier = {
      time: [0, 10, 20],
      probability: [0.0, 0.0, 0.0],
    };
    const count = 10;
    const [events, times] = sample_kaplan_meier(immediateEventKm, count);

    // All should have events (event = 1) and time should be min time (0)
    events.forEach((e) => expect(e).toBe(1));
    times.forEach((t) => expect(t).toBe(immediateEventKm.time[0]));
  });

  it("should correctly interpolate times for valid events", () => {
    // This test is harder to make deterministic without controlling the random numbers
    // but we can check if the interpolation logic is generally applied.
    const count = 1000;
    const [events, times] = sample_kaplan_meier(kmCurve, count);

    // Check that for events (event = 1), times are not just boundary values
    const eventTimes = times.filter((_, i) => events[i] === 1);
    const uniqueEventTimes = new Set(eventTimes);

    // Expect more than just the boundary times if interpolation is happening
    // This is a weak check, but better than nothing without mocking random
    expect(uniqueEventTimes.size).toBeGreaterThan(2); // Should be more than just kmCurve.time[0] and kmCurve.time[last]
  });
});
