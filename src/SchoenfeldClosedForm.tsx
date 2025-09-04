import 'katex/dist/katex.min.css';

import { InlineMath } from 'react-katex';
import React, { useState, useEffect, useCallback } from 'react';

import type { SchoenfeldParameters, SchoenfeldDerived } from './types/schoenfeld';
import SchoenfeldEventCount from './SchoenfeldEventCount';
import SchoenfeldSampleSize from './SchoenfeldSampleSize';
import { validateSchoenfeldParameters } from './utils/schoenfeldValidation';
import { calculateDerivedParameters } from './utils/schoenfeld';

import SurvivalPlot from './SurvivalPlot';
import EventsPlot from './EventsPlot';


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

  const baseSurv = [
    {time: parameters.followupTime, survProb: parameters.simpsonStartSurv},
    {time: parameters.followupTime + 0.5 * parameters.accrual, survProb: parameters.simpsonMidSurv},
    {time: parameters.followupTime + parameters.accrual, survProb: parameters.simpsonEndSurv},
  ];

  return (
    <>
      <div className="text-left mx-auto mb-4 px-4 text-black">
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
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
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
      <div className="mt-8">
        <SurvivalPlot
          hazardRatio={parameters.hazardRatio}
          baseSurv={baseSurv} 
        />
      </div>
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
        <p>
        Here we are simply plotting the information provided. 
        <InlineMath math="\ S_B(t)" /> is directly entered in the second part of the form, then
        we can derive <InlineMath math="S_A(t)" /> using the provided relative hazard ratio.
        </p>
        <br />
        <p>
          Using these point estimates of the survival curve for each group, along with the expected
          proportion of enrollment, we can take the total estimated sample size and compute
          <InlineMath math="\ n_{samples} * P_B * (1 - S_B(t))" /> for the control group B and
          <InlineMath math="\ n_{samples} * P_A * (1 - S_A(t))" /> for
          treatment group A to produce (very naive) point estimates of the event accrual over time.
        </p>
      </div>
      <div className="mt-8">
        <EventsPlot
          hazardRatio={parameters.hazardRatio}
          baseSurv={baseSurv} 
          aProportion={parameters.group2Proportion}
          bProportion={parameters.group1Proportion}
          sampleSize={derivedParameters.sampleSize}
        />
      </div>
    </>
  );
};

export default SchoenfeldClosedForm;

