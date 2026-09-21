"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CaseTriageCard, type CaseTriageItem } from "@/components/institution/CaseTriageCard";
import { Case, SectorType } from "@/types/database";
import { SAMPLE_ENTITIES, type SampleEntityRecord } from "@/lib/services/entities";
import { getSectorTaxonomy } from "@/lib/config/taxonomies";

const SECTOR_LABELS: Record<SectorType, { title: string; icon: string; applicantTerm: string }> = {
  EDUCATION_SCHOOLS: {
    title: "قطاع المدارس والتعليم قبل الجامعي",
    icon: "🏫",
    applicantTerm: "أولياء الأمور والطلاب",
  },
  HIGHER_EDUCATION: {
    title: "قطاع الجامعات والتعليم العالي",
    icon: "🎓",
    applicantTerm: "الطلاب والباحثين والأكاديميين",
  },
  GOVERNMENT_PUBLIC: {
    title: "قطاع الخدمات الحكومية والهيئات العامة",
    icon: "🏛️",
    applicantTerm: "المواطنين وأصحاب المعاملات",
  },
  COMMERCIAL_COMPANIES: {
    title: "قطاع الشركات والخدمات التجارية",
    icon: "🏢",
    applicantTerm: "العملاء والمستهلكين والمشتركين",
  },
  HEALTHCARE_MEDICAL: {
    title: "قطاع المنشآت الصحية والمستشفيات",
    icon: "🏥",
    applicantTerm: "المرضى والمراجعين والمرافقين",
  },
};

