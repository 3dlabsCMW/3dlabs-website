document.addEventListener("DOMContentLoaded", () => {
  // Helpers
  const $ = (id) => document.getElementById(id);

  function safeOn(id, event, handler) {
    const el = $(id);
    if (!el) return;
    el.addEventListener(event, handler);
  }

  function hardFailToast(msg) {
    // Prefer your toast if present, else alert.
    try {
      if (typeof showToast === "function") showToast(msg);
      else alert(msg);
    } catch {
      alert(msg);
    }
  }

  // Sanity check: if scripts didn't load, you get an obvious message (instead of silent no-op).
  // (This is the most common reason "nothing happens": /logic.js or /wiring.js not being served at that path.)
  if (typeof runWizard !== "function" || typeof runCalculator !== "function" || typeof FILAMENTS === "undefined") {
    hardFailToast(
      "Filament Wizard JS failed to load. Check Network tab for 404s on /filaments.js, /logic.js, /wiring.js."
    );
    // Still continue wiring what we can, but most actions will not work without logic.js.
  }

  // ---------- Wizard buttons ----------
  safeOn("runBtn", "click", (e) => { e.preventDefault(); if (typeof runWizard === "function") runWizard(); });
  safeOn("resetBtn", "click", (e) => { e.preventDefault(); if (typeof resetWizard === "function") resetWizard(); });

  safeOn("viewTop3", "click", (e) => { e.preventDefault(); if (typeof setViewMode === "function") setViewMode("top3"); });
  safeOn("viewAll", "click", (e) => { e.preventDefault(); if (typeof setViewMode === "function") setViewMode("all"); });

  // Sorting
  safeOn("sortBy", "change", (e) => {
    if (typeof sortBy === "undefined") return;
    sortBy = e.target.value;
    const results = $("results");
    if (results && results.querySelector(".card-result") && typeof rerenderCurrentResults === "function") {
      rerenderCurrentResults();
    }
  });

  // ---------- Filters dropdown ----------
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

    filtersDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
    });

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
      const results = $("results");
      if (results && results.querySelector(".card-result") && typeof rerenderCurrentResults === "function") {
        rerenderCurrentResults();
      } else if (typeof updateModeLine === "function") {
        updateModeLine();
      }
    });
  }

  document.querySelectorAll('input[name="printerFilter"]').forEach((radio) => {
    radio.addEventListener("change", () => {
      if (!radio.checked) return;
      if (typeof printerFilter === "undefined") return;
      printerFilter = radio.value;
      if (typeof updateFilterButtonState === "function") updateFilterButtonState();
      const results = $("results");
      if (results && results.querySelector(".card-result") && typeof rerenderCurrentResults === "function") {
        rerenderCurrentResults();
      } else if (typeof updateModeLine === "function") {
        updateModeLine();
      }
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

      const results = $("results");
      if (results && results.querySelector(".card-result") && typeof rerenderCurrentResults === "function") {
        rerenderCurrentResults();
      } else if (typeof updateModeLine === "function") {
        updateModeLine();
      }
    });
  }

  // ---------- Library + feedback ----------
  safeOn("openLibraryBtn", "click", (e) => { e.preventDefault(); if (typeof renderAllFilaments === "function") renderAllFilaments(); });

  safeOn("feedbackBtn", "click", (e) => {
    e.preventDefault();
    window.location.href = "mailto:3dlabs.cm@gmail.com?subject=Filament%20Wizard%20Feedback";
  });

  // ---------- Calculator screen navigation ----------
  const mainApp = $("mainApp");
  const calculatorScreen = $("calculatorScreen");

  safeOn("openCalculatorBtn", "click", (e) => {
    e.preventDefault();
    if (!mainApp || !calculatorScreen) return;
    mainApp.classList.add("hidden");
    calculatorScreen.classList.remove("hidden");
  });

  safeOn("calculatorBackBtn", "click", (e) => {
    e.preventDefault();
    if (!mainApp || !calculatorScreen) return;
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
  });

  // ---------- Calculator logic wiring ----------
  safeOn("calcRunBtn", "click", (e) => { e.preventDefault(); if (typeof runCalculator === "function") runCalculator(); });
  safeOn("calcResetBtn", "click", (e) => { e.preventDefault(); if (typeof resetCalculator === "function") resetCalculator(); });

  safeOn("markupSlider", "input", () => {
    if (typeof updateMarkupLabel === "function") updateMarkupLabel();
    if (typeof runCalculator === "function") runCalculator();
  });

  safeOn("calcOpenLibraryBtn", "click", (e) => {
    e.preventDefault();
    if (!mainApp || !calculatorScreen) return;
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    if (typeof renderAllFilaments === "function") renderAllFilaments();
  });

  // Initialize labels and counts (if logic.js loaded)
  if (typeof updateMarkupLabel === "function") updateMarkupLabel();
  if (typeof updateResultsCount === "function") updateResultsCount(0);
  if (typeof updateFilterButtonState === "function") updateFilterButtonState();
  if (typeof updateModeLine === "function") updateModeLine();
});
