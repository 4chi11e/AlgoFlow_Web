const collectRuntimeVariableMeta = () => {
  const variables = new Map();

  traverseNodes(flowNodes, (node) => {
    if (node.type !== "declare" || !node.declareConfig?.names?.length) {
      return;
    }

    node.declareConfig.names.forEach((name) => {
      if (variables.has(name)) {
        return;
      }

      variables.set(name, {
        name,
        dataType: node.declareConfig.dataType,
        isArray: Boolean(node.declareConfig.isArray),
        arrayLength: Number.isInteger(node.declareConfig.arrayLength) ? node.declareConfig.arrayLength : null,
        typeLabel: node.declareConfig.isArray
          ? `${node.declareConfig.dataType}[${Number.isInteger(node.declareConfig.arrayLength) ? node.declareConfig.arrayLength : ""}]`
          : node.declareConfig.dataType,
      });
    });
  });

  return variables;
};

const formatRuntimeValue = (value) => {
  if (value === RUNTIME_UNDECLARED) {
    return "undefined";
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => formatRuntimeValue(item)).join(", ")}]`;
  }

  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "boolean") {
    return value ? "true" : "false";
  }

  if (value == null) {
    return "";
  }

  return String(value);
};

const createRuntimeState = (mode) => {
  const variableMeta = collectRuntimeVariableMeta();
  const variableValues = new Map();

  variableMeta.forEach((meta, name) => {
    if (meta.isArray) {
      const length = Number.isInteger(meta.arrayLength) && meta.arrayLength > 0 ? meta.arrayLength : 0;
      variableValues.set(name, Array.from({ length }, () => RUNTIME_UNDECLARED));
      return;
    }

    variableValues.set(name, RUNTIME_UNDECLARED);
  });

  return {
    mode,
    statusLabel: mode === "step" ? "Pronto" : "In corso",
    statusTone: "success",
    statusDetail: mode === "step" ? "Passo pronto" : "Esecuzione in corso",
    variableMeta,
    variableValues,
    outputEntries: [],
    waitingInput: null,
    currentNodeId: null,
    operationCount: 0,
    cancelled: false,
    completed: false,
  };
};

const setRuntimeStatus = (label, { tone = "success", detail = label } = {}) => {
  if (!runtimeState) {
    return;
  }

  runtimeState.statusLabel = label;
  runtimeState.statusTone = tone;
  runtimeState.statusDetail = detail;
};

const addConsoleEntry = (kind, text, options = {}) => {
  if (!runtimeState) {
    return;
  }

  const appendNewline = options.appendNewline !== false;
  const previousEntry = runtimeState.outputEntries[runtimeState.outputEntries.length - 1];

  if (
    kind === "output" &&
    previousEntry?.kind === "output" &&
    previousEntry.appendNewline === false
  ) {
    previousEntry.text += String(text);
    previousEntry.appendNewline = appendNewline;
    return;
  }

  runtimeState.outputEntries.push({
    kind,
    text: String(text),
    appendNewline,
  });
};

const refreshExecutionUi = () => {
  renderVariablesPanel();
  renderConsolePanel();
  syncCodeExecutionHighlight();
  syncExecutionControls();
  scheduleSidebarAutoSync();
};

const renderConsolePanel = () => {
  if (terminalStatus) {
    terminalStatus.textContent = runtimeState?.statusLabel ?? "Pronto";
    terminalStatus.dataset.tone = runtimeState?.statusTone ?? "success";
    terminalStatus.title = runtimeState?.statusDetail ?? "Pronto";
  }

  if (consoleOutput) {
    if (!runtimeState || runtimeState.outputEntries.length === 0) {
      consoleOutput.innerHTML = '<p class="console-empty">Nessun output</p>';
    } else {
      consoleOutput.innerHTML = runtimeState.outputEntries
        .map((entry) => `
          <div class="console-entry is-${escapeHtml(entry.kind)}">
            <p>${escapeHtml(entry.text)}</p>
          </div>
        `)
        .join("");
      consoleOutput.scrollTop = consoleOutput.scrollHeight;
    }
  }

  const waitingInput = runtimeState?.waitingInput ?? null;

  if (consoleInputForm) {
    consoleInputForm.hidden = !waitingInput;
  }

  if (consoleInputLabel) {
    consoleInputLabel.textContent = waitingInput?.label ?? "Input utente";
  }

  if (consoleInputButton) {
    consoleInputButton.disabled = !waitingInput;
  }

  if (consoleInputField) {
    consoleInputField.disabled = !waitingInput;
    consoleInputField.placeholder = waitingInput ? "Scrivi qui..." : "";
  }
};

const syncExecutionControls = () => {
  if (runProgramButton) {
    const isAwaitingInput = Boolean(runtimeState?.waitingInput);
    runProgramButton.disabled = (isProgramRunning && executionMode !== "step") || isAwaitingInput;
  }

  if (stepProgramButton) {
    const isAwaitingStep = executionMode === "step" && typeof pendingStepResolver === "function";
    const isAwaitingInput = Boolean(runtimeState?.waitingInput);
    stepProgramButton.textContent = "Passo";
    stepProgramButton.title = "P";
    stepProgramButton.disabled = executionMode === "run" || (executionMode === "step" && !isAwaitingStep) || isAwaitingInput;
  }

  if (stopProgramButton) {
    stopProgramButton.disabled = !isProgramRunning;
  }

  syncMobileSelectionControls();
};
