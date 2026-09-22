import { NextRequest, NextResponse } from "next/server";
import { storageAdapter } from "@/lib/services/storage-adapter";
import type { SectorType } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institution_id") || "00000000-0000-0000-0000-000000000010";
    const sector = (searchParams.get("sector") as SectorType) || "EDUCATION_SCHOOLS";

    const departments = await storageAdapter.getDepartments(institutionId, sector);
    return NextResponse.json({
      success: true,
      departments,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch departments" },
      { status: 500 }
    );
  }
}
