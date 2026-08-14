const SHARED_CSS = `
:root {
  --primary: #2b5c8f;
  --primary-hover: #1e4366;
  --bg: #f8fafc;
  --card-bg: #ffffff;
  --text: #1e293b;
  --border: #cbd5e1;
}
* { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
body { background: var(--bg); color: var(--text); padding: 20px; display: flex; flex-direction: column; align-items: center; min-height: 100vh; }
h1 { margin-bottom: 8px; color: var(--primary); }
.subtitle { margin-bottom: 20px; color: #64748b; }
`;

export function buildHtmlDocument({
  title,
  bodyHtml,
  script,
}: {
  title: string;
  bodyHtml: string;
  script: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title}</title>
<style>
${SHARED_CSS}
</style>
</head>
<body>
${bodyHtml}
<script>
${script}
</script>
</body>
</html>`;
}

export function downloadHtmlFile(filename: string, html: string): void {
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
