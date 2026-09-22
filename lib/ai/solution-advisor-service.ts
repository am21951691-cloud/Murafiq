import { SectorType } from "@/types/database";
import { calculateRQS, type ActionPlanPayload } from "./scoring";
import { CURATED_STATUTORY_DECREES, type CuratedDecree } from "./statutory-data";

export type AdvisorMode = "CITIZEN_OUTCOME" | "INSTITUTION_ACTION_PLAN";

export interface CitizenOutcomeAdvice {
  outcomeSuggestion: string;
  statutoryGrounds: {
    lawName: string;
    articleNumber: string;
    issuingAuthority: string;
    summary: string;
  };
  recommendedSteps: string[];
  suggestedRemedyType: string;
}

export interface InstitutionActionPlanAdvice {
  officialStatement: string;
  milestones: Array<{
    title: string;
    owner_role: string;
    due_date: string;
    deliverable: string;
  }>;
  statutoryBasis: string;
  estimatedRqs: number;
}

export interface SolutionAdvisorInput {
  mode: AdvisorMode;
  sector: SectorType;
  category: string;
  subcategory?: string;
  description: string;
  entityName?: string;
  caseReference?: string;
  locale?: "ar" | "en";
}

export interface SolutionAdvisorResponse {
  success: boolean;
  mode: AdvisorMode;
  sector: SectorType;
  advice: CitizenOutcomeAdvice | InstitutionActionPlanAdvice;
  sourceEngine: "OPENAI_LLM" | "NVIDIA_NIM_LLM" | "DETERMINISTIC_STATUTORY_ENGINE";
}

/**
 * Maps sector and keywords to relevant curated Egyptian decrees
 */
function findCuratedDecreeForSector(
  sector: SectorType,
  category: string,
  description: string
): CuratedDecree | undefined {
  const q = `${category} ${description}`.toLowerCase();

  // Match by sector decrees first
  const sectorDecrees = CURATED_STATUTORY_DECREES.filter((d) =>
    (d as any).applicable_sectors
      ? (d as any).applicable_sectors.includes(sector)
      : sector === "EDUCATION_SCHOOLS"
  );

  if (sector === "EDUCATION_SCHOOLS") {
    if (q.includes("ضرب") || q.includes("عقاب") || q.includes("تنمر") || q.includes("سلوك")) {
      return CURATED_STATUTORY_DECREES.find((d) => d.id.includes("d187-2023-art-004"));
    }
    if (q.includes("مصروفات") || q.includes("رسوم") || q.includes("كتب") || q.includes("تقسيط")) {
      return CURATED_STATUTORY_DECREES.find((d) => d.id.includes("d420-2014-art-032"));
    }
    if (q.includes("حافله") || q.includes("باص") || q.includes("نقل")) {
      return CURATED_STATUTORY_DECREES.find((d) => d.id.includes("d420-2014-art-039"));
    }
    if (q.includes("لائحه") || q.includes("لجنه") || q.includes("فصل")) {
      return CURATED_STATUTORY_DECREES.find((d) => d.id.includes("d187-2023-art-018"));
    }
  }

  if (sector === "COMMERCIAL_COMPANIES") {
    if (q.includes("استرجاع") || q.includes("رد") || q.includes("عيب") || q.includes("ضمان")) {
      return CURATED_STATUTORY_DECREES.find((d) => d.source_reference.includes("181"));
    }
  }

  return sectorDecrees[0] || CURATED_STATUTORY_DECREES[0];
}

/**
 * Deterministic Statutory Outcome Suggestion for Citizens (Step 2 in Intake)
 */
