export interface ActionPlanMilestone {
  title: string;
  ownerRole: string;
  dueDate: string;
  deliverable?: string;
}

export interface ActionPlanPayload {
  officialStatement: string;
  milestones: ActionPlanMilestone[];
  category?: string;
}

export interface RQSBreakdown {
  problemAlignmentScore: number;
  specificityScore: number;
  ownershipScore: number;
  timelineScore: number;
  measurabilityScore: number;
  deductions: number;
  weights: {
    problemAlignment: number;
    specificity: number;
    ownership: number;
    timeline: number;
    measurability: number;
  };
  details: string[];
}

export interface RQSResult {
  rqsScore: number;
  breakdown: RQSBreakdown;
  grade: "EXEMPLARY" | "COMPREHENSIVE" | "ADEQUATE" | "NEEDS_IMPROVEMENT" | "UNSATISFACTORY";
}

const VAGUE_PHRASES = [
  "look into",
  "we will see",
  "try our best",
  "as soon as possible",
  "سوف ننظر",
  "سنحاول",
  "في أقرب وقت",
  "قيد المتابعة العامة",
  "سيتم اتخاذ اللازم",
];

/**
 * Pure deterministic Resolution Quality Score (RQS) Calculator.
 * Given the exact same inputs, it yields the exact same deterministic score and breakdown.
 *
 * Weight Distribution:
 * - Problem Alignment: 30%
 * - Specificity: 20%
 * - Ownership & Accountability: 20%
 * - Category Timeline Heuristic: 15%
 * - Measurability & Deliverables: 15%
 */
export function calculateRQS(plan: ActionPlanPayload): RQSResult {
  const details: string[] = [];
  let deductions = 0;

  const statement = (plan.officialStatement || "").trim();
  const milestones = plan.milestones || [];

  // 1. Problem Alignment (Weight: 30%)
  let problemAlignmentRaw = 0;
  if (statement.length >= 80) {
    problemAlignmentRaw = 100;
  } else if (statement.length >= 40) {
    problemAlignmentRaw = 75;
  } else if (statement.length >= 15) {
    problemAlignmentRaw = 40;
  } else {
    problemAlignmentRaw = 10;
    details.push("Official statement is too brief or evasive.");
  }
  if (milestones.length === 0) {
    problemAlignmentRaw = Math.min(problemAlignmentRaw, 20);
    details.push("Action plan lacks milestones.");
  }

  // 2. Specificity (Weight: 20%)
  let specificityRaw = 0;
  if (milestones.length > 0) {
    let detailedCount = 0;
    milestones.forEach((m) => {
      const t = (m.title || "").trim();
      if (t.length >= 15) detailedCount += 1;
      else if (t.length >= 5) detailedCount += 0.5;
    });
    specificityRaw = Math.min(100, Math.round((detailedCount / milestones.length) * 100));
  }

  // Check for vague statements / evasive phrases
  const lowerStatement = statement.toLowerCase();
  VAGUE_PHRASES.forEach((phrase) => {
    if (lowerStatement.includes(phrase.toLowerCase())) {
      deductions += 8;
      details.push(`Vagueness penalty: contains phrase "${phrase}"`);
    }
  });

  // 3. Ownership & Accountability (Weight: 20%)
  let ownershipRaw = 0;
  if (milestones.length > 0) {
    let ownedCount = 0;
    milestones.forEach((m) => {
      const role = (m.ownerRole || "").trim();
      if (role.length >= 3 && !role.toLowerCase().includes("anyone") && !role.toLowerCase().includes("staff")) {
        ownedCount += 1;
      } else {
        deductions += 5;
        details.push(`Unassigned milestone role for: "${m.title || "Untitled"}"`);
      }
    });
    ownershipRaw = Math.round((ownedCount / milestones.length) * 100);
  }

  // 4. Timeline Heuristic (Weight: 15%)
  let timelineRaw = 0;
  if (milestones.length > 0) {
    let validDates = 0;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    milestones.forEach((m) => {
      const d = (m.dueDate || "").trim();
      if (dateRegex.test(d) && !isNaN(Date.parse(d))) {
        validDates += 1;
      } else {
        deductions += 5;
        details.push(`Missing or invalid deadline date on milestone: "${m.title || "Untitled"}"`);
      }
    });
    timelineRaw = Math.round((validDates / milestones.length) * 100);
  }

  // 5. Measurability & Deliverables (Weight: 15%)
  let measurabilityRaw = 0;
  if (milestones.length > 0) {
    let deliverableCount = 0;
    milestones.forEach((m) => {
      const del = (m.deliverable || "").trim();
      if (del.length >= 5) {
        deliverableCount += 1;
      } else {
        // partial credit if milestone title contains clear outcome verbs
        const t = (m.title || "").toLowerCase();
        if (t.includes("report") || t.includes("meeting") || t.includes("تقرير") || t.includes("اجتماع") || t.includes("إصلاح") || t.includes("repair")) {
          deliverableCount += 0.5;
        }
      }
    });
    measurabilityRaw = Math.min(100, Math.round((deliverableCount / milestones.length) * 100));
  }

  // Weighted Score Calculation
  const weightedBase =
    problemAlignmentRaw * 0.3 +
    specificityRaw * 0.2 +
    ownershipRaw * 0.2 +
    timelineRaw * 0.15 +
    measurabilityRaw * 0.15;

  const finalScore = Math.max(0, Math.min(100, Math.round(weightedBase - deductions)));

  let grade: RQSResult["grade"] = "UNSATISFACTORY";
  if (finalScore >= 85) grade = "EXEMPLARY";
  else if (finalScore >= 70) grade = "COMPREHENSIVE";
  else if (finalScore >= 50) grade = "ADEQUATE";
  else if (finalScore >= 35) grade = "NEEDS_IMPROVEMENT";

  return {
    rqsScore: finalScore,
    breakdown: {
      problemAlignmentScore: problemAlignmentRaw,
      specificityScore: specificityRaw,
      ownershipScore: ownershipRaw,
      timelineScore: timelineRaw,
      measurabilityScore: measurabilityRaw,
      deductions,
      weights: {
        problemAlignment: 0.3,
        specificity: 0.2,
        ownership: 0.2,
        timeline: 0.15,
        measurability: 0.15,
      },
      details,
    },
    grade,
  };
}
