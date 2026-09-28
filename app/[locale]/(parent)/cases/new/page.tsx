import React, { Suspense } from "react";
import { SimpleIntakeForm } from "@/components/cases/SimpleIntakeForm";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewCasePage({ params }: PageProps) {
  const { locale } = await params;
  const validLocale = locale === "en" ? "en" : "ar";

  return (
    <main className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Suspense
          fallback={
            <div className={`p-8 text-center text-slate-500 ${validLocale === "ar" ? "font-arabic" : ""}`}>
              {validLocale === "en" ? "Loading simple intake form..." : "جاري تحميل نموذج تسجيل الحالات المبسط..."}
            </div>
          }
        >
          <SimpleIntakeForm locale={validLocale} />
        </Suspense>
      </div>
    </main>
  );
}
