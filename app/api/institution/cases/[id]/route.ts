import { NextRequest, NextResponse } from "next/server";
import { storageAdapter } from "@/lib/services/storage-adapter";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Case ID required" }, { status: 400 });
    }

    const caseItem = await storageAdapter.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const [actionPlan, events, notes, departments] = await Promise.all([
      storageAdapter.getActionPlanByCaseId(id),
      storageAdapter.getCaseEvents(id),
      storageAdapter.getInternalNotes(id),
      storageAdapter.getDepartments(caseItem.institution_id, caseItem.sector),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        case: caseItem,
        actionPlan,
        events,
        notes,
        departments,
      },
    });
  } catch (err: any) {
    console.error("[API /institution/cases/:id] GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load case details" },
      { status: 500 }
    );
  }
}
