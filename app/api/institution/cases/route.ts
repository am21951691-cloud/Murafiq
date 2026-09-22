import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SectorType } from "@/types/database";

import { storageAdapter } from "@/lib/services/storage-adapter";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institution_id") || "ALL";
    const sectorParam = searchParams.get("sector") as SectorType | null;

    let currentUserId = "00000000-0000-0000-0000-000000000002";
    let userRole = "OPS_LEAD";

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        currentUserId = user.id;

        if (institutionId !== "ALL") {
          const { data: member } = await supabase
            .from("institution_members")
            .select("role")
            .eq("user_id", user.id)
            .eq("institution_id", institutionId)
            .single();

          if (!member) {
            return NextResponse.json(
              { success: false, error: "Access denied: Not a member of this institution." },
              { status: 403 }
            );
          }
          userRole = member.role;
        }
      }
    } catch {
      // Standalone/mock fallback
    }

    // Server-side Role Check: OBSERVER cannot see PRIVATE_GRACE triage cases!
    if (userRole === "OBSERVER") {
      return NextResponse.json(
        {
          success: true,
          cases: [],
          role: userRole,
          message: "Observer role does not have permission to view active triage cases in private grace.",
        }
      );
    }

    // Retrieve live stored cases (seeded benchmarks + dynamically submitted cases)
    const storedCases = await storageAdapter.listCases({
      institutionId: institutionId !== "ALL" ? institutionId : undefined,
      sector: sectorParam || undefined,
    });

    return NextResponse.json({
      success: true,
      cases: storedCases,
      role: userRole,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch triage cases" },
      { status: 500 }
    );
  }
}
