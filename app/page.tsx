"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";

const SECTOR_CARDS = [
  {
    icon: "🏫",
    title_ar: "المدارس والتعليم قبل الجامعي",
    title_en: "Schools & K-12",
    audience_ar: "أولياء الأمور، الطلاب، والإدارة المدرسية",
    features_ar: "متابعة الحافلات، شؤون الطلاب، أقساط المصروفات، والانضباط التربوي",
    link: "/onboarding",
  },
  {
    icon: "🎓",
    title_ar: "الجامعات والتعليم العالي",
    title_en: "Universities & Higher Ed",
    audience_ar: "الطلاب الجامعيون، الباحثون، وأعضاء هيئة التدريس",
    features_ar: "الالتماسات الأكاديمية، لجان الكنترول، الساعات المعتمدة، والإسكان الطلابي",
    link: "/onboarding",
  },
  {
    icon: "🏥",
    title_ar: "المستشفيات والرعاية الصحية",
    title_en: "Hospitals & Healthcare",
    audience_ar: "المرضى، المراجعون، وعلاقات الرعاية الطبية",
    features_ar: "مواعيد العيادات، الفوترة والتأمين الصحي، معايير الجودة وسلامة المرضى",
    link: "/onboarding",
  },
  {
    icon: "🏛️",
    title_ar: "الهيئات والخدمات العامة",
    title_en: "Government & Public Services",
    audience_ar: "المواطنون، أصحاب المعاملات، والمكاتب التنفيذية",
    features_ar: "خدمة المواطنين، التوثيق، التحصيل، ومتابعة اتفاقيات الـ SLA للمصالح",
    link: "/onboarding",
  },
  {
    icon: "🏢",
    title_ar: "الشركات والمؤسسات التجارية",
    title_en: "Commercial Enterprises & Telecom",
    audience_ar: "العملاء، المشتركون، ومراكز الدعم الفني",
    features_ar: "خدمة العملاء، مطالبات الضمان والاسترجاع، الفوترة، والدعم المتقدم",
    link: "/onboarding",
  },
];

const RESOLUTION_CYCLE = [
  {
    step: "01",
    title_ar: "الاستقبال الذكي (Receive)",
    title_en: "Intake & Identification",
    desc_ar: "نماذج مؤمنة بحقول مخصصة لكل قطاع، عزل مشفر لبيانات الهوية (PII)، وتوليد رقم تتبع فريد.",
  },
  {
    step: "02",
    title_ar: "التوجيه والفرز (Assign)",
    title_en: "Triage & Smart Routing",
    desc_ar: "إحالة آلية للإدارة المختصة عبر محرك سير العمل (Workflows) واقتراحات الذكاء الاصطناعي.",
  },
  {
    step: "03",
    title_ar: "الحل وخطة العمل (Resolve)",
    title_en: "Execution & SLA Milestones",
    desc_ar: "مؤقت تنازلي دقيق للـ SLA، اعتماد خطة عمل محددة المراحل، وتواصل ثنائي مباشر مع المستفيد.",
  },
  {
    step: "04",
    title_ar: "القياس والتحسين (Measure)",
    title_en: "Quality, CSAT & Prevention",
    desc_ar: "تقييم الرضا النهائي، استنتاجات AI للأسباب الجذرية، وتوليد تقارير رسمية ببصمة SHA-256.",
  },
];

