"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import type {
  TenantBranding,
  TenantSlaConfig,
  InstitutionStaffMember,
  SectorType,
  InstitutionStaffRole,
} from "@/types/database";
import type { StoredDepartment } from "@/lib/services/storage-adapter";
import { SAMPLE_ENTITIES, type SampleEntityRecord } from "@/lib/services/entities";

type AdminTab = "BRANDING" | "DEPARTMENTS" | "SLA" | "STAFF" | "TAXONOMY" | "API";

export default function OrganizationAdminPortal() {
  const [selectedEntityId, setSelectedEntityId] = useState<string>("00000000-0000-0000-0000-000000000010");
  const [activeTab, setActiveTab] = useState<AdminTab>("BRANDING");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tenant state
  const [branding, setBranding] = useState<TenantBranding>({
    primary_color: "#0F766E",
    secondary_color: "#1E293B",
    institution_short_name: "مدرسة القاهرة التجريبية الرسمية للغات",
    welcome_message_ar: "أهلاً بكم في البوابة الرسمية لإدارة الحالات والمقترحات وحل المشكلات",
    welcome_message_en: "Welcome to our Institutional Case & Resolution Portal",
    support_email: "support@cairo-school.edu.eg",
    support_phone: "+20227914000",
  });

  const [slaConfig, setSlaConfig] = useState<TenantSlaConfig>({
    first_response_hours: 24,
    action_plan_hours: 72,
    resolution_hours: 168,
    critical_resolution_hours: 24,
    high_resolution_hours: 48,
    medium_resolution_hours: 96,
    low_resolution_hours: 168,
    business_hours_start: "08:00",
    business_hours_end: "16:00",
  });

  const [departments, setDepartments] = useState<StoredDepartment[]>([]);
  const [staff, setStaff] = useState<InstitutionStaffMember[]>([]);
  const [sectorInfo, setSectorInfo] = useState<any>(null);

  // Modal / Form states
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptNameAr, setNewDeptNameAr] = useState("");
  const [newDeptNameEn, setNewDeptNameEn] = useState("");
  const [newDeptSla, setNewDeptSla] = useState(48);

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<InstitutionStaffRole>("STAFF");
  const [newStaffDept, setNewStaffDept] = useState("");

  const activeEntity: SampleEntityRecord | undefined = SAMPLE_ENTITIES.find(
    (e) => e.id === selectedEntityId
  );

  const loadAdminData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const sector = activeEntity?.sector || "EDUCATION_SCHOOLS";
      const res = await fetch(`/api/institution/admin?institutionId=${selectedEntityId}&sector=${sector}`);
      const result = await res.json();
      if (result.success && result.data) {
        setBranding(result.data.branding);
        setSlaConfig(result.data.slaConfig);
        setDepartments(result.data.departments || []);
        setSectorInfo(result.data.sectorInfo);
        if (result.data.staff) {
          setStaff(result.data.staff);
        }
      }
    } catch (err: any) {
      setErrorMessage("تعذر تحميل بيانات لوحة الإدارة");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEntityId]);

  const notifySuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_BRANDING",
          institutionId: selectedEntityId,
          payload: branding,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notifySuccess("تم حفظ الهوية المؤسسية بنجاح ✅");
      }
    } catch (err) {
      setErrorMessage("حدث خطأ أثناء حفظ الهوية");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSla = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_SLA",
          institutionId: selectedEntityId,
          payload: slaConfig,
        }),
      });
      const data = await res.json();
      if (data.success) {
        notifySuccess("تم تحديث سياسات مستوى الخدمة (SLA) بنجاح ✅");
      }
    } catch (err) {
      setErrorMessage("حدث خطأ أثناء تحديث سياسات SLA");
    } finally {
      setSaving(false);
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode || !newDeptNameAr) return;
    setSaving(true);
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_DEPARTMENT",
          institutionId: selectedEntityId,
          payload: {
            code: newDeptCode,
            name_ar: newDeptNameAr,
            name_en: newDeptNameEn || newDeptCode,
            default_sla_hours: Number(newDeptSla),
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => [...prev, data.data]);
        setNewDeptCode("");
        setNewDeptNameAr("");
        setNewDeptNameEn("");
        notifySuccess("تمت إضافة القسم الإداري بنجاح ✅");
      }
    } catch (err) {
      setErrorMessage("تعذر إضافة القسم");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDepartment = async (deptId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_DEPARTMENT",
          institutionId: selectedEntityId,
          payload: { deptId },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => prev.filter((d) => d.id !== deptId));
        notifySuccess("تم حذف القسم بنجاح");
      }
    } catch (err) {
      setErrorMessage("تعذر حذف القسم");
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail) return;
    setSaving(true);
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_STAFF",
          institutionId: selectedEntityId,
          payload: {
            name: newStaffName,
            email: newStaffEmail,
            role: newStaffRole,
            department_id: newStaffDept || null,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStaff((prev) => [...prev, data.data]);
        setNewStaffName("");
        setNewStaffEmail("");
        notifySuccess("تمت إضافة عضو فريق العمل بنجاح ✅");
      }
    } catch (err) {
      setErrorMessage("تعذر إضافة الموظف");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-civic-canvas py-8 px-4 sm:px-6 lg:px-8 font-arabic text-right">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between bg-white px-4 py-2.5 rounded-xl border border-slate-200 text-xs shadow-2xs">
          <div className="flex items-center gap-3 font-bold text-slate-700">
            <Link href="/" className="hover:opacity-90 transition flex items-center gap-1.5">
              <MurafiqLogo size="sm" showText={false} />
              <span className="text-sky-950 font-black">مُرافِق إنتربرايز</span>
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/portal/dashboard" className="hover:text-sky-800 transition">
              📋 لوحة الفرز
            </Link>
            <span className="text-slate-300">|</span>
            <Link href="/portal/analytics" className="hover:text-sky-800 transition">
              📊 مؤشرات الأداء (Analytics)
            </Link>
            <span className="text-slate-300">|</span>
            <span className="text-teal-800 font-extrabold bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
              ⚙️ إدارة المؤسسة (Org Admin)
            </span>
          </div>
          <div className="text-xs text-slate-500 font-medium">
            صلاحية التحكم: <span className="font-bold text-slate-800">مدير النظام المؤسسي (ADMIN)</span>
          </div>
        </div>

        {/* Alerts */}
        {successMessage && (
          <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-800 text-sm font-bold flex items-center gap-2">
            <span>{successMessage}</span>
          </div>
        )}
        {errorMessage && (
          <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-800 text-sm font-bold flex items-center gap-2">
            <span>⚠️ {errorMessage}</span>
          </div>
        )}

        {/* Header & Entity Switcher */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex h-3 w-3 rounded-full bg-teal-500"></span>
                <h1 className="text-xl font-black text-slate-900">
                  لوحة إدارة وتهيئة المؤسسة (Organization Control Center)
                </h1>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                تخصيص الهوية البصرية، الأقسام الإدارية، مصفوفة اتفاقيات مستوى الخدمة (SLA)، وصلاحيات فريق العمل.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-600">المؤسسة النشطة:</span>
              <select
                value={selectedEntityId}
                onChange={(e) => setSelectedEntityId(e.target.value)}
                className="rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-800 focus:border-teal-700 focus:outline-none"
              >
                <option value="00000000-0000-0000-0000-000000000010">🏫 مدرسة القاهرة التجريبية الرسمية للغات</option>
                <option value="uni-cairo-001">🎓 جامعة القاهرة (Cairo University)</option>
                <option value="gov-post-001">🏛️ الهيئة القومية للبريد المصري</option>
                <option value="com-telecom-001">🏢 الشركة المصرية للاتصالات (WE)</option>
                <option value="hosp-kasralainy-001">🏥 مستشفى قصر العيني الجامعي</option>
              </select>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-3">
            {[
              { id: "BRANDING", label: "🎨 الهوية البصرية والبيانات", icon: "🎨" },
              { id: "DEPARTMENTS", label: "🏢 هيكل الأقسام الإدارية", icon: "🏢" },
              { id: "SLA", label: "⏱️ سياسات مستوى الخدمة (SLA)", icon: "⏱️" },
              { id: "STAFF", label: "👥 فريق العمل والصلاحيات", icon: "👥" },
              { id: "TAXONOMY", label: "📑 تصنيفات القطاع واللوائح", icon: "📑" },
              { id: "API", label: "🔌 مفاتيح الربط البرمجي (API)", icon: "🔌" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as AdminTab)}
                className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                  activeTab === tab.id
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab 1: BRANDING */}
        {activeTab === "BRANDING" && (
          <form onSubmit={handleSaveBranding} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">الهوية البصرية ومعلومات التواصل للمؤسسة</h2>
              <p className="text-xs text-slate-500">تظهر هذه البيانات للمستفيدين في بوابة تقديم الشكاوى واستمارة التتبع</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اسم المؤسسة (المختصر أو الرسمي)</label>
                <input
                  type="text"
                  value={branding.institution_short_name || ""}
                  onChange={(e) => setBranding({ ...branding, institution_short_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-medium focus:border-teal-700 focus:outline-none"
                  placeholder="مثال: مدرسة القاهرة للغات"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">رابط الشعار المؤسسي (Logo URL)</label>
                <input
                  type="text"
                  value={branding.logo_url || ""}
                  onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 font-mono focus:border-teal-700 focus:outline-none"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">اللون الأساسي للهوية (Primary Brand Color)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={branding.primary_color || "#0F766E"}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="h-10 w-14 rounded-lg cursor-pointer border border-slate-300 p-1"
                  />
                  <input
                    type="text"
                    value={branding.primary_color || "#0F766E"}
                    onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                    className="w-32 rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">البريد الإلكتروني للدعم والمتابعة</label>
                <input
                  type="email"
                  value={branding.support_email || ""}
                  onChange={(e) => setBranding({ ...branding, support_email: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                  placeholder="cases@institution.gov.eg"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">رسالة الترحيب والتعليمات للمستفيد (بالعربية)</label>
                <textarea
                  rows={3}
                  value={branding.welcome_message_ar || ""}
                  onChange={(e) => setBranding({ ...branding, welcome_message_ar: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900"
                  placeholder="مرحباً بكم في منظومة تلقي ومتابعة الحالات..."
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition shadow-sm disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ بيانات الهوية"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: DEPARTMENTS */}
        {activeTab === "DEPARTMENTS" && (
          <div className="space-y-6">
            {/* Create Department Box */}
            <form onSubmit={handleAddDepartment} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900">إضافة قسم إداري جديد للفرز</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">كود القسم (Code)</label>
                  <input
                    type="text"
                    value={newDeptCode}
                    onChange={(e) => setNewDeptCode(e.target.value)}
                    placeholder="DEPT_TRANSPORT"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono uppercase"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">الاسم بالعربية</label>
                  <input
                    type="text"
                    value={newDeptNameAr}
                    onChange={(e) => setNewDeptNameAr(e.target.value)}
                    placeholder="النقل والمواصلات"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">الاسم بالإنجليزية</label>
                  <input
                    type="text"
                    value={newDeptNameEn}
                    onChange={(e) => setNewDeptNameEn(e.target.value)}
                    placeholder="Transportation"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">مهلة الحل القياسية (ساعة)</label>
                  <input
                    type="number"
                    value={newDeptSla}
                    onChange={(e) => setNewDeptSla(Number(e.target.value))}
                    min={1}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 transition"
                >
                  + إضافة القسم
                </button>
              </div>
            </form>

            {/* Existing Departments Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">الأقسام الإدارية المفعلة ({departments.length})</h3>
                <span className="text-2xs text-slate-500">تستخدم في توجيه الحالات وإسناد المهام</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">الكود</th>
                      <th className="p-3">اسم القسم (عربي)</th>
                      <th className="p-3">اسم القسم (إنجليزي)</th>
                      <th className="p-3">مهلة الإنجاز (SLA)</th>
                      <th className="p-3">الحالة</th>
                      <th className="p-3 text-center">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {departments.map((dept) => (
                      <tr key={dept.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-mono text-slate-500 font-bold">{dept.code}</td>
                        <td className="p-3 font-bold text-slate-900">{dept.name_ar}</td>
                        <td className="p-3 text-slate-500">{dept.name_en}</td>
                        <td className="p-3">
                          <span className="bg-teal-50 text-teal-800 px-2 py-0.5 rounded-md font-bold border border-teal-200">
                            {dept.default_sla_hours} ساعة
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-bold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span> نشط
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => handleDeleteDepartment(dept.id)}
                            className="text-rose-600 hover:text-rose-800 text-2xs font-bold px-2 py-1 rounded-md hover:bg-rose-50 transition"
                          >
                            حذف
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: SLA POLICIES */}
        {activeTab === "SLA" && (
          <form onSubmit={handleSaveSla} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">مصفوفة اتفاقيات مستوى الخدمة (SLA Target Matrix)</h2>
              <p className="text-xs text-slate-500">
                تحديد أوقات الاستجابة القصوى ومواعيد التسوية الملزمة للمؤسسة بناءً على أولوية الحالة.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4 space-y-2">
                <span className="text-xs font-black text-rose-800">الأولوية القصوى (CRITICAL) 🚨</span>
                <p className="text-2xs text-slate-600">سلامة، طوارئ، أو تهديد فوري</p>
                <div className="pt-2">
                  <label className="block text-2xs font-bold text-slate-700 mb-1">الحد الأقصى للحل (ساعات)</label>
                  <input
                    type="number"
                    value={slaConfig.critical_resolution_hours || 24}
                    onChange={(e) => setSlaConfig({ ...slaConfig, critical_resolution_hours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4 space-y-2">
                <span className="text-xs font-black text-amber-800">الأولوية العالية (HIGH) ⚡</span>
                <p className="text-2xs text-slate-600">تعطل خدمة، رسوم ونزاع مالي</p>
                <div className="pt-2">
                  <label className="block text-2xs font-bold text-slate-700 mb-1">الحد الأقصى للحل (ساعات)</label>
                  <input
                    type="number"
                    value={slaConfig.high_resolution_hours || 48}
                    onChange={(e) => setSlaConfig({ ...slaConfig, high_resolution_hours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-4 space-y-2">
                <span className="text-xs font-black text-sky-800">الأولوية المتوسطة (MEDIUM) ℹ️</span>
                <p className="text-2xs text-slate-600">شكاوى إدارية وتواصل قياسي</p>
                <div className="pt-2">
                  <label className="block text-2xs font-bold text-slate-700 mb-1">الحد الأقصى للحل (ساعات)</label>
                  <input
                    type="number"
                    value={slaConfig.medium_resolution_hours || 96}
                    onChange={(e) => setSlaConfig({ ...slaConfig, medium_resolution_hours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <span className="text-xs font-black text-slate-800">الأولوية العادية (LOW) 📄</span>
                <p className="text-2xs text-slate-600">استفسارات واقتراحات تحسين</p>
                <div className="pt-2">
                  <label className="block text-2xs font-bold text-slate-700 mb-1">الحد الأقصى للحل (ساعات)</label>
                  <input
                    type="number"
                    value={slaConfig.low_resolution_hours || 168}
                    onChange={(e) => setSlaConfig({ ...slaConfig, low_resolution_hours: Number(e.target.value) })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مهلة الاستجابة الأولى (First Response)</label>
                <input
                  type="number"
                  value={slaConfig.first_response_hours}
                  onChange={(e) => setSlaConfig({ ...slaConfig, first_response_hours: Number(e.target.value) })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">بداية ساعات العمل اليومية</label>
                <input
                  type="time"
                  value={slaConfig.business_hours_start || "08:00"}
                  onChange={(e) => setSlaConfig({ ...slaConfig, business_hours_start: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">نهاية ساعات العمل اليومية</label>
                <input
                  type="time"
                  value={slaConfig.business_hours_end || "16:00"}
                  onChange={(e) => setSlaConfig({ ...slaConfig, business_hours_end: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-teal-700 px-6 py-2.5 text-xs font-bold text-white hover:bg-teal-800 transition shadow-sm disabled:opacity-50"
              >
                {saving ? "جاري الحفظ..." : "حفظ مصفوفة الـ SLA"}
              </button>
            </div>
          </form>
        )}

        {/* Tab 4: STAFF & RBAC */}
        {activeTab === "STAFF" && (
          <div className="space-y-6">
            <form onSubmit={handleAddStaff} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
              <h2 className="text-sm font-black text-slate-900">إضافة عضو فريق عمل وصلاحيات</h2>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">الاسم الكامل</label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="أ. هاني مصطفى"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">البريد الإلكتروني المؤسسي</label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="hany@organization.gov.eg"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">الدور والصلاحية (Role)</label>
                  <select
                    value={newStaffRole}
                    onChange={(e) => setNewStaffRole(e.target.value as InstitutionStaffRole)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  >
                    <option value="STAFF">موظف معالجة (STAFF)</option>
                    <option value="OPS_LEAD">رئيس عمليات وفرز (OPS_LEAD)</option>
                    <option value="ADMIN">مدير نظام مؤسسي (ADMIN)</option>
                    <option value="OBSERVER">مراقب تقارير (OBSERVER)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-2xs font-bold text-slate-600 mb-1">القسم التابع له</label>
                  <select
                    value={newStaffDept}
                    onChange={(e) => setNewStaffDept(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-bold"
                  >
                    <option value="">(عام لكافة الأقسام)</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name_ar}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 transition"
                >
                  + إضافة الموظف
                </button>
              </div>
            </form>

            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900">سجل أعضاء فريق العمل ({staff.length})</h3>
                <span className="text-2xs text-slate-500">حسابات الوصول لبوابة الموظفين</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                    <tr>
                      <th className="p-3">الاسم</th>
                      <th className="p-3">البريد الإلكتروني</th>
                      <th className="p-3">الدور الصلاحي</th>
                      <th className="p-3">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {staff.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition">
                        <td className="p-3 font-bold text-slate-900">{s.name}</td>
                        <td className="p-3 font-mono text-slate-600">{s.email}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded-md font-bold text-2xs ${
                              s.role === "ADMIN"
                                ? "bg-purple-100 text-purple-800"
                                : s.role === "OPS_LEAD"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {s.role}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="text-emerald-700 font-bold text-2xs">● نشط</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 5: TAXONOMY & REGULATIONS */}
        {activeTab === "TAXONOMY" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                المرجعيات التنظيمية وتصنيفات القطاع ({activeEntity?.sector})
              </h2>
              <p className="text-xs text-slate-500">
                القوانين والقرارات الوزارية المصرية المؤطرة للشكاوى ومسارات الحل في هذا القطاع.
              </p>
            </div>

            {sectorInfo && (
              <div className="space-y-4">
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-4">
                  <span className="text-xs font-bold text-slate-500">مسمى المستفيد القانوني:</span>
                  <div className="text-sm font-extrabold text-teal-900 mt-0.5">
                    {sectorInfo.beneficiaryTerm?.term_ar} ({sectorInfo.beneficiaryTerm?.term_en})
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-black text-slate-700 mb-2">التصنيفات المعتمدة:</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sectorInfo.categories?.map((cat: any) => (
                      <div key={cat.key} className="rounded-xl border border-slate-200 p-3 bg-white hover:border-teal-300 transition">
                        <div className="font-bold text-xs text-slate-900">{cat.label_ar}</div>
                        <div className="text-2xs text-slate-500 font-mono mt-0.5">{cat.key}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 6: API INTEGRATION */}
        {activeTab === "API" && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">الربط البرمجي المؤسسي (REST API v1)</h2>
              <p className="text-xs text-slate-500">
                تكامل منصة مُرافِق مع الأنظمة الإدارية، بوابات الطلاب (SIS)، نظم إدارة المشافي (HIS)، أو نظم خدمة العملاء.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">مفتاح الربط البرمجي للمؤسسة (Tenant API Key)</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={`mrf_live_${selectedEntityId.replace(/-/g, "").substring(0, 16)}_sec`}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800"
                  />
                  <button
                    onClick={() => alert("تم نسخ مفتاح الـ API بنجاح")}
                    className="rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-900 transition"
                  >
                    نسخ
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2">
                <span className="text-xs font-black text-slate-800">نقطة النهاية الأساسية (Base URL):</span>
                <div className="font-mono text-xs text-teal-800 font-bold bg-white p-2 rounded-lg border border-slate-200">
                  https://your-domain.com/api/v1
                </div>
                <p className="text-2xs text-slate-500">
                  راجع التوثيق المرجعي الكامل في ملف: <code className="font-mono text-slate-700">docs/API_REFERENCE.md</code>
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
