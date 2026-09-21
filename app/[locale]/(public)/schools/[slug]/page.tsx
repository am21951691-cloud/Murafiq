import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSchoolProfileBySlug } from "@/lib/services/schools";

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function SchoolProfilePage({ params }: Props) {
  const resolvedParams = await params;
  const school = await getSchoolProfileBySlug(resolvedParams.slug);

  if (!school) {
    notFound();
  }

  const b = school.metrics.bars;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-slate-700 font-bold hover:text-sky-800 transition flex items-center gap-1">
              🏠 الرئيسية
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/directory" className="text-xs text-slate-700 font-bold hover:text-sky-800 transition">
              🌐 الدليل العام
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/schools" className="text-xs text-sky-700 font-bold hover:underline">
              ← دليل المدارس
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/portal/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition hidden sm:inline-block"
            >
              بوابة المؤسسات
            </Link>
            <Link
              href={`/cases/new?institution=${school.id}`}
              className="rounded-lg bg-sky-600 px-3.5 py-2 font-bold text-white hover:bg-sky-700 transition shadow-xs"
            >
              + تقديم حالة لهذه المدرسة
            </Link>
          </div>
        </div>
      </header>

      {/* School Hero Overview */}
      <section className="bg-white border-b border-slate-200 py-8 px-4">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded-md bg-sky-100 text-sky-800 px-2 py-0.5 text-xs font-bold">
                  {school.type}
                </span>
                <span className="rounded-md bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
                  ✓ مؤسسة معتمدة في منظومة مُرافِق
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {school.name}
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                محافظة {school.governorate} — جمهورية مصر العربية
              </p>
            </div>

            {/* BARS Score Visual Banner */}
            <div className="rounded-2xl border-2 border-sky-100 bg-sky-50/50 p-4 text-center min-w-[160px]">
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
                    من 5.0 نقاط
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-100 text-center">
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">نسبة الحل المؤكد من المستخدم (UCRR)</span>
              <span className="text-xl font-extrabold text-emerald-700 mt-1 block">
                {school.metrics.userConfirmedResolutionRate}%
              </span>
              <span className="text-[10px] text-slate-400">رضا عن الحل النهائي R<sub>res</sub> ≥ 3</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">متوسط سرعة الاستجابة واعتماد الخطة</span>
              <span className="text-xl font-extrabold text-slate-800 mt-1 block">
                {school.metrics.medianResponseDays} يوم
              </span>
              <span className="text-[10px] text-slate-400">خلال مهلة المراجعة الخاصة</span>
            </div>

            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
              <span className="text-xs text-slate-500 block">مستوى الثقة الإحصائية وسياق العينة</span>
              <span className="text-xl font-extrabold text-sky-800 mt-1 block">
                {b.confidenceLevel === "HIGH" ? "مرتفع" : b.confidenceLevel === "MODERATE" ? "متوسط" : "أولي"}
              </span>
              <span className="text-[10px] text-slate-400">{school.metrics.sampleSizeContext}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Public Cases Stream */}
      <main className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              سجل الحالات العامة والتسويات المعتمدة
            </h2>
            <p className="text-xs text-slate-500">
              يتم عرض الحالات العامة فقط بعد موافقة الطرفين واكتمال إجراءات التحقق والفلترة الأمنية
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
            {school.publicCases.length} حالات عامة
          </span>
        </div>

        {/* Cases List */}
        <div className="space-y-4">
          {school.publicCases.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-sky-800">
                    {c.referenceNumber}
                  </span>
                  <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                    {c.category}
                  </span>
                </div>
                <span className="text-xs text-slate-400">
                  تاريخ الإغلاق: {c.closedAt}
                </span>
              </div>

              {/* Sanitized User Statement */}
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-slate-700">موضوع الحالة</span>
                  <span className="text-[10px] font-bold bg-sky-100 text-sky-800 px-2 py-0.5 rounded">
                    [USER-REPORTED]
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {c.sanitizedDescription}
                </p>
              </div>

              {/* Institution Statement */}
              {c.officialStatement && (
                <div className="mb-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-slate-700">إفادة المدرسة الرسمية</span>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded">
                      [INSTITUTION-STATED]
                    </span>
                    {c.rqsScore && (
                      <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded mr-auto">
                        [VERIFIED] RQS: {c.rqsScore}/100
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.officialStatement}
                  </p>
                </div>
              )}

              {/* Parent Closure Evaluation */}
              <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-emerald-900">التقييم الختامي لولي الأمر</span>
                  <span className="text-[10px] font-bold bg-emerald-200 text-emerald-800 px-2 py-0.5 rounded">
                    [USER-CONFIRMED]
                  </span>
                  <div className="mr-auto text-xs font-bold text-emerald-800">
                    الأثر R<sub>exp</sub>: {c.rExp}/5 | الاستجابة R<sub>resp</sub>: {c.rResp}/5 | الحل R<sub>res</sub>: {c.rRes}/5
                  </div>
                </div>
                {c.closingFeedback && (
                  <p className="text-xs text-emerald-800 mt-1 italic">
                    &ldquo;{c.closingFeedback}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Mandatory Non-Judicial Disclaimer */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-500 text-justify leading-relaxed">
          <strong className="text-slate-800 block mb-1">
            إخلاء مسؤولية قانوني وميثاق الشفافية (Mandatory Legal Disclaimer):
          </strong>
          المؤشرات والبيانات المنشورة في هذا الملف هي سجلات معلوماتية ناتجة عن تسوية ودية وطوعية للحالات عبر منصة مُرافِق، ولا تمثل بأي حال من الأحوال أحكاماً قضائية أو جزاءات تأديبية أو إدانة لأي طرف. كافة البيانات تخضع لعزو دقيق بحسب مصدرها ([USER-REPORTED]، [INSTITUTION-STATED]، [USER-CONFIRMED]، [VERIFIED]).
        </div>
      </main>
    </div>
  );
}
