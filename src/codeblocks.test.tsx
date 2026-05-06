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
