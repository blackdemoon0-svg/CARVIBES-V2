// ============================================================
// CARVIBES — shared SEO content builder for /car/:id pages.
//
// Pure functions only (no React, no DOM): this module is consumed by
//   - the runtime  (src/lib/seo.ts, CarDetail.tsx)
//   - the build    (scripts/prerender.mjs)
// so the title, meta description, crawlable prose, FAQ and JSON-LD of
// every car page are byte-identical before and after hydration.
//
// Golden rule: every string is composed ONLY from values that really
// exist in the car database. A missing spec is omitted from the text
// entirely — never guessed, never zero-filled, never invented.
// ============================================================
import type { Car, Category, Drivetrain } from "./cars";

/** Site suffix used in every car <title>. */
export const CAR_TITLE_SUFFIX = "CarVibes";

/** Meta-description budget (Google truncates around ~155–160 chars). */
export const CAR_META_LIMIT = 158;

export interface CarFaqItem {
  q: string;
  a: string;
}

// ------------------------------------------------------------
// Names, titles, canonical path
// ------------------------------------------------------------
export function carName(car: Car): string {
  return `${car.brand} ${car.model}`;
}

/**
 * Canonical page title: `{brand} {model} ({year}) — CarVibes`.
 * Uniqueness is guaranteed by the database: (brand, model, year) is
 * verified unique across the dataset (see scripts/verify-seo.mjs).
 */
export function carTitle(car: Car): string {
  return `${carName(car)} (${car.year}) — ${CAR_TITLE_SUFFIX}`;
}

/** The /car/:id URL convention — the single canonical shape, never changed. */
export function carCanonicalPath(car: Car): string {
  return `/car/${car.id}`;
}

// ------------------------------------------------------------
// Small text helpers
// ------------------------------------------------------------
function clean(s?: string): string {
  return (s ?? "").replace(/\s+/g, " ").trim();
}

function ensurePeriod(s: string): string {
  return /[.!?…]$/.test(s) ? s : `${s}.`;
}

/** Indefinite article helper ("an SUV", "a sedan", "an 8-speed…"). */
function art(word: string): "a" | "an" {
  return /^[aeiou8]/i.test(word) || /^[Ss][Uu][Vv]$/.test(word) ? "an" : "a";
}

/** First sentence of a prose field, whitespace-collapsed ("" when absent). */
export function firstSentence(text?: string): string {
  const s = clean(text);
  if (!s) return "";
  const m = s.match(/^.*?[.!?](?=\s|$)/);
  return (m ? m[0] : s).trim();
}

/** Clamp at a word boundary with an ellipsis. */
export function clampWords(s: string, max: number): string {
  if (s.length <= max) return s;
  const cut = s.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const head = lastSpace > 40 ? cut.slice(0, lastSpace) : cut;
  return `${head.replace(/[,.;:—–\s]+$/, "")}…`;
}

export const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

// ------------------------------------------------------------
// Real-data vocabulary (rewordings of existing DB values, never facts
// that are not in the row itself)
// ------------------------------------------------------------
const CATEGORY_WORDS: Record<Category, string> = {
  supercar: "supercars",
  sports: "sports cars",
  luxury: "luxury cars",
  suv: "SUVs",
  electric: "electric cars",
  jdm: "JDM cars",
  classic: "classic cars",
  offroad: "off-road vehicles",
  daily: "daily drivers",
};

const DRIVE_WORDS: Record<Drivetrain, string> = {
  RWD: "rear-wheel drive",
  FWD: "front-wheel drive",
  AWD: "all-wheel drive",
  "4WD": "four-wheel drive",
};

export function categoryWords(car: Car): string[] {
  return (car.categories ?? []).map((c) => CATEGORY_WORDS[c] ?? c);
}

// ------------------------------------------------------------
// Engine breakdown — structured facts extracted from the real engine
// string. Anything not confidently recognised is omitted.
// (Moved here from CarDetail.tsx so the prerenderer can reuse it.)
// ------------------------------------------------------------
export function engineBreakdown(engine: string) {
  let displacement: string | undefined;
  let cylinders: string | undefined;
  let aspiration: string | undefined;

  const d = engine.match(/(\d+(?:\.\d+)?)L\b/);
  if (d) displacement = `${d[1]} L`;

  const block = engine.match(/\b([VWI])(\d{1,2})\b/);
  if (block) cylinders = `${block[1]}${block[2]}`;
  else {
    const flat = engine.match(/Flat-(\d{1,2})\b/i);
    if (flat) cylinders = `Flat-${flat[1]}`;
    else if (/rotary/i.test(engine)) cylinders = "Rotary";
  }

  if (/twin-turbo/i.test(engine)) aspiration = "Twin-turbo";
  else if (/quad-turbo/i.test(engine)) aspiration = "Quad-turbo";
  else if (/turbo/i.test(engine)) aspiration = "Turbocharged";
  else if (/supercharged/i.test(engine)) aspiration = "Supercharged";
  else if (/\bNA\b|naturally aspirated/i.test(engine)) aspiration = "Naturally aspirated";

  return { displacement, cylinders, aspiration };
}

