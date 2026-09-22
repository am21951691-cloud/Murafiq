import { NextRequest, NextResponse } from "next/server";
import { computeExecutiveMetrics } from "@/lib/services/analytics";
import type { SectorType } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institution_id") || undefined;
    const sector = (searchParams.get("sector") as SectorType) || undefined;

    const metrics = await computeExecutiveMetrics(institutionId, sector);
    return NextResponse.json({
      success: true,
      metrics,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to compute executive metrics" },
      { status: 500 }
    );
  }
}
