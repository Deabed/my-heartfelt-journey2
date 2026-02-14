export interface SiteData {
  herName: string;
  myName: string;
  startDate: string;
  heroSubtitle: string;
  loveLetter: string;
  reasons: string[];
  surpriseMessage: string;
  photos: PhotoItem[];
  language: "ar" | "en";
  musicEnabled: boolean;
}

export interface PhotoItem {
  id: string;
  data: string; // public URL
  caption: string;
  story?: string; // ✅ قصة الصورة (اختياري)
  storagePath?: string; // Supabase Storage path
}

export const defaultData: SiteData = {
  herName: "حبيبتي",
  myName: "حبيبك",
  startDate: "2024-03-21",
  heroSubtitle: "قصة بدأت… وغيرت كل شيء",
  loveLetter: "",
  reasons: [
    "لأن ضحكتك تضيء عالمي",
    "لأنك تفهمينني بدون كلام",
    "لأن قلبك أجمل قلب عرفته",
    "لأنك تجعلين كل يوم أجمل",
    "لأنني أحبك أكثر كل يوم",
  ],
  surpriseMessage: "إنتِ أجمل قرار في حياتي… وكل سنة وإنتِ حبّي.",
  photos: [],
  language: "ar",
  musicEnabled: false,
};
