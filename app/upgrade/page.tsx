import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Upgrade",
  description: "Upgrade your membership.",
};

export default function UpgradePage() {
  redirect("/pricing");
}
