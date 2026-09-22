import { describe, it, expect, beforeEach } from "vitest";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { getSectorConfig } from "@/lib/config/sectors";

describe("Phase 0: Enterprise Multi-Tenancy & Department Routing", () => {
  const TENANT_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
  const TENANT_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

  it("auto-seeds sector-specific default departments for a tenant", async () => {
    const deptsSchool = await storageAdapter.getDepartments(TENANT_A, "EDUCATION_SCHOOLS");
    expect(deptsSchool.length).toBeGreaterThanOrEqual(4);
    expect(deptsSchool.some((d) => d.code === "STUDENT_AFFAIRS")).toBe(true);
    expect(deptsSchool.some((d) => d.code === "FINANCE_TUITION")).toBe(true);

    const deptsHospital = await storageAdapter.getDepartments(TENANT_B, "HEALTHCARE_MEDICAL");
    expect(deptsHospital.some((d) => d.code === "PATIENT_RELATIONS")).toBe(true);
    expect(deptsHospital.some((d) => d.code === "MEDICAL_ADMIN")).toBe(true);
  });

  it("enforces strict department isolation between different tenants", async () => {
    // Custom department in Tenant A
    const customDeptA = await storageAdapter.createDepartment({
      institution_id: TENANT_A,
      code: "BUS_DISPATCH",
      name_ar: "حركة الحافلات المدرسية",
      name_en: "Bus Dispatch & Logistics",
      default_sla_hours: 24,
      is_active: true,
    });

    const tenantADepts = await storageAdapter.getDepartments(TENANT_A);
    const tenantBDepts = await storageAdapter.getDepartments(TENANT_B);

    expect(tenantADepts.some((d) => d.code === "BUS_DISPATCH")).toBe(true);
    expect(tenantBDepts.some((d) => d.code === "BUS_DISPATCH")).toBe(false);
  });

  it("creates and isolates internal staff notes within a case", async () => {
    const noteCaseId = crypto.randomUUID();
    const testCase = await storageAdapter.saveCase({
      id: noteCaseId,
      reference_number: `MRF-2026-TESTNOTE-${Date.now()}`,
      user_id: "00000000-0000-0000-0000-000000000001",
      institution_id: TENANT_A,
      category: "ACADEMIC",
      subcategory: "CURRICULUM_DELIVERY",
      lifecycle_status: "PRIVATE_GRACE",
      visibility: "STRICTLY_PRIVATE",
      sanitized_description: "استفسار خاص بالشؤون التعليمية",
      initial_experience_rating: 3,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    const note1 = await storageAdapter.addInternalNote({
      case_id: testCase.id,
      institution_id: TENANT_A,
      author_id: "staff-user-001",
      author_name: "أ. أحمد إبراهيم (رئيس القسم الأكاديمي)",
      author_role: "DEPARTMENT_HEAD",
      note_text: "تم مراجعة سجلات الدرجات وتبين وجود خطأ رصد في كنترول نصف العام.",
    });

    const notes = await storageAdapter.getInternalNotes(testCase.id);
    expect(notes.length).toBe(1);
    expect(notes[0].note_text).toContain("خطأ رصد في كنترول");
    expect(notes[0].institution_id).toBe(TENANT_A);
  });

  it("assigns a case to a specific department and staff with SLA deadline", async () => {
    const assignCaseId = crypto.randomUUID();
    await storageAdapter.saveCase({
      id: assignCaseId,
      reference_number: `MRF-2026-ASSIGN-${Date.now()}`,
      user_id: "00000000-0000-0000-0000-000000000001",
      institution_id: TENANT_A,
      category: "ACADEMIC",
      subcategory: "CURRICULUM_DELIVERY",
      lifecycle_status: "PRIVATE_GRACE",
      visibility: "STRICTLY_PRIVATE",
      sanitized_description: "استفسار توزيع أقسام",
      initial_experience_rating: 3,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    const depts = await storageAdapter.getDepartments(TENANT_A);
    const targetDept = depts[0];

    const updated = await storageAdapter.assignCase(assignCaseId, {
      departmentId: targetDept.id,
      staffId: "staff-specialist-77",
      priority: "HIGH",
      slaTargetHours: 24,
    });

    expect(updated).not.toBeNull();
    expect(updated?.assigned_department_id).toBe(targetDept.id);
    expect(updated?.assigned_staff_id).toBe("staff-specialist-77");
    expect(updated?.priority).toBe("HIGH");
    expect(updated?.sla_target_at).toBeDefined();

    // Verify listCases filtering by department and priority
    const deptFiltered = await storageAdapter.listCases({
      institutionId: TENANT_A,
      departmentId: targetDept.id,
    });
    expect(deptFiltered.some((c) => c.id === assignCaseId)).toBe(true);

    const highPriorityFiltered = await storageAdapter.listCases({
      institutionId: TENANT_A,
      priority: "HIGH",
    });
    expect(highPriorityFiltered.some((c) => c.id === assignCaseId)).toBe(true);
  });

  it("validates sector configuration helper contracts", () => {
    const schoolCfg = getSectorConfig("EDUCATION_SCHOOLS");
    expect(schoolCfg.beneficiaryTerm.ar).toBe("ولي الأمر / الطالب");
    expect(schoolCfg.statutoryBasis_ar).toContain("187 لسنة 2023");

    const govCfg = getSectorConfig("GOVERNMENT_PUBLIC");
    expect(govCfg.beneficiaryTerm.ar).toBe("المواطن / صاحب المعاملة");
    expect(govCfg.defaultDepartments.some((d) => d.code === "CITIZEN_SERVICE")).toBe(true);

    const healthCfg = getSectorConfig("HEALTHCARE_MEDICAL");
    expect(healthCfg.beneficiaryTerm.ar).toBe("المريض / المرافق");
    expect(healthCfg.beneficiaryIdentifier.label_ar).toContain("MRN");
  });
});
