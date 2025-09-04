import 'katex/dist/katex.min.css';

import { InlineMath } from 'react-katex';
import React, { useState, useEffect, useCallback } from 'react';

import type { SchoenfeldParameters, SchoenfeldDerived } from './types/schoenfeld';
import SchoenfeldEventCount from './SchoenfeldEventCount';
import SchoenfeldSampleSize from './SchoenfeldSampleSize';
import { validateSchoenfeldParameters } from './utils/schoenfeldValidation';
import { calculateDerivedParameters } from './utils/schoenfeld';


const DEFAULT_PARAMS: SchoenfeldParameters = {
  alpha: 0.05,
  beta: 0.8,
  group1Proportion: 0.5,
  group2Proportion: 0.5,
  hazardRatio: 0.667,

  accrual: 2,
  followupTime: 1,
  simpsonStartSurv: 0.43,
  simpsonMidSurv: 0.2,
  simpsonEndSurv: 0.11,
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
    <>
      <div className="text-left mx-auto mb-4 px-4">
        <p>
          Schoenfeld's formula for estimating sample size from the 1983 paper "Sample-Size Formula for the Proportional-Hazards Regression Model".
          The first step is determining the total number of events required for a clinical trial that compares two survival distributions,
          equation (1) in the paper.  This equation is based on the proportional-hazards regression model, which assumes that the ratio of
          the hazard functions for two treatment groups is a constant, regardless of time or patient characteristics. It also assumes that the 
          treatment effect is tested using an appropriate partial likelihood-based test, and that the two treatment groups are randomized with
          proportions <InlineMath math="P_A" /> (treatment) and <InlineMath math="P_B" /> (control)
        </p>
      </div>
      <div className="px-8">
        <SchoenfeldEventCount
          parameters={parameters}
          setParameters={setParameters}
          derivedParameters={derivedParameters}
          invalid={invalid}
          invalidMsg={invalidMsg}
        />
      </div>
      <div className="text-left mx-auto mt-8 mb-8 px-4">
        <p>
        Given the total number of events required from equation (1), you can compute the sample size by dividing this number by the proportion of expected
        events in the trial. The proportion events is calculated by first approximating the proportion of events on each treatment arm, and then taking a weighted
        average of these proportions based on the proportion of patients randomized to each treatment.
        </p>
      </div>
      <div className="px-8">
        <SchoenfeldSampleSize
          parameters={parameters}
          setParameters={setParameters}
          derivedParameters={derivedParameters}
          invalid={invalid}
          invalidMsg={invalidMsg}
        />
      </div>
    </>
  );
};

export default SchoenfeldClosedForm;

