# منصة مُرافِق (Murafiq)
### المنظومة الوطنية للوساطة والتسوية المؤسسية في مصر
**National Resolution, Mediation & Institutional Accountability Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Tests](https://img.shields.io/badge/Tests-152%20Passed%20(24%20Suites)-emerald?style=flat&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-slate?style=flat)](#)

---

## 📖 نبذة عن المشروع (Overview)

**مُرافِق (Murafiq)** هي منظومة وطنية محايدة وموثقة للتسوية الودية والمساءلة المؤسسية في جمهورية مصر العربية. تهدف المنظومة إلى توفير إطار حوكمة رقمي وسيط بين المواطنين/المستفيدين وبين المؤسسات والجهات عبر **5 قطاعات وطنية**، مع تمكين مهلة تسوية خاصة مدتها 7 أيام، ومؤشرات تسوية بايـزية علمية تمنع الانحياز، ونظام ذكاء اصطناعي مزدوج ومستقل لصياغة المطالب القانونية وإعداد خطط المعالجة.

---

## 🏛️ القطاعات الوطنية المشمولة (The 5 National Sectors)

1. **المدارس والتعليم قبل الجامعي (`EDUCATION_SCHOOLS`):**
   * المدارس الحكومية، الرسمية لغات، الخاصة، والدولية (IGCSE, American, IB).
   * الاستناد إلى **القرار الوزاري 187 لسنة 2023** (لائحة الانضباط المدرسي، تنظيم الرسوم وحظر العقاب البدني).
2. **الجامعات والتعليم العالي (`HIGHER_EDUCATION`):**
   * الجامعات الحكومية، الأهلية، الخاصة، التكنولوجية، والمعاهد العليا.
   * الاستناد إلى **قانون تنظيم الجامعات 49 لسنة 1972** (الساعات المعتمدة، التظلمات، والمدن الجامعية).
3. **الخدمات الحكومية والهيئات العامة (`GOVERNMENT_PUBLIC`):**
   * مكاتب الشهر العقاري، البريد المصري، الأحوال المدنية، وإجراءات المرور والتراخيص.
   * قياس اتفاقيات مستوى الخدمة (SLA) وبوابات الدفع والتحصيل الإلكتروني.
4. **الشركات والخدمات التجارية والاتصالات (`COMMERCIAL_COMPANIES`):**
   * شركات الاتصالات والإنترنت، منافذ البيع المعتمدة، خدمات ما بعد البيع، والشركات الخدمية.
   * الاستناد إلى **قانون حماية المستهلك 181 لسنة 2018** (حق الاسترجاع خلال 14 يوماً، عيوب الصناعة، والضمان).
5. **المنشآت الصحية والمستشفيات (`HEALTHCARE_MEDICAL`):**
   * المستشفيات الخاصة والجامعية، المراكز التخصصية، ومقدمي الرعاية الصحية.
   * الاستناد إلى معايير الهيئة العامة للاعتماد والرقابة الصحية (**GAHAR**) وميثاق حقوق المريض.

---

## 🤖 منظومة الذكاء الاصطناعي المزدوجة (Dual AI Engines)

تم بناء ميزتين مستقلتين بالكامل للذكاء الاصطناعي، لكل منهما محرك ونقطة نهاية وواجهة مستخدم منفصلة:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1️⃣ الشات بوت الفوري (Concierge Chatbot)                                                │
│ • الواجهة: الزر العائم بأسفل يسار الشاشة (💬 مُساعد مُرافِق الذكي)                     │
│ • المحرك: NVIDIA NIM — nvidia/nemotron-3.5-lightning-30b-a3b                            │
│ • نقطة النهاية: /api/ai/concierge                                                      │
│ • الوظيفة: إجابة فورية عن آلية المنصة، حقوق المستهلك، مهلة الـ 7 أيام، وتوجيه الشكاوى.│
└────────────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 2️⃣ مستشار الحلول والخطط (Solution & Action Plan Advisor)                              │
│ • الواجهة: الزر العائم بأسفل يمين الشاشة (⚖️ مستشار الحلول الذكي) + داخل نماذج الشكوى │
│ • المحرك: NVIDIA NIM — meta/muse-glimmer-30b                                           │
│ • نقطة النهاية: /api/ai/solution-advisor                                               │
│ • الوظيفة:                                                                             │
│   - للمواطنين: صياغة مطلب قانوني عادل وهادئ مع الاستشهاد باللوائح المصرية.             │
│   - للمؤسسات: توليد خطط معالجة ثلاثية المراحل مطابقة لمؤشر الجودة المؤسسية RQS ≥ 90.   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 🛡️ الركائز المعمارية والأمنية (Key Architecture & Security)

* **محرك الحالات رباعي المتجهات (4-Vector State Engine):** إدارة دقيقة لدورة حياة الحالة:
  `SUBMITTED` ➔ `PRIVATE_GRACE` (7 أيام للمراجعة والحل الودي) ➔ `ACTION_PLAN_PENDING` ➔ `IN_PROGRESS` ➔ `WAITING_FOR_EVALUATION` ➔ `CLOSED`.
* **العزل المادي لبيانات الهوية (PII Physical Isolation):**
  * التزام صارم بـ **قانون حماية البيانات الشخصية المصري رقم 151 لسنة 2020**.
  * تشفير وفصل الرقم القومي وبيانات الاتصال في جداول مستقلة مشفرة (`case_sensitive_data`)، مع حظر عرض الهوية للمؤسسات أو في التقييمات العامة بدون موافقة صريحة.
* **مؤشر التسوية البايزي (BARS Score):**
  * احتساب موثوقية المؤسسات والجهات وفق صيغة إحصائية موزونة تمنع الانحياز الإحصائي وتحجب الجهات غير المستوفية للنصاب القانوني لحجم العينة.
  * معايرة تلقائية لكل قطاع باستخدام معاملات بايـزية خاصة بالقطاع.
* **محرك توليد تقارير الـ PDF المؤرشفة:**
  * توليد تقارير رسمية بصيغة PDF مع ختم البصمة الرقمية الموثقة (SHA-256 Digest Engine) لمنع التلاعب بسجلات التسوية.
* **طبقة الاسترجاع القانوني (Statutory RAG):**
  * استرجاع اللوائح والقوانين المصرية الموثقة بشرياً مع ترشيح حسب القطاع وضمان نص محايد عند عدم وجود تطابق.

---

## 💻 حزمة التقنيات المستخدمة (Tech Stack)

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 15.5](https://nextjs.org/) (App Router) |
| **UI** | [React 19](https://react.dev/) + [TypeScript 5.8](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3.4](https://tailwindcss.com/) |
| **Database & BaaS** | [Supabase](https://supabase.com/) / PostgreSQL + Row Level Security (RLS) |
| **AI Inference** | [NVIDIA NIM](https://build.nvidia.com/) — Nemotron 3.5 + Muse Glimmer 30B |
| **Document Engine** | Puppeteer + Handlebars (SHA-256 Verified PDFs) |
| **WhatsApp** | Meta Cloud API (Signed URLs + Webhook Delivery Tracking) |
| **Background Jobs** | [Trigger.dev](https://trigger.dev/) |
| **Testing** | [Vitest 3.0](https://vitest.dev/) — 24 suites, 152 tests |

---

## 🚀 التشغيل والإعداد المحلي (Getting Started)

### 1. المتطلبات الأساسية (Prerequisites)
* Node.js ≥ 18.18.0
* npm or yarn or pnpm

### 2. تثبيت الحزم (Installation)
```bash
git clone https://github.com/am21951691-cloud/Murafiq.git
cd Murafiq
npm install
```

### 3. إعداد متغيرات البيئة (Environment Variables)
قم بإنشاء ملف `.env.local` استناداً إلى `.env.example`:

```bash
cp .env.example .env.local
```

أضف المفاتيح الخاصة بك في ملف `.env.local`:
```env
# Database & Authentication
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# AI Services (NVIDIA NIM)
NVIDIA_CONCIERGE_API_KEY=your-nvidia-api-key
NVIDIA_ADVISOR_API_KEY=your-nvidia-api-key

# WhatsApp Cloud API
WHATSAPP_CLOUD_API_TOKEN=your-whatsapp-token
```

> ⚠️ **Never commit `.env.local` or any file containing real API keys. See [SECURITY.md](SECURITY.md) for details.**

### 4. تشغيل خادم التطوير (Run Development Server)
```bash
npm run dev
```
افتح المتصفح على: [http://localhost:3000](http://localhost:3000)

### 5. تشغيل الاختبارات (Run Tests)
```bash
npm test
```
* يشمل **24 ملف اختبار** و **152 اختباراً** لوحدات الحساب الإحصائي، العزل الأمني، نماذج الذكاء الاصطناعي، وتوليد الـ PDF.

### 6. بناء المشروع للإنتاج (Production Build)
```bash
npm run build
npm start
```

---

## 📁 هيكل المشروع (Project Structure)

```
Murafiq/
├── app/                          # Next.js App Router (الصفحات والمسارات)
│   ├── (institution)/portal/     # بوابة ولوحة تحكم المؤسسات والجهات
│   ├── (parent)/cases/           # معالج تقديم الشكاوى واستعراض الحالات
│   ├── (public)/directory/       # الدليل الوطني الموحد للجهات
│   ├── (public)/schools/         # دليل المؤسسات التعليمية ومؤشر BARS
│   ├── (public)/services/        # الملفات التعريفية الموثقة للجهات
│   ├── api/                      # نقاط النهاية البرمجية (AI, Cases, Webhooks)
│   │   ├── ai/                   # Concierge + Solution Advisor + Statutory Query
│   │   ├── cases/                # Submit, Evaluate, Milestones, Track
│   │   ├── institution/          # Acknowledge, Action Plans, Case Listing
│   │   └── webhooks/             # WhatsApp delivery status webhooks
│   ├── layout.tsx                # التخطيط العام ودمج أدوات الذكاء الاصطناعي
│   └── page.tsx                  # الصفحة الرئيسية وبوابة القطاعات الخمسة
├── components/
│   ├── ai/                       # مكوّنات الشات بوت والمستشار القانوني
│   ├── cases/                    # معالج تقديم الشكوى وتتبع المراحل
│   ├── institution/              # أدوات الفرز وبناء خطط العمل
│   └── brand/                    # الهوية البصرية والشعار المعتمد
├── lib/
│   ├── ai/                       # محركات NVIDIA NIM والتنسيق القانوني
│   ├── config/                   # اللوائح والقوانين وتصنيفات المحافظات
│   ├── services/                 # خدمات الكيانات، BARS، محول التخزين
│   ├── supabase/                 # تهيئة اتصال Supabase وسياسات الأمان
│   └── validators/               # مخططات Zod لبيانات القطاعات والهوية
├── tests/                        # اختبارات التكامل والوحدات (24 Suites / 152 Tests)
├── docs/                         # المواصفات والمعمارية وخطة التنفيذ
├── supabase/                     # هجرات قاعدة البيانات والسكريبتات
└── trigger/                      # مهام الخلفية (PDF، WhatsApp، Timeouts)
```

---

## ⚖️ الحقوق والترخيص (License)

جميع الحقوق محفوظة © 2026 **منظومة مُرافِق الوطنية (Murafiq)**.
هذا النظام مصمم ومطور خصيصاً لخدمة تسوية النزاعات وحماية البيانات في جمهورية مصر العربية وفق المعايير والقوانين المنظمة.