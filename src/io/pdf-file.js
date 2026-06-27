const buildAlgoFlowPdfBytes = async () => {
  const printableCanvas = await buildPrintableDiagramCanvasForPdf();
  const serializedDocument = JSON.stringify(buildAlgoFlowFileDocument(), null, 2);
  const jpegDataUrl = printableCanvas.toDataURL("image/jpeg", 0.92);
  const imageBytes = dataUrlToUint8Array(jpegDataUrl);
  const pageWidthPoints = 595.28;
  const horizontalMargin = 34;
  const topMargin = 24;
  const bottomMargin = 28;
  const imageWidthPoints = pageWidthPoints - (horizontalMargin * 2);
  const imageHeightPoints = imageWidthPoints * (printableCanvas.height / printableCanvas.width);
  const pageHeightPoints = Math.max(220, topMargin + imageHeightPoints + bottomMargin);
  const imageX = horizontalMargin;
  const imageY = bottomMargin;
  const contentStream = [
    "q",
    `${formatPdfNumber(imageWidthPoints)} 0 0 ${formatPdfNumber(imageHeightPoints)} ${formatPdfNumber(imageX)} ${formatPdfNumber(imageY)} cm`,
    "/Im1 Do",
    "Q",
    "",
  ].join("\n");
  const payloadComment = buildEmbeddedAlgoFlowPdfPayloadComment(serializedDocument);
  const pdfHeader = `%PDF-1.4\n%\u00E2\u00E3\u00CF\u00D3\n${payloadComment}`;
  const objectChunks = [];
  const objectOffsets = [0];

  const pushPdfObject = (objectNumber, chunks) => {
    const header = encodePdfAscii(`${objectNumber} 0 obj\n`);
    const footer = encodePdfAscii(`\nendobj\n`);
    objectChunks.push(concatUint8Arrays([header, ...chunks, footer]));
  };

  pushPdfObject(1, [encodePdfAscii("<< /Type /Catalog /Pages 2 0 R >>\n")]);
  pushPdfObject(2, [encodePdfAscii("<< /Type /Pages /Kids [3 0 R] /Count 1 >>\n")]);
  pushPdfObject(3, [
    encodePdfAscii(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${formatPdfNumber(pageWidthPoints)} ${formatPdfNumber(pageHeightPoints)}] ` +
      "/Resources << /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >> /Contents 6 0 R >>\n"
    ),
  ]);
  pushPdfObject(4, [encodePdfAscii("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\n")]);
  pushPdfObject(5, [
    encodePdfAscii(
      `<< /Type /XObject /Subtype /Image /Width ${printableCanvas.width} /Height ${printableCanvas.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${imageBytes.length} >>\nstream\n`
    ),
    imageBytes,
    encodePdfAscii("\nendstream\n"),
  ]);
  pushPdfObject(6, [
    encodePdfAscii(`<< /Length ${encodePdfAscii(contentStream).length} >>\nstream\n${contentStream}endstream\n`),
  ]);
  pushPdfObject(7, [
    encodePdfAscii(
      `<< /Title (${escapePdfLiteralString(getSuggestedPdfFileName())}) /Producer (${escapePdfLiteralString(ALGOFLOW_APP_NAME)}) ` +
      ` /Creator (${escapePdfLiteralString(ALGOFLOW_APP_NAME)}) >>\n`
    ),
  ]);

  let currentOffset = encodePdfAscii(pdfHeader).length;

  objectChunks.forEach((chunk) => {
    objectOffsets.push(currentOffset);
    currentOffset += chunk.length;
  });

  const xrefOffset = currentOffset;
  const xrefLines = ["xref", `0 ${objectOffsets.length}`, "0000000000 65535 f "];

  for (let index = 1; index < objectOffsets.length; index += 1) {
    xrefLines.push(`${String(objectOffsets[index]).padStart(10, "0")} 00000 n `);
  }

  const trailer = [
    "trailer",
    `<< /Size ${objectOffsets.length} /Root 1 0 R /Info 7 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
    "",
  ].join("\n");

  return concatUint8Arrays([
    encodePdfAscii(pdfHeader),
    ...objectChunks,
    encodePdfAscii(`${xrefLines.join("\n")}\n${trailer}`),
  ]);
};
