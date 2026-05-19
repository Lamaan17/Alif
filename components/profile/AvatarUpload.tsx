"use client";

import { useRef, useState } from "react";
import { Camera, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AvatarUpload({
  userId,
  value,
  onChange,
}: {
  userId: string;
  /** Storage path inside the avatars bucket, e.g. `${userId}/avatar.png` */
  value: string | null;
  onChange: (path: string | null) => void;
}) {
  const supabase = createClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const publicUrl = value
    ? supabase.storage.from("avatars").getPublicUrl(value).data.publicUrl
    : null;

  async function handleFile(file: File) {
    setError(null);
    if (!file.type.startsWith("image/")) {
      setError("Pick an image file");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("Max 4 MB");
      return;
    }
    setBusy(true);

    const ext = file.name.split(".").pop()?.toLowerCase() || "png";
    const path = `${userId}/avatar-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (upErr) {
      setError(upErr.message);
      setBusy(false);
      return;
    }

    // Best-effort cleanup of previous file
    if (value && value !== path) {
      await supabase.storage.from("avatars").remove([value]);
    }

    onChange(path);
    setBusy(false);
  }

  async function clear() {
    if (!value) return;
    setBusy(true);
    await supabase.storage.from("avatars").remove([value]);
    onChange(null);
    setBusy(false);
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-paper-warm ring-1 ring-paper-line">
        {publicUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={publicUrl}
            alt="Profile photo"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <Camera className="h-6 w-6" strokeWidth={1.5} />
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/70">
            <Loader2 className="h-5 w-5 animate-spin text-ink-muted" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-soft transition-colors hover:border-moss-500/40 hover:bg-moss-50 hover:text-moss-700 disabled:opacity-50"
          >
            <Camera className="h-3.5 w-3.5" />
            {value ? "Replace" : "Upload photo"}
          </button>
          {value && (
            <button
              type="button"
              onClick={clear}
              disabled={busy}
              className="inline-flex items-center gap-1.5 rounded-full border border-paper-line bg-paper px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove
            </button>
          )}
        </div>
        <p className="mt-1.5 text-[11px] text-ink-muted">
          PNG or JPG, square works best. Max 4 MB.
        </p>
        {error && (
          <p className="mt-1 text-[11px] text-red-600">{error}</p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = ""; // allow re-pick same file
          }}
        />
      </div>
    </div>
  );
}
