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

const getDoLoopBranchOffsetX = (node, depth = 0) => {
  const bodyExtents = measureSequenceHorizontalExtents(node.branches?.body ?? [], depth + 1);
  const { width } = getSvgNodeSize(node);

  return Math.max(
    SVG_DO_LOOP_OFFSET_X,
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
    const branchOffset = getDoLoopBranchOffsetX(node, depth);
    const bodyExtents = measureSequenceHorizontalExtents(node.branches?.body ?? [], depth + 1);

    return {
      left: Math.max(width / 2, Math.max(bodyExtents.left - branchOffset, 0)),
      right: Math.max(width / 2, branchOffset + bodyExtents.right, branchOffset + 32),
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
  const bodyX = centerX + getDoLoopBranchOffsetX(node, path.length);
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
