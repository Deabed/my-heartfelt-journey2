import { motion } from 'framer-motion';
import { SiteData } from '@/lib/types';

interface Props {
  data: SiteData;
  onNext: () => void;
}

const Scene1 = ({ data, onNext }: Props) => {
  return (
    <section className="snap-section relative flex flex-col items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-deep via-background to-wine" />
      
      {/* Bokeh highlights */}
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bokeh-dot"
          style={{
            width: `${40 + i * 20}px`,
            height: `${40 + i * 20}px`,
            background: `radial-gradient(circle, hsl(340 80% 65% / 0.15), transparent)`,
            left: `${10 + i * 15}%`,
            top: `${20 + (i % 3) * 25}%`,
            '--duration': `${3 + i * 0.7}s`,
            '--delay': `${i * 0.5}s`,
          } as React.CSSProperties}
        />
      ))}

      <div className="relative z-20 text-center px-6 max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
        >
          <motion.h1
            className="text-5xl md:text-7xl font-amiri font-bold mb-6"
            style={{ color: 'hsl(340 20% 95%)' }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.3 }}
          >
            إلى {data.herName} ❤️
          </motion.h1>

          <motion.p
            className="text-lg md:text-2xl font-cairo leading-relaxed mb-12"
            style={{ color: 'hsl(350 50% 75%)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            {data.heroSubtitle}
          </motion.p>

          <motion.button
            onClick={onNext}
            className="glass glow-pulse px-10 py-4 rounded-full text-lg font-cairo font-semibold cursor-pointer"
            style={{ color: 'hsl(340 20% 95%)' }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ابدأي الرحلة ✨
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};

export default Scene1;
