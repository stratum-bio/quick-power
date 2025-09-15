import { describe, it, expect } from "vitest";
import { calculateKaplanMeier } from "./kaplan-meier";
import type { KaplanMeier } from "../types/trialdata.d";

describe("calculateKaplanMeier", () => {
  it("should calculate Kaplan-Meier for a simple case with events and censoring", () => {
    const times = [6, 6, 6, 7, 10];
    const events = [1, 0, 1, 1, 0]; // 1 = event, 0 = censored

    const expected: KaplanMeier = {
      time: [0, 6, 7],
      probability: [1, 0.6, 0.3],
      events_at_time: [0, 2, 1],
      at_risk_at_time: [0, 5, 2],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability.map((p) => parseFloat(p.toFixed(2)))).toEqual(
      expected.probability,
    );
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should handle a case with no events", () => {
    const times = [1, 2, 3, 4, 5];
    const events = [0, 0, 0, 0, 0]; // All censored

    const expected: KaplanMeier = {
      time: [0],
      probability: [1],
      events_at_time: [0],
      at_risk_at_time: [0],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability).toEqual(expected.probability);
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should handle a case with all events", () => {
    const times = [1, 2, 3, 4, 5];
    const events = [1, 1, 1, 1, 1]; // All events

    const expected: KaplanMeier = {
      time: [0, 1, 2, 3, 4, 5],
      probability: [1, 0.8, 0.6, 0.4, 0.2, 0],
      events_at_time: [0, 1, 1, 1, 1, 1],
      at_risk_at_time: [0, 5, 4, 3, 2, 1],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability.map((p) => parseFloat(p.toFixed(2)))).toEqual(
      expected.probability,
    );
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should handle an empty input", () => {
    const times: number[] = [];
    const events: number[] = [];

    const expected: KaplanMeier = {
      time: [0],
      probability: [1],
      events_at_time: [0],
      at_risk_at_time: [0],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability).toEqual(expected.probability);
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should handle a single observation (event)", () => {
    const times = [10];
    const events = [1];

    const expected: KaplanMeier = {
      time: [0, 10],
      probability: [1, 0],
      events_at_time: [0, 1],
      at_risk_at_time: [0, 1],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability).toEqual(expected.probability);
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should handle a single observation (censored)", () => {
    const times = [10];
    const events = [0];

    const expected: KaplanMeier = {
      time: [0],
      probability: [1],
      events_at_time: [0],
      at_risk_at_time: [0],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability).toEqual(expected.probability);
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should throw an error if times and events arrays have different lengths", () => {
    const times = [1, 2];
    const events = [1];

    expect(() => calculateKaplanMeier(times, events)).toThrow(
      "The 'times' and 'events' arrays must be of the same length.",
    );
  });

  it("should handle duplicate times with mixed events and censoring", () => {
    const times = [5, 5, 10, 10, 15];
    const events = [1, 0, 1, 0, 1];

    const expected: KaplanMeier = {
      time: [0, 5, 10, 15],
      probability: [1, 0.8, 0.53, 0],
      events_at_time: [0, 1, 1, 1],
      at_risk_at_time: [0, 5, 3, 1],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability.map((p) => parseFloat(p.toFixed(2)))).toEqual(
      expected.probability,
    );
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });

  it("should correctly calculate at_risk_at_time and events_at_time for multiple events at same time", () => {
    const times = [1, 1, 2, 3];
    const events = [1, 1, 1, 1];

    const expected: KaplanMeier = {
      time: [0, 1, 2, 3],
      probability: [1, 0.5, 0.25, 0],
      events_at_time: [0, 2, 1, 1],
      at_risk_at_time: [0, 4, 2, 1],
    };

    const result = calculateKaplanMeier(times, events);

    expect(result.time).toEqual(expected.time);
    expect(result.probability.map((p) => parseFloat(p.toFixed(2)))).toEqual(
      expected.probability,
    );
    expect(result.events_at_time).toEqual(expected.events_at_time);
    expect(result.at_risk_at_time).toEqual(expected.at_risk_at_time);
  });
});
