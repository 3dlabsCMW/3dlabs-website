(function () {
  function $(id) { return document.getElementById(id); }

  function setStatus(ok, text) {
    const el = $("jsStatus");
    if (!el) return;
    el.textContent = text;
    el.classList.toggle("js-status-ok", ok);
    el.classList.toggle("js-status-warn", !ok);
  }

  function toast(msg) {
    try {
      if (typeof showToast === "function") showToast(msg);
      else alert(msg);
    } catch {
      alert(msg);
    }
  }

  // Surface JS errors immediately (instead of silent failures)
  window.addEventListener("error", (e) => {
    toast("JS error: " + (e?.message || "unknown"));
    setStatus(false, "JS: error (open console)");
  });

  window.addEventListener("unhandledrejection", (e) => {
    toast("JS promise error: " + (e?.reason?.message || "unknown"));
    setStatus(false, "JS: error (open console)");
  });

  document.addEventListener("DOMContentLoaded", () => {
    const required = [
      typeof FILAMENTS !== "undefined",
      typeof runWizard === "function",
      typeof renderAllFilaments === "function",
      typeof resetWizard === "function",
      typeof runCalculator === "function"
    ];

    if (required.every(Boolean)) setStatus(true, "JS: OK");
    else {
      setStatus(false, "JS: missing file(s)");
      toast("Filament Wizard JS missing. Verify /filaments.js, /logic.js, /wiring.js load with 200 (not 404).");
    }

    const safeOn = (id, event, handler) => {
      const el = $(id);
      if (!el) return;
      el.addEventListener(event, handler);
    };

    // Wizard actions
    safeOn("runBtn", "click", (e) => { e.preventDefault(); if (typeof runWizard === "function") runWizard(); });
    safeOn("resetBtn", "click", (e) => { e.preventDefault(); if (typeof resetWizard === "function") resetWizard(); });
    safeOn("openLibraryBtn", "click", (e) => { e.preventDefault(); if (typeof renderAllFilaments === "function") renderAllFilaments(); });

    // View mode
    safeOn("viewTop3", "click", (e) => { e.preventDefault(); if (typeof setViewMode === "function") setViewMode("top3"); });
    safeOn("viewAll", "click", (e) => { e.preventDefault(); if (typeof setViewMode === "function") setViewMode("all"); });

    // Sort
    safeOn("sortBy", "change", (e) => {
      if (typeof sortBy === "undefined") return;
      sortBy = e.target.value;
      if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
    });

    // Filters dropdown
    const filtersBtn = $("filtersBtn");
    const filtersDropdown = $("filtersDropdown");
    const filterHideHard = $("filterHideHard");
    const clearFiltersBtn = $("clearFiltersBtn");

    let open = false;

    if (filtersBtn && filtersDropdown) {
      filtersBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        open = !open;
        filtersDropdown.classList.toggle("show", open);
      });

      filtersDropdown.addEventListener("click", (e) => e.stopPropagation());

      document.addEventListener("click", () => {
        if (!open) return;
        open = false;
        filtersDropdown.classList.remove("show");
      });
    }

    if (filterHideHard) {
      filterHideHard.addEventListener("change", () => {
        if (typeof hideHard === "undefined") return;
        hideHard = filterHideHard.checked;
        if (typeof updateFilterButtonState === "function") updateFilterButtonState();
        if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
      });
    }

    document.querySelectorAll('input[name="printerFilter"]').forEach((radio) => {
      radio.addEventListener("change", () => {
        if (!radio.checked) return;
        if (typeof printerFilter === "undefined") return;
        printerFilter = radio.value;
        if (typeof updateFilterButtonState === "function") updateFilterButtonState();
        if (typeof rerenderCurrentResults === "function") rerenderCurrentResults();
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
      });
    }

    // Calculator navigation
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

    // Calculator actions
    safeOn("calcRunBtn", "click", (e) => { e.preventDefault(); if (typeof runCalculator === "function") runCalculator(); });
    safeOn("calcResetBtn", "click", (e) => { e.preventDefault(); if (typeof resetCalculator === "function") resetCalculator(); });

    safeOn("markupSlider", "input", () => {
      if (typeof updateMarkupLabel === "function") updateMarkupLabel();
      if (typeof runCalculator === "function") runCalculator();
    });

    safeOn("feedbackBtn", "click", (e) => {
      e.preventDefault();
      window.location.href = "mailto:3dlabs.cm@gmail.com?subject=Filament%20Wizard%20Feedback";
    });

    // Initial UI state
    if (typeof updateMarkupLabel === "function") updateMarkupLabel();
    if (typeof updateFilterButtonState === "function") updateFilterButtonState();
    if (typeof updateModeLine === "function") updateModeLine();
  });
})();
