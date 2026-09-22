import { describe, it, expect } from "vitest";
import { slaEngine, DEFAULT_PRIORITY_HOURS } from "@/lib/services/sla-engine";

describe("Enterprise SLA Engine", () => {
  it("resolves default priority target hours correctly", () => {
    expect(slaEngine.getPriorityTargetHours("CRITICAL")).toBe(24);
    expect(slaEngine.getPriorityTargetHours("HIGH")).toBe(48);
    expect(slaEngine.getPriorityTargetHours("MEDIUM")).toBe(96);
    expect(slaEngine.getPriorityTargetHours("LOW")).toBe(168);
  });

  it("respects tenant-specific SLA policy overrides", () => {
    const customConfig = {
      first_response_hours: 12,
      action_plan_hours: 36,
      resolution_hours: 72,
      critical_resolution_hours: 12,
      high_resolution_hours: 24,
    };

    expect(slaEngine.getPriorityTargetHours("CRITICAL", customConfig)).toBe(12);
    expect(slaEngine.getPriorityTargetHours("HIGH", customConfig)).toBe(24);
    // Medium falls back to default if not overridden
    expect(slaEngine.getPriorityTargetHours("MEDIUM", customConfig)).toBe(96);
  });

  it("calculates Egyptian business hours excluding Friday and Saturday", () => {
    // 2026-09-20 is Sunday (working day in Egypt), 09:00 to 13:00 -> 4 business hours
    const startSunday = new Date("2026-09-20T09:00:00Z");
    const endSunday = new Date("2026-09-20T13:00:00Z");

    const hoursSunday = slaEngine.calculateBusinessHoursBetween(startSunday, endSunday);
    expect(hoursSunday).toBe(4);

    // 2026-09-25 is Friday (weekend in Egypt)
    const startFriday = new Date("2026-09-25T09:00:00Z");
    const endFriday = new Date("2026-09-25T15:00:00Z");

    const hoursFriday = slaEngine.calculateBusinessHoursBetween(startFriday, endFriday);
    expect(hoursFriday).toBe(0);
  });

  it("evaluates SLA status and flags breaches accurately", () => {
    const pastDate = new Date(Date.now() - 36 * 3600000).toISOString(); // 36 hours ago

    const criticalCase = {
      priority: "CRITICAL" as const, // 24h target
      created_at: pastDate,
      lifecycle_status: "IN_PROGRESS" as const,
    };

    const status = slaEngine.checkSlaStatus(criticalCase);

    expect(status.targetHours).toBe(24);
    expect(status.isBreached).toBe(true);
    expect(status.elapsedHours).toBeGreaterThanOrEqual(35);
  });

  it("flags at-risk cases when less than 25% of SLA deadline remains", () => {
    const now = Date.now();
    // 20 hours into a 24-hour target (4 hours remaining = 16.6% remaining < 25%)
    const createdAt = new Date(now - 20 * 3600000).toISOString();

    const atRiskCase = {
      priority: "CRITICAL" as const, // 24h target
      created_at: createdAt,
      lifecycle_status: "IN_PROGRESS" as const,
    };

    const status = slaEngine.checkSlaStatus(atRiskCase);

    expect(status.isBreached).toBe(false);
    expect(status.isAtRisk).toBe(true);
  });
});
