import { describe, it, expect } from "vitest";
import { tenantAdminService } from "@/lib/services/tenant-admin";

describe("Tenant Admin Service", () => {
  const TEST_INSTITUTION_ID = "test-tenant-inst-001";

  it("loads tenant overview with default branding and SLA config", async () => {
    const overview = await tenantAdminService.getTenantOverview(TEST_INSTITUTION_ID);

    expect(overview).toBeDefined();
    expect(overview.institutionId).toBe(TEST_INSTITUTION_ID);
    expect(overview.branding).toBeDefined();
    expect(overview.slaConfig).toBeDefined();
    expect(Array.isArray(overview.departments)).toBe(true);
    expect(overview.departments.length).toBeGreaterThan(0);
  });

  it("updates and retrieves tenant branding successfully", async () => {
    const updated = await tenantAdminService.updateBranding(TEST_INSTITUTION_ID, {
      institution_short_name: "مدرسة المستقبل الدولية",
      primary_color: "#1E3A8A",
      welcome_message_ar: "أهلاً بأولياء الأمور الكرام في بوابة الحلول",
    });

    expect(updated.institution_short_name).toBe("مدرسة المستقبل الدولية");
    expect(updated.primary_color).toBe("#1E3A8A");

    const overview = await tenantAdminService.getTenantOverview(TEST_INSTITUTION_ID);
    expect(overview.branding.institution_short_name).toBe("مدرسة المستقبل الدولية");
    expect(overview.branding.primary_color).toBe("#1E3A8A");
  });

  it("updates and retrieves tenant SLA configurations", async () => {
    const updated = await tenantAdminService.updateSlaConfig(TEST_INSTITUTION_ID, {
      first_response_hours: 12,
      critical_resolution_hours: 18,
      resolution_hours: 120,
    });

    expect(updated.first_response_hours).toBe(12);
    expect(updated.critical_resolution_hours).toBe(18);

    const overview = await tenantAdminService.getTenantOverview(TEST_INSTITUTION_ID);
    expect(overview.slaConfig.first_response_hours).toBe(12);
    expect(overview.slaConfig.critical_resolution_hours).toBe(18);
  });

  it("supports creating, updating, and deleting departments", async () => {
    // 1. Create
    const dept = await tenantAdminService.createDepartment(TEST_INSTITUTION_ID, {
      code: "DEPT_LEGAL",
      name_ar: "الشؤون القانونية والتحقيق",
      name_en: "Legal Affairs",
      default_sla_hours: 36,
    });

    expect(dept.id).toBeDefined();
    expect(dept.code).toBe("DEPT_LEGAL");
    expect(dept.name_ar).toBe("الشؤون القانونية والتحقيق");

    // 2. Update
    const updatedDept = await tenantAdminService.updateDepartment(dept.id, {
      default_sla_hours: 48,
    });
    expect(updatedDept?.default_sla_hours).toBe(48);

    // 3. Delete
    const deleted = await tenantAdminService.deleteDepartment(dept.id);
    expect(deleted).toBe(true);
  });

  it("supports staff management CRUD operations", async () => {
    // 1. Create staff
    const staff = await tenantAdminService.createStaffMember(TEST_INSTITUTION_ID, {
      name: "أ. ياسر عبد العزيز",
      email: "yasser.a@future-school.edu.eg",
      role: "STAFF",
    });

    expect(staff.id).toBeDefined();
    expect(staff.name).toBe("أ. ياسر عبد العزيز");
    expect(staff.role).toBe("STAFF");

    // 2. Update role to OPS_LEAD
    const updated = await tenantAdminService.updateStaffMember(staff.id, {
      role: "OPS_LEAD",
    });
    expect(updated?.role).toBe("OPS_LEAD");

    // 3. Delete staff
    const deleted = await tenantAdminService.deleteStaffMember(staff.id);
    expect(deleted).toBe(true);
  });
});
