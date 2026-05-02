const mainTabs = document.querySelectorAll(".folder-tab");
const mainViews = document.querySelectorAll(".main-view");
const workspace = document.querySelector(".workspace");
const workspaceResizer = document.querySelector("#workspace-resizer");
const sidebarContent = document.querySelector(".sidebar-content");
const sidebarResizer = document.querySelector("#sidebar-resizer");
const variablesSection = document.querySelector(".variables-section");
const newDiagramButton = document.querySelector("#new-diagram-button");
const runProgramButton = document.querySelector("#run-program-button");
const stepProgramButton = document.querySelector("#step-program-button");
const stopProgramButton = document.querySelector("#stop-program-button");
const showNodeTypeToggle = document.querySelector("#show-node-type-toggle");

const diagramCanvas = document.querySelector("#diagram-canvas");
const flowchartRoot = document.querySelector("#flowchart-root");
const selectionBox = document.querySelector("#selection-box");
const variablesBody = document.querySelector("#variables-body");
const terminalStatus = document.querySelector("#terminal-status");
const consoleOutput = document.querySelector("#console-output");
const consoleInputForm = document.querySelector("#console-input-form");
const consoleInputLabel = document.querySelector("#console-input-label");
const consoleInputField = document.querySelector("#console-input-field");
const consoleInputButton = document.querySelector("#console-input-button");
const insertDialogBackdrop = document.querySelector("#insert-dialog-backdrop");
const insertDialogClose = document.querySelector("#insert-dialog-close");
const insertNodeButtons = document.querySelectorAll("[data-node-type]");
const insertDialogNotice = document.querySelector("#insert-dialog-notice");
const insertDialogNoticeClose = document.querySelector("#insert-dialog-notice-close");
const insertDialogNoticeText = document.querySelector("#insert-dialog-notice-text");

const propertyDialogBackdrop = document.querySelector("#property-dialog-backdrop");
const propertyDialogClose = document.querySelector("#property-dialog-close");
const propertyDialogCancel = document.querySelector("#property-dialog-cancel");
const propertyDialogTitle = document.querySelector("#property-dialog-title");
const propertyPreview = document.querySelector("#property-preview");
const propertyDescription = document.querySelector("#property-description");
const propertyFieldLabel = document.querySelector("#property-field-label");
const propertyInput = document.querySelector("#property-input");
const assignSuggestions = document.querySelector("#assign-suggestions");
const propertyError = document.querySelector("#property-error");
const propertyErrorText = document.querySelector("#property-error-text");
const propertyErrorClose = document.querySelector("#property-error-close");
const genericPropertyField = document.querySelector("#generic-property-field");
const declareFields = document.querySelector("#declare-fields");
const declareNameInput = document.querySelector("#declare-name-input");
const declareArrayOption = document.querySelector("#declare-array-option");
const declareArrayInput = document.querySelector("#declare-array-input");
const declareTypeInputs = document.querySelectorAll('input[name="declare-type"]');
const forFields = document.querySelector("#for-fields");
const forVariableInput = document.querySelector("#for-variable-input");
const forStartInput = document.querySelector("#for-start-input");
const forEndInput = document.querySelector("#for-end-input");
const forStepInput = document.querySelector("#for-step-input");
const propertyForm = document.querySelector("#property-form");
const STORAGE_KEY = "flowgorithm-web-diagram";
const NODE_LABEL_PREFERENCE_KEY = "flowgorithm-web-show-node-type";
const NOT_YET_IMPLEMENTED_MESSAGE = "Questa funzione al momento non è utilizzabile perché non è ancora stata sviluppata.";

const nodeDefinitions = {
  input: {
    label: "Input",
    shapeClass: "flow-node-input",
    dialogTitle: "Input Properties",
    description: "Legge un valore dall'utente e lo salva in una variabile.",
    fieldLabel: "Inserisci il nome della variabile:",
    placeholder: "variabile",
  },
  output: {
    label: "Output",
    shapeClass: "flow-node-output",
    dialogTitle: "Output Properties",
    description: "Mostra un testo formattato. Usa {nomeVariabile} per inserire variabili nel messaggio.",
    fieldLabel: "Inserisci il testo da mostrare:",
    placeholder: "",
  },
  declare: {
    label: "Declare",
    shapeClass: "flow-node-declare",
    dialogTitle: "Declare Properties",
    description: "Crea variabili o array da usare durante l'esecuzione del programma.",
    fieldLabel: "Inserisci la dichiarazione:",
    placeholder: "nome variabile",
  },
  assign: {
    label: "Assign",
    shapeClass: "flow-node-assign",
    dialogTitle: "Assign Properties",
    description: "Assegna un valore a una variabile esistente.",
    fieldLabel: "Inserisci l'assegnazione:",
    placeholder: "variabile = espressione oppure variabile += espressione",
  },
  if: {
    label: "If",
    shapeClass: "flow-node-if",
    dialogTitle: "If Properties",
    description: "Valuta una condizione e dirige il flusso in base al risultato.",
    fieldLabel: "Inserisci la condizione:",
    placeholder: "condizione",
  },
  call: {
    label: "Call",
    shapeClass: "flow-node-call",
    dialogTitle: "Call Properties",
    description: "Richiama una funzione o una procedura definita altrove.",
    fieldLabel: "Inserisci il nome della chiamata:",
    placeholder: "chiamata",
  },
  while: {
    label: "While",
    shapeClass: "flow-node-while",
    dialogTitle: "While Properties",
    description: "Ripete il blocco finché la condizione resta vera.",
    fieldLabel: "Inserisci la condizione del ciclo:",
    placeholder: "condizione",
  },
  for: {
    label: "For",
    shapeClass: "flow-node-for",
    dialogTitle: "For Properties",
    description: "Ripete il blocco usando un contatore e un intervallo definito.",
    fieldLabel: "Inserisci il controllo del ciclo:",
    placeholder: "i = 0 to 10",
  },
  do: {
    label: "Do-While",
    shapeClass: "flow-node-do",
    dialogTitle: "Do-While Properties",
    description: "Esegue il blocco almeno una volta prima di valutare la condizione.",
    fieldLabel: "Inserisci la condizione del ciclo:",
    placeholder: "condizione",
  },
  comment: {
    label: "Comment",
    shapeClass: "flow-node-comment",
    dialogTitle: "Comment Properties",
    description: "Aggiunge un commento descrittivo al diagramma.",
    fieldLabel: "Inserisci il commento:",
    placeholder: "commento",
  },
};

const flowNodes = [];
const structuredNodeBranchLabels = {
  if: {
    falseBranch: "False",
    trueBranch: "True",
  },
  while: {
    body: "True",
    exit: "False",
  },
  for: {
    body: "Next",
    exit: "Done",
  },
  do: {
    body: "True",
    exit: "False",
  },
};
let nextNodeId = 1;
let pendingInsertTarget = null;
let editingNodeId = null;
let lastConnectorButton = null;
let selectedNodeIds = new Set();
let previewSelectedNodeIds = new Set();
let selectionDrag = null;
let isProgramRunning = false;
let executionCursor = -1;
let currentAssignSuggestions = [];
let activeAssignSuggestionIndex = -1;
let nodeClickTimer = null;
let diagramZoom = 1;
let panDrag = null;
let showNodeTypeInLabel = false;
let executionMode = null;
let runtimeState = null;
let pendingStepResolver = null;
let pendingInputResolver = null;
let isWorkspaceSplitManual = false;
let isSidebarSplitManual = false;
let pendingSidebarAutoSyncFrame = null;

const RUNTIME_UNDECLARED = Symbol("runtime-undeclared");
const MAX_RUNTIME_OPERATIONS = 10000;
const SUPPORTED_ASSIGNMENT_OPERATORS = new Set(["=", "+=", "-=", "*=", "/=", "%="]);

const MIN_DIAGRAM_ZOOM = 0.18;
const MAX_DIAGRAM_ZOOM = 2.8;
const DIAGRAM_ZOOM_STEP = 0.1;

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
    return;
  }

  propertyInput.style.height = "auto";
  propertyInput.style.height = `${propertyInput.scrollHeight}px`;
};

const getStructuredBranchKeys = (type) => {
  switch (type) {
    case "if":
      return ["falseBranch", "trueBranch"];
    case "while":
    case "for":
    case "do":
      return ["body"];
    default:
      return [];
  }
};

const createStructuredBranches = (type) => {
  const branchKeys = getStructuredBranchKeys(type);

  if (branchKeys.length === 0) {
    return undefined;
  }

  return Object.fromEntries(branchKeys.map((key) => [key, []]));
};

const isStructuredNode = (node) => Boolean(node && getStructuredBranchKeys(node.type).length);

const traverseNodes = (nodes, callback, path = []) => {
  nodes.forEach((node, index) => {
    callback(node, { index, path, nodes });

    if (!isStructuredNode(node) || !node.branches) {
      return;
    }

    getStructuredBranchKeys(node.type).forEach((branchKey) => {
      traverseNodes(node.branches[branchKey] ?? [], callback, [...path, { nodeId: node.id, branchKey }]);
    });
  });
};

const findNodeById = (nodeId) => {
  let match = null;

  traverseNodes(flowNodes, (node) => {
    if (node.id === nodeId) {
      match = node;
    }
  });

  return match;
};

const getContainerByPath = (path) => {
  let container = flowNodes;

  for (const segment of path) {
    const parentNode = findNodeById(segment.nodeId);

    if (!parentNode?.branches?.[segment.branchKey]) {
      return flowNodes;
    }

    container = parentNode.branches[segment.branchKey];
  }

  return container;
};

const findNodeLocationById = (nodeId) => {
  let location = null;

  traverseNodes(flowNodes, (node, context) => {
    if (node.id === nodeId) {
      location = {
        node,
        index: context.index,
        path: context.path,
        container: context.nodes,
      };
    }
  });

  return location;
};

const removeNodeById = (nodeId) => {
  const location = findNodeLocationById(nodeId);

  if (!location) {
    return false;
  }

  location.container.splice(location.index, 1);
  return true;
};

const serializeNode = (node) => {
  const serializedNode = {
    id: node.id,
    type: node.type,
    value: node.value,
  };

  if (node.declareConfig) {
    serializedNode.declareConfig = {
      names: [...(node.declareConfig.names ?? [])],
      dataType: node.declareConfig.dataType,
      isArray: node.declareConfig.isArray,
    };
  }

  if (node.forConfig) {
    serializedNode.forConfig = {
      variable: node.forConfig.variable,
      start: node.forConfig.start,
      end: node.forConfig.end,
      step: node.forConfig.step,
    };
  }

  if (isStructuredNode(node)) {
    serializedNode.branches = {};

    getStructuredBranchKeys(node.type).forEach((branchKey) => {
      serializedNode.branches[branchKey] = (node.branches?.[branchKey] ?? [])
        .filter((childNode) => !childNode.isDraft)
        .map(serializeNode);
    });
  }

  return serializedNode;
};

