window.addEventListener("load", () => {
  scheduleLayoutAwareRender();
});

document.addEventListener("keydown", (event) => {
  if (!propertyDialogBackdrop.hidden) {
    return;
  }

  const target = event.target;
  const isEscapeKey = event.key === "Escape";

  if (isEscapeKey) {
    if (isProgramRunning && insertDialogBackdrop.hidden) {
      event.preventDefault();
      cancelExecution();
      return;
    }

    if (!insertDialogBackdrop.hidden) {
      closeInsertDialog();
      return;
    }

    if (isDiagramFocusMode) {
      event.preventDefault();
      setDiagramFocusMode(false);
    }

    return;
  }

  if (isTypingTarget(target)) {
    return;
  }

  const normalizedKey = typeof event.key === "string" ? event.key.toLowerCase() : "";

  if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && normalizedKey === "z") {
    event.preventDefault();
    undoLastChange();
    return;
  }

  if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && normalizedKey === "y") {
    event.preventDefault();
    redoLastChange();
    return;
  }

  if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && normalizedKey === "c") {
    event.preventDefault();
    copySelectedNodes();
    return;
  }

  if (event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && normalizedKey === "x") {
    event.preventDefault();
    cutSelectedNodes();
    return;
  }

  if (!event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && normalizedKey === "e") {
    event.preventDefault();
    startProgramExecution("run");
    return;
  }

  if (!event.ctrlKey && !event.shiftKey && !event.altKey && !event.metaKey && normalizedKey === "p") {
    event.preventDefault();
    startProgramExecution("step");
    return;
  }

  if (
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    !event.metaKey &&
    normalizedKey === "f" &&
    propertyDialogBackdrop.hidden &&
    insertDialogBackdrop.hidden
  ) {
    event.preventDefault();
    setDiagramFocusMode(!isDiagramFocusMode);
    return;
  }

  if ((event.key === "Delete" || event.key === "Backspace") && propertyDialogBackdrop.hidden && insertDialogBackdrop.hidden) {
    event.preventDefault();
    deleteSelectedNode();
  }
});

loadThemePreference();
loadTouchSelectionOverridePreference();
loadNodeLabelPreference();
loadFlowchartState();
loadHistoryState();
loadCodeLanguagePreference();
syncCodeLanguageTabs();
syncFocusModeButton();
syncMobileSidebarView();
syncMobileTopbarMenu();
syncResponsiveDiagramZoom({ force: true });
setActiveMainView(loadMainViewPreference());
renderFlowchart();
scheduleLayoutAwareRender();
scheduleFontAwareRender();
syncExecutionControls();
syncTopbarAdaptiveLayout();

