import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/middleware/auth";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { generateReferenceNumber } from "@/lib/utils";
import type { CasePriority, LifecycleStatus } from "@/types/database";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.success) return auth.response;

  const { institutionId } = auth.context;
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status") as LifecycleStatus | null;
  const priority = searchParams.get("priority") as CasePriority | null;
  const departmentId = searchParams.get("departmentId") || undefined;
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));

  const allCases = await storageAdapter.listCases({
    institutionId,
    lifecycleStatus: status || undefined,
    priority: priority || undefined,
    departmentId,
  });

  const total = allCases.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const paginatedCases = allCases.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    success: true,
    data: paginatedCases.map((c) => ({
      id: c.id,
      referenceNumber: c.reference_number,
      title: c.category + " - " + (c.subcategory || "عام"),
      priority: c.priority || "MEDIUM",
      lifecycleStatus: c.lifecycle_status,
      departmentId: c.assigned_department_id || null,
      assignedStaffId: c.assigned_staff_id || null,
      slaTargetAt: c.sla_target_at || null,
      createdAt: c.created_at,
    })),
    pagination: {
      total,
      page,
      limit,
      totalPages,
    },
  });
}

export async function POST(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.success) return auth.response;

  const { institutionId } = auth.context;

  try {
    const json = await request.json();
    const {
      title,
      description,
      category = "ADMINISTRATION_DISCIPLINE",
      subcategory = "GENERAL",
      priority = "MEDIUM",
      departmentId,
      metadata = {},
    } = json;

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: "Description must be at least 10 characters long" },
        { status: 400 }
      );
    }

    const refNumber = generateReferenceNumber("MRF");
    const caseId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newCase = await storageAdapter.saveCase(
      {
        id: caseId,
        reference_number: refNumber,
        user_id: auth.context.userId || "00000000-0000-0000-0000-000000000001",
        institution_id: institutionId,
        category,
        subcategory,
        priority,
        assigned_department_id: departmentId || null,
        lifecycle_status: "SUBMITTED",
        moderation_status: "APPROVED",
        dispute_status: "NONE",
        safety_status: "CLEAR",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: description.trim(),
        initial_experience_rating: 3,
        metadata: {
          ...metadata,
          title: title || refNumber,
          submitted_via: "API_V1",
        },
        created_at: now,
        updated_at: now,
      },
      undefined,
      undefined,
      {
        id: crypto.randomUUID(),
        case_id: caseId,
        event_type: "CASE_SUBMITTED_VIA_API",
        actor_id: auth.context.userId || "API_CLIENT",
        actor_role: auth.context.role,
        payload: { title, priority, departmentId },
        created_at: now,
      }
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          id: newCase.id,
          referenceNumber: newCase.reference_number,
          trackingUrl: `/track?ref=${newCase.reference_number}`,
          lifecycleStatus: newCase.lifecycle_status,
          createdAt: newCase.created_at,
        },
      },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("[API v1/cases] POST error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to create case via API" },
      { status: 500 }
    );
  }
}
