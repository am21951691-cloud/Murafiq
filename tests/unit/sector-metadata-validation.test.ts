import { describe, it, expect } from "vitest";
import {
  SchoolsMetadataSchema,
  HigherEducationMetadataSchema,
  GovernmentPublicMetadataSchema,
  CommercialCompaniesMetadataSchema,
  HealthcareMedicalMetadataSchema,
  validateSectorMetadata,
} from "@/lib/validators/sector-metadata";

describe("Sector Metadata Validation Schemas", () => {
  describe("1. SchoolsMetadataSchema", () => {
    const valid = {
      ministry_code: "MOE-CAIRO-1092",
      educational_stage: ["PRIMARY", "PREPARATORY"],
      curriculum_type: "NATIONAL_LANGUAGES",
      gender_policy: "CO_ED",
      supervisory_administration: "إدارة مصر الجديدة التعليمية",
    };

    it("accepts valid school metadata", () => {
      const result = SchoolsMetadataSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid curriculum type or missing ministry code", () => {
      const invalid = { ...valid, curriculum_type: "INVALID_CURRICULUM" };
      const result = SchoolsMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("2. HigherEducationMetadataSchema", () => {
    const valid = {
      institution_type: "PUBLIC_UNIVERSITY",
      supreme_council_accreditation: "SCU-1908-01",
      faculties: ["Engineering", "Medicine", "Science"],
      credit_hour_system: true,
    };

    it("accepts valid university metadata", () => {
      const result = HigherEducationMetadataSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects empty faculties array", () => {
      const invalid = { ...valid, faculties: [] };
      const result = HigherEducationMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("3. GovernmentPublicMetadataSchema", () => {
    const valid = {
      parent_ministry_or_authority: "وزارة العدل - مصلحة الشهر العقاري والتوثيق",
      service_domain: "NOTARY_REAL_ESTATE_REGISTRATION",
      digital_platform_code: "JUSTICE-NOTARY-01",
    };

    it("accepts valid government service metadata", () => {
      const result = GovernmentPublicMetadataSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid service domain", () => {
      const invalid = { ...valid, service_domain: "ARBITRARY_DOMAIN" };
      const result = GovernmentPublicMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("4. CommercialCompaniesMetadataSchema", () => {
    const valid = {
      commercial_registration_number: "CR-109281-GIZA",
      tax_card_number: "TC-200-192-811",
      industry_sector: "TELECOM_AND_ISP",
      cpa_registered: true,
    };

    it("accepts valid commercial company metadata", () => {
      const result = CommercialCompaniesMetadataSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid industry sector", () => {
      const invalid = { ...valid, industry_sector: "NON_EXISTENT_INDUSTRY" };
      const result = CommercialCompaniesMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("5. HealthcareMedicalMetadataSchema", () => {
    const valid = {
      facility_tier: "PRIVATE_HOSPITAL",
      licensing_authority: "GAHAR",
      facility_license_number: "MOH-HOSP-2018-842",
      emergency_department_active: true,
    };

    it("accepts valid healthcare facility metadata", () => {
      const result = HealthcareMedicalMetadataSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects invalid licensing authority", () => {
      const invalid = { ...valid, licensing_authority: "UNAUTHORIZED_BODY" };
      const result = HealthcareMedicalMetadataSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });
  });

  describe("validateSectorMetadata Helper Function", () => {
    it("routes validation to corresponding sector schema", () => {
      const res = validateSectorMetadata("COMMERCIAL_COMPANIES", {
        commercial_registration_number: "CR-9921",
        tax_card_number: "TC-992-110",
        industry_sector: "RETAIL_AND_ECOMMERCE",
        cpa_registered: false,
      });
      expect(res.success).toBe(true);
    });

    it("throws on unknown sector", () => {
      expect(() =>
        validateSectorMetadata("UNKNOWN_SECTOR" as any, {})
      ).toThrow("Unknown sector: UNKNOWN_SECTOR");
    });
  });
});
