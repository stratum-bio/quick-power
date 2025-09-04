export function baselineToTreatmentSurvival(baseSurv: number, hazardRatio: number): number {
  const cumulativeBaseHazard = - Math.log(baseSurv);
  const cumulativeTreatmentHazard = cumulativeBaseHazard * hazardRatio;
  return Math.E ** (- cumulativeTreatmentHazard);
}
