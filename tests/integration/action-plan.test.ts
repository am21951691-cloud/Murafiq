import { describe, it, expect } from "vitest";
import { POST as actionPlanRoute } from "@/app/api/institution/action-plan/route";
import { NextRequest } from "next/server";
import { calculateRQS } from "@/lib/ai/scoring";

describe("Slice 2: Action Plan Formulation & Deterministic RQS Pipeline", () => {
  const caseId = "e4a2a198-5c4d-4b82-9e90-c2874136979a";

  const validPayload = {
    case_id: caseId,
    official_statement:
      "عقدت إدارة المرحلة الابتدائية اجتماعاً عاجلاً مع مسؤولي الحافلات وقسم الصيانة لتعديل مسارات النقل وضمان الالتزام بمواعيد الوصول المحددة.",
    user_role: "OPS_LEAD" as const,
    milestones: [
      {
        title: "إعادة توزيع خطوط السير وتعيين مشرفين إضافيين",
        owner_role: "مدير حركة النقل",
        due_date: "2026-10-01",
        deliverable: "جدول المسارات المعدل معتمد من الإدارة العامة",
      },
      {
        title: "فحص أجهزة التتبع في جميع المركبات",
        owner_role: "مسؤول الصيانة",
        due_date: "2026-10-03",
        deliverable: "تقرير فحص صلاحية الأجهزة الفنية",
      },
    ],
  };

  it("POST /api/institution/action-plan succeeds for OPS_LEAD and advances lifecycle to IN_PROGRESS", async () => {
    const request = new NextRequest("http://localhost:3000/api/institution/action-plan", {
      method: "POST",
      body: JSON.stringify(validPayload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await actionPlanRoute(request);
    expect(response.status).toBe(201);

    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.action_plan.id).toBeDefined();
    expect(body.action_plan.case_id).toBe(caseId);
    expect(body.action_plan.lifecycle_status).toBe("IN_PROGRESS");
    expect(body.action_plan.rqs_score).toBeGreaterThanOrEqual(70);
    expect(body.action_plan.milestones.length).toBe(2);

    // Verify determinism matches calculateRQS
    const directScore = calculateRQS({
      officialStatement: validPayload.official_statement,
      milestones: validPayload.milestones.map((m) => ({
        title: m.title,
        ownerRole: m.owner_role,
        dueDate: m.due_date,
        deliverable: m.deliverable,
      })),
    });
    expect(body.action_plan.rqs_score).toBe(directScore.rqsScore);
  });

  it("POST /api/institution/action-plan succeeds for ADMIN role", async () => {
    const adminPayload = { ...validPayload, user_role: "ADMIN" as const };
    const request = new NextRequest("http://localhost:3000/api/institution/action-plan", {
      method: "POST",
      body: JSON.stringify(adminPayload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await actionPlanRoute(request);
    expect(response.status).toBe(201);
  });

  it("POST /api/institution/action-plan rejects STAFF role with 403 Forbidden", async () => {
    const unauthorizedPayload = { ...validPayload, user_role: "STAFF" as const };
    const request = new NextRequest("http://localhost:3000/api/institution/action-plan", {
      method: "POST",
      body: JSON.stringify(unauthorizedPayload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await actionPlanRoute(request);
    expect(response.status).toBe(403);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toContain("Unauthorized");
  });

  it("POST /api/institution/action-plan rejects OBSERVER role with 403 Forbidden", async () => {
    const unauthorizedPayload = { ...validPayload, user_role: "OBSERVER" as const };
    const request = new NextRequest("http://localhost:3000/api/institution/action-plan", {
      method: "POST",
      body: JSON.stringify(unauthorizedPayload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await actionPlanRoute(request);
    expect(response.status).toBe(403);
  });

  it("POST /api/institution/action-plan validates statement length and rejects empty milestones", async () => {
    const invalidPayload = {
      case_id: caseId,
      official_statement: "Too short", // under 20 chars
      user_role: "OPS_LEAD",
      milestones: [], // empty milestones
    };
    const request = new NextRequest("http://localhost:3000/api/institution/action-plan", {
      method: "POST",
      body: JSON.stringify(invalidPayload),
      headers: { "Content-Type": "application/json" },
    });

    const response = await actionPlanRoute(request);
    expect(response.status).toBe(400);

    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.error).toBe("Validation failed");
  });
});
