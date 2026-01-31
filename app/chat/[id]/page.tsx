import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { prisma } from "@/lib/db";

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const hasAccess = await getViewerHasActiveSubscription(session?.user?.id ?? null);

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-black px-4 py-16 text-white">
        <div className="mx-auto max-w-md text-center">
          <h1 className="text-xl font-semibold">Subscribe to contact</h1>
          <p className="mt-2 text-sm text-zinc-400">
            An active subscription is required to view contact details.
          </p>
          <Link
            href="/pricing"
            className="mt-6 inline-block rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-emerald-950 hover:bg-emerald-400"
          >
            View plans
          </Link>
        </div>
      </main>
    );
  }

  const profile = await prisma.escortProfile.findUnique({
    where: { id, status: "approved" },
    select: { displayName: true, telegram: true, phone: true },
  });

  if (!profile) {
    notFound();
  }

  const telegramHandle = profile.telegram?.replace(/^@/, "").trim();
  const telegramUrl = telegramHandle ? `https://t.me/${telegramHandle}` : null;
  const phoneUrl = profile.phone
    ? `tel:${profile.phone.replace(/\D/g, "")}`
    : null;

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-xl font-semibold">Chat with {profile.displayName}</h1>
        <p className="mt-2 text-sm text-zinc-400">
          Choose how you&apos;d like to connect
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {telegramUrl && (
            <a
              href={telegramUrl}
              className="flex items-center justify-center gap-3 rounded-xl bg-[#0088cc] px-6 py-4 font-medium text-white transition hover:opacity-90"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
              </svg>
              Open Telegram
            </a>
          )}
          {phoneUrl && (
            <a
              href={phoneUrl}
              className="flex items-center justify-center gap-3 rounded-xl border border-zinc-600 px-6 py-4 font-medium text-zinc-200 transition hover:bg-zinc-800"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
              Call
            </a>
          )}
          {!telegramUrl && !phoneUrl && (
            <p className="text-sm text-zinc-500">
              No contact information available. Please check back later.
            </p>
          )}
        </div>
        <Link
          href={`/profiles/${id}`}
          className="mt-8 inline-block text-sm text-emerald-400 hover:underline"
        >
          ← Back to profile
        </Link>
      </div>
    </main>
  );
}
