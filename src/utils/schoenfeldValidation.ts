import type { SchoenfeldParameters } from '../types/schoenfeld';

export function validateSchoenfeldParameters(parameters: SchoenfeldParameters): { isValid: boolean; message: string } {
  if (parameters.alpha <= 0.0 || parameters.alpha >= 0.5) {
    return { isValid: false, message: "Alpha must be between (0.0, 0.5)" };
  }
  if (parameters.beta <= 0.5 || parameters.beta >= 1.0) {
    return { isValid: false, message: "Beta must be between (0.5, 1.0)" };
  }
  if (parameters.group1Proportion < 0.1 || parameters.group1Proportion > 0.9) {
    return { isValid: false, message: "Proportion must be between 0.1 and 0.9" };
  }
  if (parameters.hazardRatio < 0.01 || parameters.hazardRatio > 5.0) {
    return { isValid: false, message: "Relative Hazard Ratio must be between 0.01 and 5" };
  }
  return { isValid: true, message: "" };
}
