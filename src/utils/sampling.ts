// src/utils/sampling.ts
import random from "random";
import type { KaplanMeier } from "../types/trialdata.d";

/**
 * Samples from a Kaplan-Meier curve.
 *
 * @param km The Kaplan-Meier curve data.
 * @param count The number of samples to generate.
 * @param seed The seed for the random number generator.
 * @returns A tuple containing two arrays:
 *          - result_event: A boolean array indicating if an event occurred (true) or if censored (false).
 *          - result_time: A number array representing the sampled times.
 */
export function sample_km(
    km: KaplanMeier,
    count: number,
    seed: number = 123,
): [Uint8Array, Float64Array] {
    const rng = random.clone(seed);

    // Generate 'count' uniform random numbers between 0 and 1.
    const x: number[] = Array.from({ length: count }, () => rng.float());

    // Determine gt_idx: the first index where the random sample 'x' is greater than
    // the corresponding Kaplan-Meier survival probability.
    // If 'x' is not greater than any probability, it means 'x' is less than or equal to all,
    // in which case the index is 0 (as per numpy's argmax behavior for all False).
    const gt_idx: number[] = x.map(val_x => {
        let foundIdx = -1;
        for (let j = 0; j < km.probability.length; j++) {
            if (val_x > km.probability[j]) {
                foundIdx = j;
                break;
            }
        }
        return foundIdx === -1 ? 0 : foundIdx;
    });

    // Determine 'not_censored': true if the random sample 'x' is greater than the
    // last survival probability (meaning the event occurred before the last observed time).
    const not_censored: boolean[] = x.map(val_x => val_x > km.probability[km.probability.length - 1]);

    // Initialize result arrays with Uint8Array and Float64Array.
    const result_event: Uint8Array = new Uint8Array(count).fill(0); // Changed to Uint8Array, fill with 0
    const result_time: Float64Array = new Float64Array(count).fill(0); // Changed to Float64Array

    // Handle 'early_events': cases where not_censored is true and gt_idx is 0.
    // This corresponds to events occurring at or before the first observed time point.
    const early_events: boolean[] = not_censored.map((val, i) => val && (gt_idx[i] === 0));
    for (let i = 0; i < count; i++) {
        if (early_events[i]) {
            result_event[i] = 1; // Set to 1 for event
            result_time[i] = km.time[0];
        }
    }

    // Handle 'censored' events: cases where not_censored is false.
    // This means the event did not occur by the last observed time point, so it's censored.
    const censored: boolean[] = not_censored.map(val => !val);
    for (let i = 0; i < count; i++) {
        if (censored[i]) {
            result_event[i] = 0; // Set to 0 for censored
            result_time[i] = km.time[km.time.length - 1]; // Assign the longest observed time
        }
    }

    // Handle 'valid' events: cases where not_censored is true and gt_idx is greater than 1.
    // These are events that fall between two observed time points on the KM curve,
    // requiring interpolation.
    const valid: boolean[] = not_censored.map((val, i) => val && (gt_idx[i] > 1));
    for (let i = 0; i < count; i++) {
        if (valid[i]) {
            const current_gt_idx = gt_idx[i];
            const current_x = x[i];

            // Calculate distances for linear interpolation.
            const prob_prev = km.probability[current_gt_idx - 1];
            const prob_curr = km.probability[current_gt_idx];
            const time_prev = km.time[current_gt_idx - 1];
            const time_curr = km.time[current_gt_idx];

            const dist_left = prob_prev - current_x;
            const dist_right = current_x - prob_curr;
            const total_dist = dist_left + dist_right;

            let weight_left: number;
            let weight_right: number;

            // If total_dist is zero, it implies current_x is exactly at one of the probability points,
            // or the probabilities are identical. In such cases, assign equal weights for simplicity
            // or handle as an exact match if needed.
            if (total_dist === 0) {
                weight_left = 0.5;
                weight_right = 0.5;
            } else {
                weight_left = dist_left / total_dist;
                weight_right = dist_right / total_dist;
            }

            result_event[i] = 1; // Set to 1 for event
            result_time[i] = (weight_left * time_prev) + (weight_right * time_curr);
        }
    }

    return [result_event, result_time];
}
