/*
 * Monthly course banner.
 *
 * What this does: reads /content/monthly-course.json and, once the page has
 * loaded, inserts a small banner between the hero section and the
 * "Para quem este trabalho é" section, announcing whatever course/turma is
 * currently open for enrollment.
 *
 * To update the banner each month: edit /content/monthly-course.json only.
 * You never need to touch this file or the site's own code.
 *   - "enabled": true/false — set to false to hide the banner entirely.
 *   - "eyebrow": small label above the title (e.g. "Turma aberta").
 *   - "title": the course/turma name.
 *   - "description": one short sentence about it.
 *   - "ctaText": the button text (e.g. "Quero saber mais").
 *   - "ctaLink": where the button should go (e.g. a Google Form link).
 *   - "note": small print under the description (e.g. "Vagas limitadas").
 */
(function () {
  var ANCHOR_ID = "para-quem";
  var CONFIG_URL = "content/monthly-course.json";
  var MAX_WAIT_MS = 15000;

  function buildBanner(cfg) {
    var wrap = document.createElement("div");
    wrap.className = "bc-monthly-banner";
    wrap.setAttribute("data-bc-monthly-banner", "true");

    var text = document.createElement("div");
    text.className = "bc-monthly-banner__text";

    if (cfg.eyebrow) {
      var eyebrow = document.createElement("span");
      eyebrow.className = "bc-monthly-banner__eyebrow";
      eyebrow.textContent = cfg.eyebrow;
      text.appendChild(eyebrow);
    }

    var title = document.createElement("p");
    title.className = "bc-monthly-banner__title";
    title.textContent = cfg.title || "";
    text.appendChild(title);

    if (cfg.description) {
      var desc = document.createElement("p");
      desc.className = "bc-monthly-banner__desc";
      desc.textContent = cfg.description;
      text.appendChild(desc);
    }

    if (cfg.note) {
      var note = document.createElement("p");
      note.className = "bc-monthly-banner__note";
      note.textContent = cfg.note;
      text.appendChild(note);
    }

    wrap.appendChild(text);

    if (cfg.ctaText && cfg.ctaLink) {
      var cta = document.createElement("a");
      cta.className = "bc-monthly-banner__cta";
      cta.href = cfg.ctaLink;
      cta.textContent = cfg.ctaText;
      if (/^https?:\/\//i.test(cfg.ctaLink)) {
        cta.target = "_blank";
        cta.rel = "noopener noreferrer";
      }
      wrap.appendChild(cta);
    }

    return wrap;
  }

  function insertBanner(anchorEl, cfg) {
    if (document.querySelector("[data-bc-monthly-banner]")) return; // avoid duplicates
    var banner = buildBanner(cfg);
    anchorEl.parentNode.insertBefore(banner, anchorEl);
  }

  function whenAnchorReady(callback) {
    var existing = document.getElementById(ANCHOR_ID);
    if (existing) {
      callback(existing);
      return;
    }
    var observer = new MutationObserver(function () {
      var el = document.getElementById(ANCHOR_ID);
      if (el) {
        observer.disconnect();
        callback(el);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(function () {
      observer.disconnect();
    }, MAX_WAIT_MS);
  }

  function init() {
    fetch(CONFIG_URL, { cache: "no-store" })
      .then(function (res) {
        if (!res.ok) throw new Error("monthly-course.json not found (" + res.status + ")");
        return res.json();
      })
      .then(function (cfg) {
        if (!cfg || cfg.enabled === false) return;
        whenAnchorReady(function (anchorEl) {
          insertBanner(anchorEl, cfg);
        });
      })
      .catch(function (err) {
        // Fail silently on the page, but leave a trace in the console.
        console.warn("[monthly-feature]", err.message || err);
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
