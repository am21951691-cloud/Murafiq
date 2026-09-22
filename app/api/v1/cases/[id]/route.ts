import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/middleware/auth";
import { storageAdapter } from "@/lib/services/storage-adapter";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateApiRequest(request);
  if (!auth.success) return auth.response;

  const { institutionId } = auth.context;
  const { id } = await context.params;

  let caseItem = await storageAdapter.getCaseById(id);
  if (!caseItem) {
    caseItem = await storageAdapter.getCaseByReference(id);
  }

  if (!caseItem) {
    return NextResponse.json(
      { success: false, error: "Case not found" },
      { status: 404 }
    );
  }

  // Tenant scoping check
  if (institutionId && caseItem.institution_id !== institutionId && auth.context.authMethod !== "ANON_DEMO") {
    return NextResponse.json(
      { success: false, error: "Unauthorized access to another tenant's case" },
      { status: 403 }
    );
  }

  const [actionPlan, events] = await Promise.all([
    storageAdapter.getActionPlanByCaseId(caseItem.id),
    storageAdapter.getCaseEvents(caseItem.id),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      id: caseItem.id,
      referenceNumber: caseItem.reference_number,
      title: caseItem.category + " - " + (caseItem.subcategory || "عام"),
      description: caseItem.sanitized_description,
      priority: caseItem.priority || "MEDIUM",
      lifecycleStatus: caseItem.lifecycle_status,
      departmentId: caseItem.assigned_department_id || null,
      assignedStaffId: caseItem.assigned_staff_id || null,
      slaTargetAt: caseItem.sla_target_at || null,
      actionPlan: actionPlan
        ? {
            id: actionPlan.id,
            rqsScore: actionPlan.rqs_score,
            officialStatement: actionPlan.official_statement,
            milestones: actionPlan.milestones.map((m: any) => ({
              id: m.id,
              title: m.title,
              ownerRole: m.owner_role,
              dueDate: m.due_date,
              deliverable: m.deliverable,
              isCompleted: m.is_completed,
              completedAt: m.completed_at,
            })),
          }
        : null,
      auditEvents: events.map((e) => ({
        id: e.id,
        eventType: e.event_type,
        actorRole: e.actor_role,
        timestamp: e.created_at,
      })),
      createdAt: caseItem.created_at,
      updatedAt: caseItem.updated_at,
    },
  });
}
