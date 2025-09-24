import type { KaplanMeierByArm } from "../types/trialdata";
import type { AllocationChange } from "../types/prognostic-factors.d";
import { recompose_survival, applyHazardRatio } from "../utils/decomposition";

import {
  type TransformedPlotDataItem,
  addCurveToMap,
} from "../utils/rechartsHelp";

interface HazardSpec {
  armType: "control" | "treatment";
  armName: string;
  hazardRatio: number;
}

function addFactorAllocation(
  data: KaplanMeierByArm,
  timePointMap: Map<number, TransformedPlotDataItem>,
  allocationChange: AllocationChange,
  hazardRatios: HazardSpec[],
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

    addCurveToMap(timePointMap, recomposedCurve, `recomposed_${armName}`);

    for (const spec of hazardRatios) {
      if (spec.armName !== armName) {
        continue;
      }
      const adjustedCurve = applyHazardRatio(recomposedCurve, spec.hazardRatio);
      addCurveToMap(timePointMap, adjustedCurve, spec.armType);
    }
  });
}

onmessage = (event) => {
  const { data, timePointMapArray, allocationChange, hazardRatios } =
    event.data;
  const timePointMap = new Map<number, TransformedPlotDataItem>(
    timePointMapArray,
  );

  addFactorAllocation(data, timePointMap, allocationChange, hazardRatios);

  postMessage({ timePointMapArray: Array.from(timePointMap.entries()) });
};
