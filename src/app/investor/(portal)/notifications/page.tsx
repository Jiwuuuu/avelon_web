"use client";

import { Bell, Megaphone, TrendingUp, Wallet } from "lucide-react";
import { useCachedFetch } from "@/lib/use-cached-fetch";
import { api } from "@/lib/api";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

type NotificationsResponse = {
  notifications: Notification[];
  unreadCount: number;
};

function iconFor(type: string) {
  if (type.includes("DEPOSIT") || type.includes("WITHDRAWAL") || type.includes("LOAN")) return Wallet;
  if (type.includes("REPAYMENT") || type.includes("YIELD") || type.includes("POOL")) return TrendingUp;
  if (type.includes("SYSTEM") || type.includes("ANNOUNCEMENT")) return Megaphone;
  return Bell;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const { data, loading, error, refresh } = useCachedFetch<NotificationsResponse>("/api/v1/notifications?limit=20");

  const notifications = data?.notifications ?? [];

  async function markAllRead() {
    await api.post("/api/v1/notifications/read-all", {});
    refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
          <p className="text-stone-500 text-sm mt-1">
            Deposit confirmations, pool updates, repayments, and announcements.
          </p>
        </div>
        {notifications.some((n) => !n.isRead) && (
          <button
            onClick={markAllRead}
            className="text-xs font-medium text-[#E85C1A] hover:underline mt-1"
          >
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">{error}</div>
      )}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">No notifications yet.</div>
      )}

      <ul className="space-y-3">
        {notifications.map((n) => {
          const Icon = iconFor(n.type);
          return (
            <li
              key={n.id}
              className={`bg-white rounded-2xl border p-4 shadow-sm flex gap-4 ${
                n.isRead ? "border-stone-200" : "border-[#E85C1A]/30 bg-orange-50/30"
              }`}
            >
              <div className="h-10 w-10 rounded-xl bg-[#FFF5F0] flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-[#E85C1A]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex justify-between gap-2 items-start">
                  <p className={`text-sm ${n.isRead ? "font-medium text-stone-900" : "font-semibold text-stone-900"}`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-stone-400 shrink-0">{timeAgo(n.createdAt)}</span>
                </div>
                <p className="text-sm text-stone-600 mt-1">{n.message}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
