const isCompactLayout = () => window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT;
const isMobileTopbarMenuLayout = () => window.innerWidth <= MOBILE_TOPBAR_MENU_BREAKPOINT;
const hasFinePointerSupport = () =>
  Boolean(window.matchMedia && window.matchMedia("(any-pointer: fine)").matches);

const isPrimaryPointerCoarse = () =>
  Boolean(window.matchMedia && window.matchMedia("(pointer: coarse)").matches);

const isTouchPrimaryLayout = () => {
  if (isPrimaryPointerCoarse()) {
    return true;
  }

  if (window.matchMedia && window.matchMedia("(any-pointer: coarse)").matches && !hasFinePointerSupport()) {
    return true;
  }

  return Number(navigator.maxTouchPoints || 0) > 0 && !hasFinePointerSupport();
};

const shouldUseMobileSelectionUi = () => {
  if (isTouchSelectionUiForced) {
    return true;
  }

  // Show controls on touch-first devices even at high resolution,
  // but avoid enabling them on desktop layouts that primarily use fine pointers.
  if (isPrimaryPointerCoarse()) {
    return true;
  }

  return isCompactLayout() && isTouchPrimaryLayout();
};

const getVisibleTopbarItems = (container) => {
  if (!(container instanceof HTMLElement)) {
    return [];
  }

  return Array.from(container.children).filter((child) => {
    if (!(child instanceof HTMLElement)) {
      return false;
    }

    if (child.hidden) {
      return false;
    }

    const style = window.getComputedStyle(child);
    return style.display !== "none" && style.visibility !== "hidden";
  });
};

const hasWrappedTopbarItems = (container) => {
  const items = getVisibleTopbarItems(container);

  if (items.length < 2) {
    return false;
  }

  const firstTop = items[0].offsetTop;
  return items.some((item) => Math.abs(item.offsetTop - firstTop) > 2);
};

const areTopbarGroupsOverlapping = (startGroup, endGroup) => {
  if (!(startGroup instanceof HTMLElement) || !(endGroup instanceof HTMLElement)) {
    return false;
  }

  const startRect = startGroup.getBoundingClientRect();
  const endRect = endGroup.getBoundingClientRect();
  const horizontalOverlap = startRect.right > endRect.left + 2;
  const verticalOverlap = startRect.bottom > endRect.top + 2 && endRect.bottom > startRect.top + 2;

  return horizontalOverlap && verticalOverlap;
};

const syncTopbarAdaptiveLayout = () => {
  if (!appShell) {
    return;
  }

  appShell.classList.remove("is-topbar-start-overflow");

  if (isMobileTopbarMenuLayout()) {
    return;
  }

  const startWrapped = hasWrappedTopbarItems(topbarStartControls);
  const endWrapped = hasWrappedTopbarItems(topbarEndControls);
  const overlappingGroups = areTopbarGroupsOverlapping(topbarStartControls, topbarEndControls);

  if (startWrapped || endWrapped || overlappingGroups) {
    appShell.classList.add("is-topbar-start-overflow");
  }
};

const closeMobileTopbarMenu = () => {
  if (!isMobileTopbarMenuOpen) {
    return;
  }

  isMobileTopbarMenuOpen = false;
  syncMobileTopbarMenu();
};

const syncMobileTopbarMenu = () => {
  const isCompact = isMobileTopbarMenuLayout();

  if (!isCompact && isMobileTopbarMenuOpen) {
    isMobileTopbarMenuOpen = false;
  }

  if (appShell) {
    appShell.classList.toggle("is-mobile-topbar-menu-open", isCompact && isMobileTopbarMenuOpen);
  }

  if (mobileTopbarMenuToggleButton) {
    mobileTopbarMenuToggleButton.hidden = !isCompact;
    mobileTopbarMenuToggleButton.setAttribute("aria-expanded", String(isCompact && isMobileTopbarMenuOpen));
    mobileTopbarMenuToggleButton.title = isMobileTopbarMenuOpen ? "Chiudi menu azioni" : "Apri menu azioni";
  }

  syncTopbarAdaptiveLayout();
};

