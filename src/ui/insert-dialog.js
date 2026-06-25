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
