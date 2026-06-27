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

const normalizeExpressionForFlowgorithm = (expression) =>
  transformRandomFunctionCalls(String(expression ?? ""), (args) => {
    const normalizedArgs = args.map((arg) => normalizeExpressionForFlowgorithm(arg));
    return `Random(${normalizedArgs.join(", ")})`;
  });

const formatTemplateAsFlowgorithmOutputExpression = (template) => {
  const parts = [];
  const placeholderPattern = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match = null;

  while ((match = placeholderPattern.exec(String(template ?? ""))) !== null) {
    const literalText = String(template ?? "").slice(lastIndex, match.index);

    if (literalText) {
      parts.push(`"${escapeFlowgorithmStringLiteral(literalText)}"`);
    }

    parts.push(normalizeExpressionForFlowgorithm(match[1].trim()));
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

  const targetText = parsedAssignment.indexExpression
    ? `${parsedAssignment.variableName}[${normalizeExpressionForFlowgorithm(parsedAssignment.indexExpression)}]`
    : parsedAssignment.variableName;
  const expression = normalizeExpressionForFlowgorithm(parsedAssignment.expression);

  if (parsedAssignment.operator === "=") {
    return {
      ...parsedAssignment,
      variableName: targetText,
      expression,
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
    variableName: targetText,
    operator: "=",
    expression: `${targetText} ${mappedOperator} (${expression})`,
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
        {
          const appendNewline = node.outputConfig?.appendNewline !== false;
        lines.push(
          `${indent}<output expression="${escapeXmlAttribute(formatTemplateAsFlowgorithmOutputExpression(node.value))}" newline="${appendNewline ? "True" : "False"}"/>`
        );
        break;
        }
      case "comment":
        lines.push(`${indent}<comment text="${escapeXmlAttribute(node.value)}"/>`);
        break;
      case "call":
        lines.push(`${indent}<call expression="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(node.value))}"/>`);
        break;
      case "if": {
        lines.push(`${indent}<if expression="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(node.value))}">`);
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
        lines.push(`${indent}<while expression="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(node.value))}">`);
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.body ?? [], indentLevel + 1));
        lines.push(`${indent}</while>`);
        break;
      case "for": {
        const config = node.forConfig ?? {};
        const includeEndText = config.includeEnd === false ? "False" : "True";
        lines.push(
          `${indent}<for variable="${escapeXmlAttribute(config.variable ?? "")}" start="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(config.start ?? ""))}" end="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(config.end ?? ""))}" step="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(config.step ?? "1"))}" algoflow-inclusive="${includeEndText}">`
        );
        lines.push(...exportNodesToFlowgorithmXml(node.branches?.body ?? [], indentLevel + 1));
        lines.push(`${indent}</for>`);
        break;
      }
      case "do":
        lines.push(`${indent}<do expression="${escapeXmlAttribute(normalizeExpressionForFlowgorithm(node.value))}">`);
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

    return `{${normalizeImportedFlowgorithmExpression(token)}}`;
  }).join("");
};

const normalizeImportedFlowgorithmExpression = (expression) => {
  const normalizedExpression = normalizeExpressionSyntax(expression);

  return transformRandomFunctionCalls(normalizedExpression, (args) => {
    const normalizedArgs = args.map((arg) => normalizeImportedFlowgorithmExpression(arg));
    return `random(${normalizedArgs.join(", ")})`;
  });
};

const inferImportedForStep = (forElement) => {
  const rawStep = String(forElement.getAttribute("step") ?? "").trim();

  const directionHint = String(
    forElement.getAttribute("direction") ??
    forElement.getAttribute("dir") ??
    forElement.getAttribute("type") ??
    ""
  ).trim().toLowerCase();

  const isDirectionNegative = [
    "down",
    "downto",
    "desc",
    "dec",
    "decrement",
    "decreasing",
    "reverse",
    "backward",
  ].includes(directionHint);

  const isDirectionPositive = [
    "up",
    "upto",
    "asc",
    "inc",
    "increment",
    "increasing",
    "forward",
  ].includes(directionHint);

  if (rawStep) {
    const numericStep = Number(rawStep);

    if (Number.isFinite(numericStep) && numericStep !== 0) {
      if (isDirectionNegative) {
        return String(-Math.abs(numericStep));
      }

      if (isDirectionPositive) {
        return String(Math.abs(numericStep));
      }

      return rawStep;
    }

    if (isDirectionNegative && !/^\s*-/.test(rawStep)) {
      return `-(${rawStep})`;
    }

    return rawStep;
  }

  if (isDirectionNegative) {
    return "-1";
  }

  if (isDirectionPositive) {
    return "1";
  }

  const startValue = Number(String(forElement.getAttribute("start") ?? "").trim());
  const endValue = Number(String(forElement.getAttribute("end") ?? "").trim());

  if (Number.isFinite(startValue) && Number.isFinite(endValue) && startValue > endValue) {
    return "-1";
  }

  return "1";
};

const inferImportedForIncludeEnd = (forElement) => {
  const rawInclusive = String(
    forElement.getAttribute("algoflow-inclusive") ??
    forElement.getAttribute("inclusive") ??
    ""
  ).trim().toLowerCase();

  if (!rawInclusive) {
    return true;
  }

  if (["false", "0", "no", "off"].includes(rawInclusive)) {
    return false;
  }

  return true;
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
          value: `${element.getAttribute("variable") || ""} = ${normalizeImportedFlowgorithmExpression(element.getAttribute("expression") || "")}`.trim(),
        };
      case "input":
        return {
          type: "input",
          value: element.getAttribute("variable") || "",
        };
      case "output":
        {
          const newlineAttribute = String(element.getAttribute("newline") ?? "").trim().toLowerCase();
          const appendNewline = newlineAttribute
            ? !["false", "0", "no", "off"].includes(newlineAttribute)
            : true;
        return {
          type: "output",
          value: convertFlowgorithmOutputExpressionToTemplate(element.getAttribute("expression") || ""),
          outputConfig: {
            appendNewline,
          },
        };
        }
      case "comment":
        return {
          type: "comment",
          value: element.getAttribute("text") || "",
        };
      case "call":
        return {
          type: "call",
          value: normalizeImportedFlowgorithmExpression(element.getAttribute("expression") || ""),
        };
      case "if":
        return {
          type: "if",
          value: normalizeImportedFlowgorithmExpression(element.getAttribute("expression") || ""),
          branches: {
            trueBranch: getDirectChildElement(element, "then") ? importFlowgorithmSequence(getDirectChildElement(element, "then")) : [],
            falseBranch: getDirectChildElement(element, "else") ? importFlowgorithmSequence(getDirectChildElement(element, "else")) : [],
          },
        };
      case "while":
        return {
          type: "while",
          value: normalizeImportedFlowgorithmExpression(element.getAttribute("expression") || ""),
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
            start: normalizeImportedFlowgorithmExpression(element.getAttribute("start") || ""),
            end: normalizeImportedFlowgorithmExpression(element.getAttribute("end") || ""),
            step: inferImportedForStep(element),
            includeEnd: inferImportedForIncludeEnd(element),
          },
          branches: {
            body: importFlowgorithmSequence(element),
          },
        };
      case "do":
        return {
          type: "do",
          value: normalizeImportedFlowgorithmExpression(element.getAttribute("expression") || ""),
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
        node.forConfig = { variable: "", start: "", end: "", step: "1", includeEnd: true };
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
