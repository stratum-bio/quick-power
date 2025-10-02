import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import type { TrialIndex } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import AppError from "./AppError"; // Import the AppError component

import { DISEASE_VAL_TO_NAME } from "./constants";
import FactorRangeInput from "./FactorRangeInput";
import { AgeFactors } from "./data/filter-factor-age";
import TrialList from "./TrialList"; // Import the new component

const TrialSelect: React.FC = () => {
  const [trialIndex, setTrialIndex] = useState<TrialIndex | null>(() => {
    const savedTrialIndex = localStorage.getItem("trialIndex");
    return savedTrialIndex ? JSON.parse(savedTrialIndex) : null;
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(() => {
    const savedError = localStorage.getItem("error");
    return savedError ? JSON.parse(savedError) : null;
  });
  const [collapsedStates, setCollapsedStates] = useState<
    Record<string, boolean>
  >(() => {
    const savedCollapsedStates = localStorage.getItem("collapsedStates");
    return savedCollapsedStates ? JSON.parse(savedCollapsedStates) : {};
  });

  useEffect(() => {
    if (trialIndex && Object.keys(collapsedStates).length > 0) {
      setLoading(false);
      return;
    }

    const fetchTrials = async () => {
      try {
        const response = await fetch("/ct1.v1/index.json");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: TrialIndex = await response.json();
        setTrialIndex(data);

        // Initialize all disease sections as collapsed if no saved state
        setCollapsedStates((prevState) => {
          if (Object.keys(prevState).length === 0) {
            const initialCollapsedStates: Record<string, boolean> = {};
            data.trials.forEach((trial) => {
              initialCollapsedStates[trial.disease] = true;
            });
            return initialCollapsedStates;
          }
          return prevState;
        });
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
  }, [trialIndex, collapsedStates]);

  useEffect(() => {
    localStorage.setItem("collapsedStates", JSON.stringify(collapsedStates));
  }, [collapsedStates]);

  useEffect(() => {
    localStorage.setItem("trialIndex", JSON.stringify(trialIndex));
  }, [trialIndex]);

  useEffect(() => {
    localStorage.setItem("error", JSON.stringify(error));
  }, [error]);

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
      <FactorRangeInput factors={AgeFactors} />
      <h2 className="text-3xl m-4 mb-8 text-black text-left">
        Find a reference trial for sample size estimation
      </h2>
      <div className="text-left m-4 mb-8 text-black md:w-196">
        <p>
          Explore the cancer trials listed here to find a trial which would make
          a good starting point for performing power analysis and sample size
          estimation.
        </p>
      </div>
      {trialIndex && trialIndex.trials.length > 0 ? (
        <TrialList
          trialIndex={trialIndex}
          collapsedStates={collapsedStates}
          toggleCollapse={toggleCollapse}
          DISEASE_VAL_TO_NAME={DISEASE_VAL_TO_NAME}
        />
      ) : (
        <div>No trials found.</div>
      )}
      <div className="m-4">
        <CitationFooter />
      </div>
    </div>
  );
};

export default TrialSelect;
