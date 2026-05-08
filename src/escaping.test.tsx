import $ from "react-test";
import Markdown from "./index";

it("renders escaped asterisk as literal character", () => {
  const $el = $(<Markdown>{"\\*not italic\\*"}</Markdown>);
  expect($el.find("em").length).toBe(0);
  expect($el.find("p").text()).toBe("*not italic*");
});

it("renders escaped underscore as literal character", () => {
  const $el = $(<Markdown>{"text\\_literal\\_text"}</Markdown>);
  expect($el.find("em").length).toBe(0);
  expect($el.find("p").text()).toBe("text_literal_text");
});

it("renders escaped backslash as literal backslash", () => {
  expect(
    $(<Markdown>{"C:\\\\Users"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("C:\\Users");
});

it("renders escaped bracket preventing link", () => {
  const $el = $(<Markdown>{"\\[not a link\\](url)"}</Markdown>);
  expect($el.find("a").length).toBe(0);
  expect($el.find("p").text()).toBe("[not a link](url)");
});

it("renders escaped backtick as literal character", () => {
  const $el = $(<Markdown>{"\\`not code\\`"}</Markdown>);
  expect($el.find("code").length).toBe(0);
  expect($el.find("p").text()).toBe("`not code`");
});

it("renders escaped tilde preventing strikethrough", () => {
  const $el = $(<Markdown>{"\\~~not struck\\~~"}</Markdown>);
  expect($el.find("del").length).toBe(0);
  expect($el.find("p").text()).toBe("~~not struck~~");
});

it("does not escape non-special characters", () => {
  expect(
    $(<Markdown>{"\\q"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("\\q");
});

it("escaped character does not affect surrounding markdown", () => {
  const $el = $(<Markdown>{"**bold \\* still bold**"}</Markdown>);
  expect($el.find("strong").length).toBe(1);
  expect($el.find("strong").text()).toBe("bold * still bold");
});
