import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { generateReportPdf } from "@/trigger/tasks/generateReportPdf";
import { sendWhatsAppResolutionReport } from "@/trigger/tasks/sendWhatsAppReport";

const ResolveCaseSchema = z.object({
  officialStatement: z.string().min(5, "Official statement must be at least 5 characters"),
  recipientPhone: z.string().optional(),
  markClosed: z.boolean().optional().default(false),
  resolvedBy: z.string().optional().default("فريق تسوية الحالات"),
});

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Case ID required" }, { status: 400 });
    }

    const body = await request.json();
    const validated = ResolveCaseSchema.parse(body);

    const caseItem = await storageAdapter.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const now = new Date().toISOString();
    const targetStatus = validated.markClosed ? "CLOSED" : "AWAITING_EVALUATION";

    // 1. Update / Create Action Plan with Official Statement
    let actionPlan = await storageAdapter.getActionPlanByCaseId(id);
    if (actionPlan) {
      actionPlan.official_statement = validated.officialStatement;
      actionPlan.updated_at = now;
      await storageAdapter.saveActionPlan(
        {
          id: actionPlan.id,
          case_id: id,
          submitted_by: actionPlan.submitted_by || "00000000-0000-0000-0000-000000000002",
          official_statement: validated.officialStatement,
          rqs_score: actionPlan.rqs_score || 92,
          rqs_breakdown: actionPlan.rqs_breakdown || {},
          created_at: actionPlan.created_at,
          updated_at: now,
        },
        actionPlan.milestones || []
      );
    } else {
      await storageAdapter.saveActionPlan(
        {
          id: crypto.randomUUID(),
          case_id: id,
          submitted_by: "00000000-0000-0000-0000-000000000002",
          official_statement: validated.officialStatement,
          rqs_score: 90,
          rqs_breakdown: { clarity: 95, timeliness: 88, adherence: 90 },
          created_at: now,
          updated_at: now,
        },
        [
          {
            id: crypto.randomUUID(),
            title: "فحص أسباب الحالة وتطبيق الإجراءات التصحيحية المعتمدة",
            owner_role: "OPS_LEAD",
            due_date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            is_completed: true,
            deliverable: "محضر التسوية وتطبيق اللائحة",
          },
        ]
      );
      actionPlan = await storageAdapter.getActionPlanByCaseId(id);
    }

    // 2. Set Case Lifecycle to Target Status (AWAITING_EVALUATION or CLOSED)
    await storageAdapter.updateCaseLifecycle(id, targetStatus as any, {
      actorId: "00000000-0000-0000-0000-000000000002",
      actorRole: "OPS_LEAD",
      eventType: "CASE_RESOLVED_BY_INSTITUTION",
      payload: {
        official_statement: validated.officialStatement,
        resolved_by: validated.resolvedBy,
        resolved_at: now,
      },
    });

    // 3. Automated Report PDF Generation
    const pdfResult = await generateReportPdf({
      caseId: id,
      version: 1,
      mockCaseData: {
        referenceNumber: caseItem.reference_number,
        institutionName: caseItem.institution_name,
        category: caseItem.category,
        sanitizedSummary: caseItem.sanitized_description,
        desiredOutcome: (caseItem.metadata as any)?.desired_outcome,
        officialStatement: validated.officialStatement,
        rqsScore: actionPlan?.rqs_score ?? 90,
      },
    });

    // 4. Automated WhatsApp Dispatch to User
    const targetPhone = validated.recipientPhone || (await storageAdapter.getCaseRecipientPhone(id));
    const whatsappResult = await sendWhatsAppResolutionReport({
      caseId: id,
      version: 1,
      recipientPhone: targetPhone,
      parentName: "المستفيد الكريم",
      institutionName: caseItem.institution_name || "مُرافِق Enterprise",
      caseReference: caseItem.reference_number,
    });

    // 5. Emit Audit Log Entry
    await storageAdapter.logAudit({
      institution_id: caseItem.institution_id,
      actor_id: "00000000-0000-0000-0000-000000000002",
      actor_name: validated.resolvedBy,
      actor_role: "OPS_LEAD",
      action: "RESOLVE_CASE_AND_DISPATCH_WHATSAPP",
      entity_type: "CASE",
      entity_id: id,
      before_state: { lifecycle_status: caseItem.lifecycle_status },
      after_state: {
        lifecycle_status: targetStatus,
        whatsapp_message_id: whatsappResult.providerMessageId,
        sha256_digest: pdfResult.sha256Digest,
      },
    });

    return NextResponse.json({
      success: true,
      caseId: id,
      referenceNumber: caseItem.reference_number,
      lifecycle_status: targetStatus,
      officialStatement: validated.officialStatement,
      pdfGenerated: true,
      sha256Digest: pdfResult.sha256Digest,
      whatsappDispatched: true,
      whatsappMessageId: whatsappResult.providerMessageId,
      recipientPhone: targetPhone,
      signedDownloadUrl: whatsappResult.signedUrl,
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: err.errors },
        { status: 400 }
      );
    }
    console.error("[API /cases/:id/resolve] Error resolving case:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to resolve case and dispatch automation" },
      { status: 500 }
    );
  }
}
