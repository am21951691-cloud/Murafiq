-- Murafiq (مُرافِق) — Slice 6 WhatsApp Dispatches RLS Migration
-- Migration: 20260913000004_slice6_whatsapp_dispatches.sql

-- 1. Platform Admins can view and manage all whatsapp dispatches
CREATE POLICY "Platform admins can view whatsapp dispatches" ON whatsapp_dispatches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE platform_admins.user_id = auth.uid())
  );

-- 2. Case owners can view dispatch delivery status for their own cases
CREATE POLICY "Case owners can view own whatsapp dispatches" ON whatsapp_dispatches
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM cases WHERE cases.id = whatsapp_dispatches.case_id AND cases.user_id = auth.uid())
  );