const normalizeNode = (rawNode) => {
  if (
    !rawNode ||
    typeof rawNode.id !== "number" ||
    typeof rawNode.type !== "string" ||
    !Object.hasOwn(nodeDefinitions, rawNode.type) ||
    typeof rawNode.value !== "string"
  ) {
    return null;
  }

  const normalizedNode = {
    id: rawNode.id,
    type: rawNode.type,
    value: rawNode.value,
    isDraft: false,
  };

  if (rawNode.type === "declare") {
    normalizedNode.declareConfig = rawNode.declareConfig
      ? {
          names: Array.isArray(rawNode.declareConfig.names)
            ? rawNode.declareConfig.names.filter((name) => typeof name === "string")
            : typeof rawNode.declareConfig.name === "string"
              ? rawNode.declareConfig.name.split(",").map((name) => name.trim()).filter(Boolean)
              : [],
          dataType: typeof rawNode.declareConfig.dataType === "string" ? rawNode.declareConfig.dataType : "Integer",
          isArray: Boolean(rawNode.declareConfig.isArray),
        }
      : {
          names: [],
          dataType: "Integer",
          isArray: false,
        };
  }

  if (rawNode.type === "for") {
    normalizedNode.forConfig = rawNode.forConfig
      ? {
          variable: typeof rawNode.forConfig.variable === "string" ? rawNode.forConfig.variable : "",
          start: typeof rawNode.forConfig.start === "string" ? rawNode.forConfig.start : "",
          end: typeof rawNode.forConfig.end === "string" ? rawNode.forConfig.end : "",
          step: typeof rawNode.forConfig.step === "string" ? rawNode.forConfig.step : "",
        }
      : {
          variable: "",
          start: "",
          end: "",
          step: "",
        };
  }

  if (getStructuredBranchKeys(rawNode.type).length > 0) {
    normalizedNode.branches = createStructuredBranches(rawNode.type);

    getStructuredBranchKeys(rawNode.type).forEach((branchKey) => {
      const rawBranch = rawNode.branches?.[branchKey];
      normalizedNode.branches[branchKey] = Array.isArray(rawBranch)
        ? rawBranch.map(normalizeNode).filter(Boolean)
        : [];
    });
  }

  return normalizedNode;
};

const saveFlowchartState = () => {
  const persistedNodes = flowNodes
    .filter((node) => !node.isDraft)
    .map(serializeNode);

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedNodes));
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

    const validNodes = parsedNodes.map(normalizeNode).filter(Boolean);

    flowNodes.length = 0;
    flowNodes.push(...validNodes);

    let maxId = 0;
    traverseNodes(flowNodes, (node) => {
      maxId = Math.max(maxId, node.id);
    });
    nextNodeId = maxId + 1;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

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
  window.localStorage.setItem(NODE_LABEL_PREFERENCE_KEY, String(showNodeTypeInLabel));
};

const getNodeLabelPrefix = (node) => {
  const definition = getNodeDefinition(node.type);
  return showNodeTypeInLabel && definition ? `${definition.label}: ` : "";
};

const getNodeLabelPrefixMarkup = (node) => {
  const prefix = getNodeLabelPrefix(node);
  return prefix ? `${escapeHtml(prefix.slice(0, -1))}&nbsp;` : "";
};

mainTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const targetId = tab.dataset.mainTarget;

    mainTabs.forEach((item) => {
      item.classList.toggle("is-active", item === tab);
      item.setAttribute("aria-selected", String(item === tab));
    });

    mainViews.forEach((view) => {
      const isTarget = view.id === targetId;
      view.classList.toggle("is-active", isTarget);
      view.hidden = !isTarget;
    });
  });
});

const SIDEBAR_MIN_TOP = 180;
const SIDEBAR_MIN_BOTTOM = 160;
const WORKSPACE_MIN_MAIN = 560;
const WORKSPACE_MIN_SIDEBAR = 320;

const getSidebarSplitMetrics = () => {
  if (!sidebarContent || !sidebarResizer) {
    return null;
  }

  const bounds = sidebarContent.getBoundingClientRect();
  const handleHeight = sidebarResizer.getBoundingClientRect().height || 16;
  const maxTop = Math.max(SIDEBAR_MIN_TOP, bounds.height - SIDEBAR_MIN_BOTTOM - handleHeight);

  return {
    bounds,
    handleHeight,
    maxTop,
  };
};

const setSidebarSplitTop = (nextTop) => {
  const metrics = getSidebarSplitMetrics();

  if (!metrics || !sidebarContent) {
    return;
  }

  const clampedTop = Math.min(Math.max(nextTop, SIDEBAR_MIN_TOP), metrics.maxTop);
  sidebarContent.style.setProperty("--sidebar-top-size", `${Math.round(clampedTop)}px`);
};

const updateSidebarSplitFromPointer = (pointerClientY) => {
  const metrics = getSidebarSplitMetrics();

  if (!metrics) {
    return;
  }

  setSidebarSplitTop(pointerClientY - metrics.bounds.top);
};

const syncSidebarSplitToContent = () => {
  if (isSidebarSplitManual || !variablesSection) {
    return;
  }

  setSidebarSplitTop(variablesSection.scrollHeight);
};

const scheduleSidebarAutoSync = () => {
  if (isSidebarSplitManual || pendingSidebarAutoSyncFrame != null) {
    return;
  }

  pendingSidebarAutoSyncFrame = requestAnimationFrame(() => {
    pendingSidebarAutoSyncFrame = null;
    syncSidebarSplitToContent();
  });
};

const getWorkspaceSplitMetrics = () => {
  if (!workspace || !workspaceResizer) {
    return null;
  }

  const bounds = workspace.getBoundingClientRect();
  const handleWidth = workspaceResizer.getBoundingClientRect().width || 16;
  const maxSidebar = Math.max(WORKSPACE_MIN_SIDEBAR, bounds.width - WORKSPACE_MIN_MAIN - handleWidth);

  return {
    bounds,
    handleWidth,
    maxSidebar,
  };
};

const setWorkspaceSidebarWidth = (nextSidebarWidth) => {
  const metrics = getWorkspaceSplitMetrics();

  if (!metrics || !workspace) {
    return;
  }

  const clampedWidth = Math.min(Math.max(nextSidebarWidth, WORKSPACE_MIN_SIDEBAR), metrics.maxSidebar);
  workspace.style.setProperty("--workspace-sidebar-size", `${Math.round(clampedWidth)}px`);
};

const updateWorkspaceSplitFromPointer = (pointerClientX) => {
  const metrics = getWorkspaceSplitMetrics();

  if (!metrics) {
    return;
  }

  const sidebarWidth = metrics.bounds.right - pointerClientX - metrics.handleWidth / 2;
  setWorkspaceSidebarWidth(sidebarWidth);
};

if (sidebarContent && sidebarResizer) {
  sidebarResizer.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isSidebarSplitManual = true;
    sidebarResizer.setPointerCapture(event.pointerId);
    sidebarResizer.classList.add("is-dragging");
    updateSidebarSplitFromPointer(event.clientY);

    const onPointerMove = (moveEvent) => {
      updateSidebarSplitFromPointer(moveEvent.clientY);
    };

    const onPointerUp = (upEvent) => {
      sidebarResizer.releasePointerCapture(upEvent.pointerId);
      sidebarResizer.classList.remove("is-dragging");
      sidebarResizer.removeEventListener("pointermove", onPointerMove);
      sidebarResizer.removeEventListener("pointerup", onPointerUp);
      sidebarResizer.removeEventListener("pointercancel", onPointerUp);
    };

    sidebarResizer.addEventListener("pointermove", onPointerMove);
    sidebarResizer.addEventListener("pointerup", onPointerUp);
    sidebarResizer.addEventListener("pointercancel", onPointerUp);
  });

  window.addEventListener("resize", () => {
    if (isSidebarSplitManual) {
      const currentTop = Number.parseFloat(getComputedStyle(sidebarContent).getPropertyValue("--sidebar-top-size"));
      setSidebarSplitTop(Number.isFinite(currentTop) ? currentTop : SIDEBAR_MIN_TOP);
      return;
    }

    scheduleSidebarAutoSync();
  });
}

if (workspace && workspaceResizer) {
  workspaceResizer.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    isWorkspaceSplitManual = true;
    workspaceResizer.setPointerCapture(event.pointerId);
    workspaceResizer.classList.add("is-dragging");
    updateWorkspaceSplitFromPointer(event.clientX);

    const onPointerMove = (moveEvent) => {
      updateWorkspaceSplitFromPointer(moveEvent.clientX);
    };

    const onPointerUp = (upEvent) => {
      workspaceResizer.releasePointerCapture(upEvent.pointerId);
      workspaceResizer.classList.remove("is-dragging");
      workspaceResizer.removeEventListener("pointermove", onPointerMove);
      workspaceResizer.removeEventListener("pointerup", onPointerUp);
      workspaceResizer.removeEventListener("pointercancel", onPointerUp);
    };

    workspaceResizer.addEventListener("pointermove", onPointerMove);
    workspaceResizer.addEventListener("pointerup", onPointerUp);
    workspaceResizer.addEventListener("pointercancel", onPointerUp);
  });

  window.addEventListener("resize", () => {
    if (!isWorkspaceSplitManual) {
      return;
    }

    const currentWidth = Number.parseFloat(getComputedStyle(workspace).getPropertyValue("--workspace-sidebar-size"));
    setWorkspaceSidebarWidth(Number.isFinite(currentWidth) ? currentWidth : WORKSPACE_MIN_SIDEBAR);
  });
}

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getNodeDefinition = (type) => nodeDefinitions[type];

const getDeclaredVariableNames = () => {
  const names = [];
  const seen = new Set();

  traverseNodes(flowNodes, (node) => {
    if (node.type !== "declare" || !node.declareConfig?.names) {
      return;
    }

    node.declareConfig.names.forEach((declaredName) => {
      const variableName = declaredName.trim();

      if (!variableName || seen.has(variableName)) {
        return;
      }

      seen.add(variableName);
      names.push(variableName);
    });
  });

  return names;
};

