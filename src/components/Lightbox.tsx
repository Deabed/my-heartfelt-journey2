import { useEffect } from "react";
import { PhotoItem } from "@/lib/types";

type Props = {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
};

const Lightbox = ({ photos, currentIndex, onClose, onNavigate }: Props) => {
  const photo = photos[currentIndex];

  const prev = () => onNavigate((currentIndex - 1 + photos.length) % photos.length);
  const next = () => onNavigate((currentIndex + 1) % photos.length);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, photos.length]);

  if (!photo) return null;

  return (
    <div
      className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.data}
          alt={photo.caption || "ذكرى"}
          className="w-full max-h-[80vh] object-contain rounded-xl"
        />

        {(photo.caption || photo.story) && (
          <div className="mt-3 text-center">
            {photo.caption && <p className="text-white font-cairo text-base">{photo.caption}</p>}
            {photo.story && <p className="text-white/80 font-cairo text-sm mt-1">{photo.story}</p>}
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 px-3 py-1 rounded-full bg-white/10 text-white hover:bg-white/20"
        >
          ✕
        </button>

        {photos.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute top-1/2 -translate-y-1/2 left-2 px-3 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ‹
            </button>
            <button
              onClick={next}
              className="absolute top-1/2 -translate-y-1/2 right-2 px-3 py-2 rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              ›
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default Lightbox;