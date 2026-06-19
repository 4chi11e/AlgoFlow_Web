// per eseguire: node build-single-file.js

const fs = require("fs");
const path = require("path");

const rootDir = __dirname;
const sourceFile = path.join(rootDir, "index.html");
const outputDir = path.join(rootDir, "build");
const outputFile = path.join(outputDir, "algoflow.html");

function readText(filePath) {
  return fs.readFileSync(filePath, "utf8");
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
    (tag, beforeRel, afterRel) => {
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
  const stylesheetFile = path.join(rootDir, "styles.css");
  const stylesheetDataUrl = `data:text/css;charset=utf-8,${encodeURIComponent(readText(stylesheetFile))}`;

  return js
    .replace(
      /const stylesheetUrl = new URL\(["']styles\.css["'], window\.location\.href\)\.href;/g,
      `const stylesheetUrl = ${JSON.stringify(stylesheetDataUrl)};`
    )
    .replace(/<\/script/gi, "<\\/script");
}

function inlineScripts(html) {
  return html.replace(
    /<script\b([^>]*?)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (tag, beforeSrc, src, afterSrc) => {
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
  fs.writeFileSync(outputFile, standaloneHtml, "utf8");

  console.log(`Standalone build creata: ${path.relative(rootDir, outputFile)}`);
}

build();
