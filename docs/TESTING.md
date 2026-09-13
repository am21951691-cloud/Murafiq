# Murafiq — Quality Assurance & Testing Strategy

> **Version:** 1.0

---

## 1. Test Architecture

- **Unit Testing (Vitest):**
  - State machine transitions (`tests/unit/case-machine.test.ts`)
  - PII regex token replacement (`tests/unit/pii-detection.test.ts`)
  - Input validation schemas (`tests/unit/validators.test.ts`)
- **Database RLS Testing (pgTAP / SQL Test Harness):**
  - Verify that anonymous cases mask `user_id` from public and institution queries.
  - Verify that draft cases cannot be read by other users or institutions.
- **End-to-End Testing (Playwright):**
  - Flow 1: Full Case Submission → AI structuring → Publication.
  - Flow 2: Institution Response & Action Plan builder.
  - Flow 3: Final Parent Evaluation → PDF Report Generation trigger.

---

## 2. Benchmark Acceptance Criteria

- Code coverage ≥ 85% on core domain libraries.
- All RLS assertion tests pass with zero leaks.
- Zero high/critical vulnerabilities via automated dependency scanning.
