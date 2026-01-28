"use client";

import { useState, useTransition } from "react";
import { updateUserRole } from "../actions";

type User = {
  id: string;
  email: string;
  name?: string;
  role: "admin" | "escort" | "user";
  currentPlan?: "Normal" | "VIP" | "Platinum";
  createdAt: string;
};

type UsersTableProps = {
  users: User[];
};

export default function UsersTable({ users }: UsersTableProps) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; error?: string } | null>(null);

  async function handleRoleChange(userId: string, newRole: "admin" | "escort" | "user") {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("role", newRole);
      
      const result = await updateUserRole({ ok: false }, formData);
      setStatus(result);
      
      if (result.ok) {
        // Reload the page to show updated roles
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
    <div className="mt-8">
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

      <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Email
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Plan
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Created
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-zinc-900/50">
                <td className="px-6 py-4 text-sm text-zinc-200">{user.email}</td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {user.name || "—"}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(
                      user.role
                    )}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {user.currentPlan || "Normal"}
                </td>
                <td className="px-6 py-4 text-sm text-zinc-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4">
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
