-- Migration: 20260921000001_generic_entity_sector_patch.sql
-- Description: Additive migration for Polymorphic Entity Architecture across 5 Egyptian sectors

-- 1. Create Sector Enum
DO $$ BEGIN
  CREATE TYPE sector_enum AS ENUM (
    'EDUCATION_SCHOOLS',
    'HIGHER_EDUCATION',
    'GOVERNMENT_PUBLIC',
    'COMMERCIAL_COMPANIES',
    'HEALTHCARE_MEDICAL'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Enhance institutions Table (Add sector and validated sector_metadata)
ALTER TABLE institutions
  ADD COLUMN IF NOT EXISTS sector sector_enum NOT NULL DEFAULT 'EDUCATION_SCHOOLS',
  ADD COLUMN IF NOT EXISTS sector_metadata JSONB NOT NULL DEFAULT '{}'::JSONB;

CREATE INDEX IF NOT EXISTS idx_institutions_sector ON institutions(sector);

-- 3. Enhance case_sensitive_data (Physical PII / Sensitive Identifier Isolation)
-- Keeps existing student_identifiers_encrypted for backward compatibility
-- Adds generic sensitive_identifiers_encrypted for MRN, National Service No, Order ID, etc.
ALTER TABLE case_sensitive_data
  ADD COLUMN IF NOT EXISTS sensitive_identifiers_encrypted JSONB DEFAULT NULL;

-- 4. Enhance cases Table for Dynamic Sector Taxonomy
-- Convert category column to TEXT to accommodate dynamic sector taxonomies
-- (Existing values 'ACADEMIC_CURRICULUM', etc. remain 100% valid text strings)
ALTER TABLE cases ALTER COLUMN category TYPE TEXT;

ALTER TABLE cases
  ADD COLUMN IF NOT EXISTS sector_taxonomy_version TEXT NOT NULL DEFAULT '2026.1';

-- 5. Enhance statutory_decrees Table for Sector Applicability & Human Provenance
ALTER TABLE statutory_decrees
  ADD COLUMN IF NOT EXISTS applicable_sectors sector_enum[] NOT NULL DEFAULT ARRAY['EDUCATION_SCHOOLS']::sector_enum[],
  ADD COLUMN IF NOT EXISTS official_gazette_reference TEXT,
  ADD COLUMN IF NOT EXISTS version_hash TEXT;

-- 6. Update match_statutory_decrees RPC with Sector-Aware Filtering
CREATE OR REPLACE FUNCTION match_statutory_decrees (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5,
  filter_sector sector_enum DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  source_reference TEXT,
  issuing_authority TEXT,
  article_number TEXT,
  title TEXT,
  text_content TEXT,
  publication_date DATE,
  effective_date DATE,
  legal_status TEXT,
  last_verified_date DATE,
  verified_by_user_id UUID,
  verification_status TEXT,
  legal_review_notes TEXT,
  applicable_sectors sector_enum[],
  similarity float
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  RETURN QUERY
  SELECT
    sd.id,
    sd.source_reference,
    sd.issuing_authority,
    sd.article_number,
    sd.title,
    sd.text_content,
    sd.publication_date,
    sd.effective_date,
    sd.legal_status,
    sd.last_verified_date,
    sd.verified_by_user_id,
    sd.verification_status,
    sd.legal_review_notes,
    sd.applicable_sectors,
    (1 - (sd.embedding <=> query_embedding))::float AS similarity
  FROM statutory_decrees sd
  WHERE sd.verification_status = 'VERIFIED_ACTIVE'
    AND sd.legal_status = 'ACTIVE'
    AND (filter_sector IS NULL OR filter_sector = ANY(sd.applicable_sectors))
    AND (1 - (sd.embedding <=> query_embedding)) >= match_threshold
  ORDER BY sd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
