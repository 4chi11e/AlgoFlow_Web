const loadNodeLabelPreference = () => {
  try {
    const rawPreference = window.localStorage.getItem(NODE_LABEL_PREFERENCE_KEY);
    showNodeTypeInLabel = rawPreference === "true";
  } catch {
    showNodeTypeInLabel = false;
  }

  if (showNodeTypeToggle) {
    showNodeTypeToggle.checked = showNodeTypeInLabel;
  }
};

const saveNodeLabelPreference = () => {
  try {
    window.localStorage.setItem(NODE_LABEL_PREFERENCE_KEY, String(showNodeTypeInLabel));
  } catch {
    // Ignore storage failures.
  }
};

const getActiveMainViewId = () => {
  const activeView = Array.from(mainViews).find((view) => view.classList.contains("is-active"));
  return activeView?.id ?? "diagram-view";
};

const setActiveMainView = (targetId) => {
  if (!targetId) {
    return;
  }

  let hasMatchingView = false;

  mainViews.forEach((view) => {
    const isTarget = view.id === targetId;
    view.classList.toggle("is-active", isTarget);
    view.hidden = !isTarget;

    if (isTarget) {
      hasMatchingView = true;
    }
  });

  if (!hasMatchingView) {
    return;
  }

  mainTabs.forEach((item) => {
    const isTarget = item.dataset.mainTarget === targetId;
    item.classList.toggle("is-active", isTarget);
    item.setAttribute("aria-selected", String(isTarget));
  });

  appShell?.classList.toggle("is-code-view", targetId === "code-view");
  syncMobileSelectionControls();
};

const loadMainViewPreference = () => {
  try {
    const storedValue = window.localStorage.getItem(MAIN_VIEW_PREFERENCE_KEY);
    return storedValue || "diagram-view";
  } catch {
    return "diagram-view";
  }
};

const saveMainViewPreference = (targetId) => {
  try {
    window.localStorage.setItem(MAIN_VIEW_PREFERENCE_KEY, targetId);
  } catch {
    // Ignore storage failures.
  }
};

const syncFocusModeButton = () => {
  if (!focusModeButton) {
    return;
  }

  focusModeButton.classList.toggle("is-active", isDiagramFocusMode);
  focusModeButton.textContent = isDiagramFocusMode ? "Esci" : "Focus";
  focusModeButton.title = isDiagramFocusMode ? "Esci dalla modalita focus (Esc)" : "Modalita focus vista corrente (F)";
  focusModeButton.setAttribute("aria-pressed", String(isDiagramFocusMode));
};

const showZoomIndicator = (zoom) => {
  if (!zoomIndicator) {
    return;
  }

  window.clearTimeout(zoomIndicatorHideTimer);
  window.clearTimeout(zoomIndicatorConcealTimer);

  zoomIndicator.textContent = `${Math.round(zoom * 100)}%`;
  zoomIndicator.hidden = false;

  window.requestAnimationFrame(() => {
    zoomIndicator.classList.add("is-visible");
  });

  zoomIndicatorHideTimer = window.setTimeout(() => {
    zoomIndicator.classList.remove("is-visible");
    zoomIndicatorConcealTimer = window.setTimeout(() => {
      if (!zoomIndicator.classList.contains("is-visible")) {
        zoomIndicator.hidden = true;
      }
    }, 220);
  }, 1450);
};

const setDiagramFocusMode = (nextValue) => {
  const shouldEnable = Boolean(nextValue);

  if (isDiagramFocusMode === shouldEnable) {
    return;
  }

  isDiagramFocusMode = shouldEnable;
  appShell?.classList.toggle("is-focus-mode", isDiagramFocusMode);
  syncFocusModeButton();
  renderFlowchart();
};

