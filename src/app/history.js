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
  const rawMessage = error instanceof Error ? error.message : String(error ?? "");
  const normalizedMessage = rawMessage.toLowerCase();
  const domErrorName = error instanceof DOMException ? error.name : "";

  if (
    domErrorName === "NoModificationAllowedError" ||
    domErrorName === "InvalidStateError" ||
    domErrorName === "NotAllowedError" ||
    domErrorName === "SecurityError" ||
    normalizedMessage.includes("access denied") ||
    normalizedMessage.includes("access is denied") ||
    normalizedMessage.includes("permission denied") ||
    normalizedMessage.includes("operation not permitted") ||
    normalizedMessage.includes("eacces") ||
    normalizedMessage.includes("eperm") ||
    normalizedMessage.includes("ebusy") ||
    normalizedMessage.includes("being used by another process") ||
    normalizedMessage.includes("used by another process") ||
    normalizedMessage.includes("in use") ||
    normalizedMessage.includes("failed to create or truncate file") ||
    normalizedMessage.includes("create or truncate file") ||
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

const isAlgoFlowUserCancelledSavePicker = (error) => {
  if (!(error instanceof DOMException) || error.name !== "AbortError") {
    return false;
  }

  const message = String(error.message ?? "").toLowerCase();

  if (
    message.includes("create or truncate file") ||
    message.includes("failed to create") ||
    message.includes("access denied") ||
    message.includes("permission denied") ||
    message.includes("locked") ||
    message.includes("in use")
  ) {
    return false;
  }

  return true;
};

const showAlgoFlowSaveErrorAlert = (error) => {
  const saveError = getAlgoFlowSaveError(error);

  try {
    window.alert(saveError.message);
  } catch {
    // Ignore alert failures and still propagate the mapped error.
  }

  saveError.algoFlowAlreadyNotified = true;
  return saveError;
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
    let fileHandle;

    try {
      fileHandle = await window.showSaveFilePicker({
        ...pickerOptions,
        suggestedName: getSuggestedPdfFileName(),
      });
    } catch (error) {
      if (isAlgoFlowUserCancelledSavePicker(error)) {
        return;
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw showAlgoFlowSaveErrorAlert(error);
      }

      throw error;
    }

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

      throw showAlgoFlowSaveErrorAlert(error);
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
