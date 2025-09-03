import 'katex/dist/katex.min.css';

import jStat from 'jstat';
import React, { useState, useEffect, useCallback } from 'react';

import type { SchoenfeldParameters, SchoenfeldDerived } from './types/schoenfeld';
import SchoenfeldEventCount from './SchoenfeldEventCount';
import { validateSchoenfeldParameters } from './utils/schoenfeldValidation';


const DEFAULT_PARAMS: SchoenfeldParameters = {
  alpha: 0.05,
  beta: 0.2,
  group1Proportion: 0.3,
  group2Proportion: 0.7,
  hazardRatio: 0.667,
};


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

function calculateDerivedParameters(params: SchoenfeldParameters): SchoenfeldDerived {
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



const SchoenfeldClosedForm: React.FC = () => {
  const [parameters, setParameters] = useState<SchoenfeldParameters>(DEFAULT_PARAMS);
  const [derivedParameters, setDerivedParameters] = useState<SchoenfeldDerived>(calculateDerivedParameters(DEFAULT_PARAMS));

  const [invalid, setInvalid] = useState<boolean>(false);
  const [invalidMsg, setInvalidMsg] = useState<string>("");

  const handleUpdate = useCallback(() => {
    const validationResult = validateSchoenfeldParameters(parameters);
    if (!validationResult.isValid) {
      setInvalid(true);
      setInvalidMsg(validationResult.message);
      return;
    }
    setInvalid(false);
    setInvalidMsg("");

    const derived = calculateDerivedParameters(parameters);
    setDerivedParameters(derived);
  }, [parameters]);


  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  return (
    <SchoenfeldEventCount
      parameters={parameters}
      setParameters={setParameters}
      derivedParameters={derivedParameters}
      invalid={invalid}
      invalidMsg={invalidMsg}
    />
  );
};

export default SchoenfeldClosedForm;

