# Murafiq (مُرافِق) — Progress & Milestone Tracker (V2.2.1)

> **North Star Metric:** Completed, User-Evaluated Resolution Loops  
> **Current Phase:** Slice 1 Completed — Ready for Slice 2  
> **Last Updated:** 2026-09-13

---

## 1. Documentation & Architecture Baselines (Approved)

- [x] `docs/PRODUCT_SPEC.md` — Product principles, 3D experience model, and case lifecycle.
- [x] `docs/ARCHITECTURE.md` — Decoupled 4-vector state model, PII boundaries, and system topology.
- [x] `docs/DATABASE.md` — Production PostgreSQL schema with `case_sensitive_data`, `platform_admins`, and granular RLS.
- [x] `docs/IMPLEMENTATION_PLAN.md` — Slices 0 to 7 vertical-slice execution blueprint.

---

## 2. Vertical Slice Execution Tracker

### Slice 0: System Foundation & Security Scaffolding
- [x] Initialize repository configuration (`package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`).
- [x] Deploy initial Supabase migration (`20260913000001_initial_schema.sql`) with enums, tables, and immutability triggers.
- [x] Configure Supabase client, server, and admin helper modules (`lib/supabase/`).
- [x] Implement Egyptian E.164 phone normalization utility (`lib/utils.ts`).
- [x] Configure bilingual dictionary tokens (`messages/ar.json`, `messages/en.json`).
- [x] Write and pass unit tests (`tests/unit/utils.test.ts`) and RLS tests (`tests/integration/rls.test.ts`).

### Slice 1: Private Intake & Institutional Triage Loop
- [x] Build guided intake wizard capturing initial impact rating ($R_{exp}$ 1–5).
- [x] Implement `/api/cases/submit` routing sensitive narrative to `case_sensitive_data`.
- [x] Implement configurable 7-day private grace period engine.
- [x] Build institution portal triage dashboard showing active grace countdowns.
- [x] Write and pass intake and triage integration tests.

### Slice 2: Structured Action Plan & Milestone Builder
- [x] Build interactive action plan constructor with department role and due date inputs.
- [x] Implement deterministic RQS calculator consuming frozen assessment inputs.
- [x] Wire up `/api/institution/action-plan` route.
- [x] Write and pass RQS reproducibility unit tests.

### Slice 3: Milestone Tracking, 3D Evaluation & Case Closure
- [x] Build milestone execution toggles and verification record creator.
- [x] Build 3-dimensional evaluation closure modal (capturing $R_{resp}$ and $R_{res}$ 1–5).
- [x] Implement inactivity timeout worker (marks `USER_INACTIVITY_TIMEOUT`, never resolved).
- [x] Implement dispute timer freezing logic.
- [x] Write and pass evaluation closure tests.

### Slice 4: Curated Egyptian Statutory RAG Layer (Option B)
- [ ] Seed verified Decrees 187/2023, 420/2014, and CPA directives with reviewer metadata.
- [ ] Build vector similarity search with neutral fallback text.
- [ ] Write and pass retrieval precision tests.

### Slice 5: Document Engine & Snapshot Archiving
- [ ] Build Puppeteer bilingual Arabic RTL PDF generator with Cairo font integration.
- [ ] Implement frozen JSON payload snapshotting in `reports` table.
- [ ] Generate SHA-256 integrity digest for PDF validation.
- [ ] Write and pass PDF generation and snapshot integrity tests.

### Slice 6: WhatsApp Cloud API Automation
- [ ] Build Meta Cloud API client for pre-approved transactional utility templates.
- [ ] Implement Trigger.dev idempotent dispatch task with signed 72h download URLs.
- [ ] Implement delivery webhook receiver and 30-day phone hashing retention policy.
- [ ] Write and pass WhatsApp dispatch and webhook tests.

### Slice 7: Public Platform & Bayesian Benchmark Metrics
- [ ] Implement searchable school directory (governorate threshold gated).
- [ ] Build public school profiles with Bayesian Adjusted Resolution Score ($BARS$).
- [ ] Display verified response rates, recency, and sample size indicators.
- [ ] Write and pass BARS calculation and benchmark tests.
