import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/middleware/auth";
import { storageAdapter } from "@/lib/services/storage-adapter";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.success) return auth.response;

  const { institutionId } = auth.context;

  const departments = await storageAdapter.getDepartments(institutionId);
  const cases = await storageAdapter.listCases({ institutionId });

  const data = departments.map((d) => {
    const deptCases = cases.filter((c) => c.assigned_department_id === d.id);
    const activeCasesCount = deptCases.filter(
      (c) => c.lifecycle_status !== "CLOSED" && c.lifecycle_status !== "ARCHIVED"
    ).length;

    return {
      id: d.id,
      code: d.code,
      nameAr: d.name_ar,
      nameEn: d.name_en,
      defaultSlaHours: d.default_sla_hours,
      isActive: d.is_active,
      activeCasesCount,
    };
  });

  return NextResponse.json({
    success: true,
    data,
  });
}
