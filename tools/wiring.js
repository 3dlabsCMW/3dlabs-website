document.addEventListener("DOMContentLoaded", () => {
  const $ = (id) => document.getElementById(id);

  function setJsStatus(ok, msg) {
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

  // Global error visibility (prevents “nothing happens”)
  window.addEventListener("error", (e) => {
    setJsStatus(false, "JS: error");
    toast("JS error: " + (e?.message || "unknown"));
  });

  window.addEventListener("unhandledrejection", (e) => {
    setJsStatus(false, "JS: error");
    toast("JS promise error: " + (e?.reason?.message || "unknown"));
  });

  // Verify required globals exist (means scripts loaded correctly)
  const ok =
    typeof FILAMENTS !== "undefined" &&
    typeof runWizard === "function" &&
    typeof resetWizard === "function" &&
    typeof renderAllFilaments === "function" &&
    typeof runCalculator === "function" &&
    typeof resetCalculator === "function";

  if (ok) setJsStatus(true, "JS: OK");
  else {
    setJsStatus(false, "JS: missing");
    toast("Wizard JS missing. Confirm /tools/filaments.js, /tools/logic.js, /tools/wiring.js load (not HTML).");
  }

  // Safe binder (won’t crash if an element is missing)
  const on = (id, ev, fn) => {
    const el = $(id);
    if (!el) return;
    el.addEventListener(ev, (e) => {
      // Prevent any accidental form-submit behavior
      if (e && typeof e.preventDefault === "function") e.preventDefault();
      fn(e);
    });
  };

  on("runBtn", "click", () => runWizard());
  on("resetBtn", "click", () => resetWizard());

  on("viewTop3", "click", () => setViewMode("top3"));
  on("viewAll", "click", () => setViewMode("all"));

  on("sortBy", "change", (e) => {
    sortBy = e.target.value;
    const results = $("results");
    if (results && results.querySelector(".card-result")) rerenderCurrentResults();
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
      hideHard = filterHideHard.checked;
      updateFilterButtonState();
      const results = $("results");
      if (results && results.querySelector(".card-result")) rerenderCurrentResults();
      else updateModeLine();
    });
  }

  document.querySelectorAll('input[name="printerFilter"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      printerFilter = radio.value;
      updateFilterButtonState();
      const results = $("results");
      if (results && results.querySelector(".card-result")) rerenderCurrentResults();
      else updateModeLine();
    });
  });

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", (e) => {
      e.preventDefault();
      hideHard = false;
      printerFilter = "any";
      if (filterHideHard) filterHideHard.checked = false;
      document.querySelectorAll('input[name="printerFilter"]').forEach((r) => {
        if (r.value === "any") r.checked = true;
      });
      updateFilterButtonState();
      const results = $("results");
      if (results && results.querySelector(".card-result")) rerenderCurrentResults();
      else updateModeLine();
    });
  }

  on("openLibraryBtn", "click", () => renderAllFilaments());

  on("feedbackBtn", "click", () => {
    window.location.href = "mailto:3dlabs.cm@gmail.com?subject=Filament%20Wizard%20Feedback";
  });

  // Calculator navigation
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

  // Calculator logic
  on("calcRunBtn", "click", () => runCalculator());
  on("calcResetBtn", "click", () => resetCalculator());

  on("markupSlider", "input", () => {
    updateMarkupLabel();
    runCalculator();
  });

  on("calcOpenLibraryBtn", "click", () => {
    if (!mainApp || !calculatorScreen) return;
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    renderAllFilaments();
  });

  // Init UI
  updateMarkupLabel();
  updateResultsCount(0);
  updateFilterButtonState();
  updateModeLine();
});
