import { NextRequest, NextResponse } from "next/server";
import { storageAdapter } from "@/lib/services/storage-adapter";
import type { ReportAuditMatrixItem } from "@/lib/pdf/template";

/**
 * GET /api/cases/[id]/matrix
 * Retrieves the current 8-column audit & action matrix items for the specified case.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    const caseItem = await storageAdapter.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const actionPlan = await storageAdapter.getActionPlanByCaseId(id);
    const customItems: ReportAuditMatrixItem[] | undefined = (caseItem.metadata as any)?.audit_items;

    if (customItems && Array.isArray(customItems) && customItems.length > 0) {
      return NextResponse.json({
        success: true,
        source: "custom",
        items: customItems,
      });
    }

    // Generate standard default items from action plan milestones or intake data
    const milestones = actionPlan?.milestones || [];
    const defaultItems: ReportAuditMatrixItem[] = milestones.length > 0
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
          statement: actionPlan?.official_statement || "تم استكمال الإجراء المعتمد",
          targetDate: m.due_date,
        }))
      : [
          {
            seq: 15,
            item: "إعلام",
            observation: "هناك فيديو تم نشره على جروب فريق عمل المنشأة به خطأ لغوي ومن المتوقع أن يكون قد تم نشره على جروبات أولياء الأمور.",
            recommendation: "مراجعة أي مادة إعلامية قبل نشرها.",
            isRecurring: "لا",
            actionSteps: "تكليف أخصائية الإعلام بإرسال الفيديوهات والمنشورات الإعلامية لمعلمي اللغة العربية للاطلاع قبل النشر وتكليف وكيل المنشأة بالمتابعة.",
            statement: "تم إخطار المعنيين واعتماد آلية التدقيق قبل النشر.",
            targetDate: "2026/09/25",
          },
          {
            seq: 16,
            item: "أخصائي نفسي",
            observation: "طلب مدير المنشأة من الأخصائي النفسي إعداد خطة للندوات والمحاضرات على مدار العام وخلال العام الدراسي 2026/2027.",
            recommendation: "اعتماد خطة العمل التفصيلية السنوية.",
            isRecurring: "لا",
            actionSteps: "تكليف الأخصائي النفسي بتقديم خطة تفصيلية لعام 2026/2027 وتقديم تقرير أسبوعي عن ما تم من أعمال لمدير المنشأة.",
            statement: "جاري إعداد الخطة بالتنسيق مع التوجيه الفني المختص.",
            targetDate: "2026/09/28",
          },
          {
            seq: 17,
            item: "أخصائي اجتماعي",
            observation: "طلب خطة الندوات والمحاضرات الخاصة بالأخصائي الاجتماعي للعام الدراسي 2026/2027.",
            recommendation: "إعداد خطة الرعاية الاجتماعية وبرامج الدمج.",
            isRecurring: "لا",
            actionSteps: "تكليف الأخصائي الاجتماعي بتقديم خطة تفصيلية وتقديم تقرير دوري للإدارة.",
            statement: "تم تسليم مسودة الخطة للمراجعة الإدارية.",
            targetDate: "2026/09/30",
          },
        ];

    return NextResponse.json({
      success: true,
      source: "generated",
      items: defaultItems,
    });
  } catch (err: any) {
    console.error("[API /cases/:id/matrix] GET error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * PUT /api/cases/[id]/matrix
 * Updates and saves the 8-column audit & action matrix items in the case metadata.
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ success: false, error: "Case ID is required" }, { status: 400 });
    }

    const caseItem = await storageAdapter.getCaseById(id);
    if (!caseItem) {
      return NextResponse.json({ success: false, error: "Case not found" }, { status: 404 });
    }

    const body = await request.json();
    const items: ReportAuditMatrixItem[] = body.items;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: "Items must be an array of matrix rows" },
        { status: 400 }
      );
    }

    // Clean & validate items
    const sanitizedItems: ReportAuditMatrixItem[] = items.map((item, idx) => ({
      seq: item.seq || idx + 15,
      item: String(item.item || "عام").trim(),
      observation: String(item.observation || "").trim(),
      recommendation: String(item.recommendation || "").trim(),
      isRecurring: item.isRecurring === "نعم" ? "نعم" : "لا",
      actionSteps: String(item.actionSteps || "").trim(),
      statement: String(item.statement || "").trim(),
      targetDate: String(item.targetDate || "").trim(),
    }));

    // Update case metadata
    const updatedMetadata = {
      ...(caseItem.metadata || {}),
      audit_items: sanitizedItems,
      audit_items_updated_at: new Date().toISOString(),
    };

    const updatedCase = await storageAdapter.saveCase({
      ...caseItem,
      metadata: updatedMetadata,
      updated_at: new Date().toISOString(),
    });

    // Record audit entry
    await storageAdapter.logAudit({
      institution_id: caseItem.institution_id || "00000000-0000-0000-0000-000000000010",
      actor_id: "00000000-0000-0000-0000-000000000001",
      actor_name: "مدير النظام",
      actor_role: "ADMIN",
      action: "CASE_AUDIT_MATRIX_UPDATED",
      entity_type: "CASE",
      entity_id: id,
      before_state: { count: (caseItem.metadata as any)?.audit_items?.length || 0 },
      after_state: { count: sanitizedItems.length },
    });

    return NextResponse.json({
      success: true,
      case: updatedCase,
      items: sanitizedItems,
    });
  } catch (err: any) {
    console.error("[API /cases/:id/matrix] PUT error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
