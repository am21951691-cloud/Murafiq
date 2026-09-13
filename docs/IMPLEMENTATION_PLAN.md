# Murafiq (مُرافِق) — Production Implementation Plan & CLI Execution Guide (V2.2.2)

> **North Star Metric:** Completed, User-Evaluated Resolution Loops  
> **Status:** Approved Source of Truth for Autonomous CLI Agents  
> **Target Execution Agent:** Claude Code / Antigravity Agent / Terminal CLI  
> **Execution Strategy:** Vertical Slices (Slices 0 to 7) with Mandatory Quality, Security & Duplication Gates

---

## 0. MANDATORY PRE-FLIGHT REQUIREMENT (STEP 0)

> [!IMPORTANT]
> **BEFORE GENERATING OR MODIFYING ANY CODE, THE CLI AGENT MUST READ ALL DOCUMENTATION FILES IN `docs/`.**  
> Do not rely on assumptions or conversational memory. Read each file to ensure full contextual alignment with the V2.2.1 architecture:

- [ ] **Step 0.1: Read Product & Architecture Baselines**
  * `docs/PRODUCT_SPEC.md` — Core vision, 3D experience model, human-centric UX loop.
  * `docs/ARCHITECTURE.md` — System topology, 4-vector state engine, and PII boundaries.
  * `docs/DATABASE.md` — Complete PostgreSQL DDL, `case_sensitive_data`, granular RLS, and immutable triggers.
  * `docs/IMPLEMENTATION_PLAN.md` — This execution plan and verification gates.
- [ ] **Step 0.2: Read Specialized Specifications**
  * `docs/AI_SPEC.md` — Frozen assessment schema, prompt injection defense, and configurable adapter.
  * `docs/SECURITY.md` — STRIDE threat matrix, service-role isolation, and audit logging.
  * `docs/MODERATION.md` — 5-stage triage funnel, safeguarding guidance, and publication policy.
  * `docs/UX_SPEC.md` — Design system tokens, Cairo Arabic typography, and RTL layout rules.
  * `docs/TESTING.md` — TDD guidelines, pgTAP RLS tests, and adversarial test scenarios.
  * `docs/PROGRESS.md` — Active tracker for completed milestones and known limitations.
- [ ] **Step 0.3: Confirm Pre-Flight Checks**
  * Confirm understanding of:
    1. 4-Vector State Model (Lifecycle, Moderation, Dispute, Safety are orthogonal).
    2. Physical PII Separation (`case_sensitive_data` is strictly isolated; zero SELECT for schools).
    3. Reproducible RQS (Deterministic calculator over frozen assessment inputs).
    4. Verification Semantics (`[USER-CONFIRMED]` vs `[VERIFIED]`).
    5. Privacy Default (`cases.visibility` defaults to `STRICTLY_PRIVATE`).

---

## 1. System Pipeline Alignment

```
                    ┌────────────────────┐
                    │   Public Platform  │  Slice 7: Directory, Search & Bayesian Benchmarks
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Create Case/Review │  Slice 1: Guided Intake Wizard & PII Isolation
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │  Case Management   │  Slice 1: 4-Vector State Machine & Private Grace
                    └─────────┬──────────┘
                              │
                 ┌────────────┴────────────┐
                 ▼                         ▼
       ┌─────────────────┐       ┌──────────────────┐
       │ Institution     │       │ AI Structuring   │
       │ Dashboard       │       │ & Scoring        │
       │ (Slice 1 & 2)   │       │ (Slice 4: RIE)   │
       └────────┬────────┘       └────────┬─────────┘
                │                         │
                └────────────┬────────────┘
                             ▼
                    ┌────────────────────┐
                    │   Action Plan      │  Slice 2: Milestones & Reproducible RQS
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Resolution Tracking│  Slice 3: Milestone Execution & Dispute Freeze
                    └─────────┬──────────┘
                              │
                              ▼
                    ┌────────────────────┐
                    │ Final Evaluation   │  Slice 3: 3D Rating (Initial at Intake, 2 at Close)
                    └─────────┬──────────┘
                              │
                    ┌─────────┴──────────┐
                    ▼                    ▼
             ┌────────────┐      ┌─────────────┐
             │ AI Outcome │      │ PDF Report  │
             │ Analysis   │      │ Generation   │ (Slice 5: Puppeteer RTL + Snapshot)
             │ (Slice 5)  │      └──────┬──────┘
             └────────────┘             │
                                        ▼
                               ┌────────────────┐
                               │ WhatsApp API   │ (Slice 6: Meta Cloud API)
                               └────────────────┘
```

