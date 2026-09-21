import React from "react";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-civic-canvas text-slate-800 font-arabic text-right">
      {/* Top Civic Navigation Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-10 shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-civic-navy text-white flex items-center justify-center font-bold text-xl shadow-xs">
              م
            </div>
            <div>
              <span className="font-bold text-lg text-civic-navy tracking-tight">
                مُرافِق — Murafiq
              </span>
              <span className="block text-[11px] text-slate-400">
                المنصة الوطنية لوساطة وحل القضايا التعليمية
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <Link
              href="/schools"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              دليل المدارس والمؤشرات
            </Link>
            <Link
              href="/portal/dashboard"
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              بوابة المؤسسات التعليمية
            </Link>
            <Link
              href="/cases/new"
              className="rounded-xl bg-civic-teal px-4 py-2 font-semibold text-white hover:bg-opacity-90 transition shadow-xs"
            >
              تسجيل قضية جديدة
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-bold text-civic-teal mb-6">
          <span>🔒 بيئة عمل سرية متوافقة مع قانون حماية البيانات 151 لسنة 2020</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-civic-navy tracking-tight max-w-3xl mx-auto leading-tight">
          نحو حلول تعليمية مهنية ومحايدة تحفظ حقوق الجميع
        </h1>

        <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          بدلاً من المراجعات المفتوحة غير المنضبطة، يتيح مُرافِق حلقة مغلقة لتوثيق الشكاوى، مهلة مراجعة خاصة مدتها 7 أيام للمؤسسة، وخطط عمل ملزمة وموثقة بالذكاء الاصطناعي.
        </p>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/cases/new"
            className="rounded-2xl bg-civic-navy px-8 py-3.5 text-base font-bold text-white hover:bg-opacity-90 transition shadow-sm"
          >
            تسجيل شكوى / قضية جديدة (أولياء الأمور)
          </Link>
          <Link
            href="/portal/dashboard"
            className="rounded-2xl border border-slate-300 bg-white px-8 py-3.5 text-base font-bold text-slate-700 hover:bg-slate-50 transition"
          >
            لوحة فرز القضايا للمدارس (Triage Loop)
          </Link>
        </div>

        {/* 3 Core Architecture Pillars */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-teal-50 text-civic-teal flex items-center justify-center font-bold mb-4">
              1
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              عزل تام للبيانات الشخصية (PII)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تُفصل البيانات الحساسة (الهواتف، الأرقام القومية، أسماء الطلاب) في طبقة مشفرة منفصلة لا تصل إليها المؤسسات التعليمية إطلاقاً.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold mb-4">
              2
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              مهلة خاصة مدتها 7 أيام (Private Grace)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              تُمنح المدرسة مهلة نظامية خاصة لفرز القضية والاستجابة بخطة عمل محددة ودياً قبل أي إتاحة عامة أو تصعيد.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-civic-navy flex items-center justify-center font-bold mb-4">
              3
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">
              سجل تدقيق حصين (Immutable Audit)
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              كل إجراء، من تقديم القضية والتحقق بالهاتف إلى اعتماد الاستلام وخطة العمل، يُوثق بأقفال قاعدة بيانات غير قابلة للتعديل أو الحذف.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
