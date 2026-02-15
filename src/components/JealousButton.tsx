import { useState } from "react";

export default function JealousButton() {
  const [hit, setHit] = useState(false);

  return (
    <>
      <button
        onClick={() => {
          setHit(true);
          setTimeout(() => setHit(false), 1300);
        }}
        className="fixed bottom-24 right-4 z-[260] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
        style={{ color: "hsl(var(--foreground))" }}
        title="إذا عندك أحد غيري لا تضغطي"
      >
        😏 إذا عندك أحد غيري لا تضغطي
      </button>

      {hit && (
        <div className="fixed bottom-40 right-4 z-[270] glass rounded-2xl px-5 py-4 max-w-xs shadow-xl">
          <p className="font-cairo text-base text-white">كنت أعرف 😒</p>
          <p className="font-cairo text-sm opacity-80 mt-2 text-pink-200">أمزح بس… إنتِ عالمي 🤍</p>
        </div>
      )}
    </>
  );
}
