import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import { samplesToLambda } from "./utils/simulate";
import MultiSurvivalPlot from "./MultiSurvivalPlot";
import KaplanMeierPlot from "./KaplanMeierPlot";

import { DISEASE_VAL_TO_NAME } from "./constants";

function fitLambdaPerArm(data: Trial): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < data.arms.length; i++) {
    const arm = data.arms[i];
    result[arm.arm_name] = samplesToLambda(
      new Float64Array(arm.time),
      new Uint8Array(arm.events.map((v) => Number(v))),
    );
  }
  return result;
}

const TrialDetail: React.FC = () => {
  const { trialName } = useParams<{ trialName: string }>();
  const [trialData, setTrialData] = useState<Trial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lambdaByArm, setLambdaByArm] = useState<Record<string, number> | null>(
    null,
  );

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        const response = await fetch(`/ct1.v1/${trialName}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Trial = await response.json();
        setTrialData(data);
        setLambdaByArm(fitLambdaPerArm(data));
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTrial();
  }, [trialName]);

  if (loading) {
    return <div className="text-black">Loading trial details...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!trialData) {
    return <div className="text-black">No trial data found.</div>;
  }

  return (
    <div className="p-6 text-black text-left w-full">
      <h2 className="text-3xl font-bold mb-4">{trialData.meta.identifier}</h2>
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4">
        <div className="font-semibold">PubMed ID</div>
        <div>{trialData.meta.pubmed}</div>

        <div className="font-semibold">Publication Date</div>
        <div>{trialData.meta.publication_date.split(" ")[0]}</div>

        <div className="font-semibold">Cancer Type</div>
        <div>
          {
            DISEASE_VAL_TO_NAME[
              trialData.meta.disease as keyof typeof DISEASE_VAL_TO_NAME
            ]
          }
        </div>

        <div className="font-semibold">Subjects</div>
        <div>{trialData.meta.subjects}</div>
      </div>
      <Link
        to={`/simulate-from-trial/${trialName}`}
        className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4"
      >
        Simulate from this Trial
      </Link>
      <h2 className="text-xl font-bold mb-3">Trial Arms</h2>
      {trialData.arms.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trialData.arms.map((arm, index) => (
            <div key={index} className="border rounded-md">
              <h3 className="text-xl font-semibold mb-2 bg-theme-light p-4 pb-2 pt-2 rounded-t-lg">
                {arm.arm_name}
              </h3>
              <div className="grid grid-cols-2 p-2 pl-4 pr-4">
                <p className="">
                  <span className="font-semibold">Events</span>
                </p>
                <p>{arm.events.filter(Boolean).length}</p>
                <p className="">
                  <span className="font-semibold">Subjects</span>
                </p>
                <p>{arm.time.length}</p>
                {lambdaByArm !== null ? (
                  <>
                    <p className="">
                      <span className="font-semibold">Mean TTE</span>
                    </p>
                    <p>
                      {( 1.0 / lambdaByArm[arm.arm_name]).toFixed(1)}
                      {" "}
                       Months
                    </p>
                  </>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No arm data available.</p>
      )}
      {trialName !== undefined && (
        <>
          <h2 className="text-xl font-bold mb-3 mt-8">Kaplan-Meier</h2>
          <div className="max-w-3xl">
            <KaplanMeierPlot trialName={trialName} />
          </div>
        </>
      )}

      {lambdaByArm !== null ? (
        <>
          <h2 className="text-xl font-bold mb-3 mt-8">
            Fitted Exponential Survival
          </h2>
          <div className="max-w-3xl">
            <MultiSurvivalPlot
              names={Object.keys(lambdaByArm)}
              lambdas={Object.values(lambdaByArm)}
              maxTime={Math.max(...trialData.arms[0].time)}
            />
          </div>
        </>
      ) : null}

      <CitationFooter />
    </div>
  );
};

export default TrialDetail;
