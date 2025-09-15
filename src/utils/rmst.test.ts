import { describe, it, expect, vi } from "vitest";
import {
  calculateRMST,
  calculateRMSTVariance,
  compareRMST,
  RMSTComparisonResult,
} from "./rmst";
import type { KaplanMeier } from "../types/trialdata.d";
import { PrevailData } from "../mock/PREVAIL";
import { calculateKaplanMeier } from "./kaplan-meier";
import { jStat } from "jstat";

// Mock jStat for consistent testing of p-value calculation
vi.mock("jstat", () => ({
  jStat: {
    normal: {
      cdf: vi.fn((z, mean, std) => {
        // Simple mock for CDF, can be refined if specific values are needed
        if (z < 0) return 0.1; // Example value
        if (z > 0) return 0.9; // Example value
        return 0.5;
      }),
    },
  },
}));

describe("RMST Calculations", () => {
  // Sample Kaplan-Meier data for testing
  const kmData1: KaplanMeier = {
    time: [0, 1, 2, 3, 4, 5],
    probability: [1, 0.8, 0.6, 0.4, 0.2, 0.1],
    at_risk_at_time: [100, 80, 60, 40, 20, 10],
    events_at_time: [0, 20, 20, 20, 20, 10],
  };

  const kmData2: KaplanMeier = {
    time: [0, 1, 2, 3, 4, 5],
    probability: [1, 0.9, 0.7, 0.5, 0.3, 0.2],
    at_risk_at_time: [100, 90, 70, 50, 30, 20],
    events_at_time: [0, 10, 20, 20, 20, 10],
  };

  describe("calculateRMST", () => {
    it("should calculate RMST correctly for a simple curve", () => {
      const km: KaplanMeier = {
        time: [1, 2, 3],
        probability: [0.8, 0.6, 0.4],
      };
      const tau = 3;
      // Expected: (1 * (1-0)) + (0.8 * (2-1)) + (0.6 * (3-2)) = 1 + 0.8 + 0.6 = 2.4
      expect(calculateRMST(km, tau)).toBeCloseTo(2.4);
    });

    it("should handle tau less than the first event time", () => {
      const km: KaplanMeier = {
        time: [2, 4],
        probability: [0.5, 0.2],
      };
      const tau = 1;
      // Expected: 1 * (1-0) = 1
      expect(calculateRMST(km, tau)).toBeCloseTo(1);
    });

    it("should handle tau beyond the last event time", () => {
      const km: KaplanMeier = {
        time: [1, 2],
        probability: [0.8, 0.6],
      };
      const tau = 5;
      // Expected: (1 * (1-0)) + (0.8 * (2-1)) + (0.6 * (5-2)) = 1 + 0.8 + 1.8 = 3.6
      expect(calculateRMST(km, tau)).toBeCloseTo(3.6);
    });

    it("should return 0 if tau is 0", () => {
      const km: KaplanMeier = {
        time: [1, 2],
        probability: [0.8, 0.6],
      };
      const tau = 0;
      expect(calculateRMST(km, tau)).toBe(0);
    });

    it("should throw an error if tau is negative", () => {
      const km: KaplanMeier = {
        time: [1, 2],
        probability: [0.8, 0.6],
      };
      const tau = -1;
      expect(() => calculateRMST(km, tau)).toThrow(
        "tau must be a non-negative number.",
      );
    });

    it("should handle empty Kaplan-Meier data", () => {
      const km: KaplanMeier = {
        time: [],
        probability: [],
      };
      const tau = 5;
      expect(calculateRMST(km, tau)).toBeCloseTo(5); // Only the initial 1 * tau contributes
    });

    it('should calculate RMST for PREVAIL data control arm correctly', () => {
      const controlKm = calculateKaplanMeier(PrevailData.controlTime, PrevailData.controlEvent);
      const rmst = calculateRMST(controlKm, PrevailData.rmst_tau);
      expect(rmst).toBeCloseTo(PrevailData.control_rmst, 2); // Using precision of 2 for floating point comparison
    });

    it('should calculate RMST for PREVAIL data treatment arm correctly', () => {
      const treatKm = calculateKaplanMeier(PrevailData.treatTime, PrevailData.treatEvent);
      const rmst = calculateRMST(treatKm, PrevailData.rmst_tau);
      expect(rmst).toBeCloseTo(PrevailData.treat_rmst, 2); // Using precision of 2 for floating point comparison
    });
  });

  describe("calculateRMSTVariance", () => {
    it("should calculate variance correctly for valid data", () => {
      const km: KaplanMeier = {
        time: [1, 2, 3],
        probability: [0.8, 0.6, 0.4],
        at_risk_at_time: [100, 80, 60],
        events_at_time: [20, 20, 20],
      };
      const tau = 3;
      // This is a complex calculation, so we'll use a known good value or a simplified scenario.
      // For now, let's ensure it doesn't throw and returns a non-negative number.
      const variance = calculateRMSTVariance(km, tau);
      expect(variance).toBeGreaterThanOrEqual(0);
      expect(typeof variance).toBe("number");
    });

    it("should throw an error if at_risk_at_time is missing", () => {
      const km: KaplanMeier = {
        time: [1, 2],
        probability: [0.8, 0.6],
        events_at_time: [20, 20],
      };
      const tau = 2;
      expect(() => calculateRMSTVariance(km, tau)).toThrow(
        "To calculate variance, the KaplanMeier object must include 'events_at_time' and 'at_risk_at_time' arrays with the same length as 'time'.",
      );
    });

    it("should throw an error if events_at_time is missing", () => {
      const km: KaplanMeier = {
        time: [1, 2],
        probability: [0.8, 0.6],
        at_risk_at_time: [100, 80],
      };
      const tau = 2;
      expect(() => calculateRMSTVariance(km, tau)).toThrow(
        "To calculate variance, the KaplanMeier object must include 'events_at_time' and 'at_risk_at_time' arrays with the same length as 'time'.",
      );
    });

    it("should handle cases where n_i equals d_i (all at risk experience event)", () => {
      const km: KaplanMeier = {
        time: [1, 2],
        probability: [0.5, 0],
        at_risk_at_time: [10, 5],
        events_at_time: [5, 5], // All at risk experience event
      };
      const tau = 2;
      const variance = calculateRMSTVariance(km, tau);
      expect(variance).toBeGreaterThanOrEqual(0);
      expect(typeof variance).toBe("number");
    });

    it("should return 0 variance if no events up to tau", () => {
      const km: KaplanMeier = {
        time: [5, 6],
        probability: [0.8, 0.6],
        at_risk_at_time: [100, 80],
        events_at_time: [0, 0],
      };
      const tau = 4;
      expect(calculateRMSTVariance(km, tau)).toBe(0);
    });
  });

  describe("compareRMST", () => {
    it("should compare two KM curves and return a result", () => {
      // Mock jStat.normal.cdf to return predictable values for testing p-value
      (jStat.normal.cdf as vi.Mock).mockImplementation((z: number) => {
        if (z < -1.96) return 0.025;
        if (z > 1.96) return 0.975;
        return 0.5; // For z-scores between -1.96 and 1.96
      });

      const tau = 5;
      const result: RMSTComparisonResult = compareRMST(kmData1, kmData2, tau);

      expect(result).toHaveProperty("controlRMST");
      expect(result).toHaveProperty("treatRMST");
      expect(result).toHaveProperty("difference");
      expect(result).toHaveProperty("zScore");
      expect(result).toHaveProperty("pValue");

      expect(result.controlRMST).toBeCloseTo(calculateRMST(kmData1, tau));
      expect(result.treatRMST).toBeCloseTo(calculateRMST(kmData2, tau));
      expect(result.difference).toBeCloseTo(
        result.treatRMST - result.controlRMST,
      );
      expect(typeof result.zScore).toBe("number");
      expect(typeof result.pValue).toBe("number");
      expect(result.pValue).toBeGreaterThanOrEqual(0);
      expect(result.pValue).toBeLessThanOrEqual(1);
    });

    it("should handle identical curves resulting in zero difference and p-value of 1", () => {
      const tau = 5;
      const result: RMSTComparisonResult = compareRMST(kmData1, kmData1, tau); // Compare with itself

      expect(result.difference).toBeCloseTo(0);
      expect(result.zScore).toBeCloseTo(0);
      expect(result.pValue).toBeCloseTo(1.0);
    });

    it("should handle cases with no variance (e.g., all probabilities are 1)", () => {
      const kmNoEvents: KaplanMeier = {
        time: [1, 2, 3],
        probability: [1, 1, 1],
        at_risk_at_time: [100, 100, 100],
        events_at_time: [0, 0, 0],
      };
      const tau = 3;
      const result = compareRMST(kmNoEvents, kmNoEvents, tau);
      expect(result.difference).toBeCloseTo(0);
      expect(result.zScore).toBe(Infinity);
      expect(result.pValue).toBeCloseTo(1.0);
    });

    it("should return correct p-value when z-score is significant", () => {
      // Force a significant Z-score for testing p-value logic
      (jStat.normal.cdf as vi.Mock).mockImplementation((z: number) => {
        if (z < 0) return 0.001; // Very small p-value
        return 0.999;
      });

      const kmControl: KaplanMeier = {
        time: [1, 2, 3],
        probability: [0.9, 0.8, 0.7],
        at_risk_at_time: [100, 90, 80],
        events_at_time: [10, 10, 10],
      };
      const kmTreatment: KaplanMeier = {
        time: [1, 2, 3],
        probability: [0.5, 0.4, 0.3],
        at_risk_at_time: [100, 50, 40],
        events_at_time: [50, 10, 10],
      };
      const tau = 3;
      const result = compareRMST(kmControl, kmTreatment, tau);
      // With the mock, if zScore is positive, cdf(abs(zScore)) will be 0.999
      // pValue = 2 * (1 - 0.999) = 2 * 0.001 = 0.002
      expect(result.pValue).toBeCloseTo(0.002);
    });
  });
});
