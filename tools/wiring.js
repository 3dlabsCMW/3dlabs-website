document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  function setJsStatus(ok, msg) {
    const el = $("jsStatus");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("js-status-ok", !!ok);
    el.classList.toggle("js-status-warn", !ok);
  }

  // Core presence check
  const coreOk =
    typeof FILAMENTS !== "undefined" &&
    typeof runWizard === "function" &&
    typeof resetWizard === "function" &&
    typeof renderAllFilaments === "function";

  setJsStatus(coreOk, coreOk ? "JS: OK" : "JS: missing");

  // ---------- Move resultsCount next to “Filters applied” ----------
  function moveCountInline() {
    const modeLine = $("resultsModeLine");
    const countEl = $("resultsCount");
    if (!modeLine || !countEl) return;
    if (modeLine.contains(countEl)) return;

    const wrap = document.createElement("span");
    wrap.className = "inline-meta-count";
    wrap.appendChild(countEl);

    if (modeLine.textContent && modeLine.textContent.trim().length) {
      modeLine.appendChild(document.createTextNode("  •  "));
    }
    modeLine.appendChild(wrap);
  }

  moveCountInline();
  const modeLine = $("resultsModeLine");
  if (modeLine) {
    const mo = new MutationObserver(() => moveCountInline());
    mo.observe(modeLine, { childList: true, subtree: true, characterData: true });
  }

  // ---------- Card Enhancements ----------
  function enhanceCard(card) {
    if (!card || card.dataset.enhanced === "1") return;

    const header = card.querySelector(".card-result-header");
    const score = card.querySelector(".card-result-score");
    const copyBtn = card.querySelector(".btn-copy-profile");
    const body = card.querySelector(".card-result-body");
    const profileTitle = card.querySelector(".profile-title");
    const profileList = card.querySelector(".profile-list");

    // 1) Force Score + Copy into a top-right stack
    if (header && score && copyBtn) {
      let stack = card.querySelector(".score-stack");
      if (!stack) {
        stack = document.createElement("div");
        stack.className = "score-stack";
        card.appendChild(stack);
      }
      stack.appendChild(score);
      stack.appendChild(copyBtn);
      copyBtn.classList.add("copy-under-score");
      card.classList.add("has-score-stack");
    }

    // 2) Floating print profile panel (dead space)
    if (body && profileTitle && profileList) {
      let floatPanel = card.querySelector(".profile-float");
      if (!floatPanel) {
        floatPanel = document.createElement("div");
        floatPanel.className = "profile-float";
        card.appendChild(floatPanel);
      }
      floatPanel.appendChild(profileTitle);
      floatPanel.appendChild(profileList);
      card.classList.add("has-profile-float");
    }

    card.dataset.enhanced = "1";
  }

  function enhanceAllCards() {
    document.querySelectorAll(".card-result").forEach(enhanceCard);
  }

  const results = $("results");
  if (results) {
    enhanceAllCards();
    const ro = new MutationObserver(() => enhanceAllCards());
    ro.observe(results, { childList: true, subtree: true });
  }

  // ---------- Helpers ----------
  const on = (id, ev, fn) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(ev, (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      fn(e);
    });
  };

  on("runBtn", "click", () => typeof runWizard === "function" && runWizard());
  on("resetBtn", "click", () => typeof resetWizard === "function" && resetWizard());
  on("openLibraryBtn", "click", () => typeof renderAllFilaments === "function" && renderAllFilaments());

  on("viewTop3", "click", () => typeof setViewMode === "function" && setViewMode("top3"));
  on("viewAll", "click", () => typeof setViewMode === "function" && setViewMode("all"));

  on("sortBy", "change", (e) => {
    if (typeof sortBy === "undefined") return;
    sortBy = e.target.value;
    if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
  });

  // ---------- Filters dropdown: FIXED POSITION so it never gets clipped ----------
  const filtersBtn = $("filtersBtn");
  const filtersDropdown = $("filtersDropdown");
  let filtersOpen = false;

  function positionFiltersDropdown() {
    if (!filtersBtn || !filtersDropdown) return;
    const r = filtersBtn.getBoundingClientRect();
    const width = filtersDropdown.offsetWidth || 280;

    // Place below the button, right-aligned to it
    filtersDropdown.style.position = "fixed";
    filtersDropdown.style.top = `${Math.round(r.bottom + 10)}px`;
    filtersDropdown.style.left = `${Math.round(r.right - width)}px`;
    filtersDropdown.style.zIndex = "9999";
  }

  if (filtersBtn && filtersDropdown) {
    // Ensure it’s not trapped by any parent stacking context
    document.body.appendChild(filtersDropdown);

    filtersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      filtersOpen = !filtersOpen;

      if (filtersOpen) {
        filtersDropdown.classList.add("show");
        // Wait a tick so width is measurable
        requestAnimationFrame(() => {
          positionFiltersDropdown();
        });
      } else {
        filtersDropdown.classList.remove("show");
      }
    });

    filtersDropdown.addEventListener("click", (e) => e.stopPropagation());

    document.addEventListener("click", () => {
      if (filtersOpen) {
        filtersOpen = false;
        filtersDropdown.classList.remove("show");
      }
    });

    window.addEventListener("resize", () => {
      if (filtersOpen) positionFiltersDropdown();
    });
    window.addEventListener("scroll", () => {
      if (filtersOpen) positionFiltersDropdown();
    }, { passive: true });
  }

  // Keep existing filter logic
  const filterHideHard = $("filterHideHard");
  if (filterHideHard) {
    filterHideHard.addEventListener("change", () => {
      if (typeof hideHard === "undefined") return;
      hideHard = filterHideHard.checked;
      if (typeof updateFilterButtonState === "function") updateFilterButtonState();
      if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
      else if (typeof updateModeLine === "function") updateModeLine();
    });
  }

  document.querySelectorAll('input[name="printerFilter"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      if (typeof printerFilter === "undefined") return;
      printerFilter = radio.value;
      if (typeof updateFilterButtonState === "function") updateFilterButtonState();
      if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
      else if (typeof updateModeLine === "function") updateModeLine();
    });
  });

  on("clearFiltersBtn", "click", () => {
    if (typeof hideHard !== "undefined") hideHard = false;
    if (typeof printerFilter !== "undefined") printerFilter = "any";
    if (filterHideHard) filterHideHard.checked = false;
    document.querySelectorAll('input[name="printerFilter"]').forEach((r) => {
      if (r.value === "any") r.checked = true;
    });
    if (typeof updateFilterButtonState === "function") updateFilterButtonState();
    if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
    else if (typeof updateModeLine === "function") updateModeLine();
  });
});
