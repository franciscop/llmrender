import type { ReactElement } from "react";

type Node =
  | { type: "mi"; value: string; mathvariant?: string }
  | { type: "mn"; value: string }
  | { type: "mo"; value: string; stretchy?: "false" }
  | { type: "mtext"; value: string }
  | { type: "mrow"; children: Node[] }
  | { type: "mfrac"; num: Node; den: Node }
  | { type: "msqrt"; value: Node }
  | { type: "mroot"; radicand: Node; degree: Node }
  | { type: "msup"; base: Node; sup: Node }
  | { type: "msub"; base: Node; sub: Node }
  | { type: "msubsup"; base: Node; sub: Node; sup: Node }
  | { type: "munder"; base: Node; under: Node }
  | { type: "mover"; base: Node; over: Node }
  | { type: "munderover"; base: Node; under: Node; over: Node }
  | { type: "mbinom"; top: Node; bot: Node }
  | { type: "mtable"; rows: Node[][] }
  | { type: "mspace"; width: string }
  | { type: "mstyle"; displaystyle: boolean; child: Node };

// Hoisted: rebuilding 229 entries per expression is wasted during streaming.
const greek: Record<string, string> = {
  // lowercase
  alpha: "α",
  beta: "β",
  gamma: "γ",
  delta: "δ",
  epsilon: "ε",
  zeta: "ζ",
  eta: "η",
  theta: "θ",
  iota: "ι",
  kappa: "κ",
  lambda: "λ",
  mu: "μ",
  nu: "ν",
  xi: "ξ",
  pi: "π",
  rho: "ρ",
  sigma: "σ",
  tau: "τ",
  upsilon: "υ",
  phi: "φ",
  chi: "χ",
  psi: "ψ",
  omega: "ω",
  // variants
  varepsilon: "ε",
  varphi: "φ",
  vartheta: "ϑ",
  // uppercase
  Gamma: "Γ",
  Delta: "Δ",
  Theta: "Θ",
  Lambda: "Λ",
  Xi: "Ξ",
  Pi: "Π",
  Sigma: "Σ",
  Upsilon: "Υ",
  Phi: "Φ",
  Psi: "Ψ",
  Omega: "Ω",
  // other letter-like symbols
  hbar: "ℏ",
  ell: "ℓ",
  Re: "ℜ",
  Im: "ℑ",
  aleph: "ℵ",
  flat: "♭",
  sharp: "♯",
  natural: "♮",
};

const spaces: Record<string, string> = {
  ",": "0.17em",
  ":": "0.22em",
  ";": "0.28em",
  "!": "-0.17em",
  " ": "0.25em",
  quad: "1em",
  qquad: "2em",
  enspace: "0.5em",
  thinspace: "0.17em",
  medspace: "0.22em",
  thickspace: "0.28em",
  negthinspace: "-0.17em",
  negmedspace: "-0.22em",
  negthickspace: "-0.28em",
};

