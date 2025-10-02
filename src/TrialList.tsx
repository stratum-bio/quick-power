import React from "react";
import { Link } from "react-router-dom";
import type { TrialIndex, TrialMeta } from "./types/trialdata";

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
            className="m-4 mb-6 shadow-lg shadow-gemini-blue/30 irounded-lg md:w-196"
          >
            <h2
              className={`text-xl font-bold text-left cursor-pointer border border-gemini-blue ${!collapsedStates[disease] ? "rounded-t-sm bg-gemini-blue text-white hover:bg-gemini-blue-hover" : "rounded-sm hover:bg-table-hl"} p-4 flex justify-between items-center`}
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
                        (a.weibull_max_diff || Infinity) -
                        (b.weibull_max_diff || Infinity),
                    )
                    .map((trial, idx) => (
                      <Link
                        to={`/trial-detail/${trial.identifier}`}
                        key={trial.identifier}
                        className={`grid pr-4 ${idx % 2 == 0 ? "bg-gray-100" : ""} hover:bg-table-hl`}
                      >
                        {trial.title && (
                          <div className="text-left italic mt-4 ml-4">
                            {trial.title ? trial.title : ""}
                          </div>
                        )}
                        <div className="grid grid-cols-4 md:grid-cols-5 md:gap-4 mt-2 mb-2">
                          <div>{trial.identifier}</div>
                          <div className="hidden md:block">
                            {new Date(trial.publication_date).getFullYear()}
                          </div>
                          <div>{trial.subjects}</div>
                          <div>{trial.arms}</div>
                          <div>
                            {trial.weibull_max_diff
                              ? trial.weibull_max_diff.toFixed(3)
                              : "N/A"}
                          </div>
                        </div>
                      </Link>
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