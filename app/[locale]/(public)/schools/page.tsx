import React from "react";
import Link from "next/link";
import { getPublicSchoolsDirectory } from "@/lib/services/schools";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";

interface Props {
  searchParams: Promise<{ governorate?: string; q?: string }>;
}

export default async function SchoolsDirectoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentGov = params.governorate || "القاهرة";
  const searchQuery = params.q?.toLowerCase() || "";

  const data = await getPublicSchoolsDirectory(currentGov);

  const displayedSchools = data.schools.filter((s) =>
    searchQuery ? s.name.toLowerCase().includes(searchQuery) : true
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition">
              <MurafiqLogo size="md" />
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/directory"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition hidden sm:inline-block"
            >
              🌐 كافة القطاعات
            </Link>
            <Link
              href="/cases/new"
              className="rounded-lg bg-sky-600 px-3.5 py-2 font-bold text-white hover:bg-sky-700 transition"
            >
              + تقديم حالة جديدة
            </Link>
            <Link
              href="/portal/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              بوابة المؤسسات
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Search Section */}
      <section className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-700 mb-4">
            <span>📊 المؤشر الإحصائي الموزون (BARS) — قياس علمي يمنع الانحياز الإحصائي</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            دليل المؤسسات التعليمية ومؤشرات الاستجابة والحل
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-xl mx-auto">
            تعتمد منصة مُرافِق مؤشر التسوية البايزي (BARS) لحساب موثوقية المؤسسات بناءً على حالات حقيقية مكتملة ومقيمة من أولياء الأمور، مع تطبيق نصاب إحصائي صارم.
          </p>

          {/* Governorate Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {data.governorates.map((gov) => {
              const isActive = gov === currentGov;
              return (
                <Link
                  key={gov}
                  href={`/schools?governorate=${encodeURIComponent(gov)}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isActive
                      ? "bg-sky-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  محافظة {gov}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Directory Body */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Governorate Threshold Gate Banner */}
        {!data.thresholdInfo.isThresholdMet ? (
          <div className="rounded-2xl border-2 border-amber-300 bg-amber-50 p-6 text-amber-900 shadow-xs mb-8">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-extrabold text-base">
                  نظام حجب المؤشر الإحصائي للمحافظة (Statistical Equilibrium Gate)
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  {data.thresholdInfo.messageAr}
                </p>
                <div className="mt-3 inline-block rounded-lg bg-white/80 border border-amber-200 px-3 py-1 text-[11px] font-bold text-amber-900">
                  المؤسسات المشاركة حالياً: {data.thresholdInfo.institutionCount} من أصل {data.thresholdInfo.minRequired} المطلوبة لتفعيل مؤشر المحافظة
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold text-slate-500">
              عرض {displayedSchools.length} مؤسسة تعليمية في محافظة {currentGov}
            </span>
            <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md font-bold">
              ✓ النصاب الإحصائي للمحافظة مكتمل (10+ مدارس)
            </div>
          </div>
        )}

        {/* Schools List Grid */}
        {data.thresholdInfo.isThresholdMet && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {displayedSchools.map((school) => {
              const b = school.metrics.bars;
              return (
                <div
                  key={school.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 hover:shadow-sm transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 mb-1">
                          {school.type}
                        </span>
                        <h2 className="text-base font-bold text-slate-900">
                          {school.name}
                        </h2>
                        <span className="text-xs text-slate-500">
                          محافظة {school.governorate}
                        </span>
                      </div>

                      {/* BARS Score Box */}
                      <div className="text-center rounded-xl bg-slate-50 border border-slate-200 p-2.5 min-w-[90px]">
                        {b.isEstablishing ? (
                          <div>
                            <span className="text-[10px] font-bold text-amber-700 block">
                              قيد التأسيس
                            </span>
                            <span className="text-xs text-slate-500">
                              {b.sampleSize} حالات
                            </span>
                          </div>
                        ) : (
                          <div>
                            <span className="text-xl font-extrabold text-sky-700">
                              {b.barsScore.toFixed(1)}
                            </span>
                            <span className="text-[10px] text-slate-400 block">
                              من 5.0 (BARS)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Metrics Breakdown */}
                    <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500 block text-[11px]">
                          نسبة الحل المؤكد (UCRR):
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {school.metrics.userConfirmedResolutionRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[11px]">
                          متوسط زمن الاستجابة:
                        </span>
                        <span className="font-bold text-slate-700">
                          {school.metrics.medianResponseDays} يوم
                        </span>
                      </div>
                    </div>

                    {/* Sample Size Context (Gate 4) */}
                    <div className="mt-3 text-[11px] text-slate-400">
                      {school.metrics.sampleSizeContext}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      مستوى الثقة الإحصائية:{" "}
                      <strong className="text-slate-700">
                        {b.confidenceLevel === "HIGH"
                          ? "مرتفع"
                          : b.confidenceLevel === "MODERATE"
                          ? "متوسط"
                          : "أولي"}
                      </strong>
                    </span>
                    <Link
                      href={`/schools/${school.slug}`}
                      className="rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 px-3 py-1.5 text-xs font-bold transition"
                    >
                      عرض ملف المدرسة ←
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
