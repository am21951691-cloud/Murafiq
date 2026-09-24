import { NextRequest, NextResponse } from "next/server";
import { storageAdapter } from "@/lib/services/storage-adapter";
import type { ReportAuditMatrixItem, ReportTemplateData } from "@/lib/pdf/template";

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

    const [actionPlan, recipientPhone, dispatches] = await Promise.all([
      storageAdapter.getActionPlanByCaseId(id),
      storageAdapter.getCaseRecipientPhone(id),
      storageAdapter.getWhatsAppDispatchesByCaseId(id),
    ]);

    const now = new Date();
    const formattedDate = now.toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
    });

    const officialStatement =
      actionPlan?.official_statement ||
      "تم التعامل مع الشكوى والاتفاق على خطة العمل المشتركة لحسم الملاحظات نهائياً.";

    const milestones = actionPlan?.milestones || [];

    // Construct 8-column audit matrix rows matching user sample (prioritizing custom saved items)
    const customMatrixItems: ReportAuditMatrixItem[] | undefined = (caseItem.metadata as any)?.audit_items;
    const auditItems: ReportAuditMatrixItem[] = (customMatrixItems && customMatrixItems.length > 0)
      ? customMatrixItems
      : milestones.length > 0
      ? milestones.map((m, idx) => ({
          seq: idx + 15,
          item: m.owner_role === "OPS_LEAD"
            ? "إدارة العمليات والمتابعة"
            : m.owner_role === "COUNSELOR"
            ? "الأخصائي النفسي والتربوي"
            : m.owner_role === "MEDIA"
            ? "إعلام"
            : m.owner_role || "الإدارة المختصة",
          observation: caseItem.sanitized_description || "ملحوظة الفحص الإجرائي الميداني",
          recommendation: m.title,
          isRecurring: "لا",
          actionSteps: m.deliverable || m.title,
          statement: officialStatement,
          targetDate: m.due_date,
        }))
      : [
          {
            seq: 15,
            item: caseItem.category || "الشؤون الإدارية والتنظيمية",
            observation: caseItem.sanitized_description || "ملحوظة الحالة المبلغ عنها",
            recommendation: (caseItem.metadata as any)?.desired_outcome || "مراجعة وتوفيق الإجراءات المعتمدة",
            isRecurring: "لا",
            actionSteps: officialStatement,
            statement: officialStatement,
            targetDate: caseItem.closed_at ? new Date(caseItem.closed_at).toLocaleDateString("ar-EG") : formattedDate,
          },
        ];

    const emptyRows = [
      { seq: 19, isRecurring: "لا", statement: "-" },
      { seq: "", isRecurring: "", statement: "" },
      { seq: "", isRecurring: "", statement: "" },
    ];

    const reportData: ReportTemplateData = {
      referenceNumber: caseItem.reference_number,
      generatedDate: formattedDate,
      version: 1,
      institutionName: caseItem.institution_name || "المؤسسة التعليمية",
      branchName: "الفرع الرئيسي",
      category: caseItem.category,
      openedDate: caseItem.created_at ? new Date(caseItem.created_at).toLocaleDateString("ar-EG") : "2026/09/01",
      closedDate: formattedDate,
      sanitizedSummary: caseItem.sanitized_description,
      desiredOutcome: (caseItem.metadata as any)?.desired_outcome || "",
      officialStatement,
      rqsScore: actionPlan?.rqs_score ?? 88,
      rqsGrade: (actionPlan?.rqs_score ?? 88) >= 90 ? "EXEMPLARY" : "STANDARD",
      milestones: milestones.map((m) => ({
        title: m.title,
        ownerRole: m.owner_role,
        dueDate: m.due_date,
        isCompleted: m.is_completed,
        deliverable: m.deliverable,
      })),
      rExp: caseItem.initial_experience_rating ?? 3,
      rResp: 4,
      rRes: 5,
      closingFeedback: "تم حل المشكلة بمهنية عالية وتم استعادة ثقة المستفيد.",
      auditItems,
      emptyRows,
    };

    return NextResponse.json({
      success: true,
      case: caseItem,
      recipientPhone,
      dispatches,
      reportData,
    });
  } catch (err: any) {
    console.error("[API /cases/:id/report/preview] Error loading preview:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to load report preview" },
      { status: 500 }
    );
  }
}
