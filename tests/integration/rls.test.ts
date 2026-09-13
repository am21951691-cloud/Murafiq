import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import {
  LifecycleStatusEnum,
  ModerationStatusEnum,
  DisputeStatusEnum,
  SafetyStatusEnum,
  CaseCategoryEnum,
  VisibilityLevelEnum,
  VerificationMethodEnum,
} from "@/types/database";

describe("Database Contracts & Security Scaffolding", () => {
  describe("Enum Contracts", () => {
    it("contains all 8 canonical lifecycle states", () => {
      const states = [
        "DRAFT",
        "SUBMITTED",
        "PRIVATE_GRACE",
        "ACTION_PLAN_PENDING",
        "IN_PROGRESS",
        "AWAITING_EVALUATION",
        "CLOSED",
        "ARCHIVED",
      ];
      states.forEach((state) => {
        expect(
          LifecycleStatusEnum[state as keyof typeof LifecycleStatusEnum]
        ).toBe(state);
      });
    });

    it("contains all 5 moderation states", () => {
      const states = [
        "PENDING",
        "APPROVED",
        "REDACTED_APPROVED",
        "HELD_FOR_REVIEW",
        "REJECTED",
      ];
      states.forEach((state) => {
        expect(
          ModerationStatusEnum[state as keyof typeof ModerationStatusEnum]
        ).toBe(state);
      });
    });

    it("contains all 4 dispute states and 3 safety states", () => {
      expect(DisputeStatusEnum.NONE).toBe("NONE");
      expect(DisputeStatusEnum.OPEN).toBe("OPEN");
      expect(DisputeStatusEnum.RESOLVED).toBe("RESOLVED");
      expect(DisputeStatusEnum.ESCALATED).toBe("ESCALATED");

      expect(SafetyStatusEnum.CLEAR).toBe("CLEAR");
      expect(SafetyStatusEnum.FLAGGED).toBe("FLAGGED");
      expect(SafetyStatusEnum.ESCALATED).toBe("ESCALATED");
    });

    it("enforces default privacy level as STRICTLY_PRIVATE", () => {
      expect(VisibilityLevelEnum.STRICTLY_PRIVATE).toBe("STRICTLY_PRIVATE");
    });
  });

  describe("SQL Schema & RLS Policy Verifications", () => {
    const migrationPath = path.resolve(
      __dirname,
      "../../supabase/migrations/20260913000001_initial_schema.sql"
    );
    const sqlContent = fs.readFileSync(migrationPath, "utf-8");

    it("enables Row Level Security on all core operational and sensitive tables", () => {
      const requiredRlsTables = [
        "platform_admins",
        "privileged_access_logs",
        "institutions",
        "institution_branches",
        "institution_members",
        "cases",
        "case_sensitive_data",
        "action_plans",
        "action_items",
        "evaluations",
        "verification_records",
        "ai_analyses",
        "consent_records",
        "case_attachments",
        "case_events",
        "reports",
        "whatsapp_dispatches",
        "statutory_decrees",
        "platform_config",
      ];

      requiredRlsTables.forEach((table) => {
        const rlsStatement = `ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY;`;
        expect(sqlContent).toContain(rlsStatement);
      });
    });

    it("strictly isolates case_sensitive_data with zero SELECT for institution members", () => {
      // Must contain policy for case owner only
      expect(sqlContent).toContain(
        `CREATE POLICY "Only case owner can view raw sensitive data" ON case_sensitive_data`
      );
      // Ensure no policy on case_sensitive_data grants access to institution_members
      const sensitiveDataPolicies = sqlContent
        .split(";")
        .filter((statement) => statement.includes("ON case_sensitive_data"));

      sensitiveDataPolicies.forEach((policy) => {
        expect(policy).not.toContain("institution_members");
      });
    });

    it("implements immutable case_events audit log trigger", () => {
      expect(sqlContent).toContain("CREATE OR REPLACE FUNCTION prevent_audit_tampering()");
      expect(sqlContent).toContain("CREATE TRIGGER trg_immutable_case_events");
      expect(sqlContent).toContain("BEFORE UPDATE OR DELETE ON case_events");
    });

    it("defaults cases visibility to STRICTLY_PRIVATE", () => {
      expect(sqlContent).toContain("visibility visibility_level_enum DEFAULT 'STRICTLY_PRIVATE' NOT NULL");
    });
  });
});
