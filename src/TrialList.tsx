import React from "react";

import type { TrialIndex, TrialMeta } from "./types/trialdata";
import TrialListItem from "./TrialListItem";

interface TrialListProps {
  trialIndex: TrialIndex;
  collapsedStates: Record<string, boolean>;
  toggleCollapse: (disease: string) => void;
  DISEASE_VAL_TO_NAME: Record<string, string>;
}

const TrialList: React.FC<TrialListProps> = ({
  trialIndex,
  collapsedStates,
  toggleCollapse,
  DISEASE_VAL_TO_NAME,
}) => {
  return (
    <>
      {Object.entries(
        trialIndex.trials.reduce(
          (acc, trial) => {
            (acc[trial.disease] = acc[trial.disease] || []).push(trial);
            return acc;
          },
          {} as Record<string, TrialMeta[]>,
        ),
      )
        .sort(([diseaseA], [diseaseB]) => diseaseA.localeCompare(diseaseB))
        .map(([disease, trials]) => (
          <div
            key={disease}
            className="m-4 mb-6 shadow-md shadow-gemini-blue/30 rounded-lg md:w-196"
          >
            <h2
              className={`text-xl font-bold text-left cursor-pointer ring ring-gemini-blue ${!collapsedStates[disease] ? "rounded-t-sm bg-gemini-blue text-white hover:bg-gemini-blue-hover" : "rounded-sm hover:bg-table-hl"} p-4 flex justify-between items-center`}
              onClick={() => toggleCollapse(disease)}
            >
              <span>
                {
                  DISEASE_VAL_TO_NAME[
                    disease as keyof typeof DISEASE_VAL_TO_NAME
                  ]
                }
              </span>
              <span className="ml-auto">
                {collapsedStates[disease] ? "\u25BC" : "\u25B2"}
              </span>
            </h2>
            {!collapsedStates[disease] && (
              <>
                <div className="grid grid-cols-4 md:grid-cols-5 pl-8 pr-4 md:gap-4 font-bold border-b pb-4 pt-3 uppercase text-xs text-right">
                  <div>Trial Name</div>
                  <div className="hidden md:block">Year</div>
                  <div>Subjects</div>
                  <div>Arms</div>
                  <div>Min Hazard Ratio</div>
                </div>
                <div className="text-right">
                  {trials
                    .sort(
                      (a, b) =>
                        a.min_hazard_ratio -
                        b.min_hazard_ratio,
                    )
                    .map((trial, idx) => (
                      <TrialListItem trial={trial} idx={idx} />
                    ))}
                </div>
              </>
            )}
          </div>
        ))}
    </>
  );
};

export default TrialList;
