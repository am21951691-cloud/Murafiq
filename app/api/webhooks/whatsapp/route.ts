import { NextRequest, NextResponse } from "next/server";
import { verifyMetaWebhookSignature } from "@/lib/whatsapp/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Meta Webhook Verification Handshake (GET)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const expectedToken =
    process.env.WHATSAPP_VERIFY_TOKEN || "murafiq_webhook_verify_token_2026";

  if (mode === "subscribe" && token === expectedToken && challenge) {
    return new Response(challenge, {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  }

  return new Response("Forbidden: Invalid verification token", { status: 403 });
}

/**
 * Meta WhatsApp Inbound Delivery Webhook Receiver (POST)
 * Updates `whatsapp_dispatches.delivery_status`.
 *
 * STRICT RULE (Gate 4):
 * Delivery webhooks NEVER mutate `cases.lifecycle_status` or modify case records.
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");
    const appSecret =
      process.env.WHATSAPP_APP_SECRET || "murafiq_app_secret_test_key_2026";

    // Gate 1: Mandatory HMAC-SHA256 Signature Verification
    const isValidSignature = verifyMetaWebhookSignature(
      rawBody,
      signature,
      appSecret
    );

    if (!isValidSignature) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: Invalid webhook signature" },
        { status: 401 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload" },
        { status: 400 }
      );
    }

    let processedCount = 0;
    const entries = payload.entry || [];

    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const change of changes) {
        const statuses = change.value?.statuses || [];
        for (const statusObj of statuses) {
          const providerMessageId = statusObj.id;
          const statusName = statusObj.status?.toLowerCase();

          let mappedStatus: "SENT" | "DELIVERED" | "READ" | "FAILED" = "SENT";
          if (statusName === "delivered") mappedStatus = "DELIVERED";
          else if (statusName === "read") mappedStatus = "READ";
          else if (statusName === "failed") mappedStatus = "FAILED";

          // Update whatsapp_dispatches in database
          if (
            process.env.NODE_ENV !== "test" &&
            process.env.SUPABASE_SERVICE_ROLE_KEY
          ) {
            try {
              const adminClient = createAdminClient();
              await adminClient
                .from("whatsapp_dispatches")
                .update({
                  delivery_status: mappedStatus,
                  updated_at: new Date().toISOString(),
                })
                .eq("provider_message_id", providerMessageId);
            } catch (err) {
              console.warn(
                "[WhatsAppWebhook] Error updating dispatch status in DB:",
                err
              );
            }
          }

          processedCount++;
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        processedCount,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[WhatsAppWebhook] Fatal webhook handler error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
