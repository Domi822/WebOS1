(function () {
  const desktop = document.getElementById("desktop");
  const welcome = document.getElementById("welcome");
  const startButton = document.getElementById("startButton");
  const visitorPop = document.getElementById("visitorPop");
  const visitorForm = document.getElementById("visitorForm");
  const visitorName = document.getElementById("visitorName");
  const visitorCountry = document.getElementById("visitorCountry");
  const visitorList = document.getElementById("visitorList");
  const clock = document.getElementById("clock");
  const themeButton = document.getElementById("themeButton");
  const windows = Array.from(document.querySelectorAll(".app-window"));
  const openButtons = Array.from(document.querySelectorAll("[data-open-app]"));
  const closeButtons = Array.from(document.querySelectorAll("[data-close-app]"));
  const notesText = document.getElementById("notesText");
  const windowCount = document.getElementById("windowCount");
  const snapLeft = document.getElementById("snapLeft");
  const snapRight = document.getElementById("snapRight");
  const calcDisplay = document.getElementById("calcDisplay");
  const calcHistory = document.getElementById("calcHistory");
  const calcButtons = Array.from(document.querySelectorAll("[data-calc]"));
  const galleryTiles = Array.from(document.querySelectorAll(".gallery-tile"));
  const galleryPreview = document.getElementById("galleryPreview");
  const galleryImage = document.getElementById("galleryImage");
  const galleryPreviewLabel = document.getElementById("galleryPreviewLabel");
  const galleryCaption = document.getElementById("galleryCaption");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  const JSONBIN_BIN_ID = "6a3f9385f5f4af5e2938324c";
  const JSONBIN_ACCESS_KEY = "$2a$10$.7Ob.JWpbhgXAIgwjEnZDe5OUQ2z/n1p/jPLU0LUIJn9kTiIyhM3u";
  const JSONBIN_STORE_URL = JSONBIN_BIN_ID ? `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}` : "";
  const JSONBIN_READ_URL = JSONBIN_STORE_URL ? `${JSONBIN_STORE_URL}?meta=false` : "";
  const FALLBACK_STORE_URL = "https://jsonblob.com/api/jsonBlob/019f0852-1f21-768a-a5f7-febfd1a61a02";

  let topZ = 30;
  let calcExpression = "";
  let currentGalleryIndex = 0;
  let detectedCountry = "Unknown";

  function updateCalcDisplay(displayText, historyText) {
    calcDisplay.textContent = displayText || "0";
    calcHistory.textContent = historyText || "Ready";
  }

  function updateClock() {
    const now = new Date();
    clock.textContent = now.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit"
    });
  }

  function updateWindowCount() {
    const openCount = windows.filter((win) => win.classList.contains("is-open")).length;
    windowCount.textContent = `${openCount} open`;
  }

  function getLocalVisitors() {
    try {
      return JSON.parse(localStorage.getItem("stardance-visitors") || "[]");
    } catch (error) {
      return [];
    }
  }

  function saveLocalVisitors(visitors) {
    localStorage.setItem("stardance-visitors", JSON.stringify(visitors));
  }

  async function getVisitors() {
    try {
      const response = await fetch(JSONBIN_READ_URL || FALLBACK_STORE_URL, {
        headers: JSONBIN_STORE_URL
          ? { Accept: "application/json", "X-Access-Key": JSONBIN_ACCESS_KEY }
          : { Accept: "application/json" }
      });
      if (!response.ok) throw new Error("Visitor store unavailable");
      const data = await response.json();
      const visitors = JSONBIN_STORE_URL ? data.visitors : data;
      return Array.isArray(visitors) ? visitors : [];
    } catch (error) {
      return getLocalVisitors();
    }
  }

  async function saveVisitor(visitor) {
    try {
      const visitors = await getVisitors();
      const savedVisitor = {
        ...visitor,
        visitedAt: new Date().toISOString()
      };
      const nextVisitors = [...visitors, savedVisitor].slice(-250);
      const response = await fetch(JSONBIN_STORE_URL || FALLBACK_STORE_URL, {
        method: "PUT",
        headers: JSONBIN_STORE_URL
          ? {
              Accept: "application/json",
              "Content-Type": "application/json",
              "X-Access-Key": JSONBIN_ACCESS_KEY
            }
          : {
              Accept: "application/json",
              "Content-Type": "application/json"
            },
        body: JSON.stringify(JSONBIN_STORE_URL ? { visitors: nextVisitors } : nextVisitors)
      });
      if (!response.ok) throw new Error("Visitor store unavailable");
      return savedVisitor;
    } catch (error) {
      const visitors = getLocalVisitors();
      visitors.push({ ...visitor, visitedAt: new Date().toISOString() });
      saveLocalVisitors(visitors);
      return visitor;
    }
  }

  function formatVisitTime(isoDate) {
    return new Date(isoDate).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  async function renderVisitors() {
    const visitors = await getVisitors();
    if (!visitors.length) {
      visitorList.innerHTML = '<p class="gallery-caption">No visitors saved yet.</p>';
      return;
    }

    visitorList.innerHTML = visitors
      .slice()
      .reverse()
      .map((visitor) => `
        <div class="visitor-row">
          <div>
            <strong>${escapeHtml(visitor.name)}</strong>
            <span>${formatVisitTime(visitor.visitedAt)}</span>
          </div>
          <div class="visitor-country-badge">${escapeHtml(visitor.country)}</div>
        </div>
      `)
      .join("");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  async function detectCountry() {
    try {
      const response = await fetch("https://ipwho.is/");
      if (!response.ok) throw new Error("Country lookup failed");
      const data = await response.json();
      detectedCountry = data.country_name || data.country || "Unknown";
      visitorCountry.textContent = `Detected country: ${detectedCountry}`;
    } catch (error) {
      detectedCountry = "Unknown";
      visitorCountry.textContent = "Country could not be detected automatically.";
    }
  }

  function showVisitorPromptIfNeeded() {
    if (localStorage.getItem("stardance-visitor-joined") === "yes") return;
    visitorPop.classList.add("visible");
    detectCountry();
    setTimeout(() => visitorName.focus(), 120);
  }

  async function addVisitor(name) {
    const cleanName = name.trim().slice(0, 24) || "Anonymous";
    await saveVisitor({
      name: cleanName,
      country: detectedCountry
    });
    localStorage.setItem("stardance-visitor-joined", "yes");
    visitorPop.classList.remove("visible");
    await renderVisitors();
    openApp("visitors");
  }

  function focusWindow(win) {
    topZ += 1;
    win.style.zIndex = topZ;
  }

  function openApp(appName) {
    const win = document.querySelector(`[data-app="${appName}"]`);
    if (!win) return;
    win.classList.add("is-open");
    focusWindow(win);
    updateWindowCount();
  }

  function closeApp(appName) {
    const win = document.querySelector(`[data-app="${appName}"]`);
    if (!win) return;
    win.classList.remove("is-open");
    updateWindowCount();
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function hideSnapHints() {
    snapLeft.classList.remove("visible");
    snapRight.classList.remove("visible");
  }

  function makeDraggable(win) {
    const titlebar = win.querySelector(".window-titlebar");
    let startX = 0;
    let startY = 0;
    let initialLeft = 0;
    let initialTop = 0;

    titlebar.addEventListener("pointerdown", (event) => {
      if (event.target.closest("button")) return;

      const rect = win.getBoundingClientRect();
      startX = event.clientX;
      startY = event.clientY;
      initialLeft = rect.left;
      initialTop = rect.top;

      win.classList.add("dragging");
      focusWindow(win);
      titlebar.setPointerCapture(event.pointerId);
    });

    titlebar.addEventListener("pointermove", (event) => {
      if (!win.classList.contains("dragging")) return;

      const nextLeft = initialLeft + event.clientX - startX;
      const nextTop = initialTop + event.clientY - startY;
      const maxLeft = window.innerWidth - win.offsetWidth - 10;
      const maxTop = window.innerHeight - win.offsetHeight - 92;

      win.style.left = `${clamp(nextLeft, 10, Math.max(10, maxLeft))}px`;
      win.style.top = `${clamp(nextTop, 72, Math.max(72, maxTop))}px`;

      snapLeft.classList.toggle("visible", event.clientX < 90);
      snapRight.classList.toggle("visible", event.clientX > window.innerWidth - 90);
    });

    titlebar.addEventListener("pointerup", (event) => {
      if (!win.classList.contains("dragging")) return;

      if (event.clientX < 90) {
        win.style.left = "18px";
        win.style.right = "auto";
        win.style.top = "86px";
        win.style.width = "min(46vw, calc(100vw - 36px))";
      } else if (event.clientX > window.innerWidth - 90) {
        win.style.left = "auto";
        win.style.right = "18px";
        win.style.top = "86px";
        win.style.width = "min(46vw, calc(100vw - 36px))";
      } else {
        win.style.right = "auto";
      }

      win.classList.remove("dragging");
      hideSnapHints();
      titlebar.releasePointerCapture(event.pointerId);
    });

    titlebar.addEventListener("pointercancel", () => {
      win.classList.remove("dragging");
      hideSnapHints();
    });
  }

  function setTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("stardance-theme", theme);
  }

  function handleCalc(value) {
    if (value === "clear") {
      calcExpression = "";
      updateCalcDisplay("0", "Ready");
      return;
    }

    if (value === "back") {
      calcExpression = calcExpression.slice(0, -1);
      updateCalcDisplay(calcExpression || "0", "Editing");
      return;
    }

    if (value === "=") {
      try {
        if (!/^[0-9+\-*/. ()]+$/.test(calcExpression)) throw new Error("Invalid");
        const result = Function(`"use strict"; return (${calcExpression || "0"})`)();
        const oldExpression = calcExpression;
        calcExpression = Number.isFinite(result) ? String(Number(result.toFixed(8))) : "";
        updateCalcDisplay(calcExpression || "Error", oldExpression ? `${oldExpression} =` : "Ready");
      } catch (error) {
        calcExpression = "";
        updateCalcDisplay("Error", "Try again");
      }
      return;
    }

    if (value === ".") {
      const parts = calcExpression.split(/[+\-*/]/);
      const currentNumber = parts[parts.length - 1];
      if (currentNumber.includes(".")) return;
    }

    if (/^[+\-*/]$/.test(value) && /^[+\-*/]$/.test(calcExpression.slice(-1))) {
      calcExpression = calcExpression.slice(0, -1);
    }

    calcExpression += value;
    updateCalcDisplay(calcExpression, "Editing");
  }

  function showGalleryImage(index) {
    currentGalleryIndex = (index + galleryTiles.length) % galleryTiles.length;
    const activeTile = galleryTiles[currentGalleryIndex];
    const caption = activeTile.dataset.caption;
    const src = activeTile.dataset.src;

    galleryTiles.forEach((tile) => tile.classList.remove("active"));
    activeTile.classList.add("active");
    galleryPreview.dataset.gallery = String(currentGalleryIndex);
    galleryImage.src = src;
    galleryImage.alt = caption;
    galleryPreviewLabel.textContent = caption;
    galleryCaption.textContent = caption;
  }

  startButton.addEventListener("click", () => {
    welcome.classList.add("hidden");
    showVisitorPromptIfNeeded();
  });

  visitorForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addVisitor(visitorName.value);
  });

  themeButton.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark") ? "light" : "dark";
    setTheme(nextTheme);
  });

  openButtons.forEach((button) => {
    button.addEventListener("click", () => openApp(button.dataset.openApp));
  });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => closeApp(button.dataset.closeApp));
  });

  windows.forEach((win) => {
    makeDraggable(win);
    win.addEventListener("pointerdown", () => focusWindow(win));
  });

  notesText.value = localStorage.getItem("stardance-notes") || notesText.value;
  notesText.addEventListener("input", () => {
    localStorage.setItem("stardance-notes", notesText.value);
  });

  const galleryGrid = document.getElementById("galleryGrid");
  galleryGrid.addEventListener("click", (event) => {
    const tile = event.target.closest(".gallery-tile");
    if (!tile) return;
    showGalleryImage(Number(tile.dataset.gallery));
  });

  galleryPrev.addEventListener("click", () => showGalleryImage(currentGalleryIndex - 1));
  galleryNext.addEventListener("click", () => showGalleryImage(currentGalleryIndex + 1));

  calcButtons.forEach((button) => {
    button.addEventListener("click", () => handleCalc(button.dataset.calc));
  });

  window.addEventListener("keydown", (event) => {
    if (!document.querySelector('[data-app="calculator"]').classList.contains("is-open")) return;
    if (event.target.matches("textarea, input")) return;

    const keyMap = {
      Enter: "=",
      Escape: "clear",
      Backspace: "back",
      x: "*",
      X: "*"
    };
    const value = keyMap[event.key] || event.key;
    if (/^[0-9+\-*/.=]$/.test(value) || value === "clear" || value === "back") {
      event.preventDefault();
      handleCalc(value);
    }
  });

  setTheme(localStorage.getItem("stardance-theme") || "light");
  windows.filter((win) => win.classList.contains("is-open")).forEach(focusWindow);
  renderVisitors();
  updateClock();
  updateWindowCount();
  setInterval(updateClock, 1000);
})();
