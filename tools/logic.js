const DIFF_RANK = { easy: 1, medium: 2, hard: 3, extreme: 4 };
const SVG_NS = "http://www.w3.org/2000/svg";

let viewMode = "top3"; // "top3" | "all"
let hideHard = false;
let printerFilter = "any"; // "any" | "open_only" | "enclosed_only"
let sortBy = "score"; // "score" | "price_asc" | "price_desc" | "tox_asc" | "tox_desc"
let currentResultsMode = "wizard"; // "wizard" | "library"

function getDifficultyBadgeClass(diff) {
  if (diff === "easy") return "badge-difficulty-easy";
  if (diff === "medium") return "badge-difficulty-medium";
  if (diff === "hard") return "badge-difficulty-hard";
  if (diff === "extreme") return "badge-difficulty-extreme";
  return "";
}

function getCategoryBadgeClass(cat) {
  if (cat === "standard") return "badge-category-standard";
  if (cat === "engineering") return "badge-category-engineering";
  if (cat === "flexible") return "badge-category-flexible";
  if (cat === "special") return "badge-category-special";
  if (cat === "support") return "badge-category-support";
  return "";
}

function getBaseColorForFilament(f) {
  switch (f.category) {
    case "engineering":
      return "#a855f7"; // purple
    case "flexible":
      return "#22c55e"; // green
    case "special":
      return "#f97316"; // orange
    case "support":
      return "#facc15"; // yellow
    case "standard":
    default:
      return "#38bdf8"; // cyan
  }
}

function toxicityRank(level) {
  switch (level) {
    case "very_low": return 1;
    case "low": return 2;
    case "medium": return 3;
    case "high": return 4;
    case "very_high": return 5;
    default: return 3;
  }
}

function toxicityLabel(level) {
  switch (level) {
    case "very_low": return "Very low (minimal fumes)";
    case "low": return "Low (basic ventilation)";
    case "medium": return "Medium (ventilation recommended)";
    case "high": return "High (enclosure + ventilation)";
    case "very_high": return "Very high (industrial precautions)";
    default: return "Unknown (assume ventilation)";
  }
}

