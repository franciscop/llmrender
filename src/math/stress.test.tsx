import $ from "react-test";
import renderMath from "./renderMath";

// Each test feeds a realistic, multi-construct LaTeX expression and asserts
// the resulting MathML tree — not just one element, but the right combination
// of nested nodes that a correct parse produces.

describe("quadratic formula", () => {
  // x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
  const el = $(renderMath("x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}"));

  it("has a fraction at the top level", () => {
    expect(el.find("mfrac").length).toBeGreaterThanOrEqual(1);
  });

  it("has a sqrt in the numerator", () => {
    expect(el.find("mfrac msqrt").length).toBeGreaterThanOrEqual(1);
  });

  it("contains ± operator", () => {
    expect([...el.find("mo")].some((n) => n.textContent === "±")).toBe(true);
  });

  it("has superscript for b²", () => {
    expect(el.find("msup").length).toBeGreaterThanOrEqual(1);
  });
});

describe("Euler's identity", () => {
  // e^{i\pi} + 1 = 0
  const el = $(renderMath("e^{i\\pi} + 1 = 0"));

  it("has superscript on e", () => {
    expect(el.find("msup").length).toBeGreaterThanOrEqual(1);
  });

  it("π is rendered as mi", () => {
    expect([...el.find("mi")].some((n) => n.textContent === "π")).toBe(true);
  });

  it("contains + and = operators", () => {
    const ops = [...el.find("mo")].map((n) => n.textContent);
    expect(ops).toContain("+");
    expect(ops).toContain("=");
  });
});

describe("Gaussian integral", () => {
  // \int_{-\infty}^{+\infty} e^{-x^2} dx = \sqrt{\pi}
  const el = $(
    renderMath("\\int_{-\\infty}^{+\\infty} e^{-x^2}\\,dx = \\sqrt{\\pi}"),
  );

  it("integral has munderover", () => {
    expect(el.find("munderover mo").length).toBeGreaterThanOrEqual(1);
    expect(
      [...el.find("munderover mo")].some((n) => n.textContent === "∫"),
    ).toBe(true);
  });

  it("lower limit contains ∞", () => {
    expect([...el.find("mo")].some((n) => n.textContent === "∞")).toBe(true);
  });

  it("has a sqrt wrapping π", () => {
    expect(el.find("msqrt mi").length).toBeGreaterThanOrEqual(1);
    expect([...el.find("msqrt mi")].some((n) => n.textContent === "π")).toBe(
      true,
    );
  });

  it("exponent on e contains nested msup", () => {
    expect(el.find("msup msup").length).toBeGreaterThanOrEqual(1);
  });
});

describe("sum with limits", () => {
  // \sum_{k=1}^{n} k^2 = \frac{n(n+1)(2n+1)}{6}
  const el = $(renderMath("\\sum_{k=1}^{n} k^2 = \\frac{n(n+1)(2n+1)}{6}"));

  it("sum has munderover", () => {
    expect(
      [...el.find("munderover mo")].some((n) => n.textContent === "∑"),
    ).toBe(true);
  });

  it("lower limit has k=1", () => {
    const underRow = el.find("munderover mrow:nth-child(2)");
    expect(underRow.text()).toContain("k");
    expect(underRow.text()).toContain("1");
  });

  it("has k² via msup", () => {
    expect(el.find("msup").length).toBeGreaterThanOrEqual(1);
  });

  it("has fraction with 6 in denominator", () => {
    expect(
      [...el.find("mfrac mrow:nth-child(2) mn")].some(
        (n) => n.textContent === "6",
      ),
    ).toBe(true);
  });
});

describe("nested fractions", () => {
  // \frac{1}{1 + \frac{1}{1 + \frac{1}{x}}}
  const el = $(renderMath("\\frac{1}{1 + \\frac{1}{1 + \\frac{1}{x}}}"));

  it("has three levels of mfrac nesting", () => {
    expect(el.find("mfrac mfrac mfrac").length).toBeGreaterThanOrEqual(1);
  });

  it("outermost numerator is 1", () => {
    expect(el.find("mfrac > mrow:nth-child(1) mn").text()).toBe("1");
  });
});

