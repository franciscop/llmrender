import $ from "react-test";
import Markdown from "./index";

it("renders bold text", () => {
  expect(
    $(<Markdown>**bold**</Markdown>)
      .find("strong")
      .text(),
  ).toBe("bold");
});

it("renders italic text", () => {
  expect(
    $(<Markdown>*italic*</Markdown>)
      .find("em")
      .text(),
  ).toBe("italic");
});

it("renders inline code", () => {
  expect(
    $(<Markdown>`code`</Markdown>)
      .find("code")
      .text(),
  ).toBe("code");
});

it("renders a literal backtick using double-backtick fence", () => {
  expect(
    $(<Markdown>{"`` ` ``"}</Markdown>)
      .find("code")
      .text(),
  ).toBe("`");
});

it("renders double-backtick code span with content", () => {
  expect(
    $(<Markdown>{"`` foo ` bar ``"}</Markdown>)
      .find("code")
      .text(),
  ).toBe("foo ` bar");
});

it("renders a link", () => {
  const a = $(<Markdown>[label](https://example.com)</Markdown>).find("a");
  expect(a.text()).toBe("label");
  expect(a.attr("href")).toBe("https://example.com");
});

it("renders bold and italic in same paragraph", () => {
  const $el = $(<Markdown>**bold** and *italic*</Markdown>);
  expect($el.find("p")).toHaveHtml("<strong>bold</strong> and <em>italic</em>");
});

it("renders italic with underscores", () => {
  expect(
    $(<Markdown>{"_italic_"}</Markdown>)
      .find("em")
      .text(),
  ).toBe("italic");
});

it("renders bold with double underscores", () => {
  expect(
    $(<Markdown>{"__bold__"}</Markdown>)
      .find("strong")
      .text(),
  ).toBe("bold");
});

it("renders bold and italic with underscores in same paragraph", () => {
  const $el = $(<Markdown>{"__bold__ and _italic_"}</Markdown>);
  expect($el.find("p")).toHaveHtml("<strong>bold</strong> and <em>italic</em>");
});

it("renders angle-bracket auto-link", () => {
  const a = $(<Markdown>{"<https://example.com>"}</Markdown>).find("a");
  expect(a.attr("href")).toBe("https://example.com");
});

it("renders bare auto-link", () => {
  const a = $(<Markdown>{"visit https://example.com now"}</Markdown>).find("a");
  expect(a.text()).toBe("https://example.com");
  expect(a.attr("href")).toBe("https://example.com");
});

it("does not turn explicit link URL into a second link", () => {
  const $el = $(<Markdown>{"[label](https://example.com)"}</Markdown>);
  expect($el.find("a").length).toBe(1);
  expect($el.find("a").text()).toBe("label");
});

it("renders a link with title", () => {
  const a = $(
    <Markdown>{'[label](https://example.com "My Title")'}</Markdown>,
  ).find("a");
  expect(a.text()).toBe("label");
  expect(a.attr("href")).toBe("https://example.com");
  expect(a.attr("title")).toBe("My Title");
});

it("renders a link without title and has no title attribute", () => {
  const a = $(<Markdown>[label](https://example.com)</Markdown>).find("a");
  expect(a.attr("title")).toBeFalsy();
});

it("renders a fragment link with title", () => {
  const a = $(
    <Markdown>{'[Overview](#overview "Go to overview")'}</Markdown>,
  ).find("a");
  expect(a.attr("href")).toBe("#overview");
  expect(a.attr("title")).toBe("Go to overview");
});

it("renders bold italic with ***text***", () => {
  const $el = $(<Markdown>{"***bold italic***"}</Markdown>);
  expect($el.find("p")).toHaveHtml("<strong><em>bold italic</em></strong>");
});

it("renders italic inside bold text", () => {
  const $el = $(<Markdown>{"**text with *italic* inside**"}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    "<strong>text with <em>italic</em> inside</strong>",
  );
});

it("renders link inside bold", () => {
  const $el = $(<Markdown>{"**[link](https://example.com)**"}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<strong><a href="https://example.com">link</a></strong>',
  );
});

it("renders bold inside link text", () => {
  const $el = $(<Markdown>{"[**bold**](https://example.com)"}</Markdown>);
  expect($el.find("p")).toHaveHtml(
    '<a href="https://example.com"><strong>bold</strong></a>',
  );
});

it("renders a hard line break with two trailing spaces", () => {
  const $el = $(<Markdown>{"line one  \nline two"}</Markdown>);
  expect($el.find("p")).toHaveHtml("line one<br> line two");
});
