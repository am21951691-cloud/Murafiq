import { describe, it, expect } from "vitest";
import { cn, formatEgyptianPhone } from "@/lib/utils";

describe("Utility Functions", () => {
  describe("cn (Tailwind class merger)", () => {
    it("merges tailwind classes cleanly", () => {
      expect(cn("px-4 py-2", "px-6")).toBe("py-2 px-6");
    });

    it("handles conditional classes correctly", () => {
      expect(cn("base-class", false && "hidden", true && "block")).toBe(
        "base-class block"
      );
    });
  });

  describe("formatEgyptianPhone", () => {
    it("normalizes Egyptian phone numbers without country code to E.164", () => {
      expect(formatEgyptianPhone("01012345678")).toBe("+201012345678");
      expect(formatEgyptianPhone("01112345678")).toBe("+201112345678");
      expect(formatEgyptianPhone("01212345678")).toBe("+201212345678");
      expect(formatEgyptianPhone("01512345678")).toBe("+201512345678");
    });

    it("accepts existing E.164 Egyptian phone numbers unchanged", () => {
      expect(formatEgyptianPhone("+201012345678")).toBe("+201012345678");
      expect(formatEgyptianPhone("+201198765432")).toBe("+201198765432");
    });

    it("strips whitespace, dashes, and parentheses before normalising", () => {
      expect(formatEgyptianPhone("010 1234-5678")).toBe("+201012345678");
      expect(formatEgyptianPhone("+20 (10) 1234-5678")).toBe("+201012345678");
    });

    it("handles 0020 international prefix", () => {
      expect(formatEgyptianPhone("00201012345678")).toBe("+201012345678");
    });

    it("throws error for non-Egyptian or invalid numbers", () => {
      expect(() => formatEgyptianPhone("12345")).toThrow("Invalid Egyptian phone number");
      expect(() => formatEgyptianPhone("01312345678")).toThrow("Invalid Egyptian phone number"); // 013 is not mobile
      expect(() => formatEgyptianPhone("+12025550123")).toThrow("Invalid Egyptian phone number");
      expect(() => formatEgyptianPhone("")).toThrow("Invalid Egyptian phone number");
    });
  });
});
