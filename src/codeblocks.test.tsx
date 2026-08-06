import $ from "react-test";
import Markdown from "./index";

it("renders a fenced code block", () => {
  expect(
    $(<Markdown>{"```\nconst x = 1;\n```"}</Markdown>)
      .find("pre")
      .find("code")
      .text(),
  ).toBe("const x = 1;");
});

it("preserves newlines inside code blocks", () => {
  const node = $(<Markdown>{"```\nline1\nline2\n```"}</Markdown>)
    .find("code")
    .get(0)!;
  expect(node.textContent).toBe("line1\nline2");
});

it("renders code block without highlight spans when highlight={false}", () => {
  const el = $(
    <Markdown highlight={false}>{"```js\nconst x = 1;\n```"}</Markdown>,
  );
  expect(el.find("pre code").text()).toBe("const x = 1;");
  expect(el.find(".keyword").length).toBe(0);
});

it("keeps indented code before a following paragraph", () => {
  expect($(<Markdown>{"    indented code\ntext after"}</Markdown>)).toHaveHtml(
    "<pre><code>indented code</code></pre><p>text after</p>",
  );
});

it("keeps indented code before a following table", () => {
  expect(
    $(<Markdown>{"    indented code\n| a |\n|---|\n| b |"}</Markdown>)
      .find("pre")
      .get(0)!.nextSibling!.nodeName,
  ).toBe("TABLE");
});

it("renders a tilde fenced code block", () => {
  expect(
    $(<Markdown>{"~~~\nconst x = 1;\n~~~"}</Markdown>)
      .find("pre code")
      .text(),
  ).toBe("const x = 1;");
});

it("does not treat a tilde fence as strikethrough", () => {
  expect($(<Markdown>{"~~~\na\n~~~"}</Markdown>).find("del").length).toBe(0);
});

it("keeps a shorter fence run inside a longer fenced block", () => {
  const node = $(<Markdown>{"````\naaa\n```\n````"}</Markdown>)
    .find("code")
    .get(0)!;
  expect(node.textContent).toBe("aaa\n```");
});

it("uses only the first word of the info string as the language", () => {
  expect(
    $(<Markdown highlight={false}>{"```js extra stuff\nx\n```"}</Markdown>)
      .find("code")
      .attr("class"),
  ).toBe("language-js");
});

it("recognises a fence indented up to three spaces", () => {
  expect(
    $(<Markdown>{"   ```\naaa\n   ```"}</Markdown>)
      .find("pre code")
      .text(),
  ).toBe("aaa");
});

it("does not close a fence with a line that has an info string", () => {
  const node = $(<Markdown>{"```\n``` aaa\n```"}</Markdown>)
    .find("code")
    .get(0)!;
  expect(node.textContent).toBe("``` aaa");
});
