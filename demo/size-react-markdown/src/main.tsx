import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";

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

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactMarkdown
      remarkPlugins={[remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ className, children }) {
          const lang = /language-(\w+)/.exec(className || "")?.[1];
          return lang ? (
            <SyntaxHighlighter language={lang} style={oneLight}>
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code className={className}>{children}</code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  </StrictMode>,
);
