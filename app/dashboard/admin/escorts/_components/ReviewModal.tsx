"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { approveEscort, rejectEscort, suspendEscort, getEscortDetails, type EscortDetails, type EscortActionResult } from "../actions";

type ReviewModalProps = {
  escort: {
    id: string;
    displayName: string;
    city?: string;
    status: "pending" | "approved" | "rejected" | "suspended";
    plan: string;
    createdAt: string;
    userId: string;
    userName: string;
  };
  onClose: () => void;
};

export default function ReviewModal({ escort, onClose }: ReviewModalProps) {
  const [details, setDetails] = useState<EscortDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionPending, startActionTransition] = useTransition();
  const [actionStatus, setActionStatus] = useState<EscortActionResult | null>(null);

  useEffect(() => {
    async function fetchDetails() {
      const data = await getEscortDetails(escort.id);
      setDetails(data);
      setLoading(false);
    }
    fetchDetails();
  }, [escort.id]);

  const handleAction = async (action: "approve" | "reject" | "suspend") => {
    startActionTransition(async () => {
      const formData = new FormData();
      formData.append("escortId", escort.id);

      let result: EscortActionResult;
      if (action === "approve") {
        result = await approveEscort({ ok: false }, formData);
      } else if (action === "reject") {
        result = await rejectEscort({ ok: false }, formData);
      } else {
        result = await suspendEscort({ ok: false }, formData);
      }

      setActionStatus(result);
      if (result.ok) {
        // Refresh details
        const updated = await getEscortDetails(escort.id);
        setDetails(updated);
        setActionStatus(null); // Clear status after success
      }
    });
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "rejected":
        return "bg-red-500/20 text-red-300 border-red-500/40";
      case "suspended":
        return "bg-yellow-500/20 text-yellow-300 border-yellow-500/40";
      default:
        return "bg-zinc-500/20 text-zinc-300 border-zinc-500/40";
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="text-center text-zinc-400">Loading...</div>
        </div>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
          <div className="text-center text-zinc-400">Escort not found.</div>
          <button
            onClick={onClose}
            className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">{details.displayName}</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200"
            >
              ✕
            </button>
          </div>

          {actionStatus && (
            <div
              className={`mt-4 rounded-2xl border p-4 text-sm ${
                actionStatus.ok
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
                  : "border-red-500/40 bg-red-500/10 text-red-200"
              }`}
            >
              {actionStatus.ok ? "✅ Action completed successfully." : `❌ ${actionStatus.error}`}
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <div className="mb-4">
                <span
                  className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                    details.status
                  )}`}
                >
                  {details.status}
                </span>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-medium text-zinc-300">Name:</span>{" "}
                  <span className="text-zinc-200">{details.displayName}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">User:</span>{" "}
                  <span className="text-zinc-200">{details.user.name || details.user.email}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">Location:</span>{" "}
                  <span className="text-zinc-200">{details.city || "Not specified"}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">Bio:</span>{" "}
                  <span className="text-zinc-200">{details.bio || "No bio"}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">Phone:</span>{" "}
                  <span className="text-zinc-200">{details.phone || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">Telegram:</span>{" "}
                  <span className="text-zinc-200">{details.telegram || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">WhatsApp:</span>{" "}
                  <span className="text-zinc-200">{details.whatsapp || "Not provided"}</span>
                </div>
                <div>
                  <span className="font-medium text-zinc-300">Created:</span>{" "}
                  <span className="text-zinc-200">{new Date(details.createdAt).toLocaleDateString()}</span>
                </div>
                {details.approvedAt && (
                  <div>
                    <span className="font-medium text-zinc-300">Approved At:</span>{" "}
                    <span className="text-zinc-200">{new Date(details.approvedAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-zinc-300">Images</h3>
              {details.images.length > 0 ? (
                <div className="grid grid-cols-2 gap-2">
                  {details.images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800">
                      <Image
                        src={image}
                        alt={`Image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-zinc-800 p-8 text-center text-zinc-400">
                  No images uploaded
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={actionPending || details.status === "approved"}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {actionPending ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => handleAction("reject")}
              disabled={actionPending || details.status === "rejected"}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {actionPending ? "Processing..." : "Reject"}
            </button>
            <button
              onClick={() => handleAction("suspend")}
              disabled={actionPending || details.status === "suspended"}
              className="rounded-lg bg-yellow-600 px-4 py-2 text-sm font-medium text-white hover:bg-yellow-700 disabled:opacity-50"
            >
              {actionPending ? "Processing..." : "Suspend"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}