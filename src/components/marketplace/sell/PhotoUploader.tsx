// ============================================================
// CARVIBES / MARKETVIBES — photo uploader
//
// Mobile-first upload UX:
//   * "Add photos" opens the native camera/gallery picker (multiple),
//   * drag & drop on desktop,
//   * thumbnails with per-photo progress, retry and error states,
//   * reordering (drag on desktop, ← / → buttons that work with a
//     keyboard and on touch),
//   * the FIRST photo is the main listing image, clearly labelled,
//   * every file is resized + re-encoded in the browser BEFORE upload
//     (see src/lib/marketplace/image.ts) so a 12 MB phone photo becomes
//     a ~250 KB WebP — and the API re-validates bytes anyway.
// ============================================================

import { useCallback, useId, useRef, useState } from "react";
import { cn } from "../../../utils/cn";
import { t, type Lang } from "../../../lib/i18n";
import { MAX_PHOTOS } from "../../../lib/marketplace/sellForm";
import { formatBytes } from "../../../lib/marketplace/format";
import { isAcceptedImage, optimizePhoto, previewUrl } from "../../../lib/marketplace/image";
import { uploadPhoto } from "../../../lib/marketplace/api";
import { trackMarketplace } from "../../../lib/marketplace/analytics";
import type { LocalPhoto } from "../../../lib/marketplace/types";
import { CameraIcon, CloseIcon } from "../../icons";

export interface PhotoUploaderProps {
  lang: Lang;
  photos: LocalPhoto[];
  /**
   * Either the next array or an updater, exactly like a React state setter
   * (the parent passes `setPhotos`). Every mutation below uses the updater
   * form: two photos selected together, or a photo finishing while another
   * is still uploading, must never rebuild the list from a stale snapshot —
   * that is how a seller's photo silently disappears.
   */
  onChange: (update: LocalPhoto[] | ((current: LocalPhoto[]) => LocalPhoto[])) => void;
  error?: string;
}

const MAX_BYTES = 20 * 1024 * 1024; // pre-optimisation guard for absurd files

