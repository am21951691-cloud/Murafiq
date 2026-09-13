# Murafiq (مُرافِق) — System Architecture (V2.2.1)

> **Status:** Approved Source of Truth  
> **Last Updated:** 2026-09-13  
> **North Star Metric:** Completed, User-Evaluated Resolution Loops

---

## 1. System Topology

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  Next.js 15 (App Router, React 19, Server Components)       │
│  shadcn/ui + Tailwind CSS + next-intl (Bilingual RTL/LTR)   │
│  Deployed on Vercel                                         │
└──────────────┬──────────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────────┐
│                    BACKEND LAYER                            │
│                                                             │
│  ┌─────────────────┐    ┌──────────────────────────────┐   │
│  │  Next.js API     │    │  Supabase                     │   │
│  │  Routes          │───▶│  PostgreSQL 15+ + RLS + Auth  │   │
│  │  (orchestration) │    │  + Storage + pgvector         │   │
│  └────────┬─────────┘    │  + Audit Triggers             │   │
│           │              └──────────────────────────────┘   │
│           │                                                 │
│  ┌────────▼─────────┐    ┌──────────────────────────────┐   │
│  │  Trigger.dev v3  │    │  Supabase Edge Functions      │   │
│  │  (durable async  │    │  (lightweight webhooks)       │   │
│  │   workers)       │    └──────────────────────────────┘   │
│  └────────┬─────────┘                                       │
└───────────┼─────────────────────────────────────────────────┘
            │
┌───────────▼─────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                         │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌────────┐  ┌──────────┐     │
│  │ LLM API  │  │ WhatsApp │  │ Resend │  │ Sentry   │     │
│  │ (Adapter)│  │ Cloud    │  │ (email)│  │ (monitor)│     │
│  │ GPT-4o-m │  │ API      │  │        │  │          │     │
│  └──────────┘  └──────────┘  └────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Principles (V2.2.1)

1. **4-Vector Orthogonal State Machine:** Separates `lifecycle_status` from `moderation_status`, `dispute_status`, and `safety_status`.
2. **Physical Separation of Sensitive Data:** Raw unredacted text is stored exclusively in `case_sensitive_data` with zero SELECT access for institution staff.
3. **RQS Reproducibility:** Computed by a deterministic calculator from frozen structured inputs stored in `ai_analyses`.
4. **Verifiable Audit Log:** `case_events` is made immutable via database triggers preventing UPDATE and DELETE.
5. **Human-Curated Statutory RAG (Option B):** Only human-verified active Egyptian regulations (`statutory_decrees`) are indexed; fallback is neutral.
6. **Privacy by Default:** `cases.visibility` defaults to `STRICTLY_PRIVATE`. Public publishing requires an explicit opt-in and approved moderation.
7. **Document Integrity:** PDF reports store a SHA-256 integrity digest and a sanitized JSON snapshot (`report_payload_snapshot`). WhatsApp delivers a temporary signed URL (72h TTL).

---

## 3. Technology Stack & Rationale

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15 (App Router) | SSR for public profiles, first-class RSC performance, native RTL support via `next-intl`. |
| **Styling** | Tailwind CSS + shadcn/ui | Full control over components, directional layout tokens (`ps-*`, `pe-*`), zero lock-in. |
| **Database** | Supabase (PostgreSQL 15+) | Managed PostgreSQL, built-in Auth, Storage buckets, Row Level Security, Realtime, `pgcrypto`. |
| **Background Jobs** | Trigger.dev v3 | Type-safe async worker queues for long-running AI extraction, PDF rendering, and WhatsApp dispatch. |
| **AI Layer** | Configurable `AiProviderAdapter` | Abstracted provider interface (defaults to OpenAI `gpt-4o-mini` with strict Zod structured outputs). |
| **PDF Generation** | Puppeteer | Headless browser rendering of HTML/CSS templates with Cairo Arabic font integration. |
| **WhatsApp Delivery** | Official Meta Cloud API | Enterprise delivery reliability in Egypt, transactional utility templates, webhook delivery status tracking. |
| **Observability** | Sentry | Error tracing, API latency profiling, background worker performance. |
    │  │        │  │          │     │
│  └──────────┘  └──────────┘  └────────┘  └──────────┘     │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Choices & Rationale

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| **Frontend** | Next.js 15 (App Router) | SSR for SEO-indexed public school profiles; first-class RSC performance; integrated API routes. |
| **Styling** | Tailwind CSS + shadcn/ui | Full control over components, RTL support, consistent design tokens. |
| **Database** | Supabase (PostgreSQL 15+) | Managed PostgreSQL, built-in Auth, Storage buckets, Row Level Security, Realtime websockets. |
| **Background Jobs** | Trigger.dev v3 | Type-safe async worker queues for long-running AI extraction, PDF rendering, and WhatsApp dispatch. |
| **AI Models** | OpenAI (GPT-4o-mini & GPT-4o) | Reliable structured JSON output parsing; excellent Arabic dialect comprehension; low unit cost. |
| **PDF Generation** | Puppeteer | Headless browser rendering of HTML/CSS templates ensures flawless Arabic typography and RTL layout. |
| **WhatsApp Delivery** | WhatsApp Business Cloud API | Official Meta API, reliable message delivery in Egypt, signed webhooks. |
| **Observability** | Sentry | Error tracing, API latency profiling, background worker performance. |

---

## 3. Directory Structure

```
murafiq/
├── app/                              # Next.js App Router (public, auth, dashboard, institution, admin)
├── components/                       # UI components (shadcn base, cases, institutions, reports)
├── lib/                              # Core logic (supabase, ai, whatsapp, pdf, moderation, state machine)
├── types/                            # TypeScript interfaces (database.ts, ai.ts, api.ts)
├── supabase/                         # Migrations, seed.sql, RLS policies, config.toml
├── trigger/                          # Trigger.dev background worker jobs
├── tests/                            # Vitest unit/integration, Playwright E2E, pgTAP RLS tests
├── messages/                         # ar.json & en.json i18n dictionaries
└── docs/                             # Engineering & Product documentation
```
