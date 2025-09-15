import { describe, it, expect } from 'vitest';
import { logRankTest } from './logrank';

describe('logRankTest', () => {
  it('should return chi2=0 and p=1 for identical groups', () => {
    const controlTime = new Float64Array([10, 20, 30, 40, 50]);
    const controlEvent = new Uint8Array([1, 0, 1, 0, 1]);
    const treatTime = new Float64Array([10, 20, 30, 40, 50]);
    const treatEvent = new Uint8Array([1, 0, 1, 0, 1]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );

    expect(chi2).toBe(0);
    expect(pValue).toBe(1);
  });

  it('should return chi2=0 and p=1 when there are no events', () => {
    const controlTime = new Float64Array([10, 20, 30, 40, 50]);
    const controlEvent = new Uint8Array([0, 0, 0, 0, 0]);
    const treatTime = new Float64Array([15, 25, 35, 45, 55]);
    const treatEvent = new Uint8Array([0, 0, 0, 0, 0]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );

    expect(chi2).toBe(0);
    expect(pValue).toBe(1);
  });

  it('should calculate the correct statistic for a simple case with censoring', () => {
    // Example from https://www.statsdirect.com/help/survival_analysis/logrank.htm
    const treatTime = new Float64Array([10, 15, 20, 25, 30]);
    const treatEvent = new Uint8Array([1, 1, 0, 1, 1]);
    const controlTime = new Float64Array([12, 18, 22, 28, 32]);
    const controlEvent = new Uint8Array([1, 1, 1, 1, 1]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );

    // The website gives Chi-squared = 0.07, P = 0.79. Code is more precise.
    expect(chi2).toBeCloseTo(0.0793, 4);
    expect(pValue).toBeCloseTo(0.778, 3);
  });

  it('should detect a significant difference between groups', () => {
    const controlTime = new Float64Array([10, 12, 15]);
    const controlEvent = new Uint8Array([1, 1, 1]);
    const treatTime = new Float64Array([100, 120, 150]);
    const treatEvent = new Uint8Array([1, 1, 1]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );

    // Manual calculation: chi2 ~ 5.05, p ~ 0.024. Code is more precise.
    expect(chi2).toBeCloseTo(5.05166, 5);
    expect(pValue).toBeCloseTo(0.0246, 4);
  });

  it('should handle tied event times between groups', () => {
    const controlTime = new Float64Array([10, 20, 30]);
    const controlEvent = new Uint8Array([1, 1, 1]);
    const treatTime = new Float64Array([10, 25, 35]);
    const treatEvent = new Uint8Array([1, 1, 1]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );
    // Manual calculation after bugfix: chi2 ~ 0.396, p ~ 0.529
    expect(chi2).toBeCloseTo(0.3960, 4);
    expect(pValue).toBeCloseTo(0.52914, 5);
  });

  it('should handle empty inputs', () => {
    const controlTime = new Float64Array([]);
    const controlEvent = new Uint8Array([]);
    const treatTime = new Float64Array([]);
    const treatEvent = new Uint8Array([]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );
    expect(chi2).toBe(0);
    expect(pValue).toBe(1);
  });

  it('should handle one group being empty', () => {
    const controlTime = new Float64Array([10, 20, 30]);
    const controlEvent = new Uint8Array([1, 1, 1]);
    const treatTime = new Float64Array([]);
    const treatEvent = new Uint8Array([]);

    const [chi2, pValue] = logRankTest(
      controlTime,
      controlEvent,
      treatTime,
      treatEvent,
    );
    // O will be 0. E will be 0. V will be 0. Result should be 0.
    expect(chi2).toBe(0);
    expect(pValue).toBe(1);
  });
});