const CAPABILITIES = [
  { icon: "🏢", title: "بيئة معزولة لكل مؤسسة (Multi-Tenant)", desc: "عزل تام لقواعد البيانات والملفات الخاصة بكل عميل دون أي تداخل." },
  { icon: "⏱️", title: "مؤقتات SLA دقيقة وقابلة للتخصيص", desc: "ضبط ساعات الاستجابة والحسم حسب أولوية الحالة وساعات العمل الرسمية." },
  { icon: "⚡", title: "محرك أتمتة مسارات العمل (Workflow Builder)", desc: "برمجة شروط التوجيه والتصعيد الآلي عند تحقق معايير محددة." },
  { icon: "🤖", title: "مساعد حسم المشكلات بالذكاء الاصطناعي", desc: "تلخيص الحالة، اقتراح القسم، فحص النواقص، وتوليد مسودة الرد المؤسسي." },
  { icon: "🎨", title: "تخصيص الهوية الكامل (White-Label)", desc: "شعارك، ألوانك، نصوصك، وعنوان بوابتك المخصصة (Custom Domain)." },
  { icon: "🔌", title: "مركز التكامل المؤسسي (Integrations)", desc: "ربط فوري مع Microsoft Entra ID، WhatsApp Business، و SAP / SIS." },
  { icon: "🛡️", title: "سجل العمليات والمراجعة (Audit Log)", desc: "توثيق غير قابل للتعديل لجميع العمليات الإدارية لضمان الحوكمة والامتثال." },
  { icon: "📄", title: "تقارير PDF رسمية معتمدة رقمياً", desc: "استخراج ملفات رسمية شاملة لكافة الإجراءات ببصمة أمان إلكترونية." },
];

