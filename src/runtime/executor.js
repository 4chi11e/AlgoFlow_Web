const runtimeCompiledExpressionCache = new Map();
const runtimeAssignmentCache = new WeakMap();

const getRuntimeScope = (referencedVariables = null) => {
  if (!runtimeState) {
    return {};
  }

  const variableEntries = referencedVariables
    ? Array.from(referencedVariables, (name) => [name, runtimeState.variableValues.get(name)])
    : Array.from(runtimeState.variableValues.entries());
  const scope = Object.fromEntries(
    variableEntries.map(([name, value]) => [
      name,
      value === RUNTIME_UNDECLARED
        ? undefined
        : Array.isArray(value)
          ? new Proxy(value, {
              get(target, property, receiver) {
                const resolvedValue = Reflect.get(target, property, receiver);

                if (typeof property === "string" && /^\d+$/.test(property) && resolvedValue === RUNTIME_UNDECLARED) {
                  throw new Error(`L'elemento ${name}[${property}] è stato dichiarato ma non ha ancora un valore.`);
                }

                return resolvedValue;
              },
            })
          : value,
    ])
  );

  scope.random = getRandomInteger;
  return scope;
};

const evaluateRuntimeExpression = (expression) => {
  const normalizedExpression = normalizeExpressionSyntax(expression ?? "").trim();

  if (!normalizedExpression) {
    throw new Error("Espressione vuota.");
  }

  const identifierPattern = /[A-Za-z_][A-Za-z0-9_]*/g;
  const runtimeKeywords = new Set(["true", "false", "random"]);
  const referencedVariables = new Set();
  let match = null;

  const expressionForIdentifierScan = maskExpressionStringLiterals(normalizedExpression);

  while ((match = identifierPattern.exec(expressionForIdentifierScan)) !== null) {
    const [identifier] = match;

    if (runtimeKeywords.has(identifier)) {
      continue;
    }

    if (!runtimeState?.variableMeta.has(identifier)) {
      throw new Error(`Riferimento a variabile non dichiarata: "${identifier}".`);
    }

    referencedVariables.add(identifier);
  }

  referencedVariables.forEach((variableName) => {
    if (runtimeState?.variableValues.get(variableName) === RUNTIME_UNDECLARED) {
      throw new Error(`La variabile "${variableName}" è stata dichiarata ma non ha ancora un valore.`);
    }
  });

  try {
    let evaluateExpression = runtimeCompiledExpressionCache.get(normalizedExpression);

    if (!evaluateExpression) {
      evaluateExpression = Function("scope", `with (scope) { return (${normalizedExpression}); }`);
      runtimeCompiledExpressionCache.set(normalizedExpression, evaluateExpression);
    }

    return evaluateExpression(getRuntimeScope(referencedVariables));
  } catch (error) {
    if (error instanceof Error && !["ReferenceError", "SyntaxError"].includes(error.name)) {
      throw error;
    }

    throw new Error(`Espressione non valida o non supportata: ${expression}`);
  }
};

const ensureRuntimeVariableExists = (name) => {
  if (!runtimeState?.variableMeta.has(name)) {
    throw new Error(`Operazione su variabile non dichiarata: "${name}".`);
  }
};

const castRuntimeValue = (value, meta, { fromInput = false } = {}) => {
  if (meta.isArray) {
    if (Array.isArray(value)) {
      return value;
    }

    throw new Error(`Assegnazione non valida: "${meta.name}" accetta solo valori array.`);
  }

  switch (meta.dataType) {
    case "Integer": {
      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        throw new Error(`Valore non valido per "${meta.name}": serve un numero intero.`);
      }

      return Math.trunc(numericValue);
    }
    case "Real": {
      const numericValue = Number(value);

      if (!Number.isFinite(numericValue)) {
        throw new Error(`Valore non valido per "${meta.name}": serve un numero.`);
      }

      return numericValue;
    }
    case "Boolean": {
      if (typeof value === "boolean") {
        return value;
      }

      if (fromInput && typeof value === "string") {
        const normalizedValue = value.trim().toLowerCase();

        if (["true", "1", "vero", "yes"].includes(normalizedValue)) {
          return true;
        }

        if (["false", "0", "falso", "no"].includes(normalizedValue)) {
          return false;
        }

        throw new Error(`Valore non valido per "${meta.name}": serve un booleano.`);
      }

      return Boolean(value);
    }
    case "String":
      return value == null ? "" : String(value);
    default:
      return value;
  }
};

