"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/app/_components/ui/Button";
import type { CreateEscortResult } from "../actions";

type CreateEscortFormProps = {
  createAction: (
    prev: CreateEscortResult,
    formData: FormData
  ) => Promise<CreateEscortResult>;
};

const initialState: CreateEscortResult = {};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Creating…" : "Create escort"}
    </Button>
  );
}

export function CreateEscortForm({ createAction }: CreateEscortFormProps) {
  const [state, formAction] = useActionState(createAction, initialState);

  return (
    <form
      action={formAction}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
    >
      {state?.error && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.error}
        </div>
      )}

      <div className="space-y-4">
        <label className="block">
          <span className="text-sm font-medium text-zinc-200">Email</span>
          <input
            type="email"
            name="email"
            required
            placeholder="escort@example.com"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-200">Name</span>
          <input
            type="text"
            name="name"
            required
            minLength={2}
            maxLength={100}
            placeholder="Full name"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-200">
            Display name <span className="text-zinc-500">(optional)</span>
          </span>
          <input
            type="text"
            name="displayName"
            minLength={2}
            maxLength={60}
            placeholder="Defaults to name"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-zinc-200">Password</span>
          <input
            type="password"
            name="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <p className="mt-1 text-xs text-zinc-500">Min 6 characters. Share securely with the escort.</p>
        </label>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <SubmitButton />
        <Link
          href="/dashboard/admin/escorts"
          className="inline-flex items-center rounded-full border border-zinc-700 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-zinc-300 transition hover:border-zinc-600 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
