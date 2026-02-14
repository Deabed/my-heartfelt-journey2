import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

interface Props {
  onUnlock: (code: string) => Promise<boolean>;
}

const UnlockGate = ({ onUnlock }: Props) => {
  const [code, setCode] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const warmSudanese = useMemo(() => {
    if (attempts >= 4) return "يا غُرّة… ركّزي معاي شوية 😅❤️";
    if (attempts >= 2) return "راجعي ذاكرتك يا فلاولة 💭";
    return "دخلي تاريخ بدايتنا ❤️";
  }, [attempts]);

  useEffect(() => {
    if (!locked) return;

    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [locked]);

  const handleSubmit = async () => {
    if (locked) return;

    const value = code.trim();
    if (!value) return;

    const success = await onUnlock(value);

    if (success) return;

    const next = attempts + 1;
    setAttempts(next);

    if (next >= 5) {
      setLocked(true);
      setSecondsLeft(30);
      setError("اتقفلت 30 ثانية… استني يا نوسة 💔");

      setTimeout(() => {
        setLocked(false);
        setAttempts(0);
        setError("");
        setCode("");
      }, 30000);

      return;
    }

    if (next >= 3) {
      setError("راجعي ذاكرتك يا فلاولة… التاريخ بصيغة 21/03/2024 💭");
    } else {
      setError("التاريخ غلط - ح انكد عليك 💔");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white text-center px-6 select-none">
      <motion.div
        animate={attempts >= 3 ? { x: [-10, 10, -10, 10, 0] } : {}}
        transition={{ duration: 0.35 }}
        className="glass rounded-2xl p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-amiri mb-3">{warmSudanese}</h2>

        <p className="text-sm text-pink-200 mb-5">
          دخلي التاريخ كدا : <span className="font-bold">21/03/2024</span>
        </p>

        <input
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="21/03/2024"
          disabled={locked}
          className="w-full px-4 py-2 rounded-lg text-black text-center mb-3"
        />

        <p className="text-xs text-white/70 mb-3">
          المحاولات: <span className="font-bold">{attempts}</span>/5
          {locked && secondsLeft > 0 && (
            <span className="ml-2">— استني {secondsLeft}s</span>
          )}
        </p>

        {error && <p className="text-pink-300 text-sm mb-4">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={locked}
          className="px-6 py-2 rounded-full bg-pink-600 hover:bg-pink-700 transition disabled:opacity-50"
        >
          دخول
        </button>
      </motion.div>
    </div>
  );
};

export default UnlockGate;
