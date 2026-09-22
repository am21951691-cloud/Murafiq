import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as listCasesV1, POST as createCaseV1 } from "@/app/api/v1/cases/route";
import { GET as getCaseV1 } from "@/app/api/v1/cases/[id]/route";
import { GET as listDepartmentsV1 } from "@/app/api/v1/departments/route";
import { GET as getAnalyticsV1 } from "@/app/api/v1/analytics/route";

describe("Enterprise REST API v1 Endpoints", () => {
  const TEST_TENANT_ID = "00000000-0000-0000-0000-000000000010";
  const AUTH_HEADERS = {
    Authorization: "Bearer mrf_live_sample_token_12345",
    "x-tenant-id": TEST_TENANT_ID,
  };

  it("lists cases for the authenticated tenant with pagination", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/cases?page=1&limit=5", {
      headers: AUTH_HEADERS,
    });
    const res = await listCasesV1(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.pagination).toBeDefined();
    expect(body.pagination.limit).toBe(5);
  });

  it("creates a new case via POST /api/v1/cases with valid schema", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/cases", {
      method: "POST",
      headers: {
        ...AUTH_HEADERS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: "خلل متكرر في مسار الحافلة رقم 12",
        description: "تأخر مستمر للحافلة المدرسية عن موعد الوصول بأكثر من 45 دقيقة صباحاً.",
        category: "TRANSPORTATION_BUSES",
        subcategory: "DELAY",
        priority: "HIGH",
      }),
    });

    const res = await createCaseV1(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.success).toBe(true);
    expect(body.data.id).toBeDefined();
    expect(body.data.referenceNumber).toMatch(/^MRF-/);
    expect(body.data.trackingUrl).toBeDefined();

    // Verify retrieving via GET /api/v1/cases/:id
    const getReq = new NextRequest(`http://localhost:3000/api/v1/cases/${body.data.id}`, {
      headers: AUTH_HEADERS,
    });
    const getRes = await getCaseV1(getReq, { params: Promise.resolve({ id: body.data.id }) });
    const getBody = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(getBody.success).toBe(true);
    expect(getBody.data.id).toBe(body.data.id);
  });

  it("lists departments for the authenticated tenant via GET /api/v1/departments", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/departments", {
      headers: AUTH_HEADERS,
    });
    const res = await listDepartmentsV1(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toHaveProperty("defaultSlaHours");
  });

  it("retrieves executive analytics via GET /api/v1/analytics", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/analytics", {
      headers: AUTH_HEADERS,
    });
    const res = await getAnalyticsV1(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("totalCases");
    expect(body.data).toHaveProperty("slaComplianceRate");
    expect(body.data).toHaveProperty("medianResponseHours");
  });
});
