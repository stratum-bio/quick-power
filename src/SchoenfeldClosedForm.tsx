import 'katex/dist/katex.min.css';

import React, { useState, useEffect, useCallback } from 'react';

import type { SchoenfeldParameters, SchoenfeldDerived } from './types/schoenfeld';
import SchoenfeldEventCount from './SchoenfeldEventCount';
import { validateSchoenfeldParameters } from './utils/schoenfeldValidation';
import { calculateDerivedParameters } from './utils/schoenfeld';


const DEFAULT_PARAMS: SchoenfeldParameters = {
  alpha: 0.05,
  beta: 0.2,
  group1Proportion: 0.3,
  group2Proportion: 0.7,
  hazardRatio: 0.667,
};



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

