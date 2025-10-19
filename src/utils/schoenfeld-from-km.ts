import { calculateDerivedParameters } from "./schoenfeld";
import { type SchoenfeldParameters } from "../types/schoenfeld.d";
import { type KaplanMeier, type KaplanMeierByArm } from "../types/trialdata.d";

function survivalAtPoint(km: KaplanMeier, time: number): number {
  let i = 0;
  while (i < km.time.length && km.time[i] < time) {
    i++;
  }
  if (i == km.time.length) {
    return 0.0;
  } else if (i == 0) {
    return 1.0;
  } else {
    return km.probability[i];
  }
}

export async function schoenfeldFromKM(
  trialName: string,
  controlArm: string,
  hazardRatio: number,
  accrual: number,
  followup: number,
  alpha: number,
  beta: number,
): Promise<number> {
  const response = await fetch(`/ct1.v1/${trialName}-kmcurve.json`);
  const data: KaplanMeierByArm = await response.json();
  const kmControl = data.curves[data.arm_names.indexOf(controlArm)];

  const params: SchoenfeldParameters = {
    alpha: alpha,
    beta: beta,
    group1Proportion: 0.5,
    group2Proportion: 0.5,
    hazardRatio: hazardRatio,
    accrual: accrual,
    followupTime: followup,
    simpsonStartSurv: survivalAtPoint(kmControl, followup),
    simpsonMidSurv: survivalAtPoint(kmControl, followup + 0.5 * accrual),
    simpsonEndSurv: survivalAtPoint(kmControl, followup + accrual),
  };

  const derived = calculateDerivedParameters(params);
  return derived.sampleSize;
}
