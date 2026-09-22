import { NextRequest, NextResponse } from "next/server";
import { authenticateApiRequest } from "@/lib/middleware/auth";
import { computeExecutiveMetrics } from "@/lib/services/analytics";

export async function GET(request: NextRequest) {
  const auth = await authenticateApiRequest(request);
  if (!auth.success) return auth.response;

  const { institutionId } = auth.context;

  try {
    const metrics = await computeExecutiveMetrics(institutionId);

    return NextResponse.json({
      success: true,
      data: {
        totalCases: metrics.totalCases,
        openCases: metrics.openCases,
        resolvedCases: metrics.resolvedCases,
        overdueCases: metrics.overdueCases,
        slaComplianceRate: metrics.slaCompliancePercent,
        medianResponseHours: metrics.medianResponseHours,
        medianResolutionDays: metrics.medianResolutionDays,
        averageSatisfactionRating: metrics.avgResolutionRating,
        departmentMetrics: metrics.departmentMetrics,
        priorityDistribution: metrics.priorityDistribution,
        categoryDistribution: metrics.categoryDistribution,
      },
    });
  } catch (err: any) {
    console.error("[API v1/analytics] GET error:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to compute tenant analytics" },
      { status: 500 }
    );
  }
}
