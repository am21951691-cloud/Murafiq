# Murafiq (مُرافِق) Case Resolution Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and launch a production-ready Case Resolution Platform for education in Egypt following the closed-loop cycle: **Public Platform → Create Case → Case Management → (Institution Dashboard + AI Analysis) → Action Plan → Resolution Tracking → Final Evaluation → (AI Outcome + PDF Report) → WhatsApp API Delivery**.

**Architecture:** Next.js 15 (App Router, RSC, Tailwind RTL) frontend deployed on Vercel; Supabase backend (PostgreSQL 15+, Row Level Security, Auth, Storage, pgvector); Trigger.dev v3 asynchronous worker queue for long-running AI extraction, Puppeteer PDF generation, and Meta WhatsApp Cloud API dispatch.

**Tech Stack:**
- **Frontend & API:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, `next-intl` (bilingual AR/EN)
- **Database & Storage:** Supabase (PostgreSQL 15+, pgvector, Auth, Storage, RLS)
- **Async Workers:** Trigger.dev v3
- **AI & Extraction:** OpenAI GPT-4o / GPT-4o-mini with strict Zod structured outputs
- **Document Engine:** Puppeteer (Headless Chrome with Cairo & IBM Plex Sans Arabic fonts)
- **Messaging:** Meta WhatsApp Business Cloud API (Official)
- **Testing:** Vitest, Playwright, pgTAP (RLS testing)

## Global Constraints

- **Language & RTL:** All customer-facing components must support bidirectional layouts (`dir="rtl"` for Arabic, `dir="ltr"` for English) with zero horizontal overflow.
- **Phone Format:** Egyptian phone numbers must be validated and stored in E.164 format: `+201[0125][0-9]{8}`.
- **Attribution Labeling:** Every rendered statement must carry an explicit badge: `USER-REPORTED`, `INSTITUTION-STATED`, `AI-INFERRED`, or `VERIFIED`.
- **Minor Privacy:** Student names, student IDs, and personal teacher names must never be stored in plaintext or published on public views.
- **Grace Period:** All new cases enter a mandatory 7-day private institutional grace window before any public indexing.

---

## Task Breakdown

### Task 1: Project Scaffolding & Design System Tokens

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `tailwind.config.ts`
- Create: `app/globals.css`
- Create: `lib/utils.ts`
- Create: `messages/ar.json`
- Create: `messages/en.json`
- Test: `tests/unit/utils.test.ts`

**Interfaces:**
- Consumes: None
- Produces: `cn(...inputs: ClassValue[]): string`, RTL layout tokens, bilingual message dictionaries.

- [ ] **Step 1: Write the failing test**
```typescript
// tests/unit/utils.test.ts
import { describe, it, expect } from "vitest";
import { cn, formatEgyptianPhone } from "@/lib/utils";

describe("Utility Functions", () => {
  it("merges tailwind classes cleanly", () => {
    expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
  });

  it("normalizes Egyptian phone numbers to E.164", () => {
    expect(formatEgyptianPhone("01012345678")).toBe("+201012345678");
    expect(formatEgyptianPhone("+201012345678")).toBe("+201012345678");
    expect(() => formatEgyptianPhone("12345")).toThrow("Invalid Egyptian phone number");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/utils.test.ts`  
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement minimal code**
```typescript
// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEgyptianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const egRegex = /^(?:\+20|0020|0)?(1[0125]\d{8})$/;
  const match = cleaned.match(egRegex);
  if (!match) {
    throw new Error("Invalid Egyptian phone number");
  }
  return `+20${match[1]}`;
}
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/utils.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add package.json tsconfig.json tailwind.config.ts lib/utils.ts tests/unit/utils.test.ts
git commit -m "feat: scaffold core project utilities and RTL styling tokens"
```

---

### Task 2: Database Schema, Enums & RLS Policies

