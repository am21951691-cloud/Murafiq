# Murafiq — Enterprise UX & UI Design System

> **Version:** 3.0  
> **Aesthetic Profile:** Serious Civic & Enterprise Authority, Clean, Accessible, and Purpose-Built  
> **Target Experiences:** Beneficiary Tracking, Operations Workspace, Executive BI, and Tenant Administration

---

## 1. Visual Aesthetics & Token Hierarchy

- **Color Tokens:**
  - **Civic Primary:** `#0F766E` (Deep Resolution Teal) & `#1E3A5F` (Civic Navy)
  - **Secondary Accents:** `#0284C7` (Sky Information) & `#D97706` (Action Alert Amber)
  - **Urgent / Escalation:** `#DC2626` (Critical Red)
  - **Resolution / Success:** `#059669` (Completed Green)
  - **Canvas Background:** `#F8FAFC` (Civic Slate Canvas)
  - **Card Surface:** `#FFFFFF` (Card White with subtle borders and shadows)
- **Typography:**
  - **Arabic (Primary RTL):** Cairo, IBM Plex Sans Arabic, Noto Sans Arabic
  - **English / Monospace (Secondary LTR):** Inter, JetBrains Mono (for reference numbers: `MRF-XXXX-XXXXX`)

---

## 2. The 4 Enterprise Portals UX Architecture

### 2.1 Beneficiary Portal & Dedicated Tracking (`/track`, `/cases/new`)
- **Frictionless Lookup:** Direct query by reference number without mandatory account creation barriers.
- **5-Stage Visual Progress Stepper:**
  1. *التسجيل والتوثيق (Submitted)*
  2. *المراجعة والفرز (Triage & Department)*
  3. *خطة العمل المعتمدة (Action Plan Active)*
  4. *اكتمال الإجراءات (Awaiting Evaluation)*
  5. *التسوية والإغلاق (Closed & Report)*
- **Action Plan Transparency:** Clear milestone checklist showing exactly what the institution committed to and what has been completed.
- **Inquiry Channel:** Form to send questions directly to the assigned department.

### 2.2 Operations & Staff Workspace (`/portal/dashboard`, `/portal/cases/[id]`)
- **Triage Matrix:** Priority badges (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`), countdown timers, and department filters.
- **Interactive Action Plan Constructor:** 3-stage plan builder with real-time RQS calculation.
- **Protected Internal Notes:** Dedicated space for staff-only collaboration, hidden from public payloads.
- **Chronological Audit Timeline:** Immutable visual history of all case events and status transitions.

### 2.3 Organization Admin Control Center (`/portal/admin`)
- **6-Tab Configuration Experience:**
  1. *الهوية البصرية:* Dynamic branding, custom colors, logo URL, and welcome copy.
  2. *هيكل الأقسام:* Department creation, code specification, and default SLA hours.
  3. *مصفوفة مستوى الخدمة:* Response and resolution thresholds per priority.
  4. *فريق العمل والصلاحيات:* Multi-role user administration (`ADMIN`, `OPS_LEAD`, `STAFF`, `OBSERVER`).
  5. *تصنيفات القطاع واللوائح:* Sector statutory guidelines and taxonomies.
  6. *الربط البرمجي:* Tenant API keys and endpoint settings.

### 2.4 Executive Quality & SLA Analytics Dashboard (`/portal/analytics`)
- **Executive KPI Cards:** SLA compliance rate, median response hours, median resolution days, total/open/overdue volume.
- **Department Performance Scorecards:** Direct comparison of department throughput and adherence.
- **Category & Priority Heatmaps:** Visual distribution of incoming issues to guide strategic decisions.

---

## 3. Bilingual RTL / LTR Design Standards

- Full Arabic RTL default alignment with CSS logical properties (`margin-inline`, `padding-inline`, `start`, `end`).
- Reference numbers, API keys, and timestamps maintain proper LTR formatting and alignment.
- Zero layout shifts when toggling language or switching between mobile and desktop views.
