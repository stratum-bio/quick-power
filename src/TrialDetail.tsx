import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import { samplesToLambda } from "./utils/simulate";
import MultiSurvivalPlot from "./MultiSurvivalPlot";

import { DISEASE_VAL_TO_NAME } from "./constants";

function fitLambdaPerArm(data: Trial): Record<string, number> {
  const result: Record<string, number> = {};
  for (let i = 0; i < data.arms.length; i++) {
    const arm = data.arms[i];
    result[arm.arm_name] = samplesToLambda(new Float64Array(arm.time), new Uint8Array(arm.events.map(v => Number(v))));
  }
  return result;
}


const TrialDetail: React.FC = () => {
  const { trial_name } = useParams<{ trial_name: string }>();
  const [trialData, setTrialData] = useState<Trial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lambdaByArm, setLambdaByArm] = useState<Record<string, number> | null>(null);

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        const response = await fetch(`/ct1.v1/${trial_name}.json`);
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
  }, [trial_name]);

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
      <h1 className="text-2xl font-bold mb-4">{trialData.meta.identifier}</h1>
      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4">
        <div className="font-semibold">PubMed ID</div>
        <div>{trialData.meta.pubmed}</div>

        <div className="font-semibold">Publication Date</div>
        <div>{trialData.meta.publication_date.split(" ")[0]}</div>

        <div className="font-semibold">Disease</div>
        <div>{DISEASE_VAL_TO_NAME[trialData.meta.disease as keyof typeof DISEASE_VAL_TO_NAME]}</div>

        <div className="font-semibold">Subjects</div>
        <div>{trialData.meta.subjects}</div>

        <div className="font-semibold">Arms</div>
        <div>{trialData.meta.arms}</div>
      </div>

      { lambdaByArm !== null ? (
        <div className="w-96 md:w-128">
          <MultiSurvivalPlot names={Object.keys(lambdaByArm)} lambdas={Object.values(lambdaByArm) } maxTime={Math.max(...trialData.arms[0].time)} />
        </div>
      ): null } 

      <h2 className="text-2xl font-bold mb-3 mt-8">Trial Arms</h2>
      {trialData.arms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {trialData.arms.map((arm, index) => (
            <div key={index} className="border p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">
                {arm.arm_name}
              </h3>
              <div className="grid grid-cols-2 gap-x-2">
                <p className="text-right">
                  <span className="font-semibold">Events</span>
                </p>
                <p>
                  {arm.events.filter(Boolean).length}
                </p>
                <p className="text-right">
                  <span className="font-semibold">Subjects</span>
                </p>
                <p>
                  {arm.time.length}
                </p>
                { lambdaByArm !== null ? (
                  <>
                    <p className="text-right">
                      <span className="font-semibold">Median TTE</span>
                    </p>
                    <p>
                      {(Math.log(2) / lambdaByArm[arm.arm_name]).toFixed(3)}
                    </p>
                  </>
                ) : null }
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No arm data available.</p>
      )}
      <CitationFooter />
    </div>
  );
};

export default TrialDetail;
