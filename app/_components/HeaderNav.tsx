"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useState, useCallback, useEffect, useRef } from "react";
import SignOutButton from "./SignOutButton";

type Role = "admin" | "escort" | "user" | null;

type HeaderNavProps = {
  isLoggedIn: boolean;
  role: Role;
};

const linkClass =
  "transition hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-400";

export default function HeaderNav({ isLoggedIn, role }: HeaderNavProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
    queueMicrotask(() => menuButtonRef.current?.focus({ preventScroll: true }));
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeMenu();
    };
    document.addEventListener("keydown", handleEscape);
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [menuOpen, closeMenu]);

  const navLinks = (
    <>
      <Link href="/pricing" className={linkClass} onClick={closeMenu}>
        Pricing
      </Link>
      <Link href="/escorts" className={linkClass} onClick={closeMenu}>
        Escorts
      </Link>
      {isLoggedIn ? (
        <Link href="/dashboard" className={linkClass} onClick={closeMenu}>
          Dashboard
        </Link>
      ) : (
        <Link href="/auth/login" className={linkClass} onClick={closeMenu}>
          Sign in
        </Link>
      )}
      {role === "escort" ? (
        <Link href="/escort/profile" className={linkClass} onClick={closeMenu}>
          My profile
        </Link>
      ) : null}
      {role === "admin" ? (
        <Link
          href="/dashboard/admin/subscriptions"
          className={linkClass}
          onClick={closeMenu}
        >
          Admin
        </Link>
      ) : null}
      {isLoggedIn ? <SignOutButton /> : null}
    </>
  );

  return (
    <>
      <nav
        className="hidden items-center gap-4 text-xs uppercase tracking-[0.2em] text-zinc-400 md:flex"
        aria-label="Main navigation"
      >
        {navLinks}
      </nav>

      <div className="flex items-center md:hidden">
        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-zinc-400 transition hover:bg-zinc-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          {menuOpen ? (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            id="mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile menu"
            aria-hidden={!menuOpen}
            inert={!menuOpen ? true : undefined}
            className={`fixed inset-0 top-16 z-[60] overflow-y-auto bg-zinc-950 transition-opacity duration-200 md:hidden ${
              menuOpen ? "visible opacity-100" : "invisible opacity-0 pointer-events-none"
            }`}
            onClick={(e) => e.target === e.currentTarget && closeMenu()}
          >
            <nav
              className="flex min-h-[200px] flex-col gap-1 px-4 py-6 text-sm uppercase tracking-[0.2em] sm:px-6"
              onClick={(e) => e.stopPropagation()}
              aria-label="Mobile menu"
            >
              <p className="px-4 pb-2 text-xs font-semibold tracking-[0.3em] text-zinc-500">
                Menu
              </p>
              <Link
                href="/pricing"
                className="rounded-xl px-4 py-3 text-left text-zinc-200 transition hover:bg-zinc-800 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={closeMenu}
              >
                Pricing
              </Link>
              <Link
                href="/escorts"
                className="rounded-xl px-4 py-3 text-left text-zinc-200 transition hover:bg-zinc-800 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                onClick={closeMenu}
              >
                Escorts
              </Link>
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-xl px-4 py-3 text-left text-zinc-200 transition hover:bg-zinc-800 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/auth/login"
                  className="rounded-xl px-4 py-3 text-left text-zinc-200 transition hover:bg-zinc-800 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                  onClick={closeMenu}
                >
                  Sign in
                </Link>
              )}
              {role === "escort" ? (
                <Link
                  href="/escort/profile"
                  className="rounded-xl px-4 py-3 text-left text-zinc-200 transition hover:bg-zinc-800 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                  onClick={closeMenu}
                >
                  My profile
                </Link>
              ) : null}
              {role === "admin" ? (
                <Link
                  href="/dashboard/admin/subscriptions"
                  className="rounded-xl px-4 py-3 text-left text-zinc-200 transition hover:bg-zinc-800 hover:text-emerald-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
                  onClick={closeMenu}
                >
                  Admin
                </Link>
              ) : null}
              {isLoggedIn ? (
                <div className="mt-2 border-t border-zinc-800 pt-4 [&_button]:block [&_button]:w-full [&_button]:rounded-xl [&_button]:px-4 [&_button]:py-3 [&_button]:text-left [&_button]:text-zinc-200 [&_button]:hover:text-emerald-300">
                  <SignOutButton />
                </div>
              ) : null}
            </nav>
          </div>,
          document.body
        )}
    </>
  );
}
