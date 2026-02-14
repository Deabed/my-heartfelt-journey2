import { SiteData, PhotoItem } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  data: SiteData;
  onChange: (data: SiteData) => void;
  open: boolean;
  onClose: () => void;
}

const EditPanel = ({ data, onChange, open, onClose }: Props) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newReason, setNewReason] = useState('');

  const update = (partial: Partial<SiteData>) => onChange({ ...data, ...partial });

  
  const compressToJpeg = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error("Invalid image"));
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxSize = 1200;
          let w = img.width;
          let h = img.height;

          if (w > maxSize || h > maxSize) {
            if (w > h) {
              h = (h / w) * maxSize;
              w = maxSize;
            } else {
              w = (w / h) * maxSize;
              h = maxSize;
            }
          }

          canvas.width = Math.round(w);
          canvas.height = Math.round(h);
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject(new Error("Canvas not supported"));
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          canvas.toBlob(
            (blob) => {
              if (!blob) return reject(new Error("Failed to compress image"));
              resolve(blob);
            },
            "image/jpeg",
            0.82
          );
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
    if (!siteId) {
      alert("VITE_SITE_ID غير موجود في ملف .env");
      return;
    }

    try {
      for (const file of Array.from(files)) {
        const compressedBlob = await compressToJpeg(file);
        const ext = "jpg";
        const filename = `${crypto.randomUUID()}.${ext}`;
        const storagePath = `${siteId}/${filename}`;

        const uploadRes = await supabase.storage.from("love-memories").upload(storagePath, compressedBlob, {
          contentType: "image/jpeg",
          upsert: false,
        });

        if (uploadRes.error) throw uploadRes.error;

        // insert metadata
        const position = data.photos.length; // append at end
        const { data: inserted, error: insErr } = await supabase
          .from("love_photos")
          .insert({ site_id: siteId, storage_path: storagePath, caption: "", position })
          .select("id, storage_path, caption")
          .single();

        if (insErr) throw insErr;

        const publicUrl = supabase.storage.from("love-memories").getPublicUrl(storagePath).data.publicUrl;

        const newPhoto: PhotoItem = {
          id: inserted.id,
          data: publicUrl,
          caption: inserted.caption ?? "",
          storagePath: inserted.storage_path,
        };

        onChange({ ...data, photos: [...data.photos, newPhoto] });
      }
    } catch (err: any) {
      console.error(err);
      alert("صار خطأ أثناء رفع الصور. جرّب مرة ثانية.");
    } finally {
      e.target.value = "";
    }
  };


  
  const removePhoto = async (id: string) => {
    const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
    const photo = data.photos.find(p => p.id === id);

    // Update UI immediately
    update({ photos: data.photos.filter(p => p.id !== id) });

    if (!siteId || !photo?.storagePath) return;

    try {
      await supabase.from("love_photos").delete().eq("id", id).eq("site_id", siteId);
      await supabase.storage.from("love-memories").remove([photo.storagePath]);
    } catch (err) {
      console.error(err);
    }
  };


  
  const updateCaption = (id: string, caption: string) => {
    update({ photos: data.photos.map(p => p.id === id ? { ...p, caption } : p) });

    const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
    if (!siteId) return;

    // fire and forget
    supabase.from("love_photos").update({ caption }).eq("id", id).eq("site_id", siteId).then(({ error }) => {
      if (error) console.error(error);
    });
  };


  const addReason = () => {
    if (newReason.trim()) {
      update({ reasons: [...data.reasons, newReason.trim()] });
      setNewReason('');
    }
  };

  const removeReason = (i: number) => {
    update({ reasons: data.reasons.filter((_, idx) => idx !== i) });
  };

  
  const resetAll = async () => {
    if (!confirm('هل أنت متأكد من إعادة التعيين؟ ستفقد كل التعديلات.')) return;

    const siteId = import.meta.env.VITE_SITE_ID as string | undefined;
    if (!siteId) return;

    try {
      // delete photos rows + files
      const { data: photosRows } = await supabase.from("love_photos").select("storage_path").eq("site_id", siteId);
      if (photosRows?.length) {
        await supabase.storage.from("love-memories").remove(photosRows.map((p: any) => p.storage_path));
      }
      await supabase.from("love_photos").delete().eq("site_id", siteId);
      await supabase.from("love_reasons").delete().eq("site_id", siteId);

      await supabase.from("love_sites").update({
        her_name: 'حبيبتي',
        his_name: 'حبيبك',
        start_date: '2024-03-21',
        hero_subtitle: 'قصة بدأت… وغيرت كل شيء',
        love_letter: '',
        surprise_text: 'إنتِ أجمل قرار في حياتي… وكل سنة وإنتِ حبّي.',
        language: 'ar',
        music_enabled: false
      }).eq("id", siteId);

      onChange({
        ...data,
        herName: 'حبيبتي',
        myName: 'حبيبك',
        startDate: '2024-03-21',
        heroSubtitle: 'قصة بدأت… وغيرت كل شيء',
        loveLetter: '',
        reasons: [],
        surpriseMessage: 'إنتِ أجمل قرار في حياتي… وكل سنة وإنتِ حبّي.',
        photos: [],
        language: 'ar',
        musicEnabled: false,
      });

      window.location.reload();
    } catch (err) {
      console.error(err);
      alert('حصل خطأ أثناء إعادة التعيين.');
    }
  };


  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-[300]"
            style={{ background: 'hsl(0 0% 0% / 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 left-0 bottom-0 w-[90vw] max-w-[400px] z-[301] glass-strong overflow-y-auto"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-6 font-cairo space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold" style={{ color: 'hsl(340 20% 95%)' }}>✏️ وضع التعديل</h2>
                <button onClick={onClose} className="text-2xl cursor-pointer" style={{ color: 'hsl(340 20% 95%)' }}>✕</button>
              </div>

              {/* Her name */}
              <Field label="اسمها">
                <input
                  value={data.herName}
                  onChange={e => update({ herName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground"
                />
              </Field>

              {/* My name */}
              <Field label="اسمك">
                <input
                  value={data.myName}
                  onChange={e => update({ myName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground"
                />
              </Field>

              {/* Start date */}
              <Field label="تاريخ بداية العلاقة">
                <input
                  type="date"
                  value={data.startDate}
                  onChange={e => update({ startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground"
                />
              </Field>

              {/* Hero subtitle */}
              <Field label="الجملة الافتتاحية">
                <textarea
                  value={data.heroSubtitle}
                  onChange={e => update({ heroSubtitle: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground resize-none"
                />
              </Field>

              {/* Surprise message */}
              <Field label="رسالة المفاجأة">
                <textarea
                  value={data.surpriseMessage}
                  onChange={e => update({ surpriseMessage: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground resize-none"
                />
              </Field>

              {/* Love letter */}
              <Field label="رسالة حب إضافية (اختياري)">
                <textarea
                  value={data.loveLetter}
                  onChange={e => update({ loveLetter: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground resize-none"
                  placeholder="اكتب رسالة حب..."
                />
              </Field>

              {/* Reasons */}
              <Field label="أسباب حبك">
                <div className="space-y-2 mb-2">
                  {data.reasons.map((r, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="flex-1 text-sm" style={{ color: 'hsl(340 20% 95%)' }}>{r}</span>
                      <button onClick={() => removeReason(i)} className="text-destructive cursor-pointer text-sm">✕</button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newReason}
                    onChange={e => setNewReason(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addReason()}
                    placeholder="سبب جديد..."
                    className="flex-1 px-3 py-2 rounded-lg bg-secondary font-cairo text-foreground text-sm"
                  />
                  <button onClick={addReason} className="px-3 py-2 rounded-lg bg-primary text-primary-foreground font-cairo text-sm cursor-pointer">
                    +
                  </button>
                </div>
              </Field>

              {/* Photos */}
              <Field label="الصور">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-cairo cursor-pointer mb-3"
                >
                  📷 إضافة صور
                </button>
                <div className="space-y-3">
                  {data.photos.map(photo => (
                    <div key={photo.id} className="flex gap-3 items-start">
                      <img src={photo.data} alt="" className="w-16 h-16 object-cover rounded" />
                      <div className="flex-1">
                        <input
                          value={photo.caption}
                          onChange={e => updateCaption(photo.id, e.target.value)}
                          placeholder="وصف الصورة..."
                          className="w-full px-2 py-1 rounded bg-secondary text-foreground font-cairo text-sm"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id)}
                        className="text-destructive cursor-pointer text-sm mt-1"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              </Field>

              {/* Reset */}
              <button
                onClick={resetAll}
                className="w-full py-3 rounded-lg border border-destructive text-destructive font-cairo cursor-pointer hover:bg-destructive/10 transition"
              >
                🔄 إعادة تعيين الكل
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-sm font-cairo mb-1" style={{ color: 'hsl(350 50% 75%)' }}>{label}</label>
    {children}
  </div>
);

export default EditPanel;
