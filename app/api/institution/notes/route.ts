import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { storageAdapter } from "@/lib/services/storage-adapter";

const AddNoteSchema = z.object({
  case_id: z.string().uuid("Invalid case ID"),
  institution_id: z.string().min(1, "Institution ID is required"),
  author_id: z.string().optional().default("staff-current-user"),
  author_name: z.string().min(2, "Author name must be at least 2 characters"),
  author_role: z.string().min(2, "Author role is required"),
  note_text: z.string().min(3, "Note must be at least 3 characters").max(2000),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get("case_id");

    if (!caseId) {
      return NextResponse.json(
        { success: false, error: "case_id query parameter is required" },
        { status: 400 }
      );
    }

    const notes = await storageAdapter.getInternalNotes(caseId);
    return NextResponse.json({
      success: true,
      notes,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch internal notes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validated = AddNoteSchema.parse(json);

    const createdNote = await storageAdapter.addInternalNote({
      case_id: validated.case_id,
      institution_id: validated.institution_id,
      author_id: validated.author_id,
      author_name: validated.author_name,
      author_role: validated.author_role,
      note_text: validated.note_text,
    });

    return NextResponse.json(
      {
        success: true,
        note: createdNote,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: error.message || "Failed to save internal note" },
      { status: 500 }
    );
  }
}
