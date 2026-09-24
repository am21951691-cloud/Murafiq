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
  const [copySuccess, setCopySuccess] = useState(false);

  // Matrix Editor Drawer state
  const [isEditingMatrix, setIsEditingMatrix] = useState(false);
  const [editableItems, setEditableItems] = useState<ReportAuditMatrixItem[]>([]);
  const [isSavingMatrix, setIsSavingMatrix] = useState(false);

  useEffect(() => {
    if (propData) {
      setData(propData);
      setEditableItems(propData.auditItems || []);
      return;
    }

    const loadPreviewData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/cases/${caseId}/report/preview`);
        const json = await res.json();
        if (json.success && json.reportData) {
          setData(json.reportData);
          setEditableItems(json.reportData.auditItems || []);
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

    // Outer Document Border
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

    // 2. Top Bar: Dual Branding & Real-Life Date Box
    // Right: Institution name
    ctx.font = "900 18px 'Cairo', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText(data.institutionName || "المؤسسة التعليمية", width - 35, 42);

    ctx.font = "600 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(`${data.branchName || "الفرع الرئيسي"} — قطاع ${data.category || "عام"}`, width - 35, 60);

    // Center: Official Title
    ctx.textAlign = "center";
    ctx.font = "bold 10px 'Cairo', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("جمهورية مصر العربية — منظومة الحوكمة وتسوية الحالات", width / 2, 34);

    ctx.font = "900 16px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("محضر فحص وتسوية حالة ومصفوفة الإجراءات التنفيذية", width / 2, 54);

    ctx.font = "600 10px 'Cairo', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("سجل توثيق التدقيق الميداني والمتابعة الإلزامية — منصة مُرافِق Enterprise", width / 2, 68);

    // Left: Date Box matching real-world sample
    ctx.textAlign = "right";
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.2;
    ctx.fillRect(35, 24, 210, 48);
    ctx.strokeRect(35, 24, 210, 48);

    ctx.font = "bold 13px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText(`التاريخ : ${data.generatedDate || "2026/09/24"}`, 235, 44);

    ctx.font = "normal 10px monospace";
    ctx.fillStyle = "#0284c7";
    ctx.fillText(`المرجع: ${data.referenceNumber} (v${data.version || 1})`, 235, 62);

    // Top Divider Line
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(35, 80);
    ctx.lineTo(width - 35, 80);
    ctx.stroke();

    // 3. Executive KPI Strip
    const kpiY = 90;
    const kpiHeight = 36;
    const kpiBoxWidth = (width - 70 - 24) / 4;

    const kpiData = [
      { title: "حالة المحضر التنفيذي", value: "منجز ومسوى نهائياً (RESOLVED)", color: "#059669" },
      { title: "مؤشر جودة الاستجابة", value: `${data.rqsScore || 85}/100 (${data.rqsGrade || "EXEMPLARY"})`, color: "#0284c7" },
      { title: "معدل الرضا (3D CSAT)", value: `R_exp: ${data.rExp || 3}/5 | R_resp: ${data.rResp || 4}/5 | R_res: ${data.rRes || 5}/5`, color: "#7c3aed" },
      { title: "فترة المعالجة والامتثال", value: `من ${data.openedDate || "2026/09/01"} إلى ${data.closedDate || data.generatedDate}`, color: "#0f172a" },
    ];

    kpiData.forEach((kpi, idx) => {
      const boxX = width - 35 - (idx + 1) * kpiBoxWidth - idx * 8;
      ctx.fillStyle = "#f8fafc";
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 1;
      ctx.fillRect(boxX, kpiY, kpiBoxWidth, kpiHeight);
      ctx.strokeRect(boxX, kpiY, kpiBoxWidth, kpiHeight);

      ctx.textAlign = "center";
      ctx.font = "bold 9.5px 'Cairo', sans-serif";
      ctx.fillStyle = "#64748b";
      ctx.fillText(kpi.title, boxX + kpiBoxWidth / 2, kpiY + 14);

      ctx.font = "bold 11px 'Cairo', sans-serif";
      ctx.fillStyle = kpi.color;
      ctx.fillText(kpi.value, boxX + kpiBoxWidth / 2, kpiY + 29);
    });

    // 4. Context & Attribution Summary Box
    const summaryY = 136;
    const summaryHeight = 60;
    const halfWidth = (width - 70 - 12) / 2;

    // Right Box: User Reported
    const userBoxX = width - 35 - halfWidth;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillRect(userBoxX, summaryY, halfWidth, summaryHeight);
    ctx.strokeRect(userBoxX, summaryY, halfWidth, summaryHeight);

    ctx.textAlign = "right";
    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText("[USER-REPORTED] ملخص المشكلة ومطالب ولي الأمر / المستفيد:", userBoxX + halfWidth - 10, summaryY + 18);

    ctx.font = "normal 10.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#1e293b";
    wrapText(data.sanitizedSummary || "لا توجد تفاصيل إضافية مسجلة.", userBoxX + halfWidth - 10, summaryY + 34, halfWidth - 20, 14, 2);

    // Left Box: Institution Stated
    const instBoxX = 35;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillRect(instBoxX, summaryY, halfWidth, summaryHeight);
    ctx.strokeRect(instBoxX, summaryY, halfWidth, summaryHeight);

    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#b45309";
    ctx.fillText("[INSTITUTION-STATED] إفادة وبيان إدارة المنشأة المعتمد:", instBoxX + halfWidth - 10, summaryY + 18);

    ctx.font = "normal 10.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#1e293b";
    wrapText(data.officialStatement || "تم التعامل مع الحالة واعتماد خطة التسوية.", instBoxX + halfWidth - 10, summaryY + 34, halfWidth - 20, 14, 2);

    // 5. Real-Life 8-Column Matrix Table (matching user sample)
    const tableTop = 206;
    const colWidths = [
      { name: "التاريخ المتوقع للحل", width: 90 },
      { name: "الإفادة / الرد", width: 140 },
      { name: "خطوات التنفيذ المقترحة", width: 290 },
      { name: "مكرر (نعم/لا)", width: 80 },
      { name: "التوصية", width: 180 },
      { name: "الملحوظة", width: 310 },
      { name: "البند", width: 110 },
      { name: "م", width: 50 },
    ];

    let currentX = width - 35;
    const colXPositions: number[] = [];
    for (let i = colWidths.length - 1; i >= 0; i--) {
      colXPositions.unshift(currentX);
      currentX -= colWidths[i].width;
    }

    // Header Row
    ctx.fillStyle = "#f1f5f9";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.fillRect(35, tableTop, width - 70, 36);
    ctx.strokeRect(35, tableTop, width - 70, 36);

    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.textAlign = "center";

    // Draw Column Headers
    let headerX = width - 35;
    const arabicHeaders = [
      { title: "م", width: 50 },
      { title: "البند", width: 110 },
      { title: "الملحوظة", width: 310 },
      { title: "التوصية", width: 180 },
      { title: "مكرر\n(نعم/لا)", width: 80 },
      { title: "خطوات التنفيذ المقترحة", width: 290 },
      { title: "الإفادة / الرد", width: 140 },
      { title: "التاريخ\nالمتوقع للحل", width: 90 },
    ];

    for (const h of arabicHeaders) {
      const centerX = headerX - h.width / 2;
      ctx.beginPath();
      ctx.moveTo(headerX, tableTop);
      ctx.lineTo(headerX, tableTop + 36);
      ctx.stroke();

      if (h.title.includes("\n")) {
        const parts = h.title.split("\n");
        ctx.fillText(parts[0], centerX, tableTop + 14);
        ctx.fillText(parts[1], centerX, tableTop + 28);
      } else {
        ctx.fillText(h.title, centerX, tableTop + 22);
      }
      headerX -= h.width;
    }
    // Left boundary line
    ctx.beginPath();
    ctx.moveTo(35, tableTop);
    ctx.lineTo(35, tableTop + 36);
    ctx.stroke();

    // Table Body Rows
    let currentY = tableTop + 36;
    const items = data.auditItems || [];

    items.forEach((item, rowIdx) => {
      const rowHeight = 52;
      // Alternating row background
      ctx.fillStyle = rowIdx % 2 === 0 ? "#ffffff" : "#fcfcfd";
      ctx.fillRect(35, currentY, width - 70, rowHeight);
      ctx.strokeStyle = "#1e293b";
      ctx.strokeRect(35, currentY, width - 70, rowHeight);

      let cellRight = width - 35;

      // 1. م (Seq)
      ctx.textAlign = "center";
      ctx.font = "bold 11px 'Cairo', sans-serif";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(String(item.seq), cellRight - 25, currentY + 30);
      cellRight -= 50;

      // 2. البند
      ctx.font = "bold 11px 'Cairo', sans-serif";
      ctx.fillStyle = "#0369a1";
      ctx.fillText(item.item, cellRight - 55, currentY + 30);
      cellRight -= 110;

      // 3. الملحوظة
      ctx.textAlign = "right";
      ctx.font = "normal 10px 'Cairo', sans-serif";
      ctx.fillStyle = "#1e293b";
      wrapText(item.observation, cellRight - 8, currentY + 18, 294, 14, 3);
      cellRight -= 310;

      // 4. التوصية
      ctx.font = "600 10px 'Cairo', sans-serif";
      ctx.fillStyle = "#0284c7";
      wrapText(item.recommendation, cellRight - 8, currentY + 18, 164, 14, 3);
      cellRight -= 180;

      // 5. مكرر (نعم/لا)
      ctx.textAlign = "center";
      ctx.font = "bold 11px 'Cairo', sans-serif";
      ctx.fillStyle = item.isRecurring === "نعم" ? "#b45309" : "#16a34a";
      ctx.fillText(item.isRecurring, cellRight - 40, currentY + 30);
      cellRight -= 80;

      // 6. خطوات التنفيذ المقترحة
      ctx.textAlign = "right";
      ctx.font = "normal 10px 'Cairo', sans-serif";
      ctx.fillStyle = "#334155";
      wrapText(item.actionSteps, cellRight - 8, currentY + 18, 274, 14, 3);
      cellRight -= 290;

      // 7. الإفادة / الرد
      ctx.font = "bold 10px 'Cairo', sans-serif";
      ctx.fillStyle = "#059669";
      wrapText(item.statement, cellRight - 8, currentY + 22, 124, 14, 2);
      cellRight -= 140;

      // 8. التاريخ المتوقع للحل
      ctx.textAlign = "center";
      ctx.font = "normal 9.5px monospace";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(item.targetDate, cellRight - 45, currentY + 30);

      // Vertical grid lines
      let lineX = width - 35;
      for (const h of arabicHeaders) {
        ctx.beginPath();
        ctx.moveTo(lineX, currentY);
        ctx.lineTo(lineX, currentY + rowHeight);
        ctx.stroke();
        lineX -= h.width;
      }
      ctx.beginPath();
      ctx.moveTo(35, currentY);
      ctx.lineTo(35, currentY + rowHeight);
      ctx.stroke();

      currentY += rowHeight;
    });

    // Empty paper rows matching authentic sample
    const emptyRows = data.emptyRows || [
      { seq: 19, isRecurring: "لا", statement: "-" },
      { seq: "", isRecurring: "", statement: "" },
      { seq: "", isRecurring: "", statement: "" },
    ];

    emptyRows.forEach((er) => {
      const rowHeight = 26;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(35, currentY, width - 70, rowHeight);
      ctx.strokeStyle = "#1e293b";
      ctx.strokeRect(35, currentY, width - 70, rowHeight);

      let lineX = width - 35;
      for (const h of arabicHeaders) {
        ctx.beginPath();
        ctx.moveTo(lineX, currentY);
        ctx.lineTo(lineX, currentY + rowHeight);
        ctx.stroke();
        lineX -= h.width;
      }

      if (er.seq) {
        ctx.textAlign = "center";
        ctx.font = "normal 10px 'Cairo', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(String(er.seq), width - 35 - 25, currentY + 17);
      }
      if (er.isRecurring) {
        ctx.textAlign = "center";
        ctx.font = "bold 10px 'Cairo', sans-serif";
        ctx.fillStyle = "#64748b";
        ctx.fillText(er.isRecurring, width - 35 - 50 - 110 - 310 - 180 - 40, currentY + 17);
      }
      if (er.statement) {
        ctx.textAlign = "center";
        ctx.font = "normal 10px 'Cairo', sans-serif";
        ctx.fillStyle = "#94a3b8";
        ctx.fillText(er.statement, 35 + 90 + 70, currentY + 17);
      }

      currentY += rowHeight;
    });

    // 6. 3D Evaluation Scores & Beneficiary CSAT
    currentY += 8;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.fillRect(35, currentY, width - 70, 36);
    ctx.strokeRect(35, currentY, width - 70, 36);

    ctx.textAlign = "right";
    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#15803d";
    ctx.fillText(
      `[USER-CONFIRMED] التقييم النهائي ثلاثي الأبعاد لجودة الحل وتجربة المستفيد: "${data.closingFeedback || "تم التوصل إلى حل مرضي واستعادة ثقة المستفيد."}"`,
      width - 45,
      currentY + 22
    );

    ctx.textAlign = "left";
    ctx.font = "bold 11px 'Cairo', sans-serif";
    ctx.fillStyle = "#0369a1";
    ctx.fillText(
      `R_exp: ${data.rExp || 3}/5  |  R_resp: ${data.rResp || 4}/5  |  R_res: ${data.rRes || 5}/5`,
      45,
      currentY + 22
    );

    // 7. Signatures & Official Stamp Block
    const sigY = currentY + 44;
    const sigHeight = 56;
    const sigColWidth = (width - 70) / 4;

    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 1.2;
    ctx.fillRect(35, sigY, width - 70, 24);
    ctx.strokeRect(35, sigY, width - 70, 24);

    const sigHeaders = [
      "مسؤول الفحص والمتابعة",
      "وكيل المؤسسة / رئيس القسم",
      "مدير المنشأة / المشرف العام",
      "الختم المؤسسي المعتمد",
    ];

    sigHeaders.forEach((sh, idx) => {
      const colX = width - 35 - (idx + 1) * sigColWidth;
      ctx.textAlign = "center";
      ctx.font = "bold 10.5px 'Cairo', sans-serif";
      ctx.fillStyle = "#0f172a";
      ctx.fillText(sh, colX + sigColWidth / 2, sigY + 16);

      if (idx > 0) {
        ctx.beginPath();
        ctx.moveTo(colX, sigY);
        ctx.lineTo(colX, sigY + 24 + sigHeight);
        ctx.stroke();
      }
    });

    // Signature boxes
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(35, sigY + 24, width - 70, sigHeight);
    ctx.strokeRect(35, sigY + 24, width - 70, sigHeight);

    // Col 1: Inspector
    const c1X = width - 35 - sigColWidth;
    ctx.font = "bold 10px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("فريق تسوية الحالات", c1X + sigColWidth / 2, sigY + 46);
    ctx.font = "normal 9px 'Cairo', sans-serif";
    ctx.fillStyle = "#16a34a";
    ctx.fillText("معتمد ومطابق للإجراءات ✓", c1X + sigColWidth / 2, sigY + 62);

    // Col 2: Vice Dean
    const c2X = c1X - sigColWidth;
    ctx.font = "bold 10px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("وكيل الشؤون الإدارية", c2X + sigColWidth / 2, sigY + 46);
    ctx.font = "normal 9px 'Cairo', sans-serif";
    ctx.fillStyle = "#16a34a";
    ctx.fillText("تم اعتماد خطة التنفيذ ✓", c2X + sigColWidth / 2, sigY + 62);

    // Col 3: Director General
    const c3X = c2X - sigColWidth;
    ctx.font = "bold 10px 'Cairo', sans-serif";
    ctx.fillStyle = "#0284c7";
    ctx.fillText("إدارة المنشأة الرسمية", c3X + sigColWidth / 2, sigY + 46);
    ctx.font = "normal 9px 'Cairo', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText("موافقة على الحل النهائي", c3X + sigColWidth / 2, sigY + 62);

    // Col 4: Stamp Seal
    const c4X = 35;
    ctx.save();
    ctx.translate(c4X + sigColWidth / 2, sigY + 24 + sigHeight / 2);
    ctx.rotate((-6 * Math.PI) / 180);
    ctx.strokeStyle = "#0284c7";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.arc(0, 0, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.font = "900 8.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#0284c7";
    ctx.textAlign = "center";
    ctx.fillText("ختم معتمد", 0, 4);
    ctx.restore();

    // 8. Disclaimer & Integrity Footer
    const footerTop = sigY + 24 + sigHeight + 8;
    ctx.fillStyle = "#f8fafc";
    ctx.strokeStyle = "#cbd5e1";
    ctx.fillRect(35, footerTop, width - 70, 32);
    ctx.strokeRect(35, footerTop, width - 70, 32);

    ctx.textAlign = "right";
    ctx.font = "bold 8.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#0f172a";
    ctx.fillText("إخلاء مسؤولية قانوني وميثاق النزاهة:", width - 45, footerTop + 12);
    ctx.font = "normal 8px 'Cairo', sans-serif";
    ctx.fillStyle = "#475569";
    ctx.fillText(
      "هذه الوثيقة سجل معلوماتي موثق لإجراءات تسوية النزاعات طواعية عبر منصة مُرافِق Enterprise، ولا تُعد حكماً قضائياً ملزماً أو إثباتاً للتقصير.",
      width - 45,
      footerTop + 24
    );

    // Bottom integrity line
    ctx.textAlign = "right";
    ctx.font = "normal 8.5px 'Cairo', sans-serif";
    ctx.fillStyle = "#64748b";
    ctx.fillText("منظومة مُرافِق Enterprise — توثيق الشفافية وحل النزاعات والحوكمة المؤسسية", width - 35, height - 16);

    ctx.textAlign = "left";
    ctx.font = "normal 8.5px monospace";
    ctx.fillText(`SHA-256: ${data.sha256Digest || "a3c8e547b9f123d6..."}`, 35, height - 16);
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

  const handleCopyLink = () => {
    const url = `${window.location.origin}/track?ref=${data?.referenceNumber || ""}`;
    navigator.clipboard.writeText(url);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
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

  // Matrix Row Actions
  const handleUpdateItem = (index: number, field: keyof ReportAuditMatrixItem, val: string) => {
    const next = [...editableItems];
    next[index] = { ...next[index], [field]: val };
    setEditableItems(next);
  };

  const handleAddItem = () => {
    const newItem: ReportAuditMatrixItem = {
      seq: editableItems.length + 15,
      item: "الشؤون الإدارية",
      observation: "ملاحظة تدقيق جديدة...",
      recommendation: "توجيه إداري بالمتابعة الفورية.",
      isRecurring: "لا",
      actionSteps: "تكليف المشرف بإعداد تقرير وإفادة الإدارة.",
      statement: "قيد المتابعة والتنفيذ.",
      targetDate: new Date(Date.now() + 3 * 86400000).toLocaleDateString("ar-EG"),
    };
    setEditableItems([...editableItems, newItem]);
  };

  const handleDeleteItem = (index: number) => {
    setEditableItems(editableItems.filter((_, i) => i !== index));
  };

  const handleSaveMatrix = async () => {
    setIsSavingMatrix(true);
    try {
      const res = await fetch(`/api/cases/${caseId}/matrix`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: editableItems }),
      });
      const json = await res.json();
      if (json.success) {
        if (data) {
          setData({
            ...data,
            auditItems: json.items,
          });
        }
        setIsEditingMatrix(false);
      } else {
        alert("فشل حفظ البنود: " + (json.error || "خطأ"));
      }
    } catch {
      alert("حدث خطأ أثناء حفظ مصفوفة الفحص");
    } finally {
      setIsSavingMatrix(false);
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
          <span className="text-xs font-bold text-slate-300">تكبير:</span>
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsEditingMatrix(!isEditingMatrix)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              isEditingMatrix
                ? "bg-amber-600 text-white"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200"
            }`}
          >
            <span>✏️</span> {isEditingMatrix ? "إخفاء محرر المصفوفة" : "تعديل بنود المصفوفة"}
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
          >
            <span>🔗</span> {copySuccess ? "تم نسخ الرابط! ✓" : "رابط التحقق"}
          </button>
          <button
            onClick={handleDownloadPng}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 transition flex items-center gap-1.5"
          >
            <span>🖼️</span> صورة (PNG)
          </button>
          <button
            onClick={handleDownloadPdf}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5"
          >
            <span>📥</span> تحميل PDF
          </button>
          <button
            onClick={handleSendWhatsApp}
            disabled={isSendingWhatsApp}
            className="px-4 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition flex items-center gap-1.5"
          >
            <span>💬</span>
            {isSendingWhatsApp ? "جاري الإرسال..." : "إرسال واتساب للمستفيد"}
          </button>
        </div>
      </div>

      {/* WhatsApp Dispatch Banner */}
      {whatsAppSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <span>✅</span> {whatsAppSuccess}
        </div>
      )}

      {/* Inline Matrix Editor Drawer */}
      {isEditingMatrix && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3 animate-fadeIn text-right">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-amber-700 font-bold text-sm">📋 محرر بنود مصفوفة الفحص (8 أعمدة):</span>
              <span className="text-xs text-amber-900">
                يمكنك إضافة وتعديل البنود والملاحظات وخطوات التنفيذ قبل تصدير التقرير أو إرساله للمستفيد.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleAddItem}
                className="px-3 py-1 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1"
              >
                <span>+</span> إضافة بند جديد
              </button>
              <button
                onClick={handleSaveMatrix}
                disabled={isSavingMatrix}
                className="px-4 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1"
              >
                <span>💾</span> {isSavingMatrix ? "جاري الحفظ..." : "حفظ التغييرات في النظام"}
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs bg-white rounded-xl border border-amber-200 overflow-hidden">
              <thead className="bg-amber-100/70 text-slate-800 font-bold">
                <tr>
                  <th className="p-2 w-12 text-center">م</th>
                  <th className="p-2 w-32">البند</th>
                  <th className="p-2">الملحوظة</th>
                  <th className="p-2">التوصية</th>
                  <th className="p-2 w-20 text-center">مكرر</th>
                  <th className="p-2">خطوات التنفيذ</th>
                  <th className="p-2">الإفادة / الرد</th>
                  <th className="p-2 w-28 text-center">التاريخ المتوقع</th>
                  <th className="p-2 w-12 text-center">حذف</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100">
                {editableItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-amber-50/50">
                    <td className="p-1.5 text-center font-bold text-slate-700">
                      <input
                        type="text"
                        value={item.seq}
                        onChange={(e) => handleUpdateItem(idx, "seq", e.target.value)}
                        className="w-10 text-center bg-slate-50 border border-slate-200 rounded-md p-1"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={item.item}
                        onChange={(e) => handleUpdateItem(idx, "item", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 font-bold text-sky-800"
                      />
                    </td>
                    <td className="p-1.5">
                      <textarea
                        rows={2}
                        value={item.observation}
                        onChange={(e) => handleUpdateItem(idx, "observation", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 text-[11px]"
                      />
                    </td>
                    <td className="p-1.5">
                      <textarea
                        rows={2}
                        value={item.recommendation}
                        onChange={(e) => handleUpdateItem(idx, "recommendation", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 text-[11px] text-sky-700"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <select
                        value={item.isRecurring}
                        onChange={(e) => handleUpdateItem(idx, "isRecurring", e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-md p-1 text-xs"
                      >
                        <option value="لا">لا</option>
                        <option value="نعم">نعم</option>
                      </select>
                    </td>
                    <td className="p-1.5">
                      <textarea
                        rows={2}
                        value={item.actionSteps}
                        onChange={(e) => handleUpdateItem(idx, "actionSteps", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 text-[11px]"
                      />
                    </td>
                    <td className="p-1.5">
                      <input
                        type="text"
                        value={item.statement}
                        onChange={(e) => handleUpdateItem(idx, "statement", e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-md p-1 text-emerald-700 font-bold"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <input
                        type="text"
                        value={item.targetDate}
                        onChange={(e) => handleUpdateItem(idx, "targetDate", e.target.value)}
                        className="w-24 text-center bg-slate-50 border border-slate-200 rounded-md p-1 text-xs font-mono"
                      />
                    </td>
                    <td className="p-1.5 text-center">
                      <button
                        onClick={() => handleDeleteItem(idx)}
                        className="w-6 h-6 rounded-full bg-red-100 hover:bg-red-200 text-red-700 font-bold flex items-center justify-center mx-auto"
                        title="حذف البند"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
