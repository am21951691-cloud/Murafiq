"use client";

import React, { useState } from "react";

export interface CommunicationMessage {
  id: string;
  senderType: "STAFF" | "BENEFICIARY" | "SYSTEM";
  senderName: string;
  senderRole?: string;
  content: string;
  timestamp: string;
  channel?: "IN_APP" | "WHATSAPP" | "SMS" | "EMAIL";
  deliveryStatus?: "DELIVERED" | "READ" | "PENDING";
}

interface CommunicationThreadProps {
  caseId: string;
  referenceNumber: string;
  initialMessages?: CommunicationMessage[];
  onSendMessage?: (content: string, channel: string) => Promise<void>;
}

export function CommunicationThread({
  caseId,
  referenceNumber,
  initialMessages = [],
  onSendMessage,
}: CommunicationThreadProps) {
  const [messages, setMessages] = useState<CommunicationMessage[]>(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [channel, setChannel] = useState<"IN_APP" | "WHATSAPP">("WHATSAPP");
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSending(true);
    try {
      if (onSendMessage) {
        await onSendMessage(newMessage.trim(), channel);
      }

      const sentMsg: CommunicationMessage = {
        id: crypto.randomUUID(),
        senderType: "STAFF",
        senderName: "فريق المتابعة والحلول المؤسسية",
        senderRole: "موظف معالجة معتمد",
        content: newMessage.trim(),
        timestamp: new Date().toISOString(),
        channel,
        deliveryStatus: "DELIVERED",
      };

      setMessages((prev) => [...prev, sentMsg]);
      setNewMessage("");
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm text-right font-arabic space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <h3 className="text-base font-black text-slate-900">
            قناة التواصل مع صاحب الحالة والمستفيد
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            تواصل رسمي وموثق لإرسال استفسارات، إفادات، أو إشعارات إنجاز المراحل
          </p>
        </div>
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
          ● قناة موثقة ومشفرة
        </span>
      </div>

      {/* Messages Stream */}
      <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs">
            لا توجد مراسلات سابقة مع صاحب الحالة بعد.
          </div>
        ) : (
          messages.map((msg) => {
            const isStaff = msg.senderType === "STAFF";
            const isSystem = msg.senderType === "SYSTEM";

            return (
              <div
                key={msg.id}
                className={`rounded-xl p-4 text-xs ${
                  isSystem
                    ? "bg-slate-100 text-slate-600 border border-slate-200"
                    : isStaff
                    ? "bg-teal-50/70 border border-teal-200 text-teal-950 mr-4"
                    : "bg-sky-50/70 border border-sky-200 text-sky-950 ml-4"
                }`}
              >
                <div className="flex items-center justify-between mb-1 text-[11px] font-bold text-slate-500">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-extrabold">{msg.senderName}</span>
                    {msg.senderRole && (
                      <span className="bg-white/80 px-1.5 py-0.5 rounded text-[10px] text-slate-600 border border-slate-200">
                        {msg.senderRole}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 font-mono text-[10px]">
                    {msg.channel && (
                      <span className="text-slate-400">
                        {msg.channel === "WHATSAPP" ? "🟢 WhatsApp" : "📱 تطبيق"}
                      </span>
                    )}
                    <span>
                      {new Date(msg.timestamp).toLocaleTimeString("ar-EG", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
                <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
              </div>
            );
          })
        )}
      </div>

      {/* Send Message Form */}
      <form onSubmit={handleSend} className="border-t border-slate-100 pt-4 space-y-3">
        <label className="block text-xs font-bold text-slate-700">
          إرسال رسالة رسمية أو طلب استيضاح إلى المستفيد:
        </label>
        <textarea
          rows={3}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="اكتب الرسالة أو الاستيضاح المطلوب من المستفيد..."
          className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-teal-700 focus:outline-none"
        />

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-600 font-bold">قناة الإرسال:</span>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value as any)}
              className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs font-bold"
            >
              <option value="WHATSAPP">🟢 إشعار عبر WhatsApp رسمي</option>
              <option value="IN_APP">📱 بوابة التتبع فقط</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSending || !newMessage.trim()}
            className="rounded-xl bg-teal-700 px-5 py-2 text-xs font-bold text-white hover:bg-teal-800 transition disabled:opacity-50"
          >
            {isSending ? "جاري الإرسال..." : "إرسال الرسالة"}
          </button>
        </div>
      </form>
    </div>
  );
}
