import React from "react";
import Link from "next/link";
import type { SectorType } from "@/types/database";
import { getPublicEntities } from "@/lib/services/entities";

interface Props {
  searchParams: Promise<{ governorate?: string; sector?: string; q?: string }>;
}

const SECTORS: Array<{ key: SectorType | "ALL"; label_ar: string; icon: string }> = [
  { key: "ALL", label_ar: "جميع القطاعات", icon: "🌐" },
  { key: "EDUCATION_SCHOOLS", label_ar: "المدارس والتعليم قبل الجامعي", icon: "🏫" },
  { key: "HIGHER_EDUCATION", label_ar: "الجامعات والتعليم العالي", icon: "🎓" },
  { key: "GOVERNMENT_PUBLIC", label_ar: "الخدمات الحكومية والهيئات", icon: "🏛️" },
  { key: "COMMERCIAL_COMPANIES", label_ar: "الشركات والخدمات التجارية", icon: "🏢" },
  { key: "HEALTHCARE_MEDICAL", label_ar: "المنشآت الصحية والمستشفيات", icon: "🏥" },
];

const GOVERNORATES = ["ALL", "القاهرة", "الجيزة", "الإسكندرية"];

export default async function GenericDirectoryPage({ searchParams }: Props) {
  const params = await searchParams;
  const currentGov = params.governorate || "ALL";
  const currentSector = (params.sector as SectorType | undefined) || undefined;
  const searchQuery = params.q?.toLowerCase() || "";

  const entities = await getPublicEntities({
    governorate: currentGov,
    sector: currentSector,
    search: searchQuery,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-lg bg-sky-700 text-white flex items-center justify-center font-bold text-lg">
                م
              </div>
              <div>
                <span className="font-extrabold text-base text-sky-900">
                  مُرافِق — الدليل الوطني للجهات والخدمات
                </span>
                <span className="block text-[10px] text-slate-500">
                  منظومة الشفافية وحل الشكاوى في مصر عبر 5 قطاعات وطنية
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/cases/new"
              className="rounded-lg bg-sky-600 px-3.5 py-2 font-bold text-white hover:bg-sky-700 transition"
            >
              + تقديم شكوى أو طلب حل
            </Link>
            <Link
              href="/portal/dashboard"
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 transition"
            >
              بوابة المؤسسات والجهات
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-sky-700 mb-4">
            <span>⚖️ مؤشر التسوية البايزي (BARS) — تقييم دقيق محايد لكل قطاع بشكل مستقل</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            دليل الجهات والمؤسسات ومؤشرات الأداء والحل
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto">
            ابحث عن المدارس، الجامعات، الهيئات والمصالح الحكومية، الشركات ومقدمي الخدمات، والمنشآت الطبية للاطلاع على مؤشرات الجودة وسرعة الاستجابة الحقيقية.
          </p>

          {/* Sector Filter Tabs */}
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {SECTORS.map((s) => {
              const isActive = (!currentSector && s.key === "ALL") || currentSector === s.key;
              const href =
                s.key === "ALL"
                  ? `/directory?governorate=${encodeURIComponent(currentGov)}`
                  : `/directory?sector=${s.key}&governorate=${encodeURIComponent(currentGov)}`;
              return (
                <Link
                  key={s.key}
                  href={href}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    isActive
                      ? "bg-sky-800 text-white shadow-xs"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  <span>{s.icon}</span>
                  <span>{s.label_ar}</span>
                </Link>
              );
            })}
          </div>

          {/* Governorate Filter Tabs */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {GOVERNORATES.map((gov) => {
              const isActive = gov === currentGov;
              const sectorParam = currentSector ? `&sector=${currentSector}` : "";
              return (
                <Link
                  key={gov}
                  href={`/directory?governorate=${encodeURIComponent(gov)}${sectorParam}`}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    isActive
                      ? "bg-slate-800 text-white font-bold"
                      : "bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {gov === "ALL" ? "جميع المحافظات" : `محافظة ${gov}`}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Directory Body */}
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">
            الجهات المتاحة ({entities.length})
          </h2>
          <span className="text-xs text-slate-500">
            بيانات موثقة تخضع للمعايير القانونية والخصوصية
          </span>
        </div>

        {entities.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-slate-500">
            لا توجد جهات مطابقة لمعايير البحث الحالية.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {entities.map((entity) => {
              const sectorObj = SECTORS.find((s) => s.key === entity.sector);
              return (
                <div
                  key={entity.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2 py-0.5 font-bold text-sky-700">
                        {sectorObj?.icon} {sectorObj?.label_ar}
                      </span>
                      <span className="bg-slate-100 rounded-md px-2 py-0.5">
                        {entity.governorate}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 mt-2">
                      {entity.name}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">{entity.type}</p>

                    <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center">
                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <span className="block text-[11px] text-slate-500 font-medium">
                          مؤشر التسوية (BARS)
                        </span>
                        <span className="block text-lg font-black text-sky-800 mt-0.5">
                          {entity.metrics.bars.barsScore.toFixed(1)} / 5.0
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          {entity.metrics.bars.isEstablishing
                            ? "قيد التأسيس"
                            : `${entity.metrics.bars.sampleSize} حالة موثقة`}
                        </span>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-2.5">
                        <span className="block text-[11px] text-slate-500 font-medium">
                          نسبة الحل المؤكد
                        </span>
                        <span className="block text-lg font-black text-emerald-700 mt-0.5">
                          {entity.metrics.userConfirmedResolutionRate}%
                        </span>
                        <span className="block text-[10px] text-slate-400">
                          خلال {entity.metrics.medianResponseDays} يوم
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/services/${entity.slug}`}
                      className="text-xs font-bold text-sky-700 hover:text-sky-900 transition flex items-center gap-1"
                    >
                      عرض الملف الكامل ومؤشرات الجودة ←
                    </Link>
                    <Link
                      href={`/cases/new?entity=${entity.slug}`}
                      className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 hover:bg-sky-100 transition"
                    >
                      تقديم حالة
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
