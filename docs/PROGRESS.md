# Murafiq (مُرافِق) — Progress & Milestone Tracker (V2.2.1)

> **North Star Metric:** Completed, User-Evaluated Resolution Loops  
> **Current Phase:** All Slices (0 to 7) Completed — Production Launch Ready  
> **Last Updated:** 2026-09-21

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
- [x] Seed verified Decrees 187/2023, 420/2014, and CPA directives with reviewer metadata.
- [x] Build vector similarity search with neutral fallback text.
- [x] Write and pass retrieval precision tests.

### Slice 5: Document Engine & Snapshot Archiving
- [x] Build Puppeteer bilingual Arabic RTL PDF generator with Cairo font integration.
- [x] Implement frozen JSON payload snapshotting in `reports` table.
- [x] Generate SHA-256 integrity digest for PDF validation.
- [x] Write and pass PDF generation and snapshot integrity tests.

### Slice 6: WhatsApp Cloud API Automation
- [x] Build Meta Cloud API client for pre-approved transactional utility templates.
- [x] Implement Trigger.dev idempotent dispatch task with signed 72h download URLs.
- [x] Implement delivery webhook receiver and 30-day phone hashing retention policy.
- [x] Write and pass WhatsApp dispatch and webhook tests.

### Slice 7: Public Platform & Bayesian Benchmark Metrics
- [x] Implement searchable school directory (governorate threshold gated).
- [x] Build public school profiles with Bayesian Adjusted Resolution Score ($BARS$).
- [x] Display verified response rates, recency, and sample size indicators.
- [x] Write and pass BARS calculation and benchmark tests.

---

## 3. Generic Entity Architecture Patch (Version 2.3.0) — 5 Egyptian Sectors
- [x] **Additive Database Migration:** Deployed `20260921000001_generic_entity_sector_patch.sql` supporting `EDUCATION_SCHOOLS`, `HIGHER_EDUCATION`, `GOVERNMENT_PUBLIC`, `COMMERCIAL_COMPANIES`, and `HEALTHCARE_MEDICAL` with zero mutation to initial Slice 0 tables.
- [x] **Sector Metadata Validation:** Implemented strict Zod contracts in `lib/validators/sector-metadata.ts` for all 5 sectors.
- [x] **Config-Driven Sector Taxonomy:** Established versioned category/subcategory hierarchy in `lib/config/taxonomies/index.ts`.
- [x] **Sensitive Identifier Isolation & Law 151/2020:** Built `lib/validators/sensitive-identifiers.ts` enforcing strict client/server rejection of full 14-digit Egyptian National IDs (`/^[23]\d{13}$/`) and physical isolation into `case_sensitive_data`.
- [x] **Sector-Calibrated BARS Priors:** Integrated empirical priors ($\mu_{sector}, m$) into `lib/services/benchmarks.ts` to eliminate cross-sector comparison bias.
- [x] **Canonical Directory & Backward-Compatible Aliasing:** Created `/directory`, `/services`, `/services/[slug]` with sector filter pills, while preserving `/schools` and `/schools/[slug]` as 100% functional aliases.
- [x] **Sector-Scoped Statutory RAG:** Enhanced `lib/ai/rag.ts` and `lib/ai/statutory-data.ts` to tag decrees with `applicable_sectors` and filter candidate laws by sector.
- [x] **Verification:** 21 test files, 132 tests passing cleanly with 0 TypeScript and 0 ESLint errors.

