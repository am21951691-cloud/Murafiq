"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import { HomeAiCallout } from "@/components/ai/HomeAiCallout";

const SECTORS = [
  {
    key: "EDUCATION_SCHOOLS",
    title_ar: "المدارس والتعليم قبل الجامعي",
    title_en: "Pre-University Schools",
    icon: "🏫",
    beneficiary_ar: "أولياء الأمور والطلاب",
    departments_ar: "شؤون الطلاب، التوجيه الاجتماعي، الحسابات، الأكاديمي",
    statutory_ar: "القرار الوزاري 187 لسنة 2023 (الانضباط المدرسي وحظر الزيادات غير المعتمدة)",
    href: "/cases/new?sector=EDUCATION_SCHOOLS",
  },
  {
    key: "HIGHER_EDUCATION",
    title_ar: "الجامعات والتعليم العالي",
    title_en: "Higher Education & Universities",
    icon: "🎓",
    beneficiary_ar: "الطلاب الجامعيون والباحثون",
    departments_ar: "الكنترول والتظلمات، شؤون الطلاب، رعاية الشباب، الإسكان",
    statutory_ar: "قانون تنظيم الجامعات 49 لسنة 1972 (الساعات المعتمدة والتظلمات الأكاديمية)",
    href: "/cases/new?sector=HIGHER_EDUCATION",
  },
  {
    key: "GOVERNMENT_PUBLIC",
    title_ar: "الخدمات الحكومية والهيئات العامة",
    title_en: "Government & Public Services",
    icon: "🏛️",
    beneficiary_ar: "المواطنون وأصحاب المعاملات",
    departments_ar: "خدمة المواطنين، التوثيق، الشؤون القانونية، التحصيل",
    statutory_ar: "قرارات مجلس الوزراء لتفعيل اتفاقيات مستوى الخدمة (SLA) والتحصيل الرقمي",
    href: "/cases/new?sector=GOVERNMENT_PUBLIC",
  },
  {
    key: "COMMERCIAL_COMPANIES",
    title_ar: "الشركات والخدمات التجارية",
    title_en: "Commercial Enterprises & Telecom",
    icon: "🏢",
    beneficiary_ar: "العملاء والمستهلكون والمشتركون",
    departments_ar: "خدمة العملاء، الضمان والصيانة، الفوترة، الشحن",
    statutory_ar: "قانون حماية المستهلك 181 لسنة 2018 (حق الاسترجاع والضمان وخدمات ما بعد البيع)",
    href: "/cases/new?sector=COMMERCIAL_COMPANIES",
  },
  {
    key: "HEALTHCARE_MEDICAL",
    title_ar: "المنشآت الصحية والمستشفيات",
    title_en: "Healthcare Facilities & Hospitals",
    icon: "🏥",
    beneficiary_ar: "المرضى والمراجعون والمرافقون",
    departments_ar: "علاقات المرضى، الإدارة الطبية، الجودة والاعتماد، التمريض",
    statutory_ar: "معايير الهيئة العامة للاعتماد والرقابة الصحية (GAHAR) وميثاق حقوق المريض",
    href: "/cases/new?sector=HEALTHCARE_MEDICAL",
  },
];

const RESOLUTION_STEPS = [
  { step: "01", title_ar: "تسجيل الحالة", desc_ar: "نموذج مؤمن بحقول مخصصة لكل قطاع ومعرف مشفر" },
  { step: "02", title_ar: "الفرز الإداري", desc_ar: "مراجعة مبدئية وتأكيد رسمي من مسؤول العمليات" },
  { step: "03", title_ar: "الإحالة للقسم", desc_ar: "توجيه آلي للإدارة المعنية وتعيين الموظف المسؤول" },
  { step: "04", title_ar: "مؤقت الـ SLA", desc_ar: "عداد تنازلي دقيق لضمان الالتزام بمواعيد الرد والحل" },
  { step: "05", title_ar: "خطة العمل", desc_ar: "3 مراحل معتمدة ذات مواعيد ومخرجات ملموسة" },
  { step: "06", title_ar: "التنفيذ والمتابعة", desc_ar: "إثبات إنجاز كل مرحلة بالمستندات والأدلة" },
  { step: "07", title_ar: "حسم النزاع", desc_ar: "إغلاق الحالة وإشعار المستفيد بالنتيجة النهائية" },
  { step: "08", title_ar: "تقييم المستفيد", desc_ar: "قياس رضا المستفيد عن سرعة الرد وجودة الحل" },
  { step: "09", title_ar: "تقرير معتمد", desc_ar: "PDF رسمي ببصمة رقمية (SHA-256) للمراجعة والتفتيش" },
];

