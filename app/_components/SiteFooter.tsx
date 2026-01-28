import Link from "next/link";

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-black/80 backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-6 py-10 text-sm text-white sm:grid-cols-2">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-200">
            Contact
          </div>
          <div className="mt-4 space-y-2 text-sm text-zinc-400">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500">Phone</span>
              <a
                href="tel:0912696090"
                className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
              >
                0912696090
              </a>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-500">Telegram</span>
              <a
                href="https://t.me/abeni_agent"
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
              >
                @abeni_agent
              </a>
            </div>
          </div>
        </div>

        <div className="sm:justify-self-end">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-200">
            Quick links
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
            <Link
              href="/pricing"
              className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Pricing
            </Link>
            <Link
              href="/escorts"
              className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400"
            >
              Escorts
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

