import $ from "react-test";
import renderMath from "./renderMath";

describe("renderMath", () => {
  it("renders simple variable", () => {
    const el = $(renderMath("x"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("mrow mi").text()).toBe("x");
  });

  it("renders numbers", () => {
    const el = $(renderMath("2"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("mrow mn").text()).toBe("2");
  });

  it("renders superscripts", () => {
    const el = $(renderMath("x^2"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("msup mi").text()).toBe("x");
    expect(el.find("msup mn").text()).toBe("2");
  });

  it("renders subscripts", () => {
    const el = $(renderMath("x_1"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("msub mi").text()).toBe("x");
    expect(el.find("msub mn").text()).toBe("1");
  });

  it("renders fractions", () => {
    const el = $(renderMath("\\frac{1}{2}"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("mfrac mrow:nth-child(1) mn").text()).toBe("1");
    expect(el.find("mfrac mrow:nth-child(2) mn").text()).toBe("2");
  });

  it("renders greek letters", () => {
    const el = $(renderMath("\\alpha"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("mrow mi").text()).toBe("α");
  });

  it("renders symbols", () => {
    const el = $(renderMath("\\sum"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("mrow mo").text()).toBe("∑");
  });

  it("renders square root", () => {
    const el = $(renderMath("\\sqrt{x}"));
    expect(el.find("msqrt mi").text()).toBe("x");
  });

  it("renders sqrt of complex expression", () => {
    const el = $(renderMath("\\sqrt{x^2}"));
    expect(el.find("msqrt msup mi").text()).toBe("x");
    expect(el.find("msqrt msup mn").text()).toBe("2");
  });

  it("renders binomial coefficient", () => {
    const el = $(renderMath("\\binom{n}{k}"));
    expect(el.find("mfrac mrow:nth-child(1) mi").text()).toBe("n");
    expect(el.find("mfrac mrow:nth-child(2) mi").text()).toBe("k");
    expect(el.find("mfrac").attr("linethickness")).toBe("0");
  });

  it("renders combined subscript and superscript", () => {
    const el = $(renderMath("x_i^2"));
    expect(el.find("msubsup mi:nth-child(1)").text()).toBe("x");
    expect(el.find("msubsup mi:nth-child(2)").text()).toBe("i");
    expect(el.find("msubsup mn").text()).toBe("2");
  });

  it("renders \\prod symbol", () => {
    const el = $(renderMath("\\prod"));
    expect(el.find("mrow mo").text()).toBe("∏");
  });

  it("renders \\int symbol", () => {
    const el = $(renderMath("\\int"));
    expect(el.find("mrow mo").text()).toBe("∫");
  });

  it("renders \\lim symbol", () => {
    const el = $(renderMath("\\lim"));
    expect(el.find("mrow mo").text()).toBe("lim");
  });

  it("renders lim with subscript as munder", () => {
    const el = $(renderMath("\\lim_{x}"));
    expect(el.find("munder mo").text()).toBe("lim");
    expect(el.find("munder mi").text()).toBe("x");
  });

  it("renders int with sub and sup as munderover", () => {
    const el = $(renderMath("\\int_0^1"));
    expect(el.find("munderover mo").text()).toBe("∫");
    expect(el.find("munderover mn:nth-child(2)").text()).toBe("0");
    expect(el.find("munderover mn:nth-child(3)").text()).toBe("1");
  });

  it("renders cfrac same as frac", () => {
    const el = $(renderMath("\\cfrac{a}{b}"));
    expect(el.find("mfrac mrow:nth-child(1) mi").text()).toBe("a");
    expect(el.find("mfrac mrow:nth-child(2) mi").text()).toBe("b");
  });

  it("renders function names", () => {
    const el = $(renderMath("\\sin"));
    expect(el.find("mrow mi").text()).toBe("sin");
  });

  it("renders operators", () => {
    const el = $(renderMath("x+y"));
    const mos = el.find("mrow mo");
    expect(mos.text()).toBe("+");
  });

  it("renders multi-digit numbers", () => {
    const el = $(renderMath("42"));
    expect(el.find("mrow mn").text()).toBe("42");
  });

  it("renders complex expression", () => {
    const el = $(renderMath("\\sum_{i=0}^n i^2 = \\frac{n(n+1)(2n+1)}{6}"));
    expect(el.attr("xmlns")).toBe("http://www.w3.org/1998/Math/MathML");
    expect(el.find("munderover mo").text()).toBe("∑");
    expect(el.find("munderover mrow mi").text()).toBe("i");
    expect(el.find("munderover mrow mn").text()).toBe("0");
    expect([...el.find("munderover").children()][2]?.textContent).toBe("n");
    expect(el.find("msup mi").text()).toBe("i");
    expect(el.find("msup mn").text()).toBe("2");
    expect(
      el
        .find("mo")
        .filter((el) => el.textContent === "=")
        .text(),
    ).toBe("=");
    expect(el.find("mfrac mrow:nth-child(1) mi").text()).toBe("n");
    expect(el.find("mfrac mrow:nth-child(2) mn").text()).toBe("6");
  });

  // Greek completeness
  it("renders uppercase greek letters", () => {
    const cases: [string, string][] = [
      ["\\Gamma", "Γ"],
      ["\\Delta", "Δ"],
      ["\\Theta", "Θ"],
      ["\\Lambda", "Λ"],
      ["\\Sigma", "Σ"],
      ["\\Pi", "Π"],
      ["\\Phi", "Φ"],
      ["\\Psi", "Ψ"],
      ["\\Omega", "Ω"],
    ];
    for (const [input, expected] of cases) {
      expect($(renderMath(input)).find("mi").text()).toBe(expected);
    }
  });

  it("renders missing lowercase greek letters", () => {
    const cases: [string, string][] = [
      ["\\zeta", "ζ"],
      ["\\eta", "η"],
      ["\\iota", "ι"],
      ["\\kappa", "κ"],
      ["\\nu", "ν"],
      ["\\xi", "ξ"],
      ["\\rho", "ρ"],
      ["\\tau", "τ"],
      ["\\upsilon", "υ"],
      ["\\chi", "χ"],
      ["\\psi", "ψ"],
      ["\\varepsilon", "ε"],
      ["\\varphi", "φ"],
    ];
    for (const [input, expected] of cases) {
      expect($(renderMath(input)).find("mi").text()).toBe(expected);
    }
  });

  // Common symbols
  it("renders \\cdot as centered dot", () => {
    expect($(renderMath("\\cdot")).find("mo").text()).toBe("⋅");
  });

  it("renders arrow symbols", () => {
    expect($(renderMath("\\to")).find("mo").text()).toBe("→");
    expect($(renderMath("\\rightarrow")).find("mo").text()).toBe("→");
    expect($(renderMath("\\leftarrow")).find("mo").text()).toBe("←");
    expect($(renderMath("\\Rightarrow")).find("mo").text()).toBe("⇒");
    expect($(renderMath("\\Leftarrow")).find("mo").text()).toBe("⇐");
    expect($(renderMath("\\Leftrightarrow")).find("mo").text()).toBe("⟺");
    expect($(renderMath("\\leftrightarrow")).find("mo").text()).toBe("↔");
  });

  it("renders relation symbols", () => {
    expect($(renderMath("\\approx")).find("mo").text()).toBe("≈");
    expect($(renderMath("\\equiv")).find("mo").text()).toBe("≡");
    expect($(renderMath("\\propto")).find("mo").text()).toBe("∝");
    expect($(renderMath("\\sim")).find("mo").text()).toBe("∼");
  });

  it("renders logic and set symbols", () => {
    expect($(renderMath("\\forall")).find("mo").text()).toBe("∀");
    expect($(renderMath("\\exists")).find("mo").text()).toBe("∃");
    expect($(renderMath("\\nabla")).find("mo").text()).toBe("∇");
    expect($(renderMath("\\cup")).find("mo").text()).toBe("∪");
    expect($(renderMath("\\cap")).find("mo").text()).toBe("∩");
    expect($(renderMath("\\emptyset")).find("mo").text()).toBe("∅");
    expect($(renderMath("\\wedge")).find("mo").text()).toBe("∧");
    expect($(renderMath("\\vee")).find("mo").text()).toBe("∨");
    expect($(renderMath("\\neg")).find("mo").text()).toBe("¬");
    expect($(renderMath("\\subseteq")).find("mo").text()).toBe("⊆");
    expect($(renderMath("\\supset")).find("mo").text()).toBe("⊃");
  });

  // Additional math functions
  it("renders additional math functions", () => {
    for (const fn of [
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
    ]) {
      expect(
        $(renderMath(`\\${fn}`))
          .find("mi")
          .text(),
      ).toBe(fn);
    }
  });

  // \text{}
  it("renders \\text{} as mtext", () => {
    const el = $(renderMath("\\text{where}"));
    expect(el.find("mtext").length).toBe(1);
    expect(el.find("mtext").text()).toBe("where");
  });

  it("renders \\text{} preserving spaces", () => {
    const el = $(renderMath("x \\text{ for all } x"));
    expect(el.find("mtext").text()).toBe(" for all ");
  });

  // \sqrt[n]
  it("renders \\sqrt[n] as mroot", () => {
    const el = $(renderMath("\\sqrt[3]{x}"));
    expect(el.find("mroot").length).toBe(1);
    expect(el.find("mroot mrow:nth-child(1) mi").text()).toBe("x");
    expect(el.find("mroot mrow:nth-child(2) mn").text()).toBe("3");
  });

  // Accents
  it("renders \\hat as mover", () => {
    const el = $(renderMath("\\hat{x}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mi").text()).toBe("x");
    expect(el.find("mover mo").text()).toBe("ˆ");
  });

  it("renders \\bar as mover", () => {
    const el = $(renderMath("\\bar{x}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mi").text()).toBe("x");
    expect(el.find("mover mo").text()).toBe("‾");
  });

  it("renders \\vec as mover", () => {
    const el = $(renderMath("\\vec{v}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mi").text()).toBe("v");
    expect(el.find("mover mo").text()).toBe("→");
  });

  it("renders \\overline as mover", () => {
    const el = $(renderMath("\\overline{AB}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mo").text()).toBe("‾");
  });

  it("renders \\tilde as mover", () => {
    const el = $(renderMath("\\tilde{x}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mo").text()).toBe("˜");
  });

  it("renders \\dot as mover", () => {
    const el = $(renderMath("\\dot{x}"));
    expect(el.find("mover").length).toBe(1);
    expect(el.find("mover mo").text()).toBe("˙");
  });

  // Font variants
  it("renders \\mathbb with double-struck variant", () => {
    const el = $(renderMath("\\mathbb{R}"));
    expect(el.find("mi").attr("mathvariant")).toBe("double-struck");
    expect(el.find("mi").text()).toBe("R");
  });

  it("renders \\mathbf with bold variant", () => {
    const el = $(renderMath("\\mathbf{x}"));
    expect(el.find("mi").attr("mathvariant")).toBe("bold");
  });

  it("renders \\mathrm with normal variant", () => {
    const el = $(renderMath("\\mathrm{d}"));
    expect(el.find("mi").attr("mathvariant")).toBe("normal");
  });

  // \left \right
  it("renders \\left( ... \\right)", () => {
    const el = $(renderMath("\\left( x \\right)"));
    expect(
      el.find("mo").filter((m) => m.textContent === "(").length,
    ).toBeGreaterThan(0);
    expect(
      el.find("mo").filter((m) => m.textContent === ")").length,
    ).toBeGreaterThan(0);
    expect(el.find("mi").text()).toBe("x");
  });

  it("renders \\left\\{ ... \\right\\} with braces as mo", () => {
    const el = $(renderMath("\\left\\{ x \\right\\}"));
    expect(
      el.find("mo").filter((m) => m.textContent === "{").length,
    ).toBeGreaterThan(0);
    expect(
      el.find("mo").filter((m) => m.textContent === "}").length,
    ).toBeGreaterThan(0);
  });

  // Matrix environments
  it("renders \\begin{pmatrix}", () => {
    const el = $(
      renderMath("\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}"),
    );
    expect(el.find("mtable").length).toBe(1);
    expect(el.find("mtr").length).toBe(2);
    expect(el.find("mtd").length).toBe(4);
  });

  it("renders \\begin{bmatrix}", () => {
    const el = $(
      renderMath("\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}"),
    );
    expect(el.find("mtable").length).toBe(1);
    expect(el.find("mtr").length).toBe(2);
    expect(el.find("mtd").length).toBe(4);
  });

  it("renders \\begin{cases}", () => {
    const el = $(
      renderMath(
        "\\begin{cases} x & x > 0 \\\\ 0 & \\text{otherwise} \\end{cases}",
      ),
    );
    expect(el.find("mtable").length).toBe(1);
    expect(el.find("mtr").length).toBe(2);
  });

  it("renders piecewise with \\geq and < in cases", () => {
    const el = $(
      renderMath(
        "f(x) = \\begin{cases} x^2 & x \\geq 0 \\\\ -x & x < 0 \\end{cases}",
      ),
    );
    expect(el.find("mtable").length).toBe(1);
    expect(el.find("mtr").length).toBe(2);
    // first row condition: x ≥ 0
    expect(el.find("mtr:nth-child(1) mtd:nth-child(2) mo").text()).toBe("≥");
    // second row condition: x < 0 — < must be an mo, not mi
    expect(el.find("mtr:nth-child(2) mtd:nth-child(2) mo").text()).toBe("<");
  });

  it("renders \\begin{matrix} without delimiters", () => {
    const el = $(renderMath("\\begin{matrix} a & b \\\\ c & d \\end{matrix}"));
    expect(el.find("mtable").length).toBe(1);
    expect(el.find("mtr").length).toBe(2);
  });
});
