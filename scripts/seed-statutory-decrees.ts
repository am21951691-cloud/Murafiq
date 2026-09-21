import { createAdminClient } from "../lib/supabase/admin";
import { getEmbedding } from "../lib/ai/embeddings";
import {
  CURATED_STATUTORY_DECREES,
  type CuratedDecree,
  VERIFIED_HUMAN_REVIEWER_ID,
} from "../lib/ai/statutory-data";

export { CURATED_STATUTORY_DECREES, type CuratedDecree, VERIFIED_HUMAN_REVIEWER_ID };

/**
 * Seeds human-verified Egyptian statutory decrees into the `statutory_decrees` database table.
 * Computes 1536-dimensional embeddings for each decree using the unified embedding client.
 */
export async function seedStatutoryDecrees(options?: { dryRun?: boolean }) {
  const isDryRun = options?.dryRun ?? false;
  console.log(`[Seed Statutory Decrees] Starting ingestion of ${CURATED_STATUTORY_DECREES.length} curated decrees...`);

  const processedDecrees = [];

  for (const decree of CURATED_STATUTORY_DECREES) {
    // Verification Gate Check: Ensure decree has human reviewer ID and active status
    if (!decree.verified_by_user_id) {
      throw new Error(`Decree ${decree.id} is missing mandatory verified_by_user_id`);
    }
    if (decree.verification_status !== "VERIFIED_ACTIVE") {
      throw new Error(`Decree ${decree.id} has invalid verification_status: ${decree.verification_status}`);
    }

    // Compute embedding for decree text
    const embedding = await getEmbedding(`${decree.title}\n${decree.source_reference}\n${decree.text_content}`);

    const record = {
      id: decree.id,
      source_reference: decree.source_reference,
      issuing_authority: decree.issuing_authority,
      article_number: decree.article_number,
      title: decree.title,
      text_content: decree.text_content,
      publication_date: decree.publication_date,
      effective_date: decree.effective_date,
      legal_status: decree.legal_status,
      last_verified_date: decree.last_verified_date,
      verified_by_user_id: decree.verified_by_user_id,
      verification_status: decree.verification_status,
      legal_review_notes: decree.legal_review_notes,
      embedding,
    };

    processedDecrees.push(record);
    console.log(`[Seed] Processed: ${decree.source_reference} - ${decree.article_number} (${decree.title})`);
  }

  if (!isDryRun && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NODE_ENV !== "test") {
    try {
      const adminClient = createAdminClient();
      const { data, error } = await adminClient
        .from("statutory_decrees")
        .upsert(processedDecrees, { onConflict: "id" });

      if (error) {
        console.error("[Seed] Error upserting to database:", error);
      } else {
        console.log(`[Seed] Successfully persisted ${processedDecrees.length} decrees to Supabase.`);
      }
    } catch (err) {
      console.warn("[Seed] Supabase not reachable, skipped remote DB write:", err);
    }
  } else {
    console.log(`[Seed] Prepared ${processedDecrees.length} verified decrees with 1536-dim embeddings.`);
  }

  return processedDecrees;
}

// Direct execution entrypoint
if (require.main === module || (typeof process !== "undefined" && process.argv[1]?.includes("seed-statutory-decrees"))) {
  seedStatutoryDecrees()
    .then(() => {
      console.log("[Seed Statutory Decrees] Finished successfully.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("[Seed Statutory Decrees] Fatal error:", err);
      process.exit(1);
    });
}
