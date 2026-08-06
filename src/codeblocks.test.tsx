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
