import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import MarkdownIt from "markdown-it";
import DOMPurify from "dompurify";
import katex from "katex";
import hljs from "highlight.js";
import "katex/dist/katex.min.css";
import "highlight.js/styles/github.css";

const content = `# Hello World

This is **bold**, _italic_, and \`inline code\`.

The formula $E = mc^2$ is well known. And a display equation:

$$\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

\`\`\`ts
async function fetchUser(id: string) {
  const res = await fetch(\`/api/users/\${id}\`);
  return res.json();
}
\`\`\`

| Name  | Score |
|:------|------:|
| Alice |    99 |
| Bob   |    42 |
`;

const escape = (str: string) =>
  str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const md = new MarkdownIt({
  highlight: (str: string, lang: string): string => {
    if (lang && hljs.getLanguage(lang)) {
      return `<pre><code class="hljs">${hljs.highlight(str, { language: lang }).value}</code></pre>`;
    }
    return `<pre><code class="hljs">${escape(str)}</code></pre>`;
  },
}).use((md) => {
  md.inline.ruler.after("escape", "math_inline", (state, silent) => {
    if (state.src[state.pos] !== "$") return false;
    const match = state.src.slice(state.pos).match(/^\$([^$\n]+?)\$/);
    if (!match) return false;
    if (!silent) {
      const token = state.push("math_inline", "", 0);
      token.content = match[1];
    }
    state.pos += match[0].length;
    return true;
  });
  md.block.ruler.after("fence", "math_block", (state, start, _end, silent) => {
    const line = state.getLines(start, start + 1, 0, false).trim();
    if (!line.startsWith("$$")) return false;
    const match = line.match(/^\$\$(.+?)\$\$$/);
    if (!match) return false;
    if (!silent) {
      const token = state.push("math_block", "", 0);
      token.content = match[1].trim();
      state.line = start + 1;
    }
    return true;
  });
  md.renderer.rules["math_inline"] = (tokens, idx) =>
    katex.renderToString(tokens[idx].content, { throwOnError: false });
  md.renderer.rules["math_block"] = (tokens, idx) =>
    katex.renderToString(tokens[idx].content, { displayMode: true, throwOnError: false });
});

function App() {
  const html = DOMPurify.sanitize(md.render(content));
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
