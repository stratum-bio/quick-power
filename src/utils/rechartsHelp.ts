import type { KaplanMeier } from "../types/trialdata.d";

export interface TransformedPlotDataItem {
  time: number;
  [key: string]: number | [number, number] | number; // time, armName_probability, armName_interval
}

export function addCurveToMap(
  timePointMap: Map<number, TransformedPlotDataItem>,
  km: KaplanMeier,
  prefix: string,
) {
  km.time.forEach((time, i) => {
    let timePoint = timePointMap.get(time);
    if (!timePoint) {
      timePoint = { time: time };
      timePointMap.set(time, timePoint);
    }
    timePoint[`${prefix}_probability`] = km.probability[i];

    if (km.interval) {
      timePoint[`${prefix}_interval`] = km.interval[i];
    }
  });
}