const getDeclaredVariableNameSet = () => new Set(getDeclaredVariableNames());
const reservedWords = new Set([
  "true",
  "false",
  "and",
  "or",
  "not",
  "mod",
  "to",
  "step",
]);
const reservedLanguageNames = new Set([
  "alignas", "alignof", "and", "and_eq", "asm", "assert", "auto", "bitand", "bitor", "bool",
  "break", "case", "catch", "char", "char8_t", "char16_t", "char32_t", "class", "compl",
  "concept", "const", "consteval", "constexpr", "constinit", "const_cast", "continue", "co_await",
  "co_return", "co_yield", "decltype", "default", "delete", "do", "double", "dynamic_cast", "else",
  "enum", "explicit", "export", "extern", "false", "float", "for", "friend", "goto", "if", "inline",
  "int", "long", "mutable", "namespace", "new", "noexcept", "not", "not_eq", "nullptr", "operator",
  "or", "or_eq", "private", "protected", "public", "register", "reinterpret_cast", "requires",
  "return", "short", "signed", "sizeof", "static", "static_assert", "static_cast", "struct", "switch",
  "template", "this", "thread_local", "throw", "true", "try", "typedef", "typeid", "typename",
  "union", "unsigned", "using", "virtual", "void", "volatile", "wchar_t", "while", "xor", "xor_eq",
  "_alignas", "_alignof", "_atomic", "_bitint", "_bool", "_complex", "_decimal128", "_decimal32",
  "_decimal64", "_generic", "_imaginary", "_noreturn", "_static_assert", "_thread_local",
  "as", "assert", "async", "await", "breakpoint", "class", "continue", "def", "del", "elif", "else",
  "except", "finally", "from", "global", "import", "in", "is", "lambda", "match", "None", "nonlocal",
  "pass", "raise", "True", "False", "try", "type", "with", "yield",
]);

const hidePropertyError = () => {
  if (!propertyError) {
    return;
  }

  propertyError.hidden = true;

  if (propertyErrorText) {
    propertyErrorText.textContent = "";
  }
};

const showPropertyError = (message) => {
  if (!propertyError) {
    return;
  }

  propertyError.hidden = false;

  if (propertyErrorText) {
    propertyErrorText.textContent = message;
  }
};

const validateDeclareName = (rawName, currentNodeId) => {
  const names = rawName
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return "Inserisci almeno un nome variabile.";
  }

  const seenInCurrentDeclare = new Set();
  const existingNames = new Set();

  traverseNodes(flowNodes, (node) => {
    if (node.id === currentNodeId || node.type !== "declare" || !node.declareConfig?.names) {
      return;
    }

    node.declareConfig.names.forEach((name) => existingNames.add(name));
  });

  for (const name of names) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      return `Il nome "${name}" deve iniziare con una lettera o underscore e contenere solo lettere, numeri o underscore.`;
    }

    if (reservedLanguageNames.has(name) || reservedLanguageNames.has(name.toLowerCase())) {
      return `Il nome "${name}" è riservato nei linguaggi C, C++ o Python.`;
    }

    if (seenInCurrentDeclare.has(name)) {
      return `Il nome "${name}" è ripetuto nello stesso declare.`;
    }

    if (existingNames.has(name)) {
      return `Esiste già una variabile dichiarata con il nome "${name}".`;
    }

    seenInCurrentDeclare.add(name);
  }

  return null;
};

const highlightUndeclaredVariablesInText = (text, declaredNames) => {
  const parts = [];
  const identifierPattern = /[A-Za-z_][A-Za-z0-9_]*/g;
  let lastIndex = 0;
  let match;

  while ((match = identifierPattern.exec(text)) !== null) {
    const [identifier] = match;
    const start = match.index;
    const end = start + identifier.length;

    parts.push(escapeHtml(text.slice(lastIndex, start)));

    if (declaredNames.has(identifier) || reservedWords.has(identifier.toLowerCase())) {
      parts.push(escapeHtml(identifier));
    } else {
      parts.push(`<span class="invalid-variable">${escapeHtml(identifier)}</span>`);
    }

    lastIndex = end;
  }

  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join("");
};

const highlightOutputTemplateText = (text, declaredNames) => {
  const parts = [];
  const placeholderPattern = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = placeholderPattern.exec(text)) !== null) {
    const [placeholder, variableName] = match;
    const start = match.index;
    const end = start + placeholder.length;

    parts.push(escapeHtml(text.slice(lastIndex, start)));

    if (declaredNames.has(variableName)) {
      parts.push(`{${escapeHtml(variableName)}}`);
    } else {
      parts.push(`{<span class="invalid-variable">${escapeHtml(variableName)}</span>}`);
    }

    lastIndex = end;
  }

  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join("");
};

const parseAssignmentStatement = (text) => {
  const match = String(text ?? "").match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+)$/);

  if (!match) {
    return null;
  }

  const [, variableName, operator, expression] = match;

  if (!SUPPORTED_ASSIGNMENT_OPERATORS.has(operator)) {
    return null;
  }

  return {
    variableName,
    operator,
    expression,
  };
};

const isEditingAssignNode = () => {
  const node = findNodeById(editingNodeId);
  return node?.type === "assign";
};

const isEditingForNode = () => {
  const node = findNodeById(editingNodeId);
  return node?.type === "for";
};

const mountAssignSuggestions = () => {
  if (!assignSuggestions) {
    return;
  }

  const targetField = isEditingForNode()
    ? forVariableInput?.closest(".property-field")
    : propertyInput?.closest(".property-field");

  if (targetField && assignSuggestions.parentElement !== targetField) {
    targetField.append(assignSuggestions);
  }
};

const getSuggestionInput = () => {
  if (isEditingAssignNode()) {
    return propertyInput;
  }

  if (isEditingForNode()) {
    return forVariableInput;
  }

  return null;
};

