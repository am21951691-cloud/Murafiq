# Murafiq (مُرافِق) — Production Database Schema & RLS (V2.2.1)

> **Version:** 2.2.1  
> **Database:** PostgreSQL 15+ (Supabase)  
> **Status:** Approved Source of Truth

---

## 1. Schema Extensions & Enums

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 4 Orthogonal State Enums
CREATE TYPE lifecycle_status_enum AS ENUM (
  'DRAFT', 'SUBMITTED', 'PRIVATE_GRACE', 'ACTION_PLAN_PENDING',
  'IN_PROGRESS', 'AWAITING_EVALUATION', 'CLOSED', 'ARCHIVED'
);

CREATE TYPE moderation_status_enum AS ENUM (
  'PENDING', 'APPROVED', 'REDACTED_APPROVED', 'HELD_FOR_REVIEW', 'REJECTED'
);

CREATE TYPE dispute_status_enum AS ENUM (
  'NONE', 'OPEN', 'RESOLVED', 'ESCALATED'
);

CREATE TYPE safety_status_enum AS ENUM (
  'CLEAR', 'FLAGGED', 'ESCALATED'
);

CREATE TYPE case_category_enum AS ENUM (
  'ACADEMIC_CURRICULUM', 'TEACHER_COMMUNICATION', 'STUDENT_BEHAVIOR_BULLYING',
  'FACILITIES_HEALTH_SAFETY', 'TRANSPORTATION_BUSES', 'TUITION_FEES_REFUNDS',
  'ADMINISTRATION_DISCIPLINE'
);

CREATE TYPE visibility_level_enum AS ENUM (
  'STRICTLY_PRIVATE', 'ANONYMOUS_PUBLIC', 'PUBLIC'
);

CREATE TYPE verification_method_enum AS ENUM (
  'PLATFORM_EVENT', 'USER_CONFIRMATION', 'INSTITUTION_DOCUMENT',
  'UPLOADED_DOCUMENT', 'ADMIN_AUDIT', 'EXTERNAL_REGISTRY'
);
```

---

## 2. Core Tables

```sql
-- Platform Super-Admins
CREATE TABLE platform_admins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'SUPER_ADMIN' NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Privileged Access Logs
CREATE TABLE privileged_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) NOT NULL,
  case_id UUID NOT NULL,
  justification TEXT NOT NULL,
  accessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Institutions
CREATE TABLE institutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  registration_number TEXT,
  identifier_type TEXT DEFAULT 'MOE_LICENSE',
  verification_metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
  is_verified BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Institution Branches
CREATE TABLE institution_branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  branch_name_ar TEXT NOT NULL,
  branch_name_en TEXT NOT NULL,
  governorate TEXT NOT NULL,
  district TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Institution Members (RBAC)
CREATE TABLE institution_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT CHECK (role IN ('ADMIN', 'OPS_LEAD', 'STAFF', 'OBSERVER')) NOT NULL,
  department TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(institution_id, user_id)
);

