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
      includeEnd: node.forConfig.includeEnd !== false,
    };
  }

  if (node.outputConfig) {
    serializedNode.outputConfig = {
      appendNewline: node.outputConfig.appendNewline !== false,
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
          includeEnd: rawNode.forConfig.includeEnd !== false,
        }
      : {
          variable: "",
          start: "",
          end: "",
          step: "",
          includeEnd: true,
        };
  }

  if (rawNode.type === "output") {
    normalizedNode.outputConfig = rawNode.outputConfig
      ? {
          appendNewline: rawNode.outputConfig.appendNewline !== false,
        }
      : {
          appendNewline: true,
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

const migrateLegacyRandomRangeSyntax = (text) =>
  String(text ?? "").replace(/\brandom\s*\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/gi, (_, minValue, maxValue) => {
    const min = Number(minValue);
    const max = Number(maxValue);
    const range = max - min + 1;

    if (!Number.isFinite(range) || range <= 0) {
      return `random(${minValue}, ${maxValue})`;
    }

    return min === 0
      ? `random(${range})`
      : `random(${range}) + ${min}`;
  });

const migrateLegacyRandomSyntaxInNodes = (nodes) => {
  nodes.forEach((node) => {
    if (typeof node.value === "string") {
      node.value = migrateLegacyRandomRangeSyntax(node.value);
    }

    if (node.forConfig) {
      node.forConfig.start = migrateLegacyRandomRangeSyntax(node.forConfig.start);
      node.forConfig.end = migrateLegacyRandomRangeSyntax(node.forConfig.end);
      node.forConfig.step = migrateLegacyRandomRangeSyntax(node.forConfig.step);
    }

    if (node.branches) {
      Object.values(node.branches).forEach((branchNodes) => migrateLegacyRandomSyntaxInNodes(branchNodes));
    }
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
        const { variable, start, end, step, includeEnd } = node.forConfig;
        node.value = buildForDisplayText({ variable, start, end, step, includeEnd });
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
  migrateLegacyRandomSyntaxInNodes(validNodes);

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
