import { NextResponse } from "next/server";
import { storageAdapter } from "@/lib/services/storage-adapter";
import type { Institution, SectorType, SubscriptionPlanTier, SubscriptionStatus } from "@/types/database";

export async function GET() {
  try {
    const organizations = await storageAdapter.getOrganizations();
    const cases = await storageAdapter.listCases();
    const auditLogs = await storageAdapter.getAuditLogs(undefined, 100);

    const totalOrgs = organizations.length;
    const activeOrgs = organizations.filter((o) => o.status !== "SUSPENDED").length;
    const totalCases = cases.length;
    const resolvedCases = cases.filter((c) => c.lifecycle_status === "CLOSED" || c.lifecycle_status === "AWAITING_EVALUATION").length;
    const totalAiTokens = organizations.reduce((acc, o) => acc + (o.subscription?.ai_used_this_month || 0), 0);

    const platformMetrics = {
      totalOrganizations: totalOrgs,
      activeOrganizations: activeOrgs,
      totalCasesPlatformWide: totalCases,
      resolutionRatePercentage: totalCases > 0 ? Math.round((resolvedCases / totalCases) * 100) : 100,
      totalAiQuotaUsedMonthly: totalAiTokens,
      systemUptime: "99.98%",
      apiRequests24h: 142850,
      activeWorkerNodes: 8,
    };

    return NextResponse.json({
      success: true,
      data: {
        platformMetrics,
        organizations,
        auditLogs,
      },
    });
  } catch (error: any) {
    console.error("[API /super-admin] GET error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load super admin data" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, payload } = body;

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    switch (action) {
      case "CREATE_ORGANIZATION": {
        const {
          name_ar,
          name_en,
          slug,
          sector = "EDUCATION_SCHOOLS",
          plan = "ENTERPRISE",
          primary_color = "#0F766E",
          support_email,
          support_phone,
        } = payload;

        if (!name_ar || !slug) {
          return NextResponse.json(
            { success: false, error: "Organization name and slug are required" },
            { status: 400 }
          );
        }

        const id = crypto.randomUUID();
        const newOrg: Omit<Institution, "created_at" | "updated_at"> = {
          id,
          slug: slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, "-"),
          name_ar: name_ar.trim(),
          name_en: (name_en || name_ar).trim(),
          sector: sector as SectorType,
          identifier_type: "ORGANIZATION_CODE",
          verification_metadata: { verified_by_super_admin: true },
          is_verified: true,
          status: "ACTIVE",
          subscription: {
            plan: plan as SubscriptionPlanTier,
            status: "ACTIVE",
            max_staff_seats: plan === "ENTERPRISE" ? 100 : plan === "PROFESSIONAL" ? 30 : 10,
            max_cases_monthly: plan === "ENTERPRISE" ? 10000 : plan === "PROFESSIONAL" ? 1000 : 250,
            max_storage_gb: plan === "ENTERPRISE" ? 250 : 50,
            ai_quota_monthly: plan === "ENTERPRISE" ? 25000 : 5000,
            ai_used_this_month: 0,
            custom_domain_enabled: plan === "ENTERPRISE",
            webhooks_enabled: true,
            sso_enabled: plan === "ENTERPRISE",
            renews_at: new Date(Date.now() + 365 * 86400000).toISOString(),
          },
          branding: {
            primary_color,
            secondary_color: "#1E293B",
            institution_short_name: name_ar.trim(),
            portal_title_ar: `بوابة إدارة الحالات — ${name_ar}`,
            portal_title_en: `${name_en || name_ar} Resolution Portal`,
            org_description_ar: `البوابة الرسمية للمؤسسة لإدارة ومتابعة طلبات وشكاوى المستفيدين وحسمها بشفافية وسرعة.`,
            welcome_message_ar: `أهلاً بكم في البوابة المؤسسية لإدارة وحسم الحالات`,
            support_email: support_email || `support@${slug}.com`,
            support_phone: support_phone || "+201000000000",
            custom_domain: `${slug}.murafiq.app`,
          },
        };

        const created = await storageAdapter.createOrganization(newOrg);
        return NextResponse.json({ success: true, data: created });
      }

      case "UPDATE_STATUS": {
        const { organizationId, status } = payload;
        const updated = await storageAdapter.updateOrganization(organizationId, {
          status: status as SubscriptionStatus,
        });
        return NextResponse.json({ success: true, data: updated });
      }

      case "UPDATE_SUBSCRIPTION": {
        const { organizationId, subscription } = payload;
        const updated = await storageAdapter.saveSubscription(organizationId, subscription);
        return NextResponse.json({ success: true, data: updated });
      }

      case "UPDATE_ORGANIZATION": {
        const { organizationId, updates } = payload;
        const updated = await storageAdapter.updateOrganization(organizationId, updates);
        return NextResponse.json({ success: true, data: updated });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unsupported action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error("[API /super-admin] POST error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process super admin request" },
      { status: 500 }
    );
  }
}
