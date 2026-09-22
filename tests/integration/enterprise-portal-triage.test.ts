import { describe, it, expect } from "vitest";
import { GET as getDepartments } from "@/app/api/institution/departments/route";
import { POST as assignCase } from "@/app/api/institution/assign/route";
import { GET as getNotes, POST as addNote } from "@/app/api/institution/notes/route";
import { GET as getAnalytics } from "@/app/api/institution/analytics/route";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { NextRequest } from "next/server";

describe("Phase 2 & 3: Enterprise Portal Triage, Assignment & Notes APIs", () => {
  const TEST_INSTITUTION_ID = "00000000-0000-0000-0000-000000000010";

  it("fetches seeded departments for an institution", async () => {
    const req = new NextRequest(`http://localhost:3000/api/institution/departments?institution_id=${TEST_INSTITUTION_ID}&sector=EDUCATION_SCHOOLS`);
    const res = await getDepartments(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.departments.length).toBeGreaterThan(0);
    expect(data.departments.some((d: any) => d.code === "STUDENT_AFFAIRS")).toBe(true);
  });

  it("assigns a case to a department with priority and SLA target", async () => {
    const testCase = await storageAdapter.saveCase({
      id: "77777777-7777-7777-7777-777777777777",
      reference_number: "MRF-2026-ASSIGN-TEST",
      user_id: "00000000-0000-0000-0000-000000000001",
      institution_id: TEST_INSTITUTION_ID,
      category: "SAFETY_DISCIPLINE",
      subcategory: "BULLYING",
      lifecycle_status: "PRIVATE_GRACE",
      visibility: "STRICTLY_PRIVATE",
      sanitized_description: "واقعة تنمر تستوجب تدخلاً إدارياً عاجلاً",
      initial_experience_rating: 1,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const depts = await storageAdapter.getDepartments(TEST_INSTITUTION_ID);
    const targetDept = depts[0];

    const req = new NextRequest("http://localhost:3000/api/institution/assign", {
      method: "POST",
      body: JSON.stringify({
        case_id: testCase.id,
        department_id: targetDept.id,
        staff_id: "staff-officer-99",
        priority: "CRITICAL",
        sla_target_hours: 12,
      }),
    });

    const res = await assignCase(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.case.assigned_department_id).toBe(targetDept.id);
    expect(data.case.priority).toBe("CRITICAL");
    expect(data.case.sla_target_at).toBeDefined();
  });

  it("creates and retrieves internal notes for a case", async () => {
    const caseId = "77777777-7777-7777-7777-777777777777";

    const postReq = new NextRequest("http://localhost:3000/api/institution/notes", {
      method: "POST",
      body: JSON.stringify({
        case_id: caseId,
        institution_id: TEST_INSTITUTION_ID,
        author_id: "lead-officer-01",
        author_name: "مدير الشؤون القانونية",
        author_role: "OPS_LEAD",
        note_text: "تم إحالة الشكوى للجنة الانضباط المدرسي لبدء التحقيق الفوري.",
      }),
    });

    const postRes = await addNote(postReq);
    const postData = await postRes.json();

    expect(postRes.status).toBe(201);
    expect(postData.success).toBe(true);
    expect(postData.note.note_text).toContain("لجنة الانضباط المدرسي");

    // Fetch notes via GET
    const getReq = new NextRequest(`http://localhost:3000/api/institution/notes?case_id=${caseId}`);
    const getRes = await getNotes(getReq);
    const getData = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getData.success).toBe(true);
    expect(getData.notes.length).toBeGreaterThanOrEqual(1);
  });

  it("computes executive analytics correctly", async () => {
    const req = new NextRequest(`http://localhost:3000/api/institution/analytics?institution_id=${TEST_INSTITUTION_ID}`);
    const res = await getAnalytics(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metrics.totalCases).toBeGreaterThan(0);
    expect(data.metrics.slaCompliancePercent).toBeGreaterThanOrEqual(0);
    expect(data.metrics.priorityDistribution).toBeDefined();
  });
});
