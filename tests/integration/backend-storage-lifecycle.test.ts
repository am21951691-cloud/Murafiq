import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { POST as submitRoute } from "@/app/api/cases/submit/route";
import { GET as institutionCasesRoute } from "@/app/api/institution/cases/route";
import { POST as acknowledgeRoute } from "@/app/api/institution/acknowledge/route";
import { POST as actionPlanRoute } from "@/app/api/institution/action-plan/route";
import { POST as completeMilestoneRoute } from "@/app/api/cases/milestones/complete/route";
import { POST as evaluateRoute } from "@/app/api/cases/evaluate/route";
import { GET as getCaseRoute } from "@/app/api/cases/[id]/route";

describe("Backend Storage Engine & Full Case Lifecycle Integration", () => {
  let createdCaseId: string;
  let createdCaseRef: string;
  let createdMilestoneId: string;

  const newCasePayload = {
    institution_id: "com-vodafone-001",
    category: "FACILITIES_HEALTH_SAFETY",
    subcategory: "سرعات الإنترنت المنزلي VDSL",
    raw_description:
      "تكرار انقطاع خدمة الإنترنت المنزلي لأكثر من 6 أيام متتالية والتواصل مع الدعم الفني على رقم 01012345678 دون أي معالجة فنية على أرض الواقع.",
    initial_experience_rating: 1,
    desired_outcome: "إرسال فني للصيانة خلال 24 ساعة وتعويض قيمة الأيام المنقطعة.",
    visibility: "STRICTLY_PRIVATE" as const,
    parent_phone: "01011223344",
    consent_given: true as const,
  };

  it("1. Submits case via /api/cases/submit and persists in storage adapter", async () => {
    const req = new NextRequest("http://localhost:3000/api/cases/submit", {
      method: "POST",
      body: JSON.stringify(newCasePayload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await submitRoute(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.case.id).toBeDefined();
    expect(data.case.reference_number).toMatch(/^MRF-\d{4}-\d{5}$/);
    expect(data.case.sanitized_description).toContain("[PHONE_REDACTED]");
    expect(data.case.lifecycle_status).toBe("PRIVATE_GRACE");

    // Gate 1: No encrypted PII leaked in response
    expect(data.case.raw_description_encrypted).toBeUndefined();
    expect(data.case.parent_contact_phone_encrypted).toBeUndefined();

    createdCaseId = data.case.id;
    createdCaseRef = data.case.reference_number;
  });

  it("2. Lists submitted case in /api/institution/cases", async () => {
    const req = new NextRequest(
      `http://localhost:3000/api/institution/cases?institution_id=com-vodafone-001`
    );

    const res = await institutionCasesRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(Array.isArray(data.cases)).toBe(true);

    const found = data.cases.find((c: any) => c.id === createdCaseId);
    expect(found).toBeDefined();
    expect(found.reference_number).toBe(createdCaseRef);
    expect(found.remaining_days).toBeGreaterThanOrEqual(5);
  });

  it("3. Retrieves case via /api/cases/[id] by reference number and by UUID", async () => {
    // Lookup by Reference Number
    const reqByRef = new NextRequest(`http://localhost:3000/api/cases/${createdCaseRef}`);
    const resByRef = await getCaseRoute(reqByRef, {
      params: Promise.resolve({ id: createdCaseRef }),
    });
    expect(resByRef.status).toBe(200);

    const dataByRef = await resByRef.json();
    expect(dataByRef.success).toBe(true);
    expect(dataByRef.case.id).toBe(createdCaseId);
    expect(dataByRef.case.reference_number).toBe(createdCaseRef);

    // Lookup by UUID
    const reqById = new NextRequest(`http://localhost:3000/api/cases/${createdCaseId}`);
    const resById = await getCaseRoute(reqById, {
      params: Promise.resolve({ id: createdCaseId }),
    });
    expect(resById.status).toBe(200);

    const dataById = await resById.json();
    expect(dataById.success).toBe(true);
    expect(dataById.case.id).toBe(createdCaseId);
  });

  it("4. Acknowledges case via /api/institution/acknowledge", async () => {
    const req = new NextRequest("http://localhost:3000/api/institution/acknowledge", {
      method: "POST",
      body: JSON.stringify({
        case_id: createdCaseId,
        internal_notes: "تمت مراجعة الشكوى من إدارة الجودة والعمليات.",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await acknowledgeRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.case_id).toBe(createdCaseId);
    expect(data.lifecycle_status).toBe("ACTION_PLAN_PENDING");
  });

  it("5. Submits action plan via /api/institution/action-plan and advances to IN_PROGRESS", async () => {
    const actionPlanPayload = {
      case_id: createdCaseId,
      user_role: "ADMIN",
      official_statement:
        "تلتزم الشركة بإيفاد فريق الدعم الفني المتخصص وقياس جودة الإشارة لضمان استقرار الخدمة بصورة كاملة.",
      milestones: [
        {
          title: "زيارة فنية ميدانية وفحص كابينة الاتصالات",
          owner_role: "مهندس الصيانة الميدانية",
          due_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0],
          deliverable: "تقرير فحص الكابينة وتغيير الأسلاك التالفة",
        },
      ],
    };

    const req = new NextRequest("http://localhost:3000/api/institution/action-plan", {
      method: "POST",
      body: JSON.stringify(actionPlanPayload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await actionPlanRoute(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.action_plan.rqs_score).toBeGreaterThan(0);
    expect(data.action_plan.milestones.length).toBe(1);
    expect(data.action_plan.lifecycle_status).toBe("IN_PROGRESS");

    createdMilestoneId = data.action_plan.milestones[0].id;
  });

  it("6. Completes milestone via /api/cases/milestones/complete and advances to AWAITING_EVALUATION", async () => {
    const req = new NextRequest("http://localhost:3000/api/cases/milestones/complete", {
      method: "POST",
      body: JSON.stringify({
        case_id: createdCaseId,
        milestone_id: createdMilestoneId,
        evidence_summary: "تم الانتهاء من الفحص واستبدال الراوتر واختبار السرعة بنجاح.",
      }),
      headers: { "Content-Type": "application/json" },
    });

    const res = await completeMilestoneRoute(req);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.is_completed).toBe(true);
    expect(data.all_milestones_completed).toBe(true);
    expect(data.lifecycle_status).toBe("AWAITING_EVALUATION");
  });

  it("7. Evaluates and closes case via /api/cases/evaluate (3D Closure)", async () => {
    const evalPayload = {
      case_id: createdCaseId,
      response_rating: 4,
      resolution_rating: 5,
      closing_comment: "تم حل المشكلة بمهنية وسرعة بعد تدخل الإدارة، شكراً لكم.",
    };

    const req = new NextRequest("http://localhost:3000/api/cases/evaluate", {
      method: "POST",
      body: JSON.stringify(evalPayload),
      headers: { "Content-Type": "application/json" },
    });

    const res = await evaluateRoute(req);
    expect(res.status).toBe(201);

    const data = await res.json();
    expect(data.success).toBe(true);
    expect(data.lifecycle_status).toBe("CLOSED");

    // Verify final state via /api/cases/[id]
    const finalReq = new NextRequest(`http://localhost:3000/api/cases/${createdCaseId}`);
    const finalRes = await getCaseRoute(finalReq, {
      params: Promise.resolve({ id: createdCaseId }),
    });
    const finalData = await finalRes.json();

    expect(finalData.case.lifecycle_status).toBe("CLOSED");
    expect(finalData.evaluation).toBeDefined();
    expect(finalData.evaluation.resolution_satisfaction_rating).toBe(5);
  });
});
