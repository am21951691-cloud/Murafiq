import { describe, it, expect } from "vitest";
import { evaluateInactivityTimeout } from "@/lib/services/inactivity";

describe("Inactivity Timeout & Dispute Freezing Mechanics", () => {
  const caseId = "e4a2a198-5c4d-4b82-9e90-c2874136979a";

  it("freezes inactivity countdown when dispute_status is OPEN", () => {
    // Evaluation timeout was 10 days ago (past 14 days), but dispute is OPEN
    const pastTimeoutDate = new Date(Date.now() - 10 * 86400000).toISOString();

    const caseWithDispute = {
      id: caseId,
      lifecycle_status: "AWAITING_EVALUATION" as const,
      dispute_status: "OPEN" as const,
      evaluation_timeout_at: pastTimeoutDate,
    };

    const result = evaluateInactivityTimeout(caseWithDispute);
    expect(result.actionTaken).toBe("DISPUTE_FROZEN");
    expect(result.isTimerPaused).toBe(true);
    expect(result.newLifecycleStatus).toBeUndefined();
  });

  it("freezes inactivity countdown when dispute_status is ESCALATED", () => {
    const pastTimeoutDate = new Date(Date.now() - 5 * 86400000).toISOString();

    const caseEscalated = {
      id: caseId,
      lifecycle_status: "AWAITING_EVALUATION" as const,
      dispute_status: "ESCALATED" as const,
      evaluation_timeout_at: pastTimeoutDate,
    };

    const result = evaluateInactivityTimeout(caseEscalated);
    expect(result.actionTaken).toBe("DISPUTE_FROZEN");
    expect(result.isTimerPaused).toBe(true);
  });

  it("closes case as INSUFFICIENT_INFORMATION when 14-day timeout is reached with NONE dispute", () => {
    // 15 days ago (timeout reached)
    const pastTimeoutDate = new Date(Date.now() - 86400000).toISOString();

    const timedOutCase = {
      id: caseId,
      lifecycle_status: "AWAITING_EVALUATION" as const,
      dispute_status: "NONE" as const,
      evaluation_timeout_at: pastTimeoutDate,
    };

    const result = evaluateInactivityTimeout(timedOutCase);
    expect(result.actionTaken).toBe("CLOSED_TIMEOUT");
    expect(result.newLifecycleStatus).toBe("CLOSED");
    expect(result.closureReason).toBe("USER_INACTIVITY_TIMEOUT");

    // Gate 4 assertion: outcome is strictly INSUFFICIENT_INFORMATION (never 'resolved')
    expect(result.outcomeRecorded).toBe("INSUFFICIENT_INFORMATION");
    expect(result.outcomeRecorded).not.toBe("RESOLVED");
  });

  it("leaves case in WAITING state when within the 14-day window", () => {
    // Timeout is 5 days in the future
    const futureTimeoutDate = new Date(Date.now() + 5 * 86400000).toISOString();

    const activeCase = {
      id: caseId,
      lifecycle_status: "AWAITING_EVALUATION" as const,
      dispute_status: "NONE" as const,
      evaluation_timeout_at: futureTimeoutDate,
    };

    const result = evaluateInactivityTimeout(activeCase);
    expect(result.actionTaken).toBe("WAITING");
    expect(result.isTimerPaused).toBe(false);
  });
});
