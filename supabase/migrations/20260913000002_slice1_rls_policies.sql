-- Murafiq (مُرافِق) — Slice 1 Security & RLS Policies Migration
-- Migration: 20260913000002_slice1_rls_policies.sql

-- 1. Institutions & Branches Read Policies (Intake Selection)
CREATE POLICY "Anyone can view institutions" ON institutions
  FOR SELECT USING (true);

CREATE POLICY "Anyone can view institution branches" ON institution_branches
  FOR SELECT USING (true);

-- 2. Institution Members: Members can view their own memberships
CREATE POLICY "Members can view their own memberships" ON institution_members
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Institution Admins can view all member records" ON institution_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM institution_members im
      WHERE im.institution_id = institution_members.institution_id
        AND im.user_id = auth.uid()
        AND im.role = 'ADMIN'
    )
  );

-- 3. Consent Records: Parent can insert and view own consent
CREATE POLICY "Users can insert own consent records" ON consent_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own consent records" ON consent_records
  FOR SELECT USING (auth.uid() = user_id);

-- 4. Cases: Institution Acknowledgment Policy
-- Only ADMIN and OPS_LEAD of the target institution can update cases during triage.
-- STAFF and OBSERVER are strictly prohibited.
CREATE POLICY "Institution Admin and Ops Lead can acknowledge cases" ON cases
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM institution_members m
      WHERE m.institution_id = cases.institution_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OPS_LEAD')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM institution_members m
      WHERE m.institution_id = cases.institution_id
        AND m.user_id = auth.uid()
        AND m.role IN ('ADMIN', 'OPS_LEAD')
    )
  );

-- 5. Privileged Access Logs
CREATE POLICY "Platform admins can view privileged access logs" ON privileged_access_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE platform_admins.user_id = auth.uid())
  );

CREATE POLICY "Platform admins can log privileged access" ON privileged_access_logs
  FOR INSERT WITH CHECK (
    admin_id = auth.uid() AND
    EXISTS (SELECT 1 FROM platform_admins WHERE platform_admins.user_id = auth.uid())
  );
