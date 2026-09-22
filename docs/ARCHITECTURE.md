# Murafiq (مُرافِق) — Enterprise System Architecture

> **Version:** 3.0  
> **Status:** Production Architecture Specification  
> **North Star Metric:** Completed, User-Evaluated Resolution Loops  
> **Architecture Pattern:** Multi-Tenant Enterprise Application (Hybrid Storage + Strict Isolation)

---

## 1. System Topology & Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT & PORTAL LAYER                             │
│                                                                             │
│  ┌───────────────────────┐  ┌───────────────────────┐  ┌─────────────────┐  │
│  │  Beneficiary Portal   │  │  Staff Ops Workspace  │  │ Org Admin & BI  │  │
│  │  • Intake Wizard      │  │  • Triage & Routing   │  │ • Depts & SLAs  │  │
│  │  • Ticket Tracking    │  │  • Action Plan Engine │  │ • Executive BI  │  │
│  │  • Resolution Eval    │  │  • Internal Notes     │  │ • Staff Roles   │  │
│  └───────────────────────┘  └───────────────────────┘  └─────────────────┘  │
│                                                                             │
│  Built with Next.js 15 (App Router, React 19, Tailwind CSS, next-intl)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │ HTTPS / REST / WebSockets
┌──────────────────────────────────────▼──────────────────────────────────────┐
│                     APPLICATION & INTEGRATION LAYER                         │
│                                                                             │
│  ┌───────────────────────────────┐     ┌─────────────────────────────────┐  │
│  │   Enterprise REST API (v1)    │     │      Auth & RBAC Middleware     │  │
│  │   • Cases, Departments, SLAs  │     │      • Session JWT + API Keys   │  │
│  │   • Analytics, Webhooks       │     │      • Multi-Tenant Scoping     │  │
│  └──────────────┬────────────────┘     └────────────────┬────────────────┘  │
│                 │                                       │                   │
│  ┌──────────────▼───────────────────────────────────────▼────────────────┐  │
│  │                         Core Service Domain                           │  │
│  │   • Cases & Triage Service       • SLA Engine & Working Hours         │  │
│  │   • Action Plan & RQS Engine     • Tenant Admin & Branding Service    │  │
│  │   • Statutory Legal RAG          • WhatsApp & Notification Service    │  │
│  │   • Puppeteer PDF Engine         • Cryptographic Digest (SHA-256)     │  │
│  └──────────────────────────────────────┬────────────────────────────────┘  │
└─────────────────────────────────────────┼───────────────────────────────────┘
                                          │
┌─────────────────────────────────────────▼───────────────────────────────────┐
│                          DATA PERSISTENCE LAYER                             │
│                                                                             │
│  ┌─────────────────────────────────┐   ┌─────────────────────────────────┐  │
│  │   PostgreSQL (Supabase)         │   │   Hybrid Storage Adapter        │  │
│  │   • `cases`, `action_plans`     │   │   • Database-first repository   │  │
│  │   • `institution_departments`   │   │   • In-memory tenant fallback   │  │
│  │   • `case_internal_notes`       │   │   • Local persistence backup    │  │
│  │   • `case_events` (Immutable)   │   │   • Zero-data-loss resilience   │  │
│  │   • `case_sensitive_data` (PII) │   │                                 │  │
│  └─────────────────────────────────┘   └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Architectural Tenets

### 2.1 Multi-Tenant Isolation
- **Tenant Scope:** Every operational entity (`cases`, `departments`, `sla_configs`, `branding`, `notes`) is partition-keyed by `tenant_id` (or `institution_id`).
- **Row Level Security (RLS):** Supabase database policies prevent cross-tenant information leakage at the database query engine level.
- **Tenant Self-Configuration:** Each organization administers its own departments, SLA thresholds, brand assets, and staff roles without platform redeployment.

