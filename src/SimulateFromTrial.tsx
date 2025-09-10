import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import { samplesToLambda } from "./utils/simulate";
import KaplanMeierPlot from "./KaplanMeierPlot";

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

const SimulateFromTrial: React.FC = () => {
  const { trialName } = useParams<{ trialName: string }>();
  const [trialData, setTrialData] = useState<Trial | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lambdaByArm, setLambdaByArm] = useState<Record<string, number> | null>(
    null,
  );

  // New state variables for the simulation form
  const [controlArm, setControlArm] = useState<string>('');
  const [treatmentArm, setTreatmentArm] = useState<string>('');
  const [accrualPeriod, setAccrualPeriod] = useState<number>(0);
  const [followUpPeriod, setFollowUpPeriod] = useState<number>(0);

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

  if (!trialData || trialName === undefined) {
    return <div className="text-black">No trial data found.</div>;
  }

  return (
    <div className="p-6 text-black text-left w-full">
      <h1 className="text-2xl font-bold mb-4">Simulate from trial {trialData.meta.identifier}</h1>
      <KaplanMeierPlot trialName={trialName} />

      <div className="mt-8 p-4 border rounded-lg shadow-md bg-white">
        <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="controlArm" className="block text-sm font-medium text-gray-700">Control Arm</label>
            <select
              id="controlArm"
              name="controlArm"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={controlArm}
              onChange={(e) => setControlArm(e.target.value)}
            >
              <option value="">Select Control Arm</option>
              {trialData.arms.map((arm) => (
                <option key={arm.arm_name} value={arm.arm_name}>
                  {arm.arm_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="treatmentArm" className="block text-sm font-medium text-gray-700">Treatment Arm</label>
            <select
              id="treatmentArm"
              name="treatmentArm"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={treatmentArm}
              onChange={(e) => setTreatmentArm(e.target.value)}
            >
              <option value="">Select Treatment Arm</option>
              {trialData.arms.map((arm) => (
                <option key={arm.arm_name} value={arm.arm_name}>
                  {arm.arm_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="accrualPeriod" className="block text-sm font-medium text-gray-700">Accrual Period (months)</label>
            <input
              type="number"
              id="accrualPeriod"
              name="accrualPeriod"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={accrualPeriod}
              onChange={(e) => setAccrualPeriod(parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <label htmlFor="followUpPeriod" className="block text-sm font-medium text-gray-700">Follow-up Period (months)</label>
            <input
              type="number"
              id="followUpPeriod"
              name="followUpPeriod"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              value={followUpPeriod}
              onChange={(e) => setFollowUpPeriod(parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
        </form>
      </div>

      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4">
        <CitationFooter />
      </div>
    </div>
  );
};

export default SimulateFromTrial;
