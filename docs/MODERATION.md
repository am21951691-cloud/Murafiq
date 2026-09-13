# Murafiq — Content Moderation & Anti-Abuse

> **Version:** 1.0

---

## 1. Moderation Pipeline

1. **Regex Filter:** Intercepts Egyptian phone numbers (`01[0125]\d{8}`) and 14-digit national IDs. Auto-redacts into tags like `[REDACTED_PHONE]`.
2. **AI Screening:** Checks for explicit violence, hate speech, sexual content, or criminal defamation.
3. **Decisions:**
   - `AUTO-PUBLISHED`: Clean text, no policy violations.
   - `PUBLISHED WITH REDACTION`: PII cleansed, published with redaction notice.
   - `HELD FOR REVIEW`: Flagged for admin queue (4-hour SLA).
   - `REJECTED`: Direct violations (threats, hate speech, spam).

---

## 2. Institution Right of Response & Disputes

- Institutions cannot unilaterally remove reviews.
- Every verified institution has the right of response.
- Disputes can be lodged within 7 days strictly on grounds of factual impossibility (e.g., student never enrolled) with documentary proof.
- If a dispute is validated, a correction notice is attached or case is archived if identity fraud is proven.
