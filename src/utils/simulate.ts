import { Random } from "random";

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

function sample(
  size: number,
  baseDist,
  treatDist,
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
  const random = new Random(seed);
  const baseDist = random.exponential(baseLambda);
  const treatDist = random.exponential(treatLambda);

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

    random.shuffle(combined);
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
