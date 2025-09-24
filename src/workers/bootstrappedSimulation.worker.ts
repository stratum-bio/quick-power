import {
  logrankPValueDistributionFromData,
  kaplanMeierPValueDistribution,
  getPercentiles,
} from "../utils/simulate";
import { type SimulationWorkerResult } from "../types/simulationWorker.d";
import { recompose_survival, applyHazardRatio } from "../utils/decomposition";
import { type KaplanMeierByArm } from "../types/trialdata.d";

self.onmessage = async (e) => {
  const simulationType = e.data.simulationType;
  const sampleSize = e.data.sampleSize;

  let pValueDist = null;
  if (simulationType == "bootstrap") {
    const {
      accrual,
      followup,
      datasetSimCount,
      controlTimes,
      controlEvents,
      treatTimes,
      treatEvents,
    } = e.data;

    pValueDist = logrankPValueDistributionFromData(
      sampleSize,
      controlTimes,
      controlEvents,
      treatTimes,
      treatEvents,
      accrual,
      followup,
      datasetSimCount,
    );
  } else if (simulationType == "kaplan-meier") {
    const {
      accrual,
      followup,
      datasetSimCount,
      trialName,
      controlArmName,
      treatArmName,
      controlHazardRatio,
      treatHazardRatio,
      allocation,
    } = e.data;

    const response = await fetch(`/ct1.v1/${trialName}-kmcurve.json`);
    if (!response.ok) {
      throw new Error(`Data not found. Return status: ${response.status}`);
    }
    const data: KaplanMeierByArm = await response.json();

    let controlCurve = data.curves[data.arm_names.indexOf(controlArmName)];
    let treatCurve = data.curves[data.arm_names.indexOf(treatArmName)];

    if (!controlCurve || !treatCurve) {
      throw new Error("Control or treatment arm not found in fetched data.");
    }

    if (allocation) {
      const originalAllocations = [
        allocation.original.reference,
        ...allocation.original.comparisons,
      ];
      const targetAllocations = [
        allocation.target.reference,
        ...allocation.target.comparisons,
      ];

      controlCurve = recompose_survival(
        controlCurve,
        originalAllocations.map((val: number) => val / 100),
        targetAllocations.map((val: number) => val / 100),
        allocation.hazardRatios,
      );

      treatCurve = recompose_survival(
        treatCurve,
        originalAllocations.map((val: number) => val / 100),
        targetAllocations.map((val: number) => val / 100),
        allocation.hazardRatios,
      );
    }

    controlCurve = applyHazardRatio(controlCurve, controlHazardRatio);
    treatCurve = applyHazardRatio(treatCurve, treatHazardRatio);

    pValueDist = kaplanMeierPValueDistribution(
      sampleSize,
      controlCurve,
      treatCurve,
      accrual,
      followup,
      datasetSimCount,
    );
  } else {
    throw new Error("Unknown simulation: " + simulationType);
  }

  const percentiles = [2.5, 97.5, 50];
  const baseInterval = getPercentiles(
    pValueDist.controlHazardDist,
    percentiles,
  );
  const treatInterval = getPercentiles(pValueDist.treatHazardDist, percentiles);
  const pvalueInterval = getPercentiles(pValueDist.pValueDist, [80, 90]);

  let rmstPValueInterval = undefined;
  if (pValueDist.rmstPValueDist) {
    rmstPValueInterval = getPercentiles(pValueDist.rmstPValueDist, [80, 90]);
  }

  const result: SimulationWorkerResult = {
    ...pValueDist,
    sampleSize,
    baseInterval,
    treatInterval,
    pvalueInterval,
    rmstPValueInterval,
  };

  self.postMessage(result);
};
