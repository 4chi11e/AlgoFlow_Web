const importFlowchartFromJsonText = (rawText) => {
  let documentData = null;

  try {
    documentData = JSON.parse(rawText);
  } catch {
    throw new Error("Il file selezionato non contiene JSON valido.");
  }

  const persistedNodes = getPersistedNodesFromImportedDocument(documentData);

  cancelExecution();
  removeDraftNode();
  closePropertyDialog({ restoreFocus: false });
  closeInsertDialog();
  pushUndoSnapshot();
  applyPersistedFlowNodes(persistedNodes, { resetHistory: false });

  if (
    documentData &&
    typeof documentData === "object" &&
    !Array.isArray(documentData) &&
    typeof documentData.preferences?.showNodeTypeInLabel === "boolean"
  ) {
    showNodeTypeInLabel = documentData.preferences.showNodeTypeInLabel;
    saveNodeLabelPreference();

    if (showNodeTypeToggle) {
      showNodeTypeToggle.checked = showNodeTypeInLabel;
    }
  }

  saveFlowchartState();
  renderFlowchart();
};


const buildPrintableDiagramSvgMarkup = () => {
  const diagramSvg = flowchartRoot?.querySelector(".diagram-svg");

  if (!(diagramSvg instanceof SVGElement)) {
    throw new Error("Non c'è alcun diagramma da esportare in PDF.");
  }

  const printableSvg = diagramSvg.cloneNode(true);

  printableSvg.removeAttribute("id");
  printableSvg.style.width = "100%";
  printableSvg.style.height = "auto";
  printableSvg.style.maxWidth = "100%";

  return printableSvg.outerHTML;
};

const getPdfPreviewHeadAssets = () =>
  Array.from(document.head.querySelectorAll('link[rel="preconnect"], link[rel="stylesheet"], style'))
    .map((element) => element.outerHTML)
    .join("\n");

const openPdfPrintPreview = () => {
  const printableSvgMarkup = buildPrintableDiagramSvgMarkup();
  const documentTitle = `AlgoFlow PDF Preview`;
  const headAssets = getPdfPreviewHeadAssets();
  const previewHtml = `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${documentTitle}</title>
      ${headAssets}
      <style>
        body {
          margin: 0;
          background: white;
        }

        .pdf-sheet {
          padding: 18mm 16mm;
        }

        .pdf-header {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10mm;
        }

        .pdf-title {
          font-family: "Space Grotesk", sans-serif;
          font-size: 20pt;
          font-weight: 700;
          color: #2f2419;
        }

        .pdf-subtitle {
          font-family: "Manrope", sans-serif;
          font-size: 10pt;
          color: #6f6253;
        }

        .pdf-diagram {
          width: 100%;
          overflow: hidden;
        }

        .pdf-diagram .diagram-svg {
          width: 100% !important;
          height: auto !important;
        }

        @page {
          size: A4 portrait;
          margin: 0;
        }

        @media print {
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      </style>
      <script>
        window.addEventListener("load", () => {
          window.focus();
          window.print();
        }, { once: true });
      </script>
    </head>
    <body>
      <main class="pdf-sheet">
        <header class="pdf-header">
          <div class="pdf-title">AlgoFlow</div>
          <div class="pdf-subtitle">Diagramma esportato il ${new Date().toLocaleDateString("it-IT")}</div>
        </header>
        <section class="pdf-diagram">
          ${printableSvgMarkup}
        </section>
      </main>
    </body>
    </html>
  `;
  const previewBlob = new Blob([previewHtml], { type: "text/html" });
  const previewUrl = URL.createObjectURL(previewBlob);
  const printWindow = window.open(previewUrl, "_blank");

  if (!printWindow) {
    URL.revokeObjectURL(previewUrl);
    throw new Error("Il browser ha bloccato l'apertura della finestra di stampa.");
  }

  window.setTimeout(() => {
    URL.revokeObjectURL(previewUrl);
  }, 60000);
};

