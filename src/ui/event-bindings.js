insertNodeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nodeType = button.dataset.nodeType;

    if (nodeType === "call") {
      showInsertDialogNotice(NOT_YET_IMPLEMENTED_MESSAGE);
      return;
    }

    if (nodeType) {
      insertNode(nodeType);
    }
  });
});

if (insertDialogClose) {
  insertDialogClose.addEventListener("click", closeInsertDialog);
}

if (insertPasteButton) {
  insertPasteButton.addEventListener("click", () => {
    pasteClipboardNodes();
  });
}

if (insertDialogNoticeClose) {
  insertDialogNoticeClose.addEventListener("click", hideInsertDialogNotice);
}

if (declareArrayInput) {
  declareArrayInput.addEventListener("change", () => {
    if (declareArrayLengthField) {
      declareArrayLengthField.hidden = !declareArrayInput.checked;
    }

    if (!declareArrayInput.checked && declareArrayLengthInput) {
      declareArrayLengthInput.value = "";
    }
  });
}

if (propertyErrorClose) {
  propertyErrorClose.addEventListener("click", hidePropertyError);
}

if (flowchartRoot) {
  flowchartRoot.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;

    if (!target) {
      return;
    }

    const connectorElement = target.closest(".svg-connector");

    if (connectorElement) {
      const serializedTarget = connectorElement.dataset.insertTarget;

      if (!serializedTarget) {
        return;
      }

      const insertTarget = JSON.parse(decodeURIComponent(serializedTarget));
      openInsertDialog(insertTarget, connectorElement);
      return;
    }

    const nodeElement = target.closest(".svg-node");

    if (nodeElement) {
      const nodeId = Number(nodeElement.dataset.nodeId);
      if (nodeClickTimer) {
        window.clearTimeout(nodeClickTimer);
      }

      if (shouldUseMobileSelectionUi() && isMobileMultiSelectMode) {
        if (selectedNodeIds.has(nodeId)) {
          selectedNodeIds.delete(nodeId);
        } else {
          selectedNodeIds.add(nodeId);
        }

        selectedNodeIds = new Set(selectedNodeIds);
        renderFlowchart();
        nodeClickTimer = null;
        return;
      }

      nodeClickTimer = window.setTimeout(() => {
        selectedNodeIds = new Set([nodeId]);
        renderFlowchart();
        nodeClickTimer = null;
      }, 180);
      return;
    }

    if (target.closest(".diagram-svg")) {
      selectedNodeIds = new Set();
      renderFlowchart();
    }
  });

  flowchartRoot.addEventListener("dblclick", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const nodeElement = target?.closest(".svg-node");

    if (!nodeElement) {
      return;
    }

    if (nodeClickTimer) {
      window.clearTimeout(nodeClickTimer);
      nodeClickTimer = null;
    }

    const nodeId = Number(nodeElement.dataset.nodeId);
    selectedNodeIds = new Set([nodeId]);
    renderFlowchart();
    lastConnectorButton = nodeElement;
    openPropertyDialog(nodeId);
  });
}

if (mobileMultiSelectToggleButton) {
  mobileMultiSelectToggleButton.addEventListener("click", () => {
    if (!shouldUseMobileSelectionUi()) {
      return;
    }

    isMobileMultiSelectMode = !isMobileMultiSelectMode;
    syncMobileSelectionControls();
  });
}

if (mobileDeleteSelectionButton) {
  mobileDeleteSelectionButton.addEventListener("click", () => {
    deleteSelectedNode();
  });
}

const updateSelectionBox = (bounds, startX, startY, currentX, currentY) => {
  const left = Math.min(startX, currentX) - bounds.left + diagramCanvas.scrollLeft;
  const top = Math.min(startY, currentY) - bounds.top + diagramCanvas.scrollTop;
  const width = Math.abs(currentX - startX);
  const height = Math.abs(currentY - startY);

  selectionBox.style.left = `${left}px`;
  selectionBox.style.top = `${top}px`;
  selectionBox.style.width = `${width}px`;
  selectionBox.style.height = `${height}px`;
};

const getSelectionRect = (startX, startY, endX, endY) => ({
  left: Math.min(startX, endX),
  top: Math.min(startY, endY),
  right: Math.max(startX, endX),
  bottom: Math.max(startY, endY),
});

