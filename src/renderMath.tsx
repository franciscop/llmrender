import type { ReactElement } from "react";

type Node =
  | { type: "mi"; value: string }
  | { type: "mn"; value: string }
  | { type: "mo"; value: string }
  | { type: "mrow"; children: Node[] }
  | { type: "mfrac"; num: Node; den: Node }
  | { type: "msqrt"; value: Node }
  | { type: "msup"; base: Node; sup: Node }
  | { type: "msub"; base: Node; sub: Node }
  | { type: "msubsup"; base: Node; sub: Node; sup: Node }
  | { type: "munder"; base: Node; under: Node }
  | { type: "mover"; base: Node; over: Node }
  | { type: "munderover"; base: Node; under: Node; over: Node }
  | { type: "mbinom"; top: Node; bot: Node };

export default function renderMath(tex: string): ReactElement {
  let i = 0;
  let groupDepth = 0;

  const greek: Record<string, string> = {
    alpha: "α",
    beta: "β",
    gamma: "γ",
    delta: "δ",
    epsilon: "ε",
    theta: "θ",
    lambda: "λ",
    mu: "μ",
    pi: "π",
    sigma: "σ",
    phi: "φ",
    omega: "ω",
  };

  const functions = new Set(["sin", "cos", "tan", "log", "ln"]);

  function peek(): string {
    return tex[i] ?? "";
  }

  function consume(): string {
    return tex[i++] ?? "";
  }

  function skipWS() {
    while (/\s/.test(peek())) i++;
  }

  function parseGroup(): Node {
    skipWS();

    if (peek() === "{") {
      consume();
      if (groupDepth++ > 64) {
        // Skip to matching } to avoid stack overflow on malicious input
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

  function parseCommand(): Node {
    consume(); // \

    let name = "";
    while (/[a-zA-Z]/.test(peek())) name += consume();

    if (name === "frac" || name === "cfrac") {
      return {
        type: "mfrac",
        num: parseGroup(),
        den: parseGroup(),
      };
    }

    if (name === "binom") {
      return {
        type: "mbinom",
        top: parseGroup(),
        bot: parseGroup(),
      };
    }

    if (name === "sqrt") {
      return {
        type: "msqrt",
        value: parseGroup(),
      };
    }

    if (name === "cdots") return { type: "mo", value: "⋯" };
    if (name === "ldots") return { type: "mo", value: "…" };
    if (name === "sum") return { type: "mo", value: "∑" };
    if (name === "prod") return { type: "mo", value: "∏" };
    if (name === "int") return { type: "mo", value: "∫" };
    if (name === "iint") return { type: "mo", value: "∬" };
    if (name === "partial") return { type: "mo", value: "∂" };
    if (name === "lim") return { type: "mo", value: "lim" };
    if (name === "infty") return { type: "mo", value: "∞" };
    if (name === "leq") return { type: "mo", value: "≤" };
    if (name === "geq") return { type: "mo", value: "≥" };
    if (name === "neq") return { type: "mo", value: "≠" };
    if (name === "pm") return { type: "mo", value: "±" };
    if (name === "mp") return { type: "mo", value: "∓" };
    if (name === "times") return { type: "mo", value: "×" };
    if (name === "div") return { type: "mo", value: "÷" };
    if (name === "in") return { type: "mo", value: "∈" };
    if (name === "notin") return { type: "mo", value: "∉" };
    if (name === "subset") return { type: "mo", value: "⊂" };

    if (functions.has(name)) {
      return { type: "mi", value: name };
    }

    if (greek[name]) {
      return { type: "mi", value: greek[name] };
    }

    return { type: "mi", value: name };
  }

  function parseAtom(): Node {
    skipWS();
    const ch = peek();

    if (!ch) return { type: "mi", value: "" };

    if (ch === "\\") return parseCommand();

    if (/[0-9]/.test(ch)) {
      let num = "";
      while (/[0-9]/.test(peek())) num += consume();
      return { type: "mn", value: num };
    }

    if (/[a-zA-Z]/.test(ch)) {
      return { type: "mi", value: consume() };
    }

    if ("+-=*/()[]".includes(ch)) {
      return { type: "mo", value: consume() };
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

    // Big operators
    if (base.type === "mo" && ["∑", "∏", "∫", "lim"].includes(base.value)) {
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

    while (i < tex.length) {
      children.push(parseExpression());
    }

    return { type: "mrow", children };
  }

  function toJSX(node: Node, k?: number): ReactElement {
    switch (node.type) {
      case "mi":
        return (
          <mi key={k}>{typeof node.value === "string" ? node.value : ""}</mi>
        );
      case "mn":
        return (
          <mn key={k}>{typeof node.value === "string" ? node.value : ""}</mn>
        );
      case "mo":
        return (
          <mo key={k}>{typeof node.value === "string" ? node.value : ""}</mo>
        );

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
    }

    return <mrow key={k} />;
  }

  return (
    <math xmlns="http://www.w3.org/1998/Math/MathML">{toJSX(parse())}</math>
  );
}
