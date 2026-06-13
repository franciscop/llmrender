import $ from "react-test";
import Markdown from "./index";

// Streaming partial-line stability: the last line of a streamed buffer is often
// incomplete. These tests assert that incomplete block-markers don't corrupt
// what has already been rendered above them.

// ---------------------------------------------------------------------------
// Bare unordered list markers
// ---------------------------------------------------------------------------

it("bare '- ' at end of list skips the empty item and keeps the list", () => {
  const src = "- alpha\n- beta\n- ";
  const el = $(<Markdown>{src}</Markdown>);
  const items = el.find("li");
  expect(items.length).toBe(2);
  expect(items.array("textContent")).toEqual(["alpha", "beta"]);
  expect(el.find("p").length).toBe(0);
});

it("bare '* ' at end of list skips the empty item and keeps the list", () => {
  const src = "* one\n* two\n* ";
  const items = $(<Markdown>{src}</Markdown>).find("li");
  expect(items.length).toBe(2);
  expect(items.array("textContent")).toEqual(["one", "two"]);
});

it("bare '+ ' at end of list skips the empty item and keeps the list", () => {
  const src = "+ a\n+ b\n+ ";
  const items = $(<Markdown>{src}</Markdown>).find("li");
  expect(items.length).toBe(2);
  expect(items.array("textContent")).toEqual(["a", "b"]);
});

it("bare '- ' alone renders nothing", () => {
  const el = $(<Markdown>{"- "}</Markdown>);
  expect(el.find("li").length).toBe(0);
  expect(el.find("p").length).toBe(0);
});

it("bare '-' (no space) alone renders nothing", () => {
  const el = $(<Markdown>{"-"}</Markdown>);
  expect(el.find("li").length).toBe(0);
  expect(el.find("p").length).toBe(0);
});

it("bare '- ' after normal content does not produce a stray paragraph before the list", () => {
  const src = "- x\n- ";
  const el = $(<Markdown>{src}</Markdown>);
  // The single 'x' item must come first, not after a stray paragraph
  expect(el.find("ul").length).toBe(1);
  expect(el.find("p").length).toBe(0);
});

// ---------------------------------------------------------------------------
// Bare ordered list markers
// ---------------------------------------------------------------------------

it("bare '1. ' at end of ordered list skips the empty item", () => {
  const src = "1. first\n2. second\n3. ";
  const el = $(<Markdown>{src}</Markdown>);
  const items = el.find("li");
  expect(items.length).toBe(2);
  expect(items.array("textContent")).toEqual(["first", "second"]);
  expect(el.find("p").length).toBe(0);
});

it("bare '1. ' alone renders nothing", () => {
  const el = $(<Markdown>{"1. "}</Markdown>);
  expect(el.find("li").length).toBe(0);
  expect(el.find("p").length).toBe(0);
});

// ---------------------------------------------------------------------------
// Unclosed code blocks
// ---------------------------------------------------------------------------

it("unclosed ``` renders the accumulated code lines", () => {
  const src = "```js\nconst x = 1;";
  const el = $(<Markdown>{src}</Markdown>);
  expect(el.find("pre").length).toBe(1);
  expect(el.find("pre code").text()).toContain("const x = 1;");
});

it("unclosed ``` with multiple lines renders all accumulated code", () => {
  const src = "```python\ndef foo():\n    return 42";
  const el = $(<Markdown>{src}</Markdown>);
  expect(el.find("pre code").text()).toContain("def foo():");
  expect(el.find("pre code").text()).toContain("return 42");
});

// ---------------------------------------------------------------------------
// Unclosed math blocks
// ---------------------------------------------------------------------------

it("unclosed $$ block renders the accumulated math", () => {
  const src = "$$\n\\frac{a}{b}";
  const el = $(<Markdown>{src}</Markdown>);
  expect(el.find(".math-block").length).toBe(1);
});

// ---------------------------------------------------------------------------
// Partial inline markers (stay as literal text, don't break layout)
// ---------------------------------------------------------------------------

it("unclosed ** does not throw and renders literal text", () => {
  expect(() => $(<Markdown>{"**partial bold"}</Markdown>)).not.toThrow();
  expect($(<Markdown>{"**partial bold"}</Markdown>).text()).toContain(
    "partial bold",
  );
});

it("unclosed ` does not throw and renders literal text", () => {
  expect(() => $(<Markdown>{"`partial code"}</Markdown>)).not.toThrow();
});
