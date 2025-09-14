import type { KaplanMeier } from "../types/trialdata.d";

/**
 * Computes the Restricted Mean Survival Time (RMST) from a Kaplan-Meier curve.
 *
 * @param {KaplanMeier} km - An object containing the time points and survival probabilities.
 * @param {number} tau - The pre-defined time point to restrict the mean survival time.
 * @returns {number} The calculated RMST value.
 */
export const calculateRMST = (km: KaplanMeier, tau: number): number => {
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

    // Stop if the current time point is beyond our cutoff tau.
    if (startTime >= tau) {
      break;
    }

    // The height of the rectangle is the survival probability at the start of the interval.
    const height = probabilities[i];

    // Determine the end time for this rectangle.
    // It's either the next time point or tau, whichever comes first.
    const nextTime = i + 1 < times.length ? times[i + 1] : tau;
    const endTime = Math.min(nextTime, tau);

    // The width of the rectangle is the duration of this interval.
    const width = endTime - startTime;

    // Add the area of this rectangle to the total RMST.
    rmst += height * width;
  }

  return rmst;
};
