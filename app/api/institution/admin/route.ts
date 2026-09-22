import { NextResponse } from "next/server";
import { tenantAdminService } from "@/lib/services/tenant-admin";
import type { SectorType } from "@/types/database";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institutionId") || "11111111-1111-1111-1111-111111111111";
    const sector = (searchParams.get("sector") as SectorType) || "EDUCATION_SCHOOLS";

    const overview = await tenantAdminService.getTenantOverview(institutionId, sector);
    const sectorInfo = tenantAdminService.getSectorCategories(sector);

    return NextResponse.json({
      success: true,
      data: {
        ...overview,
        sectorInfo,
      },
    });
  } catch (error: any) {
    console.error("[API /institution/admin] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load tenant admin data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, institutionId = "11111111-1111-1111-1111-111111111111", payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "UPDATE_BRANDING": {
        const branding = await tenantAdminService.updateBranding(institutionId, payload);
        return NextResponse.json({ success: true, data: branding });
      }

      case "UPDATE_SLA": {
        const sla = await tenantAdminService.updateSlaConfig(institutionId, payload);
        return NextResponse.json({ success: true, data: sla });
      }

      case "CREATE_DEPARTMENT": {
        const department = await tenantAdminService.createDepartment(institutionId, payload);
        return NextResponse.json({ success: true, data: department });
      }

      case "UPDATE_DEPARTMENT": {
        const { deptId, updates } = payload;
        const department = await tenantAdminService.updateDepartment(deptId, updates);
        return NextResponse.json({ success: true, data: department });
      }

      case "DELETE_DEPARTMENT": {
        const { deptId } = payload;
        const deleted = await tenantAdminService.deleteDepartment(deptId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      case "CREATE_STAFF": {
        const staff = await tenantAdminService.createStaffMember(institutionId, payload);
        return NextResponse.json({ success: true, data: staff });
      }

      case "UPDATE_STAFF": {
        const { staffId, updates } = payload;
        const staff = await tenantAdminService.updateStaffMember(staffId, updates);
        return NextResponse.json({ success: true, data: staff });
      }

      case "DELETE_STAFF": {
        const { staffId } = payload;
        const deleted = await tenantAdminService.deleteStaffMember(staffId);
        return NextResponse.json({ success: true, data: { deleted } });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[API /institution/admin] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process admin request" },
      { status: 500 }
    );
  }
}
