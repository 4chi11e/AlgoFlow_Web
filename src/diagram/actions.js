const removeDraftNode = () => {
  const location = findNodeLocationById(editingNodeId);

  if (location?.node?.isDraft) {
    location.container.splice(location.index, 1);
    renderFlowchart();
  }
};

const resetFlowchart = () => {
  cancelExecution();
  if (flowNodes.length > 0) {
    pushUndoSnapshot();
  }
  clearRuntimeSnapshot();
  flowNodes.length = 0;
  nextNodeId = 1;
  pendingInsertTarget = null;
  editingNodeId = null;
  lastConnectorButton = null;
  selectedNodeIds = new Set();
  previewSelectedNodeIds = new Set();
  window.localStorage.removeItem(STORAGE_KEY);
  renderFlowchart();
};

const copySelectedNodes = () => {
  if (isProgramRunning) {
    return;
  }

  const selectionContext = getClipboardSelectionContext();

  if (selectionContext.error) {
    window.alert(selectionContext.error);
    return;
  }

  flowClipboard = {
    nodes: selectionContext.nodes.map(cloneNodeForClipboard),
  };
  syncInsertPasteButton();
};

const cutSelectedNodes = () => {
  if (isProgramRunning) {
    return;
  }

  const selectionContext = getClipboardSelectionContext();

  if (selectionContext.error) {
    window.alert(selectionContext.error);
    return;
  }

  flowClipboard = {
    nodes: selectionContext.nodes.map(cloneNodeForClipboard),
  };
  syncInsertPasteButton();
  pushUndoSnapshot();

  [...selectionContext.locations]
    .sort((left, right) => right.index - left.index)
    .forEach((location) => {
      location.container.splice(location.index, 1);
    });

  clearRuntimeSnapshot();
  selectedNodeIds = new Set();
  saveFlowchartState();
  renderFlowchart();
};

const pasteClipboardNodes = () => {
  if (isProgramRunning || !flowClipboard?.nodes?.length) {
    return;
  }

  const pasteTarget = pendingInsertTarget
    ? {
        path: pendingInsertTarget.path,
        container: getContainerByPath(pendingInsertTarget.path),
        index: pendingInsertTarget.index,
      }
    : getPasteTargetContext();

  if (pasteTarget.error) {
    window.alert(pasteTarget.error);
    return;
  }

  const pastedNodes = flowClipboard.nodes.map(cloneNodeForClipboard);
  const renamedDeclarations = resolveClipboardDeclarationConflicts(pastedNodes);
  assignFreshNodeIds(pastedNodes);
  pushUndoSnapshot();

  pasteTarget.container.splice(pasteTarget.index, 0, ...pastedNodes);
  clearRuntimeSnapshot();
  selectedNodeIds = new Set(pastedNodes.map((node) => node.id));
  saveFlowchartState();
  renderFlowchart();

  if (renamedDeclarations.length > 0) {
    const renameSummary = renamedDeclarations
      .map(({ from, to }) => `${from} -> ${to}`)
      .join(", ");
    window.alert(`Alcune variabili dichiarate erano già presenti nel diagramma e sono state rinominate automaticamente: ${renameSummary}.`);
  }

  if (!insertDialogBackdrop.hidden) {
    closeInsertDialog();
  }
};

const deleteSelectedNode = () => {
  if (isProgramRunning || selectedNodeIds.size === 0) {
    return;
  }

  pushUndoSnapshot();
  const removableIds = new Set(selectedNodeIds);
  Array.from(removableIds).forEach((nodeId) => {
    removeNodeById(nodeId);
  });
  clearRuntimeSnapshot();
  selectedNodeIds = new Set();
  saveFlowchartState();
  renderFlowchart();
};

const finalizeNode = () => {
  const node = findNodeById(editingNodeId);

  if (!node) {
    return;
  }

  if (node.type === "declare") {
    const selectedTypeInput = Array.from(declareTypeInputs).find((input) => input.checked);
    const dataType = selectedTypeInput?.value ?? "Integer";
    const rawNames = declareNameInput.value.trim();
    const isArray = Boolean(declareArrayInput?.checked);
    const rawArrayLength = declareArrayLengthInput?.value.trim() ?? "";
    const validationError = validateDeclareName(rawNames, node.id);

    if (validationError) {
      showPropertyError(validationError);
      declareNameInput.focus();
      declareNameInput.select();
      return;
    }

    let arrayLength = null;

    if (isArray) {
      const parsedArrayLength = Number.parseInt(rawArrayLength, 10);

      if (!Number.isInteger(parsedArrayLength) || parsedArrayLength <= 0) {
        showPropertyError("La lunghezza dell'array deve essere un intero positivo.");
        declareArrayLengthInput?.focus();
        declareArrayLengthInput?.select();
        return;
      }

      arrayLength = parsedArrayLength;
    }

    const names = rawNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    node.declareConfig = {
      names,
      dataType,
      isArray,
      arrayLength,
    };
    node.value = names.join(", ");
  } else if (node.type === "for") {
    const variable = forVariableInput.value.trim();
    const start = forStartInput.value.trim();
    const end = forEndInput.value.trim();
    const step = forStepInput.value.trim();
    const includeEnd = forIncludeEndInput ? forIncludeEndInput.checked : true;

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(variable)) {
      showPropertyError("La variabile del for deve essere un identificatore valido.");
      forVariableInput.focus();
      forVariableInput.select();
      return;
    }

    if (!start || !end || !step) {
      showPropertyError("Compila tutti e quattro i campi del for.");
      const firstEmptyField = [
        [forStartInput, start],
        [forEndInput, end],
        [forStepInput, step],
      ].find(([, value]) => !value)?.[0];
      (firstEmptyField ?? forStartInput).focus();
      return;
    }

    hidePropertyError();
    node.forConfig = { variable, start, end, step, includeEnd };
    node.value = buildForDisplayText({ variable, start, end, step, includeEnd });
  } else if (node.type === "output") {
    hidePropertyError();
    node.value = propertyInput.value;
    node.outputConfig = {
      appendNewline: outputNewlineInput ? outputNewlineInput.checked : true,
    };
  } else {
    hidePropertyError();
    node.value = propertyInput.value.trim();
  }

  pushUndoSnapshot();
  node.isDraft = false;
  clearRuntimeSnapshot();
  saveFlowchartState();
  renderFlowchart();
  closePropertyDialog();
  closeInsertDialog();
};

const insertNode = (type) => {
  if (!pendingInsertTarget) {
    return;
  }

  const definition = getNodeDefinition(type);

  if (!definition) {
    return;
  }

  const newNode = {
    id: nextNodeId++,
    type,
    value: "",
    isDraft: true,
  };

  const structuredBranches = createStructuredBranches(type);

  if (structuredBranches) {
    newNode.branches = structuredBranches;
  }

  if (type === "declare") {
    newNode.declareConfig = {
      names: [],
      dataType: "Integer",
      isArray: false,
      arrayLength: null,
    };
  }

  if (type === "for") {
    newNode.forConfig = {
      variable: "",
      start: "",
      end: "",
      step: "",
      includeEnd: true,
    };
  }

  if (type === "output") {
    newNode.outputConfig = {
      appendNewline: true,
    };
  }

  const targetContainer = getContainerByPath(pendingInsertTarget.path);
  targetContainer.splice(pendingInsertTarget.index, 0, newNode);
  clearRuntimeSnapshot();
  renderFlowchart();
  closeInsertDialog();
  openPropertyDialog(newNode.id);
};
