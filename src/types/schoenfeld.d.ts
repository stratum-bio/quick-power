export interface SchoenfeldParameters {
  alpha: number;
  beta: number;
  group1Proportion: number;
  group2Proportion: number;
  hazardRatio: number;
}

export interface SchoenfeldDerived {
  alphaDeviate: number;
  betaDeviate: number;
  numerator: number;
  denominator: number;
  eventCount: number;
}
