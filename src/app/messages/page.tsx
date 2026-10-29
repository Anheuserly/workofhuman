"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send, Loader2, User } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

interface MessageItem {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender_username: string;
  sender_name: string;
  receiver_username: string;
  receiver_name: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadMessages() {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = (await res.json()) as { messages?: MessageItem[] };
          if (mounted && data.messages) {
            setMessages(data.messages);
            if (data.messages.length > 0) {
              setSelectedRecipient(data.messages[0].sender_username);
            }
          }
        }
      } catch (err) {
        console.warn("Could not fetch messages:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMessages();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!replyText.trim() || !selectedRecipient || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientUsername: selectedRecipient,
          content: replyText.trim(),
        }),
      });

      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error || "Failed to send message.");
      }

      setReplyText("");
      // Refresh messages
      const ref = await fetch("/api/messages");
      if (ref.ok) {
        const d = (await ref.json()) as { messages?: MessageItem[] };
        if (d.messages) setMessages(d.messages);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl py-12 sm:py-16">
        <SectionIntro
          eyebrow="Direct Studio Communications"
          title="Creator Conversations &amp; Inquiries"
          body="Collaborate with other studios, discuss custom releases, and coordinate inquiries."
        />

        <div className="surface mt-8 rounded-2xl border border-[#ded9cf] overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[500px]">
          {/* Conversation List Sidebar */}
          <aside className="md:col-span-4 border-b md:border-b-0 md:border-r border-[#ded9cf] p-4 bg-[#fdfcfb]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8c857b] px-2 mb-3">
              Conversations ({messages.length})
            </h3>

            {loading ? (
              <div className="py-12 text-center text-xs text-[#8c857b]">
                <Loader2 size={18} className="animate-spin mx-auto text-[#0f766e] mb-2" />
                Loading conversations...
              </div>
            ) : messages.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#8c857b] px-4">
                No active conversations yet. Visit any creator profile or project to send an inquiry!
              </div>
            ) : (
              <div className="space-y-1">
                {messages.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedRecipient(m.sender_username)}
                    className={`w-full text-left p-3 rounded-lg text-xs transition cursor-pointer flex items-start gap-2.5 ${
                      selectedRecipient === m.sender_username
                        ? "bg-[#0f766e] text-white shadow-xs"
                        : "hover:bg-[#f6f4ef] text-[#151515]"
                    }`}
                  >
                    <div
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-[10px] font-bold uppercase ${
                        selectedRecipient === m.sender_username
                          ? "bg-white text-[#0f766e]"
                          : "bg-[#0f766e] text-white"
                      }`}
                    >
                      {m.sender_username.slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold truncate">@{m.sender_username}</p>
                        <span className="text-[10px] opacity-75">
                          {new Date(m.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="truncate text-[11px] opacity-90 mt-0.5">{m.content}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Active Conversation Pane */}
          <main className="md:col-span-8 p-6 flex flex-col justify-between bg-white">
            {selectedRecipient ? (
              <>
                <div className="border-b border-[#ded9cf] pb-4 mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User size={16} className="text-[#0f766e]" />
                    <h4 className="text-sm font-bold text-[#151515]">@{selectedRecipient}</h4>
                  </div>
                  <span className="text-xs text-[#8c857b]">Private Direct Channel</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 py-4 max-h-[350px]">
                  {messages
                    .filter(
                      (m) =>
                        m.sender_username === selectedRecipient ||
                        m.receiver_username === selectedRecipient
                    )
                    .map((m) => (
                      <div
                        key={m.id}
                        className={`p-3.5 rounded-xl max-w-md text-xs leading-relaxed ${
                          m.sender_username === selectedRecipient
                            ? "bg-[#f6f4ef] text-[#151515] border border-[#ded9cf]"
                            : "ml-auto bg-[#0f766e] text-white"
                        }`}
                      >
                        <p>{m.content}</p>
                        <span className="block text-[10px] opacity-70 mt-1 text-right">
                          {new Date(m.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    ))}
                </div>

                <form onSubmit={handleSendReply} className="mt-4 pt-3 border-t border-[#ded9cf]">
                  {error && <p className="text-xs text-red-600 mb-2">{error}</p>}
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Reply to @${selectedRecipient}...`}
                      className="flex-1 rounded-lg border border-[#ded9cf] bg-[#fcfbfa] px-3.5 py-2.5 text-xs text-[#151515] focus:border-[#0f766e] focus:bg-white focus:outline-none transition"
                    />
                    <button
                      type="submit"
                      disabled={!replyText.trim() || sending}
                      className="button-primary !px-4 !py-2.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <>
                          Send
                          <Send size={12} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="m-auto text-center py-16 text-[#8c857b] space-y-2">
                <MessageCircle size={36} className="mx-auto text-[#0f766e] opacity-40" />
                <h4 className="text-sm font-bold text-[#151515]">Select a conversation</h4>
                <p className="text-xs max-w-sm">
                  Choose a dialogue thread on the left or reach out to creators across the platform.
                </p>
              </div>
            )}
          </main>
        </div>
      </section>
    </PageShell>
  );
}
