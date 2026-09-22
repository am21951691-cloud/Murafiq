import type { Metadata } from "next";
import "./globals.css";
import { MurafiqConciergeChat } from "@/components/ai/MurafiqConciergeChat";
import { GlobalSolutionAdvisor } from "@/components/ai/GlobalSolutionAdvisor";

export const metadata: Metadata = {
  title: "Murafiq | مُرافِق",
  description: "National Resolution & Accountability Platform across 5 Egyptian Sectors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body className="antialiased min-h-screen bg-civic-canvas text-slate-900 relative">
        {children}
        {/* 1. Conversational Chatbot - Bottom Left */}
        <MurafiqConciergeChat />
        {/* 2. Site-wide Solution & Action Plan Advisor - Bottom Right */}
        <GlobalSolutionAdvisor />
      </body>
    </html>
  );
}
