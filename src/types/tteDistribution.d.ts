import { type PValueDist } from "./simulation.d";

export type TTEDistributionWorkerResult = PValueDist & {
  sampleSize: number;
  baseInterval: [number, number];
  treatInterval: [number, number];
  pvalueInterval: [number, number];
};
