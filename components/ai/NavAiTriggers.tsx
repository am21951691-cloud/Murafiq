"use client";

import React from "react";

export function NavAiTriggers() {
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
    <div className="flex items-center gap-1.5 font-arabic">
      {/* Chatbot Trigger */}
      <button
        type="button"
        onClick={openChatbot}
        className="flex items-center gap-1.5 rounded-xl border-2 border-sky-300 bg-sky-50 px-2.5 py-1.5 text-xs font-black text-sky-950 hover:bg-sky-100 hover:border-sky-500 transition shadow-2xs"
        title="افتح المحادثة الفورية مع مُساعد مُرافِق"
      >
        <span className="text-sm">💬</span>
        <span className="hidden lg:inline">مُساعد المحادثة</span>
      </button>

      {/* AI Assistant Trigger */}
      <button
        type="button"
        onClick={openAssistant}
        className="flex items-center gap-1.5 rounded-xl border-2 border-amber-300 bg-amber-50 px-2.5 py-1.5 text-xs font-black text-amber-950 hover:bg-amber-100 hover:border-amber-500 transition shadow-2xs"
        title="افتح مستشار الحلول القانونية والخطط"
      >
        <span className="text-sm">⚖️</span>
        <span className="hidden lg:inline">مستشار الحلول</span>
      </button>
    </div>
  );
}
