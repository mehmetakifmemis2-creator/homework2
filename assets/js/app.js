document.addEventListener("DOMContentLoaded", () => {
  // UI elements
  const tempValueEl = document.getElementById("tempValue");
  const tempUnitEl = document.getElementById("tempUnit");
  const statusBadge = document.getElementById("statusBadge");

  const slider = document.getElementById("tempSlider");
  const btnC = document.getElementById("btnC");
  const btnF = document.getElementById("btnF");

  const minComfortEl = document.getElementById("minComfort");
  const maxComfortEl = document.getElementById("maxComfort");
  const minShow = document.getElementById("minShow");
  const maxShow = document.getElementById("maxShow");

  const btnApplyRange = document.getElementById("btnApplyRange");
  const btnSave = document.getElementById("btnSave");
  const btnReset = document.getElementById("btnReset");

  const savedInfo = document.getElementById("savedInfo");
  const historyList = document.getElementById("historyList");

  // localStorage keys
  const LS = {
    UNIT: "st_unit",
    TEMP_C: "st_temp_c",
    MIN_C: "st_min_c",
    MAX_C: "st_max_c",
    HISTORY: "st_history" // array of {value, unit, time}
  };

  // State (store temperature internally in Celsius)
  let unit = "C";
  let tempC = 22;
  let minC = 18;
  let maxC = 26;
  let history = [];

  // Helpers
  const cToF = (c) => Math.round((c * 9) / 5 + 32);
  const fToC = (f) => Math.round(((f - 32) * 5) / 9);

  function setBadge(type, text) {
    statusBadge.classList.remove("ok", "warn", "bad");
    statusBadge.classList.add(type);
    statusBadge.textContent = text;
  }

  function updateStatus() {
    if (Number.isNaN(minC) || Number.isNaN(maxC) || minC >= maxC) {
      setBadge("warn", "Fix comfort range");
      return;
    }
    if (tempC < minC) setBadge("bad", "Too cold");
    else if (tempC > maxC) setBadge("bad", "Too hot");
    else setBadge("ok", "Comfort");
  }

  function render() {
    // show values
    const shown = unit === "C" ? tempC : cToF(tempC);
    tempValueEl.textContent = String(shown);
    tempUnitEl.textContent = unit === "C" ? "°C" : "°F";

    minShow.textContent = String(minC);
    maxShow.textContent = String(maxC);

    updateStatus();
  }

  function renderHistory() {
    historyList.innerHTML = "";
    const recent = history.slice().reverse();
    recent.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = `${item.value}${item.unit} — ${item.time}`;
      historyList.appendChild(li);
    });
  }

  function saveToStorage() {
    localStorage.setItem(LS.UNIT, unit);
    localStorage.setItem(LS.TEMP_C, String(tempC));
    localStorage.setItem(LS.MIN_C, String(minC));
    localStorage.setItem(LS.MAX_C, String(maxC));
    localStorage.setItem(LS.HISTORY, JSON.stringify(history));
  }

  function loadFromStorage() {
    const u = localStorage.getItem(LS.UNIT);
    const t = localStorage.getItem(LS.TEMP_C);
    const mn = localStorage.getItem(LS.MIN_C);
    const mx = localStorage.getItem(LS.MAX_C);
    const h = localStorage.getItem(LS.HISTORY);

    if (u === "C" || u === "F") unit = u;
    if (t !== null && !Number.isNaN(Number(t))) tempC = Number(t);
    if (mn !== null && !Number.isNaN(Number(mn))) minC = Number(mn);
    if (mx !== null && !Number.isNaN(Number(mx))) maxC = Number(mx);

    if (h) {
      try {
        const parsed = JSON.parse(h);
        if (Array.isArray(parsed)) history = parsed;
      } catch (_) {}
    }
  }

  function setUnitButtons() {
    btnC.classList.toggle("active", unit === "C");
    btnF.classList.toggle("active", unit === "F");
  }

  function updateSavedInfo() {
    if (history.length === 0) {
      savedInfo.textContent = "—";
      return;
    }
    const last = history[history.length - 1];
    savedInfo.textContent = `${last.value}${last.unit} @ ${last.time}`;
  }

  // Events
  slider.addEventListener("input", () => {
    tempC = Number(slider.value);
    render();
  });

  btnC.addEventListener("click", () => {
    unit = "C";
    setUnitButtons();
    render();
    saveToStorage();
  });

  btnF.addEventListener("click", () => {
    unit = "F";
    setUnitButtons();
    render();
    saveToStorage();
  });

  btnApplyRange.addEventListener("click", () => {
    minC = Number(minComfortEl.value);
    maxC = Number(maxComfortEl.value);
    render();
    saveToStorage();
  });

btnSave.addEventListener("click", () => {
  // Always read the latest value from the slider
  tempC = Number(slider.value);

  const shown = unit === "C" ? tempC : cToF(tempC);
  const now = new Date();
  const time = now.toLocaleString();

  history.push({ value: shown, unit: unit === "C" ? "°C" : "°F", time });
  if (history.length > 8) history.shift();

  updateSavedInfo();
  renderHistory();
  saveToStorage();

  // optional: re-render to be sure UI is synced
  render();
});


  btnReset.addEventListener("click", () => {
    // reset to defaults
    unit = "C";
    tempC = 22;
    minC = 18;
    maxC = 26;
    history = [];

    localStorage.removeItem(LS.UNIT);
    localStorage.removeItem(LS.TEMP_C);
    localStorage.removeItem(LS.MIN_C);
    localStorage.removeItem(LS.MAX_C);
    localStorage.removeItem(LS.HISTORY);

    slider.value = String(tempC);
    minComfortEl.value = String(minC);
    maxComfortEl.value = String(maxC);

    setUnitButtons();
    render();
    renderHistory();
    updateSavedInfo();
  });

  // Init
  loadFromStorage();

  // sync inputs with loaded state
  slider.value = String(tempC);
  minComfortEl.value = String(minC);
  maxComfortEl.value = String(maxC);

  setUnitButtons();
  render();
  renderHistory();
  updateSavedInfo();
});
