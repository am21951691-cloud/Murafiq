import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEgyptianPhone(phone: string): string {
  if (!phone) {
    throw new Error("Invalid Egyptian phone number");
  }
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const egRegex = /^(?:\+20|0020|0)?(1[0125]\d{8})$/;
  const match = cleaned.match(egRegex);
  if (!match) {
    throw new Error("Invalid Egyptian phone number");
  }
  return `+20${match[1]}`;
}

export function generateReferenceNumber(prefix: string = "MRF"): string {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `${prefix}-${year}-${randomSuffix}`;
}
