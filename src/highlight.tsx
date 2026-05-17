import type { ReactNode } from "react";

type Token = { regex: RegExp; cls: string };

const kw = (words: string): Token => ({
  regex: new RegExp(`\\b(${words.trim().split(/\s+/).join("|")})\\b`),
  cls: "keyword",
});

const BASE =
  "as async await break case catch class const continue default delete do else enum export extends false finally for from function if import in instanceof interface let loop match new null of return static struct super switch this throw true try type typeof undefined use var void while yield";

// --- Shared tokens ---
const COMMENT_SLASH: Token = {
  regex: /\/\/[^\n]*|\/\*[\s\S]*?\*\//,
  cls: "comment",
};
const COMMENT_BLOCK: Token = { regex: /\/\*[\s\S]*?\*\//, cls: "comment" };
const COMMENT_HASH: Token = { regex: /#[^\n]*/, cls: "comment" };
const COMMENT_HTML: Token = { regex: /<!--[\s\S]*?-->/, cls: "comment" };
const STRING_JS: Token = {
  regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/,
  cls: "string",
};
const STRING_PY: Token = {
  regex: /"""[\s\S]*?"""|'''[\s\S]*?'''|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
  cls: "string",
};
const STRING_BASIC: Token = {
  regex: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/,
  cls: "string",
};
const STRING_HTML: Token = { regex: /"[^"]*"|'[^']*'/, cls: "string" };
const NUMBER: Token = {
  regex:
    /\b(0[xX][0-9a-fA-F][0-9a-fA-F_]*|0[bB][01][01_]*|0[oO][0-7][0-7_]*|\d[\d_]*(\.\d[\d_]*)?)\b/,
  cls: "number",
};
const NUMBER_CSS: Token = {
  regex: /#[0-9a-fA-F]{3,8}\b|\b\d+(\.\d+)?(px|em|rem|vh|vw|%|s|ms)?\b/,
  cls: "number",
};
const VAR_SH: Token = { regex: /\$\{?[\w#@?*!-]+\}?/, cls: "number" };
const KEYWORD_CSS: Token = { regex: /@\w+|!important/, cls: "keyword" };
const KEYWORD_HTML: Token = { regex: /<\/?[\w.-]+|\/?>/, cls: "keyword" };
const OPERATOR_JS: Token = {
  regex: /===|!==|=>|&&|\|\||[+\-*/%=<>!&|^~?:]+/,
  cls: "operator",
};
const OPERATOR_PY: Token = {
  regex: /\*\*|\/\/|->|[+\-*/%=<>!&|^~]+/,
  cls: "operator",
};
const DECORATOR: Token = { regex: /@[\w.]+/, cls: "keyword" };
const FUNCTION: Token = { regex: /\b([a-z_]\w*)\s*(?=\()/, cls: "function" };
const TYPE: Token = { regex: /\b[A-Z][a-zA-Z0-9]*\b/, cls: "type" };
const RUST_ATTR: Token = { regex: /#!?\[/, cls: "keyword" };
const DIFF_HUNK: Token = { regex: /^@@[^@\n]*@@.*/m, cls: "comment" };
const DIFF_ADD: Token = { regex: /^\+.*/m, cls: "string" };
const DIFF_DEL: Token = { regex: /^-.*/m, cls: "keyword" };
const COMMENT_SQL: Token = { regex: /--[^\n]*/, cls: "comment" };
const KEYWORD_SQL: Token = {
  regex:
    /\b(SELECT|FROM|WHERE|JOIN|LEFT|RIGHT|INNER|OUTER|FULL|CROSS|ON|AND|OR|NOT|IN|EXISTS|LIKE|BETWEEN|IS|NULL|AS|GROUP|BY|ORDER|HAVING|DISTINCT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|ALTER|DROP|INDEX|VIEW|PROCEDURE|TRIGGER|DATABASE|SCHEMA|WITH|UNION|ALL|INTERSECT|EXCEPT|CASE|WHEN|THEN|ELSE|END|LIMIT|OFFSET|RETURNING|DECLARE|BEGIN|COMMIT|ROLLBACK|TRANSACTION|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|DEFAULT|CHECK|CONSTRAINT|ADD|COLUMN|IF)\b/i,
  cls: "keyword",
};

// --- Language definitions ---
const KEY_JS: Token = { regex: /"[^"]*"(?=\s*:)/, cls: "function" };
const js = [
  COMMENT_SLASH,
  KEY_JS,
  STRING_JS,
  kw(BASE),
  TYPE,
  FUNCTION,
  OPERATOR_JS,
  NUMBER,
];
const py = [
  COMMENT_HASH,
  STRING_PY,
  DECORATOR,
  kw(
    `${BASE} and assert def del elif except False global is lambda None nonlocal not or pass raise self True with`,
  ),
  TYPE,
  FUNCTION,
  OPERATOR_PY,
  NUMBER,
];
const go = [
  COMMENT_SLASH,
  STRING_JS,
  kw(`${BASE} chan defer fallthrough func go goto map package range select`),
  TYPE,
  FUNCTION,
  OPERATOR_JS,
  NUMBER,
];
const rust = [
  COMMENT_SLASH,
  RUST_ATTR,
  STRING_JS,
  kw(
    `${BASE} crate dyn extern fn impl mod move mut pub ref self Self trait unsafe where`,
  ),
  TYPE,
  FUNCTION,
  OPERATOR_JS,
  NUMBER,
];
const sh = [
  COMMENT_HASH,
  STRING_BASIC,
  VAR_SH,
  kw(`${BASE} then elif fi done esac echo cd exit source local`),
];
const SELECTOR_CSS: Token = { regex: /[.#:][\w-]+/, cls: "type" };
const PROPERTY_CSS: Token = { regex: /\b[\w-]+(?=\s*:)/, cls: "function" };
const css = [
  COMMENT_BLOCK,
  STRING_BASIC,
  KEYWORD_CSS,
  SELECTOR_CSS,
  PROPERTY_CSS,
  FUNCTION,
  NUMBER_CSS,
];
const html = [COMMENT_HTML, STRING_HTML, KEYWORD_HTML];
const jsxTokens = [...html, ...js];
const diff = [DIFF_HUNK, DIFF_ADD, DIFF_DEL];
const sql = [COMMENT_SQL, STRING_BASIC, KEYWORD_SQL, NUMBER, FUNCTION];

const languages: Record<string, Token[]> = {
  js,
  javascript: js,
  ts: js,
  typescript: js,
  c: js,
  cpp: js,
  "c++": js,
  cs: js,
  csharp: js,
  java: js,
  kotlin: js,
  kt: js,
  scala: js,
  swift: js,
  php: js,
  go,
  rust,
  rs: rust,
  py,
  python: py,
  rb: py,
  ruby: py,
  yaml: py,
  yml: py,
  toml: py,
  json: js,
  jsonc: js,
  sql,
  diff,
  patch: diff,
  css,
  scss: css,
  less: css,
  html,
  xml: html,
  jsx: jsxTokens,
  tsx: jsxTokens,
  svelte: html,
  vue: html,
  sh,
  bash: sh,
  shell: sh,
  zsh: sh,
  fish: sh,
  dockerfile: sh,
  makefile: sh,
};

function tokenize(code: string, lang: string): ReactNode[] {
  const tokens = languages[lang];
  if (!tokens) return [code];

  const parts: ReactNode[] = [];
  let remaining = code;
  let i = 0;

  while (remaining.length > 0) {
    let earliest: RegExpExecArray | null = null;
    let earliestToken: Token | null = null;

    for (const token of tokens) {
      token.regex.lastIndex = 0;
      const m = token.regex.exec(remaining);
      if (m && (earliest === null || m.index < earliest.index)) {
        earliest = m;
        earliestToken = token;
      }
    }

    if (!earliest || !earliestToken) {
      parts.push(remaining);
      break;
    }
    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }
    parts.push(
      <span key={i++} className={earliestToken.cls}>
        {earliest[0]}
      </span>,
    );
    remaining = remaining.slice(earliest.index + earliest[0].length);
  }

  return parts;
}

export default function highlightCode(code: string, lang: string): ReactNode {
  return (
    <pre>
      <code className={lang ? `language-${lang}` : undefined}>
        {tokenize(code, lang)}
      </code>
    </pre>
  );
}