const collectDocumentStylesForPdfSvg = () => {
  const styleChunks = [];

  Array.from(document.styleSheets).forEach((styleSheet) => {
    try {
      const cssRules = Array.from(styleSheet.cssRules ?? []);

      cssRules.forEach((rule) => {
        styleChunks.push(rule.cssText);
      });
    } catch {
      // Ignore inaccessible stylesheets.
    }
  });

  styleChunks.push(`
    .svg-node-hit,
    .svg-connector-hit,
    .svg-connector-hit-path {
      display: none !important;
    }
  `);

  return styleChunks.join("\n");
};

const simplifySvgLabelsForPdf = (printableSvg) => {
  const svgNamespace = "http://www.w3.org/2000/svg";
  const measurementCanvas = document.createElement("canvas");
  const measurementContext = measurementCanvas.getContext("2d");

  const measureTextWidth = (text, font) => {
    if (!measurementContext) {
      return text.length * 8;
    }

    measurementContext.font = font;
    return measurementContext.measureText(text).width;
  };

  const wrapTextLines = (text, maxWidth, font) => {
    const paragraphs = String(text ?? "").split("\n");
    const lines = [];

    paragraphs.forEach((paragraph) => {
      const words = paragraph.split(/\s+/).filter(Boolean);

      if (words.length === 0) {
        lines.push("");
        return;
      }

      let currentLine = "";

      words.forEach((word) => {
        const nextLine = currentLine ? `${currentLine} ${word}` : word;

        if (!currentLine || measureTextWidth(nextLine, font) <= maxWidth) {
          currentLine = nextLine;
          return;
        }

        lines.push(currentLine);
        currentLine = word;
      });

      if (currentLine) {
        lines.push(currentLine);
      }
    });

    return lines.length > 0 ? lines : [""];
  };

  printableSvg.querySelectorAll("foreignObject").forEach((foreignObject) => {
    const isTerminal = foreignObject.closest(".svg-terminal-node");
    const isComment = foreignObject.closest(".svg-node-comment");
    const nodeGroup = foreignObject.closest(".svg-node");
    const nodeId = Number(nodeGroup?.getAttribute("data-node-id") ?? "");
    const sourceNode = Number.isFinite(nodeId) ? findNodeById(nodeId) : null;
    const rawText = sourceNode
      ? getNodeDisplayText(sourceNode)
      : (foreignObject.textContent || "");
    const textContent = String(rawText ?? "")
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n[ \t]+/g, "\n")
      .trim();

    if (!textContent) {
      foreignObject.remove();
      return;
    }

    const x = Number(foreignObject.getAttribute("x") ?? "0");
    const y = Number(foreignObject.getAttribute("y") ?? "0");
    const width = Number(foreignObject.getAttribute("width") ?? "0");
    const height = Number(foreignObject.getAttribute("height") ?? "0");
    const fontFamily = isTerminal ? "Georgia, serif" : "Arial, sans-serif";
    const fontSize = isTerminal ? 22 : 16;
    const fontWeight = isTerminal ? "600" : "700";
    const lineHeight = isTerminal ? 26 : (isComment ? 19 : 20);
    const font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    const horizontalPadding = isComment ? 4 : 2;
    const verticalPadding = isTerminal ? 2 : (isComment ? 6 : 8);
    const wrappedLines = wrapTextLines(textContent, Math.max(width - horizontalPadding * 2, 12), font);
    const blockHeight = wrappedLines.length * lineHeight;
    const textNode = document.createElementNS(svgNamespace, "text");
    const textX = isComment ? x + horizontalPadding : x + width / 2;
    const availableHeight = Math.max(height - verticalPadding * 2, fontSize);
    const startY = isComment
      ? y + verticalPadding
      : y + verticalPadding + Math.max((availableHeight - blockHeight) / 2, 0);

    textNode.setAttribute("x", String(textX));
    textNode.setAttribute("y", String(startY));
    textNode.setAttribute("text-anchor", isComment ? "start" : "middle");
    textNode.setAttribute("dominant-baseline", "hanging");
    textNode.setAttribute("fill", "#2f2419");
    textNode.setAttribute("font-family", fontFamily);
    textNode.setAttribute("font-size", String(fontSize));
    textNode.setAttribute("font-weight", fontWeight);

    wrappedLines.forEach((line, index) => {
      const tspan = document.createElementNS(svgNamespace, "tspan");
      tspan.setAttribute("x", String(textX));
      tspan.setAttribute("dy", index === 0 ? "0" : String(lineHeight));
      tspan.textContent = line || "\u00A0";
      textNode.append(tspan);
    });

    foreignObject.replaceWith(textNode);
  });

  printableSvg.querySelectorAll(".svg-node-hit, .svg-connector-hit, .svg-connector-hit-path").forEach((node) => {
    node.remove();
  });
};

