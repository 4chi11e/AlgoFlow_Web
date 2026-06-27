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
  syncDiagramExecutionHighlight();
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
      if (consoleOutput.dataset.runtimeEmpty !== "true") {
        consoleOutput.style.removeProperty("--console-line-number-width");
        consoleOutput.innerHTML = '<p class="console-empty">Nessun output</p>';
        consoleOutput.dataset.runtimeEmpty = "true";
        consoleOutput.dataset.entryCount = "0";
      }
    } else {
      const renderedEntryCount = Number(consoleOutput.dataset.entryCount || "0");
      const needsReset =
        consoleOutput.dataset.runtimeEmpty === "true" ||
        renderedEntryCount > runtimeState.outputEntries.length;

      if (needsReset) {
        consoleOutput.replaceChildren();
        consoleOutput.dataset.entryCount = "0";
      }

      const lineNumberDigits = String(runtimeState.outputEntries.length).length;
      const lineNumberTextWidth = (lineNumberDigits * 0.7).toFixed(2);
      consoleOutput.style.setProperty("--console-line-number-width", `calc(${lineNumberTextWidth}ch + 12px)`);
      const startIndex = needsReset ? 0 : renderedEntryCount;
      const fragment = document.createDocumentFragment();
      let outputChanged = needsReset;

      for (let index = startIndex; index < runtimeState.outputEntries.length; index += 1) {
        const entry = runtimeState.outputEntries[index];
        const entryElement = document.createElement("div");
        const lineNumberElement = document.createElement("span");
        const messageElement = document.createElement("p");

        entryElement.className = `console-entry is-${entry.kind}`;
        lineNumberElement.className = "console-line-number";
        lineNumberElement.setAttribute("aria-hidden", "true");
        lineNumberElement.textContent = String(index + 1);
        messageElement.textContent = entry.text;
        entryElement.append(lineNumberElement, messageElement);
        fragment.append(entryElement);
      }

      if (fragment.childNodes.length > 0) {
        outputChanged = true;
        consoleOutput.append(fragment);
      } else {
        const lastEntry = runtimeState.outputEntries[runtimeState.outputEntries.length - 1];
        const lastMessage = consoleOutput.lastElementChild?.querySelector("p");

        if (lastMessage && lastMessage.textContent !== lastEntry.text) {
          lastMessage.textContent = lastEntry.text;
          outputChanged = true;
        }
      }

      consoleOutput.dataset.runtimeEmpty = "false";
      consoleOutput.dataset.entryCount = String(runtimeState.outputEntries.length);

      if (outputChanged) {
        consoleOutput.scrollTop = consoleOutput.scrollHeight;
      }
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
