export const DEFAULT_PRIOR_MEAN = 3.0; // m
export const DEFAULT_PRIOR_WEIGHT = 10; // C
export const MIN_CASES_FOR_BENCHMARK = 5;
export const GOVERNORATE_THRESHOLD_MIN_SCHOOLS = 10;

export interface BARSInput {
  ratings: number[]; // R_res ratings (1-5) of user-evaluated closed cases
  priorMean?: number; // m (default 3.0)
  priorWeight?: number; // C (default 10)
  minCasesForBenchmark?: number; // default 5
}

export interface BARSResult {
  barsScore: number;
  observedMean: number;
  sampleSize: number;
  priorMean: number;
  priorWeight: number;
  isEstablishing: boolean;
  statusTextEn: string;
  statusTextAr: string;
  confidenceLevel: "LOW" | "MODERATE" | "HIGH";
}

export interface SchoolBenchmarkMetrics {
  institutionId: string;
  institutionName: string;
  governorate: string;
  bars: BARSResult;
  userConfirmedResolutionRate: number; // percentage (0 - 100)
  medianResponseDays: number;
  totalCases12Months: number;
  sampleSizeContext: string;
}

export interface GovernorateThresholdResult {
  governorate: string;
  institutionCount: number;
  isThresholdMet: boolean;
  minRequired: number;
  messageEn: string;
  messageAr: string;
}

/**
 * Computes the Bayesian Adjusted Resolution Score (BARS).
 *
 * Formula:
 *   BARS = (C * m + sum(R_i)) / (C + n) = (C * m + n * R_bar) / (C + n)
 *
 * Parameters:
 *   C: Prior weight / confidence parameter (default 10)
 *   m: Prior mean rating across the platform (default 3.0)
 *   n: Number of user evaluations
 *   R_bar: Observed empirical average rating
 *
 * If n < 5:
 *   Returns "Establishing Benchmark (N cases)" status.
 */
export function calculateBARS(input: BARSInput): BARSResult {
  const m = input.priorMean ?? DEFAULT_PRIOR_MEAN;
  const C = input.priorWeight ?? DEFAULT_PRIOR_WEIGHT;
  const minCases = input.minCasesForBenchmark ?? MIN_CASES_FOR_BENCHMARK;

  const validRatings = (input.ratings || []).filter(
    (r) => typeof r === "number" && !isNaN(r) && r >= 1 && r <= 5
  );
  const n = validRatings.length;

  if (n === 0) {
    return {
      barsScore: Number(m.toFixed(2)),
      observedMean: 0,
      sampleSize: 0,
      priorMean: m,
      priorWeight: C,
      isEstablishing: true,
      statusTextEn: "Establishing Benchmark (0 cases)",
      statusTextAr: "قيد تأسيس المؤشر (0 حالات)",
      confidenceLevel: "LOW",
    };
  }

  const sumRatings = validRatings.reduce((acc, val) => acc + val, 0);
  const observedMean = sumRatings / n;

  // Bayesian Adjusted Score calculation
  const rawBars = (C * m + sumRatings) / (C + n);
  const barsScore = Number(rawBars.toFixed(2));

  const isEstablishing = n < minCases;

  let confidenceLevel: "LOW" | "MODERATE" | "HIGH" = "LOW";
  if (n >= 20) {
    confidenceLevel = "HIGH";
  } else if (n >= 5) {
    confidenceLevel = "MODERATE";
  }

  return {
    barsScore,
    observedMean: Number(observedMean.toFixed(2)),
    sampleSize: n,
    priorMean: m,
    priorWeight: C,
    isEstablishing,
    statusTextEn: isEstablishing
      ? `Establishing Benchmark (${n} cases)`
      : `${barsScore.toFixed(1)} / 5.0 (${n} verified cases)`,
    statusTextAr: isEstablishing
      ? `قيد تأسيس المؤشر (${n} حالات)`
      : `${barsScore.toFixed(1)} من 5.0 (${n} حالة موثقة)`,
    confidenceLevel,
  };
}

/**
 * Checks whether a governorate has reached the statistical equilibrium threshold
 * (minimum 10 participating institutions required to activate directory rankings).
 */
export function checkGovernorateThreshold(
  governorate: string,
  institutionCount: number,
  minRequired = GOVERNORATE_THRESHOLD_MIN_SCHOOLS
): GovernorateThresholdResult {
  const isThresholdMet = institutionCount >= minRequired;

  return {
    governorate,
    institutionCount,
    isThresholdMet,
    minRequired,
    messageEn: isThresholdMet
      ? `Governorate benchmark active (${institutionCount} institutions participating).`
      : `Governorate benchmark threshold not yet reached (${institutionCount}/${minRequired} participating institutions). Rankings gated to prevent unfair targeting and preserve privacy.`,
    messageAr: isThresholdMet
      ? `المؤشر الإحصائي للمحافظة نشط (${institutionCount} مؤسسة مشاركة).`
      : `لم يكتمل النصاب الإحصائي للمحافظة بعد (${institutionCount}/${minRequired} مؤسسات مشاركة). تم حجب الترتيب العام لحماية التوازن الإحصائي والخصوصية.`,
  };
}

/**
 * Gate 1 Security Check:
 * Enforces strict privacy boundaries for public case display.
 * Private, unmoderated, or safety-flagged cases must NEVER appear in public queries.
 */
export function isCaseSafeForPublicDisplay(caseRecord: {
  visibility: string;
  moderation_status: string;
  safety_status: string;
  lifecycle_status: string;
}): boolean {
  const isPublicVisibility =
    caseRecord.visibility === "PUBLIC" || caseRecord.visibility === "ANONYMOUS_PUBLIC";
  const isApprovedModeration =
    caseRecord.moderation_status === "APPROVED" ||
    caseRecord.moderation_status === "REDACTED_APPROVED";
  const isClearSafety = caseRecord.safety_status === "CLEAR";
  const isClosed = caseRecord.lifecycle_status === "CLOSED";

  return isPublicVisibility && isApprovedModeration && isClearSafety && isClosed;
}
