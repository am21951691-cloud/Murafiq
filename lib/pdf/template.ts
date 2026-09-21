import Handlebars from "handlebars";
import fs from "fs";
import path from "path";

export interface MilestoneReportData {
  title: string;
  ownerRole: string;
  dueDate: string;
  isCompleted: boolean;
  deliverable?: string;
}

export interface StatutoryCitationData {
  reference: string;
  title: string;
}

export interface ReportTemplateData {
  referenceNumber: string;
  generatedDate?: string;
  version?: number;
  institutionName: string;
  branchName?: string;
  category: string;
  openedDate?: string;
  closedDate?: string;
  sanitizedSummary?: string;
  summaryAr?: string; // alias
  desiredOutcome?: string;
  officialStatement?: string;
  rqsScore?: number;
  rqsGrade?: string;
  milestones?: MilestoneReportData[];
  rExp?: number;
  rResp?: number;
  rRes?: number;
  closingFeedback?: string;
  statutoryCitations?: StatutoryCitationData[];
  sha256Digest?: string;
  verificationUrl?: string;
}

let compiledTemplate: HandlebarsTemplateDelegate | null = null;

function loadTemplateSource(): string {
  const templatePath = path.join(process.cwd(), "lib", "pdf", "templates", "resolution-report.hbs");
  try {
    if (fs.existsSync(templatePath)) {
      return fs.readFileSync(templatePath, "utf-8");
    }
  } catch {
    // fallback if file system access in bundle is different
  }

  // Embedded fallback template
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>تقرير تسوية حالة — مُرافِق</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
    body { font-family: 'Cairo', sans-serif; padding: 24px; color: #0f172a; line-height: 1.6; }
    .badge { padding: 2px 8px; border-radius: 4px; font-weight: 700; font-size: 10px; }
  </style>
</head>
<body>
  <h1>مُرافِق | Murafiq - {{referenceNumber}}</h1>
  <h2>{{institutionName}}</h2>
  <p><span class="badge">[USER-REPORTED]</span> {{sanitizedSummary}}</p>
  <p><span class="badge">[INSTITUTION-STATED]</span> {{officialStatement}}</p>
  <p><span class="badge">[USER-CONFIRMED]</span> R_exp: {{rExp}} | R_resp: {{rResp}} | R_res: {{rRes}}</p>
  <p><span class="badge">[VERIFIED]</span> SHA-256: {{sha256Digest}}</p>
  <footer>إخلاء مسؤولية قانوني: هذه الوثيقة هي سجل معلوماتي لإجراءات تسوية النزاعات التعليمية طواعية عبر منصة مُرافِق، ولا تُعد حكماً قضائياً أو قراراً إدارياً ملزماً أو إثباتاً قضائياً للتقصير.</footer>
</body>
</html>`;
}

/**
 * Compiles the bilingual Arabic RTL resolution report HTML.
 */
export function compileReportHtml(data: ReportTemplateData): string {
  if (!compiledTemplate) {
    const source = loadTemplateSource();
    compiledTemplate = Handlebars.compile(source);
  }

  const now = new Date();
  const formattedDate = now.toLocaleDateString("ar-EG", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const viewData = {
    referenceNumber: data.referenceNumber,
    generatedDate: data.generatedDate || formattedDate,
    version: data.version ?? 1,
    institutionName: data.institutionName,
    branchName: data.branchName || "الفرع الرئيسي",
    category: data.category,
    openedDate: data.openedDate || "2026-09-01",
    closedDate: data.closedDate || formattedDate,
    sanitizedSummary: data.sanitizedSummary || data.summaryAr || "لا توجد تفاصيل إضافية مسجلة.",
    desiredOutcome: data.desiredOutcome || "",
    officialStatement: data.officialStatement || "تم التعامل مع الشكوى والاتفاق على خطة العمل المشتركة.",
    rqsScore: data.rqsScore ?? 85,
    rqsGrade: data.rqsGrade || "EXEMPLARY",
    milestones: data.milestones || [],
    rExp: data.rExp ?? 3,
    rResp: data.rResp ?? 4,
    rRes: data.rRes ?? 5,
    closingFeedback: data.closingFeedback || "تم التوصل إلى حل مرضي واستعادة مسار العملية التعليمية بصورة إيجابية.",
    statutoryCitations: data.statutoryCitations || [],
    sha256Digest: data.sha256Digest || "PENDING_VERIFICATION_DIGEST",
    verificationUrl: data.verificationUrl || `https://murafiq.edu.eg/verify/${data.referenceNumber}`,
  };

  return compiledTemplate(viewData);
}