const stripInteractiveStateFromPrintableSvg = (printableSvg) => {
  printableSvg
    .querySelectorAll(".is-selected, .is-executing, .is-preview-selected")
    .forEach((node) => {
      node.classList.remove("is-selected", "is-executing", "is-preview-selected");
    });
};

const withDetachedSvgStyleSource = (sourceSvg, callback) => {
  const host = document.createElement("div");
  host.setAttribute("aria-hidden", "true");
  host.style.position = "fixed";
  host.style.left = "-100000px";
  host.style.top = "0";
  host.style.width = "0";
  host.style.height = "0";
  host.style.overflow = "hidden";
  host.style.pointerEvents = "none";
  host.appendChild(sourceSvg);
  document.body.appendChild(host);

  try {
    return callback(sourceSvg);
  } finally {
    host.remove();
  }
};

const inlineSvgComputedStylesForPdf = (sourceSvg, printableSvg) => {
  const styleSelectors = [
    ".svg-node-shape",
    ".svg-terminal-shape",
    ".svg-connector-line",
    ".svg-if-line",
    ".svg-connector-arrow",
    ".svg-branch-label",
    "text",
  ];

  styleSelectors.forEach((selector) => {
    const sourceNodes = Array.from(sourceSvg.querySelectorAll(selector));
    const printableNodes = Array.from(printableSvg.querySelectorAll(selector));

    sourceNodes.forEach((sourceNode, index) => {
      const printableNode = printableNodes[index];

      if (!(sourceNode instanceof SVGElement) || !(printableNode instanceof SVGElement)) {
        return;
      }

      const computedStyle = window.getComputedStyle(sourceNode);

      [
        "fill",
        "stroke",
        "stroke-width",
        "stroke-dasharray",
        "stroke-linecap",
        "stroke-linejoin",
        "font-family",
        "font-size",
        "font-weight",
        "letter-spacing",
        "text-anchor",
      ].forEach((propertyName) => {
        const propertyValue = computedStyle.getPropertyValue(propertyName).trim();

        if (propertyValue) {
          printableNode.style.setProperty(propertyName, propertyValue);
        }
      });
    });
  });
};

const inlineForeignObjectComputedStylesForPdf = (sourceSvg, printableSvg) => {
  const sourceForeignObjects = Array.from(sourceSvg.querySelectorAll("foreignObject"));
  const printableForeignObjects = Array.from(printableSvg.querySelectorAll("foreignObject"));
  const copiedProperties = [
    "display",
    "width",
    "height",
    "padding",
    "margin",
    "box-sizing",
    "align-items",
    "justify-content",
    "align-self",
    "text-align",
    "white-space",
    "overflow",
    "overflow-wrap",
    "word-break",
    "font-size",
    "font-weight",
    "line-height",
    "letter-spacing",
    "color",
    "background",
    "border",
    "border-radius",
  ];

  sourceForeignObjects.forEach((sourceForeignObject, index) => {
    const printableForeignObject = printableForeignObjects[index];

    if (!(sourceForeignObject instanceof SVGForeignObjectElement) || !(printableForeignObject instanceof SVGForeignObjectElement)) {
      return;
    }

    const sourceHtmlNodes = [
      sourceForeignObject.firstElementChild,
      ...sourceForeignObject.querySelectorAll("*"),
    ].filter(Boolean);
    const printableHtmlNodes = [
      printableForeignObject.firstElementChild,
      ...printableForeignObject.querySelectorAll("*"),
    ].filter(Boolean);

    sourceHtmlNodes.forEach((sourceNode, htmlIndex) => {
      const printableNode = printableHtmlNodes[htmlIndex];

      if (!(sourceNode instanceof HTMLElement) || !(printableNode instanceof HTMLElement)) {
        return;
      }

      const computedStyle = window.getComputedStyle(sourceNode);
      copiedProperties.forEach((propertyName) => {
        const propertyValue = computedStyle.getPropertyValue(propertyName).trim();

        if (propertyValue) {
          printableNode.style.setProperty(propertyName, propertyValue);
        }
      });

      if (sourceNode.classList.contains("svg-terminal-label")) {
        printableNode.style.setProperty("font-family", "Georgia, serif");
      } else {
        printableNode.style.setProperty("font-family", "Arial, sans-serif");
      }
    });
  });
};

