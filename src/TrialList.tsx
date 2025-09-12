import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { Link } from "react-router-dom";
import type { TrialIndex, TrialMeta } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import AppError from "./AppError"; // Import the AppError component

import { DISEASE_VAL_TO_NAME } from "./constants";

const TrialList: React.FC = () => {
  const [trialIndex, setTrialIndex] = useState<TrialIndex | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [collapsedStates, setCollapsedStates] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    const fetchTrials = async () => {
      try {
        const response = await fetch("/ct1.v1/index.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TrialIndex = await response.json();
        setTrialIndex(data);

        // Initialize all disease sections as collapsed
        const initialCollapsedStates: Record<string, boolean> = {};
        data.trials.forEach((trial) => {
          initialCollapsedStates[trial.disease] = true;
        });
        setCollapsedStates(initialCollapsedStates);
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError("Index data not found");
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrials();
  }, []);

  const toggleCollapse = (disease: string) => {
    setCollapsedStates((prevState) => ({
      ...prevState,
      [disease]: !prevState[disease],
    }));
  };

  if (loading) {
    return <Loading message="Loading trials..." />;
  }

  if (error) {
    return <AppError errorMessage={error} />;
  }

  return (
    <div className="w-full mt-4">
      <h2 className="text-3xl m-4 mb-8 text-black text-left">
        Find a reference trial for sample size estimation
      </h2>
      <div className="text-left m-4 mb-8 text-black md:w-196">
        <p>
          Explores the cancer trials listed here to find a trial which would
          make a good starting point for performing power analysis and sample
          size estimation.
        </p>
      </div>
      {trialIndex && trialIndex.trials.length > 0 ? (
        Object.entries(
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
              className="m-4 mb-6 shadow-md rounded-lg md:w-196"
            >
              <h2
                className="text-xl font-bold text-left cursor-pointer bg-theme-light rounded-t-lg p-4 flex justify-between items-center"
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
                    {trials.map((trial) => (
                      <Link
                        to={`/trial-detail/${trial.identifier}`}
                        key={trial.identifier}
                        className="grid grid-cols-4 md:grid-cols-5 pl-8 pr-4 md:gap-4 pb-3 pt-3 hover:bg-gray-200"
                      >
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
                      </Link>
                    ))}
                  </div>
                </>
              )}
            </div>
          ))
      ) : (
        <div>No trials found.</div>
      )}
      <div className="m-4">
        <CitationFooter />
      </div>
    </div>
  );
};

export default TrialList;
