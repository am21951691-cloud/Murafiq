import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEntityBySlug } from "@/lib/services/entities";

interface Props {
  params: Promise<{ slug: string }>;
}

const SECTOR_LABELS: Record<string, { label: string; icon: string }> = {
  EDUCATION_SCHOOLS: { label: "التعليم قبل الجامعي (المدارس)", icon: "🏫" },
  HIGHER_EDUCATION: { label: "التعليم العالي والجامعات", icon: "🎓" },
  GOVERNMENT_PUBLIC: { label: "الخدمات الحكومية والهيئات", icon: "🏛️" },
  COMMERCIAL_COMPANIES: { label: "الشركات والخدمات التجارية", icon: "🏢" },
  HEALTHCARE_MEDICAL: { label: "المنشآت الصحية والمستشفيات", icon: "🏥" },
};

export default async function EntityProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const entity = await getEntityBySlug(resolvedParams.slug);

  if (!entity) {
    notFound();
  }

  const b = entity.metrics.bars;
  const sectorInfo = SECTOR_LABELS[entity.sector] || {
    label: entity.sector,
    icon: "🏢",
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/directory" className="text-xs text-sky-700 font-bold hover:underline">
              ← العودة لدليل الخدمات والجهات
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href={`/cases/new?entity=${entity.slug}&sector=${entity.sector}`}
              className="rounded-lg bg-sky-600 px-3.5 py-2 font-bold text-white hover:bg-sky-700 transition shadow-xs"
            >
              + تقديم حالة / شكوى لهذه الجهة
            </Link>
          </div>
        </div>
      </header>

      {/* Entity Hero Overview */}
      <section className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="rounded-md bg-sky-100 text-sky-800 px-2.5 py-1 text-xs font-bold inline-flex items-center gap-1">
                  <span>{sectorInfo.icon}</span>
                  <span>{sectorInfo.label}</span>
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 px-2.5 py-1 text-xs font-bold">
                  ✓ جهة معتمدة في منظومة مُرافِق
                </span>
                <span className="rounded-md bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-medium">
                  {entity.type}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {entity.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                محافظة {entity.governorate} — جمهورية مصر العربية
              </p>
            </div>

            {/* BARS Score Visual Banner */}
            <div className="rounded-2xl border-2 border-sky-100 bg-sky-50/50 p-4 text-center min-w-[170px]">
              {b.isEstablishing ? (
                <div>
                  <span className="text-xs font-extrabold text-amber-700 block">
                    قيد تأسيس المؤشر
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    {b.sampleSize} حالات مغلقة ومقيمة
                  </span>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-extrabold text-sky-800">
                    {b.barsScore.toFixed(1)}
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 block">
                    مؤشر التسوية البايزي (BARS)
                  </span>
                  <span className="text-[10px] text-slate-400">
                    من 5.0 نقاط (موزون للقطاع)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">نسبة الحل المؤكد من المستفيد</span>
              <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
                {entity.metrics.userConfirmedResolutionRate}%
              </span>
              <span className="text-[10px] text-slate-400">تقييم الحل النهائي R<sub>res</sub> ≥ 3</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">متوسط سرعة الاستجابة الأولية</span>
              <span className="text-xl font-extrabold text-sky-700 mt-1 block">
                {entity.metrics.medianResponseDays} يوم عمل
              </span>
              <span className="text-[10px] text-slate-400">من تقديم الحالة إلى خطة العمل</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">حجم الحالات المغلقة (12 شهراً)</span>
              <span className="text-xl font-extrabold text-slate-700 mt-1 block">
                {entity.metrics.totalCases12Months} حالة
              </span>
              <span className="text-[10px] text-slate-400">مستوى الثقة الإحصائية: {b.confidenceLevel}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        {/* Verified Cases Stream */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                سجل الحالات المغلقة والموثقة
              </h2>
              <p className="text-xs text-slate-500">
                حالات حقيقية تم حلها وتوثيق تقييمها من المستفيد، مع إخفاء البيانات الشخصية بالكامل (قانون 151 لسنة 2020)
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
              {entity.publicCases.length} حالات معروضة
            </span>
          </div>

          <div className="space-y-4">
            {entity.publicCases.map((c) => (
              <div
                key={c.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">
                      رقم الحالة: {c.referenceNumber}
                    </span>
                    <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                      {c.category}
                    </span>
                  </div>
                  <span className="text-slate-400">تاريخ الإغلاق: {c.closedAt}</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 block mb-0.5">ملخص الحالة:</span>
                    <p className="text-slate-800 leading-relaxed">{c.sanitizedDescription}</p>
                  </div>

                  {c.desiredOutcome && (
                    <div className="bg-slate-50 rounded-lg p-2.5">
                      <span className="font-bold text-slate-500 block mb-0.5">المطلب المرجو:</span>
                      <p className="text-slate-700">{c.desiredOutcome}</p>
                    </div>
                  )}

                  {c.officialStatement && (
                    <div className="bg-sky-50/70 border-r-2 border-sky-600 rounded-lg p-2.5">
                      <span className="font-bold text-sky-800 block mb-0.5">
                        الإجراء المتخذ وبيان الجهة الرسمي:
                      </span>
                      <p className="text-sky-950">{c.officialStatement}</p>
                    </div>
                  )}

                  {c.closingFeedback && (
                    <div className="bg-emerald-50/70 border-r-2 border-emerald-600 rounded-lg p-2.5">
                      <span className="font-bold text-emerald-800 block mb-0.5">
                        تقييم المستفيد عند الإغلاق:
                      </span>
                      <p className="text-emerald-950">{c.closingFeedback}</p>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-emerald-800 font-bold">
                        <span>تقييم الاستجابة R_resp: {c.rResp}/5</span>
                        <span>•</span>
                        <span>تقييم الحل النهائي R_res: {c.rRes}/5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
