import React, { useEffect, useState } from "react";
import Loading from "./Loading";
import { useParams, Link } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import { samplesToLambda } from "./utils/simulate";
import MultiSurvivalPlot from "./MultiSurvivalPlot";
import KaplanMeierPlot from "./KaplanMeierPlot";
import AppError from "./AppError"; // Import the AppError component

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
          setError("Trial data not found");
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
    return <Loading message="Loading trial details..." />;
  }

  if (error) {
    return <AppError errorMessage={error} />;
  }

  if (!trialData) {
    return (
      <div className="text-black w-full text-center pt-16">
        No trial data found.
      </div>
    );
  }

  const armWeibull = Object.fromEntries(
    Object.entries(trialData.meta.weibull_by_arm).filter(
      ([, value]) => value !== null,
    ),
  );

  const conditionsLabel = trialData.meta.condition_list
    ? trialData.meta.condition_list.join(", ")
    : null;

  return (
    <div className="p-6 text-black text-left w-full">
      <h2 className="text-3xl font-bold mb-4">{trialData.meta.identifier}</h2>
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4 md:w-3xl">
        {trialData.meta.title && (
          <React.Fragment>
            <div className="font-semibold">Title</div>
            <div className="pb-2">{trialData.meta.title}</div>
          </React.Fragment>
        )}
        {conditionsLabel && (
          <React.Fragment>
            <div className="font-semibold">Conditions</div>
            <div className="pb-2">{conditionsLabel}</div>
          </React.Fragment>
        )}
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
        className="inline-block bg-gemini-blue hover:bg-gemini-blue-hover text-white font-bold py-2 px-4 rounded mb-4"
      >
        Simulate from this Trial
      </Link>
      <h2 className="text-xl font-bold mb-3">Trial Arms</h2>
      {trialData.arms.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {trialData.arms.map((arm, index) => (
            <div key={index} className="rounded-md shadow-xl/30 shadow-gemini-blue ring ring-gemini-blue">
              <h3 className="text-xl font-semibold mb-2 p-4 pb-2 pt-2">
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
                <p className="pt-2">
                  <span className="font-semibold">Weibull</span>
                </p>
                <p></p>
                <p>Scale</p>
                <p>
                  {arm.arm_name in armWeibull
                    ? armWeibull[arm.arm_name].scale.toFixed(3)
                    : "N/A"}
                </p>
                <p>Shape</p>
                <p>
                  {arm.arm_name in armWeibull
                    ? armWeibull[arm.arm_name].shape.toFixed(3)
                    : "N/A"}
                </p>
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
            <KaplanMeierPlot
              trialName={trialName}
              // Only uncomment this if you want to test/verify the
              // typescript KM estimator against the sksurv
              // KM estimator
              // trialData={trialData}
            />
          </div>
        </>
      )}

      {lambdaByArm !== null ? (
        <>
          <h2 className="text-xl font-bold mb-3 mt-8">Parametric Survival</h2>
          <p>
            Here we a Weibull (solid) and exponential (dashed) models fit to the
            data.
          </p>
          <div className="max-w-3xl">
            <MultiSurvivalPlot
              names={Object.keys(lambdaByArm)}
              lambdas={Object.values(lambdaByArm)}
              maxTime={Math.max(...trialData.arms[0].time)}
              weibulls={armWeibull}
              timeScale={trialData.meta.time_scale}
            />
          </div>
        </>
      ) : null}

      <CitationFooter />
    </div>
  );
};

export default TrialDetail;
