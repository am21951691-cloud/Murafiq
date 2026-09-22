"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { MurafiqLogo } from "@/components/brand/MurafiqLogo";
import {
  CONCIERGE_QUICK_SUGGESTIONS_AR,
  type ConciergeMessage,
} from "@/lib/ai/concierge-service";

interface ChatMessage extends ConciergeMessage {
  id: string;
  suggestions?: string[];
  directLink?: {
    href: string;
    label_ar: string;
    label_en: string;
  };
}

export function MurafiqConciergeChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "أهلاً بك في **مُرافِق**! أنا مساعدك الذكي للإجابة عن استفساراتك حول المنصة، وحقوقك القانونية، ومهلة الـ 7 أيام للمراجعة الخاصة، وتوجيهك لتقديم شكوى محترفة ومحمية. كيف يمكنني مساعدتك اليوم؟",
      suggestions: CONCIERGE_QUICK_SUGGESTIONS_AR.slice(0, 4),
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setHasUnread(false);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (userText: string) => {
    const textToSend = userText.trim();
    if (!textToSend || isLoading) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: textToSend,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const historyPayload = messages
        .concat(userMsg)
        .map((m) => ({ role: m.role, content: m.content }));

      const res = await fetch("/api/ai/concierge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyPayload,
          locale: "ar",
        }),
      });

      const data = await res.json();

      if (data.reply) {
        const assistantMsg: ChatMessage = {
          id: `a-${Date.now()}`,
          role: "assistant",
          content: data.reply,
          suggestions: data.suggestions || [],
          directLink: data.directLink || undefined,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || "عذراً، لم أتمكن من الحصول على رد.");
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            "عذراً، حدث خطأ مؤقت في الاتصال. يمكنك إعادة المحاولة أو البدء مباشرة في تقديم الشكوى عبر قائمة الموقع.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: "assistant",
        content:
          "مرحباً بك مجدداً! تم بدء محادثة جديدة. يمكنك سؤالي عن أي جانب من جوانب منصة مُرافِق أو القوانين المصرية المنظمة للتسوية.",
        suggestions: CONCIERGE_QUICK_SUGGESTIONS_AR.slice(0, 4),
      },
    ]);
  };

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-5 left-5 z-50 flex items-center gap-2 font-arabic" dir="rtl">
        {!isOpen && (
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="group flex items-center gap-3 rounded-full bg-linear-to-r from-sky-900 to-sky-800 p-3.5 pr-4 text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 border border-sky-700/50"
            aria-label="افتح مساعد مُرافِق الذكي"
          >
            <div className="relative flex items-center justify-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-xs text-xl">
                ✨
              </span>
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-sky-900 animate-ping" />
              )}
              {hasUnread && (
                <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 ring-2 ring-sky-900" />
              )}
            </div>

            <div className="text-right hidden sm:block">
              <div className="text-xs font-black tracking-wide text-amber-300">
                مُساعد مُرافِق الذكي
              </div>
              <div className="text-[11px] text-sky-100 font-medium opacity-90">
                استفسار فوري • توجيه قانوني
              </div>
            </div>
          </button>
        )}
      </div>

      {/* Expandable Chat Drawer Window */}
      {isOpen && (
        <div
          dir="rtl"
          className="fixed bottom-5 left-5 z-50 flex flex-col w-[94vw] sm:w-[420px] h-[580px] max-h-[85vh] rounded-3xl border border-slate-200/80 bg-white/95 shadow-2xl backdrop-blur-md overflow-hidden font-arabic transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
        >
          {/* Header */}
          <div className="flex items-center justify-between bg-linear-to-r from-sky-950 via-sky-900 to-sky-850 p-4 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-lg shadow-xs">
                ✨
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold">مُساعد مُرافِق الذكي</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-emerald-950" />
                </div>
                <p className="text-[10px] text-sky-200">
                  متاح للإجابة والتوجيه القانوني في 5 قطاعات
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-sky-200">
              <button
                type="button"
                onClick={clearChat}
                title="بدء محادثة جديدة"
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition text-xs"
              >
                🔄
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="إغلاق النافذة"
                className="rounded-lg p-1.5 hover:bg-white/10 hover:text-white transition text-sm font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isUser ? "items-start" : "items-end"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-sky-850 text-white rounded-br-xs shadow-xs"
                        : "bg-white text-slate-800 rounded-bl-xs border border-slate-200 shadow-xs"
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{m.content}</div>

                    {/* Direct Link Button if provided by assistant */}
                    {m.directLink && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <Link
                          href={m.directLink.href}
                          onClick={() => setIsOpen(false)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-sky-800 px-3 py-1.5 text-xs font-bold text-white hover:bg-sky-900 transition shadow-xs"
                        >
                          {m.directLink.label_ar}
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Suggestions Pills underneath assistant message */}
                  {!isUser && m.suggestions && m.suggestions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5 max-w-[90%]">
                      {m.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSend(s)}
                          className="rounded-lg border border-sky-200 bg-sky-50/70 px-2.5 py-1 text-[11px] font-semibold text-sky-900 hover:bg-sky-100 hover:border-sky-300 transition text-right"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1">
                <span className="flex h-2 w-2 rounded-full bg-sky-800 animate-bounce" />
                <span className="flex h-2 w-2 rounded-full bg-sky-800 animate-bounce [animation-delay:0.2s]" />
                <span className="flex h-2 w-2 rounded-full bg-sky-800 animate-bounce [animation-delay:0.4s]" />
                <span className="font-medium text-[11px]">مُساعد مُرافِق يبحث في القواعد والأنظمة...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-3 border-t border-slate-200/80 bg-white flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="اكتب سؤالك هنا (مثال: كيف أسترجع أموالي؟)..."
              disabled={isLoading}
              className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2.5 text-xs sm:text-sm focus:border-sky-800 focus:outline-none bg-slate-50/50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-850 text-white font-bold hover:bg-sky-900 disabled:opacity-40 transition shadow-xs"
              aria-label="إرسال السؤال"
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
}
