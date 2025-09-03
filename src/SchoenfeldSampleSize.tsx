import React from 'react';
import { InlineMath } from 'react-katex';

import ValidatedInputField from './ValidatedInputField';
import type { SchoenfeldParameters, SchoenfeldDerived } from './types/schoenfeld';

function DerivationRow({ label, value }: { label: string, value: string }): React.ReactElement {
  return (
    <div className="flex justify-between items-center py-1 border-b border-gray-100 hover:bg-blue-200 rounded-lg pl-2 pr-2">
      <span className="font-medium text-gray-700"><InlineMath math={label} /></span>
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

  return (
    <div className="grid grid-cols-2">
      <div>
        <form>
          <ValidatedInputField
            max={1000}
            min={0.0}
            keyValue="medianSurvival"
            label="Median Survival, Group B"
            value={parameters.medianSurvivalB}
            onValueChange={(val) => setParameters((prev: SchoenfeldParameters) => ({ ...prev, medianSurvivalB: val }))}
            />
          <ValidatedInputField
            max={1000}
            min={0.0}
            keyValue="accrual"
            label="Accrual period"
            value={parameters.accrual}
            onValueChange={(val) => setParameters((prev: SchoenfeldParameters) => ({ ...prev, accrual: val }))}
            />
          <ValidatedInputField
            max={1000}
            min={0.0}
            keyValue="followup"
            label="Follow-up period"
            value={parameters.followupTime}
            onValueChange={(val) => setParameters((prev: SchoenfeldParameters) => ({ ...prev, followupTime: val }))}
            />
          <ValidatedInputField
            max={1.0}
            min={0.0}
            keyValue="survStart"
            label={`Survival at time ${parameters.followupTime}`}
            value={parameters.simpsonStartSurv}
            onValueChange={(val) => setParameters((prev: SchoenfeldParameters) => ({ ...prev, simpsonStartSurv: val }))}
            />
          <ValidatedInputField
            max={1.0}
            min={0.0}
            keyValue="survMid"
            label={`Survival at time ${parameters.followupTime + 0.5 * parameters.accrual}`}
            value={parameters.simpsonMidSurv}
            onValueChange={(val) => setParameters((prev: SchoenfeldParameters) => ({ ...prev, simpsonMidSurv: val }))}
            />
          <ValidatedInputField
            max={1.0}
            min={0.0}
            keyValue="survEnd"
            label={`Survival at time ${parameters.followupTime + parameters.accrual}`}
            value={parameters.simpsonEndSurv}
            onValueChange={(val) => setParameters((prev: SchoenfeldParameters) => ({ ...prev, simpsonEndSurv: val }))}
            />
        </form>
      </div>
      <div className="p-4 ml-8">
        {/* Calculate derived parameters here */}
        {(() => {
          return (
            <>
              <DerivationRow label="d_{B}" value={derivedParameters.baseEventProportion.toFixed(3)} />
              <DerivationRow label="d_{A} = 1 - (1 - d_{B})^{1 / \Delta}" value={derivedParameters.treatmentEventProportion.toFixed(3)} />
              <DerivationRow label="d = P_A * d_A + P_B * d_B" value={derivedParameters.overallEventProportion.toFixed(3)} />
            </>
          );
        })()}
        <div className="flex flex-col gap-2 items-center py-1 text-theme-dark border rounded-lg pt-2 pb-2 pl-6 pr-6 mt-2 hover:bg-blue-200">
          <div className="font-bold">Sample Size</div>
          <span className="text-2xl">
            <InlineMath math={`n_{events} / d = ${derivedParameters.sampleSize}`} />
          </span>
        </div>
      </div>
    </div>
  );
};

export default SchoenfeldSampleSize;