-- Cases (Operational Record — Zero Raw PII)
CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE RESTRICT NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE RESTRICT NOT NULL,
  branch_id UUID REFERENCES institution_branches(id) ON DELETE SET NULL,
  
  category case_category_enum NOT NULL,
  subcategory TEXT NOT NULL,
  
  lifecycle_status lifecycle_status_enum DEFAULT 'DRAFT' NOT NULL,
  moderation_status moderation_status_enum DEFAULT 'PENDING' NOT NULL,
  dispute_status dispute_status_enum DEFAULT 'NONE' NOT NULL,
  safety_status safety_status_enum DEFAULT 'CLEAR' NOT NULL,
  visibility visibility_level_enum DEFAULT 'STRICTLY_PRIVATE' NOT NULL,
  
  sanitized_description TEXT NOT NULL,
  public_summary_ar TEXT,
  public_summary_en TEXT,
  
  initial_experience_rating SMALLINT CHECK (initial_experience_rating BETWEEN 1 AND 5) NOT NULL,
  
  grace_expires_at TIMESTAMPTZ,
  evaluation_timeout_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  closure_reason TEXT,
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Isolated Sensitive Data (Ultra-Restricted RLS)
CREATE TABLE case_sensitive_data (
  case_id UUID PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
  raw_description_encrypted TEXT NOT NULL,
  parent_contact_phone_encrypted TEXT,
  student_identifiers_encrypted JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Action Plans
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE UNIQUE NOT NULL,
  submitted_by UUID REFERENCES auth.users(id) NOT NULL,
  official_statement TEXT NOT NULL,
  rqs_score SMALLINT CHECK (rqs_score BETWEEN 0 AND 100) NOT NULL,
  rqs_breakdown JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Action Items (Milestones)
CREATE TABLE action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_plan_id UUID REFERENCES action_plans(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  owner_role TEXT NOT NULL,
  due_date DATE NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE NOT NULL,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Evaluations
CREATE TABLE evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE UNIQUE NOT NULL,
  response_rating SMALLINT CHECK (response_rating BETWEEN 1 AND 5) NOT NULL,
  resolution_rating SMALLINT CHECK (resolution_rating BETWEEN 1 AND 5) NOT NULL,
  closing_comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Verification Records
CREATE TABLE verification_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  target_entity_type TEXT NOT NULL,
  target_entity_id UUID NOT NULL,
  verification_method verification_method_enum NOT NULL,
  verified_by_user_id UUID REFERENCES auth.users(id),
  verification_scope TEXT NOT NULL,
  evidence_summary TEXT,
  storage_reference_id TEXT,
  limitations TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI Analyses (Frozen Structured Assessments)
CREATE TABLE ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  analysis_type TEXT NOT NULL,
  provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  schema_version TEXT NOT NULL,
  input_hash TEXT NOT NULL,
  output_payload JSONB NOT NULL,
  confidence_label TEXT CHECK (confidence_label IN ('LOW', 'MEDIUM', 'HIGH')) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Consent Records (Law 151/2020 Compliance)
CREATE TABLE consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL,
  policy_version TEXT NOT NULL,
  ip_address_hash TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Case Attachments
CREATE TABLE case_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  file_size_bytes INTEGER NOT NULL,
  uploaded_by UUID REFERENCES auth.users(id) NOT NULL,
  is_quarantined BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Immutable Case Events
CREATE TABLE case_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  actor_id UUID REFERENCES auth.users(id),
  event_type TEXT NOT NULL,
  from_state JSONB,
  to_state JSONB,
  metadata JSONB DEFAULT '{}'::JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Reports & Snapshots
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  version INTEGER DEFAULT 1 NOT NULL,
  report_payload_snapshot JSONB NOT NULL, -- Frozen sanitized JSON data only
  pdf_storage_path TEXT NOT NULL,
  sha256_digest TEXT NOT NULL,
  is_current BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(case_id, version)
);

-- WhatsApp Dispatches
CREATE TABLE whatsapp_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  report_id UUID REFERENCES reports(id) ON DELETE CASCADE NOT NULL,
  recipient_phone_e164 TEXT,
  recipient_phone_hash TEXT NOT NULL,
  template_name TEXT NOT NULL,
  idempotency_key TEXT UNIQUE NOT NULL,
  provider_message_id TEXT,
  delivery_status TEXT DEFAULT 'QUEUED' NOT NULL,
  attempt_count INTEGER DEFAULT 0 NOT NULL,
  last_error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Statutory Decrees (Curated & Verified)
CREATE TABLE statutory_decrees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_reference TEXT NOT NULL,
  issuing_authority TEXT NOT NULL,
  article_number TEXT NOT NULL,
  title TEXT NOT NULL,
  text_content TEXT NOT NULL,
  publication_date DATE NOT NULL,
  effective_date DATE NOT NULL,
  legal_status TEXT DEFAULT 'ACTIVE' NOT NULL,
  last_verified_date DATE NOT NULL,
  verified_by_user_id UUID REFERENCES auth.users(id),
  verification_status TEXT DEFAULT 'PENDING_VERIFICATION' NOT NULL,
  legal_review_notes TEXT,
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Platform Configuration
CREATE TABLE platform_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Immutability Trigger for Case Events
CREATE OR REPLACE FUNCTION prevent_audit_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit log entries in % are immutable and cannot be modified or deleted.', TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_immutable_case_events
BEFORE UPDATE OR DELETE ON case_events
FOR EACH ROW EXECUTE FUNCTION prevent_audit_tampering();
```

---

## 3. Row Level Security (RLS) Policies

```sql
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_sensitive_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_dispatches ENABLE ROW LEVEL SECURITY;

-- case_sensitive_data: Case Owner Only
CREATE POLICY "Only case owner can view raw sensitive data" ON case_sensitive_data
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = case_sensitive_data.case_id AND cases.user_id = auth.uid())
  );

-- cases: Parent Access
CREATE POLICY "Users can view own cases" ON cases
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create cases" ON cases
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft cases" ON cases
  FOR UPDATE USING (auth.uid() = user_id AND lifecycle_status = 'DRAFT');

-- cases: Granular Institution Role Access
CREATE POLICY "Institution member case access policy" ON cases
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM institution_members m
      WHERE m.institution_id = cases.institution_id
        AND m.user_id = auth.uid()
        AND (
          m.role IN ('ADMIN', 'OPS_LEAD')
          OR (m.role = 'STAFF' AND (
            cases.metadata->>'assigned_staff_id' = auth.uid()::text 
            OR cases.category::text = m.department
          ))
          OR (m.role = 'OBSERVER' AND cases.lifecycle_status IN ('CLOSED', 'ARCHIVED'))
        )
    )
  );

-- cases: Public Access
CREATE POLICY "Public can view approved cases" ON cases
  FOR SELECT USING (
    visibility = 'PUBLIC' AND
    moderation_status IN ('APPROVED', 'REDACTED_APPROVED') AND
    safety_status = 'CLEAR' AND
    lifecycle_status IN ('ACTION_PLAN_PENDING', 'IN_PROGRESS', 'AWAITING_EVALUATION', 'CLOSED')
  );

-- action_plans: Admin & Ops Lead Only
CREATE POLICY "Institution Ops Lead or Admin submit plan" ON action_plans
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM institution_members m
      JOIN cases c ON c.institution_id = m.institution_id
      WHERE c.id = action_plans.case_id 
        AND m.user_id = auth.uid() 
        AND m.role IN ('ADMIN', 'OPS_LEAD')
    )
  );
```
