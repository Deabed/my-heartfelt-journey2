import { motion } from "framer-motion";
import { SiteData } from "@/lib/types";
import { useRef, useState } from "react";
import Lightbox from "./Lightbox";
import { supabase } from "@/lib/supabase";

interface Props {
  data: SiteData;
  editMode?: boolean; // ✅ يظهر أدوات التعديل فقط في وضع التعديل
  onChange?: (next: SiteData) => void; // ✅ لتحديث الواجهة بعد الرفع/الحذف/الكابشن
}

type PhotoItem = {
  id: string;
  data: string; // public url
  caption?: string;
  storagePath?: string;
};

const bucketName = "love-memories";

async function uploadToStorage(file: File, siteId: string) {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const fileName = `${crypto.randomUUID()}.${ext}`;
  const storagePath = `${siteId}/${fileName}`;

  const { error } = await supabase.storage.from(bucketName).upload(storagePath, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const publicUrl = supabase.storage.from(bucketName).getPublicUrl(storagePath).data.publicUrl;
  return { storagePath, publicUrl };
}

async function insertPhotoRow(siteId: string, storagePath: string, caption: string, position: number) {
  const { data, error } = await supabase
    .from("love_photos")
    .insert({ site_id: siteId, storage_path: storagePath, caption, position })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

async function updateCaption(photoId: string, caption: string) {
  const { error } = await supabase.from("love_photos").update({ caption }).eq("id", photoId);
  if (error) throw error;
}

async function deletePhotoRow(photoId: string) {
  const { error } = await supabase.from("love_photos").delete().eq("id", photoId);
  if (error) throw error;
}

async function deleteFromStorage(storagePath: string) {
  const { error } = await supabase.storage.from(bucketName).remove([storagePath]);
  if (error) throw error;
}

async function resequence(siteId: string, photos: PhotoItem[]) {
  for (let i = 0; i < photos.length; i++) {
    await supabase.from("love_photos").update({ position: i }).eq("id", photos[i].id).eq("site_id", siteId);
  }
}

const Scene3 = ({ data, editMode = false, onChange }: Props) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const rotations = [-3, 2, -1.5, 3, -2, 1.5, -2.5, 2.5];

  const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
  const photos = (data.photos ?? []) as unknown as PhotoItem[];

  const triggerPick = () => fileRef.current?.click();

  const handleUpload = async (files: FileList | null) => {
    if (!editMode) return;
    if (!onChange) return;
    if (!files || files.length === 0) return;
    if (!siteId) {
      alert("VITE_SITE_ID غير موجود في .env");
      return;
    }

    setBusy(true);
    try {
      const startPos = photos.length;
      const newPhotos: PhotoItem[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const { storagePath, publicUrl } = await uploadToStorage(file, siteId);
        const newId = await insertPhotoRow(siteId, storagePath, "", startPos + i);

        newPhotos.push({ id: newId, data: publicUrl, caption: "", storagePath });
      }

      const next: SiteData = { ...data, photos: [...(photos as any), ...newPhotos] as any };
      onChange(next);
      await resequence(siteId, [...photos, ...newPhotos]);
    } catch (e) {
      console.error(e);
      alert("حصل خطأ أثناء رفع الصور. تأكد من Bucket وسياسات Supabase.");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleCaption = async (photoId: string, caption: string) => {
    if (!editMode) return;
    if (!onChange) return;

    // update UI immediately
    const nextPhotos = photos.map((p) => (p.id === photoId ? { ...p, caption } : p));
    onChange({ ...data, photos: nextPhotos as any });

    // persist to DB
    try {
      await updateCaption(photoId, caption);
    } catch (e) {
      console.error(e);
      alert("تعذر حفظ الكابشن في قاعدة البيانات.");
    }
  };

  const handleDelete = async (photoId: string) => {
    if (!editMode) return;
    if (!onChange) return;
    if (!siteId) return;

    const target = photos.find((p) => p.id === photoId);
    if (!target) return;

    if (!confirm("متأكد تبغى تحذف الصورة؟")) return;

    setBusy(true);
    try {
      await deletePhotoRow(photoId);
      if (target.storagePath) await deleteFromStorage(target.storagePath);

      const remaining = photos.filter((p) => p.id !== photoId);
      onChange({ ...data, photos: remaining as any });
      await resequence(siteId, remaining);
    } catch (e) {
      console.error(e);
      alert("تعذر حذف الصورة.");
    } finally {
      setBusy(false);
    }
  };

  if (photos.length === 0) {
    return (
      <section className="snap-section relative flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep via-background to-wine" />
        <div className="relative z-20 text-center px-6">
          <motion.h2
            className="text-3xl md:text-5xl font-amiri font-bold mb-8"
            style={{ color: "hsl(340 20% 95%)" }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            ذكرياتنا 📸
          </motion.h2>

          {editMode ? (
            <div className="flex flex-col items-center gap-3">
              <p className="font-cairo text-lg" style={{ color: "hsl(350 50% 75%)" }}>
                ابدأ برفع أول صورة لكم ✨
              </p>

              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />

              <button
                onClick={triggerPick}
                disabled={busy}
                className="glass rounded-full px-5 py-2 font-cairo text-sm hover:scale-105 transition-transform disabled:opacity-60"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {busy ? "جاري الرفع..." : "➕ إضافة صور"}
              </button>
            </div>
          ) : (
            <p className="font-cairo text-lg" style={{ color: "hsl(350 50% 75%)" }}>
              افتح وضع التعديل لإضافة صوركم معًا ✨
            </p>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="snap-section relative flex flex-col items-center justify-center overflow-hidden py-16">
      <div className="absolute inset-0 bg-gradient-to-b from-deep via-background to-wine" />

      <div className="relative z-20 w-full max-w-5xl px-6">
        <motion.div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <motion.h2
            className="text-3xl md:text-5xl font-amiri font-bold text-center w-full"
            style={{ color: "hsl(340 20% 95%)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            ذكرياتنا 📸
          </motion.h2>

          {editMode && (
            <div className="w-full flex items-center justify-center gap-3">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <button
                onClick={triggerPick}
                disabled={busy}
                className="glass rounded-full px-5 py-2 font-cairo text-sm hover:scale-105 transition-transform disabled:opacity-60"
                style={{ color: "hsl(var(--foreground))" }}
              >
                {busy ? "جاري الرفع..." : "➕ إضافة صور"}
              </button>
            </div>
          )}
        </motion.div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8">
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              className="polaroid rounded-sm cursor-pointer relative"
              style={{ transform: `rotate(${rotations[i % rotations.length]}deg)` }}
              initial={{ opacity: 0, y: 40, rotate: rotations[i % rotations.length] * 2 }}
              whileInView={{ opacity: 1, y: 0, rotate: rotations[i % rotations.length] }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onClick={() => setLightboxIndex(i)}
              whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
            >
              <img
                src={photo.data}
                alt={photo.caption || "ذكرى"}
                className="w-40 h-40 md:w-52 md:h-52 object-cover"
                loading="lazy"
              />

              {/* أدوات التعديل — تظهر فقط في Edit Mode */}
              {editMode && (
                <div
                  className="absolute top-2 left-2 flex gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="glass rounded-full px-3 py-1 font-cairo text-xs hover:scale-105 transition-transform disabled:opacity-60"
                    style={{ color: "hsl(var(--foreground))" }}
                    disabled={busy}
                    onClick={() => handleDelete(photo.id)}
                    title="حذف"
                  >
                    🗑️
                  </button>
                </div>
              )}

              {/* Caption عرض */}
              {photo.caption && !editMode && (
                <p className="text-center mt-2 text-sm font-cairo" style={{ color: "hsl(340 30% 20%)" }}>
                  {photo.caption}
                </p>
              )}

              {/* Caption تعديل */}
              {editMode && (
                <div className="mt-2 px-2 pb-2" onClick={(e) => e.stopPropagation()}>
                  <input
                    value={photo.caption ?? ""}
                    onChange={(e) => handleCaption(photo.id, e.target.value)}
                    className="w-full rounded-lg px-2 py-1 font-cairo text-xs bg-white/70 text-black outline-none"
                    placeholder="اكتب كابشن…"
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          photos={data.photos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </section>
  );
};

export default Scene3;
