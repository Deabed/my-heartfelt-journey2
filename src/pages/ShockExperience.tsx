// src/pages/ShockExperience.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import CinematicIntro from "@/components/CinematicIntro";
import UnlockGate from "@/components/UnlockGate";
import HeartParticles from "@/components/HeartParticles";
import { dailyMessages } from "@/lib/dailyMessages";
import { supabase } from "@/lib/supabase";

import confetti from "canvas-confetti";

type Stage =
  | "calm"
  | "blackout"
  | "video"
  | "proposal"
  | "deep"
  | "night"
  | "gift"
  | "anniversary";

const checkUnlocked = (): boolean => {
  try {
    const raw = localStorage.getItem("love-unlock");
    if (!raw) return false;
    const { isUnlocked, expires } = JSON.parse(raw);
    if (isUnlocked && expires > Date.now()) return true;
    localStorage.removeItem("love-unlock");
    return false;
  } catch {
    return false;
  }
};

const setUnlockedCache = () => {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
  localStorage.setItem("love-unlock", JSON.stringify({ isUnlocked: true, expires }));
};

const RELATION_START = "2024-09-01T00:00:00+03:00"; // ✳️ عدّلها
const BLACKOUT_AFTER_MS = 25_000; // ✳️ متى تصير الصدمة تلقائياً (25 ثانية)

// 🎯 صفحة الذكرى (MM-DD)
const ANNIVERSARY_MM_DD = "02-14"; // ✳️ عدّلها لتاريخكم

