"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ redirect: false, callbackUrl: "/" });
    // Full page redirect avoids "Router action dispatched before initialization" (e.g. during HMR)
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  return (
    <button
      onClick={handleSignOut}
      className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
      type="button"
    >
      Sign Out
    </button>
  );
}
