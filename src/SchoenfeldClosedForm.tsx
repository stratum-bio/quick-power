import jStat from 'jstat';
import React, { useState, useEffect, useCallback } from 'react';
import { InlineMath } from 'react-katex';

import ValidatedInputField from './ValidatedInputField';

import 'katex/dist/katex.min.css';


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

function DerivationRow({ label, value }: { label: string, value: string }): React.ReactElement {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 hover:bg-blue-200 rounded-lg pl-2 pr-2">
      <span className="font-medium text-gray-700"><InlineMath math={label} /></span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

const SchoenfeldClosedForm: React.FC = () => {
  const [alpha, setAlpha] = useState<number>(0.05);
  const [beta, setBeta] = useState<number>(0.2);
  const [group1Proportion, setGroup1Proportion] = useState<number>(0.3);
  const [group2Proportion, setGroup2Proportion] = useState<number>(0.7);
  const [hazardRatio, setHazardRatio] = useState<number>(0.667);

  const [invalid, setInvalid] = useState<boolean>(false);
  const [invalidMsg, setInvalidMsg] = useState<string>("");

  const [alphaDeviate, setAlphaDeviate] = useState<number>(0.0);
  const [betaDeviate, setBetaDeviate] = useState<number>(0.0);
  const [numerator, setNumerator] = useState<number>(0.0);
  const [denominator, setDenominator] = useState<number>(0.0);
  const [eventCount, setEventCount] = useState<number>(0.0);

  const validate = useCallback(() => {
    setInvalidMsg(""); // Clear previous messages at the start of validation

    if (alpha <= 0.0 || alpha >= 0.5) {
      setInvalidMsg("Alpha must be between (0.0, 0.5)")
      return false;
    }
    if (beta <= 0.0 || beta >= 0.5) {
      setInvalidMsg("Beta must be between (0.0, 0.5)")
      return false;
    }
    if (group1Proportion < 0.1 || group1Proportion > 0.9) {
      setInvalidMsg("Proportion must be between 0.1 and 0.9");
      return false;
    }
    if (hazardRatio < 0.01 || hazardRatio > 5.0) {
      setInvalidMsg("Relative Hazard Ratio must be between 0.01 and 5");
      return false;
    }
    return true;
  }, [alpha, beta, group1Proportion, hazardRatio]);

  const handleUpdate = useCallback(() => {
    if (!validate()) {
      setInvalid(true);
      return;
    }
    setInvalid(false);

    const alphaDev = normalPPF(1.0 - alpha / 2);
    const betaDev = normalPPF(1.0 - beta);
    const numer = (alphaDev + betaDev) ** 2;
    const denom = Math.log(hazardRatio) ** 2 * (group1Proportion * group2Proportion);

    setAlphaDeviate(alphaDev);
    setBetaDeviate(betaDev);
    setNumerator(numer);
    setDenominator(denom);
    setEventCount(Math.round(numer / denom));
  }, [validate, alpha, beta, group1Proportion, hazardRatio, group2Proportion]);

  const group1Change = (prop: number) => {
    setGroup1Proportion(prop);
    setGroup2Proportion(1.0 - prop);
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
        <ValidatedInputField max={0.5} min={0.0} key="alpha" label="Alpha" value={alpha} onValueChange={setAlpha}/>
        <ValidatedInputField max={0.5} min={0.0} key="beta" label="Beta" value={beta} onValueChange={setBeta}/>
        <ValidatedInputField max={0.99} min={0.01} key="grp1Prop" label={groupALabel} value={group1Proportion} onValueChange={group1Change} />
        <div className="flex items-center mb-4 justify-end">
          <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="group2Proportion">{groupBLabel}:</label>
          <input
            className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            id="group2Proportion"
            value={group2Proportion}
            readOnly
          />
        </div>
        <ValidatedInputField max={5} min={0.0} key="hazardRatio" label={relativeHazardLabel} value={hazardRatio} onValueChange={setHazardRatio}/>
      </form>
      {invalid && (
        <p className="text-red-500 text-center mt-4">{invalidMsg}</p>
      )}
      </div>
      <div className="p-4 ml-8">
      {/*<h2 className="text-lg font-bold mb-4 text-gray-800">Event Count Derivation</h2> */}
        <DerivationRow label="Z_{1 - \alpha/2}" value={alphaDeviate.toFixed(3)} />
        <DerivationRow label="Z_{\beta}" value={betaDeviate.toFixed(3)} />
        <DerivationRow label="(Z_{1 - \alpha/2} + Z_{\beta})^2" value={numerator.toFixed(3)} />
        <DerivationRow label="P_A * P_B * log(\Delta)^2" value={denominator.toFixed(3)} />
        <div className="flex flex-col gap-2 items-center py-1 text-theme-dark border rounded-lg pt-2 pb-2 pl-6 pr-6 mt-2 hover:bg-blue-200">
          <div className="font-bold">Event Count</div>
          <span className="text-2xl">
            <InlineMath math={`\\frac{(Z_{1 - \\alpha / 2} + Z_{\\beta})^2}{P_A * P_B * log(\\Delta)^2} = ${eventCount}`} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoenfeldClosedForm;
