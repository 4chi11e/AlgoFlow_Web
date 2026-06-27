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
let pendingRunDelayTimer = null;
let pendingRunDelayResolver = null;
let runExecutionDelayMs = 0;
let isWorkspaceSplitManual = false;
let isSidebarSplitManual = false;
let pendingSidebarAutoSyncFrame = null;
let selectedCodeLanguage = "c";
let codeZoom = 1;
let currentTheme = "light";
let isMobileTopbarMenuOpen = false;
let isDiagramFocusMode = false;
let mobileSidebarView = "terminal";
let isTouchSelectionUiForced = false;
let isMobileMultiSelectMode = false;
let pendingLayoutAwareRenderFrame = null;
let currentDiagramZoomPreset = null;
let touchPinchState = null;
let codeTouchPinchState = null;
let currentCodePreviewLines = [];
let zoomIndicatorHideTimer = null;
let zoomIndicatorConcealTimer = null;

const RUNTIME_UNDECLARED = Symbol("runtime-undeclared");
const MAX_RUNTIME_OPERATIONS = 10000;
const RUN_MODE_UI_UPDATE_INTERVAL = 25;
const SUPPORTED_ASSIGNMENT_OPERATORS = new Set(["=", "+=", "-=", "*=", "/=", "%="]);

const MIN_DIAGRAM_ZOOM = 0.18;
const MAX_DIAGRAM_ZOOM = 2.8;
const DIAGRAM_ZOOM_STEP = 0.1;
const DIAGRAM_ZOOM_PRESETS = {
  desktop: 0.9,
  compact: 0.8,
  phone: 0.68,
};
const MIN_CODE_ZOOM = 0.2;
const MAX_CODE_ZOOM = 3;
const CODE_ZOOM_STEP = 0.1;
