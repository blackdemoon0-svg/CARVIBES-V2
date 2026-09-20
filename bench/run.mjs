// Load driver: runs HTTP scenarios against the bench wrapper and prints
// latency percentiles + server-side event-loop stalls.
//
//   node bench/run.mjs baseline   # sequential GET /listings, /facets, /health
//   node bench/run.mjs reads      # concurrent read waves (c = 10/50/100)
//   node bench/run.mjs views      # detail-view storm (writes) + read co-lateness
//   node bench/run.mjs media      # photo storm throughput + event-loop stalls
//   node bench/run.mjs all
const BASE = process.env.BENCH_BASE ?? "http://127.0.0.1:8787";
const PROBE = `${BASE.slice(0, BASE.lastIndexOf(":"))}:${Number(BASE.slice(BASE.lastIndexOf(":") + 1)) + 1}`;

const pct = (arr, p) => {
  if (!arr.length) return NaN;
  const s = [...arr].sort((a, b) => a - b);
  return s[Math.min(s.length - 1, Math.floor((p / 100) * s.length))];
};

async function drainProbe() {
  const r = await fetch(PROBE);
  return (await r.json());
}

async function timed(path, { method = "GET", body, ip } = {}) {
  const t0 = performance.now();
  const res = await fetch(`${BASE}${path}`, { method, body, headers: ip ? { "x-forwarded-for": ip } : {} });
  const ms = performance.now() - t0;
  let bytes = 0;
  try { bytes = (await res.arrayBuffer()).byteLength; } catch {}
  return { ms, status: res.status, bytes };
}

async function hammer(path, concurrency, durationMs, label) {
  const latencies = [];
  const statuses = {};
  const deadline = performance.now() + durationMs;
  let done = 0;
  const workers = Array.from({ length: concurrency }, async (_, w) => {
    // Une IP distincte par worker : en production, Vercel transmet l'IP
    // réelle du visiteur dans x-forwarded-for — chaque visiteur a son bucket.
    const ip = `10.0.${Math.floor(w / 250)}.${(w % 250) + 1}`;
    while (performance.now() < deadline) {
      const r = await timed(path, { ip });
      latencies.push(r.ms);
      statuses[r.status] = (statuses[r.status] ?? 0) + 1;
      done++;
    }
  });
  await Promise.all(workers);
  console.log(
    `  ${label}  c=${String(concurrency).padStart(3)}  n=${String(done).padStart(5)}  ` +
      `p50=${pct(latencies, 50).toFixed(1)}ms  p95=${pct(latencies, 95).toFixed(1)}ms  p99=${pct(latencies, 99).toFixed(1)}ms  ` +
      `max=${Math.max(...latencies).toFixed(1)}ms  rq/s=${((done / durationMs) * 1000).toFixed(0)}  status=${JSON.stringify(statuses)}`
  );
}

async function scenarioBaseline() {
  console.log("\n[baseline] séquentiel, store tiède");
  for (const path of ["/health", "/api/marketplace/listings", "/api/marketplace/facets"]) {
    const xs = [];
    for (let i = 0; i < 120; i++) xs.push((await timed(path)).ms);
    console.log(`  GET ${path}  p50=${pct(xs, 50).toFixed(1)}ms  p95=${pct(xs, 95).toFixed(1)}ms  p99=${pct(xs, 99).toFixed(1)}ms  max=${Math.max(...xs).toFixed(1)}ms`);
  }
}

async function scenarioReads() {
  console.log("\n[reads] vagues concurrentes sur /api/marketplace/listings");
  for (const c of [10, 50, 100]) {
    const before = await drainProbe();
    await hammer("/api/marketplace/listings", c, 4000, "listings ");
    const after = await drainProbe();
    console.log(`    event-loop: stalls>5ms=${after.lagLog.length}  maxLag=${after.maxLag}ms`);
  }
}

async function scenarioViews() {
  console.log("\n[views] tempête de vues détail (1 écriture JSON complète par vue) + lectures simultanées");
  const list = await (await fetch(`${BASE}/api/marketplace/listings?pageSize=24`, { headers: { "x-forwarded-for": "10.9.9.9" } })).json();
  const slugs = list.items.map((i) => i.slug);
  if (!slugs.length) { console.log("  (pas de listings en base — lancez bench/seed.mjs)"); return; }
  const before = await drainProbe();
  await Promise.all([
    hammer(`/api/marketplace/listings/${slugs[0]}`, 50, 6000, "details  "),
    hammer("/api/marketplace/listings", 10, 6000, "listings "),
  ]);
  const after = await drainProbe();
  console.log(`    event-loop: stalls>5ms=${after.lagLog.length}  maxLag=${after.maxLag}ms  (détails=${slugs.length} slugs dispo, test sur 1)`);
}

async function scenarioMedia() {
  console.log("\n[media] tempête de photos (fichiers 300 KB servis en stream)");
  const list = await (await fetch(`${BASE}/api/marketplace/listings?pageSize=24`)).json();
  const detail = await (await fetch(`${BASE}/api/marketplace/listings/${list.items[0].slug}`, { headers: { "x-forwarded-for": "10.9.9.9" } })).json();
  const media = detail.media ?? [];
  if (!media.length) { console.log("  (pas de photos — lancez bench/seed.mjs)"); return; }
  let totalBytes = 0;
  const latencies = [];
  const deadline = performance.now() + 6000;
  let done = 0;
  await Promise.all(Array.from({ length: 50 }, async () => {
    let i = 0;
    while (performance.now() < deadline) {
      const url = media[i++ % media.length].url;
      const t0 = performance.now();
      const res = await fetch(`${BASE}${url}`);
      const buf = await res.arrayBuffer();
      latencies.push(performance.now() - t0);
      totalBytes += buf.byteLength;
      done++;
    }
  }));
  const probe = await drainProbe();
  console.log(`  c=50  n=${done}  p50=${pct(latencies, 50).toFixed(1)}ms  p95=${pct(latencies, 95).toFixed(1)}ms  max=${Math.max(...latencies).toFixed(1)}ms`);
  console.log(`  débit=${((totalBytes / 6) / 1e6).toFixed(0)} MB/s  rq/s=${(done / 6).toFixed(0)}  event-loop: stalls>5ms=${probe.lagLog.length} maxLag=${probe.maxLag}ms`);
}

const scenario = process.argv[2] ?? "all";
const table = { baseline: scenarioBaseline, reads: scenarioReads, views: scenarioViews, media: scenarioMedia };
for (const [name, fn] of Object.entries(table)) {
  if (scenario === "all" || scenario === name) await fn();
}
console.log("\ndone.");
