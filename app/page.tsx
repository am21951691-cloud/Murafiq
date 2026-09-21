import React from "react";
import Link from "next/link";
import { SAMPLE_ENTITIES } from "@/lib/services/entities";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";

const SECTORS = [
  {
    key: "EDUCATION_SCHOOLS",
    href: "/directory?sector=EDUCATION_SCHOOLS",
    title_ar: "المدارس والتعليم قبل الجامعي",
    title_en: "Pre-University Schools",
    icon: "🏫",
    desc: "المدارس الحكومية، الرسمية لغات، الخاصة، والدولية (IGCSE, American, IB)",
    sampleCase: "تنظيم الرسوم المدرسية، حظر الزيادات، وانضباط الحافلات",
  },
  {
    key: "HIGHER_EDUCATION",
    href: "/directory?sector=HIGHER_EDUCATION",
    title_ar: "الجامعات والتعليم العالي",
    title_en: "Higher Education & Universities",
    icon: "🎓",
    desc: "الجامعات الحكومية، الأهلية، الخاصة، التكنولوجية، والمعاهد العليا المعتمدة",
    sampleCase: "تسجيل الساعات المعتمدة، استخراج السجلات الأكاديمية، والمدن الجامعية",
  },
  {
    key: "GOVERNMENT_PUBLIC",
    href: "/directory?sector=GOVERNMENT_PUBLIC",
    title_ar: "الخدمات الحكومية والهيئات",
    title_en: "Government & Public Services",
    icon: "🏛️",
    desc: "مكاتب الشهر العقاري، البريد المصري، قطاع الأحوال المدنية، وإجراءات المرور",
    sampleCase: "متابعة مؤشرات إنجاز المعاملات (SLA) وبوابات الدفع الرقمي",
  },
  {
    key: "COMMERCIAL_COMPANIES",
    href: "/directory?sector=COMMERCIAL_COMPANIES",
    title_ar: "الشركات والخدمات التجارية",
    title_en: "Commercial Companies & Telecom",
    icon: "🏢",
    desc: "شركات الاتصالات والإنترنت، خدمات ما بعد البيع، المتاجر المعتمدة، والمرافق",
    sampleCase: "تطبيق قانون حماية المستهلك 181/2018، استرجاع 14 يوماً والضمان",
  },
  {
    key: "HEALTHCARE_MEDICAL",
    href: "/directory?sector=HEALTHCARE_MEDICAL",
    title_ar: "المنشآت الصحية والمستشفيات",
    title_en: "Healthcare & Hospitals",
    icon: "🏥",
    desc: "المستشفيات الخاصة، المستشفيات الجامعية، المراكز التخصصية، ووحدات الرعاية",
    sampleCase: "الرعاية الطبية الطارئة، تفصيل الفواتير، ونسب تحمل التأمين الصحي",
  },
];

