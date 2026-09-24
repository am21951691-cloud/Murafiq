import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { generateReportPdf } from "@/trigger/tasks/generateReportPdf";
import { sendWhatsAppResolutionReport } from "@/trigger/tasks/sendWhatsAppReport";

const SendWhatsAppSchema = z.object({
  phone: z.string().optional(),
  parentName: z.string().optional(),
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

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // body optional
    }
    const validated = SendWhatsAppSchema.parse(body);

    const caseItem = await storageAdapter.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const actionPlan = await storageAdapter.getActionPlanByCaseId(id);

    // 1. Ensure latest PDF report is generated
    const pdfResult = await generateReportPdf({
      caseId: id,
      version: 1,
      mockCaseData: {
        referenceNumber: caseItem.reference_number,
        institutionName: caseItem.institution_name,
        category: caseItem.category,
        sanitizedSummary: caseItem.sanitized_description,
        desiredOutcome: (caseItem.metadata as any)?.desired_outcome,
        officialStatement: actionPlan?.official_statement,
        rqsScore: actionPlan?.rqs_score,
      },
    });

    // 2. Resolve recipient phone
    const targetPhone = validated.phone || (await storageAdapter.getCaseRecipientPhone(id));

    // 3. Dispatch WhatsApp resolution report
    const dispatchResult = await sendWhatsAppResolutionReport({
      caseId: id,
      version: 1,
      recipientPhone: targetPhone,
      parentName: validated.parentName || "المستفيد الكريم",
      institutionName: caseItem.institution_name || "مُرافِق Enterprise",
      caseReference: caseItem.reference_number,
    });

    return NextResponse.json({
      success: true,
      caseId: id,
      referenceNumber: caseItem.reference_number,
      recipientPhone: targetPhone,
      providerMessageId: dispatchResult.providerMessageId,
      deliveryStatus: dispatchResult.deliveryStatus,
      signedUrl: dispatchResult.signedUrl,
      sha256Digest: pdfResult.sha256Digest,
      dispatchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error("[API /cases/:id/automation/send-whatsapp] Error dispatching WhatsApp report:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to dispatch WhatsApp report" },
      { status: 500 }
    );
  }
}
