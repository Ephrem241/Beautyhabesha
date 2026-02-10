"use client";

type EscortImageUploadProps = {
  images: File[];
  setImages: (images: File[]) => void;
  minImages: number;
  maxImages: number;
};

export default function EscortImageUpload({
  images,
  setImages,
  minImages,
  maxImages,
}: EscortImageUploadProps) {
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
      <label
        htmlFor="profileImages"
        className="block text-sm font-semibold text-zinc-200"
      >
        Images <span className="text-amber-400">*</span> (min {minImages}, max {maxImages})
      </label>
      <p className="mt-1 text-xs text-zinc-500">
        The first image is your profile picture. Upload {minImages}–{maxImages} images. Each max 5MB. Admin will review before approving.
      </p>
      <input
        id="profileImages"
        type="file"
        accept="image/*"
        multiple
        required
        onChange={(e) => setImages(Array.from(e.target.files ?? []))}
        className="mt-3 block w-full cursor-pointer rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-4 file:rounded-full file:border-0 file:bg-emerald-500 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-emerald-950 hover:file:bg-emerald-400"
      />
      {images.length > 0 && (
        <p className="mt-2 text-xs text-emerald-400">
          Selected: {images.length} image{images.length !== 1 ? "s" : ""}
          {images.length > 0 && ` — first is profile picture`}
        </p>
      )}
    </div>
  );
}

