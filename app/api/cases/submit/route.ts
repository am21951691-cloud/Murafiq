import { NextRequest, NextResponse } from "next/server";
import { CaseIntakeSchema, processCaseIntake } from "@/lib/services/cases";
import { createClient } from "@/lib/supabase/server";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { SAMPLE_ENTITIES } from "@/lib/services/entities";

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const validatedInput = CaseIntakeSchema.parse(json);

    // Identify user from authenticated session, fallback to deterministic anonymous UUID if not logged in
    let userId = "00000000-0000-0000-0000-000000000001";
    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }
    } catch {
      // In test context or detached runner, use standard caller ID
    }

    const forwardedFor = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const processed = processCaseIntake(validatedInput, userId, forwardedFor);

    // Derive sector and entity name for unified indexing
    const matchedEntity = SAMPLE_ENTITIES.find((e) => e.id === validatedInput.institution_id);
    const sector = matchedEntity?.sector || "EDUCATION_SCHOOLS";
    const institutionName =
      validatedInput.custom_entity_name ||
      matchedEntity?.name ||
      "جهة مسجلة";

    // Persist via unified storage adapter (dual persistence: Supabase + atomic local store)
    await storageAdapter.saveCase(
      {
        ...processed.caseRecord,
        institution_name: institutionName,
        sector,
      },
      processed.sensitiveData,
      processed.consentRecord,
      processed.eventRecord
    );

    // Gate 1 Compliance: Never return raw_description_encrypted, raw phone, or student identifiers
    return NextResponse.json(
      {
        success: true,
        case: {
          id: processed.caseRecord.id,
          reference_number: processed.caseRecord.reference_number,
          lifecycle_status: processed.caseRecord.lifecycle_status,
          visibility: processed.caseRecord.visibility,
          category: processed.caseRecord.category,
          subcategory: processed.caseRecord.subcategory,
          sanitized_description: processed.caseRecord.sanitized_description,
          initial_experience_rating: processed.caseRecord.initial_experience_rating,
          grace_expires_at: processed.caseRecord.grace_expires_at,
          custom_entity_name: (processed.caseRecord.metadata as any)?.custom_entity_name || null,
          metadata: processed.caseRecord.metadata,
          created_at: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: error.errors,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 }
    );
  }
}
