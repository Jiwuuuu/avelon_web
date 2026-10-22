"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Megaphone, TrendingUp, Wallet } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/api-errors";
import { announceNotificationsChanged } from "@/lib/use-unread-count";

type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

// GET /notifications returns the list as data and the counts in meta
type ListResponse = {
  success: boolean;
  data?: Notification[];
  meta?: { unreadCount: number; total: number; hasMore: boolean };
};

const PAGE_SIZE = 20;

function iconFor(type: string) {
  if (type.includes("DEPOSIT") || type.includes("WITHDRAWAL") || type.includes("LOAN")) return Wallet;
  if (type.includes("REPAYMENT") || type.includes("YIELD") || type.includes("POOL")) return TrendingUp;
  if (type.includes("SYSTEM") || type.includes("ANNOUNCEMENT")) return Megaphone;
  return Bell;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (nextPage = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = (await api.get<Notification[]>(`/api/v1/notifications?limit=${PAGE_SIZE}&page=${nextPage}`)) as ListResponse;
      if (!res.success) throw new Error(errorMessage(res, "Could not load notifications."));
      setItems((prev) => (nextPage === 1 ? res.data ?? [] : [...prev, ...(res.data ?? [])]));
      setUnread(res.meta?.unreadCount ?? 0);
      setHasMore(res.meta?.hasMore ?? false);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(1);
  }, [load]);

  async function markRead(n: Notification) {
    if (n.isRead) return;
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)));
    setUnread((c) => Math.max(0, c - 1));
    const res = await api.put(`/api/v1/notifications/${encodeURIComponent(n.id)}/read`, {});
    if (!res.success) void load(1);
    announceNotificationsChanged();
  }

  async function markAllRead() {
    const res = await api.put("/api/v1/notifications/read-all", {});
    if (!res.success) {
      setError(errorMessage(res, "Could not mark notifications as read."));
      return;
    }
    setItems((prev) => prev.map((x) => ({ ...x, isRead: true })));
    setUnread(0);
    announceNotificationsChanged();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Notifications</h1>
          <p className="text-stone-500 text-sm mt-1">
            Deposit and withdrawal confirmations, yield claims, and announcements.
            {unread > 0 && <span className="ml-1 font-medium text-[#E85C1A]">{unread} unread.</span>}
          </p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="text-xs font-medium text-[#E85C1A] hover:underline mt-1">
            Mark all read
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-2xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center justify-between gap-3">
          <span>{error}</span>
          <button onClick={() => load(1)} className="font-semibold hover:underline">Retry</button>
        </div>
      )}

      {loading && items.length === 0 && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white rounded-2xl border border-stone-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="text-center py-16 text-stone-400 text-sm">
          No notifications yet. Deposits, withdrawals and yield claims will show up here.
        </div>
      )}

      <ul className="space-y-3">
        {items.map((n) => {
          const Icon = iconFor(n.type);
          return (
            <li key={n.id}>
              <button
                type="button"
                onClick={() => markRead(n)}
                className={`w-full text-left bg-white rounded-2xl border p-4 shadow-sm flex gap-4 transition-colors ${
                  n.isRead ? "border-stone-200" : "border-[#E85C1A]/30 bg-orange-50/30 hover:bg-orange-50/60"
                }`}
                aria-label={n.isRead ? n.title : `${n.title}, unread. Mark as read`}
              >
                <div className="h-10 w-10 rounded-xl bg-[#FFF5F0] flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-[#E85C1A]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2 items-start">
                    <p className={`text-sm ${n.isRead ? "font-medium text-stone-900" : "font-semibold text-stone-900"}`}>
                      {n.title}
                    </p>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] text-stone-400">{timeAgo(n.createdAt)}</span>
                      {!n.isRead && <span className="h-2 w-2 rounded-full bg-[#E85C1A]" />}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600 mt-1">{n.message}</p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      {hasMore && (
        <div className="text-center">
          <button
            onClick={() => load(page + 1)}
            disabled={loading}
            className="text-sm font-medium text-stone-700 border border-stone-300 rounded-xl px-4 py-2 hover:bg-stone-50 disabled:opacity-50"
          >
            {loading ? "Loading…" : "Load more"}
          </button>
        </div>
      )}
    </div>
  );
}
