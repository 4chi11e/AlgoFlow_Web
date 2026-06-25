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