// ------------------------------------------------------------
// Key facts — ordered list of real spec fragments, missing ones skipped
// ------------------------------------------------------------
export function carKeyFacts(car: Car): string[] {
  const facts: string[] = [];
  const eng = clean(car.engine);
  if (car.hp) facts.push(`${car.hp} hp`);
  if (eng && eng !== "N/A") facts.push(eng);
  if (car.zeroToHundred) facts.push(`0–100 km/h in ${car.zeroToHundred}s`);
  if (car.topSpeed) facts.push(`${car.topSpeed} km/h top speed`);
  if (car.torque) facts.push(`${car.torque} Nm of torque`);
  if (car.drivetrain) facts.push(DRIVE_WORDS[car.drivetrain] ?? car.drivetrain);
  if (car.body) facts.push(car.body.toLowerCase());
  if (car.fuel) facts.push(car.fuel.toLowerCase());
  if (car.transmission) facts.push(`${car.transmission.toLowerCase()} transmission`);
  return facts;
}

// ------------------------------------------------------------
// Meta description — natural, spec-true, never duplicated boilerplate:
// every description starts with the unique `${brand} ${model} (${year})`
// head and then carries that car's own figures, so no two pages share
// the same string.
// ------------------------------------------------------------
export function carMetaDescription(car: Car, max = CAR_META_LIMIT): string {
  const head = `${carName(car)} (${car.year}): `;
  const prose = firstSentence(car.overview) || firstSentence(car.tagline);
  const facts = carKeyFacts(car);

  if (prose) {
    const p = ensurePeriod(prose);
    const base = head + p;
    if (base.length <= max) {
      // Try to append as many key specs as still fit.
      const stem = p.slice(0, -1);
      let out = base;
      for (let n = 3; n >= 1; n--) {
        const candidate = `${head}${stem} — ${facts.slice(0, n).join(", ")}.`;
        if (candidate.length <= max) {
          out = candidate;
          break;
        }
      }
      return out;
    }
  }

  // No (or too long) prose: build a spec sentence, as many facts as fit.
  for (let n = facts.length; n > 0; n--) {
    const candidate = `${head}${facts.slice(0, n).join(", ")}.`;
    if (candidate.length <= max) return candidate;
  }
  const fallback = head + (car.body ? `${car.body.toLowerCase()}.` : `${car.year} model.`);
  return clampWords(fallback, max);
}

// ------------------------------------------------------------
// Overview text — real overview when present, otherwise a neutral
// sentence composed only from the car's own fields (never invented).
// ------------------------------------------------------------
export function carOverviewText(car: Car): string {
  const o = clean(car.overview);
  if (o) return o;

  const eng = clean(car.engine);
  const hasEngine = !!eng && eng !== "N/A";
  let s = `The ${car.year} ${carName(car)}`;
  const bits: string[] = [];
  if (car.body) bits.push(`${art(car.body.toLowerCase())} ${car.body.toLowerCase()}`);
  // Engine strings keep their real casing ("0.6L NA Flat-2", not "0.6l na…").
  if (hasEngine) bits.push(`powered by ${art(eng)} ${eng}`);
  s += bits.length ? ` is ${bits.join(", ")}` : " is part of the CarVibes database";
  if (car.hp) s += hasEngine ? ` producing ${car.hp} hp` : ` with ${car.hp} hp`;
  s = ensurePeriod(s);
  if (car.fuel === "Electric") s += " It runs on electricity.";
  else if (car.fuel) s += ` It runs on ${car.fuel.toLowerCase()}.`;
  return s;
}

// ------------------------------------------------------------
// FAQ — only questions whose answer is fully backed by DB values.
// A car missing e.g. 0–100 or price data simply gets fewer questions;
// nothing is ever answered with a guess.
// ------------------------------------------------------------
export function carFaq(car: Car): CarFaqItem[] {
  const name = carName(car);
  const eng = clean(car.engine);
  const hasEngine = !!eng && eng !== "N/A";
  const items: CarFaqItem[] = [];

  if (hasEngine) {
    let a = `The ${car.year} ${name} is equipped with a ${eng}`;
    if (car.fuel) a += ` (${car.fuel.toLowerCase()})`;
    if (car.hp) a += `, producing ${car.hp} hp`;
    if (car.torque) a += ` and ${car.torque} Nm of torque`;
    a += ".";
    items.push({ q: `What engine does the ${name} have?`, a });
  }

  if (car.hp) {
    let a = `The ${name} produces ${car.hp} hp`;
    if (car.torque) a += ` and ${car.torque} Nm of torque`;
    if (car.weight) a += `, for a kerb weight of ${car.weight} kg`;
    a += ".";
    items.push({ q: `How much horsepower does the ${name} have?`, a });
  }

  if (car.zeroToHundred) {
    let a = `The ${car.year} ${name} accelerates from 0 to 100 km/h in ${car.zeroToHundred} seconds`;
    if (car.topSpeed) a += `, with a top speed of ${car.topSpeed} km/h`;
    a += ".";
    items.push({ q: `What is the 0–100 time of the ${name}?`, a });
  } else if (car.topSpeed) {
    items.push({
      q: `What is the top speed of the ${name}?`,
      a: `The ${car.year} ${name} has a top speed of ${car.topSpeed} km/h.`,
    });
  }

  if (car.transmission) {
    let a = `The ${name} comes with a ${car.transmission.toLowerCase()} transmission`;
    if (car.drivetrain) a += ` and ${DRIVE_WORDS[car.drivetrain] ?? car.drivetrain}`;
    a += ".";
    items.push({ q: `What transmission does the ${name} have?`, a });
  }

  if (car.body) {
    let a = `The ${car.year} ${name} is ${art(car.body)} ${car.body.toLowerCase()}`;
    const cats = categoryWords(car);
    if (cats.length) a += `, listed among ${cats.join(", ")} on CarVibes`;
    a += ".";
    items.push({ q: `What body type is the ${name}?`, a });
  }

  if (car.price) {
    items.push({
      q: `How much does the ${name} cost?`,
      a: `CarVibes lists the ${car.year} ${name} at an approximate retail price of ${usd(car.price)} — the manufacturer's suggested price at the time of writing, not a live offer.`,
    });
  }

  // Reliability is intentionally never answered: the database stores no
  // reliability measurements, and a fabricated answer would be a fake fact.
  return items.slice(0, 6);
}