const syncActiveAssignSuggestion = () => {
  if (!assignSuggestions) {
    return;
  }

  assignSuggestions.querySelectorAll(".assign-suggestion").forEach((button, index) => {
    const isActive = index === activeAssignSuggestionIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
};

const applyAssignSuggestion = (value) => {
  const suggestionInput = getSuggestionInput();

  if (!suggestionInput) {
    hideAssignSuggestions();
    return;
  }

  suggestionInput.value = value;
  hideAssignSuggestions();
  suggestionInput.focus();
};

const hideAssignSuggestions = () => {
  if (!assignSuggestions) {
    return;
  }

  currentAssignSuggestions = [];
  activeAssignSuggestionIndex = -1;
  assignSuggestions.hidden = true;
  assignSuggestions.innerHTML = "";
};

const renderAssignSuggestions = (query) => {
  if (!assignSuggestions) {
    return;
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    hideAssignSuggestions();
    return;
  }

  const matches = getDeclaredVariableNames().filter((name) =>
    name.toLowerCase().startsWith(normalizedQuery)
  );

  if (matches.length === 0) {
    hideAssignSuggestions();
    return;
  }

  currentAssignSuggestions = matches;
  activeAssignSuggestionIndex = 0;
  assignSuggestions.innerHTML = matches
    .map(
      (name) => `
        <button type="button" class="assign-suggestion" data-suggestion-value="${escapeHtml(name)}" role="option">
          ${escapeHtml(name)}
        </button>
      `
    )
    .join("");
  assignSuggestions.hidden = false;
  syncActiveAssignSuggestion();

  assignSuggestions.querySelectorAll(".assign-suggestion").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });

    button.addEventListener("click", () => {
      applyAssignSuggestion(button.dataset.suggestionValue ?? "");
    });
  });
};

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
        typeLabel: node.declareConfig.isArray ? `${node.declareConfig.dataType}[]` : node.declareConfig.dataType,
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
    variableValues.set(name, RUNTIME_UNDECLARED);
  });

  return {
    mode,
    status: mode === "step" ? "Passo passo pronto" : "Esecuzione in corso",
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

const setRuntimeStatus = (status) => {
  if (!runtimeState) {
    return;
  }

  runtimeState.status = status;
};

const addConsoleEntry = (kind, text) => {
  if (!runtimeState) {
    return;
  }

  runtimeState.outputEntries.push({
    kind,
    text: String(text),
  });
};

const refreshExecutionUi = () => {
  renderVariablesPanel();
  renderConsolePanel();
  syncExecutionControls();
  scheduleSidebarAutoSync();
};

const renderConsolePanel = () => {
  if (terminalStatus) {
    terminalStatus.textContent = runtimeState?.status ?? "Pronto";
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
    runProgramButton.disabled = isProgramRunning;
  }

  if (stepProgramButton) {
    const isAwaitingStep = executionMode === "step" && typeof pendingStepResolver === "function";
    const isAwaitingInput = Boolean(runtimeState?.waitingInput);
    stepProgramButton.textContent = executionMode === "step" ? "Avanza" : "Passo passo";
    stepProgramButton.disabled = executionMode === "run" || (executionMode === "step" && !isAwaitingStep) || isAwaitingInput;
  }

  if (stopProgramButton) {
    stopProgramButton.disabled = !isProgramRunning;
  }
};

const normalizeExpressionSyntax = (expression) =>
  expression
    .replace(/\btrue\b/gi, "true")
    .replace(/\bfalse\b/gi, "false")
    .replace(/\bmod\b/gi, "%")
    .replace(/\band\b/gi, "&&")
    .replace(/\bor\b/gi, "||")
    .replace(/\bnot\b/gi, "!");

const getRuntimeScope = () => {
  if (!runtimeState) {
    return {};
  }

  return Object.fromEntries(
    Array.from(runtimeState.variableValues.entries()).map(([name, value]) => [
      name,
      value === RUNTIME_UNDECLARED ? undefined : value,
    ])
  );
};

const evaluateRuntimeExpression = (expression) => {
  const normalizedExpression = normalizeExpressionSyntax(expression ?? "").trim();

  if (!normalizedExpression) {
    throw new Error("Espressione vuota.");
  }

  const identifierPattern = /[A-Za-z_][A-Za-z0-9_]*/g;
  const runtimeKeywords = new Set(["true", "false"]);
  const referencedVariables = new Set();
  let match = null;

  while ((match = identifierPattern.exec(normalizedExpression)) !== null) {
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
    return Function("scope", `with (scope) { return (${normalizedExpression}); }`)(getRuntimeScope());
  } catch (error) {
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

const evaluateAssignmentValue = ({ variableName, operator, expression }) => {
  const rightValue = evaluateRuntimeExpression(expression);

  if (operator === "=") {
    return rightValue;
  }

  const leftValue = getRuntimeVariableValueForRead(variableName);

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

const resolveOutputTemplate = (template) =>
  String(template ?? "").replace(/\{([A-Za-z_][A-Za-z0-9_]*)\}/g, (_, variableName) => {
    ensureRuntimeVariableExists(variableName);
    const value = runtimeState.variableValues.get(variableName);

    if (value === RUNTIME_UNDECLARED) {
      throw new Error(`Impossibile mostrare "${variableName}": la variabile non ha ancora un valore.`);
    }

    return formatRuntimeValue(value);
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
  ensureRuntimeVariableExists(variableName);

  return new Promise((resolve) => {
    pendingInputResolver = resolve;
    runtimeState.waitingInput = {
      variableName,
      label: `Inserisci un valore per ${variableName}`,
    };
    setRuntimeStatus(`In attesa di input per ${variableName}`);
    refreshExecutionUi();
    focusConsoleInput();
  });
};

const submitRuntimeInput = () => {
  if (!runtimeState?.waitingInput || typeof pendingInputResolver !== "function" || !consoleInputField) {
    return;
  }

  const { variableName } = runtimeState.waitingInput;
  const rawValue = consoleInputField.value;

  try {
    setRuntimeVariableValue(variableName, rawValue, { fromInput: true });
  } catch (error) {
    setRuntimeStatus(error.message);
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
  setRuntimeStatus(executionMode === "step" ? "Passo passo pronto" : "Esecuzione in corso");
  refreshExecutionUi();
  resolver();
};

const waitForNextStep = () =>
  new Promise((resolve) => {
    pendingStepResolver = resolve;
    setRuntimeStatus("Passo passo: premi Avanza");
    refreshExecutionUi();
  });

const advanceStepExecution = () => {
  if (typeof pendingStepResolver !== "function") {
    return;
  }

  const resolver = pendingStepResolver;
  pendingStepResolver = null;
  setRuntimeStatus("Esecuzione in corso");
  refreshExecutionUi();
  resolver();
};

const cancelExecution = () => {
  if (!runtimeState) {
    return;
  }

  runtimeState.cancelled = true;
  runtimeState.status = "Interruzione in corso";

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

  refreshExecutionUi();
};

const clearRuntimeSnapshot = () => {
  runtimeState = null;
  executionCursor = -1;
  executionMode = null;
  pendingStepResolver = null;
  pendingInputResolver = null;
};

const finalizeExecutionSession = (status, { keepCursor = false } = {}) => {
  if (runtimeState) {
    runtimeState.status = status;
    runtimeState.waitingInput = null;
    runtimeState.completed = true;
  }

  isProgramRunning = false;
  executionMode = null;
  pendingStepResolver = null;
  pendingInputResolver = null;

  if (!keepCursor) {
    executionCursor = -1;
    if (runtimeState) {
      runtimeState.currentNodeId = null;
    }
  }

  renderFlowchart();
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
  setRuntimeStatus(executionMode === "step" ? "Passo passo pronto" : "Esecuzione in corso");
  renderFlowchart();
  refreshExecutionUi();

  if (executionMode === "step") {
    await waitForNextStep();
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
        const parsedAssignment = parseAssignmentStatement(node.value);

        if (!parsedAssignment) {
          throw new Error(`Assegnazione non valida nel nodo ${node.id}: usa =, +=, -=, *=, /= oppure %=.`);
        }

        setRuntimeVariableValue(
          parsedAssignment.variableName,
          evaluateAssignmentValue(parsedAssignment)
        );
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
        addConsoleEntry("output", resolveOutputTemplate(node.value));
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
        const startValue = evaluateRuntimeExpression(config.start ?? "");
        const endValue = evaluateRuntimeExpression(config.end ?? "");
        const stepValue = evaluateRuntimeExpression(config.step ?? "");
        const numericStep = Number(stepValue);

        if (!variableName) {
          throw new Error("Nodo For incompleto: manca la variabile di controllo.");
        }

        if (!Number.isFinite(numericStep) || numericStep === 0) {
          throw new Error("Configurazione For non valida: il passo deve essere un numero diverso da zero.");
        }

        setRuntimeVariableValue(variableName, startValue);

        while (
          numericStep > 0
            ? Number(runtimeState.variableValues.get(variableName)) < Number(endValue)
            : Number(runtimeState.variableValues.get(variableName)) > Number(endValue)
        ) {
          await executeRuntimeNodes(node.branches?.body ?? []);

          if (runtimeState.cancelled) {
            throw new Error("__execution_cancelled__");
          }

          const nextValue = Number(runtimeState.variableValues.get(variableName)) + numericStep;
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

    renderFlowchart();
    refreshExecutionUi();
  }
};

const startProgramExecution = async (mode) => {
  if (isProgramRunning) {
    if (mode === "step" && executionMode === "step") {
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
  refreshExecutionUi();

  try {
    await executeRuntimeNodes(flowNodes);

    if (runtimeState?.cancelled) {
      finalizeExecutionSession("Esecuzione interrotta");
      return;
    }

    finalizeExecutionSession("Esecuzione completata");
  } catch (error) {
    if (error instanceof Error && error.message === "__execution_cancelled__") {
      finalizeExecutionSession("Esecuzione interrotta");
      return;
    }

    const message = error instanceof Error ? error.message : "Errore durante l'esecuzione.";

    if (runtimeState) {
      addConsoleEntry("error", message);
    }

    finalizeExecutionSession(message, { keepCursor: true });
  }
};

const renderVariablesPanel = () => {
  if (!variablesBody) {
    return;
  }

  const variables = runtimeState?.variableMeta ?? collectRuntimeVariableMeta();

  if (variables.size === 0) {
    variablesBody.innerHTML = `
      <div class="table-row muted">
        <span>Nessuna variabile</span>
        <span>-</span>
        <span>-</span>
      </div>
    `;
    return;
  }

  variablesBody.innerHTML = Array.from(variables.values())
    .map(
      (variable) => {
        const runtimeValue = runtimeState?.variableValues.get(variable.name);

        return `
        <div class="table-row">
          <span>${escapeHtml(variable.name)}</span>
          <span>${escapeHtml(variable.typeLabel)}</span>
          <span>${escapeHtml(runtimeState ? formatRuntimeValue(runtimeValue) : "")}</span>
        </div>
      `;
      }
    )
    .join("");
};

const getNodeDisplayText = (node) => {
  const prefix = getNodeLabelPrefix(node);

  if (node.type === "declare" && node.declareConfig) {
    const typeLabel = node.declareConfig.isArray ? `${node.declareConfig.dataType}[]` : node.declareConfig.dataType;
    return `${prefix}${typeLabel} ${node.declareConfig.names.join(", ")}`.trim();
  }

  if (node.type === "for" && node.forConfig) {
    const { variable, start, end, step } = node.forConfig;
    return `${prefix}${variable} = ${start} to < ${end} step ${step}`.replace(/\s+/g, " ").trim();
  }

  if (node.value && node.value.trim()) {
    if (node.type === "comment") {
      return showNodeTypeInLabel ? `${prefix}${node.value.trim()}` : `// ${node.value.trim()}`;
    }

    return `${prefix}${node.value.trim()}`.trim();
  }

  return "";
};

const getNodeMarkup = (node) => {
  const displayText = getNodeDisplayText(node);
  const declaredNames = getDeclaredVariableNameSet();
  const prefixMarkup = getNodeLabelPrefixMarkup(node);

  if (!displayText) {
    return '<span aria-hidden="true">&nbsp;</span>';
  }

  if (node.type === "assign" && node.value) {
    const parsedAssignment = parseAssignmentStatement(node.value);

    if (parsedAssignment) {
      const { variableName, operator, expression } = parsedAssignment;
      const variableMarkup = declaredNames.has(variableName)
        ? escapeHtml(variableName)
        : `<span class="invalid-variable">${escapeHtml(variableName)}</span>`;

      return `${prefixMarkup}${variableMarkup} ${escapeHtml(operator)} ${highlightUndeclaredVariablesInText(expression, declaredNames)}`;
    }
  }

  if (node.type === "input" && node.value) {
    const variableName = node.value.trim();

    if (variableName && !declaredNames.has(variableName)) {
      return `${prefixMarkup}<span class="invalid-variable">${escapeHtml(variableName)}</span>`;
    }

    return `${prefixMarkup}${escapeHtml(variableName)}`;
  }

  if (node.type === "output" && node.value) {
    return `${prefixMarkup}${highlightOutputTemplateText(node.value, declaredNames)}`;
  }

  if ((node.type === "if" || node.type === "while" || node.type === "do") && node.value) {
    return `${prefixMarkup}${highlightUndeclaredVariablesInText(node.value, declaredNames)}`;
  }

  if (node.type === "for" && node.value) {
    return `${prefixMarkup}${highlightUndeclaredVariablesInText(node.value, declaredNames)}`;
  }

  return escapeHtml(displayText);
};

const encodeInsertTarget = (path, index) => encodeURIComponent(JSON.stringify({ path, index }));

const createConnectorMarkup = (path, index, className = "", label = "") => `
  <button
    type="button"
    class="${`flowchart-connector ${className}`.trim()}"
    data-insert-target="${encodeInsertTarget(path, index)}"
    aria-label="Aggiungi un nodo"
  >
    ${label ? `<span class="connector-label">${escapeHtml(label)}</span>` : ""}
    <span class="connector-line"></span>
    <span class="connector-arrow"></span>
  </button>
`;

const renderSequence = (nodes, path, options = {}) => {
  const {
    className = "",
    connectorClassName = "",
    leadingConnector = true,
    trailingConnector = true,
  } = options;

  const parts = [`<div class="${`flow-sequence ${className}`.trim()}">`];

  if (leadingConnector) {
    parts.push(createConnectorMarkup(path, 0, connectorClassName));
  }

  nodes.forEach((node, index) => {
    parts.push(renderNodeMarkup(node, path));

    if (trailingConnector || index < nodes.length - 1) {
      parts.push(createConnectorMarkup(path, index + 1, connectorClassName));
    }
  });

  if (nodes.length === 0 && !leadingConnector && trailingConnector) {
    parts.push(createConnectorMarkup(path, 0, connectorClassName));
  }

  parts.push("</div>");
  return parts.join("");
};

const createMergeMarkup = () => '<div class="flow-merge-node" aria-hidden="true"></div>';

const renderIfStructure = (node, path) => {
  const falsePath = [...path, { nodeId: node.id, branchKey: "falseBranch" }];
  const truePath = [...path, { nodeId: node.id, branchKey: "trueBranch" }];
  const falseBranchNodes = node.branches?.falseBranch ?? [];
  const trueBranchNodes = node.branches?.trueBranch ?? [];

  return `
    <div class="flow-structure flow-structure-if">
      ${createNodeMarkup(node)}
      <div class="if-reset-placeholder" aria-hidden="true">
        <div class="if-reset-labels">
          <span class="branch-label">False</span>
          <span class="branch-label">True</span>
        </div>
        <div class="if-reset-branches">
          <div class="if-reset-branch">
            ${renderSequence(falseBranchNodes, falsePath, { className: "if-reset-sequence" })}
          </div>
          <div class="if-reset-branch">
            ${renderSequence(trueBranchNodes, truePath, { className: "if-reset-sequence" })}
          </div>
        </div>
        ${createMergeMarkup()}
      </div>
    </div>
  `;
};

const renderLoopStructure = (node, path) => {
  const bodyPath = [...path, { nodeId: node.id, branchKey: "body" }];
  const bodyNodes = node.branches?.body ?? [];
  const labels = structuredNodeBranchLabels[node.type];

  return `
    <div class="flow-structure flow-structure-loop flow-structure-loop-${node.type}">
      <div class="loop-node-row">
        <span class="loop-exit-label">${escapeHtml(labels.exit)}</span>
        ${createNodeMarkup(node)}
        <span class="loop-entry-label">${escapeHtml(labels.body)}</span>
      </div>
      <div class="loop-body-layout">
        <div class="loop-main-rail"></div>
        <div class="loop-branch-shell">
          ${renderSequence(bodyNodes, bodyPath, { className: "branch-sequence loop-branch-sequence" })}
        </div>
      </div>
      ${node.type !== "do" ? createMergeMarkup() : ""}
    </div>
  `;
};

const renderDoStructure = (node, path) => {
  const bodyPath = [...path, { nodeId: node.id, branchKey: "body" }];
  const bodyNodes = node.branches?.body ?? [];
  const labels = structuredNodeBranchLabels.do;

  return `
    <div class="flow-structure flow-structure-do">
      <div class="do-body-layout">
        <div class="do-main-rail"></div>
        <div class="do-branch-shell">
          ${renderSequence(bodyNodes, bodyPath, { className: "branch-sequence loop-branch-sequence" })}
        </div>
      </div>
      <div class="loop-node-row loop-node-row-do">
        <span class="loop-entry-label">${escapeHtml(labels.body)}</span>
        ${createNodeMarkup(node)}
        <span class="loop-exit-label">${escapeHtml(labels.exit)}</span>
      </div>
    </div>
  `;
};

const renderNodeMarkup = (node, path) => {
  switch (node.type) {
    case "if":
      return renderIfStructure(node, path);
    case "while":
    case "for":
      return renderLoopStructure(node, path);
    case "do":
      return renderDoStructure(node, path);
    default:
      return createNodeMarkup(node);
  }
};

const createNodeMarkup = (node) => {
  const definition = getNodeDefinition(node.type);
  const displayText = getNodeDisplayText(node) || definition.label;

  return `
    <button
      type="button"
      class="flowchart-node ${definition.shapeClass}${node.isDraft ? " is-pending" : ""}${selectedNodeIds.has(node.id) ? " is-selected" : ""}${executionCursor === node.id ? " is-executing" : ""}"
      data-node-id="${node.id}"
      aria-label="Modifica ${escapeHtml(displayText)}"
    >
      ${getNodeMarkup(node)}
    </button>
  `;
};

const SVG_CANVAS_MIN_WIDTH = 1040;
const SVG_TOP_PADDING = 48;
const SVG_BOTTOM_PADDING = 48;
const SVG_CONNECTOR_HEIGHT = 48;
const SVG_TERMINAL_WIDTH = 170;
const SVG_TERMINAL_HEIGHT = 64;
const SVG_BRANCH_OFFSET_X = 280;
const SVG_IF_LABEL_OFFSET_X = 28;
const SVG_BRANCH_LABEL_OFFSET_Y = 10;
const SVG_BRANCH_MIN_HEIGHT = 88;
const SVG_MERGE_RADIUS = 14;
const SVG_NESTED_BRANCH_OFFSET_X = 220;
const SVG_IF_BRANCH_ENTRY_HEIGHT = 36;
const SVG_IF_BRANCH_EXIT_GAP = 20;
const SVG_LOOP_BRANCH_OFFSET_X = 250;
const SVG_LOOP_NESTED_BRANCH_OFFSET_X = 205;
const SVG_LOOP_BRANCH_ENTRY_HEIGHT = 34;
const SVG_LOOP_BRANCH_EXIT_GAP = 18;
const SVG_LOOP_BRANCH_MIN_HEIGHT = 84;
const SVG_WHILE_RETURN_OFFSET_X = 30;
const SVG_WHILE_RETURN_DESCENT = 18;
const SVG_WHILE_FALSE_LABEL_OFFSET_X = 18;
const SVG_WHILE_FALSE_LABEL_OFFSET_Y = 22;
const SVG_DO_BODY_ENTRY_HEIGHT = 24;
const SVG_DO_CONDITION_GAP = 34;
const SVG_DO_LOOP_OFFSET_X = 220;
const SVG_DO_EXIT_GAP = 20;

const SVG_NODE_TEXT_CHAR_WIDTH = 8.6;
const SVG_NODE_LINE_HEIGHT = 22;
const SVG_NODE_HORIZONTAL_PADDING = 34;
const SVG_NODE_VERTICAL_PADDING = 24;

const SVG_NODE_SIZE_PRESETS = {
  if: { minWidth: 220, maxWidth: 400, minHeight: 108 },
  while: { minWidth: 210, maxWidth: 380, minHeight: 74 },
  for: { minWidth: 210, maxWidth: 380, minHeight: 74 },
  do: { minWidth: 210, maxWidth: 380, minHeight: 74 },
  comment: { minWidth: 190, maxWidth: 360, minHeight: 62 },
  default: { minWidth: 180, maxWidth: 360, minHeight: 58 },
};

const getSvgLabelInsets = (type, width, height) => {
  switch (type) {
    case "if":
      return {
        x: Math.round(width * 0.15),
        y: 12,
        width: Math.round(width * 0.7),
        height: Math.max(height - 24, 24),
      };
    case "while":
    case "for":
    case "do":
      return {
        x: Math.round(width * 0.13),
        y: 10,
        width: Math.round(width * 0.74),
        height: Math.max(height - 20, 24),
      };
    case "input":
    case "output":
      return {
        x: Math.round(width * 0.11),
        y: 8,
        width: Math.round(width * 0.78),
        height: Math.max(height - 16, 24),
      };
    default:
      return {
        x: 8,
        y: 6,
        width: Math.max(width - 16, 24),
        height: Math.max(height - 12, 24),
      };
  }
};

const estimateWrappedLineCount = (text, charsPerLine) => {
  if (!text) {
    return 1;
  }

  const paragraphs = text.split(/\n+/);
  let lineCount = 0;

  paragraphs.forEach((paragraph) => {
    const words = paragraph.trim().split(/\s+/).filter(Boolean);

    if (words.length === 0) {
      lineCount += 1;
      return;
    }

    let currentLineLength = 0;

    words.forEach((word) => {
      const wordLength = word.length;

      if (wordLength > charsPerLine) {
        if (currentLineLength > 0) {
          lineCount += 1;
          currentLineLength = 0;
        }

        lineCount += Math.ceil(wordLength / charsPerLine);
        currentLineLength = wordLength % charsPerLine;

        if (currentLineLength === 0) {
          currentLineLength = 0;
        }

        return;
      }

      const separatorLength = currentLineLength > 0 ? 1 : 0;

      if (currentLineLength + separatorLength + wordLength > charsPerLine) {
        lineCount += 1;
        currentLineLength = wordLength;
        return;
      }

      currentLineLength += separatorLength + wordLength;
    });

    if (currentLineLength > 0) {
      lineCount += 1;
    }
  });

  return Math.max(lineCount, 1);
};

const getSvgNodeSize = (nodeOrType) => {
  const type = typeof nodeOrType === "string" ? nodeOrType : nodeOrType.type;
  const preset = SVG_NODE_SIZE_PRESETS[type] ?? SVG_NODE_SIZE_PRESETS.default;
  const displayText =
    typeof nodeOrType === "string"
      ? getNodeDefinition(type)?.label ?? ""
      : (getNodeDisplayText(nodeOrType) || getNodeDefinition(type)?.label || "");
  const normalizedText = displayText.replace(/\s+/g, " ").trim();
  const estimatedTextWidth = Math.max(
    preset.minWidth,
    Math.ceil(normalizedText.length * SVG_NODE_TEXT_CHAR_WIDTH + SVG_NODE_HORIZONTAL_PADDING)
  );
  const width = Math.min(preset.maxWidth, estimatedTextWidth);
  const charsPerLine = Math.max(
    10,
    Math.floor((width - SVG_NODE_HORIZONTAL_PADDING) / SVG_NODE_TEXT_CHAR_WIDTH)
  );
  const lineCount = estimateWrappedLineCount(normalizedText, charsPerLine);
  const contentHeight = lineCount * SVG_NODE_LINE_HEIGHT + SVG_NODE_VERTICAL_PADDING;

  return {
    width,
    height: Math.max(preset.minHeight, contentHeight),
  };
};

const getAdaptiveConnectorHeight = (nodeOrType) => {
  const type = typeof nodeOrType === "string" ? nodeOrType : nodeOrType.type;
  const preset = SVG_NODE_SIZE_PRESETS[type] ?? SVG_NODE_SIZE_PRESETS.default;
  const { height } = getSvgNodeSize(nodeOrType);
  const extraHeight = Math.max(0, height - preset.minHeight);

  return SVG_CONNECTOR_HEIGHT + Math.ceil(extraHeight * 0.45);
};

const getAdaptiveBranchEntryHeight = (nodeOrType, baseHeight) => {
  const type = typeof nodeOrType === "string" ? nodeOrType : nodeOrType.type;
  const preset = SVG_NODE_SIZE_PRESETS[type] ?? SVG_NODE_SIZE_PRESETS.default;
  const { height } = getSvgNodeSize(nodeOrType);
  const extraHeight = Math.max(0, height - preset.minHeight);

  return baseHeight + Math.ceil(extraHeight * 0.45);
};

const getSvgShapeMarkup = (node, width, height) => {
  const typeClass = `svg-node-shape-${node.type}`;

  if (node.type === "input" || node.type === "output") {
    return `<polygon class="svg-node-shape ${typeClass}" points="${width * 0.14},0 ${width},0 ${width * 0.86},${height} 0,${height}"></polygon>`;
  }

  if (node.type === "if" || node.type === "while" || node.type === "for" || node.type === "do") {
    return `<polygon class="svg-node-shape ${typeClass}" points="${width * 0.14},0 ${width * 0.86},0 ${width},${height / 2} ${width * 0.86},${height} ${width * 0.14},${height} 0,${height / 2}"></polygon>`;
  }

  return `<rect class="svg-node-shape ${typeClass}" x="0" y="0" width="${width}" height="${height}" rx="${node.type === "comment" ? 8 : 0}" ry="${node.type === "comment" ? 8 : 0}"></rect>`;
};

const renderSvgNode = (node, x, y) => {
  const definition = getNodeDefinition(node.type);
  const { width, height } = getSvgNodeSize(node);
  const labelBox = getSvgLabelInsets(node.type, width, height);
  const labelMarkup = getNodeMarkup(node);
  const classes = [
    "svg-node",
    `svg-node-${node.type}`,
    node.isDraft ? "is-pending" : "",
    selectedNodeIds.has(node.id) ? "is-selected" : "",
    executionCursor === node.id ? "is-executing" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return `
    <g class="${classes}" data-node-id="${node.id}" transform="translate(${x}, ${y})">
      ${getSvgShapeMarkup(node, width, height)}
      <foreignObject x="${labelBox.x}" y="${labelBox.y}" width="${labelBox.width}" height="${labelBox.height}" pointer-events="none">
        <div xmlns="http://www.w3.org/1999/xhtml" class="svg-node-label svg-node-label-${node.type}">
          <div class="svg-node-label-inner">${labelMarkup}</div>
        </div>
      </foreignObject>
      <rect class="svg-node-hit" x="-10" y="-10" width="${width + 20}" height="${height + 20}" rx="12" ry="12"></rect>
    </g>
  `;
};

const renderSvgTerminal = (label, x, y) => `
  <g class="svg-terminal-node" transform="translate(${x}, ${y})">
    <rect class="svg-terminal-shape" x="0" y="0" width="${SVG_TERMINAL_WIDTH}" height="${SVG_TERMINAL_HEIGHT}" rx="32" ry="32"></rect>
    <foreignObject x="0" y="0" width="${SVG_TERMINAL_WIDTH}" height="${SVG_TERMINAL_HEIGHT}" pointer-events="none">
      <div xmlns="http://www.w3.org/1999/xhtml" class="svg-terminal-label">${escapeHtml(label)}</div>
    </foreignObject>
  </g>
`;

const renderSvgConnector = (x, yTop, height, target) => {
  const arrowY = yTop + height;
  return `
    <g class="svg-connector" data-insert-target="${encodeInsertTarget(target.path, target.index)}">
      <line class="svg-connector-line" x1="${x}" y1="${yTop}" x2="${x}" y2="${arrowY - 12}"></line>
      <path class="svg-connector-arrow" d="M ${x - 8} ${arrowY - 12} L ${x + 8} ${arrowY - 12} L ${x} ${arrowY} Z"></path>
      <rect class="svg-connector-hit" x="${x - 18}" y="${yTop}" width="36" height="${height}" rx="10" ry="10"></rect>
    </g>
  `;
};

const renderSvgArrowHead = (x, y, direction) => {
  switch (direction) {
    case "down":
      return `<path class="svg-connector-arrow" d="M ${x - 8} ${y - 12} L ${x + 8} ${y - 12} L ${x} ${y} Z"></path>`;
    case "up":
      return `<path class="svg-connector-arrow" d="M ${x - 8} ${y + 12} L ${x + 8} ${y + 12} L ${x} ${y} Z"></path>`;
    case "left":
      return `<path class="svg-connector-arrow" d="M ${x + 12} ${y - 8} L ${x + 12} ${y + 8} L ${x} ${y} Z"></path>`;
    case "right":
      return `<path class="svg-connector-arrow" d="M ${x - 12} ${y - 8} L ${x - 12} ${y + 8} L ${x} ${y} Z"></path>`;
    default:
      return "";
  }
};

const renderSvgTextLabel = (text, x, y, anchor = "middle") => `
  <text class="svg-branch-label" x="${x}" y="${y}" text-anchor="${anchor}">${escapeHtml(text)}</text>
`;

const measureSequenceHalfSpan = (nodes, depth = 0) => {
  if (!nodes.length) {
    return 0;
  }

  return nodes.reduce((maxSpan, childNode) => Math.max(maxSpan, measureNodeHalfSpan(childNode, depth)), 0);
};

const getBranchOffsetX = (node, depth = 0) => {
  const baseOffset = depth === 0 ? SVG_BRANCH_OFFSET_X : SVG_NESTED_BRANCH_OFFSET_X;

  if (node.type !== "if") {
    return baseOffset;
  }

  const falseSpan = measureSequenceHalfSpan(node.branches?.falseBranch ?? [], depth + 1);
  const trueSpan = measureSequenceHalfSpan(node.branches?.trueBranch ?? [], depth + 1);
  const { width } = getSvgNodeSize(node);

  return Math.max(
    baseOffset,
    Math.ceil(width / 2) + 56,
    falseSpan + 64,
    trueSpan + 64
  );
};

const getLoopBranchOffsetX = (node, depth = 0) => {
  const baseOffset = depth === 0 ? SVG_LOOP_BRANCH_OFFSET_X : SVG_LOOP_NESTED_BRANCH_OFFSET_X;
  const bodySpan = measureSequenceHalfSpan(node.branches?.body ?? [], depth + 1);
  const { width } = getSvgNodeSize(node);

  return Math.max(
    baseOffset,
    Math.ceil(width / 2) + 52,
    bodySpan + 64
  );
};

const measureNodeHalfSpan = (node, depth = 0) => {
  const { width } = getSvgNodeSize(node);

  if (node.type === "if") {
    const branchOffset = getBranchOffsetX(node, depth);
    const falseSpan = measureSequenceHalfSpan(node.branches?.falseBranch ?? [], depth + 1);
    const trueSpan = measureSequenceHalfSpan(node.branches?.trueBranch ?? [], depth + 1);

    return Math.max(
      width / 2,
      branchOffset + falseSpan,
      branchOffset + trueSpan
    );
  }

  if (node.type === "while") {
    const branchOffset = getLoopBranchOffsetX(node, depth);
    const bodySpan = measureSequenceHalfSpan(node.branches?.body ?? [], depth + 1);

    return Math.max(width / 2, branchOffset + bodySpan);
  }

  if (node.type === "for") {
    const branchOffset = getLoopBranchOffsetX(node, depth);
    const bodySpan = measureSequenceHalfSpan(node.branches?.body ?? [], depth + 1);

    return Math.max(width / 2, branchOffset + bodySpan);
  }

  if (node.type === "do") {
    return Math.max(width / 2, SVG_DO_LOOP_OFFSET_X + 32);
  }

  return width / 2;
};

const renderSvgNodeBlockAt = (node, y, path, centerX) => {
  if (node.type === "if") {
    return renderSvgIfNodeBlock(node, y, path, centerX);
  }

  if (node.type === "while" || node.type === "for") {
    return renderSvgWhileNodeBlock(node, y, path, centerX);
  }

  if (node.type === "do") {
    return renderSvgDoNodeBlock(node, y, path, centerX);
  }

  const { width, height } = getSvgNodeSize(node);

  return {
    markup: renderSvgNode(node, centerX - width / 2, y),
    bottomY: y + height,
  };
};

const renderSvgIfBranchNodes = (nodes, branchX, startY, path) => {
  let markup = "";
  let currentY = startY;
  let skipLeadingConnector = false;

  nodes.forEach((childNode, index) => {
    if (!skipLeadingConnector && index > 0) {
      const connectorHeight = getAdaptiveConnectorHeight(childNode);
      markup += renderSvgConnector(branchX, currentY, connectorHeight, { path, index });
      currentY += connectorHeight;
    }

    const renderedNode = renderSvgNodeBlockAt(childNode, currentY, path, branchX);
    markup += renderedNode.markup;
    currentY = renderedNode.bottomY;
    skipLeadingConnector = Boolean(renderedNode.skipLeadingConnectorForNext);
  });

  return {
    markup,
    bottomY: currentY,
  };
};

const renderSvgWhileNodeBlock = (node, y, path, centerX) => {
  const { width, height } = getSvgNodeSize(node);
  const nodeX = centerX - width / 2;
  const rightEdgeX = nodeX + width;
  const topY = y;
  const bottomY = y + height;
  const sideY = y + height / 2;
  const branchOffsetX = getLoopBranchOffsetX(node, path.length);
  const bodyX = centerX + branchOffsetX;
  const returnX = centerX + SVG_WHILE_RETURN_OFFSET_X;
  const labels = structuredNodeBranchLabels[node.type];
  const bodyPath = [...path, { nodeId: node.id, branchKey: "body" }];
  const bodyNodes = node.branches?.body ?? [];
  const nodeLocation = findNodeLocationById(node.id);
  const falseExitTarget = nodeLocation
    ? { path: nodeLocation.path, index: nodeLocation.index + 1 }
    : { path, index: 0 };
  const branchEntryHeight = getAdaptiveBranchEntryHeight(node, SVG_LOOP_BRANCH_ENTRY_HEIGHT);
  const branchEntryY = sideY + branchEntryHeight;
  const bodyBranch = renderSvgIfBranchNodes(bodyNodes, bodyX, branchEntryY, bodyPath);
  const loopFloorY = Math.max(
    bodyBranch.bottomY + SVG_LOOP_BRANCH_EXIT_GAP,
    branchEntryY + SVG_LOOP_BRANCH_MIN_HEIGHT
  );
  const bodyReturnY = bodyNodes.length > 0 ? bodyBranch.bottomY : loopFloorY;
  const falseConnectorHeight = getAdaptiveConnectorHeight(node);
  const falseExitBottomY = Math.max(bottomY + SVG_LOOP_BRANCH_EXIT_GAP, loopFloorY);
  const returnDropY = Math.max(bodyReturnY + SVG_WHILE_RETURN_DESCENT, bottomY + 12);

  const bodyEntryPath = `M ${rightEdgeX} ${sideY} H ${bodyX} V ${branchEntryY - 12}`;
  const emptyBodyOuterHitPath = `M ${rightEdgeX} ${sideY} H ${bodyX} V ${loopFloorY} H ${returnX} V ${bottomY}`;
  const returnOuterHitPath = `M ${bodyX} ${bodyReturnY} V ${returnDropY} H ${returnX} V ${bottomY}`;

  const markup = `
    ${renderSvgTextLabel(labels.body, rightEdgeX + SVG_IF_LABEL_OFFSET_X, sideY - SVG_BRANCH_LABEL_OFFSET_Y, "start")}
    ${renderSvgTextLabel(labels.exit, centerX - SVG_WHILE_FALSE_LABEL_OFFSET_X, bottomY + SVG_WHILE_FALSE_LABEL_OFFSET_Y, "end")}
    ${renderSvgNode(node, nodeX, y)}
    <g class="svg-connector" data-insert-target="${encodeInsertTarget(bodyPath, 0)}">
      ${bodyNodes.length === 0
        ? `<line class="svg-connector-line" x1="${rightEdgeX}" y1="${sideY}" x2="${bodyX}" y2="${sideY}"></line>
           <line class="svg-connector-line" x1="${bodyX}" y1="${sideY}" x2="${bodyX}" y2="${loopFloorY}"></line>
           <line class="svg-connector-line" x1="${bodyX}" y1="${loopFloorY}" x2="${returnX}" y2="${loopFloorY}"></line>
           <line class="svg-connector-line" x1="${returnX}" y1="${loopFloorY}" x2="${returnX}" y2="${bottomY + 12}"></line>
           ${renderSvgArrowHead(returnX, bottomY, "up")}
           <path class="svg-connector-hit-path" d="${emptyBodyOuterHitPath}"></path>`
        : `<path class="svg-if-line" d="${bodyEntryPath}"></path>
           ${renderSvgArrowHead(bodyX, branchEntryY, "down")}
           <path class="svg-connector-hit-path" d="M ${rightEdgeX} ${sideY} H ${bodyX} V ${branchEntryY}"></path>`}
    </g>
    ${bodyBranch.markup}
    ${bodyNodes.length > 0 ? `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(bodyPath, bodyNodes.length)}">
        <line class="svg-connector-line" x1="${bodyX}" y1="${bodyReturnY}" x2="${bodyX}" y2="${returnDropY}"></line>
        <line class="svg-connector-line" x1="${bodyX}" y1="${returnDropY}" x2="${returnX}" y2="${returnDropY}"></line>
        <line class="svg-connector-line" x1="${returnX}" y1="${returnDropY}" x2="${returnX}" y2="${bottomY + 12}"></line>
        ${renderSvgArrowHead(returnX, bottomY, "up")}
        <path class="svg-connector-hit-path" d="${returnOuterHitPath}"></path>
      </g>
    ` : ""}
    ${renderSvgConnector(
      centerX,
      bottomY,
      falseExitBottomY + falseConnectorHeight - bottomY,
      falseExitTarget
    )}
  `;

  return {
    markup,
    bottomY: falseExitBottomY + falseConnectorHeight,
    skipLeadingConnectorForNext: true,
  };
};

const renderSvgDoNodeBlock = (node, y, path, centerX) => {
  const bodyPath = [...path, { nodeId: node.id, branchKey: "body" }];
  const bodyNodes = node.branches?.body ?? [];
  const nodeLocation = findNodeLocationById(node.id);
  const falseExitTarget = nodeLocation
    ? { path: nodeLocation.path, index: nodeLocation.index + 1 }
    : { path, index: 0 };
  const { width, height } = getSvgNodeSize(node);
  const circleY = y + SVG_MERGE_RADIUS;
  const circleRightX = centerX + SVG_MERGE_RADIUS;
  const circleBottomY = circleY + SVG_MERGE_RADIUS;
  const bodyX = centerX + SVG_DO_LOOP_OFFSET_X;
  const bodyEntryHeight = getAdaptiveBranchEntryHeight(node, SVG_DO_BODY_ENTRY_HEIGHT);
  const bodyEntryY = circleY + bodyEntryHeight;
  const bodyBranch = renderSvgIfBranchNodes(bodyNodes, bodyX, bodyEntryY, bodyPath);
  const bodyBottomY = bodyNodes.length > 0 ? bodyBranch.bottomY : bodyEntryY;
  const doNodeY = Math.max(bodyBottomY + SVG_DO_CONDITION_GAP, circleBottomY + SVG_DO_CONDITION_GAP);
  const nodeX = centerX - width / 2;
  const rightEdgeX = nodeX + width;
  const topY = doNodeY;
  const bottomY = doNodeY + height;
  const sideY = doNodeY + height / 2;
  const labels = structuredNodeBranchLabels.do;
  const returnToNodeY = Math.max(bodyBottomY + SVG_DO_EXIT_GAP, sideY);
  const falseConnectorHeight = getAdaptiveConnectorHeight(node);
  const falseExitBottomY = Math.max(bottomY + SVG_DO_EXIT_GAP, returnToNodeY);
  const emptyBodyLoopHitPath = `M ${circleRightX} ${circleY} H ${bodyX} V ${returnToNodeY} H ${rightEdgeX}`;
  const bodyLoopHitPath = `M ${bodyX} ${bodyBottomY} V ${returnToNodeY} H ${rightEdgeX}`;

  const markup = `
    <circle class="svg-merge-node" cx="${centerX}" cy="${circleY}" r="${SVG_MERGE_RADIUS}"></circle>
    <line class="svg-connector-line" x1="${centerX}" y1="${circleBottomY + 12}" x2="${centerX}" y2="${topY}"></line>
    ${renderSvgArrowHead(centerX, circleBottomY, "up")}
    <g class="svg-connector" data-insert-target="${encodeInsertTarget(bodyPath, 0)}">
      ${bodyNodes.length === 0
        ? `<line class="svg-connector-line" x1="${circleRightX}" y1="${circleY}" x2="${bodyX}" y2="${circleY}"></line>
           <line class="svg-connector-line" x1="${bodyX}" y1="${circleY}" x2="${bodyX}" y2="${returnToNodeY}"></line>
           <line class="svg-connector-line" x1="${bodyX}" y1="${returnToNodeY}" x2="${rightEdgeX + 12}" y2="${returnToNodeY}"></line>
           ${renderSvgArrowHead(rightEdgeX, returnToNodeY, "left")}
           <path class="svg-connector-hit-path" d="${emptyBodyLoopHitPath}"></path>`
        : `<line class="svg-connector-line" x1="${circleRightX}" y1="${circleY}" x2="${bodyX}" y2="${circleY}"></line>
           <line class="svg-connector-line" x1="${bodyX}" y1="${circleY}" x2="${bodyX}" y2="${bodyEntryY - 12}"></line>
           ${renderSvgArrowHead(bodyX, bodyEntryY, "down")}
           <path class="svg-connector-hit-path" d="M ${circleRightX} ${circleY} H ${bodyX} V ${bodyEntryY}"></path>`}
    </g>
    ${bodyBranch.markup}
    ${bodyNodes.length > 0 ? `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(bodyPath, bodyNodes.length)}">
        <line class="svg-connector-line" x1="${bodyX}" y1="${bodyBottomY}" x2="${bodyX}" y2="${returnToNodeY}"></line>
        <line class="svg-connector-line" x1="${bodyX}" y1="${returnToNodeY}" x2="${rightEdgeX + 12}" y2="${returnToNodeY}"></line>
        ${renderSvgArrowHead(rightEdgeX, returnToNodeY, "left")}
        <path class="svg-connector-hit-path" d="${bodyLoopHitPath}"></path>
      </g>
    ` : ""}
    ${renderSvgTextLabel(labels.body, centerX - SVG_IF_LABEL_OFFSET_X, doNodeY - SVG_DO_CONDITION_GAP / 2, "end")}
    ${renderSvgTextLabel(labels.exit, centerX - SVG_WHILE_FALSE_LABEL_OFFSET_X, bottomY + SVG_WHILE_FALSE_LABEL_OFFSET_Y, "end")}
    ${renderSvgNode(node, nodeX, doNodeY)}
    ${renderSvgConnector(
      centerX,
      bottomY,
      falseExitBottomY + falseConnectorHeight - bottomY,
      falseExitTarget
    )}
  `;

  return {
    markup,
    bottomY: falseExitBottomY + falseConnectorHeight,
    skipLeadingConnectorForNext: true,
  };
};

const renderSvgIfNodeBlock = (node, y, path, centerX) => {
  const { width, height } = getSvgNodeSize(node);
  const nodeX = centerX - width / 2;
  const branchOffsetX = getBranchOffsetX(node, path.length);
  const falseBranchX = centerX - branchOffsetX;
  const trueBranchX = centerX + branchOffsetX;
  const sideY = y + height / 2;
  const leftEdgeX = nodeX;
  const rightEdgeX = nodeX + width;
  const falsePath = [...path, { nodeId: node.id, branchKey: "falseBranch" }];
  const truePath = [...path, { nodeId: node.id, branchKey: "trueBranch" }];
  const falseBranchNodes = node.branches?.falseBranch ?? [];
  const trueBranchNodes = node.branches?.trueBranch ?? [];
  const branchEntryHeight = getAdaptiveBranchEntryHeight(node, SVG_IF_BRANCH_ENTRY_HEIGHT);
  const branchEntryY = sideY + branchEntryHeight;
  const falseBranch = renderSvgIfBranchNodes(falseBranchNodes, falseBranchX, branchEntryY, falsePath);
  const trueBranch = renderSvgIfBranchNodes(trueBranchNodes, trueBranchX, branchEntryY, truePath);
  const mergeCenterY =
    Math.max(
      falseBranch.bottomY + SVG_IF_BRANCH_EXIT_GAP,
      trueBranch.bottomY + SVG_IF_BRANCH_EXIT_GAP,
      branchEntryY + SVG_BRANCH_MIN_HEIGHT
    ) + SVG_MERGE_RADIUS;

  const falseBranchReturnY = falseBranchNodes.length > 0 ? falseBranch.bottomY : branchEntryY;
  const trueBranchReturnY = trueBranchNodes.length > 0 ? trueBranch.bottomY : branchEntryY;
  const falseEmptyBranchPath = `M ${leftEdgeX} ${sideY} H ${falseBranchX} V ${mergeCenterY} H ${centerX - SVG_MERGE_RADIUS - 10}`;
  const trueEmptyBranchPath = `M ${rightEdgeX} ${sideY} H ${trueBranchX} V ${mergeCenterY} H ${centerX + SVG_MERGE_RADIUS + 10}`;

  const markup = `
    ${renderSvgTextLabel("False", leftEdgeX - SVG_IF_LABEL_OFFSET_X, sideY - SVG_BRANCH_LABEL_OFFSET_Y, "end")}
    ${renderSvgTextLabel("True", rightEdgeX + SVG_IF_LABEL_OFFSET_X, sideY - SVG_BRANCH_LABEL_OFFSET_Y, "start")}
    ${renderSvgNode(node, nodeX, y)}
    ${falseBranchNodes.length === 0 ? `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(falsePath, 0)}">
        <path class="svg-if-line" d="${falseEmptyBranchPath}"></path>
        ${renderSvgArrowHead(centerX - SVG_MERGE_RADIUS, mergeCenterY, "right")}
        <path class="svg-connector-hit-path" d="${falseEmptyBranchPath}"></path>
      </g>
    ` : `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(falsePath, 0)}">
        <path class="svg-if-line" d="M ${leftEdgeX} ${sideY} H ${falseBranchX} V ${branchEntryY - 12}"></path>
        ${renderSvgArrowHead(falseBranchX, branchEntryY, "down")}
        <path class="svg-connector-hit-path" d="M ${leftEdgeX} ${sideY} H ${falseBranchX} V ${branchEntryY}"></path>
      </g>
    `}
    ${trueBranchNodes.length === 0 ? `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(truePath, 0)}">
        <path class="svg-if-line" d="${trueEmptyBranchPath}"></path>
        ${renderSvgArrowHead(centerX + SVG_MERGE_RADIUS, mergeCenterY, "left")}
        <path class="svg-connector-hit-path" d="${trueEmptyBranchPath}"></path>
      </g>
    ` : `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(truePath, 0)}">
        <path class="svg-if-line" d="M ${rightEdgeX} ${sideY} H ${trueBranchX} V ${branchEntryY - 12}"></path>
        ${renderSvgArrowHead(trueBranchX, branchEntryY, "down")}
        <path class="svg-connector-hit-path" d="M ${rightEdgeX} ${sideY} H ${trueBranchX} V ${branchEntryY}"></path>
      </g>
    `}
    ${falseBranch.markup}
    ${trueBranch.markup}
    ${falseBranchNodes.length > 0 ? `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(falsePath, falseBranchNodes.length)}">
        <path class="svg-if-line" d="M ${falseBranchX} ${falseBranchReturnY} V ${mergeCenterY} H ${centerX - SVG_MERGE_RADIUS - 10}"></path>
        ${renderSvgArrowHead(centerX - SVG_MERGE_RADIUS, mergeCenterY, "right")}
        <path class="svg-connector-hit-path" d="M ${falseBranchX} ${falseBranchReturnY} V ${mergeCenterY} H ${centerX - SVG_MERGE_RADIUS}"></path>
      </g>
    ` : ""}
    ${trueBranchNodes.length > 0 ? `
      <g class="svg-connector" data-insert-target="${encodeInsertTarget(truePath, trueBranchNodes.length)}">
        <path class="svg-if-line" d="M ${trueBranchX} ${trueBranchReturnY} V ${mergeCenterY} H ${centerX + SVG_MERGE_RADIUS + 10}"></path>
        ${renderSvgArrowHead(centerX + SVG_MERGE_RADIUS, mergeCenterY, "left")}
        <path class="svg-connector-hit-path" d="M ${trueBranchX} ${trueBranchReturnY} V ${mergeCenterY} H ${centerX + SVG_MERGE_RADIUS}"></path>
      </g>
    ` : ""}
    <circle class="svg-merge-node" cx="${centerX}" cy="${mergeCenterY}" r="${SVG_MERGE_RADIUS}"></circle>
  `;

  return {
    markup,
    bottomY: mergeCenterY + SVG_MERGE_RADIUS,
  };
};

const getSvgCanvasMetrics = () => {
  const maxHalfSpan = flowNodes.reduce((maxSpan, node) => Math.max(maxSpan, measureNodeHalfSpan(node, 0)), SVG_TERMINAL_WIDTH / 2);
  const horizontalPadding = 220;
  const width = Math.max(SVG_CANVAS_MIN_WIDTH, Math.ceil(maxHalfSpan * 2 + horizontalPadding * 2));

  return {
    width,
    centerX: width / 2,
  };
};

const renderSvgTopLevelNode = (node, y, path, centerX) => renderSvgNodeBlockAt(node, y, path, centerX);

const renderFlowchart = () => {
  const parts = [];
  const { width: canvasWidth, centerX } = getSvgCanvasMetrics();
  let currentY = SVG_TOP_PADDING;
  let skipLeadingConnector = false;
  const terminalX = centerX - SVG_TERMINAL_WIDTH / 2;

  parts.push(renderSvgTerminal("Start", terminalX, currentY));
  currentY += SVG_TERMINAL_HEIGHT;

  flowNodes.forEach((node, index) => {
    if (!skipLeadingConnector) {
      const connectorHeight = getAdaptiveConnectorHeight(node);
      parts.push(renderSvgConnector(centerX, currentY, connectorHeight, { path: [], index }));
      currentY += connectorHeight;
    }

    const renderedNode = renderSvgTopLevelNode(node, currentY, [], centerX);
    parts.push(renderedNode.markup);
    currentY = renderedNode.bottomY;
    skipLeadingConnector = Boolean(renderedNode.skipLeadingConnectorForNext);
  });

  if (!skipLeadingConnector) {
    const finalConnectorHeight = flowNodes.length > 0
      ? getAdaptiveConnectorHeight(flowNodes[flowNodes.length - 1])
      : SVG_CONNECTOR_HEIGHT;
    parts.push(renderSvgConnector(centerX, currentY, finalConnectorHeight, { path: [], index: flowNodes.length }));
    currentY += finalConnectorHeight;
  }

  parts.push(renderSvgTerminal("End", terminalX, currentY));
  currentY += SVG_TERMINAL_HEIGHT + SVG_BOTTOM_PADDING;

  flowchartRoot.innerHTML = `
    <svg
      class="diagram-svg"
      id="diagram-svg"
      viewBox="0 0 ${canvasWidth} ${currentY}"
      aria-label="Diagramma di flusso"
      preserveAspectRatio="xMidYMin meet"
    >
      ${parts.join("")}
    </svg>
  `;
  flowchartRoot.dataset.baseWidth = String(canvasWidth);

  applyDiagramZoom();

  refreshExecutionUi();
};

const openInsertDialog = (insertIndex, sourceButton) => {
  if (isProgramRunning) {
    return;
  }

  pendingInsertTarget = insertIndex;
  lastConnectorButton = sourceButton;
  hideInsertDialogNotice();
  insertDialogBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
};

const closeInsertDialog = () => {
  insertDialogBackdrop.hidden = true;
  pendingInsertTarget = null;
  hideInsertDialogNotice();

  if (!propertyDialogBackdrop.hidden) {
    return;
  }

  document.body.style.overflow = "";

  if (lastConnectorButton && typeof lastConnectorButton.focus === "function") {
    lastConnectorButton.focus();
  }
};

const openPropertyDialog = (nodeId) => {
  if (isProgramRunning) {
    return;
  }

  const node = findNodeById(nodeId);

  if (!node) {
    return;
  }

  const definition = getNodeDefinition(node.type);
  editingNodeId = nodeId;

  hidePropertyError();
  propertyDialogTitle.textContent = definition.dialogTitle;
  propertyDescription.textContent = definition.description;
  propertyFieldLabel.textContent = definition.fieldLabel;
  propertyInput.placeholder = definition.placeholder;
  propertyInput.value = node.value;
  propertyPreview.innerHTML = `<div class="flowchart-node ${definition.shapeClass}">${escapeHtml(definition.label)}</div>`;
  const isDeclare = node.type === "declare";
  const isAssign = node.type === "assign";
  const isFor = node.type === "for";
  const isOutput = node.type === "output";

  genericPropertyField.hidden = isDeclare || isFor;
  genericPropertyField.classList.toggle("is-output", isOutput);
  propertyInput.dataset.autosize = String(isOutput);
  declareFields.hidden = !isDeclare;
  forFields.hidden = !isFor;
  mountAssignSuggestions();
  syncPropertyInputSize();

  if (isAssign) {
    renderAssignSuggestions(propertyInput.value);
  } else if (isFor) {
    renderAssignSuggestions(forVariableInput.value);
  } else {
    hideAssignSuggestions();
  }

  if (isDeclare) {
    const declareConfig = node.declareConfig ?? {
      names: node.value
        ? node.value.split(",").map((name) => name.trim()).filter(Boolean)
        : [],
      dataType: "Integer",
      isArray: false,
    };

    declareNameInput.value = declareConfig.names.join(", ");
    declareArrayInput.checked = false;
    declareTypeInputs.forEach((input) => {
      input.checked = input.value === declareConfig.dataType;
    });
  }

  if (isFor) {
    const forConfig = node.forConfig ?? {
      variable: "",
      start: "",
      end: "",
      step: "",
    };

    forVariableInput.value = forConfig.variable;
    forStartInput.value = forConfig.start;
    forEndInput.value = forConfig.end;
    forStepInput.value = forConfig.step;
  }

  propertyDialogBackdrop.hidden = false;
  document.body.style.overflow = "hidden";

  requestAnimationFrame(() => {
    if (isDeclare) {
      declareNameInput.focus();
      declareNameInput.select();
    } else if (isFor) {
      forVariableInput.focus();
      forVariableInput.select();
    } else {
      propertyInput.focus();
      propertyInput.select();
    }
  });
};

const closePropertyDialog = ({ restoreFocus = true } = {}) => {
  propertyDialogBackdrop.hidden = true;

  if (!insertDialogBackdrop.hidden) {
    return;
  }

  document.body.style.overflow = "";

  if (restoreFocus && lastConnectorButton && typeof lastConnectorButton.focus === "function") {
    lastConnectorButton.focus();
  }
};

const removeDraftNode = () => {
  const location = findNodeLocationById(editingNodeId);

  if (location?.node?.isDraft) {
    location.container.splice(location.index, 1);
    renderFlowchart();
  }
};

const resetFlowchart = () => {
  cancelExecution();
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

const deleteSelectedNode = () => {
  if (isProgramRunning || selectedNodeIds.size === 0) {
    return;
  }

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
    const validationError = validateDeclareName(rawNames, node.id);

    if (validationError) {
      showPropertyError(validationError);
      declareNameInput.focus();
      declareNameInput.select();
      return;
    }

    const names = rawNames
      .split(",")
      .map((name) => name.trim())
      .filter(Boolean);

    node.declareConfig = {
      names,
      dataType,
      isArray: false,
    };
    node.value = names.join(", ");
  } else if (node.type === "for") {
    const variable = forVariableInput.value.trim();
    const start = forStartInput.value.trim();
    const end = forEndInput.value.trim();
    const step = forStepInput.value.trim();

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
    node.forConfig = { variable, start, end, step };
    node.value = `${variable} = ${start} to < ${end} step ${step}`.replace(/\s+/g, " ").trim();
  } else {
    hidePropertyError();
    node.value = propertyInput.value.trim();
  }

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
    };
  }

  if (type === "for") {
    newNode.forConfig = {
      variable: "",
      start: "",
      end: "",
      step: "",
    };
  }

  const targetContainer = getContainerByPath(pendingInsertTarget.path);
  targetContainer.splice(pendingInsertTarget.index, 0, newNode);
  clearRuntimeSnapshot();
  renderFlowchart();
  closeInsertDialog();
  openPropertyDialog(newNode.id);
};

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

if (insertDialogNoticeClose) {
  insertDialogNoticeClose.addEventListener("click", hideInsertDialogNotice);
}

if (declareArrayOption && declareArrayInput) {
  declareArrayOption.addEventListener("click", (event) => {
    event.preventDefault();
    declareArrayInput.checked = false;
    showPropertyError(NOT_YET_IMPLEMENTED_MESSAGE);
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
    const nextZoom = Math.min(
      MAX_DIAGRAM_ZOOM,
      Math.max(MIN_DIAGRAM_ZOOM, Number((diagramZoom + direction * DIAGRAM_ZOOM_STEP).toFixed(2)))
    );

    if (nextZoom === diagramZoom) {
      return;
    }

    diagramZoom = nextZoom;
    applyDiagramZoom();
  }, { passive: false });

  diagramCanvas.addEventListener("pointerdown", (event) => {
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
      event.preventDefault();
      finalizeNode();
    }
  });
}

if (newDiagramButton) {
  newDiagramButton.addEventListener("click", () => {
    const hasConfirmedNodes = flowNodes.some((node) => !node.isDraft);

    if (hasConfirmedNodes) {
      const confirmed = window.confirm(
        "Vuoi davvero creare un nuovo diagramma? Le modifiche non salvate andranno perse."
      );

      if (!confirmed) {
        return;
      }
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

document.addEventListener("keydown", (event) => {
  if (!propertyDialogBackdrop.hidden) {
    return;
  }

  if (event.key === "Escape") {
    if (!propertyDialogBackdrop.hidden) {
      removeDraftNode();
      closePropertyDialog();
      closeInsertDialog();
      return;
    }

    if (!insertDialogBackdrop.hidden) {
      closeInsertDialog();
    }

    return;
  }

  if ((event.key === "Delete" || event.key === "Backspace") && propertyDialogBackdrop.hidden && insertDialogBackdrop.hidden) {
    const target = event.target;
    const isTypingField =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      (target instanceof HTMLElement && target.isContentEditable);

    if (isTypingField) {
      return;
    }

    event.preventDefault();
    deleteSelectedNode();
  }
});

loadNodeLabelPreference();
loadFlowchartState();
renderFlowchart();
syncExecutionControls();
