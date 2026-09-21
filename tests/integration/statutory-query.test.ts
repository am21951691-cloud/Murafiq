import { describe, it, expect } from "vitest";
import { POST } from "../../app/api/ai/statutory-query/route";
import { NextRequest } from "next/server";
import { NEUTRAL_FALLBACK_TEXT } from "../../lib/ai/rag";

describe("Slice 4: Statutory Query API Endpoint (/api/ai/statutory-query)", () => {
  it("successfully processes valid discipline query and returns matched statutory context", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/statutory-query", {
      method: "POST",
      body: JSON.stringify({
        query: "حظر العقاب البدني والضرب في المدارس حسب لائحة الانضباط",
        threshold: 0.75,
        limit: 3,
        locale: "en",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.isFallback).toBe(false);
    expect(json.matches.length).toBeGreaterThan(0);
    expect(json.topMatch.decree.source_reference).toContain("187");
    expect(json.statutoryContextFormatted).toContain("<statutory_context>");
  });

  it("returns neutral fallback when query has no statutory match", async () => {
    const req = new NextRequest("http://localhost:3000/api/ai/statutory-query", {
      method: "POST",
      body: JSON.stringify({
        query: "how to play chess opening gambits",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.isFallback).toBe(true);
    expect(json.matches).toHaveLength(0);
    expect(json.neutralFallbackText).toBe(NEUTRAL_FALLBACK_TEXT);
  });

  it("rejects invalid inputs failing Zod schema (Gate 1 input defense)", async () => {
    // Query too short (< 2 characters)
    const req = new NextRequest("http://localhost:3000/api/ai/statutory-query", {
      method: "POST",
      body: JSON.stringify({
        query: "a",
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.success).toBe(false);
    expect(json.error).toBe("Validation failed");
  });
});
