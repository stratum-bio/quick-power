import jStat from 'jstat';
import React, { useState } from 'react';

interface ValidatedInputFieldProps {
  min: number;
  max: number;
  key: string;
  label: string;
  value: number;
  onValueChange?: (value: number) => void;
}


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

const ValidatedInputField: React.FC<ValidatedInputFieldProps> = ({ min, max, key, label, value, onValueChange = () => {} }) => {
  let className = "shadow appearance-none border rounded w-32 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline";
  if (value >= max || value <= min) {
    className += " border-red-500";
  }

  return <div className="flex items-center mb-4 justify-end">
    <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor={key}>{label}:</label>
    <input className={className}
      type="number"
      id={key}
      value={value}
      onChange={(e) => {
        const value = e.target.value;
        const num = parseFloat(value);
        onValueChange(num);
      }}
      step="any"
    />
  </div>
};

const SchoenfeldClosedForm: React.FC = () => {
  const [alpha, setAlpha] = useState<number>(0.05);
  const [beta, setBeta] = useState<number>(0.1);
  const [group1Proportion, setGroup1Proportion] = useState<number>(0.3);
  const [group2Proportion, setGroup2Proportion] = useState<number>(0.7);
  const [hazardRatio, setHazardRatio] = useState<number>(2.0 / 3.0);

  const [alphaDeviate, setAlphaDeviate] = useState<number>(0.0);
  const [betaDeviate, setBetaDeviate] = useState<number>(0.0);
  const [numerator, setNumerator] = useState<number>(0.0);
  const [denominator, setDenominator] = useState<number>(0.0);
  const [eventCount, setEventCount] = useState<number>(0.0);


  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    const alphaDev = normalPPF(1.0 - alpha / 2);
    const betaDev = normalPPF(1.0 - beta);
    const numer = (alphaDev + betaDev) ** 2;
    const denom = Math.log(hazardRatio) ** 2 * group1Proportion * group2Proportion;

    setAlphaDeviate(alphaDev); 
    setBetaDeviate(betaDev);
    setNumerator(numer);
    setDenominator(denom);
    setEventCount(Math.round(numer / denom));
  };

  const group1Change = (prop: number) => {
    setGroup1Proportion(prop);
    setGroup2Proportion(1.0 - prop);
  };

  return (
    <div className="grid grid-cols-2">
      <div>
      <form onSubmit={handleSubmit}>
        <ValidatedInputField max={0.5} min={0.0} key="alpha" label="Alpha" value={alpha} onValueChange={setAlpha}/>
        <ValidatedInputField max={0.5} min={0.0} key="beta" label="Beta" value={beta} onValueChange={setBeta}/>
        <ValidatedInputField max={0.99} min={0.01} key="grp1Prop" label="Group 1 Proportion" value={group1Proportion} onValueChange={group1Change} />
        <div className="flex items-center mb-4 justify-end">
          <label className="block text-gray-700 text-sm font-bold mr-4" htmlFor="group2Proportion">Group 2 Proportion:</label>
          <input
            className="shadow appearance-none border rounded w-32 py-2 px-3 text-gray-400 leading-tight focus:outline-none focus:shadow-outline"
            type="number"
            id="group2Proportion"
            value={group2Proportion}
            readOnly
          />
        </div>
        <ValidatedInputField max={5} min={0.0} key="hazardRatio" label="Relative Hazard Ratio" value={hazardRatio} onValueChange={setHazardRatio}/>
        <div className="text-center pl-30 mt-8">
          <button className="bg-blue-200 hover:bg-blue-400 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">Submit</button>
        </div>
      </form>
      </div>
      <div>
        <p>Event count derivation</p>
        <p>Alpha Deviate {alphaDeviate}</p>
        <p>Beta Deviate {betaDeviate}</p>
        <p>Numerator {numerator}</p>
        <p>Denominator {denominator}</p>
        <p>Event count {eventCount}</p>
      </div>
    </div>
  );
};

export default SchoenfeldClosedForm;
