import { useRef, useState, useEffect } from "react";
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
  // ✅ Cinematic intro only once
  const [introDone, setIntroDone] = useState(() => {
    return localStorage.getItem("love-intro-done") === "1";
  });

  const [unlocked, setUnlocked] = useState(checkUnlocked);
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);

  const saveTimer = useRef<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);

  const navigateTo = (index: number) => {
    sceneRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const setSceneRef = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el;
  };

  // ✅ 1) Scene observer
  useEffect(() => {
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
  }, []);

  // ✅ 2) Load from Supabase
  useEffect(() => {
    const load = async () => {
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
  }, []);

  // ✅ Save to DB with debounce
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

        const { error: delErr } = await supabase
          .from("love_reasons")
          .delete()
          .eq("site_id", siteId);
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
  };

  // ✅ 0) Cinematic intro first (only once)
  if (!introDone) {
    return (
      <CinematicIntro
        herName={defaultData.herName || "إيناس"}
        onEnter={() => {
          localStorage.setItem("love-intro-done", "1");
          setIntroDone(true);
        }}
      />
    );
  }

  // ✅ 1) Gate (date unlock)
  if (!unlocked) {
    return <UnlockGate onUnlock={() => setUnlocked(true)} />;
  }

  // ✅ 2) Loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(var(--background))" }}>
        <div className="glass rounded-2xl px-6 py-4 font-cairo" style={{ color: "hsl(340 20% 95%)" }}>
          جاري تحميل الموقع...
        </div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="relative">
      <div className="film-grain" />
      <div className="vignette" />

      <HeartParticles />

      <ProgressNav currentScene={currentScene} totalScenes={5} onNavigate={navigateTo} />

      <button
        onClick={() => setEditOpen(true)}
        className="fixed top-4 left-4 z-[250] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
        style={{ color: "hsl(var(--foreground))" }}
      >
        ✏️ تعديل
      </button>

      <button
        onClick={handleLock}
        className="fixed top-4 left-28 z-[250] glass rounded-full px-4 py-2 font-cairo text-sm cursor-pointer hover:scale-105 transition-transform"
        style={{ color: "hsl(var(--foreground))" }}
      >
        🔒 قفل
      </button>

      <EditPanel
        data={data}
        onChange={(next) => {
          setData(next);
          saveToDb(next);
        }}
        open={editOpen}
        onClose={() => setEditOpen(false)}
      />

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
    </div>
  );
};

export default Index;
