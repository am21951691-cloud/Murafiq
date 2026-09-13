# Murafiq — REST & Webhook API Specification

> **Version:** 1.0  
> **Auth:** Supabase Bearer JWT

---

## 1. Authentication Endpoints

- `POST /auth/signup`: User registration (email, password, phone, names, language).
- `POST /auth/login`: Standard session authentication.
- `POST /auth/verify-phone`: Verifies OTP SMS for Egyptian mobile numbers.

---

## 2. Cases API (`/api/cases`)

- `POST /api/cases`: Create case in `DRAFT` status.
- `PUT /api/cases/{id}`: Update case draft content.
- `POST /api/cases/{id}/submit`: Transitions `DRAFT` to `SUBMITTED`, triggering AI structuring & auto-moderation.
- `GET /api/cases/{id}`: Retrieve case details, action plans, responses, and events.
- `GET /api/cases`: List authenticated user's submitted cases.
- `POST /api/cases/{id}/evaluate`: Submit parent final evaluation (Response & Resolution ratings).

---

## 3. Institutions API (`/api/institutions`)

- `GET /api/institutions`: Public directory search and filter.
- `GET /api/institutions/{slug}`: Institution profile, metrics, and public case history.
- `POST /api/institutions`: Claim or register institution profile.
- `POST /api/cases/{id}/responses`: Submit official institution statement.
- `POST /api/cases/{id}/action-plan`: Create structured action items with assignees and deadlines.
- `PUT /api/action-items/{id}`: Update progress on assigned action plan tasks.

---

## 4. Reports & Delivery API

- `GET /api/cases/{id}/report/url`: Generate signed, 24-hour URL for PDF report download.
- `POST /api/cases/{id}/report/resend`: Re-trigger WhatsApp report notification.
- `POST /api/webhooks/whatsapp`: Webhook listener for WhatsApp Cloud API delivery events.

---

## 5. Admin API (`/api/admin`)

- `GET /api/admin/moderation/queue`: Fetch cases held for review.
- `POST /api/admin/moderation/{caseId}/decide`: Admin action (`approve`, `redact`, `reject`).
- `POST /api/institutions/{id}/verify`: Verify institution legal documents.
- `GET /api/admin/audit-log`: Global security event trail.
