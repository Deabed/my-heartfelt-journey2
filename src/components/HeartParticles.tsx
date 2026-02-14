import { useEffect, useRef, useState } from 'react';

const HeartParticles = () => {
  const [hearts, setHearts] = useState<Array<{ id: number; x: number; size: number; duration: number; delay: number }>>([]);
  const counter = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      counter.current++;
      setHearts(prev => {
        const newHeart = {
          id: counter.current,
          x: Math.random() * 100,
          size: 8 + Math.random() * 16,
          duration: 4 + Math.random() * 4,
          delay: 0,
        };
        // Keep max 15 hearts
        const filtered = prev.length > 14 ? prev.slice(1) : prev;
        return [...filtered, newHeart];
      });
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute heart-particle"
          style={{
            left: `${h.x}%`,
            bottom: '-20px',
            fontSize: `${h.size}px`,
            '--duration': `${h.duration}s`,
            '--delay': `${h.delay}s`,
            color: 'hsl(340 80% 65%)',
            opacity: 0.6,
          } as React.CSSProperties}
        >
          ♥
        </div>
      ))}
    </div>
  );
};

export default HeartParticles;