const getNodeIdsInRect = (rect) => {
  const nextSelection = new Set();

  flowchartRoot.querySelectorAll(".svg-node").forEach((nodeElement) => {
    const nodeRect = nodeElement.getBoundingClientRect();
    const isContained =
      nodeRect.left >= rect.left &&
      nodeRect.top >= rect.top &&
      nodeRect.right <= rect.right &&
      nodeRect.bottom <= rect.bottom;

    nodeElement.classList.toggle("is-preview-selected", isContained);

    if (isContained) {
      nextSelection.add(Number(nodeElement.dataset.nodeId));
    }
  });

  return nextSelection;
};

const clearPreviewSelection = () => {
  previewSelectedNodeIds = new Set();
  flowchartRoot.querySelectorAll(".svg-node.is-preview-selected").forEach((nodeElement) => {
    nodeElement.classList.remove("is-preview-selected");
  });
};

const selectNodesInBox = (startX, startY, endX, endY) => {
  const rect = getSelectionRect(startX, startY, endX, endY);
  selectedNodeIds = getNodeIdsInRect(rect);
  clearPreviewSelection();
  renderFlowchart();
};

const previewNodesInBox = (startX, startY, endX, endY) => {
  const rect = getSelectionRect(startX, startY, endX, endY);
  previewSelectedNodeIds = getNodeIdsInRect(rect);
};

const getTouchDistance = (firstTouch, secondTouch) =>
  Math.hypot(secondTouch.clientX - firstTouch.clientX, secondTouch.clientY - firstTouch.clientY);

const getTouchCenter = (firstTouch, secondTouch) => ({
  x: (firstTouch.clientX + secondTouch.clientX) / 2,
  y: (firstTouch.clientY + secondTouch.clientY) / 2,
});

if (diagramCanvas && selectionBox) {
  diagramCanvas.addEventListener("contextmenu", (event) => {
    event.preventDefault();
  });

  diagramCanvas.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const direction = event.deltaY > 0 ? -1 : 1;
    setDiagramZoom(diagramZoom + direction * DIAGRAM_ZOOM_STEP);
  }, { passive: false });

  diagramCanvas.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch") {
      return;
    }

    const target = event.target;
    const clickedInteractive =
      target instanceof Element &&
      (target.closest(".svg-node") ||
        target.closest(".svg-connector") ||
        target.closest(".insert-dialog-backdrop") ||
        target.closest(".property-dialog-backdrop"));

    if (clickedInteractive) {
      return;
    }

    if (event.button === 2) {
      event.preventDefault();
      panDrag = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startScrollLeft: diagramCanvas.scrollLeft,
        startScrollTop: diagramCanvas.scrollTop,
      };
      diagramCanvas.classList.add("is-panning");
      diagramCanvas.setPointerCapture(event.pointerId);
      return;
    }

    if (event.button !== 0) {
      return;
    }

    const bounds = diagramCanvas.getBoundingClientRect();
    selectionDrag = {
      startX: event.clientX,
      startY: event.clientY,
      bounds,
      pointerId: event.pointerId,
    };

    document.body.classList.add("is-drag-selecting");
    selectionBox.hidden = false;
    updateSelectionBox(bounds, event.clientX, event.clientY, event.clientX, event.clientY);
    diagramCanvas.setPointerCapture(event.pointerId);
  });

  diagramCanvas.addEventListener("pointermove", (event) => {
    if (panDrag && event.pointerId === panDrag.pointerId) {
      const deltaX = event.clientX - panDrag.startX;
      const deltaY = event.clientY - panDrag.startY;

      diagramCanvas.scrollLeft = panDrag.startScrollLeft - deltaX;
      diagramCanvas.scrollTop = panDrag.startScrollTop - deltaY;
      return;
    }

    if (!selectionDrag || event.pointerId !== selectionDrag.pointerId) {
      return;
    }

    updateSelectionBox(
      selectionDrag.bounds,
      selectionDrag.startX,
      selectionDrag.startY,
      event.clientX,
      event.clientY
    );

    previewNodesInBox(
      selectionDrag.startX,
      selectionDrag.startY,
      event.clientX,
      event.clientY
    );
  });

  const finishSelectionDrag = (event) => {
    if (panDrag && event.pointerId === panDrag.pointerId) {
      diagramCanvas.classList.remove("is-panning");
      diagramCanvas.releasePointerCapture(panDrag.pointerId);
      panDrag = null;
      return;
    }

    if (!selectionDrag || event.pointerId !== selectionDrag.pointerId) {
      return;
    }

    const dragWidth = Math.abs(event.clientX - selectionDrag.startX);
    const dragHeight = Math.abs(event.clientY - selectionDrag.startY);

    selectionBox.hidden = true;
    selectionBox.style.width = "0px";
    selectionBox.style.height = "0px";

    if (dragWidth > 4 || dragHeight > 4) {
      selectNodesInBox(
        selectionDrag.startX,
        selectionDrag.startY,
        event.clientX,
        event.clientY
      );
    } else {
      clearPreviewSelection();
      selectedNodeIds = new Set();
      renderFlowchart();
    }

    document.body.classList.remove("is-drag-selecting");
    diagramCanvas.releasePointerCapture(selectionDrag.pointerId);
    selectionDrag = null;
  };

  diagramCanvas.addEventListener("pointerup", finishSelectionDrag);
  diagramCanvas.addEventListener("pointercancel", finishSelectionDrag);

  diagramCanvas.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 2) {
      return;
    }

    const touchCenter = getTouchCenter(event.touches[0], event.touches[1]);

    touchPinchState = {
      lastDistance: getTouchDistance(event.touches[0], event.touches[1]),
      lastZoom: diagramZoom,
      lastCenterX: touchCenter.x,
      lastCenterY: touchCenter.y,
    };
  }, { passive: true });

  diagramCanvas.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2 || !touchPinchState) {
      return;
    }

    event.preventDefault();
    const nextDistance = getTouchDistance(event.touches[0], event.touches[1]);
    const nextCenter = getTouchCenter(event.touches[0], event.touches[1]);

    if (touchPinchState.lastDistance <= 0 || nextDistance <= 0) {
      return;
    }

    const scaleRatio = nextDistance / touchPinchState.lastDistance;
    const nextZoom = touchPinchState.lastZoom * scaleRatio;
    const deltaX = nextCenter.x - touchPinchState.lastCenterX;
    const deltaY = nextCenter.y - touchPinchState.lastCenterY;

    setDiagramZoom(nextZoom);
    diagramCanvas.scrollLeft -= deltaX;
    diagramCanvas.scrollTop -= deltaY;

    touchPinchState = {
      lastDistance: nextDistance,
      lastZoom: diagramZoom,
      lastCenterX: nextCenter.x,
      lastCenterY: nextCenter.y,
    };
  }, { passive: false });

  const resetTouchPinch = () => {
    touchPinchState = null;
  };

  diagramCanvas.addEventListener("touchend", resetTouchPinch, { passive: true });
  diagramCanvas.addEventListener("touchcancel", resetTouchPinch, { passive: true });
}

