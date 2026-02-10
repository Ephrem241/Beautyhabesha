"use client";

type ContactButtonProps = {
  profileId: string;
  telegram?: string | null;
  phone?: string | null;
  disabled: boolean;
};

export function ContactButton({
  profileId,
  telegram,
  phone,
  disabled,
}: ContactButtonProps) {
  const getContactHref = (): string => {
    if (disabled) return "#";
    if (telegram) {
      const handle = telegram.replace(/^@/, "").trim();
      return handle ? `https://t.me/${handle}` : `/chat/${profileId}`;
    }
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      return digits ? `tel:${digits}` : `/chat/${profileId}`;
    }
    return `/chat/${profileId}`;
  };

  const href = getContactHref();

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 safe-area-inset-bottom md:px-6 md:pb-6">
      <a
        href={href}
        onClick={handleClick}
        aria-disabled={disabled}
        className={`flex h-[60px] w-full items-center justify-center gap-3 rounded-xl bg-emerald-500 px-6 text-base font-semibold text-emerald-950 shadow-lg shadow-emerald-500/25 transition ${
          disabled
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-emerald-400 active:scale-[0.98]"
        }`}
      >
        <svg
          className="h-5 w-5 shrink-0"
          fill="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
        <span>Contact</span>
      </a>
    </div>
  );
}
