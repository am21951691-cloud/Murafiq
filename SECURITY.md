# Security Policy — Murafiq (مُرافِق)

> **Version:** 2.0  
> **Last Updated:** 2026-09-22  
> **Compliance Framework:** Egyptian Personal Data Protection Law 151/2020

---

## 🔒 Supported Versions

| Version | Supported |
|---------|-----------|
| 2.3.x (current) | ✅ Active security patches |
| 2.2.x | ✅ Critical fixes only |
| < 2.0 | ❌ End of life |

---

## 🛡️ Reporting a Vulnerability

If you discover a security vulnerability in Murafiq, **please do NOT open a public GitHub issue.** Instead:

1. **Email:** Send a detailed report to the repository owner via GitHub's private vulnerability reporting feature.
2. **Include:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact assessment
   - Suggested fix (if any)
3. **Response time:** We aim to acknowledge reports within **48 hours** and provide a fix within **7 business days** for critical issues.

---

## 🏗️ Security Architecture

### 1. STRIDE Threat Model & Mitigations

| Threat | Risk Vector | Mitigation |
|--------|-------------|------------|
| **Spoofing** | Fraudulent cases created by fake accounts | Egyptian mobile OTP verification, Cloudflare Turnstile CAPTCHA, trust-level rate limits |
| **Tampering** | Unauthorized modification of published statements or ratings | PostgreSQL Row Level Security (RLS); immutable append-only `case_events` audit log with DB triggers blocking UPDATE/DELETE |
| **Repudiation** | Institution denying receipt of complaint | Traceable delivery receipts via WhatsApp Cloud API webhooks with UTC timestamps; immutable event log |
| **Information Disclosure** | Student names, national IDs, or phone numbers exposed | Physical PII isolation in `case_sensitive_data` table; automated regex sanitization; zero-SELECT RLS for institutions on sensitive tables |
| **Denial of Service** | Review bombing and API saturation | Edge rate limiting (100 req/min/IP); max 2 cases/day for new accounts; Zod schema validation on all API inputs |
| **Elevation of Privilege** | Institution attempting to discover identity of anonymous reviewer | Strict RLS policies masking `user_id` on anonymous records at query execution time; service-role key isolated to backend workers only |

### 2. PII Protection & Law 151/2020 Compliance

- **Physical Data Separation:** Raw personal narratives, national IDs, and contact information are stored exclusively in the `case_sensitive_data` table, physically separated from the operational `cases` table.
- **National ID Rejection:** The platform enforces strict client-side and server-side rejection of full 14-digit Egyptian National IDs (`/^[23]\d{13}$/`) in all free-text inputs. Detected IDs are stripped and isolated into encrypted storage.
- **Encryption at Rest:** Sensitive fields use application-level encryption before database insertion.
- **No Public Exposure:** PII is never included in public API responses, directory listings, BARS benchmark pages, or PDF report snapshots.

### 3. Authentication & Authorization

- **Row Level Security (RLS):** All Supabase tables have `ENABLE ROW LEVEL SECURITY` enforced. Policies ensure users can only access their own cases; institutions can only access cases assigned to them.
- **Service-Role Isolation:** The `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to backend workers (`lib/supabase/admin.ts`) and is never imported in any client-side bundle (`app/`, `components/`).
- **RBAC Enforcement:** Institution-side actions (acknowledge, submit action plans) require `ADMIN` or `OPS_LEAD` role verification server-side.

### 4. AI & Prompt Injection Defense

- All user-supplied text is sandboxed within `<untrusted_user_input>` XML tags in AI prompts.
- System prompts instruct the model to treat content inside these tags strictly as data and never execute instructions contained within.
- AI responses are post-processed to strip any potential instruction leakage.

### 5. Document & Storage Security

- **Private Storage Buckets:** Supabase Storage buckets configured with zero public read access.
- **Signed URLs:** Time-limited signed URLs (1 hour for dashboard; 72 hours for WhatsApp delivery) with automatic expiration.
- **File Validation:** Magic-byte validation verifying actual file types (JPEG, PNG, WEBP, PDF only). Maximum 10MB per attachment; max 5 files per case.
- **PDF Integrity:** All generated resolution reports include SHA-256 integrity digests computed from frozen, sanitized payload snapshots.

### 6. WhatsApp Webhook Security

- **HMAC-SHA256 Signature Verification:** All incoming Meta webhooks are validated against the app secret before processing.
- **Strict Boundary:** Delivery status webhooks only update dispatch records — they never mutate case lifecycle state.
- **Phone Number Retention:** 30-day phone number hashing retention policy with automated purge tasks.

---

## 🔑 Secret Management

### Environment Variables

All secrets are managed via environment variables and are **never committed to version control:**

```
.env.local          ← Local development (gitignored)
.env                ← Production (gitignored)
.env.example        ← Template with placeholder values only (committed)
```

### Required Secrets

| Variable | Scope | Description |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anonymous/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Supabase admin key (never exposed to client) |
| `NVIDIA_CONCIERGE_API_KEY` | Server only | NVIDIA NIM API key for chatbot |
| `NVIDIA_ADVISOR_API_KEY` | Server only | NVIDIA NIM API key for solution advisor |
| `WHATSAPP_CLOUD_API_TOKEN` | Server only | Meta WhatsApp Cloud API token |
| `WHATSAPP_WEBHOOK_APP_SECRET` | Server only | Meta webhook HMAC verification secret |

### Verification

The build pipeline includes automated secret scanning to ensure:
- No API keys, tokens, or credentials appear in committed source code
- `SUPABASE_SERVICE_ROLE_KEY` is never imported in client-side files (`app/`, `components/`)
- `.env.local` and `.env` are listed in `.gitignore`

---

## 📋 Security Checklist (Per Release)

- [ ] Secret scan: grep codebase for hardcoded keys/tokens
- [ ] PII leakage scan: verify raw descriptions never appear in public API responses
- [ ] RLS audit: confirm all new tables have `ENABLE ROW LEVEL SECURITY`
- [ ] Input validation: all API inputs parsed via strict Zod schemas
- [ ] Dependency audit: `npm audit` with zero critical vulnerabilities
- [ ] Build verification: `npm run build` completes with 0 TypeScript errors

---

## 📄 Related Documentation

- [Architecture](docs/ARCHITECTURE.md) — System topology and state engine design
- [Database](docs/DATABASE.md) — PostgreSQL schema, RLS policies, and immutability triggers
- [AI Specification](docs/AI_SPEC.md) — Frozen assessment schema and prompt injection defense
- [Security Details](docs/SECURITY.md) — Extended STRIDE analysis and threat modeling
