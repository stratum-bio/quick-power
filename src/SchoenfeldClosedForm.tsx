import 'katex/dist/katex.min.css';

import jStat from 'jstat';
import React, { useState, useEffect, useCallback } from 'react';
import { InlineMath } from 'react-katex';

import ValidatedInputField from './ValidatedInputField';

interface SchoenfeldParameters {
  alpha: number;
  beta: number;
  group1Proportion: number;
  group2Proportion: number;
  hazardRatio: number;
}

interface SchoenfeldIntermediate {
  alphaDeviate: number;
  betaDeviate: number;
  numerator: number;
  denominator: number;
  eventCount: number;
}


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

function calculateDerivedParameters(params: SchoenfeldParameters): SchoenfeldIntermediate {
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

function DerivationRow({ label, value }: { label: string, value: string }): React.ReactElement {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 hover:bg-blue-200 rounded-lg pl-2 pr-2">
      <span className="font-medium text-gray-700"><InlineMath math={label} /></span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

const SchoenfeldClosedForm: React.FC = () => {
  const [parameters, setParameters] = useState<SchoenfeldParameters>(DEFAULT_PARAMS);
  const [derivedParameters, setDerivedParameters] = useState<SchoenfeldIntermediate>(calculateDerivedParameters(DEFAULT_PARAMS));

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

  const group1Change = (prop: number) => {
    setParameters(prevParams => ({
      ...prevParams,
      group1Proportion: prop,
      group2Proportion: 1.0 - prop,
    }));
  };

  useEffect(() => {
    handleUpdate();
  }, [handleUpdate]);

  const groupALabel = <span>Group A Proportion (<InlineMath math="P_{A}"/>)</span>;
  const groupBLabel = <span>Group B Proportion (<InlineMath math="P_{B}"/>)</span>;
  const relativeHazardLabel = <span>Relative Hazard Ratio (<InlineMath math="\Delta"/>)</span>;

  return (
    <div className="grid grid-cols-2">
      <div>
      <form>
        <ValidatedInputField max={0.5} min={0.0} keyValue="alpha" label="Alpha" value={parameters.alpha} onValueChange={(val) => setParameters(prev => ({ ...prev, alpha: val }))}/>
        <ValidatedInputField max={0.5} min={0.0} keyValue="beta" label="Beta" value={parameters.beta} onValueChange={(val) => setParameters(prev => ({ ...prev, beta: val }))}/>
        <ValidatedInputField max={0.99} min={0.01} keyValue="grp1Prop" label={groupALabel} value={parameters.group1Proportion} onValueChange={group1Change} />
        <div className="flex items-center mb-4 justify-end">
          <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="group2Proportion">{groupBLabel}:</label>
          <input
            className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            id="group2Proportion"
            value={parameters.group2Proportion}
            readOnly
          />
        </div>
        <ValidatedInputField max={5} min={0.0} keyValue="hazardRatio" label={relativeHazardLabel} value={parameters.hazardRatio} onValueChange={(val) => setParameters(prev => ({ ...prev, hazardRatio: val }))}/>
      </form>
      {invalid && (
        <p className="text-red-500 text-center mt-4">{invalidMsg}</p>
      )}
      </div>
      <div className="p-4 ml-8">
        {/* Calculate derived parameters here */}
        {(() => {
          const { alphaDeviate, betaDeviate, numerator, denominator } = derivedParameters;
          return (
            <>
              <DerivationRow label="Z_{1 - \alpha/2}" value={alphaDeviate.toFixed(3)} />
              <DerivationRow label="Z_{\beta}" value={betaDeviate.toFixed(3)} />
              <DerivationRow label="(Z_{1 - \alpha/2} + Z_{\beta})^2" value={numerator.toFixed(3)} />
              <DerivationRow label="P_A * P_B * log(\Delta)^2" value={denominator.toFixed(3)} />
            </>
          );
        })()}
        <div className="flex flex-col gap-2 items-center py-1 text-theme-dark border rounded-lg pt-2 pb-2 pl-6 pr-6 mt-2 hover:bg-blue-200">
          <div className="font-bold">Event Count</div>
          <span className="text-2xl">
            <InlineMath math={`\\frac{(Z_{1 - \\alpha / 2} + Z_{\\beta})^2}{P_A * P_B * log(\\Delta)^2} = ${derivedParameters.eventCount}`} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoenfeldClosedForm;
