import 'katex/dist/katex.min.css';

import jStat from 'jstat';
import React, { useState, useEffect, useCallback } from 'react';

import type { SchoenfeldParameters, SchoenfeldDerived } from './types/schoenfeld';
import SchoenfeldEventCount from './SchoenfeldEventCount';




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


  const validate = useCallback(() => {
    setInvalidMsg(""); // Clear previous messages at the start of validation

    if (parameters.alpha <= 0.0 || parameters.alpha >= 0.5) {
      setInvalidMsg("Alpha must be between (0.0, 0.5)")
      return false;
    }
    if (parameters.beta <= 0.0 || parameters.beta >= 0.5) {
      setInvalidMsg("Beta must be between (0.0, 0.5)")
      return false;
    }
    if (parameters.group1Proportion < 0.1 || parameters.group1Proportion > 0.9) {
      setInvalidMsg("Proportion must be between 0.1 and 0.9");
      return false;
    }
    if (parameters.hazardRatio < 0.01 || parameters.hazardRatio > 5.0) {
      setInvalidMsg("Relative Hazard Ratio must be between 0.01 and 5");
      return false;
    }
    return true;
  }, [parameters]);

  const handleUpdate = useCallback(() => {
    if (!validate()) {
      setInvalid(true);
      return;
    }
    setInvalid(false);

    const derived = calculateDerivedParameters(parameters);
    setDerivedParameters(derived);
  }, [validate, parameters]);


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

