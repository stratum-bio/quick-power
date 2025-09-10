import "katex/dist/katex.min.css";

import { InlineMath } from "react-katex";
import React, { useState, useEffect, useCallback } from "react";

import type {
  SchoenfeldParameters,
  SchoenfeldDerived,
} from "./types/schoenfeld";
import SchoenfeldEventCount from "./SchoenfeldEventCount";
import SchoenfeldSampleSize from "./SchoenfeldSampleSize";
import { validateSchoenfeldParameters } from "./utils/schoenfeldValidation";
import { calculateDerivedParameters } from "./utils/schoenfeld";
import { fitExponentialPerGroup } from "./utils/survival";

import EventsPlot from "./EventsPlot";
import ExponentialSurvivalPlot from "./ExponentialSurvivalPlot";
import SurvivalPlot from "./SurvivalPlot";
import TTEDistributionPlot from "./TTEDistributionPlot";

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
  const [parameters, setParameters] =
    useState<SchoenfeldParameters>(DEFAULT_PARAMS);
  const [derivedParameters, setDerivedParameters] = useState<SchoenfeldDerived>(
    calculateDerivedParameters(DEFAULT_PARAMS),
  );

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
    { time: parameters.followupTime, survProb: parameters.simpsonStartSurv },
    {
      time: parameters.followupTime + 0.5 * parameters.accrual,
      survProb: parameters.simpsonMidSurv,
    },
    {
      time: parameters.followupTime + parameters.accrual,
      survProb: parameters.simpsonEndSurv,
    },
  ];

  const [baseHazard, treatHazard] = fitExponentialPerGroup(
    baseSurv,
    parameters.hazardRatio,
  );

  return (
    <div className="md:w-2/3 pb-8">
      <h2 className="text-3xl mb-8 text-black px-4 text-left">
        Free-form Sample Size Estimation
      </h2>
      <div className="text-left mx-auto mb-4 px-4 text-black">
        <p>
          Enter the information about the 2-arm trial for which you would like
          to estimate the sample size for a survival endpoint.  This page starts
          with taking inputs to Schoenfeld's formula for producing a quick closed
          form estimate of sample size.  After the Schoenfeld method, We can compare
          simulation with permutation testing to compare sample size estimate results and
          understand the sampling distributions of parameters we care about.
        </p>
        <br />
        <h3 className="text-xl mb-4">Estimate the event count</h3>
        <p>
          Schoenfeld's formula for estimating sample size from the 1983 paper
          "Sample-Size Formula for the Proportional-Hazards Regression Model".
          The first step is determining the total number of events required for
          a clinical trial that compares two survival distributions, equation
          (1) in the paper. This equation is based on the proportional-hazards
          regression model, which assumes that the ratio of the hazard functions
          for two treatment groups is a constant, regardless of time or patient
          characteristics. It also assumes that the treatment effect is tested
          using an appropriate partial likelihood-based test, and that the two
          treatment groups are randomized with proportions{" "}
          <InlineMath math="P_A" /> (treatment) and <InlineMath math="P_B" />{" "}
          (control)
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
        <h3 className="text-xl mb-4">
          Estimate the total sample size using the event count
        </h3>
        <p>
          Given the total number of events required from equation (1), you can
          compute the sample size by dividing this number by the proportion of
          expected events in the trial. The proportion events is calculated by
          first approximating the proportion of events on each treatment arm,
          and then taking a weighted average of these proportions based on the
          proportion of patients randomized to each treatment.
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
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
        <h3 className="text-xl mb-4">Visualize the parameters</h3>
      </div>
      <div className="m-4 mt-8">
        <SurvivalPlot
          hazardRatio={parameters.hazardRatio}
          baseSurv={baseSurv}
        />
      </div>
      <div className="text-left mx-auto m-8 m-8 px-4 text-black">
        <p>
          Here we are simply plotting the information provided.
          <InlineMath math="\ S_B(t)" /> is directly entered in the second part
          of the form, then we can derive <InlineMath math="S_A(t)" /> using the
          provided relative hazard ratio.
        </p>
        <br />
        <p>
          Using these point estimates of the survival curve for each group,
          along with the expected proportion of enrollment, we can take the
          total estimated sample size and compute
          <InlineMath math="\ n_{samples} * P_B * (1 - S_B(t))" /> for the
          control group B and
          <InlineMath math="\ n_{samples} * P_A * (1 - S_A(t))" /> for treatment
          group A to produce (very naive) point estimates of the event accrual
          over time.
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
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
        <h3 className="text-xl mb-4">
          Fit a parametric (exponential) curve to the data
        </h3>
      </div>
      <div className="text-left mx-auto m-8 m-8 px-4 text-black">
        <p>
          Given the 3 points provided for <InlineMath math="\ S_B(t)" /> and the
          3 derived points for <InlineMath math="\ S_A(t)" />, we can fit naive
          exponential curves <InlineMath math="e^{-\lambda t} " /> to this data
          and see the result.
        </p>
      </div>
      <div className="m-8">
        <ExponentialSurvivalPlot
          hazardRatio={parameters.hazardRatio}
          baseSurv={baseSurv}
          baseLambda={baseHazard}
          treatLambda={treatHazard}
          maxTime={parameters.accrual + parameters.followupTime}
        />
      </div>
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
        <h3 className="text-xl mb-4">
          Estimate the mean survival sampling distribution
        </h3>
      </div>
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
        <p>
          Using the hazard rates produced by fitting the exponential model, we
          can then simulate these hazard rates at varying sample sizes to
          estimate the sampling distribution at different sample sizes. This is
          naively sampling from exponential distributions and then re-fitting
          the exponential distribution to see the range of values that result.
          Since the simulation and permutation testing makes fewer assumptions
          about the generating distributions, this leads to a larger sample size
          estimate compared to Schoenfeld's formula.
        </p>
      </div>
      <div className="m-8">
        <TTEDistributionPlot
          totalSampleSize={Math.round(derivedParameters.sampleSize) * 1.5}
          baselineHazard={baseHazard}
          hazardRatio={parameters.hazardRatio}
          accrual={parameters.accrual}
          followup={parameters.followupTime}
          alpha={parameters.alpha}
          beta={parameters.beta}
          controlProportion={parameters.group2Proportion}
          treatProportion={parameters.group1Proportion}
          controlLabel="1 / \lambda_B"
          treatLabel="1 / \lambda_A"
          forceUpdate={false}
        />
      </div>
      <div className="text-left mx-auto mt-8 mb-8 px-4 text-black">
        <p>
          The sample size estimate based on the simulation and permutation
          testing is where the Target alpha line crosses the one-sided upper
          confidence bound which was set as input at the top.
        </p>
        <br />
        <p>
          The default parameters of this simulation are such that the simulation
          is quick, which means the estimates will be noisy and non-monotonic.
          To get more reliable results, increase the Permutations (number of
          random permutations used to estimate the p-value for every simulated
          clinical trial) and the Simulations (number of simulated clinical
          trials). These scale multiplicatively, so increasing each by a factor
          of 10 will increase the total computation time by a factor of 100.
          Increase the Evaluations to increase how many different sample sizes
          are evaluated in the simulation.
        </p>
      </div>
    </div>
  );
};

export default SchoenfeldClosedForm;
