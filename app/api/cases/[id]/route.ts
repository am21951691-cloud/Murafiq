import { NextRequest, NextResponse } from "next/server";
import { storageAdapter } from "@/lib/services/storage-adapter";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Case ID or Reference Number is required" },
        { status: 400 }
      );
    }

    const cleanId = decodeURIComponent(id).trim();

    // Look up case by ID or Reference Number
    let caseItem = await storageAdapter.getCaseById(cleanId);
    if (!caseItem) {
      caseItem = await storageAdapter.getCaseByReference(cleanId);
    }

    if (!caseItem) {
      return NextResponse.json(
        { success: false, error: "لم يتم العثور على الحالة بالرقم المرجعي المحدد" },
        { status: 404 }
      );
    }

    // Retrieve related action plan, milestones, evaluation, and event timeline
    const actionPlan = await storageAdapter.getActionPlanByCaseId(caseItem.id);
    const evaluation = await storageAdapter.getEvaluationByCaseId(caseItem.id);
    const events = await storageAdapter.getCaseEvents(caseItem.id);

    // Compute remaining grace time
    const now = Date.now();
    const expiryTimestamp = caseItem.grace_expires_at
      ? new Date(caseItem.grace_expires_at).getTime()
      : now;
    const msLeft = expiryTimestamp - now;
    const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    const hoursLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));
    const isUrgent = daysLeft <= 2 && caseItem.lifecycle_status === "PRIVATE_GRACE";

    // Gate 1 Compliance: Strip any internal sensitive fields
    const safeCase = {
      id: caseItem.id,
      reference_number: caseItem.reference_number,
      institution_id: caseItem.institution_id,
      institution_name: caseItem.institution_name || "جهة مسجلة",
      sector: caseItem.sector,
      category: caseItem.category,
      subcategory: caseItem.subcategory,
      lifecycle_status: caseItem.lifecycle_status,
      visibility: caseItem.visibility,
      sanitized_description: caseItem.sanitized_description,
      initial_experience_rating: caseItem.initial_experience_rating,
      grace_expires_at: caseItem.grace_expires_at,
      remaining_days: daysLeft,
      remaining_hours: hoursLeft,
      is_urgent: isUrgent,
      metadata: caseItem.metadata,
      created_at: caseItem.created_at,
      updated_at: caseItem.updated_at,
    };

    return NextResponse.json({
      success: true,
      case: safeCase,
      action_plan: actionPlan || null,
      evaluation: evaluation || null,
      events: events.map((e) => ({
        id: e.id,
        event_type: e.event_type,
        actor_role: e.actor_role,
        created_at: e.created_at,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve case details" },
      { status: 500 }
    );
  }
}
