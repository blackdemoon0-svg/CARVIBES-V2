import { useRef } from "react";
import { t, type Lang } from "../../../lib/i18n";
import type { AnalysisPhoto, PhotoCategory } from "../types";
import { uid } from "../types";

interface Props {
  lang: Lang;
  photos: AnalysisPhoto[];
  onChange: (photos: AnalysisPhoto[]) => void;
}

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_PER_SLOT = 4;

/** The 3 essential photos: front + rear + interior. */
const ESSENTIALS: { slot: string; category: PhotoCategory; labelKey: string; hintKey: string; icon: string }[] = [
  { slot: "front", category: "ext_front", labelKey: "az_ph_essential_front", hintKey: "az_ph_essential_front_hint", icon: "🚗" },
  { slot: "rear", category: "ext_rear", labelKey: "az_ph_essential_rear", hintKey: "az_ph_essential_rear_hint", icon: "🚙" },
  { slot: "interior", category: "int_dashboard", labelKey: "az_ph_essential_interior", hintKey: "az_ph_essential_interior_hint", icon: "💺" },
];

/** Tags for free extra photos (category mapping behind the scenes). */
const MORE_TAGS: { category: PhotoCategory; labelKey: string }[] = [
  { category: "ext_details", labelKey: "az_ph_ext_details" },
  { category: "ext_left", labelKey: "az_tag_side" },
  { category: "ext_wheels", labelKey: "az_ph_ext_wheels" },
  { category: "int_cluster", labelKey: "az_ph_int_cluster" },
  { category: "int_seats", labelKey: "az_ph_int_seats" },
  { category: "eng_bay", labelKey: "az_ph_eng_bay" },
  { category: "under_body", labelKey: "az_ph_under_body" },
  { category: "doc_other", labelKey: "az_ph_doc_other" },
];

const DOC_TAGS: { category: PhotoCategory; labelKey: string }[] = [
  { category: "doc_other", labelKey: "az_ph_doc_other" },
  { category: "doc_service", labelKey: "az_ph_doc_service" },
  { category: "doc_history", labelKey: "az_ph_doc_history" },
  { category: "doc_inspection", labelKey: "az_ph_doc_inspection" },
  { category: "doc_registration", labelKey: "az_ph_doc_registration" },
];

/**
 * Simplified photo step: 3 large essential slots (front / rear /
 * interior), one free "add more photos" pool with per-photo tags, and
 * an optional documents pool. No long category list.
 */
