import { describe, it, expect } from 'vitest';
import {
  samplesToLambda,
  likelihoodRatio,
  getPercentiles,
  samplePValueDistribution,
} from './simulate';

describe('samplesToLambda', () => {
  it('should calculate lambda correctly', () => {
    const times = new Float64Array([10, 20, 30]);
    const events = new Float64Array([1, 0, 1]);
    const expectedLambda = 2 / 60;
    expect(samplesToLambda(times, events)).toBe(expectedLambda);
  });

  it('should throw an error for negative event times', () => {
    const times = new Float64Array([-10, 20, 30]);
    const events = new Float64Array([1, 0, 1]);
    expect(() => samplesToLambda(times, events)).toThrow(
      'No event times can be less than 0',
    );
  });

  it('should throw an error for zero total time', () => {
    const times = new Float64Array([0, 0, 0]);
    const events = new Float64Array([1, 0, 1]);
    expect(() => samplesToLambda(times, events)).toThrow('Total time is 0');
  });
});

describe('likelihoodRatio', () => {
  it('should calculate the likelihood ratio correctly', () => {
    const aSamples = new Float64Array([10, 20, 30]);
    const aEvents = new Float64Array([1, 1, 0]);
    const bSamples = new Float64Array([15, 25, 35]);
    const bEvents = new Float64Array([1, 0, 1]);

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

    const expected = 2 * (
        logLikelihood(aEventsSum, aTotal, aLambda) +
        logLikelihood(bEventsSum, bTotal, bLambda) -
        logLikelihood(combinedEvents, combinedTotal, combinedLambda)
    );

    const result = likelihoodRatio(aSamples, aEvents, bSamples, bEvents);
    expect(result).toBeCloseTo(expected);
  });
});

describe('getPercentiles', () => {
  it('should return the correct percentiles', () => {
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

describe('samplePValueDistribution', () => {
  it('should return distributions with the correct shape', () => {
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
