import type { KaplanMeierByArm } from "../types/trialdata";
import type { AllocationChange } from "../types/prognostic-factors.d";
import { recompose_survival } from "../utils/decomposition";
interface TransformedPlotDataItem {
  time: number;
  [key: string]: number | [number, number] | number; // time, armName_probability, armName_interval
}

function addFactorAllocation(
  data: KaplanMeierByArm,
  timePointMap: Map<number, TransformedPlotDataItem>,
  allocationChange: AllocationChange,
) {
  data.curves.forEach((curve, armIndex) => {
    const armName = data.arm_names[armIndex];
    const originalAllocations = [
      allocationChange.original.reference,
      ...allocationChange.original.comparisons,
    ];
    const targetAllocations = [
      allocationChange.target.reference,
      ...allocationChange.target.comparisons,
    ];
    const recomposedCurve = recompose_survival(
      curve,
      originalAllocations.map((val) => val / 100),
      targetAllocations.map((val) => val / 100),
      allocationChange.hazardRatios,
    );

    recomposedCurve.time.forEach((time, i) => {
      let timePoint = timePointMap.get(time);
      if (!timePoint) {
        timePoint = { time: time };
        timePointMap.set(time, timePoint);
      }
      timePoint[`recomposed_${armName}_probability`] =
        recomposedCurve.probability[i];
    });
  });
}

onmessage = (event) => {
  const { data, timePointMapArray, allocationChange } = event.data;
  const timePointMap = new Map<number, TransformedPlotDataItem>(
    timePointMapArray,
  );

  addFactorAllocation(data, timePointMap, allocationChange);

  postMessage({ timePointMapArray: Array.from(timePointMap.entries()) });
};