// Highlighted featured entities across sectors
const FEATURED_ENTITIES = [
  {
    name: "جامعة القاهرة (Cairo University)",
    slug: "cairo-university",
    href: "/services/cairo-university",
    sectorLabel: "جامعة حكومية",
    governorate: "الجيزة",
    icon: "🎓",
    bars: "3.9",
  },
  {
    name: "الهيئة القومية للبريد — منطقة القاهرة",
    slug: "egypt-post-cairo",
    href: "/services/egypt-post-cairo",
    sectorLabel: "هيئة قومية",
    governorate: "القاهرة",
    icon: "🏛️",
    bars: "3.8",
  },
  {
    name: "شركة فودافون مصر للاتصالات",
    slug: "vodafone-egypt",
    href: "/services/vodafone-egypt",
    sectorLabel: "اتصالات وإنترنت",
    governorate: "الجيزة",
    icon: "🏢",
    bars: "4.1",
  },
  {
    name: "مستشفى السلام الدولي بالمعادي",
    slug: "as-salam-international-hospital",
    href: "/services/as-salam-international-hospital",
    sectorLabel: "مستشفى خاص معتمد",
    governorate: "القاهرة",
    icon: "🏥",
    bars: "4.6",
  },
  {
    name: "مدرسة سان جورج للغات",
    slug: "st-george-language-school",
    href: "/schools/st-george-language-school",
    sectorLabel: "مدرسة خاصة لغات",
    governorate: "القاهرة",
    icon: "🏫",
    bars: "4.5",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right" dir="rtl">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition">
              <MurafiqLogo size="md" />
            </Link>
          </div>

          {/* Navigation Links to All Pages */}
          <nav className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-700">
            <Link
              href="/directory"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              🌐 الدليل الوطني للجهات
            </Link>
            <Link
              href="/schools"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              🏫 المدارس
            </Link>
            <Link
              href="/directory?sector=HIGHER_EDUCATION"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              🎓 الجامعات
            </Link>
            <Link
              href="/directory?sector=GOVERNMENT_PUBLIC"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              🏛️ الخدمات الحكومية
            </Link>
            <Link
              href="/directory?sector=COMMERCIAL_COMPANIES"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              🏢 الشركات
            </Link>
            <Link
              href="/directory?sector=HEALTHCARE_MEDICAL"
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-sky-800 transition"
            >
              🏥 المنشآت الصحية
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/portal/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
            >
              بوابة الجهات والمؤسسات
            </Link>
            <Link
              href="/cases/new"
              className="rounded-xl bg-sky-700 px-4 py-2 font-bold text-white hover:bg-sky-800 transition shadow-xs"
            >
              + تقديم حالة / شكوى
            </Link>
          </div>
        </div>
      </header>

      {/* 2. Hero Banner */}
      <section className="bg-white border-b border-slate-200 py-16 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-sky-50 border border-sky-200 px-3.5 py-1 text-xs font-bold text-sky-800 mb-6 shadow-2xs">
            <span>⚖️ منظومة موحدة متوافقة مع قانون حماية البيانات الشخصية رقم 151 لسنة 2020</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight max-w-3xl mx-auto leading-tight">
            الحل المؤسسي المنصف والشفاف لمختلف الخدمات في مصر
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            منظومة مُرافِق توفر وساطة محايدة وموثقة بين المواطنين والمستفيدين وبين المؤسسات والجهات عبر 5 قطاعات وطنية، مع مهلة حل خاصة مدتها 7 أيام ومؤشرات تسوية بايـزية علمية.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/cases/new"
              className="rounded-2xl bg-sky-800 px-8 py-3.5 text-base font-bold text-white hover:bg-sky-900 transition shadow-sm"
            >
              تقديم حالة أو شكوى جديدة ←
            </Link>
            <Link
              href="/directory"
              className="rounded-2xl border-2 border-slate-300 bg-white px-8 py-3.5 text-base font-bold text-slate-800 hover:bg-slate-50 transition"
            >
              تصفح الدليل الوطني الموحد (5 قطاعات)
            </Link>
          </div>
        </div>
      </section>

      {/* 3. The 5 National Sectors Gateway */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-xs font-extrabold text-sky-700 tracking-wider uppercase block mb-1">
              التغطية الوطنية الشاملة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              اختر القطاع للتصفح أو تقديم الشكوى
            </h2>
          </div>
          <Link
            href="/directory"
            className="text-xs font-bold text-sky-800 hover:underline mt-2 md:mt-0"
          >
            عرض كافة الجهات والمسجلين في المنظومة ({SAMPLE_ENTITIES.length}+ جهة) ←
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SECTORS.map((sec) => (
            <div
              key={sec.key}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs hover:shadow-md hover:border-sky-300 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{sec.icon}</span>
                  <span className="rounded-md bg-slate-100 text-slate-600 px-2 py-0.5 text-[10px] font-bold">
                    قطاع معتمد
                  </span>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mb-1">
                  {sec.title_ar}
                </h3>
                <span className="text-[11px] text-slate-400 block mb-3 font-sans">
                  {sec.title_en}
                </span>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  {sec.desc}
                </p>

                <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-700 border border-slate-100 mb-4">
                  <span className="font-bold text-slate-500 block text-[10px] mb-0.5">
                    أمثلة القضايا الخاضعة للحل:
                  </span>
                  {sec.sampleCase}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href={sec.href}
                  className="font-bold text-sky-800 hover:text-sky-950 transition flex items-center gap-1"
                >
                  تصفح الجهات ←
                </Link>
                <Link
                  href={`/cases/new?sector=${sec.key}`}
                  className="rounded-lg bg-sky-50 px-3 py-1 font-bold text-sky-700 hover:bg-sky-100 transition"
                >
                  تقديم شكوى
                </Link>
              </div>
            </div>
          ))}

          {/* Special Quick-Link Card: Portal for Institutions */}
          <div className="rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">🛡️</span>
                <span className="rounded-md bg-sky-200 text-sky-900 px-2 py-0.5 text-[10px] font-bold">
                  لممثلي الجهات
                </span>
              </div>
              <h3 className="text-lg font-extrabold text-sky-950 mb-2">
                بوابة مسؤولي وممثلي الجهات
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed mb-4">
                لوحة تشغيل مخصصة لإدارات خدمة المواطنين ورعاية العملاء لمتابعة مهلة الـ 7 أيام (Private Grace)، بناء خطط العمل المعيارية، وتحقيق أعلى مؤشر تسوية بايـزي.
              </p>
            </div>
            <Link
              href="/portal/dashboard"
              className="w-full text-center rounded-xl bg-sky-800 px-4 py-2.5 font-bold text-xs text-white hover:bg-sky-900 transition shadow-2xs"
            >
              الدخول للوحة الفرز والإدارة (Portal)
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Featured Entities Showcase */}
      <section className="bg-white border-y border-slate-200 py-16 px-4">
        <div className="mx-auto max-w-7xl sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider block mb-1">
              الشفافية وسرعة الاستجابة
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              جهات معتمدة ذات استجابة موثقة
            </h2>
            <p className="text-xs text-slate-500 mt-2">
              يمكنك زيارة الملف الكامل لأي جهة للاطلاع على نسبة الحل المؤكد وسرعة الاستجابة باليوم وحالات المراجعة المنقحة.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {FEATURED_ENTITIES.map((ent) => (
              <Link
                key={ent.slug}
                href={ent.href}
                className="group rounded-2xl border border-slate-200 bg-slate-50/50 p-4 hover:bg-white hover:shadow-md hover:border-sky-300 transition text-center flex flex-col justify-between"
              >
                <div>
                  <span className="text-3xl block mb-2">{ent.icon}</span>
                  <span className="inline-block rounded-md bg-white border border-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 mb-2">
                    {ent.sectorLabel}
                  </span>
                  <h3 className="text-xs font-extrabold text-slate-900 group-hover:text-sky-800 transition line-clamp-2 mb-1">
                    {ent.name}
                  </h3>
                  <span className="text-[10px] text-slate-400 block mb-3">
                    {ent.governorate}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200/60">
                  <span className="block text-[10px] text-slate-400">مؤشر BARS المعتمد</span>
                  <span className="block text-base font-black text-sky-800">
                    {ent.bars} / 5.0
                  </span>
                  <span className="text-[10px] text-sky-700 font-bold group-hover:underline block mt-1">
                    عرض الملف ←
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Four Architectural Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            أركان الأمان والموثوقية في منصة مُرافِق
          </h2>
          <p className="text-xs text-slate-600 mt-2">
            بنيت المنصة بأعلى المعايير القانونية والأمنية لحفظ حقوق جميع الأطراف.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-right">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-black text-lg mb-3">
              1
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-1.5">
              عزل تام للبيانات الشخصية
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              عزل فيزيائي مشفر لبيانات الهوية والهواتف وأرقام الحسابات والملفات الطبية طبقاً للقانون 151 لسنة 2020.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-black text-lg mb-3">
              2
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-1.5">
              مهلة خاصة 7 أيام (Private Grace)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              مهلة نظامية تمنح الجهة فرصة للحل الودي قبل أي ظهور عام أو اتخاذ إجراءات رسمية.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center font-black text-lg mb-3">
              3
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-1.5">
              مؤشر بايـزي موزن للقطاع (BARS)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تقييم إحصائي علمي يحسب بدقة دون مقارنة ظالمة بين قطاعات متباينة (مثل المستشفيات والاتصالات).
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-800 flex items-center justify-center font-black text-lg mb-3">
              4
            </div>
            <h3 className="text-sm font-extrabold text-slate-800 mb-1.5">
              استدلال قانوني موثق (Statutory RAG)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ربط كل حالة بالقرارات الوزارية وقوانين حماية المستهلك والخدمة المدنية المعتمدة بمراجعة بشرية.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Comprehensive Multi-Page Navigation Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 px-4 text-xs text-slate-600">
        <div className="mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-3">
              <MurafiqLogo size="sm" />
            </div>
            <p className="text-slate-500 leading-relaxed">
              المنظومة الوطنية المعتمدة لتسوية الشكاوى والنزاعات وحماية حقوق المستفيدين والمؤسسات في مصر.
            </p>
            <p className="text-[11px] text-slate-400 mt-3">
              جميع الحقوق محفوظة © 2026 مُرافِق.
            </p>
          </div>

          {/* Directory & Services Links */}
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3 text-sm">
              أقسام الدليل والخدمات
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/directory" className="hover:text-sky-800 transition">
                  🌐 الدليل الوطني العام لكافة القطاعات
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-sky-800 transition">
                  🏢 دليل الخدمات والجهات
                </Link>
              </li>
              <li>
                <Link href="/schools" className="hover:text-sky-800 transition">
                  🏫 دليل المدارس ومؤشرات التعليم قبل الجامعي
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?sector=HIGHER_EDUCATION"
                  className="hover:text-sky-800 transition"
                >
                  🎓 دليل الجامعات والتعليم العالي
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?sector=GOVERNMENT_PUBLIC"
                  className="hover:text-sky-800 transition"
                >
                  🏛️ دليل المصالح والهيئات الحكومية
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?sector=COMMERCIAL_COMPANIES"
                  className="hover:text-sky-800 transition"
                >
                  🏢 دليل الشركات والخدمات التجارية
                </Link>
              </li>
              <li>
                <Link
                  href="/directory?sector=HEALTHCARE_MEDICAL"
                  className="hover:text-sky-800 transition"
                >
                  🏥 دليل المنشآت الطبية والصحية
                </Link>
              </li>
            </ul>
          </div>

          {/* Operations & Intake Links */}
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3 text-sm">
              إدارة الشكاوى وحلقات الحل
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/cases/new" className="hover:text-sky-800 font-bold text-sky-700 transition">
                  + تسجيل شكوى جديدة (معالج الحالات)
                </Link>
              </li>
              <li>
                <Link href="/portal/dashboard" className="hover:text-sky-800 transition">
                  لوحة فرز ومتابعة القضايا للجهات (Portal)
                </Link>
              </li>
              <li>
                <Link
                  href="/services/st-george-language-school"
                  className="hover:text-sky-800 transition"
                >
                  نموذج ملف مدرسة معتمد
                </Link>
              </li>
              <li>
                <Link
                  href="/services/cairo-university"
                  className="hover:text-sky-800 transition"
                >
                  نموذج ملف جامعة معتمد
                </Link>
              </li>
              <li>
                <Link
                  href="/services/vodafone-egypt"
                  className="hover:text-sky-800 transition"
                >
                  نموذج ملف شركة تجارية معتمد
                </Link>
              </li>
              <li>
                <Link
                  href="/services/as-salam-international-hospital"
                  className="hover:text-sky-800 transition"
                >
                  نموذج ملف منشأة طبية معتمد
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Statutory Foundation */}
          <div>
            <h4 className="font-extrabold text-slate-900 mb-3 text-sm">
              المرجعيات القانونية المصرية
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-500">
              <li>• قانون حماية البيانات الشخصية رقم 151 لسنة 2020</li>
              <li>• قانون حماية المستهلك رقم 181 لسنة 2018</li>
              <li>• قرارات وزارة التربية والتعليم 187/2023 و 420/2014</li>
              <li>• قانون تنظيم الجامعات رقم 49 لسنة 1972</li>
              <li>• قانون الخدمة المدنية رقم 81 لسنة 2016</li>
              <li>• ميثاق حقوق المريض ولائحة آداب المهن الطبية</li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
