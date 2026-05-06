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
