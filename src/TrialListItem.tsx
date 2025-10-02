import React from "react";
import { Link } from "react-router-dom";
import type { TrialMeta } from "./types/trialdata";

interface TrialListItemProps {
  trial: TrialMeta;
  idx: number;
}

const TrialListItem: React.FC<TrialListItemProps> = ({ trial, idx }) => {
  return (
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
  );
};

export default TrialListItem;
