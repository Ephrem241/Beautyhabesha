"use client";

type ContactButtonProps = {
  profileId: string;
  displayName: string;
  telegram?: string | null;
  phone?: string | null;
  disabled: boolean;
};

export function ContactButton({
  profileId,
  displayName,
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
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span>Contact</span>
      </a>
    </div>
  );
}
