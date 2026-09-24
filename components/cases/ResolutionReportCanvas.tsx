"use client";

import React, { useEffect, useRef, useState } from "react";
import type { ReportTemplateData, ReportAuditMatrixItem } from "@/lib/pdf/template";

interface ResolutionReportCanvasProps {
  caseId: string;
  data?: ReportTemplateData;
  onWhatsAppSent?: (result: any) => void;
}

export function ResolutionReportCanvas({
  caseId,
  data: propData,
  onWhatsAppSent,
}: ResolutionReportCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [data, setData] = useState<ReportTemplateData | null>(propData || null);
  const [loading, setLoading] = useState(!propData);
  const [zoom, setZoom] = useState(1);
  const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
  const [whatsAppSuccess, setWhatsAppSuccess] = useState<string | null>(null);
  const [recipientPhone, setRecipientPhone] = useState<string>("");

  useEffect(() => {
    if (propData) {
      setData(propData);
      return;
    }

    const loadPreviewData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}/report/preview`);
        const json = await res.json();
        if (json.success && json.reportData) {
          setData(json.reportData);
          if (json.recipientPhone) {
            setRecipientPhone(json.recipientPhone);
          }
        }
      } catch (err) {
        console.error("Failed to load report canvas data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPreviewData();
  }, [caseId, propData]);

  // Canvas Drawing Effect
  useEffect(() => {
    if (!data || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Dimensions: landscape A4 proportion
    const width = 1320;
    const height = 900;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width * zoom}px`;
    canvas.style.height = `${height * zoom}px`;

    ctx.scale(dpr, dpr);

    // 1. Background Paper
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Document border
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // Helper for text wrapping
    const wrapText = (
      text: string,
      x: number,
      y: number,
      maxWidth: number,
      lineHeight: number,
      maxLines = 4
    ) => {
      if (!text) return y;
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      let linesCount = 0;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + " ";
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line, x, currentY);
          line = words[n] + " ";
          currentY += lineHeight;
          linesCount++;
          if (linesCount >= maxLines - 1 && n < words.length - 1) {
            line += "...";
            break;
          }
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line, x, currentY);
      return currentY + lineHeight;
    };

    ctx.textAlign = "right";
    ctx.direction = "rtl";

    // 2. Top Bar: Date & Platform
    ctx.font = "bold 15px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`التاريخ : ${data.generatedDate || "2026/09/24"}`, width - 35, 38);

    ctx.textAlign = "left";
    ctx.font = "bold 13px 'Cairo', sans-serif";
    ctx.fillStyle = "#0284c7";
    ctx.fillText("منظومة مُرافِق Enterprise | محضر فحص وتسوية حالة رسمي", 35, 38);

    // Top Divider Line
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(30, 48);
    ctx.lineTo(width - 30, 48);
    ctx.stroke();

    // 3. Header Banner Box
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.fillRect(30, 56, width - 60, 68);
    ctx.strokeRect(30, 56, width - 60, 68);

    // Institution Name & Reference
    ctx.textAlign = "right";
    ctx.font = "900 18px 'Cairo', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText(data.institutionName || "المؤسسة التعليمية", width - 45, 82);

    ctx.font = "600 11.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(
      `الفرع: ${data.branchName || "الرئيسي"}  |  التصنيف: ${data.category || "عام"}  |  فترة التسوية: من ${data.openedDate || "2026/09/01"} إلى ${data.closedDate || data.generatedDate}`,
      width - 45,
      106
    );

    ctx.textAlign = "left";
    ctx.font = "bold 12px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`رقم المرجع: ${data.referenceNumber}`, 45, 82);

    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#16a34a";
    ctx.fillText("حالة الوثيقة: تسوية معتمدة ومغلقة (RESOLVED)", 45, 104);

    // 4. Attribution Summary Strip
    ctx.fillStyle = "#f1f5f9";
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillRect(30, 132, width - 60, 42);
    ctx.strokeRect(30, 132, width - 60, 42);

    ctx.textAlign = "right";
    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText("[USER-REPORTED] ملخص الشكوى:", width - 40, 150);

    ctx.font = "normal 10.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#1e293b";
    const shortDesc = (data.sanitizedSummary || "").slice(0, 95);
    ctx.fillText(shortDesc, width - 215, 150);

    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#b45309";
    ctx.fillText("[INSTITUTION-STATED] بيان الإدارة:", width - 40, 166);

    ctx.font = "normal 10.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#334155";
    const shortStatement = (data.officialStatement || "").slice(0, 90);
    ctx.fillText(shortStatement, width - 225, 166);

    // 5. The 8-Column Real-Life Audit Matrix Table
    const tableTop = 184;
    const tableLeft = 30;
    const tableWidth = width - 60;

    // Column widths matching the real-world sample (from right to left)
    const cols = [
      { id: "seq", title: "م", w: 45, align: "center" },
      { id: "item", title: "البند", w: 120, align: "right" },
      { id: "observation", title: "الملحوظة", w: 320, align: "right" },
      { id: "recommendation", title: "التوصية", w: 175, align: "right" },
      { id: "isRecurring", title: "مكرر (نعم/لا)", w: 80, align: "center" },
      { id: "actionSteps", title: "خطوات التنفيذ المقترحة", w: 320, align: "right" },
      { id: "statement", title: "الإفادة / الرد", w: 110, align: "right" },
      { id: "targetDate", title: "التاريخ المتوقع للحل", w: 90, align: "center" },
    ];

    // Draw Table Header Row
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(tableLeft, tableTop, tableWidth, 34);
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(tableLeft, tableTop, tableWidth, 34);

    let currentX = tableLeft + tableWidth;
    cols.forEach((col) => {
      currentX -= col.w;
      // Vertical cell divider
      ctx.beginPath();
      ctx.moveTo(currentX, tableTop);
      ctx.lineTo(currentX, tableTop + 34);
      ctx.stroke();

      // Header text
      ctx.font = "bold 11px 'Cairo', sans-serif";
      ctx.fillStyle = "#0f172a";
      if (col.align === "center") {
        ctx.textAlign = "center";
        ctx.fillText(col.title, currentX + col.w / 2, tableTop + 22);
      } else {
        ctx.textAlign = "right";
        ctx.fillText(col.title, currentX + col.w - 8, tableTop + 22);
      }
    });

    // Draw Table Data Rows (Active Items)
    const auditItems: ReportAuditMatrixItem[] = data.auditItems || [
      {
        seq: 15,
        item: "اعلام",
        observation: "هناك فيديو تم نشره على جروب فريق عمل المدرسة به خطأ لغة عربية (بسيط) ومن المتوقع ان يكون قد تم نشره على جروبات اولياء الامور .",
        recommendation: "مراجعة اي مادة اعلامية قبل نشرها",
        isRecurring: "لا",
        actionSteps: "تكليف اخصائية الاعلام بارسال الفيديوهات والمنشورات الاعلامية لاحد معلمي اللغة العربية للاطلاع قبل النشر وتكليف وكيل المدرسة بالمتابعة",
        statement: data.officialStatement || "تم استكمال الإجراء",
        targetDate: "2026/09/30",
      },
      {
        seq: 16,
        item: "اخصائي نفسي",
        observation: "طلب السيد مدير المدرسة من الاخصائي النفسي اعداد خطة للندوات والمحاضرات على مدار العام الدراسي - اين خطة عام 2027/2026؟",
        recommendation: "اين خطة عام 2027/2026؟",
        isRecurring: "لا",
        actionSteps: "تكليف السيد/ وكيل المدرسة بمتابعة اعمال الاخصائي النفسي وتقديم خطة تفصيلية لعام 2027/2026 وتقديم تقرير اسبوعي عن ماتم من اعمال",
        statement: "قيد المتابعة",
        targetDate: "2026/10/05",
      },
      {
        seq: 17,
        item: "اخصائي اجتماعي",
        observation: "متابعة تفعيل مبادرات الدمج التعليمي والدعم السلوكي لجميع الفصول الدراسية وتوثيق الحالات الموجهة لإدارة الرعاية الاجتماعية.",
        recommendation: "تطبيق سجل الرعاية الاجتماعية",
        isRecurring: "لا",
        actionSteps: "تكليف وكيل المدرسة بمتابعة تلك التكليفات والتاكد من التنفيذ وتقديم تقرير اسبوعي الى السيد/مدير المدرسة",
        statement: "تم الاعتماد",
        targetDate: "2026/10/10",
      },
    ];

    let rowY = tableTop + 34;
    const rowHeight = 72;

    auditItems.slice(0, 3).forEach((item) => {
      // Row border
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1.2;
      ctx.strokeRect(tableLeft, rowY, tableWidth, rowHeight);

      let cellX = tableLeft + tableWidth;
      cols.forEach((col) => {
        cellX -= col.w;
        ctx.beginPath();
        ctx.moveTo(cellX, rowY);
        ctx.lineTo(cellX, rowY + rowHeight);
        ctx.stroke();

        ctx.fillStyle = "#0f172a";

        if (col.id === "seq") {
          ctx.font = "bold 13px 'Cairo', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(String(item.seq), cellX + col.w / 2, rowY + 38);
        } else if (col.id === "item") {
          ctx.font = "bold 11px 'Cairo', sans-serif";
          ctx.textAlign = "right";
          ctx.fillText(item.item, cellX + col.w - 8, rowY + 24);
        } else if (col.id === "observation") {
          ctx.font = "normal 10px 'Cairo', sans-serif";
          ctx.textAlign = "right";
          wrapText(item.observation, cellX + col.w - 8, rowY + 18, col.w - 16, 15, 3);
        } else if (col.id === "recommendation") {
          ctx.font = "600 10.5px 'Cairo', sans-serif";
          ctx.fillStyle = "#0369a1";
          ctx.textAlign = "right";
          wrapText(item.recommendation, cellX + col.w - 8, rowY + 18, col.w - 16, 15, 3);
        } else if (col.id === "isRecurring") {
          ctx.font = "bold 11px 'Cairo', sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(item.isRecurring, cellX + col.w / 2, rowY + 38);
        } else if (col.id === "actionSteps") {
          ctx.font = "normal 10px 'Cairo', sans-serif";
          ctx.fillStyle = "#334155";
          ctx.textAlign = "right";
          wrapText(item.actionSteps, cellX + col.w - 8, rowY + 18, col.w - 16, 15, 3);
        } else if (col.id === "statement") {
          ctx.font = "bold 9.5px 'Cairo', sans-serif";
          ctx.fillStyle = "#059669";
          ctx.textAlign = "right";
          wrapText(item.statement, cellX + col.w - 6, rowY + 20, col.w - 12, 14, 3);
        } else if (col.id === "targetDate") {
          ctx.font = "bold 10px monospace";
          ctx.textAlign = "center";
          ctx.fillText(item.targetDate, cellX + col.w / 2, rowY + 38);
        }
      });

      rowY += rowHeight;
    });

    // Draw Empty Sample Rows (Matching row 19 and empty grid from sample image)
    const emptyRowHeights = [28, 28, 28, 28];
    emptyRowHeights.forEach((eh, idx) => {
      ctx.strokeStyle = "#1e293b";
      ctx.lineWidth = 1;
      ctx.strokeRect(tableLeft, rowY, tableWidth, eh);

      let cellX = tableLeft + tableWidth;
      cols.forEach((col) => {
        cellX -= col.w;
        ctx.beginPath();
        ctx.moveTo(cellX, rowY);
        ctx.lineTo(cellX, rowY + eh);
        ctx.stroke();

        // Print row 19 and empty marks
        if (idx === 0) {
          if (col.id === "seq") {
            ctx.font = "bold 11px 'Cairo', sans-serif";
            ctx.fillStyle = "#64748b";
            ctx.textAlign = "center";
            ctx.fillText("19", cellX + col.w / 2, rowY + 18);
          } else if (col.id === "isRecurring") {
            ctx.font = "bold 11px 'Cairo', sans-serif";
            ctx.fillStyle = "#0f172a";
            ctx.textAlign = "center";
            ctx.fillText("لا", cellX + col.w / 2, rowY + 18);
          }
        }
      });
      rowY += eh;
    });

    // 6. 3D Evaluation & CSAT Section
    const evalTop = rowY + 10;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillRect(tableLeft, evalTop, tableWidth, 42);
    ctx.strokeRect(tableLeft, evalTop, tableWidth, 42);

    ctx.textAlign = "right";
    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#15803d";
    ctx.fillText("[USER-CONFIRMED] التقييم النهائي ثلاثي الأبعاد:", width - 45, evalTop + 18);

    ctx.font = "italic 10.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`"${data.closingFeedback || "تم التوصل إلى حل مرضي واستعادة ثقة المستفيد."}"`, width - 45, evalTop + 33);

    ctx.textAlign = "left";
    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(
      `الأثر R_exp: ${data.rExp ?? 4}/5   |   استجابة الإدارة R_resp: ${data.rResp ?? 5}/5   |   رضا الحل R_res: ${data.rRes ?? 5}/5   |   RQS: ${data.rqsScore ?? 92}/100`,
      45,
      evalTop + 25
    );

    // 7. Official Signatures Block
    const sigTop = evalTop + 52;
    const sigColW = tableWidth / 4;
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.strokeRect(tableLeft, sigTop, tableWidth, 68);

    // Header strip for signatures
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(tableLeft, sigTop, tableWidth, 24);
    ctx.strokeRect(tableLeft, sigTop, tableWidth, 24);

    const sigTitles = [
      "مسؤول الفحص والمتابعة",
      "وكيل المؤسسة / رئيس القسم",
      "مدير المنشأة / المشرف العام",
      "الختم المؤسسي المعتمد",
    ];

    sigTitles.forEach((title, idx) => {
      const sx = tableLeft + (3 - idx) * sigColW;
      if (idx > 0) {
        ctx.beginPath();
        ctx.moveTo(sx, sigTop);
        ctx.lineTo(sx, sigTop + 68);
        ctx.stroke();
      }

      ctx.font = "bold 10.5px 'Cairo', sans-serif";
      ctx.fillStyle = "#0f172a";
      ctx.textAlign = "center";
      ctx.fillText(title, sx + sigColW / 2, sigTop + 16);

      // Signature cell content
      if (idx === 3) {
        // Stamp
        ctx.strokeStyle = "#0284c7";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx + sigColW / 2, sigTop + 45, 17, 0, Math.PI * 2);
        ctx.stroke();
        ctx.font = "bold 8px 'Cairo', sans-serif";
        ctx.fillStyle = "#0284c7";
        ctx.fillText("ختم رسمي", sx + sigColW / 2, sigTop + 48);
      } else {
        ctx.font = "normal 10px 'Cairo', sans-serif";
        ctx.fillStyle = "#16a34a";
        ctx.fillText("معتمد إلكترونياً ✓", sx + sigColW / 2, sigTop + 48);
      }
    });

    // 8. Disclaimer & Hash Footer
    const footerTop = sigTop + 76;
    ctx.font = "normal 8.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.textAlign = "right";
    ctx.fillText(
      "إخلاء مسؤولية قانوني: هذه الوثيقة هي سجل معلوماتي لإجراءات تسوية النزاعات طواعية عبر منصة مُرافِق Enterprise، ولا تُعد حكماً قضائياً أو قراراً إدارياً ملزماً.",
      width - 35,
      footerTop + 10
    );

    ctx.textAlign = "left";
    ctx.font = "normal 8.5px monospace";
    ctx.fillText(`SHA-256: ${data.sha256Digest || "a3c8e547b9f123d6..."}`, 35, footerTop + 10);
  }, [data, zoom]);

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const link = document.createElement("a");
    link.download = `report_${data?.referenceNumber || caseId}.png`;
    link.href = url;
    link.click();
  };

  const handleDownloadPdf = () => {
    window.open(`/api/cases/${caseId}/report/pdf`, "_blank");
  };

  const handleSendWhatsApp = async () => {
    setIsSendingWhatsApp(true);
    setWhatsAppSuccess(null);
    try {
      const res = await fetch(`/api/cases/${caseId}/automation/send-whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: recipientPhone || undefined }),
      });
      const json = await res.json();
      if (json.success) {
        setWhatsAppSuccess(`تم إرسال التقرير بنجاح عبر واتساب إلى الرقم ${json.recipientPhone} (Message ID: ${json.providerMessageId})`);
        if (onWhatsAppSent) onWhatsAppSent(json);
      } else {
        alert("فشل إرسال التقرير: " + (json.error || "خطأ غير معروف"));
      }
    } catch {
      alert("حدث خطأ أثناء الاتصال بمزود خدمة واتساب");
    } finally {
      setIsSendingWhatsApp(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
        <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-bold text-slate-600">جاري تجميع بيانات التقرير ومصفوفة الفحص الرسمية...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Toolbar */}
      <div className="bg-slate-900 text-white p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-300">تكبير المعاينة:</span>
          <button
            onClick={() => setZoom((prev) => Math.max(0.6, prev - 0.1))}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold"
            title="تصغير"
          >
            -
          </button>
          <span className="text-xs font-mono font-bold text-teal-400 w-12 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom((prev) => Math.min(1.4, prev + 0.1))}
            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold"
            title="تكبير"
          >
            +
          </button>
          <button
            onClick={() => setZoom(1)}
            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px]"
          >
            100%
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadPng}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
          >
            <span>🖼️</span> تصدير صورة (PNG)
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5"
          >
            <span>📥</span> تنزيل PDF الرسمي
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <span>💬</span>
            {isSendingWhatsApp ? "جاري الإرسال عبر واتساب..." : "إرسال التقرير عبر واتساب فوراً"}
          </button>
        </div>
      </div>

      {/* WhatsApp Dispatch Banner */}
      {whatsAppSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <span>✅</span> {whatsAppSuccess}
        </div>
      )}

      {/* Canvas Container with horizontal scroll if needed */}
      <div className="overflow-x-auto bg-slate-100 p-4 rounded-2xl border border-slate-200 shadow-inner flex justify-center">
        <canvas
          ref={canvasRef}
          className="shadow-2xl rounded-lg bg-white transition-all duration-150"
        />
      </div>
    </div>
  );
}
