import { describe, it, expect } from "vitest";
import { processCaseIntake, CaseIntakeSchema } from "@/lib/services/cases";
import { POST as submitRoute } from "@/app/api/cases/submit/route";
import { POST as acknowledgeRoute } from "@/app/api/institution/acknowledge/route";
import { NextRequest } from "next/server";
import { decryptSensitiveData } from "@/lib/ai/sanitizer";

describe("Slice 1: Case Intake & Private Grace Pipeline", () => {
  const sampleInput = {
    institution_id: "00000000-0000-0000-0000-000000000010",
    category: "TEACHER_COMMUNICATION" as const,
    subcategory: "التواصل الأسبوعي",
    raw_description:
      "تواصلت مع المعلم على هاتفه 01012345678 بخصوص بطاقة 29501011234567 ولكن لم يتم الرد علي لمدة أسبوعين متتاليين وتجاهل الإدارة مستمر.",
    initial_experience_rating: 2,
    desired_outcome: "التواصل مع إدارة المرحلة لحل المشكلة ودياً ووضع خطة تعويضية.",
    visibility: "STRICTLY_PRIVATE" as const,
    parent_phone: "01099887766",
    consent_given: true as const,
  };

  it("processes case intake with Layer 1 PII sanitization and 7-day grace period", () => {
    const userId = "00000000-0000-0000-0000-000000000001";
    const result = processCaseIntake(sampleInput, userId, "197.200.10.5");

    // 1. Cases operational record
    expect(result.caseRecord.reference_number).toMatch(/^MRF-\d{4}-\d{5}$/);
    expect(result.caseRecord.lifecycle_status).toBe("PRIVATE_GRACE");
    expect(result.caseRecord.visibility).toBe("STRICTLY_PRIVATE");
    expect(result.caseRecord.sanitized_description).toContain("[PHONE_REDACTED]");
    expect(result.caseRecord.sanitized_description).toContain("[NATIONAL_ID_REDACTED]");
    expect(result.caseRecord.sanitized_description).not.toContain("01012345678");
    expect(result.caseRecord.sanitized_description).not.toContain("29501011234567");

    // 7-day grace window
    const now = new Date().getTime();
    const expiry = new Date(result.caseRecord.grace_expires_at!).getTime();
    const diffDays = Math.round((expiry - now) / (1000 * 60 * 60 * 24));
    expect(diffDays).toBe(7);

    // 2. Sensitive Data Isolation
    expect(result.sensitiveData.case_id).toBe(result.caseRecord.id);
    expect(result.sensitiveData.raw_description_encrypted).toBeDefined();
    expect(result.sensitiveData.raw_description_encrypted).not.toBe(sampleInput.raw_description);
    expect(decryptSensitiveData(result.sensitiveData.raw_description_encrypted)).toBe(
      sampleInput.raw_description
    );

    // 3. Consent record
    expect(result.consentRecord.case_id).toBe(result.caseRecord.id);
    expect(result.consentRecord.consent_type).toBe("LAW_151_2020_EDUCATION_INTAKE");
    expect(result.consentRecord.ip_address_hash).toBeDefined();

    // 4. Audit Log
    expect(result.eventRecord.event_type).toBe("CASE_SUBMITTED");
    expect(result.eventRecord.case_id).toBe(result.caseRecord.id);
  });

  it("POST /api/cases/submit returns 201 without leaking raw sensitive encrypted data", async () => {
    const request = new NextRequest("http://localhost:3000/api/cases/submit", {
      method: "POST",
      body: JSON.stringify(sampleInput),
      headers: { "Content-Type": "application/json" },
    });

    const response = await submitRoute(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.case.id).toBeDefined();
    expect(body.case.reference_number).toMatch(/^MRF-\d{4}-\d{5}$/);
    expect(body.case.sanitized_description).toContain("[PHONE_REDACTED]");

    // Gate 1: Security Audit Rule
    expect(body.case.raw_description_encrypted).toBeUndefined();
    expect(body.case.parent_contact_phone_encrypted).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain("29501011234567");
  });

  it("POST /api/cases/submit rejects descriptions under 50 characters", async () => {
    const invalidInput = { ...sampleInput, raw_description: "شكوى قصيرة جدا" };
    const request = new NextRequest("http://localhost:3000/api/cases/submit", {
      method: "POST",
      body: JSON.stringify(invalidInput),
      headers: { "Content-Type": "application/json" },
    });

    const response = await submitRoute(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation failed");
  });

  it("POST /api/institution/acknowledge transitions case to ACTION_PLAN_PENDING", async () => {
    const caseId = "00000000-0000-0000-0000-000000000099";
    const request = new NextRequest("http://localhost:3000/api/institution/acknowledge", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        internal_notes: "تم التأكيد والمراجعة من الإدارة.",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await acknowledgeRoute(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.case_id).toBe(caseId);
    expect(body.lifecycle_status).toBe("ACTION_PLAN_PENDING");
  });
});
