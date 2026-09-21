import crypto from "crypto";

export const EMBEDDING_DIMENSION = 1536;

/**
 * Normalizes text for semantic processing:
 * - Lowercases ASCII
 * - Strips Arabic diacritics (tashkeel)
 * - Normalizes Arabic letter variants (alef, taa marbuta, yaa)
 * - Strips non-alphanumeric punctuation
 */
export function normalizeTextForEmbedding(text: string): string {
  if (!text) return "";

  return text
    .toLowerCase()
    // Remove Arabic diacritics (tashkeel: fatha, damma, kasra, sukun, shadda, tanween)
    .replace(/[\u064B-\u065F\u0670]/g, "")
    // Normalize alef variants (أ, إ, آ -> ا)
    .replace(/[أإآ]/g, "ا")
    // Normalize taa marbuta (ة -> ه)
    .replace(/ة/g, "ه")
    // Normalize yaa (ى -> ي)
    .replace(/ى/g, "ي")
    // Remove punctuation & excess whitespace
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Generates stem variants for Arabic and English tokens
 * (strips prefixes like ال, وال, بال, لل and English plurals).
 */
export function getTokenStems(token: string): string[] {
  const stems = [token];

  // Arabic prefixes
  if (token.startsWith("وال") && token.length > 4) {
    stems.push(token.slice(3));
  } else if (token.startsWith("بال") && token.length > 4) {
    stems.push(token.slice(3));
  } else if (token.startsWith("كال") && token.length > 4) {
    stems.push(token.slice(3));
  } else if (token.startsWith("ال") && token.length > 3) {
    stems.push(token.slice(2));
  } else if (token.startsWith("لل") && token.length > 3) {
    stems.push(token.slice(2));
  } else if (token.startsWith("و") && token.length > 3) {
    stems.push(token.slice(1));
  }

  // English plural suffix
  if (token.endsWith("s") && token.length > 3) {
    stems.push(token.slice(0, -1));
  }

  return stems;
}

/**
 * Pure mathematical Cosine Similarity between two numerical vectors.
 * Returns a value between -1.0 and 1.0 (clamped to 0.0..1.0 for semantic matching).
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  const similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  return Math.max(0, Math.min(1, similarity));
}

/**
 * Domain semantic topic categories and their associated keywords.
 * Each topic category is assigned a distinct subspace in the 1536-dimensional vector.
 */
interface TopicSubspace {
  name: string;
  startIndex: number;
  endIndex: number;
  weight: number;
  keywords: string[];
}

const TOPIC_SUBSPACES: TopicSubspace[] = [
  {
    name: "STUDENT_DISCIPLINE_AND_PROTECTION", // Decree 187/2023
    startIndex: 0,
    endIndex: 255,
    weight: 4.0,
    keywords: [
      "انضباط", "انضباط مدرسي", "سلوك", "مخالفه", "مخالفات سلوكيه", "عقاب", "عقاب بدني", "عقاب نفسي",
      "ضرب", "اهانه", "ايذاء", "ايذاء لفظي", "تحقير", "تنمر", "عنف", "لائحه الانضباط", "لجنه الحمايه",
      "لجنه الحمايه المدرسيه", "حظر العقاب", "مجلس الامناء", "اخصائي اجتماعي", "فصل", "طرد", "تهديد",
      "discipline", "student discipline", "behavior", "misconduct", "corporal punishment", "physical punishment",
      "slap", "beat", "hit", "abuse", "verbal abuse", "humiliation", "bullying", "violence", "protection committee",
      "school discipline committee", "code of conduct", "restorative", "suspension", "expulsion"
    ],
  },
  {
    name: "TUITION_FEES_AND_PRIVATE_REGULATION", // Decree 420/2014
    startIndex: 256,
    endIndex: 511,
    weight: 4.0,
    keywords: [
      "تعليم خاص", "مصروفات", "مصاريف", "رسوم", "رسوم دراسيه", "اقساط", "تقسيط", "سداد", "زياده سنويه",
      "شريحه", "مدرسه خاصه", "مدارس خاصه", "مدرسه دوليه", "كتب", "كتب مدرسيه", "انشطه", "حساب بنكي", "ايصال",
      "تحصيل", "القرار 420", "ترخيص", "مخالفه ماليه", "زياده المصروفات",
      "private education", "tuition", "tuition fees", "fees", "school fees", "installments", "installment",
      "installment plan", "payment", "annual increase", "fee hike", "private school", "international school",
      "textbooks", "activities", "bank account", "receipt", "collection", "decree 420", "licensing",
      "financial violation", "refund"
    ],
  },
  {
    name: "TRANSPORTATION_AND_BUS_SAFETY", // Decree 420/2014 & CPA
    startIndex: 512,
    endIndex: 767,
    weight: 4.0,
    keywords: [
      "نقل", "نقل مدرسي", "حافله", "حافلات", "باص", "اتوبيس", "مشرفه", "مشرفه الباص", "سائق", "سلامه الحافله",
      "حزام الامان", "اعطال", "تاخير", "خط سير", "اشتراك الباص", "رسوم النقل", "استرداد رسوم الباص",
      "transport", "transportation", "school bus", "buses", "bus driver", "bus supervisor", "bus safety",
      "seatbelt", "bus route", "bus breakdown", "transit delay", "bus fee", "bus refund"
    ],
  },
  {
    name: "CONSUMER_PROTECTION_AND_UNIFORM_MONOPOLY", // CPA Directive & Law 181/2018
    startIndex: 768,
    endIndex: 1023,
    weight: 4.0,
    keywords: [
      "حمايه المستهلك", "جهاز حمايه المستهلك", "زي", "زي مدرسي", "يونيفورم", "احتكار", "متجر حصري", "منفذ محدد",
      "اجبار", "شراء اجباري", "استرداد", "رد مقابل", "خدمات غير مؤداه", "عقد تقديم خدمه", "قانون 181",
      "consumer protection", "cpa", "uniform", "school uniform", "monopoly", "exclusive vendor", "exclusive outlet",
      "forced purchase", "compulsory buy", "refund", "reimbursement", "undelivered service", "service contract", "law 181"
    ],
  },
  {
    name: "FACILITIES_HEALTH_AND_SAFETY",
    startIndex: 1024,
    endIndex: 1279,
    weight: 2.0,
    keywords: [
      "مرافق", "سلامه مدرسيه", "صحه", "اسعافات اوليه", "معمل", "ملعب", "نظافه", "صيانه", "مبنى", "حريق", "طوارئ",
      "facilities", "health", "first aid", "laboratory", "playground", "sanitation", "maintenance", "fire hazard"
    ],
  },
  {
    name: "ACADEMIC_CURRICULUM_AND_EXAMS",
    startIndex: 1280,
    endIndex: 1535,
    weight: 2.0,
    keywords: [
      "منهج", "تدريس", "امتحانات", "تقييم", "شهاده", "معلم", "كفاءه", "درجات", "اعمال سنه", "غياب",
      "curriculum", "teaching", "exams", "assessment", "grades", "teacher", "qualification", "attendance"
    ],
  },
];

/**
 * Deterministic Semantic Embedding Generator.
 * Constructs a 1536-dimensional unit vector from text semantics:
 * - Uses whole token and stem matching to activate domain topic subspaces.
 * - Uses a FIXED directional basis for each subspace so that any text touching that topic
 *   projects along the identical direction with magnitude scaled by relevance.
 * - General lexical noise is distributed deterministically across the remaining subspace.
 * - Normalizes the entire vector to unit Euclidean length (L2 norm = 1.0).
 */
export function generateDeterministicEmbedding(text: string): number[] {
  const vector = new Array<number>(EMBEDDING_DIMENSION).fill(0);
  const normalized = normalizeTextForEmbedding(text);

  if (!normalized) {
    // Return unit vector along first axis for empty string
    vector[0] = 1.0;
    return vector;
  }

  const rawTokens = normalized.split(/\s+/).filter(Boolean);
  // Collect all token stems
  const allStems = new Set<string>();
  for (const t of rawTokens) {
    for (const s of getTokenStems(t)) {
      allStems.add(s);
    }
  }

  // 1. Topic Subspace Activation with Fixed Basis Direction
  for (const subspace of TOPIC_SUBSPACES) {
    let matchesCount = 0;
    for (const kw of subspace.keywords) {
      const normKw = normalizeTextForEmbedding(kw);
      if (normKw.includes(" ")) {
        // Multi-word phrase check
        if (normalized.includes(normKw)) {
          matchesCount += 3;
        }
      } else {
        // Single word: match against token stems to prevent substring false positives
        if (allStems.has(normKw)) {
          matchesCount += 1;
        }
      }
    }

    if (matchesCount > 0) {
      // Subspace activation magnitude (bounded logarithmic scale)
      const magnitude = Math.log2(1 + matchesCount) * subspace.weight;

      // Project onto fixed orthonormal basis direction for this subspace
      for (let i = subspace.startIndex; i <= subspace.endIndex; i++) {
        // Basis direction depends solely on index i and subspace - NOT on matchesCount!
        const basisDir = Math.sin((i + 1) * 71.19 + subspace.startIndex * 0.317);
        vector[i] += magnitude * basisDir;
      }
    }
  }

  // 2. Lexical Token Hashing (Dense vocabulary spread across all 1536 dimensions)
  for (const token of rawTokens) {
    const hash = crypto.createHash("sha256").update(token).digest();
    for (let j = 0; j < 4; j++) {
      const dim = hash.readUInt16BE(j * 2) % EMBEDDING_DIMENSION;
      const sign = (hash[8 + j] % 2 === 0) ? 1 : -1;
      const magnitude = (hash[16 + j] / 255) * 0.15;
      vector[dim] += sign * magnitude;
    }
  }

  // 3. Euclidean L2 Normalization (Unit Length)
  let norm = 0;
  for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
    norm += vector[i] * vector[i];
  }

  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < EMBEDDING_DIMENSION; i++) {
      vector[i] = vector[i] / norm;
    }
  } else {
    vector[0] = 1.0;
  }

  return vector;
}

/**
 * Single canonical embedding function.
 * Uses OpenAI text-embedding-3-small when OPENAI_API_KEY is present and not in test environment.
 * Otherwise uses deterministic semantic embedding generator.
 */
export async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  const isTest = process.env.NODE_ENV === "test" || !apiKey;

  if (!isTest && apiKey) {
    try {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "text-embedding-3-small",
          input: text,
          dimensions: EMBEDDING_DIMENSION,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.data && data.data[0] && Array.isArray(data.data[0].embedding)) {
          return data.data[0].embedding;
        }
      }
    } catch {
      // Fallback to deterministic embedding on network failure
    }
  }

  return generateDeterministicEmbedding(text);
}

/**
 * Batch embedding generator.
 */
export async function getEmbeddings(texts: string[]): Promise<number[][]> {
  return Promise.all(texts.map((t) => getEmbedding(t)));
}