const setRuntimeVariableValue = (name, value, options) => {
  ensureRuntimeVariableExists(name);
  const meta = runtimeState.variableMeta.get(name);
  runtimeState.variableValues.set(name, castRuntimeValue(value, meta, options));
};

const getRuntimeVariableValueForRead = (name) => {
  ensureRuntimeVariableExists(name);
  const value = runtimeState.variableValues.get(name);

  if (value === RUNTIME_UNDECLARED) {
    throw new Error(`La variabile "${name}" è stata dichiarata ma non ha ancora un valore.`);
  }

  return value;
};

const evaluateRuntimeIndexedTarget = (variableName, indexExpression) => {
  const meta = runtimeState?.variableMeta.get(variableName);

  if (!meta) {
    throw new Error(`Operazione su variabile non dichiarata: "${variableName}".`);
  }

  if (!indexExpression) {
    throw new Error(`Indice mancante per la variabile "${variableName}".`);
  }

  const indexValue = evaluateRuntimeExpression(indexExpression);
  const numericIndex = Number(indexValue);

  if (!Number.isInteger(numericIndex)) {
    throw new Error(`Indice non valido per "${variableName}": serve un numero intero.`);
  }

  const currentValue = getRuntimeVariableValueForRead(variableName);

  const isStringCharacterAccess = !meta.isArray && meta.dataType === "String";

  if (!meta.isArray && !isStringCharacterAccess) {
    throw new Error(`L'accesso con [] è consentito solo sugli array e sulle variabili String: "${variableName}".`);
  }

  if (numericIndex < 0 || numericIndex >= currentValue.length) {
    throw new Error(`Indice fuori intervallo per "${variableName}": ${numericIndex}.`);
  }

  return {
    meta,
    index: numericIndex,
    currentValue,
    isStringCharacterAccess,
  };
};

const getRuntimeIndexedValueForRead = (variableName, indexExpression) => {
  const targetInfo = evaluateRuntimeIndexedTarget(variableName, indexExpression);
  const indexedValue = targetInfo.currentValue[targetInfo.index];

  if (indexedValue === RUNTIME_UNDECLARED) {
    throw new Error(`L'elemento ${variableName}[${targetInfo.index}] è stato dichiarato ma non ha ancora un valore.`);
  }

  return {
    ...targetInfo,
    value: indexedValue,
  };
};

const getRuntimeReferenceValueForRead = (reference) => {
  if (!reference?.indexExpression) {
    return getRuntimeVariableValueForRead(reference.variableName);
  }

  return getRuntimeIndexedValueForRead(reference.variableName, reference.indexExpression).value;
};

const evaluateAssignmentValue = ({ variableName, indexExpression = null, operator, expression }) => {
  const rightValue = evaluateRuntimeExpression(expression);

  if (operator === "=") {
    return rightValue;
  }

  const targetIndexInfo = indexExpression ? getRuntimeIndexedValueForRead(variableName, indexExpression) : null;
  const leftValue = targetIndexInfo
    ? targetIndexInfo.value
    : getRuntimeVariableValueForRead(variableName);

  switch (operator) {
    case "+=":
      return leftValue + rightValue;
    case "-=":
      return leftValue - rightValue;
    case "*=":
      return leftValue * rightValue;
    case "/=":
      return leftValue / rightValue;
    case "%=":
      return leftValue % rightValue;
    default:
      throw new Error(`Operatore di assegnazione non supportato: ${operator}`);
  }
};

const applyRuntimeAssignment = (assignment) => {
  const assignedValue = evaluateAssignmentValue(assignment);

  if (!assignment.indexExpression) {
    setRuntimeVariableValue(assignment.variableName, assignedValue);
    return;
  }

  const targetInfo = evaluateRuntimeIndexedTarget(assignment.variableName, assignment.indexExpression);

  if (targetInfo.isStringCharacterAccess) {
    const replacementText = String(assignedValue ?? "");

    if (replacementText.length !== 1) {
      throw new Error(`Per "${assignment.targetText}" serve un singolo carattere.`);
    }

    const nextValue =
      targetInfo.currentValue.slice(0, targetInfo.index) +
      replacementText +
      targetInfo.currentValue.slice(targetInfo.index + 1);

    setRuntimeVariableValue(assignment.variableName, nextValue);
    return;
  }

  const elementMeta = {
    ...targetInfo.meta,
    name: assignment.targetText,
    isArray: false,
  };

  targetInfo.currentValue[targetInfo.index] = castRuntimeValue(assignedValue, elementMeta);
};

