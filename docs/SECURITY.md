# Murafiq — Security & Threat Modeling

> **Version:** 1.0

---

## 1. STRIDE Analysis & Mitigations

| Threat | Risk Vector | Mitigation |
|--------|-------------|------------|
| **Spoofing** | Fraudulent reviews created by competitors or fake accounts. | Egyptian mobile verification (SMS OTP), Cloudflare Turnstile, trust level rate limits. |
| **Tampering** | Unauthorized updates to published statements or ratings. | PostgreSQL Row Level Security; immutable append-only `case_events` log. |
| **Repudiation** | Institution denying receipt of complaint. | Traceable delivery receipts in `notifications` with UTC timestamps. |
| **Information Disclosure** | Student names or phone numbers exposed publicly. | Automated PII redaction before publishing; private storage buckets. |
| **Denial of Service** | Review bombing and API saturation. | Vercel edge rate limiting (100 req/min/IP; max 2 cases/day for new accounts). |
| **Elevation of Privilege** | School attempting to discover identity of anonymous reviewer. | Strict RLS policies masking `user_id` on anonymous records at query execution time. |

---

## 2. Storage & Document Handling

- Private Supabase Storage buckets with zero public read access.
- Time-limited signed URLs (1 hour for user dashboard access; 24 hours for WhatsApp links).
- Magic-byte validation verifying actual file types (JPEG, PNG, WEBP, PDF only).
- Maximum 10MB per attachment; max 5 files per case.

---

## 3. Prompt Injection Defense

All user-supplied text is sandboxed within `<untrusted_user_input>` XML tags. The system prompt commands the model to treat content inside the tag strictly as data and never execute instructions contained within.
