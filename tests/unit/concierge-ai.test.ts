import { describe, it, expect } from "vitest";
import {
  getDeterministicConciergeReply,
  askConcierge,
  CONCIERGE_QUICK_SUGGESTIONS_AR,
} from "@/lib/ai/concierge-service";

describe("Murafiq Concierge AI Engine (Interactive Public Chatbot)", () => {
  it("explains the 7-day private grace window accurately in Arabic and English", () => {
    const resAr = getDeterministicConciergeReply("كيف تعمل مهلة الـ 7 أيام لحل الشكوى ودياً؟", "ar");
    expect(resAr.reply).toContain("مهلة مراجعة خاصة مدتها 7 أيام");
    expect(resAr.reply).toContain("PRIVATE_GRACE");
    expect(resAr.directLink?.href).toBe("/cases/new");

    const resEn = getDeterministicConciergeReply("How does the 7-day grace window work?", "en");
    expect(resEn.reply).toContain("7-day private grace window");
    expect(resEn.reply).toContain("PRIVATE_GRACE");
    expect(resEn.directLink?.href).toBe("/cases/new");
  });

  it("explains National ID prohibition and Law 151 data protection", () => {
    const res = getDeterministicConciergeReply("كيف تحمون رقمي القومي وسرية بياناتي؟", "ar");
    expect(res.reply).toContain("151 لسنة 2020");
    expect(res.reply).toContain("يُحظر إدخال الرقم القومي");
    expect(res.reply).toContain("AES-256");
  });

  it("answers consumer protection queries grounded in Law 181/2018 with sector hint", () => {
    const res = getDeterministicConciergeReply("كيف أسترجع أموال اشتراك معيب أو سلعة؟", "ar");
    expect(res.reply).toContain("181 لسنة 2018");
    expect(res.reply).toContain("14 يوماً");
    expect(res.sectorHint).toBe("COMMERCIAL_COMPANIES");
    expect(res.directLink?.href).toContain("COMMERCIAL_COMPANIES");
  });

  it("answers educational inquiries citing Decrees 187/2023 and 420/2014", () => {
    const res = getDeterministicConciergeReply("هل يحق للمدرسة عقاب الطالب بالضرب أو زيادة المصروفات؟", "ar");
    expect(res.reply).toContain("187 لسنة 2023");
    expect(res.reply).toContain("420 لسنة 2014");
    expect(res.sectorHint).toBe("EDUCATION_SCHOOLS");
  });

  it("answers university grievance questions citing Law 49/1972", () => {
    const res = getDeterministicConciergeReply("كيف أقدم تظلم جامعي بخصوص ساعات معتمدة؟", "ar");
    expect(res.reply).toContain("49 لسنة 1972");
    expect(res.sectorHint).toBe("HIGHER_EDUCATION");
  });

  it("answers hospital healthcare queries citing GAHAR and patient rights", () => {
    const res = getDeterministicConciergeReply("ما هي حقوق المريض في المستشفيات ومعايير الاعتماد؟", "ar");
    expect(res.reply).toContain("GAHAR");
    expect(res.reply).toContain("حقوق المريض");
    expect(res.sectorHint).toBe("HEALTHCARE_MEDICAL");
  });

  it("provides comprehensive fallback with quick suggestion pills for general greetings", async () => {
    const res = await askConcierge([{ role: "user", content: "مرحباً، أريد معرفة المزيد" }], "ar");
    expect(res.reply).toContain("مُرافِق");
    expect(res.suggestions.length).toBeGreaterThanOrEqual(3);
  });
});
