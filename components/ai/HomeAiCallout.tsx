"use client";

import React from "react";

export function HomeAiCallout() {
  const openChatbot = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-murafiq-chatbot"));
    }
  };

  const openAssistant = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-murafiq-assistant"));
    }
  };

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 font-arabic" dir="rtl">
      <div className="rounded-3xl border-2 border-slate-300 bg-slate-100 bg-gradient-to-b from-slate-100 to-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 text-white px-3 py-1 text-xs font-black mb-2 shadow-2xs">
              <span>🤖 خدمات الذكاء الاصطناعي المزدوجة والمستقلة</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950">
              خدمات الذكاء الاصطناعي على مدار الساعة: محادثة فورية ومستشار قانوني متخصص
            </h2>
            <p className="text-xs sm:text-sm font-bold text-slate-700 mt-1">
              تم فصل كل ميزة بمحرك ونموذج مستقل لضمان أعلى دقة في التوجيه وصياغة خطط التسوية:
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Concierge Chatbot */}
          <div className="rounded-2xl border-2 border-sky-300 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-sky-500 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-900 text-white text-2xl shadow-xs">
                    💬
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      مُساعد مُرافِق للمحادثة الفورية (Chatbot)
                    </h3>
                    <span className="text-[11px] font-bold text-sky-900">
                      محرك Nemotron 3.5 Lightning • استجابة سريعة
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 text-[10px] font-black text-emerald-900">
                  متاح الآن
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed mb-4">
                إجابة فورية عن استفساراتك بشأن كيفية عمل مهلة الـ 7 أيام لحل النزاعات، قواعد سرية البيانات ومنع تسجيل الرقم القومي، وأسئلة القطاعات الخمسة.
              </p>

              <div className="space-y-1.5 mb-6 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-sky-700">✓</span>
                  <span>توضيح حقوق استرجاع السلع والخدمات (قانون 181).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-700">✓</span>
                  <span>شرح قواعد الانضباط بالمدارس وحظر العقاب البدني (القرار 187).</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sky-700">✓</span>
                  <span>توجيهك للقطاع المناسب لتقديم شكواك.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openChatbot}
              className="w-full rounded-xl bg-sky-900 px-5 py-3 text-xs sm:text-sm font-black text-white hover:bg-sky-950 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>💬</span>
              <span>افتح نافذة المحادثة الفورية (Chatbot) ←</span>
            </button>
          </div>

          {/* Card 2: Legal Solution & Action Plan Advisor */}
          <div className="rounded-2xl border-2 border-amber-400 bg-white p-6 shadow-sm flex flex-col justify-between hover:border-amber-600 transition">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-600 text-white text-2xl shadow-xs">
                    ⚖️
                  </span>
                  <div>
                    <h3 className="text-base font-black text-slate-950">
                      مستشار الحلول وصياغة خطط المعالجة (AI Assistant)
                    </h3>
                    <span className="text-[11px] font-bold text-amber-950">
                      محرك Muse Glimmer 30B • استدلال قانوني عميق
                    </span>
                  </div>
                </div>
                <span className="rounded-full bg-amber-100 border border-amber-300 px-2.5 py-0.5 text-[10px] font-black text-amber-950">
                  تحليلي متخصص
                </span>
              </div>

              <p className="text-xs sm:text-sm font-bold text-slate-800 leading-relaxed mb-4">
                أداة متقدمة لصياغة المطالب العادلة للمواطنين والمستهلكين، أو بناء خطط عمل ثلاثية المراحل مطابقة لمعايير الجودة المؤسسية RQS ≥ 90.
              </p>

              <div className="space-y-1.5 mb-6 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="text-amber-700">✓</span>
                  <span>صياغة رسمية هادئة وحازمة للمطلب القانوني بالاستناد للوائح المصرية.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-700">✓</span>
                  <span>توليد خطط استجابة متدرجة للمؤسسات ذات مؤشر جودة مرتفع.</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-700">✓</span>
                  <span>تطبيق فوري وتكامل مباشر مع نماذج تقديم الشكاوى وبوابة الجهات.</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={openAssistant}
              className="w-full rounded-xl bg-amber-600 px-5 py-3 text-xs sm:text-sm font-black text-white hover:bg-amber-700 transition shadow-sm flex items-center justify-center gap-2"
            >
              <span>⚖️</span>
              <span>تشغيل مستشار الحلول والخطط (AI Assistant) ←</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
