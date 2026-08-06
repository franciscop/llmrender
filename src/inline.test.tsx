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

it("renders a link with parentheses in the URL", () => {
  const el = $(
    <Markdown>
      {"[Bracket](https://en.wikipedia.org/wiki/Bracket_(mathematics))"}
    </Markdown>,
  );
  const a = el.find("a");
  expect(a.attr("href")).toBe(
    "https://en.wikipedia.org/wiki/Bracket_(mathematics)",
  );
  expect(a.text()).toBe("Bracket");
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

it("does not truncate auto-link text under 60 chars", () => {
  const url = "https://example.com/path/to/page";
  const a = $(<Markdown>{url}</Markdown>).find("a");
  expect(a.text()).toBe(url);
  expect(a.attr("href")).toBe(url);
});

it("truncates auto-link text to 60 chars with ellipsis", () => {
  const url = "https://example.com/" + "a".repeat(50);
  const a = $(<Markdown>{url}</Markdown>).find("a");
  expect(a.text()).toBe(url.slice(0, 60) + "…");
  expect(a.attr("href")).toBe(url);
});

it("does not truncate markdown link text under 60 chars", () => {
  const a = $(<Markdown>[short label](https://example.com)</Markdown>).find(
    "a",
  );
  expect(a.text()).toBe("short label");
});

it("does not truncate long markdown link text", () => {
  const longText = "a".repeat(70);
  const a = $(<Markdown>{`[${longText}](https://example.com)`}</Markdown>).find(
    "a",
  );
  expect(a.text()).toBe(longText);
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

it("does not emphasise underscores inside a word", () => {
  expect($(<Markdown>{"snake_case_name"}</Markdown>).find("em").length).toBe(0);
  expect(
    $(<Markdown>{"snake_case_name"}</Markdown>)
      .find("p")
      .text(),
  ).toBe("snake_case_name");
});

it("still emphasises underscores at word boundaries", () => {
  expect(
    $(<Markdown>{"an _italic_ word"}</Markdown>)
      .find("em")
      .text(),
  ).toBe("italic");
});

it("allows asterisk emphasis inside a word", () => {
  expect(
    $(<Markdown>{"foo*bar*baz"}</Markdown>)
      .find("em")
      .text(),
  ).toBe("bar");
});

it("does not open emphasis before whitespace", () => {
  expect($(<Markdown>{"a * foo bar*"}</Markdown>).find("em").length).toBe(0);
});

it("does not pair mismatched bold delimiters", () => {
  expect($(<Markdown>{"**foo__"}</Markdown>).find("strong").length).toBe(0);
});

it("renders a hard line break with a trailing backslash", () => {
  expect(
    $(<Markdown>{"line one\\\nline two"}</Markdown>).find("br").length,
  ).toBe(1);
});

it("drops a hard line break at the end of a paragraph", () => {
  expect($(<Markdown>{"only line  "}</Markdown>).find("br").length).toBe(0);
});

it("does not leak the hard-break marker into a code span", () => {
  const $el = $(<Markdown>{"`code  \nspan`"}</Markdown>);
  expect($el.find("code").text()).toBe("code span");
  expect($el.find("br").length).toBe(0);
});

it("renders a code span delimited by three backticks", () => {
  expect(
    $(<Markdown>{"``` foo ```"}</Markdown>)
      .find("code")
      .text(),
  ).toBe("foo");
});

it("keeps a shorter backtick run inside a longer code span", () => {
  expect(
    $(<Markdown>{"`` a ` b ``"}</Markdown>)
      .find("code")
      .text(),
  ).toBe("a ` b");
});

it("keeps angle brackets out of an angle autolink", () => {
  const $el = $(<Markdown>{"<https://example.com>"}</Markdown>);
  expect($el.find("a").attr("href")).toBe("https://example.com");
  expect($el.find("p").text()).toBe("https://example.com");
});

it("neutralizes a non-http scheme in an angle autolink", () => {
  expect(
    $(<Markdown>{"<javascript:alert(1)>"}</Markdown>)
      .find("a")
      .attr("href"),
  ).toBe("#");
});