export default function PhotoUploader({ lang, photos, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const target = useRef<{ category: PhotoCategory; max: number }>({ category: "ext_front", max: MAX_PER_SLOT });

  const openPicker = (category: PhotoCategory, max: number) => {
    target.current = { category, max };
    fileRef.current?.click();
  };

  const onFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const { category, max } = target.current;
    const existing = photos.filter((p) => p.category === category).length;
    const room = Math.max(0, max - existing);
    const picked = [...files].filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (picked.length === 0) return;
    const added: AnalysisPhoto[] = picked.map((f) => ({
      id: uid("ph"),
      category,
      name: f.name,
      url: URL.createObjectURL(f),
      ref: `${category}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      addedAt: Date.now(),
    }));
    onChange([...photos, ...added]);
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = (id: string) => {
    const doomed = photos.find((p) => p.id === id);
    if (doomed?.url?.startsWith("blob:")) URL.revokeObjectURL(doomed.url);
    onChange(photos.filter((p) => p.id !== id));
  };

  const retag = (id: string, category: PhotoCategory) => {
    onChange(photos.map((p) => (p.id === id ? { ...p, category } : p)));
  };

  const byCat = (cat: PhotoCategory) => photos.filter((p) => p.category === cat);
  const morePhotos = photos.filter(
    (p) => !ESSENTIALS.some((e) => e.category === p.category) && !p.category.startsWith("doc_")
  );
  const docPhotos = photos.filter((p) => p.category.startsWith("doc_"));

  return (
    <div className="space-y-8">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="hidden"
        aria-hidden
        tabIndex={-1}
        onChange={(e) => onFiles(e.target.files)}
      />

      {/* 3 essentials */}
      <section>
        <h3 className="mb-3 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
          <span className="h-px w-6 bg-accent/60" />
          {t(lang, "az_photos_essentials").toUpperCase()}
        </h3>
        <div className="grid gap-3 sm:grid-cols-3">
          {ESSENTIALS.map((e) => {
            const items = byCat(e.category);
            return (
              <EssentialSlot
                key={e.slot}
                lang={lang}
                icon={e.icon}
                title={t(lang, e.labelKey)}
                hint={t(lang, e.hintKey)}
                items={items}
                full={items.length >= MAX_PER_SLOT}
                onAdd={() => openPicker(e.category, MAX_PER_SLOT)}
                onRemove={remove}
              />
            );
          })}
        </div>
      </section>

      {/* Free pool */}
      <section>
        <h3 className="mb-1.5 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
          <span className="h-px w-6 bg-accent/60" />
          {t(lang, "az_photos_more").toUpperCase()}
        </h3>
        <p className="mb-3 text-xs text-fog">{t(lang, "az_photos_more_hint")}</p>
        <button
          type="button"
          onClick={() => openPicker("ext_details", 24)}
          className="az-glass az-card-hover flex w-full items-center justify-center gap-3 rounded-2xl border-dashed !border-white/15 px-6 py-8 text-sm font-semibold text-white"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/15 text-xl text-accent" aria-hidden>
            ＋
          </span>
          {t(lang, "az_photos_more")}
        </button>
        {morePhotos.length > 0 && (
          <TaggedGrid lang={lang} items={morePhotos} tags={MORE_TAGS} onRetag={retag} onRemove={remove} />
        )}
      </section>

      {/* Documents (optional) */}
      <section>
        <h3 className="mb-1.5 flex items-center gap-3 text-[11px] font-semibold tracking-mega text-fog">
          <span className="h-px w-6 bg-accent/60" />
          {t(lang, "az_photos_docs").toUpperCase()}
        </h3>
        <p className="mb-3 text-xs text-fog">{t(lang, "az_photos_docs_hint")}</p>
        <button
          type="button"
          onClick={() => openPicker("doc_other", 12)}
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-dashed border-line px-6 py-5 text-sm font-medium text-mist transition-colors hover:border-white/25 hover:text-white"
        >
          <span aria-hidden>📄</span>
          {t(lang, "az_photo_add")}
        </button>
        {docPhotos.length > 0 && (
          <TaggedGrid lang={lang} items={docPhotos} tags={DOC_TAGS} onRetag={retag} onRemove={remove} />
        )}
      </section>
    </div>
  );
}

function EssentialSlot({
  lang,
  icon,
  title,
  hint,
  items,
  full,
  onAdd,
  onRemove,
}: {
  lang: Lang;
  icon: string;
  title: string;
  hint: string;
  items: AnalysisPhoto[];
  full: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
}) {
  const cover = items[0];
  return (
    <div className="az-glass overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={onAdd}
        disabled={full && items.length > 0}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-ink/60 text-left disabled:cursor-default"
        aria-label={`${title} — ${t(lang, "az_photo_add")}`}
      >
        {cover?.url ? (
          <img src={cover.url} alt={cover.name} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
            <span className="text-3xl" aria-hidden>{icon}</span>
            <span className="text-sm font-semibold text-white">{title}</span>
            <span className="text-xs text-fog">{hint}</span>
            <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/10 px-3.5 py-1.5 text-xs font-semibold text-accent-soft">
              📸 {t(lang, "az_photo_add")}
            </span>
          </span>
        )}
        {items.length > 1 && (
          <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2.5 py-1 text-[11px] font-semibold text-white">
            ＋{items.length - 1}
          </span>
        )}
      </button>
      <div className="flex items-center justify-between gap-2 px-3.5 py-2.5">
        <div className="min-w-0">
          <p className="truncate text-[13px] font-semibold text-white">{title}</p>
          <p className="text-[11px] text-fog">{t(lang, "az_photo_count", { count: items.length })}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => onRemove(items[items.length - 1].id)}
              className="rounded-lg px-2 py-1.5 text-[11px] font-medium text-fog transition-colors hover:text-red-300"
              aria-label={t(lang, "az_photo_remove")}
            >
              ✕
            </button>
          )}
          {(!full || items.length === 0) && (
            <button
              type="button"
              onClick={onAdd}
              className="rounded-lg border border-line px-2.5 py-1.5 text-[11px] font-semibold text-mist transition-colors hover:border-accent/50 hover:text-white"
            >
              ＋
            </button>
          )}
        </div>
      </div>
      {items.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto px-3.5 pb-3">
          {items.slice(1).map((p) => (
            <div key={p.id} className="group relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-line bg-ink">
              {p.url && <img src={p.url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />}
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                aria-label={t(lang, "az_photo_remove")}
                className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TaggedGrid({
  lang,
  items,
  tags,
  onRetag,
  onRemove,
}: {
  lang: Lang;
  items: AnalysisPhoto[];
  tags: { category: PhotoCategory; labelKey: string }[];
  onRetag: (id: string, category: PhotoCategory) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <div key={p.id} className="az-glass overflow-hidden rounded-xl">
          <div className="relative aspect-[4/3] bg-ink/60">
            {p.url ? (
              <img src={p.url} alt={p.name} className="h-full w-full object-cover" loading="lazy" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-[10px] text-fog">IMG</div>
            )}
            <button
              type="button"
              onClick={() => onRemove(p.id)}
              aria-label={t(lang, "az_photo_remove")}
              className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white transition-opacity hover:opacity-100 sm:opacity-80"
            >
              <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </button>
          </div>
          <div className="p-2">
            <label className="sr-only" htmlFor={`tag-${p.id}`}>{t(lang, "az_photo_tag")}</label>
            <select
              id={`tag-${p.id}`}
              value={p.category}
              onChange={(e) => onRetag(p.id, e.target.value as PhotoCategory)}
              className="az-input !rounded-lg !px-2 !py-1.5 !text-xs"
            >
              {tags.map((tag) => (
                <option key={tag.category} value={tag.category}>
                  {t(lang, tag.labelKey)}
                </option>
              ))}
            </select>
          </div>
        </div>
      ))}
    </div>
  );
}
