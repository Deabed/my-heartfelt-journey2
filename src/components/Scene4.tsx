import { motion } from 'framer-motion';
import { SiteData } from '@/lib/types';

interface Props {
  data: SiteData;
}

const Scene4 = ({ data }: Props) => {
  return (
    <section className="snap-section relative flex flex-col items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-wine via-background to-deep" />

      <div className="relative z-20 text-center px-6 max-w-3xl">
        <motion.h2
          className="text-3xl md:text-5xl font-amiri font-bold mb-12"
          style={{ color: 'hsl(340 20% 95%)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          ليش أحبك 💕
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-4">
          {data.reasons.map((reason, i) => (
            <motion.div
              key={i}
              className="glass rounded-full px-6 py-3 font-cairo text-sm md:text-base"
              style={{ color: 'hsl(340 20% 95%)' }}
              initial={{ opacity: 0, y: 30, scale: 0.8 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{
                scale: 1.08,
                boxShadow: '0 0 20px hsl(340 80% 65% / 0.3)',
              }}
            >
              {reason}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Scene4;
