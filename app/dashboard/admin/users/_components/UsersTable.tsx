"use client";

import { useState, useTransition } from "react";
import {
  updateUserRole,
  setUserAutoRenew,
  forceRenewSubscription,
  banUser,
  unbanUser,
  deleteUser,
} from "../actions";

type User = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "escort" | "user";
  currentPlan?: "Normal" | "VIP" | "Platinum";
  autoRenew?: boolean;
  renewalAttempts?: number;
  lastRenewalAttempt?: string;
  bannedAt?: string;
  createdAt: string;
};

type UsersTableProps = {
  users: User[];
};

export default function UsersTable({ users }: UsersTableProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; error?: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  async function handleRoleChange(userId: string, newRole: "admin" | "escort" | "user") {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", newRole);
      const result = await updateUserRole({ ok: false }, formData);
      setStatus(result);
      if (result.ok) window.location.reload();
    });
  }

  async function handleDisableAutoRenew(userId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("enabled", "false");
      const result = await setUserAutoRenew({ ok: false }, formData);
      setStatus(result);
      if (result.ok) window.location.reload();
    });
  }

  async function handleForceRenew(userId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      const result = await forceRenewSubscription({ ok: false }, formData);
      setStatus(result);
      if (result.ok) window.location.reload();
    });
  }

  async function handleBan(userId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      const result = await banUser({ ok: false }, formData);
      setStatus(result);
      if (result.ok) window.location.reload();
    });
  }

  async function handleUnban(userId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      const result = await unbanUser({ ok: false }, formData);
      setStatus(result);
      if (result.ok) window.location.reload();
    });
  }

  async function handleDelete(userId: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      const result = await deleteUser({ ok: false }, formData);
      setStatus(result);
      if (result.ok) {
        setDeleteTarget(null);
        window.location.reload();
      }
    });
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "escort":
        return "bg-purple-500/20 text-purple-300 border-purple-500/40";
      default:
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/40";
    }
  };

  if (users.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No users found.
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8">
      {status && (
        <div
          className={`mb-4 rounded-2xl border p-4 text-sm ${
            status.ok
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
              : "border-red-500/40 bg-red-500/10 text-red-200"
          }`}
        >
          {status.ok ? "✅ Role updated successfully." : `❌ ${status.error}`}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Email
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Role
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Plan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Auto-renew
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Renewal attempts
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400 sm:px-6 sm:py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-900/50">
                  <td className="px-4 py-3 text-sm text-zinc-200 sm:px-6 sm:py-4">{user.email}</td>
                  <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                    {user.name || "—"}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                        user.role
                      )}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                    {user.currentPlan || "Normal"}
                    {user.bannedAt && (
                      <span className="ml-2 rounded bg-red-500/20 px-1.5 py-0.5 text-xs text-red-300">
                        Banned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                    {user.autoRenew ? "Yes" : "No"}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                    {user.renewalAttempts ?? 0}
                    {user.lastRenewalAttempt
                      ? ` (${new Date(user.lastRenewalAttempt).toLocaleDateString()})`
                      : ""}
                  </td>
                  <td className="px-4 py-3 text-sm text-zinc-400 sm:px-6 sm:py-4">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 sm:px-6 sm:py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(
                          user.id,
                          e.target.value as "admin" | "escort" | "user"
                        )
                      }
                      disabled={isPending}
                      className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
                    >
                      <option value="user">User</option>
                      <option value="escort">Escort</option>
                      <option value="admin">Admin</option>
                    </select>
                    {user.role === "escort" && user.autoRenew && (
                      <button
                        type="button"
                        onClick={() => handleDisableAutoRenew(user.id)}
                        disabled={isPending}
                        className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 hover:bg-amber-500/20 disabled:opacity-50"
                      >
                        Disable auto-renew
                      </button>
                    )}
                    {user.role === "escort" && (user.currentPlan === "VIP" || user.currentPlan === "Platinum") && (
                      <button
                        type="button"
                        onClick={() => handleForceRenew(user.id)}
                        disabled={isPending}
                        className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
                      >
                        Force renew
                      </button>
                    )}
                    {user.bannedAt ? (
                      <button
                        type="button"
                        onClick={() => handleUnban(user.id)}
                        disabled={isPending}
                        className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300 disabled:opacity-50"
                      >
                        Unban
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBan(user.id)}
                        disabled={isPending}
                        className="rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1 text-xs text-red-300 hover:bg-red-500/20 disabled:opacity-50"
                      >
                        Ban
                      </button>
                    )}
                    {deleteTarget === user.id ? (
                      <>
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                          disabled={isPending}
                          className="rounded-lg border border-red-600 bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {isPending ? "Deleting…" : "Confirm delete"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(null)}
                          disabled={isPending}
                          className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 disabled:opacity-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(user.id)}
                        disabled={isPending}
                        className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                      >
                        Delete
                      </button>
                    )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-4 p-4 md:hidden">
          {users.map((user) => (
            <div
              key={user.id}
              className="rounded-2xl border border-zinc-800 bg-black p-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-zinc-200">
                    {user.email}
                  </p>
                  <p className="text-xs text-zinc-500">{user.name || "—"}</p>
                </div>
                <span
                  className={`inline-flex shrink-0 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-500">
                <span>Plan: {user.currentPlan || "Normal"}</span>
                {user.bannedAt && <span className="text-red-400">Banned</span>}
                <span>Auto-renew: {user.autoRenew ? "Yes" : "No"}</span>
                <span>Attempts: {user.renewalAttempts ?? 0}</span>
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              {user.role === "escort" && (user.autoRenew || user.currentPlan === "VIP" || user.currentPlan === "Platinum") && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {user.autoRenew && (
                    <button
                      type="button"
                      onClick={() => handleDisableAutoRenew(user.id)}
                      disabled={isPending}
                      className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300"
                    >
                      Disable auto-renew
                    </button>
                  )}
                  {(user.currentPlan === "VIP" || user.currentPlan === "Platinum") && (
                    <button
                      type="button"
                      onClick={() => handleForceRenew(user.id)}
                      disabled={isPending}
                      className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-2 py-1 text-xs text-emerald-300"
                    >
                      Force renew
                    </button>
                  )}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2">
                {user.bannedAt ? (
                  <button
                    type="button"
                    onClick={() => handleUnban(user.id)}
                    disabled={isPending}
                    className="rounded-lg border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-300"
                  >
                    Unban
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleBan(user.id)}
                    disabled={isPending}
                    className="rounded-lg border border-red-500/50 bg-red-500/10 px-2 py-1 text-xs text-red-300"
                  >
                    Ban
                  </button>
                )}
                {deleteTarget === user.id ? (
                  <>
                    <button
                      type="button"
                      onClick={() => handleDelete(user.id)}
                      disabled={isPending}
                      className="rounded-lg border border-red-600 bg-red-600 px-2 py-1 text-xs text-white disabled:opacity-50"
                    >
                      {isPending ? "Deleting…" : "Confirm delete"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(null)}
                      disabled={isPending}
                      className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(user.id)}
                    disabled={isPending}
                    className="rounded-lg border border-zinc-600 bg-zinc-800 px-2 py-1 text-xs text-zinc-300"
                  >
                    Delete
                  </button>
                )}
              </div>
              <select
                value={user.role}
                onChange={(e) =>
                  handleRoleChange(
                    user.id,
                    e.target.value as "admin" | "escort" | "user"
                  )
                }
                disabled={isPending}
                className="mt-3 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
              >
                <option value="user">User</option>
                <option value="escort">Escort</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
