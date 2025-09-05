import { describe, it, expect } from "vitest";
import { generateExponentialMatrix } from "./random";

describe("generateExponentialMatrix", () => {
  it("should return a Float64Array of the correct size", () => {
    const nRows = 2;
    const mCols = 3;
    const lambda = 0.5;
    const matrix = generateExponentialMatrix(nRows, mCols, lambda);
    expect(matrix).toBeInstanceOf(Float64Array);
    expect(matrix.length).toBe(nRows * mCols);
  });

  it("should produce reproducible results with the same seed", () => {
    const nRows = 5;
    const mCols = 5;
    const lambda = 1.0;
    const seed = "test-seed";

    const matrix1 = generateExponentialMatrix(nRows, mCols, lambda, seed);
    const matrix2 = generateExponentialMatrix(nRows, mCols, lambda, seed);

    expect(matrix1).toEqual(matrix2);
  });

  it("should throw an error for non-positive dimensions", () => {
    const lambda = 0.5;
    const seed = "test-seed";

    expect(() => generateExponentialMatrix(0, 5, lambda, seed)).toThrow(
      "Matrix dimensions must be positive integers.",
    );
    expect(() => generateExponentialMatrix(5, 0, lambda, seed)).toThrow(
      "Matrix dimensions must be positive integers.",
    );
    expect(() => generateExponentialMatrix(-1, 5, lambda, seed)).toThrow(
      "Matrix dimensions must be positive integers.",
    );
    expect(() => generateExponentialMatrix(5, -1, lambda, seed)).toThrow(
      "Matrix dimensions must be positive integers.",
    );
  });

  // Optional: Test for general properties of exponential distribution (e.g., all values are positive)
  it("should generate positive values", () => {
    const nRows = 10;
    const mCols = 10;
    const lambda = 0.1;
    const matrix = generateExponentialMatrix(nRows, mCols, lambda);
    matrix.forEach((value) => {
      expect(value).toBeGreaterThanOrEqual(0);
    });
  });
});
