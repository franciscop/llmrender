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
  | { type: "mspace"; width: string };

export default function renderMath(tex: string, block = false): ReactElement {
  let i = 0;
  let groupDepth = 0;

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
    varsigma: "ς",
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
  };

  const functions = new Set([
    "sin",
    "cos",
    "tan",
    "log",
    "ln",
    "max",
    "min",
    "exp",
    "det",
    "gcd",
    "sup",
    "inf",
    "cot",
    "sec",
    "csc",
    "arcsin",
    "arccos",
    "arctan",
    "sinh",
    "cosh",
    "tanh",
    "arg",
    "ker",
    "dim",
    "deg",
  ]);

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
        if (ch === "|") return "|";
        if (ch === ".") return "";
        return ch;
      }
      const delimMap: Record<string, string> = {
        lbrace: "{",
        rbrace: "}",
        vert: "|",
        Vert: "‖",
        lfloor: "⌊",
        rfloor: "⌋",
        lceil: "⌈",
        rceil: "⌉",
        langle: "⟨",
        rangle: "⟩",
      };
      return delimMap[dname] ?? dname;
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

    const delimMap: Record<string, [string, string]> = {
      pmatrix: ["(", ")"],
      bmatrix: ["[", "]"],
      vmatrix: ["|", "|"],
      Vmatrix: ["‖", "‖"],
      cases: ["{", ""],
      matrix: ["", ""],
      align: ["", ""],
      "align*": ["", ""],
    };
    const [open, close] = delimMap[envName] ?? ["", ""];

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

    // single-character spacing commands: \, \: \; \! \<space>
    if (!name) {
      const c = peek();
      if (c === ",") {
        consume();
        return { type: "mspace", width: "0.1667em" };
      }
      if (c === ":") {
        consume();
        return { type: "mspace", width: "0.2222em" };
      }
      if (c === ";") {
        consume();
        return { type: "mspace", width: "0.2778em" };
      }
      if (c === "!") {
        consume();
        return { type: "mspace", width: "-0.1667em" };
      }
      if (c === " ") {
        consume();
        return { type: "mspace", width: "0.25em" };
      }
    }

    if (name === "frac" || name === "cfrac") {
      return { type: "mfrac", num: parseGroup(), den: parseGroup() };
    }
    if (name === "binom") {
      return { type: "mbinom", top: parseGroup(), bot: parseGroup() };
    }
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
    if (accents[name]) {
      return {
        type: "mover",
        base: parseGroup(),
        over: { type: "mo", value: accents[name] },
      };
    }
    if (mathVariants[name]) {
      const content = parseGroup();
      return {
        type: "mi",
        value: extractText(content),
        mathvariant: mathVariants[name],
      };
    }

    if (name === "quad") return { type: "mspace", width: "1em" };
    if (name === "qquad") return { type: "mspace", width: "2em" };
    if (name === "enspace") return { type: "mspace", width: "0.5em" };
    if (name === "thinspace") return { type: "mspace", width: "0.1667em" };
    if (name === "medspace") return { type: "mspace", width: "0.2222em" };
    if (name === "thickspace") return { type: "mspace", width: "0.2778em" };
    if (name === "negthinspace") return { type: "mspace", width: "-0.1667em" };
    if (name === "negmedspace") return { type: "mspace", width: "-0.2222em" };
    if (name === "negthickspace") return { type: "mspace", width: "-0.2778em" };
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
          { type: "mspace", width: "0.3333em" },
          arg,
          { type: "mo", value: ")" },
        ],
      };
    }
    if (name === "bmod") {
      return {
        type: "mrow",
        children: [
          { type: "mspace", width: "0.2222em" },
          { type: "mtext", value: "mod" },
          { type: "mspace", width: "0.2222em" },
        ],
      };
    }

    if (name === "cdots") return { type: "mo", value: "⋯" };
    if (name === "ldots") return { type: "mo", value: "…" };
    if (name === "vdots") return { type: "mo", value: "⋮" };
    if (name === "ddots") return { type: "mo", value: "⋱" };
    if (name === "cdot") return { type: "mo", value: "⋅" };
    if (name === "sum") return { type: "mo", value: "∑" };
    if (name === "prod") return { type: "mo", value: "∏" };
    if (name === "int") return { type: "mo", value: "∫" };
    if (name === "iint") return { type: "mo", value: "∬" };
    if (name === "iiint") return { type: "mo", value: "∭" };
    if (name === "oint") return { type: "mo", value: "∮" };
    if (name === "partial") return { type: "mo", value: "∂" };
    if (name === "lim") return { type: "mo", value: "lim" };
    if (name === "infty") return { type: "mo", value: "∞" };
    if (name === "leq" || name === "le") return { type: "mo", value: "≤" };
    if (name === "geq" || name === "ge") return { type: "mo", value: "≥" };
    if (name === "neq" || name === "ne") return { type: "mo", value: "≠" };
    if (name === "pm") return { type: "mo", value: "±" };
    if (name === "mp") return { type: "mo", value: "∓" };
    if (name === "times") return { type: "mo", value: "×" };
    if (name === "div") return { type: "mo", value: "÷" };
    if (name === "in") return { type: "mo", value: "∈" };
    if (name === "notin") return { type: "mo", value: "∉" };
    if (name === "subset") return { type: "mo", value: "⊂" };
    if (name === "subseteq") return { type: "mo", value: "⊆" };
    if (name === "supset") return { type: "mo", value: "⊃" };
    if (name === "supseteq") return { type: "mo", value: "⊇" };
    if (name === "cup") return { type: "mo", value: "∪" };
    if (name === "cap") return { type: "mo", value: "∩" };
    if (name === "emptyset" || name === "varnothing")
      return { type: "mo", value: "∅" };
    if (name === "forall") return { type: "mo", value: "∀" };
    if (name === "exists") return { type: "mo", value: "∃" };
    if (name === "nexists") return { type: "mo", value: "∄" };
    if (name === "nabla") return { type: "mo", value: "∇" };
    if (name === "approx") return { type: "mo", value: "≈" };
    if (name === "equiv") return { type: "mo", value: "≡" };
    if (name === "propto") return { type: "mo", value: "∝" };
    if (name === "sim") return { type: "mo", value: "∼" };
    if (name === "simeq") return { type: "mo", value: "≃" };
    if (name === "cong") return { type: "mo", value: "≅" };
    if (name === "wedge" || name === "land") return { type: "mo", value: "∧" };
    if (name === "vee" || name === "lor") return { type: "mo", value: "∨" };
    if (name === "neg" || name === "lnot") return { type: "mo", value: "¬" };
    if (name === "to" || name === "rightarrow")
      return { type: "mo", value: "→" };
    if (name === "leftarrow" || name === "gets")
      return { type: "mo", value: "←" };
    if (name === "Rightarrow") return { type: "mo", value: "⇒" };
    if (name === "Leftarrow") return { type: "mo", value: "⇐" };
    if (name === "leftrightarrow") return { type: "mo", value: "↔" };
    if (name === "Leftrightarrow" || name === "iff")
      return { type: "mo", value: "⟺" };
    if (name === "implies" || name === "Longrightarrow")
      return { type: "mo", value: "⟹" };
    if (name === "impliedby" || name === "Longleftarrow")
      return { type: "mo", value: "⟸" };
    if (name === "Longleftrightarrow") return { type: "mo", value: "⟺" };
    if (name === "longrightarrow") return { type: "mo", value: "⟶" };
    if (name === "longleftarrow") return { type: "mo", value: "⟵" };
    if (name === "longleftrightarrow") return { type: "mo", value: "⟷" };
    if (name === "hookrightarrow") return { type: "mo", value: "↪" };
    if (name === "hookleftarrow") return { type: "mo", value: "↩" };
    if (name === "rightharpoonup") return { type: "mo", value: "⇀" };
    if (name === "leftharpoonup") return { type: "mo", value: "↼" };
    if (name === "uparrow" || name === "up") return { type: "mo", value: "↑" };
    if (name === "downarrow" || name === "down")
      return { type: "mo", value: "↓" };
    if (name === "Uparrow") return { type: "mo", value: "⇑" };
    if (name === "Downarrow") return { type: "mo", value: "⇓" };
    if (name === "updownarrow") return { type: "mo", value: "↕" };
    if (name === "Updownarrow") return { type: "mo", value: "⇕" };
    if (name === "nearrow") return { type: "mo", value: "↗" };
    if (name === "searrow") return { type: "mo", value: "↘" };
    if (name === "swarrow") return { type: "mo", value: "↙" };
    if (name === "nwarrow") return { type: "mo", value: "↖" };
    if (name === "nrightarrow") return { type: "mo", value: "↛" };
    if (name === "nleftarrow") return { type: "mo", value: "↚" };
    if (name === "nRightarrow") return { type: "mo", value: "⇏" };
    if (name === "nLeftarrow") return { type: "mo", value: "⇍" };
    if (name === "mapsto") return { type: "mo", value: "↦" };
    if (name === "perp" || name === "bot") return { type: "mo", value: "⊥" };
    if (name === "top") return { type: "mo", value: "⊤" };
    if (name === "parallel") return { type: "mo", value: "∥" };
    if (name === "angle") return { type: "mo", value: "∠" };
    if (name === "oplus") return { type: "mo", value: "⊕" };
    if (name === "otimes") return { type: "mo", value: "⊗" };
    if (name === "ominus") return { type: "mo", value: "⊖" };
    if (name === "oslash") return { type: "mo", value: "⊘" };
    if (name === "circ") return { type: "mo", value: "∘" };
    if (name === "bullet") return { type: "mo", value: "•" };
    if (name === "mid") return { type: "mo", value: "|" };
    if (name === "nmid") return { type: "mo", value: "∤" };
    if (name === "ast") return { type: "mo", value: "∗" };
    if (name === "star") return { type: "mo", value: "⋆" };
    if (name === "diamond") return { type: "mo", value: "⋄" };
    if (name === "setminus" || name === "backslash")
      return { type: "mo", value: "∖" };
    if (name === "dagger" || name === "dag") return { type: "mo", value: "†" };
    if (name === "ddagger" || name === "ddag")
      return { type: "mo", value: "‡" };
    if (name === "prime") return { type: "mo", value: "′" };
    if (name === "colon") return { type: "mo", value: ":" };
    if (name === "therefore") return { type: "mo", value: "∴" };
    if (name === "because") return { type: "mo", value: "∵" };
    if (name === "ll") return { type: "mo", value: "≪" };
    if (name === "gg") return { type: "mo", value: "≫" };
    if (name === "prec") return { type: "mo", value: "≺" };
    if (name === "succ") return { type: "mo", value: "≻" };
    if (name === "preceq") return { type: "mo", value: "⪯" };
    if (name === "succeq") return { type: "mo", value: "⪰" };
    if (name === "vdash") return { type: "mo", value: "⊢" };
    if (name === "dashv") return { type: "mo", value: "⊣" };
    if (name === "models") return { type: "mo", value: "⊨" };
    if (name === "sqsubset") return { type: "mo", value: "⊏" };
    if (name === "sqsupset") return { type: "mo", value: "⊐" };
    if (name === "sqsubseteq") return { type: "mo", value: "⊑" };
    if (name === "sqsupseteq") return { type: "mo", value: "⊒" };
    if (name === "sqcup") return { type: "mo", value: "⊔" };
    if (name === "sqcap") return { type: "mo", value: "⊓" };
    if (name === "uplus") return { type: "mo", value: "⊎" };
    if (name === "triangle") return { type: "mo", value: "△" };
    if (name === "square") return { type: "mo", value: "□" };
    if (name === "langle") return { type: "mo", value: "⟨" };
    if (name === "rangle") return { type: "mo", value: "⟩" };
    if (name === "lfloor") return { type: "mo", value: "⌊" };
    if (name === "rfloor") return { type: "mo", value: "⌋" };
    if (name === "lceil") return { type: "mo", value: "⌈" };
    if (name === "rceil") return { type: "mo", value: "⌉" };
    if (name === "lbrace") return { type: "mo", value: "{" };
    if (name === "rbrace") return { type: "mo", value: "}" };
    if (name === "vert") return { type: "mo", value: "|" };
    if (name === "Vert") return { type: "mo", value: "‖" };
    if (name === "hbar") return { type: "mi", value: "ℏ" };
    if (name === "ell") return { type: "mi", value: "ℓ" };
    if (name === "Re") return { type: "mi", value: "ℜ" };
    if (name === "Im") return { type: "mi", value: "ℑ" };
    if (name === "wp") return { type: "mi", value: "℘" };
    if (name === "aleph") return { type: "mi", value: "ℵ" };
    if (name === "beth") return { type: "mi", value: "ℶ" };
    if (name === "flat") return { type: "mi", value: "♭" };
    if (name === "sharp") return { type: "mi", value: "♯" };
    if (name === "natural") return { type: "mi", value: "♮" };

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
    switch (node.type) {
      case "mi":
        return (
          <mi key={k} mathvariant={node.mathvariant}>
            {node.value}
          </mi>
        );
      case "mn":
        return <mn key={k}>{node.value}</mn>;
      case "mo":
        return (
          <mo key={k} stretchy={node.stretchy}>
            {node.value}
          </mo>
        );
      case "mtext":
        return <mtext key={k}>{node.value}</mtext>;

      case "mrow":
        return <mrow key={k}>{node.children.map((c, j) => toJSX(c, j))}</mrow>;

      case "mfrac":
        return (
          <mfrac key={k}>
            {toJSX(node.num, 0)}
            {toJSX(node.den, 1)}
          </mfrac>
        );

      case "msqrt":
        return <msqrt key={k}>{toJSX(node.value)}</msqrt>;

      case "mroot":
        return (
          <mroot key={k}>
            {toJSX(node.radicand, 0)}
            {toJSX(node.degree, 1)}
          </mroot>
        );

      case "msup":
        return (
          <msup key={k}>
            {toJSX(node.base, 0)}
            {toJSX(node.sup, 1)}
          </msup>
        );

      case "msub":
        return (
          <msub key={k}>
            {toJSX(node.base, 0)}
            {toJSX(node.sub, 1)}
          </msub>
        );

      case "msubsup":
        return (
          <msubsup key={k}>
            {toJSX(node.base, 0)}
            {toJSX(node.sub, 1)}
            {toJSX(node.sup, 2)}
          </msubsup>
        );

      case "munder":
        return (
          <munder key={k}>
            {toJSX(node.base, 0)}
            {toJSX(node.under, 1)}
          </munder>
        );

      case "mover":
        return (
          <mover key={k}>
            {toJSX(node.base, 0)}
            {toJSX(node.over, 1)}
          </mover>
        );

      case "munderover":
        return (
          <munderover key={k}>
            {toJSX(node.base, 0)}
            {toJSX(node.under, 1)}
            {toJSX(node.over, 2)}
          </munderover>
        );

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
