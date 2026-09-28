import $ from "react-test";
import Markdown from "./index";

// Nested unordered lists
it("renders a nested unordered list", () => {
  const $el = $(<Markdown>{"- item\n  - sub"}</Markdown>);
  expect($el.find("ul").find("ul").find("li").text()).toBe("sub");
});

it("renders multiple nested items", () => {
  const $el = $(<Markdown>{"- item\n  - a\n  - b"}</Markdown>);
  expect($el.find("ul").find("ul").find("li").length).toBe(2);
});

// Nested ordered lists
it("renders a nested ordered list", () => {
  const $el = $(<Markdown>{"1. item\n   1. sub"}</Markdown>);
  expect($el.find("ol").find("ol").find("li").text()).toBe("sub");
});

// Nested blockquotes
it("renders a nested blockquote", () => {
  const $el = $(<Markdown>{"> > inner"}</Markdown>);
  expect($el.find("blockquote").find("blockquote").find("p").text()).toBe(
    "inner",
  );
});

it("renders text before and after nested blockquote", () => {
  const $el = $(<Markdown>{"> outer\n> > inner"}</Markdown>);
  const outer = $el.find("blockquote");
  expect(outer.find("blockquote").find("p").text()).toBe("inner");
});

// Content inside list items
it("nests bullets under a numbered item", () => {
  const $el = $(
    <Markdown>{"1. **Install**\n   - run npm\n   - wait\n2. Use"}</Markdown>,
  );
  expect($el.find("ol > li").length).toBe(2);
  expect($el.find("ol > li ul > li").array("textContent")).toEqual([
    "run npm",
    "wait",
  ]);
  expect($el.find("p").length).toBe(0);
});

it("keeps an indented paragraph inside its item", () => {
  const $el = $(
    <Markdown>{"1. Install\n   Run the command.\n2. Next"}</Markdown>,
  );
  expect($el.find("li").text()).toBe("Install Run the command.");
  expect($el.find("ol").length).toBe(1);
});

it("keeps a fenced code block inside its item", () => {
  const src = "1. Install:\n   ```bash\n   npm i x\n   ```\n2. Import it";
  const $el = $(<Markdown>{src}</Markdown>);
  expect($el.find("ol").length).toBe(1);
  expect($el.find("li pre code").text()).toBe("npm i x");
});

it("continues an item with an unindented line", () => {
  const $el = $(<Markdown>{"- one\ncontinued\n- two"}</Markdown>);
  expect($el.find("li").array("textContent")).toEqual(["one continued", "two"]);
  expect($el.find("p").length).toBe(0);
});

it("nests three levels with 2 or 4 space indents", () => {
  for (const src of ["- a\n  - b\n    - c", "- a\n    - b\n        - c"]) {
    const $el = $(<Markdown>{src}</Markdown>);
    expect($el.find("ul ul ul li").text()).toBe("c");
    expect($el.find("pre").length).toBe(0);
  }
});

it("nests under wide ordered markers", () => {
  const $el = $(<Markdown>{"10. a\n    - sub"}</Markdown>);
  expect($el.find("ol li ul li").text()).toBe("sub");
});

it("keeps a loose list as one list", () => {
  const $el = $(<Markdown>{"1. a\n\n2. b\n\n3. c"}</Markdown>);
  expect($el.find("ol").length).toBe(1);
  expect($el.find("li").length).toBe(3);
});

it("keeps a second paragraph inside its item", () => {
  const $el = $(<Markdown>{"- a\n\n  more about a\n- b"}</Markdown>);
  expect($el.find("ul").length).toBe(1);
  expect($el.find("li p").text()).toBe("more about a");
});

it("ends the list at an unindented paragraph after a blank line", () => {
  const $el = $(<Markdown>{"- a\n\nAfter"}</Markdown>);
  expect($el.find("div > p").text()).toBe("After");
  expect($el.find("li").text()).toBe("a");
});

it("does not turn an item into a heading while a nested bullet streams in", () => {
  expect($(<Markdown>{"- a\n  - "}</Markdown>).find("h2").length).toBe(0);
});
