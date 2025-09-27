import React from "react";
import { InlineMath } from "react-katex";

import ValidatedInputField from "./ValidatedInputField";
import type {
  SchoenfeldParameters,
  SchoenfeldDerived,
} from "./types/schoenfeld";

function DerivationRow({
  label,
  value,
}: {
  label: string;
  value: string;
}): React.ReactElement {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 hover:bg-table-hl rounded-lg pl-2 pr-2">
      <span className="font-medium text-gray-700">
        <InlineMath math={label} />
      </span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

interface SchoenfeldEventCountProps {
  parameters: SchoenfeldParameters;
  setParameters: React.Dispatch<React.SetStateAction<SchoenfeldParameters>>;
  derivedParameters: SchoenfeldDerived;
  invalid: boolean;
  invalidMsg: string;
}

const SchoenfeldEventCount: React.FC<SchoenfeldEventCountProps> = ({
  parameters,
  setParameters,
  derivedParameters,
  invalid,
  invalidMsg,
}) => {
  const group1Change = (prop: number) => {
    setParameters((prevParams: SchoenfeldParameters) => ({
      ...prevParams,
      group1Proportion: prop,
      group2Proportion: 1.0 - prop,
    }));
  };

  const alphaLabel = (
    <span>
      Alpha, <InlineMath math="\alpha" />
    </span>
  );
  const betaLabel = (
    <span>
      Beta, <InlineMath math="\beta" />
    </span>
  );
  const groupALabel = (
    <span>
      Group A Proportion, <InlineMath math="P_{A}" />
    </span>
  );
  const groupBLabel = (
    <span>
      Group B Proportion, <InlineMath math="P_{B}" />
    </span>
  );
  const relativeHazardLabel = (
    <span>
      Relative Hazard Ratio, <InlineMath math="\Delta" />
    </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-end">
      <div className="shrink">
        <form>
          <ValidatedInputField
            max={0.5}
            min={0.0}
            keyValue="alpha"
            label={alphaLabel}
            value={parameters.alpha}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                alpha: val,
              }))
            }
          />
          <ValidatedInputField
            max={1.0}
            min={0.5}
            keyValue="beta"
            label={betaLabel}
            value={parameters.beta}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                beta: val,
              }))
            }
          />
          <ValidatedInputField
            max={0.99}
            min={0.01}
            keyValue="grp1Prop"
            label={groupALabel}
            value={parameters.group1Proportion}
            onValueChange={group1Change}
          />
          <div className="mb-4 flex flex-col items-center">
            <div className="block w-48 text-left">
              <label
                className="block font-medium text-gray-700 mb-1"
                htmlFor="group2Proportion"
              >
                {groupBLabel}
              </label>
            </div>
            <input
              className="mt-1 block w-48 pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md text-right text-gray-400"
              type="number"
              id="group2Proportion"
              value={parameters.group2Proportion}
              readOnly
            />
          </div>
          <ValidatedInputField
            max={5}
            min={0.0}
            keyValue="hazardRatio"
            label={relativeHazardLabel}
            value={parameters.hazardRatio}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                hazardRatio: val,
              }))
            }
          />
        </form>
        {invalid && (
          <p className="text-red-500 text-center mt-4">{invalidMsg}</p>
        )}
      </div>
      <div className="p-4">
        {/* Calculate derived parameters here */}
        {(() => {
          const { alphaDeviate, betaDeviate, numerator, denominator } =
            derivedParameters;
          return (
            <>
              <DerivationRow
                label="Z_{1 - \alpha}"
                value={alphaDeviate.toFixed(3)}
              />
              <DerivationRow label="Z_{\beta}" value={betaDeviate.toFixed(3)} />
              <DerivationRow
                label="(Z_{1 - \alpha} + Z_{\beta})^2"
                value={numerator.toFixed(3)}
              />
              <DerivationRow
                label="P_A * P_B * log(\Delta)^2"
                value={denominator.toFixed(3)}
              />
            </>
          );
        })()}
        <div className="flex flex-col gap-2 items-center py-1 text-theme-dark border rounded-lg pt-2 pb-2 pl-6 pr-6 mt-2 hover:bg-table-hl">
          <div className="font-bold">
            Event Count, <InlineMath math="n_{events}" />
          </div>
          <span className="text-2xl text-center">
            <InlineMath
              math={`\\frac{(Z_{1 - \\alpha } + Z_{\\beta})^2}{P_A * P_B * log(\\Delta)^2} = ${derivedParameters.eventCount}`}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoenfeldEventCount;
