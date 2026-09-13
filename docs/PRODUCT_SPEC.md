# Murafiq — Product Specification

> **Version:** 1.0  
> **Last Updated:** 2026-09-13  
> **Status:** Approved — Ready for Implementation

---

## 1. Product Overview

**Murafiq** (مُرافِق) is a Case Resolution Platform for education in Egypt. It transforms unstructured complaints and reviews into structured cases with a documented lifecycle.

**Core Cycle:** REVIEW → RESPONSE → RESOLUTION → VERIFIED OUTCOME

**Initial Vertical:** Private schools and educational centers in Egypt.

---

## 2. Product Principles

1. **Neutral, not adversarial:** Facilitate resolution, not punishment.
2. **Attribution is sacred:** Every statement labeled: `USER-REPORTED`, `INSTITUTION-STATED`, `AI-ANALYSIS`, or `VERIFIED`.
3. **AI is an analyst, not a judge:** AI structures and evaluates quality. It never declares guilt, fault, or truth.
4. **Resolution over rating:** Measure the full lifecycle, not just initial sentiment.
5. **Privacy by design:** Children's information protected. PII redacted. Users control visibility.
6. **Institutions have rights:** Every institution gets a right of response.
7. **Evidence over opinion:** Encourage documentation, timelines, specifics over emotional venting.
8. **Simple before smart:** Don't add AI complexity where a simple form or status update works.

---

## 3. Target Users

### Primary (MVP)
- **Parent:** Parent of student at Egyptian private school.
- **School Manager:** Decision-maker at private school.
- **School Staff:** Teachers/admins assigned to resolve issues.
- **Platform Admin:** Murafiq team managing the platform.

### Secondary (Post-MVP)
- **Student:** University students (V1.5).
- **Prospective Parent:** Read-only access to public profiles (V1.0).
- **Educational Center Customer:** Tutoring centers, language schools (V1.5).

---

## 4. Feature Specification

### 4.1 User Registration & Auth
- Implemented via Supabase Auth.
- Email verification via magic link / password.
- Egyptian phone number verification required (E.164 format: `+20xxxxxxxxxx` via SMS OTP).
- Trust levels: 0 (new) → 1 (verified phone/email) → 2 (established) → 3 (trusted).

### 4.2 Institution Directory & Claiming
- Searchable directory of Egyptian private schools and educational centers.
- Claim profile workflow requiring commercial registration / MoE license upload.
- Verified badge awarded upon manual admin approval.

### 4.3 Case Submission (Guided Form)
1. **Find Institution:** Autocomplete search.
2. **Describe Experience:** Free text (min 50, max 2000 chars).
3. **Details:** Category dropdown, timeline, prior contact, expected outcome.
4. **Evidence:** Up to 5 attachments (images, PDFs, max 10MB each).
5. **Review & Submit:** AI neutral summary preview, 1–5 initial rating, visibility level (Public, Anonymous, Private), WhatsApp opt-in.

### 4.4 Case Lifecycle State Machine (9 MVP States)
- `DRAFT` → `SUBMITTED` → `PUBLISHED` (or `REJECTED`)
- `PUBLISHED` → `INSTITUTION_RESPONDED` (or `AWAITING_EVALUATION` after 14-day timeout)
- `INSTITUTION_RESPONDED` → `IN_PROGRESS` (with Action Plan) → `AWAITING_EVALUATION`
- `AWAITING_EVALUATION` → `CLOSED` (via user evaluation or 30-day auto-close)

### 4.5 Institution Response & Action Plan
- Institution responds with official statement within 14 days.
- Optional structured Action Plan: milestones, accountable owners, explicit deadlines.

### 4.6 Final Evaluation & Closure
- User evaluates: Response Rating (1–5) and Resolution Rating (1–5) plus closing notes.
- Status moves to `CLOSED`.
- Experience Resolution Report generated and dispatched via WhatsApp.

### 4.7 Multi-Dimensional Rating Model
- Separate star ratings:
  1. **Experience Rating** (original issue)
  2. **Institution Response Rating** (communication quality)
  3. **Resolution Rating** (outcome effectiveness)
- Minimum sample thresholds: Ratings only display publicly once an institution accumulates ≥5 cases.
