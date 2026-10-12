import fs from "fs";
import path from "path";

const publicDir = path.resolve(".output/public");
const assetsDir = path.join(publicDir, "assets");

if (!fs.existsSync(assetsDir)) {
  console.error("Assets directory not found. Please run 'npm run build' first.");
  process.exit(1);
}

const files = fs.readdirSync(assetsDir);
const cssFiles = files.filter((f) => f.endsWith(".css"));
const indexJs = files.find((f) => f.startsWith("index-") && f.endsWith(".js")) || files.find((f) => f.endsWith(".js"));

const cssLinks = cssFiles.map((f) => `  <link rel="stylesheet" href="./assets/${f}">`).join("\n");
const jsScript = indexJs ? `  <script type="module" src="./assets/${indexJs}"></script>` : "";

const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>FruitVyapar</title>
  <link rel="icon" href="./favicon.ico" />
${cssLinks}
</head>
<body class="bg-background text-foreground antialiased selection:bg-primary selection:text-primary-foreground">
  <div id="app"></div>
  <div id="root"></div>
${jsScript}
</body>
</html>`;

fs.writeFileSync(path.join(publicDir, "index.html"), htmlContent);
console.log("Successfully generated .output/public/index.html for Capacitor Android!");
