import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface Props {
  herName: string;
  onEnter: () => void;
}

const CinematicIntro = ({ herName, onEnter }: Props) => {
  const [showButton, setShowButton] = useState(false);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/love.mp3");
    audio.loop = true;
    audio.volume = 0.5;
    audioRef.current = audio;

    audio.play().catch(() => {
      // بعض المتصفحات تمنع التشغيل التلقائي
    });

    return () => {
      audio.pause();
    };
  }, []);

  const handleEnter = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    onEnter();
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setMuted(audioRef.current.muted);
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#2b0018] to-black opacity-95" />

      {/* Mute Button */}
      <button
        onClick={toggleMute}
        className="absolute top-6 right-6 text-white text-sm px-4 py-2 glass rounded-full"
      >
        {muted ? "🔇 تشغيل الصوت" : "🔊 كتم الصوت"}
      </button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="relative text-center px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 2 }}
          onAnimationComplete={() => {
            setTimeout(() => setShowButton(true), 1500);
          }}
          className="text-3xl md:text-5xl font-amiri font-bold"
          style={{ color: "hsl(340 20% 95%)" }}
        >
          هل أنتي مستعدة يا {herName}؟ ❤️
        </motion.h1>

        {showButton && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            onClick={handleEnter}
            className="mt-12 px-8 py-3 rounded-full font-cairo text-lg glass hover:scale-110 transition-transform"
            style={{ color: "hsl(var(--foreground))" }}
          >
            ادخلي يا نوسة قلبي ✨
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default CinematicIntro;
