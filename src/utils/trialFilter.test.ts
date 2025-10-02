import { describe, it, expect } from 'vitest';
import { computeCumulativeDists, toRegularGrid, ksTest } from './trialFilter';
import type { ParsedFactor } from '../types/demo_types.d';

describe('computeCumulativeDists', () => {
  it('should return an empty array if factors is empty', () => {
    const factors: ParsedFactor[] = [];
    const result = computeCumulativeDists(factors, 100);
    expect(result).toEqual([]);
  });

  it('should return an empty array if factors have different group lengths', () => {
    const factors: ParsedFactor[] = [
      {
        factor_type: 'AGE',
        value_range: { lower: 0, upper: 10 },
        groups: [{ count: 10 }, { count: 20 }],
      },
      {
        factor_type: 'AGE',
        value_range: { lower: 10, upper: 20 },
        groups: [{ count: 30 }],
      },
    ];
    const result = computeCumulativeDists(factors, 100);
    expect(result).toEqual([]);
  });

  it('should compute cumulative distributions correctly with counts', () => {
    const factors: ParsedFactor[] = [
      {
        factor_type: 'AGE',
        value_range: { lower: 0, upper: 10 },
        groups: [{ count: 10 }, { count: 20 }],
      },
      {
        factor_type: 'AGE',
        value_range: { lower: 10, upper: 20 },
        groups: [{ count: 30 }, { count: 40 }],
      },
      {
        factor_type: 'AGE',
        value_range: { lower: 20, upper: null },
        groups: [{ count: 50 }, { count: 60 }],
      },
    ];
    const result = computeCumulativeDists(factors, 90);
    expect(result).toEqual([
      {
        values: [10, 20, 90],
        probabilities: [0.1, 0.4, 1],
      },
      {
        values: [10, 20, 90],
        probabilities: [0.16666666666666666, 0.5, 1],
      },
    ]);
    result[0].probabilities.forEach((prob, index) => {
      expect(prob).toBeCloseTo([0.1, 0.4, 1][index]);
    });
    result[1].probabilities.forEach((prob, index) => {
      expect(prob).toBeCloseTo([0.16666666666666666, 0.5, 1][index]);
    });
  });

  it('should compute cumulative distributions correctly with percentages', () => {
    const factors: ParsedFactor[] = [
      {
        factor_type: 'AGE',
        value_range: { lower: 0, upper: 10 },
        groups: [{ percentage: 0.1 }, { percentage: 0.2 }],
      },
      {
        factor_type: 'AGE',
        value_range: { lower: 10, upper: 20 },
        groups: [{ percentage: 0.3 }, { percentage: 0.4 }],
      },
      {
        factor_type: 'AGE',
        value_range: { lower: 20, upper: null },
        groups: [{ percentage: 0.5 }, { percentage: 0.6 }],
      },
    ];
    const result = computeCumulativeDists(factors, 90);
    expect(result).toEqual([
      {
        values: [10, 20, 90],
        probabilities: [0.1, 0.4, 1],
      },
      {
        values: [10, 20, 90],
        probabilities: [0.16666666666666666, 0.5, 1],
      },
    ]);
    result[0].probabilities.forEach((prob, index) => {
      expect(prob).toBeCloseTo([0.1, 0.4, 1][index]);
    });
    result[1].probabilities.forEach((prob, index) => {
      expect(prob).toBeCloseTo([0.16666666666666666, 0.5, 1][index]);
    });
  });
});

