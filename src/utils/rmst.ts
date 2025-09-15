import type { KaplanMeier } from "../types/trialdata.d";

// This is Gemini-generated code now

import { jStat } from "jstat";

/**
 * The final result of the two-arm RMST comparison.
 */
export interface RMSTComparisonResult {
  controlRMST: number;
  treatRMST: number;
  difference: number;
  zScore: number;
  pValue: number;
}

/**
 * Computes the Restricted Mean Survival Time (RMST) from a Kaplan-Meier curve.
 *
 * @param {KaplanMeier} km - An object containing the time points and survival probabilities.
 * @param {number} tau - The pre-defined time point to restrict the mean survival time.
 * @returns {number} The calculated RMST value.
 */
export function calculateRMST(km: KaplanMeier, tau: number): number {
  if (tau < 0) {
    throw new Error("tau must be a non-negative number.");
  }

  // Ensure the curve starts at time 0 with 100% probability for correct area calculation.
  const times = [0, ...km.time];
  const probabilities = [1, ...km.probability];

  let rmst = 0;

  // Iterate through the time points to calculate the area of each rectangle under the curve.
  for (let i = 0; i < times.length; i++) {
    const startTime = times[i];
    if (startTime >= tau) {
      break;
    }
    const height = probabilities[i];
    const nextTime = i + 1 < times.length ? times[i + 1] : tau;
    const endTime = Math.min(nextTime, tau);
    const width = endTime - startTime;
    rmst += height * width;
  }

  return rmst;
}

/**
 * Computes the variance of the RMST estimator.
 * @param {KaplanMeier} km - The complete Kaplan-Meier data.
 * @param {number} tau - The pre-defined time point.
 * @returns {number} The calculated variance of the RMST.
 */
export function calculateRMSTVariance(km: KaplanMeier, tau: number): number {
  // Validate that the necessary data for variance calculation is present.
  if (
    !km.events_at_time ||
    !km.at_risk_at_time ||
    km.events_at_time.length !== km.time.length ||
    km.at_risk_at_time.length !== km.time.length
  ) {
    throw new Error(
      "To calculate variance, the KaplanMeier object must include 'events_at_time' and 'at_risk_at_time' arrays with the same length as 'time'.",
    );
  }

  let variance = 0;

  for (let i = 0; i < km.time.length; i++) {
    const t_i = km.time[i];
    if (t_i > tau) continue; // Only sum up to tau

    const d_i = km.events_at_time[i];
    const n_i = km.at_risk_at_time[i];

    // Avoid division by zero; if n_i equals d_i, this term contributes 0 to the variance sum.
    if (n_i === 0 || n_i === d_i) continue;

    const greenwoodComponent = d_i / (n_i * (n_i - d_i));

    // Calculate the integral term: ∫[t_i to τ] S(t) dt.
    // This is equivalent to RMST(τ) - RMST(t_i).
    const areaUntilTau = calculateRMST(km, tau);
    const areaUntilT_i = calculateRMST(km, t_i);
    const remainingArea = areaUntilTau - areaUntilT_i;

    variance += greenwoodComponent * Math.pow(remainingArea, 2);
  }
  const totalEvents = km.events_at_time.reduce((a, b) => a+b);
  let biasCorrection = 1; 
  if (totalEvents > 0) {
    biasCorrection = totalEvents / (totalEvents - 1);
  }
  return variance * biasCorrection;
}

/**
 * Compares two Kaplan-Meier curves using RMST and computes a p-value.
 *
 * @param {KaplanMeier} control - Complete data for the first arm.
 * @param {KaplanMeier} treatment - Complete data for the second arm.
 * @param {number} tau - The pre-defined time point to restrict the analysis.
 * @returns {RMSTComparisonResult} An object with the RMST values, difference, Z-score, and p-value.
 */
export function compareRMST(
  control: KaplanMeier,
  treatment: KaplanMeier,
  tau: number,
): RMSTComparisonResult {
  // 1. Calculate RMST for each arm
  const controlRMST = calculateRMST(control, tau);
  const treatRMST = calculateRMST(treatment, tau);

  // 2. Calculate the variance of RMST for each arm
  const controlVar = calculateRMSTVariance(control, tau); // This will throw an error if data is missing
  const treatVar = calculateRMSTVariance(treatment, tau);

  // 3. Compute the difference and the Z-score
  const difference = treatRMST - controlRMST;
  const seDifference = Math.sqrt(controlVar + treatVar);

  // Handle case where there is no variance (e.g., no events)
  if (seDifference === 0) {
    const pValue = difference === 0 ? 1.0 : 0.0;
    return { controlRMST, treatRMST, difference, zScore: Infinity, pValue };
  }

  const zScore = difference / seDifference;

  // 4. Compute the two-sided p-value from the Z-score using jStat
  const pValue = 2 * (1 - jStat.normal.cdf(Math.abs(zScore), 0, 1));

  return { controlRMST, treatRMST, difference, zScore, pValue };
}