// 3D STYLE ICON (gradient spool)
function build3DIcon(svg, f) {
  const base = getBaseColorForFilament(f);
  const lighter = "#ffffff";

  const gradId = "grad-" + Math.random().toString(36).slice(2, 8);

  const defs = document.createElementNS(SVG_NS, "defs");
  const linearGradient = document.createElementNS(SVG_NS, "linearGradient");
  linearGradient.setAttribute("id", gradId);
  linearGradient.setAttribute("x1", "0");
  linearGradient.setAttribute("y1", "0");
  linearGradient.setAttribute("x2", "1");
  linearGradient.setAttribute("y2", "1");

  const stop1 = document.createElementNS(SVG_NS, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", lighter);
  stop1.setAttribute("stop-opacity", "0.95");

  const stop2 = document.createElementNS(SVG_NS, "stop");
  stop2.setAttribute("offset", "45%");
  stop2.setAttribute("stop-color", base);
  stop2.setAttribute("stop-opacity", "0.95");

  const stop3 = document.createElementNS(SVG_NS, "stop");
  stop3.setAttribute("offset", "100%");
  stop3.setAttribute("stop-color", "#020617");
  stop3.setAttribute("stop-opacity", "1");

  linearGradient.appendChild(stop1);
  linearGradient.appendChild(stop2);
  linearGradient.appendChild(stop3);
  defs.appendChild(linearGradient);
  svg.appendChild(defs);

  // Spool body
  const body = document.createElementNS(SVG_NS, "rect");
  body.setAttribute("x", "4");
  body.setAttribute("y", "6");
  body.setAttribute("width", "16");
  body.setAttribute("height", "12");
  body.setAttribute("rx", "4");
  body.setAttribute("fill", "url(#" + gradId + ")");
  svg.appendChild(body);

  // Inner hole
  const hole = document.createElementNS(SVG_NS, "circle");
  hole.setAttribute("cx", "12");
  hole.setAttribute("cy", "12");
  hole.setAttribute("r", "3.2");
  hole.setAttribute("fill", "#020617");
  svg.appendChild(hole);

  // Highlight edge
  const highlight = document.createElementNS(SVG_NS, "ellipse");
  highlight.setAttribute("cx", "10");
  highlight.setAttribute("cy", "9");
  highlight.setAttribute("rx", "5");
  highlight.setAttribute("ry", "2");
  highlight.setAttribute("fill", "#ffffff");
  highlight.setAttribute("fill-opacity", "0.2");
  svg.appendChild(highlight);

  // Filament band
  const band = document.createElementNS(SVG_NS, "rect");
  band.setAttribute("x", "5");
  band.setAttribute("y", "11");
  band.setAttribute("width", "14");
  band.setAttribute("height", "2");
  band.setAttribute("fill", "#020617");
  band.setAttribute("fill-opacity", "0.35");
  svg.appendChild(band);
}

function createFilamentIconElement(f) {
  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");

  build3DIcon(svg, f);
  return svg;
}

function labelPartType(code) {
  const map = {
    decorative: "Decorative",
    mechanical: "Mechanical",
    flexible: "Flexible",
    lightweight: "Lightweight",
    high_heat: "High heat",
    outdoor: "Outdoor",
    chemical: "Chemical",
    experimental: "Experimental",
    support: "Support"
  };
  return map[code] || code;
}

function labelStrength(code) {
  const map = {
    low: "Low strength",
    medium: "Medium strength",
    high: "High strength",
    max: "Max strength"
  };
  return map[code] || code;
}

function labelTemp(code) {
  const map = {
    room: "Room temp",
    "60": "≤ 60°C",
    "80": "60–80°C",
    "100": "80–100°C",
    "120": "> 100°C"
  };
  return map[code] || code;
}

function labelEnv(code) {
  const map = {
    indoor: "Indoor",
    outdoor: "Outdoor / UV",
    humid: "Humid / splashes",
    chemical: "Chemical exposure"
  };
  return map[code] || code;
}

function labelDifficulty(code) {
  const map = {
    any: "Best Match – any difficulty",
    easy: "Easy only",
    medium: "Medium",
    hard: "Hard",
    extreme: "Industrial"
  };
  return map[code] || code;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  const text = document.getElementById("toastText");
  if (!toast || !text) return;

  text.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

function enclosurePillClass(f) {
  if (f.enclosure === "enclosure_recommended") return "enclosure-pill enclosure-closed";
  return "enclosure-pill enclosure-open";
}

function enclosurePillLabel(f) {
  if (f.enclosure === "enclosure_recommended") {
    return "Enclosure recommended";
  }
  return "Open-frame friendly";
}

function computeScore(req, f) {
  let score = 0;
  const notes = [];

  // Hard temperature rule
  if (req.tempMax > f.heatMax && req.partType === "high_heat") {
    score -= 100;
    notes.push("Cannot handle required high temperature.");
    return { score, notes };
  }

  if (req.tempMax > f.heatMax && req.tempMax > 60) {
    score -= 40;
    notes.push("Likely to deform at the requested temperature.");
  }

  const name = f.name;

  // Part type matching
  if (req.partType === "decorative") {
    if (["PLA", "Glow-in-the-Dark PLA"].includes(name)) {
      score += 3;
      notes.push("Good for decorative / cosmetic prints.");
    }
  } else if (req.partType === "mechanical") {
    if (["PETG", "ASA"].includes(name)) {
      score += 4;
      notes.push("Strong enough for mechanical use.");
    }
    if (f.category === "standard" && name.includes("PLA")) {
      score -= 1;
    }
  } else if (req.partType === "flexible") {
    if (f.category === "flexible") {
      score += 6;
      notes.push("Matches flexible requirement.");
    }
    if (f.flexibility === "rigid") {
      score -= 6;
    }
  } else if (req.partType === "lightweight") {
    if (["PLA", "PETG"].includes(name)) {
      score += 2;
      notes.push("Reasonable strength-to-weight ratio.");
    }
  } else if (req.partType === "high_heat") {
    if (f.heatMax >= 100) {
      score += 6;
      notes.push("Rated for high-temperature use.");
    } else {
      score -= 6;
    }
  } else if (req.partType === "outdoor") {
    if (f.outdoor === "excellent") {
      score += 3;
      notes.push("Excellent outdoor / UV stability.");
    } else if (f.outdoor === "good") {
      score += 1;
    } else {
      score -= 2;
    }
  } else if (req.partType === "chemical") {
    if (["good", "excellent"].includes(f.chemical)) {
      score += 3;
      notes.push("Good chemical resistance.");
    } else {
      score -= 3;
    }
  } else if (req.partType === "experimental") {
    if (f.category === "special") {
      score += 3;
      notes.push("Special-effect material.");
    }
  } else if (req.partType === "support") {
    if (f.category === "support") {
      score += 10;
      notes.push("Dedicated support material.");
    } else {
      score -= 6;
    }
  }

  // Strength importance
  if (["high", "max"].includes(req.strength)) {
    if (["high", "very_high", "max"].includes(f.strength)) score += 2;
    if (f.strength === "low") score -= 3;
  }

  // Flexibility requirement
  if (req.flexibility === "rigid") {
    if (f.flexibility === "rigid") score += 1;
    if (f.category === "flexible") score -= 3;
  } else if (req.flexibility === "semi") {
    if (f.flexibility === "semi") score += 1;
  } else if (req.flexibility === "flexible") {
    if (f.category === "flexible") score += 6;
    if (f.flexibility === "rigid") score -= 6;
  }

  // Temperature bonus
  if (req.tempMax >= 100 && f.heatMax >= 100) {
    score += 3;
  } else if (req.tempMax >= 80 && f.heatMax >= 80) {
    score += 2;
  }

  // Difficulty tolerance
  if (req.difficulty !== "any") {
    const reqRank = DIFF_RANK[req.difficulty];
    const matRank = DIFF_RANK[f.difficulty];
    if (matRank > reqRank) {
      score -= 4;
      notes.push("Harder to print than you allowed.");
    } else if (matRank === reqRank) {
      score += 1;
    } else {
      score += 0.5;
    }
  } else {
    if (f.difficulty === "extreme") {
      score += 1;
    }
  }

  // Special requirement
  if (req.special) {
    const specials = f.special || [];
    if (specials.includes(req.special)) {
      score += 5;
      notes.push("Matches requested special feature.");
    } else {
      score -= 2;
    }
  }

  return { score, notes };
}

function applyCommonFiltersAndSort(list) {
  // hide hard/extreme
  if (hideHard) {
    list = list.filter(x => {
      const d = x.f ? x.f.difficulty : x.difficulty;
      return d !== "hard" && d !== "extreme";
    });
  }

  // printer filter
  if (printerFilter === "open_only") {
    list = list.filter(x => {
      const f = x.f || x;
      return !f.enclosure || f.enclosure === "open_ok";
    });
  } else if (printerFilter === "enclosed_only") {
    list = list.filter(x => (x.f || x).enclosure === "enclosure_recommended");
  }

  // sort
  if (sortBy === "price_asc" || sortBy === "price_desc") {
    list.sort((a, b) => {
      const fa = a.f || a;
      const fb = b.f || b;
      const pa = fa.pricePerKg ?? 9999;
      const pb = fb.pricePerKg ?? 9999;
      if (pa === pb) {
        const sa = a.score ?? 0;
        const sb = b.score ?? 0;
        return sortBy === "price_asc" ? (sb - sa) : (sa - sb); // tie-break by score
      }
      return sortBy === "price_asc" ? (pa - pb) : (pb - pa);
    });
  } else if (sortBy === "tox_asc" || sortBy === "tox_desc") {
    list.sort((a, b) => {
      const fa = a.f || a;
      const fb = b.f || b;
      const ta = toxicityRank(fa.toxicity);
      const tb = toxicityRank(fb.toxicity);
      if (ta === tb) {
        const sa = a.score ?? 0;
        const sb = b.score ?? 0;
        return sortBy === "tox_asc" ? (sb - sa) : (sa - sb);
      }
      return sortBy === "tox_asc" ? (ta - tb) : (tb - ta);
    });
  } else {
    // Best Match (score desc if available, else name)
    list.sort((a, b) => {
      if (a.score != null || b.score != null) {
        return (b.score ?? 0) - (a.score ?? 0);
      }
      const fa = a.f || a;
      const fb = b.f || b;
      return fa.name.localeCompare(fb.name);
    });
  }

  return list;
}

function updateResultsCount(n) {
  const countEl = document.getElementById("resultsCount");
  if (!countEl) return;
  if (!n || n < 1) {
    countEl.textContent = "0 filament options";
  } else {
    countEl.textContent = `${n} filament option${n === 1 ? "" : "s"}`;
  }
}

function getActiveFilterCount() {
  let count = 0;
  if (hideHard) count += 1;
  if (printerFilter !== "any") count += 1;
  return count;
}

function updateFilterButtonState() {
  const btn = document.getElementById("filtersBtn");
  const label = document.getElementById("filtersBtnLabel");
  const activeCount = getActiveFilterCount();

  if (activeCount > 0) {
    btn.classList.add("filters-active");
    label.textContent = `Filters (${activeCount})`;
  } else {
    btn.classList.remove("filters-active");
    label.textContent = "Filters";
  }
}

function updateModeLine() {
  const line = document.getElementById("resultsModeLine");
  const filters = getActiveFilterCount();
  const filterText = `Filters applied: ${filters}`;

  const modeText =
    currentResultsMode === "library"
      ? "Showing full library"
      : (viewMode === "top3" ? "Showing Top 3" : "Showing All Matches");

  line.textContent = `${modeText} · ${filterText}`;
}

function renderWizardResults(scored, req) {
  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  // base filter: positive score
  let list = scored.filter(x => x.score > 0);

  // apply filters and sorting
  list = applyCommonFiltersAndSort(list);

  // apply view mode (Top 3 / All Matches) only for wizard mode
  if (viewMode === "top3") {
    list = list.slice(0, 3);
  }

  updateResultsCount(list.length);
  updateModeLine();

  if (list.length === 0) {
    resultsEl.innerHTML = `
      <div class="result-empty">
        <b>No strong matches found with current filters.</b><br/><br/>
        Try lowering max temperature, allowing higher difficulty, or adjusting Filters (top right).
      </div>`;
    return;
  }

  list.forEach(({ f, score, notes }, i) => {
    const card = document.createElement("div");
    card.className = "card-result";

    const reasons = Array.from(new Set(notes || []));
    const difficultyBadgeClass = getDifficultyBadgeClass(f.difficulty);
    const categoryBadgeClass = getCategoryBadgeClass(f.category);

    const priceText = (typeof f.pricePerKg === "number")
      ? `~$${f.pricePerKg.toFixed(0)}/kg (est.)`
      : "N/A";

    card.innerHTML = `
      <div class="card-result-header">
        <div class="card-result-title">
          <span class="filament-icon"></span>
          <span>#${i + 1} — ${f.name}</span>
        </div>
        <div class="card-result-score">Score: ${score.toFixed(1)}</div>
      </div>

      <div class="badge-row">
        <div class="badge ${categoryBadgeClass}">
          <span class="icon">🏷️</span><span>${f.category}</span>
        </div>
        <div class="badge ${difficultyBadgeClass}">
          <span class="icon">🎯</span><span>${f.difficulty}</span>
        </div>
        <div class="${enclosurePillClass(f)}" title="Based on typical warping and fume behavior. Enclosures help with demanding materials.">
          <span>🏠</span><span>${enclosurePillLabel(f)}</span>
        </div>
      </div>

      <div class="card-result-body">
        <p><b>Estimated price:</b> ${priceText}</p>
        <p title="Relative, hobby-level guidance. Always review filament MSDS and follow local safety requirements.">
          <b>Toxicity:</b> ${toxicityLabel(f.toxicity)}
        </p>
        <p><b>Use cases:</b> ${f.useCases}</p>
        <p><b>Pros:</b> ${f.pros}</p>
        <p><b>Cons:</b> ${f.cons}</p>
        ${
          reasons.length
            ? `<div class="why-title">Why it matches:</div>
               <ul class="why-list">
                 ${reasons.map(r => `<li>${r}</li>`).join("")}
               </ul>`
            : ""
        }
        <div class="profile-title">Print profile:</div>
        <ul class="profile-list">
          <li>Nozzle: ${f.nozzle}</li>
          <li>Bed: ${f.bed}</li>
          <li>Speed: ${f.speed}</li>
          <li>Adhesion: ${f.adhesion}</li>
        </ul>
        <button class="btn-copy-profile">📋 Copy profile</button>
      </div>
    `;

    const iconHost = card.querySelector(".filament-icon");
    if (iconHost) {
      iconHost.appendChild(createFilamentIconElement(f));
    }

    const copyBtn = card.querySelector(".btn-copy-profile");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const text =
          `Material: ${f.name}\n` +
          `Estimated price: ${priceText}\n` +
          `Toxicity: ${toxicityLabel(f.toxicity)}\n` +
          `Nozzle: ${f.nozzle}\n` +
          `Bed: ${f.bed}\n` +
          `Speed: ${f.speed}\n` +
          `Adhesion: ${f.adhesion}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            () => showToast("Profile copied to clipboard"),
            () => showToast("Could not access clipboard")
          );
        } else {
          showToast("Clipboard not supported here");
        }
      });
    }

    resultsEl.appendChild(card);
  });
}

function renderAllFilaments() {
  currentResultsMode = "library";

  document.getElementById("resultsTitle").textContent = "All filaments";
  document.getElementById("subtitle").textContent =
    "Complete filament list from the database. Use Filters and Sort By to refine what you see.";

  const hints = document.getElementById("resultsQuickHints");
  if (hints) {
    hints.innerHTML = `
      <div class="chip chip-ghost"><span>ℹ️</span><span>Filters and Sort By apply to this list too</span></div>
    `;
  }

  const resultsEl = document.getElementById("results");
  resultsEl.innerHTML = "";

  // Start with raw FILAMENTS list
  let list = FILAMENTS.map(f => ({ f }));

  list = applyCommonFiltersAndSort(list);

  updateResultsCount(list.length);
  updateModeLine();

  if (list.length === 0) {
    resultsEl.innerHTML = `
      <div class="result-empty">
        <b>No filaments visible with current filters.</b><br/><br/>
        Your current filters are hiding all materials. Try resetting filters or allowing more difficulty.
      </div>`;
    return;
  }

  list.forEach(({ f }, i) => {
    const card = document.createElement("div");
    card.className = "card-result";

    const difficultyBadgeClass = getDifficultyBadgeClass(f.difficulty);
    const categoryBadgeClass = getCategoryBadgeClass(f.category);

    const priceText = (typeof f.pricePerKg === "number")
      ? `~$${f.pricePerKg.toFixed(0)}/kg (est.)`
      : "N/A";

    card.innerHTML = `
      <div class="card-result-header">
        <div class="card-result-title">
          <span class="filament-icon"></span>
          <span>#${i + 1} — ${f.name}</span>
        </div>
      </div>

      <div class="badge-row">
        <div class="badge ${categoryBadgeClass}">
          <span class="icon">🏷️</span><span>${f.category}</span>
        </div>
        <div class="badge ${difficultyBadgeClass}">
          <span class="icon">🎯</span><span>${f.difficulty}</span>
        </div>
        <div class="${enclosurePillClass(f)}" title="Based on typical warping and fume behavior. Enclosures help with demanding materials.">
          <span>🏠</span><span>${enclosurePillLabel(f)}</span>
        </div>
      </div>

      <div class="card-result-body">
        <p><b>Estimated price:</b> ${priceText}</p>
        <p title="Relative, hobby-level guidance. Always review filament MSDS and follow local safety requirements.">
          <b>Toxicity:</b> ${toxicityLabel(f.toxicity)}</p>
        <p><b>Use cases:</b> ${f.useCases}</p>
        <p><b>Pros:</b> ${f.pros}</p>
        <p><b>Cons:</b> ${f.cons}</p>
        <div class="profile-title">Print profile:</div>
        <ul class="profile-list">
          <li>Nozzle: ${f.nozzle}</li>
          <li>Bed: ${f.bed}</li>
          <li>Speed: ${f.speed}</li>
          <li>Adhesion: ${f.adhesion}</li>
        </ul>
        <button class="btn-copy-profile">📋 Copy profile</button>
      </div>
    `;

    const iconHost = card.querySelector(".filament-icon");
    if (iconHost) {
      iconHost.appendChild(createFilamentIconElement(f));
    }

    const copyBtn = card.querySelector(".btn-copy-profile");
    if (copyBtn) {
      copyBtn.addEventListener("click", () => {
        const text =
          `Material: ${f.name}\n` +
          `Estimated price: ${priceText}\n` +
          `Toxicity: ${toxicityLabel(f.toxicity)}\n` +
          `Nozzle: ${f.nozzle}\n` +
          `Bed: ${f.bed}\n` +
          `Speed: ${f.speed}\n` +
          `Adhesion: ${f.adhesion}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(
            () => showToast("Profile copied to clipboard"),
            () => showToast("Could not access clipboard")
          );
        } else {
          showToast("Clipboard not supported here");
        }
      });
    }

    resultsEl.appendChild(card);
  });
}

