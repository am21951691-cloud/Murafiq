// lib/validators/sensitive-identifiers.ts
import { z } from "zod";
import type { SectorType } from "@/types/database";

export const SENSITIVE_IDENTIFIER_TYPES = [
  "STUDENT_CODE",
  "ACADEMIC_STUDENT_ID",
  "GOVERNMENT_SERVICE_REQUEST_NO",
  "ORDER_OR_ACCOUNT_NUMBER",
  "MEDICAL_RECORD_NUMBER",
] as const;

export type SensitiveIdentifierType = (typeof SENSITIVE_IDENTIFIER_TYPES)[number];

// Egyptian National ID regex: 14 digits starting with 2 or 3
export const EGYPTIAN_NATIONAL_ID_REGEX = /^[23]\d{13}$/;

export const SensitiveIdentifierSchema = z
  .object({
    type: z.enum(SENSITIVE_IDENTIFIER_TYPES),
    value: z.string().min(1, "Identifier value is required").max(60),
  })
  .refine(
    (data) => {
      const cleanValue = data.value.replace(/[\s-]/g, "");
      // STRICT RULE: Never permit 14-digit Egyptian National IDs
      return !EGYPTIAN_NATIONAL_ID_REGEX.test(cleanValue);
    },
    {
      message:
        "Egyptian National ID numbers (الرقم القومي) are prohibited. Please provide a service ticket, order, or record number instead.",
      path: ["value"],
    }
  );

export type SensitiveIdentifier = z.infer<typeof SensitiveIdentifierSchema>;

export function getSectorDefaultIdentifierType(sector: SectorType): SensitiveIdentifierType {
  switch (sector) {
    case "EDUCATION_SCHOOLS":
      return "STUDENT_CODE";
    case "HIGHER_EDUCATION":
      return "ACADEMIC_STUDENT_ID";
    case "GOVERNMENT_PUBLIC":
      return "GOVERNMENT_SERVICE_REQUEST_NO";
    case "COMMERCIAL_COMPANIES":
      return "ORDER_OR_ACCOUNT_NUMBER";
    case "HEALTHCARE_MEDICAL":
      return "MEDICAL_RECORD_NUMBER";
    default:
      return "ORDER_OR_ACCOUNT_NUMBER";
  }
}

/**
 * Mask sensitive identifier for safe display token in operational metadata
 * e.g. "MRN-2026-948123" -> "MRN-***-123"
 */
export function maskSensitiveIdentifier(type: string, value: string): string {
  if (!value || value.length <= 4) {
    return `${type}-****`;
  }
  const prefix = value.slice(0, Math.min(3, Math.floor(value.length / 3)));
  const suffix = value.slice(-3);
  return `${prefix}-***-${suffix}`;
}
