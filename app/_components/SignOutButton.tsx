"use client";

import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut({ 
      redirect: false,
      callbackUrl: "/" 
    });
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleSignOut}
      className="transition hover:text-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
      type="button"
    >
      Sign Out
    </button>
  );
}
