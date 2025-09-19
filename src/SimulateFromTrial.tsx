import React, { useEffect, useMemo, useState } from "react";
import Loading from "./Loading";
import { useParams } from "react-router-dom";
import type { Trial } from "./types/trialdata";
import { type AllocationChange } from "./types/prognostic-factors.d";
import CitationFooter from "./CitationFooter";
import { samplesToLambda } from "./utils/simulate";
import KaplanMeierPlot from "./KaplanMeierPlot";
import BootstrapSimulationPlot from "./BootstrapSimulationPlot";
import AppError from "./AppError"; // Import the AppError component
import PrognosticFactorAllocation from "./PrognosticFactorAllocation";

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
  const [simulationPlotParameters, setSimulationPlotParameters] = useState<{
    controlArm: string;
    treatmentArm: string;
    accrualPeriod: number;
    followUpPeriod: number;
    largestSampleSize: number;
  } | null>(null);
  const [forceSimulation, setForceSimulation] = useState<boolean>(false);
  const [showPrognosticFactors, setShowPrognosticFactors] =
    useState<boolean>(false);
  const [prognosticFactorAllocation, setPrognosticFactorAllocation] = useState<
    AllocationChange | undefined
  >(undefined);

  const handlePrognosticFactorUpdate = (allocationChange: AllocationChange) => {
    setPrognosticFactorAllocation(allocationChange);
    console.log("Prognostic Factor Allocation Updated:", allocationChange);
  };

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
          throw new Error(
            `Data not found  Response status: ${response.status}`,
          );
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

        const maxTime = Math.max(...data.arms[0].time);
        let defaultAccrual = 24;
        let defaultFollowup = 12;
        if (maxTime < defaultAccrual + defaultFollowup) {
          defaultAccrual = Math.round((maxTime * 2) / 3);
          defaultFollowup = Math.round(maxTime / 3);
          if (defaultAccrual === 0) {
            defaultAccrual = 1;
          }
          if (defaultFollowup === 0) {
            defaultFollowup = 1;
          }
        }

        setAccrualPeriod(defaultAccrual);
        setFollowUpPeriod(defaultFollowup);
        setControlArm(arms[controlIdx]);
        setTreatmentArm(arms[treatIdx]);

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

  const memoizedKaplanMeierPlot = useMemo(() => {
    return trialName ? (
      <KaplanMeierPlot
        trialName={trialName}
        prognosticFactorAllocation={prognosticFactorAllocation}
      />
    ) : (
      <></>
    );
  }, [trialName, prognosticFactorAllocation]);

  const memoizedBootstrapSimulationPlot = useMemo(() => {
    if (!simulationPlotParameters || !lambdaByArm || !trialData) {
      return null;
    }
    return (
      <BootstrapSimulationPlot
        trial={trialData}
        controlArmName={simulationPlotParameters.controlArm}
        treatArmName={simulationPlotParameters.treatmentArm}
        totalSampleSize={simulationPlotParameters.largestSampleSize}
        accrual={simulationPlotParameters.accrualPeriod}
        followup={simulationPlotParameters.followUpPeriod}
        forceUpdate={forceSimulation}
      />
    );
  }, [simulationPlotParameters, lambdaByArm, trialData, forceSimulation]);

  if (loading) {
    return <Loading message="Loading trial details..." />;
  }

  if (error) {
    return <AppError errorMessage={error} />;
  }

  if (!trialData || trialName === undefined) {
    return <div className="text-black">No trial data found.</div>;
  }

  return (
    <div className="p-6 text-black text-left w-full">
      <h2 className="text-3xl font-bold mb-4">
        Simulate from trial {trialData.meta.identifier}
      </h2>
      {trialData.meta.title && (
        <div className="max-w-3xl">{trialData.meta.title}</div>
      )}
      <div className="mt-8 max-w-3xl">{memoizedKaplanMeierPlot}</div>

      <div className="mt-8 p-4 ring ring-gemini-blue shadow-xl shadow-gemini-blue/30 rounded-md shadow-md bg-white max-w-3xl">
        <h2
          className="text-xl font-semibold cursor-pointer flex justify-between items-center"
          onClick={() => setShowPrognosticFactors(!showPrognosticFactors)}
        >
          <span>Prognostic Factors</span>
          <span>{showPrognosticFactors ? "▲" : "▼"}</span>
        </h2>
        {showPrognosticFactors && (
          <PrognosticFactorAllocation onUpdate={handlePrognosticFactorUpdate} />
        )}
      </div>

      <div className="mt-8 p-4 ring ring-gemini-blue shadow-xl shadow-gemini-blue/30 rounded-md shadow-md bg-white max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Simulation Parameters</h2>
        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="controlArm"
              className="block font-semibold text-gray-700"
            >
              Control Arm
            </label>
            <select
              id="controlArm"
              name="controlArm"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gemini-blue focus:border-gemini-blue rounded-md"
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
              className="block font-semibold text-gray-700"
            >
              Treatment Arm
            </label>
            <select
              id="treatmentArm"
              name="treatmentArm"
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gemini-blue focus:border-gemini-blue rounded-md"
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
              className="block font-semibold text-gray-700"
            >
              Enrollment Period
            </label>
            <input
              type="number"
              id="accrualPeriod"
              name="accrualPeriod"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gemini-blue focus:border-gemini-blue rounded-md"
              value={accrualPeriod}
              onChange={(e) => setAccrualPeriod(parseFloat(e.target.value))}
              step="1"
            />
          </div>
          <div>
            <label
              htmlFor="followUpPeriod"
              className="block font-semibold text-gray-700"
            >
              Follow-up Period
            </label>
            <input
              type="number"
              id="followUpPeriod"
              name="followUpPeriod"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gemini-blue focus:border-gemini-blue rounded-md"
              value={followUpPeriod}
              onChange={(e) => setFollowUpPeriod(parseFloat(e.target.value))}
              step="1"
            />
          </div>
          <div>
            <label
              htmlFor="largestSampleSize"
              className="block font-semibold text-gray-700"
            >
              Largest Sample Size
            </label>
            <input
              type="number"
              id="largestSampleSize"
              name="largestSampleSize"
              className="mt-1 block w-full pl-3 pr-3 py-2 text-base border border-gray-300 focus:outline-none focus:ring-gemini-blue focus:border-gemini-blue rounded-md"
              value={largestSampleSize}
              onChange={(e) => setLargestSampleSize(parseInt(e.target.value))}
              step="50"
            />
          </div>
        </form>
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm font-semibold rounded-md text-white bg-gemini-blue hover:bg-gemini-blue-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gemini-blue"
            onClick={() => {
              setSimulationPlotParameters({
                controlArm,
                treatmentArm,
                accrualPeriod,
                followUpPeriod,
                largestSampleSize,
              });
              setForceSimulation(true);
            }}
          >
            Start Simulation
          </button>
        </div>
      </div>
      {memoizedBootstrapSimulationPlot && (
        <div className="mt-8 max-w-3xl">
          <h2 className="text-xl font-semibold mb-4">Results</h2>
          {memoizedBootstrapSimulationPlot}
          <br />
        </div>
      )}

      <div className="mb-4 grid grid-cols-[auto_1fr] gap-x-4">
        <CitationFooter />
      </div>
    </div>
  );
};

export default SimulateFromTrial;
