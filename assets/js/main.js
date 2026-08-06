/* =============================================================================
   Winter Arc 26 — funnel behaviour
   -----------------------------------------------------------------------------
   ►► EDIT THIS ONE BLOCK to go live. Everything else is wiring. ◄◄
   ========================================================================== */
const CONFIG = {
  /* 1. Your App Store product URL. Every download button reads from here.
        Replace the id with your real Apple app id (numbers only).            */
  APP_STORE_URL: "https://apps.apple.com/app/winter-arc-26/id0000000000",

  /* 2. Meta (Facebook/Instagram) Pixel id — for retargeting IG/TikTok traffic.
        Leave "" to disable. Get it from Meta Events Manager.                  */
  META_PIXEL_ID: "",

  /* 3. TikTok Pixel id. Leave "" to disable. From TikTok Events Manager.      */
  TIKTOK_PIXEL_ID: "",

  /* 4. Google Analytics 4 measurement id (e.g. "G-XXXXXXX"). "" to disable.   */
  GA4_ID: ""
};

/* -----------------------------------------------------------------------------
   Analytics loaders (fire only when an id is provided above)
   -------------------------------------------------------------------------- */
(function initPixels() {
  // --- Meta Pixel ---
  if (CONFIG.META_PIXEL_ID) {
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", CONFIG.META_PIXEL_ID);
    window.fbq("track", "PageView");
  }

  // --- TikTok Pixel ---
  if (CONFIG.TIKTOK_PIXEL_ID) {
    !function (w, d, t) {
      w.TiktokAnalyticsObject = t;
      var ttq = w[t] = w[t] || [];
      ttq.methods = ["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
      ttq.setAndDefer = function (t, e) { t[e] = function () { t.push([e].concat(Array.prototype.slice.call(arguments, 0))); }; };
      for (var i = 0; i < ttq.methods.length; i++) ttq.setAndDefer(ttq, ttq.methods[i]);
      ttq.instance = function (t) { for (var e = ttq._i[t] || [], n = 0; n < ttq.methods.length; n++) ttq.setAndDefer(e, ttq.methods[n]); return e; };
      ttq.load = function (e, n) {
        var r = "https://analytics.tiktok.com/i18n/pixel/events.js", o = n && n.partner;
        ttq._i = ttq._i || {}; ttq._i[e] = []; ttq._i[e]._u = r; ttq._t = ttq._t || {}; ttq._t[e] = +new Date;
        ttq._o = ttq._o || {}; ttq._o[e] = n || {};
        var s = d.createElement("script"); s.type = "text/javascript"; s.async = !0; s.src = r + "?sdkid=" + e + "&lib=" + t;
        var a = d.getElementsByTagName("script")[0]; a.parentNode.insertBefore(s, a);
      };
      ttq.load(CONFIG.TIKTOK_PIXEL_ID);
      ttq.page();
    }(window, document, "ttq");
  }

  // --- GA4 ---
  if (CONFIG.GA4_ID) {
    var g = document.createElement("script"); g.async = true;
    g.src = "https://www.googletagmanager.com/gtag/js?id=" + CONFIG.GA4_ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", CONFIG.GA4_ID);
  }
})();

/* Fire a conversion event across whichever pixels are active. */
function trackDownloadClick(source) {
  try {
    if (window.fbq) window.fbq("track", "Lead", { content_name: "app_store_click", source: source });
    if (window.ttq) window.ttq.track("ClickButton", { content_name: "app_store_click", source: source });
    if (window.gtag) window.gtag("event", "app_store_click", { source: source });
  } catch (e) { /* never let analytics break the click */ }
}

/* -----------------------------------------------------------------------------
   Wire every [data-appstore] element to the store URL + tracking
   -------------------------------------------------------------------------- */
document.querySelectorAll("[data-appstore]").forEach(function (el) {
  el.setAttribute("href", CONFIG.APP_STORE_URL);
  el.setAttribute("target", "_blank");
  el.setAttribute("rel", "noopener");
  el.addEventListener("click", function () {
    trackDownloadClick(el.getAttribute("data-cta") || "unknown");
  });
});

/* -----------------------------------------------------------------------------
   Nav: solid background once scrolled
   -------------------------------------------------------------------------- */
const nav = document.getElementById("nav");
const onScrollNav = function () {
  if (window.scrollY > 24) nav.classList.add("is-stuck");
  else nav.classList.remove("is-stuck");
};
onScrollNav();
window.addEventListener("scroll", onScrollNav, { passive: true });

/* -----------------------------------------------------------------------------
   Sticky mobile download bar — appears after the hero scrolls away
   -------------------------------------------------------------------------- */
const mobileCta = document.getElementById("mobileCta");
const hero = document.querySelector(".hero");
if (mobileCta && hero && "IntersectionObserver" in window) {
  const heroObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) mobileCta.classList.remove("is-visible");
      else mobileCta.classList.add("is-visible");
    });
  }, { threshold: 0 });
  heroObserver.observe(hero);
}

