-- Migration: 20260922000001_enterprise_multitenancy.sql
-- Description: Additive migration for Murafiq Enterprise Multi-Tenancy, Department Routing, SLA Configuration, and Internal Notes

-- 1. Create Priority Enum if not exists
DO $$ BEGIN
  CREATE TYPE case_priority_enum AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance institutions Table with Branding, SLA Policies & Beneficiary Terminology
ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS branding JSONB NOT NULL DEFAULT '{
    "primary_color": "#0284c7",
    "logo_url": null,
    "institution_short_name": null,
    "welcome_message_ar": null,
    "welcome_message_en": null
  }'::JSONB,
  ADD COLUMN IF NOT EXISTS sla_config JSONB NOT NULL DEFAULT '{
    "first_response_hours": 24,
    "action_plan_hours": 72,
    "resolution_hours": 168,
    "escalation_threshold_hours": 48
  }'::JSONB,
  ADD COLUMN IF NOT EXISTS beneficiary_terminology JSONB NOT NULL DEFAULT '{
    "term_ar": "المستفيد",
    "term_en": "Beneficiary",
    "identifier_label_ar": "الرقم التعريفي",
    "identifier_label_en": "Identifier Number"
  }'::JSONB;

-- 3. Create Institution Departments Table (Tenant-Scoped)
CREATE TABLE IF NOT EXISTS institution_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  code TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  name_en TEXT NOT NULL,
  default_sla_hours INT DEFAULT 48 NOT NULL,
  head_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(institution_id, code)
);

CREATE INDEX IF NOT EXISTS idx_institution_departments_tenant ON institution_departments(institution_id);

-- Enable RLS on institution_departments
ALTER TABLE institution_departments ENABLE ROW LEVEL SECURITY;

-- 4. Enhance cases Table with Assignment, Priority, Department & SLA Target
ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS assigned_department_id UUID REFERENCES institution_departments(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS assigned_staff_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS priority case_priority_enum DEFAULT 'MEDIUM' NOT NULL,
  ADD COLUMN IF NOT EXISTS sla_target_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS first_responded_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_cases_assigned_dept ON cases(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_cases_assigned_staff ON cases(assigned_staff_id);
CREATE INDEX IF NOT EXISTS idx_cases_sla_target ON cases(sla_target_at);
CREATE INDEX IF NOT EXISTS idx_cases_tenant ON cases(institution_id);

-- 5. Create Case Internal Notes Table (Staff-Only Collaboration, Zero Beneficiary Visibility)
CREATE TABLE IF NOT EXISTS case_internal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE NOT NULL,
  institution_id UUID REFERENCES institutions(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  author_name TEXT NOT NULL,
  author_role TEXT NOT NULL,
  note_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_case_internal_notes_case ON case_internal_notes(case_id);
CREATE INDEX IF NOT EXISTS idx_case_internal_notes_tenant ON case_internal_notes(institution_id);

-- Enable RLS on case_internal_notes
ALTER TABLE case_internal_notes ENABLE ROW LEVEL SECURITY;

-- 6. Strict Tenant Isolation RLS Policies

-- Department Access: Staff can only view and manage departments belonging to their own tenant
DROP POLICY IF EXISTS "Staff can view departments of their institution" ON institution_departments;
CREATE POLICY "Staff can view departments of their institution" ON institution_departments
  FOR SELECT USING (
    institution_id IN (
      SELECT im.institution_id FROM institution_members im WHERE im.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Admins can manage departments of their institution" ON institution_departments;
CREATE POLICY "Admins can manage departments of their institution" ON institution_departments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM institution_members im
      WHERE im.institution_id = institution_departments.institution_id
        AND im.user_id = auth.uid()
        AND im.role = 'ADMIN'
    )
  );

-- Internal Notes Access: Strictly isolated to authenticated members of the target tenant
DROP POLICY IF EXISTS "Staff can view internal notes of their institution" ON case_internal_notes;
CREATE POLICY "Staff can view internal notes of their institution" ON case_internal_notes
  FOR SELECT USING (
    institution_id IN (
      SELECT im.institution_id FROM institution_members im WHERE im.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Staff can create internal notes in their institution" ON case_internal_notes;
CREATE POLICY "Staff can create internal notes in their institution" ON case_internal_notes
  FOR INSERT WITH CHECK (
    institution_id IN (
      SELECT im.institution_id FROM institution_members im WHERE im.user_id = auth.uid()
    )
  );

-- Enhanced Cases Tenant Isolation: Staff can only query cases within their own institution
DROP POLICY IF EXISTS "Staff can view cases of their institution" ON cases;
CREATE POLICY "Staff can view cases of their institution" ON cases
  FOR SELECT USING (
    -- Either the user is the beneficiary who created the case
    user_id = auth.uid()
    OR
    -- Or the user is an authorized staff member of the specific target institution
    institution_id IN (
      SELECT im.institution_id FROM institution_members im WHERE im.user_id = auth.uid()
    )
    OR
    -- Or the user is a platform super admin
    EXISTS (SELECT 1 FROM platform_admins pa WHERE pa.user_id = auth.uid())
  );
