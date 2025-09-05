import { describe, it, expect } from "vitest";
import { simulate, getPercentiles } from "./simulate";

function estimateExponentialLambda(samples: Float64Array): number {
  if (samples.length === 0) {
    throw new Error("Cannot estimate lambda from an empty sample set.");
  }
  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  return 1 / mean;
}

function concatenate(a: Float64Array, b: Float64Array): Float64Array {
  const combinedSamples = new Float64Array(a.length + b.length);
  combinedSamples.set(a);
  combinedSamples.set(b, a.length);
  return combinedSamples;
}

function likelihoodRatio(
  aLambda: number,
  bLambda: number,
  combLambda: number,
  aLen: number,
  bLen: number,
): number {
  return (
    2 * aLen * Math.log(aLambda / combLambda) +
    2 * bLen * Math.log(bLambda / combLambda)
  );
}


describe("estimateExponentialLambda", () => {
  it("should correctly estimate lambda for a given set of samples", () => {
    const samples = new Float64Array([1, 2, 3, 4, 5]); // Mean = 3, Lambda = 1/3
    expect(estimateExponentialLambda(samples)).toBeCloseTo(1 / 3);
  });

  it("should throw an error for an empty sample set", () => {
    const samples = new Float64Array([]);
    expect(() => estimateExponentialLambda(samples)).toThrow(
      "Cannot estimate lambda from an empty sample set.",
    );
  });

  it("should handle single sample correctly", () => {
    const samples = new Float64Array([10]); // Mean = 10, Lambda = 0.1
    expect(estimateExponentialLambda(samples)).toBeCloseTo(0.1);
  });
});

describe("concatenate", () => {
  it("should concatenate two Float64Array correctly", () => {
    const arr1 = new Float64Array([1, 2]);
    const arr2 = new Float64Array([3, 4, 5]);
    const result = concatenate(arr1, arr2);
    expect(result).toEqual(new Float64Array([1, 2, 3, 4, 5]));
  });

  it("should handle empty arrays", () => {
    const arr1 = new Float64Array([]);
    const arr2 = new Float64Array([1, 2]);
    const result = concatenate(arr1, arr2);
    expect(result).toEqual(new Float64Array([1, 2]));

    const result2 = concatenate(arr2, arr1);
    expect(result2).toEqual(new Float64Array([1, 2]));
  });

  it("should handle two empty arrays", () => {
    const arr1 = new Float64Array([]);
    const arr2 = new Float64Array([]);
    const result = concatenate(arr1, arr2);
    expect(result).toEqual(new Float64Array([]));
  });
});

describe("likelihoodRatio", () => {
  it("should calculate the likelihood ratio correctly", () => {
    const aLambda = 0.5;
    const bLambda = 1.0;
    const combLambda = 0.75; // Example combined lambda
    const aLen = 10;
    const bLen = 10;
    // Expected value calculation:
    // 2 * 10 * Math.log(0.5 / 0.75) + 2 * 10 * Math.log(1.0 / 0.75)
    // 20 * Math.log(2/3) + 20 * Math.log(4/3)
    // 20 * (-0.4054651081) + 20 * (0.2876820724)
    // -8.109302162 + 5.753641448
    // -2.355660714
    const expectedRatio =
      2 * aLen * Math.log(aLambda / combLambda) +
      2 * bLen * Math.log(bLambda / combLambda);
    expect(
      likelihoodRatio(aLambda, bLambda, combLambda, aLen, bLen),
    ).toBeCloseTo(expectedRatio);
  });

  it("should return 0 if all lambdas are equal", () => {
    const aLambda = 1.0;
    const bLambda = 1.0;
    const combLambda = 1.0;
    const aLen = 10;
    const bLen = 10;
    expect(
      likelihoodRatio(aLambda, bLambda, combLambda, aLen, bLen),
    ).toBeCloseTo(0);
  });
});

describe("simulate", () => {
  it("should have monotonically decreasing p values", () => {
    const baseLambda = 0.9;
    const treatLambda = 1.0;
    const simulationCount = 100;
    const sampleSizes = [10, 50, 100];
    const seed = "test-seed";

    const resultList = sampleSizes.map((s) => {
      return simulate(baseLambda, treatLambda, simulationCount, s, seed);
    });

    expect(resultList[1].permutationPValue).toBeLessThan(resultList[0].permutationPValue);
    expect(resultList[2].permutationPValue).toBeLessThan(resultList[1].permutationPValue);
  });
});

describe('getPercentiles', () => {
  it('should return correct percentiles for a simple array', () => {
    const data = new Float64Array([10, 20, 30, 40, 50]);
    const percentiles = [25, 50, 75];
    const result = getPercentiles(data, percentiles);
    expect(result).toEqual(new Float64Array([20, 30, 40]));
  });

  it('should handle empty data array', () => {
    const data = new Float64Array([]);
    const percentiles = [25, 50, 75];
    const result = getPercentiles(data, percentiles);
    expect(result).toEqual(new Float64Array([NaN, NaN, NaN]));
  });

  it('should throw error for percentile values out of range', () => {
    const data = new Float64Array([1, 2, 3]);
    const percentiles = [-10, 110];
    expect(() => getPercentiles(data, percentiles)).toThrow('Percentile values must be between 0 and 100.');
  });

  it('should handle single data point', () => {
    const data = new Float64Array([100]);
    const percentiles = [0, 50, 100];
    const result = getPercentiles(data, percentiles);
    expect(result).toEqual(new Float64Array([100, 100, 100]));
  });

  it('should handle duplicate values', () => {
    const data = new Float64Array([10, 20, 20, 30, 40]);
    const percentiles = [25, 50, 75];
    const result = getPercentiles(data, percentiles);
    expect(result).toEqual(new Float64Array([20, 20, 30]));
  });

  it('should return correct values for 0th and 100th percentiles', () => {
    const data = new Float64Array([10, 20, 30, 40, 50]);
    const percentiles = [0, 100];
    const result = getPercentiles(data, percentiles);
    expect(result).toEqual(new Float64Array([10, 50]));
  });

  it('should interpolate correctly for non-integer indices', () => {
    const data = new Float64Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const percentiles = [10, 90]; // 10th percentile should be 1.9, 90th should be 9.1
    const result = getPercentiles(data, percentiles);
    expect(result[0]).toBeCloseTo(1.9);
    expect(result[1]).toBeCloseTo(9.1);
  });

  it('should handle unsorted input data', () => {
    const data = new Float64Array([50, 10, 40, 20, 30]);
    const percentiles = [25, 50, 75];
    const result = getPercentiles(data, percentiles);
    expect(result).toEqual(new Float64Array([20, 30, 40]));
  });
});