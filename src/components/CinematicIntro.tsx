import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  herName: string;
  onEnter: () => void;
}

const CinematicIntro = ({ herName, onEnter }: Props) => {
  const [showButton, setShowButton] = useState(false);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black overflow-hidden select-none">
      <div className="absolute inset-0 bg-gradient-to-br from-black via-[#2b0018] to-black opacity-90" />

      {/* ❤️ قلب ينبض */}
      <motion.div
        className="absolute top-10 left-1/2 -translate-x-1/2 text-5xl"
        animate={{ scale: [1, 1.18, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      >
        ❤️
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.8 }}
        className="relative text-center px-6"
      >
        <motion.h1
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.4 }}
          onAnimationComplete={() => setTimeout(() => setShowButton(true), 900)}
          className="text-3xl md:text-5xl font-amiri font-bold"
          style={{ color: "hsl(340 20% 95%)" }}
        >
          هل أنتي مستعدة يا {herName}؟ ❤️
        </motion.h1>

        {showButton && (
          <motion.button
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            onClick={onEnter}
            className="mt-10 px-8 py-3 rounded-full font-cairo text-lg glass hover:scale-110 transition-transform"
            style={{ color: "hsl(var(--foreground))" }}
          >
            ادخلي يا روحي ✨
          </motion.button>
        )}
      </motion.div>
    </div>
  );
};

export default CinematicIntro;
