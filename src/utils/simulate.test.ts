import { describe, it, expect } from "vitest";
import {
  sum,
  sampleDataset,
  samplesToLambda,
  likelihoodRatio,
  getPercentiles,
  randomPermutation,
  samplePValueDistribution,
  samplePValueDistributionFromData,
} from "./simulate";
import random from "random";

describe("sampleDataset", () => {
  it("should randomly generate data", () => {
    const rng = random.clone(123);
    const [times, events] = sampleDataset(
      1.0 / 1.31, // hazard
      10, // number of datasets
      30, // sample size per dataset
      2, // accrual
      1, // followup
      rng,
    );

    expect(times.length).toEqual(10);
    expect(events.length).toEqual(10);

    for (let i = 0; i < times.length; i++) {
      expect(times[i].length).toEqual(30);
      expect(events[i].length).toEqual(30);

      for (let j = i + 1; j < times.length; j++) {
        expect(() => {
          sum(times[i]);
        }).not.toEqual(() => {
          sum(times[j]);
        });
        expect(() => {
          sum(events[i]);
        }).not.toEqual(() => {
          sum(events[j]);
        });
      }
    }
  });
});

describe("randomPermutation", () => {
  it("should randomly permute", () => {
    const rng = random.clone("123");

    const aSamples = new Float64Array(10);
    const aEvents = new Uint8Array(10);
    const bSamples = new Float64Array(10);
    const bEvents = new Uint8Array(10);

    aSamples.fill(10);
    aEvents.fill(1);

    bSamples.fill(1);
    bEvents.fill(0);

    const resultList = randomPermutation(
      aSamples,
      aEvents,
      bSamples,
      bEvents,
      rng,
    );

    const resultList2 = randomPermutation(
      aSamples,
      aEvents,
      bSamples,
      bEvents,
      rng,
    );

    for (let i = 0; i < resultList.length; i++) {
      expect(() => {
        sum(resultList[i]);
      }).not.toBe(sum(resultList2[i]));
    }
  });
});

describe("samplesToLambda", () => {
  it("should calculate lambda correctly", () => {
    const times = new Float64Array([10, 20, 30]);
    const events = new Uint8Array([1, 0, 1]);
    const expectedLambda = 2 / 60;
    expect(samplesToLambda(times, events)).toBe(expectedLambda);
  });

  it("should throw an error for negative event times", () => {
    const times = new Float64Array([-10, 20, 30]);
    const events = new Uint8Array([1, 0, 1]);
    expect(() => samplesToLambda(times, events)).toThrow(
      "No event times can be less than 0",
    );
  });

  it("should throw an error for zero total time", () => {
    const times = new Float64Array([0, 0, 0]);
    const events = new Uint8Array([1, 0, 1]);
    expect(() => samplesToLambda(times, events)).toThrow("Total time is 0");
  });
});

describe("likelihoodRatio", () => {
  it("should calculate the likelihood ratio correctly", () => {
    const aSamples = new Float64Array([10, 20, 30]);
    const aEvents = new Uint8Array([1, 1, 0]);
    const bSamples = new Float64Array([15, 25, 35]);
    const bEvents = new Uint8Array([1, 0, 1]);

    const aEventsSum = 2;
    const aTotal = 60;
    const bEventsSum = 2;
    const bTotal = 75;

    const aLambda = aEventsSum / aTotal;
    const bLambda = bEventsSum / bTotal;

    const combinedEvents = aEventsSum + bEventsSum;
    const combinedTotal = aTotal + bTotal;
    const combinedLambda = combinedEvents / combinedTotal;

    const logLikelihood = (numEvents: number, sumTime: number, lam: number) =>
      numEvents * Math.log(lam) - lam * sumTime;

    const expected =
      2 *
      (logLikelihood(aEventsSum, aTotal, aLambda) +
        logLikelihood(bEventsSum, bTotal, bLambda) -
        logLikelihood(combinedEvents, combinedTotal, combinedLambda));

    const result = likelihoodRatio(aSamples, aEvents, bSamples, bEvents);
    expect(result).toBeCloseTo(expected);
  });
});

describe("getPercentiles", () => {
  it("should return the correct percentiles", () => {
    const data = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const percentiles = [10, 50, 90];
    const expected = [1.9, 5.5, 9];
    const result = getPercentiles(data, percentiles);
    expect(result.length).toBe(3);
    expect(result[0]).toBeCloseTo(expected[0]);
    expect(result[1]).toBeCloseTo(expected[1]);
    expect(result[2]).toBeCloseTo(expected[2]);
  });
});

describe("samplePValueDistribution", () => {
  it("should return distributions with the correct shape", () => {
    const totalSampleSize = 100;
    const proportionBase = 0.5;
    const proportionTreat = 0.5;
    const baselineHazard = 0.1;
    const hazardRatio = 0.5;
    const accrual = 12;
    const followup = 12;
    const pValueSimCount = 10;
    const datasetSimCount = 10;

    const result = samplePValueDistribution(
      totalSampleSize,
      proportionBase,
      proportionTreat,
      baselineHazard,
      hazardRatio,
      accrual,
      followup,
      pValueSimCount,
      datasetSimCount,
      123,
    );

    expect(result.controlHazardDist.length).toBe(datasetSimCount);
    expect(result.treatHazardDist.length).toBe(datasetSimCount);
    expect(result.pValueDist.length).toBe(datasetSimCount);
  });
});


describe("samplePValueDistributioniFromData", () => {
  it("should return smaller pvalues with greater sample size", () => {
    const totalSampleSize = 100;
    const accrual = 2;
    const followup = 1;
    const pValueSimCount = 100;
    const datasetSimCount = 100;

    const rng = random.clone(123);

    const [controlTimes, controlEvents] = sampleDataset(1.0 / 2, 1, totalSampleSize, accrual, followup, rng);
    const [treatTimes, treatEvents] = sampleDataset(1.0 / 3, 1, totalSampleSize, accrual, followup, rng);

    const result = samplePValueDistributionFromData(
      100,
      controlTimes[0],
      controlEvents[0],
      treatTimes[0],
      treatEvents[0],
      accrual,
      followup,
      pValueSimCount,
      datasetSimCount,
      123,
    );

    expect(result.controlHazardDist.length).toBe(datasetSimCount);
    expect(result.treatHazardDist.length).toBe(datasetSimCount);
    expect(result.pValueDist.length).toBe(datasetSimCount);

    const result2 = samplePValueDistributionFromData(
      500,
      controlTimes[0],
      controlEvents[0],
      treatTimes[0],
      treatEvents[0],
      accrual,
      followup,
      pValueSimCount,
      datasetSimCount,
      123,
    );

    expect(
      result.pValueDist.reduce((a, b) => a+b) / datasetSimCount
    ).toBeGreaterThan(
      result2.pValueDist.reduce((a, b) => a+b) / datasetSimCount
    );
  });
});
