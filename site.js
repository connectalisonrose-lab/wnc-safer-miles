/* WNC Safer Miles — shared behaviour for every page.
   Language helpers and the site bar, tabs, Quick exit, Larger text, Back to top.
   Loaded before each page's own script, which owns that page's text. */
(function () {
  window.SM = window.SM || {};

  /* Which language to show: ?lang= wins, then what this browser chose last, then the browser's own. */
  SM.readLang = function () {
    let l = "en";
    try {
      const q = new URLSearchParams(location.search).get("lang");
      if (q === "es" || q === "en") return q;
      const s = localStorage.getItem("sm-lang");
      if (s === "es" || s === "en") return s;
      if ((navigator.language || "").toLowerCase().startsWith("es")) return "es";
    } catch (e) {}
    return l;
  };

  /* The site bar: labels and links follow the reader's language from page to page. */
  SM.paintNav = function (lang) {
    document.querySelectorAll(".sitenav [data-p]").forEach(a => {
      const p = a.dataset.p;
      a.setAttribute("href", lang === "es" ? (p === "./" ? "./?lang=es" : p + "?lang=es") : p);
      if (a.dataset.en) a.textContent = lang === "es" ? a.dataset.es : a.dataset.en;
    });
    document.querySelectorAll('a[href^="help.html"],a[href^="roots.html"],a[href^="evidence.html"],a[href^="watch.html"]')
      .forEach(a => {
        if (a.closest(".sitenav")) return;
        const u = a.getAttribute("href").split("?")[0].split("#");
        const hash = u[1] ? "#" + u[1] : "";
        a.setAttribute("href", lang === "es" ? u[0] + "?lang=es" + hash : u[0] + hash);
      });
    const b = document.getElementById("langbtn");
    if (b) {
      b.textContent = lang === "en" ? "Español" : "English";
      b.setAttribute("lang", lang === "en" ? "es" : "en");
      b.setAttribute("aria-label", lang === "en" ? "Ver en español" : "View in English");
    }
  };

  /* Tabs: one topic at a time; an in-page link opens the right tab and any fold around it. */
  window.openTab = function (id, focusTab) {
    const pn = document.getElementById(id);
    if (!pn || pn.getAttribute("role") !== "tabpanel") return null;
    const fd = pn.closest("details");
    if (fd) fd.open = true;
    const box = pn.closest("[data-tabs]");
    if (!box) return null;
    box.querySelectorAll("[role=tab]").forEach(tb => {
      const on = tb.getAttribute("aria-controls") === id;
      tb.setAttribute("aria-selected", String(on));
      tb.tabIndex = on ? 0 : -1;
      if (on) {
        const tl = tb.parentElement;
        if (tl.scrollWidth > tl.clientWidth) tl.scrollLeft = Math.max(0, tb.offsetLeft - tl.offsetLeft - 16);
        if (focusTab) tb.focus();
      }
    });
    box.querySelectorAll("[role=tabpanel]").forEach(x => x.classList.toggle("on", x.id === id));
    return box;
  };

  document.querySelectorAll("[data-tabs] [role=tab]").forEach(tb => {
    tb.addEventListener("click", () => {
      openTab(tb.getAttribute("aria-controls"));
      tb.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
    tb.addEventListener("keydown", e => {
      const all = [...tb.parentElement.querySelectorAll("[role=tab]")];
      let k = all.indexOf(tb);
      if (e.key === "ArrowRight") k = (k + 1) % all.length;
      else if (e.key === "ArrowLeft") k = (k - 1 + all.length) % all.length;
      else if (e.key === "Home") k = 0;
      else if (e.key === "End") k = all.length - 1;
      else return;
      e.preventDefault();
      openTab(all[k].getAttribute("aria-controls"), true);
    });
  });

  document.addEventListener("click", e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const id = a.getAttribute("href").slice(1);
    if (!id) return;
    let box = openTab(id);
    if (!box) {
      const t = document.getElementById(id);
      const d = t && (t.matches("details") ? t : t.querySelector("details.fold"));
      if (d) { d.open = true; box = t; }
    }
    if (!box) return;
    e.preventDefault();
    box.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth", block: "start" });
  });

  /* Arriving with #something in the address: open it. */
  SM.openHash = function () {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const b = openTab(id);
    const t = document.getElementById(id);
    if (b) b.scrollIntoView();
    else if (t) {
      const d = t.matches("details") ? t : t.querySelector("details.fold");
      if (d) d.open = true;
      t.scrollIntoView();
    }
  };

  /* Larger text: remembered per browser, labelled in the page's current language. */
  (function () {
    const root = document.documentElement, lb = document.getElementById("langbtn");
    if (!lb) return;
    const btn = document.createElement("button");
    btn.type = "button"; btn.className = "sizebtn"; btn.id = "sizebtn";
    const box = document.createElement("div");
    box.className = "tools";
    lb.replaceWith(box);
    box.append(btn, lb);
    let big = false;
    try { big = localStorage.getItem("sm-size") === "large"; } catch (e) {}
    function paint() {
      if (big) root.dataset.size = "large"; else delete root.dataset.size;
      const es = (root.lang || "en").startsWith("es");
      btn.textContent = big ? (es ? "Texto normal" : "Normal text") : (es ? "Texto más grande" : "Larger text");
      btn.setAttribute("aria-pressed", String(big));
    }
    btn.addEventListener("click", () => {
      big = !big;
      try { localStorage.setItem("sm-size", big ? "large" : "normal"); } catch (e) {}
      paint();
    });
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ["lang"] });
    paint();
  })();

  /* Quick exit: replaces this page with a neutral site so Back does not return here. */
  (function () {
    const root = document.documentElement;
    const b = document.createElement("button");
    b.type = "button"; b.className = "qexit"; b.id = "qexit";
    function paint() {
      const es = (root.lang || "en").startsWith("es");
      b.textContent = es ? "Salida rápida" : "Quick exit";
      b.setAttribute("aria-label", es ? "Salida rápida: salir de este sitio de inmediato" : "Quick exit: leave this site immediately");
    }
    b.addEventListener("click", () => {
      try { history.replaceState(null, "", location.pathname.replace(/[^/]*$/, "")); } catch (e) {}
      try { window.top.location.replace("https://weather.com/"); } catch (e) { location.replace("https://weather.com/"); }
    });
    document.body.appendChild(b);
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ["lang"] });
  })();


  /* The film: nothing loads from the video host until the play button is pressed. */
  (function () {
    const box = document.getElementById("vid");
    const btn = document.getElementById("vidPlay");
    if (!box || !btn) return;
    btn.addEventListener("click", () => {
      const es = (document.documentElement.lang || "en").startsWith("es");
      const f = document.createElement("iframe");
      f.src = box.dataset.src;
      f.title = es ? "Video: Recupere sus millas (en inglés)" : "Video: Take your miles back";
      f.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("loading", "lazy");
      f.setAttribute("referrerpolicy", "no-referrer-when-downgrade");
      btn.remove();
      box.appendChild(f);
      f.focus();
    });
  })();

  /* Back to top: appears once the page has scrolled. */
  (function () {
    const root = document.documentElement;
    const b = document.createElement("button");
    b.type = "button"; b.className = "totop"; b.id = "totop";
    function paint() {
      const es = (root.lang || "en").startsWith("es");
      b.innerHTML = '<span aria-hidden="true">↑</span>' + (es ? "Volver arriba" : "Back to top");
    }
    b.addEventListener("click", () => {
      scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      const h = document.querySelector("h1");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    });
    document.body.appendChild(b);
    paint();
    new MutationObserver(paint).observe(root, { attributes: true, attributeFilter: ["lang"] });
    let tick = false;
    function upd() { tick = false; b.classList.toggle("on", (scrollY || root.scrollTop) > 700); }
    addEventListener("scroll", () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
    upd();
  })();
})();
