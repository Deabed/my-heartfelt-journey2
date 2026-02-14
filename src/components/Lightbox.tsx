import { motion, AnimatePresence } from 'framer-motion';
import { PhotoItem } from '@/lib/types';
import { useEffect, useCallback } from 'react';

interface Props {
  photos: PhotoItem[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const Lightbox = ({ photos, currentIndex, onClose, onNavigate }: Props) => {
  const photo = photos[currentIndex];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
    if (e.key === 'ArrowLeft' && currentIndex < photos.length - 1) onNavigate(currentIndex + 1);
    if (e.key === 'ArrowRight' && currentIndex > 0) onNavigate(currentIndex - 1);
  }, [currentIndex, photos.length, onClose, onNavigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center"
      style={{ background: 'hsl(340 35% 4% / 0.95)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-6 left-6 text-3xl font-cairo z-10 cursor-pointer"
        style={{ color: 'hsl(340 20% 95%)' }}
        aria-label="إغلاق"
      >
        ✕
      </button>

      <AnimatePresence mode="wait">
        <motion.img
          key={photo.id}
          src={photo.data}
          alt={photo.caption || 'صورة'}
          className="max-h-[70vh] max-w-[90vw] object-contain rounded-lg"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>

      {photo.caption && (
        <p className="mt-4 text-lg font-cairo" style={{ color: 'hsl(350 50% 75%)' }}>
          {photo.caption}
        </p>
      )}

      {/* Nav buttons */}
      <div className="flex gap-4 mt-6" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => currentIndex > 0 && onNavigate(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="glass px-4 py-2 rounded-full font-cairo disabled:opacity-30 cursor-pointer"
          style={{ color: 'hsl(340 20% 95%)' }}
        >
          السابق
        </button>
        <span className="font-cairo self-center" style={{ color: 'hsl(340 10% 55%)' }}>
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          onClick={() => currentIndex < photos.length - 1 && onNavigate(currentIndex + 1)}
          disabled={currentIndex === photos.length - 1}
          className="glass px-4 py-2 rounded-full font-cairo disabled:opacity-30 cursor-pointer"
          style={{ color: 'hsl(340 20% 95%)' }}
        >
          التالي
        </button>
      </div>

      {/* Thumbnails */}
      <div className="flex gap-2 mt-4 overflow-x-auto max-w-[90vw] px-4" onClick={(e) => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button
            key={p.id}
            onClick={() => onNavigate(i)}
            className="flex-shrink-0 cursor-pointer rounded overflow-hidden transition-all"
            style={{
              border: i === currentIndex ? '2px solid hsl(340 65% 55%)' : '2px solid transparent',
              opacity: i === currentIndex ? 1 : 0.5,
            }}
          >
            <img src={p.data} alt="" className="w-12 h-12 object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  );
};

export default Lightbox;
