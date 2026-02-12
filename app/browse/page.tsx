import { redirect } from "next/navigation";

/**
 * Browse page has been deprecated.
 * Swipe functionality is now integrated into the Models page (/escorts).
 * This page redirects to /escorts for a unified browsing experience.
 */
export default function BrowsePage() {
  redirect("/escorts");
}
