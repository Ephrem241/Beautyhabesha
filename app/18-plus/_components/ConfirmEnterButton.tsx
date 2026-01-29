"use client";

import { useRouter } from "next/navigation";
import { setAgeGateAccepted } from "@/lib/age-gate-client";

export function ConfirmEnterButton() {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => {
        setAgeGateAccepted();
        router.push("/");
      }}
      className="rounded-xl bg-emerald-600 px-6 py-3 text-sm font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black"
    >
      I am 21+ — Enter site
    </button>
  );
}
