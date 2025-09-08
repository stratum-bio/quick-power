import { type PValueDist } from "./simulation";

export type TTEDistributionWorkerResult = PValueDist & {
  sampleSize: number;
};
