import $ from "react-test";
import Markdown from "./index";

it("renders an ordered list", () => {
  const items = $(<Markdown>{"1. foo\n2. bar\n3. baz"}</Markdown>).find("li");
  expect(items.length).toBe(3);
  expect(items.array("textContent")).toEqual(["foo", "bar", "baz"]);
});

it("wraps ordered list items in an ol", () => {
  expect(
    $(<Markdown>{"1. a\n2. b"}</Markdown>)
      .find("ol")
      .find("li").length,
  ).toBe(2);
});

it("renders inline markup inside ordered list items", () => {
  expect(
    $(<Markdown>{"1. **bold item**"}</Markdown>)
      .find("li")
      .find("strong")
      .text(),
  ).toBe("bold item");
});

it("flushes unordered list and starts ordered list when order switches", () => {
  const el = $(<Markdown>{"- a\n- b\n1. c"}</Markdown>);
  expect(el.find("ul").length).toBe(1);
  expect(el.find("ol").length).toBe(1);
  expect(el.find("ul li").length).toBe(2);
  expect(el.find("ol li").length).toBe(1);
  expect(el.find("ol li").text()).toBe("c");
});

it("flushes ordered list and starts unordered list when order switches", () => {
  const el = $(<Markdown>{"1. a\n2. b\n- c"}</Markdown>);
  expect(el.find("ol").length).toBe(1);
  expect(el.find("ul").length).toBe(1);
  expect(el.find("ol li").length).toBe(2);
  expect(el.find("ul li").length).toBe(1);
  expect(el.find("ul li").text()).toBe("c");
});
