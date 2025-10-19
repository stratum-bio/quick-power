import type { TrialMeta, TrialDataIndex } from "../types/trialdata.d";
import {
  FactorType,
  type FactorQuery,
  type ParsedFactor,
} from "../types/demo_types.d";

interface CumulativeDist {
  values: number[];
  probabilities: number[];
}

const AGE_PAD = 10;

function cumulativeSum(arr: number[]): number[] {
  // Initialize the result array with the first element's sum (which is itself)
  const result: number[] = [];
  let currentSum = 0;

  // Use the map method to iterate and push to the result array
  // Alternatively, you can use a simple for...of loop or a for loop.
  arr.map((num) => {
    currentSum += num; // Add the current number to the running total
    result.push(currentSum); // Push the new running total to the result array
  });

  return result.map((v) => v / currentSum);
}

export function toRegularGrid(
  dist: CumulativeDist,
  minVal: number,
  maxVal: number,
): CumulativeDist {
  const values = Array.from(
    { length: maxVal - minVal + 1 },
    (_, idx) => minVal + idx,
  );
  const probabilities: number[] = Array.from(
    { length: values.length },
    () => 0.0,
  );

  for (let i = 0; i < dist.values.length; i++) {
    const current = dist.values[i];

    const currentEndIdx = current - minVal;
    const currentStartIdx = i > 0 ? dist.values[i - 1] - minVal : 0;
    const numSteps = currentEndIdx - currentStartIdx;

    const baseProb = i > 0 ? dist.probabilities[i - 1] : 0;
    const stepSize = (dist.probabilities[i] - baseProb) / numSteps;
    for (let j = 0; j <= numSteps; j++) {
      probabilities[currentStartIdx + j] = baseProb + j * stepSize;
    }

    if (i == dist.values.length - 1) {
      for (let j = currentEndIdx; j < probabilities.length; j++) {
        probabilities[j] = 1.0;
      }
    }
  }

  return {
    values: values,
    probabilities: probabilities,
  };
}

export function computeCumulativeDists(
  factors: ParsedFactor[],
  maxPad: number,
): CumulativeDist[] {
  if (factors.length === 0) {
    return [];
  }

  const groupCount = factors[0].groups.length;
  for (let i = 0; i < groupCount; i++) {
    for (const f of factors.slice(1)) {
      if (f.groups.length !== groupCount) {
        return [];
      }
    }
  }

  const result: CumulativeDist[] = [];
  // upper will only be null for the upper limit
  const maxBound = Math.max(...factors.map((f) => Math.max(f.value_range.lower ?? 0 , f.value_range.upper ?? 0))) + maxPad;
  const values = factors.map((f) => f.value_range.upper ?? maxBound);

  for (let i = 0; i < factors[0].groups.length; i++) {
    const data = factors.map((f) => f.groups[i]);
    const densities = data.map((d) => d.count ?? d.percentage ?? 0);
    result.push({
      values: values,
      probabilities: cumulativeSum(densities),
    });
  }

  return result;
}

export function ksTest(a: CumulativeDist, b: CumulativeDist): number {
  let aIdx = 0;
  let bIdx = 0;
  if (a.values[0] < b.values[0]) {
    while (a.values[aIdx] < b.values[0]) {
      aIdx += 1;
    }
  }
  else {
    while (a.values[0] > b.values[bIdx]) {
      bIdx += 1;
    }
  }



  let maxDiff = 0.0;
  while (aIdx < a.values.length && bIdx < b.values.length) {
    const diff = Math.abs(a.probabilities[aIdx] - b.probabilities[bIdx]);
    if (diff > maxDiff) {
      maxDiff = diff;
    }

    aIdx += 1;
    bIdx += 1;
  }

  return maxDiff;
}

function queryToCumulativeDist(
  query: FactorQuery,
  expectedMax: number,
): CumulativeDist {
  // this is sorted already
  const values = query.intervals.map(
    (interval) => interval.upper ?? expectedMax,
  );

  return {
    values: values,
    probabilities: cumulativeSum(query.values),
  };
}

function sortIntervals(factors: ParsedFactor[]): ParsedFactor[] {
  return factors.sort(
    (a, b) => (a.value_range.lower ?? -1) - (b.value_range.lower ?? -1),
  );
}

function scoreAge(factors: ParsedFactor[], query: FactorQuery): number {
  const sortedFactors = sortIntervals(factors);
  const cumulativeDists = computeCumulativeDists(sortedFactors, AGE_PAD).map((d) =>
    toRegularGrid(d, d.values[0] - AGE_PAD, d.values[-1] + AGE_PAD),
  );
  const queryDist = toRegularGrid(queryToCumulativeDist(query, 90), 30, 90);
  const scores = cumulativeDists.map((c) => ksTest(c, queryDist));
  return Math.max(...scores);
}

function scoreECOG(factors: ParsedFactor[], query: FactorQuery): number {
  const sortedFactors = sortIntervals(factors);
  const cumulativeDists = computeCumulativeDists(sortedFactors, 1).map((d) =>
    toRegularGrid(d, 0, 3),
  );
  const queryDist = toRegularGrid(queryToCumulativeDist(query, 3), 0, 3);
  const scores = cumulativeDists.map((c) => ksTest(c, queryDist));
  return Math.min(...scores);
}

function hasFactor(dataIndex: TrialDataIndex, factor: FactorType): boolean {
  if (factor == FactorType.AGE && dataIndex.age.length > 0) {
    return true;
  } else if (factor == FactorType.ECOG && dataIndex.ecog.length > 0) {
    return true;
  }
  return false;
}

export function searchTrials(
  trials: TrialMeta[],
  disease: string,
  factor: FactorType,
  query: FactorQuery,
): TrialMeta[] {
  console.log(query);
  const diseaseTrials = trials.filter((t) => t.disease === disease);
  const withFactorTrials = diseaseTrials.filter(
    (t) => t.data_index && hasFactor(t.data_index, factor),
  );
  const scoredTrials = withFactorTrials.map((t) => {
    let score = 0.0;
    if (factor === FactorType.AGE) {
      score = scoreAge(t.data_index?.age ?? [], query);
    } else if (factor == FactorType.ECOG) {
      score = scoreECOG(t.data_index?.ecog ?? [], query);
    }
    return {
      score: score,
      trial: t,
    };
  });
  const rankedTrials = scoredTrials.sort((a, b) => a.score - b.score);

  return rankedTrials.map((e) => e.trial);
}
