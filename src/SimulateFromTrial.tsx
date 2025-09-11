import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import CitationFooter from "./CitationFooter";
import { samplesToLambda } from "./utils/simulate";
import KaplanMeierPlot from "./KaplanMeierPlot";
import TTEDistributionPlot from "./TTEDistributionPlot";
import { InlineMath } from "react-katex";

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
  const [controlArm, setControlArm] = useState<string>("");
  const [treatmentArm, setTreatmentArm] = useState<string>("");
  const [accrualPeriod, setAccrualPeriod] = useState<number>(24);
  const [followUpPeriod, setFollowUpPeriod] = useState<number>(12);
  const [largestSampleSize, setLargestSampleSize] = useState<number>(500);
  const [beta, setBeta] = useState<number>(0.8);
  const [showTTEDistributionPlot, setShowTTEDistributionPlot] =
    useState<boolean>(false);
  const [forceSimulation, setForceSimulation] = useState<boolean>(false);

  useEffect(() => {
    if (forceSimulation) {
      setForceSimulation(false);
    }
  }, [forceSimulation]);

  useEffect(() => {
    const fetchTrial = async () => {
      try {
        const response = await fetch(`/ct1.v1/${trialName}.json`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Trial = await response.json();
        setTrialData(data);

        const arms = data.arms.map((a) => a.arm_name);
        let controlIdx = arms.findIndex(
          (str) => str.includes("placebo") || str.includes("control"),
        );
        if (controlIdx == -1) {
          controlIdx = 0;
        }
        const treatIdx = (controlIdx + 1) % arms.length;

        setControlArm(arms[controlIdx]);
        setTreatmentArm(arms[treatIdx]);

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
      <h2 className="text-3xl font-bold mb-4">
        Simulate from trial {trialData.meta.identifier}
      </h2>
      <div className="mt-8 max-w-3xl">
        <KaplanMeierPlot trialName={trialName} />
      </div>

      <div className="mt-8 p-4 border rounded-lg shadow-md bg-white max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="controlArm"
              className="block font-medium text-gray-700"
            >
              Control Arm
            </label>
            <select
              id="controlArm"
              name="controlArm"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
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
            <label
              htmlFor="treatmentArm"
              className="block font-medium text-gray-700"
            >
              Treatment Arm
            </label>
            <select
              id="treatmentArm"
              name="treatmentArm"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
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
            <label
              htmlFor="accrualPeriod"
              className="block font-medium text-gray-700"
            >
              Enrollemnt Period
            </label>
            <input
              type="number"
              id="accrualPeriod"
              name="accrualPeriod"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={accrualPeriod}
              onChange={(e) => setAccrualPeriod(parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <label
              htmlFor="followUpPeriod"
              className="block font-medium text-gray-700"
            >
              Follow-up Period
            </label>
            <input
              type="number"
              id="followUpPeriod"
              name="followUpPeriod"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={followUpPeriod}
              onChange={(e) => setFollowUpPeriod(parseFloat(e.target.value))}
              step="0.1"
            />
          </div>
          <div>
            <label
              htmlFor="largestSampleSize"
              className="block font-medium text-gray-700"
            >
              Largest Sample Size
            </label>
            <input
              type="number"
              id="largestSampleSize"
              name="largestSampleSize"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={largestSampleSize}
              onChange={(e) => setLargestSampleSize(parseInt(e.target.value))}
              step="1"
            />
          </div>
          <div>
            <label htmlFor="beta" className="block font-medium text-gray-700">
              Beta
            </label>
            <select
              id="beta"
              name="beta"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value))}
            >
              <option value={0.8}>0.8</option>
              <option value={0.9}>0.9</option>
            </select>
          </div>
        </form>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            onClick={() => {
              setShowTTEDistributionPlot(true);
              setForceSimulation(true);
            }}
          >
            Start Simulation
          </button>
        </div>
      </div>
      {showTTEDistributionPlot && lambdaByArm !== null && (
        <div className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          <TTEDistributionPlot
            totalSampleSize={largestSampleSize}
            baselineHazard={lambdaByArm[controlArm]}
            hazardRatio={lambdaByArm[treatmentArm] / lambdaByArm[controlArm]}
            accrual={accrualPeriod}
            followup={followUpPeriod}
            alpha={0.05}
            beta={beta}
            controlProportion={0.5}
            treatProportion={0.5}
            controlLabel={`\\text{Control}`}
            treatLabel={`\\text{Treatment}`}
            forceUpdate={forceSimulation}
          />

          <br />
          <p>
            The initial simulation parameters are quick and noisy to demonstrate
            the results. For more accurate simulated results, increase the
            Permutations and Simulations. For something visually interesting,
            setting Simulations to 500 and Permutations to 500. This will run{" "}
            <InlineMath math="500 * 500 = 250000" /> randomized computations for
            each sample size evaluated. When evaluating 11 sample sizes, this
            usually takes 3-4 minutes.
          </p>
          <br />
          <p>
            For accurate results, it is recommended to set Permutations and
            Simulations to 1000 each, but this will end up taking up to a half
            hour. Mobile devices pause computations when the page is not in the
            foreground, so it is recommended to run larger simulations on
            desktop.
          </p>
        </div>
      )}

      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4">
        <CitationFooter />
      </div>
    </div>
  );
};

export default SimulateFromTrial;
