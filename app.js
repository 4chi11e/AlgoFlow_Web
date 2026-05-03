const mainTabs = document.querySelectorAll(".folder-tab");
const mainViews = document.querySelectorAll(".main-view");
const languageTabs = document.querySelectorAll(".language-tab");
const mobileSidebarTabs = document.querySelectorAll(".mobile-sidebar-tab");
const appShell = document.querySelector(".app-shell");
const workspace = document.querySelector(".workspace");
const workspaceResizer = document.querySelector("#workspace-resizer");
const sidebarContent = document.querySelector(".sidebar-content");
const sidebarResizer = document.querySelector("#sidebar-resizer");
const variablesSection = document.querySelector(".variables-section");
const terminalSection = document.querySelector(".terminal-section");
const newDiagramButton = document.querySelector("#new-diagram-button");
const loadDiagramButton = document.querySelector("#load-diagram-button");
const saveDiagramButton = document.querySelector("#save-diagram-button");
const undoButton = document.querySelector("#undo-button");
const redoButton = document.querySelector("#redo-button");
const focusModeButton = document.querySelector("#focus-mode-button");
const loadDiagramInput = document.querySelector("#load-diagram-input");
const runProgramButton = document.querySelector("#run-program-button");
const stepProgramButton = document.querySelector("#step-program-button");
const stopProgramButton = document.querySelector("#stop-program-button");
const themeToggleButton = document.querySelector("#theme-toggle-button");
const showNodeTypeToggle = document.querySelector("#show-node-type-toggle");

const diagramCanvas = document.querySelector("#diagram-canvas");
const flowchartRoot = document.querySelector("#flowchart-root");
const codePreviewContent = document.querySelector("#code-preview-content");
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
const insertPasteButton = document.querySelector(".quick-action-paste");
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
const declareArrayLengthField = document.querySelector("#declare-array-length-field");
const declareArrayLengthInput = document.querySelector("#declare-array-length-input");
const declareTypeInputs = document.querySelectorAll('input[name="declare-type"]');
const forFields = document.querySelector("#for-fields");
const forVariableInput = document.querySelector("#for-variable-input");
const forStartInput = document.querySelector("#for-start-input");
const forEndInput = document.querySelector("#for-end-input");
const forStepInput = document.querySelector("#for-step-input");
const propertyForm = document.querySelector("#property-form");
const STORAGE_KEY = "flowgorithm-web-diagram";
const HISTORY_STORAGE_KEY = "algoflow-history";
const NODE_LABEL_PREFERENCE_KEY = "flowgorithm-web-show-node-type";
const MAIN_VIEW_PREFERENCE_KEY = "algoflow-main-view";
const CODE_LANGUAGE_PREFERENCE_KEY = "algoflow-code-language";
const THEME_PREFERENCE_KEY = "algoflow-theme";
const ALGOFLOW_FILE_FORMAT = "algoflow";
const ALGOFLOW_FILE_VERSION = 1;
const ALGOFLOW_FILE_EXTENSION = ".algoflow.json";
const ALGOFLOW_PDF_EXTENSION = ".pdf";
const FLOWGORITHM_FILE_EXTENSION = ".fprg";
const FLOWGORITHM_FILE_VERSION = "2.6";
const ALGOFLOW_APP_NAME = "AlgoFlow";
const ALGOFLOW_FILE_PICKER_ID = "algoflow-diagrams";
const ALGOFLOW_PICKER_DB_NAME = "algoflow-picker-db";
const ALGOFLOW_PICKER_STORE_NAME = "handles";
const ALGOFLOW_PICKER_HANDLE_KEY = "last-handle";
const ALGOFLOW_PDF_PAYLOAD_BEGIN = "ALGOFLOW_PAYLOAD_BEGIN";
const ALGOFLOW_PDF_PAYLOAD_END = "ALGOFLOW_PAYLOAD_END";
const COMPACT_LAYOUT_BREAKPOINT = 1000;
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
let flowClipboard = null;
let selectionDrag = null;
let undoHistory = [];
let redoHistory = [];
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
let selectedCodeLanguage = "c";
let currentTheme = "light";
let isDiagramFocusMode = false;
let mainViewBeforeFocusMode = null;
let mobileSidebarView = "terminal";
let pendingLayoutAwareRenderFrame = null;
let currentDiagramZoomPreset = null;
let touchPinchState = null;
let currentCodePreviewLines = [];

const RUNTIME_UNDECLARED = Symbol("runtime-undeclared");
const MAX_RUNTIME_OPERATIONS = 10000;
const SUPPORTED_ASSIGNMENT_OPERATORS = new Set(["=", "+=", "-=", "*=", "/=", "%="]);

const MIN_DIAGRAM_ZOOM = 0.18;
const MAX_DIAGRAM_ZOOM = 2.8;
const DIAGRAM_ZOOM_STEP = 0.1;
const DIAGRAM_ZOOM_PRESETS = {
  desktop: 0.9,
  compact: 0.8,
  phone: 0.68,
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
    return;
  }

  diagramZoom = normalizedZoom;
  applyDiagramZoom();
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

const areNodePathsEqual = (leftPath, rightPath) => {
  if (leftPath.length !== rightPath.length) {
    return false;
  }

  return leftPath.every((segment, index) =>
    segment.nodeId === rightPath[index]?.nodeId && segment.branchKey === rightPath[index]?.branchKey
  );
};

const isAncestorNodeSelected = (nodeId) => {
  const location = findNodeLocationById(nodeId);

  if (!location) {
    return false;
  }

  return location.path.some((segment) => selectedNodeIds.has(segment.nodeId));
};

const getClipboardSelectionContext = () => {
  if (selectedNodeIds.size === 0) {
    return { error: "Seleziona almeno un nodo." };
  }

  const selectedLocations = Array.from(selectedNodeIds)
    .filter((nodeId) => !isAncestorNodeSelected(nodeId))
    .map((nodeId) => findNodeLocationById(nodeId))
    .filter(Boolean);

  if (selectedLocations.length === 0) {
    return { error: "La selezione corrente non contiene nodi copiabili." };
  }

  const [firstLocation] = selectedLocations;
  const hasMixedContainers = selectedLocations.some((location) => !areNodePathsEqual(location.path, firstLocation.path));

  if (hasMixedContainers) {
    return { error: "Per copia, taglia e incolla seleziona nodi appartenenti allo stesso blocco o ramo." };
  }

  selectedLocations.sort((left, right) => left.index - right.index);

  return {
    path: firstLocation.path,
    container: firstLocation.container,
    locations: selectedLocations,
    nodes: selectedLocations.map((location) => location.node),
  };
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
      arrayLength: Number.isInteger(node.declareConfig.arrayLength) ? node.declareConfig.arrayLength : null,
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

const getPersistedFlowNodes = () =>
  flowNodes
    .filter((node) => !node.isDraft)
    .map(serializeNode);

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
          arrayLength: Number.isInteger(rawNode.declareConfig.arrayLength) && rawNode.declareConfig.arrayLength > 0
            ? rawNode.declareConfig.arrayLength
            : null,
        }
      : {
          names: [],
          dataType: "Integer",
          isArray: false,
          arrayLength: null,
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

const cloneNodeForClipboard = (node) => {
  const clonedNode = normalizeNode(serializeNode(node));

  if (!clonedNode) {
    throw new Error("Impossibile copiare il nodo selezionato.");
  }

  return clonedNode;
};

const assignFreshNodeIds = (nodes) => {
  const assignIds = (nodeList) => {
    nodeList.forEach((node) => {
      node.id = nextNodeId;
      nextNodeId += 1;

      if (node.branches) {
        Object.values(node.branches).forEach((branchNodes) => assignIds(branchNodes));
      }
    });
  };

  assignIds(nodes);
  return nodes;
};

const escapeRegExp = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const replaceIdentifierInExpression = (text, fromName, toName) => {
  if (!text || fromName === toName) {
    return text;
  }

  const pattern = new RegExp(`\\b${escapeRegExp(fromName)}\\b`, "g");
  return text.replace(pattern, toName);
};

const renameIdentifierInOutputTemplate = (text, fromName, toName) => {
  if (!text || fromName === toName) {
    return text;
  }

  return String(text).replace(/\{([^{}]+)\}/g, (placeholder, expression) => {
    const nextExpression = replaceIdentifierInExpression(expression, fromName, toName);
    return `{${nextExpression}}`;
  });
};

const renameIdentifierAcrossNodes = (nodes, fromName, toName) => {
  traverseNodes(nodes, (node) => {
    if (node.type === "declare" && node.declareConfig?.names) {
      node.declareConfig.names = node.declareConfig.names.map((name) => (name === fromName ? toName : name));
      return;
    }

    if (node.type === "assign") {
      const parsedAssignment = parseAssignmentStatement(node.value);

      if (parsedAssignment) {
        const variableName = parsedAssignment.variableName === fromName ? toName : parsedAssignment.variableName;
        const indexExpression = parsedAssignment.indexExpression
          ? replaceIdentifierInExpression(parsedAssignment.indexExpression, fromName, toName)
          : null;
        const expression = replaceIdentifierInExpression(parsedAssignment.expression, fromName, toName);
        const targetText = indexExpression ? `${variableName}[${indexExpression}]` : variableName;
        node.value = `${targetText} ${parsedAssignment.operator} ${expression}`.trim();
      }
      return;
    }

    if (node.type === "input") {
      node.value = node.value.trim() === fromName ? toName : node.value;
      return;
    }

    if (node.type === "output") {
      node.value = outputPlaceholderPattern.test(String(node.value ?? ""))
        ? renameIdentifierInOutputTemplate(node.value, fromName, toName)
        : replaceIdentifierInExpression(node.value, fromName, toName);
      return;
    }

    if (node.type === "if" || node.type === "while" || node.type === "do") {
      node.value = replaceIdentifierInExpression(node.value, fromName, toName);
      return;
    }

    if (node.type === "for") {
      if (node.forConfig) {
        node.forConfig.variable = node.forConfig.variable === fromName ? toName : node.forConfig.variable;
        node.forConfig.start = replaceIdentifierInExpression(node.forConfig.start, fromName, toName);
        node.forConfig.end = replaceIdentifierInExpression(node.forConfig.end, fromName, toName);
        node.forConfig.step = replaceIdentifierInExpression(node.forConfig.step, fromName, toName);
        const { variable, start, end, step } = node.forConfig;
        node.value = buildForDisplayText({ variable, start, end, step });
      } else {
        node.value = replaceIdentifierInExpression(node.value, fromName, toName);
      }
    }
  });
};

const getUniqueDeclaredName = (baseName, unavailableNames) => {
  let suffix = 2;
  let candidate = `${baseName}${suffix}`;

  while (unavailableNames.has(candidate) || reservedLanguageNames.has(candidate) || reservedLanguageNames.has(candidate.toLowerCase())) {
    suffix += 1;
    candidate = `${baseName}${suffix}`;
  }

  return candidate;
};

const resolveClipboardDeclarationConflicts = (nodes) => {
  const unavailableNames = getDeclaredVariableNameSet();
  const renamedDeclarations = [];

  traverseNodes(nodes, (node) => {
    if (node.type !== "declare" || !node.declareConfig?.names) {
      return;
    }

    node.declareConfig.names = node.declareConfig.names.map((name) => {
      if (!unavailableNames.has(name)) {
        unavailableNames.add(name);
        return name;
      }

      const nextName = getUniqueDeclaredName(name, unavailableNames);
      unavailableNames.add(nextName);
      renamedDeclarations.push({ from: name, to: nextName });
      return nextName;
    });
  });

  renamedDeclarations.forEach(({ from, to }) => {
    renameIdentifierAcrossNodes(nodes, from, to);
  });

  return renamedDeclarations;
};

const getPasteTargetContext = () => {
  if (selectedNodeIds.size > 0) {
    const selectionContext = getClipboardSelectionContext();

    if (selectionContext.error) {
      return { error: selectionContext.error };
    }

    const lastLocation = selectionContext.locations[selectionContext.locations.length - 1];
    return {
      path: selectionContext.path,
      container: selectionContext.container,
      index: lastLocation.index + 1,
    };
  }

  return {
    path: [],
    container: flowNodes,
    index: flowNodes.length,
  };
};

const applyPersistedFlowNodes = (rawNodes, options = {}) => {
  const { resetHistory = true } = options;

  if (!Array.isArray(rawNodes)) {
    throw new Error("Il file non contiene un elenco di nodi valido.");
  }

  const validNodes = rawNodes.map(normalizeNode).filter(Boolean);

  flowNodes.length = 0;
  flowNodes.push(...validNodes);

  let maxId = 0;
  traverseNodes(flowNodes, (node) => {
    maxId = Math.max(maxId, node.id);
  });

  nextNodeId = maxId + 1;
  pendingInsertTarget = null;
  editingNodeId = null;
  lastConnectorButton = null;
  selectedNodeIds = new Set();
  previewSelectedNodeIds = new Set();
  if (resetHistory) {
    undoHistory = [];
    redoHistory = [];
  }
  clearRuntimeSnapshot();
};

const getSuggestedDiagramFileName = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  return `diagram-${datePart}${ALGOFLOW_FILE_EXTENSION}`;
};

const getSuggestedPdfFileName = () => getSuggestedDiagramFileName().replace(/\.algoflow\.json$/i, ALGOFLOW_PDF_EXTENSION);

const openAlgoFlowPickerDatabase = () =>
  new Promise((resolve, reject) => {
    if (!("indexedDB" in window)) {
      resolve(null);
      return;
    }

    const request = window.indexedDB.open(ALGOFLOW_PICKER_DB_NAME, 1);

    request.addEventListener("upgradeneeded", () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(ALGOFLOW_PICKER_STORE_NAME)) {
        database.createObjectStore(ALGOFLOW_PICKER_STORE_NAME);
      }
    });

    request.addEventListener("success", () => {
      resolve(request.result);
    });

    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Impossibile aprire il database dei file picker."));
    });
  });

const loadLastAlgoFlowPickerHandle = async () => {
  const database = await openAlgoFlowPickerDatabase();

  if (!database) {
    return null;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ALGOFLOW_PICKER_STORE_NAME, "readonly");
    const store = transaction.objectStore(ALGOFLOW_PICKER_STORE_NAME);
    const request = store.get(ALGOFLOW_PICKER_HANDLE_KEY);

    request.addEventListener("success", () => {
      resolve(request.result ?? null);
      database.close();
    });

    request.addEventListener("error", () => {
      database.close();
      reject(request.error ?? new Error("Impossibile leggere l'ultima posizione usata."));
    });
  });
};

