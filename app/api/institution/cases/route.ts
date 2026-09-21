import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { SectorType } from "@/types/database";

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

    // Default multi-sector sample cases representing all 5 Egyptian sectors
    const now = Date.now();
    const allSampleCases = [
      // 1. Pre-University Schools
      {
        id: "11111111-1111-1111-1111-111111111111",
        reference_number: "MRF-2026-48219",
        institution_id: "00000000-0000-0000-0000-000000000010",
        institution_name: "مدرسة القاهرة التجريبية الرسمية للغات",
        sector: "EDUCATION_SCHOOLS" as SectorType,
        category: "TEACHER_COMMUNICATION",
        subcategory: "التواصل الأسبوعي مع أولياء الأمور",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر غير مبرر في الرد على استفسارات درجات منتصف العام الدراسي لأكثر من أسبوعين.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 5 * 86400000).toISOString(),
        created_at: new Date(now - 2 * 86400000).toISOString(),
        metadata: { display_token: "STU-***412" },
      },
      {
        id: "22222222-2222-2222-2222-222222222222",
        reference_number: "MRF-2026-89143",
        institution_id: "00000000-0000-0000-0000-000000000010",
        institution_name: "مدرسة القاهرة التجريبية الرسمية للغات",
        sector: "EDUCATION_SCHOOLS" as SectorType,
        category: "TRANSPORTATION_BUSES",
        subcategory: "مواعيد حافلات التوصيل",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تكرار تأخر حافلة خط التجمع الأول لمدة تتجاوز 40 دقيقة يومياً مما يعطل الطلاب.",
        initial_experience_rating: 1,
        grace_expires_at: new Date(now + 1.5 * 86400000).toISOString(),
        created_at: new Date(now - 5.5 * 86400000).toISOString(),
        metadata: { display_token: "BUS-***892" },
      },

      // 2. Higher Education & Universities
      {
        id: "33333333-3333-3333-3333-333333333333",
        reference_number: "MRF-2026-31045",
        institution_id: "uni-cairo-001",
        institution_name: "جامعة القاهرة (Cairo University)",
        sector: "HIGHER_EDUCATION" as SectorType,
        category: "ACADEMIC_CURRICULUM",
        subcategory: "معادلة الساعات المعتمدة والتسجيل الأكاديمي",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تعطل تسجيل المقررات للفصل الدراسي الثاني بسبب تأخر قسم شؤون الطلاب في إدراج مقرر المتطلب السابق المعادل بلائحة الساعات المعتمدة لكلية الهندسة وفق قانون 49 لسنة 1972.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 4 * 86400000).toISOString(),
        created_at: new Date(now - 3 * 86400000).toISOString(),
        metadata: { display_token: "ENG-***812" },
      },
      {
        id: "44444444-4444-4444-4444-444444444444",
        reference_number: "MRF-2026-62184",
        institution_id: "uni-cairo-001",
        institution_name: "جامعة القاهرة (Cairo University)",
        sector: "HIGHER_EDUCATION" as SectorType,
        category: "ADMINISTRATION_DISCIPLINE",
        subcategory: "استخراج الشهادات والوثائق الأكاديمية الرسمية",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر تسليم بيان الدرجات المعتمد باللغة الإنجليزية والموجه للبعثات والمنح الخارجية لأكثر من 18 يوم عمل دون إبداء سبب إداري واضح.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 1.8 * 86400000).toISOString(),
        created_at: new Date(now - 5.2 * 86400000).toISOString(),
        metadata: { display_token: "REQ-***504" },
      },

      // 3. Government & Public Services
      {
        id: "55555555-5555-5555-5555-555555555555",
        reference_number: "MRF-2026-77312",
        institution_id: "gov-post-001",
        institution_name: "الهيئة القومية للبريد - منطقة بريد القاهرة",
        sector: "GOVERNMENT_PUBLIC" as SectorType,
        category: "FACILITIES_HEALTH_SAFETY",
        subcategory: "التزام مواعيد تسليم الخطابات والشحنات المسجلة (SLA)",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر تسليم طرد حكومي مسجل بعلم الوصول صادر من مكتب بريد الأهرام وموجه لمنطقة مدينة نصر لمدة 9 أيام دون تحديث رمز التتبع في البوابة الإلكترونية.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 3 * 86400000).toISOString(),
        created_at: new Date(now - 4 * 86400000).toISOString(),
        metadata: { display_token: "POST-***214" },
      },
      {
        id: "66666666-6666-6666-6666-666666666666",
        reference_number: "MRF-2026-90421",
        institution_id: "gov-post-001",
        institution_name: "الهيئة القومية للبريد - منطقة بريد القاهرة",
        sector: "GOVERNMENT_PUBLIC" as SectorType,
        category: "ADMINISTRATION_DISCIPLINE",
        subcategory: "إجراءات إيداع وصرف المعاشات البريدية",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تعطل ماكينة الصرف الرئيسية وتكدس المواطنين وكبار السن بالمكتب دون توفير شباك طوارئ بديل لتسيير المعاملات في المواعيد الرسمية.",
        initial_experience_rating: 1,
        grace_expires_at: new Date(now + 1.1 * 86400000).toISOString(),
        created_at: new Date(now - 5.9 * 86400000).toISOString(),
        metadata: { display_token: "TKT-***991" },
      },

      // 4. Commercial Companies & Telecom
      {
        id: "77777777-7777-7777-7777-777777777777",
        reference_number: "MRF-2026-14892",
        institution_id: "com-vodafone-001",
        institution_name: "شركة فودافون مصر للاتصالات (Vodafone Egypt)",
        sector: "COMMERCIAL_COMPANIES" as SectorType,
        category: "FACILITIES_HEALTH_SAFETY",
        subcategory: "جودة خدمة الإنترنت المنزلي VDSL والفايبر",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "انقطاع متكرر لخدمة الإنترنت المنزلي فايبر لأكثر من 5 أيام بمنطقة المعادي مع عدم التزام فريق الصيانة بالحضور في الموعد المحدد المسبق.",
        initial_experience_rating: 1,
        grace_expires_at: new Date(now + 1.4 * 86400000).toISOString(),
        created_at: new Date(now - 5.6 * 86400000).toISOString(),
        metadata: { display_token: "DSL-***771" },
      },
      {
        id: "88888888-8888-8888-8888-888888888888",
        reference_number: "MRF-2026-58201",
        institution_id: "com-vodafone-001",
        institution_name: "شركة فودافون مصر للاتصالات (Vodafone Egypt)",
        sector: "COMMERCIAL_COMPANIES" as SectorType,
        category: "TUITION_FEES_REFUNDS",
        subcategory: "حقوق الاسترجاع واسترداد مبالغ التأمين التعاقدية",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر استرداد مبلغ تأمين جهاز الراوتر بعد تسليم الجهاز رسمياً وإتمام المخالصة التعاقدية بالمخالفة لمهلة الـ 14 يوماً بقانون حماية المستهلك رقم 181 لسنة 2018.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 5 * 86400000).toISOString(),
        created_at: new Date(now - 2 * 86400000).toISOString(),
        metadata: { display_token: "INV-***819" },
      },

      // 5. Healthcare & Medical Facilities
      {
        id: "99999999-9999-9999-9999-999999999999",
        reference_number: "MRF-2026-95104",
        institution_id: "med-salam-001",
        institution_name: "مستشفى السلام الدولي بالمعادي",
        sector: "HEALTHCARE_MEDICAL" as SectorType,
        category: "FACILITIES_HEALTH_SAFETY",
        subcategory: "أولويات قسم الطوارئ والتسكين السريع",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر إدخال حالة طارئة متوسطة الخطورة لقسم الملاحظة لأكثر من 90 دقيقة دون تقديم إفادة طبية واضحة للمرافقين وفق معايير الهيئة العامة للاعتماد (GAHAR).",
        initial_experience_rating: 1,
        grace_expires_at: new Date(now + 1.2 * 86400000).toISOString(),
        created_at: new Date(now - 5.8 * 86400000).toISOString(),
        metadata: { display_token: "MRN-***412" },
      },
      {
        id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
        reference_number: "MRF-2026-42938",
        institution_id: "med-salam-001",
        institution_name: "مستشفى السلام الدولي بالمعادي",
        sector: "HEALTHCARE_MEDICAL" as SectorType,
        category: "ADMINISTRATION_DISCIPLINE",
        subcategory: "إجراءات الموافقات التأمينية والمطالبات",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "تأخر التنسيق مع شركة التأمين الطبي لاعتماد الفحوصات الإشعاعية المتقدمة قبل موعد التدخل الجراحي بـ 48 ساعة مما سبب إلغاء الموعد المحدد.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 4 * 86400000).toISOString(),
        created_at: new Date(now - 3 * 86400000).toISOString(),
        metadata: { display_token: "POL-***882" },
      },

      // 6. Custom / Manually Added Entities
      {
        id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
        reference_number: "MRF-2026-11849",
        institution_id: "OTHER",
        institution_name: "مدرسة النصر للبنات بالشاطبي (جهة مضافة يدوياً - الإسكندرية)",
        sector: "EDUCATION_SCHOOLS" as SectorType,
        category: "TEACHER_COMMUNICATION",
        subcategory: "تواصل الإدارة مع أولياء الأمور",
        lifecycle_status: "PRIVATE_GRACE",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "طلب مراجعة مواعيد تسليم الكتب الدراسية والشهادات لطلاب الصف الأول الثانوي بعد تعذر التواصل الهاتفي مع إدارة الفرع.",
        initial_experience_rating: 2,
        grace_expires_at: new Date(now + 4.5 * 86400000).toISOString(),
        created_at: new Date(now - 2.5 * 86400000).toISOString(),
        metadata: { display_token: "STU-***291", custom_entity_name: "مدرسة النصر للبنات بالشاطبي", is_custom_entity: true },
      },
    ];

    // Filter by institution if specified and not "ALL"
    let filtered = allSampleCases;
    if (institutionId && institutionId !== "ALL") {
      filtered = filtered.filter(
        (c) =>
          c.institution_id === institutionId ||
          (institutionId === "OTHER" && (c.institution_id === "OTHER" || (c.metadata as any)?.is_custom_entity)) ||
          (institutionId === "00000000-0000-0000-0000-000000000010" &&
            c.sector === "EDUCATION_SCHOOLS")
      );
    }

    // Filter by sector if provided
    if (sectorParam) {
      filtered = filtered.filter((c) => c.sector === sectorParam);
    }

    // Compute remaining grace time in hours and days
    const enriched = filtered.map((c) => {
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
