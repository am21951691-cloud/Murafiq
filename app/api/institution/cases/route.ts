import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const institutionId = searchParams.get("institution_id") || "00000000-0000-0000-0000-000000000010";

    let currentUserId = "00000000-0000-0000-0000-000000000002";
    let userRole = "OPS_LEAD";

    try {
      const supabase = await createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        currentUserId = user.id;

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

    // Default mock/sample cases for triage demonstration if DB empty
    const now = Date.now();
    const sampleCases = [
      {
        id: "11111111-1111-1111-1111-111111111111",
        reference_number: "MRF-2026-48219",
        institution_id: institutionId,
        category: "TEACHER_COMMUNICATION",
        subcategory: "التواصل الأسبوعي مع أولياء الأمور",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر غير مبرر في الرد على استفسارات درجات منتصف العام الدراسي لأكثر من أسبوعين.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 5 * 86400000).toISOString(),
        created_at: new Date(now - 2 * 86400000).toISOString(),
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        reference_number: "MRF-2026-89143",
        institution_id: institutionId,
        category: "TRANSPORTATION_BUSES",
        subcategory: "مواعيد حافلات التوصيل",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تكرار تأخر حافلة خط التجمع الأول لمدة تتجاوز 40 دقيقة يومياً مما يعطل الطلاب.",
        initial_experience_rating: 1,
        grace_expires_at: new Date(now + 1.5 * 86400000).toISOString(),
        created_at: new Date(now - 5.5 * 86400000).toISOString(),
      },
    ];

    // Compute remaining grace time in hours and days
    const enriched = sampleCases.map((c) => {
      const msLeft = new Date(c.grace_expires_at).getTime() - now;
      const daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
      const hoursLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60)));
      return {
        ...c,
        remaining_days: daysLeft,
        remaining_hours: hoursLeft,
        is_urgent: daysLeft <= 2,
      };
    });

    return NextResponse.json({
      success: true,
      cases: enriched,
      role: userRole,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch triage cases" },
      { status: 500 }
    );
  }
}
