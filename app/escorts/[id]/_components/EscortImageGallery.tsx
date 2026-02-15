"use client";

import { useState } from "react";
import { ProtectedEscortImage } from "@/app/_components/ProtectedEscortImage";
import { ProtectedImageLightbox } from "@/app/_components/ProtectedImageLightbox";

type EscortImageGalleryProps = {
  images: string[];
  displayName: string;
  escortId: string;
  viewerHasAccess: boolean;
};

export function EscortImageGallery({
  images,
  displayName,
  escortId,
  viewerHasAccess,
}: EscortImageGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
        {images.length > 0 ? (
          images.map((image, idx) => (
            <div
              key={image}
              className={`relative w-full aspect-[4/5] overflow-hidden rounded-2xl ${
                viewerHasAccess ? "cursor-pointer" : ""
              }`}
              onClick={
                viewerHasAccess ? () => setLightboxIndex(idx) : undefined
              }
              onKeyDown={
                viewerHasAccess
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setLightboxIndex(idx);
                      }
                    }
                  : undefined
              }
              role={viewerHasAccess ? "button" : undefined}
              tabIndex={viewerHasAccess ? 0 : undefined}
              aria-label={
                viewerHasAccess
                  ? `View ${displayName} photo ${idx + 1} full size`
                  : undefined
              }
            >
              <ProtectedEscortImage
                src={image}
                alt={
                  idx === 0
                    ? displayName
                    : `${displayName} photo ${idx + 1}`
                }
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                allowFullQuality={viewerHasAccess}
                displayName={displayName}
                escortId={escortId}
                showWarningOverlay
                priority={idx === 0}
              />
            </div>
          ))
        ) : (
          <div className="flex aspect-[4/5] w-full items-center justify-center rounded-2xl border border-dashed border-zinc-800 text-xs uppercase tracking-[0.3em] text-zinc-500">
            No images
          </div>
        )}
      </div>

      {lightboxIndex !== null && viewerHasAccess && (
        <ProtectedImageLightbox
          images={images}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          altPrefix={displayName}
          allowFullQuality
        />
      )}
    </>
  );
}
