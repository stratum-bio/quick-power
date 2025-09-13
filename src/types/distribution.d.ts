import { type PValueDist } from "./simulation.d";

export type DistributionWorkerResult = PValueDist & {
  sampleSize: number;
  baseInterval: number[];
  treatInterval: number[];
  pvalueInterval: number[];
};
