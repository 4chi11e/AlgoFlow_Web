// per eseguire: node build-single-file.js

const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const sourceFile = path.join(rootDir, "index.html");
const outputDir = path.join(rootDir, "build");
const outputFile = path.join(outputDir, "algoflow.html");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8").replace(/^\uFEFF/, "");
}

function writeText(filePath, content) {
  fs.writeFileSync(filePath, content, "utf8");
}

function isLocalReference(value) {
  return (
    value &&
    !value.startsWith("#") &&
    !/^[a-z][a-z\d+.-]*:/i.test(value) &&
    !value.startsWith("//")
  );
}

function resolveAsset(assetPath) {
  const normalized = assetPath.split(/[?#]/)[0];
  return path.resolve(rootDir, normalized);
}

function inlineStyles(html) {
  return html.replace(
    /<link\b([^>]*?)\brel=["']stylesheet["']([^>]*?)>/gi,
    (tag) => {
      const hrefMatch = tag.match(/\bhref=["']([^"']+)["']/i);

      if (!hrefMatch || !isLocalReference(hrefMatch[1])) {
        return tag;
      }

      const cssFile = resolveAsset(hrefMatch[1]);
      const css = readText(cssFile).replace(/<\/style/gi, "<\\/style");

      return `<style data-inline-source="${hrefMatch[1]}">\n${css}\n</style>`;
    }
  );
}

function makeStandaloneScript(js) {
  return js.replace(/<\/script/gi, "<\\/script");
}

function inlineScripts(html) {
  return html.replace(
    /<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (tag, beforeSrc, src) => {
      if (!isLocalReference(src)) {
        return tag;
      }

      const jsFile = resolveAsset(src);
      const js = makeStandaloneScript(readText(jsFile));

      return `<script data-inline-source="${src}">\n${js}\n</script>`;
    }
  );
}

function build() {
  const html = readText(sourceFile);
  const standaloneHtml = inlineScripts(inlineStyles(html));

  fs.mkdirSync(outputDir, { recursive: true });
  writeText(outputFile, standaloneHtml);

  console.log(`Standalone build creata: ${path.relative(rootDir, outputFile)}`);
}

build();