if (propertyDialogClose) {
  propertyDialogClose.addEventListener("click", () => {
    removeDraftNode();
    closePropertyDialog();
    closeInsertDialog();
  });
}

if (propertyDialogCancel) {
  propertyDialogCancel.addEventListener("click", () => {
    removeDraftNode();
    closePropertyDialog();
    closeInsertDialog();
  });
}

if (propertyForm) {
  propertyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    finalizeNode();
  });
}

if (propertyInput) {
  propertyInput.addEventListener("keydown", (event) => {
    if (!isEditingAssignNode() || assignSuggestions.hidden) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeAssignSuggestionIndex = (activeAssignSuggestionIndex + 1) % currentAssignSuggestions.length;
      syncActiveAssignSuggestion();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeAssignSuggestionIndex =
        (activeAssignSuggestionIndex - 1 + currentAssignSuggestions.length) % currentAssignSuggestions.length;
      syncActiveAssignSuggestion();
      return;
    }

    if (event.key === "Tab" && currentAssignSuggestions.length > 0 && activeAssignSuggestionIndex >= 0) {
      event.preventDefault();
      applyAssignSuggestion(currentAssignSuggestions[activeAssignSuggestionIndex]);
    }
  });

  propertyInput.addEventListener("input", () => {
    syncPropertyInputSize();

    if (propertyDialogBackdrop.hidden || !isEditingAssignNode()) {
      hideAssignSuggestions();
      return;
    }

    renderAssignSuggestions(propertyInput.value);
  });

  propertyInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      hideAssignSuggestions();
    }, 120);
  });
}

