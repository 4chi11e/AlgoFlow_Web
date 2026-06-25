const getNodeDefinition = (type) => nodeDefinitions[type];

const getDeclaredVariableNames = () => {
  const names = [];
  const seen = new Set();

  traverseNodes(flowNodes, (node) => {
    if (node.type !== "declare" || !node.declareConfig?.names) {
      return;
    }

    node.declareConfig.names.forEach((declaredName) => {
      const variableName = declaredName.trim();

      if (!variableName || seen.has(variableName)) {
        return;
      }

      seen.add(variableName);
      names.push(variableName);
    });
  });

  return names;
};

const getDeclaredVariableNameSet = () => new Set(getDeclaredVariableNames());
const reservedWords = new Set([
  "true",
  "false",
  "and",
  "or",
  "not",
  "mod",
  "random",
  "to",
  "step",
]);
const reservedLanguageNames = new Set([
  "alignas", "alignof", "and", "and_eq", "asm", "assert", "auto", "bitand", "bitor", "bool",
  "break", "case", "catch", "char", "char8_t", "char16_t", "char32_t", "class", "compl",
  "concept", "const", "consteval", "constexpr", "constinit", "const_cast", "continue", "co_await",
  "co_return", "co_yield", "decltype", "default", "delete", "do", "double", "dynamic_cast", "else",
  "enum", "explicit", "export", "extern", "false", "float", "for", "friend", "goto", "if", "inline",
  "int", "long", "mutable", "namespace", "new", "noexcept", "not", "not_eq", "nullptr", "operator",
  "or", "or_eq", "private", "protected", "public", "register", "reinterpret_cast", "requires",
  "return", "short", "signed", "sizeof", "static", "static_assert", "static_cast", "struct", "switch",
  "template", "this", "thread_local", "throw", "true", "try", "typedef", "typeid", "typename",
  "union", "unsigned", "using", "virtual", "void", "volatile", "wchar_t", "while", "xor", "xor_eq",
  "_alignas", "_alignof", "_atomic", "_bitint", "_bool", "_complex", "_decimal128", "_decimal32",
  "_decimal64", "_generic", "_imaginary", "_noreturn", "_static_assert", "_thread_local",
  "as", "assert", "async", "await", "breakpoint", "class", "continue", "def", "del", "elif", "else",
  "except", "finally", "from", "global", "import", "in", "is", "lambda", "match", "None", "nonlocal",
  "pass", "raise", "True", "False", "try", "type", "with", "yield",
]);

const hidePropertyError = () => {
  if (!propertyError) {
    return;
  }

  propertyError.hidden = true;

  if (propertyErrorText) {
    propertyErrorText.textContent = "";
  }
};

const showPropertyError = (message) => {
  if (!propertyError) {
    return;
  }

  propertyError.hidden = false;

  if (propertyErrorText) {
    propertyErrorText.textContent = message;
  }
};

const validateDeclareName = (rawName, currentNodeId) => {
  const names = rawName
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean);

  if (names.length === 0) {
    return "Inserisci almeno un nome variabile.";
  }

  const seenInCurrentDeclare = new Set();
  const existingNames = new Set();

  traverseNodes(flowNodes, (node) => {
    if (node.id === currentNodeId || node.type !== "declare" || !node.declareConfig?.names) {
      return;
    }

    node.declareConfig.names.forEach((name) => existingNames.add(name));
  });

  for (const name of names) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(name)) {
      return `Il nome "${name}" deve iniziare con una lettera o underscore e contenere solo lettere, numeri o underscore.`;
    }

    if (reservedWords.has(name.toLowerCase()) || reservedLanguageNames.has(name) || reservedLanguageNames.has(name.toLowerCase())) {
      return `Il nome "${name}" è riservato nei linguaggi C, C++ o Python.`;
    }

    if (seenInCurrentDeclare.has(name)) {
      return `Il nome "${name}" è ripetuto nello stesso declare.`;
    }

    if (existingNames.has(name)) {
      return `Esiste già una variabile dichiarata con il nome "${name}".`;
    }

    seenInCurrentDeclare.add(name);
  }

  return null;
};

const highlightUndeclaredVariablesInText = (text, declaredNames) => {
  const formatDisplayStringLiteral = (literal) => {
    if (!literal) {
      return "";
    }

    const quote = literal[0];
    const closingQuote = literal.length > 1 ? literal[literal.length - 1] : "";
    const content = literal.slice(1, closingQuote === quote ? -1 : literal.length);

    if (quote === '"') {
      return `${closingQuote === quote ? "&ldquo;" : "&quot;"}${escapeHtml(content)}${closingQuote === quote ? "&rdquo;" : ""}`;
    }

    if (quote === "'") {
      return `${closingQuote === quote ? "&lsquo;" : "&#39;"}${escapeHtml(content)}${closingQuote === quote ? "&rsquo;" : ""}`;
    }

    return escapeHtml(literal);
  };

  const highlightIdentifiersInChunk = (chunk) => {
    const parts = [];
    const identifierPattern = /[A-Za-z_][A-Za-z0-9_]*/g;
    let lastIndex = 0;
    let match;

    while ((match = identifierPattern.exec(chunk)) !== null) {
      const [identifier] = match;
      const start = match.index;
      const end = start + identifier.length;

      parts.push(escapeHtml(chunk.slice(lastIndex, start)));

      if (declaredNames.has(identifier) || reservedWords.has(identifier.toLowerCase())) {
        parts.push(escapeHtml(identifier));
      } else {
        parts.push(`<span class="invalid-variable">${escapeHtml(identifier)}</span>`);
      }

      lastIndex = end;
    }

    parts.push(escapeHtml(chunk.slice(lastIndex)));
    return parts.join("");
  };

  const source = String(text ?? "");
  let markup = "";
  let chunkStart = 0;
  let activeQuote = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (activeQuote) {
      if (character === "\\") {
        index += 1;
        continue;
      }

      if (character === activeQuote) {
        const literal = source.slice(chunkStart, index + 1);
        markup += formatDisplayStringLiteral(literal);
        chunkStart = index + 1;
        activeQuote = null;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      markup += highlightIdentifiersInChunk(source.slice(chunkStart, index));
      chunkStart = index;
      activeQuote = character;
    }
  }

  if (chunkStart < source.length) {
    const trailingChunk = source.slice(chunkStart);
    markup += activeQuote
      ? formatDisplayStringLiteral(trailingChunk)
      : highlightIdentifiersInChunk(trailingChunk);
  }

  return markup;
};

