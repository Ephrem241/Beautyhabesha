import type { Metadata } from "next";
import Image from "next/image";
import { getPublicEscortsOptimized } from "@/lib/escorts";
import { ButtonLink } from "@/app/_components/ui/Button";

export const metadata: Metadata = {
  title: "Escort Listings",
  description: "Browse premium escort profiles by membership visibility.",
};

export default async function EscortListingPage() {
  const escorts = await getPublicEscortsOptimized();

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <header className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Escort listings
          </p>
          <h1 className="text-3xl font-semibold">Discover premium profiles</h1>
          <p className="text-sm text-zinc-400">
            Platinum profiles appear first, followed by VIP, then Normal.
          </p>
        </header>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {escorts.map((escort) => (
            <article
              key={escort.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-emerald-500/60"
            >
              <div className="relative h-48 w-full">
                {escort.images[0] ? (
                  <Image
                    src={escort.images[0]}
                    alt={escort.displayName}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 via-black to-emerald-950/60 text-xs uppercase tracking-[0.3em] text-zinc-500">
                    No image
                  </div>
                )}
                <span className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-300">
                  {escort.planId}
                </span>
                {escort.planId === "Platinum" ? (
                  <span className="absolute right-4 top-4 rounded-full bg-emerald-400/20 px-3 py-1 text-xs uppercase tracking-[0.2em] text-emerald-200">
                    Featured
                  </span>
                ) : null}
              </div>
              <div className="flex flex-1 flex-col gap-3 p-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {escort.displayName}
                  </h2>
                  <p className="text-xs text-zinc-500">{escort.city}</p>
                </div>
                <p className="text-sm text-zinc-400">
                  {escort.bio ?? "Premium experience with verified photos."}
                </p>

                {escort.canShowContact ? (
                  <div className="mt-auto text-sm text-zinc-300">
                    <p>{escort.contact?.phone ?? "Phone on request"}</p>
                    {escort.contact?.telegram ? (
                      <p>Telegram: {escort.contact.telegram}</p>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-auto rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    Upgrade to view contact details
                  </div>
                )}

                <ButtonLink
                  href={`/escorts/${escort.id}`}
                  variant="outline"
                  className="mt-4"
                >
                  View profile
                </ButtonLink>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