if (outputQuotedText) {
  outputQuotedText.addEventListener("input", () => {
    if (propertyDialogBackdrop.hidden || !isEditingOutputNode()) {
      return;
    }

    propertyInput.value = getOutputQuotedEditorValue();
  });

  outputQuotedText.addEventListener("paste", (event) => {
    if (!isEditingOutputNode()) {
      return;
    }

    event.preventDefault();
    const text = event.clipboardData?.getData("text/plain") ?? "";

    if (document.queryCommandSupported("insertText")) {
      document.execCommand("insertText", false, text);
      return;
    }

    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      outputQuotedText.textContent += text;
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  });
}

if (forVariableInput) {
  forVariableInput.addEventListener("keydown", (event) => {
    if (!isEditingForNode() || assignSuggestions.hidden) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      activeAssignSuggestionIndex = (activeAssignSuggestionIndex + 1) % currentAssignSuggestions.length;
      syncActiveAssignSuggestion();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      activeAssignSuggestionIndex =
        (activeAssignSuggestionIndex - 1 + currentAssignSuggestions.length) % currentAssignSuggestions.length;
      syncActiveAssignSuggestion();
      return;
    }

    if (event.key === "Tab" && currentAssignSuggestions.length > 0 && activeAssignSuggestionIndex >= 0) {
      event.preventDefault();
      applyAssignSuggestion(currentAssignSuggestions[activeAssignSuggestionIndex]);
    }
  });

  forVariableInput.addEventListener("input", () => {
    if (propertyDialogBackdrop.hidden || !isEditingForNode()) {
      hideAssignSuggestions();
      return;
    }

    renderAssignSuggestions(forVariableInput.value);
  });

  forVariableInput.addEventListener("blur", () => {
    window.setTimeout(() => {
      hideAssignSuggestions();
    }, 120);
  });
}

if (propertyDialogBackdrop) {
  propertyDialogBackdrop.addEventListener("keydown", (event) => {
    if (propertyDialogBackdrop.hidden) {
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      removeDraftNode();
      closePropertyDialog();
      closeInsertDialog();
      return;
    }

    if (event.key === "Enter") {
      const isLongTextField =
        event.target === propertyInput &&
        propertyInput?.dataset.autosize === "true" &&
        !event.ctrlKey &&
        !event.metaKey;

      if (isLongTextField) {
        return;
      }

      event.preventDefault();
      finalizeNode();
    }
  });
}

if (newDiagramButton) {
  newDiagramButton.addEventListener("click", () => {
    if (!confirmDiscardCurrentDiagram()) {
      return;
    }

    if (!propertyDialogBackdrop.hidden) {
      closePropertyDialog({ restoreFocus: false });
    }

    if (!insertDialogBackdrop.hidden) {
      closeInsertDialog();
    }

    document.body.classList.remove("is-drag-selecting");
    resetFlowchart();
  });
}

if (loadDiagramButton && loadDiagramInput) {
  loadDiagramButton.addEventListener("click", async () => {
    if (!confirmDiscardCurrentDiagram()) {
      return;
    }

    if (typeof window.showOpenFilePicker === "function") {
      try {
        const pickerOptions = await buildAlgoFlowImportPickerOptions();
        const [fileHandle] = await window.showOpenFilePicker({
          ...pickerOptions,
          multiple: false,
          excludeAcceptAllOption: true,
        });
        const selectedFile = await fileHandle.getFile();
        const rawText = await readImportedFlowchartDocument(selectedFile);
        await saveLastAlgoFlowPickerHandle(fileHandle).catch(() => {});
        importFlowchartFromJsonText(rawText);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        const message = error instanceof Error ? error.message : "Impossibile importare il file selezionato.";
        window.alert(message);
        return;
      }
    }

    loadDiagramInput.value = "";
    loadDiagramInput.click();
  });
}

if (loadDiagramInput) {
  loadDiagramInput.addEventListener("change", async () => {
    const [selectedFile] = Array.from(loadDiagramInput.files ?? []);

    if (!selectedFile) {
      return;
    }

    try {
      const rawText = await readImportedFlowchartDocument(selectedFile);
      importFlowchartFromJsonText(rawText);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Impossibile importare il file selezionato.";
      window.alert(message);
    } finally {
      loadDiagramInput.value = "";
    }
  });
}

if (saveDiagramButton) {
  saveDiagramButton.addEventListener("click", async () => {
    try {
      await exportFlowchartWithPicker();
    } catch (error) {
      if (error && typeof error === "object" && error.algoFlowAlreadyNotified) {
        return;
      }

      const message = error instanceof Error ? error.message : "Impossibile completare il salvataggio.";
      window.alert(message);
    }
  });
}

if (undoButton) {
  undoButton.addEventListener("click", () => {
    undoLastChange();
  });
}

