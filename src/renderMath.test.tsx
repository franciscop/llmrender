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
});
