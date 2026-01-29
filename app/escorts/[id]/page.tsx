import Image from "next/image";
import { notFound } from "next/navigation";

import { getPublicEscortById } from "@/lib/escorts";

type EscortDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EscortDetailPage({ params }: EscortDetailPageProps) {
  const { id } = await params;
  const escort = await getPublicEscortById(id);
  if (!escort) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-black px-4 pb-16 pt-16 text-white sm:px-6 sm:pb-20 sm:pt-20">
      <div className="mx-auto max-w-5xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Escort profile
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">{escort.displayName}</h1>
          <p className="text-sm text-zinc-400">
            {escort.city ?? "Available for premium bookings"}
          </p>
        </header>

        <div className="mt-6 grid gap-6 sm:mt-8 lg:grid-cols-[2fr_1fr] lg:gap-8">
          <section className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:rounded-3xl sm:p-6">
            <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
              {escort.images.length > 0 ? (
                escort.images.map((image) => (
                  <div
                    key={image}
                    className="relative h-48 overflow-hidden rounded-2xl"
                  >
                    <Image
                      src={image}
                      alt={escort.displayName}
                      fill
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>
                ))
              ) : (
                <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-xs uppercase tracking-[0.3em] text-zinc-500">
                  No images
                </div>
              )}
            </div>
            <div className="mt-6">
              <h2 className="text-lg font-semibold text-white">About</h2>
              <p className="mt-2 text-sm text-zinc-400">
                {escort.bio ??
                  "Exclusive companionship with verified photos and premium service."}
              </p>
            </div>
          </section>

          <aside className="rounded-2xl border border-zinc-800 bg-black p-4 sm:rounded-3xl sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300">
              Contact details
            </p>
            {escort.canShowContact ? (
              <div className="mt-4 space-y-3 text-sm text-zinc-300">
                <p>{escort.contact?.phone ?? "Phone on request"}</p>
                {escort.contact?.telegram ? (
                  <p>Telegram: {escort.contact.telegram}</p>
                ) : null}
                {escort.contact?.whatsapp ? (
                  <p>WhatsApp: {escort.contact.whatsapp}</p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                Upgrade to view contact details
              </div>
            )}

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-xs uppercase tracking-[0.2em] text-emerald-300">
              {escort.planId} member
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
