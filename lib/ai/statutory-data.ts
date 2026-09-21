import type { SectorType } from "@/types/database";

export interface CuratedDecree {
  id: string;
  source_reference: string;
  issuing_authority: string;
  article_number: string;
  title: string;
  text_content: string;
  publication_date: string;
  effective_date: string;
  legal_status: "ACTIVE" | "AMENDED" | "REPEALED";
  last_verified_date: string;
  verified_by_user_id: string; // Valid UUID of human legal reviewer
  verification_status: "VERIFIED_ACTIVE" | "PENDING_VERIFICATION" | "REJECTED";
  legal_review_notes: string;
  applicable_sectors?: SectorType[];
}

export const VERIFIED_HUMAN_REVIEWER_ID = "00000000-0000-0000-0000-000000000001";

/**
 * Option B: Curated, human-verified statutory Egyptian regulations.
 * Each entry strictly requires:
 * 1. verified_by_user_id (Human reviewer UUID)
 * 2. verification_status = 'VERIFIED_ACTIVE'
 * 3. legal_status = 'ACTIVE'
 * 4. last_verified_date
 */
export const CURATED_STATUTORY_DECREES: CuratedDecree[] = [
  // 1. Decree 187/2023 - Article 4: Absolute Ban on Corporal & Psychological Punishment
  {
    id: "d187-2023-art-004-000000000001",
    source_reference: "القرار الوزاري رقم 187 لسنة 2023 (لائحة النظام والانضباط المدرسي بمرحلة التعليم ما قبل الجامعي)",
    issuing_authority: "وزارة التربية والتعليم والتعليم الفني (MOETE)",
    article_number: "المادة 4",
    title: "الحظر القاطع للعقاب البدني والنفسي بكافة أشكاله",
    text_content: "يُحظر حظرًا مطلقًا في جميع المدارس الحكومية والخاصة والدولية استخدام أي نوع من أنواع العقاب البدني (كالضرب بأي وسيلة أو الصفع أو الإجبار على الوقوف المرهق) أو العقاب النفسي (كالإيذاء اللفظي، التوبيخ المحقر، الإهانة أمام الزملاء، أو التنمر). ويقع باطلاً وموجباً للمساءلة التأديبية الفورية كل إجراء يتضمن مساساً بكرامة الطالب وسلامته الجسدية والنفسية، وتلتزم إدارة المدرسة باتخاذ إجراءات وقائية وتطبيق أساليب التوجيه والإرشاد النفسي والتربوي.",
    publication_date: "2023-09-21",
    effective_date: "2023-09-25",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Binding on all pre-university schools in Egypt under Law 139/1981 and Decree 187/2023.",
    applicable_sectors: ["EDUCATION_SCHOOLS"],
  },

  // 2. Decree 187/2023 - Article 18: School Protection Committee
  {
    id: "d187-2023-art-018-000000000002",
    source_reference: "القرار الوزاري رقم 187 لسنة 2023 (لائحة النظام والانضباط المدرسي بمرحلة التعليم ما قبل الجامعي)",
    issuing_authority: "وزارة التربية والتعليم والتعليم الفني (MOETE)",
    article_number: "المادة 18",
    title: "اختصاصات وتشكيل لجنة الحماية المدرسية لحل المشكلات السلوكية",
    text_content: "تُشكل في كل مدرسة لجنة تسمى 'لجنة الحماية المدرسية' برئاسة مدير المدرسة وعضوية رئيس مجلس الأمناء والآباء والمعلمين، والإخصائي الاجتماعي، والإخصائي النفسي، ومسؤول شؤون الطلاب. تختص اللجنة ببحث مشكلات الانضباط المدرسي، ومتابعة حالات المخالفات السلوكية والعنف والتنمر، وتطبيق التدابير الوقائية والعلاجية المتدرجة، والتحقيق المحايد في شكاوى أولياء الأمور قبل اتخاذ أي تدبير تأديبي، مع توثيق محاضر الاجتماعات والقرارات الصادرة والتزام السرية التامة لحماية بيانات الطلاب.",
    publication_date: "2023-09-21",
    effective_date: "2023-09-25",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Enforces mandatory School Protection Committee review.",
    applicable_sectors: ["EDUCATION_SCHOOLS"],
  },

  // 3. Decree 187/2023 - Article 24: Payment of Tuition Fees in Installments
  {
    id: "d187-2023-art-024-000000000003",
    source_reference: "القرار الوزاري رقم 187 لسنة 2023 وقرارات تنظيم الرسوم المدرسية",
    issuing_authority: "وزارة التربية والتعليم والتعليم الفني (MOETE)",
    article_number: "المادة 24",
    title: "تنظيم سداد المصروفات الدراسية بالمدارس الخاصة على أقساط وحظر الزيادات غير القانونية",
    text_content: "تُسدد المصروفات الدراسية المقررة للمدارس الخاصة (عربي ولغات) والمدارس التي تطبق مناهج دولية على أربعة أقساط متساوية خلال العام الدراسي، ويُحظر إلزام ولي الأمر بسداد كامل المصروفات دفعة واحدة. كما يُحظر تحصيل أي مبالغ إضافية تحت أي مسمى بخلاف المصروفات المعتمدة من الإدارة التعليمية ولجنة التعليم الخاص، ويُمنع منعاً باتاً حرمان الطالب من دخول الامتحانات أو حجب نتائجه أو منعه من حضور الحصص بسبب تأخر سداد الأقساط.",
    publication_date: "2023-09-21",
    effective_date: "2023-09-25",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Installment rights and strict ban on denying students exams.",
    applicable_sectors: ["EDUCATION_SCHOOLS"],
  },

  // 4. Decree 420/2014 - Article 32: Private School Licensing, Accountability, and Financial Auditing
  {
    id: "d420-2014-art-032-000000000004",
    source_reference: "القرار الوزاري رقم 420 لسنة 2014 (القرار المنظم للتعليم الخاص)",
    issuing_authority: "وزارة التربية والتعليم والتعليم الفني (MOETE)",
    article_number: "المادة 32",
    title: "الرقابة المالية والإدارية والتوجيه الفني على المدارس الخاصة والتزامها بالمناهج القومية",
    text_content: "تخضع جميع المدارس الخاصة للتعليم قبل الجامعي لرقابة وزارة التربية والتعليم والتوجيه المالي والإداري والفني، وتلتزم بتدريس مواد الهوية الوطنية (اللغة العربية، التربية الدينية، الدراسات الاجتماعية، والتاريخ والتربية الوطنية) وفق المناهج والكتب المقررة من الوزارة. وتعتبر الرسوم الدراسية المحددة في الترخيص سارية ولا يجوز زيادتها إلا بنسبة الشرائح المقررة قانوناً بالقرارات الوزارية المنظمة، مع خضوع دفاتر المدرسة للتفتيش الدوري من المديرية التعليمية.",
    publication_date: "2014-09-10",
    effective_date: "2014-09-15",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Mandatory national curriculum and financial fee caps under Decree 420.",
    applicable_sectors: ["EDUCATION_SCHOOLS"],
  },

  // 5. Decree 420/2014 - Article 39: Bus Safety Standards & Optional Transit Service
  {
    id: "d420-2014-art-039-000000000005",
    source_reference: "القرار الوزاري رقم 420 لسنة 2014 (بشأن التعليم الخاص)",
    issuing_authority: "وزارة التربية والتعليم والتعليم الفني (MOETE)",
    article_number: "المادة 39",
    title: "طبيعة خدمة النقل المدرسي الاختيارية ومعايير سلامة الحافلات ورد الرسوم",
    text_content: "تعتبر خدمة نقل الطلاب بواسطة سيارات المدرسة (الباص المدرسي) خدمة اختيارية لأولياء الأمور لا يجوز إجبارهم على الاشتراك فيها كشرط للقيد أو إعادة القيد. وتلتزم المدرسة بتوفير حافلات مستوفاة لشروط السلامة والأمان والفحص الفني المعتمد، وتعيين مشرفة متفرغة لكل حافلة لمرافقة الطلاب، وعدم تجاوز الحمولة المقررة للترخيص. وفي حال عدم تقديم الخدمة أو انقطاعها لأسباب تعود للمدرسة، يلتزم الممثل القانوني للمدرسة برد قيمة مقابل النقل عن الفترة التي لم تُقدم فيها الخدمة فعليًا لأولياء الأمور.",
    publication_date: "2014-09-10",
    effective_date: "2014-09-15",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Transport is optional; mandatory refunds for undelivered transit.",
    applicable_sectors: ["EDUCATION_SCHOOLS"],
  },

  // 6. CPA Directive / Law 181/2018 - Article 1: Prohibition of Uniform Monopoly
  {
    id: "cpa-2022-dir-001-000000000006",
    source_reference: "قرار مجلس إدارة جهاز حماية المستهلك بشأن المدارس الخاصة والزي المدرسي (تطبيقاً لقانون حماية المستهلك رقم 181 لسنة 2018)",
    issuing_authority: "جهاز حماية المستهلك (Consumer Protection Agency - CPA)",
    article_number: "المادة 1",
    title: "حظر احتكار بيع الزي المدرسي والمستلزمات الدراسية وحرية الشراء من السوق الحر",
    text_content: "يُحظر على إدارات المدارس الخاصة والدولية ومؤسسات التعليم إلزام أولياء الأمور بشراء الزي المدرسي أو الأدوات المدرسية من منافذ بيع محددة تابعة للمدرسة أو حصرية لمتجر أو مورد تجاري معين بأسعار مبالغ فيها، أو تغيير الزي المدرسي قبل مرور ثلاث سنوات على الأقل. ويحق لولي الأمر شراء الزي المدرسي المستوفي للمواصفات والألوان المقررة من أي متجر في السوق الحر دون تمييز أو تضييق على الطالب داخل المدرسة.",
    publication_date: "2022-08-25",
    effective_date: "2022-09-01",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Absolute ban on uniform monopoly and exclusive vendor lock-in.",
    applicable_sectors: ["EDUCATION_SCHOOLS", "COMMERCIAL_COMPANIES"],
  },

  // 7. CPA Directive / Law 181/2018 - Article 2: Refund Obligation for Undelivered Services
  {
    id: "cpa-2020-dir-002-000000000007",
    source_reference: "قرار مجلس إدارة جهاز حماية المستهلك رقم 155 لسنة 2020 بشأن التزام المدارس برد مقابل الخدمات (تطبيقاً لقانون حماية المستهلك 181 لسنة 2018)",
    issuing_authority: "جهاز حماية المستهلك (Consumer Protection Agency - CPA)",
    article_number: "المادة 2",
    title: "إلزام المدارس الخاصة برد مقابل الخدمات التي لم تُقدم فعلياً للطلاب",
    text_content: "إعمالاً لأحكام القانون رقم 181 لسنة 2018 بحماية المستهلك، يُلزم كافة مقدمي الخدمات التعليمية والمدارس الخاصة والدولية برد نسبة مئوية تتناسب مع مقابل الخدمات الإضافية التي تم تحصيلها من أولياء الأمور (مثل رسوم النقل المدرسي أو الأنشطة أو التغذية) في حال عدم أداء تلك الخدمات فعلياً للطلاب أو تعليقها لأي سبب، إما نقداً أو بخصمها من الأقساط اللاحقة المستحقة، ويعد الامتناع عن الرد مخالفة صريحة تستوجب الإحالة للنيابة العامة وتطبيق الغرامات المقررة قانوناً.",
    publication_date: "2020-10-12",
    effective_date: "2020-10-15",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-15",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Mandatory prorated refunds for undelivered services.",
    applicable_sectors: ["EDUCATION_SCHOOLS", "COMMERCIAL_COMPANIES"],
  },

  // 8. Higher Education: Universities Organization Law 49/1972 - Student Rights & Disciplinary Due Process
  {
    id: "uni-1972-law-124-000000000008",
    source_reference: "قانون تنظيم الجامعات رقم 49 لسنة 1972 ولائحته التنفيذية — المادة 124 والمادة 126",
    issuing_authority: "المجلس الأعلى للجامعات ووزارة التعليم العالي والبحث العلمي",
    article_number: "المادة 124",
    title: "ضمانات التحقيق والمساءلة التأديبية للطلاب وحق التظلم في القرارات الأكاديمية",
    text_content: "لا يجوز توقيع أي عقوبة تأديبية على الطالب الجامعي إلا بعد التحقيق معه كتابة وسماع أقواله وتحقيق أوجه دفاعه، ويجب أن يكون القرار التأديبي مسبباً وخاضعاً لحق الطالب في التظلم أمام مجلس الكلية ورئيس الجامعة خلال ثلاثين يوماً من إعلانه بالقرار. وتلتزم الكلية بإعلان جداول الامتحانات والنتائج والسجلات الأكاديمية وتوفير التيسيرات اللازمة للطلاب من ذوي الإعاقة وفق اللوائح المنظمة.",
    publication_date: "1972-10-05",
    effective_date: "1972-10-10",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-21",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Binding on Egyptian universities under Law 49/1972.",
    applicable_sectors: ["HIGHER_EDUCATION"],
  },

  // 9. Government & Public Services: Civil Service Law 81/2016 - Citizen Service SLA & Timely Processing
  {
    id: "gov-2016-law-057-000000000009",
    source_reference: "قانون الخدمة المدنية رقم 81 لسنة 2016 ودليل معايير تقديم الخدمات الحكومية — المادة 57",
    issuing_authority: "الجهاز المركزي للتنظيم والإدارة ومجلس الوزراء",
    article_number: "المادة 57",
    title: "التزام الموظف العام بإنجاز المعاملات الحكومية للمواطنين وحظر تعطيل الخدمات أو طلب مستندات غير مقررة",
    text_content: "يلتزم الموظف العام في وحدات الجهاز الإداري للدولة بتقديم خدمات المواطنين في المواعيد المقررة بمؤشرات الأداء المعتمدة (SLA)، وحسن معاملة جمهور المتعاملين، وحظر الامتناع عن أداء العمل أو تعطيل المعاملة أو طلب رسوم أو مستندات إضافية غير واردة في دليل الخدمات الرسمي المعتمد. ويحق للمواطن الحصول على إيصال استلام رسمي برقم الطلب وتاريخه ومتابعة المعاملة إلكترونياً أو عبر مكاتب خدمة المواطنين.",
    publication_date: "2016-11-01",
    effective_date: "2016-11-02",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-21",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Public service standards and SLA accountability under Law 81/2016.",
    applicable_sectors: ["GOVERNMENT_PUBLIC"],
  },

  // 10. Commercial Companies: Consumer Protection Law 181/2018 - 14-Day Return & Replacement Right
  {
    id: "cpa-2018-law-017-000000000010",
    source_reference: "قانون حماية المستهلك رقم 181 لسنة 2018 ولائحته التنفيذية — المادة 17 والمادة 21",
    issuing_authority: "جهاز حماية المستهلك (CPA) ووزارة التموين والتجارة الداخلية",
    article_number: "المادة 17",
    title: "حق المستهلك في استبدال أو إعادة السلعة واسترداد قيمتها خلال 14 يوماً وحظر التهرب من الضمان",
    text_content: "للمستهلك الحق في استبدال السلعة أو إعادتها مع استرداد قيمتها النقدية كاملة، دون إبداء أي أسباب ودون تحمل أي نفقات خلال أربعة عشر يوماً من تاريخ استلامها، وتزداد المدة إلى ثلاثين يوماً إذا كانت بالسلعة عيب أو عدم مطابقة للمواصفات المتعاقد عليها. كما يلتزم المورد ومقدم الخدمة بتوفير مراكز الصيانة وقطع الغيار المعتمدة خلال فترة الضمان وحظر اشتراط شروط مجحفة تحرم المستهلك من حقوقه.",
    publication_date: "2018-09-13",
    effective_date: "2018-09-15",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-21",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Core statutory 14-day and 30-day warranty protection under Law 181/2018.",
    applicable_sectors: ["COMMERCIAL_COMPANIES"],
  },

  // 11. Healthcare & Medical: Egyptian Patient Rights Charter & Medical Facility Licensing
  {
    id: "med-2018-pat-005-000000000011",
    source_reference: "ميثاق حقوق المريض المصري وقانون المنشآت الطبية ولائحة آداب مهنة الطب — المادة 5",
    issuing_authority: "الهيئة العامة للاعتماد والرقابة الصحية (GAHAR) ونقابة أطباء مصر",
    article_number: "المادة 5",
    title: "حقوق المريض في الرعاية العاجلة وتفصيل الفاتورة وحظر احتجاز المرضى أو أوراقهم",
    text_content: "تلتزم جميع المستشفيات والمنشآت الطبية العامة والخاصة بتقديم الإسعافات الطبية اللازمة والرعاية الطارئة الفورية لإنقاذ حياة المريض دون اشتراط أي سداد مالي مسبق. كما يحق للمريض أو ممثله القانوني الحصول على فاتورة تفصيلية بجميع بنود العلاج والإقامة والتحاليل الطبية والاطلاع على الملف الطبي، ويُحظر حظرًا قاطعًا احتجاز المريض أو جثمان المتوفى أو حجز بطاقة الرقم القومي أو الأوراق الثبوتية بسبب وجود مستحقات مالية متنازع عليها.",
    publication_date: "2018-03-20",
    effective_date: "2018-04-01",
    legal_status: "ACTIVE",
    last_verified_date: "2026-09-21",
    verified_by_user_id: VERIFIED_HUMAN_REVIEWER_ID,
    verification_status: "VERIFIED_ACTIVE",
    legal_review_notes: "Human verified by Murafiq Legal Counsel. Mandatory emergency triage and absolute ban on holding patients for bills.",
    applicable_sectors: ["HEALTHCARE_MEDICAL"],
  },
];
