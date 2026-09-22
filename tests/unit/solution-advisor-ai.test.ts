import { describe, it, expect } from "vitest";
import {
  generateDeterministicCitizenOutcome,
  generateDeterministicActionPlan,
  getSolutionAdvice,
  type CitizenOutcomeAdvice,
  type InstitutionActionPlanAdvice,
} from "@/lib/ai/solution-advisor-service";

describe("Murafiq Solution Advisor AI Engine", () => {
  describe("Citizen Outcome Mode (Step 2 in Intake)", () => {
    it("suggests a fair, legally grounded outcome for school corporal punishment complaints", () => {
      const advice = generateDeterministicCitizenOutcome({
        mode: "CITIZEN_OUTCOME",
        sector: "EDUCATION_SCHOOLS",
        category: "SAFETY_DISCIPLINE",
        subcategory: "عقاب بدني ونفسي",
        description: "قام المعلم بضرب الطالب بالعصا أمام زملائه وتوجيه إهانات لفظية له مما تسبب في أذى نفسي شديد.",
        entityName: "مدرسة الأمل الرسمية",
      });

      expect(advice.outcomeSuggestion).toContain("لجنة الحماية المدرسية");
      expect(advice.statutoryGrounds.lawName).toContain("187 لسنة 2023");
      expect(advice.recommendedSteps.length).toBeGreaterThanOrEqual(2);
      expect(advice.suggestedRemedyType).toContain("تعهد رسمي");
    });

    it("suggests statutory refund outcome for commercial company disputes under Law 181/2018", () => {
      const advice = generateDeterministicCitizenOutcome({
        mode: "CITIZEN_OUTCOME",
        sector: "COMMERCIAL_COMPANIES",
        category: "WARRANTY_REFUND",
        description: "اشتريت جهازاً وظهر به عطل فني في اليوم الخامس ورفضت الشركة استرجاع المبلغ أو الاستبدال.",
        entityName: "شركة الإلكترونيات الحديثة",
      });

      expect(advice.outcomeSuggestion).toContain("استرجاع القيمة المالية");
      expect(advice.statutoryGrounds.lawName).toContain("181 لسنة 2018");
      expect(advice.suggestedRemedyType).toContain("استرداد نقدي");
    });

    it("suggests academic review outcome for higher education under Law 49/1972", () => {
      const advice = generateDeterministicCitizenOutcome({
        mode: "CITIZEN_OUTCOME",
        sector: "HIGHER_EDUCATION",
        category: "REGISTRATION_ENROLLMENT",
        description: "تعطل تسجيل الساعات المعتمدة في الفصل الصيفي ورفضت الكلية مراجعة التماس الطالب.",
        entityName: "جامعة القاهرة - كلية الهندسة",
      });

      expect(advice.outcomeSuggestion).toContain("لجنة محايدة");
      expect(advice.statutoryGrounds.lawName).toContain("49 لسنة 1972");
    });

    it("suggests clinical quality review for healthcare under GAHAR standards", () => {
      const advice = generateDeterministicCitizenOutcome({
        mode: "CITIZEN_OUTCOME",
        sector: "HEALTHCARE_MEDICAL",
        category: "BILLING_INSURANCE",
        description: "تم تحصيل مبالغ إضافية دون فاتورة تفصيلية مع تأخر غير مبرر في استقبال الطوارئ.",
        entityName: "مستشفى السلام الدولي",
      });

      expect(advice.outcomeSuggestion).toContain("إدارة الجودة وسلامة المرضى");
      expect(advice.statutoryGrounds.issuingAuthority).toContain("GAHAR");
    });
  });

  describe("Institution Action Plan Mode (Triage & Builder)", () => {
    it("generates an RQS-compliant (>=90) Action Plan across sectors", () => {
      const schoolPlan = generateDeterministicActionPlan({
        mode: "INSTITUTION_ACTION_PLAN",
        sector: "EDUCATION_SCHOOLS",
        category: "SAFETY_DISCIPLINE",
        description: "شكوى تنمر واعتداء لفظي داخل الفصل",
        entityName: "مدرسة سان جورج",
        caseReference: "MRF-2026-90412",
      });

      expect(schoolPlan.officialStatement.length).toBeGreaterThan(50);
      expect(schoolPlan.milestones.length).toBe(3);
      expect(schoolPlan.estimatedRqs).toBeGreaterThanOrEqual(90);
      expect(schoolPlan.milestones[0].owner_role).toBeDefined();
      expect(schoolPlan.milestones[0].deliverable).toBeDefined();

      const companyPlan = generateDeterministicActionPlan({
        mode: "INSTITUTION_ACTION_PLAN",
        sector: "COMMERCIAL_COMPANIES",
        category: "PRODUCT_QUALITY",
        description: "عيب في جهاز محمول وطلب استرداد",
        entityName: "شركة تليكوم مصر",
        caseReference: "MRF-2026-88192",
      });

      expect(companyPlan.milestones.length).toBe(3);
      expect(companyPlan.estimatedRqs).toBeGreaterThanOrEqual(90);
    });

    it("getSolutionAdvice returns typed structured payload", async () => {
      const res = await getSolutionAdvice({
        mode: "INSTITUTION_ACTION_PLAN",
        sector: "HEALTHCARE_MEDICAL",
        category: "APPOINTMENT_CARE",
        description: "شكوى تأخر الفحص",
        entityName: "مستشفى القصر العيني التعليمي",
      });

      expect(res.success).toBe(true);
      expect(res.mode).toBe("INSTITUTION_ACTION_PLAN");
      const advice = res.advice as InstitutionActionPlanAdvice;
      expect(advice.officialStatement).toContain("التزام");
      expect(advice.milestones.length).toBe(3);
    });
  });
});
