import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X } from "lucide-react";
import { toast } from "sonner";

export function ImageUpload({ value, onChange }: { value?: string | null; onChange: (url: string | null) => void }) {
  const [uploading, setUploading] = useState(false);

  const handle = async (file: File) => {
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("site-images").upload(path, file, { upsert: false });
    if (error) { toast.error(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("site-images").getPublicUrl(path);
    onChange(data.publicUrl);
    setUploading(false);
  };

  return (
    <div className="flex items-center gap-4">
      {value ? (
        <div className="relative h-24 w-24 rounded-lg overflow-hidden border border-border">
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button onClick={() => onChange(null)} className="absolute top-1 right-1 h-6 w-6 rounded bg-background/80 grid place-items-center"><X className="h-3 w-3" /></button>
        </div>
      ) : (
        <div className="h-24 w-24 rounded-lg border-2 border-dashed border-border grid place-items-center text-muted-foreground"><Upload className="h-5 w-5" /></div>
      )}
      <label className="cursor-pointer btn-gold rounded-lg px-4 py-2 text-sm font-semibold">
        {uploading ? "Загрузка..." : "Загрузить"}
        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handle(f); }} />
      </label>
    </div>
  );
}
