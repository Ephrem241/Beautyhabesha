"use client";

import { useState } from "react";
import type { PaymentAccountDoc } from "@/lib/payment-accounts";

type CopyableAccountCardProps = {
  account: PaymentAccountDoc;
};

export function CopyableAccountCard({ account }: CopyableAccountCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (label: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied(null);
    }
  };

  const accountLabel =
    account.type === "bank" ? "Bank transfer" : account.provider ?? "Mobile money";

  return (
    <section className="rounded-xl border border-zinc-800 bg-black p-4 sm:rounded-2xl sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
        {accountLabel}
      </p>
      <div className="mt-3 space-y-3 text-sm text-zinc-300">
        <div className="flex items-center gap-2">
          <span className="shrink-0">Account name:</span>
          <span className="min-w-0 flex-1 truncate font-mono">
            {account.accountName}
          </span>
          <CopyButton
            onClick={() => copyToClipboard("name", account.accountName)}
            copied={copied === "name"}
          />
        </div>
        {account.type === "bank" ? (
          <div className="flex items-center gap-2">
            <span className="shrink-0">Account number:</span>
            <span className="min-w-0 flex-1 truncate font-mono">
              {account.accountNumber}
            </span>
            <CopyButton
              onClick={() => copyToClipboard("number", account.accountNumber)}
              copied={copied === "number"}
            />
          </div>
        ) : (
          <>
            {account.provider && (
              <p className="text-zinc-400">Provider: {account.provider}</p>
            )}
            <div className="flex items-center gap-2">
              <span className="shrink-0">Number:</span>
              <span className="min-w-0 flex-1 truncate font-mono">
                {account.accountNumber}
              </span>
              <CopyButton
                onClick={() => copyToClipboard("number", account.accountNumber)}
                copied={copied === "number"}
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function CopyButton({
  onClick,
  copied,
}: {
  onClick: () => void;
  copied: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="shrink-0 rounded-lg border border-zinc-700 px-2 py-1 text-xs font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
      aria-label={copied ? "Copied" : "Copy"}
    >
      {copied ? "Copied" : "Copy"}
    </button>
  );
}
