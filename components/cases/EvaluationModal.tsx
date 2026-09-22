"use client";

import React, { useState } from "react";

interface EvaluationModalProps {
  isOpen: boolean;
  caseId: string;
  caseReference: string;
  onClose: () => void;
  onSuccess: (evaluation: any) => void;
  locale?: "ar" | "en";
}

export function EvaluationModal({
  isOpen,
  caseId,
  caseReference,
  onClose,
  onSuccess,
  locale = "ar",
}: EvaluationModalProps) {
  const isRtl = locale === "ar";
  const [responseRating, setResponseRating] = useState<number>(4);
  const [resolutionRating, setResolutionRating] = useState<number>(4);
  const [closingComment, setClosingComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/cases/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          case_id: caseId,
          response_rating: responseRating,
          resolution_rating: resolutionRating,
          closing_comment: closingComment.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isRtl ? "فشل إرسال التقييم النهائي" : "Failed to submit final evaluation"));
      }

      onSuccess(data.evaluation);
      onClose();
    } catch (err: any) {
      setError(err.message || (isRtl ? "حدث خطأ أثناء حفظ التقييم" : "An error occurred while saving evaluation"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`w-full max-w-lg rounded-2xl bg-white p-6 md:p-8 shadow-2xl ${
          isRtl ? "text-right font-arabic" : "text-left"
        }`}
      >
        <div className="border-b border-slate-100 pb-4 mb-6">
          <span className="font-mono text-xs font-bold text-civic-teal bg-teal-50 px-2.5 py-1 rounded-md">
            {caseReference}
          </span>
          <h3 className="text-xl font-bold text-civic-navy mt-2">
            {isRtl
              ? "التقييم النهائي وإغلاق القضية (3D Experience Closure)"
              : "Final Case Closure Evaluation (3D Experience)"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {isRtl
              ? "رأيك يوثق النتيجة النهائية في السجل الرسمي للمؤسسة ويسهم في قياس مؤشرات الشفافية والحل."
              : "Your verified rating documents the official institutional outcome and informs transparent benchmarks."}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 p-3 text-xs text-red-600 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dimension 2: Response Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              {isRtl
                ? "1. تقييم تجاوب المؤسسة وتواصلها (Response Rating)"
                : "1. Institutional Responsiveness Rating"}
            </label>
            <p className="text-xs text-slate-500">
              {isRtl
                ? "مدى سرعة ومهنية واحترام إدارة الجهة أثناء معالجة الشكوى (1–5 نجوم)."
                : "Speed, professionalism, and institutional conduct during case handling (1–5 stars)."}
            </p>
            <div className={`flex gap-3 ${isRtl ? "justify-end" : "justify-start"} items-center`}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setResponseRating(val)}
                  className={`h-11 w-11 rounded-xl border text-sm font-bold transition ${
                    responseRating === val
                      ? "border-civic-navy bg-civic-navy text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Dimension 3: Resolution Rating */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              {isRtl
                ? "2. تقييم الحل الفعلي على أرض الواقع (Resolution Rating)"
                : "2. Tangible Resolution Outcome Rating"}
            </label>
            <p className="text-xs text-slate-500">
              {isRtl
                ? "هل تم تنفيذ الإجراءات المتفق عليها ومعالجة أصل المشكلة بصورة مرضية؟ (1–5 نجوم)."
                : "Were agreed remedial measures effectively executed to resolve the root cause? (1–5 stars)."}
            </p>
            <div className={`flex gap-3 ${isRtl ? "justify-end" : "justify-start"} items-center`}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setResolutionRating(val)}
                  className={`h-11 w-11 rounded-xl border text-sm font-bold transition ${
                    resolutionRating === val
                      ? "border-civic-teal bg-civic-teal text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {val}
                </button>
              ))}
            </div>
          </div>

          {/* Closing Comment */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">
              {isRtl ? "ملاحظات ختامية (اختياري)" : "Closing Remarks (Optional)"}
            </label>
            <textarea
              rows={3}
              value={closingComment}
              onChange={(e) => setClosingComment(e.target.value)}
              placeholder={
                isRtl
                  ? "اكتب ملاحظاتك النهائية حول جودة الحل..."
                  : "Share your concluding feedback on the resolution quality..."
              }
              className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:border-civic-navy focus:outline-none"
              maxLength={1000}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              {isRtl ? "إلغاء" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-lg bg-civic-navy px-6 py-2.5 text-sm font-semibold text-white hover:bg-opacity-90 disabled:opacity-50 transition"
            >
              {isSubmitting
                ? isRtl ? "جاري الاعتماد..." : "Confirming..."
                : isRtl ? "اعتماد التقييم وإغلاق القضية رسميّاً" : "Confirm Evaluation & Close Case"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
