import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { CasePriorityEnum } from "@/types/database";

const AssignCaseSchema = z.object({
  case_id: z.string().uuid("Invalid case ID"),
  department_id: z.string().optional(),
  staff_id: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
  sla_target_hours: z.number().int().min(1).max(720).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = AssignCaseSchema.parse(json);

    const updatedCase = await storageAdapter.assignCase(validated.case_id, {
      departmentId: validated.department_id,
      staffId: validated.staff_id,
      priority: validated.priority,
      slaTargetHours: validated.sla_target_hours,
    });

    if (!updatedCase) {
      return NextResponse.json(
        { success: false, error: "Case not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      case: updatedCase,
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to assign case" },
      { status: 500 }
    );
  }
}