function rerenderCurrentResults() {
  if (currentResultsMode === "library") {
    renderAllFilaments();
  } else {
    runWizard();
  }
}

function runWizard() {
  currentResultsMode = "wizard";

  const tempMap = { room: 30, 60: 60, 80: 80, 100: 100, 120: 120 };

  const req = {
    partType: document.getElementById("partType").value,
    strength: document.getElementById("strength").value,
    flexibility: document.getElementById("flexibility").value,
    environment: document.getElementById("environment").value,
    difficulty: document.getElementById("difficulty").value,
    special: document.getElementById("special").value || null,
    notes: document.getElementById("notes").value.trim(),
    tempCode: document.getElementById("temp").value,
    tempMax: tempMap[document.getElementById("temp").value] ?? 30
  };

  const subtitle = document.getElementById("subtitle");
  const title = document.getElementById("resultsTitle");
  const hints = document.getElementById("resultsQuickHints");

  title.textContent = "Recommendations";
  subtitle.textContent =
    `Part: ${labelPartType(req.partType)} • ` +
    `${labelStrength(req.strength)} • ` +
    `${labelTemp(req.tempCode)} • ` +
    `${labelEnv(req.environment)} • ` +
    `${labelDifficulty(req.difficulty)}`;

  if (hints) {
    hints.innerHTML = `
      <div class="chip chip-ghost">
        <span>🎨</span><span>Decorative → PLA / PLA+</span>
      </div>
      <div class="chip chip-ghost">
        <span>🛠️</span><span>Mechanical → PETG / ASA</span>
      </div>
      <div class="chip chip-ghost">
        <span>🌤️</span><span>Outdoor → ASA / PETG</span>
      </div>
      <div class="chip chip-ghost">
        <span>🔥</span><span>High heat → ASA / PC / Nylon</span>
      </div>
    `;
  }

  const scored = [];
  FILAMENTS.forEach(f => {
    const { score, notes } = computeScore(req, f);
    if (score > -50) scored.push({ f, score, notes });
  });

  renderWizardResults(scored, req);
}

