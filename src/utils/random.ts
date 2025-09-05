import { Random } from "random";

/**
 * Generates a randomly sampled matrix of a specified size using an exponential distribution.
 * The matrix is represented as a flattened Float64Array for memory efficiency.
 * @param nRows The number of rows for the matrix.
 * @param mCols The number of columns for the matrix.
 * @param lambda The rate parameter (λ) for the exponential distribution.
 * @param seed An optional seed for the random number generator to ensure reproducibility.
 * @returns A Float64Array containing the flattened matrix.
 */
export function generateExponentialMatrix(
  nRows: number,
  mCols: number,
  lambda: number,
  seed: string = "123",
): Float64Array {
  // Validate input dimensions
  if (nRows <= 0 || mCols <= 0) {
    throw new Error("Matrix dimensions must be positive integers.");
  }

  // Initialize the random number generator with a seed if provided
  const random = new Random(seed);
  const dist = random.exponential(lambda);

  // Create a new Float64Array with the total number of elements
  const totalElements = nRows * mCols;
  const matrix = new Float64Array(totalElements);

  // Use the exponential distribution sampler to fill the array
  // The exponential distribution is a continuous distribution that is useful for
  // modeling the time until a certain event occurs.
  for (let i = 0; i < totalElements; i++) {
    matrix[i] = dist();
  }

  return matrix;
}
