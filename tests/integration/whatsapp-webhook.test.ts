import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { NextRequest } from "next/server";
import { GET, POST } from "../../app/api/webhooks/whatsapp/route";
import {
  sendWhatsAppResolutionReport,
  purgeOldPhoneNumbers,
} from "../../trigger/tasks/sendWhatsAppReport";

describe("Slice 6: Meta WhatsApp Webhook & Dispatch Integration Tests", () => {
  const secret = process.env.WHATSAPP_APP_SECRET || "murafiq_app_secret_test_key_2026";
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN || "murafiq_webhook_verify_token_2026";

  describe("Step 6.3: Webhook Verification Handshake (GET)", () => {
    it("returns challenge with status 200 when hub.verify_token matches", async () => {
      const challenge = "test_challenge_code_987654";
      const url = `http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=${verifyToken}&hub.challenge=${challenge}`;
      const req = new NextRequest(url, { method: "GET" });

      const res = await GET(req);
      expect(res.status).toBe(200);

      const text = await res.text();
      expect(text).toBe(challenge);
    });

    it("returns 403 Forbidden when hub.verify_token is incorrect", async () => {
      const url = `http://localhost:3000/api/webhooks/whatsapp?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge=12345`;
      const req = new NextRequest(url, { method: "GET" });

      const res = await GET(req);
      expect(res.status).toBe(403);
    });
  });

  describe("Gate 1: HMAC-SHA256 Security & Delivery Inbound (POST)", () => {
    it("rejects unsigned requests with 401 Unauthorized", async () => {
      const req = new NextRequest("http://localhost:3000/api/webhooks/whatsapp", {
        method: "POST",
        body: JSON.stringify({ entry: [] }),
      });

      const res = await POST(req);
      expect(res.status).toBe(401);

      const json = await res.json();
      expect(json.error).toContain("Invalid webhook signature");
    });

    it("rejects requests with forged or invalid HMAC signature", async () => {
      const body = JSON.stringify({ entry: [] });
      const req = new NextRequest("http://localhost:3000/api/webhooks/whatsapp", {
        method: "POST",
        headers: {
          "x-hub-signature-256": "sha256=invalid_hash_00000000000000000000000000000000",
        },
        body,
      });

      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("successfully validates HMAC signature and processes delivered status update", async () => {
      const payload = {
        object: "whatsapp_business_account",
        entry: [
          {
            id: "WHATSAPP_BUSINESS_ACCOUNT_ID",
            changes: [
              {
                value: {
                  messaging_product: "whatsapp",
                  metadata: {
                    display_phone_number: "201000000000",
                    phone_number_id: "100000000000001",
                  },
                  statuses: [
                    {
                      id: "wamid.HBgMtestmessageid123",
                      status: "delivered",
                      timestamp: "1726000000",
                      recipient_id: "201012345678",
                    },
                    {
                      id: "wamid.HBgMtestmessageid124",
                      status: "read",
                      timestamp: "1726000050",
                      recipient_id: "201012345678",
                    },
                  ],
                },
                field: "messages",
              },
            ],
          },
        ],
      };

      const rawBody = JSON.stringify(payload);
      const signature = `sha256=${crypto
        .createHmac("sha256", secret)
        .update(rawBody, "utf8")
        .digest("hex")}`;

      const req = new NextRequest("http://localhost:3000/api/webhooks/whatsapp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hub-signature-256": signature,
        },
        body: rawBody,
      });

      const res = await POST(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.processedCount).toBe(2);
    });
  });

  describe("Step 6.2: Dispatch Worker & Retention Purge", () => {
    it("dispatches resolution report and produces expected idempotency key and signed URL", async () => {
      const caseId = "33333333-4444-5555-6666-777777777777";
      const result = await sendWhatsAppResolutionReport({
        caseId,
        version: 1,
        recipientPhone: "01012345678",
        parentName: "طارق محمود",
        institutionName: "مدرسة الشروق",
      });

      expect(result.success).toBe(true);
      expect(result.idempotencyKey).toBe(`wa_msg_${caseId}_v1`);
      expect(result.deliveryStatus).toBe("SENT");
      expect(result.providerMessageId).toContain("wamid.mock");
      expect(result.recipientPhoneHash).toMatch(/^[a-f0-9]{64}$/);
      expect(result.signedUrl).toContain(caseId);
    });

    it("runs 30-day phone number retention purge task cleanly", async () => {
      const purgeResult = await purgeOldPhoneNumbers();
      expect(purgeResult).toBeDefined();
      expect(typeof purgeResult.purgedCount).toBe("number");
    });
  });
});