export function generateDeterministicCitizenOutcome(
  input: SolutionAdvisorInput
): CitizenOutcomeAdvice {
  const { sector, category, subcategory, description, entityName } = input;
  const targetName = entityName || "الجهة المعنية";
  const descLower = description.toLowerCase();

  switch (sector) {
    case "EDUCATION_SCHOOLS": {
      if (descLower.includes("ضرب") || descLower.includes("عقاب") || descLower.includes("إهانة") || descLower.includes("اهانه")) {
        return {
          outcomeSuggestion: `التحقيق المحايد والعاجل من خلال لجنة الحماية المدرسية في واقعة التجاوز التأديبي بحق الطالب، مع إلغاء أي إجراء تعسفي، وتطبيق الجزاء القانوني الرادع على المتسبب، وتقديم تعهد رسمي مكتوب بعدم تكرار التجاوز حفاظاً على كرامة الطالب وسلامته النفسية.`,
          statutoryGrounds: {
            lawName: "القرار الوزاري رقم 187 لسنة 2023 (لائحة الانضباط المدرسي)",
            articleNumber: "المادة 4 والمادة 18",
            issuingAuthority: "وزارة التربية والتعليم والتعليم الفني (MOETE)",
            summary: "الحظر القاطع لكافة صور العقاب البدني والنفسي وإلزام المدرسة بمساءلة المتسبب فوراً عبر لجنة الحماية المدرسية.",
          },
          recommendedSteps: [
            "توثيق تاريخ ووقت الواقعة وأسماء أي شهود من الزملاء أو المعلمين.",
            "المطالبة باجتماع رسمي مع مدير المدرسة ورئيس مجلس الأمناء.",
            "متابعة استلام رد كتابي خلال مهلة الـ 7 أيام المقررة عبر مُرافِق.",
          ],
          suggestedRemedyType: "تحقيق إداري وتعهد رسمي بعدم التكرار",
        };
      }

      if (descLower.includes("مصروفات") || descLower.includes("رسوم") || descLower.includes("زيادة") || descLower.includes("زياده")) {
        return {
          outcomeSuggestion: `مراجعة الشريحة المعتمدة للمصروفات المدرسية طبقاً للائحة وزارة التربية والتعليم، وإلغاء الزيادة المخالفة للنسبة الوزارية المقررة، وإعادة تسوية أي مبالغ تم تحصيلها بالزيادة في صورة رصيد دائن أو رد نقدي فوري مع تفعيل خطة التقسيط المعتمدة.`,
          statutoryGrounds: {
            lawName: "القرار الوزاري رقم 420 لسنة 2014 وتعديلاته الخاصة بالتعليم الخاص والدولي",
            articleNumber: "المادة 32 ومحددات الشرائح السنوية",
            issuingAuthority: "وزارة التربية والتعليم والتعليم الفني",
            summary: "حظر تحصيل أي مبالغ تزيد عن المصروفات المعتمدة ووجوب التزام المدارس بالشرائح المقررة والتقسيط القانوني.",
          },
          recommendedSteps: [
            "الاحتفاظ بإيصالات السداد المصرفية المعتمدة الصادرة من المدرسة.",
            "طلب كشف حساب مالي رسمي معتمد ومختوم بتفاصيل بنود المصروفات.",
            "إرفاق كود المدرسة في الشكوى للتحقق من قيدها بالمديرية التعليمية.",
          ],
          suggestedRemedyType: "تسوية مالية ورد مبالغ محصلة بالزيادة",
        };
      }

      return {
        outcomeSuggestion: `عقد جلسة تنسيقية محايدة مع إدارة ${targetName} لبحث مشكلة ${subcategory || category}، ووضع جدول زمني ملزم لتصحيح القصور مع موافاة ولي الأمر بتقرير كتابي بما تم اتخاذه من إجراءات.`,
        statutoryGrounds: {
          lawName: "قانون التعليم رقم 139 لسنة 1981 ولائحة الانضباط المدرسي 187/2023",
          articleNumber: "المادة 18",
          issuingAuthority: "وزارة التربية والتعليم والتعليم الفني",
          summary: "حق ولي الأمر في التحقيق المحايد في الشكاوى وتوثيق الحلول المتدرجة.",
        },
        recommendedSteps: [
          "تحديد موعد مراجعة مع الإخصائي الاجتماعي أو وكيل المرحلة.",
          "توثيق الشكوى عبر مُرافِق لتفعيل إشعار المهلة الرسمية.",
        ],
        suggestedRemedyType: "إجراء إداري تصحيحي وجدول زمني معتمد",
      };
    }

    case "COMMERCIAL_COMPANIES": {
      return {
        outcomeSuggestion: `استرجاع القيمة المالية المدفوعة بالكامل دون خصم أي مصاريف إدارية (أو استبدال المنتج المعيب بآخر جديد مطابق للمواصفات)، مع إلزام شركة ${targetName} بتقديم إشعار كتابي بإلغاء المعاملة والاعتذار عن التأخر في خدمة ما بعد البيع.`,
        statutoryGrounds: {
          lawName: "قانون حماية المستهلك المصري رقم 181 لسنة 2018",
          articleNumber: "المادتان 17 و21",
          issuingAuthority: "جهاز حماية المستهلك (CPA)",
          summary: "حق المستهلك في استبدال السلعة أو استرداد قيمتها خلال 14 يوماً من تاريخ الشراء عند وجود عيب أو عدم مطابقة للخدمة المتعاقد عليها.",
        },
        recommendedSteps: [
          "تجهيز صورة الفاتورة الضريبية أو أمر الشراء الإلكتروني.",
          "تصوير العيب أو توثيق العطل الفني ومحاضر الصيانة السابقة.",
          "تقديم الشكوى عبر مُرافِق للاستفادة من وساطة الغرف التجارية وأجهزة الرقابة.",
        ],
        suggestedRemedyType: "استرداد نقدي كامل أو استبدال فوري",
      };
    }

    case "HIGHER_EDUCATION": {
      return {
        outcomeSuggestion: `إعادة فحص التظلم الأكاديمي المتعلق بـ (${subcategory || category}) من خلال لجنة محايدة برئاسة وكيل الكلية لشؤون التعليم والطلاب، وتمكين الطالب من مراجعة نموذج الإجابة أو معالجة تسجيل الساعات المعتمدة دون أي تأخير يؤثر على التخرج أو الفصل الدراسي.`,
        statutoryGrounds: {
          lawName: "قانون تنظيم الجامعات رقم 49 لسنة 1972 ولائحته التنفيذية",
          articleNumber: "المواد المنظمة للتظلم والامتحانات واللجان الأكاديمية",
          issuingAuthority: "المجلس الأعلى للجامعات ووزارة التعليم العالي",
          summary: "حق الطالب الجامعي في الشفافية التامة ونظر التظلمات وتصحيح الأخطاء المادية ورصد الدرجات.",
        },
        recommendedSteps: [
          "إرفاق إيصال سداد رسوم التظلم الأكاديمي إن وجد.",
          "تحديد كود المادة أو الفصل الدراسي بدقة.",
          "متابعة إخطار الكلية عبر منصة مُرافِق خلال مهلة الـ 7 أيام.",
        ],
        suggestedRemedyType: "إعادة نظر أكاديمية وتصحيح الخطأ الإداري",
      };
    }

    case "HEALTHCARE_MEDICAL": {
      return {
        outcomeSuggestion: `إجراء مراجعة طبية وإدارية فورية لحالة المريض بواسطة إدارة الجودة وسلامة المرضى بمستشفى ${targetName}، وتصحيح الخلل الإداري المتعلق بـ (${subcategory || category})، مع تقديم تقرير طبي مفصل وفاتورة علاجية معتمدة ومفندة.`,
        statutoryGrounds: {
          lawName: "معايير الهيئة العامة للاعتماد والرقابة الصحية (GAHAR) ووثيقة حقوق المريض",
          articleNumber: "معايير سلامة المرضى والشفافية الطبية",
          issuingAuthority: "الهيئة العامة للاعتماد والرقابة الصحية (GAHAR)",
          summary: "حق المريض في الرعاية الآمنة، والحصول على تقرير طبي تفصيلي، والفاتورة العلاجية غير المجملة.",
        },
        recommendedSteps: [
          "الاحتفاظ بصور التقارير الطبية وإيصالات الدخول أو الطوارئ.",
          "تضمين رقم الملف الطبي (MRN) في الحقل المشفر الآمن بمُرافِق.",
          "طلب اجتماع مع مسؤول شكاوى المرضى وإدارة المستشفى.",
        ],
        suggestedRemedyType: "مراجعة جودة الرعاية وإصدار تقرير رسمي مفصل",
      };
    }

    case "GOVERNMENT_PUBLIC":
    default: {
      return {
        outcomeSuggestion: `سرعة استكمال وإصدار المعاملة الحكومية المتعلقة بـ (${subcategory || category}) دون مزيد من التأخير، ومعالجة العطل الفني أو الإداري المسجل برقم الطلب، وتحديد موعد مؤكد وميسر للاستلام.`,
        statutoryGrounds: {
          lawName: "قانون الخدمة المدنية رقم 81 لسنة 2016 وقواعد ميثاق المواطن للخدمات العامة",
          articleNumber: "المادة 57 والتزامات الأداء الحكومي",
          issuingAuthority: "الجهاز المركزي للتنظيم والإدارة ومجلس الوزراء",
          summary: "التزام الجهات الحكومية بإنجاز معاملات المواطنين في المواعيد المقررة ووفق معايير الحوكمة والتحول الرقمي.",
        },
        recommendedSteps: [
          "تجهيز رقم الطلب الإلكتروني أو إيصال السداد الحكومي (دون ذكر الرقم القومي).",
          "مراجعة بوابة الاستعلام الحكومية عن حالة الطلب.",
          "متابعة الرد الرسمي للجهة عبر قنوات مُرافِق المعتمدة.",
        ],
        suggestedRemedyType: "استكمال المعاملة وتحديد موعد استلام فوري",
      };
    }
  }
}

