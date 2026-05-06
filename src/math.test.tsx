import $ from "react-test";
import Markdown from "./index";

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