const todayKey = (prefix: string) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${prefix}-${y}-${m}-${d}`;
};

const getMMDD = () => {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  return `${mm}-${dd}`;
};

function fireConfetti() {
  confetti({
    particleCount: 120,
    spread: 85,
    startVelocity: 35,
    origin: { y: 0.72 },
  });

  setTimeout(() => {
    confetti({
      particleCount: 80,
      spread: 110,
      startVelocity: 25,
      origin: { y: 0.75 },
    });
  }, 250);
}

export default function ShockExperience() {
  // 🎬 Intro
  const [entered, setEntered] = useState(false);

  // 🔐 Gate
  const [unlocked, setUnlocked] = useState<boolean>(checkUnlocked);

  // 🎭 Stages
  const [stage, setStage] = useState<Stage>("calm");

  // 🎵 Music (نفس مشروعك)
  const musicRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  // 🔊 FX audio
  const heartbeatRef = useRef<HTMLAudioElement | null>(null);
  const typingRef = useRef<HTMLAudioElement | null>(null);

  // 🎥 Video
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [failedAutoPlay, setFailedAutoPlay] = useState(false);

  // ⏱ Love timer tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const i = window.setInterval(() => setTick((x) => x + 1), 1000);
    return () => window.clearInterval(i);
  }, []);

  const startMs = useMemo(() => new Date(RELATION_START).getTime(), []);
  const diff = Math.max(0, Date.now() - startMs);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const mins = Math.floor((diff / (1000 * 60)) % 60);
  const secs = Math.floor((diff / 1000) % 60);

  // 💌 Daily message (نفس أسلوب Index)
  const dailyMessage = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const d = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(d / 86400000);
    return dailyMessages[dayOfYear % dailyMessages.length];
  }, []);

  // ✅ Autoplay music + click fallback
  useEffect(() => {
    const play = () => {
      const a = musicRef.current;
      if (!a) return;
      a.volume = 0.6;
      a.loop = true;
      a.play().catch(() => {});
    };

    play();
    window.addEventListener("click", play, { once: true });

    return () => window.removeEventListener("click", play);
  }, []);

  const toggleMute = () => {
    const a = musicRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  // ✅ Gate unlock via Edge Function (نفس Index)
  const handleGateSuccess = async (dateInput: string) => {
    const cleaned = (dateInput || "").trim();

    const { data: res, error } = await supabase.functions.invoke("unlock", {
      body: { date: cleaned },
    });

    if (error) {
      console.error("unlock error:", error);
      throw new Error("حصل خطأ في التحقق… جرّبي مرة ثانية.");
    }

    if (res?.success) {
      setUnlockedCache();
      setUnlocked(true);
      return;
    }

    throw new Error(res?.message || "التاريخ غير صحيح ❤️");
  };

  // ✅ Gift مرة واحدة يوميًا
  const giftKey = useMemo(() => todayKey("shock-gift-opened"), []);
  const [giftOpened, setGiftOpened] = useState<boolean>(() => localStorage.getItem(giftKey) === "1");

  const openGift = () => {
    if (giftOpened) return;
    localStorage.setItem(giftKey, "1");
    setGiftOpened(true);
    setStage("gift");
  };

  // ✅ Anniversary once per day (if date matches)
  const isAnniversary = useMemo(() => getMMDD() === ANNIVERSARY_MM_DD, []);
  const anniversaryKey = useMemo(() => todayKey("shock-anniversary-shown"), []);

  useEffect(() => {
    if (!unlocked) return;
    if (!isAnniversary) return;

    if (localStorage.getItem(anniversaryKey) === "1") return;

    localStorage.setItem(anniversaryKey, "1");
    setStage("anniversary");
  }, [unlocked, isAnniversary, anniversaryKey]);

  // ✅ Blackout مرة واحدة يوميًا (تلقائي بعد مدة) — يتعطل يوم الذكرى
  useEffect(() => {
    if (!unlocked) return;
    if (isAnniversary) return;

    const doneKey = todayKey("shock-blackout-done");
    if (localStorage.getItem(doneKey) === "1") return;

    const t = window.setTimeout(() => {
      localStorage.setItem(doneKey, "1");
      setStage("blackout");
    }, BLACKOUT_AFTER_MS);

    return () => window.clearTimeout(t);
  }, [unlocked, isAnniversary]);

  // ✅ Stage side effects
  useEffect(() => {
    const stopFX = () => {
      [heartbeatRef.current, typingRef.current].forEach((a) => {
        if (!a) return;
        a.pause();
        a.currentTime = 0;
      });
    };

    if (stage === "blackout") {
      stopFX();
      heartbeatRef.current?.play().catch(() => {});
      const t = window.setTimeout(() => setStage("video"), 10_000);
      return () => window.clearTimeout(t);
    }

    if (stage === "video") {
      stopFX();
      const v = videoRef.current;
      if (v) {
        v.currentTime = 0;
        v.play()
          .then(() => setFailedAutoPlay(false))
          .catch(() => setFailedAutoPlay(true));
      }
    }

    if (stage === "deep") {
      stopFX();
      typingRef.current?.play().catch(() => {});
      const t = window.setTimeout(() => setStage("night"), 12_000);
      return () => window.clearTimeout(t);
    }

    if (stage === "anniversary") {
      stopFX();
      heartbeatRef.current?.play().catch(() => {});
    }

    return () => {};
  }, [stage]);

  // ====== INTRO ======
  if (!entered) {
    return (
      <>
        <audio ref={musicRef} src="/music/love.mp3" />
        <CinematicIntro herName="إيناس" onEnter={() => setEntered(true)} />
      </>
    );
  }

  // ====== GATE ======
  if (!unlocked) {
    return (
      <>
        <audio ref={musicRef} src="/music/love.mp3" />
        <UnlockGate onSuccess={handleGateSuccess} />
      </>
    );
  }

  return (
    <div dir="rtl" className="relative min-h-screen">
      {/* base music */}
      <audio ref={musicRef} src="/music/love.mp3" />

      {/* FX */}
      <audio ref={heartbeatRef} src="/audio/heartbeat.mp3" preload="auto" />
      <audio ref={typingRef} src="/audio/typing.mp3" preload="auto" />

      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-[260] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {muted ? "🔇 تشغيل الصوت" : "🔊 كتم الصوت"}
      </button>

      <div className="film-grain" />
      <div className="vignette" />

      <HeartParticles />

      {/* محتوى هادي */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold font-cairo text-white">لنوسة 💖</h1>

        <div className="mt-5 glass rounded-2xl p-5">
          <p className="text-pink-200 font-cairo mb-2">💌 رسالة اليوم:</p>
          <p className="font-amiri text-xl text-white leading-relaxed">{dailyMessage}</p>
        </div>

        <div className="mt-6 glass rounded-2xl p-5">
          <p className="font-cairo text-white/80">⏳ أحبك منذ:</p>
          <p className="font-amiri text-2xl text-white mt-2">
            {days} يوم و {hours} ساعة و {mins} دقيقة و {secs} ثانية
          </p>
        </div>

        <div className="mt-10 flex gap-3 flex-wrap">
          <button
            onClick={openGift}
            disabled={giftOpened}
            className="glass rounded-2xl px-6 py-3 font-cairo hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ color: "hsl(var(--foreground))" }}
          >
            🎁 افتحي لو تثقين فيني
          </button>

          <button
            onClick={() => setStage("blackout")}
            className="glass rounded-2xl px-6 py-3 font-cairo hover:scale-105 transition-transform"
            style={{ color: "hsl(var(--foreground))" }}
            title="للاختبار فقط"
          >
            🖤 صدمة الآن (للاختبار)
          </button>
        </div>

        {giftOpened && <p className="mt-3 text-sm opacity-70 font-cairo text-white/70">تم فتح مفاجأة اليوم ✅</p>}
      </div>

      {/* ====== Overlays ====== */}
      {stage === "blackout" && (
        <Overlay title="استني… عندي شي لازم أقوله لك" body="أنا ما أقدر أتخيل حياتي بدونك." hint="..." onClose={() => {}} />
      )}

      {stage === "video" && (
        <div className="fixed inset-0 z-[500] bg-black text-white flex items-center justify-center">
          <div className="w-full max-w-3xl px-4">
            <div className="flex items-center justify-between mb-3">
              <p className="opacity-80 font-cairo">نوسة… اسمعيني 🤍</p>
              <button onClick={() => setStage("proposal")} className="text-sm opacity-80 hover:opacity-100 font-cairo">
                تخطي
              </button>
            </div>

            <video
              ref={videoRef}
              src="/video/nosa.mp4"
              className="w-full rounded-2xl shadow"
              controls={failedAutoPlay}
              onEnded={() => setStage("proposal")}
            />

            {failedAutoPlay && <p className="mt-3 text-sm opacity-70 font-cairo">إذا ما اشتغل تلقائيًا، اضغطي تشغيل.</p>}
          </div>
        </div>
      )}

      {stage === "proposal" && (
        <ProposalOverlay
          onYes={() => {
            fireConfetti();
            setStage("deep");
          }}
          onNo={() => {}}
        />
      )}

      {stage === "deep" && <TypeOverlay lines={["أنا ما كنت أدور حب…", "كنت أدور وطن…", "ولقيتك."]} />}

      {stage === "night" && (
        <Overlay
          title="🤍"
          body="خلاص… من هنا كل شي صار أهدى… بس أعمق."
          hint="اضغطي أي مكان"
          onClose={() => setStage("calm")}
        />
      )}

      {stage === "gift" && (
        <Overlay
          title="🎁 مفاجأة اليوم"
          body="أنا أحبك… وبكل يوم أقتنع أكثر إنك أجمل اختيار."
          hint="اضغطي أي مكان"
          onClose={() => setStage("calm")}
        />
      )}

      {stage === "anniversary" && (
        <Overlay
          title="اليوم مو يوم عادي… 🤍"
          body="إذا وصلتي لهنا… فهذا وعد مني: إني أكمل معاك للأبد. نوسة إنتِ أجمل قرار بحياتي."
          hint="اضغطي أي مكان"
          onClose={() => setStage("night")}
        />
      )}
    </div>
  );
}

function Overlay({
  title,
  body,
  hint,
  onClose,
}: {
  title: string;
  body: string;
  hint?: string;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[600] bg-black/95 text-white flex items-center justify-center px-6"
      onClick={onClose}
      role="button"
      tabIndex={0}
    >
      <div className="max-w-xl w-full text-center">
        <h2 className="text-2xl font-bold font-cairo">{title}</h2>
        <p className="mt-5 text-lg opacity-90 leading-relaxed font-amiri">{body}</p>
        {hint && <p className="mt-8 opacity-60 text-sm font-cairo">{hint}</p>}
      </div>
    </div>
  );
}

function ProposalOverlay({ onYes, onNo }: { onYes: () => void; onNo: () => void }) {
  const [noClicked, setNoClicked] = useState(false);

  return (
    <div className="fixed inset-0 z-[600] bg-white text-slate-900 flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center">
        <div className="text-5xl">💍</div>
        <h2 className="text-2xl font-bold mt-4 font-cairo">هل تقبلين تكوني معي للأبد؟</h2>

        <div className="mt-8 flex items-center justify-center gap-3">
          <button onClick={onYes} className="px-6 py-3 rounded-2xl bg-pink-600 text-white shadow hover:opacity-95 font-cairo">
            نعم 💖
          </button>

          <button
            onClick={() => {
              setNoClicked(true);
              onNo();
            }}
            className="px-6 py-3 rounded-2xl bg-slate-200 shadow hover:bg-slate-300 font-cairo"
          >
            لا 😒
          </button>
        </div>

        {noClicked && <p className="mt-6 text-lg font-cairo">غلط 😑 جربي مرة ثانية</p>}
      </div>
    </div>
  );
}

function TypeOverlay({ lines }: { lines: string[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setI((x) => Math.min(lines.length, x + 1)), 1800);
    return () => window.clearInterval(t);
  }, [lines.length]);

  return (
    <div className="fixed inset-0 z-[600] bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-xl w-full text-center">
        <div className="text-2xl font-bold leading-relaxed font-amiri">
          {lines.slice(0, i).map((l, idx) => (
            <p key={idx} className="mt-3">
              {l}
            </p>
          ))}
        </div>
        <p className="mt-10 opacity-50 text-sm font-cairo">...</p>
      </div>
    </div>
  );
}