function resetWizard() {
  document.getElementById("partType").value = "decorative";
  document.getElementById("strength").value = "low";
  document.getElementById("flexibility").value = "rigid";
  document.getElementById("temp").value = "room";
  document.getElementById("environment").value = "indoor";
  document.getElementById("difficulty").value = "any";
  document.getElementById("special").value = "";
  document.getElementById("notes").value = "";
  viewMode = "top3";
  hideHard = false;
  printerFilter = "any";
  sortBy = "score";

  document.getElementById("viewTop3").classList.add("chip-active");
  document.getElementById("viewAll").classList.remove("chip-active");

  document.getElementById("filterHideHard").checked = false;
  document.getElementById("sortBy").value = "score";
  document.querySelectorAll('input[name="printerFilter"]').forEach(r => {
    if (r.value === "any") r.checked = true;
  });

  const title = document.getElementById("resultsTitle");
  const subtitle = document.getElementById("subtitle");
  const hints = document.getElementById("resultsQuickHints");
  const results = document.getElementById("results");

  currentResultsMode = "wizard";
  title.textContent = "Recommendations";
  subtitle.textContent =
    "Up to 3 best-matching materials will appear here, with pros/cons and a quick print profile.";
  if (hints) {
    hints.innerHTML = `
      <div class="chip chip-ghost">
        <span>🎨</span><span>Decorative → PLA / PLA+</span>
      </div>
      <div class="chip chip-ghost">
        <span>🛠️</span><span>Mechanical → PETG / ASA</span>
      </div>
      <div class="chip chip-ghost">
        <span>🌤️</span><span>Outdoor → ASA / PETG</span>
      </div>
      <div class="chip chip-ghost">
        <span>🔥</span><span>High heat → ASA / PC / Nylon</span>
      </div>
    `;
  }

  updateResultsCount(0);
  updateFilterButtonState();
  updateModeLine();

  results.innerHTML =
    '<div class="result-empty">No results yet.<br/><br/>Tell the wizard about your part and click <b>Find filaments</b> to see recommendations.</div>';
}