/**
 * Deterministic Institutional Action Plan Generator (RQS-Compliant, score >= 90)
 */
export function generateDeterministicActionPlan(
  input: SolutionAdvisorInput
): InstitutionActionPlanAdvice {
  const { sector, category, description, entityName, caseReference } = input;
  const targetName = entityName || "إدارة المؤسسة";
  const now = Date.now();
  const date7 = new Date(now + 7 * 86400000).toISOString().split("T")[0];
  const date14 = new Date(now + 14 * 86400000).toISOString().split("T")[0];
  const date21 = new Date(now + 21 * 86400000).toISOString().split("T")[0];

  let officialStatement = "";
  let milestones: Array<{
    title: string;
    owner_role: string;
    due_date: string;
    deliverable: string;
  }> = [];
  let statutoryBasis = "";

  switch (sector) {
    case "EDUCATION_SCHOOLS": {
      officialStatement = `تؤكد إدارة ${targetName} التزامها الكامل بضمانات القرار الوزاري 187 لسنة 2023 وتوفير بيئة تعليمية آمنة تصون كرامة أبنائنا الطلاب وحقوق أولياء الأمور. وبناءً على ما ورد بالحالة المقيدة برقم (${caseReference || "MRF-2026"})، باشرت الإدارة فوراً تشكيل لجنة فحص وتدقيق للوقوف على كافة الملابسات، واتخاذ التدابير التصحيحية والوقائية اللازمة وفق أعلى معايير الشفافية والمسؤولية التربوية.`;
      milestones = [
        {
          title: "عقد جلسة استماع وفحص إداري بحضور الأخصائي الاجتماعي وولي الأمر",
          owner_role: "رئيس لجنة الحماية المدرسية",
          due_date: date7,
          deliverable: "محضر فحص إداري معتمد موقع من الأطراف المعنية",
        },
        {
          title: "تنفيذ الإجراءات التربوية التصحيحية وإلغاء أي قرارات تعسفية أو رسوم زائدة",
          owner_role: "وكيل شؤون الطلاب والرقابة الإدارية",
          due_date: date14,
          deliverable: "قرار إداري تصحيحي ومذكرة تسوية مالية معتمدة",
        },
        {
          title: "المراجعة النهائية والتأكد من استقرار الطالب ورفع التقرير الختامي للمديرية",
          owner_role: "مدير المدرسة والمشرف العام",
          due_date: date21,
          deliverable: "تقرير إغلاق الحالة واستبيان رضا ولي الأمر النهائي",
        },
      ];
      statutoryBasis = "القرار الوزاري رقم 187 لسنة 2023 والقرار 420 لسنة 2014";
      break;
    }

    case "COMMERCIAL_COMPANIES": {
      officialStatement = `تؤكد شركة ${targetName} حرصها البالغ على رضا عملائها الكرام والتزامها الصارم بأحكام قانون حماية المستهلك رقم 181 لسنة 2018. نعتذر عن أي تجربة غير مرضية أو تأخير قد طرأ في الحالة رقم (${caseReference || "MRF-2026"})، وقد أصدرت الإدارة تعليماتها الفورية لفريق خدمة العملاء والرقابة المالية بفحص المعاملة ومعالجة المطلب بما يحفظ حق العميل كاملاً دون أي تأخير.`;
      milestones = [
        {
          title: "التواصل المباشر مع العميل وفحص فاتورة الشراء وتقييم القصور الفني",
          owner_role: "مدير خدمة العملاء والشكاوى",
          due_date: date7,
          deliverable: "تقرير فحص فني معتمد وتواصل موثق مع العميل",
        },
        {
          title: "إصدار إشعار رد القيمة المالية (أو تسليم البديل المطابق للمواصفات)",
          owner_role: "مسؤول الرقابة المالية والعمليات",
          due_date: date14,
          deliverable: "إيصال استرداد مصرفي أو محضر استلام منتج بديل",
        },
        {
          title: "مراجعة سلسلة الإمداد وجودة الخدمة لضمان عدم تكرار المشكلة وتحديث الإجراءات",
          owner_role: "مدير ضمان الجودة وسلسلة الإمداد",
          due_date: date21,
          deliverable: "تقرير مراجعة الجودة وتأكيد إغلاق الشكوى مع العميل",
        },
      ];
      statutoryBasis = "قانون حماية المستهلك المصري رقم 181 لسنة 2018";
      break;
    }

    case "HIGHER_EDUCATION": {
      officialStatement = `انطلاقاً من التزام إدارة ${targetName} بقواعد العدالة الأكاديمية والشفافية المنصوص عليها بقانون تنظيم الجامعات رقم 49 لسنة 1972، تم إحالة موضوع الحالة رقم (${caseReference || "MRF-2026"}) إلى لجنة الشؤون الأكاديمية والطلابية لفحص الواقعة ومراجعة السجلات الرسمية بدقة لضمان حصول الطالب على كافة حقوقه الأكاديمية.`;
      milestones = [
        {
          title: "مراجعة ملف الطالب الأكاديمي وسجلات الرصد أو تسجيل الساعات المعتمدة",
          owner_role: "مدير إدارة شؤون الطلاب والامتحانات",
          due_date: date7,
          deliverable: "تقرير تدقيق أكاديمي رسمي مشفوع بالسجلات الموثقة",
        },
        {
          title: "عرض الموضوع على لجنة الكلية المختصة وتصحيح الخطأ الإداري أو الأكاديمي",
          owner_role: "وكيل الكلية لشؤون التعليم والطلاب",
          due_date: date14,
          deliverable: "محضر اجتماع اللجنة وقرار اعتماد المعالجة",
        },
        {
          title: "إخطار الطالب كتابياً بالنتيجة وتحديث السجل الإلكتروني النهائي",
          owner_role: "أمين عام الكلية ومسؤول المنظومة الإلكترونية",
          due_date: date21,
          deliverable: "إخطار رسمي مسلّم للطالب وسجل إلكتروني محدث",
        },
      ];
      statutoryBasis = "قانون تنظيم الجامعات رقم 49 لسنة 1972 ولائحته التنفيذية";
      break;
    }

    case "HEALTHCARE_MEDICAL": {
      officialStatement = `تؤكد إدارة مستشفى ${targetName} التزامها الثابت بأعلى معايير الرعاية الصحية وسلامة المرضى الصادرة عن الهيئة العامة للاعتماد والرقابة الصحية (GAHAR). وفور تسجيل الحالة رقم (${caseReference || "MRF-2026"})، باشر قسم الجودة والرقابة الطبية مراجعة مسار الحالة الإداري والطبي لتقديم الرعاية والتوضيح المطلوب بما يضمن حق المريض التام.`;
      milestones = [
        {
          title: "مراجعة المسار السريري والإداري للحالة من واقع سجلات المستشفى والتمريض",
          owner_role: "مدير إدارة الجودة وسلامة المرضى",
          due_date: date7,
          deliverable: "تقرير تدقيق سريري وإداري داخلي",
        },
        {
          title: "مقابلة المريض أو ممثله القانوني وتقديم الفاتورة التفصيلية أو خطة الرعاية المصححة",
          owner_role: "المدير الطبي ومسؤول شؤون المرضى",
          due_date: date14,
          deliverable: "محضر جلسة إيضاحية وتقرير طبي وفاتورة تفصيلية",
        },
        {
          title: "متابعة الحالة الصحية واستيفاء مؤشرات الأداء الطبي المعتمدة من GAHAR",
          owner_role: "رئيس الهيئة الطبية والمدير التنفيذي",
          due_date: date21,
          deliverable: "تقرير إغلاق متكامل وتقييم رضا المريض الموثق",
        },
      ];
      statutoryBasis = "معايير GAHAR الوطنية ووثيقة حقوق المريض";
      break;
    }

    case "GOVERNMENT_PUBLIC":
    default: {
      officialStatement = `تؤكد إدارة ${targetName} التزامها التام بتقديم الخدمات للمواطنين وفق معايير الجودة والحوكمة المنصوص عليها في ميثاق الخدمة المدنية. تم فحص الشكوى المقيدة برقم (${caseReference || "MRF-2026"}) وإحالتها لمسؤول المنظومة المختصة لسرعة إنجاز المعاملة واستيفاء الخدمة المطلوبة.`;
      milestones = [
        {
          title: "تتبع رقم الطلب والمعاملة عبر المنظومة الحكومية وتحديد سبب التعطل",
          owner_role: "مسؤول إدارة خدمة المواطنين والتحول الرقمي",
          due_date: date7,
          deliverable: "بيان تتبع رسمي وتحديد الإجراء الناقص",
        },
        {
          title: "استيفاء توقيعات أو متطلبات المعاملة وطباعة المستند المطلوب إصداره",
          owner_role: "مدير مكتب الخدمة الحكومية المختص",
          due_date: date14,
          deliverable: "المستند الرسمي الصادر أو إشعار الاستلام الإلكتروني",
        },
        {
          title: "تسليم الخدمة للمواطن رسمياً وتحديث تقرير الأداء المرفوع للجهة الإشرافية",
          owner_role: "رئيس المصلحة / وكيل الإدارة الحكومية",
          due_date: date21,
          deliverable: "محضر تسليم الخدمة وإغلاق التذكرة بنجاح",
        },
      ];
      statutoryBasis = "قانون الخدمة المدنية رقم 81 لسنة 2016 وقواعد الحوكمة الحكومية";
      break;
    }
  }

  // Calculate live RQS score to verify score >= 90
  const planPayload: ActionPlanPayload = {
    officialStatement,
    milestones: milestones.map((m) => ({
      title: m.title,
      ownerRole: m.owner_role,
      dueDate: m.due_date,
      deliverable: m.deliverable,
    })),
  };

  const rqsResult = calculateRQS(planPayload);

  return {
    officialStatement,
    milestones,
    statutoryBasis,
    estimatedRqs: rqsResult.rqsScore,
  };
}

