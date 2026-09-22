"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import type { SectorType, SubscriptionPlanTier } from "@/types/database";

const STEPS = [
  { step: 1, title: "بيانات المؤسسة", desc: "Organization Profile" },
  { step: 2, title: "اختيار القطاع", desc: "Industry / Sector" },
  { step: 3, title: "الأقسام الإدارية", desc: "Departments" },
  { step: 4, title: "مصفوفة الأدوار", desc: "Roles & RBAC" },
  { step: 5, title: "سياسات الـ SLA", desc: "Response Windows" },
  { step: 6, title: "قوالب الحالات", desc: "Case Templates" },
  { step: 7, title: "الهوية والألوان", desc: "White-label Branding" },
  { step: 8, title: "قنوات التواصل", desc: "Integrations" },
  { step: 9, title: "دعوة الفريق", desc: "Invite Initial Staff" },
  { step: 10, title: "المراجعة والإطلاق", desc: "Ready to Launch" },
];

export default function TenantOnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [launchedOrgId, setLaunchedOrgId] = useState<string | null>(null);

  // Form states across the 10 steps
  // Step 1: Org Info
  const [orgNameAr, setOrgNameAr] = useState("مدرسة النيل الدولية");
  const [orgNameEn, setOrgNameEn] = useState("Nile International School");
  const [orgSlug, setOrgSlug] = useState("nile-school");
  const [supportEmail, setSupportEmail] = useState("care@nile-school.edu.eg");

  // Step 2: Sector
  const [sector, setSector] = useState<SectorType>("EDUCATION_SCHOOLS");

  // Step 3: Departments
  const [departments, setDepartments] = useState([
    { code: "STUDENT_AFFAIRS", name: "شؤون الطلاب والقيد", sla: 48 },
    { code: "ACADEMIC", name: "الشؤون التعليمية والأكاديمية", sla: 72 },
    { code: "FINANCE", name: "الحسابات والمصروفات", sla: 48 },
  ]);

  // Step 4: Roles structure
  const [enableOpsLead, setEnableOpsLead] = useState(true);
  const [enableObserver, setEnableObserver] = useState(true);

  // Step 5: SLA
  const [firstResponseHours, setFirstResponseHours] = useState(24);
  const [resolutionHours, setResolutionHours] = useState(120);

  // Step 6: Case templates
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([
    "استفسار أكاديمي",
    "شكوى حافلات النقل",
    "تأجيل مصروفات",
  ]);

  // Step 7: Branding
  const [primaryColor, setPrimaryColor] = useState("#0F766E");
  const [secondaryColor, setSecondaryColor] = useState("#1E293B");
  const [portalTitle, setPortalTitle] = useState("بوابة خدمة أولياء الأمور وحسم الحالات");

  // Step 8: Integrations
  const [enableWhatsApp, setEnableWhatsApp] = useState(true);
  const [enableEmail, setEnableEmail] = useState(true);
  const [enableSso, setEnableSso] = useState(false);

  // Step 9: Staff
  const [staffEmail1, setStaffEmail1] = useState("principal@nile-school.edu.eg");
  const [staffEmail2, setStaffEmail2] = useState("ops@nile-school.edu.eg");

  // Step 10: Launch
  const handleLaunch = async () => {
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/super-admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_ORGANIZATION",
          payload: {
            name_ar: orgNameAr,
            name_en: orgNameEn,
            slug: orgSlug,
            sector,
            plan: "ENTERPRISE",
            primary_color: primaryColor,
            support_email: supportEmail,
          },
        }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLaunchedOrgId(data.data.id);
      }
    } catch {
      alert("حدث خطأ أثناء إطلاق المؤسسة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-30 shadow-md">
        <div className="mx-auto max-w-6xl px-4 py-3 sm:px-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <MurafiqLogo size="md" />
            <div>
              <span className="block text-xs font-black text-teal-400 tracking-wider font-sans uppercase">
                Murafiq Enterprise Onboarding
              </span>
              <span className="text-[11px] text-slate-400">معالج إطلاق بيئة العمل المؤسسية</span>
            </div>
          </Link>
          <div className="text-xs font-mono text-slate-400">
            خطوة <span className="text-teal-400 font-bold">{currentStep}</span> من 10
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        {/* Stepper Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 10) * 100}%` }}
            ></div>
          </div>
          <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400 font-mono">
            <span>الخطوة {currentStep}: {STEPS[currentStep - 1]?.title}</span>
            <span>{Math.round((currentStep / 10) * 100)}% Complete</span>
          </div>
        </div>

        {/* Wizard Card */}
        <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl">
          {/* STEP 1: Organization Information */}
          {currentStep === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 01 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">البيانات التعريفية للمؤسسة</h2>
                <p className="text-xs text-slate-400">حدد الاسم الرسمي للمؤسسة والمعرف الفريد الذي سيخصص لنطاق عملك.</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المؤسسة (بالعربية) *</label>
                  <input
                    type="text"
                    required
                    value={orgNameAr}
                    onChange={(e) => setOrgNameAr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">اسم المؤسسة (بالإنجليزية)</label>
                  <input
                    type="text"
                    value={orgNameEn}
                    onChange={(e) => setOrgNameEn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">المعرف المختصر (Slug) *</label>
                    <input
                      type="text"
                      value={orgSlug}
                      onChange={(e) => setOrgSlug(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">بريد الدعم المؤسسي</label>
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Sector Selection */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 02 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">اختر القطاع التابع له المؤسسة</h2>
                <p className="text-xs text-slate-400">يحدد القطاع المصطلحات الافتراضية، الهيكل الإداري، وقوالب النماذج المناسبة.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "EDUCATION_SCHOOLS", icon: "🏫", title: "المدارس والتعليم قبل الجامعي", desc: "للأولياء، الطلاب، شؤون الطلاب والانضباط" },
                  { key: "HIGHER_EDUCATION", icon: "🎓", title: "الجامعات والتعليم العالي", desc: "للطلاب، الالتماسات الأكاديمية والكنترول" },
                  { key: "HEALTHCARE_MEDICAL", icon: "🏥", title: "المستشفيات والمراكز الطبية", desc: "لرعاية المرضى، الفوترة، ومعايير الجودة" },
                  { key: "GOVERNMENT_PUBLIC", icon: "🏛️", title: "الهيئات والخدمات العامة", desc: "لخدمة المواطنين والمعاملات الحكومية" },
                  { key: "COMMERCIAL_COMPANIES", icon: "🏢", title: "الشركات والاتصالات", desc: "لخدمة العملاء، الفوترة، وعقود الضمان" },
                ].map((s) => (
                  <div
                    key={s.key}
                    onClick={() => setSector(s.key as SectorType)}
                    className={`p-4 rounded-2xl border cursor-pointer transition ${
                      sector === s.key
                        ? "bg-teal-950/60 border-teal-500 shadow-lg shadow-teal-950/50"
                        : "bg-slate-950 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="font-bold text-white text-sm mb-1">{s.title}</div>
                    <div className="text-xs text-slate-400">{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Departments */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 03 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">الهيكل الإداري والأقسام</h2>
                <p className="text-xs text-slate-400">قمنا باقتراح الأقسام الأكثر استخداماً لقطاعك مع إمكانية التعديل لاحقاً.</p>
              </div>

              <div className="space-y-3">
                {departments.map((d, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-white text-sm">{d.name}</div>
                      <div className="text-xs text-slate-500 font-mono">Code: {d.code}</div>
                    </div>
                    <span className="text-xs font-mono text-teal-400 font-bold">SLA: {d.sla}h</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: Roles & RBAC */}
          {currentStep === 4 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 04 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">أدوار الفريق والصلاحيات</h2>
                <p className="text-xs text-slate-400">تحديد مستويات الوصول للأعضاء داخل بيئة المؤسسة.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-sm">تفعيل رئيس العمليات (OPS_LEAD)</div>
                    <div className="text-xs text-slate-400">مسؤول عن الفرز المبدئي وتعيين الأقسام واعتماد خطط العمل</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableOpsLead}
                    onChange={(e) => setEnableOpsLead(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-sm">تفعيل المراقب والمراجع (OBSERVER)</div>
                    <div className="text-xs text-slate-400">لجان المراجعة والتدقيق الخارجي للاطلاع على التقارير دون تعديل</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableObserver}
                    onChange={(e) => setEnableObserver(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 5: SLA Policies */}
          {currentStep === 5 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 05 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">سياسات ومواعيد الاستجابة (SLA)</h2>
                <p className="text-xs text-slate-400">حدد المهل الزمنية القصوى التي تلتزم بها مؤسستك لتقديم الحلول للمستفيدين.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">أقصى مهلة للرد المبدئي (ساعات)</label>
                  <input
                    type="number"
                    value={firstResponseHours}
                    onChange={(e) => setFirstResponseHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المهلة القصوى للحسم والحل (ساعات)</label>
                  <input
                    type="number"
                    value={resolutionHours}
                    onChange={(e) => setResolutionHours(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Case Categories & Templates */}
          {currentStep === 6 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 06 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">قوالب وتصنيفات الحالات</h2>
                <p className="text-xs text-slate-400">اختر القوالب الجاهزة التي ستظهر للمستفيد في استمارة التسجيل.</p>
              </div>

              <div className="space-y-2">
                {["استفسار أكاديمي", "شكوى حافلات النقل", "تأجيل مصروفات", "ملاحظة بيئية أو سلوكية"].map((tmpl) => (
                  <label key={tmpl} className="flex items-center gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedTemplates.includes(tmpl)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedTemplates([...selectedTemplates, tmpl]);
                        else setSelectedTemplates(selectedTemplates.filter((t) => t !== tmpl));
                      }}
                      className="w-4 h-4 text-teal-600 rounded"
                    />
                    <span className="text-xs font-bold text-white">{tmpl}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: Branding & White-labeling */}
          {currentStep === 7 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 07 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">تخصيص الهوية والألوان (White-label)</h2>
                <p className="text-xs text-slate-400">تظهر هذه الألوان والنصوص على بوابة المستفيد والتقارير الرسمية.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اللون الأساسي</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-9 bg-transparent rounded cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{primaryColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">اللون الثانوي</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-9 bg-transparent rounded cursor-pointer"
                      />
                      <span className="text-xs font-mono text-slate-300">{secondaryColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">عنوان البوابة للمستفيدين</label>
                  <input
                    type="text"
                    value={portalTitle}
                    onChange={(e) => setPortalTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 8: Integrations */}
          {currentStep === 8 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 08 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">قنوات التواصل والربط التقني</h2>
                <p className="text-xs text-slate-400">حدد القنوات التي ترغب في تفعيلها لإرسال التحديثات للمستفيدين.</p>
              </div>

              <div className="space-y-3">
                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-sm">تفعيل رسائل WhatsApp Cloud الرسمية</div>
                    <div className="text-xs text-slate-400">إشعار المستفيد برابط التتبع فورياً على هاتفه</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableWhatsApp}
                    onChange={(e) => setEnableWhatsApp(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
                  <div>
                    <div className="font-bold text-white text-sm">تفعيل إشعارات البريد الإلكتروني الرسمية</div>
                    <div className="text-xs text-slate-400">إرسال تقارير المتابعة والاعتماد المؤسسي</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableEmail}
                    onChange={(e) => setEnableEmail(e.target.checked)}
                    className="w-4 h-4 text-teal-600 rounded"
                  />
                </label>
              </div>
            </div>
          )}

          {/* STEP 9: Invite Initial Staff */}
          {currentStep === 9 && (
            <div className="space-y-5 animate-fadeIn">
              <div>
                <span className="text-xs font-mono text-teal-400 font-bold uppercase">Step 09 / 10</span>
                <h2 className="text-xl font-bold text-white mt-1">دعوة فريق العمل الأساسي</h2>
                <p className="text-xs text-slate-400">أدخل البريد الإلكتروني للمسؤولين لبدء تشغيل النظام معهم فوراً.</p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">المدير التنفيذي / مدير المؤسسة</label>
                  <input
                    type="email"
                    value={staffEmail1}
                    onChange={(e) => setStaffEmail1(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">رئيس العمليات / مسؤول الفرز</label>
                  <input
                    type="email"
                    value={staffEmail2}
                    onChange={(e) => setStaffEmail2(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Ready to Launch */}
          {currentStep === 10 && (
            <div className="space-y-5 animate-fadeIn text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 text-emerald-400 text-3xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-950/50">
                🚀
              </div>
              <h2 className="text-2xl font-black text-white">المؤسسة جاهزة تماماً للإطلاق!</h2>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                تم ضبط كافة معايير العزل، الهوية المؤسسية، سياسات الـ SLA، وهيكل الأقسام بنجاح.
              </p>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-right max-w-md mx-auto text-xs space-y-2 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">المؤسسة:</span>
                  <span className="text-white font-bold">{orgNameAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">القطاع:</span>
                  <span className="text-teal-400">{sector}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">رابط البوابة المخصص:</span>
                  <span className="text-emerald-400">https://cases.{orgSlug}.murafiq.app</span>
                </div>
              </div>

              {launchedOrgId && (
                <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-700 text-emerald-200 text-xs font-bold animate-fadeIn">
                  ✓ تم تفعيل البيئة بنجاح! جاري تحويلك إلى لوحة الإعدادات المؤسسية...
                </div>
              )}
            </div>
          )}

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-6 mt-8 border-t border-slate-800">
            {currentStep > 1 && !launchedOrgId ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="px-5 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition"
              >
                ← الخطوة السابقة
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="px-6 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-500 text-white shadow-lg transition"
              >
                متابعة الخطوة التالية ←
              </button>
            ) : launchedOrgId ? (
              <Link
                href={`/portal/admin?institutionId=${launchedOrgId}`}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition inline-block"
              >
                الدخول لمركز إعدادات المؤسسة 🚀
              </Link>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleLaunch}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl transition"
              >
                {isSubmitting ? "جاري تهيئة البيئة وتفعيل الـ Tenant..." : "إطلاق بيئة المؤسسة الآن 🚀"}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
