const buildAlgoFlowFileDocument = () => ({
  format: ALGOFLOW_FILE_FORMAT,
  version: ALGOFLOW_FILE_VERSION,
  exportedAt: new Date().toISOString(),
  app: {
    name: ALGOFLOW_APP_NAME,
  },
  preferences: {
    showNodeTypeInLabel,
  },
  diagram: {
    nodes: getPersistedFlowNodes(),
  },
});

const getPersistedNodesFromImportedDocument = (documentData) => {
  if (Array.isArray(documentData)) {
    return documentData;
  }

  if (!documentData || typeof documentData !== "object") {
    throw new Error("Il file non contiene un documento AlgoFlow valido.");
  }

  if (documentData.format !== ALGOFLOW_FILE_FORMAT) {
    throw new Error(`Formato non supportato: atteso "${ALGOFLOW_FILE_FORMAT}".`);
  }

  if (documentData.version !== ALGOFLOW_FILE_VERSION) {
    throw new Error(`Versione file non supportata: ${String(documentData.version)}.`);
  }

  if (
    Array.isArray(documentData.diagram?.nodes)
  ) {
    return documentData.diagram.nodes;
  }

  throw new Error("Il file AlgoFlow non contiene la sezione diagram.nodes.");
};

const getHasConfirmedNodes = () => flowNodes.some((node) => !node.isDraft);

const confirmDiscardCurrentDiagram = () => {
  if (!getHasConfirmedNodes()) {
    return true;
  }

  return window.confirm("Vuoi davvero sostituire il diagramma corrente? Le modifiche non salvate andranno perse.");
};

const readFlowchartFile = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Nessun file selezionato.");
  }

  return file.text();
};

const isPdfDiagramFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  const normalizedName = typeof file.name === "string" ? file.name.toLowerCase() : "";
  return file.type === "application/pdf" || normalizedName.endsWith(ALGOFLOW_PDF_EXTENSION);
};

const isFlowgorithmDiagramFile = (file) => {
  if (!(file instanceof File)) {
    return false;
  }

  const normalizedName = typeof file.name === "string" ? file.name.toLowerCase() : "";
  return normalizedName.endsWith(FLOWGORITHM_FILE_EXTENSION) || file.type === "application/xml" || file.type === "text/xml";
};

const uint8ArrayToBase64 = (bytes) => {
  let binary = "";

  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode(...chunk);
  }

  return window.btoa(binary);
};

const base64ToUint8Array = (encodedValue) => {
  const binary = window.atob(encodedValue);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
};

const concatUint8Arrays = (chunks) => {
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  chunks.forEach((chunk) => {
    result.set(chunk, offset);
    offset += chunk.length;
  });

  return result;
};

const formatPdfNumber = (value) => {
  if (!Number.isFinite(value)) {
    return "0";
  }

  const roundedValue = Math.abs(value) < 0.0001 ? 0 : value;
  return roundedValue.toFixed(2).replace(/\.?0+$/, "");
};

const escapePdfLiteralString = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");

const encodePdfAscii = (value) => new TextEncoder().encode(value);

const dataUrlToUint8Array = (dataUrl) => {
  const [, encodedPayload = ""] = String(dataUrl).split(",", 2);
  return base64ToUint8Array(encodedPayload);
};

const findByteSequence = (sourceBytes, patternBytes, fromIndex = 0) => {
  if (!patternBytes.length || sourceBytes.length < patternBytes.length) {
    return -1;
  }

  for (let index = fromIndex; index <= sourceBytes.length - patternBytes.length; index += 1) {
    let matches = true;

    for (let patternIndex = 0; patternIndex < patternBytes.length; patternIndex += 1) {
      if (sourceBytes[index + patternIndex] !== patternBytes[patternIndex]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return index;
    }
  }

  return -1;
};

const extractEmbeddedAlgoFlowJsonFromPdfBytes = (pdfBytes) => {
  const beginMarker = encodePdfAscii(`% ${ALGOFLOW_PDF_PAYLOAD_BEGIN}`);
  const endMarker = encodePdfAscii(`% ${ALGOFLOW_PDF_PAYLOAD_END}`);
  const payloadStart = findByteSequence(pdfBytes, beginMarker);

  if (payloadStart < 0) {
    throw new Error("Il PDF non contiene alcun diagramma AlgoFlow incorporato.");
  }

  const payloadEnd = findByteSequence(pdfBytes, endMarker, payloadStart + beginMarker.length);

  if (payloadEnd < 0) {
    throw new Error("Il PDF contiene dati AlgoFlow incompleti.");
  }

  const payloadBytes = pdfBytes.slice(payloadStart + beginMarker.length, payloadEnd);
  const payloadText = new TextDecoder("utf-8").decode(payloadBytes);
  const encodedPayload = payloadText
    .split(/\r?\n/)
    .map((line) => line.replace(/^%\s?/, "").trim())
    .filter(Boolean)
    .join("");

  if (!encodedPayload) {
    throw new Error("Il PDF non contiene dati AlgoFlow leggibili.");
  }

  try {
    const jsonBytes = base64ToUint8Array(encodedPayload);
    return new TextDecoder().decode(jsonBytes);
  } catch {
    throw new Error("I dati AlgoFlow incorporati nel PDF non sono validi.");
  }
};

const readImportedFlowchartDocument = async (file) => {
  if (!(file instanceof File)) {
    throw new Error("Nessun file selezionato.");
  }

  if (isFlowgorithmDiagramFile(file)) {
    const xmlText = await file.text();
    return JSON.stringify(importFlowgorithmXmlDocument(xmlText));
  }

  if (!isPdfDiagramFile(file)) {
    return readFlowchartFile(file);
  }

  const pdfBytes = new Uint8Array(await file.arrayBuffer());
  return extractEmbeddedAlgoFlowJsonFromPdfBytes(pdfBytes);
};
