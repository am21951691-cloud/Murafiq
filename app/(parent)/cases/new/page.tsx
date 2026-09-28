import React, { Suspense } from "react";
import { SimpleIntakeForm } from "@/components/cases/SimpleIntakeForm";

export default function NewCasePage() {
  return (
    <main className="min-h-screen bg-slate-50/50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Suspense
          fallback={
            <div className="p-8 text-center text-slate-500 font-arabic">
              جاري تحميل نموذج تسجيل الحالات المبسط...
            </div>
          }
        >
          <SimpleIntakeForm locale="ar" />
        </Suspense>
      </div>
    </main>
  );
}
