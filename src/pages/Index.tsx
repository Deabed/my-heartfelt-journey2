import { useRef, useState, useEffect, useMemo } from "react";
import { SiteData, defaultData } from "@/lib/types";
import { supabase } from "@/lib/supabase";

import CinematicIntro from "@/components/CinematicIntro";
import HeartParticles from "@/components/HeartParticles";
import ProgressNav from "@/components/ProgressNav";
import EditPanel from "@/components/EditPanel";
import Scene1 from "@/components/Scene1";
import Scene2 from "@/components/Scene2";
import Scene3 from "@/components/Scene3";
import Scene4 from "@/components/Scene4";
import Scene5 from "@/components/Scene5";
import UnlockGate from "@/components/UnlockGate";

import { dailyMessages } from "@/lib/dailyMessages";

const Index = () => {
  const [entered, setEntered] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);
  const [surpriseMode, setSurpriseMode] = useState(false);
  const [memoriesUnlocked, setMemoriesUnlocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  const navigateTo = (index: number) => {
    sceneRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const setSceneRef = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el;
  };

  // 🎵 تشغيل الموسيقى
  useEffect(() => {
    const playAudio = () => {
      const a = audioRef.current;
      if (!a) return;
      a.volume = 0.6;
      a.loop = true;
      a.play().catch(() => {});
    };

    playAudio();
    window.addEventListener("click", playAudio, { once: true });

    return () => {
      window.removeEventListener("click", playAudio);
    };
  }, []);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  // 🔐 فتح الموقع عبر Edge Function
  const handleUnlock = async (dateInput: string) => {
    const { data, error } = await supabase.functions.invoke("unlock", {
      body: { date: dateInput },
    });

    if (!error && data?.success) {
      setUnlocked(true);
    } else {
      alert("التاريخ غير صحيح ❤️");
    }
  };

  // ⏳ تحميل البيانات بعد الفتح
  useEffect(() => {
    if (!unlocked) return;

    const load = async () => {
      const siteId = import.meta.env.VITE_SITE_ID as string;
      const { data: site } = await supabase
        .from("love_sites")
        .select("*")
        .eq("id", siteId)
        .single();

      if (site) {
        setData({
          ...defaultData,
          herName: site.her_name,
          myName: site.his_name,
          startDate: site.start_date,
        });
      }

      setLoading(false);
    };

    load();
  }, [unlocked]);

  // 💘 عداد الأيام
  const daysTogether = useMemo(() => {
    const start = new Date(data.startDate);
    const today = new Date();
    const diff = today.getTime() - start.getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }, [data.startDate]);

  // 💌 رسالة اليوم
  const dailyMessage = useMemo(() => {
    const today = new Date();
    if (today.getDate() === 21 && today.getMonth() === 2) {
      return "اليوم يومنا يا فلاولة ❤️ يوم اخترتك وقلبي قال خلاص دي هي.";
    }
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    return dailyMessages[dayOfYear % dailyMessages.length];
  }, []);

  // 🎨 ستايل خاص 21/03
  const isSpecialDay = useMemo(() => {
    const today = new Date();
    return today.getDate() === 21 && today.getMonth() === 2;
  }, []);

  // 🎬 Intro
  if (!entered) {
    return (
      <>
        <audio ref={audioRef} src="/music/love.mp3" />
        <CinematicIntro herName="إيناس" onEnter={() => setEntered(true)} />
      </>
    );
  }

  // 🔐 Gate
  if (!unlocked) {
    return (
      <>
        <audio ref={audioRef} src="/music/love.mp3" />
        <UnlockGate onUnlock={handleUnlock} />
      </>
    );
  }

  if (loading) return <div className="h-screen bg-black" />;

  // 🎉 Surprise Mode
  if (surpriseMode) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center text-center">
        <div>
          <h1 className="text-4xl text-white mb-6">
            لو رجع الزمن ألف مرة…
          </h1>
          <p className="text-pink-400 text-2xl">
            أختارك إنتِ يا فلاولة ❤️
          </p>
          <button
            onClick={() => setSurpriseMode(false)}
            className="mt-10 px-6 py-2 bg-pink-600 rounded-full"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      dir="rtl"
      className={`relative ${
        isSpecialDay
          ? "bg-gradient-to-b from-pink-900 via-red-900 to-black"
          : ""
      }`}
    >
      <audio ref={audioRef} src="/music/love.mp3" />

      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 glass px-4 py-2 rounded-full"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      <HeartParticles />

      <div className="fixed bottom-40 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl text-center">
        <p className="text-pink-200">مرّ على حبنا</p>
        <p className="text-white text-2xl">{daysTogether} يوم ❤️</p>
      </div>

      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-2xl text-center max-w-md">
        <p className="text-pink-200">💌 رسالة اليوم:</p>
        <p className="text-white">{dailyMessage}</p>
      </div>

      <button
        onClick={() => setSurpriseMode(true)}
        className="fixed bottom-4 right-4 opacity-20 hover:opacity-100"
      >
        ✨
      </button>

      <div ref={containerRef} className="snap-container">
        <div ref={setSceneRef(0)}>
          <Scene1 data={data} onNext={() => navigateTo(1)} />
        </div>

        <div ref={setSceneRef(1)}>
          <Scene2 data={data} />
        </div>

        <div ref={setSceneRef(2)}>
          {memoriesUnlocked ? (
            <Scene3 data={data} />
          ) : (
            <div className="h-screen flex items-center justify-center">
              <button
                onClick={() => {
                  const pass = prompt("اكتبي كلمة السر للذكريات");
                  if (pass === "flawla") {
                    setMemoriesUnlocked(true);
                  }
                }}
                className="glass px-6 py-3 rounded-full"
              >
                فتح الذكريات 🔐
              </button>
            </div>
          )}
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
