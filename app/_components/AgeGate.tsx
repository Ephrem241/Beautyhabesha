"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const COOKIE_NAME = "age_gate_18";
const STORAGE_KEY = "age_gate_18";
const MAX_AGE_SEC = 365 * 24 * 60 * 60;

const LEGAL_PATHS = ["/terms", "/privacy", "/consent", "/18-plus"];

function getAccepted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    if (localStorage.getItem(STORAGE_KEY) === "accepted") return true;
    const match = document.cookie.match(new RegExp(`(^| )${COOKIE_NAME}=([^;]+)`));
    return match?.[2] === "accepted";
  } catch {
    return false;
  }
}

function setAccepted(): void {
  try {
    localStorage.setItem(STORAGE_KEY, "accepted");
    document.cookie = `${COOKIE_NAME}=accepted; path=/; max-age=${MAX_AGE_SEC}; SameSite=Lax`;
  } catch {
    /* ignore */
  }
}

export function AgeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [accepted, setAcceptedState] = useState<boolean | null>(null);

  useEffect(() => {
    setAcceptedState(getAccepted());
  }, []);

  const isLegalPath = LEGAL_PATHS.some((p) => pathname?.startsWith(p));
  if (isLegalPath) {
    return <>{children}</>;
  }

  if (accepted === null) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] flex min-h-screen flex-col items-center justify-center bg-black px-4 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-400">
          Adults only
        </p>
        <h1 className="mt-4 text-2xl font-semibold sm:text-3xl">
          You must be 18 or older
        </h1>
        <p className="mt-3 text-sm text-zinc-400">
          This platform is intended for adults only. By entering you confirm that
          you are at least 18 years of age and agree to our{" "}
          <Link href="/terms" className="text-emerald-400 hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-emerald-400 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => {
              setAccepted();
              setAcceptedState(true);
            }}
            className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
          >
            I am 18 or older — Enter
          </button>
          <Link
            href="/18-plus"
            className="rounded-xl border border-zinc-600 bg-zinc-900 px-6 py-3 text-sm font-medium text-zinc-300 hover:bg-zinc-800"
          >
            Exit
          </Link>
        </div>
      </div>
    </div>
  );
}
