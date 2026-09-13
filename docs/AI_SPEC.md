# Murafiq — Resolution Intelligence Engine (RIE) Specification

> **Version:** 1.0  
> **Status:** Approved

---

## 1. Safety & Behavioral Principles

1. **Analytical, Not Judicial:** The AI must never judge factual truth, declare guilt or negligence, or label institutions fraudulent.
2. **Attribution Tags:** All generated summaries must cleanly distinguish `USER-REPORTED` claims from documented facts and unknowns.
3. **No Hallucinated Citations:** If no relevant empirical studies exist, return `"insufficient_evidence": true`. Never fabricate educational studies.
4. **Prompt Injection Airgap:** User text and attachments are treated strictly as data payloads inside `<user_data>` delimiters.

---

## 2. Core Schemas (Zod Types)

### 2.1 Case Analysis Schema
```typescript
import { z } from "zod";

export const CaseAnalysisSchema = z.object({
  category: z.object({
    primary: z.enum([
      "Teaching Quality",
      "Communication",
      "Administration",
      "Safety & Wellbeing",
      "Facilities",
      "Fees & Finance",
      "Exams & Assessment",
      "Student Behavior",
      "Other"
    ]),
    secondary: z.string(),
    confidence: z.number().min(0).max(1)
  }),
  severity: z.object({
    level: z.enum(["low", "medium", "high", "critical"]),
    reasoning: z.string(),
    confidence: z.number().min(0).max(1)
  }),
  timeline: z.object({
    issue_start_date: z.string().nullable(),
    first_reported_date: z.string().nullable(),
    duration_description: z.string()
  }),
  stakeholders: z.array(z.object({ role: z.string(), involvement: z.string() })),
  impact: z.object({
    description: z.string(),
    affected_parties: z.array(z.string()),
    academic_impact: z.boolean(),
    safety_impact: z.boolean(),
    financial_impact: z.boolean()
  }),
  expected_outcome: z.string(),
  neutral_summary: z.string(),
  user_claims: z.array(z.string()),
  documented_facts: z.array(z.string()),
  unknown_factors: z.array(z.string()),
  missing_information: z.array(z.string()),
  clarification_questions: z.array(z.string()).max(3),
  pii_detected: z.boolean(),
  pii_redactions: z.array(
    z.object({
      original_token: z.string(),
      replacement: z.string(),
      type: z.enum(["phone", "national_id", "minor_name", "address", "email"])
    })
  )
});
```

### 2.2 Response Analysis Schema
```typescript
export const ResponseAnalysisSchema = z.object({
  relevance: z.object({ score: z.number().int().min(1).max(5), explanation: z.string() }),
  specificity: z.object({ score: z.number().int().min(1).max(5), explanation: z.string() }),
  accountability: z.object({ score: z.number().int().min(1).max(5), has_named_owner: z.boolean(), explanation: z.string() }),
  timeline_commitment: z.object({ score: z.number().int().min(1).max(5), has_deadline: z.boolean(), explanation: z.string() }),
  communication_tone: z.enum(["empathetic", "professional", "defensive", "dismissive", "hostile"]),
  overall_response_quality_score: z.number().min(0).max(100),
  strengths: z.array(z.string()),
  actionable_recommendations: z.array(z.string())
});
```

---

## 3. Model Routing Matrix

| Task | Primary Model | Fallback | Max Latency |
|------|---------------|----------|-------------|
| Initial Case Understanding & PII | `gpt-4o-mini` | Manual Review Queue | 8s |
| Moderation Flagging | `gpt-4o-mini` | Admin Queue | 3s |
| Response & Action Plan Analysis | `gpt-4o` | `gpt-4o-mini` | 15s |
| Final Outcome Evaluation & Report | `gpt-4o-mini` | `gpt-4o` | 10s |
