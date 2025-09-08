import { type PValueDist } from "./simulation.d";

export type TTEDistributionWorkerResult = PValueDist & {
  sampleSize: number;
};
