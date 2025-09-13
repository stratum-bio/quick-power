import { type PValueDist } from "./simulation.d";

export type SimulationWorkerResult = PValueDist & {
  sampleSize: number;
  baseInterval: number[];
  treatInterval: number[];
  pvalueInterval: number[];
};