---

## 2. Mandatory Post-Step Verification Gates (Executed After EVERY Slice)

> [!CAUTION]
> **NO TASK OR SLICE IS COMPLETE UNTIL ALL 5 GATES PASS.**  
> After implementing the code and tests for each slice, the CLI agent MUST execute and report the results of these gates:

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ GATE 1: SECURITY & LEAKAGE AUDIT                                                │
│ • Secret Scan: Grep codebase to ensure SUPABASE_SERVICE_ROLE_KEY is NEVER       │
│   imported or referenced in client-side bundles (app/, components/).            │
│ • PII Leakage Scan: Verify that raw unencrypted descriptions are never stored   │
│   in `cases` or returned in public API payloads.                                │
│ • RLS Audit: Verify that newly added tables have ENABLE ROW LEVEL SECURITY.     │
│ • Input Defense: Verify all API inputs are parsed via strict Zod schemas.       │
├─────────────────────────────────────────────────────────────────────────────────┤
│ GATE 2: DUPLICATION & REDUNDANCY SCAN                                           │
│ • Search for duplicate helper functions, competing utility methods, or         │
│   redundant type declarations across lib/, types/, and components/.             │
│ • Consolidate duplicate logic into canonical modules (DRY principle).           │
├─────────────────────────────────────────────────────────────────────────────────┤
│ GATE 3: AUTOMATED HEALTH & COMPILATION CHECKS                                   │
│ • Typecheck: npx tsc --noEmit (Must pass with 0 errors)                         │
│ • Lint: npm run lint (Must pass with 0 errors)                                  │
│ • Unit & Integration Tests: npm test (100% passing tests)                       │
│ • Production Build: npm run build (Must build successfully without warnings)    │
├─────────────────────────────────────────────────────────────────────────────────┤
│ GATE 4: IMMUTABILITY & AUDIT TRIGGER VERIFICATION                               │
│ • Verify database triggers block UPDATE and DELETE on `case_events`.            │
│ • Confirm report snapshotting captures frozen sanitized data only.              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ GATE 5: PROGRESS DOCUMENTATION & GIT CHECKPOINT                                 │
│ • Check off completed items in `docs/PROGRESS.md`.                              │
│ • Create an atomic git commit: git commit -m "feat(slice-N): <summary>".        │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Vertical Slice Execution Specifications

### Slice 0: System Foundation & Security Scaffolding

* **Goal:** Scaffolding the repository configuration, deploying the production database migrations, configuring Supabase clients, and validating RLS security isolation.
* **Dependencies:** Pre-flight Step 0 completed.

#### Implementation Steps:
- [ ] **Step 0.1: Initialize project configuration files**
  * `package.json` (Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Trigger.dev, Zod, Vitest)
  * `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/globals.css`
  * `lib/utils.ts` (Tailwind class merger `cn()` and Egyptian E.164 phone normalizer `formatEgyptianPhone`)
  * `messages/ar.json`, `messages/en.json` (Bilingual layout strings)
- [ ] **Step 0.2: Deploy Supabase schema migration**
  * Write `supabase/migrations/20260913000001_initial_schema.sql` containing:
    * Enums: `lifecycle_status_enum`, `moderation_status_enum`, `dispute_status_enum`, `safety_status_enum`, `case_category_enum`, `visibility_level_enum`, `verification_method_enum`.
    * Tables: `platform_admins`, `privileged_access_logs`, `institutions`, `institution_branches`, `institution_members`, `cases`, `case_sensitive_data`, `action_plans`, `action_items`, `evaluations`, `verification_records`, `ai_analyses`, `consent_records`, `case_attachments`, `case_events`, `reports`, `whatsapp_dispatches`, `statutory_decrees`, `platform_config`.
    * Immutability trigger `trg_immutable_case_events` on `case_events`.
    * Row Level Security (RLS) policies on all tables.
