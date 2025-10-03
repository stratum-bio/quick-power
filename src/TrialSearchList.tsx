import React from "react";

import type { TrialMeta } from "./types/trialdata";
import TrialListItem from "./TrialListItem";
import { FactorType } from "./types/demo_types.d";

interface TrialSearchListProps {
  trials: TrialMeta[];
  factorType: FactorType;
}

const TrialSearchList: React.FC<TrialSearchListProps> = ({
  trials,
  factorType,
}) => {
  return (
    <div
      key="search_results"
      className="m-4 mb-6 shadow-md shadow-gemini-blue/30 rounded-lg md:w-196"
    >
      <h2
        className={`text-xl font-bold text-left cursor-pointer ring ring-gemini-blue rounded-t-sm bg-gemini-blue text-white hover:bg-gemini-blue-hover p-4 flex justify-between items-center`}
      >
        <span>Trial results</span>
      </h2>
      <div className="grid grid-cols-4 md:grid-cols-5 pl-8 pr-4 md:gap-4 font-bold border-b pb-4 pt-3 uppercase text-xs text-right">
        <div>Trial Name</div>
        <div className="hidden md:block">Year</div>
        <div>Subjects</div>
        <div>Arms</div>
        <div>Min Hazard Ratio</div>
      </div>
      <div className="text-right">
        {trials.map((trial, idx) => (
          <TrialListItem trial={trial} idx={idx} showFactor={factorType} />
        ))}
      </div>
    </div>
  );
};

export default TrialSearchList;
