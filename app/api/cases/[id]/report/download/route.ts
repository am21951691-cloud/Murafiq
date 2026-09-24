import { NextRequest, NextResponse } from "next/server";
import { generateReportPdf } from "@/trigger/tasks/generateReportPdf";
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
    const actionPlan = await storageAdapter.getActionPlanByCaseId(id);

    const result = await generateReportPdf({
      caseId: id,
      version: 1,
      mockCaseData: {
        referenceNumber: caseItem?.reference_number,
        institutionName: caseItem?.institution_name,
        category: caseItem?.category,
        sanitizedSummary: caseItem?.sanitized_description,
        desiredOutcome: (caseItem?.metadata as any)?.desired_outcome,
        officialStatement: actionPlan?.official_statement,
        rqsScore: actionPlan?.rqs_score,
      },
    });

    const filename = `resolution_report_${caseItem?.reference_number || id}.pdf`;

    return new NextResponse(result.pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "X-Report-Digest": result.sha256Digest,
      },
    });
  } catch (err: any) {
    console.error("[API /cases/:id/report/download] Error downloading PDF:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to download PDF report" },
      { status: 500 }
    );
  }
}
