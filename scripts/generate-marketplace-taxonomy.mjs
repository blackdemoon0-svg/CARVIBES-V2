// ============================================================
// CARVIBES / MARKETVIBES — taxonomy generator
//
//   npm run marketplace:taxonomy
//
// Writes the two shared data files the marketplace is built on:
//
//   src/lib/marketplace/data/taxonomy.json  — makes, body types, colours,
//     currencies and the id/label option lists (fuel, transmission,
//     condition, seller type, contact method, sort)
//   src/lib/marketplace/data/countries.json — country code, name, currency
//     and dialling prefix
//
// They are SOURCE files (imported by both the UI and the API validator),
// not runtime state: commit them. Regenerate only when the taxonomy
// genuinely changes — the option ids are what i18n keys, submitted
// listings and stored records are matched on, so renaming one is a data
// migration, not a cosmetic edit.
// ============================================================

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "src/lib/marketplace/data");

// ------------------------------------------------------------
// Countries — code, English name, currency, dialling prefix.
// Add markets here; the sell form, the filters and the country facet
// pages are all generated from this list.
// ------------------------------------------------------------
const COUNTRIES = [
  { code: "MA", name: "Morocco", currency: "MAD", dial: "+212" },
  { code: "DZ", name: "Algeria", currency: "DZD", dial: "+213" },
  { code: "TN", name: "Tunisia", currency: "TND", dial: "+216" },
  { code: "EG", name: "Egypt", currency: "EGP", dial: "+20" },
  { code: "LY", name: "Libya", currency: "LYD", dial: "+218" },
  { code: "MR", name: "Mauritania", currency: "MRU", dial: "+222" },
  { code: "AE", name: "United Arab Emirates", currency: "AED", dial: "+971" },
  { code: "SA", name: "Saudi Arabia", currency: "SAR", dial: "+966" },
  { code: "QA", name: "Qatar", currency: "QAR", dial: "+974" },
  { code: "KW", name: "Kuwait", currency: "KWD", dial: "+965" },
  { code: "BH", name: "Bahrain", currency: "BHD", dial: "+973" },
  { code: "OM", name: "Oman", currency: "OMR", dial: "+968" },
  { code: "JO", name: "Jordan", currency: "JOD", dial: "+962" },
  { code: "LB", name: "Lebanon", currency: "LBP", dial: "+961" },
  { code: "TR", name: "Türkiye", currency: "TRY", dial: "+90" },
  { code: "FR", name: "France", currency: "EUR", dial: "+33" },
  { code: "ES", name: "Spain", currency: "EUR", dial: "+34" },
  { code: "PT", name: "Portugal", currency: "EUR", dial: "+351" },
  { code: "IT", name: "Italy", currency: "EUR", dial: "+39" },
  { code: "DE", name: "Germany", currency: "EUR", dial: "+49" },
  { code: "AT", name: "Austria", currency: "EUR", dial: "+43" },
  { code: "NL", name: "Netherlands", currency: "EUR", dial: "+31" },
  { code: "BE", name: "Belgium", currency: "EUR", dial: "+32" },
  { code: "IE", name: "Ireland", currency: "EUR", dial: "+353" },
  { code: "GR", name: "Greece", currency: "EUR", dial: "+30" },
  { code: "FI", name: "Finland", currency: "EUR", dial: "+358" },
  { code: "CH", name: "Switzerland", currency: "CHF", dial: "+41" },
  { code: "GB", name: "United Kingdom", currency: "GBP", dial: "+44" },
  { code: "SE", name: "Sweden", currency: "SEK", dial: "+46" },
  { code: "NO", name: "Norway", currency: "NOK", dial: "+47" },
  { code: "DK", name: "Denmark", currency: "DKK", dial: "+45" },
  { code: "PL", name: "Poland", currency: "PLN", dial: "+48" },
  { code: "CZ", name: "Czechia", currency: "CZK", dial: "+420" },
  { code: "RO", name: "Romania", currency: "RON", dial: "+40" },
  { code: "US", name: "United States", currency: "USD", dial: "+1" },
  { code: "CA", name: "Canada", currency: "CAD", dial: "+1" },
  { code: "MX", name: "Mexico", currency: "MXN", dial: "+52" },
  { code: "BR", name: "Brazil", currency: "BRL", dial: "+55" },
  { code: "AR", name: "Argentina", currency: "ARS", dial: "+54" },
  { code: "CL", name: "Chile", currency: "CLP", dial: "+56" },
  { code: "JP", name: "Japan", currency: "JPY", dial: "+81" },
  { code: "CN", name: "China", currency: "CNY", dial: "+86" },
  { code: "KR", name: "South Korea", currency: "KRW", dial: "+82" },
  { code: "IN", name: "India", currency: "INR", dial: "+91" },
  { code: "SG", name: "Singapore", currency: "SGD", dial: "+65" },
  { code: "AU", name: "Australia", currency: "AUD", dial: "+61" },
  { code: "NZ", name: "New Zealand", currency: "NZD", dial: "+64" },
  { code: "ZA", name: "South Africa", currency: "ZAR", dial: "+27" },
  { code: "KE", name: "Kenya", currency: "KES", dial: "+254" },
  { code: "NG", name: "Nigeria", currency: "NGN", dial: "+234" },
];

