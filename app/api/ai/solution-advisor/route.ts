import { NextRequest, NextResponse } from "next/server";
import {
  getSolutionAdvice,
  type AdvisorMode,
  type SolutionAdvisorInput,
} from "@/lib/ai/solution-advisor-service";
import { SectorType } from "@/types/database";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const mode: AdvisorMode =
      body?.mode === "INSTITUTION_ACTION_PLAN"
        ? "INSTITUTION_ACTION_PLAN"
        : "CITIZEN_OUTCOME";

    const sector: SectorType =
      body?.sector &&
      [
        "EDUCATION_SCHOOLS",
        "HIGHER_EDUCATION",
        "GOVERNMENT_PUBLIC",
        "COMMERCIAL_COMPANIES",
        "HEALTHCARE_MEDICAL",
      ].includes(body.sector)
        ? body.sector
        : "EDUCATION_SCHOOLS";

    const input: SolutionAdvisorInput = {
      mode,
      sector,
      category: String(body?.category || "GENERAL"),
      subcategory: body?.subcategory ? String(body.subcategory) : undefined,
      description: String(body?.description || ""),
      entityName: body?.entityName ? String(body.entityName) : undefined,
      caseReference: body?.caseReference ? String(body.caseReference) : undefined,
      locale: body?.locale === "en" ? "en" : "ar",
    };

    if (!input.description && mode === "CITIZEN_OUTCOME") {
      return NextResponse.json(
        { error: "Description of issue is required for outcome suggestion" },
        { status: 400 }
      );
    }

    const result = await getSolutionAdvice(input);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Solution Advisor API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Solution Advisor", details: error?.message },
      { status: 500 }
    );
  }
}