/**
 * Main Solution Advisor Service Handler
 */
export async function getSolutionAdvice(
  input: SolutionAdvisorInput
): Promise<SolutionAdvisorResponse> {
  const { mode, sector } = input;

  // 1. Check for NVIDIA NIM API Configuration (Prioritized for Solution Advisor)
  const nvidiaKey =
    process.env.NVIDIA_ADVISOR_API_KEY ||
    process.env.NVIDIA_API_KEY;

  if (nvidiaKey && !nvidiaKey.includes("your-advisor-key")) {
    try {
      const baseUrl = process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1";
      const model = process.env.NVIDIA_ADVISOR_MODEL || "meta/llama-3.2-11b-vision-instruct";

      const isCitizen = mode === "CITIZEN_OUTCOME";
      const systemPrompt = isCitizen
        ? `You are Murafiq Legal & Outcome Advisor for Egyptian citizens.
Analyze the user's issue in sector: ${sector}.
Generate a strictly JSON object with:
- outcomeSuggestion: Assertive, dignified, realistic, legally sound desired outcome in Arabic.
- statutoryGrounds: { lawName, articleNumber, issuingAuthority, summary }
- recommendedSteps: 3 actionable steps in Arabic.
- suggestedRemedyType: short Arabic title (e.g. استرداد مالي / تحقيق محايد).
Output pure JSON only, without any markdown formatting or commentary.`
        : `You are Murafiq Institutional Resolution Advisor for Egyptian organizations.
Generate an Action Plan that complies with Murafiq RQS (Response Quality Score >= 90).
Sector: ${sector}.
Generate a strictly JSON object with:
- officialStatement: formal institutional statement in Arabic acknowledging the case and promising corrective steps.
- milestones: array of 3 distinct milestones with { title, owner_role, due_date (YYYY-MM-DD), deliverable } in Arabic.
- statutoryBasis: Egyptian regulation reference in Arabic.
Output pure JSON only, without any markdown formatting or commentary.`;

      const userContent = JSON.stringify({
        sector: input.sector,
        category: input.category,
        subcategory: input.subcategory,
        entityName: input.entityName,
        caseReference: input.caseReference,
        description: input.description,
      });

      const res = await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${nvidiaKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          temperature: 0.2,
          max_tokens: 1500,
        }),
        signal: AbortSignal.timeout(15000),
      });

      if (res.ok) {
        const data = await res.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const jsonMatch = contentStr.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (isCitizen && parsed.outcomeSuggestion) {
              return {
                success: true,
                mode,
                sector,
                advice: parsed as CitizenOutcomeAdvice,
                sourceEngine: "NVIDIA_NIM_LLM",
              };
            } else if (!isCitizen && parsed.officialStatement && Array.isArray(parsed.milestones)) {
              const rqsScore = calculateRQS({
                officialStatement: parsed.officialStatement,
                milestones: parsed.milestones.map((m: any) => ({
                  title: m.title,
                  ownerRole: m.owner_role || m.ownerRole,
                  dueDate: m.due_date || m.dueDate,
                  deliverable: m.deliverable,
                })),
              }).rqsScore;

              return {
                success: true,
                mode,
                sector,
                advice: {
                  ...parsed,
                  estimatedRqs: rqsScore,
                } as InstitutionActionPlanAdvice,
                sourceEngine: "NVIDIA_NIM_LLM",
              };
            }
          }
        }
      }
    } catch (err) {
      console.warn("Solution Advisor NVIDIA call failed or timed out, using deterministic engine:", err);
    }
  }

  // 2. If OpenAI API key is configured, invoke LLM with structured output contract
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-openai")) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.MURAFIC_ADVISOR_MODEL || "gpt-4o";

      const isCitizen = mode === "CITIZEN_OUTCOME";
      const systemPrompt = isCitizen
        ? `You are Murafiq Legal & Outcome Advisor for Egyptian citizens.
Analyze the user's issue in sector: ${sector}.
Generate a strictly JSON object with:
- outcomeSuggestion: Assertive, dignified, realistic, legally sound desired outcome in Arabic.
- statutoryGrounds: { lawName, articleNumber, issuingAuthority, summary }
- recommendedSteps: 3 actionable steps in Arabic.
- suggestedRemedyType: short Arabic title (e.g. استرداد مالي / تحقيق محايد).
Output pure JSON only.`
        : `You are Murafiq Institutional Resolution Advisor for Egyptian organizations.
Generate an Action Plan that complies with Murafiq RQS (Response Quality Score >= 90).
Sector: ${sector}.
Generate a strictly JSON object with:
- officialStatement: formal institutional statement in Arabic acknowledging the case and promising corrective steps.
- milestones: array of 3 distinct milestones with { title, owner_role, due_date (YYYY-MM-DD), deliverable } in Arabic.
- statutoryBasis: Egyptian regulation reference in Arabic.
Output pure JSON only.`;

      const userContent = JSON.stringify({
        sector: input.sector,
        category: input.category,
        subcategory: input.subcategory,
        entityName: input.entityName,
        caseReference: input.caseReference,
        description: input.description,
      });

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const contentStr = data.choices?.[0]?.message?.content;
        if (contentStr) {
          const parsed = JSON.parse(contentStr);
          if (isCitizen && parsed.outcomeSuggestion) {
            return {
              success: true,
              mode,
              sector,
              advice: parsed as CitizenOutcomeAdvice,
              sourceEngine: "OPENAI_LLM",
            };
          } else if (!isCitizen && parsed.officialStatement && Array.isArray(parsed.milestones)) {
            const rqsScore = calculateRQS({
              officialStatement: parsed.officialStatement,
              milestones: parsed.milestones.map((m: any) => ({
                title: m.title,
                ownerRole: m.owner_role || m.ownerRole,
                dueDate: m.due_date || m.dueDate,
                deliverable: m.deliverable,
              })),
            }).rqsScore;

            return {
              success: true,
              mode,
              sector,
              advice: {
                ...parsed,
                estimatedRqs: rqsScore,
              } as InstitutionActionPlanAdvice,
              sourceEngine: "OPENAI_LLM",
            };
          }
        }
      }
    } catch (err) {
      console.warn("Solution Advisor OpenAI call failed, using deterministic engine:", err);
    }
  }

  // Deterministic statutory engine fallback
  const advice =
    mode === "CITIZEN_OUTCOME"
      ? generateDeterministicCitizenOutcome(input)
      : generateDeterministicActionPlan(input);

  return {
    success: true,
    mode,
    sector,
    advice,
    sourceEngine: "DETERMINISTIC_STATUTORY_ENGINE",
  };
}
