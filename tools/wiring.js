document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  function setJsStatus(ok, msg) {
    // If the element is missing, do nothing (no breaking).
    const el = $("jsStatus");
    if (!el) return;

    el.textContent = msg;
    el.classList.toggle("js-status-ok", !!ok);
    el.classList.toggle("js-status-warn", !ok);
  }

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else console.warn(msg);
    } catch {
      console.warn(msg);
    }
  }

  // Surface JS errors so it never feels "dead"
  window.addEventListener("error", (e) => {
    setJsStatus(false, "JS: error");
    toast("JS error: " + (e?.message || "unknown"));
  });

  window.addEventListener("unhandledrejection", (e) => {
    setJsStatus(false, "JS: error");
    toast("JS promise error: " + (e?.reason?.message || "unknown"));
  });

  // --- Core function presence (keep this minimal)
  // If buttons work, these must exist.
  const coreOk =
    typeof FILAMENTS !== "undefined" &&
    typeof runWizard === "function" &&
    typeof resetWizard === "function" &&
    typeof renderAllFilaments === "function";

  // Optional features (do not block "OK" status)
  const calcOk =
    typeof runCalculator === "function" &&
    typeof resetCalculator === "function" &&
    typeof updateMarkupLabel === "function";

  if (coreOk) {
    setJsStatus(true, calcOk ? "JS: OK" : "JS: OK (calc partial)");
  } else {
    setJsStatus(false, "JS: missing");
    toast("Wizard JS missing. Confirm /tools/filaments.js, /tools/logic.js, /tools/wiring.js load as JS (not HTML).");
  }

  // Safe binder
  const on = (id, ev, fn) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(ev, (e) => {
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      fn(e);
    });
  };

  // Wizard actions
  on("runBtn", "click", () => typeof runWizard === "function" && runWizard());
  on("resetBtn", "click", () => typeof resetWizard === "function" && resetWizard());
  on("openLibraryBtn", "click", () => typeof renderAllFilaments === "function" && renderAllFilaments());

  // View mode
  on("viewTop3", "click", () => typeof setViewMode === "function" && setViewMode("top3"));
  on("viewAll", "click", () => typeof setViewMode === "function" && setViewMode("all"));

  // Sort
  on("sortBy", "change", (e) => {
    if (typeof sortBy === "undefined") return;
    sortBy = e.target.value;
    const results = $("results");
    if (typeof rerenderCurrentResults === "function" && results && results.querySelector(".card-result")) {
      rerenderCurrentResults();
    }
  });

  // Filters dropdown
  const filtersBtn = $("filtersBtn");
  const filtersDropdown = $("filtersDropdown");
  const filterHideHard = $("filterHideHard");
  const clearFiltersBtn = $("clearFiltersBtn");
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

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", (e) => {
      e.preventDefault();
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
  }

  // Feedback
  on("feedbackBtn", "click", () => {
    window.location.href = "mailto:3dlabs.cm@gmail.com?subject=Filament%20Wizard%20Feedback";
  });

  // Calculator navigation (only if those sections exist)
  const mainApp = $("mainApp");
  const calculatorScreen = $("calculatorScreen");

  on("openCalculatorBtn", "click", () => {
    if (!mainApp || !calculatorScreen) return;
    mainApp.classList.add("hidden");
    calculatorScreen.classList.remove("hidden");
  });

  on("calculatorBackBtn", "click", () => {
    if (!mainApp || !calculatorScreen) return;
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
  });

  // Calculator actions (optional)
  on("calcRunBtn", "click", () => typeof runCalculator === "function" && runCalculator());
  on("calcResetBtn", "click", () => typeof resetCalculator === "function" && resetCalculator());

  on("markupSlider", "input", () => {
    if (typeof updateMarkupLabel === "function") updateMarkupLabel();
    if (typeof runCalculator === "function") runCalculator();
  });

  on("calcOpenLibraryBtn", "click", () => {
    if (!mainApp || !calculatorScreen) return;
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    if (typeof renderAllFilaments === "function") renderAllFilaments();
  });

  // Init UI (if present)
  if (typeof updateMarkupLabel === "function") updateMarkupLabel();
  if (typeof updateResultsCount === "function") updateResultsCount(0);
  if (typeof updateFilterButtonState === "function") updateFilterButtonState();
  if (typeof updateModeLine === "function") updateModeLine();
});