/* -----------------------------------------------------------------------------
   Scroll reveal (skipped entirely under prefers-reduced-motion)
   -------------------------------------------------------------------------- */
const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const reveals = document.querySelectorAll(".reveal");
if (prefersReduced || !("IntersectionObserver" in window)) {
  reveals.forEach(function (el) { el.classList.add("is-in"); });
} else {
  const revealObserver = new IntersectionObserver(function (entries, obs) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-in");
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  reveals.forEach(function (el) { revealObserver.observe(el); });
}

/* -----------------------------------------------------------------------------
   App-demo videos — play only while on screen, and never under reduced motion.
   Until you add assets/video/*.mp4, the poster image shows in its place.
   -------------------------------------------------------------------------- */
const demoVideos = document.querySelectorAll("video[data-autoplay]");
if (!prefersReduced && "IntersectionObserver" in window) {
  const videoObserver = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      const v = entry.target;
      if (entry.isIntersecting) {
        const play = v.play();
        if (play && play.catch) play.catch(function () { /* autoplay blocked — poster stays */ });
      } else {
        v.pause();
      }
    });
  }, { threshold: 0.35 });
  demoVideos.forEach(function (v) { videoObserver.observe(v); });
}

/* -----------------------------------------------------------------------------
   UGC video wall — tap a card to play + unmute; tapping another pauses the rest.
   With no mp4 present the poster/placeholder simply stays.
   -------------------------------------------------------------------------- */
const ugcCards = document.querySelectorAll(".ugc-card");
ugcCards.forEach(function (card) {
  const v = card.querySelector("video");
  if (!v) return;
  card.addEventListener("click", function () {
    if (card.classList.contains("playing")) {
      v.pause(); card.classList.remove("playing"); return;
    }
    // pause any other playing card
    ugcCards.forEach(function (other) {
      if (other !== card) { const ov = other.querySelector("video"); if (ov) ov.pause(); other.classList.remove("playing"); }
    });
    v.muted = false;
    const p = v.play();
    if (p && p.then) {
      p.then(function () { card.classList.add("playing"); })
       .catch(function () { /* no source / blocked — leave the placeholder */ });
    }
  });
  v.addEventListener("ended", function () { card.classList.remove("playing"); });
});

/* -----------------------------------------------------------------------------
   FAQ accordion
   -------------------------------------------------------------------------- */
document.querySelectorAll(".faq__item").forEach(function (item) {
  const q = item.querySelector(".faq__q");
  const a = item.querySelector(".faq__a");
  q.addEventListener("click", function () {
    const isOpen = item.classList.contains("is-open");
    // close others for a clean single-open accordion
    document.querySelectorAll(".faq__item.is-open").forEach(function (other) {
      if (other !== item) {
        other.classList.remove("is-open");
        other.querySelector(".faq__q").setAttribute("aria-expanded", "false");
        other.querySelector(".faq__a").style.maxHeight = null;
      }
    });
    if (isOpen) {
      item.classList.remove("is-open");
      q.setAttribute("aria-expanded", "false");
      a.style.maxHeight = null;
    } else {
      item.classList.add("is-open");
      q.setAttribute("aria-expanded", "true");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
});

/* -----------------------------------------------------------------------------
   Footer year
   -------------------------------------------------------------------------- */
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();
