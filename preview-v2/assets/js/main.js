/* ==========================================================================
   CARVIBES V2 — PREVIEW INTERACTIONS
   --------------------------------------------------------------------------
   Everything here belongs to the STANDALONE design preview. It never talks to
   the app, the API, the marketplace or the router: it renders the shared
   chrome (navbar, drawer, footer, preview switcher), the new car cards, the
   Advisor console demo, the Compare experience and the micro-interactions —
   so the new identity can be judged for real before integration.
   ========================================================================== */
(function () {
  "use strict";

  var CARS = window.CV2_CARS || [];
  var I18N = window.CV2_I18N || { en: {} };
  var LABELS = window.CV2_LABELS || { en: {} };
  var LANG_ORDER = ["en", "fr", "de", "ar"];

  /* ------------------------------------------------------------- state --- */
  var state = {
    lang: store("get", "cv2.lang") || "en",
    favs: store("get", "cv2.favs") || [],
    compare: store("get", "cv2.compare") || [],
  };
  if (LANG_ORDER.indexOf(state.lang) === -1) state.lang = "en";

  function store(action, key, value) {
    try {
      if (action === "get") {
        var raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : null;
      }
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* file:// or private mode — the preview simply forgets. */
    }
    return null;
  }

  function baseLang() {
    /* Arabic is shown to prove RTL support; the copy falls back to English. */
    return state.lang === "ar" ? "en" : state.lang;
  }
  function t(key) {
    var pack = I18N[baseLang()] || {};
    return pack[key] != null ? pack[key] : (I18N.en[key] != null ? I18N.en[key] : key);
  }
  function label(kind) {
    var pack = LABELS[baseLang()] || {};
    return pack[kind] || kind;
  }
  function money(n) {
    return "$" + Number(n).toLocaleString("en-US");
  }
  function car(id) {
    for (var i = 0; i < CARS.length; i++) if (CARS[i].id === id) return CARS[i];
    return CARS[0];
  }
  function qs(sel, root) { return (root || document).querySelector(sel); }
  /* matchMedia guard: the preview must never depend on an optional API. */
  function mq(query) {
    return typeof window.matchMedia === "function" && window.matchMedia(query).matches;
  }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]+)").exec(location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  /* ------------------------------------------------------------- icons --- */
  var ICONS = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.2-3.2"/>',
    chevron: '<path d="m6 9 6 6 6-6"/>',
    arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
    upRight: '<path d="M7 17 17 7"/><path d="M8 7h9v9"/>',
    heart: '<path d="M12 20s-7-4.4-7-9.4A3.9 3.9 0 0 1 12 8a3.9 3.9 0 0 1 7 2.6c0 5-7 9.4-7 9.4Z"/>',
    scale: '<path d="M12 4v16"/><path d="M5 8h14"/><path d="m5 8-3 6h6Z"/><path d="m19 8-3 6h6Z"/>',
    menu: '<path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/>',
    close: '<path d="M6 6l12 12"/><path d="M18 6 6 18"/>',
    gauge: '<path d="M12 14 15.5 9"/><path d="M4 18a8 8 0 1 1 16 0"/><circle cx="12" cy="18" r="1.4"/>',
    bolt: '<path d="M13 3 5 13h5l-1 8 8-10h-5Z"/>',
    engine: '<path d="M4 12h2V9h4l2-2h3v3h3v8H6v-3H4Z"/><path d="M18 11h2v5h-2"/>',
    snow: '<path d="M12 3v18"/><path d="m4 7 16 10"/><path d="m20 7-16 10"/>',
    door: '<path d="M6 4h9l3 4v12H6Z"/><path d="M15 12h.01"/>',
    cpu: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M10 3v3M14 3v3M10 18v3M14 18v3M3 10h3M3 14h3M18 10h3M18 14h3"/>',
    check: '<path d="m5 13 4.5 4.5L19 7"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="3.4"/><path d="M5 20c0-3.6 3.1-5.6 7-5.6s7 2 7 5.6"/>',
    globe: '<circle cx="12" cy="12" r="8.5"/><path d="M3.5 12h17"/><path d="M12 3.5c2.4 2.6 2.4 14.4 0 17M12 3.5c-2.4 2.6-2.4 14.4 0 17"/>',
    road: '<path d="M7 3 4 21"/><path d="M17 3l3 18"/><path d="M12 5v3M12 11v3M12 17v3"/>',
    layers: '<path d="m12 3 8 4.5-8 4.5-8-4.5Z"/><path d="m4 12.5 8 4.5 8-4.5"/>',
    spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6.3 6.3l2.8 2.8M14.9 14.9l2.8 2.8M17.7 6.3l-2.8 2.8M9.1 14.9l-2.8 2.8"/>',
    shield: '<path d="M12 3.5 19 6v6c0 4.2-3 6.9-7 8.5-4-1.6-7-4.3-7-8.5V6Z"/><path d="m9 12 2 2 4-4"/>',
    filter: '<path d="M4 6h16"/><path d="M7 12h10"/><path d="M10 18h4"/>',
    play: '<path d="M8 5.5v13l11-6.5Z"/>',
    wheel: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="2.6"/><path d="M12 3.5v6M4.6 16.4l5.2-3M19.4 16.4l-5.2-3"/>',
    plug: '<path d="M9 3v5M15 3v5"/><path d="M6 8h12v2.5a6 6 0 0 1-6 6 6 6 0 0 1-6-6Z"/><path d="M12 16.5V21"/>',
    seat: '<path d="M7 4h4l1 6H7Z"/><path d="M6 10h7l1.5 5H8Z"/><path d="M5 15v5h9"/>',
  };
  function icon(name, size) {
    var s = size || 16;
    return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || "") + "</svg>";
  }
  function logoMark(size) {
    var s = size || 30;
    return '<svg class="cv-logo__mark" width="' + s + '" height="' + s + '" viewBox="0 0 32 32" fill="none" aria-hidden="true">' +
      '<rect x="1" y="1" width="30" height="30" rx="9" stroke="url(#cvg)" stroke-width="1.4"/>' +
      '<path d="M5 21c4.4 0 6.6-10 11-10s6.6 6 11 6" stroke="url(#cvg2)" stroke-width="2.1" stroke-linecap="round"/>' +
      '<circle cx="24.4" cy="17.2" r="2" fill="#22d3ee"/>' +
      '<defs><linearGradient id="cvg" x1="0" y1="0" x2="32" y2="32">' +
      '<stop stop-color="#22d3ee"/><stop offset="1" stop-color="#7c5cff"/></linearGradient>' +
      '<linearGradient id="cvg2" x1="5" y1="11" x2="27" y2="21">' +
      '<stop stop-color="#7dd3fc"/><stop offset="1" stop-color="#22d3ee"/></linearGradient></defs></svg>';
  }

  /* ============================================================ CHROME === */
  var NAV_LINKS = [
    { key: "nav_home", href: "index.html" },
    { key: "nav_find", href: "index.html#find" },
    { key: "nav_compare", href: "compare.html" },
    { key: "nav_advisor", href: "advisor.html" },
    { key: "nav_explore", href: "explore.html" },
    { key: "nav_stories", href: "index.html#stories" },
    { key: "nav_favorites", href: "index.html#favorites" },
  ];
  var PREVIEW_SCREENS = [
    { label: "Home", href: "index.html", id: "home" },
    { label: "Car page", href: "car.html", id: "car" },
    { label: "Advisor", href: "advisor.html", id: "advisor" },
    { label: "Compare", href: "compare.html", id: "compare" },
    { label: "Explore", href: "explore.html", id: "explore" },
    { label: "Mobile", href: "mobile.html", id: "mobile" },
    { label: "Design system", href: "design-system.html", id: "ds" },
  ];

  function navHTML(page) {
    var links = NAV_LINKS.map(function (l) {
      var active = (l.href.split("#")[0] === page) && l.href.indexOf("#") === -1;
      return '<a class="cv-nav__link" href="' + l.href + '"' + (active ? ' aria-current="page"' : "") +
        ' data-t="' + l.key + '"></a>';
    }).join("");

    return '' +
      '<a class="cv-skip" href="#main" data-t="nav_skip">Skip to content</a>' +
      '<header class="cv-nav" id="cvNav">' +
      '<div class="cv-nav__inner">' +
      '<a class="cv-logo" href="index.html" aria-label="CarVibes — home">' + logoMark(30) +
      '<span class="cv-logo__word">Car<b>Vibes</b></span></a>' +
      '<nav class="cv-nav__links" aria-label="Primary">' + links + "</nav>" +
      '<div class="cv-nav__actions">' +
      '<button class="cv-icon-btn" id="cvSearch" type="button" aria-label="' + t("nav_search") + '" data-t-aria="nav_search">' + icon("search", 18) + "</button>" +
      '<button class="cv-lang cv-nav__desktop-only" id="cvLang" type="button" aria-label="Language">' +
      icon("globe", 15) + '<span id="cvLangLabel">' + state.lang.toUpperCase() + "</span>" + icon("chevron", 13) + "</button>" +
      '<a class="cv-icon-btn cv-nav__desktop-only" href="index.html#favorites" aria-label="' + t("nav_favorites") + '" data-t-aria="nav_favorites">' +
      icon("heart", 18) + '<span class="cv-icon-btn__badge" id="cvFavCount" hidden>0</span></a>' +
      '<button class="cv-burger" id="cvBurger" type="button" aria-label="' + t("nav_menu") + '" data-t-aria="nav_menu" aria-expanded="false" aria-controls="cvDrawer">' +
      icon("menu", 20) + "</button>" +
      "</div></div></header>";
  }

  function drawerHTML() {
    var primary = NAV_LINKS.map(function (l) {
      var accent = l.key === "nav_advisor" ? " cv-drawer__link--accent" : "";
      return '<a class="cv-drawer__link' + accent + '" href="' + l.href + '"><span data-t="' + l.key + '"></span>' + icon("arrow", 16) + "</a>";
    }).join("");
    return '' +
      '<div class="cv-drawer" id="cvDrawer" role="dialog" aria-modal="true" aria-label="' + t("nav_menu") + '" hidden>' +
      '<div class="cv-drawer__scrim" data-close></div>' +
      '<div class="cv-drawer__panel">' +
      '<div class="cv-drawer__head">' +
      '<a class="cv-logo" href="index.html">' + logoMark(28) + '<span class="cv-logo__word">Car<b>Vibes</b></span></a>' +
      '<button class="cv-icon-btn" type="button" data-close aria-label="' + t("nav_close") + '" data-t-aria="nav_close">' + icon("close", 20) + "</button>" +
      "</div>" +
      '<div class="cv-drawer__body">' +
      '<div class="cv-drawer__group"><span class="mono-label" data-t="nav_group_discover"></span>' + primary + "</div>" +
      '<div class="cv-drawer__group"><span class="mono-label" data-t="nav_group_tools"></span>' +
      '<a class="cv-drawer__link" href="index.html#find"><span data-t="cta_find"></span>' + icon("arrow", 16) + "</a>" +
      '<a class="cv-drawer__link" href="compare.html"><span data-t="nav_compare"></span>' + icon("arrow", 16) + "</a>" +
      '<a class="cv-drawer__link" href="index.html#favorites"><span data-t="nav_favorites"></span>' + icon("arrow", 16) + "</a>" +
      "</div></div>" +
      '<div class="cv-drawer__foot">' +
      '<button class="cv-btn cv-btn--ghost cv-btn--block" id="cvLangMobile" type="button">' + icon("globe", 16) +
      '<span id="cvLangLabelMobile">' + state.lang.toUpperCase() + " · " + (I18N[baseLang()] || {}).label + "</span></button>" +
      '<a class="cv-btn cv-btn--primary cv-btn--block cv-mt-s" href="index.html#find"><span data-t="cta_find"></span>' + icon("arrow", 16) + "</a>" +
      "</div></div></div>";
  }

  function footerHTML() {
    return '' +
      '<footer class="cv-footer" id="footer">' +
      '<div class="cv-container"><div class="cv-footer__top">' +
      '<div class="cv-footer__brand">' +
      '<a class="cv-logo" href="index.html">' + logoMark(32) + '<span class="cv-logo__word" style="font-size:1.3rem">Car<b>Vibes</b></span></a>' +
      '<p data-t="footer_tag"></p>' +
      '<div class="cv-footer__cta"><input type="email" placeholder="' + t("footer_news_ph") + '" data-t-ph="footer_news_ph" aria-label="' + t("footer_news_ph") + '">' +
      '<button class="cv-btn cv-btn--primary cv-btn--sm" type="button"><span data-t="footer_news_cta"></span></button></div>' +
      "</div>" +
      '<div class="cv-footer__cols">' +
      '<div class="cv-footer__col"><h4 data-t="footer_col_explore"></h4>' +
      '<a href="explore.html" data-t="nav_explore"></a><a href="index.html#cars" data-t="cta_browse"></a>' +
      '<a href="compare.html" data-t="nav_compare"></a><a href="index.html#stories" data-t="nav_stories"></a></div>' +
      '<div class="cv-footer__col"><h4 data-t="footer_col_tools"></h4>' +
      '<a href="index.html#find" data-t="nav_find"></a><a href="advisor.html" data-t="nav_advisor"></a>' +
      '<a href="index.html#favorites" data-t="nav_favorites"></a><a href="index.html#compare" data-t="nav_compare"></a></div>' +
      '<div class="cv-footer__col"><h4 data-t="footer_col_company"></h4>' +
      '<a href="design-system.html">Design system</a><a href="#main" data-t="footer_contact"></a>' +
      '<a href="#main" data-t="footer_legal"></a><a href="#main" data-t="footer_privacy"></a></div>' +
      "</div></div>" +
      '<div class="cv-footer__bottom">' +
      '<span>© 2026 CarVibes — <span data-t="footer_rights"></span></span>' +
      '<div class="cv-footer__legal">' +
      '<a href="#main" data-t="footer_legal"></a><a href="#main" data-t="footer_privacy"></a>' +
      '<a href="#main" data-t="footer_cookies"></a><a href="#main" data-t="footer_contact"></a></div>' +
      '<div class="cv-footer__social">' +
      '<a class="cv-icon-btn" href="#main" aria-label="Instagram">' + icon("spark", 17) + "</a>" +
      '<a class="cv-icon-btn" href="#main" aria-label="YouTube">' + icon("play", 17) + "</a>" +
      '<a class="cv-icon-btn" href="#main" aria-label="Newsletter">' + icon("globe", 17) + "</a>" +
      "</div></div></div></footer>";
  }

  function previewBarHTML(page) {
    var links = PREVIEW_SCREENS.map(function (s) {
      return '<a class="cv-pv-link" href="' + s.href + '"' + (s.id === page ? ' aria-current="page"' : "") + ">" + s.label + "</a>";
    }).join("");
    return '<div class="cv-pv-bar" id="cvPvBar"' + (store("get", "cv2.hidebar") ? " hidden" : "") + '>' +
      '<div class="cv-pv-bar__inner">' +
      '<span class="cv-pv-bar__label">' + t("preview_label") + "</span>" + links +
      '<button class="cv-pv-bar__close" type="button" id="cvPvClose" aria-label="Hide preview navigation">' + icon("close", 15) + "</button>" +
      "</div></div>";
  }

  /* Preview chrome only: the switcher steps out of the way while reading. */
  function initPreviewBar() {
    var bar = qs("#cvPvBar");
    if (!bar) return;
    var close = qs("#cvPvClose", bar);
    if (close) {
      close.addEventListener("click", function () {
        bar.hidden = true;
        store("set", "cv2.hidebar", true);
      });
    }
    function onScroll() { bar.classList.toggle("is-quiet", window.scrollY > 320); }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  function ambientHTML() {
    return '<div class="cv-bg" aria-hidden="true">' +
      '<span class="cv-bg__halo cv-bg__halo--cyan"></span>' +
      '<span class="cv-bg__halo cv-bg__halo--blue"></span>' +
      '<span class="cv-bg__halo cv-bg__halo--violet"></span>' +
      '<span class="cv-bg__halo cv-bg__halo--magenta"></span>' +
      '<span class="cv-bg__grid"></span>' +
      '<canvas class="cv-bg__particles" id="cvParticles"></canvas>' +
      '<span class="cv-bg__grain"></span></div>';
  }

  /* ======================================================== CAR CARDS === */
  function cardHTML(c, index) {
    var cat = c.cats && c.cats[0] ? c.cats[0] : "daily";
    return '' +
      '<article class="cv-car" data-car="' + c.id + '" data-reveal style="--d:' + Math.min(index, 6) * 70 + 'ms">' +
      '<div class="cv-car__media">' +
      '<a href="car.html?car=' + c.id + '" aria-label="' + c.brand + " " + c.model + '">' +
      '<img src="' + c.image + '" alt="' + c.brand + " " + c.model + ' — ' + label(cat) + '" loading="lazy" decoding="async" width="1000" height="622">' +
      '<span class="cv-car__shade"></span>' +
      "</a>" +
      '<div class="cv-car__badges"><span class="cv-tag">' + label(cat) + '</span><span class="cv-tag cv-tag--cyan">' + c.year + "</span></div>" +
      '<div class="cv-car__tools">' +
      '<button class="cv-round-btn" type="button" data-fav="' + c.id + '" aria-label="' + t("detail_save") + '" data-t-aria="detail_save" aria-pressed="false">' + icon("heart", 17) + "</button>" +
      '<button class="cv-round-btn" type="button" data-cmp="' + c.id + '" aria-label="' + t("detail_compared") + '" data-t-aria="detail_compared" aria-pressed="false">' + icon("scale", 17) + "</button>" +
      "</div></div>" +
      '<div class="cv-car__body">' +
      '<div class="cv-car__head"><div>' +
      '<span class="cv-car__brand">' + c.brand + "</span>" +
      '<h3 class="cv-car__model">' + c.model + (c.trim ? '<span class="cv-car__trim">' + c.trim + "</span>" : "") + "</h3>" +
      "</div>" +
      '<span class="cv-car__price">' + money(c.price) + "</span></div>" +
      '<div class="cv-car__specs">' +
      '<span class="cv-car__spec">' + icon("bolt", 15) + "<b>" + c.hp + "</b> HP</span>" +
      '<span class="cv-car__spec">' + icon("snow", 15) + "<b>" + c.drive + "</b></span>" +
      '<span class="cv-car__spec">' + icon("gauge", 15) + "<b>" + label(c.trans) + "</b></span>" +
      "</div>" +
      '<div class="cv-car__more"><div><p><span>' + c.engine + "</span><span>0–100 · <b>" + c.zero.toFixed(1) + "s</b></span><span>" +
      c.top + " km/h</span></p></div></div>" +
      '<div class="cv-car__cta">' +
      '<a class="cv-link" href="car.html?car=' + c.id + '"><span data-t="cta_open"></span>' + icon("arrow", 15) + "</a>" +
      '<button class="cv-round-btn" type="button" data-cmp="' + c.id + '" aria-hidden="true" tabindex="-1">' + icon("scale", 16) + "</button>" +
      "</div></div></article>";
  }

  function renderCards(sel, list, layout) {
    var root = typeof sel === "string" ? qs(sel) : sel;
    if (!root) return;
    root.className = "cv-grid " + (layout || "cv-grid--3");
    root.innerHTML = list.map(cardHTML).join("");
    applyI18n(root);
    bindCardActions(root);
    observeReveal(root);
  }
  function renderRail(sel, list) {
    var root = typeof sel === "string" ? qs(sel) : sel;
    if (!root) return;
    root.className = "cv-rail";
    root.innerHTML = list.map(cardHTML).join("");
    applyI18n(root);
    bindCardActions(root);
    observeReveal(root);
  }

  /* ================================================= ADVISOR CONSOLE === */
  var ADVISOR_STEPS = [
    { q: "advisor_q1", k: "usage", choices: ["advisor_choice_daily", "advisor_choice_family", "advisor_choice_fun"] },
    { q: "advisor_q2", k: "budget", choices: ["advisor_choice_b1", "advisor_choice_b2", "advisor_choice_b3"] },
    { q: "advisor_q3", k: "fuel", choices: ["advisor_choice_f1", "advisor_choice_f2", "advisor_choice_f3"] },
  ];

  function matchScore(c, i) {
    /* Deterministic demo scoring — the real engine stays in the app. */
    var base = 96 - i * 7 - (c.price > 140000 ? 6 : 0) - (c.weight > 2200 ? 5 : 0);
    return Math.max(72, Math.min(98, base));
  }

  function initAdvisor(sel, compact) {
    var root = typeof sel === "string" ? qs(sel) : sel;
    if (!root) return;
    var step = 0;
    var answers = {};

    root.innerHTML = '' +
      '<div class="cv-console">' +
      '<div class="cv-console__inner">' +
      '<div class="cv-console__bar">' +
      '<span class="cv-console__live"><span class="cv-dot"></span><span data-t="advisor_live"></span></span>' +
      '<span class="mono-label">01 / 03</span>' +
      "</div>" +
      '<div class="cv-console__body">' +
      '<div class="cv-progress"><span class="mono-label" id="cvAdvStep">01</span>' +
      '<span class="cv-progress__rail"><span class="cv-progress__fill" id="cvAdvFill"></span></span>' +
      '<span class="mono-label">03</span></div>' +
      '<div class="cv-stack" id="cvAdvThread" style="--gap:14px"></div>' +
      '<div class="cv-choices" id="cvAdvChoices"></div>' +
      "</div></div></div>";
    applyI18n(root);

    var thread = qs("#cvAdvThread", root);
    var choices = qs("#cvAdvChoices", root);
    var fill = qs("#cvAdvFill", root);
    var stepLabel = qs("#cvAdvStep", root);

    function bubble(kind, html) {
      var el = document.createElement("div");
      el.className = "cv-bubble cv-bubble--" + kind;
      el.innerHTML = html;
      thread.appendChild(el);
      return el;
    }

    function ask() {
      var s = ADVISOR_STEPS[step];
      if (!s) return finish();
      stepLabel.textContent = "0" + (step + 1);
      fill.style.width = (step / 3) * 100 + "%";
      var typing = bubble("assistant", '<span class="cv-typing"><i></i><i></i><i></i></span>');
      window.setTimeout(function () {
        typing.innerHTML = t(s.q);
        renderChoices(s);
      }, step === 0 ? 320 : 620);
    }

    function renderChoices(s) {
      choices.innerHTML = s.choices.map(function (key) {
        return '<button class="cv-chip" type="button" data-choice="' + key + '">' + t(key) + "</button>";
      }).join("");
      qsa("[data-choice]", choices).forEach(function (btn) {
        btn.addEventListener("click", function () {
          answers[s.k] = btn.getAttribute("data-choice");
          choices.innerHTML = "";
          bubble("user", t(btn.getAttribute("data-choice")));
          if (step === 0) {
            var intro = bubble("assistant", "");
            var full = t("advisor_a1");
            var i = 0;
            var timer = window.setInterval(function () {
              intro.textContent = full.slice(0, ++i);
              if (i >= full.length) {
                window.clearInterval(timer);
                step++;
                window.setTimeout(ask, 260);
              }
            }, 14);
          } else {
            step++;
            ask();
          }
        });
      });
    }

    function finish() {
      fill.style.width = "100%";
      stepLabel.textContent = "03";
      var picked = CARS.slice();
      if (answers.fuel === "advisor_choice_f3") {
        var ev = picked.filter(function (c) { return c.fuel === "Electric"; });
        if (ev.length) picked = ev.concat(picked.filter(function (c) { return c.fuel !== "Electric"; }));
      }
      if (answers.budget === "advisor_choice_b1") picked.sort(function (a, b) { return a.price - b.price; });
      var top = picked.slice(0, compact ? 2 : 3);

      bubble("assistant", t("advisor_matches") + ":");
      var list = document.createElement("div");
      list.className = "cv-stack";
      list.style.setProperty("--gap", "10px");
      list.innerHTML = top.map(function (c, i) {
        return '<a class="cv-match" href="car.html?car=' + c.id + '">' +
          '<img src="' + c.image + '" alt="" loading="lazy" width="76" height="54">' +
          '<span class="cv-match__meta"><b>' + c.brand + " " + c.model + "</b><span>" + money(c.price) + " · " + c.hp + " HP · " + c.drive + "</span></span>" +
          '<span class="cv-match__score">' + matchScore(c, i) + "%</span></a>";
      }).join("");
      thread.appendChild(list);

      choices.innerHTML = '<a class="cv-btn cv-btn--primary cv-btn--sm" href="advisor.html"><span data-t="advisor_see_all"></span>' + icon("arrow", 15) + "</a>" +
        '<button class="cv-chip" type="button" id="cvAdvReset">' + "↻" + "</button>";
      applyI18n(choices);
      qs("#cvAdvReset", choices).addEventListener("click", function () {
        step = 0;
        answers = {};
        thread.innerHTML = "";
        choices.innerHTML = "";
        ask();
      });
    }

    ask();
  }

  /* ========================================================== COMPARE === */
  function metricRow(m, carA, carB) {
    var a = m.a, b = m.b;
    var max = Math.max(a, b) || 1;
    var aWin = m.higher ? a > b : a < b;
    var bWin = m.higher ? b > a : b < a;
    var fmt = m.fmt || function (v) { return v; };
    return '' +
      '<div class="cv-metric">' +
      '<span class="cv-metric__label">' + t(m.label) + (m.hint ? " · " + m.hint : "") + "</span>" +
      '<span class="cv-metric__v cv-metric__v--left' + (aWin ? " cv-metric__v--win" : "") + '">' + fmt(a) + "</span>" +
      '<span class="cv-metric__bar">' +
      '<span class="cv-metric__rail"><span class="cv-metric__fill cv-metric__fill--l" style="width:' + (a / max) * 100 + '%"></span></span>' +
      '<span class="cv-metric__rail"><span class="cv-metric__fill cv-metric__fill--r" style="width:' + (b / max) * 100 + '%"></span></span>' +
      "</span>" +
      '<span class="cv-metric__v' + (bWin ? " cv-metric__v--win" : "") + '">' + fmt(b) + "</span>" +
      "</div>";
  }

  function renderCompare(sel, idA, idB, metricKeys) {
    var root = typeof sel === "string" ? qs(sel) : sel;
    if (!root) return;
    var A = car(idA), B = car(idB);
    var defs = {
      power: { label: "metric_power", a: A.hp, b: B.hp, higher: true, fmt: function (v) { return v + " HP"; } },
      zero: { label: "metric_zero", a: A.zero, b: B.zero, higher: false, fmt: function (v) { return v.toFixed(1) + "s"; } },
      top: { label: "metric_top", a: A.top, b: B.top, higher: true, fmt: function (v) { return v + " km/h"; } },
      price: { label: "metric_price", a: A.price, b: B.price, higher: false, fmt: money },
      weight: { label: "metric_weight", a: A.weight, b: B.weight, higher: false, fmt: function (v) { return v + " kg"; } },
      torque: { label: "metric_torque", a: A.torque, b: B.torque, higher: true, fmt: function (v) { return v + " Nm"; } },
    };
    var keys = metricKeys || ["power", "zero", "top", "price"];

    root.innerHTML = '' +
      '<div class="cv-compare__stage" data-reveal>' +
      compareCardHTML(A) +
      '<span class="cv-compare__vs">' + t("compare_vs") + "</span>" +
      compareCardHTML(B) +
      "</div>" +
      '<div class="cv-metrics" data-reveal style="--d:80ms">' +
      keys.map(function (k) { return metricRow(defs[k], A, B); }).join("") +
      "</div>" +
      '<div class="cv-row cv-wrap cv-mt-m" style="gap:10px" data-reveal>' +
      '<span class="cv-tag cv-tag--cyan"><span class="cv-dot"></span>' + t("compare_winner") + "</span>" +
      '<span class="cv-chip">' + A.brand + " " + A.model + " · " + t("metric_power") + " " + A.hp + " HP</span>" +
      '<span class="cv-chip">' + B.brand + " " + B.model + " · " + t("metric_power") + " " + B.hp + " HP</span>" +
      '<a class="cv-btn cv-btn--primary cv-btn--sm" href="compare.html"><span data-t="compare_cta"></span>' + icon("arrow", 15) + "</a>" +
      "</div>";
    observeReveal(root);
    applyI18n(root);
  }

  function compareCardHTML(c) {
    return '<article class="cv-compare__card">' +
      '<img src="' + c.image + '" alt="' + c.brand + " " + c.model + '" loading="lazy" width="1000" height="622">' +
      '<div class="cv-compare__card__body">' +
      '<span class="cv-car__brand">' + c.brand + "</span>" +
      '<h3 class="cv-car__model">' + c.model + "</h3>" +
      '<div class="cv-row cv-between cv-mt-s"><span class="cv-car__price">' + money(c.price) + "</span>" +
      '<a class="cv-link" href="car.html?car=' + c.id + '"><span data-t="cta_details"></span>' + icon("arrow", 15) + "</a></div>" +
      "</div></article>";
  }

  /* ========================================================== EXPLORE === */
  var EXPLORE_TILES = [
    { span: "cv-tile--span7 cv-tile--tall", img: "assets/img/car-911.jpg", title: "Legends", text: "Timeless silhouettes, six decades of evolution.", meta: "48 cars", href: "explore.html" },
    { span: "cv-tile--span5", img: "assets/img/car-ev.jpg", title: "Electric", text: "800-volt silence and instant torque.", meta: "96 cars", href: "explore.html" },
    { span: "cv-tile--span5", img: "assets/img/car-jdm.jpg", title: "JDM", text: "Compact, tunable, endlessly characterful.", meta: "37 cars", href: "explore.html" },
    { span: "cv-tile--span7", img: "assets/img/car-wagon.jpg", title: "Everyday heroes", text: "Estates and daily drivers that still entertain.", meta: "128 cars", href: "explore.html" },
  ];

  function renderExplore(sel, limit) {
    var root = typeof sel === "string" ? qs(sel) : sel;
    if (!root) return;
    root.className = "cv-mosaic";
    root.innerHTML = EXPLORE_TILES.slice(0, limit || EXPLORE_TILES.length).map(function (x, i) {
      return '<a class="cv-tile ' + x.span + '" href="' + x.href + '" data-reveal style="--d:' + i * 80 + 'ms">' +
        '<img src="' + x.img + '" alt="" loading="lazy" decoding="async" width="1000" height="622">' +
        "<h3>" + x.title + "</h3><p>" + x.text + "</p>" +
        '<span class="cv-tile__meta"><span class="cv-tag cv-tag--cyan">' + x.meta + "</span>" +
        '<span class="cv-link">' + t("explore_cta") + icon("upRight", 14) + "</span></span></a>";
    }).join("");
    applyI18n(root);
    observeReveal(root);
  }

  /* ========================================================== STORIES === */
  function renderStories(sel) {
    var root = typeof sel === "string" ? qs(sel) : sel;
    if (!root) return;
    root.className = "cv-grid cv-grid--3";
    root.innerHTML = (window.CV2_STORIES || []).map(function (s, i) {
      return '<a class="cv-story" href="#" data-reveal style="--d:' + i * 70 + 'ms">' +
        '<span class="cv-story__media"><img src="' + s.image + '" alt="" loading="lazy" width="1000" height="622"></span>' +
        '<span class="cv-story__meta"><span class="cv-tag">' + s.tag + "</span>" + s.minutes + " " + t("story_min") + "</span>" +
        "<h3>" + s.title + "</h3>" +
        '<span class="cv-link">' + t("story_read") + icon("arrow", 14) + "</span></a>";
    }).join("");
    applyI18n(root);
    observeReveal(root);
  }

  /* =================================================== MICRO-ACTIONS === */
  function bindCardActions(root) {
    qsa("[data-fav]", root).forEach(function (btn) {
      var id = btn.getAttribute("data-fav");
      var on = state.favs.indexOf(id) > -1;
      btn.classList.toggle("is-on", on);
      btn.setAttribute("aria-pressed", String(on));
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        toggle(state.favs, id);
        store("set", "cv2.favs", state.favs);
        var now = state.favs.indexOf(id) > -1;
        btn.classList.toggle("is-on", now);
        btn.setAttribute("aria-pressed", String(now));
        syncCounters();
        pulse(btn);
        if (window.location.hash === "#favorites") renderFavorites();
      });
    });
    qsa("[data-cmp]", root).forEach(function (btn) {
      var id = btn.getAttribute("data-cmp");
      var on = state.compare.indexOf(id) > -1;
      btn.classList.toggle("is-on", on);
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        toggle(state.compare, id);
        store("set", "cv2.compare", state.compare);
        syncCounters();
        pulse(btn);
        if (btn.getAttribute("aria-hidden") !== "true") {
          btn.classList.toggle("is-on", state.compare.indexOf(id) > -1);
        }
        renderCompareBar();
      });
    });
  }

  function toggle(arr, id) {
    var i = arr.indexOf(id);
    if (i > -1) arr.splice(i, 1); else arr.push(id);
    return arr;
  }
  function pulse(el) {
    if (!el.animate) return; /* Web Animations API unavailable */
    el.animate(
      [{ transform: "scale(1)" }, { transform: "scale(1.18)" }, { transform: "scale(1)" }],
      { duration: 260, easing: "cubic-bezier(.16,1,.3,1)" }
    );
  }

  function syncCounters() {
    qsa("[data-cmp]").forEach(function (b) {
      b.classList.toggle("is-on", state.compare.indexOf(b.getAttribute("data-cmp")) > -1);
    });
    qsa("[data-fav]").forEach(function (b) {
      b.classList.toggle("is-on", state.favs.indexOf(b.getAttribute("data-fav")) > -1);
    });
    var badge = qs("#cvFavCount");
    if (badge) {
      badge.textContent = String(state.favs.length);
      badge.hidden = state.favs.length === 0;
    }
    var cmpBadge = qs("#cvCmpCount");
    if (cmpBadge) {
      cmpBadge.textContent = String(state.compare.length);
      cmpBadge.hidden = state.compare.length === 0;
    }
  }

  /* Floating compare tray — shows the selection building up */
  function renderCompareBar() {
    var bar = qs("#cvCompareBar");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "cvCompareBar";
      bar.style.cssText = "position:fixed;z-index:150;inset-inline-start:var(--gutter);bottom:96px;max-width:min(560px,92vw)";
      document.body.appendChild(bar);
    }
    if (!state.compare.length) {
      bar.innerHTML = "";
      return;
    }
    bar.className = "cv-glass cv-page-in";
    bar.style.cssText += ";display:flex;gap:12px;align-items:center;padding:10px 12px;border-radius:18px;box-shadow:var(--shadow-card)";
    bar.innerHTML =
      '<span class="mono-label" style="padding-inline-start:6px">Compare</span>' +
      state.compare.map(function (id) {
        var c = car(id);
        return '<span class="cv-tag" style="padding-inline:8px 6px"><img src="' + c.image + '" alt="" width="26" height="20" style="border-radius:5px;object-fit:cover">' +
          c.brand + " " + c.model.split(" ")[0] +
          '<button type="button" data-unrm="' + id + '" aria-label="Remove" style="color:var(--fog)">' + icon("close", 12) + "</button></span>";
      }).join("") +
      '<a class="cv-btn cv-btn--primary cv-btn--sm" href="compare.html">' + icon("scale", 15) + "<span data-t=\"compare_cta\"></span></a>";
    applyI18n(bar);
    qsa("[data-unrm]", bar).forEach(function (b) {
      b.addEventListener("click", function () {
        toggle(state.compare, b.getAttribute("data-unrm"));
        store("set", "cv2.compare", state.compare);
        syncCounters();
        renderCompareBar();
      });
    });
  }

  /* Favorites section — appears when at least one car is saved */
  function renderFavorites() {
    var root = qs("#cvFavs");
    if (!root) return;
    var list = state.favs.map(car).filter(Boolean);
    var empty = qs("#cvFavsEmpty");
    if (!list.length) {
      /* Empty garage: suggest a few cars instead of leaving a void. */
      if (empty) empty.hidden = false; /* copy comes from data-t via i18n */
      renderRail(root, CARS.slice(0, 3));
      return;
    }
    if (empty) empty.hidden = true;
    renderRail(root, list);
  }

  /* ==================================================== GLOBAL SEARCH === */
  function initSearch() {
    var overlay = document.createElement("div");
    overlay.className = "cv-drawer";
    overlay.id = "cvSearchOverlay";
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="cv-drawer__scrim" data-close></div>' +
      '<div class="cv-drawer__panel" style="width:min(680px,94vw)">' +
      '<div class="cv-drawer__head">' +
      '<span class="eyebrow" data-t="nav_search"></span>' +
      '<button class="cv-icon-btn" type="button" data-close aria-label="Close">' + icon("close", 20) + "</button></div>" +
      '<div class="cv-drawer__body">' +
      '<div class="cv-find__search" style="margin-bottom:18px">' + icon("search", 18) +
      '<input id="cvSearchInput" type="search" placeholder="' + t("find_placeholder") + '" data-t-ph="find_placeholder"></div>' +
      '<span class="mono-label">' + t("cars_eyebrow") + "</span>" +
      '<div class="cv-scroll-x cv-mt-s" id="cvSearchChips"></div>' +
      '<div class="cv-stack cv-mt-m" id="cvSearchResults" style="--gap:10px"></div>' +
      "</div></div>";
    document.body.appendChild(overlay);
    applyI18n(overlay);

    function results(q) {
      var box = qs("#cvSearchResults", overlay);
      var query = (q || "").toLowerCase().trim();
      var list = CARS.filter(function (c) {
        return !query || (c.brand + " " + c.model + " " + c.body + " " + c.cats.join(" ")).toLowerCase().indexOf(query) > -1;
      }).slice(0, 4);
      box.innerHTML = list.map(function (c) {
        return '<a class="cv-match" href="car.html?car=' + c.id + '">' +
          '<img src="' + c.image + '" alt="" loading="lazy" width="76" height="54">' +
          '<span class="cv-match__meta"><b>' + c.brand + " " + c.model + '</b><span>' + c.hp + " HP · " + label(c.trans) + " · " + label(c.fuel) + "</span></span>" +
          '<span class="cv-match__score">' + money(c.price) + "</span></a>";
      }).join("");
    }
    results("");

    var chips = qs("#cvSearchChips", overlay);
    ["Supercars", "Electric", "SUV", "JDM", "Manual"].forEach(function (c) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "cv-chip";
      b.textContent = c;
      b.addEventListener("click", function () {
        qs("#cvSearchInput", overlay).value = c === "Supercars" ? "supercar" : c;
        results(c);
      });
      chips.appendChild(b);
    });

    qs("#cvSearchInput", overlay).addEventListener("input", function (e) { results(e.target.value); });

    function open() {
      overlay.hidden = false;
      overlay.classList.add("is-open");
      document.body.style.overflow = "hidden";
      window.setTimeout(function () { qs("#cvSearchInput", overlay).focus(); }, 60);
    }
    function close() {
      overlay.classList.remove("is-open");
      overlay.hidden = true;
      document.body.style.overflow = "";
    }
    qs("#cvSearch").addEventListener("click", open);
    qsa("[data-close]", overlay).forEach(function (b) { b.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") close();
      if (e.key === "/" && overlay.hidden && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        open();
      }
    });
    return { open: open, close: close };
  }

  /* ================================================ AMBIENT / MOTION === */
  function initParticles() {
    var canvas = qs("#cvParticles");
    if (!canvas || window.innerWidth <= 640) return;
    if (mq("(prefers-reduced-motion: reduce)")) return;
    var ctx = canvas.getContext("2d");
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0;
    var pts = [];
    var palette = ["34,211,238", "125,211,252", "124,92,255", "224,72,160"];

    function resize() {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function seed() {
      pts = [];
      var count = w < 1000 ? 20 : 34;
      for (var i = 0; i < count; i++) {
        pts.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.5 + 0.5,
          vx: (Math.random() - 0.5) * 0.13,
          vy: -Math.random() * 0.16 - 0.03,
          a: Math.random() * 0.35 + 0.12,
          c: palette[i % palette.length],
        });
      }
    }
    var raf = 0;
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < pts.length; i++) {
        var p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        ctx.beginPath();
        ctx.fillStyle = "rgba(" + p.c + "," + p.a + ")";
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      raf = window.requestAnimationFrame(frame);
    }
    function start() { if (!raf) raf = window.requestAnimationFrame(frame); }
    function stop() { if (raf) { window.cancelAnimationFrame(raf); raf = 0; } }

    resize(); seed(); start();
    window.addEventListener("resize", function () { resize(); seed(); }, { passive: true });
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) stop(); else start();
    });
  }

  var revealObserver = null;
  function observeReveal(root) {
    if (!("IntersectionObserver" in window)) {
      qsa("[data-reveal]", root || document).forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) {
            en.target.classList.add("is-in");
            revealObserver.unobserve(en.target);
          }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    }
    qsa("[data-reveal]", root || document).forEach(function (el) {
      if (!el.classList.contains("is-in")) revealObserver.observe(el);
    });
  }

  function initNav() {
    var nav = qs("#cvNav");
    function onScroll() {
      if (!nav) return;
      nav.classList.toggle("is-stuck", window.scrollY > 10);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    var drawer = qs("#cvDrawer");
    var burger = qs("#cvBurger");
    function close() {
      drawer.classList.remove("is-open");
      drawer.hidden = true;
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    }
    function open() {
      drawer.hidden = false;
      drawer.classList.add("is-open");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
      var first = qs(".cv-drawer__link", drawer);
      if (first) window.setTimeout(function () { first.focus(); }, 80);
    }
    burger.addEventListener("click", function () {
      if (drawer.classList.contains("is-open")) close(); else open();
    });
    qsa("[data-close]", drawer).forEach(function (b) { b.addEventListener("click", close); });
    qsa(".cv-drawer__link", drawer).forEach(function (a) { a.addEventListener("click", close); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") close(); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1080) close(); });
  }

  function initParallax() {
    if (mq("(prefers-reduced-motion: reduce)")) return;
    var stage = qs("[data-parallax]");
    if (!stage) return;
    var ticking = false;
    function update() {
      ticking = false;
      if (window.innerWidth <= 1024) { stage.style.transform = ""; return; }
      var y = Math.min(window.scrollY, 900);
      stage.style.transform = "translate3d(0," + (y * -0.055).toFixed(2) + "px,0) scale(" + (1 + y * 0.00006).toFixed(4) + ")";
    }
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  /* =========================================================== I18N ==== */
  function applyI18n(root) {
    qsa("[data-t]", root || document).forEach(function (el) { el.textContent = t(el.getAttribute("data-t")); });
    qsa("[data-t-ph]", root || document).forEach(function (el) { el.placeholder = t(el.getAttribute("data-t-ph")); });
    qsa("[data-t-aria]", root || document).forEach(function (el) { el.setAttribute("aria-label", t(el.getAttribute("data-t-aria"))); });
  }

  function setLang(lang) {
    state.lang = lang;
    store("set", "cv2.lang", lang);
    document.documentElement.lang = baseLang();
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    var lbl = qs("#cvLangLabel");
    if (lbl) lbl.textContent = lang.toUpperCase();
    var lblM = qs("#cvLangLabelMobile");
    if (lblM) lblM.textContent = lang.toUpperCase() + " · " + (I18N[baseLang()] || {}).label;
    applyI18n();
    renderAll();
  }

  function initLang() {
    function cycle() {
      var i = LANG_ORDER.indexOf(state.lang);
      setLang(LANG_ORDER[(i + 1) % LANG_ORDER.length]);
    }
    var a = qs("#cvLang"), b = qs("#cvLangMobile");
    if (a) a.addEventListener("click", cycle);
    if (b) b.addEventListener("click", cycle);
    document.documentElement.lang = baseLang();
    document.documentElement.dir = state.lang === "ar" ? "rtl" : "ltr";
  }

  /* ================================================= PAGE COMPOSITION === */
  function renderAll() {
    /* Rebuild every JS-generated view so a language change is total. */
    if (qs("#homeCards")) renderCards("#homeCards", CARS.slice(0, 6), "cv-grid--3");
    if (qs("#trendRail")) renderRail("#trendRail", CARS.slice(0, 4));
    if (qs("#exploreMosaic")) renderExplore("#exploreMosaic", 4);
    if (qs("#homeStories")) renderStories("#homeStories");
    if (qs("#compareDemo")) renderCompare("#compareDemo", "bmw-m3-competition", "porsche-911-carrera-s", ["power", "zero", "top", "price"]);
    if (qs("#compareFull")) renderCompare("#compareFull", "bmw-m4-competition", "audi-rs6-avant-performance", ["power", "zero", "top", "torque", "price", "weight"]);
    if (qs("#cvAdvisorConsole")) initAdvisor("#cvAdvisorConsole", false);
    if (qs("#cvAdvisorConsoleBig")) initAdvisor("#cvAdvisorConsoleBig", false);
    if (qs("#advisorCars")) renderCards("#advisorCars", CARS.slice(0, 3), "cv-grid--3");
    if (qs("#cvFavs") && state.favs.length) renderFavorites();
    /* Car detail page */
    if (document.body.dataset.page === "car") renderDetail();
    syncCounters();
    renderCompareBar();
  }

  /* ------------------------------------------------- CAR DETAIL PAGE --- */
  function renderDetail() {
    var c = car(param("car") || "bmw-m4-competition");
    document.title = c.brand + " " + c.model + " — CarVibes (preview)";

    var setText = function (sel, value) {
      var el = qs(sel);
      if (el) el.textContent = value;
    };
    setText("#dcrumb", c.brand + " / " + c.body + " / " + c.year);
    setText("#dbrand", c.brand);
    setText("#dmodel", c.model + (c.trim ? " " + c.trim : ""));
    setText("#dprice", money(c.price));
    setText("#dfinance", "from " + money(Math.round(c.price / 72)) + "/month · 72 months");
    var hero = qs("#dimage");
    if (hero) { hero.src = c.image; hero.alt = c.brand + " " + c.model; }
    setText("#dtagline", c.tagline);
    setText("#doverview", c.overview);
    setText("#dengineText", c.engine);

    var specs = [
      { label: "detail_power", value: c.hp, unit: "HP", bar: Math.min(100, (c.hp / 700) * 100) },
      { label: "detail_torque", value: c.torque, unit: "Nm", bar: Math.min(100, (c.torque / 950) * 100) },
      { label: "detail_accel", value: c.zero.toFixed(1), unit: "s", bar: Math.min(100, (7 / c.zero) * 45) },
      { label: "detail_top", value: c.top, unit: "km/h", bar: Math.min(100, (c.top / 330) * 100) },
      { label: "detail_engine", value: c.engine, unit: "" },
      { label: "detail_trans", value: label(c.trans), unit: "" },
      { label: "detail_drive", value: c.drive, unit: "" },
      { label: "detail_weight", value: c.weight, unit: "kg", bar: Math.min(100, (c.weight / 2600) * 100) },
    ];
    var grid = qs("#dspecs");
    if (grid) {
      grid.innerHTML = specs.map(function (s) {
        var shown = typeof s.value === "number" ? s.value.toLocaleString("en-US") : s.value;
        return '<div class="cv-spec"><span class="cv-spec__label">' + t(s.label) + "</span>" +
          '<div class="cv-spec__value">' + shown + (s.unit ? "<small>" + s.unit + "</small>" : "") + "</div>" +
          (s.bar != null ? '<div class="cv-spec__bar"><i style="width:' + s.bar + '%"></i></div>' : "") + "</div>";
      }).join("");
    }

    var why = qs("#dwhy");
    if (why) {
      why.innerHTML = c.why.map(function (w) {
        return '<div class="cv-why__card" data-reveal><i>' + icon(w.icon, 19) + "</i><h4>" + w.title + "</h4><p>" + w.text + "</p></div>";
      }).join("");
    }

    var bars = qs("#dbars");
    if (bars) {
      bars.innerHTML = Object.keys(c.scores).map(function (k) {
        var names = { performance: "Performance", comfort: "Comfort", efficiency: "Efficiency", practicality: "Practicality", tech: "Technology" };
        return '<div class="cv-bar-row"><span>' + names[k] + '</span><span class="cv-bar"><i style="width:' + c.scores[k] + '%"></i></span><b>' + c.scores[k] + "</b></div>";
      }).join("");
    }

    var pros = qs("#dpros"), cons = qs("#dcons");
    if (pros) pros.innerHTML = c.pros.map(function (p) { return "<li>" + icon("check", 15) + "<span>" + p + "</span></li>"; }).join("");
    if (cons) cons.innerHTML = c.cons.map(function (p) { return "<li>" + icon("minus", 15) + "<span>" + p + "</span></li>"; }).join("");

    var similar = CARS.filter(function (x) { return x.id !== c.id && (x.body === c.body || x.cats[0] === c.cats[0]); });
    var pool = similar.length >= 3 ? similar : CARS.filter(function (x) { return x.id !== c.id; });
    if (qs("#dsimilar")) renderCards("#dsimilar", pool.slice(0, 3), "cv-grid--3");

    /* Gallery thumbs reuse the preview imagery (real project uses car.gallery) */
    var gallery = [c.image, "assets/img/interior.jpg", "assets/img/detail-hero.jpg"];
    var thumbs = qs("#dthumbs");
    if (thumbs) {
      thumbs.innerHTML = gallery.map(function (src, i) {
        return '<button type="button" class="' + (i === 0 ? "is-active" : "") + '" data-gal="' + src + '"><img src="' + src + '" alt="" loading="lazy" width="108" height="68"></button>';
      }).join("");
      qsa("[data-gal]", thumbs).forEach(function (b) {
        b.addEventListener("click", function () {
          qsa("button", thumbs).forEach(function (x) { x.classList.remove("is-active"); });
          b.classList.add("is-active");
          var img = qs("#dimage");
          img.style.opacity = "0";
          window.setTimeout(function () {
            img.src = b.getAttribute("data-gal");
            img.style.transition = "opacity var(--t) var(--ease)";
            img.style.opacity = "1";
          }, 130);
        });
      });
    }

    var actions = qs("#dactions");
    if (actions) {
      actions.innerHTML =
        '<button class="cv-btn cv-btn--primary cv-btn--lg" type="button">' + icon("bolt", 18) + '<span data-t="detail_buy"></span></button>' +
        '<button class="cv-btn cv-btn--ghost cv-btn--lg" type="button" data-fav="' + c.id + '">' + icon("heart", 18) + '<span data-t="detail_save"></span></button>' +
        '<button class="cv-btn cv-btn--ghost cv-btn--lg" type="button" data-cmp="' + c.id + '">' + icon("scale", 18) + '<span data-t="detail_compared"></span></button>';
      bindCardActions(actions);
      applyI18n(actions);
    }
    observeReveal(document);
  }

  /* ----------------------------------------------------- FILTER TABS --- */
  function initFilters() {
    var bar = qs("#carFilters");
    if (!bar) return;
    var cats = [
      { key: "filter_all", match: null },
      { key: "filter_sports", match: "sports" },
      { key: "filter_electric", match: "electric" },
      { key: "filter_suv", match: "suv" },
      { key: "filter_jdm", match: "jdm" },
    ];
    bar.innerHTML = cats.map(function (c, i) {
      return '<button class="cv-chip' + (i === 0 ? " is-active" : "") + '" type="button" data-filter="' +
        (c.match || "all") + '" aria-pressed="' + (i === 0) + '" data-t="' + c.key + '"></button>';
    }).join("");
    applyI18n(bar);
    qsa("[data-filter]", bar).forEach(function (btn) {
      btn.addEventListener("click", function () {
        qsa("[data-filter]", bar).forEach(function (b) { b.classList.remove("is-active"); b.setAttribute("aria-pressed", "false"); });
        btn.classList.add("is-active");
        btn.setAttribute("aria-pressed", "true");
        var f = btn.getAttribute("data-filter");
        var list = f === "all" ? CARS : CARS.filter(function (c) { return c.cats.indexOf(f) > -1; });
        renderCards("#homeCards", list.slice(0, 6), "cv-grid--3");
        applyI18n();
      });
    });
  }

  /* ============================================================== BOOT === */
  function boot() {
    var page = document.body.dataset.page || "home";

    /* Ambient depth + shared chrome. Injected so every screen stays DRY. */
    document.body.insertAdjacentHTML("afterbegin", ambientHTML());
    var shellTarget = qs("#cvChromeTop") || document.body;
    shellTarget.insertAdjacentHTML("afterbegin", navHTML(page) + drawerHTML());
    if (!qs("#cvNoFooter")) document.body.insertAdjacentHTML("beforeend", footerHTML());
    document.body.insertAdjacentHTML("beforeend", previewBarHTML(page));

    /* Each step is isolated: an optional flourish failing (canvas, smooth
       scroll, an unsupported API) must never leave the page half-rendered. */
    function safe(fn) { try { fn(); } catch (e) { if (window.console) console.warn("[preview]", e); } }

    applyI18n();
    safe(initNav);
    safe(initLang);
    safe(initParticles);
    safe(initParallax);
    safe(initSearch);
    safe(initFilters);
    safe(initPreviewBar);
    renderAll();
    observeReveal(document);
    syncCounters();
    renderFavorites();

    if (history.scrollRestoration) history.scrollRestoration = "manual";
    qs("#main") && qs("#main").classList.add("cv-page-in");

    /* Smooth anchor scrolling that accounts for the sticky navbar. */
    qsa('a[href^="#"]:not([href="#"])').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var target = qs(a.getAttribute("href"));
        if (!target) return;
        e.preventDefault();
        var top = target.getBoundingClientRect().top + window.scrollY - 84;
        window.scrollTo({ top: top, behavior: "smooth" });
      });
    });
  }

  window.CV2 = {
    t: t, icon: icon, car: car, money: money, state: state,
    renderCards: renderCards, renderRail: renderRail, renderCompare: renderCompare,
    renderExplore: renderExplore, renderStories: renderStories, initAdvisor: initAdvisor,
    applyI18n: applyI18n, observeReveal: observeReveal, renderCompareBar: renderCompareBar,
    setLang: setLang,
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