describe('toRegularGrid', () => {
  it('should convert a simple cumulative distribution to a regular grid', () => {
    const dist = {
      values: [10, 20, 30],
      probabilities: [0.2, 0.5, 1.0],
    };
    const result = toRegularGrid(dist, 0, 30);

    const expectedRegularGridValues = Array.from({ length: 31 }, (_, idx) => 0 + idx);
    const expectedRegularGridProbs: number[] = [];

    // Linear interpolation logic
    const interpolate = (x: number, x0: number, y0: number, x1: number, y1: number): number => {
      if (x <= x0) return y0;
      if (x >= x1) return y1;
      return y0 + (x - x0) * (y1 - y0) / (x1 - x0);
    };

    for (let i = 0; i <= 30; i++) {
      if (i <= dist.values[0]) { // Before or at the first point
        expectedRegularGridProbs.push(interpolate(i, 0, 0, dist.values[0], dist.probabilities[0]));
      } else if (i <= dist.values[1]) { // Between first and second
        expectedRegularGridProbs.push(interpolate(i, dist.values[0], dist.probabilities[0], dist.values[1], dist.probabilities[1]));
      } else if (i <= dist.values[2]) { // Between second and third
        expectedRegularGridProbs.push(interpolate(i, dist.values[1], dist.probabilities[1], dist.values[2], dist.probabilities[2]));
      } else { // After the last point
        expectedRegularGridProbs.push(dist.probabilities[dist.probabilities.length - 1]);
      }
    }

    // Due to floating point precision, use toBeCloseTo
    expect(result.values).toEqual(expectedRegularGridValues);
    result.probabilities.forEach((prob, index) => {
      expect(prob).toBeCloseTo(expectedRegularGridProbs[index]);
    });
  });

  it('should handle minVal and maxVal outside the distribution range', () => {
    const dist = {
      values: [5, 10],
      probabilities: [0.5, 1.0],
    };
    const result = toRegularGrid(dist, 0, 15);
    const expectedValues = Array.from({ length: 16 }, (_, index) => index);
    const expectedProbs = Array.from({length: 16}, (_, index) => {
      if (index <= 10) {
        return index / 10;
      }
      else {
        return 1.0;
      }
    });

    result.values.forEach((val, index) => {
      expect(val).toBeCloseTo(expectedValues[index]);
    });
    result.probabilities.forEach((prob, index) => {
      expect(prob).toBeCloseTo(expectedProbs[index]);
    });
  });

  it('should handle an empty distribution', () => {
    const dist = {
      values: [],
      probabilities: [],
    };
    const result = toRegularGrid(dist, 0, 10);
    expect(result.values).toEqual(Array.from({ length: 11 }, (_, idx) => idx));
    // If the input distribution is empty, the probabilities should all be 0.
    expect(result.probabilities).toEqual(Array(11).fill(0));
  });
});

describe('ksTest', () => {
  it('should return 0 for identical distributions', () => {
    const distA = {
      values: [10, 20, 30],
      probabilities: [0.2, 0.5, 1.0],
    };
    const distB = {
      values: [10, 20, 30],
      probabilities: [0.2, 0.5, 1.0],
    };
    expect(ksTest(distA, distB)).toBe(0);
  });

  it('should calculate the correct max difference for different distributions', () => {
    const distA = {
      values: [10, 20, 30],
      probabilities: [0.2, 0.5, 1.0],
    };
    const distB = {
      values: [10, 20, 30],
      probabilities: [0.1, 0.6, 0.9],
    };
    // Differences:
    // |0.2 - 0.1| = 0.1
    // |0.5 - 0.6| = 0.1
    // |1.0 - 0.9| = 0.1
    expect(ksTest(distA, distB)).toBe(0.1);
  });

  it('should handle distributions with different values but same probabilities length (after toRegularGrid)', () => {
    // This scenario is typically handled by toRegularGrid ensuring same length and range.
    // For ksTest, it assumes inputs are already on a regular grid and have the same length.
    const distA = {
      values: [0, 1, 2],
      probabilities: [0.1, 0.5, 1.0],
    };
    const distB = {
      values: [0, 1, 2],
      probabilities: [0.2, 0.4, 0.8],
    };
    // Differences:
    // |0.1 - 0.2| = 0.1
    // |0.5 - 0.4| = 0.1
    // |1.0 - 0.8| = 0.2
    expect(ksTest(distA, distB)).toBeCloseTo(0.2);
  });
});
