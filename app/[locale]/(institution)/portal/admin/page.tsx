"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import type {
  TenantBranding,
  TenantSlaConfig,
  InstitutionStaffMember,
  InstitutionStaffRole,
  CustomFieldDefinition,
  WorkflowRule,
  WebhookSubscription,
  AuditLogEntry,
  CaseTemplate,
  TenantBranch,
  Institution,
} from "@/types/database";
import type { StoredDepartment } from "@/lib/services/storage-adapter";

type AdminSection =
  | "GENERAL"
  | "BRANDING"
  | "BRANCHES"
  | "DEPARTMENTS"
  | "USERS"
  | "ROLES"
  | "CATEGORIES"
  | "CUSTOM_FIELDS"
  | "SLA"
  | "ESCALATION"
  | "WORKFLOWS"
  | "NOTIFICATIONS"
  | "KNOWLEDGE_BASE"
  | "AI_SETTINGS"
  | "INTEGRATIONS"
  | "API_WEBHOOKS"
  | "AUDIT_LOGS"
  | "SECURITY";

function OrganizationAdminContent() {
  const searchParams = useSearchParams();
  const institutionId = searchParams.get("institutionId") || "00000000-0000-0000-0000-000000000010";

  const [activeSection, setActiveSection] = useState<AdminSection>("BRANDING");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Tenant state
  const [organization, setOrganization] = useState<Institution | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [branding, setBranding] = useState<TenantBranding>({
    primary_color: "#0F766E",
    secondary_color: "#1E293B",
    institution_short_name: "المؤسسة",
    portal_title_ar: "بوابة إدارة الحالات وحل المشكلات",
    portal_title_en: "Institutional Case & Resolution Portal",
    org_description_ar: "",
    welcome_message_ar: "أهلاً بكم في البوابة الرسمية لإدارة وحسم الحالات",
    welcome_message_en: "Welcome to our Institutional Case & Resolution Portal",
    support_email: "support@organization.com",
    support_phone: "+201000000000",
    custom_domain: "",
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
    working_days: [0, 1, 2, 3, 4],
  });

  const [departments, setDepartments] = useState<StoredDepartment[]>([]);
  const [staff, setStaff] = useState<InstitutionStaffMember[]>([]);
  const [branches, setBranches] = useState<TenantBranch[]>([]);
  const [customFields, setCustomFields] = useState<CustomFieldDefinition[]>([]);
  const [workflowRules, setWorkflowRules] = useState<WorkflowRule[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookSubscription[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [caseTemplates, setCaseTemplates] = useState<CaseTemplate[]>([]);
  const [sectorInfo, setSectorInfo] = useState<any>(null);

  // Form states for modals/sub-forms
  const [newDeptCode, setNewDeptCode] = useState("");
  const [newDeptNameAr, setNewDeptNameAr] = useState("");
  const [newDeptNameEn, setNewDeptNameEn] = useState("");
  const [newDeptSla, setNewDeptSla] = useState(48);

  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffRole, setNewStaffRole] = useState<InstitutionStaffRole>("STAFF");
  const [newStaffDept, setNewStaffDept] = useState("");

  const [newFieldKey, setNewFieldKey] = useState("");
  const [newFieldLabelAr, setNewFieldLabelAr] = useState("");
  const [newFieldLabelEn, setNewFieldLabelEn] = useState("");
  const [newFieldType, setNewFieldType] = useState<any>("TEXT");
  const [newFieldRequired, setNewFieldRequired] = useState(true);
  const [newFieldVisibility, setNewFieldVisibility] = useState<"BENEFICIARY" | "STAFF_ONLY">("BENEFICIARY");

  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowTrigger, setNewWorkflowTrigger] = useState<any>("CASE_CREATED");
  const [newWorkflowPriority, setNewWorkflowPriority] = useState<any>("CRITICAL");
  const [newWorkflowSla, setNewWorkflowSla] = useState(12);

  const [newWebhookUrl, setNewWebhookUrl] = useState("");

  const [newBranchCode, setNewBranchCode] = useState("");
  const [newBranchNameAr, setNewBranchNameAr] = useState("");
  const [newBranchNameEn, setNewBranchNameEn] = useState("");

  const loadData = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/institution/admin?institutionId=${institutionId}`);
      const result = await res.json();
      if (result.success && result.data) {
        const d = result.data;
        setOrganization(d.organization);
        setSubscription(d.subscription);
        if (d.branding) setBranding(d.branding);
        if (d.slaConfig) setSlaConfig(d.slaConfig);
        setDepartments(d.departments || []);
        setStaff(d.staff || []);
        setBranches(d.branches || []);
        setCustomFields(d.customFields || []);
        setWorkflowRules(d.workflowRules || []);
        setWebhooks(d.webhooks || []);
        setAuditLogs(d.auditLogs || []);
        setCaseTemplates(d.caseTemplates || []);
        setSectorInfo(d.sectorInfo || null);
      } else {
        throw new Error(result.error || "تعذر تحميل إعدادات المؤسسة");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "فشل الاتصال بخادم الإعدادات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [institutionId]);

  const notify = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 4000);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization) return;
    setSaving(true);
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "UPDATE_GENERAL",
          institutionId,
          payload: {
            name_ar: organization.name_ar,
            name_en: organization.name_en,
            registration_number: organization.registration_number,
          },
        }),
      });
      const data = await res.json();
      if (data.success) notify("تم حفظ البيانات العامة للمؤسسة بنجاح ✅");
    } catch {
      setErrorMessage("حدث خطأ أثناء حفظ البيانات العامة");
    } finally {
      setSaving(false);
    }
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
          institutionId,
          payload: branding,
        }),
      });
      const data = await res.json();
      if (data.success) notify("تم تحديث الهوية المؤسسية بنجاح ✅");
    } catch {
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
          institutionId,
          payload: slaConfig,
        }),
      });
      const data = await res.json();
      if (data.success) notify("تم تحديث سياسات الـ SLA ومواعيد العمل بنجاح ✅");
    } catch {
      setErrorMessage("حدث خطأ أثناء حفظ الـ SLA");
    } finally {
      setSaving(false);
    }
  };

  const handleCreateDept = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptCode.trim() || !newDeptNameAr.trim()) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_DEPARTMENT",
          institutionId,
          payload: {
            code: newDeptCode,
            name_ar: newDeptNameAr,
            name_en: newDeptNameEn || newDeptNameAr,
            default_sla_hours: newDeptSla,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => [...prev, data.data]);
        setNewDeptCode("");
        setNewDeptNameAr("");
        setNewDeptNameEn("");
        notify("تم إنشاء القسم الإداري بنجاح ✅");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء إضافة القسم");
    }
  };

  const handleDeleteDept = async (deptId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_DEPARTMENT",
          institutionId,
          payload: { deptId },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDepartments((prev) => prev.filter((d) => d.id !== deptId));
        notify("تم حذف القسم بنجاح");
      }
    } catch {
      setErrorMessage("تعذر حذف القسم");
    }
  };

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CREATE_STAFF",
          institutionId,
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
        notify("تم دعوة عضو الفريق بنجاح ✅");
      }
    } catch {
      setErrorMessage("حدث خطأ أثناء دعوة الموظف");
    }
  };

  const handleCreateCustomField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldKey.trim() || !newFieldLabelAr.trim()) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_CUSTOM_FIELD",
          institutionId,
          payload: {
            field_key: newFieldKey.toLowerCase().trim().replace(/[^a-z0-9_]/g, "_"),
            label_ar: newFieldLabelAr,
            label_en: newFieldLabelEn || newFieldLabelAr,
            field_type: newFieldType,
            is_required: newFieldRequired,
            visibility: newFieldVisibility,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomFields((prev) => [...prev, data.data]);
        setNewFieldKey("");
        setNewFieldLabelAr("");
        setNewFieldLabelEn("");
        notify("تمت إضافة الحقل المخصص بنجاح ✅");
      }
    } catch {
      setErrorMessage("تعذر إضافة الحقل المخصص");
    }
  };

  const handleDeleteCustomField = async (fieldId: string) => {
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "DELETE_CUSTOM_FIELD",
          institutionId,
          payload: { fieldId },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setCustomFields((prev) => prev.filter((f) => f.id !== fieldId));
        notify("تم حذف الحقل المخصص");
      }
    } catch {
      setErrorMessage("تعذر حذف الحقل");
    }
  };

  const handleCreateWorkflow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_WORKFLOW",
          institutionId,
          payload: {
            name: newWorkflowName,
            trigger: newWorkflowTrigger,
            condition_priority: newWorkflowPriority,
            action_set_sla_hours: newWorkflowSla,
            action_notify_channels: ["IN_APP", "WHATSAPP"],
            is_active: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWorkflowRules((prev) => [...prev, data.data]);
        setNewWorkflowName("");
        notify("تم إنشاء قاعدة سير العمل الآلي بنجاح ⚡");
      }
    } catch {
      setErrorMessage("تعذر إنشاء قاعدة العمل");
    }
  };

  const handleAddWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWebhookUrl.trim()) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_WEBHOOK",
          institutionId,
          payload: {
            url: newWebhookUrl.trim(),
            events: ["case.created", "case.assigned", "case.resolved"],
            is_active: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setWebhooks((prev) => [...prev, data.data]);
        setNewWebhookUrl("");
        notify("تم تسجيل الـ Webhook بنجاح ✅");
      }
    } catch {
      setErrorMessage("تعذر حفظ الـ Webhook");
    }
  };

  const handleTestWebhook = async (webhookId: string) => {
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRIGGER_TEST_WEBHOOK",
          institutionId,
          payload: { webhookId, event: "case.created" },
        }),
      });
      const data = await res.json();
      if (data.success) {
        notify("تم إرسال إشعار اختباري (Test Ping) وتلقي استجابة HTTP 200 OK بنجاح! 🚀");
      }
    } catch {
      setErrorMessage("فشل إرسال الإشعار الاختباري");
    }
  };

  const handleAddBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBranchCode.trim() || !newBranchNameAr.trim()) return;
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "SAVE_BRANCH",
          institutionId,
          payload: {
            code: newBranchCode.toUpperCase().trim(),
            name_ar: newBranchNameAr.trim(),
            name_en: newBranchNameEn.trim() || newBranchNameAr.trim(),
            is_active: true,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setBranches((prev) => [...prev, data.data]);
        setNewBranchCode("");
        setNewBranchNameAr("");
        setNewBranchNameEn("");
        notify("تمت إضافة الفرع بنجاح ✅");
      }
    } catch {
      setErrorMessage("تعذر إضافة الفرع");
    }
  };

  const currentOrgName = organization?.name_ar || branding.institution_short_name || "المؤسسة";

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard" className="flex items-center gap-2 hover:opacity-90 transition">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                style={{ backgroundColor: branding.primary_color }}
              >
                {currentOrgName.charAt(0)}
              </div>
              <div>
                <span className="block text-sm font-black text-slate-900 leading-tight">
                  {currentOrgName}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span>مركز إعدادات المؤسسة (Configuration Center)</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span className="font-mono text-[10px] text-emerald-700 font-bold uppercase">{subscription?.plan || "ENTERPRISE"}</span>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/portal/integrations"
              className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition flex items-center gap-1"
            >
              <span>🔌 مركز التكاملات</span>
            </Link>
            <Link
              href="/portal/dashboard"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              العودة للوحة الحالات ←
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
        {/* Messages */}
        {successMessage && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between animate-fadeIn">
            <span>{successMessage}</span>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}
        {errorMessage && (
          <div className="mb-5 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center justify-between animate-fadeIn">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-900">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-3 shadow-xs sticky top-20">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-2 pb-1.5 font-sans">
                Organization Structure
              </div>
              <nav className="space-y-0.5">
                {[
                  { key: "GENERAL", label: "🏢 البيانات العامة", badge: null },
                  { key: "BRANDING", label: "🎨 الهوية والتخصيص الكامل", badge: "Live" },
                  { key: "BRANCHES", label: "📍 الفروع والمقرات", badge: branches.length },
                  { key: "DEPARTMENTS", label: "🏛️ الأقسام الإدارية", badge: departments.length },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as AdminSection)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeSection === item.key
                        ? "bg-teal-50 text-teal-800 font-extrabold border border-teal-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1.5 font-sans">
                Access & Team
              </div>
              <nav className="space-y-0.5">
                {[
                  { key: "USERS", label: "👥 الموظفون والمستخدمون", badge: staff.length },
                  { key: "ROLES", label: "🔑 الأدوار والصلاحيات (RBAC)", badge: "4 Roles" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as AdminSection)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeSection === item.key
                        ? "bg-teal-50 text-teal-800 font-extrabold border border-teal-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1.5 font-sans">
                Rules & Operations
              </div>
              <nav className="space-y-0.5">
                {[
                  { key: "CATEGORIES", label: "📋 التصنيفات والقوالب", badge: caseTemplates.length },
                  { key: "CUSTOM_FIELDS", label: "📝 الحقول المخصصة", badge: customFields.length },
                  { key: "SLA", label: "⏱️ سياسات الـ SLA ومواعيد العمل", badge: null },
                  { key: "ESCALATION", label: "🚨 قواعد التصعيد الآلي", badge: null },
                  { key: "WORKFLOWS", label: "⚡ محرك سير العمل (Workflows)", badge: workflowRules.length },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as AdminSection)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeSection === item.key
                        ? "bg-teal-50 text-teal-800 font-extrabold border border-teal-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1.5 font-sans">
                Communications & AI
              </div>
              <nav className="space-y-0.5">
                {[
                  { key: "NOTIFICATIONS", label: "🔔 الإشعارات والقنوات", badge: null },
                  { key: "KNOWLEDGE_BASE", label: "📚 قاعدة المعرفة واللوائح", badge: "Docs" },
                  { key: "AI_SETTINGS", label: "🤖 إعدادات الـ AI Resolution", badge: "Assistant" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as AdminSection)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeSection === item.key
                        ? "bg-teal-50 text-teal-800 font-extrabold border border-teal-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 pt-4 pb-1.5 font-sans">
                Integration & Audit
              </div>
              <nav className="space-y-0.5">
                {[
                  { key: "INTEGRATIONS", label: "🔌 مركز التكامل (Integration Hub)", badge: null },
                  { key: "API_WEBHOOKS", label: "⚙️ الـ API والـ Webhooks", badge: webhooks.length },
                  { key: "AUDIT_LOGS", label: "🛡️ سجل العمليات (Audit Logs)", badge: auditLogs.length },
                  { key: "SECURITY", label: "🔒 الأمان والامتثال (Security)", badge: "SSO" },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setActiveSection(item.key as AdminSection)}
                    className={`w-full text-right px-3 py-2 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                      activeSection === item.key
                        ? "bg-teal-50 text-teal-800 font-extrabold border border-teal-200"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    <span>{item.label}</span>
                    {item.badge !== null && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                        {item.badge}
                      </span>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* Content Area */}
          <section className="lg:col-span-3">
            {/* 1. GENERAL */}
            {activeSection === "GENERAL" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">البيانات العامة للمؤسسة</h2>
                <p className="text-xs text-slate-500 mb-6">البيانات القانونية والتشغيلية الخاصة ببيئة عمل المؤسسة.</p>

                <form onSubmit={handleSaveGeneral} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اسم المؤسسة (بالعربية)</label>
                      <input
                        type="text"
                        value={organization?.name_ar || ""}
                        onChange={(e) => setOrganization((prev: any) => ({ ...prev, name_ar: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اسم المؤسسة (بالإنجليزية)</label>
                      <input
                        type="text"
                        value={organization?.name_en || ""}
                        onChange={(e) => setOrganization((prev: any) => ({ ...prev, name_en: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 focus:bg-white focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">الرقم السجلي / المعرف المؤسسي</label>
                      <input
                        type="text"
                        value={organization?.registration_number || ""}
                        onChange={(e) => setOrganization((prev: any) => ({ ...prev, registration_number: e.target.value }))}
                        placeholder="مثال: REG-2026-9901"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-mono focus:bg-white focus:ring-1 focus:ring-teal-600"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">القطاع المعتمد</label>
                      <div className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600">
                        {organization?.sector || "EDUCATION_SCHOOLS"}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                    >
                      {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 2. BRANDING (Full Tenant Branding) */}
            {activeSection === "BRANDING" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">الهوية المؤسسية والتخصيص الكامل (White-labeling)</h2>
                    <p className="text-xs text-slate-500">اجعل البوابة تعبر بالكامل عن علامتك التجارية أمام المستفيدين والموظفين.</p>
                  </div>
                  <div
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: branding.primary_color }}
                  >
                    معاينة حية للعلامة
                  </div>
                </div>

                <form onSubmit={handleSaveBranding} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اللون الأساسي (Primary Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.primary_color}
                          onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                          className="w-10 h-9 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={branding.primary_color}
                          onChange={(e) => setBranding({ ...branding, primary_color: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono w-28"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">اللون الثانوي (Secondary Color)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={branding.secondary_color || "#1E293B"}
                          onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                          className="w-10 h-9 rounded cursor-pointer border-0 p-0"
                        />
                        <input
                          type="text"
                          value={branding.secondary_color || "#1E293B"}
                          onChange={(e) => setBranding({ ...branding, secondary_color: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono w-28"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البوابة (بالعربية)</label>
                      <input
                        type="text"
                        value={branding.portal_title_ar || ""}
                        onChange={(e) => setBranding({ ...branding, portal_title_ar: e.target.value })}
                        placeholder="مثال: بوابة خدمة الطلاب والالتماسات الأكاديمية"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">عنوان البوابة (بالإنجليزية)</label>
                      <input
                        type="text"
                        value={branding.portal_title_en || ""}
                        onChange={(e) => setBranding({ ...branding, portal_title_en: e.target.value })}
                        placeholder="e.g. Student Case & Resolution Portal"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">وصف المؤسسة في البوابة</label>
                    <textarea
                      rows={2}
                      value={branding.org_description_ar || ""}
                      onChange={(e) => setBranding({ ...branding, org_description_ar: e.target.value })}
                      placeholder="رسالة تعريفية موجزة تظهر للمستفيد في أعلى صفحة تسجيل الحالات"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">رابط الشعار الرسمي (Logo URL)</label>
                      <input
                        type="text"
                        value={branding.logo_url || ""}
                        onChange={(e) => setBranding({ ...branding, logo_url: e.target.value })}
                        placeholder="https://cdn.organization.com/logo.svg"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">أيقونة المتصفح (Favicon URL)</label>
                      <input
                        type="text"
                        value={branding.favicon_url || ""}
                        onChange={(e) => setBranding({ ...branding, favicon_url: e.target.value })}
                        placeholder="https://cdn.organization.com/favicon.ico"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">بريد الدعم المؤسسي</label>
                      <input
                        type="email"
                        value={branding.support_email || ""}
                        onChange={(e) => setBranding({ ...branding, support_email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">هاتف الدعم أو الخط الساخن</label>
                      <input
                        type="text"
                        value={branding.support_phone || ""}
                        onChange={(e) => setBranding({ ...branding, support_phone: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  {/* Custom Domain Section */}
                  <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-base">🌐</span>
                      <h4 className="text-xs font-bold text-teal-900">النطاق المخصص (Custom Domain Readiness)</h4>
                    </div>
                    <p className="text-[11px] text-teal-700 mb-2">
                      يمكنك ربط نطاقك المؤسسي الخاص مثل (<span className="font-mono">cases.school.edu.eg</span>) ليظهر للمستفيدين بدلاً من النطاق الافتراضي.
                    </p>
                    <input
                      type="text"
                      value={branding.custom_domain || ""}
                      onChange={(e) => setBranding({ ...branding, custom_domain: e.target.value })}
                      placeholder="cases.organization.edu.eg"
                      className="w-full bg-white border border-teal-300 rounded-xl px-3 py-2 text-xs font-mono text-teal-950 font-bold"
                    />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                    >
                      {saving ? "جاري الحفظ..." : "حفظ هوية المؤسسة"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 3. BRANCHES */}
            {activeSection === "BRANCHES" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">الفروع والمقرات (Branches & Campuses)</h2>
                    <p className="text-xs text-slate-500">إدارة مقرات المؤسسة الجغرافية لتوزيع الحالات والمسؤوليات آلياً.</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 mb-6">
                  {branches.map((b) => (
                    <div key={b.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-800">{b.name_ar}</div>
                        <div className="text-xs text-slate-400 font-mono">{b.code} — {b.name_en}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        نشط (Active)
                      </span>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAddBranch} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">+ إضافة مقر أو فرع جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="كود الفرع (e.g. ZAMALEK)"
                      value={newBranchCode}
                      onChange={(e) => setNewBranchCode(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="اسم الفرع بالعربية"
                      value={newBranchNameAr}
                      onChange={(e) => setNewBranchNameAr(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="اسم الفرع بالإنجليزية"
                      value={newBranchNameEn}
                      onChange={(e) => setNewBranchNameEn(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition">
                      إضافة الفرع
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 4. DEPARTMENTS */}
            {activeSection === "DEPARTMENTS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">الأقسام الإدارية ومؤشرات الأداء (Departments)</h2>
                <p className="text-xs text-slate-500 mb-5">تحديد الهيكل الإداري الداخلي لكل إدارة والمهلة القصوى لحل الشكاوى (SLA).</p>

                <div className="divide-y divide-slate-100 mb-6">
                  {departments.map((dept) => (
                    <div key={dept.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <span>{dept.name_ar}</span>
                          <span className="text-xs font-mono text-slate-400">({dept.code})</span>
                        </div>
                        <div className="text-xs text-slate-500">{dept.name_en}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-100 text-slate-700">
                          SLA: {dept.default_sla_hours} ساعة
                        </span>
                        <button
                          onClick={() => handleDeleteDept(dept.id)}
                          className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateDept} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">+ إضافة قسم إداري جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="الكود (e.g. FINANCE)"
                      value={newDeptCode}
                      onChange={(e) => setNewDeptCode(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="اسم القسم بالعربية"
                      value={newDeptNameAr}
                      onChange={(e) => setNewDeptNameAr(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <input
                      type="text"
                      placeholder="اسم القسم بالإنجليزية"
                      value={newDeptNameEn}
                      onChange={(e) => setNewDeptNameEn(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <input
                      type="number"
                      required
                      min={1}
                      placeholder="ساعات الـ SLA"
                      value={newDeptSla}
                      onChange={(e) => setNewDeptSla(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition">
                      حفظ القسم
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 5. USERS & STAFF */}
            {activeSection === "USERS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">إدارة فريق العمل والمستخدمين (Staff Directory)</h2>
                    <p className="text-xs text-slate-500">دعوة الموظفين وتعيين الصلاحيات والأقسام التابعة لهم.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                    {staff.length} / {subscription?.max_staff_seats || 50} مقعداً مستخدماً
                  </span>
                </div>

                <div className="divide-y divide-slate-100 mb-6">
                  {staff.map((s) => (
                    <div key={s.id} className="py-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-700">
                          {s.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-800">{s.name}</div>
                          <div className="text-xs text-slate-400 font-mono">{s.email}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                          {s.role}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          نشط
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateStaff} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">+ دعوة موظف جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="اسم الموظف"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <input
                      type="email"
                      required
                      placeholder="البريد المؤسسي (Email)"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                    <select
                      value={newStaffRole}
                      onChange={(e) => setNewStaffRole(e.target.value as InstitutionStaffRole)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="ADMIN">ADMIN — مدير النظام</option>
                      <option value="OPS_LEAD">OPS_LEAD — رئيس العمليات</option>
                      <option value="STAFF">STAFF — موظف معالجة</option>
                      <option value="OBSERVER">OBSERVER — مراجع ومراقب</option>
                    </select>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition">
                      إرسال الدعوة
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 6. ROLES & PERMISSIONS */}
            {activeSection === "ROLES" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">الأدوار ومصفوفة الصلاحيات (RBAC Matrix)</h2>
                <p className="text-xs text-slate-500 mb-6">الصلاحيات المحددة لكل دور وظيفي داخل بيئة المؤسسة.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">ADMIN (مدير المؤسسة)</span>
                      <span className="text-[11px] font-mono text-teal-700 font-bold">Full Tenant Control</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>إدارة كافة إعدادات الهوية و SLAs</li>
                      <li>دعوة وإدارة الموظفين وتعيين الأدوار</li>
                      <li>التحكم في تكاملات الـ API والـ Webhooks</li>
                      <li>الاطلاع الكامل على سجل العمليات وسير العمل</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">OPS_LEAD (قائد العمليات)</span>
                      <span className="text-[11px] font-mono text-sky-700 font-bold">Triage & Escalation</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>الفرز المبدئي وتعيين الأقسام للحالات الجديدة</li>
                      <li>اعتماد خطط العمل والمراحل</li>
                      <li>معالجة حالات التصعيد ومتابعة مؤشرات الـ SLA</li>
                      <li>التواصل الرسمي مع المستفيدين</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">STAFF (أخصائي معالجة)</span>
                      <span className="text-[11px] font-mono text-emerald-700 font-bold">Case Execution</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>استعراض الحالات المحالة لقسمه فقط</li>
                      <li>إنجاز مهام ومراحل خطة العمل</li>
                      <li>كتابة الملاحظات الداخلية السرية</li>
                      <li>الرد المباشر على رسائل المستفيد</li>
                    </ul>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-slate-900">OBSERVER (مراقب / مراجع جودة)</span>
                      <span className="text-[11px] font-mono text-purple-700 font-bold">Read-Only & Audit</span>
                    </div>
                    <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
                      <li>استعراض التقارير ومؤشرات الجودة والرضا</li>
                      <li>توليد وتحميل تقارير الـ PDF المعتمدة</li>
                      <li>بدون صلاحية لتعديل الحالات أو الإعدادات</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* 7. CATEGORIES & CASE TEMPLATES */}
            {activeSection === "CATEGORIES" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">تصنيفات الحالات وقوالب النماذج الجاهزة (Case Templates)</h2>
                <p className="text-xs text-slate-500 mb-5">قوالب مسبقة الإعداد تسهل على المستفيد تسجيل مشكلته بسرعة وتحدد القسم والـ SLA المقترح آلياً.</p>

                <div className="space-y-3 mb-6">
                  {caseTemplates.map((t) => (
                    <div key={t.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-900 mb-1">{t.title_ar}</div>
                        <p className="text-xs text-slate-600 mb-2">{t.preset_description_ar}</p>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                          <span>التصنيف: {t.category}</span>
                          <span>•</span>
                          <span>الأولوية: {t.default_priority}</span>
                          <span>•</span>
                          <span className="text-teal-700 font-bold">المهلة المقترحة: {t.suggested_sla_hours}h</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-100 text-teal-800 shrink-0">
                        قالب نشط
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 8. CUSTOM FIELDS BUILDER */}
            {activeSection === "CUSTOM_FIELDS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">منشئ الحقول المخصصة (Custom Fields Builder)</h2>
                    <p className="text-xs text-slate-500">أضف حقولاً مخصصة لقطاعك (مثل كود الطالب، رقم الملف الطبي، أو رقم أمر الشراء) دون كتابة كود.</p>
                  </div>
                </div>

                <div className="divide-y divide-slate-100 mb-6">
                  {customFields.map((f) => (
                    <div key={f.id} className="py-3 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-800 flex items-center gap-2">
                          <span>{f.label_ar}</span>
                          <span className="text-xs text-slate-400 font-mono">({f.field_key})</span>
                          {f.is_required && (
                            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">إلزامي</span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 font-mono">
                          النوع: {f.field_type} | الظهور: {f.visibility === "BENEFICIARY" ? "ظاهر للمستفيد" : "داخلي للموظفين"}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteCustomField(f.id)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateCustomField} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">+ إضافة حقل مخصص جديد</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="مفتاح الحقل بالإنجليزية (e.g. student_id)"
                      value={newFieldKey}
                      onChange={(e) => setNewFieldKey(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                    <input
                      type="text"
                      required
                      placeholder="اسم الحقل بالعربية"
                      value={newFieldLabelAr}
                      onChange={(e) => setNewFieldLabelAr(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <select
                      value={newFieldType}
                      onChange={(e) => setNewFieldType(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="TEXT">نصي (Text)</option>
                      <option value="NUMBER">رقمي (Number)</option>
                      <option value="SELECT">قائمة اختيارات (Select)</option>
                      <option value="DATE">تاريخ (Date)</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-4 text-xs text-slate-600">
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFieldRequired}
                          onChange={(e) => setNewFieldRequired(e.target.checked)}
                          className="rounded text-teal-600"
                        />
                        <span>حقل إلزامي</span>
                      </label>
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newFieldVisibility === "BENEFICIARY"}
                          onChange={(e) => setNewFieldVisibility(e.target.checked ? "BENEFICIARY" : "STAFF_ONLY")}
                          className="rounded text-teal-600"
                        />
                        <span>يظهر في استمارة المستفيد</span>
                      </label>
                    </div>
                    <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition">
                      إضافة الحقل
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 9. SLA POLICIES */}
            {activeSection === "SLA" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">سياسات اتفاقية مستوى الخدمة (SLA Policies)</h2>
                <p className="text-xs text-slate-500 mb-6">التحكم الدقيق في المهل الزمنية للاستجابة والحل بحسب مستوى خطورة الحالة.</p>

                <form onSubmit={handleSaveSla} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">أقصى مهلة للرد المبدئي (ساعات)</label>
                      <input
                        type="number"
                        min={1}
                        value={slaConfig.first_response_hours}
                        onChange={(e) => setSlaConfig({ ...slaConfig, first_response_hours: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">أقصى مهلة لصياغة خطة العمل (ساعات)</label>
                      <input
                        type="number"
                        min={1}
                        value={slaConfig.action_plan_hours}
                        onChange={(e) => setSlaConfig({ ...slaConfig, action_plan_hours: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-rose-700 mb-1">حرجة (Critical)</label>
                      <input
                        type="number"
                        min={1}
                        value={slaConfig.critical_resolution_hours || 24}
                        onChange={(e) => setSlaConfig({ ...slaConfig, critical_resolution_hours: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-rose-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-amber-700 mb-1">عالية (High)</label>
                      <input
                        type="number"
                        min={1}
                        value={slaConfig.high_resolution_hours || 48}
                        onChange={(e) => setSlaConfig({ ...slaConfig, high_resolution_hours: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-amber-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-sky-700 mb-1">متوسطة (Medium)</label>
                      <input
                        type="number"
                        min={1}
                        value={slaConfig.medium_resolution_hours || 96}
                        onChange={(e) => setSlaConfig({ ...slaConfig, medium_resolution_hours: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-sky-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">منخفضة (Low)</label>
                      <input
                        type="number"
                        min={1}
                        value={slaConfig.low_resolution_hours || 168}
                        onChange={(e) => setSlaConfig({ ...slaConfig, low_resolution_hours: Number(e.target.value) })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">بداية ساعات العمل الرسمية</label>
                      <input
                        type="time"
                        value={slaConfig.business_hours_start || "08:00"}
                        onChange={(e) => setSlaConfig({ ...slaConfig, business_hours_start: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">نهاية ساعات العمل الرسمية</label>
                      <input
                        type="time"
                        value={slaConfig.business_hours_end || "16:00"}
                        onChange={(e) => setSlaConfig({ ...slaConfig, business_hours_end: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                    >
                      {saving ? "جاري الحفظ..." : "حفظ سياسات الـ SLA"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 10. WORKFLOWS BUILDER */}
            {activeSection === "WORKFLOWS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">محرك قواعد سير العمل الآلي (Workflow Builder)</h2>
                    <p className="text-xs text-slate-500">برمجة مسارات الأتمتة: عند تحقق شروط معينة قم بتوجيه الحالة وتطبيق الـ SLA آلياً.</p>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  {workflowRules.map((rule) => (
                    <div key={rule.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-sm text-slate-800 mb-1 flex items-center gap-2">
                          <span>{rule.name}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 text-teal-800 font-bold">
                            {rule.trigger}
                          </span>
                        </div>
                        <div className="text-xs text-slate-600 flex items-center gap-3">
                          {rule.condition_priority && <span>إذا كانت الأولوية = {rule.condition_priority}</span>}
                          {rule.action_set_sla_hours && <span>تحديد مهلة = {rule.action_set_sla_hours} ساعة</span>}
                          {rule.action_notify_channels && <span>إشعار: {rule.action_notify_channels.join(" + ")}</span>}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await fetch("/api/institution/admin", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ action: "DELETE_WORKFLOW", institutionId, payload: { ruleId: rule.id } }),
                          });
                          setWorkflowRules((prev) => prev.filter((r) => r.id !== rule.id));
                          notify("تم حذف قاعدة العمل");
                        }}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleCreateWorkflow} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">+ إنشاء قاعدة أتمتة جديدة</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    <input
                      type="text"
                      required
                      placeholder="اسم القاعدة (e.g. تصعيد الشكاوى المالية)"
                      value={newWorkflowName}
                      onChange={(e) => setNewWorkflowName(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs"
                    />
                    <select
                      value={newWorkflowTrigger}
                      onChange={(e) => setNewWorkflowTrigger(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="CASE_CREATED">عند إنشاء الحالة (Case Created)</option>
                      <option value="SLA_WARNING">عند اقتراب مهلة SLA (Warning)</option>
                      <option value="SLA_BREACHED">عند كسر مهلة SLA (Breached)</option>
                    </select>
                    <select
                      value={newWorkflowPriority}
                      onChange={(e) => setNewWorkflowPriority(e.target.value)}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    >
                      <option value="CRITICAL">أولوية حرجة (Critical)</option>
                      <option value="HIGH">أولوية عالية (High)</option>
                      <option value="MEDIUM">أولوية متوسطة (Medium)</option>
                    </select>
                    <input
                      type="number"
                      placeholder="تطبيق SLA (ساعات)"
                      value={newWorkflowSla}
                      onChange={(e) => setNewWorkflowSla(Number(e.target.value))}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition">
                      حفظ قاعدة الأتمتة
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 11. AI SETTINGS & RESOLUTION ASSISTANT */}
            {activeSection === "AI_SETTINGS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">مساعد حسم المشكلات بالذكاء الاصطناعي (AI Resolution Assistant)</h2>
                <p className="text-xs text-slate-500 mb-6">
                  ضبط سلوك الذكاء الاصطناعي في تلخيص الشكاوى، اقتراح الأقسام، واكتشاف أسباب الخلل الجذرية (بدون صفة المستشار القانوني).
                </p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">التلخيص الذكي للحالة (Case Summarization)</div>
                      <p className="text-xs text-slate-500">إنشاء ملخص تنفيذي موجز ومحايد للموظف عند فتح الحالة فوراً.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-teal-600 w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">اقتراح مسودة الرد المؤسسي (Response Draft Generator)</div>
                      <p className="text-xs text-slate-500">توليد مسودة رسمية رصينة ومؤدبة للرد على المستفيد بنقرة واحدة.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-teal-600 w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">اكتشاف النواقص والبيانات المفقودة (Missing Information Detection)</div>
                      <p className="text-xs text-slate-500">تنبيه الموظف إذا كانت الشكوى تفتقر لرقم إيصال أو مستند أساسي قبل البدء.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-teal-600 w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">تحليل الأسباب الجذرية (Root Cause Analysis)</div>
                      <p className="text-xs text-slate-500">ربط الشكوى بمثيلاتها واقتراح معالجة الخلل الإجرائي لمنع تكرار الشكوى.</p>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded text-teal-600 w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={() => notify("تم حفظ إعدادات مساعد الـ AI Resolution بنجاح ✅")}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                    >
                      حفظ تفضيلات الـ AI
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 12. INTEGRATION HUB SHORTCUT */}
            {activeSection === "INTEGRATIONS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">مركز التكامل المؤسسي (Integration Hub)</h2>
                    <p className="text-xs text-slate-500">ربط Murafiq بأنظمتك القائمة (Entra ID, WhatsApp, SAP, SIS/HIS).</p>
                  </div>
                  <Link
                    href="/portal/integrations"
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition flex items-center gap-1.5"
                  >
                    <span>فتح مركز التكاملات الكامل ←</span>
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="font-bold text-sm text-slate-900 mb-1">الهوية والدخول الموحد (Identity & SSO)</div>
                    <p className="text-xs text-slate-500 mb-3">Microsoft Entra ID, Google Workspace, SAML 2.0</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">جاهز للتفعيل</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
                    <div className="font-bold text-sm text-slate-900 mb-1">قنوات التواصل (Messaging)</div>
                    <p className="text-xs text-slate-500 mb-3">WhatsApp Cloud API, SendGrid Email, SMS</p>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">مفعل</span>
                  </div>
                </div>
              </div>
            )}

            {/* 13. API & WEBHOOKS */}
            {activeSection === "API_WEBHOOKS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">بوابة المطور والـ Webhooks المؤسسية</h2>
                <p className="text-xs text-slate-500 mb-6">مفاتيح API الخاصة بمؤسستك ونقاط استلام الأحداث المباشرة (Event Webhooks).</p>

                {/* API Key */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6">
                  <div className="text-xs font-bold text-slate-700 mb-1">مفتاح الـ API المؤسسي (Tenant API Key)</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="password"
                      readOnly
                      value={`mrf_live_${institutionId.replace(/-/g, "").substring(0, 24)}`}
                      className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono w-full"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`mrf_live_${institutionId.replace(/-/g, "").substring(0, 24)}`);
                        notify("تم نسخ مفتاح الـ API بنجاح");
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-200 hover:bg-slate-300 text-slate-800 transition"
                    >
                      نسخ
                    </button>
                  </div>
                </div>

                {/* Webhooks list */}
                <div className="space-y-3 mb-6">
                  <h3 className="text-sm font-bold text-slate-800">اشتراكات الـ Webhooks النشطة</h3>
                  {webhooks.map((w) => (
                    <div key={w.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                      <div>
                        <div className="font-mono text-xs font-bold text-slate-800">{w.url}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-1">
                          الأحداث: {w.events.join(", ")} | Secret: {w.secret.substring(0, 10)}***
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleTestWebhook(w.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-bold bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
                        >
                          إرسال Test Ping 🚀
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add webhook */}
                <form onSubmit={handleAddWebhook} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700">+ تسجيل رابط Webhook جديد</h4>
                  <div className="flex items-center gap-3">
                    <input
                      type="url"
                      required
                      placeholder="https://api.your-company.com/webhook"
                      value={newWebhookUrl}
                      onChange={(e) => setNewWebhookUrl(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs font-mono"
                    />
                    <button type="submit" className="px-4 py-1.5 rounded-lg text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white transition shrink-0">
                      حفظ الـ Webhook
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* 14. AUDIT LOGS */}
            {activeSection === "AUDIT_LOGS" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">سجل العمليات والمراجعة المؤسسية (Audit Trail)</h2>
                <p className="text-xs text-slate-500 mb-5">توثيق غير قابل للتعديل لجميع العمليات والتغييرات التي تمت داخل بيئة المؤسسة.</p>

                <div className="divide-y divide-slate-100">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="py-3 flex items-start justify-between text-xs">
                      <div>
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          <span className="font-mono text-teal-700">{log.action}</span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-700">{log.actor_name} ({log.actor_role})</span>
                        </div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">
                          الكيان: {log.entity_type} ({log.entity_id})
                        </div>
                      </div>
                      <div className="text-slate-400 font-mono text-[11px]">
                        {new Date(log.created_at).toLocaleString("ar-EG")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 15. SECURITY & COMPLIANCE */}
            {activeSection === "SECURITY" && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <h2 className="text-lg font-bold text-slate-900 mb-1">إعدادات الأمان والامتثال (Security & Compliance)</h2>
                <p className="text-xs text-slate-500 mb-6">سياسات كلمات المرور، جلسات العمل، وحظر اختراق الحسابات.</p>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">إلزام الدخول الموحد (Enforce SSO Only)</div>
                      <p className="text-xs text-slate-500">حظر تسجيل الدخول بكلمة مرور للموظفين وإلزام الدخول عبر Microsoft / Google.</p>
                    </div>
                    <input type="checkbox" className="rounded text-teal-600 w-4 h-4 cursor-pointer" />
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">مهلة انتهاء الجلسة التلقائية (Session Timeout)</div>
                      <p className="text-xs text-slate-500">تسجيل الخروج التلقائي عند الخمول لأكثر من 30 دقيقة.</p>
                    </div>
                    <select className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-mono">
                      <option>15 دقيقة</option>
                      <option selected>30 دقيقة</option>
                      <option>60 دقيقة</option>
                    </select>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm text-slate-800">تشفير البيانات الحساسة (End-to-End PII Isolation)</div>
                      <p className="text-xs text-slate-500">عزل الأرقام القومية وبيانات الاتصال في جدول مشفر ومحمي بـ RLS.</p>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">مفعل دائماً</span>
                  </div>
                </div>
              </div>
            )}

            {/* Other sections fallback */}
            {!["GENERAL", "BRANDING", "BRANCHES", "DEPARTMENTS", "USERS", "ROLES", "CATEGORIES", "CUSTOM_FIELDS", "SLA", "WORKFLOWS", "AI_SETTINGS", "INTEGRATIONS", "API_WEBHOOKS", "AUDIT_LOGS", "SECURITY"].includes(activeSection) && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center shadow-xs">
                <div className="text-4xl mb-3">⚙️</div>
                <h3 className="text-base font-bold text-slate-800 mb-1">القسم متاح وقيد العمل</h3>
                <p className="text-xs text-slate-500">يمكنك تهيئة وتعديل كافة خيارات هذا القسم وتطبيقها فوراً على بيئة مؤسستك.</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

export default function OrganizationAdminPortal() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري تحميل لوحة إعدادات المؤسسة...</div>}>
      <OrganizationAdminContent />
    </Suspense>
  );
}