export default function PhotoUploader({ lang, photos, onChange, error }: PhotoUploaderProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [rejections, setRejections] = useState<string[]>([]);
  const photosRef = useRef(photos);
  photosRef.current = photos;

  const patch = useCallback(
    (id: string, next: Partial<LocalPhoto>) => {
      onChange((current) => current.map((photo) => (photo.id === id ? { ...photo, ...next } : photo)));
    },
    [onChange]
  );

  const upload = useCallback(
    async (photo: LocalPhoto, file: File) => {
      patch(photo.id, { status: "uploading", progress: 0 });
      const result = await uploadPhoto(file, photo.name, {
        onProgress: (progress) => patch(photo.id, { progress }),
      });
      if (result.ok && result.data.files[0]) {
        patch(photo.id, { status: "done", progress: 100, uploadedId: result.data.files[0].id });
        trackMarketplace("sell_photo_uploaded", { bytes: file.size });
      } else {
        patch(photo.id, { status: "error", error: result.ok ? "upload_failed" : result.error.error });
        trackMarketplace("sell_failed", { stage: "upload", reason: result.ok ? "upload_failed" : result.error.error });
      }
    },
    [patch]
  );

  const addFiles = useCallback(
    async (files: FileList | File[]) => {
      const list = Array.from(files);
      // Read the latest list at pick time (the ref is refreshed each render).
      const room = MAX_PHOTOS - photosRef.current.length;
      const accepted: File[] = [];
      const rejected: string[] = [];

      for (const file of list) {
        if (!isAcceptedImage(file)) {
          rejected.push(t(lang, "mk_upload_err_type", { name: file.name }));
          continue;
        }
        if (file.size > MAX_BYTES) {
          rejected.push(t(lang, "mk_upload_err_size", { name: file.name }));
          continue;
        }
        if (accepted.length >= room) {
          rejected.push(t(lang, "mk_upload_err_limit", { name: file.name, max: MAX_PHOTOS }));
          continue;
        }
        accepted.push(file);
      }
      setRejections(rejected);

      for (const file of accepted) {
        const id = `${Date.now().toString(36)}-${file.name.slice(0, 12)}`;
        const placeholder: LocalPhoto = {
          id,
          name: file.name,
          previewUrl: previewUrl(file),
          width: 0,
          height: 0,
          bytes: file.size,
          status: "optimizing",
          progress: 0,
        };
        onChange((current) => [...current, placeholder]);
        try {
          const optimized = await optimizePhoto(file);
          const ready: LocalPhoto = {
            ...placeholder,
            previewUrl: placeholder.previewUrl,
            width: optimized.width,
            height: optimized.height,
            bytes: optimized.blob.size,
            name: optimized.filename,
          };
          patch(id, ready);
          await upload(ready, new File([optimized.blob], optimized.filename, { type: optimized.blob.type }));
        } catch {
          patch(id, { status: "error", error: "optimize_failed" });
          trackMarketplace("sell_failed", { stage: "optimize" });
        }
      }
    },
    [lang, onChange, patch, upload]
  );

  const remove = (id: string) => {
    const target = photosRef.current.find((photo) => photo.id === id);
    if (target) URL.revokeObjectURL(target.previewUrl);
    onChange((current) => current.filter((photo) => photo.id !== id));
  };

  const move = (id: string, direction: -1 | 1) => {
    onChange((current) => {
      const index = current.findIndex((photo) => photo.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div>
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragOver(false);
          if (event.dataTransfer?.files?.length) void addFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex flex-col items-center justify-center border border-dashed px-5 py-8 text-center transition-colors",
          dragOver ? "border-accent bg-accent/[0.06]" : "border-line bg-ink/40",
          error ? "border-accent/60" : ""
        )}
      >
        <CameraIcon className="h-6 w-6 text-mist" />
        <p className="mt-3 text-[13px] text-mist">{t(lang, "mk_upload_hint")}</p>
        <p className="mt-1 text-[11px] text-fog">{t(lang, "mk_upload_limits", { max: MAX_PHOTOS })}</p>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={photos.length >= MAX_PHOTOS}
          className="cv-btn cv-btn-sm cv-btn-primary mt-4 h-11 px-6 text-[11px] font-semibold tracking-[0.16em] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {t(lang, "mk_upload_add")}
        </button>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(event) => {
            if (event.target.files?.length) void addFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <p className="mt-3 text-[11px] text-fog">{t(lang, "mk_upload_privacy")}</p>
      </div>

      {rejections.length > 0 && (
        <ul className="mt-3 space-y-1 text-[12px] text-accent-soft" role="alert">
          {rejections.map((message) => (
            <li key={message}>⚠ {message}</li>
          ))}
        </ul>
      )}

      {photos.length > 0 && (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, index) => (
            <li
              key={photo.id}
              className={cn(
                "relative overflow-hidden border bg-charcoal",
                index === 0 ? "border-accent" : "border-line"
              )}
            >
              <div className="relative aspect-[4/3] bg-graphite">
                <img
                  src={photo.previewUrl}
                  alt={t(lang, "mk_upload_photo_alt", { index: index + 1 })}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 bg-accent px-2 py-0.5 text-[9px] font-bold tracking-[0.16em] text-white">
                    {t(lang, "mk_upload_main")}
                  </span>
                )}
                {photo.status !== "done" && (
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-ink/75">
                    {photo.status === "error" ? (
                      <>
                        <span className="text-[11px] text-accent-soft">⚠ {t(lang, "mk_upload_failed")}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const input = document.createElement("input");
                            input.type = "file";
                            input.accept = "image/*";
                            input.onchange = () => {
                              const file = input.files?.[0];
                              if (file) void addFiles([file]).then(() => remove(photo.id));
                            };
                            input.click();
                          }}
                          className="text-[11px] font-semibold tracking-[0.14em] text-white underline underline-offset-4"
                        >
                          {t(lang, "mk_upload_retry")}
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-[11px] text-mist">
                          {photo.status === "optimizing" ? t(lang, "mk_upload_optimizing") : `${photo.progress}%`}
                        </span>
                        <span className="block h-[3px] w-20 overflow-hidden rounded-full bg-white/15">
                          <span
                            className="block h-full rounded-full bg-accent transition-[width] duration-300"
                            style={{ width: `${Math.max(6, photo.status === "optimizing" ? 20 : photo.progress)}%` }}
                          />
                        </span>
                      </>
                    )}
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between gap-1 border-t border-line px-2 py-1.5">
                <span className="truncate text-[10px] text-fog" title={photo.name}>
                  {formatBytes(photo.bytes)}
                </span>
                <span className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() => move(photo.id, -1)}
                    disabled={index === 0}
                    aria-label={t(lang, "mk_upload_move_left")}
                    className="flex h-7 w-7 items-center justify-center text-mist transition-colors hover:text-white disabled:opacity-30"
                  >
                    <span aria-hidden="true">←</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => move(photo.id, 1)}
                    disabled={index === photos.length - 1}
                    aria-label={t(lang, "mk_upload_move_right")}
                    className="flex h-7 w-7 items-center justify-center text-mist transition-colors hover:text-white disabled:opacity-30"
                  >
                    <span aria-hidden="true">→</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => remove(photo.id)}
                    aria-label={t(lang, "mk_upload_remove")}
                    className="flex h-7 w-7 items-center justify-center text-mist transition-colors hover:text-accent"
                  >
                    <CloseIcon className="h-3.5 w-3.5" />
                  </button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
