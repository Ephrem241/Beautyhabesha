import { Suspense } from "react";
import RegisterFormClient from "./_components/RegisterFormClient";

export const metadata = {
  title: "Create Account | Beautyhabesha",
  description: "Sign up to get started with Beautyhabesha",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-4 py-12 text-white sm:px-6 sm:py-16">
          <div className="mx-auto max-w-md">
            <header className="mb-8 text-center">
              <div className="h-8 w-48 mx-auto animate-pulse bg-zinc-800 rounded" />
              <div className="mt-2 h-4 w-32 mx-auto animate-pulse bg-zinc-800 rounded" />
            </header>
            <div className="rounded-2xl border border-zinc-800 bg-black p-4 sm:p-6">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 animate-pulse bg-zinc-800 rounded-xl" />
                ))}
              </div>
              <div className="mt-6 h-12 animate-pulse bg-zinc-800 rounded-full" />
            </div>
          </div>
        </main>
      }
    >
      <RegisterFormClient />
    </Suspense>
  );
}
