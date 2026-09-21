import { describe, it, expect } from "vitest";
import {
  calculateBARS,
  checkGovernorateThreshold,
  isCaseSafeForPublicDisplay,
  DEFAULT_PRIOR_MEAN,
  DEFAULT_PRIOR_WEIGHT,
} from "../../lib/services/benchmarks";

describe("Slice 7: Bayesian Adjusted Resolution Score (BARS) & Benchmark Unit Tests", () => {
  describe("Bayesian Rating Calculations", () => {
    it("returns prior mean when sample size is zero (n = 0)", () => {
      const result = calculateBARS({ ratings: [] });

      expect(result.sampleSize).toBe(0);
      expect(result.barsScore).toBe(DEFAULT_PRIOR_MEAN);
      expect(result.isEstablishing).toBe(true);
      expect(result.statusTextEn).toBe("Establishing Benchmark (0 cases)");
      expect(result.statusTextAr).toContain("0 حالات");
      expect(result.confidenceLevel).toBe("LOW");
    });

    it("pulls small sample sizes (n < 5) toward prior mean m=3.0 to prevent outlier distortion", () => {
      // 2 perfect 5.0 ratings
      const result = calculateBARS({ ratings: [5, 5] });

      expect(result.sampleSize).toBe(2);
      expect(result.observedMean).toBe(5.0);

      // Theoretical: (10 * 3.0 + 2 * 5.0) / (10 + 2) = 40 / 12 = 3.33
      expect(result.barsScore).toBe(3.33);
      expect(result.isEstablishing).toBe(true);
      expect(result.statusTextEn).toBe("Establishing Benchmark (2 cases)");
      expect(result.statusTextAr).toBe("قيد تأسيس المؤشر (2 حالات)");
      expect(result.confidenceLevel).toBe("LOW");
    });

    it("activates benchmark score when threshold (n >= 5) is met and provides sample context (Gate 4)", () => {
      // 10 ratings of 5.0
      const result = calculateBARS({ ratings: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5] });

      expect(result.sampleSize).toBe(10);
      // Theoretical: (10 * 3.0 + 10 * 5.0) / (10 + 10) = 80 / 20 = 4.00
      expect(result.barsScore).toBe(4.0);
      expect(result.isEstablishing).toBe(false);

      // Gate 4: Displays sample size context alongside score
      expect(result.statusTextEn).toContain("4.0 / 5.0");
      expect(result.statusTextEn).toContain("10 verified cases");
      expect(result.statusTextAr).toContain("10 حالة موثقة");
      expect(result.confidenceLevel).toBe("MODERATE");
    });

    it("converges toward empirical average for large sample sizes (n >= 20)", () => {
      // 90 ratings of 4.5
      const ratings = new Array(90).fill(4.5);
      const result = calculateBARS({ ratings });

      expect(result.sampleSize).toBe(90);
      // Theoretical: (10 * 3.0 + 90 * 4.5) / (10 + 90) = (30 + 405) / 100 = 4.35
      expect(result.barsScore).toBe(4.35);
      expect(result.isEstablishing).toBe(false);
      expect(result.confidenceLevel).toBe("HIGH");
    });

    it("supports custom prior parameters (m and C)", () => {
      const result = calculateBARS({
        ratings: [4, 4],
        priorMean: 3.5,
        priorWeight: 5,
        minCasesForBenchmark: 3,
      });

      // Theoretical: (5 * 3.5 + 8) / (5 + 2) = (17.5 + 8) / 7 = 25.5 / 7 = 3.64
      expect(result.barsScore).toBe(3.64);
      expect(result.priorMean).toBe(3.5);
      expect(result.priorWeight).toBe(5);
      expect(result.isEstablishing).toBe(true); // n=2 < 3
    });
  });

  describe("Governorate Threshold Gate", () => {
    it("gates directory rankings when governorate has less than 10 institutions", () => {
      const result = checkGovernorateThreshold("قنا", 4);

      expect(result.isThresholdMet).toBe(false);
      expect(result.institutionCount).toBe(4);
      expect(result.minRequired).toBe(10);
      expect(result.messageEn).toContain("threshold not yet reached (4/10");
      expect(result.messageAr).toContain("لم يكتمل النصاب الإحصائي للمحافظة بعد (4/10");
    });

    it("activates directory rankings when governorate has 10 or more institutions", () => {
      const resultAt10 = checkGovernorateThreshold("القاهرة", 10);
      expect(resultAt10.isThresholdMet).toBe(true);
      expect(resultAt10.messageEn).toContain("Governorate benchmark active");

      const resultAt25 = checkGovernorateThreshold("الجيزة", 25);
      expect(resultAt25.isThresholdMet).toBe(true);
    });
  });

  describe("Gate 1: Public Case Stream Privacy & Safety Filter", () => {
    it("allows public display ONLY for approved, clear-safety, closed public cases", () => {
      const validCase = {
        visibility: "PUBLIC",
        moderation_status: "APPROVED",
        safety_status: "CLEAR",
        lifecycle_status: "CLOSED",
      };
      expect(isCaseSafeForPublicDisplay(validCase)).toBe(true);

      const validAnonymousCase = {
        visibility: "ANONYMOUS_PUBLIC",
        moderation_status: "REDACTED_APPROVED",
        safety_status: "CLEAR",
        lifecycle_status: "CLOSED",
      };
      expect(isCaseSafeForPublicDisplay(validAnonymousCase)).toBe(true);
    });

    it("strictly blocks private cases from public display", () => {
      const privateCase = {
        visibility: "STRICTLY_PRIVATE",
        moderation_status: "APPROVED",
        safety_status: "CLEAR",
        lifecycle_status: "CLOSED",
      };
      expect(isCaseSafeForPublicDisplay(privateCase)).toBe(false);
    });

    it("strictly blocks safety-flagged or unmoderated cases from public display", () => {
      const flaggedCase = {
        visibility: "PUBLIC",
        moderation_status: "APPROVED",
        safety_status: "FLAGGED",
        lifecycle_status: "CLOSED",
      };
      expect(isCaseSafeForPublicDisplay(flaggedCase)).toBe(false);

      const pendingCase = {
        visibility: "PUBLIC",
        moderation_status: "PENDING",
        safety_status: "CLEAR",
        lifecycle_status: "CLOSED",
      };
      expect(isCaseSafeForPublicDisplay(pendingCase)).toBe(false);

      const unclosedCase = {
        visibility: "PUBLIC",
        moderation_status: "APPROVED",
        safety_status: "CLEAR",
        lifecycle_status: "IN_PROGRESS",
      };
      expect(isCaseSafeForPublicDisplay(unclosedCase)).toBe(false);
    });
  });
});
