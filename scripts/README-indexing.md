# CarVibes — indexing runbook

Everything in this folder exists to keep <https://carvibes.dev> fully
crawlable and to shorten the time between "a page exists" and "the page
is in Google".

## The three build steps

| Step | Script | When it runs |
| --- | --- | --- |
| Sitemap + robots.txt | `scripts/generate-sitemap.mjs` | `prebuild` |
| App bundle | `vite build` | `build` |
| Per-route static HTML | `scripts/prerender.mjs` | `build` |

`npm run build` runs all three, so the sitemap, the canonicals and the
prerendered HTML can never drift apart. All three read the canonical
domain from the same place: `SITE_URL` in `src/lib/seo.ts` (override
with a `SITE_URL` env var).

## Why prerendering was necessary

CarVibes is a client-rendered SPA. Before `scripts/prerender.mjs`
existed, Vercel served the *same* `index.html` for all 542 routes. That
document had the homepage title, the homepage description, and **no**
`<link rel="canonical">` at all — every per-route value was written
later by JavaScript.

Google indexes in two waves: the first reads raw HTML, the second runs
JavaScript and can lag by days or weeks. Until that second wave landed,
all 542 URLs were byte-identical to the crawler. That is the textbook
cause of *"Duplicate, Google chose a different canonical than the user"*
and *"Crawled – currently not indexed"*.

The prerenderer now emits one real HTML file per route with the correct
title, description, self-referencing canonical, Open Graph tags,
JSON-LD (`Vehicle` / `Article`) and a crawlable block of text and
`<a href>` links. React still hydrates and takes over exactly as before.

## Day-one runbook (in order)

1. **Deploy.** Push to `main`; Vercel builds and runs all three steps.
2. **Verify the deploy** — see "Verification" below.
3. **Search Console → Sitemaps.** Submit `https://carvibes.dev/sitemap.xml`.
   If it is already listed, click it and **Resubmit** so Google refetches
   it instead of using its cached copy.
4. **Search Console → URL Inspection → Request indexing** for your ~10
   highest-value URLs. This is the only genuinely fast lane into Google
   and it is rate-limited to roughly a dozen a day, so spend it on:
   `/`, `/explore`, `/brands`, `/news`, and your 5–6 strongest car pages.
   For each one, check that "Crawled page" shows the *prerendered* title
   and canonical, not the homepage's.
5. **IndexNow** for the whole 542-URL set (Bing, Yandex, Seznam, Naver —
   not Google). Typically picked up within hours:

   ```bash
   npm run submit:indexnow            # all 542 URLs
   npm run submit:indexnow -- --dry-run
   node scripts/submit-indexnow.mjs /car/bmw-m3-competition   # single URL
   ```

6. **Bing Webmaster Tools.** Import the Search Console property (two
   clicks) and submit the sitemap there too. Bing indexes far faster than
   Google, and Bing coverage feeds ChatGPT/Copilot search results.

## Verification

```bash
npm run build
npm run verify:seo        # audits dist/ — canonicals, robots, sitemap parity
```

Manual spot checks once deployed — the key is `curl` (no JavaScript),
because that is what the first crawl wave sees:

```bash
curl -s https://carvibes.dev/car/bmw-m3-competition | grep -E 'canonical|<title>'
curl -sI https://carvibes.dev/nope-does-not-exist   # must be 404, not 200
curl -sI https://www.carvibes.dev/                  # must be 308 -> apex
curl -s  https://carvibes.dev/robots.txt
```

## What is deliberately not indexed

`/favorites`, `/compare` and `/search` render from `localStorage` or from
a user query, so they are empty for a crawler. They are excluded from the
sitemap and carry `noindex, follow` in their prerendered HTML. The
retired `/cars/*` and `/rankings/*` paths return 404 with `X-Robots-Tag:
noindex`; the 130 known legacy `/cars/<slug>-<year>` URLs 301 to their
`/car/<slug>` equivalents instead.

## Rotating the IndexNow key

The key is a plain file served from the site root:
`public/9e90d3de0eb3d88779ab3405d5a94f1b.txt`. To rotate, generate a new
hex key, rename that file to `<newkey>.txt`, put the same string inside
it, and set `INDEXNOW_KEY` (or update the default in
`scripts/submit-indexnow.mjs`).
