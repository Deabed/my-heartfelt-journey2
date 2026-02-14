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

  const [entered, setEntered] = useState(false);
  const [unlocked, setUnlocked] = useState(checkUnlocked);
  const [data, setData] = useState<SiteData>(defaultData);
  const [loading, setLoading] = useState(true);

  const saveTimer = useRef<number | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [currentScene, setCurrentScene] = useState(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRefs = useRef([] as (HTMLDivElement | null)[]);

  const navigateTo = (index: number) => {
    sceneRefs.current[index]?.scrollIntoView({ behavior: "smooth" });
  };

  const setSceneRef = (i: number) => (el: HTMLDivElement | null) => {
    sceneRefs.current[i] = el;
  };

  useEffect(() => {
    const load = async () => {
      const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
      if (!siteId) {
        setLoading(false);
        return;
      }

      const { data: site } = await supabase
        .from("love_sites")
        .select("*")
        .eq("id", siteId)
        .single();

      if (site) {
        setData({
          herName: site.her_name ?? defaultData.herName,
          myName: site.his_name ?? defaultData.myName,
          startDate: site.start_date ?? defaultData.startDate,
          heroSubtitle: site.hero_subtitle ?? defaultData.heroSubtitle,
          loveLetter: site.love_letter ?? defaultData.loveLetter,
          reasons: defaultData.reasons,
          surpriseMessage: site.surprise_text ?? defaultData.surpriseMessage,
          photos: [],
          language: "ar",
          musicEnabled: true,
        });
      }

      setLoading(false);
    };

    load();
  }, []);

  // 🎬 المقدمة تظهر كل مرة
  if (!entered) {
    return (
      <CinematicIntro
        herName={defaultData.herName || "إيناس"}
        onEnter={() => setEntered(true)}
      />
    );
  }

  if (!unlocked) {
    return <UnlockGate onUnlock={() => setUnlocked(true)} />;
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">جاري التحميل...</div>;
  }

  return (
    <div dir="rtl" className="relative">
      <HeartParticles />
      <ProgressNav currentScene={currentScene} totalScenes={5} onNavigate={navigateTo} />

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
