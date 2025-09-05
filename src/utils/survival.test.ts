import { describe, it, expect } from "vitest";
import {
  generateTimePoints,
  exponentialLambdaToMedianTTE,
  medianTTEToExponentialLambda,
  baselineToTreatmentSurvival,
  fitExponential,
  evaluateExponential,
  evalExponentialCurve,
} from "./survival.js";

describe("generateTimePoints", () => {
  it("should generate correct time points for a given range and number of points", () => {
    const startTime = 0;
    const endTime = 10;
    const numPoints = 5;
    const expected = [0, 2.5, 5, 7.5, 10];
    expect(generateTimePoints(startTime, endTime, numPoints)).toEqual(expected);
  });

  it("should return only startTime if numPoints is less than 2", () => {
    const startTime = 5;
    const endTime = 10;
    const numPoints = 1;
    expect(generateTimePoints(startTime, endTime, numPoints)).toEqual([5]);
  });

  it("should handle negative time ranges", () => {
    const startTime = -10;
    const endTime = 0;
    const numPoints = 3;
    const expected = [-10, -5, 0];
    expect(generateTimePoints(startTime, endTime, numPoints)).toEqual(expected);
  });

  it("should handle zero range", () => {
    const startTime = 5;
    const endTime = 5;
    const numPoints = 3;
    const expected = [5, 5, 5];
    expect(generateTimePoints(startTime, endTime, numPoints)).toEqual(expected);
  });
});

describe("exponentialLambdaToMedianTTE", () => {
  it("should convert lambda to median TTE correctly", () => {
    const lambda = 0.1;
    const expected = Math.log(2) / lambda;
    expect(exponentialLambdaToMedianTTE(lambda)).toBeCloseTo(expected);
  });

  it("should handle large lambda values", () => {
    const lambda = 100;
    const expected = Math.log(2) / lambda;
    expect(exponentialLambdaToMedianTTE(lambda)).toBeCloseTo(expected);
  });

  it("should handle small lambda values", () => {
    const lambda = 0.001;
    const expected = Math.log(2) / lambda;
    expect(exponentialLambdaToMedianTTE(lambda)).toBeCloseTo(expected);
  });
});

describe("medianTTEToExponentialLambda", () => {
  it("should convert median TTE to lambda correctly", () => {
    const medianTTE = 10;
    const expected = 1.0 / (medianTTE * Math.log(2));
    expect(medianTTEToExponentialLambda(medianTTE)).toBeCloseTo(expected);
  });

  it("should handle large median TTE values", () => {
    const medianTTE = 1000;
    const expected = 1.0 / (medianTTE * Math.log(2));
    expect(medianTTEToExponentialLambda(medianTTE)).toBeCloseTo(expected);
  });

  it("should handle small median TTE values", () => {
    const medianTTE = 0.1;
    const expected = 1.0 / (medianTTE * Math.log(2));
    expect(medianTTEToExponentialLambda(medianTTE)).toBeCloseTo(expected);
  });
});

describe("baselineToTreatmentSurvival", () => {
  it("should calculate treatment survival correctly", () => {
    const baseSurv = 0.5;
    const hazardRatio = 0.5;
    const cumulativeBaseHazard = -Math.log(baseSurv);
    const cumulativeTreatmentHazard = cumulativeBaseHazard * hazardRatio;
    const expected = Math.pow(Math.E, -cumulativeTreatmentHazard);
    expect(baselineToTreatmentSurvival(baseSurv, hazardRatio)).toBeCloseTo(
      expected,
    );
  });

  it("should return baseSurv if hazardRatio is 1", () => {
    const baseSurv = 0.7;
    const hazardRatio = 1;
    expect(baselineToTreatmentSurvival(baseSurv, hazardRatio)).toBeCloseTo(
      baseSurv,
    );
  });

  it("should return 1 if baseSurv is 1 (no events)", () => {
    const baseSurv = 1;
    const hazardRatio = 0.5;
    expect(baselineToTreatmentSurvival(baseSurv, hazardRatio)).toBeCloseTo(1);
  });

  it("should handle hazardRatio > 1", () => {
    const baseSurv = 0.8;
    const hazardRatio = 2;
    const cumulativeBaseHazard = -Math.log(baseSurv);
    const cumulativeTreatmentHazard = cumulativeBaseHazard * hazardRatio;
    const expected = Math.pow(Math.E, -cumulativeTreatmentHazard);
    expect(baselineToTreatmentSurvival(baseSurv, hazardRatio)).toBeCloseTo(
      expected,
    );
  });
});

