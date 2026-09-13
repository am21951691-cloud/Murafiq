export interface SanitizationResult {
  cleanedText: string;
  redactedItems: string[];
  hasPii: boolean;
}

/**
 * Layer 1 Deterministic Regex PII Sanitizer for Egyptian Context.
 * Intercepts 14-digit National IDs, Egyptian phone numbers, and emails.
 */
export function sanitizeRawInput(text: string): SanitizationResult {
  if (!text) {
    return { cleanedText: "", redactedItems: [], hasPii: false };
  }

  const redactedItems: string[] = [];
  let cleanedText = text;

  // 1. Egyptian National ID: 14 consecutive digits starting with 2 or 3
  const nationalIdRegex = /\b[23]\d{13}\b/g;
  const nationalIdMatches = cleanedText.match(nationalIdRegex);
  if (nationalIdMatches) {
    nationalIdMatches.forEach((match) => {
      redactedItems.push(`NATIONAL_ID:${match}`);
    });
    cleanedText = cleanedText.replace(nationalIdRegex, "[NATIONAL_ID_REDACTED]");
  }

  // 2. Egyptian Mobile Phone Numbers: +201..., 00201..., 01... (11 digits local)
  const egPhoneRegex = /(?:\+20|0020|0)?(1[0125][0-9]{8})\b/g;
  const phoneMatches = cleanedText.match(egPhoneRegex);
  if (phoneMatches) {
    phoneMatches.forEach((match) => {
      redactedItems.push(`PHONE:${match}`);
    });
    cleanedText = cleanedText.replace(egPhoneRegex, "[PHONE_REDACTED]");
  }

  // 3. Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const emailMatches = cleanedText.match(emailRegex);
  if (emailMatches) {
    emailMatches.forEach((match) => {
      redactedItems.push(`EMAIL:${match}`);
    });
    cleanedText = cleanedText.replace(emailRegex, "[EMAIL_REDACTED]");
  }

  return {
    cleanedText,
    redactedItems,
    hasPii: redactedItems.length > 0,
  };
}

/**
 * Simple reversible symmetric encryption simulation using standard crypto for sensitive fields.
 */
import crypto from "crypto";

const ENCRYPTION_KEY =
  process.env.DATA_ENCRYPTION_KEY ||
  "murafiq-ultra-secure-fallback-key-32b!"; // 32 characters

export function encryptSensitiveData(plaintext: string): string {
  if (!plaintext) return "";
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

export function decryptSensitiveData(encryptedData: string): string {
  if (!encryptedData) return "";
  const parts = encryptedData.split(":");
  if (parts.length !== 3) return encryptedData; // fallback
  const [ivHex, authTagHex, encryptedHex] = parts;
  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32)),
    Buffer.from(ivHex, "hex")
  );
  decipher.setAuthTag(Buffer.from(authTagHex, "hex"));
  let decrypted = decipher.update(encryptedHex, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
