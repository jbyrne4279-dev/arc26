# Winter Arc 26 — Funnel Site

A conversion-optimised landing site for the Winter Arc 26 iOS app. Built to take
cold traffic from short-form social (Instagram / TikTok), sell the app's core
mechanics, and drive App Store downloads.

Static HTML/CSS/JS — no build step, no framework, no dependencies. Drops onto any
static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, S3) as-is.

---

## Go live in 3 edits

Everything you need to launch lives in **one config block** at the top of
[`assets/js/main.js`](assets/js/main.js):

```js
const CONFIG = {
  APP_STORE_URL:   "https://apps.apple.com/app/winter-arc-26/id0000000000", // ← your real App Store link
  META_PIXEL_ID:   "",   // ← Meta (IG) Pixel id for retargeting; "" = off
  TIKTOK_PIXEL_ID: "",   // ← TikTok Pixel id; "" = off
  GA4_ID:          ""    // ← GA4 "G-XXXX" id; "" = off
};
```

1. **`APP_STORE_URL`** — paste your real App Store product URL. Every download
   button on the site reads from this one value.
2. **Pixels** — add your Meta and/or TikTok pixel ids to fire `PageView` on load
   and a conversion event on every download click. Leave blank to disable.
3. That's it. Open `index.html` in a browser to preview.

---

## What's here

| File | Purpose |
|---|---|
| `index.html` | The funnel — hero, problem, how-it-works, features, ladder, testimonials, FAQ, final CTA |
| `privacy.html` / `terms.html` | Legal pages (also required for App Store submission) |
| `assets/css/styles.css` | All styling. Design tokens mirror `design-system.md` exactly |
| `assets/js/main.js` | Config, pixel loaders, reveal animations, FAQ, sticky mobile CTA |
| `assets/img/` | Logo, favicon, and the social-share image (`og-image.png`) |

## The conversion funnel

1. **Hero** — the ad promise, restated. App Store CTA above the fold + a live-looking app screen.
2. **Problem** — the cost of the scroll, framed to sting.
3. **How it works** — three friction-free steps.
4. **Features** — six mechanics sold as benefits (photo proof, the lock, the coach, ELO, rewards, community).
5. **Social proof** — stat band + testimonials.
6. **The ladder** — the ten-rank climb, using the app's real rank colours.
7. **FAQ** — objection handling.
8. **Final CTA** — one more App Store push.
9. **Sticky mobile bar** — a persistent download button once the hero scrolls away (phones only).

---

## Before you publish — checklist

- [ ] Set `APP_STORE_URL` (and pixel ids) in `assets/js/main.js`.
- [ ] **Replace the placeholder testimonials** in the "From the arc" section of
      `index.html` with real, attributable App Store reviews. They are marked
      with an HTML comment. Do not present invented quotes as genuine.
- [ ] Replace the placeholder hero rating line once you have a real App Store rating.
- [ ] **Have `privacy.html` and `terms.html` reviewed** and fill in every
      `[BRACKETED]` value (company name, address, jurisdiction, minimum age).
      These are starting-point templates, not legal advice.
- [ ] Point the `hello@` / `privacy@winterarc26.app` addresses at real inboxes,
      or change them.
- [ ] Set your real domain in the `og:` / `twitter:` meta tags if you want
      absolute image URLs (some scrapers prefer them over relative paths).

## Design fidelity

Colours, type scale, corner radii, motion and copy voice are taken directly from
`design-system.md`, which was read out of the iOS source. Notably:

- Dark navy gradient ground, frost-blue accents — **never** a white page.
- The primary web CTA is the **white** button (per the design system).
- Copy is short, flat, declarative, sentence case — and never names specific apps.
- All ambient motion is gated on `prefers-reduced-motion`.

## Regenerating the social image

`assets/img/og-image.png` (1200×630) is rendered from `og-image.svg`. If you edit
the SVG, re-export a PNG at 1200×630 (any SVG→PNG tool, or open the SVG in a
browser at that size and screenshot). Social platforms need the PNG, not the SVG.