- [ ] **Step 0.3: Configure Supabase client helpers**
  * `lib/supabase/client.ts` (Browser client with public anon key)
  * `lib/supabase/server.ts` (RSC/Server Action client reading session cookies)
  * `lib/supabase/admin.ts` (Isolated service-role client for background workers only)
- [ ] **Step 0.4: Write and run tests**
  * `tests/unit/utils.test.ts`: Egyptian phone normalization (`01012345678` $\rightarrow$ `+201012345678`).
  * `tests/integration/rls.test.ts`: Verifies institution staff cannot SELECT from `case_sensitive_data`.
  * CLI command: `npx vitest run tests/unit/utils.test.ts tests/integration/rls.test.ts`
- [ ] **Step 0.5: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security & Secret scan): Ensure `admin.ts` is never imported by client files.
  * Gate 2 (Duplication scan): Verify zero duplicate phone normalizers or Supabase instances.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Run SQL test asserting that `DELETE FROM case_events` throws an exception.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-0): system foundation, database schema, and RLS scaffolding"`.

---

### Slice 1: Private Intake & Institutional Triage Loop

* **Goal:** A parent submits an issue privately; the school receives an alert and acknowledges it in their portal during the private grace window.
* **Dependencies:** Slice 0.

#### Implementation Steps:
- [ ] **Step 1.1: Build Guided Intake Wizard**
  * `app/[locale]/(parent)/cases/new/page.tsx`
  * `components/cases/IntakeWizard.tsx` (Bilingual RTL step wizard: School selection, category, impact rating $R_{exp}$ 1–5, desired outcome, privacy toggle defaulting to `STRICTLY_PRIVATE`).
  * `components/cases/PhoneVerificationModal.tsx` (E.164 phone verification).
- [ ] **Step 1.2: Build Intake Submission API & PII Decoupling**
  * `app/api/cases/submit/route.ts`:
    * Runs Layer 1 regex sanitizer on input text.
    * Inserts operational record into `cases` (storing `sanitized_description` and default `visibility = 'STRICTLY_PRIVATE'`).
    * Inserts encrypted raw narrative into `case_sensitive_data`.
    * Inserts user consent record into `consent_records`.
    * Emits immutable event into `case_events`.
- [ ] **Step 1.3: Build Institution Portal Triage Dashboard**
  * `app/[locale]/(institution)/portal/dashboard/page.tsx`
  * `components/institution/CaseTriageCard.tsx` (Displays active cases in `PRIVATE_GRACE` with remaining days countdown).
  * `app/api/institution/acknowledge/route.ts` (Advances lifecycle from `PRIVATE_GRACE` to `ACTION_PLAN_PENDING`).
- [ ] **Step 1.4: Write and run tests**
  * `tests/unit/intake-sanitizer.test.ts`: Regex strips 14-digit National IDs and phone numbers.
  * `tests/integration/case-intake.test.ts`: Full API test verifying rows created in `cases`, `case_sensitive_data`, and `consent_records`.
  * CLI command: `npx vitest run tests/unit/intake-sanitizer.test.ts tests/integration/case-intake.test.ts`
- [ ] **Step 1.5: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Ensure `raw_description_encrypted` is never sent in `/api/cases/submit` response.
  * Gate 2 (Duplication check): Scan for duplicate form field components or validation rules.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Verify `case_events` logs `CASE_SUBMITTED` event.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-1): private intake wizard, PII separation, and institution triage loop"`.

---

### Slice 2: Structured Action Plan & Milestone Builder

* **Goal:** School operations lead formulates an action plan with milestones; the system computes a reproducible RQS score from frozen structured inputs.
* **Dependencies:** Slice 1.