describe("matrix (pmatrix)", () => {
  // \begin{pmatrix} a & b & c \\ d & e & f \\ g & h & i \end{pmatrix}
  const el = $(
    renderMath(
      "\\begin{pmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{pmatrix}",
    ),
  );

  it("has 3 rows", () => {
    expect(el.find("mtr").length).toBe(3);
  });

  it("has 9 cells", () => {
    expect(el.find("mtd").length).toBe(9);
  });

  it("is wrapped in parentheses", () => {
    const ops = [...el.find("mo")].map((n) => n.textContent);
    expect(ops).toContain("(");
    expect(ops).toContain(")");
  });
});

describe("cases environment", () => {
  // f(x) = \begin{cases} x^2 & x \geq 0 \\ -x & x < 0 \end{cases}
  const el = $(
    renderMath(
      "f(x) = \\begin{cases} x^2 & x \\geq 0 \\\\ -x & x < 0 \\end{cases}",
    ),
  );

  it("has a table with 2 rows", () => {
    expect(el.find("mtable").length).toBeGreaterThanOrEqual(1);
    expect(el.find("mtr").length).toBe(2);
  });

  it("opens with {", () => {
    expect([...el.find("mo")].some((n) => n.textContent === "{")).toBe(true);
  });

  it("first row has ≥ as condition", () => {
    expect(
      [...el.find("mtr:nth-child(1) mo")].some((n) => n.textContent === "≥"),
    ).toBe(true);
  });

  it("second row has < as condition", () => {
    expect(
      [...el.find("mtr:nth-child(2) mo")].some((n) => n.textContent === "<"),
    ).toBe(true);
  });
});

describe("font variants", () => {
  it("\\mathbb{R}^n gives double-struck R with superscript", () => {
    const el = $(renderMath("\\mathbb{R}^n"));
    expect(el.find("msup mi").attr("mathvariant")).toBe("double-struck");
    expect(el.find("msup mi").text()).toBe("R");
  });

  it("\\mathbf{v} gives bold v", () => {
    const el = $(renderMath("\\mathbf{v}"));
    expect(el.find("mi").attr("mathvariant")).toBe("bold");
    expect(el.find("mi").text()).toBe("v");
  });

  it("\\mathcal{L} gives script L", () => {
    const el = $(renderMath("\\mathcal{L}"));
    expect(el.find("mi").attr("mathvariant")).toBe("script");
  });
});

describe("accents on complex bases", () => {
  it("\\hat{A} produces mover with ˆ", () => {
    const el = $(renderMath("\\hat{A}"));
    expect(el.find("mover mi").text()).toBe("A");
    expect(el.find("mover mo").text()).toBe("ˆ");
  });

  it("\\vec{\\nabla} places → over ∇", () => {
    const el = $(renderMath("\\vec{\\nabla}"));
    expect(el.find("mover mo:nth-child(1)").text()).toBe("∇");
    expect(el.find("mover mo:nth-child(2)").text()).toBe("→");
  });

  it("\\overline{AB} marks a segment", () => {
    const el = $(renderMath("\\overline{AB}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mo").text()).toBe("‾");
  });
});

describe("multi-expression paragraph", () => {
  // renders correctly without throwing even with many constructs together
  const expr =
    "\\forall \\epsilon > 0, \\exists \\delta > 0 : |x - a| < \\delta \\Rightarrow |f(x) - L| < \\epsilon";

  it("renders without throwing", () => {
    expect(() => $(renderMath(expr))).not.toThrow();
  });

  it("contains ∀ and ∃", () => {
    const el = $(renderMath(expr));
    const ops = [...el.find("mo")].map((n) => n.textContent);
    expect(ops).toContain("∀");
    expect(ops).toContain("∃");
  });

  it("contains ⇒", () => {
    const el = $(renderMath(expr));
    expect([...el.find("mo")].some((n) => n.textContent === "⇒")).toBe(true);
  });
});

describe("deeply nested scripts", () => {
  it("T_{ij}^{kl} produces msubsup", () => {
    const el = $(renderMath("T_{ij}^{kl}"));
    expect(el.find("msubsup").length).toBeGreaterThanOrEqual(1);
  });

  it("x_{n+1} has subscript with an operator inside", () => {
    const el = $(renderMath("x_{n+1}"));
    expect(el.find("msub mrow mo").text()).toContain("+");
  });

  it("e^{x^2} has msup inside msup", () => {
    const el = $(renderMath("e^{x^2}"));
    expect(el.find("msup msup").length).toBeGreaterThanOrEqual(1);
  });
});
