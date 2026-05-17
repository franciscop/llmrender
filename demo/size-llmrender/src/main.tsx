import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Markdown from "llmrender";
import "llmrender/themes/default.css";

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
    <Markdown>{content}</Markdown>
  </StrictMode>,
);
