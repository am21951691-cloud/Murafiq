import { describe, it, expect } from "vitest";
import crypto from "crypto";
import {
  formatWhatsAppRecipient,
  hashPhoneNumber,
  buildWhatsAppTemplatePayload,
  verifyMetaWebhookSignature,
  DEFAULT_TEMPLATE_NAME,
} from "../../lib/whatsapp/client";

describe("Slice 6: WhatsApp Cloud API Client & Payload Unit Tests", () => {
  describe("Phone Formatting & Hashing", () => {
    it("formats Egyptian mobile numbers into WhatsApp digits-only recipient format", () => {
      expect(formatWhatsAppRecipient("01012345678")).toBe("201012345678");
      expect(formatWhatsAppRecipient("+201123456789")).toBe("201123456789");
      expect(formatWhatsAppRecipient("00201234567890")).toBe("201234567890");
    });

    it("generates deterministic SHA-256 phone hashes for retention tracking", () => {
      const hash1 = hashPhoneNumber("01012345678");
      const hash2 = hashPhoneNumber("+201012345678");

      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
      expect(hash1).toBe(hash2); // Same phone in different formats produces identical hash

      // Different phone produces different hash
      const hash3 = hashPhoneNumber("01198765432");
      expect(hash1).not.toBe(hash3);
    });
  });

  describe("Template Payload Mapping", () => {
    it("builds compliant Meta template message structure for case_resolution_document_ar", () => {
      const input = {
        recipientPhone: "01012345678",
        caseReference: "MRF-2026-0941",
        institutionName: "مدرسة الأمل التجريبية",
        signedUrl: "https://storage.murafiq.edu.eg/reports/case_123_v1.pdf?token=xyz",
        parentName: "أحمد علي",
      };

      const payload = buildWhatsAppTemplatePayload(input);

      expect(payload.messaging_product).toBe("whatsapp");
      expect(payload.to).toBe("201012345678");
      expect(payload.type).toBe("template");
      expect(payload.template.name).toBe(DEFAULT_TEMPLATE_NAME);
      expect(payload.template.language.code).toBe("ar");

      // Verify 4 parameters in body component
      const bodyComponent = payload.template.components.find(
        (c) => c.type === "body"
      );
      expect(bodyComponent).toBeDefined();
      expect(bodyComponent?.parameters).toHaveLength(4);
      expect(bodyComponent?.parameters[0].text).toBe("أحمد علي");
      expect(bodyComponent?.parameters[1].text).toBe("MRF-2026-0941");
      expect(bodyComponent?.parameters[2].text).toBe("مدرسة الأمل التجريبية");
      expect(bodyComponent?.parameters[3].text).toContain("https://storage.murafiq.edu.eg");
    });

    it("defaults parentName to respectful generic title if omitted", () => {
      const payload = buildWhatsAppTemplatePayload({
        recipientPhone: "01012345678",
        caseReference: "MRF-2026-0001",
        institutionName: "مدرسة خاصة",
        signedUrl: "https://murafiq.edu.eg/doc.pdf",
      });

      const body = payload.template.components.find((c) => c.type === "body");
      expect(body?.parameters[0].text).toBe("ولي الأمر الفاضل");
    });
  });

  describe("HMAC-SHA256 Signature Verification", () => {
    const secret = "test_app_secret_123456";
    const body = JSON.stringify({ entry: [{ id: "1" }] });

    it("successfully verifies valid Meta HMAC-SHA256 signature", () => {
      const hmac = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("hex");
      const signatureHeader = `sha256=${hmac}`;

      expect(verifyMetaWebhookSignature(body, signatureHeader, secret)).toBe(true);
    });

    it("rejects tampered body or invalid signature", () => {
      const hmac = crypto
        .createHmac("sha256", secret)
        .update(body, "utf8")
        .digest("hex");
      const signatureHeader = `sha256=${hmac}`;

      // Tampered body
      const tamperedBody = JSON.stringify({ entry: [{ id: "2" }] });
      expect(
        verifyMetaWebhookSignature(tamperedBody, signatureHeader, secret)
      ).toBe(false);

      // Wrong secret
      expect(
        verifyMetaWebhookSignature(body, signatureHeader, "wrong_secret")
      ).toBe(false);

      // Malformed header without 'sha256=' prefix
      expect(verifyMetaWebhookSignature(body, hmac, secret)).toBe(false);

      // Missing signature header
      expect(verifyMetaWebhookSignature(body, null, secret)).toBe(false);
    });
  });
});
