// ============================================================
// CARVIBES / MARKETVIBES — client-side photo optimisation
//
// Sellers upload photos straight from a phone camera (often 4–12 MB,
// 4000 px wide). Uploading that untouched would be slow for the seller,
// expensive to store and heavy for every visitor — so the browser does
// the downsizing BEFORE a single byte is sent:
//
//   * max long edge 1920 px (enough for a full-width gallery image),
//   * WebP at quality 0.82, JPEG fallback when the browser cannot encode
//     WebP (Safari < 14, older Android),
//   * the original is never uploaded, only the optimized blob.
//
// Everything runs through createImageBitmap + OffscreenCanvas when
// available, so the main thread stays responsive on big files.
// ============================================================

export interface OptimizedPhoto {
  blob: Blob;
  width: number;
  height: number;
  filename: string;
}

const MAX_EDGE = 1920;
const QUALITY = 0.82;
const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

export function isAcceptedImage(file: File): boolean {
  if (ACCEPTED.includes(file.type)) return true;
  // Some Android/HEIC transfers arrive with an empty type: fall back to
  // the extension so a valid photo is never silently dropped.
  return /\.(jpe?g|png|webp|heic|heif)$/i.test(file.name);
}

function targetSize(width: number, height: number) {
  const longest = Math.max(width, height);
  if (longest <= MAX_EDGE) return { width, height };
  const scale = MAX_EDGE / longest;
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

async function encode(canvas: HTMLCanvasElement | OffscreenCanvas, blobType: string): Promise<Blob | null> {
  if ("convertToBlob" in canvas) {
    return canvas.convertToBlob({ type: blobType, quality: QUALITY });
  }
  return new Promise((resolve) => {
    (canvas as HTMLCanvasElement).toBlob((blob) => resolve(blob), blobType, QUALITY);
  });
}

function supportsWebp(): boolean {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}

let webpSupport: boolean | null = null;

export async function optimizePhoto(file: File): Promise<OptimizedPhoto> {
  const baseName = file.name.replace(/\.[^.]+$/, "").slice(0, 60) || "photo";
  if (webpSupport === null) webpSupport = supportsWebp();

  // Decode (handles EXIF rotation in modern browsers) and resize.
  const bitmap = await createImageBitmap(file).catch(async () => {
    // Fallback path: <img> decode (no createImageBitmap support).
    const url = URL.createObjectURL(file);
    try {
      const img = new Image();
      img.src = url;
      await img.decode();
      return img as unknown as ImageBitmap;
    } finally {
      URL.revokeObjectURL(url);
    }
  });

  const source = { width: bitmap.width, height: bitmap.height };
  const size = targetSize(source.width, source.height);
  const useOffscreen = typeof OffscreenCanvas !== "undefined";
  const canvas = useOffscreen
    ? new OffscreenCanvas(size.width, size.height)
    : Object.assign(document.createElement("canvas"), size);
  const context = canvas.getContext("2d") as CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;
  if (!context) throw new Error("canvas_unavailable");
  context.drawImage(bitmap as CanvasImageSource, 0, 0, size.width, size.height);

  const type = webpSupport ? "image/webp" : "image/jpeg";
  let blob = await encode(canvas, type);
  if (!blob) blob = await encode(canvas, "image/jpeg");
  if (!blob) throw new Error("encode_failed");

  // Never ship a "compressed" file that is bigger than the original.
  if (blob.size > file.size && file.size < MAX_EDGE * MAX_EDGE) blob = file;

  return {
    blob,
    width: size.width,
    height: size.height,
    filename: `${baseName}.${type === "image/webp" ? "webp" : "jpg"}`,
  };
}

/** Dominant-ish preview for the uploader thumbnails (cheap, local only). */
export function previewUrl(file: File): string {
  return URL.createObjectURL(file);
}
