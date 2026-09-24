"use client";

import React, { useState } from "react";
import { ResolutionReportCanvas } from "./ResolutionReportCanvas";

interface ResolutionReportModalProps {
  caseId: string;
  referenceNumber: string;
  isOpen: boolean;
  onClose: () => void;
  onWhatsAppSent?: (result: any) => void;
}

export function ResolutionReportModal({
  caseId,
  referenceNumber,
  isOpen,
  onClose,
  onWhatsAppSent,
}: ResolutionReportModalProps) {
  const [recipientPhoneOverride, setRecipientPhoneOverride] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-6xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden text-right">
        {/* Modal Header */}
        <div className="p-4 md:px-6 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-teal-500/20 text-teal-400 rounded-xl text-base">📑</span>
            <div>
              <h2 className="text-sm md:text-base font-black">
                محضر فحص وتسوية الحالة ومصفوفة الإجراءات التصحيحية
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                المرجع: {referenceNumber} | تقرير رسمي معتمد وموقع إلكترونياً
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm transition"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-900">
            <div className="flex items-center gap-2">
              <span className="text-amber-600 font-bold">ℹ️ نموذج الفحص المؤسسي الميداني:</span>
              <span>
                مطابق للمصفوفة الرسمية (8 أعمدة) المعتمدة للتفتيش، التوصيات، خطط التنفيذ، والإفادة النهائية.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-700">رقم هاتف المستفيد:</span>
              <input
                type="text"
                placeholder="01012345678"
                value={recipientPhoneOverride}
                onChange={(e) => setRecipientPhoneOverride(e.target.value)}
                className="bg-white border border-amber-300 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-800 w-36 text-center"
              />
            </div>
          </div>

          <ResolutionReportCanvas
            caseId={caseId}
            onWhatsAppSent={(res) => {
              if (onWhatsAppSent) onWhatsAppSent(res);
            }}
          />
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>منظومة مُرافِق Enterprise © 2026 — كافة البيانات مؤمنة ومشفرة</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold transition"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
