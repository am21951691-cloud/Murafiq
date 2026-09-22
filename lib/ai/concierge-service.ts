import { SectorType } from "@/types/database";
import { CURATED_STATUTORY_DECREES } from "./statutory-data";

export interface ConciergeMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ConciergeResponse {
  reply: string;
  suggestions: string[];
  sectorHint?: SectorType;
  directLink?: {
    href: string;
    label_ar: string;
    label_en: string;
  };
}

export const CONCIERGE_QUICK_SUGGESTIONS_AR = [
  "⏱ كيف تعمل مهلة الـ 7 أيام لحل الشكوى ودياً؟",
  "⚖️ ما هي حقوقي في استرجاع أموال سلعة أو اشتراك؟ (قانون 181)",
  "🔒 كيف يتم حماية رقمي القومي وسرية بياناتي؟",
  "🏥 ما هي حقوق المريض ومعايير الرقابة الصحية؟",
  "🎓 كيف أقدم تظلماً جامعياً أو شكوى دراسات عليا؟",
  "📝 أريد تقديم شكوى الآن، كيف أبدأ؟",
];

export const CONCIERGE_QUICK_SUGGESTIONS_EN = [
  "⏱ How does the 7-day private grace period work?",
  "⚖️ What are my refund rights under CPA Law 181/2018?",
  "🔒 How does Murafiq protect my National ID & personal data?",
  "🏥 What are patient rights under healthcare standards?",
  "🎓 How do I submit an academic university grievance?",
  "📝 I want to submit a case now, where do I start?",
];

/**
 * High-accuracy deterministic Egyptian civic knowledge engine
 * Used when OPENAI_API_KEY is not set or network fallback is triggered.
 */
