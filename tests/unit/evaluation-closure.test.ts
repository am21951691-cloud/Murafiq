import { describe, it, expect } from "vitest";
import { EvaluationSchema } from "@/lib/services/evaluations";
import { POST as evaluateRoute } from "@/app/api/cases/evaluate/route";
import { NextRequest } from "next/server";

describe("Slice 3: 3D Evaluation Model & Case Closure", () => {
  const caseId = "e4a2a198-5c4d-4b82-9e90-c2874136979a";

  describe("Evaluation Schema Validation", () => {
    it("validates ratings within bounds 1-5", () => {
      const valid = {
        case_id: caseId,
        response_rating: 4,
        resolution_rating: 5,
        closing_comment: "المشكلة تم حلها تماماً وشكراً للإدارة.",
      };
      expect(EvaluationSchema.safeParse(valid).success).toBe(true);
    });

    it("rejects response_rating less than 1 or greater than 5", () => {
      const invalidLow = {
        case_id: caseId,
        response_rating: 0,
        resolution_rating: 4,
      };
      expect(EvaluationSchema.safeParse(invalidLow).success).toBe(false);

      const invalidHigh = {
        case_id: caseId,
        response_rating: 6,
        resolution_rating: 4,
      };
      expect(EvaluationSchema.safeParse(invalidHigh).success).toBe(false);
    });

    it("rejects resolution_rating less than 1 or greater than 5", () => {
      const invalid = {
        case_id: caseId,
        response_rating: 3,
        resolution_rating: 7,
      };
      expect(EvaluationSchema.safeParse(invalid).success).toBe(false);
    });
  });

  describe("Evaluation Route & Case Closure Flow", () => {
    it("POST /api/cases/evaluate stores evaluation and closes case", async () => {
      const request = new NextRequest("http://localhost:3000/api/cases/evaluate", {
        method: "POST",
        body: JSON.stringify({
          case_id: caseId,
          response_rating: 4,
          resolution_rating: 5,
          closing_comment: "حل متميز وسريع.",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const response = await evaluateRoute(request);
      expect(response.status).toBe(201);

      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.lifecycle_status).toBe("CLOSED");
      expect(body.closure_reason).toBe("COMPLETED_EVALUATED");
      expect(body.evaluation.response_rating).toBe(4);
      expect(body.evaluation.resolution_rating).toBe(5);
    });

    it("POST /api/cases/evaluate rejects non-owner evaluation with 403 Forbidden", async () => {
      const request = new NextRequest("http://localhost:3000/api/cases/evaluate", {
        method: "POST",
        body: JSON.stringify({
          case_id: caseId,
          response_rating: 5,
          resolution_rating: 5,
        }),
        headers: {
          "Content-Type": "application/json",
          "x-case-owner-id": "other-user-9999",
        },
      });

      const response = await evaluateRoute(request);
      expect(response.status).toBe(403);

      const body = await response.json();
      expect(body.success).toBe(false);
      expect(body.error).toContain("Unauthorized");
    });
  });
});
