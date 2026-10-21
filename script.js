(function () {
  "use strict";
  const VERSION = "1.0.0";
  const APP_URLS = {
    youtube: "https://www.youtube.com/tv",
    prime: "https://www.primevideo.com/",
    disney: "https://www.disneyplus.com/",
    netflix: "https://www.netflix.com/",
    samsung: "https://www.samsungtvplus.com/"
  };
  const welcome = document.getElementById("welcome");
  const modal = document.getElementById("modal");
  const toast = document.getElementById("toast");
  const modalTitle = document.getElementById("modal-title");
  const modalCopy = document.getElementById("modal-copy");
  const modalEyebrow = document.getElementById("modal-eyebrow");
  const modalActions = document.getElementById("modal-actions");
  let toastTimer;
  let lastFocus = null;
  document.getElementById("version-label").textContent = VERSION;

  function updateClock() {
    const now = new Date();
    document.getElementById("clock").textContent = new Intl.DateTimeFormat(undefined, {hour:"2-digit", minute:"2-digit"}).format(now);
  }
  updateClock();
  window.setInterval(updateClock, 30_000);

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 2800);
  }
  function hideWelcome() {
    welcome.classList.remove("is-visible");
    try { localStorage.setItem("dummy-ui-seen", "yes"); } catch (_) {}
  }
  function button(label, action, href) {
    const element = document.createElement("button");
    element.type = "button";
    element.textContent = label;
    element.dataset.modalAction = action;
    if (href) element.dataset.href = href;
    return element;
  }
  function openModal(title, copy, eyebrow, actions) {
    lastFocus = document.activeElement;
    modalTitle.textContent = title;
    modalCopy.textContent = copy;
    modalEyebrow.textContent = eyebrow || "DUMMY UI";
    modalActions.replaceChildren(...actions);
    modal.classList.add("is-visible");
    modal.setAttribute("aria-hidden", "false");
    modal.querySelector(".modal-close").focus();
  }
  function closeModal() {
    modal.classList.remove("is-visible");
    modal.setAttribute("aria-hidden", "true");
    if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
  }
  function launchUrl(url, name) {
    const openBrowserFallback = () => {
      const opened = window.open(url, "_blank");
      if (opened) opened.opener = null;
      else showToast("Allow pop-ups to open " + name + " in the browser.");
    };
    // A browser-based launcher cannot bypass service DRM, ads, or account policies.
    // Use the TV's official app when one is installed; web links are a best-effort fallback.
    if (window.tizen && window.tizen.application && window.tizen.application.launchAppControl) {
      try {
        const operation = new window.tizen.ApplicationControl("http://tizen.org/appcontrol/operation/view", url, "http", null, null);
        window.tizen.application.launchAppControl(operation, null, function () {
          showToast("Could not open " + name + ". Try its official TV app.");
        }, function () {
          showToast("Opening " + name + " in the TV browser");
        });
        return;
      } catch (_) { /* Fall back to the browser link below. */ }
    }
    openBrowserFallback();
  }
  function showApp(appId, name) {
    const url = APP_URLS[appId];
    openModal("Open " + name + "?", "Dummy UI can open the service website in a browser when the TV supports it. For the most reliable playback and sign-in, install and use the official Samsung TV app. Availability, DRM, and account features depend on the service and your TV model.", "STREAMING SERVICE", [
      button("Open website", "launch", url), button("Back", "close")
    ]);
  }
  function showUpdate() {
    openModal("New UI Update", "Dummy UI 1.0.0 brings a refreshed glass interface, smoother transitions, remote-friendly focus, and a new app launcher.", "JUST UPDATED · VERSION " + VERSION, [button("Explore", "close")]);
  }
  function perform(action, el) {
    if (action === "start") {
      hideWelcome();
      try {
        const previous = localStorage.getItem("dummy-ui-version");
        localStorage.setItem("dummy-ui-version", VERSION);
        if (previous && previous !== VERSION) showUpdate();
      } catch (_) {}
      return;
    }
    if (action === "close") { closeModal(); return; }
    if (action === "browse" || action === "all-apps") {
      document.getElementById("apps").scrollIntoView({behavior:"smooth",block:"center"});
      document.querySelector(".app-card").focus();
      return;
    }
    if (action === "settings") {
      openModal("A little about Dummy UI", "Dummy UI is a TV launcher concept, version " + VERSION + ". It does not replace Samsung's operating system. Streaming playback and sign-in come from each service's official TV app or supported browser.", "SYSTEM INFORMATION", [button("Got it", "close")]);
      return;
    }
    if (action === "help") {
      openModal("Use your TV remote", "Use the arrow keys to move between controls, OK or Enter to select, and Backspace or Escape to close a panel. On a Samsung remote, the standard directional and select buttons are used.", "REMOTE GUIDE", [button("Got it", "close")]);
      return;
    }
    if (action === "launch" && el?.dataset.href) { closeModal(); launchUrl(el.dataset.href, modalTitle.textContent.replace("Open ", "")); }
  }
  document.addEventListener("click", function (event) {
    const actionTarget = event.target.closest("[data-action]");
    if (actionTarget) { perform(actionTarget.dataset.action, actionTarget); return; }
    const appTarget = event.target.closest("[data-app]");
    if (appTarget) showApp(appTarget.dataset.app, appTarget.dataset.name);
    const modalTarget = event.target.closest("[data-modal-action]");
    if (modalTarget) perform(modalTarget.dataset.modalAction, modalTarget);
  });
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" || event.key === "Backspace") {
      if (modal.classList.contains("is-visible")) { event.preventDefault(); closeModal(); return; }
      if (welcome.classList.contains("is-visible")) { event.preventDefault(); hideWelcome(); return; }
    }
    if (modal.classList.contains("is-visible") && event.key === "Tab") {
      const focusable = Array.from(modal.querySelectorAll("button"));
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
    const key = event.key;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(key)) return;

    if (modal.classList.contains("is-visible")) {
      const modalButtons = Array.from(modal.querySelectorAll("button"));
      const current = modalButtons.indexOf(document.activeElement);
      if (current >= 0) {
        const step = key === "ArrowLeft" || key === "ArrowUp" ? -1 : 1;
        modalButtons[(current + step + modalButtons.length) % modalButtons.length].focus();
        event.preventDefault();
      }
      return;
    }

    const cards = Array.from(document.querySelectorAll(".app-card"));
    const currentCard = cards.indexOf(document.activeElement);
    const explore = document.querySelector('[data-action="browse"]');
    const allApps = document.querySelector('[data-action="all-apps"]');
    const help = document.querySelector('[data-action="help"]');
    const profile = document.querySelector('[data-action="settings"]');
    let next = null;
    if (currentCard >= 0) {
      if (key === "ArrowLeft") next = cards[Math.max(0, currentCard - 1)];
      if (key === "ArrowRight") next = cards[Math.min(cards.length - 1, currentCard + 1)];
      if (key === "ArrowUp") next = explore;
      if (key === "ArrowDown") next = help;
    } else if (document.activeElement === explore || document.activeElement === allApps) {
      if (key === "ArrowDown" || key === "ArrowRight") next = cards[0];
      if (key === "ArrowUp") next = profile;
    } else if (document.activeElement === help) {
      if (key === "ArrowUp") next = cards[0];
    } else if (document.activeElement === profile) {
      if (key === "ArrowDown") next = explore;
    }
    if (next) {
      next.focus();
      event.preventDefault();
    }
  });
  try {
    if (localStorage.getItem("dummy-ui-seen") === "yes") welcome.classList.remove("is-visible");
    const version = localStorage.getItem("dummy-ui-version");
    if (!welcome.classList.contains("is-visible") && version && version !== VERSION) {
      showUpdate();
      localStorage.setItem("dummy-ui-version", VERSION);
    }
  } catch (_) {}
})();
