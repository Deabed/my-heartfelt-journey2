import { useEffect, useMemo, useRef, useState } from "react";
import { SiteData, defaultData } from "@/lib/types";

import CinematicIntro from "@/components/CinematicIntro";
import HeartParticles from "@/components/HeartParticles";
import ProgressNav from "@/components/ProgressNav";
import Scene1 from "@/components/Scene1";
import Scene2 from "@/components/Scene2";
import Scene3 from "@/components/Scene3";
import Scene4 from "@/components/Scene4";
import Scene5 from "@/components/Scene5";
import UnlockGate from "@/components/UnlockGate";
import { dailyMessages } from "@/lib/dailyMessages";

function diffDays(from: string) {
  // from format: YYYY-MM-DD
  const a = new Date(from + "T00:00:00");
  const b = new Date();
  const ms = b.getTime() - a.getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

const Index = () => {
  // 🎬 intro every visit
  const [entered, setEntered] = useState(false);

  // 🔐 gate
  const [unlocked, setUnlocked] = useState(false);

  // 📦 data
  const [data, setData] = useState<SiteData>(defaultData);

  // 🧭 scenes
  const [currentScene, setCurrentScene] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const setSceneRef = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el;
  };

  const navigateTo = (i: number) => {
    sceneRefs.current[i]?.scrollIntoView({ behavior: "smooth" });
  };

  // 🎵 music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const tryPlay = () => {
      const a = audioRef.current;
      if (!a) return;
      a.volume = 0.6;
      a.loop = true;
      a.play().catch(() => {});
    };
    tryPlay();
    window.addEventListener("click", tryPlay, { once: true });
    return () => window.removeEventListener("click", tryPlay);
  }, []);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  // 🚫 anti-copy (best-effort)
  useEffect(() => {
    const onCtx = (e: MouseEvent) => e.preventDefault();
    const onDragStart = (e: DragEvent) => e.preventDefault();
    const onKey = (e: KeyboardEvent) => {
      // block: Ctrl+S / Ctrl+U / Ctrl+Shift+I / F12 (best-effort only)
      if (e.key === "F12") e.preventDefault();
      if (e.ctrlKey && (e.key.toLowerCase() === "s" || e.key.toLowerCase() === "u")) e.preventDefault();
      if (e.ctrlKey && e.shiftKey && (e.key.toLowerCase() === "i" || e.key.toLowerCase() === "j")) e.preventDefault();
    };

    document.addEventListener("contextmenu", onCtx);
    document.addEventListener("dragstart", onDragStart as any);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("contextmenu", onCtx);
      document.removeEventListener("dragstart", onDragStart as any);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // 🕵️ devtools detection (approx)
  const [privacyMode, setPrivacyMode] = useState(false);
  useEffect(() => {
    const t = setInterval(() => {
      // heuristic only
      const opened =
        window.outerWidth - window.innerWidth > 160 ||
        window.outerHeight - window.innerHeight > 160;
      setPrivacyMode(opened);
    }, 800);
    return () => clearInterval(t);
  }, []);

  // ✅ intersection observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = sceneRefs.current.indexOf(e.target as HTMLDivElement);
            if (idx !== -1) setCurrentScene(idx);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    sceneRefs.current.forEach((ref) => ref && obs.observe(ref));
    return () => obs.disconnect();
  }, []);

  // 🔐 call edge function to verify date + return signed urls
  const fetchSignedPhotos = async (code: string) => {
    // must be with /
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(code)) throw new Error("format");

    const siteId = import.meta.env.VITE_SITE_ID as string;
    const supaUrl = import.meta.env.VITE_SUPABASE_URL as string;

    const res = await fetch(`${supaUrl}/functions/v1/unlock`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ siteId, code }),
    });

    if (!res.ok) throw new Error("invalid");

    const json = await res.json();
    const signedPhotos = (json.photos ?? [])
      .filter((p: any) => p.url)
      .map((p: any) => ({
        id: p.id,
        data: p.url, // signed url
        caption: p.caption ?? "",
        story: p.story ?? "",
        storagePath: p.storagePath,
      }));

    setData((prev) => ({ ...prev, photos: signedPhotos }));
  };

  // 💌 daily message
  const dailyMessage = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const day = Math.floor(diff / 86400000);
    return dailyMessages[day % dailyMessages.length];
  }, []);

  // ❤️ days counter (startDate = 2024-03-21)
  const daysTogether = useMemo(() => diffDays(data.startDate), [data.startDate]);

  // Intro
  if (!entered) {
    return (
      <>
        <audio ref={audioRef} src="/music/love.mp3" />
        <CinematicIntro herName="إيناس" onEnter={() => setEntered(true)} />
      </>
    );
  }

  // Gate
  if (!unlocked) {
    return (
      <>
        <audio ref={audioRef} src="/music/love.mp3" />
        <UnlockGate
          onSuccess={async (code) => {
            await fetchSignedPhotos(code);
            setUnlocked(true);
          }}
        />
      </>
    );
  }

  return (
    <div dir="rtl" className="relative select-none">
      <audio ref={audioRef} src="/music/love.mp3" />

      {/* privacy overlay if devtools detected */}
      {privacyMode && (
        <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-md flex items-center justify-center text-center px-6">
          <div className="glass p-6 rounded-2xl max-w-md">
            <p className="font-amiri text-xl text-white mb-2">الخصوصية أهم ❤️</p>
            <p className="font-cairo text-sm text-white/80">
              اقفلي نافذة الأدوات عشان يبان المحتوى.
            </p>
          </div>
        </div>
      )}

      {/* 🔊 mute */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-[260] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {muted ? "🔇 تشغيل" : "🔊 كتم"}
      </button>

      {/* watermark */}
      <div className="pointer-events-none fixed inset-0 z-[5] opacity-[0.08] flex items-center justify-center">
        <div className="rotate-[-22deg] text-6xl font-amiri text-white">
          إيناس × إبراهيم
        </div>
      </div>

      <HeartParticles />

      <ProgressNav currentScene={currentScene} totalScenes={5} onNavigate={navigateTo} />

      {/* 💌 daily message + days counter */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] glass px-6 py-4 rounded-2xl text-center max-w-md shadow-xl backdrop-blur-md">
        <p className="font-cairo text-sm md:text-base mb-2 text-pink-200">💌 رسالة اليوم:</p>
        <p className="font-amiri text-lg text-white leading-relaxed">{dailyMessage}</p>

        <p className="mt-3 font-cairo text-sm text-white/80">
          ❤️ صار لنا <span className="font-bold">{daysTogether}</span> يوم سوا
        </p>
      </div>

      {/* scenes */}
      <div ref={containerRef} className="snap-container">
        <div ref={setSceneRef(0)}>
          <Scene1 data={data} onNext={() => navigateTo(1)} />
        </div>
        <div ref={setSceneRef(1)}>
          <Scene2 data={data} />
        </div>
        <div ref={setSceneRef(2)}>
          <Scene3 data={data} />
        </div>
        <div ref={setSceneRef(3)}>
          <Scene4 data={data} />
        </div>
        <div ref={setSceneRef(4)}>
          <Scene5 data={data} />
        </div>
      </div>
    </div>
  );
};

export default Index;
