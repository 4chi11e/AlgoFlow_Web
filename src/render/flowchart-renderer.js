const renderSvgTopLevelNode = (node, y, path, centerX) => renderSvgNodeBlockAt(node, y, path, centerX);

const syncDiagramExecutionHighlight = () => {
  if (!flowchartRoot) {
    return;
  }

  const activeNodes = flowchartRoot.querySelectorAll(".svg-node.is-executing");
  const targetNodeId = executionCursor >= 0 ? String(executionCursor) : null;
  const alreadySynced =
    targetNodeId != null &&
    activeNodes.length === 1 &&
    activeNodes[0].getAttribute("data-node-id") === targetNodeId;

  if (alreadySynced || (targetNodeId == null && activeNodes.length === 0)) {
    return;
  }

  activeNodes.forEach((node) => node.classList.remove("is-executing"));

  if (targetNodeId != null) {
    flowchartRoot
      .querySelector(`.svg-node[data-node-id="${targetNodeId}"]`)
      ?.classList.add("is-executing");
  }
};

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
  syncMobileSelectionControls();
};