export default function InstitutionTriageDashboard() {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("ALL");
  const [role, setRole] = useState<string>("OPS_LEAD");
  const [cases, setCases] = useState<CaseTriageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");

  // Find active entity metadata if a single institution is selected
  const activeEntity: SampleEntityRecord | undefined = SAMPLE_ENTITIES.find(
    (e) => e.id === selectedEntityId
  );

  useEffect(() => {
    async function loadCases() {
      setLoading(true);
      try {
        const queryParam = selectedEntityId === "ALL" ? "" : `?institution_id=${selectedEntityId}`;
        const res = await fetch(`/api/institution/cases${queryParam}`);
        const data = await res.json();
        if (data.cases) {
          setCases(data.cases);
        }
      } catch (err) {
        console.error("Failed to fetch cases:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCases();
    setFilterCategory("ALL");
  }, [selectedEntityId]);

  const handleCaseAcknowledged = (caseId: string) => {
    setCases((prev) =>
      prev.map((c) =>
        c.id === caseId ? { ...c, lifecycle_status: "ACTION_PLAN_PENDING" } : c
      )
    );
  };

  const activeGraceCount = cases.filter(
    (c) => c.lifecycle_status === "PRIVATE_GRACE"
  ).length;

  const isUrgent = (c: Case) => {
    if (!c.grace_expires_at) return false;
    const daysLeft = Math.ceil(
      (new Date(c.grace_expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return daysLeft <= 2;
  };

  const urgentCount = cases.filter(
    (c) => c.lifecycle_status === "PRIVATE_GRACE" && isUrgent(c)
  ).length;

  const filteredCases = cases.filter((c) => {
    if (filterCategory === "ALL") return true;
    return c.category === filterCategory;
  });

  // Dynamic available categories
  const availableCategories = React.useMemo(() => {
    if (activeEntity) {
      return getSectorTaxonomy(activeEntity.sector);
    }
    // If viewing all, gather unique categories from all sectors
    const allSectors: SectorType[] = [
      "EDUCATION_SCHOOLS",
      "HIGHER_EDUCATION",
      "GOVERNMENT_PUBLIC",
      "COMMERCIAL_COMPANIES",
      "HEALTHCARE_MEDICAL",
    ];
    const catMap = new Map<string, string>();
    allSectors.forEach((sec) => {
      getSectorTaxonomy(sec).forEach((c) => catMap.set(c.key, c.label_ar));
    });
    return Array.from(catMap.entries()).map(([key, label_ar]) => ({ key, label_ar }));
  }, [activeEntity]);

  // Sector statutory badge details
  const getStatutoryBadge = (entity?: SampleEntityRecord) => {
    if (!entity) {
      return {
        label: "المنظومة الوطنية الشاملة (جميع القطاعات)",
        badge: "رقابة معتمدة — 5 قطاعات وطنية",
      };
    }
    switch (entity.sector) {
      case "EDUCATION_SCHOOLS":
        return {
          label: "مؤسسة تعليمية معتمدة — وزارة التربية والتعليم",
          badge: "ترخيص رسمي: MOE-2024-8841",
        };
      case "HIGHER_EDUCATION":
        return {
          label: "جامعة معتمدة — المجلس الأعلى للجامعات (قانون 49 لسنة 1972)",
          badge: "اعتماد رقم: SCU-1908-01",
        };
      case "GOVERNMENT_PUBLIC":
        return {
          label: "هيئة حكومية عامة — وزارة الاتصالات وتكنولوجيا المعلومات",
          badge: "كود المنظومة: EGYPOST-CAIRO-01",
        };
      case "COMMERCIAL_COMPANIES":
        return {
          label: "شركة مسجلة — قانون حماية المستهلك رقم 181 لسنة 2018",
          badge: "سجل تجاري: CR-928172-GIZA",
        };
      case "HEALTHCARE_MEDICAL":
        return {
          label: "منشأة طبية معتمدة — الهيئة العامة للاعتماد والرقابة الصحية (GAHAR)",
          badge: "ترخيص منشأة: MOH-HOSP-2018-842",
        };
    }
  };

  const statInfo = getStatutoryBadge(activeEntity);

  return (
    <main className="min-h-screen bg-civic-canvas py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Global Navigation Bar */}
        <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-3 font-bold text-slate-700">
            <Link href="/" className="hover:text-sky-800 transition flex items-center gap-1">
              🏠 <span>الرئيسية</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/directory" className="hover:text-sky-800 transition">
              🌐 الدليل الوطني للجهات (5 قطاعات)
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/schools" className="hover:text-sky-800 transition">
              🏫 المدارس
            </Link>
          </div>
          <Link
            href="/cases/new"
            className="rounded-lg bg-sky-700 px-3.5 py-1.5 font-bold text-white hover:bg-sky-800 transition shadow-2xs"
          >
            + تقديم شكوى أو طلب حل
          </Link>
        </div>

        {/* Entity Switcher Bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-700">🏢 تحديد الجهة أو المؤسسة المعنية:</span>
            <select
              value={selectedEntityId}
              onChange={(e) => setSelectedEntityId(e.target.value)}
              className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-sky-800 focus:outline-none"
            >
              <option value="ALL">🌐 عرض جميع الجهات (المنظور الوطني الشامل)</option>
              <optgroup label="المدارس والتعليم قبل الجامعي">
                <option value="00000000-0000-0000-0000-000000000010">
                  🏫 مدرسة القاهرة التجريبية الرسمية للغات (القاهرة)
                </option>
                <option value="sch-stgeorge-002">
                  🏫 مدرسة سانت جورج للغات (مصر الجديدة)
                </option>
              </optgroup>
              <optgroup label="الجامعات والتعليم العالي">
                <option value="uni-cairo-001">
                  🎓 جامعة القاهرة (Cairo University - الجيزة)
                </option>
                <option value="uni-guc-002">
                  🎓 الجامعة الألمانية بالقاهرة (GUC)
                </option>
              </optgroup>
              <optgroup label="الخدمات الحكومية والهيئات">
                <option value="gov-post-001">
                  🏛️ الهيئة القومية للبريد - منطقة بريد القاهرة
                </option>
                <option value="gov-notary-002">
                  🏛️ مكتب الشهر العقاري والتوثيق - مدينة نصر المميكن
                </option>
              </optgroup>
              <optgroup label="الشركات والخدمات التجارية">
                <option value="com-vodafone-001">
                  🏢 شركة فودافون مصر للاتصالات (Vodafone Egypt)
                </option>
                <option value="com-we-002">
                  🏢 الشركة المصرية للاتصالات (Telecom Egypt - WE)
                </option>
              </optgroup>
              <optgroup label="المنشآت الصحية والمستشفيات">
                <option value="med-salam-001">
                  🏥 مستشفى السلام الدولي بالمعادي
                </option>
                <option value="med-cleo-002">
                  🏥 مستشفى كليوباترا - مصر الجديدة
                </option>
              </optgroup>
            </select>
          </div>

          {/* Interactive RBAC Role Selector */}
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-200 text-xs">
            <span className="font-semibold text-slate-600">الدور التشغيلي:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-2 py-1 font-bold text-civic-navy focus:outline-none"
            >
              <option value="ADMIN">مدير المؤسسة / المفوض العام (ADMIN)</option>
              <option value="OPS_LEAD">مسؤول العمليات وفض النزاعات (OPS_LEAD)</option>
              <option value="STAFF">الموظف المختص / ممثل القسم (STAFF)</option>
              <option value="OBSERVER">مراقب جهة رقابية خارجية (OBSERVER)</option>
            </select>
          </div>
        </div>

        {/* Top Institution Banner */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-full bg-emerald-100 px-3 py-0.5 text-xs font-bold text-emerald-800">
                  {statInfo.label}
                </span>
                <span className="rounded-full bg-slate-100 px-3 py-0.5 text-xs font-mono font-medium text-slate-600">
                  {statInfo.badge}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-civic-navy">
                بوابة الجهات والمؤسسات — لوحة فرز ومعالجة الحالات
              </h1>
              <p className="text-sm font-semibold text-sky-900 mt-1">
                {activeEntity
                  ? `${SECTOR_LABELS[activeEntity.sector]?.icon} ${activeEntity.name} — ${activeEntity.type} (${activeEntity.governorate})`
                  : "🌐 المنظور الوطني الشامل — استعراض الحالات الواردة عبر جميع القطاعات الخمسة"}
              </p>
            </div>

            {activeEntity && (
              <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-left">
                <span className="text-xs text-slate-500 block">معدل الحل الإيجابي (UCRR)</span>
                <span className="text-2xl font-black text-sky-900 font-mono">
                  {activeEntity.ucrr}%
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-teal-100 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              حالات في مهلة المراجعة الخاصة
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-civic-navy font-mono">
                {activeGraceCount}
              </span>
              <span className="text-xs font-semibold text-civic-teal bg-teal-50 px-2 py-0.5 rounded">
                7 أيام مهلة نظامية
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              حالات عاجلة (يتبقى أقل من 48 ساعة)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-3xl font-bold text-amber-700 font-mono">
                {urgentCount}
              </span>
              <span className="text-xs font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                تتطلب تأكيد فوري
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <span className="text-xs font-semibold text-slate-500">
              مستوى عزل الخصوصية (PII Isolation)
            </span>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-sm font-bold text-emerald-700">
                🔒 مشفر ومفصول بنسبة 100%
              </span>
              <span className="text-xs text-slate-400">قانون 151/2020</span>
            </div>
          </div>
        </div>

        {/* Role Warning for Observer */}
        {role === "OBSERVER" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 leading-relaxed">
            <strong>تنبيه الصلاحيات الرقابية:</strong> بصفتك (OBSERVER)، لا يمكنك الاطلاع على الحالات الخاصة التي لا تزال في فترة المهلة (PRIVATE_GRACE) وتقتصر صلاحيتك على مؤشرات الأداء والتقارير العامة بعد انقضاء المهل.
          </div>
        )}

        {/* Role Warning for Staff */}
        {role === "STAFF" && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs text-blue-900 leading-relaxed">
            <strong>تنبيه الصلاحيات الداخلية:</strong> بصفتك (STAFF)، يمكنك الاطلاع على تفاصيل الحالات الموجهة لإدارتك، وصياغة الردود، بينما يقتصر اعتماد التأكيد الرسمي لخطط العمل على (ADMIN و OPS_LEAD).
          </div>
        )}

        {/* Triage Cases List */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-800">
              {activeEntity
                ? `شكاوى وطلبات ${SECTOR_LABELS[activeEntity.sector]?.applicantTerm || "المستفيدين"} الواردة حديثًا (${filteredCases.length})`
                : `الحالات والشكاوى الواردة حديثًا عبر المنظومة الوطنية (${filteredCases.length})`}
            </h2>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs focus:border-civic-navy focus:outline-none"
            >
              <option value="ALL">جميع التصنيفات</option>
              {availableCategories.map((c) => (
                <option key={c.key} value={c.key}>
                  {c.label_ar}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-400 border border-slate-200">
              جاري تحميل الحالات الواردة...
            </div>
          ) : filteredCases.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center text-sm text-slate-500 border border-slate-200">
              لا توجد حالات معلقة تتطلب الفرز لهذه الجهة حالياً.
            </div>
          ) : (
            filteredCases.map((caseItem) => (
              <CaseTriageCard
                key={caseItem.id}
                caseData={caseItem}
                userRole={role}
                onAcknowledged={handleCaseAcknowledged}
              />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
