import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type PhotoItem = {
  id: string;
  data: string;
  caption?: string;
  story?: string;
};

interface Props {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
}

const Lightbox = ({ photos, currentIndex, onClose, onNavigate }: Props) => {
  const photo = photos[currentIndex];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onNavigate((currentIndex + 1) % photos.length);
      if (e.key === "ArrowRight") onNavigate((currentIndex - 1 + photos.length) % photos.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  if (!photo) return null;

  const next = () => onNavigate((currentIndex + 1) % photos.length);
  const prev = () => onNavigate((currentIndex - 1 + photos.length) % photos.length);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[999] bg-black/80 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative max-w-4xl w-full bg-black/40 rounded-2xl overflow-hidden"
          initial={{ scale: 0.96, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.98, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <img
            src={photo.data}
            alt={photo.caption || "ذكرى"}
            className="w-full max-h-[70vh] object-contain bg-black"
            draggable={false}
          />

          {/* النص تحت الصورة */}
          {(photo.caption || photo.story) && (
            <div className="p-4 text-center">
              {photo.caption && <p className="font-cairo text-white text-sm mb-1">{photo.caption}</p>}
              {photo.story && <p className="font-cairo text-white/80 text-xs leading-relaxed">{photo.story}</p>}
            </div>
          )}

          {/* أزرار التحكم */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 glass rounded-full px-3 py-2 text-white"
            title="إغلاق"
          >
            ✕
          </button>

          {photos.length > 1 && (
            <>
              <button
                onClick={prev}
                className="absolute top-1/2 -translate-y-1/2 right-3 glass rounded-full px-3 py-2 text-white"
                title="السابق"
              >
                ›
              </button>

              <button
                onClick={next}
                className="absolute top-1/2 -translate-y-1/2 left-3 glass rounded-full px-3 py-2 text-white"
                title="التالي"
              >
                ‹
              </button>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Lightbox;
