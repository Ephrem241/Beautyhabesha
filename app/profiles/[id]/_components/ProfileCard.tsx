"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";

type ProfileCardProps = {
  name: string;
  city?: string | null;
  imageUrl?: string | null;
};

export function ProfileCard({ name, city, imageUrl }: ProfileCardProps) {
  const router = useRouter();

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="sticky top-0 z-20 flex items-center gap-3 border-b border-zinc-800/80 bg-black/90 px-4 py-3 backdrop-blur-md safe-area-inset-top"
    >
      <button
        type="button"
        onClick={() => router.back()}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        aria-label="Go back"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </button>

      {imageUrl ? (
        <Image
          src={imageUrl}
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-zinc-700 text-sm font-semibold text-zinc-300">
          {name.slice(0, 1).toUpperCase()}
        </span>
      )}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold text-white">{name}</h1>
        {city && (
          <p className="truncate text-xs text-zinc-500">{city}</p>
        )}
      </div>
    </motion.header>
  );
}