const applyRuntimeInputValue = (targetReference, rawValue) => {
  if (!targetReference?.indexExpression) {
    setRuntimeVariableValue(targetReference.variableName, rawValue, { fromInput: true });
    return;
  }

  const targetInfo = evaluateRuntimeIndexedTarget(targetReference.variableName, targetReference.indexExpression);

  if (targetInfo.isStringCharacterAccess) {
    const replacementText = String(rawValue ?? "");

    if (replacementText.length !== 1) {
      throw new Error(`Per "${targetReference.targetText}" serve un singolo carattere.`);
    }

    const nextValue =
      targetInfo.currentValue.slice(0, targetInfo.index) +
      replacementText +
      targetInfo.currentValue.slice(targetInfo.index + 1);

    setRuntimeVariableValue(targetReference.variableName, nextValue);
    return;
  }

  const elementMeta = {
    ...targetInfo.meta,
    name: targetReference.targetText,
    isArray: false,
  };

  targetInfo.currentValue[targetInfo.index] = castRuntimeValue(rawValue, elementMeta, { fromInput: true });
};

const resolveRuntimeOutputValue = (text) => {
  const rawText = String(text ?? "");

  if (outputPlaceholderPattern.test(rawText)) {
    return resolveOutputTemplate(rawText);
  }

  return rawText;
};

const resolveOutputTemplate = (template) =>
  String(template ?? "").replace(/\{([^{}]+)\}/g, (_, expression) => {
    const trimmedExpression = String(expression ?? "").trim();

    if (!trimmedExpression) {
      return "";
    }

    return formatRuntimeValue(evaluateRuntimeExpression(trimmedExpression));
  });

const focusConsoleInput = () => {
  if (!consoleInputField) {
    return;
  }

  requestAnimationFrame(() => {
    consoleInputField.focus();
    consoleInputField.select();
  });
};

const requestRuntimeInput = (variableName) => {
  const targetReference = parseVariableReference(variableName);

  if (!targetReference) {
    throw new Error("Nodo Input incompleto: target non valido.");
  }

  ensureRuntimeVariableExists(targetReference.variableName);

  return new Promise((resolve) => {
    pendingInputResolver = resolve;
    runtimeState.waitingInput = {
      target: targetReference,
      variableName: targetReference.variableName,
      label: `Inserisci un valore per ${targetReference.targetText}`,
    };
    setRuntimeStatus("Input richiesto", {
      tone: "warning",
      detail: `In attesa di input per ${targetReference.targetText}`,
    });
    refreshExecutionUi();
    focusConsoleInput();
  });
};

const submitRuntimeInput = () => {
  if (!runtimeState?.waitingInput || typeof pendingInputResolver !== "function" || !consoleInputField) {
    return;
  }

  const { target, variableName } = runtimeState.waitingInput;
  const rawValue = consoleInputField.value;

  try {
    applyRuntimeInputValue(target ?? parseVariableReference(variableName), rawValue);
  } catch (error) {
    setRuntimeStatus("Errore", {
      tone: "error",
      detail: error.message,
    });
    addConsoleEntry("error", error.message);
    refreshExecutionUi();
    focusConsoleInput();
    return;
  }

  addConsoleEntry("input", `${variableName} = ${formatRuntimeValue(runtimeState.variableValues.get(variableName))}`);
  consoleInputField.value = "";
  runtimeState.waitingInput = null;
  const resolver = pendingInputResolver;
  pendingInputResolver = null;
  setRuntimeStatus(executionMode === "step" ? "Pronto" : "In corso", {
    tone: "success",
    detail: executionMode === "step" ? "Passo pronto" : "Esecuzione in corso",
  });
  refreshExecutionUi();
  resolver();
};

const waitForNextStep = () =>
  new Promise((resolve) => {
    pendingStepResolver = resolve;
    setRuntimeStatus("Pronto", {
      tone: "success",
      detail: "Passo: premi Passo",
    });
    refreshExecutionUi();
  });

const finishPendingRunDelay = () => {
  if (pendingRunDelayTimer != null) {
    window.clearTimeout(pendingRunDelayTimer);
    pendingRunDelayTimer = null;
  }

  if (typeof pendingRunDelayResolver === "function") {
    const resolver = pendingRunDelayResolver;
    pendingRunDelayResolver = null;
    resolver();
  }
};

const waitForRunDelay = (delayMs) =>
  new Promise((resolve) => {
    const finish = () => {
      pendingRunDelayTimer = null;
      pendingRunDelayResolver = null;
      resolve();
    };

    pendingRunDelayResolver = finish;
    pendingRunDelayTimer = window.setTimeout(finish, delayMs);
  });

