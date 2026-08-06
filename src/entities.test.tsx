import $ from "react-test";
import Markdown from "./index";

const text = (md: string) =>
  $(<Markdown>{md}</Markdown>)
    .find("p")
    .text();

it("decodes a named entity", () => {
  expect(text("AT&amp;T")).toBe("AT&T");
});

it("decodes typographic entities", () => {
  // textContent, not text(): \u00a0 matches \s so text() would collapse it.
  const node = $(<Markdown>{"&copy; 2024 &mdash; 50&nbsp;units"}</Markdown>)
    .find("p")
    .get(0)!;
  expect(node.textContent).toBe("\u00a9 2024 \u2014 50\u00a0units");
});

it("decodes a decimal numeric reference", () => {
  expect(text("&#35; not a heading")).toBe("# not a heading");
});

it("decodes a hexadecimal numeric reference", () => {
  expect(text("&#x22;quoted&#x22;")).toBe('"quoted"');
});

it("leaves an unknown entity alone", () => {
  expect(text("&notarealentity;")).toBe("&notarealentity;");
});

it("leaves a bare ampersand alone", () => {
  expect(text("Tom & Jerry")).toBe("Tom & Jerry");
});

it("does not decode entities inside a code span", () => {
  expect(
    $(<Markdown>{"`&amp;`"}</Markdown>)
      .find("code")
      .text(),
  ).toBe("&amp;");
});

it("does not decode entities inside a fenced code block", () => {
  expect(
    $(<Markdown>{"```\n&amp;\n```"}</Markdown>)
      .find("pre code")
      .text(),
  ).toBe("&amp;");
});

it("decodes entities inside emphasis", () => {
  expect(
    $(<Markdown>{"*a &amp; b*"}</Markdown>)
      .find("em")
      .text(),
  ).toBe("a & b");
});

it("does not let a decoded entity become a tag", () => {
  const $el = $(<Markdown>{"&lt;script&gt;alert(1)&lt;/script&gt;"}</Markdown>);
  expect($el.find("script").length).toBe(0);
  expect($el.find("p").text()).toBe("<script>alert(1)</script>");
});

it("leaves a cut entity as literal text", () => {
  expect(text("5 &micro;m")).toBe("5 &micro;m");
});
