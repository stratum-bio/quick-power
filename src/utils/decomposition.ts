import type { KaplanMeier } from "../../types/trialdata";

const TOLERANCE = 1e-3;
const MAX_ITERATIONS = 100;
const GRADIENT_SCALING = 0.1;

function _validate(proportions: number[], hazard_ratios: number[]): void {
  if (proportions.length <= 1) {
    throw new Error("Must have more than one group");
  }
  if (proportions.length !== hazard_ratios.length) {
    throw new Error("Proportions and hazard ratios must match");
  }
  if (hazard_ratios[0] !== 1) {
    throw new Error(
      "First hazard ratio must be 1 to represent the reference survival curve",
    );
  }
}

function error(
  s_original: KaplanMeier,
  s_fit: KaplanMeier,
  proportions: number[],
  hazard_ratios: number[],
): number[] {
  _validate(proportions, hazard_ratios);

  let estimate: number[] = Array(s_fit.probability.length).fill(0);

  for (let i = 0; i < proportions.length; i++) {
    const proportion = proportions[i];
    const hazard_ratio = hazard_ratios[i];
    const powered_surv_prob = s_fit.probability.map((val) =>
      Math.pow(val, hazard_ratio),
    );
    estimate = estimate.map(
      (val, idx) => val + proportion * powered_surv_prob[idx],
    );
  }

  return estimate.map((val, idx) => val - s_original.probability[idx]);
}

function derivative(
  s_fit: KaplanMeier,
  proportions: number[],
  hazard_ratios: number[],
): number[] {
  _validate(proportions, hazard_ratios);

  let estimate: number[] = s_fit.probability.map(() => proportions[0]);

  for (let i = 1; i < proportions.length; i++) {
    const proportion = proportions[i];
    const hazard_ratio = hazard_ratios[i];
    const powered_surv_prob = s_fit.probability.map((val) =>
      Math.pow(val, hazard_ratio - 1),
    );
    estimate = estimate.map(
      (val, idx) => val + proportion * hazard_ratio * powered_surv_prob[idx],
    );
  }

  return estimate;
}

export function fit_reference_survival(
  s_orig: KaplanMeier,
  proportions: number[],
  hazard_ratios: number[],
): KaplanMeier {
  const s_fit: KaplanMeier = {
    time: [...s_orig.time],
    probability: [...s_orig.probability],
  };

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const e = error(s_orig, s_fit, proportions, hazard_ratios);
    const deriv = derivative(s_fit, proportions, hazard_ratios);

    const avg_error = e.reduce((sum, val) => sum + Math.abs(val), 0) / e.length;
    console.log(`Error: ${avg_error.toFixed(3)}`);

    if (avg_error < TOLERANCE) {
      return s_fit;
    }

    s_fit.probability = s_fit.probability.map(
      (val, idx) => val - GRADIENT_SCALING * (e[idx] / deriv[idx]),
    );
  }

  throw new Error("Failed to converge");
}
