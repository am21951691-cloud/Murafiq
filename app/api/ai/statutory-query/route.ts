import { NextRequest, NextResponse } from "next/server";
import { StatutoryQuerySchema } from "@/lib/services/statutory";
import { retrieveStatutoryContext } from "@/lib/ai/rag";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = StatutoryQuerySchema.parse(json);

    const result = await retrieveStatutoryContext(validated.query, {
      threshold: validated.threshold,
      limit: validated.limit,
      locale: validated.locale,
      sector: validated.sector,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (err: unknown) {
    if (err && typeof err === "object" && "issues" in err) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: err,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