describe("fitExponential", () => {
  it("should fit exponential lambda correctly for given points", () => {
    // For e^(-lambda*t), survProb = e^(-lambda*t) => ln(survProb) = -lambda*t => lambda = -ln(survProb)/t
    // This function uses a least squares approach, so we'll provide a simple case.
    // If survProb = e^(-0.1*t), then for t=1, survProb=e^(-0.1) approx 0.9048
    // For t=2, survProb=e^(-0.2) approx 0.8187
    // For t=3, survProb=e^(-0.3) approx 0.7408
    // Let's use points that are exactly on an exponential curve for a known lambda.
    const testPoints = [
      { time: 1, survProb: Math.exp(-0.1 * 1) },
      { time: 2, survProb: Math.exp(-0.1 * 2) },
      { time: 3, survProb: Math.exp(-0.1 * 3) },
    ];
    expect(fitExponential(testPoints)).toBeCloseTo(0.1);
  });

  it("should return a positive lambda for decreasing survival probabilities", () => {
    const points = [
      { time: 1, survProb: 0.8 },
      { time: 2, survProb: 0.6 },
    ];
    expect(fitExponential(points)).toBeGreaterThan(0);
  });

  it("should handle points with survProb of 1 (no events yet)", () => {
    // This case might result in division by zero or NaN depending on implementation.
    // The current implementation will result in 0/0 which is NaN.
    // Let's test for NaN or a very small number if the function handles it.
    // Given the formula, if survProb is 1, ln(survProb) is 0, so numerator is 0.
    // If all times are 0, denominator is 0.
    // If times are non-zero, denominator is non-zero, so lambda should be 0.
    const points = [
      { time: 1, survProb: 1 },
      { time: 2, survProb: 1 },
    ];
    expect(fitExponential(points)).toBeCloseTo(0);
  });
});

describe("evaluateExponential", () => {
  it("should evaluate exponential survival probabilities correctly", () => {
    const time = [1, 2, 3];
    const lambda = 0.1;
    const expected = [
      Math.exp(-0.1 * 1),
      Math.exp(-0.1 * 2),
      Math.exp(-0.1 * 3),
    ];
    expect(evaluateExponential(time, lambda)).toEqual(
      expect.arrayContaining(expected.map((val) => expect.closeTo(val))),
    );
  });

  it("should return 1 for time 0", () => {
    const time = [0];
    const lambda = 0.5;
    expect(evaluateExponential(time, lambda)).toEqual([1]);
  });

  it("should handle empty time array", () => {
    const time: number[] = [];
    const lambda = 0.5;
    expect(evaluateExponential(time, lambda)).toEqual([]);
  });
});

describe("evalExponentialCurve", () => {
  it("should evaluate exponential curve with correct number of points and values", () => {
    const originalTime = [0, 5, 10];
    const numEvalPoints = 3;
    const lambda = 0.1;
    const result = evalExponentialCurve(originalTime, numEvalPoints, lambda);

    expect(result.length).toBe(numEvalPoints);
    expect(result[0].time).toBeCloseTo(0);
    expect(result[result.length - 1].time).toBeCloseTo(
      Math.max(...originalTime),
    );

    result.forEach((p) => {
      expect(p.survProb).toBeCloseTo(Math.exp(-lambda * p.time));
    });
  });

  it("should handle single original time point", () => {
    const originalTime = [5];
    const numEvalPoints = 1;
    const lambda = 0.1;
    const result = evalExponentialCurve(originalTime, numEvalPoints, lambda);
    expect(result.length).toBe(1);
    expect(result[0].time).toBeCloseTo(0); // generateTimePoints starts from 0
    expect(result[0].survProb).toBeCloseTo(Math.exp(-lambda * result[0].time));
  });

  it("should handle numEvalPoints less than 2", () => {
    const originalTime = [0, 10];
    const numEvalPoints = 1;
    const lambda = 0.1;
    const result = evalExponentialCurve(originalTime, numEvalPoints, lambda);
    expect(result.length).toBe(1);
    expect(result[0].time).toBeCloseTo(0);
    expect(result[0].survProb).toBeCloseTo(Math.exp(-lambda * result[0].time));
  });
});