const cropCanvasWhitespaceForPdf = (sourceCanvas) => {
  const context = sourceCanvas.getContext("2d");

  if (!context) {
    return sourceCanvas;
  }

  const { width, height } = sourceCanvas;
  const imageData = context.getImageData(0, 0, width, height);
  const { data } = imageData;
  const whiteThreshold = 248;
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const alpha = data[index + 3];

      if (alpha === 0) {
        continue;
      }

      const red = data[index];
      const green = data[index + 1];
      const blue = data[index + 2];
      const isNearWhite = red >= whiteThreshold && green >= whiteThreshold && blue >= whiteThreshold;

      if (isNearWhite) {
        continue;
      }

      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < minX || maxY < minY) {
    return sourceCanvas;
  }

  const padding = 24;
  const cropX = Math.max(0, minX - padding);
  const cropY = Math.max(0, minY - padding);
  const cropWidth = Math.min(width - cropX, maxX - minX + 1 + padding * 2);
  const cropHeight = Math.min(height - cropY, maxY - minY + 1 + padding * 2);
  const croppedCanvas = document.createElement("canvas");

  croppedCanvas.width = cropWidth;
  croppedCanvas.height = cropHeight;

  const croppedContext = croppedCanvas.getContext("2d");

  if (!croppedContext) {
    return sourceCanvas;
  }

  croppedContext.fillStyle = "#ffffff";
  croppedContext.fillRect(0, 0, cropWidth, cropHeight);
  croppedContext.drawImage(
    sourceCanvas,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight
  );

  return croppedCanvas;
};