const syncMobileSidebarView = () => {
  const isMobile = isCompactLayout();

  mobileSidebarTabs.forEach((tab) => {
    const isActive = tab.dataset.sidebarTarget === mobileSidebarView;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  if (!variablesSection || !terminalSection) {
    return;
  }

  if (!isMobile) {
    variablesSection.classList.remove("is-mobile-hidden");
    terminalSection.classList.remove("is-mobile-hidden");
    return;
  }

  variablesSection.classList.toggle("is-mobile-hidden", mobileSidebarView !== "variables");
  terminalSection.classList.toggle("is-mobile-hidden", mobileSidebarView !== "terminal");
};

const syncMobileSelectionControls = () => {
  const isMobile = shouldUseMobileSelectionUi();
  const isDiagramViewActive = getActiveMainViewId() === "diagram-view";

  if (!isMobile && isMobileMultiSelectMode) {
    isMobileMultiSelectMode = false;
  }

  if (mobileSelectionControls) {
    mobileSelectionControls.hidden = !(isMobile && isDiagramViewActive);
  }

  if (mobileMultiSelectToggleButton) {
    const isActive = isMobile && isMobileMultiSelectMode;
    mobileMultiSelectToggleButton.classList.toggle("is-active", isActive);
    mobileMultiSelectToggleButton.setAttribute("aria-pressed", String(isActive));
    mobileMultiSelectToggleButton.title = isActive
      ? "Tocca per disattivare la selezione multipla"
      : "Tocca per attivare la selezione multipla";
  }

  if (mobileDeleteSelectionButton) {
    const canDelete = isMobile && !isProgramRunning && selectedNodeIds.size > 0;
    mobileDeleteSelectionButton.disabled = !canDelete;
    mobileDeleteSelectionButton.title = canDelete
      ? `Elimina ${selectedNodeIds.size === 1 ? "il blocco selezionato" : "i blocchi selezionati"}`
      : "Seleziona almeno un blocco per eliminare";
  }
};

const syncTouchSelectionOverrideButton = () => {
  if (!touchSelectionOverrideButton) {
    return;
  }

  touchSelectionOverrideButton.classList.toggle("is-active", isTouchSelectionUiForced);
  touchSelectionOverrideButton.setAttribute("aria-pressed", String(isTouchSelectionUiForced));
  touchSelectionOverrideButton.textContent = isTouchSelectionUiForced ? "Touch UI On" : "Touch UI";
  touchSelectionOverrideButton.title = isTouchSelectionUiForced
    ? "Disattiva forzatura controlli touch"
    : "Forza i controlli touch anche su desktop";

  syncTopbarAdaptiveLayout();
};

const loadTouchSelectionOverridePreference = () => {
  try {
    isTouchSelectionUiForced = window.localStorage.getItem(TOUCH_SELECTION_OVERRIDE_KEY) === "true";
  } catch {
    isTouchSelectionUiForced = false;
  }

  syncTouchSelectionOverrideButton();
};

const saveTouchSelectionOverridePreference = () => {
  try {
    window.localStorage.setItem(TOUCH_SELECTION_OVERRIDE_KEY, String(isTouchSelectionUiForced));
  } catch {
    // Ignore storage failures.
  }
};

const scheduleLayoutAwareRender = () => {
  if (pendingLayoutAwareRenderFrame !== null) {
    cancelAnimationFrame(pendingLayoutAwareRenderFrame);
  }

  pendingLayoutAwareRenderFrame = requestAnimationFrame(() => {
    pendingLayoutAwareRenderFrame = requestAnimationFrame(() => {
      pendingLayoutAwareRenderFrame = null;
      renderFlowchart();
    });
  });
};

const loadCodeLanguagePreference = () => {
  try {
    const storedValue = window.localStorage.getItem(CODE_LANGUAGE_PREFERENCE_KEY);
    if (storedValue && ["c", "cpp", "python"].includes(storedValue)) {
      selectedCodeLanguage = storedValue;
    }
  } catch {
    selectedCodeLanguage = "c";
  }
};

const applyCodeZoom = () => {
  const normalizedZoom = Math.min(MAX_CODE_ZOOM, Math.max(MIN_CODE_ZOOM, Number(codeZoom.toFixed(2))));
  codeZoom = normalizedZoom;

  document.documentElement.style.setProperty("--code-zoom", String(codeZoom));
};

const setCodeZoom = (nextZoom) => {
  const normalizedZoom = Math.min(MAX_CODE_ZOOM, Math.max(MIN_CODE_ZOOM, Number(nextZoom.toFixed(2))));

  if (normalizedZoom === codeZoom) {
    applyCodeZoom();
    showZoomIndicator(normalizedZoom);
    return;
  }

  codeZoom = normalizedZoom;
  applyCodeZoom();
  saveCodeZoomPreference();
  showZoomIndicator(codeZoom);
};

const loadCodeZoomPreference = () => {
  try {
    const storedValue = Number(window.localStorage.getItem(CODE_ZOOM_PREFERENCE_KEY));
    codeZoom = Number.isFinite(storedValue) ? storedValue : 1;
  } catch {
    codeZoom = 1;
  }

  applyCodeZoom();
};

const saveCodeZoomPreference = () => {
  try {
    window.localStorage.setItem(CODE_ZOOM_PREFERENCE_KEY, String(codeZoom));
  } catch {
    // Ignore storage failures.
  }
};

const saveCodeLanguagePreference = () => {
  try {
    window.localStorage.setItem(CODE_LANGUAGE_PREFERENCE_KEY, selectedCodeLanguage);
  } catch {
    // Ignore storage failures.
  }
};

const syncThemeToggleButton = () => {
  if (!themeToggleButton) {
    return;
  }

  const isDark = currentTheme === "dark";
  themeToggleButton.textContent = isDark ? "Light" : "Dark";
  themeToggleButton.title = isDark ? "Passa al tema chiaro" : "Passa al tema scuro";
};

const applyTheme = (theme) => {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = currentTheme;
  syncThemeToggleButton();
};

const loadThemePreference = () => {
  try {
    const storedValue = window.localStorage.getItem(THEME_PREFERENCE_KEY);
    applyTheme(storedValue === "dark" ? "dark" : "light");
  } catch {
    applyTheme("light");
  }
};

const saveThemePreference = () => {
  try {
    window.localStorage.setItem(THEME_PREFERENCE_KEY, currentTheme);
  } catch {
    // Ignore storage failures.
  }
};
