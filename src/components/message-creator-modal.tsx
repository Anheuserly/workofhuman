"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Loader2, CheckCircle2 } from "lucide-react";

export function MessageCreatorModal({
  recipientUsername,
  recipientName,
}: {
  recipientUsername: string;
  recipientName?: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUsername,
          content: message.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setSent(true);
      setMessage("");
      setTimeout(() => {
        setSent(false);
        setOpen(false);
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="button-secondary !px-3.5 !py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
      >
        <MessageSquare size={13} className="text-[#0f766e]" />
        Message Creator
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="w-full max-w-md surface p-6 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#ded9cf] pb-3">
              <div>
                <h3 className="text-sm font-bold text-[#151515]">Direct Conversation</h3>
                <p className="text-[11px] text-[#6f6a61]">
                  Sending inquiry to{" "}
                  <strong className="text-[#0f766e]">@{recipientUsername}</strong>
                  {recipientName && ` (${recipientName})`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#8c857b] hover:text-[#151515] cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {sent ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 size={32} className="mx-auto text-emerald-600 animate-bounce" />
                <p className="text-xs font-bold text-[#151515]">Message delivered!</p>
                <p className="text-[11px] text-[#6f6a61]">
                  The creator has received your message in their workspace inbox.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-3">
                {error && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-md border border-red-200">
                    {error}
                  </p>
                )}
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Introduce yourself, discuss collaborative work, license inquiries, or questions..."
                  className="w-full rounded-lg border border-[#ded9cf] bg-[#fcfbfa] p-3 text-xs text-[#151515] placeholder:text-[#8c857b] focus:border-[#0f766e] focus:bg-white focus:outline-none transition resize-none"
                />
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="button-secondary !px-3 !py-1.5 text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!message.trim() || sending}
                    className="button-primary !px-4 !py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {sending ? (
                      <>
                        <Loader2 size={13} className="animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send size={12} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