const highlightOutputTemplateText = (text, declaredNames) => {
  const parts = [];
  const placeholderPattern = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match;

  while ((match = placeholderPattern.exec(text)) !== null) {
    const [placeholder, expression] = match;
    const start = match.index;
    const end = start + placeholder.length;

    parts.push(escapeHtml(text.slice(lastIndex, start)));
    parts.push(`{${highlightUndeclaredVariablesInText(expression, declaredNames)}}`);

    lastIndex = end;
  }

  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join("");
};

const outputPlaceholderPattern = /\{([^{}]+)\}/;

const parseAssignmentStatement = (text) => {
  const match = String(text ?? "").match(
    /^\s*([A-Za-z_][A-Za-z0-9_]*)(?:\s*\[\s*(.+?)\s*\])?\s*(=|\+=|-=|\*=|\/=|%=)\s*(.+)$/
  );

  if (!match) {
    return null;
  }

  const [, variableName, rawIndexExpression, operator, expression] = match;

  if (!SUPPORTED_ASSIGNMENT_OPERATORS.has(operator)) {
    return null;
  }

  const indexExpression = rawIndexExpression?.trim() ?? "";

  return {
    variableName,
    indexExpression: indexExpression || null,
    targetText: indexExpression ? `${variableName}[${indexExpression}]` : variableName,
    operator,
    expression: expression.trim(),
  };
};

const parseVariableReference = (text) => {
  const match = String(text ?? "").match(/^\s*([A-Za-z_][A-Za-z0-9_]*)(?:\s*\[\s*(.+?)\s*\])?\s*$/);

  if (!match) {
    return null;
  }

  const [, variableName, rawIndexExpression] = match;
  const indexExpression = rawIndexExpression?.trim() ?? "";

  return {
    variableName,
    indexExpression: indexExpression || null,
    targetText: indexExpression ? `${variableName}[${indexExpression}]` : variableName,
  };
};

const isEditingAssignNode = () => {
  const node = findNodeById(editingNodeId);
  return node?.type === "assign";
};

const isEditingForNode = () => {
  const node = findNodeById(editingNodeId);
  return node?.type === "for";
};

const isEditingOutputNode = () => {
  const node = findNodeById(editingNodeId);
  return node?.type === "output";
};

const mountAssignSuggestions = () => {
  if (!assignSuggestions) {
    return;
  }

  const targetField = isEditingForNode()
    ? forVariableInput?.closest(".property-field")
    : propertyInput?.closest(".property-field");

  if (targetField && assignSuggestions.parentElement !== targetField) {
    targetField.append(assignSuggestions);
  }
};

const getSuggestionInput = () => {
  if (isEditingAssignNode()) {
    return propertyInput;
  }

  if (isEditingForNode()) {
    return forVariableInput;
  }

  return null;
};

const syncActiveAssignSuggestion = () => {
  if (!assignSuggestions) {
    return;
  }

  assignSuggestions.querySelectorAll(".assign-suggestion").forEach((button, index) => {
    const isActive = index === activeAssignSuggestionIndex;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
};

const applyAssignSuggestion = (value) => {
  const suggestionInput = getSuggestionInput();

  if (!suggestionInput) {
    hideAssignSuggestions();
    return;
  }

  suggestionInput.value = value;
  hideAssignSuggestions();
  suggestionInput.focus();
};

const hideAssignSuggestions = () => {
  if (!assignSuggestions) {
    return;
  }

  currentAssignSuggestions = [];
  activeAssignSuggestionIndex = -1;
  assignSuggestions.hidden = true;
  assignSuggestions.innerHTML = "";
};

const renderAssignSuggestions = (query) => {
  if (!assignSuggestions) {
    return;
  }

  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    hideAssignSuggestions();
    return;
  }

  const matches = getDeclaredVariableNames().filter((name) =>
    name.toLowerCase().startsWith(normalizedQuery)
  );

  if (matches.length === 0) {
    hideAssignSuggestions();
    return;
  }

  currentAssignSuggestions = matches;
  activeAssignSuggestionIndex = 0;
  assignSuggestions.innerHTML = matches
    .map(
      (name) => `
        <button type="button" class="assign-suggestion" data-suggestion-value="${escapeHtml(name)}" role="option">
          ${escapeHtml(name)}
        </button>
      `
    )
    .join("");
  assignSuggestions.hidden = false;
  syncActiveAssignSuggestion();

  assignSuggestions.querySelectorAll(".assign-suggestion").forEach((button) => {
    button.addEventListener("mousedown", (event) => {
      event.preventDefault();
    });

    button.addEventListener("click", () => {
      applyAssignSuggestion(button.dataset.suggestionValue ?? "");
    });
  });
};
