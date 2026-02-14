import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { SiteData } from '@/lib/types';

interface Props {
  data: SiteData;
}

const Scene2 = ({ data }: Props) => {
  const [elapsed, setElapsed] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const calc = () => {
      const start = new Date(data.startDate).getTime();
      const now = Date.now();
      const diff = Math.max(0, now - start);
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setElapsed({ days, hours, minutes, seconds });
    };
    calc();
    const timer = setInterval(calc, 1000);
    return () => clearInterval(timer);
  }, [data.startDate]);

  const units = [
    { label: 'يوم', value: elapsed.days },
    { label: 'ساعة', value: elapsed.hours },
    { label: 'دقيقة', value: elapsed.minutes },
    { label: 'ثانية', value: elapsed.seconds },
  ];

  return (
    <section className="snap-section relative flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-wine via-background to-deep" />

      <div className="relative z-20 text-center px-6 max-w-3xl">
        <motion.h2
          className="text-3xl md:text-5xl font-amiri font-bold mb-12"
          style={{ color: 'hsl(340 20% 95%)' }}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          منذ أول يوم
        </motion.h2>

        <div className="flex flex-wrap justify-center gap-4 md:gap-8 mb-12">
          {units.map((unit, i) => (
            <motion.div
              key={unit.label}
              className="glass rounded-2xl p-4 md:p-6 min-w-[80px] md:min-w-[120px]"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <motion.div
                className="text-3xl md:text-5xl font-bold font-cairo"
                style={{ color: 'hsl(340 65% 55%)' }}
                key={unit.value}
                initial={{ y: 10, opacity: 0.5 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {unit.value.toLocaleString('ar-EG')}
              </motion.div>
              <div className="text-sm md:text-base mt-2 font-cairo" style={{ color: 'hsl(350 50% 75%)' }}>
                {unit.label}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          className="text-xl md:text-2xl font-amiri"
          style={{ color: 'hsl(350 50% 75%)' }}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          ومن وقتها… وأنا أحبك أكثر كل يوم
        </motion.p>
      </div>
    </section>
  );
};

export default Scene2;