const operators: Record<string, string> = {
  cdots: "⋯",
  ldots: "…",
  vdots: "⋮",
  ddots: "⋱",
  cdot: "⋅",
  sum: "∑",
  prod: "∏",
  int: "∫",
  iint: "∬",
  iiint: "∭",
  oint: "∮",
  partial: "∂",
  lim: "lim",
  infty: "∞",
  leq: "≤",
  le: "≤",
  geq: "≥",
  ge: "≥",
  neq: "≠",
  ne: "≠",
  pm: "±",
  mp: "∓",
  times: "×",
  div: "÷",
  in: "∈",
  notin: "∉",
  subset: "⊂",
  subseteq: "⊆",
  supset: "⊃",
  supseteq: "⊇",
  cup: "∪",
  cap: "∩",
  emptyset: "∅",
  varnothing: "∅",
  forall: "∀",
  exists: "∃",
  nexists: "∄",
  nabla: "∇",
  approx: "≈",
  equiv: "≡",
  propto: "∝",
  sim: "∼",
  simeq: "≃",
  cong: "≅",
  wedge: "∧",
  land: "∧",
  vee: "∨",
  lor: "∨",
  neg: "¬",
  lnot: "¬",
  to: "→",
  rightarrow: "→",
  leftarrow: "←",
  gets: "←",
  Rightarrow: "⇒",
  Leftarrow: "⇐",
  leftrightarrow: "↔",
  Leftrightarrow: "⟺",
  iff: "⟺",
  implies: "⟹",
  Longrightarrow: "⟹",
  impliedby: "⟸",
  Longleftarrow: "⟸",
  Longleftrightarrow: "⟺",
  longrightarrow: "⟶",
  longleftarrow: "⟵",
  longleftrightarrow: "⟷",
  hookrightarrow: "↪",
  hookleftarrow: "↩",
  uparrow: "↑",
  up: "↑",
  downarrow: "↓",
  down: "↓",
  Uparrow: "⇑",
  Downarrow: "⇓",
  updownarrow: "↕",
  Updownarrow: "⇕",
  nearrow: "↗",
  searrow: "↘",
  swarrow: "↙",
  nwarrow: "↖",
  mapsto: "↦",
  perp: "⊥",
  bot: "⊥",
  top: "⊤",
  parallel: "∥",
  angle: "∠",
  oplus: "⊕",
  otimes: "⊗",
  circ: "∘",
  bullet: "•",
  mid: "|",
  ast: "∗",
  star: "⋆",
  diamond: "⋄",
  setminus: "∖",
  backslash: "∖",
  dagger: "†",
  dag: "†",
  ddagger: "‡",
  ddag: "‡",
  prime: "′",
  colon: ":",
  therefore: "∴",
  because: "∵",
  ll: "≪",
  gg: "≫",
  prec: "≺",
  succ: "≻",
  preceq: "⪯",
  succeq: "⪰",
  vdash: "⊢",
  dashv: "⊣",
  models: "⊨",
  sqsubset: "⊏",
  sqsupset: "⊐",
  sqsubseteq: "⊑",
  sqsupseteq: "⊒",
  sqcup: "⊔",
  sqcap: "⊓",
  uplus: "⊎",
  triangle: "△",
  square: "□",
  langle: "⟨",
  rangle: "⟩",
  lfloor: "⌊",
  rfloor: "⌋",
  lceil: "⌈",
  rceil: "⌉",
  lbrace: "{",
  rbrace: "}",
  vert: "|",
  Vert: "‖",
};

const accents: Record<string, string> = {
  hat: "ˆ",
  tilde: "˜",
  bar: "‾",
  vec: "→",
  dot: "˙",
  ddot: "¨",
  overline: "‾",
  widehat: "ˆ",
  widetilde: "˜",
};

const mathVariants: Record<string, string> = {
  mathbb: "double-struck",
  mathbf: "bold",
  mathrm: "normal",
  mathit: "italic",
  mathcal: "script",
  mathsf: "sans-serif",
  mathtt: "monospace",
};

const ENV_DELIMS: Record<string, [string, string]> = {
  pmatrix: ["(", ")"],
  bmatrix: ["[", "]"],
  vmatrix: ["|", "|"],
  Vmatrix: ["‖", "‖"],
  cases: ["{", ""],
  matrix: ["", ""],
  align: ["", ""],
  "align*": ["", ""],
};

// Nodes whose only difference is the tag and which fields become children.
const SLOTS: Record<string, string[]> = {
  mfrac: ["num", "den"],
  mroot: ["radicand", "degree"],
  msup: ["base", "sup"],
  msub: ["base", "sub"],
  msubsup: ["base", "sub", "sup"],
  munder: ["base", "under"],
  mover: ["base", "over"],
  munderover: ["base", "under", "over"],
};

const functions = new Set(
  "sin cos tan log ln max min exp det gcd sup inf cot sec csc arcsin arccos arctan sinh cosh tanh arg ker dim deg".split(
    " ",
  ),
);

