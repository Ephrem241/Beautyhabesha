

import type { Metadata } from "next";
import Image from "next/image";
import { getFeaturedEscorts } from "@/lib/escorts";
import { ButtonLink } from "@/app/_components/ui/Button";

export const metadata: Metadata = {
  title: "Home",
  description:
    "Discover premium escort profiles with Platinum spotlight placement.",
};

export default async function Home() {
  const spotlight = await getFeaturedEscorts(6);

  return (
    <main className="min-h-screen bg-black px-6 pb-20 pt-16 text-white sm:pt-20">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-emerald-300">
            Premium membership
          </p>
          <h1 className="mt-4 text-3xl font-semibold sm:text-4xl">
            Showcase premium profiles with Platinum visibility
          </h1>
          <p className="mt-4 max-w-2xl text-sm text-zinc-400">
            Upgrade to unlock spotlight placement, featured badges, and priority
            listings across the platform.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <ButtonLink href="/pricing" size="md">
              View plans
            </ButtonLink>
            <ButtonLink href="/escorts" variant="outline" size="md">
              Browse escorts
            </ButtonLink>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Homepage spotlight</h2>
            <span className="text-xs uppercase tracking-[0.2em] text-emerald-300">
              Platinum only
            </span>
          </div>
          {spotlight.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-400">
              No Platinum profiles yet. Upgrade to appear here.
            </div>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {spotlight.slice(0, 6).map((escort) => (
                <article
                  key={escort.id}
                  className="overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 transition hover:-translate-y-0.5 hover:border-emerald-500/60"
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
                      Featured
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-white">
                      {escort.displayName}
                    </h3>
                    <p className="text-xs text-zinc-500">{escort.city}</p>
                    <p className="mt-3 text-sm text-zinc-400">
                      {escort.bio ?? "Premium spotlight profile."}
                    </p>
                    <ButtonLink
                      href={`/escorts/${escort.id}`}
                      variant="ghost"
                      className="mt-4"
                    >
                      View profile
                    </ButtonLink>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
