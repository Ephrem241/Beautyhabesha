import { redirect } from "next/navigation";

import { getAuthSession, checkUserNotBanned } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUserPlan } from "@/lib/plan-access";
import { hasEscortConsentComplete } from "@/lib/consent";
import { extractImageUrls } from "@/lib/image-helpers";

import ProfileForm from "./_components/ProfileForm";

async function requireEscort() {
  const session = await getAuthSession();
  if (!session?.user || session.user.role !== "escort") {
    redirect("/");
  }
  return session.user.id;
}

export default async function EscortProfilePage() {
  const userId = await requireEscort();
  await checkUserNotBanned(userId);

  const consentOk = await hasEscortConsentComplete(userId);
  if (!consentOk) redirect("/consent");

  const [profile, access] = await Promise.all([
    prisma.escortProfile.findUnique({
      where: { userId },
      select: {
        displayName: true,
        bio: true,
        city: true,
        phone: true,
        telegram: true,
        whatsapp: true,
        images: true,
        status: true,
      },
    }),
    getUserPlan(userId),
  ]);

  const maxImages = access.imageLimit;

  const getStatusMessage = (status: string) => {
    switch (status) {
      case "pending":
        return {
          message: "Your profile is under review. We'll notify you once it's approved.",
          color: "text-yellow-300",
        };
      case "approved":
        return {
          message: "Your profile is approved and visible to clients.",
          color: "text-emerald-300",
        };
      case "rejected":
        return {
          message: "Your profile was not approved. Please contact support for more information.",
          color: "text-red-300",
        };
      case "suspended":
        return {
          message: "Your profile has been suspended. Contact support to resolve this.",
          color: "text-red-300",
        };
      default:
        return {
          message: "Profile status unknown.",
          color: "text-zinc-300",
        };
    }
  };

  const statusInfo = profile ? getStatusMessage(profile.status) : null;

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Escort profile
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">
            {profile ? "Edit your profile" : "Create your profile"}
          </h1>
          <p className="text-sm text-zinc-400">
            Update your details and upload new photos to increase visibility.
          </p>
        </header>

        {statusInfo && (
          <div className={`mt-6 rounded-2xl border p-4 text-sm ${statusInfo.color.includes("red") ? "border-red-500/40 bg-red-500/10" : statusInfo.color.includes("yellow") ? "border-yellow-500/40 bg-yellow-500/10" : "border-emerald-500/40 bg-emerald-500/10"}`}>
            {statusInfo.message}
          </div>
        )}

        <ProfileForm
          initialDisplayName={profile?.displayName}
          initialBio={profile?.bio ?? undefined}
          initialCity={profile?.city ?? undefined}
          initialPhone={profile?.phone ?? undefined}
          initialTelegram={profile?.telegram ?? undefined}
          initialWhatsapp={profile?.whatsapp ?? undefined}
          existingImages={extractImageUrls(profile?.images)}
          maxImages={maxImages}
        />
      </div>
    </main>
  );
}
