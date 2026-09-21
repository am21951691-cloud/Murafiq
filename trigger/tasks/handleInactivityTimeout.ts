import { evaluateInactivityTimeout } from "@/lib/services/inactivity";
import { createAdminClient } from "@/lib/supabase/admin";

export async function processCaseInactivity(caseId: string) {
  const supabase = createAdminClient();

  const { data: caseRow, error } = await supabase
    .from("cases")
    .select("id, lifecycle_status, dispute_status, evaluation_timeout_at")
    .eq("id", caseId)
    .single();

  if (error || !caseRow) {
    throw new Error(`Case ${caseId} not found`);
  }

  const result = evaluateInactivityTimeout(caseRow);

  if (result.actionTaken === "CLOSED_TIMEOUT") {
    const now = new Date().toISOString();

    await supabase
      .from("cases")
      .update({
        lifecycle_status: "CLOSED",
        closure_reason: result.closureReason,
        closed_at: now,
        updated_at: now,
      })
      .eq("id", caseId);

    await supabase.from("case_events").insert({
      case_id: caseId,
      event_type: "CASE_TIMEOUT_CLOSED",
      from_state: { lifecycle_status: "AWAITING_EVALUATION" },
      to_state: {
        lifecycle_status: "CLOSED",
        closure_reason: result.closureReason,
        outcome: result.outcomeRecorded,
      },
      metadata: {
        timeout_reason: result.message,
        outcome: result.outcomeRecorded,
      },
      created_at: now,
    });
  }

  return result;
}
