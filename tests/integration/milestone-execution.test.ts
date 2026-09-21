import { describe, it, expect } from "vitest";
import { POST as completeMilestoneRoute } from "@/app/api/cases/milestones/complete/route";
import { checkAllMilestonesCompleted } from "@/lib/services/milestones";
import { NextRequest } from "next/server";

describe("Slice 3: Milestone Execution & Verification Records Pipeline", () => {
  const caseId = "e4a2a198-5c4d-4b82-9e90-c2874136979a";
  const milestoneId = "11111111-2222-3333-4444-555555555555";

  it("checks completion logic accurately across mixed milestone arrays", () => {
    const mixed = [
      { id: "m1", is_completed: true },
      { id: "m2", is_completed: false },
    ];
    expect(checkAllMilestonesCompleted(mixed)).toBe(false);

    const allDone = [
      { id: "m1", is_completed: true },
      { id: "m2", is_completed: true },
    ];
    expect(checkAllMilestonesCompleted(allDone)).toBe(true);
    expect(checkAllMilestonesCompleted([])).toBe(false);
  });

  it("POST /api/cases/milestones/complete records verification evidence and completes milestone", async () => {
    const request = new NextRequest("http://localhost:3000/api/cases/milestones/complete", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        milestone_id: milestoneId,
        evidence_summary: "تم تسليم أجهزة التتبع وتركيبها بالحافلات بنجاح.",
        verification_method: "INSTITUTION_DOCUMENT",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await completeMilestoneRoute(request);
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.milestone_id).toBe(milestoneId);
    expect(body.is_completed).toBe(true);
    expect(body.verification_record_id).toBeDefined();
  });

  it("POST /api/cases/milestones/complete rejects short or missing evidence with 400", async () => {
    const request = new NextRequest("http://localhost:3000/api/cases/milestones/complete", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        milestone_id: milestoneId,
        evidence_summary: "done", // under 5 chars
      }),
      headers: { "Content-Type": "application/json" },
    });

    const response = await completeMilestoneRoute(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation failed");
  });
});
