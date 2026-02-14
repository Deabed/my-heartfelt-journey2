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
  // 🎬 Intro
  const [entered, setEntered] = useState(false);

  // 🔐 Gate
  const [unlocked, setUnlocked] = useState(false);

  // 📦 Data
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);

  // ✏️ Edit
  const [editOpen, setEditOpen] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // 🧭 Scenes
  const [currentScene, setCurrentScene] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigateTo = (index: number) => {
    sceneRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const setSceneRef = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el;
  };

  // 🎵 Music
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

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

  // 🔐 Unlock via Edge Function
  const handleUnlock = async (dateInput: string): Promise<boolean> => {
    const { data, error } = await supabase.functions.invoke("unlock", {
      body: { date: dateInput.trim() },
    });

    if (error) {
      console.error(error);
      return false;
    }

    if (data?.success) {
      setUnlocked(true);
      return true;
    }

    return false;
  };

  // 📥 Load from Supabase after unlock
  useEffect(() => {
    if (!unlocked) return;

    const load = async () => {
      const siteId = import.meta.env.VITE_SITE_ID as string;

      const { data: site } = await supabase
        .from("love_sites")
        .select("*")
        .eq("id", siteId)
        .single();

      const { data: reasons } = await supabase
        .from("love_reasons")
        .select("*")
        .eq("site_id", siteId)
        .order("position", { ascending: true });

      const { data: photos } = await supabase
        .from("love_photos")
        .select("*")
        .eq("site_id", siteId)
        .order("position", { ascending: true });

      if (site) {
        setData({
          herName: site.her_name ?? defaultData.herName,
          myName: site.his_name ?? defaultData.myName,
          startDate: site.start_date ?? defaultData.startDate,
          heroSubtitle: site.hero_subtitle ?? "",
          loveLetter: site.love_letter ?? "",
          reasons: (reasons ?? []).map((r: any) => r.reason),
          surpriseMessage: site.surprise_text ?? "",
          photos: (photos ?? []).map((p: any) => ({
            id: p.id,
            data: supabase.storage
              .from("love-memories")
              .getPublicUrl(p.storage_path).data.publicUrl,
            caption: p.caption ?? "",
            storagePath: p.storage_path,
          })),
          language: "ar",
          musicEnabled: true,
        });
      }

      setLoading(false);
    };

    load();
  }, [unlocked]);

  // 💾 Save debounce
  const saveToDb = (next: SiteData) => {
    const siteId = import.meta.env.VITE_SITE_ID as string;
    if (!siteId) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(async () => {
      await supabase.from("love_sites").update({
        her_name: next.herName,
        his_name: next.myName,
        start_date: next.startDate,
        hero_subtitle: next.heroSubtitle,
        love_letter: next.loveLetter,
        surprise_text: next.surpriseMessage,
      }).eq("id", siteId);
    }, 600);
  };

  // 💌 Daily Message
  const dailyMessage = useMemo(() => {
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    return dailyMessages[dayOfYear % dailyMessages.length];
  }, []);

  const dailyPhoto = useMemo(() => {
    if (!data.photos.length) return null;
    return data.photos[Math.floor(Math.random() * data.photos.length)];
  }, [data.photos]);

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

  return (
    <div dir="rtl" className="relative">
      <audio ref={audioRef} src="/music/love.mp3" />

      {/* 🔊 Mute */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-50 glass px-4 py-2 rounded-full"
      >
        {muted ? "🔇" : "🔊"}
      </button>

      <HeartParticles />

      {/* 💌 رسالة اليوم */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-4 rounded-2xl text-center max-w-md">
        <p className="text-pink-200">💌 رسالة اليوم:</p>
        <p className="text-white">{dailyMessage}</p>
        {dailyPhoto && (
          <img
            src={dailyPhoto.data}
            className="mt-3 w-32 h-32 object-cover rounded-xl mx-auto"
          />
        )}
      </div>

      {/* ✏️ تعديل */}
      <button
        onClick={() => setEditOpen(true)}
        className="fixed top-4 left-4 z-50 glass px-4 py-2 rounded-full"
      >
        ✏️
      </button>

      <EditPanel
        data={data}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onChange={(next) => {
          setData(next);
          saveToDb(next);
        }}
      />

      {/* Scenes */}
      <div ref={containerRef} className="snap-container">
        <div ref={setSceneRef(0)}>
          <Scene1 data={data} onNext={() => navigateTo(1)} />
        </div>
        <div ref={setSceneRef(1)}>
          <Scene2 data={data} />
        </div>
        <div ref={setSceneRef(2)}>
          <Scene3 data={data} editMode={editOpen} onChange={setData} />
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