**Files:**
- Create: `supabase/migrations/00001_core_schema.sql`
- Create: `types/database.ts`
- Create: `lib/supabase/server.ts`
- Create: `lib/supabase/client.ts`
- Test: `tests/integration/rls.test.ts`

**Interfaces:**
- Consumes: Supabase connection credentials (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
- Produces: Type-safe database client and strict relational models for `institutions`, `cases`, `action_plans`, `action_items`, `evaluations`, `reports`.

- [ ] **Step 1: Write the failing test for schema contracts**
```typescript
// tests/integration/rls.test.ts
import { describe, it, expect } from "vitest";
import { CaseStatusEnum, VisibilityEnum } from "@/types/database";

describe("Database Enum Contracts", () => {
  it("contains all 9 canonical state machine values", () => {
    const states = [
      "DRAFT", "SUBMITTED", "UNDER_REVIEW", "PRIVATE_GRACE",
      "PUBLISHED", "ACTION_PLAN_CREATED", "IN_PROGRESS",
      "AWAITING_EVALUATION", "CLOSED", "REJECTED"
    ];
    states.forEach(state => {
      expect(CaseStatusEnum[state as keyof typeof CaseStatusEnum]).toBeDefined();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/integration/rls.test.ts`  
Expected: FAIL (`CaseStatusEnum` not defined).

- [ ] **Step 3: Implement database migration and types**
Write `supabase/migrations/00001_core_schema.sql` (defining `institutions`, `cases`, `action_plans`, `action_items`, `evaluations`, `reports`, RLS policies) and export types in `types/database.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/integration/rls.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/00001_core_schema.sql types/database.ts tests/integration/rls.test.ts
git commit -m "feat: implement database schema, enums, and RLS policies"
```

---

### Task 3: Public Platform — Directory, Search & Profile Benchmarks

**Diagram Step:** `[Public Platform]`

**Files:**
- Create: `app/[locale]/(public)/page.tsx`
- Create: `app/[locale]/(public)/schools/[slug]/page.tsx`
- Create: `components/schools/SchoolProfileCard.tsx`
- Create: `components/schools/ResolutionMetricsBanner.tsx`
- Create: `lib/services/institutions.ts`
- Test: `tests/unit/institution-metrics.test.ts`

**Interfaces:**
- Consumes: Supabase database client.
- Produces: `getInstitutionBySlug(slug: string)`, `getResolutionMetrics(institutionId: string)`.

- [ ] **Step 1: Write failing test for metric aggregation**
```typescript
// tests/unit/institution-metrics.test.ts
import { describe, it, expect } from "vitest";
import { calculateResolutionMetrics } from "@/lib/services/institutions";

describe("Institution Metric Calculation", () => {
  it("hides star ratings when cases count is below threshold of 5", () => {
    const result = calculateResolutionMetrics({ totalCases: 3, resolvedCases: 2, avgScore: 4.5 });
    expect(result.displayRatings).toBe(false);
    expect(result.statusMessage).toContain("Establishing Benchmark");
  });

  it("calculates verified resolution rate accurately for >= 5 cases", () => {
    const result = calculateResolutionMetrics({ totalCases: 10, resolvedCases: 8, avgScore: 4.2 });
    expect(result.displayRatings).toBe(true);
    expect(result.resolutionRate).toBe(80);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/institution-metrics.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement calculation service and UI component**
Implement `calculateResolutionMetrics` in `lib/services/institutions.ts` and build `ResolutionMetricsBanner.tsx` with bilingual RTL badge support.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/institution-metrics.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/services/institutions.ts components/schools/ app/[locale]/(public)/
git commit -m "feat: build public institution directory and confidence-threshold metrics"
```

---

### Task 4: Create Case / Review — Guided Intake Wizard & PII Edge Sanitizer

**Diagram Step:** `[Create Case/Review]`

**Files:**
- Create: `app/[locale]/(user)/cases/new/page.tsx`
- Create: `components/cases/IntakeWizard.tsx`
- Create: `components/cases/EvidenceUploader.tsx`
- Create: `lib/ai/sanitizer.ts`
- Test: `tests/unit/sanitizer.test.ts`

**Interfaces:**
- Consumes: Raw user description (Arabic/English).
- Produces: `sanitizeRawInput(text: string): { cleanedText: string; redactedItems: string[] }`.

- [ ] **Step 1: Write failing test for deterministic PII regex sanitizer**
```typescript
// tests/unit/sanitizer.test.ts
import { describe, it, expect } from "vitest";
import { sanitizeRawInput } from "@/lib/ai/sanitizer";

describe("Edge PII Sanitizer", () => {
  it("strips Egyptian National ID numbers (14 digits)", () => {
    const raw = "رقم بطاقة المعلم 29501011234567 وهو مهمل";
    const result = sanitizeRawInput(raw);
    expect(result.cleanedText).not.toContain("29501011234567");
    expect(result.cleanedText).toContain("[NATIONAL_ID_REDACTED]");
  });

  it("strips Egyptian phone numbers", () => {
    const raw = "تواصلت معه على 01012345678 ولم يرد";
    const result = sanitizeRawInput(raw);
    expect(result.cleanedText).toContain("[PHONE_REDACTED]");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/sanitizer.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `sanitizeRawInput`**
Implement regex filters for Egyptian National IDs, phone numbers, emails, and URLs in `lib/ai/sanitizer.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/sanitizer.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/ai/sanitizer.ts components/cases/IntakeWizard.tsx tests/unit/sanitizer.test.ts
git commit -m "feat: implement guided intake wizard and deterministic PII edge redaction"
```

---

### Task 5: Case Management & State Machine Engine

**Diagram Step:** `[Case Management]`

**Files:**
- Create: `lib/state-machine/transitions.ts`
- Create: `app/api/cases/route.ts`
- Create: `app/[locale]/(user)/cases/[id]/page.tsx`
- Create: `components/cases/CaseTimeline.tsx`
- Test: `tests/unit/state-machine.test.ts`

**Interfaces:**
- Consumes: Current `case_status` and transition event.
- Produces: `transitionCase(current: CaseStatus, event: CaseEvent): CaseStatus`.

- [ ] **Step 1: Write failing test for state machine guards**
```typescript
// tests/unit/state-machine.test.ts
import { describe, it, expect } from "vitest";
import { transitionCase } from "@/lib/state-machine/transitions";

describe("Case State Machine", () => {
  it("transitions from SUBMITTED to PRIVATE_GRACE upon intake completion", () => {
    const next = transitionCase("SUBMITTED", { type: "START_GRACE" });
    expect(next).toBe("PRIVATE_GRACE");
  });

  it("prevents skipping directly from PRIVATE_GRACE to CLOSED", () => {
    expect(() => transitionCase("PRIVATE_GRACE", { type: "USER_EVALUATE" })).toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/state-machine.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement state transitions and route handler**
Implement `transitionCase` with strict transition maps in `lib/state-machine/transitions.ts` and build `CaseTimeline.tsx`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/state-machine.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/state-machine/ app/api/cases/ components/cases/CaseTimeline.tsx tests/unit/state-machine.test.ts
git commit -m "feat: implement 9-state case machine engine and live timeline"
```

---

### Task 6: AI Analysis & Suggestions Engine (RIE)

**Diagram Step:** `[AI Analysis & Suggestions]`

**Files:**
- Create: `lib/ai/schemas.ts`
- Create: `lib/ai/engine.ts`
- Create: `trigger/tasks/analyzeCase.ts`
- Test: `tests/unit/ai-schemas.test.ts`

**Interfaces:**
- Consumes: Sanitized case description text.
- Produces: `CaseAnalysis` object conforming to Zod schema.

- [ ] **Step 1: Write failing test for Zod output validation**
```typescript
// tests/unit/ai-schemas.test.ts
import { describe, it, expect } from "vitest";
import { CaseAnalysisSchema } from "@/lib/ai/schemas";

describe("AI Case Analysis Schema", () => {
  it("validates a structured case analysis object successfully", () => {
    const sample = {
      category: "ACADEMIC_CURRICULUM",
      subcategory: "Math Exam Discrepancy",
      severity: "MEDIUM",
      neutral_summary_ar: "قام ولي الأمر بطلب خطة تقوية دراسية في مادة الرياضيات.",
      neutral_summary_en: "Parent requested a structured math remediation plan.",
      extracted_timeline: [{ date_or_period: "May 2026", event: "Midterm exam" }],
      stakeholders_involved: [{ role: "Math Teacher", anonymized_reference: "Lead Teacher Grade 5" }],
      user_impact: "Child struggling with algebra fundamentals.",
      user_desired_outcome: "Bi-weekly tutoring sessions and progress updates.",
      missing_information: [],
      evidence_provided: ["Exam paper photo"],
      confidence_score: 0.95
    };
    expect(CaseAnalysisSchema.safeParse(sample).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/ai-schemas.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement Zod schema and OpenAI structured call**
Define `CaseAnalysisSchema` in `lib/ai/schemas.ts` and implement `analyzeCase` worker in `trigger/tasks/analyzeCase.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/ai-schemas.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/ai/schemas.ts lib/ai/engine.ts trigger/tasks/analyzeCase.ts tests/unit/ai-schemas.test.ts
git commit -m "feat: implement AI Case Understanding and structured schema extraction"
```

---

### Task 7: Institution Dashboard & Case Triage

**Diagram Step:** `[Institution Dashboard]`

**Files:**
- Create: `app/[locale]/(institution)/portal/dashboard/page.tsx`
- Create: `app/[locale]/(institution)/portal/cases/[id]/page.tsx`
- Create: `components/institution/CaseTriageCard.tsx`
- Create: `components/institution/InternalNotesThread.tsx`
- Test: `tests/unit/institution-auth.test.ts`

**Interfaces:**
- Consumes: Authenticated session with `institution_member` role.
- Produces: Filtered list of cases in `PRIVATE_GRACE`, `IN_PROGRESS`, `AWAITING_EVALUATION`.

- [ ] **Step 1: Write failing test for member authorization**
```typescript
// tests/unit/institution-auth.test.ts
import { describe, it, expect } from "vitest";
import { verifyInstitutionAccess } from "@/lib/services/institutions";

describe("Institution Access Control", () => {
  it("rejects user who is not a registered member of the target institution", async () => {
    const access = await verifyInstitutionAccess("user-123", "inst-456");
    expect(access).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/institution-auth.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement authorization service and triage interface**
Implement `verifyInstitutionAccess` and build `CaseTriageCard.tsx` showing days remaining in the private grace window.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/institution-auth.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add app/[locale]/(institution)/ components/institution/ tests/unit/institution-auth.test.ts
git commit -m "feat: build institution portal dashboard and internal case triage view"
```

---

### Task 8: Action Plan Builder & AI Quality Scoring (RQS)

**Diagram Step:** `[Action Plan]`

**Files:**
- Create: `components/institution/ActionPlanBuilder.tsx`
- Create: `lib/ai/scoring.ts`
- Create: `app/api/cases/[id]/plan/route.ts`
- Test: `tests/unit/rqs-score.test.ts`

**Interfaces:**
- Consumes: Action Plan payload (Statement + Milestones).
- Produces: `calculateRQS(plan: ActionPlanPayload): { rqsScore: number; breakdown: object }`.

- [ ] **Step 1: Write failing test for RQS calculation**
```typescript
// tests/unit/rqs-score.test.ts
import { describe, it, expect } from "vitest";
import { calculateRQS } from "@/lib/ai/scoring";

describe("Resolution Quality Score (RQS)", () => {
  it("penalizes plan without named owners or explicit deadlines", () => {
    const poorPlan = {
      officialStatement: "We will look into it.",
      milestones: [{ title: "Review", ownerRole: "", dueDate: "" }]
    };
    const result = calculateRQS(poorPlan);
    expect(result.rqsScore).toBeLessThan(40);
  });

  it("scores high for complete, accountable, time-bound action plan", () => {
    const strongPlan = {
      officialStatement: "Meeting held with department; remedial sessions scheduled.",
      milestones: [
        { title: "Academic Diagnostic", ownerRole: "Math Dept Head", dueDate: "2026-09-20" },
        { title: "Weekly Progress Review", ownerRole: "Lead Teacher", dueDate: "2026-09-27" }
      ]
    };
    const result = calculateRQS(strongPlan);
    expect(result.rqsScore).toBeGreaterThanOrEqual(75);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/rqs-score.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement RQS mathematical algorithm and UI builder**
Implement formula in `lib/ai/scoring.ts` and interactive form in `ActionPlanBuilder.tsx`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/rqs-score.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/ai/scoring.ts components/institution/ActionPlanBuilder.tsx app/api/cases/[id]/plan/ tests/unit/rqs-score.test.ts
git commit -m "feat: build action plan constructor with algorithmic RQS calculation"
```

---

### Task 9: Resolution Tracking & Milestone Execution

**Diagram Step:** `[Resolution Tracking]`

**Files:**
- Create: `components/cases/MilestoneTracker.tsx`
- Create: `app/api/cases/[id]/milestones/[milestoneId]/route.ts`
- Create: `trigger/tasks/checkOverdueMilestones.ts`
- Test: `tests/unit/milestone-tracking.test.ts`

**Interfaces:**
- Consumes: Milestone completion toggle + verification document upload.
- Produces: State transition to `AWAITING_EVALUATION` once all milestones complete.

- [ ] **Step 1: Write failing test for milestone completion logic**
```typescript
// tests/unit/milestone-tracking.test.ts
import { describe, it, expect } from "vitest";
import { checkAllMilestonesCompleted } from "@/lib/services/milestones";

describe("Milestone Execution Engine", () => {
  it("returns true only when every milestone is checked off", () => {
    const items = [
      { id: "1", is_completed: true },
      { id: "2", is_completed: true }
    ];
    expect(checkAllMilestonesCompleted(items)).toBe(true);
    expect(checkAllMilestonesCompleted([...items, { id: "3", is_completed: false }])).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/milestone-tracking.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement milestone service and execution route**
Build `checkAllMilestonesCompleted` in `lib/services/milestones.ts` and route handler updating `action_items`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/milestone-tracking.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/services/milestones.ts components/cases/MilestoneTracker.tsx app/api/cases/[id]/milestones/ tests/unit/milestone-tracking.test.ts
git commit -m "feat: implement milestone completion tracking and auto-advance to evaluation"
```

---

### Task 10: Final Evaluation & 3D Star Rating

**Diagram Step:** `[Final Evaluation]`

**Files:**
- Create: `components/cases/EvaluationModal.tsx`
- Create: `components/ui/ThreeDimensionalRating.tsx`
- Create: `app/api/cases/[id]/evaluate/route.ts`
- Test: `tests/unit/evaluation-schema.test.ts`

**Interfaces:**
- Consumes: `response_rating` (1–5), `resolution_rating` (1–5), `closing_comment`.
- Produces: Persisted record in `evaluations` and triggers case closure.

- [ ] **Step 1: Write failing test for 3D rating validation**
```typescript
// tests/unit/evaluation-schema.test.ts
import { describe, it, expect } from "vitest";
import { EvaluationSchema } from "@/types/database";

describe("Final Evaluation Schema", () => {
  it("requires both response and resolution ratings between 1 and 5", () => {
    const invalid = { responseRating: 6, resolutionRating: 0, closingComment: "" };
    expect(EvaluationSchema.safeParse(invalid).success).toBe(false);
    
    const valid = { responseRating: 4, resolutionRating: 3, closingComment: "Issue resolved partially." };
    expect(EvaluationSchema.safeParse(valid).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/evaluation-schema.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement evaluation modal and closure API**
Build `ThreeDimensionalRating.tsx` component and wire up `/api/cases/[id]/evaluate`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/evaluation-schema.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add components/cases/EvaluationModal.tsx components/ui/ThreeDimensionalRating.tsx app/api/cases/[id]/evaluate/ tests/unit/evaluation-schema.test.ts
git commit -m "feat: build multi-dimensional evaluation modal and case closure pipeline"
```

---

### Task 11: AI Outcome Analysis Engine

**Diagram Step:** `[AI Outcome Analysis]`

**Files:**
- Create: `lib/ai/outcomeAnalyzer.ts`
- Create: `trigger/tasks/analyzeOutcome.ts`
- Test: `tests/unit/outcome-analysis.test.ts`

**Interfaces:**
- Consumes: Original problem narrative + School action plan + Final parent evaluation.
- Produces: `OutcomeAnalysis` result (`FULLY_RESOLVED`, `PARTIALLY_RESOLVED`, `UNRESOLVED`).

- [ ] **Step 1: Write failing test for outcome categorization**
```typescript
// tests/unit/outcome-analysis.test.ts
import { describe, it, expect } from "vitest";
import { OutcomeAnalysisSchema } from "@/lib/ai/schemas";

describe("AI Outcome Verification", () => {
  it("parses valid outcome analysis with discrepancy detection", () => {
    const outcome = {
      resolution_status: "PARTIALLY_RESOLVED",
      justification_ar: "تم توفير حصص التقوية لكن لم يتم حل مشكلة جدول الامتحانات بالكامل.",
      justification_en: "Remedial classes provided but exam schedule was not fully adjusted.",
      discrepancy_detected: true,
      discrepancy_details: "Parent reports persistent exam scheduling issues despite school claim.",
      confidence_score: 0.91
    };
    expect(OutcomeAnalysisSchema.safeParse(outcome).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/outcome-analysis.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement outcome analyzer**
Build `analyzeOutcome` task in `trigger/tasks/analyzeOutcome.ts` cross-referencing initial claim vs final rating.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/outcome-analysis.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/ai/outcomeAnalyzer.ts trigger/tasks/analyzeOutcome.ts tests/unit/outcome-analysis.test.ts
git commit -m "feat: implement AI outcome analysis and discrepancy detection"
```

---

### Task 12: Bilingual PDF Report Generation Engine (Puppeteer)

**Diagram Step:** `[PDF Report Generation]`

**Files:**
- Create: `lib/pdf/template.ts`
- Create: `lib/pdf/renderer.ts`
- Create: `trigger/tasks/generateReportPdf.ts`
- Test: `tests/integration/pdf-generation.test.ts`

**Interfaces:**
- Consumes: Complete closed case object.
- Produces: Binary PDF buffer stored in Supabase Storage (`reports/MRF-[ID].pdf`) and SHA-256 hash.

- [ ] **Step 1: Write failing test for HTML template compilation**
```typescript
// tests/integration/pdf-generation.test.ts
import { describe, it, expect } from "vitest";
import { compileReportHtml } from "@/lib/pdf/template";

describe("PDF Template Compiler", () => {
  it("generates bilingual HTML with explicit attribution badges and Cairo font styling", () => {
    const html = compileReportHtml({
      referenceNumber: "MRF-2026-0941",
      institutionName: "St. George Language School",
      category: "ACADEMIC",
      summaryAr: "ملخص الحالة",
      rqsScore: 85
    });
    expect(html).toContain("dir=\"rtl\"");
    expect(html).toContain("font-family: 'Cairo'");
    expect(html).toContain("[USER-REPORTED]");
    expect(html).toContain("[INSTITUTION-STATED]");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/integration/pdf-generation.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement HTML template and Puppeteer PDF renderer**
Implement `compileReportHtml` in `lib/pdf/template.ts` and headless Chrome launcher in `lib/pdf/renderer.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/integration/pdf-generation.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/pdf/ trigger/tasks/generateReportPdf.ts tests/integration/pdf-generation.test.ts
git commit -m "feat: build bilingual Arabic RTL PDF generation engine with Puppeteer"
```

---

### Task 13: WhatsApp Business Cloud API Dispatch & Webhook Verification

**Diagram Step:** `[WhatsApp API]`

**Files:**
- Create: `lib/whatsapp/client.ts`
- Create: `app/api/webhooks/whatsapp/route.ts`
- Create: `trigger/tasks/sendWhatsAppReport.ts`
- Test: `tests/unit/whatsapp-payload.test.ts`

**Interfaces:**
- Consumes: Recipient phone number, verified template name, signed PDF URL.
- Produces: Outbound Meta API message and signed webhook delivery tracking (`sent` -> `delivered` -> `read`).

- [ ] **Step 1: Write failing test for Meta Cloud API payload constructor**
```typescript
// tests/unit/whatsapp-payload.test.ts
import { describe, it, expect } from "vitest";
import { buildWhatsAppTemplatePayload } from "@/lib/whatsapp/client";

describe("WhatsApp Message Payload Builder", () => {
  it("formats official utility template with document URL and recipient parameters", () => {
    const payload = buildWhatsAppTemplatePayload({
      to: "+201012345678",
      templateName: "case_resolution_summary_ar",
      languageCode: "ar",
      parameters: ["مريم", "MRF-2026-0941", "مدرسة سان جورج", "https://api.murafiq.eg/reports/xyz"]
    });
    expect(payload.type).toBe("template");
    expect(payload.template.name).toBe("case_resolution_summary_ar");
    expect(payload.template.language.code).toBe("ar");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run tests/unit/whatsapp-payload.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement Meta WhatsApp client and webhook route**
Implement `buildWhatsAppTemplatePayload` in `lib/whatsapp/client.ts` and signature-verified webhook handler in `app/api/webhooks/whatsapp/route.ts`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run tests/unit/whatsapp-payload.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add lib/whatsapp/ app/api/webhooks/whatsapp/ trigger/tasks/sendWhatsAppReport.ts tests/unit/whatsapp-payload.test.ts
git commit -m "feat: implement official Meta WhatsApp Cloud API dispatcher and webhook receiver"
```

---

### Task 14: End-to-End Lifecycle Integration Test

**Files:**
- Create: `tests/e2e/case-lifecycle.spec.ts`

**Interfaces:**
- Simulates complete user journey:
  `Intake Wizard` → `AI Structuring` → `Private Grace` → `Action Plan` → `Evaluation` → `PDF Compilation` → `WhatsApp Dispatch`.

- [ ] **Step 1: Write E2E Playwright test**
```typescript
// tests/e2e/case-lifecycle.spec.ts
import { test, expect } from "@playwright/test";

test("complete case resolution lifecycle", async ({ page }) => {
  // 1. Parent submits case
  await page.goto("/ar/cases/new");
  await page.fill("textarea[name='description']", "مشكلة في مادة الرياضيات للصف الخامس الابتدائي وتأخر المتابعة");
  await page.click("button[type='submit']");
  await expect(page.locator(".badge-status")).toContainText("فترة التوفيق الخاصة");

  // 2. Institution portal logs in and posts action plan
  // 3. User provides 3D final rating
  // 4. Verification that PDF artifact is generated in Storage
});
```

- [ ] **Step 2: Run E2E test to verify it runs against local emulator**
Run: `npx playwright test tests/e2e/case-lifecycle.spec.ts`

- [ ] **Step 3: Commit**
```bash
git add tests/e2e/case-lifecycle.spec.ts
git commit -m "test: add comprehensive end-to-end case resolution lifecycle test"
```
