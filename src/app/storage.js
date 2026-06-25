const saveFlowchartState = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedFlowNodes()));
  } catch {
    // Ignore storage failures.
  }

  saveHistoryState();
};

const undoLastChange = () => {
  if (isProgramRunning || undoHistory.length === 0) {
    return;
  }

  const currentSnapshot = getPersistedFlowNodesSnapshot();
  const snapshot = undoHistory.pop();

  if (!snapshot) {
    syncUndoButton();
    return;
  }

  try {
    const parsedNodes = JSON.parse(snapshot);
    redoHistory.push(currentSnapshot);
    closePropertyDialog({ restoreFocus: false });
    closeInsertDialog();
    applyPersistedFlowNodes(parsedNodes, { resetHistory: false });
    saveFlowchartState();
    renderFlowchart();
  } catch {
    window.alert("Impossibile annullare l'ultima modifica.");
  } finally {
    saveHistoryState();
    syncUndoButton();
  }
};

const redoLastChange = () => {
  if (isProgramRunning || redoHistory.length === 0) {
    return;
  }

  const currentSnapshot = getPersistedFlowNodesSnapshot();
  const snapshot = redoHistory.pop();

  if (!snapshot) {
    syncUndoButton();
    return;
  }

  try {
    const parsedNodes = JSON.parse(snapshot);
    undoHistory.push(currentSnapshot);
    closePropertyDialog({ restoreFocus: false });
    closeInsertDialog();
    applyPersistedFlowNodes(parsedNodes, { resetHistory: false });
    saveFlowchartState();
    renderFlowchart();
  } catch {
    window.alert("Impossibile ripristinare la modifica annullata.");
  } finally {
    saveHistoryState();
    syncUndoButton();
  }
};

const loadFlowchartState = () => {
  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return;
    }

    const parsedNodes = JSON.parse(rawState);

    if (!Array.isArray(parsedNodes)) {
      return;
    }

    applyPersistedFlowNodes(parsedNodes);
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};
