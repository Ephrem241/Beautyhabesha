"use client";

import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";

import { upsertEscortProfile } from "../actions";
import { Button } from "@/app/_components/ui/Button";

const profileSchema = z.object({
  displayName: z.string().min(1, "Display name is required").max(50, "Too long"),
  bio: z.string().max(500, "Bio too long").optional(),
  description: z.string().max(2000, "Description too long").optional(),
  city: z.string().max(100, "City too long").optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  initialDisplayName?: string;
  initialBio?: string;
  initialDescription?: string;
  initialCity?: string;
  initialPhone?: string;
  initialTelegram?: string;
  initialWhatsapp?: string;
  existingImages: string[];
  maxImages: number | null;
};

type ProfileFormState = {
  error?: string;
};

const initialState: ProfileFormState = {};

export default function ProfileForm({
  initialDisplayName,
  initialBio,
  initialDescription,
  initialCity,
  initialPhone,
  initialTelegram,
  initialWhatsapp,
  existingImages,
  maxImages,
}: ProfileFormProps) {
  const [state, formAction] = useFormState<ProfileFormState, FormData>(
    upsertEscortProfile,
    initialState
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: initialDisplayName || "",
      bio: initialBio || "",
      description: initialDescription || "",
      city: initialCity || "",
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    const formData = new FormData();
    formData.append("displayName", data.displayName);
    if (data.bio) formData.append("bio", data.bio);
    if (data.description) formData.append("description", data.description);
    if (data.city) formData.append("city", data.city);
    // Convert string[] to CloudinaryImage[] format for server
    const imagesAsCloudinaryFormat = existingImages.map(url => ({ url, publicId: `legacy_${url.split("/").pop()?.split(".")[0] || "unknown"}` }));
    formData.append("existingImages", JSON.stringify(imagesAsCloudinaryFormat));

    // Add file inputs if any
    // Note: File handling would need to be adjusted

    formAction(formData);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:mt-8 sm:rounded-3xl sm:p-6"
    >
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-zinc-200">
          Display name
          <input
            {...register("displayName")}
            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white"
          />
          {errors.displayName && (
            <span className="text-sm text-red-400">{errors.displayName.message}</span>
          )}
        </label>
        <label className="flex flex-col gap-2 text-sm text-zinc-200">
          City
          <input
            {...register("city")}
            className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white"
          />
          {errors.city && (
            <span className="text-sm text-red-400">{errors.city.message}</span>
          )}
        </label>
      </div>

      <div className="mt-6 rounded-2xl border border-zinc-800 bg-black/50 px-4 py-3 sm:px-5 sm:py-4">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
          Contact (read-only)
        </p>
        <p className="mt-2 text-sm text-zinc-400">
          Telegram: {initialTelegram || "—"} · WhatsApp: {initialWhatsapp || "—"}
          {initialPhone ? ` · Phone: ${initialPhone}` : ""}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Contact is set by the platform and cannot be edited.
        </p>
      </div>

      <label className="mt-6 flex flex-col gap-2 text-sm text-zinc-200">
        Short bio
        <textarea
          {...register("bio")}
          rows={3}
          placeholder="Brief tagline (max 500 characters)"
          className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500"
        />
        {errors.bio && (
          <span className="text-sm text-red-400">{errors.bio.message}</span>
        )}
      </label>

      <label className="mt-6 flex flex-col gap-2 text-sm text-zinc-200">
        Description
        <textarea
          {...register("description")}
          rows={6}
          placeholder="Full description about you (max 2000 characters)"
          className="rounded-2xl border border-zinc-800 bg-black px-4 py-3 text-sm text-white placeholder-zinc-500"
        />
        {errors.description && (
          <span className="text-sm text-red-400">{errors.description.message}</span>
        )}
      </label>

      <div className="mt-6">
        <p className="text-sm font-semibold text-zinc-200">Profile images</p>
        <p className="mt-1 text-xs text-zinc-500">
          The first image is your profile picture. Minimum 3, maximum{" "}
          {maxImages === null ? 12 : Math.min(12, maxImages)} images. Admin will review before approving.
        </p>
        {existingImages.length > 0 ? (
          <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3">
            {existingImages.map((image, index) => (
              <div
                key={image}
                className="overflow-hidden rounded-2xl border border-zinc-800"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={image}
                    alt={index === 0 ? "Profile picture" : "Gallery"}
                    fill
                    className="object-cover"
                  />
                  {index === 0 && (
                    <span className="absolute left-2 top-2 rounded-full bg-emerald-500/90 px-2 py-0.5 text-xs font-semibold text-emerald-950">
                      Profile
                    </span>
                  )}
                  <label className="absolute right-2 top-2 flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs text-white">
                    <input
                      type="checkbox"
                      name="removeImages"
                      value={image}
                      className="h-3 w-3 accent-emerald-400"
                    />
                    Remove
                  </label>
                </div>
              </div>
            ))}
          </div>
        ) : null}
        <input
          type="file"
          name="images"
          accept="image/*"
          multiple
          className="mt-4 block w-full cursor-pointer rounded-2xl border border-zinc-800 bg-black px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-400 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-300"
        />
      </div>

      {state?.error ? (
        <p className="mt-4 text-sm text-red-400">{state.error}</p>
      ) : null}

      <Button
        type="submit"
        fullWidth
        disabled={isSubmitting}
        className="mt-6"
      >
        {isSubmitting ? "Saving..." : "Save profile"}
      </Button>
    </form>
  );
}
