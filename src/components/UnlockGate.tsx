import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onUnlock: () => void;
}

const CORRECT_DATE = '2024-03-21';

const UnlockGate = ({ onUnlock }: Props) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const handleSubmit = () => {
    // Parse DD/MM/YYYY to ISO
    const parts = input.trim().split('/');
    let iso = '';
    if (parts.length === 3) {
      const [dd, mm, yyyy] = parts;
      iso = `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    }

    if (iso === CORRECT_DATE) {
      setError(false);
      setUnlocking(true);
      // Store with 24h TTL
      const expires = Date.now() + 24 * 60 * 60 * 1000;
      localStorage.setItem('love-unlock', JSON.stringify({ isUnlocked: true, expires }));
      setTimeout(() => onUnlock(), 1800);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {!unlocking ? (
        <motion.div
          key="gate"
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep via-background to-wine" />
          <div className="vignette" />

          {/* Bokeh */}
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bokeh-dot"
              style={{
                width: `${50 + i * 25}px`,
                height: `${50 + i * 25}px`,
                background: `radial-gradient(circle, hsl(340 80% 65% / 0.12), transparent)`,
                left: `${15 + i * 16}%`,
                top: `${25 + (i % 3) * 20}%`,
                '--duration': `${3 + i * 0.8}s`,
                '--delay': `${i * 0.4}s`,
              } as React.CSSProperties}
            />
          ))}

          <div className="relative z-10 text-center px-6 max-w-md w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1 }}
            >
              <div className="text-7xl mb-6">🔒</div>

              <h1
                className="text-3xl md:text-4xl font-amiri font-bold mb-3"
                style={{ color: 'hsl(var(--foreground))' }}
              >
                هذا الموقع خاص 💗
              </h1>

              <p
                className="text-base font-cairo mb-10"
                style={{ color: 'hsl(var(--blush))' }}
              >
                أدخلي تاريخ تعارفنا لفتح القفل
              </p>

              <motion.div
                animate={error ? { x: [0, -12, 12, -8, 8, 0] } : {}}
                transition={{ duration: 0.4 }}
              >
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder="DD/MM/YYYY"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="w-full text-center text-2xl tracking-widest px-6 py-4 rounded-2xl bg-secondary font-cairo text-foreground border-2 outline-none transition-colors duration-300"
                  style={{
                    borderColor: error ? 'hsl(var(--destructive))' : 'hsl(var(--border))',
                    direction: 'ltr',
                  }}
                  dir="ltr"
                />
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.p
                    className="mt-4 text-base font-cairo"
                    style={{ color: 'hsl(var(--destructive))' }}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                  >
                    مو دا.. جرّبي تاني يا قلبي 💗
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                onClick={handleSubmit}
                className="mt-8 glass glow-pulse px-10 py-4 rounded-full text-lg font-cairo font-semibold cursor-pointer w-full"
                style={{ color: 'hsl(var(--foreground))' }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                افتحي القفل 🔓
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          key="unlocking"
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-background"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 1, delay: 1 }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-deep via-background to-wine" />
          <motion.div
            className="relative z-10 text-8xl"
            initial={{ scale: 1, rotate: 0 }}
            animate={{ scale: [1, 1.4, 0], rotate: [0, 0, 180] }}
            transition={{ duration: 1.5, ease: 'easeInOut' }}
          >
            ❤️
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UnlockGate;
