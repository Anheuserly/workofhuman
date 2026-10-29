"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, Heart, UserPlus, MessageSquare, Check, Loader2, Sparkles } from "lucide-react";
import { PageShell, SectionIntro } from "@/components/shell";

interface NotifItem {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotifItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function loadNotifs() {
      try {
        const res = await fetch("/api/notifications");
        if (res.ok) {
          const data = (await res.json()) as { notifications?: NotifItem[] };
          if (mounted && data.notifications) {
            setNotifications(data.notifications);
          }
        }
      } catch (err) {
        console.warn("Could not load notifications:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadNotifs();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleMarkAllAsRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
    } catch (err) {
      console.warn("Error marking read:", err);
    }
  }

  function getIcon(type: string) {
    switch (type) {
      case "like":
        return <Heart size={16} className="text-rose-500 fill-rose-500" />;
      case "follow":
        return <UserPlus size={16} className="text-[#0f766e]" />;
      case "comment":
      case "message":
        return <MessageSquare size={16} className="text-blue-500" />;
      default:
        return <Sparkles size={16} className="text-amber-500" />;
    }
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <PageShell>
      <section className="mx-auto max-w-4xl py-12 sm:py-16">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <SectionIntro
            eyebrow="Notifications &amp; Activity"
            title="Signals that matter"
            body="Live activity stream for your appreciations, new followers, and discussions."
          />
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllAsRead}
              className="button-secondary !px-3.5 !py-1.5 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Check size={13} />
              Mark all as read
            </button>
          )}
        </div>

        <div className="surface rounded-2xl border border-[#ded9cf] overflow-hidden shadow-xs">
          {loading ? (
            <div className="py-16 text-center text-xs text-[#8c857b]">
              <Loader2 size={24} className="animate-spin mx-auto text-[#0f766e] mb-3" />
              Loading your activity...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-16 text-center text-xs text-[#8c857b] space-y-3">
              <div className="mx-auto grid size-12 place-items-center rounded-full bg-[#f6f4ef] text-[#8c857b]">
                <Bell size={20} />
              </div>
              <h4 className="text-sm font-bold text-[#151515]">No notifications yet</h4>
              <p className="max-w-xs mx-auto">
                When other creators appreciate your creations, follow your portfolio, or comment, you will see it here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#f0ede6]">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 sm:p-5 flex items-start gap-4 transition hover:bg-[#fbf9f5] ${
                    !n.is_read ? "bg-amber-50/40" : ""
                  }`}
                >
                  <div className="grid size-9 shrink-0 place-items-center rounded-full bg-white border border-[#ded9cf] shadow-xs">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-bold text-[#151515]">{n.title}</h4>
                      <span className="text-[10px] text-[#8c857b] shrink-0">
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#6f6a61] mt-1 leading-relaxed">{n.message}</p>
                    {n.link && (
                      <div className="mt-2">
                        <Link
                          href={n.link}
                          className="text-xs font-bold text-[#0f766e] hover:underline inline-flex items-center gap-1"
                        >
                          View Creation &rarr;
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
