import { describe, it, expect } from "vitest";
import {
  sanitizeRawInput,
  encryptSensitiveData,
  decryptSensitiveData,
} from "@/lib/ai/sanitizer";

describe("Layer 1 PII Sanitizer", () => {
  it("strips Egyptian National ID numbers (14 digits) into [NATIONAL_ID_REDACTED]", () => {
    const raw = "رقم بطاقة المعلم 29501011234567 وهو مهمل في التعامل";
    const result = sanitizeRawInput(raw);
    expect(result.cleanedText).not.toContain("29501011234567");
    expect(result.cleanedText).toContain("[NATIONAL_ID_REDACTED]");
    expect(result.hasPii).toBe(true);
    expect(result.redactedItems.some((item) => item.includes("29501011234567"))).toBe(
      true
    );
  });

  it("strips Egyptian phone numbers into [PHONE_REDACTED]", () => {
    const raw = "تواصلت معه على الرقم 01012345678 ولم يرد";
    const result = sanitizeRawInput(raw);
    expect(result.cleanedText).not.toContain("01012345678");
    expect(result.cleanedText).toContain("[PHONE_REDACTED]");
    expect(result.hasPii).toBe(true);
  });

  it("strips email addresses into [EMAIL_REDACTED]", () => {
    const raw = "أرسلت شكوى إلى admin@school.edu.eg عدة مرات";
    const result = sanitizeRawInput(raw);
    expect(result.cleanedText).not.toContain("admin@school.edu.eg");
    expect(result.cleanedText).toContain("[EMAIL_REDACTED]");
    expect(result.hasPii).toBe(true);
  });

  it("leaves clean text untouched with hasPii=false", () => {
    const raw = "المدرسة ممتازة لكن هناك تأخير في تسليم الكتب الدراسية";
    const result = sanitizeRawInput(raw);
    expect(result.cleanedText).toBe(raw);
    expect(result.hasPii).toBe(false);
    expect(result.redactedItems.length).toBe(0);
  });

  it("correctly encrypts and decrypts sensitive raw text", () => {
    const raw = "بيانات حساسة سرية للغاية";
    const encrypted = encryptSensitiveData(raw);
    expect(encrypted).not.toBe(raw);
    const decrypted = decryptSensitiveData(encrypted);
    expect(decrypted).toBe(raw);
  });
});
