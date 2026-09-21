import { type Case } from "@/types/database";

export interface InactivityCheckResult {
  actionTaken: "CLOSED_TIMEOUT" | "DISPUTE_FROZEN" | "WAITING" | "NOT_APPLICABLE";
  newLifecycleStatus?: string;
  closureReason?: string;
  outcomeRecorded?: string;
  isTimerPaused: boolean;
  message: string;
}

/**
 * Evaluates whether a case in AWAITING_EVALUATION should be closed due to the 14-day inactivity timeout.
 * Crucial Invariant: If dispute_status === 'OPEN', the countdown is frozen and case is NOT auto-closed.
 * Gate 4 Rule: Timeout closure outcome is strictly INSUFFICIENT_INFORMATION (never "resolved").
 */
export function evaluateInactivityTimeout(
  caseData: Pick<Case, "id" | "lifecycle_status" | "dispute_status" | "evaluation_timeout_at">,
  currentTime: Date = new Date()
): InactivityCheckResult {
  if (caseData.lifecycle_status !== "AWAITING_EVALUATION") {
    return {
      actionTaken: "NOT_APPLICABLE",
      isTimerPaused: false,
      message: `Case ${caseData.id} is in status ${caseData.lifecycle_status}, not AWAITING_EVALUATION.`,
    };
  }

  // Check Dispute Freezing
  if (caseData.dispute_status === "OPEN" || caseData.dispute_status === "ESCALATED") {
    return {
      actionTaken: "DISPUTE_FROZEN",
      isTimerPaused: true,
      message: `Inactivity countdown frozen due to active dispute status: ${caseData.dispute_status}.`,
    };
  }

  const timeoutTime = caseData.evaluation_timeout_at
    ? new Date(caseData.evaluation_timeout_at).getTime()
    : currentTime.getTime() + 14 * 86400000;

  if (currentTime.getTime() >= timeoutTime) {
    return {
      actionTaken: "CLOSED_TIMEOUT",
      newLifecycleStatus: "CLOSED",
      closureReason: "USER_INACTIVITY_TIMEOUT",
      outcomeRecorded: "INSUFFICIENT_INFORMATION",
      isTimerPaused: false,
      message: "Parent did not evaluate within 14 days. Case closed as INSUFFICIENT_INFORMATION.",
    };
  }

  return {
    actionTaken: "WAITING",
    isTimerPaused: false,
    message: "Within 14-day active evaluation window.",
  };
}
