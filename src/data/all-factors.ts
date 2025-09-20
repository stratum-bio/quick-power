import type { PrognosticFactorTable } from "../types/prognostic-factors.d";
import { DiseaseType } from "../types/prognostic-factors.d";

import { BreastFactors } from "./breast-factors";
import { ColorectalFactors } from "./colorectal-factors";
import { ProstateFactors } from "./prostate-factors";
import { LungFactors } from "./lung-factors";

export const AllFactors: PrognosticFactorTable = {
  [DiseaseType.BREAST_CANCER]: BreastFactors,
  [DiseaseType.COLORECTAL_CANCER]: ColorectalFactors,
  [DiseaseType.LUNG_CANCER]: LungFactors,
  [DiseaseType.PROSTATE_CANCER]: ProstateFactors,
};
