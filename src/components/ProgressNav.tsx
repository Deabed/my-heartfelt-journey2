import { motion } from 'framer-motion';

interface Props {
  currentScene: number;
  totalScenes: number;
  onNavigate: (scene: number) => void;
}

const ProgressNav = ({ currentScene, totalScenes, onNavigate }: Props) => {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-3">
      {Array.from({ length: totalScenes }, (_, i) => (
        <button
          key={i}
          onClick={() => onNavigate(i)}
          className="group relative"
          aria-label={`Scene ${i + 1}`}
        >
          <motion.div
            className="w-3 h-3 rounded-full border border-primary/50 transition-colors"
            animate={{
              backgroundColor: i === currentScene ? 'hsl(340 65% 55%)' : 'transparent',
              scale: i === currentScene ? 1.3 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
          {i === currentScene && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: '0 0 12px hsl(340 80% 65% / 0.6)' }}
              layoutId="nav-glow"
            />
          )}
        </button>
      ))}
    </div>
  );
};

export default ProgressNav;
