import React, { Suspense } from "react";
import { IntakeWizard } from "@/components/cases/IntakeWizard";

export default function NewCasePage() {
  return (
    <div className="container mx-auto py-10 px-4">
      <Suspense
        fallback={
          <div className="p-8 text-center text-slate-500 font-arabic">
            جاري تحميل معالج تسجيل الحالات...
          </div>
        }
      >
        <IntakeWizard />
      </Suspense>
    </div>
  );
}
