"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";

interface Connector {
  id: string;
  name: string;
  category: "IDENTITY" | "COMMUNICATION" | "BUSINESS" | "DEVELOPER";
  icon: string;
  description_ar: string;
  status: "CONNECTED" | "AVAILABLE" | "CONFIGURED";
  badge?: string;
  fields?: { label: string; placeholder: string; key: string; type?: string }[];
}

const CONNECTORS: Connector[] = [
  // Identity
  {
    id: "entra-id",
    name: "Microsoft Entra ID (Azure AD)",
    category: "IDENTITY",
    icon: "🪟",
    description_ar: "تسجيل الدخول الموحد (SSO) وتزامن الحسابات المؤسسية وأذونات مجموعات العمل من Active Directory.",
    status: "CONNECTED",
    badge: "SSO Active",
    fields: [
      { label: "Tenant ID (Azure)", placeholder: "e.g. 72f988bf-86f1-41af-91ab-2d7cd011db47", key: "tenantId" },
      { label: "Client ID", placeholder: "e.g. 11002233-4455-6677-8899-aabbccddeeff", key: "clientId" },
      { label: "Client Secret", placeholder: "••••••••••••••••", key: "clientSecret", type: "password" },
    ],
  },
  {
    id: "google-workspace",
    name: "Google Workspace",
    category: "IDENTITY",
    icon: "🌐",
    description_ar: "الدخول ببريد المؤسسة (@school.edu.eg أو @company.com) عبر OAuth 2.0 المعتمد.",
    status: "CONFIGURED",
    badge: "OIDC",
    fields: [
      { label: "OAuth 2.0 Client ID", placeholder: "xxxx.apps.googleusercontent.com", key: "clientId" },
      { label: "Allowed Hosted Domain (hd)", placeholder: "cairo-school.edu.eg", key: "domain" },
    ],
  },
  {
    id: "saml-sso",
    name: "SAML 2.0 / Okta / PingIdentity",
    category: "IDENTITY",
    icon: "🔐",
    description_ar: "بروتوكول المصادقة المؤسسي الموحد للربط مع بوابات الهوية المركزية للجامعات والهيئات الحكومية.",
    status: "AVAILABLE",
    badge: "Enterprise",
    fields: [
      { label: "Identity Provider Metadata URL", placeholder: "https://idp.gov.eg/saml/metadata.xml", key: "metadataUrl" },
      { label: "Entity ID / Audience URI", placeholder: "https://murafiq.app/saml/tenant", key: "entityId" },
    ],
  },

  // Communication
  {
    id: "whatsapp-cloud",
    name: "WhatsApp Business Cloud API (Meta)",
    category: "COMMUNICATION",
    icon: "💬",
    description_ar: "إرسال تحديثات الحالة ورسائل الـ SLA التلقائية ورابط التتبع مباشرة للمستفيد عبر واتساب الرسمي.",
    status: "CONNECTED",
    badge: "Meta Verified",
    fields: [
      { label: "Phone Number ID", placeholder: "109823485720192", key: "phoneId" },
      { label: "WhatsApp Business Account ID (WABA)", placeholder: "987654321012345", key: "wabaId" },
      { label: "Permanent Access Token", placeholder: "EAAB••••••••••••", key: "token", type: "password" },
    ],
  },
  {
    id: "email-gateway",
    name: "Institutional Email (SMTP / SendGrid / Resend)",
    category: "COMMUNICATION",
    icon: "✉️",
    description_ar: "إرسال خطابات الاعتماد والتقارير الرسمية وإشعارات التعيين من البريد الرسمي للمؤسسة.",
    status: "CONNECTED",
    badge: "DKIM / SPF",
    fields: [
      { label: "SMTP Host", placeholder: "smtp.mail.cairo-school.edu.eg", key: "host" },
      { label: "Sender From Email", placeholder: "noreply-cases@cairo-school.edu.eg", key: "fromEmail" },
    ],
  },
  {
    id: "sms-gateway",
    name: "SMS Gateway (Twilio / Local Telecom)",
    category: "COMMUNICATION",
    icon: "📱",
    description_ar: "إرسال رسائل نصية قصيرة SMS تحتوي على كود التتبع ورمز التحقق OTP.",
    status: "AVAILABLE",
    badge: "Telecom Ready",
    fields: [
      { label: "Sender ID (Approved Name)", placeholder: "MURAFIQ-EDU", key: "senderId" },
      { label: "API Key / Auth Token", placeholder: "••••••••••••••••", key: "apiKey", type: "password" },
    ],
  },

  // Business & Core Systems
  {
    id: "sis-banner",
    name: "Student Information System (SIS)",
    category: "BUSINESS",
    icon: "🎓",
    description_ar: "المزامنة الحية مع قواعد بيانات الطلاب والأقسام الأكاديمية (Ellucian Banner / Blackboard / المدارس).",
    status: "CONFIGURED",
    badge: "Education Core",
    fields: [
      { label: "SIS Endpoint API URL", placeholder: "https://sis.cu.edu.eg/api/v2", key: "apiUrl" },
      { label: "API Client Secret", placeholder: "••••••••••••••••", key: "secret", type: "password" },
    ],
  },
  {
    id: "hospital-his",
    name: "Hospital Information System (HIS / EHR)",
    category: "BUSINESS",
    icon: "🏥",
    description_ar: "الربط مع سجلات المرضى والمواعيد الطبية وقسم الفوترة والتأمين الصحي (Epic / Cerner / أنظمة محلية).",
    status: "AVAILABLE",
    badge: "Healthcare",
    fields: [
      { label: "FHIR / HL7 Gateway URL", placeholder: "https://his.hospital.com/fhir/r4", key: "fhirUrl" },
      { label: "Client Credential Token", placeholder: "••••••••••••••••", key: "token", type: "password" },
    ],
  },
  {
    id: "crm-salesforce",
    name: "CRM Integration (Salesforce / HubSpot)",
    category: "BUSINESS",
    icon: "💼",
    description_ar: "مزامنة شكاوى واستفسارات العملاء تلقائياً مع ملف العميل في نظام الـ CRM المؤسسي.",
    status: "AVAILABLE",
    badge: "Sales & Support",
    fields: [
      { label: "Salesforce Instance URL", placeholder: "https://yourorg.my.salesforce.com", key: "instanceUrl" },
      { label: "Connected App Consumer Key", placeholder: "3MVG9••••••••••••", key: "consumerKey" },
    ],
  },
  {
    id: "erp-sap",
    name: "ERP System (SAP / Oracle NetSuite)",
    category: "BUSINESS",
    icon: "📊",
    description_ar: "الربط مع الفواتير والتحصيل المالي والاسترداد النقدي في النظام المحاسبي للشركة.",
    status: "AVAILABLE",
    badge: "Financial Core",
    fields: [
      { label: "OData / REST Endpoint", placeholder: "https://erp.company.com/sap/opu/odata/...", key: "odataUrl" },
    ],
  },
];

