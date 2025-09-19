import { describe, it, expect } from "vitest";
import { fit_reference_survival, recompose_survival } from "./decomposition";
import type { KaplanMeier } from "../types/trialdata.d";

describe("decomposition", () => {
  const mockKaplanMeier: KaplanMeier = {
    time: [0, 1, 2, 3, 4, 5],
    probability: [1.0, 0.8, 0.6, 0.4, 0.2, 0.1],
  };

  describe("fit_reference_survival", () => {
    it("should return a KaplanMeier object", () => {
      const proportions = [0.5, 0.5];
      const hazard_ratios = [1, 0.5];
      const result = fit_reference_survival(
        mockKaplanMeier,
        proportions,
        hazard_ratios,
      );
      expect(result).toHaveProperty("time");
      expect(result).toHaveProperty("probability");
      expect(result.time).toEqual(mockKaplanMeier.time);
      expect(result.probability.length).toEqual(
        mockKaplanMeier.probability.length,
      );
    });

    it("should converge for a simple case", () => {
      const proportions = [0.5, 0.5];
      const hazard_ratios = [1, 0.5];
      const result = fit_reference_survival(
        mockKaplanMeier,
        proportions,
        hazard_ratios,
      );
      // Expect the probabilities to be close to the original if hazard ratios are 1 and proportions sum to 1
      // This is a simplified expectation, actual convergence depends on the algorithm
      expect(result.probability[0]).toBeCloseTo(1.0);
      expect(result.probability[result.probability.length - 1]).toBeGreaterThan(
        0,
      );
    });

    it("should throw an error if proportions length is not equal to hazard_ratios length", () => {
      const proportions = [0.5, 0.2, 0.3]; // More than one group, but length mismatch
      const hazard_ratios = [1, 0.5];
      expect(() =>
        fit_reference_survival(mockKaplanMeier, proportions, hazard_ratios),
      ).toThrow("Proportions and hazard ratios must match");
    });

    it("should throw an error if proportions do not sum to 1", () => {
      const proportions = [0.5, 0.6]; // Sums to 1.1
      const hazard_ratios = [1, 0.5];
      expect(() =>
        fit_reference_survival(mockKaplanMeier, proportions, hazard_ratios),
      ).toThrow("Proportions must sum to 1");
    });

    it("should throw an error if the first hazard ratio is not 1", () => {
      const proportions = [0.5, 0.5];
      const hazard_ratios = [0.5, 1];
      expect(() =>
        fit_reference_survival(mockKaplanMeier, proportions, hazard_ratios),
      ).toThrow(
        "First hazard ratio must be 1 to represent the reference survival curve",
      );
    });
  });

  describe("recompose_survival", () => {
    it("should return a KaplanMeier object", () => {
      const proportions_original = [0.5, 0.5];
      const proportions_target = [0.6, 0.4];
      const hazard_ratios = [1, 0.5];
      const result = recompose_survival(
        mockKaplanMeier,
        proportions_original,
        proportions_target,
        hazard_ratios,
      );
      expect(result).toHaveProperty("time");
      expect(result).toHaveProperty("probability");
      expect(result.time).toEqual(mockKaplanMeier.time);
      expect(result.probability.length).toEqual(
        mockKaplanMeier.probability.length,
      );
    });

    it("should recompose survival correctly for a simple case", () => {
      const proportions_original = [0.5, 0.5];
      const proportions_target = [0.6, 0.4];
      const hazard_ratios = [1, 0.5];
      const result = recompose_survival(
        mockKaplanMeier,
        proportions_original,
        proportions_target,
        hazard_ratios,
      );

      // Since fit_reference_survival is iterative, we can't assert exact values easily.
      // We can check general properties like probabilities being between 0 and 1, and decreasing.
      expect(result.probability[0]).toBeCloseTo(1.0);
      for (let i = 0; i < result.probability.length - 1; i++) {
        expect(result.probability[i]).toBeGreaterThanOrEqual(
          result.probability[i + 1],
        );
        expect(result.probability[i]).toBeLessThanOrEqual(1.0);
        expect(result.probability[i]).toBeGreaterThanOrEqual(0.0);
      }
      expect(
        result.probability[result.probability.length - 1],
      ).toBeGreaterThanOrEqual(0);
    });
  });
});
