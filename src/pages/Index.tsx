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

const Index = () => {
  // 🎬 Intro يظهر كل مرة (في نفس الزيارة)
  const [entered, setEntered] = useState(false);

  // 🔐 Gate
  const [unlocked, setUnlocked] = useState(checkUnlocked);

  // 📦 Data
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);

  // ✏️ Edit
  const saveTimer = useRef<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // 🧭 Scenes nav
  const [currentScene, setCurrentScene] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigateTo = (index: number) => {
    sceneRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const setSceneRef = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el;
  };

  // 🎵 Music (عنصر واحد فقط)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [muted, setMuted] = useState(false);

  // ✅ تشغيل الصوت + fallback عند أول click
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;

    a.volume = 0.6;
    a.loop = true;

    const tryPlay = () => a.play().catch(() => {});
    tryPlay();

    const resumeOnClick = () => {
      a.play().catch(() => {});
      document.removeEventListener("click", resumeOnClick);
    };

    document.addEventListener("click", resumeOnClick);
    return () => document.removeEventListener("click", resumeOnClick);
  }, []);

  const toggleMute = () => {
    const a = audioRef.current;
    if (!a) return;
    a.muted = !a.muted;
    setMuted(a.muted);
  };

  // ✅ مراقبة المشاهد (يشتغل فقط بعد فتح القفل)
  useEffect(() => {
    if (!entered || !unlocked) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sceneRefs.current.indexOf(entry.target as HTMLDivElement);
            if (idx !== -1) setCurrentScene(idx);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    sceneRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, [entered, unlocked]);

  // ✅ تحميل البيانات من Supabase (بعد فتح القفل فقط)
  useEffect(() => {
    if (!entered || !unlocked) return;

    const load = async () => {
      setLoading(true);

      const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
      if (!siteId) {
        console.error("VITE_SITE_ID is missing in .env");
        setLoading(false);
        return;
      }

      const { data: site, error: siteErr } = await supabase
        .from("love_sites")
        .select("*")
        .eq("id", siteId)
        .single();

      const { data: reasons, error: reasonsErr } = await supabase
        .from("love_reasons")
        .select("*")
        .eq("site_id", siteId)
        .order("position", { ascending: true });

      const { data: photos, error: photosErr } = await supabase
        .from("love_photos")
        .select("*")
        .eq("site_id", siteId)
        .order("position", { ascending: true });

      if (siteErr) console.error("love_sites error:", siteErr);
      if (reasonsErr) console.error("love_reasons error:", reasonsErr);
      if (photosErr) console.error("love_photos error:", photosErr);

      if (site) {
        const mapped: SiteData = {
          herName: site.her_name ?? defaultData.herName,
          myName: site.his_name ?? defaultData.myName,
          startDate: site.start_date ?? defaultData.startDate,
          heroSubtitle: site.hero_subtitle ?? defaultData.heroSubtitle,
          loveLetter: site.love_letter ?? defaultData.loveLetter,
          reasons: (reasons ?? []).map((r: any) => r.reason) ?? defaultData.reasons,
          surpriseMessage: site.surprise_text ?? defaultData.surpriseMessage,
          photos: (photos ?? []).map((p: any) => {
            const publicUrl = supabase.storage
              .from("love-memories")
              .getPublicUrl(p.storage_path).data.publicUrl;

            return {
              id: p.id,
              data: publicUrl,
              caption: p.caption ?? "",
              story: p.story ?? "", 
              storagePath: p.storage_path,
            } as any;
          }),
          language: site.language === "en" ? "en" : "ar",
          musicEnabled: !!site.music_enabled,
        };

        setData(mapped);
      } else {
        setData(defaultData);
      }

      setLoading(false);
    };

    load();
  }, [entered, unlocked]);

  // ✅ حفظ التعديلات (Debounce)
  const saveToDb = (next: SiteData) => {
    const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
    if (!siteId) return;

    if (saveTimer.current) window.clearTimeout(saveTimer.current);

    saveTimer.current = window.setTimeout(async () => {
      try {
        const { error: updErr } = await supabase
          .from("love_sites")
          .update({
            her_name: next.herName,
            his_name: next.myName,
            start_date: next.startDate,
            hero_subtitle: next.heroSubtitle,
            love_letter: next.loveLetter,
            surprise_text: next.surpriseMessage,
            language: next.language,
            music_enabled: next.musicEnabled,
          })
          .eq("id", siteId);

        if (updErr) console.error("Update love_sites error:", updErr);

        const { error: delErr } = await supabase.from("love_reasons").delete().eq("site_id", siteId);
        if (delErr) console.error("Delete love_reasons error:", delErr);

        if (next.reasons?.length) {
          const { error: insErr } = await supabase.from("love_reasons").insert(
            next.reasons.map((reason, i) => ({
              site_id: siteId,
              reason,
              position: i,
            }))
          );
          if (insErr) console.error("Insert love_reasons error:", insErr);
        }
      } catch (e) {
        console.error("Failed to save", e);
      }
    }, 600);
  };

  const handleLock = () => {
    localStorage.removeItem("love-unlock");
    setUnlocked(false);
    setEditOpen(false);
    setEntered(false); // يرجع Intro ثم Gate
  };

  // 💌 رسالة اليوم
  const dailyMessage = useMemo(() => {
    const today = new Date();

    // يوم تعارفكم 21/03
    if (today.getDate() === 21 && today.getMonth() === 2) {
      return "اليوم يومنا يا فلاولة ❤️ يوم اخترتك وقلبي قال خلاص دي هي… والله لو الزمن رجع ألف مرة باختارك تاني.";
    }

    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / 86400000);
    return dailyMessages[dayOfYear % dailyMessages.length];
  }, []);

  const dailyPhoto = useMemo(() => {
    if (!data.photos?.length) return null;
    const idx = Math.floor(Math.random() * data.photos.length);
    return data.photos[idx];
  }, [data.photos]);

  return (
    <div dir="rtl" className="relative">
      {/* ✅ Audio واحد فقط ويستمر */}
      <audio ref={audioRef} src="/music/love.mp3" />

      {/* 🔊 زر الصوت يظهر دائمًا */}
      <button
        onClick={toggleMute}
        className="fixed top-4 right-4 z-[999] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
        style={{ color: "hsl(var(--foreground))" }}
      >
        {muted ? "🔇 تشغيل الصوت" : "🔊 كتم الصوت"}
      </button>

      {/* 1) Intro */}
      {!entered && <CinematicIntro herName="إيناس" onEnter={() => setEntered(true)} />}

      {/* 2) Gate (لا يفتح شيء غيره لو ما دخل التاريخ) */}
      {entered && !unlocked && <UnlockGate onUnlock={() => setUnlocked(true)} />}

      {/* 3) Loading */}
      {entered && unlocked && loading && (
        <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
          <div className="glass rounded-2xl px-6 py-4 font-cairo" style={{ color: "hsl(340 20% 95%)" }}>
            جاري تحميل الموقع...
          </div>
        </div>
      )}

      {/* 4) الموقع */}
      {entered && unlocked && !loading && (
        <>
          {/* Cinematic overlays */}
          <div className="film-grain" />
          <div className="vignette" />

          {/* Heart particles */}
          <HeartParticles />

          {/* Progress Nav */}
          <ProgressNav currentScene={currentScene} totalScenes={5} onNavigate={navigateTo} />

          {/* 💌 رسالة اليوم + صورة */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[300] glass px-6 py-4 rounded-2xl text-center max-w-md shadow-xl backdrop-blur-md">
            <p className="font-cairo text-sm md:text-base mb-2 text-pink-200">💌 رسالة اليوم:</p>
            <p className="font-amiri text-lg text-white leading-relaxed">{dailyMessage}</p>

            {dailyPhoto && (
              <img
                src={dailyPhoto.data}
                alt={dailyPhoto.caption || "ذكرى"}
                className="mt-3 w-32 h-32 object-cover rounded-xl mx-auto border border-pink-400"
                loading="lazy"
              />
            )}
          </div>

          {/* Edit button */}
          <button
            onClick={() => setEditOpen(true)}
            className="fixed top-4 left-4 z-[250] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
            style={{ color: "hsl(var(--foreground))" }}
          >
            ✏️ تعديل
          </button>

          {/* Lock button */}
          <button
            onClick={handleLock}
            className="fixed top-4 left-28 z-[250] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
            style={{ color: "hsl(var(--foreground))" }}
          >
            🔒 قفل
          </button>

          {/* Edit Panel */}
          <EditPanel
            data={data}
            onChange={(next) => {
              setData(next);
              saveToDb(next);
            }}
            open={editOpen}
            onClose={() => setEditOpen(false)}
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
              <Scene3 data={data} editMode={editOpen} onChange={(next) => setData(next)} />
            </div>

            <div ref={setSceneRef(3)}>
              <Scene4 data={data} />
            </div>

            <div ref={setSceneRef(4)}>
              <Scene5 data={data} />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Index;