// ------------------------------------------------------------
// Body types, colours and currencies
// ------------------------------------------------------------
const BODY_TYPES = [
  "Sedan",
  "SUV",
  "Hatchback",
  "Coupé",
  "Convertible",
  "Roadster",
  "Wagon",
  "Crossover",
  "Pickup",
  "Van",
  "Minivan",
  "Other",
];

const COLORS = [
  "Black",
  "White",
  "Pearl White",
  "Silver",
  "Grey",
  "Blue",
  "Red",
  "Green",
  "Yellow",
  "Orange",
  "Brown",
  "Beige",
  "Gold",
  "Burgundy",
  "Matte Black",
  "Other",
];

/** Currencies the seller can price in (country currencies + the majors). */
const EXTRA_CURRENCIES = ["USD", "EUR", "GBP", "CHF", "AED", "MAD"];

// ------------------------------------------------------------
// Makes — the car database's brands first (so a make we actually have
// photography for is never missing), then the wider market.
// ------------------------------------------------------------
const EXTRA_MAKES = [
  "Abarth", "Acura", "Alfa Romeo", "Alpine", "Aston Martin", "Audi", "Bentley", "BMW",
  "Bugatti", "Buick", "BYD", "Cadillac", "Chery", "Chevrolet", "Chrysler", "Citroën",
  "Cupra", "Dacia", "Daewoo", "Daihatsu", "Dodge", "DS", "Ferrari", "Fiat", "Ford",
  "Genesis", "GMC", "Great Wall", "Haval", "Honda", "Hummer", "Hyundai", "Infiniti",
  "Isuzu", "Jaguar", "Jeep", "Kia", "Koenigsegg", "Lada", "Lamborghini", "Land Rover",
  "Lexus", "Lincoln", "Lotus", "Maserati", "Mazda", "McLaren", "Mercedes-AMG",
  "Mercedes-Benz", "MG", "Mini", "Mitsubishi", "NIO", "Nissan", "Opel", "Pagani",
  "Peugeot", "Polestar", "Pontiac", "Porsche", "Ram", "Renault", "Rimac", "Rivian",
  "Rolls-Royce", "Rover", "Saab", "Seat", "Škoda", "Smart", "SsangYong", "Subaru",
  "Suzuki", "Tata", "Tesla", "Toyota", "Volkswagen", "Volvo", "Xpeng", "Zeekr",
];

async function databaseBrands() {
  const outDir = mkdtempSync(path.join(tmpdir(), "carvibes-taxonomy-"));
  try {
    const entry = path.join(outDir, "entry.ts");
    const outfile = path.join(outDir, "brands.mjs");
    writeFileSync(
      entry,
      `import { cars } from ${JSON.stringify(path.join(ROOT, "src/lib/db.ts"))};
export const brands = cars.map((c) => c.brand);`,
      "utf8"
    );
    await build({ entryPoints: [entry], outfile, bundle: true, format: "esm", platform: "node", target: "node18", logLevel: "silent" });
    const mod = await import(pathToFileURL(outfile).href);
    return mod.brands;
  } catch (error) {
    console.warn(`[taxonomy] car database unavailable (${error.message}) — using the curated make list only`);
    return [];
  }
}

