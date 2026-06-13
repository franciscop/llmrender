import $ from "react-test";
import Markdown from "../index";

it("renders inline math", () => {
  const component = $(<Markdown>{"The formula $x^2$ is inline"}</Markdown>);
  expect(component.find(".math-inline").length).toBe(1);
  expect(component.find(".math-inline math").length).toBe(1);
});

it("renders display math block (multiline $$)", () => {
  const src = "$$\nx^2\n$$";
  const component = $(<Markdown>{src}</Markdown>);
  expect(component.find(".math-block").length).toBe(1);
  expect(component.find(".math-block math").length).toBe(1);
});

it("renders display math on single line", () => {
  const src = "$$x^2$$";
  const component = $(<Markdown>{src}</Markdown>);
  expect(component.find(".math-block").length).toBe(1);
});

it("marks display math with display=block but not inline math", () => {
  const component = $(<Markdown>{"$$\nx^2\n$$\n\nand $y^2$"}</Markdown>);
  expect(component.find(".math-block math").attr("display")).toBe("block");
  expect(component.find(".math-inline math").attr("display")).toBe(null);
});

it("renders an unclosed $$ block as math (mid-stream)", () => {
  const src = "before\n\n$$\nx^2 + y^2";
  const component = $(<Markdown>{src}</Markdown>);
  expect(component.find("p").text()).toBe("before");
  expect(component.find(".math-block math").length).toBe(1);
});

it("renders multiple inline math expressions", () => {
  const component = $(<Markdown>{"$a$ and $b$"}</Markdown>);
  expect(component.find(".math-inline").length).toBe(2);
});

it("uses a custom math renderer via prop", () => {
  const custom = (tex: string) => <span className="custom-math">{tex}</span>;
  const component = $(<Markdown math={custom}>{"$x^2$"}</Markdown>);
  expect(component.find(".math-inline .custom-math").text()).toBe("x^2");
});

it("renders inline math inside a heading", () => {
  const component = $(<Markdown>{"# Title $x^2$"}</Markdown>);
  expect(component.find("h1 .math-inline").length).toBe(1);
});

it("renders no math-block element when math={false}", () => {
  const el = $(<Markdown math={false}>{"$$\nx^2\n$$"}</Markdown>);
  expect(el.find(".math-block").length).toBe(0);
});

it("renders nothing for single-line display math when math={false}", () => {
  const el = $(<Markdown math={false}>{"$$x^2$$"}</Markdown>);
  expect(el.find(".math-block").length).toBe(0);
});

it("renders inline math as literal text when math={false}", () => {
  const el = $(<Markdown math={false}>{"The formula $x^2$ is here"}</Markdown>);
  expect(el.find(".math-inline").length).toBe(0);
  expect(el.find("p").text()).toContain("x^2");
});

it("renders nothing for children when undefined", () => {
  // @ts-expect-error testing undefined children
  const el = $(<Markdown>{undefined}</Markdown>);
  expect(el.text()).toBe("");
});

it("uses a custom highlight function", () => {
  const hl = (code: string, lang: string) => (
    <pre>
      <code className={`lang-${lang}`}>{code}</code>
    </pre>
  );
  const el = $(<Markdown highlight={hl}>{"```py\nprint(1)\n```"}</Markdown>);
  expect(el.find(".lang-py").text()).toBe("print(1)");
});
