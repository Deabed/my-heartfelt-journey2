import { useEffect, useState } from 'react';

const colors = [
  'hsl(340 80% 65%)',
  'hsl(350 70% 70%)',
  'hsl(38 70% 55%)',
  'hsl(340 50% 75%)',
  'hsl(0 80% 70%)',
  'hsl(320 60% 60%)',
];

interface Piece {
  id: number;
  x: number;
  color: string;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

const ConfettiEffect = () => {
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    const newPieces: Piece[] = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 6 + Math.random() * 8,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 0.5,
      rotation: Math.random() * 360,
    }));
    setPieces(newPieces);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-[150] overflow-hidden">
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute confetti-piece"
          style={{
            left: `${p.x}%`,
            top: '-10px',
            width: `${p.size}px`,
            height: `${p.size * 0.6}px`,
            backgroundColor: p.color,
            borderRadius: '2px',
            '--duration': `${p.duration}s`,
            '--delay': `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

export default ConfettiEffect;
