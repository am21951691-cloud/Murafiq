# Security Policy — Murafiq (مُرافِق)

> **Version:** 2.2  
> **Last Updated:** 2026-09-22  
> **Compliance Framework:** Egyptian Personal Data Protection Law 151/2020  
> **Deployment Model:** Enterprise Multi-Tenant (B2B SaaS / On-Premise)

---

## 🔒 Supported Versions

| Version | Supported | Notes |
| :--- | :--- | :--- |
| 3.0.x (current) | ✅ Active security patches | Full Enterprise Multi-Tenant & SLA Engine |
| 2.3.x | ✅ Critical fixes | 5-Sector Generic Entity Patch |
| < 2.0 | ❌ End of life | Legacy review directory prototypes |

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability in Murafiq, **please do NOT open a public GitHub issue.** Instead:

1. **Email / Private Advisory:** Send a detailed report to the security team via GitHub's private vulnerability reporting feature.
2. **Include in Report:**
   - Detailed description of the vulnerability and affected components
   - Exact steps to reproduce (or proof of concept)
   - Scope and potential tenant isolation impact
   - Suggested remediation (if identified)
3. **Response SLA:** We acknowledge all security reports within **24 hours** and provide a patch timeline within **3 business days** for high or critical severity issues.

---

## 🏗️ Enterprise Security Architecture

### 1. Multi-Tenant Data Isolation
- **Tenant Scoping:** All core database entities (`cases`, `institution_departments`, `case_internal_notes`, `sla_configs`, `branding`) enforce tenant partitioning by `tenant_id` (`institution_id`).
- **PostgreSQL RLS:** Row Level Security policies prevent any cross-tenant data access, even in the event of application-level routing bugs.
- **Role-Based Access Control (RBAC):** Institutional staff permissions are strictly enforced:
  - `ADMIN`: Full organizational configuration, SLA rules, department management, staff onboarding.
  - `OPS_LEAD`: Triage, assignment, action plan authorization, milestone verification.
  - `STAFF`: Assigned case execution, internal notes, milestone status updates.
  - `OBSERVER`: Read-only reporting and audit access.

### 2. PII Protection & Law 151/2020 Compliance
- **Physical Data Separation:** Personal identifying information, phone numbers, and unredacted case descriptions are segregated into `case_sensitive_data`.
- **National ID Rejection:** Automated regex scanners (`/^[23]\d{13}$/`) actively intercept and redact Egyptian National IDs submitted in free-text fields.
- **Internal Note Confidentiality:** `case_internal_notes` are strictly quarantined from beneficiary-facing APIs and interfaces.

### 3. Tamper-Evident Auditability & Cryptographic Signatures
- **Immutable Event Log:** All status transitions, department routings, and milestone verifications are recorded in `case_events`. Database triggers strictly prohibit `UPDATE` or `DELETE` on event logs.
- **SHA-256 Digest Verification:** Formal resolution PDF documents embed a verifiable SHA-256 digest computed from the frozen case closure payload.

### 4. API & Integration Security
- **API Key & JWT Authentication:** All external integrations and API routes authenticate via cryptographically validated tokens or tenant API keys.
- **Rate Limiting:** Edge-level rate limiting prevents abusive burst requests or denial-of-service attempts.
- **Input Validation:** 100% of API endpoints sanitize input payloads using strict Zod schemas.

---

## 🔑 Secret Management & Hygiene

- All credentials (database URLs, service keys, AI provider tokens, WhatsApp secrets) are supplied via environment variables (`.env.local` / production secret manager) and are **never committed to version control**.
- Automated pre-commit and CI scans reject any tracked secrets or credentials.
