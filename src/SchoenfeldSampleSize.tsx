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
    <div className="flex justify-between items-center py-1 border-b border-gray-100 hover:bg-blue-200 rounded-lg pl-2 pr-2">
      <span className="font-medium text-gray-700">
        <InlineMath math={label} />
      </span>
      <span className="text-gray-900">{value}</span>
    </div>
  );
}

interface SchoenfeldSampleSizeProps {
  parameters: SchoenfeldParameters;
  setParameters: React.Dispatch<React.SetStateAction<SchoenfeldParameters>>;
  derivedParameters: SchoenfeldDerived;
  invalid: boolean;
  invalidMsg: string;
}

const SchoenfeldSampleSize: React.FC<SchoenfeldSampleSizeProps> = ({
  parameters,
  setParameters,
  derivedParameters,
}) => {
  const accrualLabel = (
    <span>
      Accrual period, <InlineMath math="a" />
    </span>
  );
  const followupLabel = (
    <span>
      Follow-up period, <InlineMath math="f" />
    </span>
  );
  const survStartLabel = (
    <span>
      Survival @ {parameters.followupTime}, <InlineMath math="S_{B}(f)" />
    </span>
  );
  const survMidLabel = (
    <span>
      Survival @ {parameters.followupTime + 0.5 * parameters.accrual},{" "}
      <InlineMath math="S_{B}(f + \frac{a}{2})" />
    </span>
  );
  const survEndLabel = (
    <span>
      Survival @ {parameters.followupTime + parameters.accrual},{" "}
      <InlineMath math="S_{B}(f + a)" />
    </span>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 items-end gap-x-8">
      <div>
        <form>
          <ValidatedInputField
            max={1000}
            min={0.0}
            keyValue="accrual"
            label={accrualLabel}
            value={parameters.accrual}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                accrual: val,
              }))
            }
          />
          <ValidatedInputField
            max={1000}
            min={0.0}
            keyValue="followup"
            label={followupLabel}
            value={parameters.followupTime}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                followupTime: val,
              }))
            }
          />
          <ValidatedInputField
            max={1.0}
            min={0.0}
            keyValue="survStart"
            label={survStartLabel}
            value={parameters.simpsonStartSurv}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                simpsonStartSurv: val,
              }))
            }
          />
          <ValidatedInputField
            max={1.0}
            min={0.0}
            keyValue="survMid"
            label={survMidLabel}
            value={parameters.simpsonMidSurv}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                simpsonMidSurv: val,
              }))
            }
          />
          <ValidatedInputField
            max={1.0}
            min={0.0}
            keyValue="survEnd"
            label={survEndLabel}
            value={parameters.simpsonEndSurv}
            onValueChange={(val) =>
              setParameters((prev: SchoenfeldParameters) => ({
                ...prev,
                simpsonEndSurv: val,
              }))
            }
          />
        </form>
      </div>
      <div className="p-4">
        {/* Calculate derived parameters here */}
        {(() => {
          return (
            <>
              <span className="">
                <DerivationRow
                  label="d_{B} = 1 - \frac{S_B(f) + 4 S_B(f + \frac{a}{2}) + S_B(f+a)}{6}"
                  value={derivedParameters.baseEventProportion.toFixed(3)}
                />
              </span>
              <DerivationRow
                label="d_{A} = 1 - (1 - d_{B})^{1 / \Delta}"
                value={derivedParameters.treatmentEventProportion.toFixed(3)}
              />
              <DerivationRow
                label="d = P_A * d_A + P_B * d_B"
                value={derivedParameters.overallEventProportion.toFixed(3)}
              />
            </>
          );
        })()}
        <div className="flex flex-col gap-2 items-center py-1 text-theme-dark border rounded-lg pt-2 pb-2 pl-6 pr-6 mt-2 hover:bg-blue-200">
          <div className="font-bold">Sample Size</div>
          <span className="text-2xl">
            <InlineMath
              math={`n_{events} / d = ${derivedParameters.sampleSize}`}
            />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoenfeldSampleSize;
