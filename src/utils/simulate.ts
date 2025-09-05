import random from "random";

/**
 * Calculates the value at each given percentile for a Float64Array.
 *
 * This function first creates a sorted copy of the input array to avoid
 * modifying the original. It then calculates the index for each percentile
 * and returns the corresponding value from the sorted array.
 *
 * The method used is a linear interpolation between the nearest two data points
 * to the desired percentile.
 *
 * @param data A Float64Array containing the data points.
 * @param percentiles A number array containing the percentiles to calculate (e.g., [25, 50, 75]).
 * Values should be between 0 and 100, inclusive.
 * @returns A Float64Array containing the value at each given percentile, in the same order as the input percentiles.
 * @throws {Error} If any percentile value is not between 0 and 100.
 */
export function getPercentiles(
  data: Float64Array,
  percentiles: number[],
): Float64Array {
  // Input validation for percentiles
  for (const p of percentiles) {
    if (p < 0 || p > 100) {
      throw new Error("Percentile values must be between 0 and 100.");
    }
  }

  // Handle empty data array edge case
  if (data.length === 0) {
    return new Float64Array(percentiles.length).fill(NaN);
  }

  // Sort the data in ascending order. We create a copy to avoid mutating the original array.
  const sortedData = new Float64Array(data);
  sortedData.sort();

  // Array to store the results
  const result = new Float64Array(percentiles.length);

  for (let i = 0; i < percentiles.length; i++) {
    const p = percentiles[i];

    // Calculate the index for the given percentile using linear interpolation.
    // The formula (p / 100) * (data.length - 1) is a common method for this.
    const index = (p / 100) * (sortedData.length - 1);

    // Get the whole and fractional parts of the index
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    const fractionalPart = index - lowerIndex;

    if (lowerIndex === upperIndex) {
      // If the index is an integer, the value is at that exact position
      result[i] = sortedData[lowerIndex];
    } else {
      // Interpolate between the two nearest data points
      const lowerValue = sortedData[lowerIndex];
      const upperValue = sortedData[upperIndex];
      result[i] = lowerValue + fractionalPart * (upperValue - lowerValue);
    }
  }

  return result;
}

/**
 * Calculates the maximum likelihood estimate (MLE) of the rate parameter (lambda)
 * for an exponential distribution from a set of samples.
 * The MLE is the inverse of the sample mean.
 * @param samples The data samples.
 * @returns The estimated lambda value.
 */
function estimateExponentialLambda(samples: Float64Array): number {
  if (samples.length === 0) {
    throw new Error("Cannot estimate lambda from an empty sample set.");
  }
  const mean = samples.reduce((sum, val) => sum + val, 0) / samples.length;
  // Lambda is the inverse of the mean
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

function shuffle(array: Float64Array, rng: () => number): Float64Array {
  let currentIndex = array.length;
  let randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex !== 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(rng() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

function sample(
  size: number,
  baseDist: () => number,
  treatDist: () => number,
): [Float64Array, Float64Array] {
  const baseSamples = new Float64Array(size);
  const treatSamples = new Float64Array(size);

  for (let j = 0; j < size; j++) {
    baseSamples[j] = baseDist();
    treatSamples[j] = treatDist();
  }

  return [baseSamples, treatSamples];
}

export function simulate(
  baseLambda: number,
  treatLambda: number,
  simulationCount: number,
  sampleSize: number,
  seed: string = "123",
): {
  baseLambdaDist: Float64Array;
  treatLambdaDist: Float64Array;
  permutationPValue: number;
} {
  random.use(seed);
  const baseDist = random.exponential(baseLambda);
  const treatDist = random.exponential(treatLambda);
  const uniform = random.uniform();

  const baseLambdaDist = new Float64Array(simulationCount);
  const treatLambdaDist = new Float64Array(simulationCount);
  let psum = 0.0;

  for (let i = 0; i < simulationCount; i++) {
    const [baseSamples, treatSamples] = sample(sampleSize, baseDist, treatDist);
    const combined = concatenate(baseSamples, treatSamples);
    const baseLambdaEst = estimateExponentialLambda(baseSamples);
    const treatLambdaEst = estimateExponentialLambda(treatSamples);
    const combLambdaEst = estimateExponentialLambda(combined);

    const ratio = likelihoodRatio(
      baseLambdaEst,
      treatLambdaEst,
      combLambdaEst,
      baseSamples.length,
      treatSamples.length,
    );

    shuffle(combined, uniform);
    const baseNullSamples = combined.slice(0, baseSamples.length);
    const treatNullSamples = combined.slice(
      baseSamples.length,
      baseSamples.length + treatSamples.length,
    );

    const baseNullLambdaEst = estimateExponentialLambda(baseNullSamples);
    const treatNullLambdaEst = estimateExponentialLambda(treatNullSamples);

    const nullRatio = likelihoodRatio(
      baseNullLambdaEst,
      treatNullLambdaEst,
      combLambdaEst,
      baseSamples.length,
      treatSamples.length,
    );

    if (nullRatio > ratio) {
      psum += 1;
    }

    baseLambdaDist[i] = baseLambdaEst;
    treatLambdaDist[i] = treatLambdaEst;
  }

  const permutationPValue = psum / simulationCount;

  return {
    baseLambdaDist,
    treatLambdaDist,
    permutationPValue,
  };
}
