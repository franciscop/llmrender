import $ from "react-test";
import Markdown from "./index";

it("renders escaped asterisk as literal character", () => {
  expect($(<Markdown>{"\\*not italic\\*"}</Markdown>).find("p")).toHaveHtml(
    "*not italic*",
  );
});

it("renders escaped underscore as literal character", () => {
  expect(
    $(<Markdown>{"text\\_literal\\_text"}</Markdown>).find("p"),
  ).toHaveHtml("text_literal_text");
});

it("renders escaped backslash as literal backslash", () => {
  expect(
    $(<Markdown>{"C:\\\\Users"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("C:\\Users");
});

it("renders escaped bracket preventing link", () => {
  expect(
    $(<Markdown>{"\\[not a link\\](url)"}</Markdown>).find("p"),
  ).toHaveHtml("[not a link](url)");
});

it("renders escaped backtick as literal character", () => {
  expect($(<Markdown>{"\\`not code\\`"}</Markdown>).find("p")).toHaveHtml(
    "`not code`",
  );
});

it("renders escaped tilde preventing strikethrough", () => {
  expect($(<Markdown>{"\\~~not struck\\~~"}</Markdown>).find("p")).toHaveHtml(
    "~~not struck~~",
  );
});

it("does not escape non-special characters", () => {
  expect(
    $(<Markdown>{"\\q"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("\\q");
});

it("escaped character does not affect surrounding markdown", () => {
  expect(
    $(<Markdown>{"**bold \\* still bold**"}</Markdown>).find("p"),
  ).toHaveHtml("<strong>bold * still bold</strong>");
});

it("renders escaped angle brackets as literal characters", () => {
  expect(
    $(<Markdown>{"\\<div\\>"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("<div>");
});

it("renders escaped hash as literal character, not heading", () => {
  const $el = $(<Markdown>{"\\# not a heading"}</Markdown>);
  expect($el.find("h1").length).toBe(0);
  expect($el.find("p").text()).toBe("# not a heading");
});

it("renders escaped asterisks as literal characters, not italic", () => {
  expect(
    $(<Markdown>{"\\*not italic\\*"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("*not italic*");
});

it("renders escaped brackets as literal characters, not link", () => {
  expect(
    $(<Markdown>{"\\[not a link\\]"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("[not a link]");
});

it("escapes any ASCII punctuation", () => {
  for (const ch of [
    '"',
    "'",
    "/",
    ":",
    ";",
    "=",
    "?",
    "@",
    "^",
    "$",
    "%",
    "&",
    ",",
  ]) {
    expect(
      $(<Markdown>{"\\" + ch}</Markdown>)
        .find("p")
        .text(),
    ).toBe(ch);
  }
});

it("keeps a trailing backslash at the end of a document", () => {
  expect(
    $(<Markdown>{"foo\\"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("foo\\");
});