const saveLastAlgoFlowPickerHandle = async (handle) => {
  if (!handle) {
    return;
  }

  const database = await openAlgoFlowPickerDatabase();

  if (!database) {
    return;
  }

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(ALGOFLOW_PICKER_STORE_NAME, "readwrite");
    const store = transaction.objectStore(ALGOFLOW_PICKER_STORE_NAME);
    const request = store.put(handle, ALGOFLOW_PICKER_HANDLE_KEY);

    request.addEventListener("success", () => {
      resolve();
    });

    request.addEventListener("error", () => {
      reject(request.error ?? new Error("Impossibile salvare l'ultima posizione usata."));
    });

    transaction.addEventListener("complete", () => {
      database.close();
    });

    transaction.addEventListener("error", () => {
      database.close();
    });

    transaction.addEventListener("abort", () => {
      database.close();
    });
  });
};

const buildAlgoFlowPickerOptions = async () => {
  const options = {
    id: ALGOFLOW_FILE_PICKER_ID,
    types: [
      {
        description: "AlgoFlow JSON",
        accept: {
          "application/json": [ALGOFLOW_FILE_EXTENSION, ".json"],
        },
      },
    ],
  };

  const lastHandle = await loadLastAlgoFlowPickerHandle().catch(() => null);

  if (lastHandle) {
    options.startIn = lastHandle;
  } else {
    options.startIn = "downloads";
  }

  return options;
};

const buildAlgoFlowSavePickerOptions = async () => {
  const options = await buildAlgoFlowPickerOptions();

  options.types = [
    {
      description: "AlgoFlow JSON",
      accept: {
        "application/json": [ALGOFLOW_FILE_EXTENSION, ".json"],
      },
    },
    {
      description: "Flowgorithm FPRG",
      accept: {
        "application/xml": [FLOWGORITHM_FILE_EXTENSION],
        "text/xml": [FLOWGORITHM_FILE_EXTENSION],
      },
    },
    {
      description: "PDF con diagramma AlgoFlow",
      accept: {
        "application/pdf": [ALGOFLOW_PDF_EXTENSION],
      },
    },
  ];

  return options;
};

const buildAlgoFlowImportPickerOptions = async () => {
  const options = await buildAlgoFlowPickerOptions();

  options.types = [
    {
      description: "Diagrammi AlgoFlow",
      accept: {
        "application/json": [ALGOFLOW_FILE_EXTENSION, ".json"],
        "application/pdf": [ALGOFLOW_PDF_EXTENSION],
        "application/xml": [FLOWGORITHM_FILE_EXTENSION],
        "text/xml": [FLOWGORITHM_FILE_EXTENSION],
      },
    },
  ];

  return options;
};

const buildAlgoFlowFileDocument = () => ({
  format: ALGOFLOW_FILE_FORMAT,
  version: ALGOFLOW_FILE_VERSION,
  exportedAt: new Date().toISOString(),
  app: {
    name: ALGOFLOW_APP_NAME,
  },
  preferences: {
    showNodeTypeInLabel,
  },
  diagram: {
    nodes: getPersistedFlowNodes(),
  },
});

const getPersistedNodesFromImportedDocument = (documentData) => {
  if (Array.isArray(documentData)) {
    return documentData;
  }

  if (!documentData || typeof documentData !== "object") {
    throw new Error("Il file non contiene un documento AlgoFlow valido.");
  }

  if (documentData.format !== ALGOFLOW_FILE_FORMAT) {
    throw new Error(`Formato non supportato: atteso "${ALGOFLOW_FILE_FORMAT}".`);
  }

  if (documentData.version !== ALGOFLOW_FILE_VERSION) {
    throw new Error(`Versione file non supportata: ${String(documentData.version)}.`);
  }

  if (
    Array.isArray(documentData.diagram?.nodes)
  ) {
    return documentData.diagram.nodes;
  }

  throw new Error("Il file AlgoFlow non contiene la sezione diagram.nodes.");
};

const getHasConfirmedNodes = () => flowNodes.some((node) => !node.isDraft);

const confirmDiscardCurrentDiagram = () => {
  if (!getHasConfirmedNodes()) {
    return true;
  }

  return window.confirm("Vuoi davvero sostituire il diagramma corrente? Le modifiche non salvate andranno perse.");
};

const readFlowchartFile = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Nessun file selezionato.");
  }

  return file.text();
};

const isPdfDiagramFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  const normalizedName = typeof file.name === "string" ? file.name.toLowerCase() : "";
  return file.type === "application/pdf" || normalizedName.endsWith(ALGOFLOW_PDF_EXTENSION);
};

const isFlowgorithmDiagramFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  const normalizedName = typeof file.name === "string" ? file.name.toLowerCase() : "";
  return normalizedName.endsWith(FLOWGORITHM_FILE_EXTENSION) || file.type === "application/xml" || file.type === "text/xml";
};

const uint8ArrayToBase64 = (bytes) => {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return window.btoa(binary);
};

const base64ToUint8Array = (encodedValue) => {
  const binary = window.atob(encodedValue);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const concatUint8Arrays = (chunks) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
};

const formatPdfNumber = (value) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const roundedValue = Math.abs(value) < 0.0001 ? 0 : value;
  return roundedValue.toFixed(2).replace(/\.?0+$/, "");
};

const escapePdfLiteralString = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const encodePdfAscii = (value) => new TextEncoder().encode(value);

const dataUrlToUint8Array = (dataUrl) => {
  const [, encodedPayload = ""] = String(dataUrl).split(",", 2);
  return base64ToUint8Array(encodedPayload);
};

const findByteSequence = (sourceBytes, patternBytes, fromIndex = 0) => {
  if (!patternBytes.length || sourceBytes.length < patternBytes.length) {
    return -1;
  }

  for (let index = fromIndex; index <= sourceBytes.length - patternBytes.length; index += 1) {
    let matches = true;

    for (let patternIndex = 0; patternIndex < patternBytes.length; patternIndex += 1) {
      if (sourceBytes[index + patternIndex] !== patternBytes[patternIndex]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return index;
    }
  }

  return -1;
};

const extractEmbeddedAlgoFlowJsonFromPdfBytes = (pdfBytes) => {
  const beginMarker = encodePdfAscii(`% ${ALGOFLOW_PDF_PAYLOAD_BEGIN}`);
  const endMarker = encodePdfAscii(`% ${ALGOFLOW_PDF_PAYLOAD_END}`);
  const payloadStart = findByteSequence(pdfBytes, beginMarker);

  if (payloadStart < 0) {
    throw new Error("Il PDF non contiene alcun diagramma AlgoFlow incorporato.");
  }

  const payloadEnd = findByteSequence(pdfBytes, endMarker, payloadStart + beginMarker.length);

  if (payloadEnd < 0) {
    throw new Error("Il PDF contiene dati AlgoFlow incompleti.");
  }

  const payloadBytes = pdfBytes.slice(payloadStart + beginMarker.length, payloadEnd);
  const payloadText = new TextDecoder("utf-8").decode(payloadBytes);
  const encodedPayload = payloadText
    .split(/\r?\n/)
    .map((line) => line.replace(/^%\s?/, "").trim())
    .filter(Boolean)
    .join("");

  if (!encodedPayload) {
    throw new Error("Il PDF non contiene dati AlgoFlow leggibili.");
  }

  try {
    const jsonBytes = base64ToUint8Array(encodedPayload);
    return new TextDecoder().decode(jsonBytes);
  } catch {
    throw new Error("I dati AlgoFlow incorporati nel PDF non sono validi.");
  }
};

const readImportedFlowchartDocument = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Nessun file selezionato.");
  }

  if (isFlowgorithmDiagramFile(file)) {
    const xmlText = await file.text();
    return JSON.stringify(importFlowgorithmXmlDocument(xmlText));
  }

  if (!isPdfDiagramFile(file)) {
    return readFlowchartFile(file);
  }

  const pdfBytes = new Uint8Array(await file.arrayBuffer());
  return extractEmbeddedAlgoFlowJsonFromPdfBytes(pdfBytes);
};

const escapeXmlAttribute = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const getFlowgorithmSavedTimestamp = () => {
  const now = new Date();
  const datePart = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  let hours = now.getHours();
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");
  const meridiem = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;
  return `${datePart} ${String(hours).padStart(2, "0")}:${minutes}:${seconds} ${meridiem}`;
};

const getFlowgorithmSuggestedFileName = () => getSuggestedDiagramFileName().replace(/\.algoflow\.json$/i, FLOWGORITHM_FILE_EXTENSION);

const escapeFlowgorithmStringLiteral = (value) =>
  String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n");

const formatTemplateAsFlowgorithmOutputExpression = (template) => {
  const parts = [];
  const placeholderPattern = /\{([A-Za-z_][A-Za-z0-9_]*)\}/g;
  let lastIndex = 0;
  let match = null;

  while ((match = placeholderPattern.exec(String(template ?? ""))) !== null) {
    const literalText = String(template ?? "").slice(lastIndex, match.index);

    if (literalText) {
      parts.push(`"${escapeFlowgorithmStringLiteral(literalText)}"`);
    }

    parts.push(match[1]);
    lastIndex = match.index + match[0].length;
  }

  const trailingText = String(template ?? "").slice(lastIndex);

  if (trailingText || parts.length === 0) {
    parts.push(`"${escapeFlowgorithmStringLiteral(trailingText)}"`);
  }

  return parts.join(" & ");
};

const convertAssignmentToFlowgorithm = (node) => {
  const parsedAssignment = parseAssignmentStatement(node.value);

  if (!parsedAssignment) {
    throw new Error(`Il nodo Assign ${node.id} non può essere esportato in Flowgorithm.`);
  }

  if (parsedAssignment.operator === "=") {
    return {
      ...parsedAssignment,
      variableName: parsedAssignment.targetText,
    };
  }

  const operatorMap = {
    "+=": "+",
    "-=": "-",
    "*=": "*",
    "/=": "/",
    "%=": "%",
  };

  const mappedOperator = operatorMap[parsedAssignment.operator];

  return {
    variableName: parsedAssignment.targetText,
    operator: "=",
    expression: `${parsedAssignment.targetText} ${mappedOperator} (${parsedAssignment.expression})`,
  };
};

const exportNodesToFlowgorithmXml = (nodes, indentLevel = 5) => {
  const indent = CODEGEN_INDENT.repeat(indentLevel);
  const lines = [];

  nodes.forEach((node) => {
    switch (node.type) {
      case "declare": {
        const names = (node.declareConfig?.names ?? []).join(", ");
        const dataType = node.declareConfig?.dataType ?? "Integer";
        const isArray = Boolean(node.declareConfig?.isArray);
        const arrayLength = Number.isInteger(node.declareConfig?.arrayLength) ? node.declareConfig.arrayLength : null;

        lines.push(
          `${indent}<declare name="${escapeXmlAttribute(names)}" type="${escapeXmlAttribute(dataType)}" array="${isArray ? "True" : "False"}" size="${isArray && arrayLength ? escapeXmlAttribute(String(arrayLength)) : ""}"/>`
        );
        break;
      }
      case "assign": {
        const assignment = convertAssignmentToFlowgorithm(node);
        lines.push(
          `${indent}<assign variable="${escapeXmlAttribute(assignment.variableName)}" expression="${escapeXmlAttribute(assignment.expression)}"/>`
        );
        break;
      }
      case "input":
        lines.push(`${indent}<input variable="${escapeXmlAttribute(node.value.trim())}"/>`);
        break;
      case "output":
        lines.push(
          `${indent}<output expression="${escapeXmlAttribute(formatTemplateAsFlowgorithmOutputExpression(node.value))}" newline="True"/>`
        );
        break;
      case "comment":
        lines.push(`${indent}<comment text="${escapeXmlAttribute(node.value)}"/>`);
        break;
      case "call":
        lines.push(`${indent}<call expression="${escapeXmlAttribute(node.value)}"/>`);
        break;
      case "if": {
        lines.push(`${indent}<if expression="${escapeXmlAttribute(node.value)}">`);
        lines.push(`${indent}${CODEGEN_INDENT}<then>`);
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.trueBranch ?? [], indentLevel + 2));
        lines.push(`${indent}${CODEGEN_INDENT}</then>`);
        lines.push(`${indent}${CODEGEN_INDENT}<else>`);
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.falseBranch ?? [], indentLevel + 2));
        lines.push(`${indent}${CODEGEN_INDENT}</else>`);
        lines.push(`${indent}</if>`);
        break;
      }
      case "while":
        lines.push(`${indent}<while expression="${escapeXmlAttribute(node.value)}">`);
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.body ?? [], indentLevel + 1));
        lines.push(`${indent}</while>`);
        break;
      case "for": {
        const config = node.forConfig ?? {};
        lines.push(
          `${indent}<for variable="${escapeXmlAttribute(config.variable ?? "")}" start="${escapeXmlAttribute(config.start ?? "")}" end="${escapeXmlAttribute(config.end ?? "")}" step="${escapeXmlAttribute(config.step ?? "1")}">`
        );
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.body ?? [], indentLevel + 1));
        lines.push(`${indent}</for>`);
        break;
      }
      case "do":
        lines.push(`${indent}<do expression="${escapeXmlAttribute(node.value)}">`);
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.body ?? [], indentLevel + 1));
        lines.push(`${indent}</do>`);
        break;
      default:
        throw new Error(`Il nodo di tipo "${node.type}" non può essere esportato in Flowgorithm.`);
    }
  });

  return lines;
};

const buildFlowgorithmXmlDocument = () => {
  const xmlLines = [
    '<?xml version="1.0"?>',
    `<flowgorithm fileversion="${FLOWGORITHM_FILE_VERSION}">`,
    `${CODEGEN_INDENT}<attributes>`,
    `${CODEGEN_INDENT.repeat(2)}<attribute name="name" value="${escapeXmlAttribute(ALGOFLOW_APP_NAME)}"/>`,
    `${CODEGEN_INDENT.repeat(2)}<attribute name="authors" value="${escapeXmlAttribute(ALGOFLOW_APP_NAME)}"/>`,
    `${CODEGEN_INDENT.repeat(2)}<attribute name="about" value="Exported from AlgoFlow"/>`,
    `${CODEGEN_INDENT.repeat(2)}<attribute name="saved" value="${escapeXmlAttribute(getFlowgorithmSavedTimestamp())}"/>`,
    `${CODEGEN_INDENT}</attributes>`,
    `${CODEGEN_INDENT}<function name="Main" type="None" variable="">`,
    `${CODEGEN_INDENT.repeat(2)}<parameters/>`,
    `${CODEGEN_INDENT.repeat(2)}<body>`,
    ...exportNodesToFlowgorithmXml(getPersistedFlowNodes()),
    `${CODEGEN_INDENT.repeat(2)}</body>`,
    `${CODEGEN_INDENT}</function>`,
    `</flowgorithm>`,
    "",
  ];

  return xmlLines.join("\n");
};

