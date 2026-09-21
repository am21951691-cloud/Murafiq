import { describe, it, expect } from "vitest";
import {
  SensitiveIdentifierSchema,
  maskSensitiveIdentifier,
  getSectorDefaultIdentifierType,
} from "@/lib/validators/sensitive-identifiers";
import { processCaseIntake } from "@/lib/services/cases";
import { decryptSensitiveData } from "@/lib/ai/sanitizer";

describe("Sensitive Identifier Isolation & Law 151/2020 Compliance", () => {
  describe("1. SensitiveIdentifierSchema Validation", () => {
    it("accepts valid sector identifiers (MRN, Student Code, Service Request)", () => {
      const validCases = [
        { type: "STUDENT_CODE", value: "STU-2026-90412" },
        { type: "ACADEMIC_STUDENT_ID", value: "ENG-2023-441" },
        { type: "GOVERNMENT_SERVICE_REQUEST_NO", value: "REQ-CAIRO-99214" },
        { type: "ORDER_OR_ACCOUNT_NUMBER", value: "ORD-991823-EG" },
        { type: "MEDICAL_RECORD_NUMBER", value: "MRN-55419-MED" },
      ];

      for (const item of validCases) {
        const parsed = SensitiveIdentifierSchema.safeParse(item);
        expect(parsed.success).toBe(true);
      }
    });

    it("STRICTLY REJECTS full 14-digit Egyptian National IDs (Risk R1)", () => {
      const nationalIds = [
        { type: "GOVERNMENT_SERVICE_REQUEST_NO", value: "29501011234567" },
        { type: "MEDICAL_RECORD_NUMBER", value: "30208151234568" },
        { type: "ORDER_OR_ACCOUNT_NUMBER", value: "28812151234569" },
        { type: "STUDENT_CODE", value: "31005051234561" },
      ];

      for (const item of nationalIds) {
        const parsed = SensitiveIdentifierSchema.safeParse(item);
        expect(parsed.success).toBe(false);
        if (!parsed.success) {
          expect(parsed.error.issues[0].message).toContain("National ID");
        }
      }
    });
  });

  describe("2. maskSensitiveIdentifier Tokenizer", () => {
    it("masks identifier values for safe operational display", () => {
      expect(maskSensitiveIdentifier("MRN", "MRN-2026-948123")).toBe("MRN-***-123");
      expect(maskSensitiveIdentifier("STU", "STU-88219")).toBe("STU-***-219");
      expect(maskSensitiveIdentifier("REQ", "12345678")).toBe("12-***-678");
    });
  });

  describe("3. Sector Default Identifier Types", () => {
    it("maps sectors to their canonical identifier types", () => {
      expect(getSectorDefaultIdentifierType("EDUCATION_SCHOOLS")).toBe("STUDENT_CODE");
      expect(getSectorDefaultIdentifierType("HIGHER_EDUCATION")).toBe("ACADEMIC_STUDENT_ID");
      expect(getSectorDefaultIdentifierType("GOVERNMENT_PUBLIC")).toBe(
        "GOVERNMENT_SERVICE_REQUEST_NO"
      );
      expect(getSectorDefaultIdentifierType("COMMERCIAL_COMPANIES")).toBe(
        "ORDER_OR_ACCOUNT_NUMBER"
      );
      expect(getSectorDefaultIdentifierType("HEALTHCARE_MEDICAL")).toBe(
        "MEDICAL_RECORD_NUMBER"
      );
    });
  });

  describe("4. End-to-End PII Isolation in processCaseIntake", () => {
    it("isolates sensitive identifier into sensitiveData and only stores masked token in operational case metadata", () => {
      const input = {
        institution_id: "00000000-0000-0000-0000-000000000010",
        category: "APPOINTMENT_CARE",
        subcategory: "تأخر مناظرة الحالات والانتظار المرهق",
        raw_description:
          "وصلت إلى قسم الطوارئ في تمام الساعة الثامنة مساءً مع والدي المريض ولم يتم مناظرته لأكثر من ثلاث ساعات متواصلة.",
        initial_experience_rating: 1,
        desired_outcome: "مراجعة سرعة الفرز الطبي في الطوارئ وتفادي الانتظار المرهق.",
        visibility: "STRICTLY_PRIVATE" as const,
        parent_phone: "01099887766",
        consent_given: true as const,
        sensitive_identifier: {
          type: "MEDICAL_RECORD_NUMBER" as const,
          value: "MRN-MED-994821",
        },
      };

      const result = processCaseIntake(input, "00000000-0000-0000-0000-000000000001");

      // Operational case record has masked display_token, NOT the raw MRN
      expect(result.caseRecord.metadata.display_token).toBe("MRN-***-821");
      expect(JSON.stringify(result.caseRecord)).not.toContain("MRN-MED-994821");

      // Isolated sensitive data table has encrypted MRN
      expect(result.sensitiveData.sensitive_identifiers_encrypted).toBeDefined();
      const encryptedValue = (result.sensitiveData.sensitive_identifiers_encrypted as any)
        .value_encrypted;
      expect(encryptedValue).not.toBe("MRN-MED-994821");
      expect(decryptSensitiveData(encryptedValue)).toBe("MRN-MED-994821");
    });
  });
});
