"use client";

type Record = {
  id: string;
  userId: string;
  userEmail: string;
  userName: string | null;
  userRole: string;
  type: string;
  version: string;
  acceptedAt: string;
  ip: string | null;
};

type ConsentHistoryTableProps = { records: Record[] };

export default function ConsentHistoryTable({ records }: ConsentHistoryTableProps) {
  if (records.length === 0) {
    return (
      <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center text-sm text-zinc-400">
        No consent records yet.
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 sm:mt-8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Version
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                Accepted at
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400">
                IP
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {records.map((r) => (
              <tr key={r.id} className="hover:bg-zinc-900/50">
                <td className="px-4 py-3 text-sm">
                  <p className="text-zinc-200">{r.userName ?? r.userEmail}</p>
                  <p className="text-xs text-zinc-500">{r.userEmail}</p>
                </td>
                <td className="px-4 py-3 text-sm text-zinc-400">{r.type}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">{r.version}</td>
                <td className="px-4 py-3 text-sm text-zinc-400">
                  {new Date(r.acceptedAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm text-zinc-500">{r.ip ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
