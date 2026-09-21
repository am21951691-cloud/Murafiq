import React from "react";

interface ThreeDimensionalRatingProps {
  experienceRating: number;
  responseRating?: number | null;
  resolutionRating?: number | null;
}

export function ThreeDimensionalRating({
  experienceRating,
  responseRating,
  resolutionRating,
}: ThreeDimensionalRatingProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 text-right font-arabic">
      {/* 1. Experience Rating */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-slate-500 font-medium mb-1">
          أثر الشكوى الأصلي (Intake)
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-civic-navy font-mono">
            {experienceRating} / 5
          </span>
          <span className="text-amber-500 text-sm">
            {"★".repeat(Math.max(0, experienceRating))}
            {"☆".repeat(Math.max(0, 5 - experienceRating))}
          </span>
        </div>
      </div>

      {/* 2. Response Rating */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-slate-500 font-medium mb-1">
          تجاوب المؤسسة (Communication)
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-civic-navy font-mono">
            {responseRating ? `${responseRating} / 5` : "—"}
          </span>
          <span className="text-amber-500 text-sm">
            {responseRating ? (
              <>
                {"★".repeat(Math.max(0, responseRating))}
                {"☆".repeat(Math.max(0, 5 - responseRating))}
              </>
            ) : (
              <span className="text-xs text-slate-400">بانتظار التقييم</span>
            )}
          </span>
        </div>
      </div>

      {/* 3. Resolution Rating */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="text-xs text-slate-500 font-medium mb-1">
          فاعلية الحل النهائي (Outcome)
        </div>
        <div className="flex items-center justify-between">
          <span className="text-lg font-bold text-civic-teal font-mono">
            {resolutionRating ? `${resolutionRating} / 5` : "—"}
          </span>
          <span className="text-amber-500 text-sm">
            {resolutionRating ? (
              <>
                {"★".repeat(Math.max(0, resolutionRating))}
                {"☆".repeat(Math.max(0, 5 - resolutionRating))}
              </>
            ) : (
              <span className="text-xs text-slate-400">بانتظار التقييم</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
