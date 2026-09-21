import { describe, it, expect } from "vitest";
import {
  getEntityBySlug,
  getSchoolBySlug,
  getPublicEntities,
  SAMPLE_ENTITIES,
} from "@/lib/services/entities";
import { calculateBARS, SECTOR_BARS_PRIORS } from "@/lib/services/benchmarks";

describe("Sector Aliasing, Directory Filtering & Calibrated BARS", () => {
  describe("1. Entity and School Aliasing Parity", () => {
    it("getEntityBySlug and getSchoolBySlug return identical profile data for schools", async () => {
      const slug = "st-george-language-school";
      const entityResult = await getEntityBySlug(slug);
      const schoolResult = await getSchoolBySlug(slug);

      expect(entityResult).not.toBeNull();
      expect(schoolResult).not.toBeNull();
      expect(entityResult!.id).toBe(schoolResult!.id);
      expect(entityResult!.name).toBe(schoolResult!.name);
      expect(entityResult!.sector).toBe("EDUCATION_SCHOOLS");
      expect(entityResult!.metrics.bars.barsScore).toBe(
        schoolResult!.metrics.bars.barsScore
      );
    });

    it("getEntityBySlug retrieves higher education, government, commercial, and healthcare entities", async () => {
      const university = await getEntityBySlug("cairo-university");
      expect(university).not.toBeNull();
      expect(university!.sector).toBe("HIGHER_EDUCATION");

      const government = await getEntityBySlug("egypt-post-cairo");
      expect(government).not.toBeNull();
      expect(government!.sector).toBe("GOVERNMENT_PUBLIC");

      const company = await getEntityBySlug("vodafone-egypt");
      expect(company).not.toBeNull();
      expect(company!.sector).toBe("COMMERCIAL_COMPANIES");

      const hospital = await getEntityBySlug("as-salam-international-hospital");
      expect(hospital).not.toBeNull();
      expect(hospital!.sector).toBe("HEALTHCARE_MEDICAL");
    });
  });

  describe("2. Public Entity Directory Multi-Sector Filtering", () => {
    it("filters public entities by sector cleanly", async () => {
      const all = await getPublicEntities();
      expect(all.length).toBe(SAMPLE_ENTITIES.length);

      const schoolsOnly = await getPublicEntities({ sector: "EDUCATION_SCHOOLS" });
      expect(schoolsOnly.every((e) => e.sector === "EDUCATION_SCHOOLS")).toBe(true);
      expect(schoolsOnly.length).toBeGreaterThanOrEqual(10);

      const govOnly = await getPublicEntities({ sector: "GOVERNMENT_PUBLIC" });
      expect(govOnly.every((e) => e.sector === "GOVERNMENT_PUBLIC")).toBe(true);
      expect(govOnly.length).toBe(2);

      const healthOnly = await getPublicEntities({ sector: "HEALTHCARE_MEDICAL" });
      expect(healthOnly.every((e) => e.sector === "HEALTHCARE_MEDICAL")).toBe(true);
      expect(healthOnly.length).toBe(2);
    });

    it("filters public entities by governorate and text search", async () => {
      const cairo = await getPublicEntities({ governorate: "القاهرة" });
      expect(cairo.every((e) => e.governorate === "القاهرة")).toBe(true);

      const searchResult = await getPublicEntities({ search: "vodafone" });
      expect(searchResult.length).toBe(1);
      expect(searchResult[0].slug).toBe("vodafone-egypt");
    });
  });

  describe("3. Sector-Calibrated BARS Benchmarking", () => {
    it("applies sector-specific empirical priors when calculating BARS", () => {
      // With 0 ratings, BARS score exactly matches the sector prior mean
      const schoolBars = calculateBARS({ ratings: [], sector: "EDUCATION_SCHOOLS" });
      expect(schoolBars.barsScore).toBe(SECTOR_BARS_PRIORS.EDUCATION_SCHOOLS.mean);
      expect(schoolBars.priorWeight).toBe(SECTOR_BARS_PRIORS.EDUCATION_SCHOOLS.weight);

      const govBars = calculateBARS({ ratings: [], sector: "GOVERNMENT_PUBLIC" });
      expect(govBars.barsScore).toBe(SECTOR_BARS_PRIORS.GOVERNMENT_PUBLIC.mean);
      expect(govBars.priorWeight).toBe(SECTOR_BARS_PRIORS.GOVERNMENT_PUBLIC.weight);

      const healthBars = calculateBARS({ ratings: [], sector: "HEALTHCARE_MEDICAL" });
      expect(healthBars.barsScore).toBe(SECTOR_BARS_PRIORS.HEALTHCARE_MEDICAL.mean);
      expect(healthBars.priorWeight).toBe(SECTOR_BARS_PRIORS.HEALTHCARE_MEDICAL.weight);
    });

    it("regresses observed ratings towards sector prior mean", () => {
      // 5 ratings of 5.0 in Government (C=20, m=3.0)
      // BARS = (20 * 3.0 + 5 * 5.0) / (20 + 5) = (60 + 25) / 25 = 85 / 25 = 3.40
      const govBars = calculateBARS({
        ratings: [5, 5, 5, 5, 5],
        sector: "GOVERNMENT_PUBLIC",
      });
      expect(govBars.barsScore).toBe(3.4);

      // 5 ratings of 5.0 in Healthcare (C=10, m=3.8)
      // BARS = (10 * 3.8 + 5 * 5.0) / (10 + 5) = (38 + 25) / 15 = 63 / 15 = 4.20
      const healthBars = calculateBARS({
        ratings: [5, 5, 5, 5, 5],
        sector: "HEALTHCARE_MEDICAL",
      });
      expect(healthBars.barsScore).toBe(4.2);
    });
  });
});
