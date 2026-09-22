import type { Case, CasePriority, TenantSlaConfig } from "@/types/database";

export interface SlaBusinessHoursConfig {
  startHour: number; // e.g. 8 (08:00)
  endHour: number;   // e.g. 16 (16:00)
  workingDays: number[]; // e.g. [0, 1, 2, 3, 4] for Sun-Thu in Egypt
}

export const DEFAULT_EGYPT_BUSINESS_HOURS: SlaBusinessHoursConfig = {
  startHour: 8,
  endHour: 16,
  workingDays: [0, 1, 2, 3, 4], // Sunday to Thursday
};

export const DEFAULT_PRIORITY_HOURS: Record<CasePriority, number> = {
  CRITICAL: 24,
  HIGH: 48,
  MEDIUM: 96,
  LOW: 168,
};

export interface SlaStatusResult {
  priority: CasePriority;
  targetHours: number;
  deadline: Date;
  elapsedHours: number;
  remainingHours: number;
  isBreached: boolean;
  isAtRisk: boolean;
  percentElapsed: number;
}

export class SlaEngine {
  /**
   * Returns priority-based resolution target hours
   */
  public getPriorityTargetHours(
    priority: CasePriority = "MEDIUM",
    config?: TenantSlaConfig
  ): number {
    if (config) {
      if (priority === "CRITICAL" && config.critical_resolution_hours) return config.critical_resolution_hours;
      if (priority === "HIGH" && config.high_resolution_hours) return config.high_resolution_hours;
      if (priority === "MEDIUM" && config.medium_resolution_hours) return config.medium_resolution_hours;
      if (priority === "LOW" && config.low_resolution_hours) return config.low_resolution_hours;
    }
    return DEFAULT_PRIORITY_HOURS[priority] || DEFAULT_PRIORITY_HOURS.MEDIUM;
  }

  /**
   * Calculates business hours between two dates according to working schedule
   */
  public calculateBusinessHoursBetween(
    startDate: Date,
    endDate: Date,
    config: SlaBusinessHoursConfig = DEFAULT_EGYPT_BUSINESS_HOURS
  ): number {
    if (endDate <= startDate) return 0;

    let totalBusinessHours = 0;
    const current = new Date(startDate);

    while (current < endDate) {
      const dayOfWeek = current.getDay();
      const isWorkDay = config.workingDays.includes(dayOfWeek);

      if (isWorkDay) {
        const currentHour = current.getHours() + current.getMinutes() / 60;

        if (currentHour >= config.startHour && currentHour < config.endHour) {
          // Calculate fraction to next hour or endDate
          const nextHour = new Date(current);
          nextHour.setHours(current.getHours() + 1, 0, 0, 0);

          const stepEnd = nextHour < endDate ? nextHour : endDate;
          const stepHours = (stepEnd.getTime() - current.getTime()) / (1000 * 60 * 60);

          totalBusinessHours += Math.min(stepHours, config.endHour - currentHour);
          current.setTime(stepEnd.getTime());
          continue;
        }
      }

      // Advance by 1 hour
      current.setHours(current.getHours() + 1, 0, 0, 0);
    }

    return Math.round(totalBusinessHours * 10) / 10;
  }

  /**
   * Computes expected deadline date by adding business hours
   */
  public calculateBusinessDeadline(
    startDate: Date,
    targetHours: number,
    config: SlaBusinessHoursConfig = DEFAULT_EGYPT_BUSINESS_HOURS
  ): Date {
    const dailyHours = config.endHour - config.startHour;
    if (dailyHours <= 0) {
      return new Date(startDate.getTime() + targetHours * 3600000);
    }

    let hoursLeftToAdd = targetHours;
    const current = new Date(startDate);

    // If starting outside business hours, advance to next business start
    while (hoursLeftToAdd > 0) {
      const dayOfWeek = current.getDay();
      const isWorkDay = config.workingDays.includes(dayOfWeek);

      if (!isWorkDay) {
        current.setDate(current.getDate() + 1);
        current.setHours(config.startHour, 0, 0, 0);
        continue;
      }

      const currentHour = current.getHours() + current.getMinutes() / 60;
      if (currentHour < config.startHour) {
        current.setHours(config.startHour, 0, 0, 0);
        continue;
      }

      if (currentHour >= config.endHour) {
        current.setDate(current.getDate() + 1);
        current.setHours(config.startHour, 0, 0, 0);
        continue;
      }

      const hoursAvailableToday = config.endHour - currentHour;
      if (hoursLeftToAdd <= hoursAvailableToday) {
        current.setTime(current.getTime() + hoursLeftToAdd * 3600000);
        hoursLeftToAdd = 0;
      } else {
        hoursLeftToAdd -= hoursAvailableToday;
        current.setDate(current.getDate() + 1);
        current.setHours(config.startHour, 0, 0, 0);
      }
    }

    return current;
  }

  /**
   * Evaluates full SLA compliance and status for a given case
   */
  public checkSlaStatus(
    caseItem: Partial<Case>,
    tenantConfig?: TenantSlaConfig,
    now: Date = new Date()
  ): SlaStatusResult {
    const priority = caseItem.priority || "MEDIUM";
    const targetHours = this.getPriorityTargetHours(priority, tenantConfig);

    const createdAt = caseItem.created_at ? new Date(caseItem.created_at) : now;

    // Use explicit sla_target_at if set, otherwise compute
    const deadline = caseItem.sla_target_at
      ? new Date(caseItem.sla_target_at)
      : new Date(createdAt.getTime() + targetHours * 3600000);

    const endReference = caseItem.resolved_at
      ? new Date(caseItem.resolved_at)
      : caseItem.closed_at
      ? new Date(caseItem.closed_at)
      : now;

    const msElapsed = Math.max(0, endReference.getTime() - createdAt.getTime());
    const elapsedHours = Math.round((msElapsed / (1000 * 60 * 60)) * 10) / 10;

    const msRemaining = deadline.getTime() - now.getTime();
    const remainingHours = Math.round((msRemaining / (1000 * 60 * 60)) * 10) / 10;

    const isBreached = now > deadline && caseItem.lifecycle_status !== "CLOSED";
    const isAtRisk = !isBreached && remainingHours > 0 && remainingHours <= targetHours * 0.25;

    const percentElapsed = Math.min(
      200,
      Math.round((elapsedHours / Math.max(1, targetHours)) * 100)
    );

    return {
      priority,
      targetHours,
      deadline,
      elapsedHours,
      remainingHours: Math.max(0, remainingHours),
      isBreached,
      isAtRisk,
      percentElapsed,
    };
  }
}

export const slaEngine = new SlaEngine();