const buildPrintableDiagramImageDataUrlForPdf = async () => {
  const diagramSvg = flowchartRoot?.querySelector(".diagram-svg");

  if (!(diagramSvg instanceof SVGElement)) {
    throw new Error("Non c'è alcun diagramma da esportare in PDF.");
  }

  const sourceSvgForPdf = diagramSvg.cloneNode(true);
  const printableSvg = diagramSvg.cloneNode(true);
  const viewBox = printableSvg.viewBox.baseVal;

  if (!viewBox || !viewBox.width || !viewBox.height) {
    throw new Error("Il diagramma non ha dimensioni esportabili.");
  }

  printableSvg.removeAttribute("id");
  printableSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  printableSvg.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml");
  printableSvg.setAttribute("width", String(viewBox.width));
  printableSvg.setAttribute("height", String(viewBox.height));
  stripInteractiveStateFromPrintableSvg(sourceSvgForPdf);
  stripInteractiveStateFromPrintableSvg(printableSvg);
  withDetachedSvgStyleSource(sourceSvgForPdf, (styledSourceSvg) => {
    inlineSvgComputedStylesForPdf(styledSourceSvg, printableSvg);
  });
  simplifySvgLabelsForPdf(printableSvg);

  const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleNode.textContent = collectDocumentStylesForPdfSvg();
  printableSvg.insertBefore(styleNode, printableSvg.firstChild);

  const serializedSvg = new XMLSerializer().serializeToString(printableSvg);
  const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
  const svgUrl = URL.createObjectURL(svgBlob);

  try {
    const image = await new Promise((resolve, reject) => {
      const nextImage = new Image();

      nextImage.onload = () => resolve(nextImage);
      nextImage.onerror = () => reject(new Error("Impossibile renderizzare il diagramma per il PDF."));
      nextImage.src = svgUrl;
    });

    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(viewBox.width * scale);
    canvas.height = Math.round(viewBox.height * scale);

    const context = canvas.getContext("2d");

    if (!context) {
      throw new Error("Impossibile preparare il canvas per l'esportazione PDF.");
    }

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    return cropCanvasWhitespaceForPdf(canvas).toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
};

const buildPrintableDiagramCanvasForPdf = async () => {
  return runWithTemporaryTheme("light", async () => {
    const diagramSvg = flowchartRoot?.querySelector(".diagram-svg");

    if (!(diagramSvg instanceof SVGElement)) {
      throw new Error("Non c'è alcun diagramma da esportare in PDF.");
    }

    const sourceSvgForPdf = diagramSvg.cloneNode(true);
    const printableSvg = diagramSvg.cloneNode(true);
    const viewBox = printableSvg.viewBox.baseVal;

    if (!viewBox || !viewBox.width || !viewBox.height) {
      throw new Error("Il diagramma non ha dimensioni esportabili.");
    }

    printableSvg.removeAttribute("id");
    printableSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    printableSvg.setAttribute("xmlns:xhtml", "http://www.w3.org/1999/xhtml");
    printableSvg.setAttribute("width", String(viewBox.width));
    printableSvg.setAttribute("height", String(viewBox.height));
    stripInteractiveStateFromPrintableSvg(sourceSvgForPdf);
    stripInteractiveStateFromPrintableSvg(printableSvg);
    withDetachedSvgStyleSource(sourceSvgForPdf, (styledSourceSvg) => {
      inlineSvgComputedStylesForPdf(styledSourceSvg, printableSvg);
    });
    simplifySvgLabelsForPdf(printableSvg);

    const styleNode = document.createElementNS("http://www.w3.org/2000/svg", "style");
    styleNode.textContent = collectDocumentStylesForPdfSvg();
    printableSvg.insertBefore(styleNode, printableSvg.firstChild);

    const serializedSvg = new XMLSerializer().serializeToString(printableSvg);
    const svgBlob = new Blob([serializedSvg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const image = await new Promise((resolve, reject) => {
        const nextImage = new Image();

        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("Impossibile renderizzare il diagramma per il PDF."));
        nextImage.src = svgUrl;
      });

      const scale = 2;
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(viewBox.width * scale);
      canvas.height = Math.round(viewBox.height * scale);

      const context = canvas.getContext("2d");

      if (!context) {
        throw new Error("Impossibile preparare il canvas per l'esportazione PDF.");
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const croppedCanvas = cropCanvasWhitespaceForPdf(canvas);

      const headerPaddingTop = Math.round(scale * 32);
      const headerPaddingLeft = Math.round(scale * 34);
      const headerPaddingBottom = Math.round(scale * 24);
      const titleFontSize = Math.round(scale * 34);
      const compositeCanvas = document.createElement("canvas");
      compositeCanvas.width = croppedCanvas.width;
      compositeCanvas.height = croppedCanvas.height + headerPaddingTop + titleFontSize + headerPaddingBottom;

      const compositeContext = compositeCanvas.getContext("2d");

      if (!compositeContext) {
        throw new Error("Impossibile preparare il canvas finale per l'esportazione PDF.");
      }

      compositeContext.fillStyle = "#ffffff";
      compositeContext.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
      compositeContext.fillStyle = "#2f2419";
      compositeContext.font = `700 ${titleFontSize}px "Space Grotesk", "Manrope", sans-serif`;
      compositeContext.textBaseline = "top";
      compositeContext.fillText(ALGOFLOW_APP_NAME, headerPaddingLeft, headerPaddingTop);
      compositeContext.drawImage(croppedCanvas, 0, headerPaddingTop + titleFontSize + headerPaddingBottom);

      return compositeCanvas;
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  });
};

const buildEmbeddedAlgoFlowPdfPayloadComment = (serializedDocument) => {
  const encodedPayload = uint8ArrayToBase64(new TextEncoder().encode(serializedDocument));
  const payloadChunks = encodedPayload.match(/.{1,120}/g) ?? [];
  const lines = [
    `% ${ALGOFLOW_PDF_PAYLOAD_BEGIN}`,
    ...payloadChunks.map((chunk) => `% ${chunk}`),
    `% ${ALGOFLOW_PDF_PAYLOAD_END}`,
    "",
  ];

  return lines.join("\n");
};
