(function () {
  const desktop = document.getElementById("desktop");
  const welcome = document.getElementById("welcome");
  const startButton = document.getElementById("startButton");
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

  let topZ = 30;
  let calcExpression = "";
  let currentGalleryIndex = 0;

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
  updateClock();
  updateWindowCount();
  setInterval(updateClock, 1000);
})();