#### Implementation Steps:
- [ ] **Step 2.1: Build Interactive Action Plan Builder**
  * `components/institution/ActionPlanBuilder.tsx`:
    * Input for official institutional statement.
    * Dynamic milestone list (Title, Owner Department/Role, Target Due Date, Deliverable Output).
- [ ] **Step 2.2: Implement Deterministic RQS Calculator**
  * `lib/ai/scoring.ts`:
    * Consumes frozen assessment inputs: Problem Alignment ($30\%$), Specificity ($20\%$), Ownership ($20\%$), Category Timeline Heuristic ($15\%$), Measurability ($15\%$).
    * Applies deductions for vagueness and missing roles.
    * Pure deterministic function (same inputs $\rightarrow$ exact same score).
- [ ] **Step 2.3: Build Action Plan Submission API**
  * `app/api/institution/action-plan/route.ts`:
    * Enforces RLS: only `ADMIN` or `OPS_LEAD` can submit.
    * Calls AI extraction adapter to generate structured milestone assessment.
    * Stores assessment record in `ai_analyses`.
    * Computes RQS via deterministic calculator.
    * Inserts `action_plans` and `action_items` records.
    * Advances case lifecycle to `IN_PROGRESS`.
- [ ] **Step 2.4: Write and run tests**
  * `tests/unit/rqs-score.test.ts`: Tests deterministic calculator across 10 sample plans; verifies 100% reproducibility.
  * CLI command: `npx vitest run tests/unit/rqs-score.test.ts`
- [ ] **Step 2.5: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Confirm only `ADMIN` and `OPS_LEAD` tokens can submit action plans.
  * Gate 2 (Duplication check): Ensure scoring calculation logic is not duplicated in frontend components.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Verify `case_events` records `ACTION_PLAN_POSTED` with RQS score.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-2): action plan constructor, frozen AI assessment, and deterministic RQS engine"`.

---

### Slice 3: Milestone Tracking, 3D Evaluation & Case Closure

* **Goal:** School marks milestones complete with verification evidence; parent evaluates the resolution using the 3D model; case closes.
* **Dependencies:** Slice 2.

#### Implementation Steps:
- [ ] **Step 3.1: Build Milestone Execution & Verification Tracker**
  * `components/cases/MilestoneTracker.tsx` (School checks off milestones; attaches verification proof).
  * `app/api/cases/milestones/complete/route.ts` (Creates `verification_records` row and marks milestone completed).
- [ ] **Step 3.2: Build 3-Dimensional Experience Model Closure Flow**
  * `components/cases/EvaluationModal.tsx`:
    * Collects Response Rating ($R_{resp}$ 1–5) and Resolution Rating ($R_{res}$ 1–5).
    * Collects parent closing feedback.
  * `app/api/cases/evaluate/route.ts` (Inserts `evaluations` record; marks lifecycle `CLOSED` and `closure_reason = 'COMPLETED_EVALUATED'`).
- [ ] **Step 3.3: Implement Inactivity Timeout & Dispute Freezing**
  * `trigger/tasks/handleInactivityTimeout.ts`:
    * If parent is inactive for 14 days post-milestones, marks `CLOSED` with `closure_reason = 'USER_INACTIVITY_TIMEOUT'` and outcome `INSUFFICIENT_INFORMATION`.
    * Freezes timer if `dispute_status = 'OPEN'`.
- [ ] **Step 3.4: Write and run tests**
  * `tests/unit/evaluation-closure.test.ts`: Verifies complete 3D model ratings ($R_{exp}$ at intake, $R_{resp}$ and $R_{res}$ at closure).
  * `tests/unit/dispute-pause.test.ts`: Proves opening a dispute pauses the 14-day inactivity countdown.
  * CLI command: `npx vitest run tests/unit/evaluation-closure.test.ts tests/unit/dispute-pause.test.ts`
- [ ] **Step 3.5: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Verify parent can only evaluate their own case.
  * Gate 2 (Duplication check): Verify single canonical state-transition helper handles closure.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Assert timeout closure records `INSUFFICIENT_INFORMATION` and never "resolved".
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-3): milestone tracking, 3D experience closure, and dispute timer freezing"`.

