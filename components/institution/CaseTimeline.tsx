"use client";

import React from "react";

export interface TimelineEvent {
  id: string;
  eventType: string;
  actorId?: string;
  actorRole?: string;
  title: string;
  description?: string;
  timestamp: string;
  status?: "COMPLETED" | "IN_PROGRESS" | "PENDING";
  metadata?: Record<string, any>;
}

interface CaseTimelineProps {
  events: TimelineEvent[];
  referenceNumber?: string;
}

const EVENT_ICONS: Record<string, string> = {
  CASE_SUBMITTED: "📥",
  CASE_ACKNOWLEDGED: "✅",
  CASE_ASSIGNMENT_UPDATED: "🏢",
  ACTION_PLAN_COMMITTED: "📋",
  MILESTONE_COMPLETED: "🎯",
  INTERNAL_NOTE_ADDED: "💬",
  COMMUNICATION_SENT: "📨",
  EVALUATION_SUBMITTED: "⭐",
  CASE_CLOSED: "🔒",
  DEFAULT: "📌",
};

export function CaseTimeline({ events, referenceNumber }: CaseTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500 font-arabic text-xs">
        لا توجد أحداث مسجلة في الجدول الزمني بعد.
      </div>
    );
  }

  // Sort events chronologically (newest first or oldest first)
  const sortedEvents = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right font-arabic">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
        <div>
          <h3 className="text-base font-black text-slate-900">
            الجدول الزمني ومسار التدقيق (Audit Timeline)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            سجل غير قابل للتعديل لكافة الإجراءات والقرارات المتخذة بشأن الحالة
          </p>
        </div>
        {referenceNumber && (
          <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
            {referenceNumber}
          </span>
        )}
      </div>

      <div className="relative border-r-2 border-teal-100 pr-5 space-y-6 mr-3">
        {sortedEvents.map((evt, idx) => {
          const icon = EVENT_ICONS[evt.eventType] || EVENT_ICONS.DEFAULT;
          const formattedDate = new Date(evt.timestamp).toLocaleString("ar-EG", {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return (
            <div key={evt.id || idx} className="relative group">
              {/* Timeline marker icon */}
              <div className="absolute -right-[31px] top-0 flex h-7 w-7 items-center justify-center rounded-full bg-teal-50 border-2 border-teal-600 text-sm shadow-2xs">
                {icon}
              </div>

              {/* Event card content */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4 transition hover:bg-white hover:shadow-xs hover:border-teal-200">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-black text-xs text-slate-900">
                    {evt.title}
                  </span>
                  <span className="font-mono text-[11px] text-slate-400 font-medium">
                    {formattedDate}
                  </span>
                </div>

                {evt.description && (
                  <p className="text-xs text-slate-600 leading-relaxed mt-1 font-medium">
                    {evt.description}
                  </p>
                )}

                <div className="flex flex-wrap items-center gap-2 mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  {evt.actorRole && (
                    <span className="inline-flex items-center rounded-md bg-slate-200/70 px-2 py-0.5 font-bold text-slate-700">
                      بواسطة: {evt.actorRole}
                    </span>
                  )}
                  {evt.eventType && (
                    <span className="font-mono text-[10px] text-slate-400">
                      {evt.eventType}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