const applyDiagramZoom = () => {
  if (!flowchartRoot) {
    return;
  }

  const diagramSvg = flowchartRoot.querySelector(".diagram-svg");
  const baseWidth = Number(flowchartRoot.dataset.baseWidth || "0");

  if (!(diagramSvg instanceof SVGElement)) {
    return;
  }

  if (baseWidth > 0) {
    const scaledWidth = Math.round(baseWidth * diagramZoom);
    diagramSvg.style.width = `${scaledWidth}px`;
    flowchartRoot.style.minWidth = `${scaledWidth}px`;
    return;
  }

  diagramSvg.style.width = `${diagramZoom * 100}%`;
};

const setDiagramZoom = (nextZoom) => {
  const normalizedZoom = Math.min(
    MAX_DIAGRAM_ZOOM,
    Math.max(MIN_DIAGRAM_ZOOM, Number(nextZoom.toFixed(2)))
  );

  if (normalizedZoom === diagramZoom) {
    showZoomIndicator(normalizedZoom);
    return;
  }

  diagramZoom = normalizedZoom;
  applyDiagramZoom();
  showZoomIndicator(diagramZoom);
};

const getCurrentDiagramZoomPreset = () => {
  if (window.innerWidth <= 630) {
    return "phone";
  }

  if (window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT) {
    return "compact";
  }

  return "desktop";
};

const syncResponsiveDiagramZoom = (options = {}) => {
  const { force = false } = options;
  const nextPreset = getCurrentDiagramZoomPreset();

  if (!force && currentDiagramZoomPreset === nextPreset) {
    return;
  }

  currentDiagramZoomPreset = nextPreset;
  diagramZoom = DIAGRAM_ZOOM_PRESETS[nextPreset] ?? 1;
  applyDiagramZoom();
};

const hideInsertDialogNotice = () => {
  if (!insertDialogNotice) {
    return;
  }

  insertDialogNotice.hidden = true;

  if (insertDialogNoticeText) {
    insertDialogNoticeText.textContent = "";
  }
};

const showInsertDialogNotice = (message) => {
  if (!insertDialogNotice) {
    return;
  }

  insertDialogNotice.hidden = false;

  if (insertDialogNoticeText) {
    insertDialogNoticeText.textContent = message;
  }
};

const syncPropertyInputSize = () => {
  if (!propertyInput) {
    return;
  }

  if (propertyInput.dataset.autosize !== "true") {
    propertyInput.style.height = "";
    propertyInput.style.overflowY = "";
    return;
  }

  propertyInput.style.height = "auto";
  const computedStyle = window.getComputedStyle(propertyInput);
  const maxHeight = Number.parseFloat(computedStyle.maxHeight);
  const targetHeight = Number.isFinite(maxHeight)
    ? Math.min(propertyInput.scrollHeight, maxHeight)
    : propertyInput.scrollHeight;

  propertyInput.style.height = `${targetHeight}px`;
  propertyInput.style.overflowY = propertyInput.scrollHeight > targetHeight ? "auto" : "hidden";
};

const syncOutputQuotedPreview = () => {
  if (!outputQuotedText || !propertyInput) {
    return;
  }

  const outputValue = String(propertyInput.value ?? "");
  outputQuotedText.textContent = outputValue || "\u200B";
};

const getOutputQuotedEditorValue = () => {
  if (!outputQuotedText) {
    return "";
  }

  const normalizedValue = String(outputQuotedText.innerText ?? "")
    .replace(/\r/g, "")
    .replace(/\u00A0/g, " ")
    .replace(/\u200B/g, "");

  return normalizedValue === "\n" ? "" : normalizedValue;
};

const focusOutputQuotedEditorAtEnd = () => {
  if (!outputQuotedText) {
    return;
  }

  outputQuotedText.focus();

  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(outputQuotedText);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};
