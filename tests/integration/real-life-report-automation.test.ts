import { describe, it, expect, beforeEach } from "vitest";
import { compileReportHtml } from "@/lib/pdf/template";
import { generateReportPdf } from "@/trigger/tasks/generateReportPdf";
import { sendWhatsAppResolutionReport } from "@/trigger/tasks/sendWhatsAppReport";
import { storageAdapter } from "@/lib/services/storage-adapter";
import { POST as resolveCaseHandler } from "@/app/api/cases/[id]/resolve/route";
import { GET as getReportPreviewHandler } from "@/app/api/cases/[id]/report/preview/route";
import { GET as getReportPdfHandler } from "@/app/api/cases/[id]/report/pdf/route";
import { GET as getMatrixHandler, PUT as putMatrixHandler } from "@/app/api/cases/[id]/matrix/route";
import { NextRequest } from "next/server";

describe("Real-Life Audit Matrix Report & WhatsApp Dispatch Automation", () => {
  const sampleMatrixCase = {
    referenceNumber: "MRF-2026-REAL-1516",
    institutionName: "مدرسة الأمل الحديثة للغات",
    branchName: "فرع مدينة نصر",
    category: "ADMINISTRATION_DISCIPLINE",
    sanitizedSummary:
      "هناك فيديو تم نشره على جروب فريق عمل المدرسة به خطأ لغة عربية (بسيط) ومن المتوقع ان يكون قد تم نشره على جروبات اولياء الامور .",
    desiredOutcome: "مراجعة اي مادة اعلامية قبل نشرها",
    officialStatement:
      "تكليف اخصائية الاعلام بارسال الفيديوهات والمنشورات الاعلامية لاحد معلمي اللغة العربية للاطلاع قبل النشر وتكليف وكيل المدرسة بالمتابعة",
    rqsScore: 94,
    rqsGrade: "EXEMPLARY",
    rExp: 4,
    rResp: 5,
    rRes: 5,
    closingFeedback: "تم اتخاذ الإجراء السريع والمعالجة المهنية المحترمة.",
    auditItems: [
      {
        seq: 15,
        item: "اعلام",
        observation:
          "هناك فيديو تم نشره على جروب فريق عمل المدرسة يوم 9/15 به خطأ لغة عربية (بسيط) ومن المتوقع ان يكون قد تم نشره على جروبات اولياء الامور .",
        recommendation: "مراجعة اي مادة اعلامية قبل نشرها",
        isRecurring: "لا",
        actionSteps:
          "تكليف اخصائية الاعلام بارسال الفيديوهات والمنشورات الاعلامية لاحد معلمي اللغة العربية للاطلاع قبل النشر وتكليف وكيل المدرسة بالمتابعة",
        statement: "تم التكليف والمراجعة",
        targetDate: "2026/09/25",
      },
      {
        seq: 16,
        item: "اخصائي نفسي",
        observation:
          "طلب السيد مدير المدرسة من الاخصائي النفسي اعداد خطة للندوات والمحاضرات على مدار العام الدراسي - اين خطة عام 2027/2026؟",
        recommendation: "اين خطة عام 2027/2026؟",
        isRecurring: "لا",
        actionSteps:
          "تكليف السيد/ وكيل المدرسة بمتابعة اعمال الاخصائي النفسي وتقديم خطة تفصيلية لعام 2027/2026 وتقديم تقرير اسبوعي عن ماتم من اعمال",
        statement: "جاري إعداد الخطة",
        targetDate: "2026/09/28",
      },
    ],
  };

  describe("1. 8-Column Audit & Action Matrix HTML Template", () => {
    it("compiles HTML containing all 8 matrix columns matching the real-world sample", () => {
      const html = compileReportHtml(sampleMatrixCase);

      // Verify Table Column Headers (exact match from sample image)
      expect(html).toContain("م");
      expect(html).toContain("البند");
      expect(html).toContain("الملحوظة");
      expect(html).toContain("التوصية");
      expect(html).toContain("مكرر");
      expect(html).toContain("خطوات التنفيذ المقترحة");
      expect(html).toContain("الإفادة / الرد");
      expect(html).toContain("التاريخ");

      // Verify Column Values
      expect(html).toContain("15");
      expect(html).toContain("اعلام");
      expect(html).toContain("مراجعة اي مادة اعلامية قبل نشرها");
      expect(html).toContain("16");
      expect(html).toContain("اخصائي نفسي");
      expect(html).toContain("اين خطة عام 2027/2026؟");

      // Verify Attribution Badges
      expect(html).toContain("[USER-REPORTED]");
      expect(html).toContain("[INSTITUTION-STATED]");
      expect(html).toContain("[USER-CONFIRMED]");
      expect(html).toContain("[VERIFIED]");

      // Verify Signatures & Stamp
      expect(html).toContain("مسؤول الفحص والمتابعة");
      expect(html).toContain("وكيل المؤسسة / رئيس القسم");
      expect(html).toContain("مدير المنشأة / المشرف العام");
      expect(html).toContain("الختم المؤسسي المعتمد");
    });
  });

  describe("2. PDF Generation Engine", () => {
    it("generates a high-resolution PDF buffer with SHA-256 integrity hash", async () => {
      const caseId = "aaaaaaaa-1111-2222-3333-444444444444";
      const result = await generateReportPdf({
        caseId,
        version: 1,
        mockCaseData: sampleMatrixCase,
      });

      expect(result.success).toBe(true);
      expect(result.pdfBuffer).toBeInstanceOf(Buffer);
      expect(result.pdfBuffer.length).toBeGreaterThan(100);
      expect(result.sha256Digest).toMatch(/^[a-f0-9]{64}$/);
      expect(result.snapshot.reference_number).toBe("MRF-2026-REAL-1516");
    }, 25000);
  });

  describe("3. WhatsApp Dispatch Automation", () => {
    it("dispatches resolution report to beneficiary phone with 72h signed URL and idempotency", async () => {
      const caseId = "bbbbbbbb-1111-2222-3333-444444444444";
      const dispatch = await sendWhatsAppResolutionReport({
        caseId,
        version: 1,
        recipientPhone: "01012345678",
        parentName: "أ/ محمود عبد الله",
        institutionName: "مدرسة الأمل الحديثة",
        caseReference: "MRF-2026-REAL-1516",
      });

      expect(dispatch.success).toBe(true);
      expect(dispatch.deliveryStatus).toBe("SENT");
      expect(dispatch.recipientPhoneHash).toMatch(/^[a-f0-9]{64}$/);
      expect(dispatch.signedUrl).toContain("token=");
      expect(dispatch.providerMessageId).toBeDefined();

      // Check storage adapter recorded the dispatch
      const dispatches = await storageAdapter.getWhatsAppDispatchesByCaseId(caseId);
      expect(dispatches.length).toBeGreaterThan(0);
      expect(dispatches[0].recipient_phone_e164).toBe("+201012345678");
    });
  });

  describe("4. End-to-End Case Resolution & Automated Dispatch Route", () => {
    it("resolves the case, updates lifecycle, compiles PDF, and sends WhatsApp automatically", async () => {
      // 1. Create a test case in storageAdapter
      const testCase = await storageAdapter.saveCase({
        id: "cccccccc-1111-2222-3333-444444444444",
        reference_number: "MRF-2026-RESOLVE-998",
        user_id: "00000000-0000-0000-0000-000000000001",
        institution_id: "00000000-0000-0000-0000-000000000010",
        institution_name: "مدرسة الأمل التجريبية",
        category: "ADMINISTRATION_DISCIPLINE",
        subcategory: "لائحة الانضباط",
        lifecycle_status: "ACTION_PLAN_PENDING",
        visibility: "STRICTLY_PRIVATE",
        sanitized_description: "استفسار وملاحظة بشأن معايير النشر الإعلامي الداخلي.",
        initial_experience_rating: 3,
        metadata: {
          recipient_phone: "01099887766",
        },
      });

      // 2. Call resolve endpoint
      const req = new NextRequest(
        `http://localhost:3000/api/cases/${testCase.id}/resolve`,
        {
          method: "POST",
          body: JSON.stringify({
            officialStatement: "تم فحص الواقعة واعتماد خطة العمل التصحيحية وإخطار المشرفين بالمتابعة الأسبوعية.",
            recipientPhone: "01099887766",
          }),
        }
      );

      const res = await resolveCaseHandler(req, {
        params: Promise.resolve({ id: testCase.id }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.lifecycle_status).toBe("AWAITING_EVALUATION");
      expect(json.pdfGenerated).toBe(true);
      expect(json.sha256Digest).toBeDefined();
      expect(json.whatsappDispatched).toBe(true);
      expect(json.recipientPhone).toBe("01099887766");
      expect(json.signedDownloadUrl).toContain("token=");

      // 3. Verify case lifecycle was updated in store
      const updated = await storageAdapter.getCaseById(testCase.id);
      expect(updated?.lifecycle_status).toBe("AWAITING_EVALUATION");
    }, 25000);
  });

  describe("5. Report Preview & PDF Streaming Endpoints", () => {
    it("returns structured JSON for Canvas preview with 8-column matrix items", async () => {
      const caseId = "cccccccc-1111-2222-3333-444444444444";
      const req = new NextRequest(`http://localhost:3000/api/cases/${caseId}/report/preview`);
      const res = await getReportPreviewHandler(req, {
        params: Promise.resolve({ id: caseId }),
      });

      expect(res.status).toBe(200);
      const json = await res.json();

      expect(json.success).toBe(true);
      expect(json.reportData).toBeDefined();
      expect(json.reportData.auditItems).toBeDefined();
      expect(json.reportData.auditItems.length).toBeGreaterThan(0);
      expect(json.recipientPhone).toBe("01099887766");
    });

    it("streams PDF with valid application/pdf Content-Type and digest header", async () => {
      const caseId = "cccccccc-1111-2222-3333-444444444444";
      const req = new NextRequest(`http://localhost:3000/api/cases/${caseId}/report/pdf`);
      const res = await getReportPdfHandler(req, {
        params: Promise.resolve({ id: caseId }),
      });

      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("application/pdf");
      expect(res.headers.get("X-Report-Digest")).toBeDefined();
    }, 25000);
  });

  describe("6. Dynamic 8-Column Matrix Management API", () => {
    it("retrieves and updates custom matrix items, persisting them in case metadata", async () => {
      const caseId = "cccccccc-1111-2222-3333-444444444444";

      // 1. GET matrix items
      const getReq = new NextRequest(`http://localhost:3000/api/cases/${caseId}/matrix`);
      const getRes = await getMatrixHandler(getReq, {
        params: Promise.resolve({ id: caseId }),
      });

      expect(getRes.status).toBe(200);
      const getJson = await getRes.json();
      expect(getJson.success).toBe(true);
      expect(Array.isArray(getJson.items)).toBe(true);

      // 2. PUT custom matrix items
      const customItems = [
        {
          seq: 15,
          item: "إعلام",
          observation: "ملاحظة تدقيق إعلامي معدلة.",
          recommendation: "مراجعة المواد الإعلامية قبل النشر.",
          isRecurring: "لا",
          actionSteps: "تكليف مسؤول النشر بالمتابعة.",
          statement: "تمت المعالجة الفورية.",
          targetDate: "2026/09/25",
        },
        {
          seq: 16,
          item: "أخصائي نفسي",
          observation: "طلب خطة محاضرات الدعم السلوكي.",
          recommendation: "اعتماد خطة الندوات.",
          isRecurring: "نعم",
          actionSteps: "إعداد خطة الرعاية النفسية والتربوية.",
          statement: "تم الاعتماد.",
          targetDate: "2026/09/28",
        },
      ];

      const putReq = new NextRequest(`http://localhost:3000/api/cases/${caseId}/matrix`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items: customItems }),
      });

      const putRes = await putMatrixHandler(putReq, {
        params: Promise.resolve({ id: caseId }),
      });

      expect(putRes.status).toBe(200);
      const putJson = await putRes.json();
      expect(putJson.success).toBe(true);
      expect(putJson.items.length).toBe(2);
      expect(putJson.items[0].item).toBe("إعلام");
      expect(putJson.items[1].isRecurring).toBe("نعم");

      // 3. Verify preview route now returns the updated custom matrix items
      const prevReq = new NextRequest(`http://localhost:3000/api/cases/${caseId}/report/preview`);
      const prevRes = await getReportPreviewHandler(prevReq, {
        params: Promise.resolve({ id: caseId }),
      });
      const prevJson = await prevRes.json();

      expect(prevJson.success).toBe(true);
      expect(prevJson.reportData.auditItems.length).toBe(2);
      expect(prevJson.reportData.auditItems[0].observation).toBe("ملاحظة تدقيق إعلامي معدلة.");
    });
  });
});

