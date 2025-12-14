document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  function setJsStatus(ok, msg) {
    const el = $("jsStatus");
    if (!el) return;
    el.textContent = msg;
    el.classList.toggle("js-status-ok", !!ok);
    el.classList.toggle("js-status-warn", !ok);
  }

  const coreOk =
    typeof FILAMENTS !== "undefined" &&
    typeof runWizard === "function" &&
    typeof resetWizard === "function" &&
    typeof renderAllFilaments === "function";

  setJsStatus(coreOk, coreOk ? "JS: OK" : "JS: missing");

  // Move “resultsCount” beside “filters applied” every time mode line updates.
  // This avoids timing issues where logic.js writes mode-line after our initial move.
  function moveCountInline() {
    const modeLine = $("resultsModeLine");
    const countEl = $("resultsCount");
    if (!modeLine || !countEl) return;

    // If it's already inside modeLine, do nothing
    if (modeLine.contains(countEl)) return;

    const wrap = document.createElement("span");
    wrap.className = "inline-meta-count";
    wrap.appendChild(countEl);

    // Add a separator if modeLine has text
    if (modeLine.textContent && modeLine.textContent.trim().length) {
      modeLine.appendChild(document.createTextNode("  •  "));
    }
    modeLine.appendChild(wrap);
  }

  // Run now + also observe future changes
  moveCountInline();
  const modeLine = $("resultsModeLine");
  if (modeLine) {
    const mo = new MutationObserver(() => moveCountInline());
    mo.observe(modeLine, { childList: true, subtree: true, characterData: true });
  }

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

  // Filters dropdown
  const filtersBtn = $("filtersBtn");
  const filtersDropdown = $("filtersDropdown");
  let filtersOpen = false;

  if (filtersBtn && filtersDropdown) {
    filtersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      filtersOpen = !filtersOpen;
      filtersDropdown.classList.toggle("show", filtersOpen);
    });
    filtersDropdown.addEventListener("click", (e) => e.stopPropagation());
    document.addEventListener("click", () => {
      if (filtersOpen) {
        filtersOpen = false;
        filtersDropdown.classList.remove("show");
      }
    });
  }

  // Keep existing filter logic (only if those globals exist)
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
