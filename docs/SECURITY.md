# Murafiq (مُرافِق) — Enterprise Security & Threat Model

> **Version:** 2.0  
> **Compliance Target:** Egyptian Personal Data Protection Law 151/2020  
> **Security Architecture:** Multi-Tenant Defense-in-Depth

---

## 1. STRIDE Threat Model & Mitigations

| Threat | Risk Vector | Enterprise Mitigation |
| :--- | :--- | :--- |
| **Spoofing** | Fraudulent cases or impersonation of institutional staff | E.164 phone verification (OTP), multi-factor authentication, signed session tokens, cryptographically random tracking references. |
| **Tampering** | Unauthorized updates to action plans, milestones, or evaluations | PostgreSQL Row Level Security (RLS) partition-scoped by `tenant_id`; append-only `case_events` audit table protected by DB triggers blocking `UPDATE` and `DELETE`. |
| **Repudiation** | Institution claiming non-receipt of complaint | Traceable delivery receipts via WhatsApp Cloud API webhooks with UTC timestamps; immutable case creation events logged immediately. |
| **Information Disclosure** | Beneficiary PII, national IDs, or internal notes leaked | Physical separation in `case_sensitive_data`; Egyptian National ID regex sanitization; internal notes strictly isolated from beneficiary views; tenant-scoped queries. |
| **Denial of Service** | API saturation, volumetric spam, resource exhaustion | Edge rate limiting, API token quotas, payload size limits (max 10MB attachments), strict Zod input validation on all routes. |
| **Elevation of Privilege** | Cross-tenant data access or role escalation | Tenant isolation verified at storage layer and RLS; RBAC enforcement (`ADMIN`, `OPS_LEAD`, `STAFF`, `OBSERVER`) checked server-side on all administrative routes. |

---

## 2. Multi-Tenant Data Isolation

1. **Partition Isolation:** Every case, department, internal note, and action plan is bound to a specific `tenant_id` (`institution_id`).
2. **Database Policies:** PostgreSQL Row Level Security ensures that database queries from an institution user context cannot select, update, or delete rows belonging to another tenant.
3. **Internal vs External Scoping:**
   - Beneficiaries have access exclusively to their own cases via their tracking tokens.
   - Frontline staff have access only to cases within their tenant institution and assigned departments.
   - Internal notes (`case_internal_notes`) are strictly partitioned from the beneficiary portal queries.

---

## 3. Law 151/2020 & PII Protection

- **National ID Protection:** Strict validation patterns reject and quarantine Egyptian 14-digit National IDs in free-text fields.
- **Physical Segregation:** Personal identities and contact information reside in `case_sensitive_data`, while operational facts are processed in `cases`.
- **Retention & Purging:** Configurable data retention policies enable compliant redaction after case closure and retention periods.

---

## 4. Cryptographic Document & Audit Integrity

- **SHA-256 Digest:** Every generated PDF resolution report includes an embedded cryptographic digest of the frozen resolution snapshot.
- **Verification Endpoint:** Anyone possessing the report can verify its authenticity and unaltered state against the system audit record.
- **Signed Storage URLs:** All attachments and generated documents are stored in private buckets and accessed via short-lived signed URLs (1 hour TTL).