---

### Slice 4: Curated Egyptian Statutory RAG Layer (Option B)

* **Goal:** Ingest and retrieve human-verified Egyptian ministerial decrees with neutral fallback behavior.
* **Dependencies:** Slice 3.

#### Implementation Steps:
- [ ] **Step 4.1: Seed Curated Statutory Decrees**
  * `scripts/seed-statutory-decrees.ts`: Ingests Decrees 187/2023 and 420/2014 with verified reviewer metadata (`verified_by_user_id`, `last_verified_date`, `legal_status = 'VERIFIED_ACTIVE'`).
- [ ] **Step 4.2: Build Statutory Retrieval Module**
  * `lib/ai/rag.ts`:
    * Cosine similarity retrieval over `statutory_decrees` embeddings.
    * Fallback guard: If no match exceeds empirical threshold, outputs:
      > *"No directly relevant source was found in the current curated knowledge base."*
- [ ] **Step 4.3: Write and run tests**
  * `tests/unit/rag-retrieval.test.ts`: Verifies retrieval returns relevant decree for student discipline queries; returns exact fallback text for unindexed topics.
  * CLI command: `npx vitest run tests/unit/rag-retrieval.test.ts`
- [ ] **Step 4.4: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Ensure retrieved text cannot override system instructions (prompt injection defense).
  * Gate 2 (Duplication check): Confirm single embedding client is reused across RAG and AI modules.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Verify decree metadata contains valid human reviewer IDs.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-4): curated statutory RAG layer with human verification gates and neutral fallback"`.

---

### Slice 5: Document Engine & Snapshot Archiving

* **Goal:** Render high-resolution bilingual Arabic RTL resolution reports with SHA-256 integrity digests and frozen sanitized payload snapshots.
* **Dependencies:** Slice 3.

#### Implementation Steps:
- [ ] **Step 5.1: Build Bilingual HTML/Handlebars Report Template**
  * `lib/pdf/templates/resolution-report.hbs` (Embedded Cairo Arabic font, explicit attribution badges `[USER-REPORTED]`, `[INSTITUTION-STATED]`, `[USER-CONFIRMED]`, `[VERIFIED]`, and mandatory non-judicial disclaimer).
- [ ] **Step 5.2: Build Headless Puppeteer Compiler & Storage Task**
  * `lib/pdf/renderer.ts`: Containerized Puppeteer PDF renderer.
  * `trigger/tasks/generateReportPdf.ts`:
    * Compiles frozen case data into `report_payload_snapshot` (sanitized data only, zero raw PII).
    * Renders PDF buffer and computes SHA-256 integrity digest (`sha256_digest`).
    * Stores PDF in Supabase Storage (`reports/case_{id}_v{version}.pdf`).
    * Inserts record into `reports`.
- [ ] **Step 5.3: Write and run tests**
  * `tests/integration/pdf-generation.test.ts`: Verifies generated PDF matches SHA-256 digest and renders Arabic text without overflow.
  * CLI command: `npx vitest run tests/integration/pdf-generation.test.ts`
- [ ] **Step 5.4: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Assert `report_payload_snapshot` does NOT contain raw phone or encrypted text.
  * Gate 2 (Duplication check): Scan for redundant PDF styling or font-loader definitions.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Confirm report record is linked to immutable case version.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-5): Puppeteer bilingual RTL PDF engine with SHA-256 digest and snapshot archiving"`.

---

### Slice 6: WhatsApp Cloud API Automation

* **Goal:** Deliver the completed resolution report to parents via official WhatsApp messages with signed 72h access URLs and delivery status tracking.
* **Dependencies:** Slice 5.

#### Implementation Steps:
- [ ] **Step 6.1: Build Meta Cloud API Client**
  * `lib/whatsapp/client.ts` (Formats transactional utility template `case_resolution_document_ar`).
