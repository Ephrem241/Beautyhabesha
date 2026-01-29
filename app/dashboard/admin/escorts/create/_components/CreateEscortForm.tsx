"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { Button } from "@/app/_components/ui/Button";
import type { CreateEscortResult } from "../actions";

const MIN_IMAGES = 3;
const MAX_IMAGES = 12;

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
  const [clientError, setClientError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    const input = form.elements.namedItem("images");
    const files = input instanceof HTMLInputElement ? input.files : null;
    const n = files?.length ?? 0;
    if (n < MIN_IMAGES) {
      e.preventDefault();
      setClientError(`Select at least ${MIN_IMAGES} images (you have ${n}). First image = profile.`);
      return;
    }
    if (n > MAX_IMAGES) {
      e.preventDefault();
      setClientError(`Select at most ${MAX_IMAGES} images (you have ${n}).`);
      return;
    }
    setClientError("");
  };

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6"
    >
      {(state?.error || clientError) && (
        <div className="mb-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {clientError || state?.error}
        </div>
      )}

      <div className="space-y-4">
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
          <span className="text-sm font-medium text-zinc-200">
            Images <span className="text-amber-400">*</span> (min 3, max 12)
          </span>
          <p className="mt-1 text-xs text-zinc-500">
            First image is the profile picture. Each max 5MB.
          </p>
          <input
            type="file"
            name="images"
            accept="image/*"
            multiple
            required
            className="mt-2 block w-full cursor-pointer rounded-xl border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-400"
          />
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