export default function HomePage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [demoRequested, setDemoRequested] = useState(false);

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackingNumber.trim();
    if (clean) {
      router.push(`/cases/${clean}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right" dir="rtl">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition flex items-center gap-2">
              <MurafiqLogo size="md" />
              <div className="text-right">
                <span className="block text-xs font-black text-sky-950 uppercase tracking-wider font-sans">
                  Enterprise Resolution Suite
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700">
            <Link
              href="/portal/dashboard"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              📋 لوحة فرز ومعالجة الحالات
            </Link>
            <Link
              href="/portal/analytics"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              📊 مؤشرات الأداء والجودة (Analytics)
            </Link>
            <Link
              href="/cases/new"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              📝 بوابة تقديم البلاغات
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 text-xs">
            <Link
              href="/portal/dashboard"
              className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 font-bold text-slate-800 hover:bg-slate-50 transition shadow-2xs"
            >
              دخول بوابة المؤسسة
            </Link>
            <Link
              href="/cases/new"
              className="rounded-xl bg-sky-800 px-4.5 py-2 font-black text-white hover:bg-sky-900 transition shadow-xs"
            >
              + تسجيل حالة جديدة
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Section: Product Identity & Positioning */}
      <section className="bg-white border-b border-slate-200 py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-4 py-1 text-xs font-bold text-sky-900 mb-6 shadow-2xs">
            <span>🏛️ منظومة مؤسسية لإدارة الحالات والشكاوى والطلبات وحل المشكلات</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            مُرافِق — المنظومة المؤسسية لإدارة الحالات وحل المشكلات
          </h1>

          <p className="mt-4 text-base sm:text-lg font-bold text-sky-850 text-slate-800 max-w-3xl mx-auto leading-relaxed">
            حوّل كل شكوى أو طلب إلى حالة لها مسؤول، وموعد، وخطة عمل، ومتابعة، ونتيجة قابلة للقياس.
          </p>

          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-sans max-w-2xl mx-auto dir-ltr">
            Give every issue an owner, every request a deadline, every action a record, and every resolution a measurable outcome.
          </p>

          {/* Quick Action Buttons */}
          <div className="mt-8 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/portal/dashboard"
              className="rounded-xl bg-sky-800 px-7 py-3.5 text-sm font-bold text-white hover:bg-sky-900 transition shadow-sm"
            >
              🏢 دخول بوابة المؤسسة والأقسام ←
            </Link>
            <Link
              href="/cases/new"
              className="rounded-xl border-2 border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-slate-800 hover:bg-slate-50 transition"
            >
              📝 تسجيل طلب أو بلاغ رسمي
            </Link>
            <Link
              href="/portal/analytics"
              className="rounded-xl border border-sky-200 bg-sky-50 px-6 py-3.5 text-sm font-bold text-sky-900 hover:bg-sky-100 transition"
            >
              📊 استعراض مؤشرات الأداء (SLA)
            </Link>
          </div>

          {/* Instant Ticket Tracking Bar */}
          <div className="mt-10 mx-auto max-w-xl">
            <form onSubmit={handleTrack} className="rounded-2xl border-2 border-sky-100 bg-slate-50/80 p-3 shadow-xs flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 px-2">🔍 تتبع حالة تذكرة:</span>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="أدخل رقم المرجع (مثال: MRF-2026-48219)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-mono font-bold focus:border-sky-800 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-sky-800 px-5 py-2 text-xs font-bold text-white hover:bg-sky-900 transition"
              >
                تتبع
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. The Core Enterprise Loop: 9-Step Resolution Workflow */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-extrabold text-sky-800 tracking-wider uppercase block mb-1">
            دورة العمل المعتمدة
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            مسار الحوكمة المغلق لحل المشكلات (Closed Resolution Loop)
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            نظام متكامل يضمن انتقال القضية من مرحلة الشكوى العشوائية إلى خطة عمل تنفيذية موثقة ومعتمدة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {RESOLUTION_STEPS.map((s) => (
            <div
              key={s.step}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs hover:border-sky-300 transition text-right"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-sm font-black text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-lg border border-sky-100">
                  {s.step}
                </span>
                <span className="text-[11px] font-bold text-slate-400">مرحلة إلزامية</span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-1">{s.title_ar}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{s.desc_ar}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Dual Operational AI Showcase */}
      <HomeAiCallout />

      {/* 5. The 5 National Deployment Verticals */}
      <section className="bg-slate-100/60 border-y border-slate-200 py-16 px-4">
        <div className="mx-auto max-w-7xl sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-extrabold text-sky-800 tracking-wider uppercase block mb-1">
              المرونة والجاهزية المؤسسية
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              مهيأ للتشغيل الفوري عبر 5 قطاعات وطنية رئيسية
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600">
              محرك موحد لمعالجة الحالات مع تخصيص فوري للأقسام، اللوائح، والمصطلحات القانونية بحسب طبيعة كل جهة
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SECTORS.map((sec) => (
              <div
                key={sec.key}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{sec.icon}</span>
                    <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                      جاهز للنشر
                    </span>
                  </div>
                  <h3 className="text-lg font-extrabold text-slate-900 mb-0.5">{sec.title_ar}</h3>
                  <span className="text-[11px] text-slate-400 font-semibold block mb-3 font-sans">
                    {sec.title_en}
                  </span>

                  <div className="space-y-2 text-xs text-slate-700 mb-4">
                    <div>
                      <strong className="text-slate-900">المستفيد:</strong> {sec.beneficiary_ar}
                    </div>
                    <div>
                      <strong className="text-slate-900">الأقسام:</strong> {sec.departments_ar}
                    </div>
                    <div className="rounded-lg bg-sky-50/60 p-2.5 text-[11px] text-sky-900 border border-sky-100">
                      ⚖️ {sec.statutory_ar}
                    </div>
                  </div>
                </div>

                <Link
                  href={sec.href}
                  className="rounded-xl border border-sky-300 bg-white py-2 text-center text-xs font-bold text-sky-900 hover:bg-sky-50 transition"
                >
                  بدء تسجيل تذكرة في هذا القطاع ←
                </Link>
              </div>
            ))}

            {/* B2B Demo Card */}
            <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/40 p-6 flex flex-col justify-between text-right">
              <div>
                <span className="text-3xl mb-3 block">💼</span>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  ترغب في تخصيص المنظومة لمؤسستك؟
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  نوفر إعداداً مخصصاً (White-label) باسم وشعار مؤسستك، مع ربط كامل بالهيكل الإداري والأقسام ولائحة الـ SLA الخاصة بكم.
                </p>
              </div>

              {demoRequested ? (
                <div className="rounded-xl bg-emerald-100 p-3 text-center text-xs font-bold text-emerald-800">
                  ✓ تم تسجيل طلبك! سيتواصل معك فريق الدعم المؤسسي.
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setDemoRequested(true)}
                  className="rounded-xl bg-sky-800 py-2.5 text-center text-xs font-bold text-white hover:bg-sky-900 transition shadow-xs"
                >
                  طلب استشارة وعرض توضيحي (Request Demo)
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6. Legal & Security Compliance Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 px-4">
        <div className="mx-auto max-w-7xl sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <MurafiqLogo size="sm" showText={false} />
            <span className="font-bold text-slate-700">
              منظومة مُرافِق إنتربرايز (Murafiq Enterprise)
            </span>
            <span>— جميع الحقوق محفوظة © 2026</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
            <span>🔒 معزول طبقاً لقانون 151 لسنة 2020</span>
            <span>•</span>
            <span>📄 تقارير معتمدة ببصمة SHA-256</span>
            <span>•</span>
            <span>⏱ اتفاقيات مستوى الخدمة (SLA)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
