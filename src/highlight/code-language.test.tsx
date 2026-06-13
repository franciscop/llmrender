import $ from "react-test";
import Markdown from "../index";

it("adds language class to fenced code block", () => {
  const code = $(<Markdown>{"```js\nconst x = 1;\n```"}</Markdown>).find(
    "code",
  );
  expect(code.attr("class")).toBe("language-js");
  expect(code.get(0)!.textContent).toBe("const x = 1;");
});

it("renders code block without class when no language given", () => {
  const code = $(<Markdown>{"```\nplain\n```"}</Markdown>).find("code");
  expect(code.attr("class")).toBeNull();
});
