document.addEventListener("DOMContentLoaded", () => {
  // Wire up events
  document.getElementById("runBtn").addEventListener("click", runWizard);
  document.getElementById("resetBtn").addEventListener("click", resetWizard);

  document.getElementById("viewTop3").addEventListener("click", () => setViewMode("top3"));
  document.getElementById("viewAll").addEventListener("click", () => setViewMode("all"));

  // Sorting (outside filters)
  document.getElementById("sortBy").addEventListener("change", (e) => {
    sortBy = e.target.value;
    const results = document.getElementById("results");
    if (results.querySelector(".card-result")) {
      rerenderCurrentResults();
    }
  });

  // Filter dropdown events
  const filtersBtn = document.getElementById("filtersBtn");
  const filtersDropdown = document.getElementById("filtersDropdown");
  const filterHideHard = document.getElementById("filterHideHard");
  const clearFiltersBtn = document.getElementById("clearFiltersBtn");

  let filtersOpen = false;

  filtersBtn.addEventListener("click", (e) => {
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

  filterHideHard.addEventListener("change", () => {
    hideHard = filterHideHard.checked;
    updateFilterButtonState();
    const results = document.getElementById("results");
    if (results.querySelector(".card-result")) {
      rerenderCurrentResults();
    } else {
      updateModeLine();
    }
  });

  document.querySelectorAll('input[name="printerFilter"]').forEach(radio => {
    radio.addEventListener("change", () => {
      if (radio.checked) {
        printerFilter = radio.value;
        updateFilterButtonState();
        const results = document.getElementById("results");
        if (results.querySelector(".card-result")) {
          rerenderCurrentResults();
        } else {
          updateModeLine();
        }
      }
    });
  });

  clearFiltersBtn.addEventListener("click", () => {
    hideHard = false;
    printerFilter = "any";
    filterHideHard.checked = false;
    document.querySelectorAll('input[name="printerFilter"]').forEach(r => {
      if (r.value === "any") r.checked = true;
    });
    updateFilterButtonState();
    const results = document.getElementById("results");
    if (results.querySelector(".card-result")) {
      rerenderCurrentResults();
    } else {
      updateModeLine();
    }
  });

  // View all filaments button on left
  document.getElementById("openLibraryBtn").addEventListener("click", () => {
    renderAllFilaments();
  });

  // Feedback button
  document.getElementById("feedbackBtn").addEventListener("click", () => {
    window.location.href = "mailto:3dlabs.cm@gmail.com?subject=Filament%20Wizard%20Feedback";
  });

  // Calculator screen navigation
  const mainApp = document.getElementById("mainApp");
  const calculatorScreen = document.getElementById("calculatorScreen");

  document.getElementById("openCalculatorBtn").addEventListener("click", () => {
    mainApp.classList.add("hidden");
    calculatorScreen.classList.remove("hidden");
  });

  document.getElementById("calculatorBackBtn").addEventListener("click", () => {
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
  });

  // Calculator logic wiring
  document.getElementById("calcRunBtn").addEventListener("click", runCalculator);
  document.getElementById("calcResetBtn").addEventListener("click", resetCalculator);
  document.getElementById("markupSlider").addEventListener("input", () => {
    updateMarkupLabel();
    runCalculator();
  });

  // Calculator "View all filaments" button
  document.getElementById("calcOpenLibraryBtn").addEventListener("click", () => {
    calculatorScreen.classList.add("hidden");
    mainApp.classList.remove("hidden");
    renderAllFilaments();
  });

  // Initialize labels and counts
  updateMarkupLabel();
  updateResultsCount(0);
  updateFilterButtonState();
  updateModeLine();
});
