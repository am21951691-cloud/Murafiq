import { NextResponse } from "next/server";
import { tenantAdminService } from "@/lib/services/tenant-admin";
import { storageAdapter } from "@/lib/services/storage-adapter";
import type { SectorType } from "@/types/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId") || "00000000-0000-0000-0000-000000000010";
    const sector = (searchParams.get("sector") as SectorType) || "EDUCATION_SCHOOLS";

    const overview = await tenantAdminService.getTenantOverview(institutionId, sector);
    const sectorInfo = tenantAdminService.getSectorCategories(sector);
    const org = await storageAdapter.getOrganization(institutionId);
    const subscription = await storageAdapter.getSubscription(institutionId);
    const customFields = await storageAdapter.getCustomFields(institutionId);
    const workflowRules = await storageAdapter.getWorkflowRules(institutionId);
    const webhooks = await storageAdapter.getWebhooks(institutionId);
    const webhookLogs = await storageAdapter.getWebhookLogs(institutionId);
    const auditLogs = await storageAdapter.getAuditLogs(institutionId, 50);
    const caseTemplates = await storageAdapter.getCaseTemplates(institutionId, sector);
    const branches = await storageAdapter.getBranches(institutionId);

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        organization: org,
        subscription,
        customFields,
        workflowRules,
        webhooks,
        webhookLogs,
        auditLogs,
        caseTemplates,
        branches,
        sectorInfo,
      },
    });
  } catch (error: any) {
    console.error("[API /institution/admin] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load tenant admin data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, institutionId = "00000000-0000-0000-0000-000000000010", payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "UPDATE_GENERAL": {
        const updated = await storageAdapter.updateOrganization(institutionId, payload);
        return NextResponse.json({ success: true, data: updated });
      }

      case "UPDATE_BRANDING": {
        const branding = await tenantAdminService.updateBranding(institutionId, payload);
        await storageAdapter.logAuditEvent({
          institution_id: institutionId,
          actor_id: "admin-user",
          actor_name: "مدير المؤسسة",
          actor_role: "ADMIN",
          action: "UPDATE_BRANDING",
          entity_type: "BRANDING",
          entity_id: institutionId,
          after_state: branding,
        });
        return NextResponse.json({ success: true, data: branding });
      }

      case "UPDATE_SLA": {
        const sla = await tenantAdminService.updateSlaConfig(institutionId, payload);
        await storageAdapter.logAuditEvent({
          institution_id: institutionId,
          actor_id: "admin-user",
          actor_name: "مدير المؤسسة",
          actor_role: "ADMIN",
          action: "UPDATE_SLA_POLICY",
          entity_type: "SLA",
          entity_id: institutionId,
          after_state: sla,
        });
        return NextResponse.json({ success: true, data: sla });
      }

      case "CREATE_DEPARTMENT": {
        const department = await tenantAdminService.createDepartment(institutionId, payload);
        await storageAdapter.logAuditEvent({
          institution_id: institutionId,
          actor_id: "admin-user",
          actor_name: "مدير المؤسسة",
          actor_role: "ADMIN",
          action: "CREATE_DEPARTMENT",
          entity_type: "DEPARTMENT",
          entity_id: department.id,
          after_state: department,
        });
        return NextResponse.json({ success: true, data: department });
      }

      case "UPDATE_DEPARTMENT": {
        const { deptId, updates } = payload;
        const department = await tenantAdminService.updateDepartment(deptId, updates);
        return NextResponse.json({ success: true, data: department });
      }

      case "DELETE_DEPARTMENT": {
        const { deptId } = payload;
        const deleted = await tenantAdminService.deleteDepartment(deptId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      case "CREATE_STAFF": {
        const staff = await tenantAdminService.createStaffMember(institutionId, payload);
        await storageAdapter.logAuditEvent({
          institution_id: institutionId,
          actor_id: "admin-user",
          actor_name: "مدير المؤسسة",
          actor_role: "ADMIN",
          action: "INVITE_STAFF",
          entity_type: "STAFF",
          entity_id: staff.id,
          after_state: staff,
        });
        return NextResponse.json({ success: true, data: staff });
      }

      case "UPDATE_STAFF": {
        const { staffId, updates } = payload;
        const staff = await tenantAdminService.updateStaffMember(staffId, updates);
        return NextResponse.json({ success: true, data: staff });
      }

      case "DELETE_STAFF": {
        const { staffId } = payload;
        const deleted = await tenantAdminService.deleteStaffMember(staffId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      case "SAVE_CUSTOM_FIELD": {
        const field = await storageAdapter.saveCustomField(institutionId, payload);
        await storageAdapter.logAuditEvent({
          institution_id: institutionId,
          actor_id: "admin-user",
          actor_name: "مدير المؤسسة",
          actor_role: "ADMIN",
          action: "SAVE_CUSTOM_FIELD",
          entity_type: "CUSTOM_FIELD",
          entity_id: field.id,
          after_state: field,
        });
        return NextResponse.json({ success: true, data: field });
      }

      case "DELETE_CUSTOM_FIELD": {
        const { fieldId } = payload;
        const deleted = await storageAdapter.deleteCustomField(institutionId, fieldId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      case "SAVE_WORKFLOW": {
        const rule = await storageAdapter.saveWorkflowRule(institutionId, payload);
        await storageAdapter.logAuditEvent({
          institution_id: institutionId,
          actor_id: "admin-user",
          actor_name: "مدير المؤسسة",
          actor_role: "ADMIN",
          action: "SAVE_WORKFLOW_RULE",
          entity_type: "WORKFLOW",
          entity_id: rule.id,
          after_state: rule,
        });
        return NextResponse.json({ success: true, data: rule });
      }

      case "DELETE_WORKFLOW": {
        const { ruleId } = payload;
        const deleted = await storageAdapter.deleteWorkflowRule(institutionId, ruleId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      case "SAVE_WEBHOOK": {
        const webhook = await storageAdapter.saveWebhook(institutionId, payload);
        return NextResponse.json({ success: true, data: webhook });
      }

      case "DELETE_WEBHOOK": {
        const { webhookId } = payload;
        const deleted = await storageAdapter.deleteWebhook(institutionId, webhookId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      case "TRIGGER_TEST_WEBHOOK": {
        const { webhookId, event } = payload;
        const log = await storageAdapter.recordWebhookDelivery({
          subscription_id: webhookId,
          event: event || "case.created",
          payload: {
            event: event || "case.created",
            case_id: "test-" + Date.now(),
            reference_number: "MRF-TEST-001",
            timestamp: new Date().toISOString(),
          },
          status_code: 200,
          response_body: JSON.stringify({ received: true, status: "OK" }),
          retry_count: 0,
        });
        return NextResponse.json({ success: true, data: log });
      }

      case "SAVE_CASE_TEMPLATE": {
        const template = await storageAdapter.saveCaseTemplate(institutionId, payload);
        return NextResponse.json({ success: true, data: template });
      }

      case "SAVE_BRANCH": {
        const branch = await storageAdapter.saveBranch(institutionId, payload);
        return NextResponse.json({ success: true, data: branch });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[API /institution/admin] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process admin request" },
      { status: 500 }
    );
  }
}
