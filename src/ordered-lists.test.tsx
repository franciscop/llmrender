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