// ------------------------------------------------------------
// Image alt text — descriptive, natural, no keyword stuffing.
// ------------------------------------------------------------
export function carAltText(car: Car, photoIndex = 0, photoCount = 1): string {
  const base = `${car.brand} ${car.model} ${car.year}`;
  if (photoCount > 1 && photoIndex > 0) {
    return `${base} — photo ${photoIndex + 1} of ${photoCount}`;
  }
  return base;
}

// ------------------------------------------------------------
// JSON-LD — schema.org Vehicle (+ FAQPage) built from real fields only.
// Missing property => property omitted (never a zero or a placeholder).
// ------------------------------------------------------------
export function carJsonLd(car: Car, siteUrl: string): Record<string, unknown> {
  const url = `${siteUrl}${carCanonicalPath(car)}`;
  const eng = clean(car.engine);
  const hasEngine = !!eng && eng !== "N/A";

  const vehicle: Record<string, unknown> = {
    "@type": "Vehicle",
    "@id": `${url}#vehicle`,
    name: `${carName(car)} ${car.year}`,
    url,
    image: car.image,
    description: carMetaDescription(car),
    brand: { "@type": "Brand", name: car.brand },
    model: car.model,
    vehicleModelDate: String(car.year),
  };
  if (car.generation) vehicle.model = `${car.model} ${car.generation}`;
  if (car.body) vehicle.bodyType = car.body;
  if (car.fuel) vehicle.fuelType = car.fuel;
  if (car.transmission) vehicle.vehicleTransmission = car.transmission;

  const engineSpec: Record<string, unknown> = { "@type": "EngineSpecification" };
  let engineProps = 0;
  if (hasEngine) {
    engineSpec.name = eng;
    engineProps += 1;
  }
  if (car.fuel) {
    engineSpec.fuelType = car.fuel;
    engineProps += 1;
  }
  if (car.hp) {
    engineSpec.enginePower = {
      "@type": "QuantitativeValue",
      value: car.hp,
      unitCode: "BHP",
    };
    engineProps += 1;
  }
  if (car.torque) {
    engineSpec.torque = {
      "@type": "QuantitativeValue",
      value: car.torque,
      unitText: "Nm",
    };
    engineProps += 1;
  }
  if (engineProps > 1) vehicle.vehicleEngine = engineSpec;

  if (car.topSpeed) {
    vehicle.speed = { "@type": "QuantitativeValue", value: car.topSpeed, unitCode: "KMH" };
  }
  if (car.weight) {
    vehicle.weight = { "@type": "QuantitativeValue", value: car.weight, unitCode: "KGM" };
  }

  const additional: Record<string, unknown>[] = [];
  if (car.zeroToHundred) {
    additional.push({ "@type": "PropertyValue", name: "0–100 km/h", value: `${car.zeroToHundred} s` });
  }
  if (car.drivetrain) {
    additional.push({
      "@type": "PropertyValue",
      name: "Drivetrain",
      value: DRIVE_WORDS[car.drivetrain] ?? car.drivetrain,
    });
  }
  if (car.price) {
    additional.push({
      "@type": "PropertyValue",
      name: "Approximate retail price (USD)",
      value: usd(car.price),
    });
  }
  const cats = categoryWords(car);
  if (cats.length) {
    additional.push({
      "@type": "PropertyValue",
      name: "CarVibes categories",
      value: cats.join(", "),
    });
  }
  if (additional.length) vehicle.additionalProperty = additional;

  const graph: Record<string, unknown>[] = [vehicle];
  const faq = carFaq(car);
  if (faq.length >= 3) {
    graph.push({
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
    vehicle.subjectOf = { "@id": `${url}#faq` };
  }

  return { "@context": "https://schema.org", "@graph": graph };
}
