import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";
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

marked.use(
  markedHighlight({
    langPrefix: "hljs language-",
    highlight: (code, lang) => {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

marked.use({
  extensions: [
    {
      name: "inlineMath",
      level: "inline",
      start: (src) => src.indexOf("$"),
      tokenizer(src) {
        const match = src.match(/^\$([^$\n]+?)\$/);
        if (match) return { type: "inlineMath", raw: match[0], text: match[1] };
      },
      renderer: (token) =>
        katex.renderToString(token.text, { throwOnError: false }),
    },
    {
      name: "blockMath",
      level: "block",
      start: (src) => src.indexOf("$$"),
      tokenizer(src) {
        const match = src.match(/^\$\$([^$]+?)\$\$/s);
        if (match) return { type: "blockMath", raw: match[0], text: match[1].trim() };
      },
      renderer: (token) =>
        katex.renderToString(token.text, { displayMode: true, throwOnError: false }),
    },
  ],
});

function App() {
  const html = DOMPurify.sanitize(marked.parse(content) as string);
  return <div dangerouslySetInnerHTML={{ __html: html }} />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