export function getDeterministicConciergeReply(
  userQuery: string,
  locale: "ar" | "en" = "ar"
): ConciergeResponse {
  const q = userQuery.toLowerCase().trim();
  const isEn = locale === "en";

  // 1. Grace period / How it works
  if (
    q.includes("7") ||
    q.includes("مهله") ||
    q.includes("مهلة") ||
    q.includes("كيف تعمل") ||
    q.includes("طريقة العمل") ||
    q.includes("grace") ||
    q.includes("how it works") ||
    q.includes("خطوات")
  ) {
    return {
      reply: isEn
        ? "Murafiq provides a **7-day private grace window** (`PRIVATE_GRACE`). During these 7 days, your case is delivered directly to the authorized decision-makers of the institution (school, hospital, university, company, or government agency) in complete privacy. They must acknowledge the case and submit a structured Action Plan. The case is never published publicly during grace, protecting both parties and encouraging constructive resolution."
        : "تعتمد منصة مُرافِق على **مهلة مراجعة خاصة مدتها 7 أيام** (`PRIVATE_GRACE`). خلال هذه المهلة، تُرسل شكواك بسرية تامة ومباشرة للإدارة المعنية بالجهة (مدرسة، جامعة، مستشفى، شركة، أو جهة حكومية). تلتزم الجهة بتقديم خطة عمل رسمية لمعالجة المشكلة، ولا يُنشر أي محتوى علناً طالما أن الجهة تتعامل بجدية، مما يضمن حل النزاع ودياً وبشكل محترف.",
      suggestions: [
        isEn ? "How is my privacy protected?" : "كيف يتم حماية سرية بياناتي؟",
        isEn ? "What if the 7 days expire without action?" : "ماذا يحدث إذا انتهت الـ 7 أيام دون رد؟",
        isEn ? "Start a case now" : "ابدأ تقديم شكوى الآن",
      ],
      directLink: {
        href: "/cases/new",
        label_ar: "تقديم شكوى وبدء مهلة الـ 7 أيام ←",
        label_en: "Submit Case & Start Grace Window →",
      },
    };
  }

  // 2. Privacy & National ID / Law 151
  if (
    q.includes("رقم قومي") ||
    q.includes("قومي") ||
    q.includes("بيانات") ||
    q.includes("سريه") ||
    q.includes("سرية") ||
    q.includes("خصوصيه") ||
    q.includes("خصوصية") ||
    q.includes("privacy") ||
    q.includes("national id") ||
    q.includes("pii") ||
    q.includes("151")
  ) {
    return {
      reply: isEn
        ? "Murafiq complies strictly with **Egyptian Data Protection Law No. 151 of 2020**. Full 14-digit National IDs are **strictly blocked and rejected** at intake to safeguard citizens. Sensitive references (such as Medical Record Numbers or Student Codes) are physically isolated and encrypted via AES-256-GCM in an inaccessible vault. Public profiles display only non-reversible masked tokens (e.g., `MRN-***-482`)."
        : "تلتزم منصة مُرافِق بأعلى معايير **قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020**:\n1. يُحظر إدخال الرقم القومي المكون من 14 رقماً ويتم حجبه فوراً منعاً لأي تسريب.\n2. يتم تشفير الأرقام الحساسة (مثل رقم الملف الطبي أو كود الطالب) في جدول معزول ماديًا بتشفير عسكري (AES-256-GCM).\n3. لا يظهر للعامة سوى رمز محجوب (Masked Token) مثل `MRN-***-841` لحماية هويتك تماماً.",
      suggestions: [
        isEn ? "Learn about consumer rights (Law 181)" : "ما هي حقوق المستهلك (قانون 181)؟",
        isEn ? "How does hospital privacy work?" : "كيف تُحفظ خصوصية المرضى بالمستشفيات؟",
      ],
    };
  }

  // 3. Consumer Protection / Law 181 / Refund
  if (
    q.includes("استرجاع") ||
    q.includes("مستهلك") ||
    q.includes("اموال") ||
    q.includes("أموال") ||
    q.includes("شراء") ||
    q.includes("فاتوره") ||
    q.includes("فاتورة") ||
    q.includes("اشتراك") ||
    q.includes("181") ||
    q.includes("refund") ||
    q.includes("consumer") ||
    q.includes("cpa")
  ) {
    return {
      reply: isEn
        ? "Under **Egyptian Consumer Protection Law No. 181 of 2018 (Article 17 & 21)**:\n1. Consumers have the right to exchange or return defective goods or recover fees for unrendered services within **14 days** (or 30 days for major defects) without extra charge.\n2. Commercial providers must provide itemized receipts and comply with certified warranty terms.\nThrough Murafiq, you can lodge a case under the **Commercial Companies** sector to claim an official refund or replacement."
        : "وفقاً لـ **قانون حماية المستهلك المصري رقم 181 لسنة 2018 (المادتين 17 و21)**:\n1. يحق للمستهلك استبدال السلعة أو استرداد قيمتها النقدية إذا شابها عيب أو لم تؤدَّ الخدمة المتعاقد عليها خلال **14 يوماً** (أو 30 يوماً للعيوب الجسيمة).\n2. يُلزم القانون الشركات برد مقابل الخدمات غير المؤداة دون أي أعباء إضافية.\nيمكنك عبر مُرافِق اختيار **قطاع الشركات والخدمات التجارية** للمطالبة بحقك ودياً ومتابعة خطة التنفيذ.",
      sectorHint: "COMMERCIAL_COMPANIES",
      suggestions: [
        isEn ? "File a commercial complaint" : "تقديم شكوى ضد شركة تجارية",
        isEn ? "What documents are required?" : "ما هي المستندات المطلوبة للإثبات؟",
      ],
      directLink: {
        href: "/cases/new?sector=COMMERCIAL_COMPANIES",
        label_ar: "تقديم شكوى في قطاع الشركات ←",
        label_en: "Submit Commercial Case →",
      },
    };
  }

  // 4. Schools / Education / Decree 187 & 420
  if (
    q.includes("مدرسه") ||
    q.includes("مدرسة") ||
    q.includes("طالب") ||
    q.includes("مصروفات") ||
    q.includes("ضرب") ||
    q.includes("تنمر") ||
    q.includes("عقاب") ||
    q.includes("باص") ||
    q.includes("حافله") ||
    q.includes("187") ||
    q.includes("420") ||
    q.includes("school") ||
    q.includes("tuition")
  ) {
    return {
      reply: isEn
        ? "Under **Ministerial Decree 187/2023** (Student Discipline Code), corporal and psychological punishment, verbal humiliation, or arbitrary expulsion are strictly forbidden in all Egyptian schools. For private school tuition and fee increases, **Decree 420/2014** mandates strict compliance with Ministry-approved brackets. You can lodge an educational case with your school's administration under complete confidentiality."
        : "وفقاً لـ **القرار الوزاري رقم 187 لسنة 2023** (لائحة الانضباط المدرسي):\n1. يُحظر حظرًا قاطعاً العقاب البدني بكافة صوره، وكذلك الإيذاء اللفظي والتنمر والطرد التعسفي.\n2. وفقاً لـ **القرار 420 لسنة 2014**، تلتزم المدارس الخاصة بالشرائح المعتمدة للمصروفات، ويُحظر فرض زي مدرسي من منافذ احتكارية حصرية.\nيمكنك تقديم شكوى فورية لإدارة المدرسة عبر مُرافِق لبحثها داخل لجنة الحماية المدرسية.",
      sectorHint: "EDUCATION_SCHOOLS",
      suggestions: [
        isEn ? "Submit school case" : "تقديم شكوى لإدارة المدرسة",
        isEn ? "What if the school ignores my request?" : "كيف يتم احتساب مؤشر BARS للمدارس؟",
      ],
      directLink: {
        href: "/cases/new?sector=EDUCATION_SCHOOLS",
        label_ar: "تقديم شكوى لقطاع المدارس ←",
        label_en: "Submit School Case →",
      },
    };
  }

  // 5. Universities / Higher Education / Law 49
  if (
    q.includes("جامعه") ||
    q.includes("جامعة") ||
    q.includes("كليه") ||
    q.includes("كلية") ||
    q.includes("عميد") ||
    q.includes("ساعات معتمده") ||
    q.includes("ساعات معتمدة") ||
    q.includes("قيد") ||
    q.includes("دراسات عليا") ||
    q.includes("university") ||
    q.includes("faculty")
  ) {
    return {
      reply: isEn
        ? "Under **Universities Organization Law No. 49 of 1972**, university students and researchers are entitled to transparent credit-hour registration, fair examination grading, due process in academic appeals, and hygienic campus housing. Murafiq routes university grievances to the appropriate Faculty Vice-Dean or Student Affairs administration."
        : "وفقاً لـ **قانون تنظيم الجامعات رقم 49 لسنة 1972**:\nيحق للطلاب والباحثين التظلم من نتائج الامتحانات، والمطالبة بالشفافية في تسجيل الساعات المعتمدة، وجودة الإقامة بالمدن الجامعية. تتيح لك منصة مُرافِق إرسال طلبك لإدارة الكلية أو شؤون الطلاب عبر القنوات الرسمية المحايدة.",
      sectorHint: "HIGHER_EDUCATION",
      suggestions: [
        isEn ? "Submit university grievance" : "تقديم تظلم جامعي عبر المنصة",
        isEn ? "View university directory" : "استعراض دليل الجامعات المعتمدة",
      ],
      directLink: {
        href: "/cases/new?sector=HIGHER_EDUCATION",
        label_ar: "تقديم تظلم جامعي ←",
        label_en: "Submit University Grievance →",
      },
    };
  }

  // 6. Healthcare / Hospitals / GAHAR
  if (
    q.includes("مستشفى") ||
    q.includes("مستشفيات") ||
    q.includes("مريض") ||
    q.includes("مرضى") ||
    q.includes("صحه") ||
    q.includes("صحة") ||
    q.includes("طبيب") ||
    q.includes("علاج") ||
    q.includes("تامين صحي") ||
    q.includes("تأمين صحي") ||
    q.includes("طوارئ") ||
    q.includes("اعتماد") ||
    q.includes("hospital") ||
    q.includes("medical") ||
    q.includes("patient") ||
    q.includes("gahar")
  ) {
    return {
      reply: isEn
        ? "Under the **Egyptian Patient Rights Charter** and **GAHAR National Accreditation Standards**:\n1. Every patient has the right to emergency medical stabilization without delay, complete medical record confidentiality, and itemized billing.\n2. Medical Record Numbers (MRN) are safeguarded under highest privacy tier on Murafiq. You can submit complaints regarding wait times, billing, or care quality to hospital management."
        : "وفقاً لـ **وثيقة حقوق المريض** ومعايير الهيئة العامة للاعتماد والرقابة الصحية (**GAHAR**):\n1. يحق لكل مريض الحصول على الرعاية الطارئة الفورية، والاطلاع على فاتورة علاجية مفصلة، والتحقيق في أي تقصير إداري أو طبي.\n2. يتم عزل وتشفير أرقام الملفات الطبية (MRN) لحماية خصوصيتك الصحية.\nيمكنك عبر مُرافِق إيصال ملاحظاتك لإدارة الجودة بالمستشفى لإنهاء النزاع ودياً.",
      sectorHint: "HEALTHCARE_MEDICAL",
      suggestions: [
        isEn ? "Submit healthcare case" : "تقديم شكوى منشأة صحية",
        isEn ? "How is my medical data kept safe?" : "كيف يتم تأمين السجلات الطبية؟",
      ],
      directLink: {
        href: "/cases/new?sector=HEALTHCARE_MEDICAL",
        label_ar: "تقديم شكوى لقطاع المستشفيات ←",
        label_en: "Submit Healthcare Case →",
      },
    };
  }

  // 7. Government services
  if (
    q.includes("حكوم") ||
    q.includes("وزاره") ||
    q.includes("وزارة") ||
    q.includes("سجل مدني") ||
    q.includes("مرور") ||
    q.includes("شهر عقاري") ||
    q.includes("مصر الرقميه") ||
    q.includes("مصر الرقمية") ||
    q.includes("government") ||
    q.includes("public service")
  ) {
    return {
      reply: isEn
        ? "Murafiq's **Government & Public Services** sector assists citizens in documenting service delays, portal payment deduction glitches (e.g. Digital Egypt), and counter service issues. Remember: Do **NOT** provide your 14-digit National ID; only provide your application reference number (رقم الطلب / المعاملة)."
        : "يتيح لك **قطاع الخدمات الحكومية والهيئات** في مُرافِق توثيق تأخر إصدار المعاملات الحكومية، أو مشكلات سداد الرسوم عبر البوابات الرقمية، أو غياب الموظف المختص. تذكر: **لا تكتب رقمك القومي**، واكتفِ برقم إيصال الطلب أو المعاملة (رقم الطلب) لحماية هويتك.",
      sectorHint: "GOVERNMENT_PUBLIC",
      suggestions: [
        isEn ? "Submit government service case" : "تسجيل شكوى معاملة حكومية",
        isEn ? "Why is National ID prohibited?" : "لماذا يُحظر الرقم القومي؟",
      ],
      directLink: {
        href: "/cases/new?sector=GOVERNMENT_PUBLIC",
        label_ar: "تقديم شكوى معاملة حكومية ←",
        label_en: "Submit Government Service Case →",
      },
    };
  }

  // 8. General / Fallback Welcome
  return {
    reply: isEn
      ? "Welcome to **Murafiq (مُرافِق)** — Egypt's neutral, accountable resolution platform across Schools, Universities, Government Services, Commercial Companies, and Healthcare.\n\nI can help you:\n• Learn how our **7-day private resolution window** works.\n• Understand your statutory rights under Egyptian laws (CPA 181/2018, Decree 187/2023, Law 151/2020).\n• Select the right sector and file a constructive, secure case."
      : "أهلاً بك في **مُرافِق** — المنصة الوطنية المحايدة لتسوية الشكاوى والمساءلة المؤسسية عبر 5 قطاعات رئيسية (المدارس، الجامعات، الخدمات الحكومية، الشركات التجارية، والمستشفيات).\n\nأنا مساعدك الذكي، ويمكنني إرشادك في:\n1. فهم **مهلة الـ 7 أيام للمراجعة الخاصة** وكيف تحميك.\n2. معرفة حقوقك طبقاً للقوانين واللوائح المصرية المعتمدة.\n3. اختيار القطاع المناسب وصياغة شكواك بمهنية ودقة.",
    suggestions: isEn ? CONCIERGE_QUICK_SUGGESTIONS_EN.slice(0, 4) : CONCIERGE_QUICK_SUGGESTIONS_AR.slice(0, 4),
    directLink: {
      href: "/cases/new",
      label_ar: "تقديم شكوى جديدة الآن ←",
      label_en: "Submit New Case Now →",
    },
  };
}

