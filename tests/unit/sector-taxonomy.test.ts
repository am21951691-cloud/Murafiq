import { describe, it, expect } from "vitest";
import {
  SECTOR_TAXONOMIES_V2026_1,
  getSectorTaxonomy,
} from "@/lib/config/taxonomies";
import type { SectorType } from "@/types/database";

describe("Sector Taxonomy Configuration (Version 2026.1)", () => {
  const allSectors: SectorType[] = [
    "EDUCATION_SCHOOLS",
    "HIGHER_EDUCATION",
    "GOVERNMENT_PUBLIC",
    "COMMERCIAL_COMPANIES",
    "HEALTHCARE_MEDICAL",
  ];

  it("defines comprehensive taxonomy for all 5 Egyptian sectors", () => {
    for (const sector of allSectors) {
      const taxonomy = SECTOR_TAXONOMIES_V2026_1[sector];
      expect(taxonomy).toBeDefined();
      expect(Array.isArray(taxonomy)).toBe(true);
      expect(taxonomy.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("enforces bilingual labels and non-empty subcategories for every category", () => {
    for (const sector of allSectors) {
      const taxonomy = SECTOR_TAXONOMIES_V2026_1[sector];
      for (const cat of taxonomy) {
        expect(cat.key).toBeTruthy();
        expect(cat.label_ar).toBeTruthy();
        expect(cat.label_en).toBeTruthy();
        expect(Array.isArray(cat.subcategories)).toBe(true);
        expect(cat.subcategories.length).toBeGreaterThanOrEqual(1);

        for (const sub of cat.subcategories) {
          expect(sub.key).toBeTruthy();
          expect(sub.label_ar).toBeTruthy();
          expect(sub.label_en).toBeTruthy();
        }
      }
    }
  });

  it("ensures unique category keys and subcategory keys within each sector", () => {
    for (const sector of allSectors) {
      const taxonomy = SECTOR_TAXONOMIES_V2026_1[sector];
      const categoryKeys = new Set<string>();
      const subcategoryKeys = new Set<string>();

      for (const cat of taxonomy) {
        expect(categoryKeys.has(cat.key)).toBe(false);
        categoryKeys.add(cat.key);

        for (const sub of cat.subcategories) {
          expect(subcategoryKeys.has(sub.key)).toBe(false);
          subcategoryKeys.add(sub.key);
        }
      }
    }
  });

  it("getSectorTaxonomy returns sector-specific categories with safe fallback", () => {
    const schoolsTaxonomy = getSectorTaxonomy("EDUCATION_SCHOOLS");
    expect(schoolsTaxonomy.some((c) => c.key === "ACADEMIC")).toBe(true);

    const higherEdTaxonomy = getSectorTaxonomy("HIGHER_EDUCATION");
    expect(higherEdTaxonomy.some((c) => c.key === "REGISTRATION_ENROLLMENT")).toBe(true);

    const govTaxonomy = getSectorTaxonomy("GOVERNMENT_PUBLIC");
    expect(govTaxonomy.some((c) => c.key === "SERVICE_DELAY")).toBe(true);

    const comTaxonomy = getSectorTaxonomy("COMMERCIAL_COMPANIES");
    expect(comTaxonomy.some((c) => c.key === "WARRANTY_REFUND")).toBe(true);

    const medTaxonomy = getSectorTaxonomy("HEALTHCARE_MEDICAL");
    expect(medTaxonomy.some((c) => c.key === "BILLING_INSURANCE")).toBe(true);

    // Fallback for unknown sector
    const fallback = getSectorTaxonomy("NON_EXISTENT" as unknown as SectorType);
    expect(fallback).toEqual(SECTOR_TAXONOMIES_V2026_1.EDUCATION_SCHOOLS);
  });
});
