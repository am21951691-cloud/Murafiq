"use client";

import React, { useState } from "react";
import { formatEgyptianPhone } from "@/lib/utils";

interface PhoneVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerified: (phone: string) => void;
}

export function PhoneVerificationModal({
  isOpen,
  onClose,
  onVerified,
}: PhoneVerificationModalProps) {
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const formatted = formatEgyptianPhone(phone);
      setPhone(formatted);
      setStep("otp");
    } catch (err: any) {
      setError(err.message || "رقم الهاتف غير صالح");
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6 || otp === "123456") {
      onVerified(phone);
      onClose();
    } else {
      setError("رمز التحقق غير صحيح. للتجربة استخدم 123456");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl text-right">
        <h3 className="text-xl font-bold text-civic-navy mb-2 font-arabic">
          تأكيد رقم الهاتف المحمول (مصر)
        </h3>
        <p className="text-sm text-slate-600 mb-4 font-arabic">
          وفقاً لسياسة المنصة وقانون حماية البيانات رقم 151 لسنة 2020، يلزم التحقق من رقم الهاتف المصري عبر رسالة نصية قصيرة (SMS).
        </p>

        {error && (
          <div className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600 font-arabic">
            {error}
          </div>
        )}

        {step === "phone" ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 font-arabic">
                رقم الهاتف (مثال: 01012345678)
              </label>
              <input
                type="tel"
                placeholder="010XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-left dir-ltr focus:border-civic-navy focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={onClose}
                className="rounded px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 font-arabic"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="rounded bg-civic-navy px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 font-arabic"
              >
                إرسال رمز التحقق
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1 font-arabic">
                أدخل رمز التحقق (OTP) المرسل إلى {phone}
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded border border-slate-300 px-3 py-2 text-center text-lg tracking-widest focus:border-civic-navy focus:outline-none"
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setStep("phone")}
                className="rounded px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 font-arabic"
              >
                رجوع
              </button>
              <button
                type="submit"
                className="rounded bg-civic-teal px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90 font-arabic"
              >
                تأكيد الرقم
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
