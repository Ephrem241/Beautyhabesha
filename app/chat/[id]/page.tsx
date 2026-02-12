import { notFound } from "next/navigation";
import Link from "next/link";
import { getAuthSession } from "@/lib/auth";
import { getViewerHasActiveSubscription } from "@/lib/viewer-access";
import { prisma } from "@/lib/db";
import { buildTelegramUrl, buildWhatsAppUrl } from "@/lib/contact-urls";
import { TelegramIcon, WhatsAppIcon, PhoneIcon } from "@/app/_components/ContactIcons";

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ChatPage({ params }: ChatPageProps) {
  const { id } = await params;
  const session = await getAuthSession();
  const hasAccess = await getViewerHasActiveSubscription(session?.user?.id ?? null);

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
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

  const telegramUrl = profile.telegram ? buildTelegramUrl(profile.telegram) : null;
  const whatsappUrl = profile.phone ? buildWhatsAppUrl(profile.phone) : null;
  const phoneUrl = profile.phone
    ? `tel:${profile.phone.replace(/\D/g, "")}`
    : null;

  return (
    <main className="min-h-screen bg-black px-4 py-16 text-white sm:px-6 sm:py-20">
      <div className="mx-auto max-w-md">
        <h1 className="text-center text-xl font-semibold">Chat with {profile.displayName}</h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Choose how you&apos;d like to connect
        </p>
        <div className="mt-8 flex flex-col gap-3">
          {telegramUrl && (
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-zinc-700/50 bg-zinc-900/80 px-4 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02] hover:bg-zinc-800/80 sm:px-6 sm:py-4"
              style={{ backgroundColor: "rgba(0, 136, 204, 0.2)" }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#0088cc]">
                <TelegramIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="font-semibold">Contact via Telegram</span>
                <p className="text-xs text-zinc-400">Open Telegram to chat</p>
              </div>
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 rounded-2xl border border-zinc-700/50 bg-zinc-900/80 px-4 py-3 font-medium text-white shadow-lg transition hover:scale-[1.02] hover:bg-zinc-800/80 sm:px-6 sm:py-4"
              style={{ backgroundColor: "rgba(37, 211, 102, 0.2)" }}
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]">
                <WhatsAppIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="font-semibold">Contact via WhatsApp</span>
                <p className="text-xs text-zinc-400">Open WhatsApp to chat</p>
              </div>
            </a>
          )}
          {phoneUrl && (
            <a
              href={phoneUrl}
              className="flex items-center gap-4 rounded-2xl border border-zinc-700/50 bg-zinc-900/80 px-4 py-3 font-medium text-zinc-200 shadow-lg transition hover:scale-[1.02] hover:bg-zinc-800/80 sm:px-6 sm:py-4"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-zinc-700">
                <PhoneIcon className="h-6 w-6" />
              </div>
              <div className="text-left">
                <span className="font-semibold">Call</span>
                <p className="text-xs text-zinc-400">Phone call</p>
              </div>
            </a>
          )}
          {!telegramUrl && !whatsappUrl && !phoneUrl && (
            <p className="text-center text-sm text-zinc-500">
              No contact information available. Please check back later.
            </p>
          )}
        </div>
        <Link
          href={`/profiles/${id}`}
          className="mt-8 flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800"
        >
          ← Back to profile
        </Link>
      </div>
    </main>
  );
}
