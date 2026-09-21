import { describe, it, expect } from "vitest";
import { calculateRQS, type ActionPlanPayload } from "@/lib/ai/scoring";

describe("Resolution Quality Score (RQS) Deterministic Engine", () => {
  it("penalizes plan without named owners or explicit deadlines", () => {
    const poorPlan: ActionPlanPayload = {
      officialStatement: "We will look into it.",
      milestones: [{ title: "Review", ownerRole: "", dueDate: "" }],
    };
    const result = calculateRQS(poorPlan);
    expect(result.rqsScore).toBeLessThan(40);
    expect(result.breakdown.deductions).toBeGreaterThan(0);
  });

  it("scores high for complete, accountable, time-bound action plan", () => {
    const strongPlan: ActionPlanPayload = {
      officialStatement:
        "عقدت إدارة المرحلة اجتماعاً طارئاً مع قسم الرياضيات لمراجعة الجدول الزمني وخطة الدعم الدراسي للطلاب المتأخرين وتكليف فريق الإشراف بالمتابعة اليومية.",
      milestones: [
        {
          title: "تقييم مستوى الطلاب وإعداد خطة علاجية مخصصة",
          ownerRole: "رئيس قسم الرياضيات",
          dueDate: "2026-10-01",
          deliverable: "تقرير تقييمي معتمد وجدول الحصص الإضافية",
        },
        {
          title: "اجتماع توضيحي مع أولياء الأمور لعرض خطة التطوير",
          ownerRole: "الأخصائي الاجتماعي ومدير المرحلة",
          dueDate: "2026-10-05",
          deliverable: "محضر الاجتماع وتوقيعات الحضور",
        },
      ],
    };
    const result = calculateRQS(strongPlan);
    expect(result.rqsScore).toBeGreaterThanOrEqual(75);
    expect(result.grade).toMatch(/EXEMPLARY|COMPREHENSIVE/);
  });

  it("guarantees 100% mathematical determinism across 100 repeated executions", () => {
    const plan: ActionPlanPayload = {
      officialStatement: "Inspection of heating system completed. Replacement scheduled.",
      milestones: [
        {
          title: "Procure replacement valves",
          ownerRole: "Facilities Lead",
          dueDate: "2026-10-15",
          deliverable: "Purchase invoice and delivery slip",
        },
      ],
    };

    const firstRun = calculateRQS(plan);
    for (let i = 0; i < 100; i++) {
      const currentRun = calculateRQS(plan);
      expect(currentRun.rqsScore).toBe(firstRun.rqsScore);
      expect(currentRun.breakdown.deductions).toBe(firstRun.breakdown.deductions);
      expect(currentRun.grade).toBe(firstRun.grade);
    }
  });

  it("evaluates a spectrum of 10 sample action plans consistently", () => {
    const samplePlans: ActionPlanPayload[] = [
      {
        officialStatement: "سنحاول نشوف المشكلة.",
        milestones: [{ title: "متابعة", ownerRole: "", dueDate: "" }],
      },
      {
        officialStatement: "We received the complaint.",
        milestones: [],
      },
      {
        officialStatement:
          "الإدارة تعمل على إعادة ضبط مواعيد الحافلات ووضع نظام تتبع مباشر للرحلات المدرسية.",
        milestones: [
          {
            title: "تركيب أجهزة تتبع GPS في كافة الحافلات المدرسية",
            ownerRole: "مدير حركة النقل",
            dueDate: "2026-10-10",
            deliverable: "تقرير تفعيل النظام",
          },
        ],
      },
      {
        officialStatement: "سيتم اتخاذ اللازم في أقرب وقت ممكن مع فريق الصيانة العامة.",
        milestones: [
          {
            title: "صيانة أجهزة التكييف في الفصول",
            ownerRole: "مهندس الصيانة",
            dueDate: "2026-10-12",
          },
        ],
      },
      {
        officialStatement:
          "Direct meeting with science department staff to adjust laboratory experiment schedules and ensure all safety equipment is replenished.",
        milestones: [
          {
            title: "Safety gear audit and restocking",
            ownerRole: "Lab Safety Officer",
            dueDate: "2026-10-04",
            deliverable: "Safety checklist audit log",
          },
          {
            title: "Student lab schedule re-allocation",
            ownerRole: "Head of Science Dept",
            dueDate: "2026-10-08",
            deliverable: "Updated timetable",
          },
        ],
      },
      {
        officialStatement: "Short statement.",
        milestones: [
          {
            title: "Task 1 with missing role",
            ownerRole: "",
            dueDate: "2026-10-20",
          },
        ],
      },
      {
        officialStatement:
          "المدرسة حريصة على تعزيز الانضباط السلوكي ومنع التنمر عبر إشراك الأخصائيين النفسيين وتكثيف المراقبة في الملاعب.",
        milestones: [
          {
            title: "عقد ورش توعية ضد التنمر لجميع الصفوف الدراسية",
            ownerRole: "الأخصائي النفسي",
            dueDate: "2026-10-14",
            deliverable: "سجل حضور ورش التوعية",
          },
          {
            title: "زيادة طاقم الإشراف أثناء فترات الفسحة",
            ownerRole: "وكيل شؤون الطلاب",
            dueDate: "2026-10-02",
            deliverable: "جدول نوبات الإشراف اليومي",
          },
        ],
      },
      {
        officialStatement: "We will look into resolving this issue as soon as possible.",
        milestones: [
          {
            title: "Staff meeting",
            ownerRole: "someone",
            dueDate: "invalid-date",
          },
        ],
      },
      {
        officialStatement:
          "Comprehensive review of fee installment structure in coordination with school board and accounting department.",
        milestones: [
          {
            title: "Publish revised installment schedule",
            ownerRole: "Chief Financial Officer",
            dueDate: "2026-10-03",
            deliverable: "Official fee schedule PDF",
          },
        ],
      },
      {
        officialStatement:
          "Detailed response regarding school cafeteria hygiene: inspection conducted and sanitation protocols upgraded.",
        milestones: [
          {
            title: "Health authority inspection visit",
            ownerRole: "School Health Inspector",
            dueDate: "2026-10-02",
            deliverable: "Inspection clearance certificate",
          },
          {
            title: "Food supplier contract review",
            ownerRole: "Operations Lead",
            dueDate: "2026-10-07",
            deliverable: "Signed vendor compliance agreement",
          },
        ],
      },
    ];

    expect(samplePlans.length).toBe(10);
    samplePlans.forEach((plan, idx) => {
      const res = calculateRQS(plan);
      expect(res.rqsScore).toBeGreaterThanOrEqual(0);
      expect(res.rqsScore).toBeLessThanOrEqual(100);
      expect(res.breakdown).toBeDefined();
    });
  });
});