if (redoButton) {
  redoButton.addEventListener("click", () => {
    redoLastChange();
  });
}

if (focusModeButton) {
  focusModeButton.addEventListener("click", () => {
    setDiagramFocusMode(!isDiagramFocusMode);
  });
}

if (codePreview) {
  codePreview.addEventListener("wheel", (event) => {
    if (!event.ctrlKey) {
      return;
    }

    event.preventDefault();

    const direction = event.deltaY > 0 ? -1 : 1;
    setCodeZoom(codeZoom + direction * CODE_ZOOM_STEP);
  }, { passive: false });

  codePreview.addEventListener("touchstart", (event) => {
    if (event.touches.length !== 2) {
      return;
    }

    const touchCenter = getTouchCenter(event.touches[0], event.touches[1]);

    codeTouchPinchState = {
      lastDistance: getTouchDistance(event.touches[0], event.touches[1]),
      lastZoom: codeZoom,
      lastCenterX: touchCenter.x,
      lastCenterY: touchCenter.y,
    };
  }, { passive: true });

  codePreview.addEventListener("touchmove", (event) => {
    if (event.touches.length !== 2 || !codeTouchPinchState) {
      return;
    }

    event.preventDefault();

    const nextDistance = getTouchDistance(event.touches[0], event.touches[1]);
    const nextCenter = getTouchCenter(event.touches[0], event.touches[1]);

    if (codeTouchPinchState.lastDistance <= 0 || nextDistance <= 0) {
      return;
    }

    const scaleRatio = nextDistance / codeTouchPinchState.lastDistance;
    const nextZoom = codeTouchPinchState.lastZoom * scaleRatio;
    const deltaX = nextCenter.x - codeTouchPinchState.lastCenterX;
    const deltaY = nextCenter.y - codeTouchPinchState.lastCenterY;

    setCodeZoom(nextZoom);
    codePreview.scrollLeft -= deltaX;
    codePreview.scrollTop -= deltaY;

    codeTouchPinchState = {
      lastDistance: nextDistance,
      lastZoom: codeZoom,
      lastCenterX: nextCenter.x,
      lastCenterY: nextCenter.y,
    };
  }, { passive: false });

  const resetCodeTouchPinch = () => {
    codeTouchPinchState = null;
  };

  codePreview.addEventListener("touchend", resetCodeTouchPinch, { passive: true });
  codePreview.addEventListener("touchcancel", resetCodeTouchPinch, { passive: true });
}

if (runProgramButton) {
  runProgramButton.addEventListener("click", () => {
    startProgramExecution("run");
  });
}

if (stepProgramButton) {
  stepProgramButton.addEventListener("click", () => {
    startProgramExecution("step");
  });
}

if (stopProgramButton) {
  stopProgramButton.addEventListener("click", () => {
    cancelExecution();
  });
}

if (executionSpeedSelect) {
  executionSpeedSelect.addEventListener("change", () => {
    applyExecutionSpeedPreference(executionSpeedSelect.value);
    saveExecutionSpeedPreference();
  });
}

if (consoleInputForm) {
  consoleInputForm.addEventListener("submit", (event) => {
    event.preventDefault();
    submitRuntimeInput();
  });
}

if (showNodeTypeToggle) {
  showNodeTypeToggle.addEventListener("change", () => {
    showNodeTypeInLabel = showNodeTypeToggle.checked;
    saveNodeLabelPreference();
    renderFlowchart();
  });
}

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
    saveThemePreference();
  });
}

if (mobileTopbarMenuToggleButton) {
  mobileTopbarMenuToggleButton.addEventListener("click", () => {
    if (!isMobileTopbarMenuLayout()) {
      return;
    }

    isMobileTopbarMenuOpen = !isMobileTopbarMenuOpen;
    syncMobileTopbarMenu();
  });
}

if (touchSelectionOverrideButton) {
  touchSelectionOverrideButton.addEventListener("click", () => {
    isTouchSelectionUiForced = !isTouchSelectionUiForced;
    syncTouchSelectionOverrideButton();
    saveTouchSelectionOverridePreference();
    syncMobileSelectionControls();
  });
}

window.addEventListener("resize", () => {
  syncResponsiveDiagramZoom();
  syncMobileSidebarView();
  syncMobileTopbarMenu();
  syncMobileSelectionControls();
  syncTopbarAdaptiveLayout();
  scheduleLayoutAwareRender();
});