function setViewMode(mode) {
  viewMode = mode;
  const top3 = document.getElementById("viewTop3");
  const all = document.getElementById("viewAll");
  top3.classList.toggle("chip-active", mode === "top3");
  all.classList.toggle("chip-active", mode === "all");

  const results = document.getElementById("results");
  if (results.querySelector(".card-result")) {
    rerenderCurrentResults();
  } else {
    updateModeLine();
  }
}

// Calculator logic
function getNumber(id) {
  const val = parseFloat(document.getElementById(id).value);
  return isNaN(val) ? 0 : val;
}

function resetCalculator() {
  [
    "calcFilamentGrams",
    "calcSpoolGrams",
    "calcSpoolCost",
    "calcPowerCostPerHour",
    "calcPrintHours",
    "calcPrintMinutes",
    "calcLaborRate",
    "calcLaborHours",
    "calcLaborMinutes",
    "calcOtherCosts"
  ].forEach(id => (document.getElementById(id).value = ""));

  const slider = document.getElementById("markupSlider");
  slider.value = 0;
  updateMarkupLabel();

  document.getElementById("calcSummary").innerHTML =
    "Enter values above and hit <b>Calculate</b>.";
}

function updateMarkupLabel() {
  const slider = document.getElementById("markupSlider");
  const label = document.getElementById("markupValueLabel");
  const val = parseInt(slider.value, 10) || 0;
  label.textContent = val + "%";
  label.classList.toggle("green", val >= 420);
}

