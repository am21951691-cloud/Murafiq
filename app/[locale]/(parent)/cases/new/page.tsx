import React from "react";
import { IntakeWizard } from "@/components/cases/IntakeWizard";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewCasePage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = locale === "en" ? "en" : "ar";

  return (
    <main className="min-h-screen bg-civic-canvas py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <IntakeWizard locale={validLocale} />
      </div>
    </main>
  );
}