export default function IntegrationsHubPage() {
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [selectedConnector, setSelectedConnector] = useState<Connector | null>(null);
  const [modalSaved, setModalSaved] = useState(false);
  const [testWebhookStatus, setTestWebhookStatus] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState("case.created");

  const filtered = CONNECTORS.filter((c) => activeCategory === "ALL" || c.category === activeCategory);

  const handleTestWebhookPing = async () => {
    setTestWebhookStatus("sending");
    try {
      const res = await fetch("/api/institution/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "TRIGGER_TEST_WEBHOOK",
          payload: {
            webhookId: "wh_demo_live",
            event: selectedEvent,
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestWebhookStatus("success");
        setTimeout(() => setTestWebhookStatus(null), 4000);
      }
    } catch {
      setTestWebhookStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-arabic text-right selection:bg-teal-600 selection:text-white" dir="rtl">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur sticky top-0 z-30 shadow-xs">
        <div className="mx-auto max-w-7xl px-4 py-3.5 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/portal/dashboard" className="flex items-center gap-2 hover:opacity-90 transition">
              <MurafiqLogo size="md" />
              <div>
                <span className="block text-xs font-black text-teal-800 uppercase tracking-wider font-sans">
                  Enterprise Integration Hub
                </span>
                <span className="text-xs text-slate-500">مركز التكاملات المؤسسية وبوابة المطور</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/portal/admin"
              className="text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition"
            >
              إعدادات المؤسسة ←
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <div className="bg-slate-900 text-white border-b border-slate-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-950 text-teal-300 border border-teal-800 mb-3">
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
                API Gateway Ready • 99.98% SLA
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
                Murafiq يركب بسلاسة داخل البنية التحتية لمؤسستك
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                اربط نظام الحالات بأنظمة الهوية المركزية (SSO)، قنوات التواصل المباشر (WhatsApp Cloud)، وأنظمة الإدارة المؤسسية (ERP / SIS / HIS) عبر واجهات برمجة معتمدة وآمنة.
              </p>
            </div>

            <div className="flex flex-col gap-2 shrink-0 font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Status:</span>
                <span className="text-emerald-400 font-bold">All Systems Operational</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Avg Latency:</span>
                <span className="text-white">42ms</span>
              </div>
              <div className="flex items-center justify-between gap-6">
                <span className="text-slate-400">Active Webhooks:</span>
                <span className="text-teal-400">7 Subscriptions</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 space-y-10">
        {/* Category Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2">
            {[
              { key: "ALL", label: "كافة التكاملات (All Connectors)" },
              { key: "IDENTITY", label: "🔑 الهوية والدخول الموحد (Identity & SSO)" },
              { key: "COMMUNICATION", label: "💬 المراسلات والتواصل (Messaging)" },
              { key: "BUSINESS", label: "🏛️ أنظمة العمل الأساسية (SIS / HIS / ERP)" },
            ].map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActiveCategory(cat.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  activeCategory === cat.key
                    ? "bg-teal-700 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-400 font-mono">Showing {filtered.length} Connectors</span>
        </div>

        {/* Connectors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((connector) => {
            const isConnected = connector.status === "CONNECTED";
            const isConfigured = connector.status === "CONFIGURED";
            return (
              <div
                key={connector.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner">
                      {connector.icon}
                    </div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        isConnected
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : isConfigured
                          ? "bg-sky-50 text-sky-700 border border-sky-200"
                          : "bg-slate-100 text-slate-600 border border-slate-200"
                      }`}
                    >
                      {isConnected && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>}
                      {connector.badge || (isConnected ? "مفعل" : "متاح للربط")}
                    </span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mb-1">{connector.name}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed mb-4">{connector.description_ar}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-mono text-slate-400">Category: {connector.category}</span>
                  <button
                    onClick={() => setSelectedConnector(connector)}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
                  >
                    {isConnected ? "إدارة الإعدادات" : "تهيئة الربط (Connect)"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Developer Portal Section */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-950 text-teal-300 border border-teal-800 mb-1">
                DEVELOPER SUITE
              </div>
              <h2 className="text-xl font-bold text-white">بوابة المطور — الـ APIs والـ Webhooks المباشرة</h2>
              <p className="text-xs text-slate-400">استقبل أحداث الشكاوى والحلول فور وقوعها، أو ارفع الحالات تلقائياً عبر REST API.</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-mono text-slate-400">API Version: <span className="text-teal-400">v1.2</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: API Reference */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-teal-400 flex items-center gap-2">
                <span>📡</span>
                <span>واجهات الـ REST API المتاحة</span>
              </h3>

              <div className="space-y-2 font-mono text-xs">
                {[
                  { method: "GET", path: "/api/v1/cases", desc: "استعراض قائمة الحالات مع الفلترة والترتيب" },
                  { method: "POST", path: "/api/v1/cases", desc: "إنشاء حالة جديدة برقم مرجعي وبيانات مشفرة" },
                  { method: "GET", path: "/api/v1/cases/:id", desc: "تفاصيل الحالة، الـ SLA، ومراحل خطة العمل" },
                  { method: "POST", path: "/api/v1/cases/:id/notes", desc: "إضافة ملاحظة داخلية سرية لقسم العمليات" },
                  { method: "GET", path: "/api/v1/departments", desc: "قائمة الأقسام ومؤشرات الـ SLA الخاصة بها" },
                  { method: "GET", path: "/api/v1/analytics", desc: "مؤشرات الأداء المؤسسي ومعدل الامتثال الزمني" },
                ].map((ep, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ep.method === "GET" ? "bg-sky-950 text-sky-400 border border-sky-800" : "bg-emerald-950 text-emerald-400 border border-emerald-800"
                      }`}>
                        {ep.method}
                      </span>
                      <span className="text-slate-200 font-bold">{ep.path}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-arabic">{ep.desc}</span>
                  </div>
                ))}
              </div>

              {/* cURL Sample */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300">
                <div className="flex items-center justify-between mb-2 text-[11px] text-slate-400">
                  <span>Sample cURL Request</span>
                  <span className="text-teal-400">Bash</span>
                </div>
                <pre className="overflow-x-auto text-[11px] text-teal-300 leading-relaxed">
{`curl -X GET "https://murafiq.app/api/v1/cases?status=IN_PROGRESS" \\
  -H "Authorization: Bearer mrf_live_sample_token_88421" \\
  -H "X-Tenant-ID: 00000000-0000-0000-0000-000000000010"`}
                </pre>
              </div>
            </div>

            {/* Right: Webhooks & Event Simulator */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <span>⚡</span>
                <span>كتالوج أحداث الـ Webhooks والمحاكي</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-2">اختر الحدث للاختبار (Select Event Type)</label>
                  <select
                    value={selectedEvent}
                    onChange={(e) => setSelectedEvent(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-white"
                  >
                    <option value="case.created">case.created — تسجيل حالة جديدة</option>
                    <option value="case.assigned">case.assigned — إحالة الحالة لقسم معين</option>
                    <option value="case.updated">case.updated — تحديث خطة العمل أو أولوية الحالة</option>
                    <option value="case.resolved">case.resolved — حسم الحالة واعتماد الحل</option>
                    <option value="case.closed">case.closed — الإغلاق النهائي للحالة</option>
                    <option value="evaluation.created">evaluation.created — تقديم المستفيد تقييم الرضا</option>
                    <option value="report.generated">report.generated — إصدار تقرير PDF معتمد ببصمة SHA-256</option>
                  </select>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-[11px]">
                  <div className="text-slate-400 mb-1">Payload Sample Preview:</div>
                  <pre className="text-amber-300 overflow-x-auto">
{JSON.stringify(
  {
    event: selectedEvent,
    case_id: "33333333-3333-3333-3333-333333333333",
    reference_number: "MRF-2026-31045",
    tenant_id: "00000000-0000-0000-0000-000000000010",
    timestamp: new Date().toISOString(),
    metadata: { trigger_source: "Enterprise Integration Hub" },
  },
  null,
  2
)}
                  </pre>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-slate-400 font-mono">Header: X-Murafiq-Signature</span>
                  <button
                    onClick={handleTestWebhookPing}
                    disabled={testWebhookStatus === "sending"}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-lg transition flex items-center gap-1.5"
                  >
                    {testWebhookStatus === "sending" ? "جاري الإرسال..." : "إرسال اختبار فوري (Trigger Ping) 🚀"}
                  </button>
                </div>

                {testWebhookStatus === "success" && (
                  <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-mono animate-fadeIn">
                    ✓ Status 200 OK — Payload delivered to registered webhook endpoint successfully.
                  </div>
                )}
                {testWebhookStatus === "error" && (
                  <div className="p-3 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs font-mono animate-fadeIn">
                    ✕ Delivery simulation failed. Please check network logs.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal: Configure Connector */}
      {selectedConnector && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl text-right animate-fadeIn border border-slate-200">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{selectedConnector.icon}</span>
              <div>
                <h3 className="text-base font-black text-slate-900">{selectedConnector.name}</h3>
                <span className="text-xs text-slate-500">{selectedConnector.category} Connector</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-5 leading-relaxed">{selectedConnector.description_ar}</p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setModalSaved(true);
                setTimeout(() => {
                  setModalSaved(false);
                  setSelectedConnector(null);
                }, 1500);
              }}
              className="space-y-3"
            >
              {selectedConnector.fields?.map((f, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-bold text-slate-700 mb-1">{f.label}</label>
                  <input
                    type={f.type || "text"}
                    placeholder={f.placeholder}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800"
                  />
                </div>
              ))}

              {modalSaved && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                  ✓ تم حفظ بيانات الربط وتفعيل التكامل بنجاح!
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedConnector(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition"
                >
                  حفظ وتفعيل التكامل
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
