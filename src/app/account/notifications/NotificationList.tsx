"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, PackageCheck, RotateCcw, AlertTriangle, UserPlus, Megaphone } from "lucide-react";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  is_read: boolean;
  created_at: string;
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function typeIcon(type: string) {
  switch (type) {
    case "payment_confirmed":
      return PackageCheck;
    case "order_status":
      return PackageCheck;
    case "refund":
      return RotateCcw;
    case "low_stock":
      return AlertTriangle;
    case "new_customer":
      return UserPlus;
    case "announcement":
      return Megaphone;
    default:
      return Bell;
  }
}

export default function NotificationList({ initial }: { initial: Notification[] }) {
  const [notifications, setNotifications] = useState(initial);

  async function markAllRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      setNotifications((n) => n.map((x) => ({ ...x, is_read: true })));
    } catch {
      /* ignore */
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-dark">All notifications</h2>
        {notifications.some((n) => !n.is_read) && (
          <button
            onClick={markAllRead}
            className="text-sm font-medium text-dark hover:text-brand flex items-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="border border-line rounded-2xl py-16 text-center">
          <Bell className="w-8 h-8 text-ink-muted mx-auto mb-3" />
          <p className="text-dark font-medium">No notifications yet.</p>
          <p className="text-ink-muted text-sm mt-1">Order updates and alerts will appear here.</p>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {notifications.map((n) => {
            const Icon = typeIcon(n.type);
            return (
              <li key={n.id} className={`py-5 ${n.is_read ? "" : "bg-[#fff8f5]"}`}>
                {n.link ? (
                  <Link href={n.link} className="flex items-start gap-4 group">
                    <IconBox Icon={Icon} />
                    <div className="flex-1 min-w-0">
                      <p className={`${n.is_read ? "font-medium" : "font-semibold"} text-dark group-hover:text-brand transition-colors`}>
                        {n.title}
                      </p>
                      {n.body && <p className="text-sm text-ink-soft mt-0.5">{n.body}</p>}
                      <p className="text-xs text-ink-muted mt-1.5">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" />}
                  </Link>
                ) : (
                  <div className="flex items-start gap-4">
                    <IconBox Icon={Icon} />
                    <div className="flex-1 min-w-0">
                      <p className={`${n.is_read ? "font-medium" : "font-semibold"} text-dark`}>{n.title}</p>
                      {n.body && <p className="text-sm text-ink-soft mt-0.5">{n.body}</p>}
                      <p className="text-xs text-ink-muted mt-1.5">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-brand mt-2 shrink-0" />}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function IconBox({ Icon }: { Icon: typeof Bell }) {
  return (
    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center shrink-0">
      <Icon className="w-5 h-5 text-dark" />
    </div>
  );
}