const option = (id, label) => ({ id, label });

async function main() {
  // Makes: database brands keep their exact casing, extras fill the gaps.
  const seen = new Set();
  const makes = [];
  for (const brand of [...(await databaseBrands()), ...EXTRA_MAKES]) {
    const name = String(brand ?? "").trim();
    if (!name || seen.has(name.toLowerCase())) continue;
    seen.add(name.toLowerCase());
    makes.push(name);
  }
  makes.sort((a, b) => a.localeCompare(b));

  const countries = [...COUNTRIES].sort((a, b) => a.name.localeCompare(b.name));
  const currencies = [...new Set([...countries.map((c) => c.currency), ...EXTRA_CURRENCIES])].sort();

  // Option ids are matched against i18n keys (mk_fuel_petrol, …) and
  // re-validated server-side, so the id set is the contract.
  const taxonomy = {
    makes,
    bodyTypes: BODY_TYPES,
    colors: COLORS,
    currencies,
    fuels: [
      option("petrol", "Petrol"),
      option("diesel", "Diesel"),
      option("hybrid", "Hybrid"),
      option("phev", "Plug-in hybrid"),
      option("electric", "Electric"),
      option("lpg", "LPG / CNG"),
      option("other", "Other"),
    ],
    transmissions: [
      option("automatic", "Automatic"),
      option("manual", "Manual"),
      option("dct", "Dual-clutch (DCT)"),
      option("cvt", "CVT"),
      option("other", "Other"),
    ],
    conditions: [option("new", "New"), option("used", "Used")],
    sellerTypes: [
      option("individual", "Individual"),
      option("professional", "Professional"),
      option("dealer", "Dealer"),
    ],
    contactMethods: [
      option("whatsapp", "WhatsApp"),
      option("phone", "Call"),
      option("instagram", "Instagram"),
      option("other", "Contact"),
    ],
    sorts: [
      option("newest", "Newest"),
      option("price_asc", "Price: low to high"),
      option("price_desc", "Price: high to low"),
    ],
  };

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(path.join(OUT_DIR, "taxonomy.json"), `${JSON.stringify(taxonomy, null, 2)}\n`, "utf8");
  writeFileSync(path.join(OUT_DIR, "countries.json"), `${JSON.stringify(countries, null, 2)}\n`, "utf8");

  const before = (() => {
    try {
      return JSON.parse(readFileSync(path.join(OUT_DIR, "taxonomy.json"), "utf8"));
    } catch {
      return null;
    }
  })();

  console.log(
    `[taxonomy] ${makes.length} makes, ${BODY_TYPES.length} body types, ${COLORS.length} colours, ` +
      `${countries.length} countries, ${currencies.length} currencies → src/lib/marketplace/data/`
  );
  for (const [key, value] of Object.entries({
    makes: makes.length,
    countries: countries.length,
    currencies: currencies.length,
    fuels: taxonomy.fuels.length,
    transmissions: taxonomy.transmissions.length,
    conditions: taxonomy.conditions.length,
    sellerTypes: taxonomy.sellerTypes.length,
    contactMethods: taxonomy.contactMethods.length,
    sorts: taxonomy.sorts.length,
  })) {
    const prev = key === "countries" ? undefined : before?.[key]?.length;
    const drift = typeof prev === "number" && prev !== value ? ` (was ${prev})` : "";
    console.log(`[taxonomy]   ${key.padEnd(15)} ${value}${drift}`);
  }
  // Currencies are validated server-side against this list; a stored
  // listing priced in a currency that later disappears could never be
  // re-saved, so removing one is always deliberate.
  console.log("[taxonomy] option ids are the contract — see server/marketplace/listings.mjs");
}

main().catch((error) => {
  console.error(`[taxonomy] ${error.stack ?? error.message}`);
  process.exit(1);
});