export default function renderMath(tex: string, block = false): ReactElement {
  let i = 0;
  let groupDepth = 0;

  // Single-char keys handle \, \: \; \! and "\ "

  function peek(): string {
    return tex[i] ?? "";
  }
  function consume(): string {
    return tex[i++] ?? "";
  }
  function skipWS() {
    while (/\s/.test(peek())) i++;
  }

  function extractText(node: Node): string {
    switch (node.type) {
      case "mi":
      case "mn":
      case "mo":
      case "mtext":
        return node.value;
      case "mrow":
        return node.children.map(extractText).join("");
      default:
        return "";
    }
  }

  function parseGroup(): Node {
    skipWS();
    if (peek() === "{") {
      consume();
      if (groupDepth++ > 64) {
        let nested = 1;
        while (peek() && nested > 0) {
          const c = consume();
          if (c === "{") nested++;
          else if (c === "}") nested--;
        }
        groupDepth--;
        return { type: "mi", value: "" };
      }
      const children: Node[] = [];
      while (peek() && peek() !== "}") {
        children.push(parseExpression());
      }
      consume(); // }
      groupDepth--;
      return { type: "mrow", children };
    }
    return parseAtom();
  }

  function parseDelimiter(): string {
    skipWS();
    if (peek() === "\\") {
      consume();
      let dname = "";
      while (/[a-zA-Z]/.test(peek())) dname += consume();
      if (dname === "") {
        const ch = consume();
        if (ch === "{") return "{";
        if (ch === "}") return "}";
        if (ch === "|") return "‖";
        if (ch === ".") return "";
        return ch;
      }
      return operators[dname] ?? dname;
    }
    if (peek() === ".") {
      consume();
      return "";
    }
    return consume();
  }

  function parseEnvironment(envName: string): Node {
    const rows: Node[][] = [];
    let currentRow: Node[] = [];
    let currentCell: Node[] = [];

    function flushCell() {
      currentRow.push({ type: "mrow", children: [...currentCell] });
      currentCell = [];
    }
    function flushRow() {
      flushCell();
      if (currentRow.length > 0) rows.push([...currentRow]);
      currentRow = [];
    }

    outer: while (i < tex.length) {
      skipWS();

      if (peek() === "&") {
        consume();
        flushCell();
        continue;
      }

      if (peek() === "\\") {
        const saved = i;
        consume();

        if (peek() === "\\") {
          consume();
          flushRow();
          continue;
        }

        let n = "";
        while (/[a-zA-Z]/.test(peek())) n += consume();

        if (n === "end") {
          skipWS();
          if (peek() === "{") {
            consume();
            while (peek() && peek() !== "}") consume();
            if (peek() === "}") consume();
          }
          flushRow();
          break outer;
        }

        i = saved;
      }

      currentCell.push(parseExpression());
    }

    const [open, close] = ENV_DELIMS[envName] ?? ["", ""];

    const tableNode: Node = { type: "mtable", rows };
    if (!open && !close) return tableNode;

    const children: Node[] = [];
    if (open) children.push({ type: "mo", value: open });
    children.push(tableNode);
    if (close) children.push({ type: "mo", value: close });
    return { type: "mrow", children };
  }

  function parseCommand(): Node {
    consume(); // \

    if (peek() === "\\") {
      consume();
      return { type: "mo", value: "\n" };
    }

    let name = "";
    while (/[a-zA-Z*]/.test(peek())) name += consume();

    // single-character commands: \, \: \; \! \<space> \|
    if (!name) {
      const c = peek();
      if (c === "|") {
        consume();
        return { type: "mo", value: "‖", stretchy: "false" };
      }
      if (spaces[c]) {
        consume();
        return { type: "mspace", width: spaces[c] };
      }
      return { type: "mi", value: "" };
    }

    if (name === "frac" || name === "cfrac")
      return { type: "mfrac", num: parseGroup(), den: parseGroup() };
    if (name === "tfrac")
      return {
        type: "mstyle",
        displaystyle: false,
        child: { type: "mfrac", num: parseGroup(), den: parseGroup() },
      };
    if (name === "dfrac")
      return {
        type: "mstyle",
        displaystyle: true,
        child: { type: "mfrac", num: parseGroup(), den: parseGroup() },
      };
    if (name === "binom")
      return { type: "mbinom", top: parseGroup(), bot: parseGroup() };
    if (name === "sqrt") {
      skipWS();
      if (peek() === "[") {
        consume();
        const degNodes: Node[] = [];
        while (peek() && peek() !== "]") degNodes.push(parseExpression());
        if (peek() === "]") consume();
        return {
          type: "mroot",
          radicand: parseGroup(),
          degree: { type: "mrow", children: degNodes },
        };
      }
      return { type: "msqrt", value: parseGroup() };
    }
    if (name === "text") {
      skipWS();
      if (peek() === "{") {
        consume();
        let text = "";
        let depth = 1;
        while (i < tex.length && depth > 0) {
          const c = consume();
          if (c === "{") {
            depth++;
            text += c;
          } else if (c === "}") {
            depth--;
            if (depth > 0) text += c;
          } else text += c;
        }
        return { type: "mtext", value: text };
      }
      return { type: "mtext", value: "" };
    }
    if (name === "begin") {
      skipWS();
      let envName = "";
      if (peek() === "{") {
        consume();
        while (peek() && peek() !== "}") envName += consume();
        if (peek() === "}") consume();
      }
      return parseEnvironment(envName);
    }
    if (name === "left") {
      const openDelim = parseDelimiter();
      const children: Node[] = [];
      while (i < tex.length) {
        skipWS();
        if (peek() === "\\") {
          const saved = i;
          consume();
          let n = "";
          while (/[a-zA-Z]/.test(peek())) n += consume();
          if (n === "right") {
            const closeDelim = parseDelimiter();
            const result: Node[] = [];
            if (openDelim) result.push({ type: "mo", value: openDelim });
            result.push(...children);
            if (closeDelim) result.push({ type: "mo", value: closeDelim });
            return { type: "mrow", children: result };
          }
          i = saved;
        }
        children.push(parseExpression());
      }
      const result: Node[] = [];
      if (openDelim) result.push({ type: "mo", value: openDelim });
      result.push(...children);
      return { type: "mrow", children: result };
    }
    if (accents[name])
      return {
        type: "mover",
        base: parseGroup(),
        over: { type: "mo", value: accents[name] },
      };
    if (mathVariants[name]) {
      const content = parseGroup();
      return {
        type: "mi",
        value: extractText(content),
        mathvariant: mathVariants[name],
      };
    }
    if (name === "hspace" || name === "hspace*") {
      skipWS();
      let w = "";
      if (peek() === "{") {
        consume();
        while (peek() && peek() !== "}") w += consume();
        if (peek() === "}") consume();
      }
      return { type: "mspace", width: w || "0em" };
    }
    if (name === "pmod") {
      const arg = parseGroup();
      return {
        type: "mrow",
        children: [
          { type: "mspace", width: "1em" },
          { type: "mo", value: "(" },
          { type: "mtext", value: "mod" },
          { type: "mspace", width: "0.33em" },
          arg,
          { type: "mo", value: ")" },
        ],
      };
    }
    if (name === "bmod")
      return {
        type: "mrow",
        children: [
          { type: "mspace", width: "0.22em" },
          { type: "mtext", value: "mod" },
          { type: "mspace", width: "0.22em" },
        ],
      };

    if (spaces[name]) return { type: "mspace", width: spaces[name] };
    if (operators[name]) {
      const value = operators[name];
      const stretchy = "|‖⟨⟩⌊⌋⌈⌉{}".includes(value)
        ? ("false" as const)
        : undefined;
      return { type: "mo", value, stretchy };
    }
    if (functions.has(name)) return { type: "mi", value: name };
    if (greek[name]) return { type: "mi", value: greek[name] };

    return { type: "mi", value: name };
  }

  function parseAtom(): Node {
    skipWS();
    const ch = peek();

    if (!ch) return { type: "mi", value: "" };
    if (ch === "\\") return parseCommand();

    if (/[0-9]/.test(ch)) {
      let num = "";
      while (/[0-9.]/.test(peek())) num += consume();
      return { type: "mn", value: num };
    }

    if (/[a-zA-Z]/.test(ch)) return { type: "mi", value: consume() };

    if ("+-=*/()[]|,;!<>".includes(ch)) {
      const v = consume();
      const stretchy = "()[]|".includes(v) ? ("false" as const) : undefined;
      return { type: "mo", value: v, stretchy };
    }

    return { type: "mi", value: consume() };
  }

  function parseScripts(base: Node): Node {
    let sub: Node | null = null;
    let sup: Node | null = null;

    while (true) {
      skipWS();
      const ch = peek();
      if (ch === "_") {
        consume();
        sub = parseGroup();
        continue;
      }
      if (ch === "^") {
        consume();
        sup = parseGroup();
        continue;
      }
      // A run of apostrophes is a prime superscript: m' is m to the prime.
      if (ch === "'") {
        let marks = "";
        while (peek() === "'") {
          consume();
          marks += "′";
        }
        sup = { type: "mo", value: marks };
        continue;
      }
      break;
    }

    if (
      base.type === "mo" &&
      ["∑", "∏", "∫", "∬", "∭", "∮", "lim"].includes(base.value)
    ) {
      if (sub && sup)
        return { type: "munderover", base, under: sub, over: sup };
      if (sub) return { type: "munder", base, under: sub };
      if (sup) return { type: "mover", base, over: sup };
      return base;
    }

    if (sub && sup) return { type: "msubsup", base, sub, sup };
    if (sub) return { type: "msub", base, sub };
    if (sup) return { type: "msup", base, sup };
    return base;
  }

  function parseExpression(): Node {
    const base = parseAtom();
    return parseScripts(base);
  }

  function parse(): Node {
    const children: Node[] = [];
    while (i < tex.length) children.push(parseExpression());
    return { type: "mrow", children };
  }

  function toJSX(node: Node, k?: number): ReactElement {
    const slots = SLOTS[node.type];
    if (slots) {
      const Tag = node.type as "msup";
      return (
        <Tag key={k}>{slots.map((f, i) => toJSX((node as never)[f], i))}</Tag>
      );
    }

    switch (node.type) {
      case "mi":
      case "mn":
      case "mo":
      case "mtext": {
        const Tag = node.type;
        return (
          <Tag
            key={k}
            {...({
              mathvariant: (node as { mathvariant?: string }).mathvariant,
              stretchy: (node as { stretchy?: string }).stretchy,
            } as object)}
          >
            {node.value}
          </Tag>
        );
      }

      case "mrow":
        return <mrow key={k}>{node.children.map((c, j) => toJSX(c, j))}</mrow>;

      case "mstyle":
        return (
          <mstyle key={k} {...({ displaystyle: node.displaystyle } as {})}>
            {toJSX(node.child, 0)}
          </mstyle>
        );

      case "msqrt":
        return <msqrt key={k}>{toJSX(node.value)}</msqrt>;

      case "mbinom":
        return (
          <mrow key={k}>
            <mo key={0}>(</mo>
            <mfrac key={1} linethickness="0">
              {toJSX(node.top, 0)}
              {toJSX(node.bot, 1)}
            </mfrac>
            <mo key={2}>)</mo>
          </mrow>
        );

      case "mspace":
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return <mspace key={k} {...({ width: node.width } as any)} />;

      case "mtable":
        return (
          <mtable key={k}>
            {node.rows.map((row, ri) => (
              <mtr key={ri}>
                {row.map((cell, ci) => (
                  <mtd key={ci}>{toJSX(cell)}</mtd>
                ))}
              </mtr>
            ))}
          </mtable>
        );
    }

    return <mrow key={k} />;
  }

  return (
    <math
      xmlns="http://www.w3.org/1998/Math/MathML"
      display={block ? "block" : undefined}
    >
      {toJSX(parse())}
    </math>
  );
}
