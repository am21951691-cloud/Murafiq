# Murafiq — API Architecture & Integration Specification

> **Version:** 3.0  
> **Primary Specification:** See [docs/API_REFERENCE.md](API_REFERENCE.md) for full REST API v1 endpoint parameters, schemas, and responses.

---

## 1. API Layers Overview

Murafiq separates its API surface into two decoupled tiers:

### Tier 1: Public Enterprise REST API (`/api/v1/*`)
Designed for external integration with institutional software (SIS, HIS, CRM, ERP, and internal portals).
- **Authentication:** Bearer token API key (`Authorization: Bearer mrf_live_...`) or session JWT.
- **Tenant Context:** Inferred from key or `x-tenant-id` header.
- **Rate Limiting:** In-memory token bucket enforcing 120 req/min/IP.
- **Endpoints:**
  - `GET /api/v1/cases`: List tenant cases with status/priority/department filtering and pagination.
  - `POST /api/v1/cases`: Programmatically submit a case.
  - `GET /api/v1/cases/:id`: Detailed case view, action plans, and milestones.
  - `GET /api/v1/departments`: Active departments with SLA and case loads.
  - `GET /api/v1/analytics`: Executive SLA compliance, median times, and department metrics.

### Tier 2: Internal Portal Operations API (`/api/institution/*` & `/api/cases/*`)
Powers the frontend workspaces:
- `/api/institution/admin`: Tenant branding, SLA matrix, department, and staff CRUD.
- `/api/institution/cases`: Case triage list with role-based filtering.
- `/api/institution/cases/:id`: Single case workspace bundle.
- `/api/institution/assign`: Department and priority routing.
- `/api/institution/action-plan`: 3-stage action plan creation.
- `/api/institution/notes`: Staff-only protected internal notes.
- `/api/cases/submit`: Guided beneficiary intake with PII sanitization.
- `/api/cases/:id`: Beneficiary case tracking lookup.
- `/api/cases/milestones/complete`: Milestone execution and verification.
- `/api/cases/evaluate`: Final beneficiary 3D evaluation and closure.

---

## 2. Webhooks & Async Notifications

- **WhatsApp Cloud API:** Delivery receipts and incoming status webhooks at `/api/webhooks/whatsapp`.
- **Integrity Validation:** HMAC-SHA256 signature verification on all incoming webhook payloads.