const advanceStepExecution = () => {
  if (typeof pendingStepResolver !== "function") {
    return;
  }

  const resolver = pendingStepResolver;
  pendingStepResolver = null;
  setRuntimeStatus("In corso", {
    tone: "success",
    detail: "Esecuzione in corso",
  });
  refreshExecutionUi();
  resolver();
};

const cancelExecution = () => {
  if (!runtimeState) {
    return;
  }

  runtimeState.cancelled = true;
  runtimeState.statusLabel = "Stop";
  runtimeState.statusTone = "warning";
  runtimeState.statusDetail = "Interruzione in corso";

  if (typeof pendingStepResolver === "function") {
    const resolver = pendingStepResolver;
    pendingStepResolver = null;
    resolver();
  }

  if (typeof pendingInputResolver === "function") {
    runtimeState.waitingInput = null;
    const resolver = pendingInputResolver;
    pendingInputResolver = null;
    resolver();
  }

  finishPendingRunDelay();
  refreshExecutionUi();
};

const clearRuntimeSnapshot = () => {
  finishPendingRunDelay();
  runtimeState = null;
  executionCursor = -1;
  executionMode = null;
  pendingStepResolver = null;
  pendingInputResolver = null;
};

const finalizeExecutionSession = (label, { keepCursor = false, tone = "success", detail = label } = {}) => {
  if (runtimeState) {
    runtimeState.statusLabel = label;
    runtimeState.statusTone = tone;
    runtimeState.statusDetail = detail;
    runtimeState.waitingInput = null;
    runtimeState.completed = true;
  }

  isProgramRunning = false;
  executionMode = null;
  pendingStepResolver = null;
  pendingInputResolver = null;
  finishPendingRunDelay();

  if (!keepCursor) {
    executionCursor = -1;
    if (runtimeState) {
      runtimeState.currentNodeId = null;
    }
  }

  refreshExecutionUi();
};

const pauseBeforeNodeExecution = async (node) => {
  if (!runtimeState || runtimeState.cancelled) {
    throw new Error("__execution_cancelled__");
  }

  runtimeState.operationCount += 1;

  if (runtimeState.operationCount > MAX_RUNTIME_OPERATIONS) {
    throw new Error("Limite di esecuzione superato. Possibile ciclo infinito.");
  }

  executionCursor = node.id;
  runtimeState.currentNodeId = node.id;
  setRuntimeStatus(executionMode === "step" ? "Pronto" : "In corso", {
    tone: "success",
    detail: executionMode === "step" ? "Passo pronto" : "Esecuzione in corso",
  });

  if (executionMode === "step") {
    await waitForNextStep();
  } else if (runExecutionDelayMs > 0) {
    refreshExecutionUi();
    await waitForRunDelay(runExecutionDelayMs);
  } else if (runtimeState.operationCount % RUN_MODE_UI_UPDATE_INTERVAL === 0) {
    refreshExecutionUi();
    await new Promise((resolve) => window.setTimeout(resolve, 0));
  }

  if (runtimeState.cancelled) {
    throw new Error("__execution_cancelled__");
  }
};

