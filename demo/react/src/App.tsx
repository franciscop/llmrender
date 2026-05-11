import Markdown, { highlightCode } from "llmrender";
import { useState } from "react";
import type { ReactNode } from "react";
import "./llmrender.css";
import "./App.css";
import content from "./test.md?raw";

function CodeBlock({ code, children }: { code: string; children: ReactNode }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: "relative" }}>
      <button onClick={copy} className="copy-btn">
        {copied ? "Copied!" : "Copy"}
      </button>
      {children}
    </div>
  );
}

function highlight(code: string, lang: string): ReactNode[] {
  return [<CodeBlock key="c" code={code}>{highlightCode(code, lang)}</CodeBlock>];
}

function App() {
  return <Markdown highlight={highlight}>{content}</Markdown>;
}

export default App;