export default function HomePage() {
  const router = useRouter();
  const [trackingNumber, setTrackingNumber] = useState("");
  const [demoModalOpen, setDemoModalOpen] = useState(false);
  const [demoSubmitted, setDemoSubmitted] = useState(false);

  // Demo form fields
  const [demoName, setDemoName] = useState("");
  const [demoEmail, setDemoEmail] = useState("");
  const [demoOrg, setDemoOrg] = useState("");
  const [demoSector, setDemoSector] = useState("EDUCATION_SCHOOLS");
  const [demoPhone, setDemoPhone] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = trackingNumber.trim();
    if (clean) {
      router.push(`/cases/${clean}`);
    }
  };

  const handleDemoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDemoSubmitted(true);
    setTimeout(() => {
      setDemoSubmitted(false);
      setDemoModalOpen(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      {/* 1. Global Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-95 transition flex items-center gap-2">
              <MurafiqLogo size="md" />
              <div>
                <span className="block text-xs font-black text-teal-900 uppercase tracking-wider font-sans">
                  Murafiq Enterprise
                </span>
                <span className="text-[10px] text-slate-400 block font-sans">Case & Resolution Platform</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-700">
            <a href="#sectors" className="hover:text-teal-800 transition">القطاعات المؤسسية</a>
            <a href="#how-it-works" className="hover:text-teal-800 transition">دورة العمل (Cycle)</a>
            <a href="#capabilities" className="hover:text-teal-800 transition">المزايا والقدرات</a>
            <a href="#integrations" className="hover:text-teal-800 transition">التكاملات والأنظمة</a>
            <Link href="/portal/integrations" className="hover:text-teal-800 transition">بوابة المطور والـ APIs</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 text-xs">
            <Link
              href="/portal/dashboard"
              className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              دخول الإدارة
            </Link>
            <button
              onClick={() => setDemoModalOpen(true)}
              className="rounded-xl bg-teal-700 px-4 py-2 font-bold text-white hover:bg-teal-800 transition shadow-xs"
            >
              طلب عرض تجريبي (Demo)
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-20 px-4">
        <div className="mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-4 py-1 text-xs font-bold text-teal-900 mb-6 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            <span>Enterprise Case & Resolution Management Platform</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight mb-4">
            مُرافِق Enterprise
          </h1>

          <p className="text-lg sm:text-2xl font-bold text-teal-800 max-w-3xl mx-auto mb-3">
            Manage every complaint, request, case, and resolution in one institutional system.
          </p>

          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            حوّل كافة الشكاوى والمقترحات والطلبات إلى حالات مؤمنة ذات مسؤول معتمد، ومؤقت SLA تنازلي، وخطة عمل مرحلية، ونتائج قابلة للقياس والتحسين المستمر.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center items-center gap-3.5 mb-10">
            <button
              onClick={() => setDemoModalOpen(true)}
              className="rounded-xl bg-teal-700 px-7 py-3.5 text-sm font-bold text-white hover:bg-teal-800 transition shadow-md"
            >
              طلب عرض توضيحي للمؤسسة (Request Demo) ←
            </button>
            <Link
              href="/onboarding"
              className="rounded-xl border-2 border-teal-700 bg-white px-7 py-3.5 text-sm font-bold text-teal-800 hover:bg-teal-50 transition"
            >
              🚀 إطلاق بيئة مؤسستك الآن (Onboarding Wizard)
            </Link>
          </div>

          {/* Ticket Tracker Input */}
          <div className="mx-auto max-w-lg">
            <form onSubmit={handleTrack} className="rounded-2xl border-2 border-slate-200 bg-slate-50/80 p-2 shadow-xs flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600 px-2 shrink-0">🔍 تتبع حالة:</span>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="أدخل رقم المرجع (مثال: MRF-2026-48219)"
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono font-bold focus:border-teal-700 focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-xl bg-teal-800 px-4 py-1.5 text-xs font-bold text-white hover:bg-teal-900 transition shrink-0"
              >
                تتبع
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 3. For Organizations: Sectors Showcase */}
      <section id="sectors" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-7xl">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold font-mono uppercase text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              For Organizations
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-2">
              مصمم ليلائم الهيكل التشغيلي لكافة القطاعات
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              سواء كنت مدرسة، جامعة، شبكة مستشفيات، جهة حكومية أو شركة كبرى — لكل مؤسسة بيئة منفصلة بهويتها وأقسامها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {SECTOR_CARDS.map((card, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="text-3xl mb-3">{card.icon}</div>
                  <h3 className="font-bold text-sm text-slate-900 mb-0.5">{card.title_ar}</h3>
                  <span className="text-[11px] font-mono text-slate-400 block mb-2">{card.title_en}</span>
                  <div className="text-xs text-teal-800 font-bold mb-2">{card.audience_ar}</div>
                  <p className="text-xs text-slate-500 leading-relaxed">{card.features_ar}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-100">
                  <Link
                    href={card.link}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center justify-between"
                  >
                    <span>تهيئة البيئة</span>
                    <span>←</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works (The 4-Step Resolution Cycle) */}
      <section id="how-it-works" className="py-16 px-4 bg-white border-b border-slate-200">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold font-mono uppercase text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              How It Works
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-2">
              دورة حسم الحالات المؤسسية: من التسجيل إلى التقييم
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Receive → Assign → Resolve → Measure
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {RESOLUTION_CYCLE.map((cycle, idx) => (
              <div key={idx} className="relative p-6 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-2xl font-black text-teal-700 font-mono mb-2">{cycle.step}</div>
                <h3 className="font-bold text-base text-slate-900 mb-1">{cycle.title_ar}</h3>
                <span className="text-[11px] font-mono text-slate-400 block mb-3">{cycle.title_en}</span>
                <p className="text-xs text-slate-600 leading-relaxed">{cycle.desc_ar}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Core Capabilities */}
      <section id="capabilities" className="py-16 px-4 bg-slate-50 border-b border-slate-200">
        <div className="mx-auto max-w-6xl">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold font-mono uppercase text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200">
              Core Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 mb-2">
              القدرات المتقدمة للمنظومة المؤسسية
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              أدوات تشغيلية متكاملة تمنح إدارتك السيطرة والشفافية وتختصر وقت حل المشكلات بنسبة 60%.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {CAPABILITIES.map((cap, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs">
                <div className="text-2xl mb-2">{cap.icon}</div>
                <h3 className="font-bold text-sm text-slate-900 mb-1.5">{cap.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{cap.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Enterprise Integration Teaser */}
      <section id="integrations" className="py-16 px-4 bg-slate-900 text-white">
        <div className="mx-auto max-w-5xl text-center space-y-6">
          <span className="text-xs font-bold font-mono uppercase text-teal-400 bg-teal-950 px-3 py-1 rounded-full border border-teal-800">
            Enterprise Integration
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            Connect Murafiq to your existing systems.
          </h2>
          <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            لا تحتاج لتغيير أنظمتك القائمة. يعمل Murafiq جنباً إلى جنب مع مزودات الهوية، بوابات الدفع، قواعد بيانات الطلاب، وأنظمة المراسلات.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
            {[
              "Microsoft Entra ID",
              "Google Workspace",
              "WhatsApp Business API",
              "SAP ERP",
              "Salesforce",
              "Ellucian Banner (SIS)",
              "Epic / Cerner (HIS)",
              "REST APIs & Webhooks",
            ].map((name, idx) => (
              <span
                key={idx}
                className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold font-mono text-teal-300"
              >
                {name}
              </span>
            ))}
          </div>

          <div className="pt-6">
            <Link
              href="/portal/integrations"
              className="inline-block rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs px-6 py-3 transition shadow-lg"
            >
              استكشف مركز التكاملات وبوابة المطورين ←
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10 px-4 text-slate-400 text-xs text-center font-sans">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <MurafiqLogo size="sm" showText={false} />
            <span className="font-bold text-white">Murafiq Enterprise</span>
            <span>— Enterprise Resolution Suite</span>
          </div>
          <div>
            جميع الحقوق محفوظة © {new Date().getFullYear()} مُرافِق إنتربرايز.
          </div>
          <div className="flex items-center gap-4">
            <Link href="/onboarding" className="hover:text-white transition">Onboarding</Link>
            <Link href="/portal/super-admin" className="hover:text-white transition">Master Admin</Link>
            <Link href="/portal/integrations" className="hover:text-white transition">API Hub</Link>
          </div>
        </div>
      </footer>

      {/* Modal: Request Demo */}
      {demoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl text-right animate-fadeIn border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-black text-slate-900">طلب عرض تجريبي مخصص (Request Demo)</h3>
              <button onClick={() => setDemoModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <p className="text-xs text-slate-500 mb-6">
              سيتواصل معك فريق الحلول المؤسسية لإعداد جلسة استعراض حي لبيئة مؤسستك والإجابة على متطلبات الربط والـ SLA.
            </p>

            {demoSubmitted ? (
              <div className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <div className="text-3xl">✓</div>
                <div className="font-bold text-sm">تم استلام طلبك بنجاح!</div>
                <p className="text-xs text-emerald-700">سيتواصل معك أحد مستشارينا خلال يوم عمل واحد لتحديد موعد الجلسة.</p>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: د. شريف سامي"
                    value={demoName}
                    onChange={(e) => setDemoName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">البريد المؤسسي الرسمي *</label>
                    <input
                      type="email"
                      required
                      placeholder="name@organization.com"
                      value={demoEmail}
                      onChange={(e) => setDemoEmail(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">رقم الهاتف / واتساب *</label>
                    <input
                      type="tel"
                      required
                      placeholder="+201000000000"
                      value={demoPhone}
                      onChange={(e) => setDemoPhone(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">اسم المؤسسة أو الكيان *</label>
                    <input
                      type="text"
                      required
                      placeholder="اسم مدرستك / جامعتك / شركتك"
                      value={demoOrg}
                      onChange={(e) => setDemoOrg(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">القطاع</label>
                    <select
                      value={demoSector}
                      onChange={(e) => setDemoSector(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    >
                      <option value="EDUCATION_SCHOOLS">المدارس والتعليم قبل الجامعي</option>
                      <option value="HIGHER_EDUCATION">الجامعات والتعليم العالي</option>
                      <option value="HEALTHCARE_MEDICAL">المستشفيات والرعاية الصحية</option>
                      <option value="GOVERNMENT_PUBLIC">الخدمات والهيئات الحكومية</option>
                      <option value="COMMERCIAL_COMPANIES">الشركات والاتصالات</option>
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDemoModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-800 bg-slate-100"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-700 hover:bg-teal-800 text-white shadow-xs"
                  >
                    إرسال طلب العرض التجريبي 🚀
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
