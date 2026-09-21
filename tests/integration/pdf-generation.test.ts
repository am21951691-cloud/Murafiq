import { describe, it, expect } from "vitest";
import { compileReportHtml } from "../../lib/pdf/template";
import { renderReportPdf, calculatePdfDigest } from "../../lib/pdf/renderer";
import {
  generateReportPdf,
  assertSnapshotPiiSafety,
  type FrozenReportPayloadSnapshot,
} from "../../trigger/tasks/generateReportPdf";

describe("Slice 5: Document Engine & Snapshot Archiving", () => {
  const sampleCaseData = {
    referenceNumber: "MRF-2026-0941",
    institutionName: "St. George Language School",
    branchName: "Heliopolis Branch",
    category: "ADMINISTRATION_DISCIPLINE",
    sanitizedSummary: "شكوى بخصوص مخالفة انضباط صفي واستخدام توبيخ محقر أمام الزملاء.",
    desiredOutcome: "تقديم اعتذار رسمي للطالب ونقل المشكلة للجنة الحماية المدرسية",
    officialStatement:
      "تؤكد إدارة المدرسة على سياسة الحظر القاطع للعقاب النفسي وتفعيل إجراءات لجنة الحماية.",
    rqsScore: 92,
    rqsGrade: "EXEMPLARY",
    rExp: 4,
    rResp: 5,
    rRes: 5,
    closingFeedback: "تم حل المشكلة بمهنية عالية وتم استعادة ثقة الطالب بنفسه.",
    milestones: [
      {
        title: "انعقاد لجنة الحماية المدرسية",
        ownerRole: "OPS_LEAD",
        dueDate: "2026-09-12",
        isCompleted: true,
      },
      {
        title: "جلسة إرشاد ودعم نفسي للطالب",
        ownerRole: "COUNSELOR",
        dueDate: "2026-09-15",
        isCompleted: true,
      },
    ],
    statutoryCitations: [
      {
        reference: "القرار الوزاري رقم 187 لسنة 2023",
        title: "حظر العقاب البدني والنفسي بكافة أشكاله",
      },
    ],
  };

  describe("Step 5.1: HTML & Handlebars Template Compiler", () => {
    it("generates bilingual Arabic RTL HTML with explicit attribution badges and Cairo font", () => {
      const html = compileReportHtml(sampleCaseData);

      // RTL and Cairo font verification
      expect(html).toContain('dir="rtl"');
      expect(html).toContain("Cairo");

      // Mandatory Attribution Badges
      expect(html).toContain("[USER-REPORTED]");
      expect(html).toContain("[INSTITUTION-STATED]");
      expect(html).toContain("[USER-CONFIRMED]");
      expect(html).toContain("[VERIFIED]");

      // Case data contents
      expect(html).toContain("MRF-2026-0941");
      expect(html).toContain("St. George Language School");
      expect(html).toContain("RQS");
      expect(html).toContain("92");

      // 3D Experience Model scores
      expect(html).toContain("R<sub>exp</sub>");
      expect(html).toContain("R<sub>resp</sub>");
      expect(html).toContain("R<sub>res</sub>");

      // Mandatory Non-Judicial Disclaimer
      expect(html).toContain("إخلاء مسؤولية قانوني");
      expect(html).toContain("لا تُعد حكماً قضائياً أو قراراً إدارياً ملزماً");
    });
  });

  describe("Step 5.2: PDF Compilation & SHA-256 Digest Engine", () => {
    it("compiles HTML into a valid binary PDF buffer starting with %PDF- header", async () => {
      const html = compileReportHtml(sampleCaseData);
      const pdfBuffer = await renderReportPdf(html);

      expect(pdfBuffer).toBeInstanceOf(Buffer);
      expect(pdfBuffer.length).toBeGreaterThan(100);

      // Verify PDF Magic Bytes (%PDF-)
      const magicBytes = pdfBuffer.subarray(0, 5).toString("utf8");
      expect(magicBytes).toBe("%PDF-");
    }, 20000);

    it("computes exact SHA-256 integrity digest of the PDF buffer", async () => {
      const html = compileReportHtml(sampleCaseData);
      const pdfBuffer = await renderReportPdf(html);
      const digest = calculatePdfDigest(pdfBuffer);

      expect(digest).toMatch(/^[a-f0-9]{64}$/);

      // Verifies tamper sensitivity: changing 1 byte produces a completely different hash
      const tamperedBuffer = Buffer.from(pdfBuffer);
      tamperedBuffer[tamperedBuffer.length - 1] =
        tamperedBuffer[tamperedBuffer.length - 1] ^ 0xff;
      const tamperedDigest = calculatePdfDigest(tamperedBuffer);

      expect(tamperedDigest).not.toBe(digest);
    }, 20000);

    it("executes generateReportPdf pipeline, returning frozen snapshot and matching digest", async () => {
      const caseId = "11111111-2222-3333-4444-555555555555";
      const result = await generateReportPdf({
        caseId,
        version: 1,
        mockCaseData: sampleCaseData,
      });

      expect(result.success).toBe(true);
      expect(result.caseId).toBe(caseId);
      expect(result.version).toBe(1);
      expect(result.storagePath).toBe(`reports/case_${caseId}_v1.pdf`);

      // Digest matches buffer
      expect(result.sha256Digest).toBe(calculatePdfDigest(result.pdfBuffer));

      // Frozen Snapshot integrity
      const snap = result.snapshot;
      expect(snap.case_id).toBe(caseId);
      expect(snap.version).toBe(1);
      expect(snap.institution_name).toBe("St. George Language School");
      expect(snap.evaluations_3d.r_exp).toBe(4);
      expect(snap.evaluations_3d.r_resp).toBe(5);
      expect(snap.evaluations_3d.r_res).toBe(5);
      expect(snap.milestones.length).toBe(2);
    }, 20000);
  });

  describe("Gate 1: Security & PII Leakage Protection", () => {
    it("passes PII safety assertion on sanitized snapshot", () => {
      const cleanSnapshot: FrozenReportPayloadSnapshot = {
        case_id: "test-id",
        reference_number: "MRF-2026-0001",
        institution_name: "Test School",
        branch_name: "Main",
        category: "ACADEMIC",
        sanitized_description: "وصف نظيف بدون بيانات شخصية [PHONE_REDACTED]",
        desired_outcome: null,
        official_statement: "بيان المدرسة",
        rqs_score: 90,
        rqs_grade: "EXEMPLARY",
        milestones: [],
        evaluations_3d: { r_exp: 3, r_resp: 4, r_res: 5, feedback: null },
        statutory_citations: [],
        snapshot_created_at: new Date().toISOString(),
        version: 1,
      };

      expect(() => assertSnapshotPiiSafety(cleanSnapshot)).not.toThrow();
    });

    it("throws security error if snapshot contains raw Egyptian phone number", () => {
      const dirtySnapshot: FrozenReportPayloadSnapshot = {
        case_id: "test-id",
        reference_number: "MRF-2026-0001",
        institution_name: "Test School",
        branch_name: "Main",
        category: "ACADEMIC",
        sanitized_description: "يرجى الاتصال بي على رقم 01012345678 فوراً",
        desired_outcome: null,
        official_statement: null,
        rqs_score: null,
        rqs_grade: null,
        milestones: [],
        evaluations_3d: { r_exp: null, r_resp: null, r_res: null, feedback: null },
        statutory_citations: [],
        snapshot_created_at: new Date().toISOString(),
        version: 1,
      };

      expect(() => assertSnapshotPiiSafety(dirtySnapshot)).toThrow(
        "Security Violation: Snapshot contains unredacted Egyptian phone number"
      );
    });

    it("throws security error if snapshot contains 14-digit National ID", () => {
      const dirtySnapshot: FrozenReportPayloadSnapshot = {
        case_id: "test-id",
        reference_number: "MRF-2026-0001",
        institution_name: "Test School",
        branch_name: "Main",
        category: "ACADEMIC",
        sanitized_description: "الرقم القومي للطالب 29801011234567 مسجل بالمدرسة",
        desired_outcome: null,
        official_statement: null,
        rqs_score: null,
        rqs_grade: null,
        milestones: [],
        evaluations_3d: { r_exp: null, r_resp: null, r_res: null, feedback: null },
        statutory_citations: [],
        snapshot_created_at: new Date().toISOString(),
        version: 1,
      };

      expect(() => assertSnapshotPiiSafety(dirtySnapshot)).toThrow(
        "Security Violation: Snapshot contains unredacted 14-digit Egyptian National ID"
      );
    });
  });

  describe("Gate 4: Audit Check & Version Immutability", () => {
    it("preserves immutable version links for multi-version cases", async () => {
      const caseId = "99999999-8888-7777-6666-555555555555";
      const v1Result = await generateReportPdf({
        caseId,
        version: 1,
        mockCaseData: sampleCaseData,
      });

      const v2Result = await generateReportPdf({
        caseId,
        version: 2,
        mockCaseData: {
          ...sampleCaseData,
          officialStatement: "إفادة المدرسة المعدلة للإصدار الثاني",
        },
      });

      expect(v1Result.version).toBe(1);
      expect(v2Result.version).toBe(2);
      expect(v1Result.storagePath).toBe(`reports/case_${caseId}_v1.pdf`);
      expect(v2Result.storagePath).toBe(`reports/case_${caseId}_v2.pdf`);
      expect(v1Result.sha256Digest).not.toBe(v2Result.sha256Digest);
    }, 25000);
  });
});
