export interface SchoenfeldParameters {
  // needed for estimating event count
  alpha: number;
  beta: number;
  group1Proportion: number;
  group2Proportion: number;
  hazardRatio: number;

  // Needed for estimating sample size
  accrual: number;
  followupTime: number;
  simpsonStartSurv: number;
  simpsonMidSurv: number;
  simpsonEndSurv: number;
}

export interface SchoenfeldDerived {
  // Values for estimating the event count
  alphaDeviate: number;
  betaDeviate: number;
  numerator: number;
  denominator: number;
  eventCount: number;

  // Values for estimating the sample size
  baseEventProportion: number;
  treatmentEventProportion: number;
  overallEventProportion: number;
  sampleSize: number;
}
