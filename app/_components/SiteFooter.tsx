import Link from "next/link";
import { Phone } from "lucide-react";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-900 bg-black/80 backdrop-blur">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-8 text-sm text-white sm:grid-cols-2 sm:px-6 sm:py-10">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-200">
            Contact
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3 text-zinc-400">
            <a
              href="tel:0912696090"
              aria-label="Call us"
              title="0912696090"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 transition hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <Phone className="h-5 w-5" />
            </a>
            <a
              href="https://t.me/abeni_agent"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on Telegram"
              title="@abeni_agent"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 transition hover:border-[#0088cc]/50 hover:bg-[#0088cc]/10 hover:text-[#0088cc] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
            >
              <TelegramIcon className="h-5 w-5" />
            </a>
          </div>
        </div>

        <div className="sm:justify-self-end">
          <div className="text-xs font-semibold uppercase tracking-[0.4em] text-zinc-200">
            Quick links
          </div>
          <div className="mt-4 flex flex-col gap-2 text-sm text-zinc-400">
            <Link href="/pricing" className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400">
              Pricing
            </Link>
            <Link href="/escorts" className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400">
              Escorts
            </Link>
            <Link href="/terms" className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400">
              Terms
            </Link>
            <Link href="/privacy" className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400">
              Privacy
            </Link>
            <Link href="/18-plus" className="w-fit transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400">
              21+
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

