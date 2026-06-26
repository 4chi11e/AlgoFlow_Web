const runWithTemporaryTheme = async (temporaryTheme, task) => {
  const previousTheme = currentTheme;

  if (previousTheme !== temporaryTheme) {
    applyTheme(temporaryTheme);
    renderFlowchart();
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise((resolve) => requestAnimationFrame(() => resolve()));
  }

  try {
    return await task();
  } finally {
    if (previousTheme !== temporaryTheme) {
      applyTheme(previousTheme);
      renderFlowchart();
    }
  }
};

const getNodeLabelPrefix = (node) => {
  const definition = getNodeDefinition(node.type);
  return showNodeTypeInLabel && definition ? `${definition.label}: ` : "";
};

const getNodeLabelPrefixMarkup = (node) => {
  const prefix = getNodeLabelPrefix(node);
  return prefix ? escapeHtml(prefix.slice(0, -1)) : "";
};

const getNodeBodyText = (node) => {
  if (node.type === "declare" && node.declareConfig) {
    const typeLabel = node.declareConfig.isArray
      ? `${node.declareConfig.dataType}[${Number.isInteger(node.declareConfig.arrayLength) ? node.declareConfig.arrayLength : ""}]`
      : node.declareConfig.dataType;
    return `${typeLabel} ${node.declareConfig.names.join(", ")}`.trim();
  }

  if (node.type === "for" && node.forConfig) {
    const { variable, start, end, step, includeEnd } = node.forConfig;
    return buildForDisplayText({ variable, start, end, step, includeEnd });
  }

  if (node.type === "output" && typeof node.value === "string") {
    return node.value;
  }

  if (typeof node.value === "string" && node.value.trim()) {
    return node.value.trim();
  }

  return "";
};

mainTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetId = tab.dataset.mainTarget;
    setActiveMainView(targetId);
    saveMainViewPreference(targetId);
  });
});

const syncCodeLanguageTabs = () => {
  if (languageSelect) {
    languageSelect.value = selectedCodeLanguage;
  }
};

languageSelect?.addEventListener("change", () => {
  const nextLanguage = languageSelect.value;

  if (!nextLanguage || nextLanguage === selectedCodeLanguage) {
    return;
  }

  selectedCodeLanguage = nextLanguage;
  saveCodeLanguagePreference();
  syncCodeLanguageTabs();
  renderCodePreview();
});

mobileSidebarTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.sidebarTarget;

    if (!target || target === mobileSidebarView) {
      return;
    }

    mobileSidebarView = target === "variables" ? "variables" : "terminal";
    syncMobileSidebarView();
  });
});
