import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import CitationFooter from "./CitationFooter";

const TrialDetail: React.FC = () => {
  const { trial_name } = useParams<{ trial_name: string }>();
  const [trialData, setTrialData] = useState<Trial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        const response = await fetch(`/ct1.v1/${trial_name}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Trial = await response.json();
        setTrialData(data);
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

  console.log(trialData);

  return (
    <div className="p-6 text-black text-left w-full">
      <h1 className="text-2xl font-bold mb-4">{trialData.meta.identifier}</h1>
      <div className="mb-4">
        <p>
          <span className="font-semibold">PubMed ID:</span>{" "}
          {trialData.meta.pubmed}
        </p>
        <p>
          <span className="font-semibold">Publication Date:</span>{" "}
          {trialData.meta.publication_date.split(" ")[0]}
        </p>
        <p>
          <span className="font-semibold">Disease:</span>{" "}
          {trialData.meta.disease}
        </p>
        <p>
          <span className="font-semibold">Subjects:</span>{" "}
          {trialData.meta.subjects}
        </p>
        <p>
          <span className="font-semibold">Arms:</span> {trialData.meta.arms}
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-3">Trial Arms</h2>
      {trialData.arms.length > 0 ? (
        <div className="space-y-4 w-96">
          {trialData.arms.map((arm, index) => (
            <div key={index} className="border p-4 rounded-md">
              <h3 className="text-xl font-semibold mb-2">
                Arm Name: {arm.arm_name}
              </h3>
              <p>
                <span className="font-semibold">Number of Events:</span>{" "}
                {arm.events.filter(Boolean).length}
              </p>
              <p>
                <span className="font-semibold">Number of Time Points:</span>{" "}
                {arm.time.length}
              </p>
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
