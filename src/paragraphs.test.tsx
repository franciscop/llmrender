import $ from "react-test";
import Markdown from "./index";

it("renders a paragraph", () => {
  expect(
    $(<Markdown>Hello world</Markdown>)
      .find("p")
      .text(),
  ).toBe("Hello world");
});

it("joins consecutive lines into one paragraph", () => {
  expect(
    $(<Markdown>{"line one\nline two"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("line one line two");
});

it("splits paragraphs on blank lines", () => {
  const paras = $(<Markdown>{"first\n\nsecond"}</Markdown>).find("p");
  expect(paras.length).toBe(2);
  expect(paras.array("textContent")).toEqual(["first", "second"]);
});

it("separates paragraph from heading", () => {
  const $el = $(<Markdown>{"some text\n\n## Section"}</Markdown>);
  expect($el.find("p").text()).toBe("some text");
  expect($el.find("h2").text()).toBe("Section");
});

it("renders nothing for empty source", () => {
  expect($(<Markdown>{""}</Markdown>).text()).toBe("");
});

it("handles Windows line endings (CRLF)", () => {
  const src =
    "# Title\r\n\r\nfirst\r\n\r\n---\r\n\r\n| A | B |\r\n|---|---|\r\n| 1 | 2 |";
  const $el = $(<Markdown>{src}</Markdown>);
  expect($el.find("h1").text()).toBe("Title");
  expect($el.find("p").text()).toBe("first");
  expect($el.find("hr").length).toBe(1);
  expect($el.find("td").length).toBe(2);
});

it("ignores blank-only lines", () => {
  expect($(<Markdown>{"   "}</Markdown>).find("p").length).toBe(0);
});
