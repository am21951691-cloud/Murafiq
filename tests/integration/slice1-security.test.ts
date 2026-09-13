import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { POST as submitRoute } from "@/app/api/cases/submit/route";
import { NextRequest } from "next/server";
import { CaseCategoryEnum, VisibilityLevelEnum } from "@/types/database";

describe("Slice 1 — Comprehensive Security & Boundary Isolation Tests", () => {
  const schemaPath = path.resolve(
    __dirname,
    "../../supabase/migrations/20260913000001_initial_schema.sql"
  );
  const slice1RlsPath = path.resolve(
    __dirname,
    "../../supabase/migrations/20260913000002_slice1_rls_policies.sql"
  );

  const initialSql = fs.readFileSync(schemaPath, "utf-8");
  const slice1Sql = fs.readFileSync(slice1RlsPath, "utf-8");
  const combinedSql = initialSql + "\n" + slice1Sql;

  it("Enforces parent isolation: Parent can access only their own cases", () => {
    expect(combinedSql).toContain(
      `CREATE POLICY "Users can view own cases" ON cases`
    );
    expect(combinedSql).toContain(`FOR SELECT USING (auth.uid() = user_id);`);

    expect(combinedSql).toContain(
      `CREATE POLICY "Users can update own draft cases" ON cases`
    );
    expect(combinedSql).toContain(
      `FOR UPDATE USING (auth.uid() = user_id AND lifecycle_status = 'DRAFT');`
    );
  });

  it("Enforces institution isolation: Institution members can read ONLY authorized cases matching institution_id", () => {
    expect(combinedSql).toContain(
      `CREATE POLICY "Institution member case access policy" ON cases`
    );
    expect(combinedSql).toContain(`m.institution_id = cases.institution_id`);
    expect(combinedSql).toContain(`m.user_id = auth.uid()`);
  });

  it("Enforces PII isolation: case_sensitive_data is strictly inaccessible to institution members and public", () => {
    const sensitiveDataPolicies = combinedSql
      .split(";")
      .filter((s) => s.includes("ON case_sensitive_data"));

    // Verify only case owner can SELECT or INSERT
    sensitiveDataPolicies.forEach((policy) => {
      expect(policy).not.toContain("institution_members");
      expect(policy).not.toContain("Public");
    });

    expect(combinedSql).toContain(
      `CREATE POLICY "Only case owner can view raw sensitive data" ON case_sensitive_data`
    );
  });

  it("Enforces public query boundaries: Private and safety-flagged cases NEVER appear in public queries", () => {
    expect(combinedSql).toContain(
      `CREATE POLICY "Public can view approved cases" ON cases`
    );
    expect(combinedSql).toContain(`visibility = 'PUBLIC'`);
    expect(combinedSql).toContain(`safety_status = 'CLEAR'`);
    expect(combinedSql).toContain(
      `moderation_status IN ('APPROVED', 'REDACTED_APPROVED')`
    );
  });

  it("Enforces server-side institution acknowledgement policy for ADMIN and OPS_LEAD only", () => {
    expect(combinedSql).toContain(
      `CREATE POLICY "Institution Admin and Ops Lead can acknowledge cases" ON cases`
    );
    expect(combinedSql).toContain(`m.role IN ('ADMIN', 'OPS_LEAD')`);
    expect(combinedSql).not.toContain(
      `m.role IN ('ADMIN', 'OPS_LEAD', 'STAFF', 'OBSERVER')`
    );
  });

  it("Enforces audit immutability: case_events table is guarded against UPDATE and DELETE", () => {
    expect(combinedSql).toContain(
      `CREATE OR REPLACE FUNCTION prevent_audit_tampering()`
    );
    expect(combinedSql).toContain(`CREATE TRIGGER trg_immutable_case_events`);
    expect(combinedSql).toContain(`BEFORE UPDATE OR DELETE ON case_events`);
  });

  it("API Response Sanitization: Raw sensitive fields NEVER leak through /api/cases/submit", async () => {
    const fakeReq = new NextRequest("http://localhost:3000/api/cases/submit", {
      method: "POST",
      body: JSON.stringify({
        institution_id: "00000000-0000-0000-0000-000000000010",
        category: CaseCategoryEnum.TEACHER_COMMUNICATION,
        subcategory: "التواصل الأسبوعي",
        raw_description:
          "المعلم لا يلتزم بمواعيد الحصص ورقم هاتفه الشخصي 01234567890 وبطاقته 29501011234567.",
        initial_experience_rating: 2,
        desired_outcome: "متابعة أداء المعلم وتغييره إذا تكرر الأمر.",
        visibility: VisibilityLevelEnum.STRICTLY_PRIVATE,
        parent_phone: "01012345678",
        student_identifiers: {
          student_national_id: "30501011234567",
        },
        consent_given: true,
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await submitRoute(fakeReq);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);

    const serialized = JSON.stringify(body);

    // Assert raw sensitive fields are completely absent from the response
    expect(serialized).not.toContain("raw_description_encrypted");
    expect(serialized).not.toContain("01012345678"); // parent phone
    expect(serialized).not.toContain("01234567890"); // teacher phone in narrative
    expect(serialized).not.toContain("29501011234567"); // teacher national ID in narrative
    expect(serialized).not.toContain("30501011234567"); // student national ID
    expect(serialized).not.toContain("student_identifiers");

    // Assert sanitized description is present
    expect(body.case.sanitized_description).toContain("[PHONE_REDACTED]");
    expect(body.case.sanitized_description).toContain("[NATIONAL_ID_REDACTED]");
  });
});
