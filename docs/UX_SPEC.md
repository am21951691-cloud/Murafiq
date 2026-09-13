# Murafiq — UX & UI Design System

> **Version:** 1.0

---

## 1. Visual Aesthetics & Token Hierarchy

- **Archetype:** Serious civic institution, clean and neutral.
- **Palette:**
  - Primary: `#1E3A5F` (Civic Deep Navy)
  - Secondary: `#0D9488` (Resolution Teal)
  - Accent: `#D97706` (Action Required Amber)
  - Background: `#F8FAFC` (Slate Canvas)
  - Surface: `#FFFFFF` (Card White)
  - Border: `#E2E8F0`

---

## 2. Bilingual RTL / LTR Design

- **Arabic (RTL Primary):** `IBM Plex Sans Arabic`, `Noto Sans Arabic`.
- **English (LTR Secondary):** `Inter`.
- CSS Logical Properties (`padding-inline`, `margin-inline`) used exclusively across components.
- Numbers within Arabic text maintain correct Western/Arabic digit formatting without reversing decimals.

---

## 3. Case Timeline Visual Pattern

The central UI component on both web and mobile is the **Lifecycle Timeline Stepper**:
- `Step 1: Submitted` (Initial user experience rating)
- `Step 2: Responded` (Institution statement & time-to-respond badge)
- `Step 3: Action Plan` (Milestone checklist with real-time status)
- `Step 4: Resolved` (Final verified user outcome & resolution rating)
