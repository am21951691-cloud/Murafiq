# Murafiq (مُرافِق) — Enterprise Product Specification

> **Version:** 3.0  
> **Product Category:** Enterprise Case & Resolution Management Platform (B2B SaaS / On-Premise)  
> **Arabic Positioning:** منظومة مؤسسية لإدارة الحالات والشكاوى والطلبات وحل المشكلات  
> **Core Promise:** *Every issue gets an owner, every action gets a deadline, every commitment gets tracked, and every resolution becomes measurable.*  
> **Status:** Production Reference Specification

---

## 1. Product Vision & Positioning

**Murafiq** is a multi-tenant Enterprise Case & Resolution Management Platform engineered to be sold, deployed, branded, and integrated directly into client organizations.

### What Murafiq Is:
- A private, institutional case resolution and accountability operating system.
- An issue tracker and action plan management engine connecting beneficiaries, frontline staff, and executive leadership.
- A SLA enforcement and department performance scorecard platform.
- A compliance-ready system adhering to Egyptian Data Protection Law 151/2020.

### What Murafiq Is NOT:
- **NOT** a public consumer review directory or rating aggregator.
- **NOT** a place for public defamatory venting or review bombing.
- **NOT** an adversarial consumer forum.

---

## 2. Core Product Principles

1. **Accountability by Design:** Every case has an assigned department and owner; unassigned cases trigger automated triage alerts.
2. **Deterministic Time-Bound Resolution:** SLAs are strictly configured per priority level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) and monitored in real time.
3. **Structured Commitments (Action Plans):** Issues are resolved via multi-phase Action Plans with tangible milestones, accountable officers, and verifiable evidence.
4. **Beneficiary-Centric Closure:** A case cannot simply be closed unilaterally by staff; the beneficiary provides final evaluation and feedback ($R_{resp}$ and $R_{res}$ on a 1–5 scale).
5. **PII Physical Separation (Law 151/2020):** Personal identification details are isolated in dedicated encrypted tables (`case_sensitive_data`) with zero broad access.
6. **Dual AI Assistance (Non-Adversarial):** AI acts as an intake concierge and solution advisor proposing actionable 3-phase plans, never acting as a judicial arbiter.
7. **Verifiable Audit Integrity:** Every milestone, note, and status transition is recorded in an append-only cryptographic event log, culminating in a SHA-256 digested PDF report.

---

## 3. Supported Sectors & Configuration

The system provides out-of-the-box configuration profiles for 5 primary sectors while supporting custom institutional definitions:

| Sector Code | Sector Name | Beneficiary Term | Institution Term | Standard Departments | Regulatory Baseline |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `EDUCATION_SCHOOLS` | المدارس والتعليم قبل الجامعي | ولي أمر / طالب | إدارة المدرسة | شؤون الطلاب، الشؤون المالية، النقل والحافلات، الإدارة الأكاديمية | Ministerial Decree 187/2023 |
| `HIGHER_EDUCATION` | الجامعات والتعليم العالي | طالب جامعي / باحث | إدارة الكلية / العمادة | شؤون الطلاب، الكنترول والامتحانات، السكن والمدن الجامعية، الشؤون المالية | Universities Law 49/1972 |
| `GOVERNMENT_PUBLIC` | الخدمات الحكومية والهيئات | مواطن / مراجع | الإدارة / المركز | خدمة المواطنين، الشؤون القانونية، التحصيل والتراخيص، المتابعة والتفتيش | Public SLA & Digital Governance |
| `COMMERCIAL_COMPANIES` | الشركات والمؤسسات التجارية | عميل / مشترك | إدارة العمليات / الجودة | خدمة العملاء، الدعم الفني، الفواتير والتحصيل، الشكاوى والاسترجاع | Consumer Protection Law 181/2018 |
| `HEALTHCARE_MEDICAL` | المستشفيات والمنشآت الصحية | مريض / مرافق | إدارة المستشفى | رعاية المرضى وتجربة المريض، العيادات الخارجية، الطوارئ، التمريض والجودة | GAHAR Standards & Patient Rights |

---

## 4. Portals & Access Hierarchy

Murafiq delivers 4 purpose-built portals:

### 4.1 Beneficiary Portal & Ticket Tracking (`/cases/submit`, `/track`)
- **Guided Intake Wizard:** Step-by-step submission with category selection, priority indicators, and department routing.
- **Reference-Based Tracking:** Direct lookup via cryptographically secure reference numbers (`MRF-XXXXXX`) without mandatory account creation.
- **Action Plan Visibility:** Transparent viewing of approved resolution milestones and target delivery dates.
- **Bidirectional Communication:** Messaging channel between beneficiary and assigned staff.
- **Resolution Evaluation & Report:** 3D evaluation modal and downloadable PDF report with verification fingerprint.

### 4.2 Staff Operations & Triage Portal (`/portal/dashboard`, `/portal/cases/[id]`)
- **Triage Matrix:** Priority badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), SLA countdown timers, and department filtering.
- **Protected Internal Notes:** Staff-only collaborative discussion thread invisible to beneficiaries.
- **Case Detail Workspace:** Full chronological event timeline, communication logs, and evidence attachment browser.
- **Interactive Action Plan Builder:** Creation of 3-stage corrective plans with owner assignment, milestone checklists, and RQS estimation.

### 4.3 Organization Admin Portal (`/portal/admin`)
- **Institutional Profile:** Entity name, sector taxonomy, logo, brand accents, and custom domain setup.
- **Department Hierarchy:** Creation and management of organizational departments and routing rules.
- **SLA Policy Matrix:** Target resolution and first-response hours configured per priority level.
- **Staff Access Control:** Role assignment (`ADMIN`, `OPS_LEAD`, `STAFF`, `OBSERVER`).
- **Category Customization:** Sector-specific issue categories and subcategories.

### 4.4 Executive Analytics Dashboard (`/portal/analytics`)
- **SLA Compliance Rate:** Percentage of cases acknowledged and resolved within target deadlines.
- **Department Scorecards:** Comparative performance across internal departments.
- **Priority & Volume Distribution:** Heatmaps of incoming case volumes and critical escalations.
- **Resolution Quality Score (RQS):** Aggregated metric reflecting adherence, milestone thoroughness, and beneficiary satisfaction.

---

## 5. Case Resolution Lifecycle State Machine

```
   [SUBMITTED]
        │
        ▼ (Triage & Intake Verification)
 [PRIVATE_GRACE] ──(Grace countdown: 7 days default)
        │
        ▼ (Staff Acknowledgment & Department Assignment)
[ACTION_PLAN_PENDING]
        │
        ▼ (Action Plan Constructed & Approved)
  [IN_PROGRESS] ──(Milestones executed: 1 -> 2 -> 3)
        │
        ▼ (Final Milestone Complete & Outcome Submitted)
[WAITING_FOR_EVALUATION]
        │
        ├───────────────────────────────┐
        ▼ (Beneficiary Submits Evaluation)  ▼ (Inactivity Timeout: 30d)
     [CLOSED]                        [CLOSED] (Timed Out)
```

---

## 6. Integration & Enterprise Security

- **API-First Architecture:** Complete RESTful v1 API layer for integration into existing ERP, SIS, HIS, or CRM systems.
- **Multi-Tenant Isolation:** Guaranteed tenant isolation via dedicated database scopes and Row Level Security.
- **Notification Multichannel:** Meta WhatsApp Cloud API integration for SMS/WhatsApp status alerts, email fallback, and webhook triggers.
- **Cryptographic Auditability:** SHA-256 tamper-evident integrity hash embedded on all official resolution certificates.
