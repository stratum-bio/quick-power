import { type PValueDist } from "./simulation.d";

export type TTEDistributionWorkerResult = PValueDist & {
  sampleSize: number;
  baseInterval: number[];
  treatInterval: number[];
  pvalueInterval: number[];
};
