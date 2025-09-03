import jStat from 'jstat';
import type { SchoenfeldParameters, SchoenfeldDerived } from '../types/schoenfeld';

/**
 * Computes the inverse of the normal CDF (PPF) for a given probability.
 * @param p The probability (a value between 0 and 1).
 * @param mean The mean of the normal distribution.
 * @param stdDev The standard deviation of the normal distribution.
 * @returns The corresponding value (quantile).
 */
function normalPPF(p: number, mean: number = 0, stdDev: number = 1): number {
  if (p <= 0 || p >= 1) {
    throw new Error('Probability must be between 0 and 1 (exclusive).');
  }
  return jStat.normal.inv(p, mean, stdDev);
}

export function calculateDerivedParameters(params: SchoenfeldParameters): SchoenfeldDerived {
  const alphaDeviate = normalPPF(1.0 - params.alpha / 2);
  const betaDeviate = normalPPF(1.0 - params.beta);
  const numerator = (alphaDeviate + betaDeviate) ** 2;
  const denominator = Math.log(params.hazardRatio) ** 2 * (params.group1Proportion * params.group2Proportion);
  return {
    alphaDeviate: alphaDeviate,
    betaDeviate: betaDeviate,
    numerator: numerator,
    denominator: denominator,
    eventCount: Math.round(numerator / denominator),
  };
}
