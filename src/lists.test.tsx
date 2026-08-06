import $ from "react-test";
import Markdown from "./index";

it("renders an unordered list", () => {
  const items = $(<Markdown>{"- foo\n- bar\n- baz"}</Markdown>).find("li");
  expect(items.length).toBe(3);
  expect(items.array("textContent")).toEqual(["foo", "bar", "baz"]);
});

it("wraps list items in a ul", () => {
  expect(
    $(<Markdown>{"- a\n- b"}</Markdown>)
      .find("ul")
      .find("li").length,
  ).toBe(2);
});

it("renders inline markup inside list items", () => {
  expect(
    $(<Markdown>{"- **bold item**"}</Markdown>)
      .find("li")
      .find("strong")
      .text(),
  ).toBe("bold item");
});

it("renders lists with * marker", () => {
  const items = $(<Markdown>{"* foo\n* bar\n* baz"}</Markdown>).find("li");
  expect(items.length).toBe(3);
  expect(items.array("textContent")).toEqual(["foo", "bar", "baz"]);
});

it("renders lists with + marker", () => {
  const items = $(<Markdown>{"+ foo\n+ bar"}</Markdown>).find("li");
  expect(items.length).toBe(2);
  expect(items.array("textContent")).toEqual(["foo", "bar"]);
});

it("renders lists with * marker and extra spaces", () => {
  const items = $(<Markdown>{"*   foo\n*   bar"}</Markdown>).find("li");
  expect(items.length).toBe(2);
  expect(items.array("textContent")).toEqual(["foo", "bar"]);
});

it("renders nested list with * markers", () => {
  const src = "*   Overview\n    *   Philosophy\n    *   Inline HTML";
  const ul = $(<Markdown>{src}</Markdown>).find("ul");
  expect(ul.find("li").length).toBe(3);
  const nested = ul.find("ul").find("li");
  expect(nested.length).toBe(2);
  expect(nested.array("textContent")).toEqual(["Philosophy", "Inline HTML"]);
});

it("renders links inside * list items", () => {
  const src = "*   [Overview](#overview)\n*   [Philosophy](#philosophy)";
  const links = $(<Markdown>{src}</Markdown>).find("a");
  expect(links.length).toBe(2);
  expect(links.array("textContent")).toEqual(["Overview", "Philosophy"]);
  expect(
    links.array((a: Node) => (a as HTMLElement).getAttribute("href")),
  ).toEqual(["#overview", "#philosophy"]);
});

it.skip("renders unordered sublist inside ordered list", () => {
  const src = "1. ordered item\n  - nested unordered";
  const $el = $(<Markdown>{src}</Markdown>);
  expect($el.find("ol > li").length).toBe(1);
  expect($el.find("ul > li").length).toBe(1);
});

it("renders a * list with nested * items containing links", () => {
  const src = [
    "*   [Overview](#overview)",
    "    *   [Philosophy](#philosophy)",
    "    *   [Inline HTML](#html)",
    "*   [Block Elements](#block)",
    "    *   [Paragraphs](#p)",
  ].join("\n");
  const component = $(<Markdown>{src}</Markdown>);
  expect(component.find("p").length).toBe(0);
  const topItems = component.find("ul").find("li");
  expect(topItems.length).toBe(5);
  const topLinks = component.find("ul").find("a");
  expect(topLinks.array("textContent")).toEqual([
    "Overview",
    "Philosophy",
    "Inline HTML",
    "Block Elements",
    "Paragraphs",
  ]);
});

it("starts a new list when the bullet marker changes", () => {
  const $el = $(<Markdown>{"- foo\n- bar\n+ baz"}</Markdown>);
  expect($el.find("ul").length).toBe(2);
  expect($el.find("li").length).toBe(3);
});