const executeRuntimeNodes = async (nodes) => {
  for (const node of nodes) {
    if (node.type !== "do" && node.type !== "while") {
      await pauseBeforeNodeExecution(node);
    }

    switch (node.type) {
      case "declare":
        break;
      case "assign": {
        const cachedAssignment = runtimeAssignmentCache.get(node);
        let parsedAssignment = cachedAssignment?.parsed;

        if (!cachedAssignment || cachedAssignment.source !== node.value) {
          parsedAssignment = parseAssignmentStatement(node.value);
          runtimeAssignmentCache.set(node, {
            source: node.value,
            parsed: parsedAssignment,
          });
        }

        if (!parsedAssignment) {
          throw new Error(`Assegnazione non valida nel nodo ${node.id}: usa =, +=, -=, *=, /= oppure %=.`);
        }

        applyRuntimeAssignment(parsedAssignment);
        break;
      }
      case "input": {
        const variableName = node.value.trim();

        if (!variableName) {
          throw new Error("Nodo Input incompleto: manca il nome della variabile.");
        }

        await requestRuntimeInput(variableName);
        break;
      }
      case "output":
        addConsoleEntry("output", resolveRuntimeOutputValue(node.value), {
          appendNewline: node.outputConfig?.appendNewline !== false,
        });
        break;
      case "if":
        await executeRuntimeNodes(
          evaluateRuntimeExpression(node.value)
            ? (node.branches?.trueBranch ?? [])
            : (node.branches?.falseBranch ?? [])
        );
        break;
      case "while":
        while (true) {
          await pauseBeforeNodeExecution(node);

          if (!Boolean(evaluateRuntimeExpression(node.value))) {
            break;
          }

          await executeRuntimeNodes(node.branches?.body ?? []);

          if (runtimeState.cancelled) {
            throw new Error("__execution_cancelled__");
          }
        }
        break;
      case "for": {
        const config = node.forConfig ?? {};
        const variableName = config.variable?.trim();
        const includeEnd = config.includeEnd !== false;
        const startValue = evaluateRuntimeExpression(config.start ?? "");
        const endValue = evaluateRuntimeExpression(config.end ?? "");
        const stepValue = evaluateRuntimeExpression(config.step ?? "");
        const numericStart = Number(startValue);
        const numericEnd = Number(endValue);
        const numericStep = Number(stepValue);

        if (!variableName) {
          throw new Error("Nodo For incompleto: manca la variabile di controllo.");
        }

        if (!Number.isFinite(numericStart) || !Number.isFinite(numericEnd)) {
          throw new Error("Configurazione For non valida: inizio e fine devono essere numeri validi.");
        }

        if (!Number.isFinite(numericStep) || numericStep === 0) {
          throw new Error("Configurazione For non valida: il passo deve essere un numero diverso da zero.");
        }

        setRuntimeVariableValue(variableName, numericStart);

        while (true) {
          const currentValue = Number(runtimeState.variableValues.get(variableName));

          if (!Number.isFinite(currentValue)) {
            throw new Error(`Configurazione For non valida: la variabile ${variableName} deve contenere un numero.`);
          }

          const shouldContinue = numericStep > 0
            ? (includeEnd ? currentValue <= numericEnd : currentValue < numericEnd)
            : (includeEnd ? currentValue >= numericEnd : currentValue > numericEnd);

          if (!shouldContinue) {
            break;
          }

          await executeRuntimeNodes(node.branches?.body ?? []);

          if (runtimeState.cancelled) {
            throw new Error("__execution_cancelled__");
          }

          const nextValue = currentValue + numericStep;
          setRuntimeVariableValue(variableName, nextValue);
        }
        break;
      }
      case "do":
        do {
          await executeRuntimeNodes(node.branches?.body ?? []);

          if (runtimeState.cancelled) {
            throw new Error("__execution_cancelled__");
          }

          await pauseBeforeNodeExecution(node);
        } while (Boolean(evaluateRuntimeExpression(node.value)));
        break;
      case "comment":
        break;
      default:
        throw new Error(`Il nodo di tipo "${node.type}" non è ancora supportato in esecuzione.`);
    }
  }
};

const startProgramExecution = async (mode) => {
  if (isProgramRunning) {
    if (mode === "step" && executionMode === "step") {
      advanceStepExecution();
      return;
    }

    if (mode === "run" && executionMode === "step") {
      executionMode = "run";
      setRuntimeStatus("In corso", {
        tone: "success",
        detail: "Esecuzione in corso",
      });
      advanceStepExecution();
    }

    return;
  }

  if (!propertyDialogBackdrop.hidden) {
    closePropertyDialog({ restoreFocus: false });
  }

  if (!insertDialogBackdrop.hidden) {
    closeInsertDialog();
  }

  runtimeState = createRuntimeState(mode);
  executionMode = mode;
  isProgramRunning = true;
  executionCursor = -1;
  selectedNodeIds = new Set();
  previewSelectedNodeIds = new Set();
  renderFlowchart();

  try {
    await executeRuntimeNodes(flowNodes);

    if (runtimeState?.cancelled) {
      finalizeExecutionSession("Interrotta", {
        tone: "warning",
        detail: "Esecuzione interrotta",
      });
      return;
    }

    finalizeExecutionSession("Completata", {
      tone: "success",
      detail: "Esecuzione completata",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "__execution_cancelled__") {
      finalizeExecutionSession("Interrotta", {
        tone: "warning",
        detail: "Esecuzione interrotta",
      });
      return;
    }

    const message = error instanceof Error ? error.message : "Errore durante l'esecuzione.";

    if (runtimeState) {
      addConsoleEntry("error", message);
    }

    finalizeExecutionSession("Errore", {
      keepCursor: true,
      tone: "error",
      detail: message,
    });
  }
};
