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

  const transformRandomCallsForLanguage = (source) =>
    transformRandomFunctionCalls(source, (args) => {
      const normalizedArgs = args.map((arg) => normalizeExpressionForLanguage(arg, language) || arg);

      if (language === "python") {
        if (normalizedArgs.length === 1) {
          return `_algoflow_random_range(${normalizedArgs[0]})`;
        }
      }

      if (language === "c" || language === "cpp") {
        if (normalizedArgs.length === 1) {
          return `algoflow_random_range(${normalizedArgs[0]})`;
        }
      }

      return `random(${normalizedArgs.join(", ")})`;
    });

  if (language === "python") {
    const normalizedExpression = mapExpressionOutsideStringLiterals(rawExpression, (chunk) =>
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

    return transformRandomCallsForLanguage(normalizedExpression);
  }

  return transformRandomCallsForLanguage(normalizeExpressionSyntax(rawExpression));
};

const getCodegenAssignmentLine = (text, language) => {
  const assignment = parseAssignmentStatement(text);

  if (!assignment) {
    return String(text ?? "").trim() + (language === "python" ? "" : ";");
  }

  const normalizedIndex = assignment.indexExpression
    ? normalizeExpressionForLanguage(assignment.indexExpression, language) || assignment.indexExpression
    : "";
  const normalizedExpression = normalizeExpressionForLanguage(assignment.expression, language) || assignment.expression;
  const target = normalizedIndex
    ? `${assignment.variableName}[${normalizedIndex}]`
    : assignment.variableName;

  return `${target} ${assignment.operator} ${normalizedExpression}` + (language === "python" ? "" : ";");
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

const getForComparator = (stepExpression, includeEnd = true) => {
  const isNegative = inferForStepDirection(stepExpression) === "negative";

  if (isNegative) {
    return includeEnd ? ">=" : ">";
  }

  return includeEnd ? "<=" : "<";
};

const buildForDisplayText = ({ variable, start, end, step, includeEnd = true }) => {
  const comparator = getForComparator(step, includeEnd);
  return `${variable} = ${start} to ${comparator} ${end} step ${step}`.replace(/\s+/g, " ").trim();
};

const buildForLoopHeader = ({ variableName, start, end, step, includeEnd = true }) => {
  const direction = inferForStepDirection(step);
  const comparator = getForComparator(step, includeEnd);

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

  if (/\balgoflow_random_range\s*\(/.test(normalizedExpression)) {
    return { format: "%d", argument: normalizedExpression };
  }

  return { format: "%g", argument: normalizedExpression };
};

const getCodegenOutputLine = (template, language, variables, appendNewline = true) => {
  const rawTemplate = String(template ?? "");
  const placeholderPattern = /\{([^{}]+)\}/g;

  if (language === "python") {
    return appendNewline
      ? `print(${getPythonFStringLiteral(rawTemplate)})`
      : `print(${getPythonFStringLiteral(rawTemplate)}, end="")`;
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
    return appendNewline
      ? `cout << ${cppParts.join(" << ")} << endl;`
      : `cout << ${cppParts.join(" << ")};`;
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

  const formatLiteral = `"${formatParts.join("")}${appendNewline ? "\\n" : ""}"`;
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
        pushCodeLine(lines, indentCodeLine(indentLevel, getCodegenAssignmentLine(node.value, language)), node.id);
        break;
      case "input":
        pushCodeLine(lines, indentCodeLine(indentLevel, getCodegenInputLine(String(node.value ?? "").trim(), language, variables)), node.id);
        break;
      case "output":
        pushCodeLine(
          lines,
          indentCodeLine(
            indentLevel,
            getCodegenOutputLine(node.value, language, variables, node.outputConfig?.appendNewline !== false)
          ),
          node.id
        );
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
        const includeEnd = config.includeEnd !== false;
        const body = node.branches?.body ?? [];

        if (language === "python") {
          const pythonEnd = includeEnd
            ? `(${end}) + (1 if (${step}) > 0 else -1)`
            : end;
          pushCodeLine(lines, indentCodeLine(indentLevel, `for ${variableName} in range(${start}, ${pythonEnd}, ${step}):`), node.id);
          lines.push(...(body.length > 0 ? generateCodeLinesForNodes(body, language, indentLevel + 1, variables) : [{ text: indentCodeLine(indentLevel + 1, "pass"), nodeId: null }]));
          break;
        }

        pushCodeLine(lines, indentCodeLine(
          indentLevel,
          buildForLoopHeader({ variableName, start, end, step, includeEnd })
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
  const usesRandom = bodyLines.some((line) => /_algoflow_random_|algoflow_random_/.test(line.text));

  if (language === "python") {
    const lines = bodyLines.length > 0 ? bodyLines : [{ text: "# Diagramma vuoto", nodeId: null }];
    const randomHelperLines = usesRandom
      ? [
          { text: "import random as _algoflow_random", nodeId: null },
          { text: "", nodeId: null },
          { text: "def _algoflow_random_range(range_value):", nodeId: null },
          { text: "    return _algoflow_random.randrange(int(range_value))", nodeId: null },
          { text: "", nodeId: null },
        ]
      : [];
    const codeLines = [...randomHelperLines, ...lines];

    return {
      code: codeLines.map((line) => line.text).join("\n"),
      lines: codeLines,
    };
  }

  const includes = language === "cpp"
    ? [
        { text: "#include <iostream>", nodeId: null },
        { text: "#include <string>", nodeId: null },
        ...(usesRandom
          ? [
              { text: "#include <cstdlib>", nodeId: null },
              { text: "#include <ctime>", nodeId: null },
            ]
          : []),
        { text: "", nodeId: null },
        { text: "using namespace std;", nodeId: null },
        { text: "", nodeId: null },
      ]
    : [
        { text: "#include <stdio.h>", nodeId: null },
        ...(usesRandom
          ? [
              { text: "#include <stdlib.h>", nodeId: null },
              { text: "#include <time.h>", nodeId: null },
            ]
          : []),
        { text: "", nodeId: null },
      ];

  const randomHelperLines = usesRandom
    ? language === "cpp"
      ? [
          { text: "int algoflow_random_range(int rangeValue) {", nodeId: null },
          { text: "    return std::rand() % rangeValue;", nodeId: null },
          { text: "}", nodeId: null },
          { text: "", nodeId: null },
        ]
      : [
          { text: "int algoflow_random_range(int rangeValue) {", nodeId: null },
          { text: "    return rand() % rangeValue;", nodeId: null },
          { text: "}", nodeId: null },
          { text: "", nodeId: null },
        ]
    : [];

  const mainHeader = language === "cpp" ? "int main() {" : "int main(void) {";
  const setupLines = usesRandom
    ? [{ text: indentCodeLine(1, language === "cpp" ? "std::srand((unsigned)std::time(nullptr));" : "srand((unsigned)time(NULL));"), nodeId: null }]
    : [];
  const footerLines = [
    { text: indentCodeLine(1, "return 0;"), nodeId: null },
    { text: "}", nodeId: null },
  ];
  const effectiveBody = bodyLines.length > 0 ? bodyLines : [{ text: indentCodeLine(1, "// Diagramma vuoto"), nodeId: null }];
  const lines = [
    ...includes,
    ...randomHelperLines,
    { text: mainHeader, nodeId: null },
    ...setupLines,
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