### 2.2 Decoupled 4-Vector State Machine
The lifecycle of each case is governed by 4 independent vectors rather than a single linear status:
1. `lifecycle_status`: `DRAFT` ➔ `SUBMITTED` ➔ `PRIVATE_GRACE` ➔ `ACTION_PLAN_PENDING` ➔ `IN_PROGRESS` ➔ `WAITING_FOR_EVALUATION` ➔ `CLOSED`.
2. `moderation_status`: `PENDING` ➔ `APPROVED` ➔ `FLAGGED` ➔ `REJECTED`.
3. `dispute_status`: `NONE` ➔ `DISPUTED` ➔ `MEDIATING` ➔ `RESOLVED`.
4. `safety_status`: `CLEAR` ➔ `REVIEW_REQUIRED` ➔ `SENSITIVE_QUARANTINED`.

### 2.3 Physical PII Boundary (Law 151/2020 Compliance)
- Full Egyptian National IDs (14 digits) are sanitized from public payloads.
- Personal identifying narratives and contact information are quarantined in `case_sensitive_data`.
- Frontline institution staff inspect operational facts, categories, and evidence while sensitive PII remains strictly gated.

### 2.4 Deterministic Resolution Quality Score (RQS)
- The RQS calculation (`lib/services/rqs.ts`) is 100% deterministic and reproducible based on:
  - Phase structure completeness (Diagnosis, Corrective Action, Preventive Safeguards).
  - Clear milestone accountability with defined roles.
  - Realistic time-to-deliver benchmarks.

### 2.5 Tamper-Evident Audit Trail
- System actions, status changes, internal notes, and milestone completions append to `case_events`.
- Database triggers strictly block `UPDATE` and `DELETE` operations on `case_events`.
- Official resolution reports embed a SHA-256 integrity hash verifiable against the archived database record.

---

## 3. Technology Stack Summary

| Dimension | Enterprise Choice | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 15 (App Router) | High-performance server-rendered components, native Arabic RTL support via `next-intl`. |
| **Language** | TypeScript 5.8 (Strict) | End-to-end type safety, verified schemas, zero compiler discrepancies. |
| **UI Library** | React 19 + Tailwind CSS | Highly customizable, fluid layout tokens, zero runtime style overhead. |
| **Database** | PostgreSQL 15+ via Supabase | Managed ACID transactions, JSONB document fields, pgvector support, robust RLS. |
| **Dual AI Models** | NVIDIA NIM API | Low-latency inference: `nemotron-3.5-lightning-30b` (Concierge) & `meta/muse-glimmer-30b` (Advisor). |
| **Document Generation** | Puppeteer + Handlebars | Serverless PDF rendering of authentic bilingual resolution certificates with Cairo typography. |
| **Notifications** | Meta WhatsApp Cloud API | Official enterprise channel in Egypt for instant delivery of case milestones and reference links. |
| **Testing** | Vitest 3.0 | Fast, isolated unit and integration test runner with 100% passing suites. |

---

## 4. Directory Structure

```
Murafiq/
├── app/                              # Next.js App Router
│   ├── [locale]/
│   │   ├── (institution)/portal/     # Staff, Admin, Analytics portals
│   │   │   ├── admin/                # Tenant administrative control center
│   │   │   ├── dashboard/            # Case triage, queue management, assignments
│   │   │   └── analytics/            # Executive SLA and performance BI
│   │   ├── (parent)/cases/           # Beneficiary intake and case exploration
│   │   ├── track/                    # Public ticket tracking interface
│   │   └── page.tsx                  # Institutional marketing & portal entry
│   └── api/
│       ├── v1/                       # Versioned public integration APIs
│       ├── institution/              # Internal portal APIs (triage, notes, admin)
│       ├── cases/                    # Case submission, tracking, evaluation
│       └── ai/                       # AI Concierge and Solution Advisor
├── components/                       # Shared UI components
│   ├── institution/                  # Triage cards, timeline, notes, action plan
│   ├── cases/                        # Intake wizard, tracking cards, milestones
│   └── ai/                           # AI Chatbot & Advisor widgets
├── lib/                              # Core application business logic
│   ├── config/                       # Sector taxonomies, defaults, regulations
│   ├── services/                     # Cases, SLA engine, tenant admin, analytics
│   ├── supabase/                     # DB client, server helpers, admin client
│   └── validators/                   # Zod schemas for multi-sector data validation
├── docs/                             # Engineering & architectural documentation
├── supabase/migrations/              # PostgreSQL schema migrations & RLS definitions
└── tests/                            # Unit & integration test suites
```
