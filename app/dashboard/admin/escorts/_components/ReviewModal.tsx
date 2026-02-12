"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { ProfileAvatar } from "@/app/_components/ProfileAvatar";
import {
  approveEscort,
  rejectEscort,
  suspendEscort,
  deleteEscortProfile,
  getEscortDetails,
  boostEscortRanking,
  setRankingSuspended,
  setManualPlan,
  clearManualPlan,
  clearBoost,
  type EscortDetails,
  type EscortActionResult,
} from "../actions";

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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function fetchDetails() {
      const data = await getEscortDetails(escort.id);
      setDetails(data);
      setLoading(false);
    }
    fetchDetails();
  }, [escort.id]);

  const refreshDetails = () => {
    getEscortDetails(escort.id).then((data) => {
      setDetails(data);
      setActionStatus(null);
    });
  };

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
      if (result.ok) refreshDetails();
    });
  };

  const handleDelete = async () => {
    startActionTransition(async () => {
      const formData = new FormData();
      formData.append("escortId", escort.id);
      const result = await deleteEscortProfile({ ok: false }, formData);
      setActionStatus(result);
      if (result.ok) {
        setShowDeleteConfirm(false);
        onClose();
        window.location.reload();
      }
    });
  };

  const handleRankingAction = async (
    fn: (prev: EscortActionResult, formData: FormData) => Promise<EscortActionResult>,
    formData: FormData
  ) => {
    startActionTransition(async () => {
      formData.set("escortId", escort.id);
      const result = await fn({ ok: false }, formData);
      setActionStatus(result);
      if (result.ok) refreshDetails();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-4 max-h-[calc(100vh-2rem)] w-full max-w-4xl overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-950">
        <div className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <ProfileAvatar
                src={details.images[0]}
                alt={details.displayName}
                size={48}
                className="shrink-0"
              />
              <h2 className="text-lg font-semibold text-white sm:text-xl truncate">{details.displayName}</h2>
            </div>
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

          <div className="mt-6 grid gap-6 sm:grid-cols-1 md:grid-cols-2">
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
                  <span className="text-zinc-200">{details.user.name ?? details.user.username ?? details.user.email ?? "—"}</span>
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
                {(details.lastActiveAt != null || details.rankingBoostUntil != null || details.rankingSuspended || details.manualPlanId != null) && (
                  <div className="mt-4 space-y-2 border-t border-zinc-800 pt-4">
                    <span className="font-medium text-zinc-300">Ranking</span>
                    {details.lastActiveAt != null && (
                      <div>
                        <span className="text-zinc-400">Last active: </span>
                        <span className="text-zinc-200">{new Date(details.lastActiveAt).toLocaleString()}</span>
                      </div>
                    )}
                    {details.rankingBoostUntil != null && (
                      <div>
                        <span className="text-zinc-400">Boost until: </span>
                        <span className="text-emerald-300">{new Date(details.rankingBoostUntil).toLocaleString()}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-zinc-400">Ranking suspended: </span>
                      <span className="text-zinc-200">{details.rankingSuspended ? "Yes" : "No"}</span>
                    </div>
                    {details.manualPlanId != null && (
                      <div>
                        <span className="text-zinc-400">Manual tier: </span>
                        <span className="text-amber-300">{details.manualPlanId}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="mb-3 font-medium text-zinc-300">
                Profile picture — review before approving
              </h3>
              {details.images.length > 0 ? (
                <div className="space-y-3">
                  <div className="relative aspect-4/3 max-h-64 w-full overflow-hidden rounded-xl border border-zinc-800">
                    <Image
                      src={details.images[0]}
                      alt="Primary profile picture"
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 400px"
                    />
                  </div>
                  {details.images.length > 1 ? (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                      {details.images.slice(1).map((image, index) => (
                        <div key={index} className="relative aspect-square overflow-hidden rounded-lg border border-zinc-800">
                          <Image
                            src={image}
                            alt={`Profile image ${index + 2}`}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 50vw, 200px"
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-6 text-center text-amber-200">
                  <p className="font-medium">No profile picture</p>
                  <p className="mt-1 text-sm text-amber-200/80">
                    Escort must add at least one picture before you can approve.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => handleAction("approve")}
              disabled={actionPending || details.status === "approved" || details.images.length === 0}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
              title={details.images.length === 0 ? "Escort must add at least one picture first" : undefined}
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
            {showDeleteConfirm ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm text-amber-300">Delete profile permanently?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={actionPending}
                  className="rounded-lg border border-red-600 bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {actionPending ? "Deleting…" : "Confirm delete"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={actionPending}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-4 py-2 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={actionPending}
                className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 hover:bg-red-500/20 disabled:opacity-50"
              >
                Delete profile
              </button>
            )}
          </div>

          <section className="mt-8 border-t border-zinc-800 pt-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-400">
              Ranking & visibility
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={actionPending}
                onClick={() => {
                  const until = new Date();
                  until.setDate(until.getDate() + 7);
                  const formData = new FormData();
                  formData.append("until", until.toISOString());
                  handleRankingAction(boostEscortRanking, formData);
                }}
                className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300 hover:bg-emerald-500/20 disabled:opacity-50"
              >
                Boost 7 days
              </button>
              {details.rankingBoostUntil != null && (
                <button
                  type="button"
                  disabled={actionPending}
                  onClick={() => handleRankingAction(clearBoost, new FormData())}
                  className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
                >
                  Clear boost
                </button>
              )}
              <button
                type="button"
                disabled={actionPending}
                onClick={() => {
                  const formData = new FormData();
                  formData.append("suspended", details.rankingSuspended ? "false" : "true");
                  handleRankingAction(setRankingSuspended, formData);
                }}
                className={`rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50 ${
                  details.rankingSuspended
                    ? "border-amber-500/50 bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                    : "border-zinc-600 bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
                }`}
              >
                {details.rankingSuspended ? "Resume ranking" : "Suspend ranking"}
              </button>
              <span className="text-zinc-500">|</span>
              <select
                className="rounded-lg border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                value={details.manualPlanId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  const formData = new FormData();
                  if (value === "") {
                    handleRankingAction(clearManualPlan, formData);
                  } else {
                    formData.append("planId", value);
                    handleRankingAction(setManualPlan, formData);
                  }
                }}
                disabled={actionPending}
              >
                <option value="">Tier: subscription</option>
                <option value="Normal">Normal</option>
                <option value="VIP">VIP</option>
                <option value="Platinum">Platinum</option>
              </select>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}