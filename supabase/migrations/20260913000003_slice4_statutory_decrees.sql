-- Murafiq (مُرافِق) — Slice 4 Curated Statutory RAG Layer Migration
-- Migration: 20260913000003_slice4_statutory_decrees.sql

-- 1. Read Policy for Active & Verified Statutory Decrees
-- Public and authenticated users can view decrees that have passed human verification.
-- Unverified or revoked decrees remain hidden from normal queries.
CREATE POLICY "Anyone can view active verified statutory decrees" ON statutory_decrees
  FOR SELECT USING (
    verification_status = 'VERIFIED_ACTIVE' AND legal_status = 'ACTIVE'
  );

-- 2. Platform Admins can manage decrees
CREATE POLICY "Platform admins can manage statutory decrees" ON statutory_decrees
  FOR ALL USING (
    EXISTS (SELECT 1 FROM platform_admins WHERE platform_admins.user_id = auth.uid())
  );

-- 3. Vector Similarity Search Stored Procedure
CREATE OR REPLACE FUNCTION match_statutory_decrees (
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.78,
  match_count int DEFAULT 5
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
    (1 - (sd.embedding <=> query_embedding))::float AS similarity
  FROM statutory_decrees sd
  WHERE sd.verification_status = 'VERIFIED_ACTIVE'
    AND sd.legal_status = 'ACTIVE'
    AND (1 - (sd.embedding <=> query_embedding)) >= match_threshold
  ORDER BY sd.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- 4. Index on statutory_decrees embedding for cosine distance
CREATE INDEX IF NOT EXISTS idx_statutory_decrees_embedding
  ON statutory_decrees USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 10);
