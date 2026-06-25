const getNodeDisplayText = (node) => {
  const prefix = getNodeLabelPrefix(node);
  const bodyText = getNodeBodyText(node);

  if (!bodyText) {
    return prefix.slice(0, -1);
  }

  if (node.type === "output") {
    return `${prefix}${bodyText}`;
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
    const outputMarkup = highlightOutputTemplateText(node.value, declaredNames);
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
