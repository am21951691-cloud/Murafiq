"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, Calendar, AlertCircle } from "lucide-react";

export interface SimpleResolutionSummaryProps {
  referenceNumber: string;
  institutionName: string;
  issue: string;
  resolution: string;
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  targetDate?: string;
  actionSteps?: string[];
  isRtl?: boolean;
}

export function SimpleResolutionSummary({
  referenceNumber,
  institutionName,
  issue,
  resolution,
  status = "RESOLVED",
  targetDate,
  actionSteps = [],
  isRtl = true,
}: SimpleResolutionSummaryProps) {
  const getStatusBadge = () => {
    switch (status) {
      case "RESOLVED":
      case "CLOSED":
        return <Badge variant="success">{isRtl ? "تم الحل والتسوية" : "Resolved"}</Badge>;
      case "IN_PROGRESS":
        return <Badge variant="warning">{isRtl ? "قيد المعالجة" : "In Progress"}</Badge>;
      default:
        return <Badge variant="default">{isRtl ? "قيد المراجعة" : "Under Review"}</Badge>;
    }
  };

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden bg-white">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 font-mono tracking-wider">{referenceNumber}</span>
          <h2 className="text-xl font-bold mt-0.5">{institutionName}</h2>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <CardContent className="p-6 space-y-6">
        {/* 1. The Issue */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800">
              {isRtl ? "1. المشكلة المسجلة" : "1. The Reported Issue"}
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
              {issue}
            </p>
          </div>
        </div>

        {/* 2. The Resolution */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 flex-1">
            <h4 className="text-sm font-semibold text-slate-800">
              {isRtl ? "2. خطة الحل والإجراءات المتخذة" : "2. Resolution & Actions Taken"}
            </h4>
            <div className="text-sm text-slate-600 leading-relaxed bg-emerald-50/50 p-3 rounded-lg border border-emerald-100/60">
              {resolution}
              {actionSteps && actionSteps.length > 0 && (
                <ul className="mt-3 space-y-1.5 list-disc list-inside text-xs text-slate-600">
                  {actionSteps.map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* 3. The Timeline */}
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800">
              {isRtl ? "3. الجدول الزمني والمتابعة" : "3. Timeline & Target Date"}
            </h4>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>{targetDate || (isRtl ? "تم الإنجاز" : "Completed")}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
