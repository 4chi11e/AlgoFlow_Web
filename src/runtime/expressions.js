const mapExpressionOutsideStringLiterals = (expression, transform) => {
  const source = String(expression ?? "");
  let result = "";
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
        result += source.slice(chunkStart, index + 1);
        chunkStart = index + 1;
        activeQuote = null;
      }

      continue;
    }

    if (character === '"' || character === "'") {
      result += transform(source.slice(chunkStart, index));
      chunkStart = index;
      activeQuote = character;
    }
  }

  if (chunkStart < source.length) {
    const trailingChunk = source.slice(chunkStart);
    result += activeQuote ? trailingChunk : transform(trailingChunk);
  } else if (!activeQuote) {
    result += transform("");
  }

  return result;
};

const maskExpressionStringLiterals = (expression) =>
  mapExpressionOutsideStringLiterals(expression, (chunk) => chunk).replace(/(["'])(?:\\.|(?!\1).)*\1/g, (literal) => {
    const quote = literal[0];
    return `${quote}${" ".repeat(Math.max(0, literal.length - 2))}${quote}`;
  });

const normalizeExpressionSyntax = (expression) =>
  mapExpressionOutsideStringLiterals(expression, (chunk) =>
    chunk
      .replace(/\btrue\b/gi, "true")
      .replace(/\bfalse\b/gi, "false")
      .replace(/\brandom\s*\(/gi, "random(")
      .replace(/\bmod\b/gi, "%")
      .replace(/\band\b/gi, "&&")
      .replace(/\bor\b/gi, "||")
      .replace(/\bnot\b/gi, "!")
  );

const splitTopLevelArguments = (text) => {
  const args = [];
  const source = String(text ?? "");
  let start = 0;
  let depth = 0;
  let activeQuote = null;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];

    if (activeQuote) {
      if (character === "\\") {
        index += 1;
      } else if (character === activeQuote) {
        activeQuote = null;
      }
      continue;
    }

    if (character === '"' || character === "'") {
      activeQuote = character;
      continue;
    }

    if (character === "(" || character === "[" || character === "{") {
      depth += 1;
      continue;
    }

    if (character === ")" || character === "]" || character === "}") {
      depth = Math.max(0, depth - 1);
      continue;
    }

    if (character === "," && depth === 0) {
      args.push(source.slice(start, index).trim());
      start = index + 1;
    }
  }

  args.push(source.slice(start).trim());
  return args;
};

const getRandomInteger = (...args) => {
  if (args.length !== 1) {
    throw new Error("random accetta solo random(range). Usa random(range) + min per spostare l'intervallo.");
  }

  const rangeValue = Number(args[0]);

  if (!Number.isFinite(rangeValue)) {
    throw new Error("random richiede un range numerico.");
  }

  const range = Math.floor(rangeValue);

  if (range <= 0) {
    throw new Error("random(range) richiede un range maggiore di 0.");
  }

  return Math.floor(Math.random() * range);
};

const transformRandomFunctionCalls = (expression, transform) => {
  const source = String(expression ?? "");
  let result = "";
  let index = 0;
  let activeQuote = null;

  while (index < source.length) {
    const character = source[index];

    if (activeQuote) {
      result += character;
      if (character === "\\") {
        if (index + 1 < source.length) {
          result += source[index + 1];
          index += 2;
          continue;
        }
      } else if (character === activeQuote) {
        activeQuote = null;
      }
      index += 1;
      continue;
    }

    if (character === '"' || character === "'") {
      activeQuote = character;
      result += character;
      index += 1;
      continue;
    }

    if (/^[A-Za-z_]$/.test(character)) {
      const identifierStart = index;
      index += 1;
      while (index < source.length && /^[A-Za-z0-9_]$/.test(source[index])) {
        index += 1;
      }

      const identifier = source.slice(identifierStart, index);

      if (identifier.toLowerCase() !== "random") {
        result += identifier;
        continue;
      }

      let cursor = index;
      while (cursor < source.length && /\s/.test(source[cursor])) {
        cursor += 1;
      }

      if (source[cursor] !== "(") {
        result += identifier;
        continue;
      }

      let depth = 1;
      let innerIndex = cursor + 1;
      let innerQuote = null;

      for (; innerIndex < source.length; innerIndex += 1) {
        const innerCharacter = source[innerIndex];

        if (innerQuote) {
          if (innerCharacter === "\\") {
            innerIndex += 1;
          } else if (innerCharacter === innerQuote) {
            innerQuote = null;
          }
          continue;
        }

        if (innerCharacter === '"' || innerCharacter === "'") {
          innerQuote = innerCharacter;
          continue;
        }

        if (innerCharacter === "(") {
          depth += 1;
        } else if (innerCharacter === ")") {
          depth -= 1;
          if (depth === 0) {
            break;
          }
        }
      }

      if (depth !== 0) {
        result += identifier;
        index = identifierStart + identifier.length;
        continue;
      }

      const args = splitTopLevelArguments(source.slice(cursor + 1, innerIndex));
      result += transform(args);
      index = innerIndex + 1;
      continue;
    }

    result += character;
    index += 1;
  }

  return result;
};