/**
 * Main Concierge Service Handler.
 * Calls OpenAI if OPENAI_API_KEY is configured, or seamlessly falls back to
 * the high-accuracy deterministic engine.
 */
export async function askConcierge(
  messages: ConciergeMessage[],
  locale: "ar" | "en" = "ar"
): Promise<ConciergeResponse> {
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

  // If OpenAI API Key is present, attempt LLM generation with strict system grounding
  if (process.env.OPENAI_API_KEY && !process.env.OPENAI_API_KEY.includes("your-openai")) {
    try {
      const apiKey = process.env.OPENAI_API_KEY;
      const model = process.env.MURAFIC_CONCIERGE_MODEL || "gpt-4o-mini";

      const systemPrompt = `You are Murafiq Concierge (مُساعد مُرافِق الذكي), an expert Egyptian civic resolution advisor.
Murafiq is Egypt's neutral resolution platform covering 5 sectors:
1. EDUCATION_SCHOOLS (Decree 187/2023 bans corporal punishment/abuse; Decree 420/2014 regulates tuition & uniforms).
2. HIGHER_EDUCATION (Law 49/1972 on Universities Organization).
3. GOVERNMENT_PUBLIC (Services, documentation, no National IDs).
4. COMMERCIAL_COMPANIES (CPA Law 181/2018 grants 14-day refund/warranty rights).
5. HEALTHCARE_MEDICAL (GAHAR accreditation, Patient Rights Charter).

Core Mechanics:
- 7-day private grace window (PRIVATE_GRACE): Case is shared only with the institution to create a professional action plan before any escalation or public score impact.
- Privacy: Law 151/2020. 14-digit National IDs are STRICTLY PROHIBITED. Sensitive IDs are AES-256 encrypted.
- Tone: Extremely polite, objective, helpful, reassuring, fluent Egyptian civic Arabic (or English if queried in English).
Keep answers concise (2-4 paragraphs max). Offer practical next steps.`;

      const formattedMessages = [
        { role: "system", content: systemPrompt },
        ...messages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
      ];

      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: formattedMessages,
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          const deterministic = getDeterministicConciergeReply(lastUserMsg, locale);
          return {
            reply,
            suggestions: deterministic.suggestions,
            sectorHint: deterministic.sectorHint,
            directLink: deterministic.directLink,
          };
        }
      }
    } catch (err) {
      console.warn("Concierge OpenAI call failed, using deterministic engine:", err);
    }
  }

  // Deterministic knowledge fallback
  return getDeterministicConciergeReply(lastUserMsg, locale);
}
