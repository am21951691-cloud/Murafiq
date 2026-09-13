import { describe, it, expect } from "vitest";
import { verifyAndAcknowledgeCase } from "@/lib/services/cases";

describe("Slice 1 — Institutional Triage & RBAC Authorization Tests", () => {
  const baseInput = {
    caseId: "11111111-1111-1111-1111-111111111111",
    userId: "user-admin-uuid",
    userRole: "ADMIN",
    caseInstitutionId: "inst-cairo-school-uuid",
    memberInstitutionId: "inst-cairo-school-uuid",
    caseStatus: "PRIVATE_GRACE",
    graceExpiresAt: new Date(Date.now() + 5 * 86400000).toISOString(),
    internalNotes: "تم استلام الشكوى وسيتم التواصل مع منسق المرحلة.",
  };

  it("ADMIN can acknowledge an incoming case during active private grace window", () => {
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      userRole: "ADMIN",
    });

    expect(result.authorized).toBe(true);
    expect(result.newStatus).toBe("ACTION_PLAN_PENDING");
    expect(result.eventRecord?.event_type).toBe("CASE_ACKNOWLEDGED");
    expect(result.eventRecord?.from_state).toEqual({ lifecycle_status: "PRIVATE_GRACE" });
    expect(result.eventRecord?.to_state).toEqual({
      lifecycle_status: "ACTION_PLAN_PENDING",
    });
    expect(result.eventRecord?.metadata.acknowledged_by_role).toBe("ADMIN");
  });

  it("OPS_LEAD can acknowledge an incoming case during active private grace window", () => {
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      userRole: "OPS_LEAD",
    });

    expect(result.authorized).toBe(true);
    expect(result.newStatus).toBe("ACTION_PLAN_PENDING");
    expect(result.eventRecord?.metadata.acknowledged_by_role).toBe("OPS_LEAD");
  });

  it("STAFF cannot acknowledge a case (strictly prohibited server-side)", () => {
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      userRole: "STAFF",
    });

    expect(result.authorized).toBe(false);
    expect(result.errorCode).toBe("INSUFFICIENT_ROLE");
    expect(result.errorMessage).toContain("Only ADMIN or OPS_LEAD");
  });

  it("OBSERVER cannot acknowledge a case (strictly prohibited server-side)", () => {
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      userRole: "OBSERVER",
    });

    expect(result.authorized).toBe(false);
    expect(result.errorCode).toBe("INSUFFICIENT_ROLE");
    expect(result.errorMessage).toContain("Only ADMIN or OPS_LEAD");
  });

  it("Institution member cannot acknowledge a case belonging to a different institution", () => {
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      caseInstitutionId: "school-A-uuid",
      memberInstitutionId: "school-B-uuid",
    });

    expect(result.authorized).toBe(false);
    expect(result.errorCode).toBe("UNAUTHORIZED_INSTITUTION");
    expect(result.errorMessage).toContain("does not belong to your institution");
  });

  it("Cannot acknowledge a case that is not in PRIVATE_GRACE state", () => {
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      caseStatus: "ACTION_PLAN_PENDING",
    });

    expect(result.authorized).toBe(false);
    expect(result.errorCode).toBe("INVALID_LIFECYCLE_STATE");
  });

  it("Enforces grace period server-side: rejects acknowledgement if grace window has expired", () => {
    const expiredDate = new Date(Date.now() - 1000 * 60).toISOString(); // 1 minute ago
    const result = verifyAndAcknowledgeCase({
      ...baseInput,
      graceExpiresAt: expiredDate,
    });

    expect(result.authorized).toBe(false);
    expect(result.errorCode).toBe("GRACE_EXPIRED");
    expect(result.errorMessage).toContain("grace period has expired");
  });
});
