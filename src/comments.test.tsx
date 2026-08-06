import $ from "react-test";
import Markdown from "./index";

it("removes a comment on its own line", () => {
  const $el = $(<Markdown>{"<!-- note -->\n\nText."}</Markdown>);
  expect($el.find("p").length).toBe(1);
  expect($el.find("p").text()).toBe("Text.");
});

it("removes a comment spanning several lines", () => {
  const $el = $(<Markdown>{"<!--\nhidden\nnotes\n-->\n\nVisible."}</Markdown>);
  expect($el.text()).not.toContain("hidden");
  expect($el.find("p").text()).toBe("Visible.");
});

it("removes a comment in the middle of a paragraph", () => {
  expect(
    $(<Markdown>{"before <!-- hi --> after"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("before after");
});

it("removes comments with rawHtml enabled too", () => {
  expect(
    $(<Markdown rawHtml>{"<!-- note -->\n\nText."}</Markdown>).text(),
  ).not.toContain("note");
});

it("keeps a comment inside a code span", () => {
  expect(
    $(<Markdown>{"`<!-- kept -->`"}</Markdown>)
      .find("code")
      .text(),
  ).toBe("<!-- kept -->");
});

it("keeps a comment inside a fenced code block", () => {
  expect(
    $(<Markdown>{"```html\n<!-- kept -->\n```"}</Markdown>)
      .find("pre code")
      .text(),
  ).toBe("<!-- kept -->");
});
