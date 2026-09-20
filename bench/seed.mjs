// Seed a realistic marketplace store: N approved listings + photo files.
// Files land in /tmp/carvibes-bench (never inside the repo).
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { randomBytes } from "node:crypto";

const N = Number(process.argv[2] ?? 150);
const PHOTOS_PER = 3;
const PHOTO_BYTES = 300 * 1024; // ~ ordre de grandeur d'une webp de listing
const DATA_DIR = process.env.SEED_DATA_DIR ?? "/tmp/carvibes-bench/data";
const MEDIA_DIR = process.env.SEED_MEDIA_DIR ?? "/tmp/carvibes-bench/media";

rmSync(DATA_DIR, { recursive: true, force: true });
rmSync(MEDIA_DIR, { recursive: true, force: true });
mkdirSync(DATA_DIR, { recursive: true });
mkdirSync(MEDIA_DIR, { recursive: true });

const brands = ["BMW", "Audi", "Mercedes", "Toyota", "Honda", "Ford", "Peugeot", "Renault", "Volkswagen", "Tesla"];
const bodyTypes = ["sedan", "suv", "coupe", "hatchback"];
const countries = ["Morocco", "France", "Spain", "Germany"];

const listings = [];
for (let i = 0; i < N; i++) {
  const publicId = `mk${String(i).padStart(6, "0")}`;
  const brand = brands[i % brands.length];
  const media = [];
  for (let p = 1; p <= PHOTOS_PER; p++) {
    mkdirSync(`${MEDIA_DIR}/${publicId}`, { recursive: true });
    const file = `${p}.webp`;
    writeFileSync(`${MEDIA_DIR}/${publicId}/${file}`, randomBytes(PHOTO_BYTES)); // incompressible
    media.push({
      url: `/marketplace-media/${publicId}/${file}`,
      file,
      alt: `${brand} photo ${p}`,
      width: 1600,
      height: 900,
    });
  }
  listings.push({
    id: `mk_seed${String(i).padStart(6, "0")}ab`,
    publicId,
    slug: `${brand.toLowerCase()}-model-${i}`,
    status: "approved",
    publishedAt: new Date(Date.now() - i * 3600_000).toISOString(),
    updatedAt: new Date().toISOString(),
    submittedAt: new Date().toISOString(),
    vehicle: {
      brand,
      model: `Model ${i}`,
      year: 2015 + (i % 10),
      bodyType: bodyTypes[i % bodyTypes.length],
      description: "x".repeat(2000),
      price: 5000 + i * 137,
      currency: "EUR",
      mileage: 50000 + i * 111,
      fuel: "diesel",
      transmission: "manual",
    },
    location: { country: countries[i % countries.length], city: `City ${i % 20}` },
    seller: { contactMethod: "whatsapp", contactValue: "+212600000000" },
    media,
    views: 0,
    contactClicks: {},
  });
}

const doc = { version: 1, listings, stagedUploads: [], audit: [], clicks: [] };
writeFileSync(`${DATA_DIR}/listings.json`, JSON.stringify(doc));
console.log(
  `seeded: ${N} listings, ${N * PHOTOS_PER} photos (${((N * PHOTOS_PER * PHOTO_BYTES) / 1e6).toFixed(0)} MB), listings.json=${(JSON.stringify(doc).length / 1e6).toFixed(2)} MB`
);