const tokenizeFlowgorithmOutputExpression = (expression) => {
  const tokens = [];
  let current = "";
  let inString = false;
  let escapeNext = false;

  for (let index = 0; index < expression.length; index += 1) {
    const character = expression[index];

    if (escapeNext) {
      current += character;
      escapeNext = false;
      continue;
    }

    if (character === "\\") {
      current += character;
      escapeNext = true;
      continue;
    }

    if (character === "\"") {
      current += character;
      inString = !inString;
      continue;
    }

    if (!inString && character === "&") {
      if (current.trim()) {
        tokens.push(current.trim());
      }
      current = "";
      continue;
    }

    current += character;
  }

  if (inString) {
    throw new Error("Espressione Output Flowgorithm non valida: stringa non chiusa.");
  }

  if (current.trim()) {
    tokens.push(current.trim());
  }

  return tokens;
};

const decodeFlowgorithmStringLiteral = (token) => {
  if (!/^".*"$/.test(token)) {
    return null;
  }

  return token
    .slice(1, -1)
    .replace(/\\n/g, "\n")
    .replace(/\\"/g, "\"")
    .replace(/\\\\/g, "\\");
};

const convertFlowgorithmOutputExpressionToTemplate = (expression) => {
  const normalizedExpression = String(expression ?? "").trim();

  if (!normalizedExpression) {
    return "";
  }

  const tokens = tokenizeFlowgorithmOutputExpression(normalizedExpression);

  if (tokens.length === 0) {
    return "";
  }

  return tokens.map((token) => {
    const literalValue = decodeFlowgorithmStringLiteral(token);

    if (literalValue != null) {
      return literalValue;
    }

    if (/^[A-Za-z][A-Za-z0-9_]*$/.test(token)) {
      return `{${token}}`;
    }

    throw new Error(`Espressione Output Flowgorithm non supportata: ${expression}`);
  }).join("");
};

const getDirectChildElement = (parentElement, tagName) =>
  Array.from(parentElement.children).find((child) => child.tagName === tagName) ?? null;

const importFlowgorithmSequence = (parentElement) =>
  Array.from(parentElement.children).map((element) => {
    switch (element.tagName) {
      case "declare":
        return {
          type: "declare",
          value: "",
          declareConfig: {
            names: String(element.getAttribute("name") ?? "")
              .split(",")
              .map((name) => name.trim())
              .filter(Boolean),
            dataType: element.getAttribute("type") || "Integer",
            isArray: (element.getAttribute("array") || "False") === "True",
            arrayLength: Number.parseInt(element.getAttribute("size") || "", 10) > 0
              ? Number.parseInt(element.getAttribute("size") || "", 10)
              : null,
          },
        };
      case "assign":
        return {
          type: "assign",
          value: `${element.getAttribute("variable") || ""} = ${element.getAttribute("expression") || ""}`.trim(),
        };
      case "input":
        return {
          type: "input",
          value: element.getAttribute("variable") || "",
        };
      case "output":
        return {
          type: "output",
          value: convertFlowgorithmOutputExpressionToTemplate(element.getAttribute("expression") || ""),
        };
      case "comment":
        return {
          type: "comment",
          value: element.getAttribute("text") || "",
        };
      case "call":
        return {
          type: "call",
          value: element.getAttribute("expression") || "",
        };
      case "if":
        return {
          type: "if",
          value: element.getAttribute("expression") || "",
          branches: {
            trueBranch: getDirectChildElement(element, "then") ? importFlowgorithmSequence(getDirectChildElement(element, "then")) : [],
            falseBranch: getDirectChildElement(element, "else") ? importFlowgorithmSequence(getDirectChildElement(element, "else")) : [],
          },
        };
      case "while":
        return {
          type: "while",
          value: element.getAttribute("expression") || "",
          branches: {
            body: importFlowgorithmSequence(element),
          },
        };
      case "for":
        return {
          type: "for",
          value: "",
          forConfig: {
            variable: element.getAttribute("variable") || "",
            start: element.getAttribute("start") || "",
            end: element.getAttribute("end") || "",
            step: element.getAttribute("step") || "1",
          },
          branches: {
            body: importFlowgorithmSequence(element),
          },
        };
      case "do":
        return {
          type: "do",
          value: element.getAttribute("expression") || "",
          branches: {
            body: importFlowgorithmSequence(element),
          },
        };
      default:
        return null;
    }
  }).filter(Boolean);

const assignImportedNodeIds = (nodes) => {
  let nextImportedNodeId = 1;

  const assignIds = (nodeList) => {
    nodeList.forEach((node) => {
      node.id = nextImportedNodeId;
      nextImportedNodeId += 1;

if (node.type === "declare" && !node.declareConfig) {
  node.declareConfig = { names: [], dataType: "Integer", isArray: false, arrayLength: null };
}

      if (node.type === "for" && !node.forConfig) {
        node.forConfig = { variable: "", start: "", end: "", step: "1" };
      }

      if (node.branches) {
        Object.values(node.branches).forEach((branchNodes) => assignIds(branchNodes));
      }
    });
  };

  assignIds(nodes);
  return nodes;
};

const importFlowgorithmXmlDocument = (xmlText) => {
  const parser = new DOMParser();
  const xmlDocument = parser.parseFromString(xmlText, "application/xml");

  if (xmlDocument.querySelector("parsererror")) {
    throw new Error("Il file Flowgorithm selezionato non contiene XML valido.");
  }

  const root = xmlDocument.documentElement;

  if (!root || root.tagName !== "flowgorithm") {
    throw new Error("Il file selezionato non è un documento Flowgorithm valido.");
  }

  const mainFunction = root.querySelector('function[name="Main"] > body');

  if (!mainFunction) {
    throw new Error("Il file Flowgorithm non contiene la funzione Main.");
  }

  const importedNodes = assignImportedNodeIds(importFlowgorithmSequence(mainFunction));

  return {
    format: ALGOFLOW_FILE_FORMAT,
    version: ALGOFLOW_FILE_VERSION,
    app: {
      name: ALGOFLOW_APP_NAME,
    },
    preferences: {
      showNodeTypeInLabel,
    },
    diagram: {
      nodes: importedNodes,
    },
  };
};

const getSaveFormatFromFileName = (fileName) => {
  const normalizedName = String(fileName ?? "").toLowerCase();

  if (normalizedName.endsWith(ALGOFLOW_PDF_EXTENSION)) {
    return "pdf";
  }

  if (normalizedName.endsWith(FLOWGORITHM_FILE_EXTENSION)) {
    return "fprg";
  }

  return "json";
};

const getSaveFormatFromHandle = (fileHandle, types = []) => {
  if (fileHandle?.name) {
    return getSaveFormatFromFileName(fileHandle.name);
  }

  const firstExtension = types
    .flatMap((typeEntry) => Object.values(typeEntry.accept ?? {}))
    .flat()
    .find(Boolean);

  return getSaveFormatFromFileName(firstExtension ?? ALGOFLOW_FILE_EXTENSION);
};

const downloadBlobAsFile = (blob, fileName) => {
  const objectUrl = URL.createObjectURL(blob);
  const downloadLink = document.createElement("a");

  downloadLink.href = objectUrl;
  downloadLink.download = fileName;
  downloadLink.click();

  window.setTimeout(() => {
    URL.revokeObjectURL(objectUrl);
  }, 0);
};

const getPersistedFlowNodesSnapshot = () => JSON.stringify(getPersistedFlowNodes());

const saveHistoryState = () => {
  try {
    window.localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify({
      undoHistory,
      redoHistory,
    }));
  } catch {
    // Ignore storage failures.
  }
};

const loadHistoryState = () => {
  try {
    const rawHistory = window.localStorage.getItem(HISTORY_STORAGE_KEY);

    if (!rawHistory) {
      undoHistory = [];
      redoHistory = [];
      return;
    }

    const parsedHistory = JSON.parse(rawHistory);
    undoHistory = Array.isArray(parsedHistory?.undoHistory)
      ? parsedHistory.undoHistory.filter((entry) => typeof entry === "string")
      : [];
    redoHistory = Array.isArray(parsedHistory?.redoHistory)
      ? parsedHistory.redoHistory.filter((entry) => typeof entry === "string")
      : [];
  } catch {
    undoHistory = [];
    redoHistory = [];
    window.localStorage.removeItem(HISTORY_STORAGE_KEY);
  }
};

const syncUndoButton = () => {
  if (!undoButton) {
    return;
  }

  const canUndo = undoHistory.length > 0 && !isProgramRunning;
  undoButton.disabled = !canUndo;
  undoButton.setAttribute("aria-disabled", String(!canUndo));
  undoButton.title = canUndo ? "Annulla l'ultima modifica (Ctrl+Z)" : "Nessuna modifica da annullare";

  if (redoButton) {
    const canRedo = redoHistory.length > 0 && !isProgramRunning;
    redoButton.disabled = !canRedo;
    redoButton.setAttribute("aria-disabled", String(!canRedo));
    redoButton.title = canRedo ? "Ripristina l'ultima modifica annullata (Ctrl+Y)" : "Nessuna modifica da ripristinare";
  }
};

const pushUndoSnapshot = () => {
  const snapshot = getPersistedFlowNodesSnapshot();

  if (undoHistory[undoHistory.length - 1] === snapshot) {
    syncUndoButton();
    return;
  }

  undoHistory.push(snapshot);
  redoHistory = [];

  if (undoHistory.length > 100) {
    undoHistory = undoHistory.slice(-100);
  }

  saveHistoryState();
  syncUndoButton();
};

const getAlgoFlowSaveError = (error) => {
  if (error instanceof DOMException && error.name === "AbortError") {
    return error;
  }

  const rawMessage = error instanceof Error ? error.message : String(error ?? "");
  const normalizedMessage = rawMessage.toLowerCase();

  if (
    normalizedMessage.includes("access denied") ||
    normalizedMessage.includes("permission denied") ||
    normalizedMessage.includes("being used by another process") ||
    normalizedMessage.includes("used by another process") ||
    normalizedMessage.includes("process cannot access the file") ||
    normalizedMessage.includes("the requested file could not be locked") ||
    normalizedMessage.includes("locked")
  ) {
    return new Error("Impossibile salvare il file perché è già aperto o bloccato da un altro programma. Chiudilo e riprova.");
  }

  if (error instanceof Error && rawMessage.trim()) {
    return error;
  }

  return new Error("Impossibile completare il salvataggio.");
};

const buildAlgoFlowSavePayload = async (format) => {
  if (format === "pdf") {
    const bytes = await buildAlgoFlowPdfBytes();
    return {
      format,
      data: bytes,
    };
  }

  if (format === "fprg") {
    const text = buildFlowgorithmXmlDocument();
    return {
      format,
      data: text,
    };
  }

  const text = JSON.stringify(buildAlgoFlowFileDocument(), null, 2);
  return {
    format: "json",
    data: text,
  };
};

const exportFlowchartWithPicker = async () => {
  if (typeof window.showSaveFilePicker === "function") {
    const pickerOptions = await buildAlgoFlowSavePickerOptions();
    const fileHandle = await window.showSaveFilePicker({
      ...pickerOptions,
      suggestedName: getSuggestedPdfFileName(),
    });
    const selectedFormat = getSaveFormatFromHandle(fileHandle, pickerOptions.types);
    const payload = await buildAlgoFlowSavePayload(selectedFormat);

    if (selectedFormat === "pdf") {
      try {
        const existingFile = await fileHandle.getFile();

        if (existingFile.size > 0) {
          window.alert("Stai sovrascrivendo un PDF esistente. Se è aperto in un altro programma, il salvataggio potrebbe non riuscire: chiudilo prima di continuare.");
        }
      } catch {
        // Ignore missing file / unreadable pre-checks.
      }
    }

    let writable;

    try {
      writable = await fileHandle.createWritable();
      await writable.write(payload.data);
      await writable.close();
    } catch (error) {
      try {
        await writable?.abort?.();
      } catch {
        // Ignore abort failures after a write error.
      }

      throw getAlgoFlowSaveError(error);
    }

    await saveLastAlgoFlowPickerHandle(fileHandle).catch(() => {});
    return;
  }

  const selectedFormat = window.prompt(
    "Scegli il formato di salvataggio: json, fprg oppure pdf",
    "pdf"
  );

  if (!selectedFormat) {
    return;
  }

  const normalizedFormat = selectedFormat.trim().toLowerCase();

  if (normalizedFormat === "pdf") {
    downloadBlobAsFile(new Blob([await buildAlgoFlowPdfBytes()], { type: "application/pdf" }), getSuggestedPdfFileName());
    return;
  }

  if (normalizedFormat === "fprg") {
    downloadBlobAsFile(new Blob([buildFlowgorithmXmlDocument()], { type: "application/xml" }), getFlowgorithmSuggestedFileName());
    return;
  }

  if (normalizedFormat === "json") {
    downloadBlobAsFile(
      new Blob([JSON.stringify(buildAlgoFlowFileDocument(), null, 2)], { type: "application/json" }),
      getSuggestedDiagramFileName()
    );
    return;
  }

  throw new Error("Formato di salvataggio non supportato. Usa json, fprg oppure pdf.");
};

const isTypingTarget = (target) =>
  target instanceof HTMLInputElement ||
  target instanceof HTMLTextAreaElement ||
  target instanceof HTMLSelectElement ||
  (target instanceof HTMLElement && target.isContentEditable);

const importFlowchartFromJsonText = (rawText) => {
  let documentData = null;

  try {
    documentData = JSON.parse(rawText);
  } catch {
    throw new Error("Il file selezionato non contiene JSON valido.");
  }

  const persistedNodes = getPersistedNodesFromImportedDocument(documentData);

  cancelExecution();
  removeDraftNode();
  closePropertyDialog({ restoreFocus: false });
  closeInsertDialog();
  pushUndoSnapshot();
  applyPersistedFlowNodes(persistedNodes, { resetHistory: false });

  if (
    documentData &&
    typeof documentData === "object" &&
    !Array.isArray(documentData) &&
    typeof documentData.preferences?.showNodeTypeInLabel === "boolean"
  ) {
    showNodeTypeInLabel = documentData.preferences.showNodeTypeInLabel;
    saveNodeLabelPreference();

    if (showNodeTypeToggle) {
      showNodeTypeToggle.checked = showNodeTypeInLabel;
    }
  }

  saveFlowchartState();
  renderFlowchart();
};


