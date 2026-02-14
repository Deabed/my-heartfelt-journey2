import { motion, AnimatePresence } from 'framer-motion';
import { SiteData } from '@/lib/types';
import { useState } from 'react';
import ConfettiEffect from './ConfettiEffect';

interface Props {
  data: SiteData;
}

const Scene5 = ({ data }: Props) => {
  const [opened, setOpened] = useState(false);

  return (
    <section className="snap-section relative flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-deep via-background to-wine" />

      <div className="relative z-20 text-center px-6 max-w-2xl">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.div
              key="gift"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="flex flex-col items-center"
            >
              <motion.div
                className="text-8xl md:text-9xl mb-8 cursor-pointer gift-shake select-none"
                onClick={() => setOpened(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                🎁
              </motion.div>

              <motion.button
                onClick={() => setOpened(true)}
                className="glass glow-pulse px-10 py-4 rounded-full text-lg font-cairo font-semibold cursor-pointer"
                style={{ color: 'hsl(340 20% 95%)' }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                افتحي المفاجأة 🎁
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="message"
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="flex flex-col items-center"
            >
              <div className="glass-strong rounded-3xl p-8 md:p-12 max-w-lg">
                <div className="text-5xl mb-6">💌</div>
                <p
                  className="text-xl md:text-2xl font-amiri leading-relaxed"
                  style={{ color: 'hsl(340 20% 95%)' }}
                >
                  {data.surpriseMessage}
                </p>
                {data.loveLetter && (
                  <p
                    className="mt-6 text-base md:text-lg font-cairo leading-relaxed"
                    style={{ color: 'hsl(350 50% 75%)' }}
                  >
                    {data.loveLetter}
                  </p>
                )}
              </div>

              {/* Footer */}
              <motion.div
                className="mt-12 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <p className="text-lg font-amiri" style={{ color: 'hsl(350 50% 75%)' }}>
                  بحب دائمًا — {data.myName}
                </p>
                <p className="mt-3 text-sm font-cairo" style={{ color: 'hsl(340 10% 55%)' }}>
                  تم صنع هذا الموقع خصيصًا لك 💗
                </p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {opened && <ConfettiEffect />}
    </section>
  );
};

export default Scene5;
