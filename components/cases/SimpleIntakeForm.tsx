"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Building2, Phone, FileText, Send, ArrowRight } from "lucide-react";
import Link from "next/link";

interface SimpleIntakeFormProps {
  locale?: string;
  defaultInstitutionId?: string;
}

const COMMON_ENTITIES = [
  { id: "00000000-0000-0000-0000-000000000010", name: "مدرسة الأمل التجريبية الرسمية لغات" },
  { id: "uni-cairo-001", name: "جامعة القاهرة (Cairo University)" },
  { id: "gov-civil-001", name: "مصلحة الأحوال المدنية (العباسية)" },
  { id: "health-cairo-001", name: "مستشفى القصر العيني التعليمي الجديد" },
  { id: "com-telecom-001", name: "الشركة المصرية للاتصالات (WE - السنترال الرئيسي)" },
];

export function SimpleIntakeForm({ locale = "ar", defaultInstitutionId }: SimpleIntakeFormProps) {
  const isRtl = locale === "ar";

  const [institutionId, setInstitutionId] = useState(defaultInstitutionId || COMMON_ENTITIES[0].id);
  const [customEntity, setCustomEntity] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [description, setDescription] = useState("");
  const [desiredOutcome, setDesiredOutcome] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (description.trim().length < 50) {
      setError(
        isRtl
          ? "يرجى كتابة تفاصيل المشكلة بوضوح (50 حرفاً كحد أدنى)."
          : "Please describe the issue in detail (at least 50 characters)."
      );
      return;
    }

    if (!phone.trim()) {
      setError(isRtl ? "يرجى إدخال رقم الهاتف للمتابعة." : "Please enter a valid contact phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/cases/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institution_id: isCustom ? "custom-entity-id" : institutionId,
          custom_entity_name: isCustom ? customEntity.trim() : undefined,
          category: "ADMINISTRATION_DISCIPLINE",
          subcategory: "عام",
          priority: "MEDIUM",
          raw_description: description,
          desired_outcome: desiredOutcome || "حل المشكلة وإفادة المشتكي بالإجراء المتخذ",
          initial_experience_rating: 3,
          visibility: "STRICTLY_PRIVATE",
          parent_phone: phone,
          consent_given: true,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || (isRtl ? "فشل تسجيل الحالة" : "Submission failed"));
      }

      setSuccessResult(data.case);
    } catch (err: any) {
      setError(err.message || (isRtl ? "حدث خطأ غير متوقع" : "An unexpected error occurred"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (successResult) {
    return (
      <Card className="max-w-xl mx-auto shadow-md border-emerald-100 bg-white">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <Badge variant="success" className="text-sm px-3 py-1">
            {isRtl ? "تم تسجيل طلبك بنجاح" : "Successfully Submitted"}
          </Badge>
          <h2 className="text-2xl font-bold text-slate-800">
            {isRtl ? "رقم المتابعة الخاص بك" : "Your Reference Number"}
          </h2>
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-xl font-bold text-blue-600 tracking-wider">
            {successResult.reference_number}
          </div>
          <p className="text-slate-500 text-sm max-w-md mx-auto">
            {isRtl
              ? "تم إرسال تفاصيل الحالة إلى الإدارة المعنية لمراجعتها واتخاذ إجراءات الحل الفوري. يمكنك متابعة حالة الطلب في أي وقت."
              : "Your case has been forwarded to the relevant department for swift resolution. You can track updates at any time."}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <Link href={`/${locale}/portal/cases/${successResult.id}`}>
              <Button variant="default" className="w-full sm:w-auto flex items-center gap-2">
                <span>{isRtl ? "عرض ملف الحالة" : "View Case"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              onClick={() => {
                setSuccessResult(null);
                setDescription("");
                setDesiredOutcome("");
              }}
            >
              {isRtl ? "تسجيل طلب آخر" : "Submit Another"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto shadow-sm border-slate-200 bg-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">
              {isRtl ? "تسجيل شكوى أو طلب جديد" : "Submit a New Request"}
            </CardTitle>
            <CardDescription>
              {isRtl
                ? "نموذج بسيط ومباشر لإرسال ملاحظتك وتتبع إجراءات الحل"
                : "A simple, direct form to submit your issue and track resolution progress"}
            </CardDescription>
          </div>
          <Badge variant="outline" className="hidden sm:inline-flex">
            {isRtl ? "سري وآمن 🔒" : "Confidential 🔒"}
          </Badge>
        </div>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Organization Selection */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              {isRtl ? "الجهة أو المؤسسة المعنية" : "Concerned Organization"}
            </label>
            {!isCustom ? (
              <div className="space-y-2">
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {COMMON_ENTITIES.map((entity) => (
                    <option key={entity.id} value={entity.id}>
                      {entity.name}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setIsCustom(true)}
                  className="text-xs text-blue-600 hover:underline inline-block"
                >
                  {isRtl ? "+ الجهة غير موجودة بالقائمة؟ اضغط هنا لكتابتها" : "+ Entity not listed? Click here"}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Input
                  placeholder={isRtl ? "اسم الجهة أو المدرسة..." : "Organization name..."}
                  value={customEntity}
                  onChange={(e) => setCustomEntity(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsCustom(false)}
                  className="text-xs text-slate-500 hover:underline inline-block"
                >
                  {isRtl ? "العودة للاختيار من القائمة" : "Back to list"}
                </button>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400" />
                {isRtl ? "تفاصيل المشكلة أو الملاحظة" : "Issue Description"}
              </label>
              <span className={`text-xs ${description.length >= 50 ? "text-emerald-600" : "text-slate-400"}`}>
                {description.length} / 50 {isRtl ? "حرف كحد أدنى" : "chars min"}
              </span>
            </div>
            <textarea
              className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
              placeholder={
                isRtl
                  ? "اشرح ما حدث بدقة مع ذكر التواريخ والوقائع بوضوح..."
                  : "Explain what happened in detail with dates and relevant context..."
              }
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          {/* Desired Outcome */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">
              {isRtl ? "ما هو الحل أو الإجراء المطلوب؟ (اختياري)" : "Desired Resolution (Optional)"}
            </label>
            <Input
              placeholder={isRtl ? "مثال: تغيير موعد الحافلة، فحص الشكوى، اعتذار رسمي..." : "e.g. Reschedule bus route, review complaint..."}
              value={desiredOutcome}
              onChange={(e) => setDesiredOutcome(e.target.value)}
            />
          </div>

          {/* Contact Phone */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-slate-400" />
              {isRtl ? "رقم الهاتف للمتابعة" : "Phone Number"}
            </label>
            <Input
              type="tel"
              placeholder="01012345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              dir="ltr"
              required
            />
            <p className="text-xs text-slate-400">
              {isRtl
                ? "لن يتم مشاركة رقم هاتفك علناً، يُستخدم فقط لإرسال التحديثات الرسمية."
                : "Your phone number will never be shared publicly; used only for official updates."}
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex justify-between items-center border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-400">
            {isRtl ? "بالضغط على إرسال، أنت توافق على شروط الاستخدام" : "By submitting, you agree to terms"}
          </p>
          <Button type="submit" disabled={isSubmitting} className="flex items-center gap-2">
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? (isRtl ? "جاري الإرسال..." : "Submitting...") : (isRtl ? "إرسال الطلب" : "Submit Case")}</span>
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
