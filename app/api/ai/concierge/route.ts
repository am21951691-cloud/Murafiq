import { NextRequest, NextResponse } from "next/server";
import { askConcierge, type ConciergeMessage } from "@/lib/ai/concierge-service";

export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const messages: ConciergeMessage[] = Array.isArray(body?.messages) ? body.messages : [];
    const locale: "ar" | "en" = body?.locale === "en" ? "en" : "ar";

    if (messages.length === 0 && !body?.prompt) {
      return NextResponse.json(
        { error: "No messages provided" },
        { status: 400 }
      );
    }

    const effectiveMessages: ConciergeMessage[] =
      messages.length > 0
        ? messages
        : [{ role: "user", content: String(body.prompt || "") }];

    const result = await askConcierge(effectiveMessages, locale);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      suggestions: result.suggestions,
      sectorHint: result.sectorHint || null,
      directLink: result.directLink || null,
    });
  } catch (error: any) {
    console.error("Concierge API error:", error);
    return NextResponse.json(
      { error: "Internal Server Error in Concierge AI", details: error?.message },
      { status: 500 }
    );
  }
}