const buildPrintableDiagramSvgMarkup = () => {
  const diagramSvg = flowchartRoot?.querySelector(".diagram-svg");

  if (!(diagramSvg instanceof SVGElement)) {
    throw new Error("Non c'è alcun diagramma da esportare in PDF.");
  }

  const printableSvg = diagramSvg.cloneNode(true);

  printableSvg.removeAttribute("id");
  printableSvg.style.width = "100%";
  printableSvg.style.height = "auto";
  printableSvg.style.maxWidth = "100%";

  return printableSvg.outerHTML;
};

const openPdfPrintPreview = () => {
  const printableSvgMarkup = buildPrintableDiagramSvgMarkup();
  const stylesheetUrl = new URL("styles.css", window.location.href).href;
  const documentTitle = `AlgoFlow PDF Preview`;
  const previewHtml = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentTitle}</title>
      <link rel="preconnect" href="https://fonts.googleapis.com">
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
      <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
      <link rel="stylesheet" href="${stylesheetUrl}">
      <style>
        body {
          margin: 0;
          background: white;
        }

        .pdf-sheet {
          padding: 18mm 16mm;
        }

        .pdf-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10mm;
        }

        .pdf-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20pt;
          font-weight: 700;
          color: #2f2419;
        }

        .pdf-subtitle {
          font-family: "Manrope", sans-serif;
          font-size: 10pt;
          color: #6f6253;
        }

        .pdf-diagram {
          width: 100%;
          overflow: hidden;
        }

        .pdf-diagram .diagram-svg {
          width: 100% !important;
          height: auto !important;
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          window.focus();
          window.print();
        }, { once: true });
      </script>
    </head>
    <body>
      <main class="pdf-sheet">
        <header class="pdf-header">
          <div class="pdf-title">AlgoFlow</div>
          <div class="pdf-subtitle">Diagramma esportato il ${new Date().toLocaleDateString("it-IT")}</div>
        </header>
        <section class="pdf-diagram">
          ${printableSvgMarkup}
        </section>
      </main>
    </body>
    </html>
  `;
  const previewBlob = new Blob([previewHtml], { type: "text/html" });
  const previewUrl = URL.createObjectURL(previewBlob);
  const printWindow = window.open(previewUrl, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(previewUrl);
    throw new Error("Il browser ha bloccato l'apertura della finestra di stampa.");
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(previewUrl);
  }, 60000);
};

const collectDocumentStylesForPdfSvg = () => {
  const styleChunks = [];

  Array.from(document.styleSheets).forEach((styleSheet) => {
    try {
      const cssRules = Array.from(styleSheet.cssRules ?? []);

      cssRules.forEach((rule) => {
        styleChunks.push(rule.cssText);
      });
    } catch {
      // Ignore inaccessible stylesheets.
    }
  });

  styleChunks.push(`
    .svg-node-hit,
    .svg-connector-hit,
    .svg-connector-hit-path {
      display: none !important;
    }
  `);

  return styleChunks.join("\n");
};

const simplifySvgLabelsForPdf = (printableSvg) => {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const measurementCanvas = document.createElement("canvas");
  const measurementContext = measurementCanvas.getContext("2d");

  const measureTextWidth = (text, font) => {
    if (!measurementContext) {
      return text.length * 8;
    }

    measurementContext.font = font;
    return measurementContext.measureText(text).width;
  };

  const wrapTextLines = (text, maxWidth, font) => {
    const paragraphs = String(text ?? "").split("\n");
    const lines = [];

    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);

      if (words.length === 0) {
        lines.push("");
        return;
      }

      let currentLine = "";

      words.forEach((word) => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;

        if (!currentLine || measureTextWidth(nextLine, font) <= maxWidth) {
          currentLine = nextLine;
          return;
        }

        lines.push(currentLine);
        currentLine = word;
      });

      if (currentLine) {
        lines.push(currentLine);
      }
    });

    return lines.length > 0 ? lines : [""];
  };

  printableSvg.querySelectorAll("foreignObject").forEach((foreignObject) => {
    const isTerminal = foreignObject.closest(".svg-terminal-node");
    const isComment = foreignObject.closest(".svg-node-comment");
    const nodeGroup = foreignObject.closest(".svg-node");
    const nodeId = Number(nodeGroup?.getAttribute("data-node-id") ?? "");
    const sourceNode = Number.isFinite(nodeId) ? findNodeById(nodeId) : null;
    const rawText = sourceNode
      ? getNodeDisplayText(sourceNode)
      : (foreignObject.textContent || "");
    const textContent = String(rawText ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .trim();

    if (!textContent) {
      foreignObject.remove();
      return;
    }

    const x = Number(foreignObject.getAttribute("x") ?? "0");
    const y = Number(foreignObject.getAttribute("y") ?? "0");
    const width = Number(foreignObject.getAttribute("width") ?? "0");
    const height = Number(foreignObject.getAttribute("height") ?? "0");
    const fontFamily = isTerminal ? "Georgia, serif" : "Arial, sans-serif";
    const fontSize = isTerminal ? 22 : 16;
    const fontWeight = isTerminal ? "600" : "700";
    const lineHeight = isTerminal ? 26 : (isComment ? 19 : 20);
    const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const horizontalPadding = isComment ? 4 : 2;
    const verticalPadding = isTerminal ? 2 : (isComment ? 6 : 8);
    const wrappedLines = wrapTextLines(textContent, Math.max(width - horizontalPadding * 2, 12), font);
    const blockHeight = wrappedLines.length * lineHeight;
    const textNode = document.createElementNS(svgNamespace, "text");
    const textX = isComment ? x + horizontalPadding : x + width / 2;
    const availableHeight = Math.max(height - verticalPadding * 2, fontSize);
    const startY = isComment
      ? y + verticalPadding
      : y + verticalPadding + Math.max((availableHeight - blockHeight) / 2, 0);

    textNode.setAttribute("x", String(textX));
    textNode.setAttribute("y", String(startY));
    textNode.setAttribute("text-anchor", isComment ? "start" : "middle");
    textNode.setAttribute("dominant-baseline", "hanging");
    textNode.setAttribute("fill", "#2f2419");
    textNode.setAttribute("font-family", fontFamily);
    textNode.setAttribute("font-size", String(fontSize));
    textNode.setAttribute("font-weight", fontWeight);

    wrappedLines.forEach((line, index) => {
      const tspan = document.createElementNS(svgNamespace, "tspan");
      tspan.setAttribute("x", String(textX));
      tspan.setAttribute("dy", index === 0 ? "0" : String(lineHeight));
      tspan.textContent = line || "\u00A0";
      textNode.append(tspan);
    });

    foreignObject.replaceWith(textNode);
  });

  printableSvg.querySelectorAll(".svg-node-hit, .svg-connector-hit, .svg-connector-hit-path").forEach((node) => {
    node.remove();
  });
};

const stripInteractiveStateFromPrintableSvg = (printableSvg) => {
  printableSvg
    .querySelectorAll(".is-selected, .is-executing, .is-preview-selected")
    .forEach((node) => {
      node.classList.remove("is-selected", "is-executing", "is-preview-selected");
    });
};

const withDetachedSvgStyleSource = (sourceSvg, callback) => {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.overflow = "hidden";
  host.style.pointerEvents = "none";
  host.appendChild(sourceSvg);
  document.body.appendChild(host);

  try {
    return callback(sourceSvg);
  } finally {
    host.remove();
  }
};

const inlineSvgComputedStylesForPdf = (sourceSvg, printableSvg) => {
  const styleSelectors = [
    ".svg-node-shape",
    ".svg-terminal-shape",
    ".svg-connector-line",
    ".svg-if-line",
    ".svg-connector-arrow",
    ".svg-branch-label",
    "text",
  ];

  styleSelectors.forEach((selector) => {
    const sourceNodes = Array.from(sourceSvg.querySelectorAll(selector));
    const printableNodes = Array.from(printableSvg.querySelectorAll(selector));

    sourceNodes.forEach((sourceNode, index) => {
      const printableNode = printableNodes[index];

      if (!(sourceNode instanceof SVGElement) || !(printableNode instanceof SVGElement)) {
        return;
      }

      const computedStyle = window.getComputedStyle(sourceNode);

      [
        "fill",
        "stroke",
        "stroke-width",
        "stroke-dasharray",
        "stroke-linecap",
        "stroke-linejoin",
        "font-family",
        "font-size",
        "font-weight",
        "letter-spacing",
        "text-anchor",
      ].forEach((propertyName) => {
        const propertyValue = computedStyle.getPropertyValue(propertyName).trim();

        if (propertyValue) {
          printableNode.style.setProperty(propertyName, propertyValue);
        }
      });
    });
  });
};

const inlineForeignObjectComputedStylesForPdf = (sourceSvg, printableSvg) => {
  const sourceForeignObjects = Array.from(sourceSvg.querySelectorAll("foreignObject"));
  const printableForeignObjects = Array.from(printableSvg.querySelectorAll("foreignObject"));
  const copiedProperties = [
    "display",
    "width",
    "height",
    "padding",
    "margin",
    "box-sizing",
    "align-items",
    "justify-content",
    "align-self",
    "text-align",
    "white-space",
    "overflow",
    "overflow-wrap",
    "word-break",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "color",
    "background",
    "border",
    "border-radius",
  ];

  sourceForeignObjects.forEach((sourceForeignObject, index) => {
    const printableForeignObject = printableForeignObjects[index];

    if (!(sourceForeignObject instanceof SVGForeignObjectElement) || !(printableForeignObject instanceof SVGForeignObjectElement)) {
      return;
    }

    const sourceHtmlNodes = [
      sourceForeignObject.firstElementChild,
      ...sourceForeignObject.querySelectorAll("*"),
    ].filter(Boolean);
    const printableHtmlNodes = [
      printableForeignObject.firstElementChild,
      ...printableForeignObject.querySelectorAll("*"),
    ].filter(Boolean);

    sourceHtmlNodes.forEach((sourceNode, htmlIndex) => {
      const printableNode = printableHtmlNodes[htmlIndex];

      if (!(sourceNode instanceof HTMLElement) || !(printableNode instanceof HTMLElement)) {
        return;
      }

      const computedStyle = window.getComputedStyle(sourceNode);
      copiedProperties.forEach((propertyName) => {
        const propertyValue = computedStyle.getPropertyValue(propertyName).trim();

        if (propertyValue) {
          printableNode.style.setProperty(propertyName, propertyValue);
        }
      });

      if (sourceNode.classList.contains("svg-terminal-label")) {
        printableNode.style.setProperty("font-family", "Georgia, serif");
      } else {
        printableNode.style.setProperty("font-family", "Arial, sans-serif");
      }
    });
  });
};

const cropCanvasWhitespaceForPdf = (sourceCanvas) => {
  const context = sourceCanvas.getContext("2d");

  if (!context) {
    return sourceCanvas;
  }

  const { width, height } = sourceCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const whiteThreshold = 248;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha === 0) {
        continue;
      }

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const isNearWhite = red >= whiteThreshold && green >= whiteThreshold && blue >= whiteThreshold;

      if (isNearWhite) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas;
  }

  const padding = 24;
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
  const cropHeight = Math.min(height - cropY, maxY - minY + 1 + padding * 2);
  const croppedCanvas = document.createElement("canvas");

  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;

  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    return sourceCanvas;
  }

  croppedContext.fillStyle = "#ffffff";
  croppedContext.fillRect(0, 0, cropWidth, cropHeight);
  croppedContext.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return croppedCanvas;
};

const buildPrintableDiagramImageDataUrlForPdf = async () => {
  const diagramSvg = flowchartRoot?.querySelector(".diagram-svg");

  if (!(diagramSvg instanceof SVGElement)) {
    throw new Error("Non c'è alcun diagramma da esportare in PDF.");
  }

  const sourceSvgForPdf = diagramSvg.cloneNode(true);
  const printableSvg = diagramSvg.cloneNode(true);
  const viewBox = printableSvg.viewBox.baseVal;

  if (!viewBox || !viewBox.width || !viewBox.height) {
    throw new Error("Il diagramma non ha dimensioni esportabili.");
  }

  printableSvg.removeAttribute("id");
  printableSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  printableSvg.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml");
  printableSvg.setAttribute("width", String(viewBox.width));
  printableSvg.setAttribute("height", String(viewBox.height));
  stripInteractiveStateFromPrintableSvg(sourceSvgForPdf);
  stripInteractiveStateFromPrintableSvg(printableSvg);
  withDetachedSvgStyleSource(sourceSvgForPdf, (styledSourceSvg) => {
    inlineSvgComputedStylesForPdf(styledSourceSvg, printableSvg);
  });
  simplifySvgLabelsForPdf(printableSvg);

  const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleNode.textContent = collectDocumentStylesForPdfSvg();
  printableSvg.insertBefore(styleNode, printableSvg.firstChild);

  const serializedSvg = new XMLSerializer().serializeToString(printableSvg);
  const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image();

      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Impossibile renderizzare il diagramma per il PDF."));
      nextImage.src = svgUrl;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewBox.width * scale);
    canvas.height = Math.round(viewBox.height * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Impossibile preparare il canvas per l'esportazione PDF.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return cropCanvasWhitespaceForPdf(canvas).toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};

const buildPrintableDiagramCanvasForPdf = async () => {
  return runWithTemporaryTheme("light", async () => {
    const diagramSvg = flowchartRoot?.querySelector(".diagram-svg");

    if (!(diagramSvg instanceof SVGElement)) {
      throw new Error("Non c'è alcun diagramma da esportare in PDF.");
    }

    const sourceSvgForPdf = diagramSvg.cloneNode(true);
    const printableSvg = diagramSvg.cloneNode(true);
    const viewBox = printableSvg.viewBox.baseVal;

    if (!viewBox || !viewBox.width || !viewBox.height) {
      throw new Error("Il diagramma non ha dimensioni esportabili.");
    }

    printableSvg.removeAttribute("id");
    printableSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    printableSvg.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml");
    printableSvg.setAttribute("width", String(viewBox.width));
    printableSvg.setAttribute("height", String(viewBox.height));
    stripInteractiveStateFromPrintableSvg(sourceSvgForPdf);
    stripInteractiveStateFromPrintableSvg(printableSvg);
    withDetachedSvgStyleSource(sourceSvgForPdf, (styledSourceSvg) => {
      inlineSvgComputedStylesForPdf(styledSourceSvg, printableSvg);
    });
    simplifySvgLabelsForPdf(printableSvg);

    const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleNode.textContent = collectDocumentStylesForPdfSvg();
    printableSvg.insertBefore(styleNode, printableSvg.firstChild);

    const serializedSvg = new XMLSerializer().serializeToString(printableSvg);
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const image = await new Promise((resolve, reject) => {
        const nextImage = new Image();

        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Impossibile renderizzare il diagramma per il PDF."));
        nextImage.src = svgUrl;
      });

      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewBox.width * scale);
      canvas.height = Math.round(viewBox.height * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Impossibile preparare il canvas per l'esportazione PDF.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const croppedCanvas = cropCanvasWhitespaceForPdf(canvas);

      const headerPaddingTop = Math.round(scale * 32);
      const headerPaddingLeft = Math.round(scale * 34);
      const headerPaddingBottom = Math.round(scale * 24);
      const titleFontSize = Math.round(scale * 34);
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = croppedCanvas.width;
      compositeCanvas.height = croppedCanvas.height + headerPaddingTop + titleFontSize + headerPaddingBottom;

      const compositeContext = compositeCanvas.getContext("2d");

      if (!compositeContext) {
        throw new Error("Impossibile preparare il canvas finale per l'esportazione PDF.");
      }

      compositeContext.fillStyle = "#ffffff";
      compositeContext.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
      compositeContext.fillStyle = "#2f2419";
      compositeContext.font = `700 ${titleFontSize}px "Space Grotesk", "Manrope", sans-serif`;
      compositeContext.textBaseline = "top";
      compositeContext.fillText(ALGOFLOW_APP_NAME, headerPaddingLeft, headerPaddingTop);
      compositeContext.drawImage(croppedCanvas, 0, headerPaddingTop + titleFontSize + headerPaddingBottom);

      return compositeCanvas;
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  });
};

const buildEmbeddedAlgoFlowPdfPayloadComment = (serializedDocument) => {
  const encodedPayload = uint8ArrayToBase64(new TextEncoder().encode(serializedDocument));
  const payloadChunks = encodedPayload.match(/.{1,120}/g) ?? [];
  const lines = [
    `% ${ALGOFLOW_PDF_PAYLOAD_BEGIN}`,
    ...payloadChunks.map((chunk) => `% ${chunk}`),
    `% ${ALGOFLOW_PDF_PAYLOAD_END}`,
    "",
  ];

  return lines.join("\n");
};

const buildAlgoFlowPdfBytes = async () => {
  const printableCanvas = await buildPrintableDiagramCanvasForPdf();
  const serializedDocument = JSON.stringify(buildAlgoFlowFileDocument(), null, 2);
  const jpegDataUrl = printableCanvas.toDataURL("image/jpeg", 0.92);
  const imageBytes = dataUrlToUint8Array(jpegDataUrl);
  const pageWidthPoints = 595.28;
  const horizontalMargin = 34;
  const topMargin = 24;
  const bottomMargin = 28;
  const imageWidthPoints = pageWidthPoints - (horizontalMargin * 2);
  const imageHeightPoints = imageWidthPoints * (printableCanvas.height / printableCanvas.width);
  const pageHeightPoints = Math.max(220, topMargin + imageHeightPoints + bottomMargin);
  const imageX = horizontalMargin;
  const imageY = bottomMargin;
  const contentStream = [
    "q",
    `${formatPdfNumber(imageWidthPoints)} 0 0 ${formatPdfNumber(imageHeightPoints)} ${formatPdfNumber(imageX)} ${formatPdfNumber(imageY)} cm`,
    "/Im1 Do",
    "Q",
    "",
  ].join("\n");
  const payloadComment = buildEmbeddedAlgoFlowPdfPayloadComment(serializedDocument);
  const pdfHeader = `%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n${payloadComment}`;
  const objectChunks = [];
  const objectOffsets = [0];

  const pushPdfObject = (objectNumber, chunks) => {
    const header = encodePdfAscii(`${objectNumber} 0 obj\n`);
    const footer = encodePdfAscii(`\nendobj\n`);
    objectChunks.push(concatUint8Arrays([header, ...chunks, footer]));
  };

  pushPdfObject(1, [encodePdfAscii("<< /Type /Catalog /Pages 2 0 R >>\n")]);
  pushPdfObject(2, [encodePdfAscii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n")]);
  pushPdfObject(3, [
    encodePdfAscii(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageWidthPoints)} ${formatPdfNumber(pageHeightPoints)}] ` +
      "/Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>\n"
    ),
  ]);
  pushPdfObject(4, [encodePdfAscii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n")]);
  pushPdfObject(5, [
    encodePdfAscii(
      `<< /Type /XObject /Subtype /Image /Width ${printableCanvas.width} /Height ${printableCanvas.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`
    ),
    imageBytes,
    encodePdfAscii("\nendstream\n"),
  ]);
  pushPdfObject(6, [
    encodePdfAscii(`<< /Length ${encodePdfAscii(contentStream).length} >>\nstream\n${contentStream}endstream\n`),
  ]);
  pushPdfObject(7, [
    encodePdfAscii(
      `<< /Title (${escapePdfLiteralString(getSuggestedPdfFileName())}) /Producer (${escapePdfLiteralString(ALGOFLOW_APP_NAME)}) ` +
      ` /Creator (${escapePdfLiteralString(ALGOFLOW_APP_NAME)}) >>\n`
    ),
  ]);

  let currentOffset = encodePdfAscii(pdfHeader).length;

  objectChunks.forEach((chunk) => {
    objectOffsets.push(currentOffset);
    currentOffset += chunk.length;
  });

  const xrefOffset = currentOffset;
  const xrefLines = ["xref", `0 ${objectOffsets.length}`, "0000000000 65535 f "];

  for (let index = 1; index < objectOffsets.length; index += 1) {
    xrefLines.push(`${String(objectOffsets[index]).padStart(10, "0")} 00000 n `);
  }

  const trailer = [
    "trailer",
    `<< /Size ${objectOffsets.length} /Root 1 0 R /Info 7 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");

  return concatUint8Arrays([
    encodePdfAscii(pdfHeader),
    ...objectChunks,
    encodePdfAscii(`${xrefLines.join("\n")}\n${trailer}`),
  ]);
};

const saveFlowchartState = () => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(getPersistedFlowNodes()));
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

const getActiveMainViewId = () => {
  const activeView = Array.from(mainViews).find((view) => view.classList.contains("is-active"));
  return activeView?.id ?? "diagram-view";
};

const setActiveMainView = (targetId) => {
  if (!targetId) {
    return;
  }

  let hasMatchingView = false;

  mainViews.forEach((view) => {
    const isTarget = view.id === targetId;
    view.classList.toggle("is-active", isTarget);
    view.hidden = !isTarget;

    if (isTarget) {
      hasMatchingView = true;
    }
  });

  if (!hasMatchingView) {
    return;
  }

  mainTabs.forEach((item) => {
    const isTarget = item.dataset.mainTarget === targetId;
    item.classList.toggle("is-active", isTarget);
    item.setAttribute("aria-selected", String(isTarget));
  });
};

const loadMainViewPreference = () => {
  try {
    const storedValue = window.localStorage.getItem(MAIN_VIEW_PREFERENCE_KEY);
    return storedValue || "diagram-view";
  } catch {
    return "diagram-view";
  }
};

const saveMainViewPreference = (targetId) => {
  try {
    window.localStorage.setItem(MAIN_VIEW_PREFERENCE_KEY, targetId);
  } catch {
    // Ignore storage failures.
  }
};

const syncFocusModeButton = () => {
  if (!focusModeButton) {
    return;
  }

  focusModeButton.classList.toggle("is-active", isDiagramFocusMode);
  focusModeButton.textContent = isDiagramFocusMode ? "Esci" : "Focus";
  focusModeButton.title = isDiagramFocusMode ? "Esci dalla modalita focus (Esc)" : "Modalita focus diagramma (F)";
  focusModeButton.setAttribute("aria-pressed", String(isDiagramFocusMode));
};

const setDiagramFocusMode = (nextValue) => {
  const shouldEnable = Boolean(nextValue);

  if (isDiagramFocusMode === shouldEnable) {
    return;
  }

  if (shouldEnable) {
    const activeMainViewId = getActiveMainViewId();
    mainViewBeforeFocusMode = activeMainViewId === "diagram-view" ? null : activeMainViewId;
    setActiveMainView("diagram-view");
  } else if (mainViewBeforeFocusMode) {
    setActiveMainView(mainViewBeforeFocusMode);
    mainViewBeforeFocusMode = null;
  }

  isDiagramFocusMode = shouldEnable;
  appShell?.classList.toggle("is-focus-mode", isDiagramFocusMode);
  syncFocusModeButton();
  renderFlowchart();
};

const syncMobileSidebarView = () => {
  const isMobile = window.innerWidth <= COMPACT_LAYOUT_BREAKPOINT;

  mobileSidebarTabs.forEach((tab) => {
    const isActive = tab.dataset.sidebarTarget === mobileSidebarView;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  if (!variablesSection || !terminalSection) {
    return;
  }

  if (!isMobile) {
    variablesSection.classList.remove("is-mobile-hidden");
    terminalSection.classList.remove("is-mobile-hidden");
    return;
  }

  variablesSection.classList.toggle("is-mobile-hidden", mobileSidebarView !== "variables");
  terminalSection.classList.toggle("is-mobile-hidden", mobileSidebarView !== "terminal");
};

const scheduleLayoutAwareRender = () => {
  if (pendingLayoutAwareRenderFrame !== null) {
    cancelAnimationFrame(pendingLayoutAwareRenderFrame);
  }

  pendingLayoutAwareRenderFrame = requestAnimationFrame(() => {
    pendingLayoutAwareRenderFrame = requestAnimationFrame(() => {
      pendingLayoutAwareRenderFrame = null;
      renderFlowchart();
    });
  });
};

const loadCodeLanguagePreference = () => {
  try {
    const storedValue = window.localStorage.getItem(CODE_LANGUAGE_PREFERENCE_KEY);
    if (storedValue && ["c", "cpp", "python"].includes(storedValue)) {
      selectedCodeLanguage = storedValue;
    }
  } catch {
    selectedCodeLanguage = "c";
  }
};

const saveCodeLanguagePreference = () => {
  try {
    window.localStorage.setItem(CODE_LANGUAGE_PREFERENCE_KEY, selectedCodeLanguage);
  } catch {
    // Ignore storage failures.
  }
};

const syncThemeToggleButton = () => {
  if (!themeToggleButton) {
    return;
  }

  const isDark = currentTheme === "dark";
  themeToggleButton.textContent = isDark ? "Light" : "Dark";
  themeToggleButton.title = isDark ? "Passa al tema chiaro" : "Passa al tema scuro";
};

const applyTheme = (theme) => {
  currentTheme = theme === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = currentTheme;
  syncThemeToggleButton();
};

const loadThemePreference = () => {
  try {
    const storedValue = window.localStorage.getItem(THEME_PREFERENCE_KEY);
    applyTheme(storedValue === "dark" ? "dark" : "light");
  } catch {
    applyTheme("light");
  }
};

const saveThemePreference = () => {
  try {
    window.localStorage.setItem(THEME_PREFERENCE_KEY, currentTheme);
  } catch {
    // Ignore storage failures.
  }
};

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
    const { variable, start, end, step } = node.forConfig;
    return buildForDisplayText({ variable, start, end, step });
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
  languageTabs.forEach((tab) => {
    const isActive = tab.dataset.codeLanguage === selectedCodeLanguage;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
};

languageTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const nextLanguage = tab.dataset.codeLanguage;

    if (!nextLanguage || nextLanguage === selectedCodeLanguage) {
      return;
    }

    selectedCodeLanguage = nextLanguage;
    saveCodeLanguagePreference();
    syncCodeLanguageTabs();
    renderCodePreview();
  });
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
  const formatDisplayStringLiteral = (literal) => {
    if (!literal) {
      return "";
    }

    const quote = literal[0];
    const closingQuote = literal.length > 1 ? literal[literal.length - 1] : "";
    const content = literal.slice(1, closingQuote === quote ? -1 : literal.length);

    if (quote === '"') {
      return `${closingQuote === quote ? "&ldquo;" : "&quot;"}${escapeHtml(content)}${closingQuote === quote ? "&rdquo;" : ""}`;
    }

    if (quote === "'") {
      return `${closingQuote === quote ? "&lsquo;" : "&#39;"}${escapeHtml(content)}${closingQuote === quote ? "&rsquo;" : ""}`;
    }

    return escapeHtml(literal);
  };

  const highlightIdentifiersInChunk = (chunk) => {
    const parts = [];
    const identifierPattern = /[A-Za-z_][A-Za-z0-9_]*/g;
    let lastIndex = 0;
    let match;

    while ((match = identifierPattern.exec(chunk)) !== null) {
      const [identifier] = match;
      const start = match.index;
      const end = start + identifier.length;

      parts.push(escapeHtml(chunk.slice(lastIndex, start)));

      if (declaredNames.has(identifier) || reservedWords.has(identifier.toLowerCase())) {
        parts.push(escapeHtml(identifier));
      } else {
        parts.push(`<span class="invalid-variable">${escapeHtml(identifier)}</span>`);
      }

      lastIndex = end;
    }

    parts.push(escapeHtml(chunk.slice(lastIndex)));
    return parts.join("");
  };

  const source = String(text ?? "");
  let markup = "";
  let chunkStart = 0;
  let activeQuote = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (activeQuote) {
      if (character === "\\") {
        index += 1;
        continue;
      }

      if (character === activeQuote) {
        const literal = source.slice(chunkStart, index + 1);
        markup += formatDisplayStringLiteral(literal);
        chunkStart = index + 1;
        activeQuote = null;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      markup += highlightIdentifiersInChunk(source.slice(chunkStart, index));
      chunkStart = index;
      activeQuote = character;
    }
  }

  if (chunkStart < source.length) {
    const trailingChunk = source.slice(chunkStart);
    markup += activeQuote
      ? formatDisplayStringLiteral(trailingChunk)
      : highlightIdentifiersInChunk(trailingChunk);
  }

  return markup;
};

const highlightOutputTemplateText = (text, declaredNames) => {
  const parts = [];
  const placeholderPattern = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = placeholderPattern.exec(text)) !== null) {
    const [placeholder, expression] = match;
    const start = match.index;
    const end = start + placeholder.length;

    parts.push(escapeHtml(text.slice(lastIndex, start)));
    parts.push(`{${highlightUndeclaredVariablesInText(expression, declaredNames)}}`);

    lastIndex = end;
  }

  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join("");
};

const outputPlaceholderPattern = /\{([^{}]+)\}/;

const shouldTreatOutputAsExpression = (text, declaredNames = new Set()) => {
  const rawText = String(text ?? "").trim();

  if (!rawText) {
    return false;
  }

  if (outputPlaceholderPattern.test(rawText)) {
    return false;
  }

  if (/^["'](?:\\.|(?!\1).)*\1$/.test(rawText)) {
    return true;
  }

  if (/^-?\d+(?:\.\d+)?$/.test(rawText)) {
    return true;
  }

  if (/^(true|false)$/i.test(rawText)) {
    return true;
  }

  if (declaredNames.has(rawText)) {
    return true;
  }

  if (/^[A-Za-z_][A-Za-z0-9_]*\s*\[.*\]$/.test(rawText)) {
    return true;
  }

  return /[()[\]+\-*/%<>=!&|]/.test(rawText);
};

const parseAssignmentStatement = (text) => {
  const match = String(text ?? "").match(
    /^\s*([A-Za-z_][A-Za-z0-9_]*)(?:\s*\[\s*(.+?)\s*\])?\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+)$/
  );

  if (!match) {
    return null;
  }

  const [, variableName, rawIndexExpression, operator, expression] = match;

  if (!SUPPORTED_ASSIGNMENT_OPERATORS.has(operator)) {
    return null;
  }

  const indexExpression = rawIndexExpression?.trim() ?? "";

  return {
    variableName,
    indexExpression: indexExpression || null,
    targetText: indexExpression ? `${variableName}[${indexExpression}]` : variableName,
    operator,
    expression: expression.trim(),
  };
};

const parseVariableReference = (text) => {
  const match = String(text ?? "").match(/^\s*([A-Za-z_][A-Za-z0-9_]*)(?:\s*\[\s*(.+?)\s*\])?\s*$/);

  if (!match) {
    return null;
  }

  const [, variableName, rawIndexExpression] = match;
  const indexExpression = rawIndexExpression?.trim() ?? "";

  return {
    variableName,
    indexExpression: indexExpression || null,
    targetText: indexExpression ? `${variableName}[${indexExpression}]` : variableName,
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
};

const mapExpressionOutsideStringLiterals = (expression, transform) => {
  const source = String(expression ?? "");
  let result = "";
  let chunkStart = 0;
  let activeQuote = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (activeQuote) {
      if (character === "\\") {
        index += 1;
        continue;
      }

      if (character === activeQuote) {
        result += source.slice(chunkStart, index + 1);
        chunkStart = index + 1;
        activeQuote = null;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      result += transform(source.slice(chunkStart, index));
      chunkStart = index;
      activeQuote = character;
    }
  }

  if (chunkStart < source.length) {
    const trailingChunk = source.slice(chunkStart);
    result += activeQuote ? trailingChunk : transform(trailingChunk);
  } else if (!activeQuote) {
    result += transform("");
  }

  return result;
};

const maskExpressionStringLiterals = (expression) =>
  mapExpressionOutsideStringLiterals(expression, (chunk) => chunk).replace(/(["'])(?:\\.|(?!\1).)*\1/g, (literal) => {
    const quote = literal[0];
    return `${quote}${" ".repeat(Math.max(0, literal.length - 2))}${quote}`;
  });

const normalizeExpressionSyntax = (expression) =>
  mapExpressionOutsideStringLiterals(expression, (chunk) =>
    chunk
      .replace(/\btrue\b/gi, "true")
      .replace(/\bfalse\b/gi, "false")
      .replace(/\bmod\b/gi, "%")
      .replace(/\band\b/gi, "&&")
      .replace(/\bor\b/gi, "||")
      .replace(/\bnot\b/gi, "!")
  );

const getRuntimeScope = () => {
  if (!runtimeState) {
    return {};
  }

  return Object.fromEntries(
    Array.from(runtimeState.variableValues.entries()).map(([name, value]) => [
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
    return Function("scope", `with (scope) { return (${normalizedExpression}); }`)(getRuntimeScope());
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
  const rawReference = parseVariableReference(rawText);

  if (rawReference && runtimeState?.variableMeta.has(rawReference.variableName)) {
    return formatRuntimeValue(getRuntimeReferenceValueForRead(rawReference));
  }

  if (outputPlaceholderPattern.test(rawText)) {
    return resolveOutputTemplate(rawText);
  }

  if (shouldTreatOutputAsExpression(rawText, runtimeState?.variableMeta ?? new Set())) {
    return formatRuntimeValue(evaluateRuntimeExpression(rawText));
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

  refreshExecutionUi();
};

const clearRuntimeSnapshot = () => {
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
  setRuntimeStatus(executionMode === "step" ? "Pronto" : "In corso", {
    tone: "success",
    detail: executionMode === "step" ? "Passo pronto" : "Esecuzione in corso",
  });
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
        addConsoleEntry("output", resolveRuntimeOutputValue(node.value));
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
      return;
    }

    if (mode === "run" && executionMode === "step") {
      executionMode = "run";
      setRuntimeStatus("In corso", {
        tone: "success",
        detail: "Esecuzione in corso",
      });
      refreshExecutionUi();
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
  const bodyText = getNodeBodyText(node);

  if (!bodyText) {
    return prefix.slice(0, -1);
  }

  return `${prefix}${bodyText}`.trim();
};

const getNodeMarkup = (node) => {
  const displayText = getNodeDisplayText(node);
  const bodyText = getNodeBodyText(node);
  const declaredNames = getDeclaredVariableNameSet();
  const prefixMarkup = getNodeLabelPrefixMarkup(node);
  const wrapNodeLabelContent = (content) => `<span class="node-label-content">${content}</span>`;
  const inlinePrefixMarkup = prefixMarkup ? `${prefixMarkup}&nbsp;` : "";

  if (!displayText && !bodyText) {
    return '<span aria-hidden="true">&nbsp;</span>';
  }

  if (node.type === "assign" && node.value) {
    const parsedAssignment = parseAssignmentStatement(node.value);

    if (parsedAssignment) {
      const { variableName, indexExpression, operator, expression } = parsedAssignment;
      const variableMarkup = declaredNames.has(variableName)
        ? escapeHtml(variableName)
        : `<span class="invalid-variable">${escapeHtml(variableName)}</span>`;
      const targetMarkup = indexExpression
        ? `${variableMarkup}[${highlightUndeclaredVariablesInText(indexExpression, declaredNames)}]`
        : variableMarkup;

      return wrapNodeLabelContent(`${inlinePrefixMarkup}${targetMarkup} ${escapeHtml(operator)} ${highlightUndeclaredVariablesInText(expression, declaredNames)}`);
    }
  }

  if (node.type === "input" && node.value) {
    const targetReference = parseVariableReference(node.value);

    if (!targetReference) {
      return wrapNodeLabelContent(`${inlinePrefixMarkup}${escapeHtml(String(node.value ?? ""))}`);
    }

    const variableMarkup = declaredNames.has(targetReference.variableName)
      ? escapeHtml(targetReference.variableName)
      : `<span class="invalid-variable">${escapeHtml(targetReference.variableName)}</span>`;
    const targetMarkup = targetReference.indexExpression
      ? `${variableMarkup}[${highlightUndeclaredVariablesInText(targetReference.indexExpression, declaredNames)}]`
      : variableMarkup;

    return wrapNodeLabelContent(`${inlinePrefixMarkup}${targetMarkup}`);
  }

  if (node.type === "output" && node.value) {
    const outputMarkup = shouldTreatOutputAsExpression(node.value, declaredNames)
      ? highlightUndeclaredVariablesInText(node.value, declaredNames)
      : highlightOutputTemplateText(node.value, declaredNames);
    return wrapNodeLabelContent(`${inlinePrefixMarkup}${outputMarkup}`);
  }

  if (node.type === "comment" && bodyText) {
    return wrapNodeLabelContent(`${inlinePrefixMarkup}${escapeHtml(bodyText)}`);
  }

  if ((node.type === "if" || node.type === "while" || node.type === "do") && node.value) {
    return wrapNodeLabelContent(`${inlinePrefixMarkup}${highlightUndeclaredVariablesInText(node.value, declaredNames)}`);
  }

  if (node.type === "for" && node.value) {
    return wrapNodeLabelContent(`${inlinePrefixMarkup}${highlightUndeclaredVariablesInText(node.value, declaredNames)}`);
  }

  return wrapNodeLabelContent(escapeHtml(displayText));
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

const SVG_CANVAS_MIN_WIDTH = 900;
const SVG_TOP_PADDING = 36;
const SVG_BOTTOM_PADDING = 36;
const SVG_CONNECTOR_HEIGHT = 38;
const SVG_TERMINAL_WIDTH = 146;
const SVG_TERMINAL_HEIGHT = 54;
const SVG_BRANCH_OFFSET_X = 236;
const SVG_IF_LABEL_OFFSET_X = 28;
const SVG_BRANCH_LABEL_OFFSET_Y = 10;
const SVG_BRANCH_MIN_HEIGHT = 74;
const SVG_MERGE_RADIUS = 11;
const SVG_NESTED_BRANCH_OFFSET_X = 186;
const SVG_IF_BRANCH_ENTRY_HEIGHT = 30;
const SVG_IF_BRANCH_EXIT_GAP = 16;
const SVG_LOOP_BRANCH_OFFSET_X = 210;
const SVG_LOOP_NESTED_BRANCH_OFFSET_X = 174;
const SVG_LOOP_BRANCH_ENTRY_HEIGHT = 28;
const SVG_LOOP_BRANCH_EXIT_GAP = 14;
const SVG_LOOP_BRANCH_MIN_HEIGHT = 70;
const SVG_WHILE_RETURN_OFFSET_X = 24;
const SVG_WHILE_RETURN_DESCENT = 14;
const SVG_WHILE_FALSE_LABEL_OFFSET_X = 18;
const SVG_WHILE_FALSE_LABEL_OFFSET_Y = 22;
const SVG_DO_BODY_ENTRY_HEIGHT = 20;
const SVG_DO_CONDITION_GAP = 28;
const SVG_DO_LOOP_OFFSET_X = 186;
const SVG_DO_EXIT_GAP = 16;

const SVG_NODE_TEXT_CHAR_WIDTH = 8;
const SVG_NODE_LINE_HEIGHT = 19;
const SVG_NODE_HORIZONTAL_PADDING = 24;
const SVG_NODE_VERTICAL_PADDING = 12;

const SVG_NODE_SIZE_PRESETS = {
  if: { minWidth: 192, maxWidth: 348, minHeight: 88 },
  while: { minWidth: 184, maxWidth: 332, minHeight: 64 },
  for: { minWidth: 184, maxWidth: 332, minHeight: 64 },
  do: { minWidth: 184, maxWidth: 332, minHeight: 64 },
  comment: { minWidth: 192, maxWidth: 452, minHeight: 38 },
  default: { minWidth: 160, maxWidth: 320, minHeight: 48 },
};

let svgNodeMeasurementRoot = null;
let hasScheduledFontAwareRender = false;

const getSvgNodeVerticalInset = (type) => {
  switch (type) {
    case "if":
      return 24;
    case "while":
    case "for":
    case "do":
      return 20;
    case "input":
    case "output":
      return 16;
    case "comment":
      return 8;
    default:
      return 12;
  }
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

const getSvgNodeMeasurementRoot = () => {
  if (svgNodeMeasurementRoot?.isConnected) {
    return svgNodeMeasurementRoot;
  }

  const root = document.createElement("div");
  root.setAttribute("aria-hidden", "true");
  root.style.position = "absolute";
  root.style.left = "-99999px";
  root.style.top = "0";
  root.style.visibility = "hidden";
  root.style.pointerEvents = "none";
  root.style.contain = "layout style size";

  document.body.append(root);
  svgNodeMeasurementRoot = root;
  return root;
};

const measureSvgNodeLabelHeight = (type, width, markup) => {
  const measurementRoot = getSvgNodeMeasurementRoot();
  const wrapper = document.createElement("div");
  wrapper.className = `svg-node-label svg-node-label-${type}`;
  wrapper.style.width = `${Math.max(width, 24)}px`;
  wrapper.style.height = "auto";

  const inner = document.createElement("div");
  inner.className = "svg-node-label-inner";
  inner.innerHTML = markup;
  wrapper.append(inner);
  measurementRoot.append(wrapper);

  const measuredHeight = Math.ceil(wrapper.getBoundingClientRect().height);
  wrapper.remove();
  return Math.max(measuredHeight, 24);
};

const scheduleFontAwareRender = () => {
  if (hasScheduledFontAwareRender || !("fonts" in document) || typeof document.fonts.ready?.then !== "function") {
    return;
  }

  hasScheduledFontAwareRender = true;

  document.fonts.ready
    .then(() => {
      renderFlowchart();
    })
    .catch(() => {
      // Ignore font loading failures.
    });
};

const estimateWrappedLineCount = (text, charsPerLine) => {
  if (!text) {
    return 1;
  }

  const paragraphs = text.split("\n");
  let lineCount = 0;

  paragraphs.forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);

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
  const measurementText = displayText;
  const normalizedText = measurementText.replace(/[ \t]+/g, " ").trim();
  const estimatedLongestLineLength = Math.max(
    ...measurementText.split("\n").map((line) => line.trim().length),
    1
  );
  const estimatedTextWidth = Math.max(
    preset.minWidth,
    Math.ceil(estimatedLongestLineLength * SVG_NODE_TEXT_CHAR_WIDTH + SVG_NODE_HORIZONTAL_PADDING)
  );
  const width = Math.min(preset.maxWidth, estimatedTextWidth);
  const labelBox = getSvgLabelInsets(type, width, preset.minHeight);
  const labelMarkup =
    typeof nodeOrType === "string"
      ? `<span class="node-label-content">${escapeHtml(displayText)}</span>`
      : getNodeMarkup(nodeOrType);
  const measuredContentHeight = measureSvgNodeLabelHeight(type, labelBox.width, labelMarkup);
  const contentHeight = measuredContentHeight + getSvgNodeVerticalInset(type);

  return {
    width,
    height: Math.max(preset.minHeight, contentHeight),
  };
};

const getAdaptiveConnectorHeight = (nodeOrType) => {
  const type = typeof nodeOrType === "string" ? nodeOrType : nodeOrType.type;

  if (type === "comment") {
    return SVG_CONNECTOR_HEIGHT;
  }

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

const measureSequenceHorizontalExtents = (nodes, depth = 0) => {
  if (!nodes.length) {
    return { left: 0, right: 0 };
  }

  return nodes.reduce((maxExtents, childNode) => {
    const childExtents = measureNodeHorizontalExtents(childNode, depth);
    return {
      left: Math.max(maxExtents.left, childExtents.left),
      right: Math.max(maxExtents.right, childExtents.right),
    };
  }, { left: 0, right: 0 });
};

const getIfBranchOffsets = (node, depth = 0) => {
  const baseOffset = depth === 0 ? SVG_BRANCH_OFFSET_X : SVG_NESTED_BRANCH_OFFSET_X;

  if (node.type !== "if") {
    return {
      leftOffset: baseOffset,
      rightOffset: baseOffset,
    };
  }

  const falseExtents = measureSequenceHorizontalExtents(node.branches?.falseBranch ?? [], depth + 1);
  const trueExtents = measureSequenceHorizontalExtents(node.branches?.trueBranch ?? [], depth + 1);
  const { width } = getSvgNodeSize(node);
  const minOffset = Math.max(baseOffset, Math.ceil(width / 2) + 56);

  return {
    leftOffset: Math.max(minOffset, falseExtents.right + 64),
    rightOffset: Math.max(minOffset, trueExtents.left + 64),
  };
};

const getLoopBranchOffsetX = (node, depth = 0) => {
  const baseOffset = depth === 0 ? SVG_LOOP_BRANCH_OFFSET_X : SVG_LOOP_NESTED_BRANCH_OFFSET_X;
  const bodyExtents = measureSequenceHorizontalExtents(node.branches?.body ?? [], depth + 1);
  const { width } = getSvgNodeSize(node);

  return Math.max(
    baseOffset,
    Math.ceil(width / 2) + 52,
    bodyExtents.left + 64
  );
};

const measureNodeHorizontalExtents = (node, depth = 0) => {
  const { width } = getSvgNodeSize(node);

  if (node.type === "if") {
    const { leftOffset, rightOffset } = getIfBranchOffsets(node, depth);
    const falseExtents = measureSequenceHorizontalExtents(node.branches?.falseBranch ?? [], depth + 1);
    const trueExtents = measureSequenceHorizontalExtents(node.branches?.trueBranch ?? [], depth + 1);

    return {
      left: Math.max(
        width / 2,
        leftOffset + falseExtents.left,
        Math.max(trueExtents.left - rightOffset, 0)
      ),
      right: Math.max(
        width / 2,
        rightOffset + trueExtents.right,
        Math.max(falseExtents.right - leftOffset, 0)
      ),
    };
  }

  if (node.type === "while") {
    const branchOffset = getLoopBranchOffsetX(node, depth);
    const bodyExtents = measureSequenceHorizontalExtents(node.branches?.body ?? [], depth + 1);

    return {
      left: Math.max(width / 2, Math.max(bodyExtents.left - branchOffset, 0)),
      right: Math.max(width / 2, branchOffset + bodyExtents.right),
    };
  }

  if (node.type === "for") {
    const branchOffset = getLoopBranchOffsetX(node, depth);
    const bodyExtents = measureSequenceHorizontalExtents(node.branches?.body ?? [], depth + 1);

    return {
      left: Math.max(width / 2, Math.max(bodyExtents.left - branchOffset, 0)),
      right: Math.max(width / 2, branchOffset + bodyExtents.right),
    };
  }

  if (node.type === "do") {
    return {
      left: width / 2,
      right: Math.max(width / 2, SVG_DO_LOOP_OFFSET_X + 32),
    };
  }

  return {
    left: width / 2,
    right: width / 2,
  };
};

const measureNodeHalfSpan = (node, depth = 0) => {
  const extents = measureNodeHorizontalExtents(node, depth);
  return Math.max(extents.left, extents.right);
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
  const { leftOffset, rightOffset } = getIfBranchOffsets(node, path.length);
  const falseBranchX = centerX - leftOffset;
  const trueBranchX = centerX + rightOffset;
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

const CODEGEN_INDENT = "    ";

const indentCodeLine = (level, line) => `${CODEGEN_INDENT.repeat(level)}${line}`;

const pushCodeLine = (lines, text, nodeId = null) => {
  lines.push({
    text,
    nodeId,
  });
};

const collectCodegenVariableMeta = () => {
  const variables = new Map();

  traverseNodes(flowNodes, (node) => {
    if (node.type !== "declare" || !node.declareConfig?.names?.length) {
      return;
    }

    node.declareConfig.names.forEach((name) => {
      if (!variables.has(name)) {
        variables.set(name, {
          name,
          dataType: node.declareConfig.dataType,
          isArray: Boolean(node.declareConfig.isArray),
          arrayLength: Number.isInteger(node.declareConfig.arrayLength) ? node.declareConfig.arrayLength : null,
        });
      }
    });
  });

  return variables;
};

const escapeCStringContent = (text) =>
  String(text ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, "\\n")
    .replace(/%/g, "%%");

const getPythonFStringLiteral = (template) => {
  const parts = [];
  const placeholderPattern = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match = null;

  while ((match = placeholderPattern.exec(String(template ?? ""))) !== null) {
    const [token, expression] = match;
    const literalText = String(template ?? "").slice(lastIndex, match.index);
    parts.push(literalText.replace(/\{/g, "{{").replace(/\}/g, "}}"));
    parts.push(`{${normalizeExpressionForLanguage(expression, "python") || expression.trim()}}`);
    lastIndex = match.index + token.length;
  }

  parts.push(String(template ?? "").slice(lastIndex).replace(/\{/g, "{{").replace(/\}/g, "}}"));
  return `f${JSON.stringify(parts.join(""))}`;
};

const normalizeExpressionForLanguage = (expression, language) => {
  const rawExpression = String(expression ?? "").trim();

  if (!rawExpression) {
    return "";
  }

  if (language === "python") {
    return mapExpressionOutsideStringLiterals(rawExpression, (chunk) =>
      chunk
        .replace(/\btrue\b/gi, "True")
        .replace(/\bfalse\b/gi, "False")
        .replace(/\bmod\b/gi, "%")
        .replace(/&&/g, " and ")
        .replace(/\|\|/g, " or ")
        .replace(/\bnot\b/gi, "not")
        .replace(/\band\b/gi, "and")
        .replace(/\bor\b/gi, "or")
        .replace(/!\s*(?!=)/g, "not ")
    );
  }

  return normalizeExpressionSyntax(rawExpression);
};

const inferForStepDirection = (stepExpression) => {
  const normalizedStep = String(stepExpression ?? "").trim();

  if (!normalizedStep) {
    return "positive";
  }

  const numericStep = Number(normalizedStep);

  if (Number.isFinite(numericStep) && numericStep !== 0) {
    return numericStep < 0 ? "negative" : "positive";
  }

  if (/^\(\s*-\s*.+\)$/.test(normalizedStep) || /^-\s*.+/.test(normalizedStep)) {
    return "negative";
  }

  return "positive";
};

const buildForDisplayText = ({ variable, start, end, step }) => {
  const comparator = inferForStepDirection(step) === "negative" ? ">" : "<";
  return `${variable} = ${start} to ${comparator} ${end} step ${step}`.replace(/\s+/g, " ").trim();
};

const buildForLoopHeader = ({ variableName, start, end, step }) => {
  const direction = inferForStepDirection(step);
  const comparator = direction === "negative" ? ">" : "<";

  let update = `${variableName} += ${step}`;

  if (step === "1") {
    update = `${variableName}++`;
  } else if (step === "-1") {
    update = `${variableName}--`;
  }

  return `for (${variableName} = ${start}; ${variableName} ${comparator} ${end}; ${update}) {`;
};

const getCodegenDeclarationLine = (meta, language) => {
  if (meta.isArray) {
    const arrayLength = Number.isInteger(meta.arrayLength) && meta.arrayLength > 0 ? meta.arrayLength : 1;

    switch (language) {
      case "python":
        return `${meta.name} = [None] * ${arrayLength}`;
      case "cpp": {
        const cppType = {
          Integer: "int",
          Real: "double",
          Boolean: "bool",
          String: "string",
        }[meta.dataType] ?? "auto";
        return `${cppType} ${meta.name}[${arrayLength}];`;
      }
      case "c": {
        if (meta.dataType === "String") {
          return `char ${meta.name}[${arrayLength}][256];`;
        }

        const cType = {
          Integer: "int",
          Real: "double",
          Boolean: "int",
        }[meta.dataType] ?? "int";
        return `${cType} ${meta.name}[${arrayLength}];`;
      }
      default:
        return meta.name;
    }
  }

  switch (language) {
    case "python":
      return `${meta.name} = None`;
    case "cpp": {
      const cppType = {
        Integer: "int",
        Real: "double",
        Boolean: "bool",
        String: "string",
      }[meta.dataType] ?? "auto";
      return `${cppType} ${meta.name};`;
    }
    case "c": {
      const cType = {
        Integer: "int",
        Real: "double",
        Boolean: "int",
        String: "char",
      }[meta.dataType] ?? "int";

      if (meta.dataType === "String") {
        return `${cType} ${meta.name}[256];`;
      }

      return `${cType} ${meta.name};`;
    }
    default:
      return meta.name;
  }
};

const getGroupedDeclarationLines = (node, language, variables) => {
  const declaredNames = node.declareConfig?.names ?? [];

  if (declaredNames.length === 0) {
    return [];
  }

  if (language === "python") {
    return declaredNames.map((name) => {
      const meta = variables.get(name) ?? {
        name,
        dataType: node.declareConfig?.dataType ?? "Integer",
        isArray: Boolean(node.declareConfig?.isArray),
        arrayLength: Number.isInteger(node.declareConfig?.arrayLength) ? node.declareConfig.arrayLength : null,
      };

      if (!meta.isArray) {
        return null;
      }

      return getCodegenDeclarationLine(meta, language);
    }).filter(Boolean);
  }

  const firstMeta = variables.get(declaredNames[0]) ?? {
    name: declaredNames[0],
    dataType: node.declareConfig?.dataType ?? "Integer",
    isArray: Boolean(node.declareConfig?.isArray),
    arrayLength: Number.isInteger(node.declareConfig?.arrayLength) ? node.declareConfig.arrayLength : null,
  };

  if (firstMeta.isArray) {
    return declaredNames.map((name) => {
      const meta = variables.get(name) ?? {
        name,
        dataType: node.declareConfig?.dataType ?? "Integer",
        isArray: Boolean(node.declareConfig?.isArray),
        arrayLength: Number.isInteger(node.declareConfig?.arrayLength) ? node.declareConfig.arrayLength : null,
      };
      return getCodegenDeclarationLine(meta, language);
    });
  }

  if (language === "cpp") {
    const cppType = {
      Integer: "int",
      Real: "double",
      Boolean: "bool",
      String: "string",
    }[firstMeta.dataType] ?? "auto";
    return [`${cppType} ${declaredNames.join(", ")};`];
  }

  if (firstMeta.dataType === "String") {
    return declaredNames.map((name) => `char ${name}[256];`);
  }

  const cType = {
    Integer: "int",
    Real: "double",
    Boolean: "int",
    String: "char",
  }[firstMeta.dataType] ?? "int";
  return [`${cType} ${declaredNames.join(", ")};`];
};

const getCodegenInputLine = (targetText, language, variables) => {
  const targetReference = parseVariableReference(targetText);
  const variableName = targetReference?.variableName ?? String(targetText ?? "").trim();
  const meta = variables.get(variableName) ?? { dataType: "String", isArray: false };
  const targetCode = targetReference?.targetText ?? variableName;

  if (language === "python") {
    switch (meta.dataType) {
      case "Integer":
        return `${targetCode} = int(input())`;
      case "Real":
        return `${targetCode} = float(input())`;
      case "Boolean":
        return `${targetCode} = input().strip().lower() in ("true", "1", "vero", "yes")`;
      default:
        return `${targetCode} = input()`;
    }
  }

  if (language === "cpp") {
    return `cin >> ${targetCode};`;
  }

  const isIndexedAccess = Boolean(targetReference?.indexExpression);
  const cTarget = targetCode.replace(/\s+/g, "");

  switch (meta.dataType) {
    case "Integer":
      return `scanf("%d", &${cTarget});`;
    case "Real":
      return `scanf("%lf", &${cTarget});`;
    case "Boolean":
      return `scanf("%d", &${cTarget});`;
    default:
      if (isIndexedAccess && !meta.isArray) {
        return `scanf(" %c", &${cTarget});`;
      }

      return `scanf("%255s", ${cTarget});`;
  }
};

const getCOutputPlaceholder = (expression, variables) => {
  const trimmedExpression = String(expression ?? "").trim();
  const reference = parseVariableReference(trimmedExpression);
  const meta = reference ? variables.get(reference.variableName) ?? null : null;
  const normalizedExpression = normalizeExpressionForLanguage(trimmedExpression, "c") || trimmedExpression;

  if (meta) {
    if (reference?.indexExpression) {
      if (meta.isArray) {
        switch (meta.dataType) {
          case "Integer":
            return { format: "%d", argument: normalizedExpression };
          case "Real":
            return { format: "%g", argument: normalizedExpression };
          case "Boolean":
            return { format: "%s", argument: `((${normalizedExpression}) ? "true" : "false")` };
          default:
            return { format: "%s", argument: normalizedExpression };
        }
      }

      return { format: "%c", argument: normalizedExpression };
    }

    switch (meta.dataType) {
      case "Integer":
        return { format: "%d", argument: normalizedExpression };
      case "Real":
        return { format: "%g", argument: normalizedExpression };
      case "Boolean":
        return { format: "%s", argument: `((${normalizedExpression}) ? "true" : "false")` };
      default:
        return { format: "%s", argument: normalizedExpression };
    }
  }

  if (/^(true|false|\(|!|not\b|.*(?:==|!=|<=|>=|<|>|&&|\|\|).*)$/i.test(trimmedExpression)) {
    return { format: "%s", argument: `((${normalizedExpression}) ? "true" : "false")` };
  }

  return { format: "%g", argument: normalizedExpression };
};

const getCodegenOutputLine = (template, language, variables) => {
  const rawTemplate = String(template ?? "");
  const placeholderPattern = /\{([^{}]+)\}/g;

  if (shouldTreatOutputAsExpression(rawTemplate, variables)) {
    const expression = normalizeExpressionForLanguage(rawTemplate, language) || JSON.stringify(rawTemplate);

    if (language === "python") {
      return `print(${expression})`;
    }

    if (language === "cpp") {
      return `cout << ${expression} << endl;`;
    }

    const trimmedExpression = rawTemplate.trim();
    const expressionVariableMeta = variables.get(trimmedExpression) ?? null;
    const isQuotedStringLiteral = /^".*"$/.test(trimmedExpression);
    const isQuotedCharLiteral = /^'.'$/.test(trimmedExpression);
    const isIndexedStringAccess = /^[A-Za-z_][A-Za-z0-9_]*\s*\[.*\]$/.test(trimmedExpression);
    const looksBoolean = /^(true|false|\(|!|not\b|.*(?:==|!=|<=|>=|<|>|&&|\|\|).*)$/i.test(trimmedExpression);

    let formatLiteral = '"%g\\n"';
    let argument = expression;

    if (looksBoolean) {
      formatLiteral = '"%s\\n"';
      argument = `((${expression}) ? "true" : "false")`;
    } else if (isIndexedStringAccess || isQuotedCharLiteral) {
      formatLiteral = '"%c\\n"';
    } else if (isQuotedStringLiteral || expressionVariableMeta?.dataType === "String") {
      formatLiteral = '"%s\\n"';
    } else if (expressionVariableMeta?.dataType === "Integer") {
      formatLiteral = '"%d\\n"';
    } else if (expressionVariableMeta?.dataType === "Real") {
      formatLiteral = '"%g\\n"';
    }

    return `printf(${formatLiteral}, ${argument});`;
  }

  if (language === "python") {
    return `print(${getPythonFStringLiteral(rawTemplate)})`;
  }

  const segments = [];
  let lastIndex = 0;
  let match = null;

  while ((match = placeholderPattern.exec(rawTemplate)) !== null) {
    const literalText = rawTemplate.slice(lastIndex, match.index);

    if (literalText) {
      segments.push({ type: "text", value: literalText });
    }

    segments.push({ type: "expression", value: String(match[1] ?? "").trim() });
    lastIndex = match.index + match[0].length;
  }

  const trailingText = rawTemplate.slice(lastIndex);

  if (trailingText || segments.length === 0) {
    segments.push({ type: "text", value: trailingText });
  }

  if (language === "cpp") {
    const cppParts = segments.map((segment) =>
      segment.type === "text"
        ? JSON.stringify(segment.value)
        : (normalizeExpressionForLanguage(segment.value, "cpp") || segment.value)
    );
    return `cout << ${cppParts.join(" << ")} << endl;`;
  }

  const formatParts = [];
  const argumentsList = [];

  segments.forEach((segment) => {
    if (segment.type === "text") {
      formatParts.push(escapeCStringContent(segment.value));
      return;
    }

    const placeholder = getCOutputPlaceholder(segment.value, variables);
    formatParts.push(placeholder.format);
    argumentsList.push(placeholder.argument);
  });

  const formatLiteral = `"${formatParts.join("")}\\n"`;
  return argumentsList.length > 0
    ? `printf(${formatLiteral}, ${argumentsList.join(", ")});`
    : `printf(${formatLiteral});`;
};

const getCodegenCommentLine = (text, language) => {
  const prefix = language === "python" ? "#" : "//";
  const rawText = String(text ?? "").trim();

  if (!rawText) {
    return prefix;
  }

  return rawText
    .split("\n")
    .map((line) => {
      const trimmedLine = line.trim();
      return trimmedLine ? `${prefix} ${trimmedLine}` : prefix;
    })
    .join("\n");
};

const getCodegenCallLine = (text, language) => {
  const prefix = language === "python" ? "#" : "//";
  const callText = String(text ?? "").trim() || "call";
  return `${prefix} TODO: ${callText}`;
};

const generateCodeLinesForNodes = (nodes, language, indentLevel, variables) => {
  const lines = [];

  nodes.forEach((node) => {
    switch (node.type) {
      case "declare": {
        const declarationLines = getGroupedDeclarationLines(node, language, variables);
        declarationLines.forEach((line) => {
          pushCodeLine(lines, indentCodeLine(indentLevel, line), node.id);
        });
        break;
      }
      case "assign":
        pushCodeLine(lines, indentCodeLine(indentLevel, String(node.value ?? "").trim() + (language === "python" ? "" : ";")), node.id);
        break;
      case "input":
        pushCodeLine(lines, indentCodeLine(indentLevel, getCodegenInputLine(String(node.value ?? "").trim(), language, variables)), node.id);
        break;
      case "output":
        pushCodeLine(lines, indentCodeLine(indentLevel, getCodegenOutputLine(node.value, language, variables)), node.id);
        break;
      case "comment": {
        const commentLines = getCodegenCommentLine(node.value, language).split("\n");
        commentLines.forEach((line) => {
          pushCodeLine(lines, indentCodeLine(indentLevel, line));
        });
        pushCodeLine(lines, "");
        break;
      }
      case "call":
        pushCodeLine(lines, indentCodeLine(indentLevel, getCodegenCallLine(node.value, language)));
        break;
      case "if": {
        const condition = normalizeExpressionForLanguage(node.value, language) || "false";
        const trueBranch = node.branches?.trueBranch ?? [];
        const falseBranch = node.branches?.falseBranch ?? [];

        if (language === "python") {
          pushCodeLine(lines, indentCodeLine(indentLevel, `if ${condition}:`), node.id);
          if (trueBranch.length > 0) {
            lines.push(...generateCodeLinesForNodes(trueBranch, language, indentLevel + 1, variables));
          } else {
            pushCodeLine(lines, indentCodeLine(indentLevel + 1, "pass"));
          }
          if (falseBranch.length > 0) {
            pushCodeLine(lines, indentCodeLine(indentLevel, "else:"));
            lines.push(...generateCodeLinesForNodes(falseBranch, language, indentLevel + 1, variables));
          }
          break;
        }

        pushCodeLine(lines, indentCodeLine(indentLevel, `if (${condition}) {`), node.id);
        lines.push(...generateCodeLinesForNodes(trueBranch, language, indentLevel + 1, variables));
        pushCodeLine(lines, indentCodeLine(indentLevel, "}"));

        if (falseBranch.length > 0) {
          lines[lines.length - 1].text = indentCodeLine(indentLevel, "} else {");
          lines.push(...generateCodeLinesForNodes(falseBranch, language, indentLevel + 1, variables));
          pushCodeLine(lines, indentCodeLine(indentLevel, "}"));
        }
        break;
      }
      case "while": {
        const condition = normalizeExpressionForLanguage(node.value, language) || "false";
        const body = node.branches?.body ?? [];
        if (language === "python") {
          pushCodeLine(lines, indentCodeLine(indentLevel, `while ${condition}:`), node.id);
          lines.push(...(body.length > 0 ? generateCodeLinesForNodes(body, language, indentLevel + 1, variables) : [{ text: indentCodeLine(indentLevel + 1, "pass"), nodeId: null }]));
          break;
        }

        pushCodeLine(lines, indentCodeLine(indentLevel, `while (${condition}) {`), node.id);
        lines.push(...generateCodeLinesForNodes(body, language, indentLevel + 1, variables));
        pushCodeLine(lines, indentCodeLine(indentLevel, "}"));
        break;
      }
      case "for": {
        const config = node.forConfig ?? {};
        const variableName = String(config.variable ?? "").trim() || "i";
        const start = normalizeExpressionForLanguage(config.start, language) || "0";
        const end = normalizeExpressionForLanguage(config.end, language) || "0";
        const step = normalizeExpressionForLanguage(config.step, language) || "1";
        const body = node.branches?.body ?? [];

        if (language === "python") {
          pushCodeLine(lines, indentCodeLine(indentLevel, `for ${variableName} in range(${start}, ${end}, ${step}):`), node.id);
          lines.push(...(body.length > 0 ? generateCodeLinesForNodes(body, language, indentLevel + 1, variables) : [{ text: indentCodeLine(indentLevel + 1, "pass"), nodeId: null }]));
          break;
        }

        pushCodeLine(lines, indentCodeLine(
          indentLevel,
          buildForLoopHeader({ variableName, start, end, step })
        ), node.id);
        lines.push(...generateCodeLinesForNodes(body, language, indentLevel + 1, variables));
        pushCodeLine(lines, indentCodeLine(indentLevel, "}"));
        break;
      }
      case "do": {
        const condition = normalizeExpressionForLanguage(node.value, language) || "false";
        const body = node.branches?.body ?? [];

        if (language === "python") {
          pushCodeLine(lines, indentCodeLine(indentLevel, "while True:"), node.id);
          if (body.length > 0) {
            lines.push(...generateCodeLinesForNodes(body, language, indentLevel + 1, variables));
          }
          pushCodeLine(lines, indentCodeLine(indentLevel + 1, `if not (${condition}):`), node.id);
          pushCodeLine(lines, indentCodeLine(indentLevel + 2, "break"));
          break;
        }

        pushCodeLine(lines, indentCodeLine(indentLevel, "do {"), node.id);
        lines.push(...generateCodeLinesForNodes(body, language, indentLevel + 1, variables));
        pushCodeLine(lines, indentCodeLine(indentLevel, `} while (${condition});`), node.id);
        break;
      }
      default:
        pushCodeLine(lines, indentCodeLine(indentLevel, getCodegenCommentLine(`Nodo ${node.type} non supportato`, language)));
        break;
    }
  });

  return lines;
};

const buildProgramCodeDocument = (language) => {
  const variables = collectCodegenVariableMeta();
  const bodyLines = generateCodeLinesForNodes(flowNodes, language, language === "python" ? 0 : 1, variables);

  if (language === "python") {
    const lines = bodyLines.length > 0 ? bodyLines : [{ text: "# Diagramma vuoto", nodeId: null }];
    return {
      code: lines.map((line) => line.text).join("\n"),
      lines,
    };
  }

  const includes = language === "cpp"
    ? [
        { text: "#include <iostream>", nodeId: null },
        { text: "#include <string>", nodeId: null },
        { text: "", nodeId: null },
        { text: "using namespace std;", nodeId: null },
        { text: "", nodeId: null },
      ]
    : [
        { text: "#include <stdio.h>", nodeId: null },
        { text: "", nodeId: null },
      ];

  const mainHeader = language === "cpp" ? "int main() {" : "int main(void) {";
  const footerLines = [
    { text: indentCodeLine(1, "return 0;"), nodeId: null },
    { text: "}", nodeId: null },
  ];
  const effectiveBody = bodyLines.length > 0 ? bodyLines : [{ text: indentCodeLine(1, "// Diagramma vuoto"), nodeId: null }];
  const lines = [
    ...includes,
    { text: mainHeader, nodeId: null },
    ...effectiveBody,
    ...footerLines,
  ];

  return {
    code: lines.map((line) => line.text).join("\n"),
    lines,
  };
};

const renderCodePreview = () => {
  if (!codePreviewContent) {
    return;
  }

  const codeDocument = buildProgramCodeDocument(selectedCodeLanguage);
  currentCodePreviewLines = codeDocument.lines;
  codePreviewContent.innerHTML = currentCodePreviewLines
    .map((line, index) => {
      const isExecuting = line.nodeId != null && line.nodeId === executionCursor;
      const lineText = line.text.length > 0 ? escapeHtml(line.text) : "&nbsp;";
      return `<span class="code-line${isExecuting ? " is-executing" : ""}" data-line-index="${index}"${line.nodeId != null ? ` data-node-id="${line.nodeId}"` : ""}>${lineText}</span>`;
    })
    .join("");
  syncCodeExecutionHighlight();
};

const syncCodeExecutionHighlight = () => {
  if (!codePreviewContent) {
    return;
  }

  let firstActiveLine = null;

  codePreviewContent.querySelectorAll(".code-line").forEach((lineElement) => {
    const nodeId = Number(lineElement.getAttribute("data-node-id") ?? "");
    const isExecuting = Number.isFinite(nodeId) && nodeId === executionCursor;
    lineElement.classList.toggle("is-executing", isExecuting);

    if (isExecuting && !firstActiveLine) {
      firstActiveLine = lineElement;
    }
  });

  if (firstActiveLine instanceof HTMLElement) {
    firstActiveLine.scrollIntoView({
      block: "nearest",
    });
  }
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

  renderCodePreview();
  refreshExecutionUi();
  syncUndoButton();
};

const openInsertDialog = (insertIndex, sourceButton) => {
  if (isProgramRunning) {
    return;
  }

  pendingInsertTarget = insertIndex;
  lastConnectorButton = sourceButton;
  syncInsertPasteButton();
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

const syncInsertPasteButton = () => {
  if (!insertPasteButton) {
    return;
  }

  const hasClipboardNodes = Boolean(flowClipboard?.nodes?.length);
  insertPasteButton.disabled = !hasClipboardNodes;
  insertPasteButton.setAttribute("aria-disabled", String(!hasClipboardNodes));
  insertPasteButton.title = hasClipboardNodes
    ? "Incolla i nodi copiati in questo punto"
    : "Copia o taglia prima uno o più nodi";
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
  const isLongText = node.type === "output" || node.type === "comment";

  genericPropertyField.hidden = isDeclare || isFor;
  genericPropertyField.classList.toggle("is-output", isLongText);
  propertyInput.dataset.autosize = String(isLongText);
  declareFields.hidden = !isDeclare;
  forFields.hidden = !isFor;
  mountAssignSuggestions();

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
      arrayLength: null,
    };

    declareNameInput.value = declareConfig.names.join(", ");
    declareArrayInput.checked = Boolean(declareConfig.isArray);
    if (declareArrayLengthField) {
      declareArrayLengthField.hidden = !declareConfig.isArray;
    }
    if (declareArrayLengthInput) {
      declareArrayLengthInput.value = declareConfig.isArray && Number.isInteger(declareConfig.arrayLength)
        ? String(declareConfig.arrayLength)
        : "";
    }
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
    syncPropertyInputSize();

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
    node.value = buildForDisplayText({ variable, start, end, step });
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

  const getTouchDistance = (firstTouch, secondTouch) =>
    Math.hypot(secondTouch.clientX - firstTouch.clientX, secondTouch.clientY - firstTouch.clientY);

  const getTouchCenter = (firstTouch, secondTouch) => ({
    x: (firstTouch.clientX + secondTouch.clientX) / 2,
    y: (firstTouch.clientY + secondTouch.clientY) / 2,
  });

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
      if (error instanceof DOMException && error.name === "AbortError") {
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

if (themeToggleButton) {
  themeToggleButton.addEventListener("click", () => {
    applyTheme(currentTheme === "dark" ? "light" : "dark");
    saveThemePreference();
  });
}

window.addEventListener("resize", () => {
  syncResponsiveDiagramZoom();
  syncMobileSidebarView();
  scheduleLayoutAwareRender();
});

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
loadNodeLabelPreference();
loadFlowchartState();
loadHistoryState();
loadCodeLanguagePreference();
syncCodeLanguageTabs();
syncFocusModeButton();
syncMobileSidebarView();
syncResponsiveDiagramZoom({ force: true });
setActiveMainView(loadMainViewPreference());
renderFlowchart();
scheduleLayoutAwareRender();
scheduleFontAwareRender();
syncExecutionControls();
