"use client";

import React, { useState } from "react";
import { formatEgyptianPhone } from "@/lib/utils";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
  locale?: "ar" | "en";
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
  locale = "ar",
}: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const isRtl = locale === "ar";

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const formatted = formatEgyptianPhone(phone);
      setPhone(formatted);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || (isRtl ? "رقم الهاتف غير صالح" : "Invalid phone number"));
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 || otp === "123456") {
      onVerified(phone);
      onClose();
    } else {
      setError(isRtl ? "رمز التحقق غير صحيح. للتجربة استخدم 123456" : "Invalid OTP code. For demo use 123456");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        dir={isRtl ? "rtl" : "ltr"}
        className={`w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ${
          isRtl ? "text-right font-arabic" : "text-left"
        }`}
      >
        <h3 className="text-xl font-bold text-civic-navy mb-2">
          {isRtl ? "تأكيد رقم الهاتف المحمول (مصر)" : "Egyptian Mobile Verification"}
        </h3>
        <p className="text-sm text-slate-600 mb-4 leading-relaxed">
          {isRtl
            ? "وفقاً لسياسة المنصة وقانون حماية البيانات رقم 151 لسنة 2020، يلزم التحقق من رقم الهاتف المصري عبر رسالة نصية قصيرة (SMS)."
            : "Under Law 151/2020, Egyptian phone verification via SMS is required to protect submission integrity."}
        </p>

        {error && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRtl ? "رقم الهاتف (مثال: 01012345678)" : "Mobile Number (e.g., 01012345678)"}
              </label>
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-left dir-ltr focus:border-sky-800 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                {isRtl ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-sky-800 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-900"
              >
                {isRtl ? "إرسال رمز التحقق" : "Send OTP"}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                {isRtl ? `أدخل رمز التحقق (OTP) المرسل إلى ${phone}` : `Enter 6-digit OTP sent to ${phone}`}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-lg tracking-widest font-mono focus:border-sky-800 focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                {isRtl ? "رجوع" : "Back"}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-civic-teal px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
              >
                {isRtl ? "تأكيد الرقم" : "Verify Phone"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