- [ ] **Step 6.2: Build Dispatch Worker with Idempotency & Hashing**
  * `trigger/tasks/sendWhatsAppReport.ts`:
    * Idempotency key `wa_msg_{case_id}_{version}` prevents duplicate sends.
    * Generates temporary 72-hour signed download URL.
    * Dispatches message and logs record to `whatsapp_dispatches`.
    * Implements 30-day phone hashing retention task (`purge-phone-numbers`).
- [ ] **Step 6.3: Build Webhook Status Handler**
  * `app/api/webhooks/whatsapp/route.ts`:
    * Verifies HMAC-SHA256 signature from Meta.
    * Updates `whatsapp_dispatches.delivery_status` (`sent` $\rightarrow$ `delivered` $\rightarrow$ `read`).
    * **Strict Rule:** Delivery webhooks never mutate case lifecycle status.
- [ ] **Step 6.4: Write and run tests**
  * `tests/unit/whatsapp-payload.test.ts`: Verifies payload structure and template parameter mapping.
  * `tests/integration/whatsapp-webhook.test.ts`: Verifies signature validation and status tracking.
  * CLI command: `npx vitest run tests/unit/whatsapp-payload.test.ts tests/integration/whatsapp-webhook.test.ts`
- [ ] **Step 6.5: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Assert webhook verifies HMAC signature before processing.
  * Gate 2 (Duplication check): Verify single WhatsApp client instance is used across workers.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Assert webhook receipts update dispatch records without mutating cases.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-6): Meta WhatsApp Cloud API dispatcher, signed URLs, and webhook tracking"`.

---

### Slice 7: Public Platform & Bayesian Benchmark Metrics

* **Goal:** Launch the public institution directory and profiles with Bayesian Adjusted Resolution Scores, confidence indicators, and sample thresholds.
* **Dependencies:** Slices 1–6.

#### Implementation Steps:
- [ ] **Step 7.1: Build Public Institution Directory & Search**
  * `app/[locale]/(public)/page.tsx`, `app/[locale]/(public)/schools/page.tsx`
  * Enforces governorate threshold gate: Directory only renders schools if governorate has $\ge 10$ participating institutions.
- [ ] **Step 7.2: Build School Profile with Bayesian Metrics**
  * `app/[locale]/(public)/schools/[slug]/page.tsx`
  * `lib/services/benchmarks.ts`:
    * Computes Bayesian Adjusted Resolution Score ($BARS$) using configurable parameters ($m=3.0, C=10$).
    * Displays *"Establishing Benchmark (N cases)"* if closed cases $< 5$.
    * Shows User-Confirmed Resolution Rate ($UCRR$), median response time, and 12-month recency context.
  * Public case stream displays approved public cases with explicit attribution badges.
- [ ] **Step 7.3: Write and run tests**
  * `tests/unit/bars-calculation.test.ts`: Validates Bayesian weighting and verifies threshold display logic.
  * CLI command: `npx vitest run tests/unit/bars-calculation.test.ts`
- [ ] **Step 7.4: Run Mandatory Post-Step Gates (Gates 1–5)**
  * Gate 1 (Security check): Ensure private or safety-flagged cases NEVER appear in public queries.
  * Gate 2 (Duplication check): Ensure public and private profile components share base UI tokens cleanly.
  * Gate 3 (Health): `npx tsc --noEmit && npm run lint && npm test`.
  * Gate 4 (Audit check): Confirm Bayesian benchmark displays sample size context alongside score.
  * Gate 5 (Checkpoint): Update `docs/PROGRESS.md` and commit: `git commit -m "feat(slice-7): public directory, school profiles, and Bayesian benchmark metrics"`.

---

## 4. Claude Code CLI Quick-Start Command

When starting execution, invoke the CLI agent with this command:

```bash
# Kickoff Command for Claude Code / CLI:
"Read all files in docs/ first (Step 0). Then implement Slice 0 (System Foundation & Security Scaffolding). Execute all tasks in Step 0.1 through Step 0.4, and do not mark Slice 0 complete until all 5 Post-Step Verification Gates in Gate 1-5 pass cleanly. Update docs/PROGRESS.md and commit upon completion."
```