function runCalculator() {
  const filamentGrams = getNumber("calcFilamentGrams");
  const spoolGrams = getNumber("calcSpoolGrams") || 1;
  const spoolCost = getNumber("calcSpoolCost");

  const powerCostPerHour = getNumber("calcPowerCostPerHour");
  const printHours = getNumber("calcPrintHours");
  const printMinutes = getNumber("calcPrintMinutes");
  const laborRate = getNumber("calcLaborRate");
  const laborHours = getNumber("calcLaborHours");
  const laborMinutes = getNumber("calcLaborMinutes");
  const otherCosts = getNumber("calcOtherCosts");

  const printTimeHours = printHours + (printMinutes / 60);
  const laborTimeHours = laborHours + (laborMinutes / 60);

  const filamentCost = spoolGrams > 0
    ? (filamentGrams / spoolGrams) * spoolCost
    : 0;

  const energyCost = powerCostPerHour > 0 && printTimeHours > 0
    ? powerCostPerHour * printTimeHours
    : 0;

  const laborCost = laborRate > 0 && laborTimeHours > 0
    ? laborRate * laborTimeHours
    : 0;

  const baseTotal = filamentCost + energyCost + laborCost + otherCosts;
  const markup = parseInt(document.getElementById("markupSlider").value, 10) || 0;
  const salePrice = baseTotal * (1 + markup / 100);

  const summary = document.getElementById("calcSummary");
  summary.innerHTML = `
    <p><b>Filament cost:</b> $${filamentCost.toFixed(2)}</p>
    <p><b>Energy cost:</b> $${energyCost.toFixed(2)} ${powerCostPerHour <= 0 ? '(power cost not set)' : ''}</p>
    <p><b>Labour cost:</b> $${laborCost.toFixed(2)}</p>
    <p><b>Other costs:</b> $${otherCosts.toFixed(2)}</p>
    <p><b>Base total:</b> $${baseTotal.toFixed(2)}</p>
    <p><b>Markup:</b> ${markup}%</p>
    <p><b>Suggested price:</b> $${salePrice.toFixed(2)}</p>
  `;
}
